-- =====================================================================================
-- Perú Vive · Etapa 5: zonas seguras (refugios, centros de acopio, puntos de reunión, atención de salud)
-- Ejecutar DESPUÉS de 001, 002, 003 y 004 (Supabase → SQL Editor → pegar todo → Run). Se puede repetir sin problema.
--
-- Hasta ahora los refugios estaban escritos dentro del código del mapa. Ahora viven en la base:
--   · Todas las personas con sesión las ven en el mapa.
--   · Solo coordinación puede agregarlas, cambiar su estado (Activo, Lleno, Cerrado) y borrarlas,
--     desde Perfil → Centro de coordinación → Zonas seguras.
-- Son lugares públicos (colegios, estadios, postas), nunca domicilios de personas.
-- =====================================================================================

create table if not exists public.zonas_seguras (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 3 and 80),
  categoria text not null check (categoria in ('refugio', 'acopio', 'reunion', 'salud')),
  descripcion text check (char_length(descripcion) <= 300),
  direccion text check (char_length(direccion) <= 160),
  distrito text check (char_length(distrito) <= 60),
  lat numeric(8, 5) not null check (lat between -19 and 1),
  lon numeric(8, 5) not null check (lon between -82 and -68),
  estado text not null default 'Activo' check (estado in ('Activo', 'Lleno', 'Cerrado')),
  capacidad integer check (capacidad between 0 and 100000),
  horario text check (char_length(horario) <= 80),
  ejemplo boolean not null default false,          -- true = dato de demostración (lo borra 007-borrar-datos-ejemplo.sql)
  creado_por uuid default auth.uid() references public.perfiles (id) on delete set null,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists idx_zonas_seguras_estado on public.zonas_seguras (estado, categoria);

create or replace function public.tocar_zona_segura() returns trigger
language plpgsql as $$
begin
  new.actualizado_en := now();
  return new;
end $$;

drop trigger if exists tocar_zona_segura on public.zonas_seguras;
create trigger tocar_zona_segura before update on public.zonas_seguras
  for each row execute function public.tocar_zona_segura();

alter table public.zonas_seguras enable row level security;

drop policy if exists zonas_ver on public.zonas_seguras;
create policy zonas_ver on public.zonas_seguras for select to authenticated using (true);
drop policy if exists zonas_crear on public.zonas_seguras;
create policy zonas_crear on public.zonas_seguras for insert to authenticated with check (public.es_coordinador());
drop policy if exists zonas_editar on public.zonas_seguras;
create policy zonas_editar on public.zonas_seguras for update to authenticated
  using (public.es_coordinador()) with check (public.es_coordinador());
drop policy if exists zonas_borrar on public.zonas_seguras;
create policy zonas_borrar on public.zonas_seguras for delete to authenticated using (public.es_coordinador());

revoke all on public.zonas_seguras from anon, authenticated;
grant select, delete on public.zonas_seguras to authenticated;
grant insert (nombre, categoria, descripcion, direccion, distrito, lat, lon, estado, capacidad, horario)
  on public.zonas_seguras to authenticated;
grant update (nombre, categoria, descripcion, direccion, distrito, lat, lon, estado, capacidad, horario)
  on public.zonas_seguras to authenticated;
