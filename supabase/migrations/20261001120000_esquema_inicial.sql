-- =====================================================================
-- MICAN · Esquema inicial
-- Tablas, relaciones, seguridad a nivel de fila (RLS) y reglas de negocio.
--
-- Roles:
--   cliente      → dueño/a de mascotas. Ve SOLO lo de sus mascotas.
--                  Puede pedir turnos y cancelarlos con más de 24 h.
--   veterinaria  → ve y modifica todo.
--
-- Las reglas importantes viven ACÁ (en la base de datos) y no solo en la
-- pantalla: aunque alguien llame a la API a mano, Postgres no lo deja.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. PERFILES (un perfil por cada usuario de Supabase Auth)
-- ---------------------------------------------------------------------
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  email text not null unique,
  telefono text,
  rol text not null default 'cliente' check (rol in ('cliente', 'veterinaria')),
  creado_en timestamptz not null default now()
);

comment on column public.perfiles.rol is
  'Nunca lo elige el usuario: todos se registran como cliente. La veterinaria se asigna a mano.';

-- Cuando alguien se registra, se crea su perfil automáticamente.
-- El rol NO se toma de los datos que manda el usuario (siempre es "cliente").
create function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre, email, telefono)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', ''),
    lower(new.email),
    new.raw_user_meta_data ->> 'telefono'
  );
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();


-- ---------------------------------------------------------------------
-- 2. MASCOTAS (pacientes). Se vinculan al dueño/a por EMAIL:
--    la veterinaria puede cargar una mascota antes de que el dueño/a
--    tenga cuenta; cuando se registra con ese email, la ve.
-- ---------------------------------------------------------------------
create table public.mascotas (
  id bigint generated always as identity primary key,
  nombre text not null check (length(trim(nombre)) > 0),
  especie text not null check (especie in ('Perro', 'Gato', 'Ave', 'Otro')),
  raza text,
  edad integer check (edad between 0 and 40),
  email_duenio text not null check (email_duenio = lower(trim(email_duenio))),
  creado_en timestamptz not null default now()
);

create index mascotas_email_duenio_idx on public.mascotas (email_duenio);


-- ---------------------------------------------------------------------
-- 3. ESPECIALIDADES (tipos de turno)
-- ---------------------------------------------------------------------
create table public.especialidades (
  id text primary key,
  nombre text not null,
  icono text not null,
  descripcion text not null,
  orden integer not null default 0
);

insert into public.especialidades (id, nombre, icono, descripcion, orden) values
  ('consulta',   'Consulta',   'estetoscopio', 'Control general o algo que te preocupa', 1),
  ('vacunacion', 'Vacunación', 'jeringa',      'Vacunas del calendario',                 2),
  ('estudios',   'Estudios',   'tubo',         'Análisis, radiografías, ecografías',     3),
  ('peluqueria', 'Peluquería', 'tijera',       'Baño y corte',                           4);


-- ---------------------------------------------------------------------
-- 4. TURNOS
-- ---------------------------------------------------------------------
create table public.turnos (
  id bigint generated always as identity primary key,
  mascota_id bigint not null references public.mascotas (id) on delete cascade,
  especialidad_id text not null references public.especialidades (id),
  fecha date not null,
  hora time not null check (extract(second from hora) = 0 and extract(minute from hora) in (0, 30)),
  motivo text,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'confirmado', 'atendido', 'ausente', 'cancelado')),
  creado_por uuid default auth.uid() references auth.users (id) on delete set null,
  creado_en timestamptz not null default now()
);

create index turnos_mascota_id_idx on public.turnos (mascota_id);
create index turnos_fecha_idx on public.turnos (fecha);

-- No puede haber dos turnos activos en el mismo día y horario
create unique index turnos_horario_unico
  on public.turnos (fecha, hora)
  where estado in ('pendiente', 'confirmado');


-- ---------------------------------------------------------------------
-- 5. VACUNAS, ESTUDIOS y PAGOS (todos pertenecen a una mascota)
-- ---------------------------------------------------------------------
create table public.vacunas (
  id bigint generated always as identity primary key,
  mascota_id bigint not null references public.mascotas (id) on delete cascade,
  vacuna text not null,
  fecha date not null,
  aplicada boolean not null default false
);

create index vacunas_mascota_id_idx on public.vacunas (mascota_id);

create table public.estudios (
  id bigint generated always as identity primary key,
  mascota_id bigint not null references public.mascotas (id) on delete cascade,
  tipo text not null,
  fecha date not null,
  archivo_url text
);

create index estudios_mascota_id_idx on public.estudios (mascota_id);

create table public.pagos (
  id bigint generated always as identity primary key,
  mascota_id bigint not null references public.mascotas (id) on delete cascade,
  concepto text not null,
  monto numeric(12, 2) not null check (monto > 0),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'pagado')),
  creado_en timestamptz not null default now()
);

create index pagos_mascota_id_idx on public.pagos (mascota_id);


-- ---------------------------------------------------------------------
-- 6. FUNCIONES AUXILIARES para las políticas
--    "security definer" = se ejecutan con permisos del dueño de la función,
--    así pueden leer perfiles/auth.users sin chocar con el propio RLS.
-- ---------------------------------------------------------------------

-- ¿El usuario logueado es la veterinaria?
create function public.es_veterinaria()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid()) and rol = 'veterinaria'
  );
$$;

-- Email del usuario logueado, SOLO si lo confirmó.
-- Así nadie puede registrarse con el email de otra persona y ver sus mascotas.
create function public.email_verificado()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select lower(email) from auth.users
  where id = (select auth.uid()) and email_confirmed_at is not null;
$$;

-- ¿La mascota es del usuario logueado?
create function public.es_duenio(p_mascota_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.mascotas
    where id = p_mascota_id and email_duenio = public.email_verificado()
  );
$$;

-- Fecha y hora del turno en horario de Argentina
create function public.inicio_turno(p_fecha date, p_hora time)
returns timestamptz
language sql
immutable
set search_path = ''
as $$
  select (p_fecha + p_hora) at time zone 'America/Argentina/Buenos_Aires';
$$;

-- Horario de atención: lunes a viernes 9 a 18 h, sábados 9 a 13 h (turnos de 30 min).
-- Es la misma regla que src/lib/horarios.js.
create function public.horario_de_atencion(p_fecha date, p_hora time)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case extract(isodow from p_fecha)
    when 7 then false                                        -- domingo
    when 6 then p_hora between time '09:00' and time '12:30' -- sábado
    else        p_hora between time '09:00' and time '17:30' -- lunes a viernes
  end;
$$;


-- ---------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS)
--    Con RLS activado, una tabla no devuelve NADA salvo lo que permitan
--    las políticas. Sin políticas de escritura = nadie puede escribir.
-- ---------------------------------------------------------------------
alter table public.perfiles       enable row level security;
alter table public.mascotas       enable row level security;
alter table public.especialidades enable row level security;
alter table public.turnos         enable row level security;
alter table public.vacunas        enable row level security;
alter table public.estudios       enable row level security;
alter table public.pagos          enable row level security;

-- PERFILES ------------------------------------------------------------
create policy "Cada uno ve su perfil y la veterinaria ve todos"
  on public.perfiles for select to authenticated
  using (id = (select auth.uid()) or (select public.es_veterinaria()));

create policy "Cada uno edita su propio perfil"
  on public.perfiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Solo se pueden editar nombre y teléfono: el rol y el email quedan bloqueados
revoke update on public.perfiles from anon, authenticated;
grant update (nombre, telefono) on public.perfiles to authenticated;

-- MASCOTAS ------------------------------------------------------------
create policy "El dueño/a ve sus mascotas y la veterinaria ve todas"
  on public.mascotas for select to authenticated
  using ((select public.es_veterinaria()) or email_duenio = (select public.email_verificado()));

create policy "Solo la veterinaria carga mascotas"
  on public.mascotas for insert to authenticated
  with check ((select public.es_veterinaria()));

create policy "Solo la veterinaria modifica mascotas"
  on public.mascotas for update to authenticated
  using ((select public.es_veterinaria()))
  with check ((select public.es_veterinaria()));

create policy "Solo la veterinaria borra mascotas"
  on public.mascotas for delete to authenticated
  using ((select public.es_veterinaria()));

-- ESPECIALIDADES (información pública) ---------------------------------
create policy "Todos pueden ver las especialidades"
  on public.especialidades for select to anon, authenticated
  using (true);

-- TURNOS --------------------------------------------------------------
create policy "El dueño/a ve los turnos de sus mascotas y la veterinaria todos"
  on public.turnos for select to authenticated
  using ((select public.es_veterinaria()) or public.es_duenio(mascota_id));

-- El cliente solo puede pedir turnos: para SU mascota, en estado pendiente,
-- a futuro y dentro del horario de atención.
create policy "El dueño/a pide turnos para sus mascotas"
  on public.turnos for insert to authenticated
  with check (
    public.es_duenio(mascota_id)
    and estado = 'pendiente'
    and creado_por = (select auth.uid())
    and public.inicio_turno(fecha, hora) > now()
    and public.horario_de_atencion(fecha, hora)
  );

create policy "La veterinaria carga turnos"
  on public.turnos for insert to authenticated
  with check ((select public.es_veterinaria()));

-- Solo la veterinaria modifica turnos (confirmar, atendido, ausente, cancelar).
-- El cliente cancela con la función cancelar_turno(), que controla las 24 h.
create policy "Solo la veterinaria modifica turnos"
  on public.turnos for update to authenticated
  using ((select public.es_veterinaria()))
  with check ((select public.es_veterinaria()));

-- VACUNAS, ESTUDIOS y PAGOS: el dueño/a solo lee, la veterinaria hace todo
create policy "El dueño/a ve las vacunas de sus mascotas y la veterinaria todas"
  on public.vacunas for select to authenticated
  using ((select public.es_veterinaria()) or public.es_duenio(mascota_id));
create policy "Solo la veterinaria carga vacunas"
  on public.vacunas for insert to authenticated with check ((select public.es_veterinaria()));
create policy "Solo la veterinaria modifica vacunas"
  on public.vacunas for update to authenticated
  using ((select public.es_veterinaria())) with check ((select public.es_veterinaria()));
create policy "Solo la veterinaria borra vacunas"
  on public.vacunas for delete to authenticated using ((select public.es_veterinaria()));

create policy "El dueño/a ve los estudios de sus mascotas y la veterinaria todos"
  on public.estudios for select to authenticated
  using ((select public.es_veterinaria()) or public.es_duenio(mascota_id));
create policy "Solo la veterinaria carga estudios"
  on public.estudios for insert to authenticated with check ((select public.es_veterinaria()));
create policy "Solo la veterinaria modifica estudios"
  on public.estudios for update to authenticated
  using ((select public.es_veterinaria())) with check ((select public.es_veterinaria()));
create policy "Solo la veterinaria borra estudios"
  on public.estudios for delete to authenticated using ((select public.es_veterinaria()));

-- Los pagos del cliente se van a registrar con Mercado Pago (desde el servidor)
create policy "El dueño/a ve los pagos de sus mascotas y la veterinaria todos"
  on public.pagos for select to authenticated
  using ((select public.es_veterinaria()) or public.es_duenio(mascota_id));
create policy "Solo la veterinaria carga pagos"
  on public.pagos for insert to authenticated with check ((select public.es_veterinaria()));
create policy "Solo la veterinaria modifica pagos"
  on public.pagos for update to authenticated
  using ((select public.es_veterinaria())) with check ((select public.es_veterinaria()));


-- ---------------------------------------------------------------------
-- 8. FUNCIONES QUE SE LLAMAN DESDE LA APP (supabase.rpc)
-- ---------------------------------------------------------------------

-- Horarios ocupados: devuelve SOLO fecha y hora (sin datos de otras personas),
-- para marcar en el formulario de turnos qué horarios no se pueden elegir.
create function public.horarios_ocupados(p_desde date default current_date)
returns table (fecha date, hora time)
language sql
stable
security definer
set search_path = ''
as $$
  select t.fecha, t.hora
  from public.turnos t
  where t.fecha >= p_desde
    and t.estado in ('pendiente', 'confirmado');
$$;

-- Cancelar turno:
--   · la veterinaria puede cancelar cualquier turno activo
--   · el dueño/a solo los de sus mascotas y con MÁS de 24 h de anticipación
create function public.cancelar_turno(p_turno_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_turno public.turnos%rowtype;
begin
  select * into v_turno from public.turnos where id = p_turno_id;

  if not found then
    raise exception 'El turno no existe.';
  end if;

  if not public.es_veterinaria() then
    if not public.es_duenio(v_turno.mascota_id) then
      raise exception 'No tenés permiso para cancelar este turno.';
    end if;
    if public.inicio_turno(v_turno.fecha, v_turno.hora) - now() <= interval '24 hours' then
      raise exception 'Los turnos se pueden cancelar hasta 24 horas antes. Comunicate con la veterinaria.';
    end if;
  end if;

  if v_turno.estado not in ('pendiente', 'confirmado') then
    raise exception 'Este turno ya no se puede cancelar.';
  end if;

  update public.turnos set estado = 'cancelado' where id = p_turno_id;
end;
$$;

-- Por defecto cualquiera puede ejecutar funciones: las limitamos a usuarios logueados
revoke execute on function public.horarios_ocupados(date) from public, anon;
revoke execute on function public.cancelar_turno(bigint) from public, anon;
grant execute on function public.horarios_ocupados(date) to authenticated;
grant execute on function public.cancelar_turno(bigint) to authenticated;
