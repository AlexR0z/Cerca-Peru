-- =====================================================================================
-- Perú Vive · Esquema de base de datos (Supabase / PostgreSQL)
-- Etapa 1: cuentas, reportes, solicitudes, ofertas, comunidad, notificaciones y roles.
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pegar TODO este archivo → Run.
-- Se puede volver a ejecutar sin romper nada (usa "if not exists" / "create or replace").
--
-- Reglas de privacidad que impone este archivo (en el servidor, no en el celular):
--  * Nadie puede nombrarse coordinador desde la app. Eso solo se hace desde el panel de Supabase.
--  * Las direcciones escritas, los teléfonos de contacto y el autor de cada reporte NO se
--    muestran a otras personas; solo a su dueño y a coordinación.
--  * Un reporte nuevo siempre nace "Pendiente"; solo coordinación puede cambiar su estado.
--  * Límite de envíos por hora para evitar spam.
-- =====================================================================================

-- ---------- 0. Contadores para códigos legibles (REP-0001, SOL-0001) ----------
create sequence if not exists public.seq_reportes;
create sequence if not exists public.seq_solicitudes;

-- ---------- 1. Tablas ----------
create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null default '' check (char_length(nombre) <= 60),
  apellido text not null default '' check (char_length(apellido) <= 60),
  nombre_visible text not null default 'Vecino' check (char_length(nombre_visible) between 2 and 30),
  celular text,
  fecha_nacimiento date,
  departamento text,
  provincia text,
  distrito text,
  rol text not null default 'ciudadano' check (rol in ('ciudadano', 'voluntario', 'coordinador')),
  estado text not null default 'activo' check (estado in ('activo', 'suspendido')),
  visible_en_directorio boolean not null default true,
  habilidades text[] not null default '{}',
  apoyo text check (char_length(apoyo) <= 200),
  horario text check (char_length(horario) <= 80),
  puntos integer not null default 0,
  creado_en timestamptz not null default now()
);

create table if not exists public.reportes (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique default ('REP-' || lpad(nextval('public.seq_reportes')::text, 4, '0')),
  client_id uuid unique,                       -- evita duplicados si el celular reenvía tras perder la señal
  usuario_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  tipo text not null check (tipo in ('Sismo', 'Huayco', 'Inundación', 'Incendio', 'Deslizamiento', 'Otro')),
  descripcion text not null check (char_length(descripcion) between 5 and 500),
  ubicacion_texto text not null check (char_length(ubicacion_texto) between 2 and 200),  -- PRIVADO
  distrito text check (char_length(distrito) <= 60),
  lat_aprox numeric(8, 3),                     -- 3 decimales ≈ 110 m
  lon_aprox numeric(8, 3),
  foto_ruta text,
  estado text not null default 'Pendiente' check (estado in ('Pendiente', 'En revisión', 'Verificado', 'En atención', 'Resuelto')),
  nivel text not null default 'Medio' check (nivel in ('Alto', 'Medio', 'Bajo')),
  revisado_por uuid references public.perfiles (id) on delete set null,
  revisado_en timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique default ('SOL-' || lpad(nextval('public.seq_solicitudes')::text, 4, '0')),
  client_id uuid unique,
  usuario_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  tipo_ayuda text not null check (char_length(tipo_ayuda) between 2 and 60),
  numero_personas integer not null default 1 check (numero_personas between 1 and 99),
  detalles text check (char_length(detalles) <= 500),
  ubicacion_texto text not null check (char_length(ubicacion_texto) between 2 and 200),  -- PRIVADO
  distrito text check (char_length(distrito) <= 60),
  lat_aprox numeric(8, 3),
  lon_aprox numeric(8, 3),
  estado text not null default 'Activa' check (estado in ('Activa', 'En coordinación', 'En atención', 'Atendida', 'Cancelada')),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.ofertas (
  id uuid primary key default gen_random_uuid(),
  client_id uuid unique,
  usuario_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  tipo_apoyo text not null check (char_length(tipo_apoyo) between 2 and 60),
  disponibilidad text check (char_length(disponibilidad) <= 120),
  contacto_privado text check (char_length(contacto_privado) <= 60),                      -- PRIVADO
  distrito text check (char_length(distrito) <= 60),
  pausada boolean not null default false,
  creado_en timestamptz not null default now()
);

create table if not exists public.apoyos (
  solicitud_id uuid not null references public.solicitudes (id) on delete cascade,
  usuario_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  creado_en timestamptz not null default now(),
  primary key (solicitud_id, usuario_id)
);

create table if not exists public.asignaciones (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('reporte', 'solicitud')),
  reporte_id uuid references public.reportes (id) on delete cascade,
  solicitud_id uuid references public.solicitudes (id) on delete cascade,
  voluntario_id uuid not null references public.perfiles (id) on delete cascade,
  asignado_por uuid default auth.uid() references public.perfiles (id) on delete set null,
  creado_en timestamptz not null default now(),
  check ((tipo = 'reporte' and reporte_id is not null and solicitud_id is null)
      or (tipo = 'solicitud' and solicitud_id is not null and reporte_id is null))
);
-- Una persona no puede quedar asignada dos veces al mismo caso
create unique index if not exists asignacion_unica_reporte on public.asignaciones (reporte_id, voluntario_id) where reporte_id is not null;
create unique index if not exists asignacion_unica_solicitud on public.asignaciones (solicitud_id, voluntario_id) where solicitud_id is not null;

create table if not exists public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  titulo text not null,
  detalle text,
  icono text not null default 'fa-bell',
  color text not null default 'bg-peru-red',
  ruta text,
  objetivo_id uuid,
  leida boolean not null default false,
  creado_en timestamptz not null default now()
);

create table if not exists public.publicaciones (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  texto text not null check (char_length(texto) between 5 and 280),
  creado_en timestamptz not null default now()
);

create table if not exists public.me_gusta (
  publicacion_id uuid not null references public.publicaciones (id) on delete cascade,
  usuario_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  primary key (publicacion_id, usuario_id)
);

create table if not exists public.historial_estados (
  id bigint generated always as identity primary key,
  entidad text not null check (entidad in ('reporte', 'solicitud')),
  entidad_id uuid not null,
  estado_anterior text,
  estado_nuevo text not null,
  cambiado_por uuid references public.perfiles (id) on delete set null,
  creado_en timestamptz not null default now()
);

create index if not exists idx_reportes_estado on public.reportes (estado, creado_en desc);
create index if not exists idx_solicitudes_estado on public.solicitudes (estado, creado_en desc);
create index if not exists idx_notificaciones_usuario on public.notificaciones (usuario_id, creado_en desc);

-- ---------- 2. Funciones de rol ----------
create or replace function public.rol_actual() returns text
language sql stable security definer set search_path = public as
$$ select rol from public.perfiles where id = auth.uid() and estado = 'activo' $$;

create or replace function public.es_coordinador() returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce(public.rol_actual() = 'coordinador', false) $$;

-- ---------- 3. Disparadores (triggers) ----------
-- 3.1 Al registrarse un usuario se crea su perfil automáticamente
create or replace function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  visible text := left(coalesce(nullif(new.raw_user_meta_data ->> 'nombre_visible', ''), nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Vecino'), 30);
begin
  -- El nombre visible debe tener entre 2 y 30 letras; con un correo como "a@correo.pe" saldría de 1 y fallaría el registro.
  if char_length(visible) < 2 then visible := 'Vecino'; end if;
  insert into public.perfiles (id, nombre, apellido, nombre_visible, celular)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'nombre', ''), 60),
    left(coalesce(new.raw_user_meta_data ->> 'apellido', ''), 60),
    visible,
    new.phone
  );
  return new;
end $$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.crear_perfil();

-- 3.2 Nadie desde la app puede nombrarse coordinador
create or replace function public.proteger_rol() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.rol = 'coordinador' and old.rol is distinct from 'coordinador' and auth.uid() is not null then
    raise exception 'Solo un administrador puede nombrar coordinadores.';
  end if;
  return new;
end $$;

drop trigger if exists proteger_rol_perfil on public.perfiles;
create trigger proteger_rol_perfil before update on public.perfiles
  for each row execute function public.proteger_rol();

-- 3.3 Límite de envíos por hora (anti-spam)
create or replace function public.limitar_frecuencia() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  n integer;
  tope integer := case tg_table_name when 'reportes' then 5 when 'solicitudes' then 10 else 15 end;
begin
  execute format('select count(*) from public.%I where usuario_id = $1 and creado_en > now() - interval ''1 hour''', tg_table_name)
    into n using new.usuario_id;
  if n >= tope then
    raise exception 'Hiciste muchos envíos seguidos. Intenta de nuevo en un rato.';
  end if;
  return new;
end $$;

drop trigger if exists limite_reportes on public.reportes;
create trigger limite_reportes before insert on public.reportes for each row execute function public.limitar_frecuencia();
drop trigger if exists limite_solicitudes on public.solicitudes;
create trigger limite_solicitudes before insert on public.solicitudes for each row execute function public.limitar_frecuencia();
drop trigger if exists limite_ofertas on public.ofertas;
create trigger limite_ofertas before insert on public.ofertas for each row execute function public.limitar_frecuencia();

-- 3.4 Quién revisó un reporte y cuándo
create or replace function public.preparar_cambio() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.estado is distinct from old.estado and tg_table_name = 'reportes' then
    new.revisado_por := auth.uid();
    new.revisado_en := now();
  end if;
  new.actualizado_en := now();
  return new;
end $$;

drop trigger if exists preparar_cambio_reporte on public.reportes;
create trigger preparar_cambio_reporte before update on public.reportes for each row execute function public.preparar_cambio();
drop trigger if exists preparar_cambio_solicitud on public.solicitudes;
create trigger preparar_cambio_solicitud before update on public.solicitudes for each row execute function public.preparar_cambio();

-- 3.5 Historial de estados + aviso a la persona dueña
create or replace function public.registrar_cambio_estado() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  entidad text := case tg_table_name when 'reportes' then 'reporte' else 'solicitud' end;
begin
  if new.estado is distinct from old.estado then
    insert into public.historial_estados (entidad, entidad_id, estado_anterior, estado_nuevo, cambiado_por)
    values (entidad, new.id, old.estado, new.estado, auth.uid());

    -- No se avisa a alguien de un cambio que hizo él mismo (por ejemplo, cancelar su solicitud)
    if auth.uid() is distinct from new.usuario_id then
      insert into public.notificaciones (usuario_id, titulo, detalle, icono, color, ruta, objetivo_id)
      values (
        new.usuario_id,
        case entidad when 'reporte' then 'Tu reporte cambió de estado' else 'Tu solicitud cambió de estado' end,
        case entidad when 'reporte' then 'El reporte ' else 'La solicitud ' end || new.codigo || ' ahora está: ' || new.estado || '.',
        case entidad when 'reporte' then 'fa-circle-check' else 'fa-hand-holding-heart' end,
        case entidad when 'reporte' then 'bg-peru-red' else 'bg-emerald-600' end,
        case entidad when 'reporte' then 'historial' else 'seguimiento' end,
        new.id
      );
    end if;
  end if;
  return null;
end $$;

drop trigger if exists cambio_estado_reporte on public.reportes;
create trigger cambio_estado_reporte after update on public.reportes for each row execute function public.registrar_cambio_estado();
drop trigger if exists cambio_estado_solicitud on public.solicitudes;
create trigger cambio_estado_solicitud after update on public.solicitudes for each row execute function public.registrar_cambio_estado();

-- ---------- 4. Acciones que modifican datos de otras personas (solo por función) ----------
-- 4.1 Apoyar una solicitud (cualquier persona con sesión, menos su dueña)
create or replace function public.apoyar_solicitud(p_solicitud uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  s public.solicitudes%rowtype;
  filas integer;
begin
  if auth.uid() is null then raise exception 'Inicia sesión para apoyar.'; end if;
  select * into s from public.solicitudes where id = p_solicitud for update;   -- bloquea la fila: evita carreras
  if not found then raise exception 'La solicitud no existe.'; end if;
  if s.usuario_id = auth.uid() then raise exception 'No puedes apoyar tu propia solicitud.'; end if;
  if s.estado in ('Atendida', 'Cancelada') then raise exception 'Esta solicitud ya no necesita apoyo.'; end if;

  insert into public.apoyos (solicitud_id, usuario_id) values (p_solicitud, auth.uid()) on conflict do nothing;
  get diagnostics filas = row_count;
  if filas = 1 then
    update public.solicitudes set estado = 'En coordinación' where id = p_solicitud and estado = 'Activa';
    update public.perfiles set puntos = puntos + 10 where id = auth.uid();
  end if;
end $$;

-- 4.2 Asignar voluntarios a un caso (solo coordinación)
create or replace function public.asignar_voluntarios(p_tipo text, p_id uuid, p_voluntarios uuid[]) returns integer
language plpgsql security definer set search_path = public as $$
declare
  v uuid;
  nuevos integer := 0;
  filas integer;
begin
  if not public.es_coordinador() then raise exception 'Solo coordinación puede asignar voluntarios.'; end if;
  if p_tipo not in ('reporte', 'solicitud') then raise exception 'Tipo de caso no válido.'; end if;

  foreach v in array p_voluntarios loop
    if p_tipo = 'reporte' then
      insert into public.asignaciones (tipo, reporte_id, voluntario_id) values ('reporte', p_id, v) on conflict do nothing;
    else
      insert into public.asignaciones (tipo, solicitud_id, voluntario_id) values ('solicitud', p_id, v) on conflict do nothing;
    end if;
    get diagnostics filas = row_count;
    if filas = 1 then
      nuevos := nuevos + 1;
      insert into public.notificaciones (usuario_id, titulo, detalle, icono, color, ruta, objetivo_id)
      values (v, 'Te asignaron un caso', 'Coordinación te pidió apoyar en un caso. Revisa los detalles.', 'fa-user-check', 'bg-violet-600', 'comunidad', p_id);
    end if;
  end loop;

  if nuevos > 0 then
    if p_tipo = 'reporte' then
      update public.reportes set estado = 'En atención' where id = p_id and estado in ('Pendiente', 'En revisión', 'Verificado');
    else
      update public.solicitudes set estado = 'En atención' where id = p_id and estado in ('Activa', 'En coordinación');
    end if;
  end if;
  return nuevos;
end $$;

-- ---------- 5. Vistas públicas (sin datos privados) ----------
-- Estas vistas corren con permisos del dueño de la base y filtran por sí mismas lo que se puede ver.
create or replace view public.reportes_publicos as
  select id, codigo, tipo, descripcion, estado, nivel, distrito, lat_aprox, lon_aprox, creado_en
  from public.reportes;                                   -- sin autor y sin dirección escrita

create or replace view public.solicitudes_cercanas as
  select id, codigo, tipo_ayuda, numero_personas, detalles, distrito, estado, creado_en
  from public.solicitudes
  where estado in ('Activa', 'En coordinación', 'En atención');   -- sin autor y sin dirección escrita

create or replace view public.ofertas_publicas as
  select id, tipo_apoyo, disponibilidad, distrito, creado_en
  from public.ofertas
  where not pausada;                                      -- sin teléfono de contacto

create or replace view public.directorio_voluntarios as
  select p.id, p.nombre_visible, p.distrito, p.habilidades, p.apoyo, p.horario,
         (select count(*) from public.apoyos a where a.usuario_id = p.id) as ayudas
  from public.perfiles p
  where p.rol = 'voluntario' and p.visible_en_directorio and p.estado = 'activo';

create or replace view public.publicaciones_con_autor as
  select pu.id, pu.texto, pu.creado_en, pu.autor_id, pe.nombre_visible as autor,
         (select count(*) from public.me_gusta m where m.publicacion_id = pu.id) as total_me_gusta,
         exists (select 1 from public.me_gusta m where m.publicacion_id = pu.id and m.usuario_id = auth.uid()) as me_gusta_mio
  from public.publicaciones pu
  join public.perfiles pe on pe.id = pu.autor_id;

-- ---------- 6. Seguridad por filas (RLS) ----------
alter table public.perfiles enable row level security;
alter table public.reportes enable row level security;
alter table public.solicitudes enable row level security;
alter table public.ofertas enable row level security;
alter table public.apoyos enable row level security;
alter table public.asignaciones enable row level security;
alter table public.notificaciones enable row level security;
alter table public.publicaciones enable row level security;
alter table public.me_gusta enable row level security;
alter table public.historial_estados enable row level security;

-- perfiles
drop policy if exists perfiles_ver on public.perfiles;
create policy perfiles_ver on public.perfiles for select to authenticated
  using (id = auth.uid() or public.es_coordinador());
drop policy if exists perfiles_editar on public.perfiles;
create policy perfiles_editar on public.perfiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- reportes
drop policy if exists reportes_crear on public.reportes;
create policy reportes_crear on public.reportes for insert to authenticated
  with check (usuario_id = auth.uid() and estado = 'Pendiente' and revisado_por is null);
drop policy if exists reportes_ver on public.reportes;
create policy reportes_ver on public.reportes for select to authenticated
  using (usuario_id = auth.uid() or public.es_coordinador());
drop policy if exists reportes_gestionar on public.reportes;
create policy reportes_gestionar on public.reportes for update to authenticated
  using (public.es_coordinador()) with check (public.es_coordinador());

-- solicitudes
drop policy if exists solicitudes_crear on public.solicitudes;
create policy solicitudes_crear on public.solicitudes for insert to authenticated
  with check (usuario_id = auth.uid() and estado = 'Activa');
drop policy if exists solicitudes_ver on public.solicitudes;
create policy solicitudes_ver on public.solicitudes for select to authenticated
  using (usuario_id = auth.uid() or public.es_coordinador());
drop policy if exists solicitudes_gestionar on public.solicitudes;
create policy solicitudes_gestionar on public.solicitudes for update to authenticated
  using (public.es_coordinador()) with check (public.es_coordinador());
drop policy if exists solicitudes_cancelar on public.solicitudes;
create policy solicitudes_cancelar on public.solicitudes for update to authenticated
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid() and estado = 'Cancelada');

-- ofertas
drop policy if exists ofertas_crear on public.ofertas;
create policy ofertas_crear on public.ofertas for insert to authenticated
  with check (usuario_id = auth.uid());
drop policy if exists ofertas_ver on public.ofertas;
create policy ofertas_ver on public.ofertas for select to authenticated
  using (usuario_id = auth.uid() or public.es_coordinador());
drop policy if exists ofertas_editar on public.ofertas;
create policy ofertas_editar on public.ofertas for update to authenticated
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
drop policy if exists ofertas_borrar on public.ofertas;
create policy ofertas_borrar on public.ofertas for delete to authenticated
  using (usuario_id = auth.uid());

-- apoyos y asignaciones (se crean solo mediante las funciones de la sección 4)
drop policy if exists apoyos_ver on public.apoyos;
create policy apoyos_ver on public.apoyos for select to authenticated
  using (usuario_id = auth.uid() or public.es_coordinador());
drop policy if exists apoyos_retirar on public.apoyos;
create policy apoyos_retirar on public.apoyos for delete to authenticated
  using (usuario_id = auth.uid());
drop policy if exists asignaciones_ver on public.asignaciones;
create policy asignaciones_ver on public.asignaciones for select to authenticated
  using (voluntario_id = auth.uid() or public.es_coordinador());

-- notificaciones (solo las propias)
drop policy if exists notificaciones_ver on public.notificaciones;
create policy notificaciones_ver on public.notificaciones for select to authenticated using (usuario_id = auth.uid());
drop policy if exists notificaciones_marcar on public.notificaciones;
create policy notificaciones_marcar on public.notificaciones for update to authenticated
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
drop policy if exists notificaciones_borrar on public.notificaciones;
create policy notificaciones_borrar on public.notificaciones for delete to authenticated using (usuario_id = auth.uid());

-- comunidad
drop policy if exists publicaciones_ver on public.publicaciones;
create policy publicaciones_ver on public.publicaciones for select to authenticated using (true);
drop policy if exists publicaciones_crear on public.publicaciones;
create policy publicaciones_crear on public.publicaciones for insert to authenticated with check (autor_id = auth.uid());
drop policy if exists publicaciones_borrar on public.publicaciones;
create policy publicaciones_borrar on public.publicaciones for delete to authenticated
  using (autor_id = auth.uid() or public.es_coordinador());
drop policy if exists me_gusta_ver on public.me_gusta;
create policy me_gusta_ver on public.me_gusta for select to authenticated using (true);
drop policy if exists me_gusta_dar on public.me_gusta;
create policy me_gusta_dar on public.me_gusta for insert to authenticated with check (usuario_id = auth.uid());
drop policy if exists me_gusta_quitar on public.me_gusta;
create policy me_gusta_quitar on public.me_gusta for delete to authenticated using (usuario_id = auth.uid());

-- historial: solo coordinación
drop policy if exists historial_ver on public.historial_estados;
create policy historial_ver on public.historial_estados for select to authenticated using (public.es_coordinador());

-- ---------- 7. Permisos explícitos (mínimos) ----------
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

grant usage on schema public to authenticated;
grant usage on sequence public.seq_reportes, public.seq_solicitudes to authenticated;

grant select on public.perfiles to authenticated;
grant update (nombre, apellido, nombre_visible, celular, fecha_nacimiento, departamento, provincia, distrito,
              rol, visible_en_directorio, habilidades, apoyo, horario) on public.perfiles to authenticated;

grant select on public.reportes to authenticated;
grant insert (client_id, tipo, descripcion, ubicacion_texto, distrito, lat_aprox, lon_aprox, foto_ruta) on public.reportes to authenticated;
grant update (estado, nivel) on public.reportes to authenticated;          -- RLS: solo coordinación

grant select on public.solicitudes to authenticated;
grant insert (client_id, tipo_ayuda, numero_personas, detalles, ubicacion_texto, distrito, lat_aprox, lon_aprox) on public.solicitudes to authenticated;
grant update (estado) on public.solicitudes to authenticated;              -- RLS: coordinación, o su dueña solo para cancelar

grant select, delete on public.ofertas to authenticated;
grant insert (client_id, tipo_apoyo, disponibilidad, contacto_privado, distrito) on public.ofertas to authenticated;
grant update (pausada, disponibilidad) on public.ofertas to authenticated;

grant select, delete on public.apoyos to authenticated;
grant select on public.asignaciones to authenticated;
grant select, delete on public.notificaciones to authenticated;
grant update (leida) on public.notificaciones to authenticated;
grant select, delete on public.publicaciones to authenticated;
grant insert (texto) on public.publicaciones to authenticated;
grant select, delete on public.me_gusta to authenticated;
grant insert (publicacion_id) on public.me_gusta to authenticated;
grant select on public.historial_estados to authenticated;

grant select on public.reportes_publicos, public.solicitudes_cercanas, public.ofertas_publicas,
                public.directorio_voluntarios, public.publicaciones_con_autor to authenticated;

grant execute on function public.rol_actual(), public.es_coordinador() to authenticated;
grant execute on function public.apoyar_solicitud(uuid) to authenticated;
grant execute on function public.asignar_voluntarios(text, uuid, uuid[]) to authenticated;

-- ---------- 8. Fotos de reportes (privadas, máx. 5 MB, solo imágenes) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-reportes', 'fotos-reportes', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists fotos_subir on storage.objects;
create policy fotos_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos-reportes' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists fotos_ver on storage.objects;
create policy fotos_ver on storage.objects for select to authenticated
  using (bucket_id = 'fotos-reportes' and ((storage.foldername(name))[1] = auth.uid()::text or public.es_coordinador()));

-- ---------- 9. Tiempo real: las notificaciones llegan al instante ----------
do $$
begin
  alter publication supabase_realtime add table public.notificaciones;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

-- =====================================================================================
-- Cómo nombrar al primer coordinador (después de registrarte en la app):
--   update public.perfiles set rol = 'coordinador'
--   where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
-- =====================================================================================
