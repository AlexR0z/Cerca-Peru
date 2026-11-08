# Perú Vive + Supabase (conectar los celulares entre sí)

Hoy cada celular guarda sus datos solo en su memoria. Con Supabase todos leen y escriben en una base de datos central.

## Estado
- ✅ `001-esquema.sql`: base de datos con tablas, roles y reglas de privacidad. **Probado** en un PostgreSQL de pruebas (47 comprobaciones).
- ✅ App conectada: la URL y la clave pública están en `js/config.js`. **Probado contra el proyecto real** (35 comprobaciones por API y 40 por pantalla con dos personas).
- ⚠️ **Si creaste la base antes del 8 de noviembre**, ejecuta también `002-ajustes.sql` (SQL Editor → pegar → Run). Corrige dos cosas: no se podía borrar usuarios que ya habían revisado o asignado casos, y el registro fallaba con correos de una sola letra antes de la `@`. Se puede ejecutar varias veces.
- 🧹 Mientras probamos se crearon usuarios `pv.prueba.…@example.com`. Bórralos en **Authentication → Users** (busca "pv.prueba", marca todos y elimina). Todo lo suyo se borra en cascada.
- ⏳ Falta probar en vivo el panel de **coordinación**: nombra a tu cuenta coordinadora con el `update` del paso 5 y revisa Emergencias, Asignar y Estadísticas.

## Paso a paso (unos 10 minutos)

### 1. Crear el proyecto
1. Entra a https://supabase.com → **Start your project** → inicia sesión (con GitHub o correo).
2. **New project**:
   - Nombre: `peru-vive`
   - Contraseña de la base de datos: invéntala y **guárdala** (no te la pediré).
   - Región: **South America (São Paulo)** (la más cercana a Perú).
   - Plan: **Free**.
3. Espera 1 a 2 minutos a que termine de crearse.

### 2. Crear las tablas
1. Menú izquierdo → **SQL Editor** → **New query**.
2. Abre `001-esquema.sql`, copia **todo** su contenido, pégalo y pulsa **Run**.
3. Debe decir *Success. No rows returned*. Si sale un error, cópialo y pásamelo.

### 3. Activar el ingreso por correo
1. **Authentication → Sign In / Providers** → deja **Email** activado.
2. Para las pruebas, desactiva **Confirm email** (así no dependes de que llegue un correo). Vuélvelo a activar antes de usarlo con personas reales.

### 4. Copiar las dos claves públicas
1. **Project Settings → API Keys** (o el botón **Connect**).
2. Copia:
   - **Project URL** (algo como `https://abcdefgh.supabase.co`)
   - **Publishable key** (empieza con `sb_publishable_…`; en versiones antiguas se llama **anon public**)
3. Pásame esas dos.

> ⚠️ **Nunca compartas** la *secret key* ni la *service_role*: esas sí dan control total de la base de datos.
> La *publishable/anon key* es pública por diseño: la seguridad la dan las reglas del archivo `001-esquema.sql`.

### 5. Nombrar al primer coordinador
Cuando ya te hayas registrado en la app, en **SQL Editor** ejecuta (con tu correo):
```sql
update public.perfiles set rol = 'coordinador'
where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
```
Es la única forma de crear coordinadores: desde la app nadie puede hacerlo.

## Recuperar contraseña con un código enviado al correo

La app ya lo hace (pantallas *Recuperar contraseña → Revisa tu correo → Nueva contraseña*). Para que el correo lleve un **código** y no un enlace, tienes que hacer **una vez** este ajuste en Supabase:

1. **Authentication → Emails → Templates** (en algunas versiones: *Email Templates*) → plantilla **Reset password**.
2. **Subject:** `Tu código de Perú Vive`
3. **Message body** (HTML), reemplaza todo por:
   ```html
   <h2>Recupera tu contraseña</h2>
   <p>Escribe este código en la app de Perú Vive:</p>
   <h1 style="letter-spacing:6px">{{ .Token }}</h1>
   <p>El código vence en 1 hora. Si tú no lo pediste, ignora este correo: tu contraseña no cambiará.</p>
   ```
   Lo importante es `{{ .Token }}`: es el número. Si dejas `{{ .ConfirmationURL }}`, llega un enlace y la app no lo usa.
4. **Save**.

### ⚠️ Límite del correo de Supabase (importante)
El servicio de correo que trae Supabase por defecto **solo envía a los miembros de tu equipo** y **como máximo 2 correos por hora** en todo el proyecto. Sirve para probar con tu propio correo, no para usuarios reales.

- **Para probar ya:** registra en la app una cuenta con **el mismo correo con el que creaste tu cuenta de Supabase**, cierra sesión y usa *¿Olvidaste tu contraseña?*. Máximo 2 pruebas por hora.
- **Para usuarios reales:** conecta un servicio de correo propio en **Authentication → SMTP Settings** (por ejemplo Resend o Brevo; tienen planes gratuitos para poco volumen, revisa sus condiciones). Normalmente piden verificar un dominio o un correo remitente. Con eso desaparecen las dos restricciones.

### Cómo está protegido
- La respuesta es igual exista o no la cuenta: nadie puede averiguar qué correos están registrados.
- Entre un código y otro hay que esperar 60 s (lo exige Supabase; la app muestra la cuenta regresiva).
- Un código incorrecto y uno vencido dan el mismo mensaje.
- La sesión temporal que crea el código se usa solo para cambiar la contraseña, no se guarda en el teléfono y se cierra al terminar. Después hay que iniciar sesión con la contraseña nueva.

## Qué cambia para quien usa la app
- **Se entra con correo y contraseña.** El ingreso por celular necesitaría un servicio de SMS de pago; el celular queda como dato del perfil.
- Los reportes y solicitudes de una persona aparecen en las listas y el mapa de las demás, **sin** su nombre, teléfono ni dirección escrita.
- El rol de coordinador lo decide el servidor. El selector "Probar como…" de Configuración desaparece.

## Lo que garantizan las reglas (ya probado)
| Regla | Cómo se cumple |
|---|---|
| Nadie se hace coordinador solo | Disparador `proteger_rol` |
| Un reporte nuevo siempre nace Pendiente | Política de inserción + permisos por columna |
| Solo coordinación cambia estados y queda quién y cuándo | Políticas RLS + `preparar_cambio` + historial |
| La dirección escrita, el teléfono y la autora no se ven | Vistas públicas sin esas columnas |
| Una solicitud no se duplica ni se cobra dos veces el apoyo | `apoyar_solicitud` con bloqueo de fila |
| Límite de envíos por hora | `limitar_frecuencia` (5 reportes, 10 solicitudes, 15 ofertas) |
| Nadie fabrica notificaciones ajenas | Sin permiso de inserción; solo las crean las funciones |

## Pendiente para más adelante (no es parte de la etapa 1)
- Envío de código por **SMS**.
- Subida de **fotos** (el contenedor `fotos-reportes` ya está creado, falta la parte de la app).
- Reglas de **retención de datos** y política de privacidad (Ley de Protección de Datos Personales del Perú).

## Crear cuenta con código al correo
Hoy "Confirm email" está **desactivado**: la persona crea su cuenta y entra directo. Para exigir un código:
1. Authentication → Sign In / Providers → Email → activa **Confirm email**.
2. Authentication → Email Templates → **Confirm sign up**. Asunto: `Tu código de Perú Vive`. En el cuerpo usa `{{ .Token }}` (el código de 6 dígitos) en lugar del enlace.
3. La app ya soporta los dos modos: con "Confirm email" activado pide el código en la pantalla "Confirma tu correo" (con reenvío); desactivado, entra directo.

Advertencias:
- Con el correo integrado de Supabase solo reciben mensajes los miembros del equipo, con un máximo de 2 por hora. **Deja "Confirm email" desactivado** hasta configurar un SMTP propio (Resend, Brevo u otro; revisa sus condiciones).
- Si el correo ya tiene cuenta, Supabase no lo avisa y el código no llega. La pantalla ofrece "Ya tengo cuenta".
- Quien se registra y no confirma queda con su perfil creado.

## Comentarios, fotos y avisos en la comunidad (archivo 003)
Para que en **Comunidad → Publicaciones** se pueda comentar y subir una foto, y para que la persona reciba un aviso cuando alguien da "me gusta" o comenta su publicación:
1. Supabase → **SQL Editor** → New query.
2. Pega todo el contenido de `supabase/003-comunidad.sql` y pulsa **Run**. Se puede ejecutar más de una vez.

Qué crea:
- Tabla `comentarios` (de 1 a 200 caracteres, máximo 30 por hora por persona) y la vista `comentarios_con_autor`, que solo muestra el nombre visible.
- Columna `foto_ruta` en las publicaciones y el contenedor `fotos-comunidad` (solo JPG, máximo 2 MB, lectura por enlace; cada persona solo puede subir a su propia carpeta). La app reduce la foto a 1000 px antes de subirla.
- Avisos automáticos (disparadores): `me gusta` y comentario avisan a la autora o autor de la publicación, nunca a quien hizo la acción. Si alguien quita y vuelve a poner su "me gusta", el aviso no se repite.

Si no ejecutas el 003, el resto de la app sigue funcionando; solo faltan comentarios, fotos y esos avisos.

Aviso de privacidad: las fotos de la comunidad se pueden abrir con su enlace sin iniciar sesión (los nombres de archivo no se pueden adivinar). No subas fotos de personas sin su permiso.

## Contactar a un voluntario (archivo 004)

1. En Supabase abre **SQL Editor → New query**.
2. Pega todo el contenido de `supabase/004-contactar-voluntario.sql` y pulsa **Run**. Se puede ejecutar más de una vez. Hazlo después del 001, 002 y 003.

Qué hace:
- Cuando un vecino toca **Contactar** en el perfil de un voluntario (y acepta compartir su celular), el voluntario recibe un aviso en sus **Notificaciones**.
- Al abrir el aviso, el voluntario ve el nombre, la zona y el celular de ese vecino, con botones para **escribirle por WhatsApp** o **llamarle**.
- El celular del voluntario nunca se muestra. La tabla `contactos` está cerrada: solo se usa con las funciones `contactar_voluntario` y `ver_contacto`.
- Límites: un aviso por voluntario cada hora y 5 avisos por hora en total. El vecino necesita tener su celular guardado en el perfil.

Si no ejecutas el 004, el botón Contactar muestra un error al enviarse; el resto de la app sigue funcionando.

## Zonas seguras y datos de ejemplo (archivos 005, 006 y 007)

Ejecuta cada archivo en **SQL Editor → New query → pegar todo → Run**, en este orden y después del 004:

1. `005-zonas-seguras.sql`: crea la tabla de zonas seguras (refugios, centros de acopio, puntos de reunión y atención de salud). Todas las personas con sesión las ven en el mapa; solo coordinación las agrega, cambia su estado (Activo, Lleno, Cerrado) o las borra, desde Perfil → Centro de coordinación → Zonas seguras.
2. `006-datos-ejemplo.sql` (opcional): llena la app con datos de ejemplo para verla en acción: 18 cuentas ficticias (12 voluntarios) que no pueden iniciar sesión, 11 reportes, 10 solicitudes, 8 ofertas, 6 publicaciones con comentarios, 13 zonas seguras y notificaciones para las personas ya registradas. Todo lleva «(ejemplo)». Si ya se cargó, volver a ejecutarlo no repite nada.
3. `007-borrar-datos-ejemplo.sql`: borra únicamente lo de ejemplo. Tus cuentas reales y lo que hayan creado no se tocan.

Si no ejecutas el 005, el mapa funciona sin zonas seguras. Los datos de ejemplo no son alertas oficiales ni refugios reales.
