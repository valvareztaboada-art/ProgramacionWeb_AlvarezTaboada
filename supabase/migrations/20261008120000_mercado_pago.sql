-- =====================================================================
-- MICAN · Mercado Pago (Checkout Pro + webhooks)
--
-- Flujo:
--   1. El cliente toca "Pagar" → el servidor crea una Preferencia en Mercado Pago
--      con external_reference = id del pago (tabla pagos) y guarda el preference_id.
--   2. El cliente paga en Mercado Pago (fuera de nuestro sitio).
--   3. Mercado Pago avisa por WEBHOOK → el servidor valida la firma, consulta el
--      pago real en la API de Mercado Pago y llama a registrar_pago_mp().
--
-- El estado del pago SOLO lo cambia el webhook (o la veterinaria a mano, ej: pago
-- en efectivo). Las back_urls del navegador nunca modifican la base de datos.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Más estados posibles para un pago
-- ---------------------------------------------------------------------
--   pendiente   → hay que pagarlo (también vuelve acá si Mercado Pago lo rechaza)
--   en_proceso  → Mercado Pago lo está procesando (ej: pago en efectivo, revisión)
--   pagado      → acreditado
--   reembolsado → se devolvió el dinero
alter table public.pagos drop constraint pagos_estado_check;
alter table public.pagos add constraint pagos_estado_check
  check (estado in ('pendiente', 'en_proceso', 'pagado', 'reembolsado'));

alter table public.pagos
  add column mp_preference_id text,
  add column mp_payment_id text,
  add column mp_estado text,
  add column pagado_en timestamptz,
  add column actualizado_en timestamptz not null default now();

create unique index pagos_mp_payment_id_unico on public.pagos (mp_payment_id) where mp_payment_id is not null;


-- ---------------------------------------------------------------------
-- 2. Registro de cada notificación procesada (auditoría)
--    Sirve para ver qué avisó Mercado Pago y cuándo (y para la demo).
-- ---------------------------------------------------------------------
create table public.pagos_eventos (
  id bigint generated always as identity primary key,
  pago_id bigint references public.pagos (id) on delete set null,
  mp_payment_id text not null,
  mp_estado text not null,
  monto numeric(12, 2),
  resultado text not null,          -- qué hicimos con la notificación
  recibido_en timestamptz not null default now()
);

create index pagos_eventos_pago_id_idx on public.pagos_eventos (pago_id);

alter table public.pagos_eventos enable row level security;

create policy "Solo la veterinaria ve los eventos de pago"
  on public.pagos_eventos for select to authenticated
  using ((select public.es_veterinaria()));

-- Nadie escribe directo: solo la función registrar_pago_mp (desde el servidor)
revoke insert, update, delete on public.pagos_eventos from anon, authenticated;


-- ---------------------------------------------------------------------
-- 3. registrar_pago_mp: aplica el resultado de Mercado Pago a un pago
--    · Es ATÓMICA: bloquea la fila mientras la actualiza (for update).
--    · Es IDEMPOTENTE: si Mercado Pago repite la notificación, no rompe nada.
--    · Controla que el MONTO pagado coincida con el que cobramos.
--    · No "despaga" un pago: un aviso viejo de "pending" que llega tarde
--      no puede pisar un "approved" (solo un reembolso cambia un pago acreditado).
--    · Solo la puede ejecutar el servidor (rol service_role), nunca el navegador.
-- ---------------------------------------------------------------------
create function public.registrar_pago_mp(
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

  if not found then
    v_resultado := 'ignorado: el pago no existe';
  elsif p_monto is distinct from v_pago.monto then
    -- Alguien pagó otro monto (ej: preferencia manipulada): no lo damos por pagado
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
      v_resultado := 'sin cambios: el pago ya estaba acreditado';
    elsif v_pago.estado = 'reembolsado' then
      v_resultado := 'sin cambios: el pago ya estaba reembolsado';
    else
      update public.pagos set
        estado = v_nuevo_estado,
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
-- 4. Guardar el preference_id al crear la preferencia (lo llama el servidor
--    con la sesión del cliente). Solo para pagos propios y pendientes.
-- ---------------------------------------------------------------------
create function public.guardar_preferencia_mp(p_pago_id bigint, p_preference_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.pagos
  set mp_preference_id = p_preference_id, actualizado_en = now()
  where id = p_pago_id
    and estado = 'pendiente'
    and (public.es_veterinaria() or public.es_duenio(mascota_id));

  if not found then
    raise exception 'No se puede pagar este cobro.';
  end if;
end;
$$;

revoke execute on function public.guardar_preferencia_mp(bigint, text) from public, anon;
grant execute on function public.guardar_preferencia_mp(bigint, text) to authenticated;
