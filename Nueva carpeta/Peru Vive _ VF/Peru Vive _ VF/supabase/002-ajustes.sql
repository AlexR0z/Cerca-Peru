-- =====================================================================================
-- Perú Vive · Ajuste 002
--
-- (1) Poder borrar usuarios que ya actuaron en el sistema.
--     Las columnas "quién revisó / asignó / cambió el estado" apuntaban a perfiles sin decir qué hacer
--     al borrar a esa persona; la base lo impedía ("Database error deleting user" en el panel).
--     Ahora, al borrar a la persona, esas columnas quedan vacías (NULL) y el historial se conserva.
--
-- (2) Registro con correos cortos.
--     Con un correo como "a@correo.pe" el nombre visible salía de 1 letra, la base lo rechazaba y la
--     persona no podía registrarse. Ahora se usa "Vecino" en ese caso.
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pegar TODO → Run.
-- Si creaste la base con la versión actual de 001-esquema.sql, ya lo incluye (no hace daño ejecutarlo).
-- Se puede ejecutar varias veces sin problema.
-- =====================================================================================

-- (1)
alter table public.reportes drop constraint if exists reportes_revisado_por_fkey;
alter table public.reportes
  add constraint reportes_revisado_por_fkey
  foreign key (revisado_por) references public.perfiles (id) on delete set null;

alter table public.asignaciones drop constraint if exists asignaciones_asignado_por_fkey;
alter table public.asignaciones
  add constraint asignaciones_asignado_por_fkey
  foreign key (asignado_por) references public.perfiles (id) on delete set null;

alter table public.historial_estados drop constraint if exists historial_estados_cambiado_por_fkey;
alter table public.historial_estados
  add constraint historial_estados_cambiado_por_fkey
  foreign key (cambiado_por) references public.perfiles (id) on delete set null;

-- (2)
create or replace function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  visible text := left(coalesce(nullif(new.raw_user_meta_data ->> 'nombre_visible', ''), nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Vecino'), 30);
begin
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
