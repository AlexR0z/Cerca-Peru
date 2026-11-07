# Cerca Perú

Red de apoyo y respuesta comunitaria ante emergencias. Prototipo para un piloto en Chaclacayo, Lima (huaicos e inundaciones).

> No es un sistema oficial de alerta ni de despacho. Un reporte ciudadano no equivale a una emergencia verificada.

## Stack

React 18 + TypeScript + Vite · Tailwind CSS · Leaflet + OpenStreetMap · PWA (vite-plugin-pwa) · Supabase (Auth, Postgres, Storage, RLS)

## Ejecutar en local

Requisitos: Node 20 o superior.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de producción
npm run preview    # sirve el build (necesario para probar la PWA y el modo offline)
```

Sin configurar nada, la app arranca en **modo demostración**: los datos ficticios y lo que crees se guardan solo en el navegador. En ese modo, en *Perfil → Herramientas de demostración* puedes cambiar de rol (ciudadano, voluntario, coordinador) para recorrer el guion completo.

## Conectar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor** ejecuta `supabase/migrations/0001_init.sql` y después `supabase/seed.sql`.
3. En **Authentication → Providers** deja habilitado Email (enlace mágico) y añade `http://localhost:5173` y tu URL de despliegue en *URL Configuration*.
4. Copia `.env.example` a `.env.local` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (solo la clave **anon**).
5. Regístrate desde *Perfil*; para volverte coordinador ejecuta el `update` comentado al final de `seed.sql`.

El rol se lee del servidor (`profiles.rol`). Un trigger impide que alguien se cambie el rol, y las políticas RLS hacen cumplir los permisos aunque se manipule el cliente.

## Estructura

```
src/
  pages/        Una pantalla por archivo (Welcome, Home, MapPage, ReportPage, ...)
  components/   Screen (cabecera + navegación), Badges, LocationField
  lib/          store.tsx (estado + cola offline + sync), backend.ts (Supabase), utils.ts
  data/demo.ts  Datos ficticios etiquetados
supabase/       Migraciones SQL con RLS y seed
```

## Cómo se cumplen las reglas del brief

| Regla | Implementación |
|---|---|
| Ubicación aproximada | `approx()` redondea a 3 decimales (~110 m) antes de guardar; columnas `lat_aprox/lon_aprox` |
| Consentimiento de ubicación | Solo se pide al tocar "Usar mi ubicación"; alternativa: marcar en el mapa |
| Reporte no verificado hasta revisión | Estado inicial `Recibido`; el mapa distingue pendiente (borde punteado) y verificado; la política RLS de insert fuerza `Recibido` |
| Verificación con responsable y fecha | Trigger `track_status` guarda `verificado_por/verificado_en`, `status_history` y `audit_logs` |
| Sin doble asignación | Función `accept_request()` con `FOR UPDATE` + índice único parcial |
| Offline honesto | Cola local; estados *Pendiente de envío / Enviado / Error*; reenvío idempotente por `client_id` |
| Datos ficticios | Etiqueta **Demo**; la zona de riesgo se marca como "no oficial" |
| Anti-spam | Trigger `rate_limit` (5 reportes/h, 10 solicitudes/h) |

## Estado de funcionalidades

**Implementado**
- Bienvenida, inicio con 4 acciones, tutorial, navegación inferior responsive
- Reportar emergencia en 3 pasos, solicitar ayuda, ofrecer/retirar ayuda
- Mapa con 3 capas, leyenda, filtros y vista de lista
- Solicitudes cercanas con aceptación, comunidad con botón de reportar abuso, perfil
- Centro de coordinación por rol: indicadores, cambio de estado y prioridad, notas, historial y auditoría
- PWA instalable, caché de la app y de teselas vistas, cola offline con sincronización
- Esquema SQL, RLS, triggers, bucket de fotos, vistas públicas sin datos personales

## Limitaciones conocidas (siguientes pasos)

1. **Lectura desde Supabase**: hoy la app *escribe* en Supabase (reportes, solicitudes, ofertas) pero las listas se leen del estado local. Falta cargar los datos del servidor, usar `accept_request` por RPC y las vistas `public_reports` / `volunteer_directory`.
2. **Fotos**: se validan tipo y tamaño y se muestra vista previa, pero aún no se suben al bucket `report-photos`.
3. **Notificaciones internas** y **asignación manual por el coordinador**: solo existen las tablas, falta la interfaz.
4. **Zonas de riesgo**: es un polígono ficticio. Hay que cargar fuentes oficiales (INDECI, CENEPRED, municipalidad) antes de cualquier uso real.
5. **Rol en modo demo**: el selector de rol es solo para demostrar; no es seguridad.
6. Sin pruebas automatizadas. Pendiente: pruebas manuales de pérdida y recuperación de conexión (DevTools → Network → Offline).
7. Pendientes del brief (sección 16): coordinadores autorizados, validación con vecinos, política de datos personales y revisión legal.

## Probar el modo sin conexión

1. `npm run build && npm run preview` y abre la app una vez con internet.
2. DevTools → Network → Offline. Crea un reporte: queda *Pendiente de envío*.
3. Vuelve a Online: se envía solo y pasa a *Enviado*.
