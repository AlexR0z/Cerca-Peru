/**
 * Conexión de Perú Vive con Supabase (la "nube" que une a todos los celulares).
 *
 * Estas dos claves son PÚBLICAS por diseño: la seguridad la imponen las reglas de la base de datos
 * (supabase/001-esquema.sql). NUNCA pongas aquí la "secret key" ni la "service_role".
 *
 * Para volver al modo local de demostración (sin nube), deja url y clave vacías ('').
 * El tablero de presentación (tablero.html) siempre usa datos de demostración.
 */
const CONFIG_NUBE = {
    url: 'https://mqebvbpyrueyrzplimyj.supabase.co',
    clave: 'sb_publishable_3IUCK5LwM1kvextJtw0Hfg_AvN6cOoS'
};

// true = datos compartidos en la nube · false = datos de demostración guardados solo en este dispositivo
// El tablero abre las pantallas con "embed=1" (en la parte ?... o en la parte #...): ahí siempre hay datos de demostración.
const MODO_PRESENTACION = /[?&]embed=1(?=$|[&#])/.test(location.search + location.hash);
const MODO_NUBE = Boolean(CONFIG_NUBE.url && CONFIG_NUBE.clave) && !MODO_PRESENTACION;
