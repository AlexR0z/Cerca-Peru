-- OBSOLETO: este archivo es del esquema anterior de Cerca Perú y YA NO SE USA. No lo ejecutes.
-- La app web usa la misma base de datos que la app móvil de Perú Vive (carpeta supabase/ de Perú Vive: 001, 002 y 003).

-- DATOS FICTICIOS DE DEMOSTRACIÓN. No son información oficial.
insert into public.risk_areas (nombre, tipo, geometry, fuente, fecha_fuente, es_oficial) values
('Quebrada de ejemplo (referencia orientativa)', 'Quebrada',
 '{"type":"Polygon","coordinates":[[[-76.7745,-11.9745],[-76.7728,-11.9772],[-76.7695,-11.9803],[-76.7655,-11.9835],[-76.7640,-11.9822],[-76.7676,-11.9788],[-76.7710,-11.9758],[-76.7728,-11.9732],[-76.7745,-11.9745]]]}',
 'DEMO — dato ficticio, no oficial', '2026-11-06', false);

-- Para crear un coordinador de prueba: regístrate en la app y luego ejecuta (reemplaza el correo):
-- update public.profiles set rol = 'coordinador'
--   where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
