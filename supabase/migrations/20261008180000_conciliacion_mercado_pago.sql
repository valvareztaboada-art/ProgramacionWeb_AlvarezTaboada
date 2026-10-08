-- =====================================================================
-- MICAN · Conciliación activa con Mercado Pago
--
-- Además del webhook, ahora el servidor también le PREGUNTA a Mercado Pago
-- por los pagos de un cobro (buscando por external_reference). Como el mismo
-- pago puede llegar por los dos caminos (o el webhook repetirse), la función
-- ahora reconoce una notificación ya procesada y no hace nada.
-- =====================================================================

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

  -- ¿Ya procesamos este mismo pago de Mercado Pago con este mismo estado? → nada que hacer
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
      -- Ej: el cliente pagó dos veces el mismo cobro. Queda registrado para que la veterinaria lo devuelva.
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

-- "create or replace" mantiene los permisos, pero lo repetimos por claridad
revoke execute on function public.registrar_pago_mp(bigint, text, text, numeric) from public, anon, authenticated;
grant execute on function public.registrar_pago_mp(bigint, text, text, numeric) to service_role;
