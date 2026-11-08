# Instrucciones para Agentes (AGENTS.md) - Perú Vive (Panel del Ciudadano)

## Resumen Básico
Este proyecto es una plataforma de apoyo comunitario, prevención y respuesta ante emergencias denominada **Perú Vive**. El foco actual es el desarrollo e implementación integral del **Panel del Ciudadano** (pantallas 11 a 21), permitiendo a los usuarios visualizar alertas en mapa, reportar emergencias en tiempo real, solicitar ayuda humanitaria y ofrecer voluntariado o recursos.

## Stack y Estructura
- **Arquitectura:** Aplicación web/móvil ligera sin paso de build ni compilación previa.
- **Tecnologías:** HTML5, CSS3 / Tailwind CSS (vía CDN), JavaScript vanilla (ES6+).
- **Estructura de Directorios:**
  ├── index.html           # Punto de entrada / Router simple
  ├── css/                 # Estilos personalizados y utilidades
  ├── js/
  │   ├── app.js           # Lógica principal y enrutamiento
  │   ├── data.js          # Manejo de estado y LocalStorage
  │   └── components/      # Módulos por vista (Reportar, Solicitar, Ofrecer)
  ├── AGENTS.md            # Reglas y directrices de desarrollo
  └── MEMORY.md            # Registro de estado, decisiones y progreso

## Convenciones
- **Idioma:** Todo el código, comentarios, interfaz de usuario y documentación deben estar estrictamente en **Español**.
- **Nomenclatura:** 
  - Archivos: `kebab-case` (ej. `reportar-emergencia.js`).
  - Variables/Funciones: `camelCase` (ej. `crearReporte()`, `ubicacionActual`).
  - Clases CSS: `kebab-case` o clases utilitarias de Tailwind.
- **Semántica:** Mantener una UI limpia, accesible, responsiva y con la paleta visual distintiva (Rojo/Blanco institucional, acentos de alerta en amarillo/rojo).

## Datos
- **Almacenamiento:** Uso de `localStorage` para persistencia local de sesión de usuario, reportes creados, solicitudes activas e historial.
- **Estructura de Objetos:**
  - `Reporte`: `{ id, tipo, descripcion, fotoUrl, ubicacion, fecha, estado }`
  - `Solicitud`: `{ id, tipoAyuda, numeroPersonas, detalles, ubicacion, fecha, estado }`
  - `OfertaAyuda`: `{ id, tipoApoyo, disponibilidad, contacto, fecha }`

## Forma de Trabajar
1. Trabajar vista por vista garantizando que la navegación entre pantallas fluya de forma modular.
2. Mantener la lógica de negocio aislada del renderizado DOM.
3. Asegurar que las interacciones del prototipo (botones de navegación, modales, confirmaciones) sean plenamente funcionales.

## Memoria
- Es obligatorio actualizar el archivo `MEMORY.md` al concluir cada tarea o módulo implementado.

## Límites
- ✅ **Siempre:** Respetar las reglas de fechas, Rachas/Historial y mantener todos los textos en español.
- ✅ **Siempre:** Actualizar `MEMORY.md` al terminar cada tarea.
- ⚠️ **Pregunta antes:** Crear archivos nuevos o cambiar el formato de los datos guardados.
- 🚫 **Nunca:** Añadir dependencias externos, frameworks adicionales o incluir un paso de build (npm build, bundlers, etc.).

## Verificación
- Validar la respuesta del diseño responsivo en móviles (360px - 430px).
- Probar el flujo completo: Inicio $\rightarrow$ Formulario de reporte $\rightarrow$ Confirmación $\rightarrow$ Actualización en Mapa/Historial.
- Verificar la correcta lectura y escritura de datos en `localStorage`.