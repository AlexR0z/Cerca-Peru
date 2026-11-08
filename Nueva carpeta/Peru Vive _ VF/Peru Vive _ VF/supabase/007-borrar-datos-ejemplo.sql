-- =====================================================================================
-- Perú Vive · Borrar los datos de ejemplo cargados con 006-datos-ejemplo.sql
-- Supabase → SQL Editor → New query → pegar todo → Run. Se puede ejecutar varias veces.
--
-- Qué borra (y nada más):
--   · Las 18 cuentas ficticias "…@ejemplo.peruvive.invalid" y, con ellas, todo lo que crearon:
--     reportes, solicitudes, ofertas, apoyos, asignaciones, publicaciones, comentarios y "me gusta".
--   · Las zonas seguras marcadas como ejemplo.
--   · Las notificaciones de ejemplo que recibieron las personas reales (llevan "(ejemplo)" en el texto).
-- Tus cuentas reales y todo lo que hayan creado NO se tocan.
-- =====================================================================================

delete from public.notificaciones where detalle like '%(ejemplo)%';
delete from public.zonas_seguras where ejemplo;
delete from auth.users where email like '%@ejemplo.peruvive.invalid';
