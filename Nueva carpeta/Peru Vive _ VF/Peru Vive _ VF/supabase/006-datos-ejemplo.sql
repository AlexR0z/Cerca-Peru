-- =====================================================================================
-- Perú Vive · Datos de ejemplo para ver la app "llena"
-- Ejecutar DESPUÉS de 001, 002, 003, 004 y 005 (Supabase → SQL Editor → pegar todo → Run).
--
-- Qué crea (todo marcado como "ejemplo", para que nadie lo confunda con una alerta real):
--   · 18 cuentas ficticias (12 voluntarios y 6 vecinos) que NO pueden iniciar sesión.
--   · 11 reportes de emergencia en distintos estados, repartidos por Lima.
--   · 10 solicitudes de ayuda, 8 ofertas de apoyo, apoyos y asignaciones de voluntarios.
--   · 6 publicaciones de la comunidad con comentarios y "me gusta".
--   · 13 zonas seguras (refugios, centros de acopio, puntos de reunión y atención de salud).
--   · 6 notificaciones para cada persona real que ya esté registrada (y 2 más para coordinación).
--
-- Es seguro ejecutarlo más de una vez: si ya hay datos de ejemplo, no repite nada.
-- Para quitar TODO lo de ejemplo: ejecuta 007-borrar-datos-ejemplo.sql.
-- =====================================================================================

do $$
declare
  u jsonb;
  dominio constant text := '@ejemplo.peruvive.invalid';
  f record;
  nuevo uuid;
  r1 uuid; r2 uuid; r3 uuid; r5 uuid;
  s2 uuid; s3 uuid; s5 uuid; s6 uuid; s8 uuid;
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid; p6 uuid;
begin
  if exists (select 1 from auth.users where email like '%' || dominio) then
    raise notice 'Los datos de ejemplo ya estaban cargados. No se repitió nada.';
    return;
  end if;

  -- ---------- 1. Cuentas ficticias (sin clave: no se puede entrar con ellas) ----------
  for f in select * from (values
    -- usuario, nombre, apellido, nombre visible, rol, distrito, habilidades, apoyo, horario, puntos
    ('ana.torres',    'Ana',    'Torres',   'Ana Torres (ejemplo)',    'voluntario', 'Chaclacayo',   array['Primeros auxilios','Alimentación'],      'Curaciones básicas y reparto de comidas calientes.',        'Tardes y fines de semana', 140),
    ('carlos.ramos',  'Carlos', 'Ramos',    'Carlos Ramos (ejemplo)',  'voluntario', 'Ate',          array['Transporte','Logística'],                'Camioneta para trasladar víveres y personas.',              'Mañanas',                  210),
    ('rosa.quispe',   'Rosa',   'Quispe',   'Rosa Quispe (ejemplo)',   'voluntario', 'Lurigancho',   array['Alimentación','Cocina comunitaria'],     'Ollas comunes y preparación de raciones.',                  'Todo el día',              95),
    ('jorge.huaman',  'Jorge',  'Huamán',   'Jorge Huamán (ejemplo)',  'voluntario', 'Comas',        array['Búsqueda y rescate','Primeros auxilios'],'Brigada de rescate en zonas de ladera.',                    'Noches y fines de semana', 320),
    ('maria.flores',  'María',  'Flores',   'María Flores (ejemplo)',  'voluntario', 'Santa Anita',  array['Albergue','Atención a niños'],           'Apoyo en refugios y cuidado de niños.',                     'Tardes',                   180),
    ('luis.campos',   'Luis',   'Campos',   'Luis Campos (ejemplo)',   'voluntario', 'Rímac',        array['Construcción','Limpieza'],               'Limpieza de lodo y reparación de techos.',                  'Fines de semana',          60),
    ('carmen.diaz',   'Carmen', 'Díaz',     'Carmen Díaz (ejemplo)',   'voluntario', 'San Juan de Lurigancho', array['Psicología','Primeros auxilios'], 'Apoyo emocional a familias afectadas.',                   'Tardes',                   130),
    ('pedro.soto',    'Pedro',  'Soto',     'Pedro Soto (ejemplo)',    'voluntario', 'La Molina',    array['Comunicaciones','Logística'],            'Radio y coordinación de donaciones.',                       'Mañanas y noches',         75),
    ('julia.vargas',  'Julia',  'Vargas',   'Julia Vargas (ejemplo)',  'voluntario', 'El Agustino',  array['Alimentación','Albergue'],               'Recojo y reparto de víveres.',                              'Tardes',                   50),
    ('raul.medina',   'Raúl',   'Medina',   'Raúl Medina (ejemplo)',   'voluntario', 'Villa El Salvador', array['Transporte'],                      'Moto de carga para llegar a calles estrechas.',             'Todo el día',              110),
    ('teresa.leon',   'Teresa', 'León',     'Teresa León (ejemplo)',   'voluntario', 'Callao',       array['Enfermería','Primeros auxilios'],        'Enfermera: control de presión y curaciones.',               'Turnos de noche',          260),
    ('victor.ramirez','Víctor', 'Ramírez',  'Víctor Ramírez (ejemplo)','voluntario', 'Chaclacayo',   array['Construcción','Búsqueda y rescate'],     'Ayuda a despejar vías y rescatar enseres.',                 'Fines de semana',          40),
    ('sofia.mendoza', 'Sofía',  'Mendoza',  'Sofía Mendoza (ejemplo)', 'ciudadano',  'Chaclacayo',   '{}'::text[], null, null, 20),
    ('diego.paredes', 'Diego',  'Paredes',  'Diego Paredes (ejemplo)', 'ciudadano',  'Rímac',        '{}'::text[], null, null, 10),
    ('lucia.salas',   'Lucía',  'Salas',    'Lucía Salas (ejemplo)',   'ciudadano',  'Ate',          '{}'::text[], null, null, 30),
    ('marco.vega',    'Marco',  'Vega',     'Marco Vega (ejemplo)',    'ciudadano',  'San Juan de Lurigancho', '{}'::text[], null, null, 0),
    ('elena.rojas',   'Elena',  'Rojas',    'Elena Rojas (ejemplo)',   'ciudadano',  'El Agustino',  '{}'::text[], null, null, 40),
    ('paula.cruz',    'Paula',  'Cruz',     'Paula Cruz (ejemplo)',    'ciudadano',  'Callao',       '{}'::text[], null, null, 0)
  ) as t(usuario, nombre, apellido, visible, rol, distrito, habilidades, apoyo, horario, puntos)
  loop
    nuevo := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                            raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                            confirmation_token, recovery_token, email_change, email_change_token_new)
    values ('00000000-0000-0000-0000-000000000000', nuevo, 'authenticated', 'authenticated', f.usuario || dominio, '', now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('nombre', f.nombre, 'apellido', f.apellido, 'nombre_visible', f.visible),
            now() - interval '20 days', now(), '', '', '', '');
    -- el disparador crear_perfil ya creó el perfil; aquí se completan sus datos
    update public.perfiles
       set rol = f.rol, departamento = 'Lima', provincia = case when f.distrito = 'Callao' then 'Callao' else 'Lima' end,
           distrito = f.distrito, habilidades = f.habilidades, apoyo = f.apoyo, horario = f.horario,
           puntos = f.puntos, visible_en_directorio = true
     where id = nuevo;
  end loop;

  select jsonb_object_agg(split_part(email, '@', 1), id) into u from auth.users where email like '%' || dominio;

  -- ---------- 2. Reportes de emergencia ----------
  insert into public.reportes (usuario_id, tipo, descripcion, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, nivel, creado_en)
  values ((u->>'sofia.mendoza')::uuid, 'Huayco', '(Ejemplo) Caída de lodo y piedras sobre la vía principal. El tránsito está interrumpido en el tramo.', 'Quebrada cerca de la Carretera Central, Chaclacayo', 'Chaclacayo', -11.976, -76.776, 'Pendiente', 'Alto', now() - interval '25 minutes')
  returning id into r1;
  insert into public.reportes (usuario_id, tipo, descripcion, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, nivel, creado_en)
  values ((u->>'diego.paredes')::uuid, 'Inundación', '(Ejemplo) Acumulación de agua por desborde de acequia. Algunas viviendas tienen aniego leve.', 'Malecón de Chosica', 'Lurigancho', -11.943, -76.708, 'Verificado', 'Medio', now() - interval '80 minutes')
  returning id into r2;
  insert into public.reportes (usuario_id, tipo, descripcion, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, nivel, creado_en)
  values ((u->>'lucia.salas')::uuid, 'Deslizamiento', '(Ejemplo) Caída de piedras en la ladera de Huaycán. Personal municipal va en camino para evaluar.', 'Zona alta de Huaycán, Ate', 'Ate', -12.033, -76.850, 'En atención', 'Medio', now() - interval '3 hours')
  returning id into r3;
  insert into public.reportes (usuario_id, tipo, descripcion, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, nivel, creado_en)
  values ((u->>'marco.vega')::uuid, 'Sismo', '(Ejemplo) Movimiento fuerte percibido. No hay daños visibles y los vecinos salieron a la calle.', 'Avenida principal de San Juan de Lurigancho', 'San Juan de Lurigancho', -11.977, -77.007, 'Verificado', 'Bajo', now() - interval '5 hours');
  insert into public.reportes (usuario_id, tipo, descripcion, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, nivel, creado_en)
  values ((u->>'sofia.mendoza')::uuid, 'Incendio', '(Ejemplo) Incendio en una vivienda de material precario. Bomberos ya está en el lugar.', 'Asentamiento humano en Comas', 'Comas', -11.939, -77.050, 'En atención', 'Alto', now() - interval '40 minutes')
  returning id into r5;
  insert into public.reportes (usuario_id, tipo, descripcion, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, nivel, creado_en)
  values ((u->>'diego.paredes')::uuid, 'Inundación', '(Ejemplo) Rotura de tubería matriz: el agua inunda la pista y entra a tiendas cercanas.', 'Cerca del mercado, Rímac', 'Rímac', -12.029, -77.043, 'Resuelto', 'Medio', now() - interval '1 day');
  insert into public.reportes (usuario_id, tipo, descripcion, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, nivel, creado_en)
  values ((u->>'elena.rojas')::uuid, 'Deslizamiento', '(Ejemplo) Rocas sueltas sobre la carretera de acceso al cerro. Riesgo para vehículos y peatones.', 'Cerro San Cosme, El Agustino', 'El Agustino', -12.042, -77.010, 'En revisión', 'Medio', now() - interval '2 hours');
  insert into public.reportes (usuario_id, tipo, descripcion, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, nivel, creado_en)
  values ((u->>'lucia.salas')::uuid, 'Huayco', '(Ejemplo) Aumenta el caudal de la quebrada. Los vecinos piden una revisión preventiva.', 'Quebrada de Jicamarca, Lurigancho', 'Lurigancho', -11.950, -76.690, 'Pendiente', 'Alto', now() - interval '35 minutes');
  insert into public.reportes (usuario_id, tipo, descripcion, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, nivel, creado_en)
  values ((u->>'marco.vega')::uuid, 'Otro', '(Ejemplo) Poste de luz inclinado tras el viento, con cables a poca altura de la vereda.', 'Jirón Los Cedros, Santa Anita', 'Santa Anita', -12.043, -76.971, 'Pendiente', 'Medio', now() - interval '50 minutes');
  insert into public.reportes (usuario_id, tipo, descripcion, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, nivel, creado_en)
  values ((u->>'elena.rojas')::uuid, 'Inundación', '(Ejemplo) La calle quedó anegada tras la lluvia y el agua no drena.', 'Avenida cerca del cruce principal, Ate', 'Ate', -12.040, -76.930, 'Pendiente', 'Bajo', now() - interval '15 minutes');
  insert into public.reportes (usuario_id, tipo, descripcion, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, nivel, creado_en)
  values ((u->>'paula.cruz')::uuid, 'Sismo', '(Ejemplo) Réplica leve sentida en edificios altos. No se reportan daños.', 'Avenida La Marina, Callao', 'Callao', -12.056, -77.118, 'Verificado', 'Bajo', now() - interval '2 days');

  -- ---------- 3. Solicitudes de ayuda ----------
  insert into public.solicitudes (usuario_id, tipo_ayuda, numero_personas, detalles, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, creado_en)
  values ((u->>'sofia.mendoza')::uuid, 'Alimentos', 4, '(Ejemplo) Familia con niños pequeños sin víveres desde ayer, después del huayco.', 'Cerca de la Carretera Central, Chaclacayo', 'Chaclacayo', -11.975, -76.770, 'Activa', now() - interval '15 minutes');
  insert into public.solicitudes (usuario_id, tipo_ayuda, numero_personas, detalles, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, creado_en)
  values ((u->>'diego.paredes')::uuid, 'Agua', 6, '(Ejemplo) Sin agua potable por la rotura de la tubería. Hay adultos mayores en la casa.', 'Zona del mercado, Rímac', 'Rímac', -12.029, -77.043, 'En coordinación', now() - interval '2 hours')
  returning id into s2;
  insert into public.solicitudes (usuario_id, tipo_ayuda, numero_personas, detalles, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, creado_en)
  values ((u->>'lucia.salas')::uuid, 'Refugio', 5, '(Ejemplo) Vivienda afectada por el deslizamiento. La familia busca dónde pasar la noche.', 'Huaycán, Ate', 'Ate', -12.033, -76.850, 'En atención', now() - interval '3 hours')
  returning id into s3;
  insert into public.solicitudes (usuario_id, tipo_ayuda, numero_personas, detalles, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, creado_en)
  values ((u->>'marco.vega')::uuid, 'Medicamentos', 1, '(Ejemplo) Adulto mayor necesita su medicina para la presión y no puede salir por el aniego.', 'San Juan de Lurigancho', 'San Juan de Lurigancho', -11.977, -77.007, 'Activa', now() - interval '40 minutes');
  insert into public.solicitudes (usuario_id, tipo_ayuda, numero_personas, detalles, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, creado_en)
  values ((u->>'elena.rojas')::uuid, 'Transporte', 2, '(Ejemplo) Necesitan traslado a un centro de salud por la vía alterna.', 'El Agustino', 'El Agustino', -12.042, -77.010, 'En coordinación', now() - interval '90 minutes')
  returning id into s5;
  insert into public.solicitudes (usuario_id, tipo_ayuda, numero_personas, detalles, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, creado_en)
  values ((u->>'paula.cruz')::uuid, 'Alimentos', 3, '(Ejemplo) Familia en albergue necesita leche y pañales para un bebé.', 'Callao', 'Callao', -12.056, -77.118, 'Atendida', now() - interval '1 day')
  returning id into s6;
  insert into public.solicitudes (usuario_id, tipo_ayuda, numero_personas, detalles, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, creado_en)
  values ((u->>'sofia.mendoza')::uuid, 'Otro', 2, '(Ejemplo) Necesitamos manos para limpiar el lodo que entró a la casa.', 'Chaclacayo', 'Chaclacayo', -11.976, -76.772, 'Activa', now() - interval '70 minutes');
  insert into public.solicitudes (usuario_id, tipo_ayuda, numero_personas, detalles, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, creado_en)
  values ((u->>'diego.paredes')::uuid, 'Agua', 8, '(Ejemplo) Dos familias sin agua potable desde la mañana.', 'Lurigancho', 'Lurigancho', -11.943, -76.708, 'En atención', now() - interval '4 hours')
  returning id into s8;
  insert into public.solicitudes (usuario_id, tipo_ayuda, numero_personas, detalles, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, creado_en)
  values ((u->>'lucia.salas')::uuid, 'Alimentos', 25, '(Ejemplo) La olla común del barrio necesita arroz, menestras y aceite.', 'Ate', 'Ate', -12.026, -76.918, 'Activa', now() - interval '5 hours');
  insert into public.solicitudes (usuario_id, tipo_ayuda, numero_personas, detalles, ubicacion_texto, distrito, lat_aprox, lon_aprox, estado, creado_en)
  values ((u->>'elena.rojas')::uuid, 'Refugio', 4, '(Ejemplo) Casa con el techo dañado por la lluvia; buscan un lugar seguro unos días.', 'El Agustino', 'El Agustino', -12.043, -77.012, 'Activa', now() - interval '20 minutes');

  -- ---------- 4. Ofertas de apoyo ----------
  insert into public.ofertas (usuario_id, tipo_apoyo, disponibilidad, distrito, pausada, creado_en) values
    ((u->>'ana.torres')::uuid,    'Voluntariado', 'Hoy · 4:00 p.m. a 8:00 p.m. (ejemplo)',      'Chaclacayo', false, now() - interval '3 hours'),
    ((u->>'carlos.ramos')::uuid,  'Transporte',   'Mañana · camioneta con espacio para 20 cajas (ejemplo)', 'Ate', false, now() - interval '5 hours'),
    ((u->>'rosa.quispe')::uuid,   'Alimentos',    'Hoy · 60 raciones calientes (ejemplo)',        'Lurigancho', false, now() - interval '1 hour'),
    ((u->>'maria.flores')::uuid,  'Voluntariado', 'Esta semana · cuidado de niños en el refugio (ejemplo)', 'Santa Anita', false, now() - interval '1 day'),
    ((u->>'pedro.soto')::uuid,    'Otro',         'Hoy · radios y cargadores portátiles (ejemplo)', 'La Molina', false, now() - interval '6 hours'),
    ((u->>'julia.vargas')::uuid,  'Agua',         'Mañana · 40 bidones de 20 litros (ejemplo)',   'El Agustino', false, now() - interval '2 hours'),
    ((u->>'raul.medina')::uuid,   'Transporte',   'Fines de semana · moto de carga (ejemplo)',    'Villa El Salvador', false, now() - interval '2 days'),
    ((u->>'luis.campos')::uuid,   'Voluntariado', 'Fines de semana · limpieza de lodo (ejemplo)', 'Rímac', true, now() - interval '3 days');

  -- ---------- 5. Apoyos (voluntarios que se comprometieron) y asignaciones ----------
  insert into public.apoyos (solicitud_id, usuario_id) values
    (s2, (u->>'luis.campos')::uuid), (s2, (u->>'julia.vargas')::uuid),
    (s3, (u->>'maria.flores')::uuid), (s3, (u->>'carlos.ramos')::uuid),
    (s5, (u->>'raul.medina')::uuid),
    (s6, (u->>'teresa.leon')::uuid), (s6, (u->>'ana.torres')::uuid),
    (s8, (u->>'rosa.quispe')::uuid), (s8, (u->>'victor.ramirez')::uuid), (s8, (u->>'carmen.diaz')::uuid);

  insert into public.asignaciones (tipo, reporte_id, voluntario_id) values
    ('reporte', r3, (u->>'carlos.ramos')::uuid), ('reporte', r3, (u->>'victor.ramirez')::uuid),
    ('reporte', r5, (u->>'jorge.huaman')::uuid), ('reporte', r5, (u->>'teresa.leon')::uuid),
    ('reporte', r2, (u->>'luis.campos')::uuid);
  insert into public.asignaciones (tipo, solicitud_id, voluntario_id) values
    ('solicitud', s3, (u->>'maria.flores')::uuid),
    ('solicitud', s8, (u->>'rosa.quispe')::uuid),
    ('solicitud', s2, (u->>'julia.vargas')::uuid);

  -- ---------- 6. Comunidad: publicaciones, comentarios y "me gusta" ----------
  insert into public.publicaciones (autor_id, texto, creado_en)
  values ((u->>'ana.torres')::uuid, 'Mañana sábado repartimos desayunos en la losa deportiva de Chaclacayo desde las 8 a.m. ¡Todos son bienvenidos a ayudar! (ejemplo)', now() - interval '2 hours')
  returning id into p1;
  insert into public.publicaciones (autor_id, texto, creado_en)
  values ((u->>'carlos.ramos')::uuid, 'Tengo una camioneta disponible para trasladar víveres a las zonas afectadas. Escríbanme por la app. (ejemplo)', now() - interval '5 hours')
  returning id into p2;
  insert into public.publicaciones (autor_id, texto, creado_en)
  values ((u->>'rosa.quispe')::uuid, 'Recuerden tener lista su mochila de emergencia: agua, linterna, botiquín y copias de sus documentos. (ejemplo)', now() - interval '1 day')
  returning id into p3;
  insert into public.publicaciones (autor_id, texto, creado_en)
  values ((u->>'maria.flores')::uuid, 'Se necesitan frazadas y abrigo para las familias del refugio de Santa Anita. Pueden dejarlas en el colegio parroquial. (ejemplo)', now() - interval '3 hours')
  returning id into p4;
  insert into public.publicaciones (autor_id, texto, creado_en)
  values ((u->>'sofia.mendoza')::uuid, 'Gracias a los vecinos que ayudaron a despejar el lodo de la calle principal. ¡Unidos salimos adelante! (ejemplo)', now() - interval '30 minutes')
  returning id into p5;
  insert into public.publicaciones (autor_id, texto, creado_en)
  values ((u->>'jorge.huaman')::uuid, 'Charla gratuita de primeros auxilios el domingo a las 4 p.m. en la posta de Ate. Cupos limitados. (ejemplo)', now() - interval '2 days')
  returning id into p6;

  insert into public.comentarios (publicacion_id, autor_id, texto, creado_en) values
    (p1, (u->>'sofia.mendoza')::uuid, '¡Cuenten conmigo! Llevo pan y termos.', now() - interval '100 minutes'),
    (p1, (u->>'victor.ramirez')::uuid, 'Yo ayudo a armar las mesas desde las 7.', now() - interval '90 minutes'),
    (p1, (u->>'rosa.quispe')::uuid, 'Puedo llevar una olla grande de avena.', now() - interval '60 minutes'),
    (p2, (u->>'diego.paredes')::uuid, 'Gracias, Carlos. ¿Pueden pasar por el Rímac?', now() - interval '4 hours'),
    (p2, (u->>'carlos.ramos')::uuid, 'Claro, Diego. Te aviso por la app.', now() - interval '3 hours'),
    (p3, (u->>'elena.rojas')::uuid, 'Muy útil. Ya revisé mi mochila hoy.', now() - interval '20 hours'),
    (p4, (u->>'julia.vargas')::uuid, 'Llevo cinco frazadas esta tarde.', now() - interval '2 hours'),
    (p4, (u->>'ana.torres')::uuid, 'Yo llevo ropa de abrigo para niños.', now() - interval '110 minutes'),
    (p5, (u->>'ana.torres')::uuid, '¡Qué bueno! Gracias por avisar.', now() - interval '20 minutes'),
    (p6, (u->>'paula.cruz')::uuid, 'Me inscribo, gracias por organizarlo.', now() - interval '40 hours');

  insert into public.me_gusta (publicacion_id, usuario_id) values
    (p1, (u->>'sofia.mendoza')::uuid), (p1, (u->>'victor.ramirez')::uuid), (p1, (u->>'rosa.quispe')::uuid), (p1, (u->>'elena.rojas')::uuid),
    (p2, (u->>'diego.paredes')::uuid), (p2, (u->>'lucia.salas')::uuid),
    (p3, (u->>'elena.rojas')::uuid), (p3, (u->>'marco.vega')::uuid), (p3, (u->>'ana.torres')::uuid),
    (p4, (u->>'julia.vargas')::uuid), (p4, (u->>'ana.torres')::uuid),
    (p5, (u->>'ana.torres')::uuid), (p5, (u->>'carlos.ramos')::uuid),
    (p6, (u->>'paula.cruz')::uuid);

  -- ---------- 7. Zonas seguras ----------
  insert into public.zonas_seguras (nombre, categoria, descripcion, direccion, distrito, lat, lon, estado, capacidad, horario, ejemplo) values
    ('Losa deportiva Los Cedros (ejemplo)',      'refugio', 'Techada, con baños y agua. Dato de ejemplo, no es un refugio oficial.',                   'Av. Los Cedros s/n',       'Chaclacayo',  -11.97400, -76.77000, 'Activo', 120, 'Abierto 24 horas', true),
    ('Colegio parroquial Santa Rosa (ejemplo)',  'refugio', 'Aulas habilitadas como albergue temporal con apoyo de voluntarios. Dato de ejemplo.',    'Jr. Santa Rosa 120',       'Santa Anita', -12.04300, -76.97100, 'Activo', 200, 'Abierto 24 horas', true),
    ('Estadio municipal (ejemplo)',              'refugio', 'Carpas, alimentos no perecibles y atención médica. Dato de ejemplo.',                    'Av. del Estadio s/n',      'Lima',        -12.04640, -77.04280, 'Lleno',  500, 'Abierto 24 horas', true),
    ('Patio del colegio de Huaycán (ejemplo)',   'refugio', 'Patio y aulas en zona alta y firme. Dato de ejemplo.',                                   'Zona A, Huaycán',          'Ate',         -12.03330, -76.85000, 'Activo', 100, 'Abierto 24 horas', true),
    ('Local comunal de El Agustino (ejemplo)',   'refugio', 'Salón comunal con colchonetas y cocina. Dato de ejemplo.',                               'Jr. Los Pinos 340',        'El Agustino', -12.04200, -77.01000, 'Activo', 80,  'Abierto 24 horas', true),
    ('Colegio estatal de La Molina (ejemplo)',   'refugio', 'Aulas amplias con servicios higiénicos. Dato de ejemplo.',                               'Av. La Fontana s/n',       'La Molina',   -12.08500, -76.90600, 'Activo', 150, 'Abierto 24 horas', true),
    ('Centro de acopio municipal de Ate (ejemplo)','acopio','Recibe víveres no perecibles, agua, abrigo y artículos de higiene. Dato de ejemplo.',    'Av. Central s/n',          'Ate',         -12.02600, -76.91800, 'Activo', null,'8:00 a.m. a 8:00 p.m.', true),
    ('Club deportivo del Rímac (ejemplo)',       'acopio',  'Centro de acopio y reparto de raciones. Dato de ejemplo.',                               'Jr. Chiclayo 200',         'Rímac',       -12.02900, -77.04300, 'Activo', null,'9:00 a.m. a 6:00 p.m.', true),
    ('Parque principal de San Juan de Lurigancho (ejemplo)','reunion','Punto de reunión abierto y amplio, lejos de postes y laderas. Dato de ejemplo.', 'Av. Próceres s/n',  'San Juan de Lurigancho', -11.97700, -77.00700, 'Activo', null, 'Siempre disponible', true),
    ('Plaza de Comas (ejemplo)',                 'reunion', 'Punto de reunión para evacuación del sector. Dato de ejemplo.',                          'Plaza principal',          'Comas',       -11.93900, -77.05000, 'Activo', null, 'Siempre disponible', true),
    ('Losa multiusos de Villa El Salvador (ejemplo)','reunion','Espacio abierto para reunión familiar tras un sismo. Dato de ejemplo.',            'Sector 2, Grupo 5',        'Villa El Salvador', -12.21400, -76.93700, 'Activo', null, 'Siempre disponible', true),
    ('Posta de salud de Chosica (ejemplo)',      'salud',   'Atención de emergencias y primeros auxilios. Dato de ejemplo.',                          'Av. Lima 450',             'Lurigancho',  -11.93700, -76.69800, 'Activo', null, 'Abierto 24 horas', true),
    ('Centro de salud del Callao (ejemplo)',     'salud',   'Atención médica básica y vacunación. Dato de ejemplo.',                                  'Av. Sáenz Peña 500',       'Callao',      -12.05600, -77.11800, 'Activo', null, '7:00 a.m. a 7:00 p.m.', true);

  -- ---------- 8. Notificaciones para las personas reales ya registradas ----------
  insert into public.notificaciones (usuario_id, titulo, detalle, icono, color, ruta, leida, creado_en)
  select p.id, n.titulo, n.detalle, n.icono, n.color, n.ruta, n.leida, now() - n.hace
    from public.perfiles p
   cross join (values
      ('Hay ayuda disponible cerca',   'Un punto de entrega de agua funciona cerca de tu zona. (ejemplo)',                       'fa-box-open',            'bg-sky-600',     'mapa',          false, interval '20 minutes'),
      ('Alerta en tu distrito',        'Se reportó lluvia intensa y posible huayco en zonas altas. Mantente atento. (ejemplo)',  'fa-triangle-exclamation','bg-amber-500',   'mapa',          false, interval '45 minutes'),
      ('Tu comunidad te necesita',     'Hay solicitudes de ayuda cerca de ti. Apoyar a un vecino suma 10 puntos. (ejemplo)',     'fa-hand-holding-heart',  'bg-emerald-600', 'solicitudes',   false, interval '2 hours'),
      ('Nuevos voluntarios en tu zona','Ana Torres (ejemplo) y otros vecinos ya figuran en el directorio de voluntarios.',        'fa-user-plus',           'bg-violet-600',  'comunidad',     true,  interval '5 hours'),
      ('Consejo de prevención',        'Revisa tu mochila de emergencia cada 6 meses: agua, linterna, botiquín y documentos. (ejemplo)', 'fa-bullhorn',   'bg-amber-500',   'asistente',     true,  interval '1 day'),
      ('Nueva zona segura cerca',      'Se habilitó un refugio temporal en tu distrito. Míralo en el mapa. (ejemplo)',            'fa-house-chimney-medical','bg-emerald-600','mapa',         true,  interval '1 day')
   ) as n(titulo, detalle, icono, color, ruta, leida, hace)
   where p.id not in (select id from auth.users where email like '%' || dominio);

  insert into public.notificaciones (usuario_id, titulo, detalle, icono, color, ruta, leida, creado_en)
  select p.id, n.titulo, n.detalle, n.icono, n.color, n.ruta, n.leida, now() - n.hace
    from public.perfiles p
   cross join (values
      ('Emergencias por revisar',      'Hay reportes pendientes en Chaclacayo, Lurigancho y Santa Anita. (ejemplo)',            'fa-triangle-exclamation','bg-red-600',     'emergencias',   false, interval '10 minutes'),
      ('Solicitudes sin voluntarios',  'Dos solicitudes siguen sin voluntarios asignados. Revisa la asignación. (ejemplo)',      'fa-user-plus',           'bg-violet-600',  'asignar',       false, interval '1 hour')
   ) as n(titulo, detalle, icono, color, ruta, leida, hace)
   where p.rol = 'coordinador' and p.id not in (select id from auth.users where email like '%' || dominio);

  raise notice 'Datos de ejemplo cargados: 18 cuentas, 11 reportes, 10 solicitudes, 8 ofertas, 6 publicaciones, 13 zonas seguras.';
end $$;
