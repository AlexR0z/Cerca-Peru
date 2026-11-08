package pe.peruvive.app

import android.content.Context
import android.webkit.WebResourceResponse
import java.io.IOException

/**
 * Sirve desde la propia app las librerías externas que usa la web (Tailwind, Leaflet y Font Awesome).
 * Así la interfaz se ve igual aunque no haya internet, sin modificar la web.
 *
 * Las copias están en src/main/assets/offline/. Cada archivo debe ser exactamente el mismo
 * que publica el CDN (la web verifica la integridad de Leaflet con SRI).
 */
object RecursosOffline {

    private data class Recurso(val ruta: String, val tipo: String)

    private const val TAILWIND = "https://cdn.tailwindcss.com/"
    private const val LEAFLET = "https://unpkg.com/leaflet@1.9.4/dist/"
    private const val FA = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/"

    private val fijos = mapOf(
        TAILWIND to Recurso("offline/tailwind.js", "text/javascript"),
        LEAFLET + "leaflet.js" to Recurso("offline/leaflet/leaflet.js", "text/javascript"),
        LEAFLET + "leaflet.css" to Recurso("offline/leaflet/leaflet.css", "text/css"),
        FA + "css/all.min.css" to Recurso("offline/fontawesome/css/all.min.css", "text/css")
    )

    /** Devuelve la respuesta guardada en la app, o null si esa dirección no está incluida. */
    fun buscar(contexto: Context, direccion: String): WebResourceResponse? {
        val clave = direccion.substringBefore('#').substringBefore('?').let {
            // "https://cdn.tailwindcss.com" (sin barra final) equivale a ".../"
            if (it == TAILWIND.trimEnd('/')) TAILWIND else it
        }

        val recurso = fijos[clave] ?: when {
            clave.startsWith(FA + "webfonts/") ->
                clave.substringAfterLast('/').let { Recurso("offline/fontawesome/webfonts/$it", tipoPorExtension(it)) }
            clave.startsWith(LEAFLET + "images/") ->
                clave.substringAfterLast('/').let { Recurso("offline/leaflet/images/$it", tipoPorExtension(it)) }
            else -> return null
        }

        return try {
            val flujo = contexto.assets.open(recurso.ruta)
            val esTexto = recurso.tipo.startsWith("text/")
            WebResourceResponse(
                recurso.tipo,
                if (esTexto) "utf-8" else null,
                200,
                "OK",
                // Las etiquetas con crossorigin (Leaflet, fuentes) exigen esta cabecera.
                mapOf("Access-Control-Allow-Origin" to "*", "Cache-Control" to "max-age=86400"),
                flujo
            )
        } catch (e: IOException) {
            null // Si el archivo no está en la app, la solicitud sigue por internet.
        }
    }

    private fun tipoPorExtension(nombre: String): String = when (nombre.substringAfterLast('.').lowercase()) {
        "woff2" -> "font/woff2"
        "woff" -> "font/woff"
        "ttf" -> "font/ttf"
        "png" -> "image/png"
        "css" -> "text/css"
        "js" -> "text/javascript"
        else -> "application/octet-stream"
    }
}
