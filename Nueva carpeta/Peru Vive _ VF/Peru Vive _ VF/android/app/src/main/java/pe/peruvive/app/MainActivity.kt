package pe.peruvive.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Color
import android.location.Location
import android.location.LocationManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.webkit.GeolocationPermissions
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.LinearLayout
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.webkit.WebViewAssetLoader

/**
 * Pantalla única de Perú Vive: muestra la web (carpeta www/ de los assets) dentro de un WebView.
 *
 * La web se sirve desde https://appassets.androidplatform.net/ para tener un origen seguro real:
 * así funcionan localStorage, la geolocalización y los permisos igual que en un navegador.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var cargadorAssets: WebViewAssetLoader

    private var selectorArchivos: ValueCallback<Array<Uri>>? = null
    private var permisoUbicacionPendiente: Pair<String, GeolocationPermissions.Callback>? = null

    private val pedirUbicacion =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { resultado ->
            val concedido = resultado.values.any { it }
            if (concedido) avisarSiUbicacionApagada()
            permisoUbicacionPendiente?.let { (origen, respuesta) -> respuesta.invoke(origen, concedido, false) }
            permisoUbicacionPendiente = null
        }

    /**
     * Puente para la web (window.AndroidUbicacion): le da la última ubicación que el teléfono tiene guardada.
     * Es el respaldo cuando el navegador interno no consigue una posición nueva, por ejemplo si el permiso
     * es solo "aproximado" o el GPS está dormido. Solo responde si la persona ya dio el permiso de ubicación.
     */
    inner class PuenteUbicacion {
        /** Devuelve "latitud,longitud,milisegundosDeAntigüedad", o "" si no hay permiso o ninguna posición guardada. */
        @JavascriptInterface
        fun ultimaPosicion(): String {
            val conPermiso = arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION).any {
                ContextCompat.checkSelfPermission(this@MainActivity, it) == PackageManager.PERMISSION_GRANTED
            }
            if (!conPermiso) return ""
            val administrador = this@MainActivity.getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return ""
            var mejor: Location? = null
            for (proveedor in administrador.allProviders) {
                val posicion = try {
                    administrador.getLastKnownLocation(proveedor)
                } catch (e: SecurityException) {
                    null
                } ?: continue
                if (mejor == null || posicion.time > mejor.time) mejor = posicion
            }
            val elegida = mejor ?: return ""
            return "${elegida.latitude},${elegida.longitude},${System.currentTimeMillis() - elegida.time}"
        }
    }

    /**
     * Tener el permiso no basta: si la ubicación (GPS) del teléfono está apagada, la web no recibe ninguna posición.
     * Se avisa con un mensaje para que la persona la active en vez de quedarse esperando.
     */
    private fun avisarSiUbicacionApagada() {
        val administrador = getSystemService(LOCATION_SERVICE) as? LocationManager ?: return
        val activada = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            administrador.isLocationEnabled
        } else {
            administrador.isProviderEnabled(LocationManager.GPS_PROVIDER) ||
                administrador.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
        }
        if (!activada) {
            Toast.makeText(this, "Activa la ubicación (GPS) del teléfono para que Perú Vive pueda ubicarte.", Toast.LENGTH_LONG).show()
        }
    }

    private val elegirArchivo =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { resultado ->
            val uris = WebChromeClient.FileChooserParams.parseResult(resultado.resultCode, resultado.data)
            selectorArchivos?.onReceiveValue(uris)
            selectorArchivos = null
        }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        WindowCompat.setDecorFitsSystemWindows(window, false)

        cargadorAssets = WebViewAssetLoader.Builder()
            .setDomain(DOMINIO)
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        // Diseño: barra de estado roja + web + zona inferior blanca (barra de navegación o teclado).
        val barraEstado = View(this).apply { setBackgroundColor(ContextCompat.getColor(context, R.color.peru_rojo)) }
        val barraInferior = View(this).apply { setBackgroundColor(Color.WHITE) }
        webView = WebView(this).apply { setBackgroundColor(Color.WHITE) }

        val raiz = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.WHITE)
            addView(barraEstado, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0))
            addView(webView, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f))
            addView(barraInferior, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0))
        }
        setContentView(raiz)

        ViewCompat.setOnApplyWindowInsetsListener(raiz) { _, insets ->
            val barras = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val teclado = insets.getInsets(WindowInsetsCompat.Type.ime())
            barraEstado.layoutParams.height = barras.top
            barraInferior.layoutParams.height = maxOf(barras.bottom, teclado.bottom)
            barraEstado.requestLayout()
            barraInferior.requestLayout()
            WindowInsetsCompat.CONSUMED
        }

        // Íconos claros sobre la barra roja; íconos oscuros sobre la zona inferior blanca.
        WindowCompat.getInsetsController(window, raiz).apply {
            isAppearanceLightStatusBars = false
            isAppearanceLightNavigationBars = true
        }

        configurarWebView()
        configurarBotonAtras()

        if (savedInstanceState != null) webView.restoreState(savedInstanceState) else webView.loadUrl(URL_INICIAL)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configurarWebView() {
        WebView.setWebContentsDebuggingEnabled(applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE != 0)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true // localStorage: aquí se guardan reportes, solicitudes y sesión
            setGeolocationEnabled(true)
            allowFileAccess = false
            allowContentAccess = false
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            cacheMode = WebSettings.LOAD_DEFAULT
        }

        webView.addJavascriptInterface(PuenteUbicacion(), "AndroidUbicacion")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
                // 1) Archivos de la propia app  2) Librerías guardadas para uso sin conexión
                return cargadorAssets.shouldInterceptRequest(request.url)
                    ?: RecursosOffline.buscar(this@MainActivity, request.url.toString())
            }

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val destino = request.url
                if (destino.scheme == "https" && destino.host == DOMINIO) return false // navegación interna
                abrirFuera(destino)
                return true
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(origin: String, callback: GeolocationPermissions.Callback) {
                // Solo la propia app puede pedir la ubicación.
                if (!origin.startsWith("https://$DOMINIO")) {
                    callback.invoke(origin, false, false)
                    return
                }
                val permisos = arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
                val yaConcedido = permisos.any {
                    ContextCompat.checkSelfPermission(this@MainActivity, it) == PackageManager.PERMISSION_GRANTED
                }
                if (yaConcedido) {
                    avisarSiUbicacionApagada()
                    callback.invoke(origin, true, false)
                } else {
                    permisoUbicacionPendiente = origin to callback
                    pedirUbicacion.launch(permisos)
                }
            }

            // Foto del reporte: <input type="file" accept="image/*">
            override fun onShowFileChooser(
                webView: WebView,
                filePathCallback: ValueCallback<Array<Uri>>,
                fileChooserParams: FileChooserParams
            ): Boolean {
                selectorArchivos?.onReceiveValue(null)
                selectorArchivos = filePathCallback
                return try {
                    elegirArchivo.launch(fileChooserParams.createIntent())
                    true
                } catch (e: ActivityNotFoundException) {
                    selectorArchivos = null
                    filePathCallback.onReceiveValue(null)
                    false
                }
            }
        }
    }

    /** Atrás recorre el historial de la web; en las pantallas raíz cierra la app. */
    private fun configurarBotonAtras() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                val ruta = webView.url?.substringAfter('#', "").orEmpty()
                val esRaiz = RUTAS_RAIZ.any { ruta.startsWith(it) }
                if (webView.canGoBack() && !esRaiz) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    /** Enlaces externos (llamadas, correos, páginas web) se abren en la app correspondiente. */
    private fun abrirFuera(destino: Uri) {
        if (destino.scheme !in setOf("https", "http", "tel", "mailto")) return
        try {
            startActivity(Intent(Intent.ACTION_VIEW, destino))
        } catch (e: ActivityNotFoundException) {
            // No hay app que pueda abrirlo: no se hace nada.
        }
    }

    override fun onSaveInstanceState(salida: Bundle) {
        super.onSaveInstanceState(salida)
        webView.saveState(salida)
    }

    override fun onDestroy() {
        selectorArchivos?.onReceiveValue(null)
        selectorArchivos = null
        (webView.parent as? ViewGroup)?.removeView(webView)
        webView.destroy()
        super.onDestroy()
    }

    companion object {
        private const val DOMINIO = "appassets.androidplatform.net"
        private const val URL_INICIAL = "https://$DOMINIO/assets/www/index.html"
        private val RUTAS_RAIZ = listOf("/inicio", "/splash", "/acceso")
    }
}
