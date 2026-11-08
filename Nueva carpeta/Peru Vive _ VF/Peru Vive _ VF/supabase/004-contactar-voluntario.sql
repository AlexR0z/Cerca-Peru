-- =====================================================================================
-- Perú Vive · Etapa 4: contactar a un voluntario
-- Ejecutar DESPUÉS de 001, 002 y 003 (Supabase → SQL Editor → pegar todo → Run). Se puede repetir sin problema.
--
-- Cómo funciona:
--   1. Un vecino toca "Contactar" en el perfil de un voluntario y acepta compartir su celular.
--   2. contactar_voluntario() guarda el contacto y deja un AVISO en las Notificaciones del voluntario.
--   3. El voluntario abre el aviso: ver_contacto() le devuelve el nombre, la zona y el celular de quien lo pidió,
--      y desde ahí puede escribirle por WhatsApp o llamarle.
-- Privacidad: el celular del voluntario NUNCA se muestra. El del vecino solo lo ve el voluntario al que
-- él mismo decidió avisar. La tabla "contactos" está cerrada: solo se usa mediante estas dos funciones.
-- =====================================================================================

create table if not exists public.contactos (
  id uuid primary key default gen_random_uuid(),
  solicitante_id uuid not null references public.perfiles (id) on delete cascade,
  voluntario_id uuid not null references public.perfiles (id) on delete cascade,
  creado_en timestamptz not null default now(),
  check (solicitante_id <> voluntario_id)
);

create index if not exists idx_contactos_voluntario on public.contactos (voluntario_id, creado_en desc);
create index if not exists idx_contactos_solicitante on public.contactos (solicitante_id, creado_en desc);

-- Cerrada del todo: sin políticas ni permisos, nadie la lee ni la escribe directamente.
alter table public.contactos enable row level security;
revoke all on public.contactos from anon, authenticated;

-- ---------- 1. Avisar a un voluntario ----------
create or replace function public.contactar_voluntario(p_voluntario uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  yo public.perfiles%rowtype;
  vol public.perfiles%rowtype;
  nuevo uuid;
begin
  if auth.uid() is null then raise exception 'Inicia sesión para contactar a un voluntario.'; end if;
  if p_voluntario = auth.uid() then raise exception 'No puedes contactarte a ti mismo.'; end if;

  select * into yo from public.perfiles where id = auth.uid() and estado = 'activo';
  if not found then raise exception 'Tu cuenta no está activa.'; end if;
  if yo.celular is null or yo.celular !~ '^9[0-9]{8}$' then
    raise exception 'Agrega tu celular en Perfil → Editar perfil para que el voluntario pueda responderte.';
  end if;

  select * into vol from public.perfiles
   where id = p_voluntario and rol = 'voluntario' and visible_en_directorio and estado = 'activo';
  if not found then raise exception 'Esta persona ya no está disponible en el directorio.'; end if;

  -- Sin repetir ni saturar: un aviso por voluntario cada hora y 5 avisos por hora en total
  if exists (select 1 from public.contactos
              where solicitante_id = auth.uid() and voluntario_id = p_voluntario and creado_en > now() - interval '1 hour') then
    raise exception 'Ya le avisaste a esta persona hace poco. Espera a que te responda.';
  end if;
  if (select count(*) from public.contactos where solicitante_id = auth.uid() and creado_en > now() - interval '1 hour') >= 5 then
    raise exception 'Enviaste muchos avisos seguidos. Inténtalo de nuevo en un rato.';
  end if;

  insert into public.contactos (solicitante_id, voluntario_id) values (auth.uid(), p_voluntario) returning id into nuevo;

  insert into public.notificaciones (usuario_id, titulo, detalle, icono, color, ruta, objetivo_id)
  values (p_voluntario, 'Un vecino pidió tu ayuda',
          yo.nombre_visible || case when yo.distrito is not null and yo.distrito <> '' then ' (' || yo.distrito || ')' else '' end
            || ' quiere contactarte. Toca para responderle.',
          'fa-hand-holding-heart', 'bg-emerald-600', 'contacto', nuevo);
  return nuevo;
end $$;

-- ---------- 2. El voluntario ve a quién responder ----------
create or replace function public.ver_contacto(p_contacto uuid)
returns table (nombre text, distrito text, celular text, creado_en timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Inicia sesión para ver este aviso.'; end if;
  return query
    select p.nombre_visible, p.distrito, p.celular, c.creado_en
      from public.contactos c
      join public.perfiles p on p.id = c.solicitante_id
     where c.id = p_contacto and c.voluntario_id = auth.uid();   -- solo el voluntario avisado
  if not found then raise exception 'Este aviso no existe o ya no está disponible.'; end if;
end $$;

revoke all on function public.contactar_voluntario(uuid), public.ver_contacto(uuid) from public, anon;
grant execute on function public.contactar_voluntario(uuid), public.ver_contacto(uuid) to authenticated;
