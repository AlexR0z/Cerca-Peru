# Perú Vive para Android

Proyecto Android nativo (Kotlin) que muestra la web de Perú Vive dentro de un `WebView`.
La web **no se modifica**: al compilar, Gradle copia `index.html`, `css/`, `js/` e `img/` de la carpeta superior a la app.

## Qué necesitas
- **Android Studio** (versión reciente). Ya incluye el SDK de Android, Gradle y el JDK.
- Un teléfono Android (8.0 o superior) con la depuración USB activada, o un emulador creado desde Android Studio.

## Probar la app (APK de depuración)
1. Abre Android Studio → **Open** → elige esta carpeta `android` (la que contiene `settings.gradle.kts`).
2. Espera a que termine **Gradle Sync**. La primera vez descarga componentes y puede tardar varios minutos.
   Si Android Studio ofrece actualizar versiones, puedes aceptar.
3. Si te pide instalar una plataforma del SDK (Android 16, API 36) o *Build Tools*, acepta.
4. Conecta el teléfono (o inicia un emulador) y pulsa **Run ▶**.
5. APK generado: `app/build/outputs/apk/debug/app-debug.apk` (se puede copiar al teléfono e instalar).

## Publicar en Google Play
1. **Build → Generate Signed App Bundle / APK → Android App Bundle**.
2. Crea una *keystore* nueva y **guárdala en un lugar seguro con su contraseña**: si la pierdes, no podrás actualizar la app.
   Nunca la subas al repositorio (el `.gitignore` ya la excluye).
3. Sube el archivo `.aab` en Google Play Console.

Requisitos de Google Play que ya cumple el proyecto: `targetSdk = 36` (obligatorio desde el 31 de agosto de 2026).
Falta, por tu parte: ficha de la tienda, capturas, política de privacidad (la app puede pedir la ubicación) y clasificación de contenido.

## Cómo funciona
- La web se sirve desde `https://appassets.androidplatform.net/assets/www/index.html` (origen seguro). Así funcionan `localStorage` y la geolocalización.
- Tailwind, Leaflet y Font Awesome están guardados en `app/src/main/assets/offline/` y se sirven desde la app (`RecursosOffline.kt`): **la interfaz se ve completa sin internet**.
- La ubicación solo se pide al tocar "Usar mi ubicación actual" y con el permiso del sistema.
- El botón *Atrás* recorre las pantallas; en Inicio, Presentación o Acceso cierra la app.
- Los números de emergencia (`tel:`) abren el marcador del teléfono.

## Limitaciones conocidas
- **El mapa necesita internet** para los mosaicos (OpenStreetMap). Sin conexión se ven los marcadores sin el fondo del mapa.
  Para un uso intensivo en producción conviene un proveedor de mapas propio o con acuerdo de uso (el servidor público de OpenStreetMap tiene límites).
- **La fuente Inter** (Google Fonts) también necesita internet; sin conexión se usa la fuente del sistema.
- **Los datos son de demostración y se guardan solo en el teléfono** (`localStorage`). Desinstalar la app los borra.
- Las fotos de los reportes se eligen con el selector del sistema, pero siguen sin subirse a ningún servidor (igual que en la web).
- No incluye notificaciones push ni servidor real: sigue siendo el prototipo.
- Si cambias las librerías de `index.html` (versión de Tailwind, Leaflet o Font Awesome), hay que actualizar también las copias de `assets/offline/` y las direcciones de `RecursosOffline.kt`.
- No hay `gradlew` (el script del Gradle Wrapper): ábrelo con Android Studio, que usa la versión indicada en `gradle/wrapper/gradle-wrapper.properties`.
