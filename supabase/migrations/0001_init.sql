-- OBSOLETO: este archivo es del esquema anterior de Cerca Perú y YA NO SE USA. No lo ejecutes.
-- La app web usa la misma base de datos que la app móvil de Perú Vive (carpeta supabase/ de Perú Vive: 001, 002 y 003).

-- CERCA PERÚ · esquema inicial + RLS
-- Revisar antes de producción. Ejecutar en el SQL Editor de Supabase o con `supabase db push`.

create extension if not exists pgcrypto;

-- ============ Tablas ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_visible text not null default 'Vecino/a',
  zona text not null default 'Chaclacayo',
  rol text not null default 'ciudadano' check (rol in ('ciudadano','voluntario','coordinador','administrador')),
  estado text not null default 'activo' check (estado in ('activo','suspendido')),
  created_at timestamptz not null default now()
);

create table public.emergency_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique,                    -- idempotencia al sincronizar
  user_id uuid not null default auth.uid() references public.profiles(id),
  code text not null,
  tipo text not null check (tipo in ('Huaico','Inundación','Terremoto','Incendio','Deslizamiento','Emergencia médica','Otro')),
  descripcion text not null check (char_length(descripcion) between 5 and 200),
  lat_aprox numeric(8,3) not null,                   -- 3 decimales ≈ 110 m
  lon_aprox numeric(8,3) not null,
  estado text not null default 'Recibido' check (estado in ('Recibido','En revisión','Verificado por coordinador','En atención','Resuelto','Descartado')),
  prioridad text not null default 'Media' check (prioridad in ('Alta','Media','Baja')),
  verificado_por uuid references public.profiles(id),
  verificado_en timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.help_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique,
  user_id uuid not null default auth.uid() references public.profiles(id),
  categoria text not null check (categoria in ('Alimentos','Agua','Medicamentos','Refugio','Transporte','Herramientas','Otro')),
  descripcion text not null check (char_length(descripcion) between 5 and 200),
  cantidad_personas int not null default 1 check (cantidad_personas between 1 and 99),
  zona text not null,
  lat_aprox numeric(8,3) not null,
  lon_aprox numeric(8,3) not null,
  estado text not null default 'Pendiente' check (estado in ('Pendiente','En contacto','Apoyo confirmado','Atendida','Cancelada')),
  prioridad text not null default 'Media' check (prioridad in ('Alta','Media','Baja')),
  motivo_cierre text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resource_offers (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique,
  user_id uuid not null default auth.uid() references public.profiles(id),
  categoria text not null check (categoria in ('Alimentos','Agua','Transporte','Herramientas','Refugio','Voluntariado','Otro')),
  descripcion text not null check (char_length(descripcion) between 5 and 200),
  disponibilidad text not null,
  zona text not null,
  lat_aprox numeric(8,3) not null,
  lon_aprox numeric(8,3) not null,
  estado text not null default 'Disponible' check (estado in ('Disponible','Asignado','Agotado','Retirado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.volunteer_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  habilidades text[] not null default '{}',
  disponibilidad text,
  zona text,
  visible_en_directorio boolean not null default false   -- consentimiento explícito
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.help_requests(id) on delete cascade,
  volunteer_id uuid not null references public.profiles(id),
  coordinator_id uuid references public.profiles(id),
  estado text not null default 'Activa' check (estado in ('Activa','Completada','Cancelada')),
  assigned_at timestamptz not null default now(),
  completed_at timestamptz
);
-- Garantía de unicidad: una solicitud no puede tener dos asignaciones activas.
create unique index one_active_assignment_per_request on public.assignments(request_id) where estado = 'Activa';

create table public.status_history (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  old_status text,
  new_status text not null,
  changed_by uuid references public.profiles(id),
  note text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.risk_areas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null,
  geometry jsonb not null,              -- GeoJSON; migrar a PostGIS si se requiere consulta espacial
  fuente text not null,
  fecha_fuente date not null,
  es_oficial boolean not null default false
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);

create index on public.emergency_reports (estado, created_at desc);
create index on public.help_requests (estado, created_at desc);
create index on public.resource_offers (estado);
create index on public.notifications (user_id, created_at desc);

-- ============ Funciones auxiliares ============
create or replace function public.current_role_name() returns text
language sql stable security definer set search_path = public as
$$ select rol from public.profiles where id = auth.uid() and estado = 'activo' $$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce(public.current_role_name() in ('coordinador','administrador'), false) $$;

-- Perfil automático al registrarse
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nombre_visible) values (new.id, coalesce(split_part(new.email,'@',1), 'Vecino/a'));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Nadie puede cambiarse el rol salvo un administrador
create or replace function public.protect_role() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.rol is distinct from old.rol and coalesce(public.current_role_name(),'') <> 'administrador' then
    raise exception 'Solo un administrador puede cambiar roles';
  end if;
  return new;
end $$;
create trigger profiles_protect_role before update on public.profiles for each row execute function public.protect_role();

-- Límite de frecuencia (anti-spam): 5 reportes/hora, 10 solicitudes/hora por usuario
create or replace function public.rate_limit() returns trigger language plpgsql security definer set search_path = public as $$
declare n int; lim int := case tg_table_name when 'emergency_reports' then 5 else 10 end;
begin
  execute format('select count(*) from public.%I where user_id = $1 and created_at > now() - interval ''1 hour''', tg_table_name)
    into n using new.user_id;
  if n >= lim then raise exception 'Demasiados envíos seguidos. Intenta de nuevo más tarde.'; end if;
  return new;
end $$;
create trigger rl_reports before insert on public.emergency_reports for each row execute function public.rate_limit();
create trigger rl_requests before insert on public.help_requests for each row execute function public.rate_limit();
create trigger rl_offers before insert on public.resource_offers for each row execute function public.rate_limit();

-- Historial + verificación con responsable y fecha + auditoría
create or replace function public.track_status() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.estado is distinct from old.estado then
    insert into public.status_history(entity_type, entity_id, old_status, new_status, changed_by)
      values (tg_table_name, new.id, old.estado, new.estado, auth.uid());
    insert into public.audit_logs(actor_id, action, entity_type, entity_id)
      values (auth.uid(), 'cambio_estado:' || new.estado, tg_table_name, new.id);
    if tg_table_name = 'emergency_reports' and new.estado = 'Verificado por coordinador' then
      new.verificado_por := auth.uid(); new.verificado_en := now();
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger track_reports before update on public.emergency_reports for each row execute function public.track_status();
create trigger track_requests before update on public.help_requests for each row execute function public.track_status();

-- Aceptación transaccional de una solicitud por un voluntario (sin doble asignación)
create or replace function public.accept_request(p_request uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if coalesce(public.current_role_name(),'') not in ('voluntario','coordinador','administrador') then
    raise exception 'Necesitas ser voluntario para aceptar solicitudes';
  end if;
  perform 1 from public.help_requests where id = p_request and estado = 'Pendiente' for update;
  if not found then raise exception 'La solicitud ya fue tomada o no existe'; end if;
  insert into public.assignments(request_id, volunteer_id) values (p_request, auth.uid()) returning id into v_id;
  update public.help_requests set estado = 'En contacto' where id = p_request;
  insert into public.audit_logs(actor_id, action, entity_type, entity_id) values (auth.uid(), 'aceptar_solicitud', 'help_requests', p_request);
  return v_id;
end $$;
revoke all on function public.accept_request(uuid) from public;
grant execute on function public.accept_request(uuid) to authenticated;

-- ============ Vistas públicas (sin datos personales) ============
-- Reportes para el mapa: sin user_id ni descripción libre, solo ubicación aproximada.
create view public.public_reports as
  select id, tipo, estado, lat_aprox, lon_aprox, created_at
  from public.emergency_reports
  where estado not in ('Descartado','Resuelto');

create view public.volunteer_directory as
  select p.id, p.nombre_visible, v.habilidades, v.disponibilidad
  from public.volunteer_profiles v join public.profiles p on p.id = v.user_id
  where v.visible_en_directorio and p.estado = 'activo';

grant select on public.public_reports, public.volunteer_directory to anon, authenticated;

-- ============ RLS ============
alter table public.profiles enable row level security;
alter table public.emergency_reports enable row level security;
alter table public.help_requests enable row level security;
alter table public.resource_offers enable row level security;
alter table public.volunteer_profiles enable row level security;
alter table public.assignments enable row level security;
alter table public.status_history enable row level security;
alter table public.notifications enable row level security;
alter table public.risk_areas enable row level security;
alter table public.audit_logs enable row level security;

-- profiles
create policy "perfil propio o staff" on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "editar perfil propio" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "admin gestiona perfiles" on public.profiles for update using (public.current_role_name() = 'administrador');

-- emergency_reports
create policy "crear reporte propio" on public.emergency_reports for insert to authenticated
  with check (user_id = auth.uid() and estado = 'Recibido' and prioridad = 'Media');
create policy "ver reportes propios o staff" on public.emergency_reports for select using (user_id = auth.uid() or public.is_staff());
create policy "staff actualiza reportes" on public.emergency_reports for update using (public.is_staff());

-- help_requests
create policy "crear solicitud propia" on public.help_requests for insert to authenticated
  with check (user_id = auth.uid() and estado = 'Pendiente' and prioridad = 'Media');
create policy "ver solicitudes: propias, voluntarios o staff" on public.help_requests for select
  using (user_id = auth.uid() or public.current_role_name() in ('voluntario','coordinador','administrador'));
create policy "staff actualiza solicitudes" on public.help_requests for update using (public.is_staff());
create policy "dueño cancela su solicitud" on public.help_requests for update using (user_id = auth.uid())
  with check (user_id = auth.uid() and estado = 'Cancelada');

-- resource_offers
create policy "crear oferta propia" on public.resource_offers for insert to authenticated
  with check (user_id = auth.uid() and estado = 'Disponible');
create policy "ver ofertas disponibles o propias" on public.resource_offers for select
  using (estado = 'Disponible' or user_id = auth.uid() or public.is_staff());
create policy "dueño actualiza su oferta" on public.resource_offers for update using (user_id = auth.uid());
create policy "staff actualiza ofertas" on public.resource_offers for update using (public.is_staff());

-- volunteer_profiles
create policy "voluntario gestiona su ficha" on public.volunteer_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "staff ve fichas" on public.volunteer_profiles for select using (public.is_staff());

-- assignments (las altas se hacen con accept_request)
create policy "ver asignaciones propias o staff" on public.assignments for select using (volunteer_id = auth.uid() or public.is_staff());
create policy "staff actualiza asignaciones" on public.assignments for update using (public.is_staff());
create policy "voluntario cierra su asignación" on public.assignments for update using (volunteer_id = auth.uid());

-- status_history y audit_logs: solo lectura para staff; se escriben por triggers
create policy "staff lee historial" on public.status_history for select using (public.is_staff());
create policy "staff lee auditoria" on public.audit_logs for select using (public.is_staff());

-- notifications
create policy "notificaciones propias" on public.notifications for select using (user_id = auth.uid());
create policy "marcar leida" on public.notifications for update using (user_id = auth.uid());

-- risk_areas
create policy "todos ven zonas" on public.risk_areas for select using (true);
create policy "admin gestiona zonas" on public.risk_areas for all using (public.current_role_name() = 'administrador');

-- ============ Storage: fotos de reportes (privado, 5 MB, solo imágenes) ============
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-photos', 'report-photos', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "subir foto en carpeta propia" on storage.objects for insert to authenticated
  with check (bucket_id = 'report-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "ver fotos propias o staff" on storage.objects for select to authenticated
  using (bucket_id = 'report-photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff()));
