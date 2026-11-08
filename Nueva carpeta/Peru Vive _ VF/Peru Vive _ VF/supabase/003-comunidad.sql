-- =====================================================================================
-- Perú Vive · Ajuste 003: comentarios, fotos en publicaciones y avisos de "me gusta" y comentarios.
-- Cómo usarlo: Supabase → SQL Editor → New query → pegar TODO este archivo → Run.
-- Se puede ejecutar más de una vez sin problema. Requiere haber ejecutado antes 001 y 002.
-- =====================================================================================

-- ---------- 1. Foto en las publicaciones ----------
-- Se guarda solo la ruta del archivo (carpeta = id de la persona). El archivo va en el contenedor "fotos-comunidad".
alter table public.publicaciones add column if not exists foto_ruta text;
alter table public.publicaciones drop constraint if exists publicaciones_foto_ruta_check;
alter table public.publicaciones add constraint publicaciones_foto_ruta_check
  check (foto_ruta is null or foto_ruta ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.jpg$');

drop policy if exists publicaciones_crear on public.publicaciones;
create policy publicaciones_crear on public.publicaciones for insert to authenticated
  with check (autor_id = auth.uid() and (foto_ruta is null or foto_ruta like auth.uid()::text || '/%'));

grant insert (texto, foto_ruta) on public.publicaciones to authenticated;

-- Contenedor de fotos de la comunidad: lectura pública por enlace (nombres imposibles de adivinar),
-- máximo 2 MB por foto y solo imágenes. Solo se puede subir a la carpeta propia.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-comunidad', 'fotos-comunidad', true, 2097152, array['image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/jpeg'];

drop policy if exists fotos_comunidad_subir on storage.objects;
create policy fotos_comunidad_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos-comunidad' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists fotos_comunidad_borrar on storage.objects;
create policy fotos_comunidad_borrar on storage.objects for delete to authenticated
  using (bucket_id = 'fotos-comunidad' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- 2. Comentarios ----------
create table if not exists public.comentarios (
  id uuid primary key default gen_random_uuid(),
  publicacion_id uuid not null references public.publicaciones (id) on delete cascade,
  autor_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 200),
  creado_en timestamptz not null default now()
);
create index if not exists idx_comentarios_publicacion on public.comentarios (publicacion_id, creado_en);

alter table public.comentarios enable row level security;

drop policy if exists comentarios_ver on public.comentarios;
create policy comentarios_ver on public.comentarios for select to authenticated using (true);
drop policy if exists comentarios_crear on public.comentarios;
create policy comentarios_crear on public.comentarios for insert to authenticated with check (autor_id = auth.uid());
drop policy if exists comentarios_borrar on public.comentarios;
create policy comentarios_borrar on public.comentarios for delete to authenticated
  using (autor_id = auth.uid() or public.es_coordinador());

grant select, delete on public.comentarios to authenticated;
grant insert (publicacion_id, texto) on public.comentarios to authenticated;

-- Límite anti-spam: máximo 30 comentarios por hora por persona
create or replace function public.limitar_comentarios() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.comentarios where autor_id = new.autor_id and creado_en > now() - interval '1 hour') >= 30 then
    raise exception 'Escribiste muchos comentarios en poco tiempo. Espera un rato e inténtalo de nuevo.' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists limite_comentarios on public.comentarios;
create trigger limite_comentarios before insert on public.comentarios for each row execute function public.limitar_comentarios();

-- ---------- 3. Vistas (sin datos privados: solo nombre visible) ----------
create or replace view public.publicaciones_con_autor as
  select pu.id, pu.texto, pu.creado_en, pu.autor_id, pe.nombre_visible as autor,
         (select count(*) from public.me_gusta m where m.publicacion_id = pu.id) as total_me_gusta,
         exists (select 1 from public.me_gusta m where m.publicacion_id = pu.id and m.usuario_id = auth.uid()) as me_gusta_mio,
         pu.foto_ruta,
         (select count(*) from public.comentarios c where c.publicacion_id = pu.id) as total_comentarios
  from public.publicaciones pu
  join public.perfiles pe on pe.id = pu.autor_id;

create or replace view public.comentarios_con_autor as
  select c.id, c.publicacion_id, c.texto, c.creado_en, c.autor_id, pe.nombre_visible as autor
  from public.comentarios c
  join public.perfiles pe on pe.id = c.autor_id;

grant select on public.publicaciones_con_autor, public.comentarios_con_autor to authenticated;

-- ---------- 4. Avisos: alguien dio "me gusta" o comentó tu publicación ----------
create or replace function public.avisar_me_gusta() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  dueno uuid;
  quien text;
  mensaje text;
begin
  select autor_id into dueno from public.publicaciones where id = new.publicacion_id;
  if dueno is null or dueno = new.usuario_id then return null; end if;   -- no te avisamos de lo que haces tú mismo
  select nombre_visible into quien from public.perfiles where id = new.usuario_id;
  mensaje := coalesce(quien, 'Un vecino') || ' le dio me gusta a tu publicación.';
  -- Si la persona quita y vuelve a poner el "me gusta", no se repite el aviso
  if exists (select 1 from public.notificaciones where usuario_id = dueno and objetivo_id = new.publicacion_id and detalle = mensaje) then
    return null;
  end if;
  insert into public.notificaciones (usuario_id, titulo, detalle, icono, color, ruta, objetivo_id)
  values (dueno, 'Le gustó tu publicación', mensaje, 'fa-heart', 'bg-pink-600', 'comunidad', new.publicacion_id);
  return null;
end $$;

drop trigger if exists aviso_me_gusta on public.me_gusta;
create trigger aviso_me_gusta after insert on public.me_gusta for each row execute function public.avisar_me_gusta();

create or replace function public.avisar_comentario() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  dueno uuid;
  quien text;
begin
  select autor_id into dueno from public.publicaciones where id = new.publicacion_id;
  if dueno is null or dueno = new.autor_id then return null; end if;
  select nombre_visible into quien from public.perfiles where id = new.autor_id;
  insert into public.notificaciones (usuario_id, titulo, detalle, icono, color, ruta, objetivo_id)
  values (dueno, 'Comentaron tu publicación',
          coalesce(quien, 'Un vecino') || ' comentó: ' || left(new.texto, 80) || case when char_length(new.texto) > 80 then '…' else '' end,
          'fa-comment', 'bg-sky-600', 'comunidad', new.publicacion_id);
  return null;
end $$;

drop trigger if exists aviso_comentario on public.comentarios;
create trigger aviso_comentario after insert on public.comentarios for each row execute function public.avisar_comentario();
