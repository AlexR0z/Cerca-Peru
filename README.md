# Cerca Perú · app web

Versión web (React) de la red de apoyo comunitario en emergencias. **Usa la misma cuenta y la misma base de datos Supabase que la app móvil de Perú Vive (Android)**: quien se registra en una entra en la otra, y los reportes, solicitudes, ofertas, publicaciones, comentarios y avisos se ven en las dos.

> No es un sistema oficial de alerta ni de despacho. Un reporte ciudadano no equivale a una emergencia verificada.

## Stack

React 18 + TypeScript + Vite · Tailwind CSS · Leaflet + OpenStreetMap · PWA (vite-plugin-pwa) · Supabase (Auth, Postgres, Storage, RLS)

## Ejecutar en local

Requisitos: Node 20 o superior.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # typecheck + build de producción (carpeta dist/)
npm run preview      # sirve el build (para probar la PWA y el modo sin conexión)
npm run build:web    # build para el tablero de pantallas (ver abajo)
```

## Conectar con la base de datos de Perú Vive

1. Copia `.env.example` como `.env` (ya trae la URL y la clave pública del proyecto de Perú Vive) y reinicia `npm run dev`.
2. En Supabase deben estar ejecutados los archivos de `Nueva carpeta/Peru Vive _ VF/Peru Vive _ VF/supabase/`: `001-esquema.sql`, `002-ajustes.sql` y `003-comunidad.sql` (comentarios, fotos y avisos de la comunidad). Esta app **no tiene SQL propio**.
3. Sin `.env` (o con los valores vacíos) la app arranca en **modo demostración**: datos ficticios guardados solo en el navegador.

Las claves son públicas por diseño. La seguridad la imponen las reglas RLS de la base de datos, no esta app. Nunca pongas la `service_role`.

### Cuentas y códigos por correo

Se entra con correo y contraseña. Confirmar la cuenta y recuperar la contraseña usan un **código de 6 dígitos** que llega al correo. Para que llegue el código (y no un enlace), en Supabase → Authentication → Emails las plantillas "Confirm sign up" y "Reset password" deben usar `{{ .Token }}`, y para escribir a cualquier persona hace falta un SMTP propio (ver `supabase/LEEME.md` de Perú Vive).

### Coordinación

El rol de coordinador no se puede pedir desde la app. Lo nombra el equipo desde el SQL Editor:

```sql
update public.perfiles set rol = 'coordinador'
where id = (select id from auth.users where email = 'correo@ejemplo.com');
```

## Qué hace

| Pantalla | Con la cuenta real |
|---|---|
| Acceso | Iniciar sesión, crear cuenta, código por correo, recuperar contraseña |
| Inicio | Saludo, zona y puntos, accesos principales, avisos nuevos |
| Mapa | Reportes (con punto del GPS o del distrito), recursos y zonas de riesgo; parte en la zona de la persona |
| Reportar | Tipo, descripción, foto opcional (se sube al contenedor privado), punto en el mapa y referencia; el distrito se sugiere con el GPS |
| Necesito ayuda / Ofrecer ayuda | Se guardan en el servidor; la dirección escrita solo la ven quien la escribe y la coordinación |
| Solicitudes | Apoyar una solicitud (RPC `apoyar_solicitud`, +10 puntos), cancelar la propia, ver las de la zona |
| Comunidad | Voluntarios, recursos y publicaciones con foto, me gusta, comentarios y borrar lo propio |
| Avisos | Cambios de estado y me gusta o comentarios (los crea el servidor) |
| Coordinación | Indicadores, estado y prioridad de reportes, estado de solicitudes, asignar voluntarios (RPC `asignar_voluntarios`) e historial |
| Perfil | Nombre visible, ubicación (25 departamentos, 196 provincias y 1 874 distritos, o por GPS) y voluntariado |

Sin conexión, los reportes, solicitudes y ofertas quedan **pendientes de envío** en el dispositivo y se mandan solos al volver internet (sin duplicados, por `client_id`). Nunca se muestra "Enviado" si no llegó.

## Tablero de pantallas (presentación)

`Nueva carpeta/Peru Vive _ VF/Peru Vive _ VF/tablero.html` tiene dos botones: **App móvil** (Android) y **App web** (esta app). Para que el segundo muestre las pantallas hay que compilar esta app dentro de esa carpeta:

```bash
npm run build:web     # genera Nueva carpeta/.../web/
```

Las vistas previas abren la app con `#/ruta?embed=1`: ahí siempre se usan datos de demostración, sin iniciar sesión ni tocar el servidor, y se muestran también los paneles de coordinación. La app usa `HashRouter`, así que funciona desde cualquier carpeta o servidor estático.

## Estructura

```
src/
  pages/        Una pantalla por archivo
  components/   Screen (cabecera y navegación), ZonePicker, LocationField, Badges
  lib/          store.tsx (estado, cola sin conexión, sincronización cada 20 s)
                cloud.ts (todas las consultas a Supabase), auth.ts (cuentas), geo.ts (ubigeo y GPS)
  data/         demo.ts (datos ficticios) y ubigeo.ts (lista oficial INEI 2016, generada)
```

## Cómo se cumplen las reglas del brief

| Regla | Implementación |
|---|---|
| Ubicación aproximada | Se redondea a 3 decimales (≈110 m) antes de guardar; el mapa público nunca muestra la dirección escrita |
| Consentimiento de ubicación | Solo se pide al tocar "Usar mi ubicación"; alternativa: marcar en el mapa o elegir en las listas |
| Reporte no verificado hasta revisión | Nace "Pendiente" (lo fuerza la política RLS); solo coordinación cambia el estado |
| Sin doble apoyo | La función del servidor bloquea la fila y no deja apoyar dos veces ni la propia solicitud |
| Offline honesto | Cola local con estados *Pendiente de envío / Enviado / Error* |
| Datos ficticios | Etiqueta **Demo** y zona de riesgo marcada "no oficial" |
| Anti-spam | Límites por hora en el servidor (reportes, solicitudes, ofertas y comentarios) |

## Limitaciones conocidas

1. Las ofertas no tienen un campo de descripción en la base compartida: el detalle se guarda dentro de `disponibilidad` ("Hoy — 10 cajas de agua", máximo 120 caracteres).
2. La prioridad solo existe en los reportes (`nivel`). Las solicitudes no la tienen.
3. Los distritos creados después de 2016 todavía no están en la lista.
4. Las zonas de riesgo del mapa son un polígono ficticio. Hay que cargar fuentes oficiales (INDECI, CENEPRED, municipalidad) antes de cualquier uso real.
5. Las fotos de la comunidad son visibles con su enlace (nombres imposibles de adivinar); las de los reportes son privadas.
6. Verificado con un servidor Supabase simulado en el navegador (Edge) y con las pruebas de la base en PGlite; **falta una prueba de punta a punta contra el Supabase real** y en un teléfono físico.
7. Pendientes del brief: coordinadores autorizados, validación con vecinos, política de datos personales y revisión legal.

## Archivos antiguos

`supabase/migrations/0001_init.sql` y `supabase/seed.sql` son del esquema anterior de Cerca Perú y **ya no se usan**. No los ejecutes: crearían tablas distintas a las de la app móvil.
