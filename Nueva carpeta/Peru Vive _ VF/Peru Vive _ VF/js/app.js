/**
 * Lógica principal y enrutador para Perú Vive.
 *
 * - Rutas por hash:  index.html#/ruta?id=ABC   (permite abrir cualquier pantalla directamente).
 * - Modo incrustado: index.html?embed=1#/ruta  (lo usa tablero.html; no exige iniciar sesión
 *   ni modifica la sesión guardada, y trata al usuario como coordinador para mostrar el panel).
 * - Cada ruta es una entrada de la tabla RUTAS:
 *     auth    → pantalla sin cabecera ni barra inferior (acceso, perfil inicial, tutorial)
 *     publica → se puede ver sin sesión
 *     rol     → 'coordinador' exige ese rol
 *     nav     → pestaña de la barra inferior que se resalta
 *     vista   → devuelve el HTML;  montar → conecta eventos después de insertarlo
 *     flujo   → componentes que se dibujan solos (reportar, solicitar, ofrecer)
 */

/** Prepara un flujo de varios pasos en un paso concreto, con datos de ejemplo si faltan. */
const _flujoEn = (componente, paso, preparar) => () => {
    componente.iniciar();
    if (preparar) preparar();
    componente.pasoActual = paso;
    componente.renderizarPaso();
};

const RUTAS = {
    /* ===== 1. Inicio y acceso (01 a 10) ===== */
    'splash':           { auth: true, publica: true, vista: () => AccesoComponent.renderPresentacion() },
    'acceso':           { auth: true, publica: true, vista: () => AccesoComponent.renderAcceso() },
    'login':            { auth: true, publica: true, vista: () => AccesoComponent.renderLogin(), montar: () => AccesoComponent.montarLogin() },
    'registro':         { auth: true, publica: true, vista: () => AccesoComponent.renderRegistro(), montar: () => AccesoComponent.montarRegistro() },
    'verificar':        { auth: true, publica: true, vista: () => AccesoComponent.renderVerificar(), montar: () => AccesoComponent.montarVerificar() },
    'recuperar':        { auth: true, publica: true, vista: () => AccesoComponent.renderRecuperar(), montar: () => AccesoComponent.montarRecuperar() },
    'codigo-recuperacion': { auth: true, publica: true, vista: () => AccesoComponent.renderCodigoRecuperacion(), montar: () => AccesoComponent.montarCodigoRecuperacion() },
    'codigo-registro':  { auth: true, publica: true, vista: () => AccesoComponent.renderCodigoRegistro(), montar: () => AccesoComponent.montarCodigoRegistro() },
    'nueva-clave':      { auth: true, publica: true, vista: () => AccesoComponent.renderNuevaClave(), montar: () => AccesoComponent.montarNuevaClave() },
    'completar-perfil': { auth: true, vista: () => PerfilInicialComponent.renderCompletarPerfil(), montar: () => PerfilInicialComponent.montarCompletarPerfil() },
    'ubicacion':        { auth: true, vista: (p) => PerfilInicialComponent.renderUbicacion(p), montar: () => PerfilInicialComponent.montarUbicacion() },
    'tutorial':         { auth: true, vista: () => PerfilInicialComponent.renderTutorial(), montar: () => PerfilInicialComponent.montarTutorial() },

    /* ===== 2. Panel del ciudadano (11 a 21) ===== */
    'inicio':           { nav: 'inicio', vista: () => InicioComponent.render() },
    // Solo para el tablero de pantallas: el Inicio con la guía de primer uso abierta en un paso (?paso=N)
    'guia':             { nav: 'inicio', vista: () => InicioComponent.render(), montar: (p) => GuiaComponent.iniciar(Number(p.paso) || 0) },
    'mapa':             { nav: 'mapa', vista: () => MapaSolidarioComponent.render() },
    'reportar':         { nav: 'reportar', flujo: () => ReportarEmergenciaComponent.iniciar() },
    'reportar-tipo':    { nav: 'reportar', flujo: _flujoEn(ReportarEmergenciaComponent, 2) },
    'reportar-descripcion': { nav: 'reportar', flujo: _flujoEn(ReportarEmergenciaComponent, 3, () => { ReportarEmergenciaComponent.datosReporte.tipo = 'Huayco'; }) },
    'reportar-ubicacion':   { nav: 'reportar', flujo: _flujoEn(ReportarEmergenciaComponent, 4, () => {
        Object.assign(ReportarEmergenciaComponent.datosReporte, { tipo: 'Huayco', descripcion: 'Caída de lodo y piedras sobre la vía principal.' });
    }) },
    'reportar-confirmacion': { nav: 'reportar', flujo: () => {
        ReportarEmergenciaComponent.iniciar();
        ReportarEmergenciaComponent.pasoActual = 5;
        document.getElementById('router-view').innerHTML = ReportarEmergenciaComponent.renderPantalla17(db.obtenerReportes()[0]);
    } },
    'ayuda':            { nav: 'inicio', flujo: () => SolicitarAyudaComponent.iniciar() },
    'ayuda-detalle':    { nav: 'inicio', flujo: _flujoEn(SolicitarAyudaComponent, 2, () => {
        Object.assign(SolicitarAyudaComponent.datosSolicitud, { tipoAyuda: 'Alimentos', numeroPersonas: 4, detalles: 'Familia con niños pequeños sin víveres.' });
    }) },
    'ofrecer':          { nav: 'inicio', flujo: () => OfrecerAyudaComponent.iniciar() },
    'ofrecer-disponibilidad': { nav: 'inicio', flujo: _flujoEn(OfrecerAyudaComponent, 2, () => { OfrecerAyudaComponent.datosOferta.tipoApoyo = 'Alimentos'; }) },

    /* ===== 3. Comunidad y seguimiento (22 a 30) ===== */
    'solicitudes':      { nav: 'comunidad', sub: 'Comunidad y Seguimiento', vista: () => SolicitudesComponent.renderCercanas() },
    'solicitud-detalle':{ nav: 'comunidad', sub: 'Comunidad y Seguimiento', vista: (p) => SolicitudesComponent.renderDetalle(p), montar: (p) => SolicitudesComponent.montarDetalle(p) },
    'seguimiento':      { nav: 'comunidad', sub: 'Comunidad y Seguimiento', vista: (p) => SolicitudesComponent.renderSeguimiento(p) },
    'historial':        { nav: 'comunidad', sub: 'Comunidad y Seguimiento', vista: () => SolicitudesComponent.renderHistorial() },
    'comunidad':        { nav: 'comunidad', sub: 'Comunidad y Seguimiento', vista: (p) => ComunidadComponent.renderComunidad(p), montar: (p) => ComunidadComponent.montarComunidad(p) },
    'contacto':         { nav: 'comunidad', sub: 'Comunidad y Seguimiento', vista: () => ComunidadComponent.renderContacto(), montar: (p) => ComunidadComponent.montarContacto(p) },
    'voluntario':       { nav: 'comunidad', sub: 'Comunidad y Seguimiento', vista: (p) => ComunidadComponent.renderVoluntario(p) },
    'notificaciones':   { nav: 'inicio', sub: 'Comunidad y Seguimiento', vista: () => NotificacionesComponent.render() },
    'mis-ayudas':       { nav: 'comunidad', sub: 'Comunidad y Seguimiento', vista: () => MisAyudasComponent.render() },
    'centro-ayuda':     { nav: 'comunidad', sub: 'Comunidad y Seguimiento', vista: () => CentroAyudaComponent.render() },
    'recompensas':      { nav: 'inicio', sub: 'Mis recompensas', vista: () => RecompensasComponent.render() },
    'asistente':        { nav: 'asistente', sub: 'Asistente virtual', vista: () => AsistenteComponent.render(), montar: () => AsistenteComponent.montar() },

    /* ===== 4. Centro de coordinación (31 a 34) ===== */
    'coordinacion':     { nav: 'perfil', sub: 'Centro de Coordinación', rol: 'coordinador', vista: () => CoordinacionComponent.renderPanel() },
    'emergencias':      { nav: 'perfil', sub: 'Centro de Coordinación', rol: 'coordinador', vista: () => CoordinacionComponent.renderEmergencias(), montar: () => CoordinacionComponent.montarEmergencias() },
    'asignar':          { nav: 'perfil', sub: 'Centro de Coordinación', rol: 'coordinador', vista: (p) => CoordinacionComponent.renderAsignar(p) },
    'zonas-seguras':    { nav: 'perfil', sub: 'Centro de Coordinación', rol: 'coordinador', vista: () => CoordinacionComponent.renderZonas() },
    'estadisticas':     { nav: 'perfil', sub: 'Centro de Coordinación', rol: 'coordinador', vista: () => CoordinacionComponent.renderEstadisticas() },

    /* ===== 5. Perfil y configuración (35 a 39) ===== */
    'perfil':           { nav: 'perfil', sub: 'Perfil y Configuración', vista: () => CuentaComponent.renderPerfil() },
    'editar-perfil':    { nav: 'perfil', sub: 'Perfil y Configuración', vista: () => CuentaComponent.renderEditarPerfil(), montar: () => CuentaComponent.montarEditarPerfil() },
    'configuracion':    { nav: 'perfil', sub: 'Perfil y Configuración', vista: () => CuentaComponent.renderConfiguracion() },
    'seguridad':        { nav: 'perfil', sub: 'Perfil y Configuración', vista: () => CuentaComponent.renderSeguridad(), montar: () => CuentaComponent.montarSeguridad() },
    'cerrar-sesion':    { nav: 'perfil', sub: 'Perfil y Configuración', vista: () => CuentaComponent.renderCerrarSesion() }
};

const app = {
    vistaActual: '',
    // Se activa con ?embed=1 o con #/ruta?embed=1. La segunda forma es la segura: algunos servidores
    // (p. ej. "npx serve") redirigen index.html y pierden la parte "?...", pero conservan el "#...".
    embed: MODO_PRESENTACION,

    /* ---------- Sesión y permisos ---------- */
    // Con la nube activa, la sesión es la del servidor; en modo local es la guardada en el dispositivo.
    sesionActiva: () => app.embed || (Nube.activa ? !!Nube.sesion : !!db.obtenerSesion().activa),
    esCoordinador: () => app.embed || db.obtenerUsuario().rol === 'coordinador',

    /* ---------- Navegación ---------- */
    init: async () => {
        if (app.embed) document.body.classList.add('embed');

        // Nube: recupera la sesión guardada y descarga los datos antes de dibujar la primera pantalla.
        if (Nube.activa && await Nube.restaurarSesion()) {
            try { await Nube.sincronizar(); } catch (e) { /* sin conexión: se usa la copia guardada */ }
            Nube.iniciarSondeo();
        }

        window.addEventListener('hashchange', () => { UI.cerrarHoja(); app.renderizar(); app.refrescarNube(); });
        if (!location.hash || location.hash === '#') {
            app.navegar(app.sesionActiva() ? 'inicio' : 'splash');
        } else {
            app.renderizar();
        }
    },

    /** Pantallas de lectura que se vuelven a dibujar solas cuando llegan novedades de la nube. */
    REDIBUJAR: ['inicio', 'notificaciones', 'solicitudes', 'solicitud-detalle', 'seguimiento', 'historial', 'mis-ayudas', 'voluntario'],

    /** Pide novedades al servidor sin bloquear la pantalla. */
    refrescarNube: () => {
        if (!Nube.activa || !Nube.sesion) return;
        Nube.sincronizar().then(cambio => { if (cambio) app.alActualizarNube(); }).catch(() => {});
    },

    /** La nube trajo datos nuevos: se actualiza el punto de notificaciones y, si conviene, la pantalla. */
    alActualizarNube: (forzar = false) => {
        const def = RUTAS[app.vistaActual];
        if (!def || def.auth) return;
        app.actualizarMarco(def);
        if (app.vistaActual === 'comunidad') { // conserva lo que se está escribiendo
            if (!document.activeElement || !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) ComunidadComponent.refrescar();
            return;
        }
        if (forzar || app.REDIBUJAR.includes(app.vistaActual)) {
            const vista = document.getElementById('router-view');
            const y = vista.scrollTop;
            app.renderizar();
            vista.scrollTop = y; // no mover la pantalla mientras la persona lee
        }
    },

    /** Cambia de pantalla. Los parámetros viajan en el hash (?id=...). */
    navegar: (ruta, parametros = {}) => {
        const qs = new URLSearchParams(parametros).toString();
        const destino = '#/' + ruta + (qs ? '?' + qs : '');
        if (location.hash === destino) app.renderizar();
        else location.hash = destino;
    },

    leerHash: () => {
        const [ruta, qs] = location.hash.replace(/^#\/?/, '').split('?');
        return { ruta: ruta || '', params: Object.fromEntries(new URLSearchParams(qs || '')) };
    },

    renderizar: () => {
        let { ruta, params } = app.leerHash();
        let def = RUTAS[ruta];
        if (!def) { app.navegar(app.sesionActiva() ? 'inicio' : 'splash'); return; }

        // Guardas: sesión y rol
        if (!def.publica && !app.sesionActiva()) { app.navegar('acceso'); return; }
        if (def.rol === 'coordinador' && !app.esCoordinador()) {
            UI.toast('Esta sección es solo para coordinación.');
            app.navegar('perfil');
            return;
        }

        app.vistaActual = ruta;
        const vista = document.getElementById('router-view');
        app.actualizarMarco(def);

        if (def.flujo) {
            def.flujo(params);
        } else {
            vista.innerHTML = def.vista(params);
            if (def.montar) def.montar(params);
        }
        vista.scrollTop = 0;
        if (ruta === 'inicio') GuiaComponent.iniciarSiCorresponde(); // la primera vez, muestra la guía de uso
    },

    /* ---------- Cabecera y barra inferior ---------- */
    actualizarMarco: (def) => {
        const cabecera = document.getElementById('main-header');
        const barra = document.getElementById('bottom-nav');
        const vista = document.getElementById('router-view');
        const auth = !!def.auth;

        cabecera.classList.toggle('hidden', auth);
        barra.classList.toggle('hidden', auth);
        vista.classList.toggle('pb-28', !auth);
        if (auth) return;

        // Subtítulo y color según la sección (el lema de la app es el subtítulo por defecto)
        document.getElementById('header-subtitulo').textContent = def.sub || 'Mi cuadra, mi gente, mi alerta';
        const coordinacion = def.rol === 'coordinador';
        cabecera.classList.toggle('bg-violet-700', coordinacion);
        cabecera.classList.toggle('bg-peru-darkRed', !coordinacion);

        // Avatar del usuario y punto de notificaciones nuevas
        const u = db.obtenerUsuario();
        const av = document.getElementById('header-avatar');
        av.innerHTML = u.avatar
            ? `<img src="${UI.esc(u.avatar)}" alt="Mi perfil" class="w-full h-full rounded-full object-cover">`
            : UI.esc(UI.iniciales(u.nombre));
        document.getElementById('punto-notif').classList.toggle('hidden', db.contarNoLeidas() === 0);

        // Pestaña activa de la barra inferior
        document.querySelectorAll('[data-route]').forEach(b => {
            const activa = b.getAttribute('data-route') === def.nav;
            if (b.classList.contains('nav-btn')) {
                b.classList.toggle('text-peru-darkRed', activa);
                b.classList.toggle('text-[#1A1A1A]', !activa);
            }
        });
    }
};

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
