-- =====================================================================
-- MICAN · Pagos en efectivo + estudios con archivos
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. MEDIO DE PAGO y "cobrado en efectivo"
-- ---------------------------------------------------------------------
alter table public.pagos
  add column metodo text check (metodo in ('mercado_pago', 'efectivo'));

-- Los pagos que ya se acreditaron por Mercado Pago
update public.pagos set metodo = 'mercado_pago' where estado = 'pagado' and mp_payment_id is not null;

-- La veterinaria marca un cobro como pagado en efectivo.
-- Solo ella, y solo si el cobro está pendiente (si está "en proceso" en Mercado Pago,
-- podría acreditarse por ahí y quedaría cobrado dos veces).
create function public.registrar_pago_efectivo(p_pago_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.es_veterinaria() then
    raise exception 'Solo la veterinaria puede registrar pagos en efectivo.';
  end if;

  update public.pagos set
    estado = 'pagado',
    metodo = 'efectivo',
    pagado_en = now(),
    actualizado_en = now()
  where id = p_pago_id and estado = 'pendiente';

  if not found then
    raise exception 'Este cobro ya no está pendiente.';
  end if;
end;
$$;

revoke execute on function public.registrar_pago_efectivo(bigint) from public, anon;
grant execute on function public.registrar_pago_efectivo(bigint) to authenticated;

-- registrar_pago_mp ahora también guarda el medio de pago
create or replace function public.registrar_pago_mp(
  p_pago_id bigint,
  p_mp_payment_id text,
  p_mp_estado text,
  p_monto numeric
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pago public.pagos%rowtype;
  v_nuevo_estado text;
  v_resultado text;
begin
  select * into v_pago from public.pagos where id = p_pago_id for update;

  if exists (
    select 1 from public.pagos_eventos
    where mp_payment_id = p_mp_payment_id and mp_estado = p_mp_estado
  ) then
    return 'sin cambios: notificación ya procesada';
  end if;

  if not found then
    v_resultado := 'ignorado: el pago no existe';
  elsif p_monto is distinct from v_pago.monto then
    v_resultado := format('rechazado: monto %s distinto del cobrado %s', p_monto, v_pago.monto);
  else
    v_nuevo_estado := case
      when p_mp_estado = 'approved' then 'pagado'
      when p_mp_estado in ('pending', 'in_process', 'authorized', 'in_mediation') then 'en_proceso'
      when p_mp_estado in ('rejected', 'cancelled') then 'pendiente'
      when p_mp_estado in ('refunded', 'charged_back') then 'reembolsado'
      else null
    end;

    if v_nuevo_estado is null then
      v_resultado := format('ignorado: estado desconocido %s', p_mp_estado);
    elsif v_pago.estado = 'pagado' and v_nuevo_estado <> 'reembolsado' then
      v_resultado := case
        when p_mp_estado = 'approved' and p_mp_payment_id <> coalesce(v_pago.mp_payment_id, '')
          then 'sin cambios: PAGO DUPLICADO (el cobro ya estaba pagado, hay que devolverlo)'
        else 'sin cambios: el pago ya estaba acreditado'
      end;
    elsif v_pago.estado = 'reembolsado' then
      v_resultado := 'sin cambios: el pago ya estaba reembolsado';
    else
      update public.pagos set
        estado = v_nuevo_estado,
        metodo = case when v_nuevo_estado = 'pagado' then 'mercado_pago' else metodo end,
        mp_payment_id = p_mp_payment_id,
        mp_estado = p_mp_estado,
        pagado_en = case when v_nuevo_estado = 'pagado' then now() else pagado_en end,
        actualizado_en = now()
      where id = p_pago_id;
      v_resultado := format('actualizado: %s → %s', v_pago.estado, v_nuevo_estado);
    end if;
  end if;

  insert into public.pagos_eventos (pago_id, mp_payment_id, mp_estado, monto, resultado)
  values (case when v_pago.id is null then null else p_pago_id end, p_mp_payment_id, p_mp_estado, p_monto, v_resultado);

  return v_resultado;
end;
$$;

revoke execute on function public.registrar_pago_mp(bigint, text, text, numeric) from public, anon, authenticated;
grant execute on function public.registrar_pago_mp(bigint, text, text, numeric) to service_role;


-- ---------------------------------------------------------------------
-- 2. ESTUDIOS: título, comentarios y archivo
-- ---------------------------------------------------------------------
alter table public.estudios rename column tipo to titulo;
alter table public.estudios drop column archivo_url;
alter table public.estudios
  add constraint estudios_titulo_check check (length(trim(titulo)) between 3 and 100),
  add column comentarios text check (length(comentarios) <= 2000),
  add column archivo_path text,          -- dónde está en Storage: "<mascota_id>/<uuid>.<ext>"
  add column archivo_nombre text,        -- nombre original, para mostrarlo
  add column archivo_tipo text,
  add column archivo_tamanio integer,
  add column creado_en timestamptz not null default now(),
  add column actualizado_en timestamptz not null default now();


-- ---------------------------------------------------------------------
-- 3. STORAGE: carpeta PRIVADA para los archivos de los estudios
--    · Privada: no se puede abrir con un link público. Para verlos se pide
--      un "enlace firmado" que vence (lo genera el servidor con la sesión del usuario).
--    · Supabase controla el tamaño y el tipo de archivo, aunque alguien saltee la pantalla.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'estudios',
  'estudios',
  false,
  10485760, -- 10 MB
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
);

-- "12/abc.pdf" → 12 (el id de la mascota es la primera carpeta)
create function public.mascota_de_archivo(p_nombre text)
returns bigint
language sql
immutable
set search_path = ''
as $$
  select case when split_part(p_nombre, '/', 1) ~ '^\d+$' then split_part(p_nombre, '/', 1)::bigint end;
$$;

create policy "Ven archivos de estudios: la veterinaria y el dueño/a de la mascota"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'estudios'
    and ((select public.es_veterinaria()) or public.es_duenio(public.mascota_de_archivo(name)))
  );

create policy "Solo la veterinaria sube archivos de estudios"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'estudios' and (select public.es_veterinaria()));

create policy "Solo la veterinaria modifica archivos de estudios"
  on storage.objects for update to authenticated
  using (bucket_id = 'estudios' and (select public.es_veterinaria()))
  with check (bucket_id = 'estudios' and (select public.es_veterinaria()));

create policy "Solo la veterinaria borra archivos de estudios"
  on storage.objects for delete to authenticated
  using (bucket_id = 'estudios' and (select public.es_veterinaria()));
