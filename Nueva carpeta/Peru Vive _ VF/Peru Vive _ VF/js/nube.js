/**
 * Cliente de la nube de Perú Vive (Supabase) hecho con fetch: no necesita ninguna librería.
 *   - Autenticación (GoTrue):  /auth/v1/...
 *   - Datos (PostgREST):       /rest/v1/tabla  y  /rest/v1/rpc/funcion
 *
 * El resto de la app sigue leyendo de la copia local (js/data.js). Este módulo:
 *   1. inicia/cierra sesión y renueva el token,
 *   2. descarga los datos compartidos y los deja en esa copia local (sincronizar),
 *   3. envía al servidor lo que la persona crea o cambia,
 *   4. revisa novedades cada 20 segundos (notificaciones, solicitudes nuevas).
 */

const CLAVE_SESION_NUBE = 'peru_vive_sesion_nube';

class ErrorNube extends Error {
    constructor(mensaje, codigo) {
        super(mensaje);
        this.codigo = codigo;
    }
}

const Nube = {
    activa: MODO_NUBE,
    sesion: null, // { accessToken, refreshToken, expiraEn, usuarioId, correo }
    _sync: null,
    _refrescando: null,
    _sondeo: null,

    uuid: () => (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        }),

    /* ============ Red ============ */
    traducir: (datos, estado) => {
        const codigo = String((datos && (datos.error_code || datos.code)) || '');
        const msg = (datos && (datos.msg || datos.message || datos.error_description || datos.error)) || '';
        const mapa = {
            invalid_credentials: 'Correo o contraseña incorrectos.',
            user_already_exists: 'Ya existe una cuenta con ese correo.',
            email_exists: 'Ya existe una cuenta con ese correo.',
            weak_password: 'La contraseña es muy débil. Usa al menos 8 caracteres.',
            over_request_rate_limit: 'Demasiados intentos. Espera unos minutos e inténtalo otra vez.',
            over_email_send_rate_limit: 'Ya te enviamos un código hace poco. Espera un minuto antes de pedir otro.',
            otp_expired: 'El código es incorrecto o ya venció. Pide uno nuevo.',
            email_address_not_authorized: 'Por ahora no podemos enviar correos a esa dirección. Inténtalo más tarde.',
            unexpected_failure: 'No pudimos enviar el correo. Inténtalo más tarde.',
            email_not_confirmed: 'Confirma tu correo antes de ingresar.',
            email_address_invalid: 'Ese correo no es válido.',
            validation_failed: 'Revisa los datos ingresados.',
            signup_disabled: 'El registro está desactivado por ahora.',
            same_password: 'La nueva contraseña debe ser distinta a la actual.',
            '42501': 'No tienes permiso para hacer esto.',
            '23505': 'Ese registro ya existe.',
            '23514': 'Algún dato no es válido. Revísalo e inténtalo de nuevo.',
            '22P02': 'Algún dato no tiene el formato correcto.',
            PGRST301: 'Tu sesión venció. Inicia sesión de nuevo.',
            PGRST303: 'Tu sesión venció. Inicia sesión de nuevo.'
        };
        if (mapa[codigo]) return mapa[codigo];
        if (codigo === 'P0001') return msg; // mensajes que la base escribe ya en español
        if (/jwt expired/i.test(msg) || estado === 401) return 'Tu sesión venció. Inicia sesión de nuevo.';
        if (estado === 429) return 'Demasiados intentos. Espera unos minutos e inténtalo otra vez.';
        if (estado >= 500) return 'El servidor tuvo un problema. Inténtalo más tarde.';
        return msg || 'No se pudo completar la acción.';
    },

    async pedir(ruta, { metodo = 'GET', cuerpo, cabeceras = {}, conSesion = true, tokenManual = '' } = {}) {
        const h = { apikey: CONFIG_NUBE.clave, ...cabeceras };
        if (cuerpo !== undefined) h['Content-Type'] = 'application/json';
        if (tokenManual) {
            h.Authorization = 'Bearer ' + tokenManual; // p. ej. la sesión temporal de recuperación de contraseña
        } else if (conSesion) {
            await Nube.asegurarToken();
            if (Nube.sesion) h.Authorization = 'Bearer ' + Nube.sesion.accessToken;
        }
        const control = new AbortController();
        const reloj = setTimeout(() => control.abort(), 20000);
        let r;
        try {
            r = await fetch(CONFIG_NUBE.url + ruta, {
                method: metodo, headers: h, signal: control.signal,
                body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined
            });
        } catch (e) {
            throw new ErrorNube('No se pudo conectar. Revisa tu internet e inténtalo de nuevo.', 'red');
        } finally {
            clearTimeout(reloj);
        }
        const texto = await r.text();
        let datos = null;
        if (texto) { try { datos = JSON.parse(texto); } catch (e) { datos = { message: texto }; } }
        if (!r.ok) throw new ErrorNube(Nube.traducir(datos, r.status), (datos && (datos.error_code || datos.code)) || r.status);
        return datos;
    },

    leer: (tabla, consulta = '') => Nube.pedir(`/rest/v1/${tabla}${consulta ? '?' + consulta : ''}`),

    async insertar(tabla, fila) {
        const r = await Nube.pedir(`/rest/v1/${tabla}`, { metodo: 'POST', cuerpo: fila, cabeceras: { Prefer: 'return=representation' } });
        return Array.isArray(r) ? r[0] : r;
    },

    /** Cambia filas. Si ninguna fila cambió, la base las rechazó por permisos: se avisa. */
    async actualizar(tabla, filtro, cambios) {
        const r = await Nube.pedir(`/rest/v1/${tabla}?${filtro}`, { metodo: 'PATCH', cuerpo: cambios, cabeceras: { Prefer: 'return=representation' } });
        if (!r || r.length === 0) throw new ErrorNube('No tienes permiso para hacer este cambio.', '42501');
        return r;
    },

    borrar: (tabla, filtro) => Nube.pedir(`/rest/v1/${tabla}?${filtro}`, { metodo: 'DELETE' }),
    rpc: (nombre, args) => Nube.pedir(`/rest/v1/rpc/${nombre}`, { metodo: 'POST', cuerpo: args }),

    /* ============ Sesión ============ */
    guardarSesion: (r) => {
        Nube.sesion = {
            accessToken: r.access_token, refreshToken: r.refresh_token,
            expiraEn: Math.floor(Date.now() / 1000) + (r.expires_in || 3600),
            usuarioId: r.user.id, correo: r.user.email
        };
        localStorage.setItem(CLAVE_SESION_NUBE, JSON.stringify(Nube.sesion));
    },

    olvidarSesion: () => {
        Nube.sesion = null;
        localStorage.removeItem(CLAVE_SESION_NUBE);
    },

    async refrescar() {
        const r = await Nube.pedir('/auth/v1/token?grant_type=refresh_token', {
            metodo: 'POST', conSesion: false, cuerpo: { refresh_token: Nube.sesion.refreshToken }
        });
        Nube.guardarSesion(r);
    },

    async asegurarToken() {
        const s = Nube.sesion;
        if (!s || s.expiraEn - 60 > Math.floor(Date.now() / 1000)) return;
        if (!Nube._refrescando) Nube._refrescando = Nube.refrescar().finally(() => { Nube._refrescando = null; });
        await Nube._refrescando;
    },

    /** Al abrir la app: recupera la sesión guardada. Devuelve true si hay una persona con sesión. */
    async restaurarSesion() {
        try {
            const g = JSON.parse(localStorage.getItem(CLAVE_SESION_NUBE) || 'null');
            if (g && g.refreshToken) Nube.sesion = g;
        } catch (e) { /* sesión corrupta: se ignora */ }
        if (!Nube.sesion) return false;
        try {
            await Nube.asegurarToken();
            return true;
        } catch (e) {
            if (e.codigo === 'red') return true; // sin internet: se sigue con lo guardado
            Nube.olvidarSesion();
            return false;
        }
    },

    async registrar({ correo, clave, nombre, apellido, nombreVisible }) {
        const r = await Nube.pedir('/auth/v1/signup', {
            metodo: 'POST', conSesion: false,
            cuerpo: { email: correo, password: clave, data: { nombre, apellido, nombre_visible: nombreVisible } }
        });
        if (r && r.access_token) { Nube.guardarSesion(r); return { conSesion: true }; }
        return { conSesion: false }; // el proyecto exige confirmar el correo
    },

    /**
     * Confirmar la cuenta con el código que llegó al correo (cuando el proyecto exige confirmar el correo).
     * Si es correcto, la persona queda con la sesión iniciada.
     */
    async verificarCodigoRegistro(correo, codigo) {
        const r = await Nube.pedir('/auth/v1/verify', { metodo: 'POST', conSesion: false, cuerpo: { type: 'email', email: correo, token: codigo } });
        if (!r || !r.access_token) throw new ErrorNube(Nube.traducir({ error_code: 'otp_expired' }, 403), 'otp_expired');
        Nube.guardarSesion(r);
    },

    /** Vuelve a enviar el código de confirmación. La respuesta es igual exista o no la cuenta. */
    reenviarCodigoRegistro: (correo) => Nube.pedir('/auth/v1/resend', { metodo: 'POST', conSesion: false, cuerpo: { type: 'signup', email: correo } }),

    async ingresar(correo, clave) {
        const r = await Nube.pedir('/auth/v1/token?grant_type=password', {
            metodo: 'POST', conSesion: false, cuerpo: { email: correo, password: clave }
        });
        Nube.guardarSesion(r);
    },

    async salir() {
        // scope=local: cierra solo ESTE teléfono. Sin eso, Supabase cierra la sesión en todos los dispositivos de la persona.
        try { if (Nube.sesion) await Nube.pedir('/auth/v1/logout?scope=local', { metodo: 'POST' }); } catch (e) { /* igual se cierra aquí */ }
        Nube.detenerSondeo();
        Nube.olvidarSesion();
    },

    /* ============ Recuperar contraseña con código enviado al correo ============ */
    _recuperacion: null, // { accessToken, correo }: solo en memoria; nunca se guarda en el teléfono

    /** Envía un código al correo. La respuesta es la misma exista o no la cuenta (nadie puede averiguar quién tiene cuenta). */
    pedirCodigoRecuperacion: (correo) => Nube.pedir('/auth/v1/recover', { metodo: 'POST', conSesion: false, cuerpo: { email: correo } }),

    /** Comprueba el código. Si es correcto, queda una sesión temporal SOLO para cambiar la contraseña. */
    async verificarCodigoRecuperacion(correo, codigo) {
        const r = await Nube.pedir('/auth/v1/verify', { metodo: 'POST', conSesion: false, cuerpo: { type: 'recovery', email: correo, token: codigo } });
        if (!r || !r.access_token) throw new ErrorNube(Nube.traducir({ error_code: 'otp_expired' }, 403), 'otp_expired');
        Nube._recuperacion = { accessToken: r.access_token, correo };
    },

    /** Guarda la contraseña nueva y cierra la sesión temporal (y las demás: si alguien más tenía acceso, se corta). */
    async cambiarClaveRecuperada(nueva) {
        if (!Nube._recuperacion) throw new ErrorNube('Primero ingresa el código que te enviamos.', 'sin_codigo');
        const token = Nube._recuperacion.accessToken;
        await Nube.pedir('/auth/v1/user', { metodo: 'PUT', conSesion: false, tokenManual: token, cuerpo: { password: nueva } });
        try { await Nube.pedir('/auth/v1/logout', { metodo: 'POST', conSesion: false, tokenManual: token }); } catch (e) { /* ya está hecho lo importante */ }
        Nube._recuperacion = null;
    },

    /** Cambiar contraseña: primero se comprueba la actual. */
    async cambiarClave(actual, nueva) {
        await Nube.ingresar(Nube.sesion.correo, actual);
        await Nube.pedir('/auth/v1/user', { metodo: 'PUT', cuerpo: { password: nueva } });
    },

    /* ============ Conversión servidor → formato local de la app ============ */
    hace: (iso) => {
        const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
        if (min < 1) return 'Hace un momento';
        if (min < 60) return `Hace ${min} min`;
        const h = Math.round(min / 60);
        if (h < 24) return `Hace ${h} h`;
        const d = Math.round(h / 24);
        return d === 1 ? 'Ayer' : `Hace ${d} días`;
    },

    aReporte: (r) => ({
        id: r.codigo, uuid: r.id, tipo: r.tipo, descripcion: r.descripcion,
        ubicacion: r.ubicacion_texto || r.distrito || 'Ubicación aproximada', distrito: r.distrito || '',
        fecha: Nube.hace(r.creado_en), estado: r.estado, nivel: r.nivel,
        lat: r.lat_aprox, lon: r.lon_aprox
    }),

    aSolicitud: (s) => ({
        id: s.codigo, uuid: s.id, tipoAyuda: s.tipo_ayuda, numeroPersonas: s.numero_personas,
        detalles: s.detalles || '', ubicacion: s.ubicacion_texto || s.distrito || 'Ubicación aproximada',
        fecha: Nube.hace(s.creado_en), estado: s.estado
    }),

    aZona: (z) => ({
        id: z.id, nombre: z.nombre, categoria: z.categoria, descripcion: z.descripcion || '', direccion: z.direccion || '',
        distrito: z.distrito || '', lat: Number(z.lat), lon: Number(z.lon), estado: z.estado,
        capacidad: z.capacidad == null ? null : Number(z.capacidad), horario: z.horario || ''
    }),

    aOferta: (o) => ({
        id: o.id, tipoApoyo: o.tipo_apoyo, disponibilidad: o.disponibilidad || '',
        contacto: o.contacto_privado || '', fecha: Nube.hace(o.creado_en), pausada: o.pausada
    }),

    aUsuario: (p, correo) => ({
        nombre: p.nombre || p.nombre_visible, apellido: p.apellido, correo: correo || '',
        nombreVisible: p.nombre_visible, fechaNacimiento: p.fecha_nacimiento || '', rol: p.rol,
        departamento: p.departamento || '', provincia: p.provincia || '', distrito: p.distrito || '',
        ubicacion: [p.distrito, p.departamento].filter(Boolean).join(', '),
        telefono: p.celular ? '+51 ' + p.celular : '', puntosAyuda: p.puntos, rachaDias: 0,
        habilidades: p.habilidades || [], apoyo: p.apoyo || '', horario: p.horario || ''
    }),

    /* ============ Sincronización ============ */
    /**
     * Si ya hay una sincronización en curso se reutiliza. Con forzar = true (justo después de escribir)
     * se espera a que termine y se hace otra, para no quedarse con datos anteriores al cambio.
     */
    sincronizar(forzar = false) {
        if (!Nube.activa || !Nube.sesion) return Promise.resolve(false);
        const lanzar = () => {
            Nube._sync = Nube._sincronizar().finally(() => { Nube._sync = null; });
            return Nube._sync;
        };
        if (!Nube._sync) return lanzar();
        return forzar ? Nube._sync.catch(() => {}).then(lanzar) : Nube._sync;
    },

    /** Descarga todo lo compartido. Devuelve true si algo cambió respecto a la copia local. */
    async _sincronizar() {
        const uid = Nube.sesion.usuarioId, L = Nube.leer;
        // Los comentarios necesitan el ajuste 003; si aún no se ejecutó, la app sigue funcionando sin ellos.
        const comentariosOpcionales = L('comentarios_con_autor', 'select=*&order=creado_en.asc&limit=500').catch(() => []);
        // Las zonas seguras necesitan el ajuste 005; si aún no se ejecutó, el mapa sigue funcionando sin ellas.
        const zonasOpcionales = L('zonas_seguras', 'select=*&order=nombre.asc&limit=300').catch(() => []);
        const [perfiles, misReportes, misSolicitudes, ofertas, notis, vols, pubs, apoyos, comentarios, zonas] = await Promise.all([
            L('perfiles', `id=eq.${uid}&select=*`),
            L('reportes', `usuario_id=eq.${uid}&select=*&order=creado_en.desc`),
            L('solicitudes', `usuario_id=eq.${uid}&select=*&order=creado_en.desc`),
            L('ofertas', `usuario_id=eq.${uid}&select=*&order=creado_en.desc`),
            L('notificaciones', 'select=*&order=creado_en.desc&limit=50'),
            L('directorio_voluntarios', 'select=*&limit=100'),
            L('publicaciones_con_autor', 'select=*&order=creado_en.desc&limit=40'),
            L('apoyos', `usuario_id=eq.${uid}&select=solicitud_id`),
            comentariosOpcionales,
            zonasOpcionales
        ]);
        const perfil = perfiles[0];
        if (!perfil) throw new ErrorNube('No encontramos tu perfil. Cierra sesión y vuelve a entrar.', 'sin_perfil');

        // Coordinación ve todo (con dirección escrita); el resto ve solo las vistas públicas.
        const coordina = perfil.rol === 'coordinador';
        const [todosReportes, todasSolicitudes, asignaciones] = coordina
            ? await Promise.all([
                L('reportes', 'select=*&order=creado_en.desc&limit=300'),
                L('solicitudes', 'select=*&order=creado_en.desc&limit=300'),
                L('asignaciones', 'select=id,tipo,voluntario_id,reporte_id,solicitud_id')])
            : await Promise.all([
                L('reportes_publicos', 'select=*&order=creado_en.desc&limit=100'),
                L('solicitudes_cercanas', 'select=*&order=creado_en.desc&limit=100'),
                Promise.resolve([])]);

        const propiosR = new Set(misReportes.map(r => r.codigo));
        const propiasS = new Set(misSolicitudes.map(s => s.codigo));
        const uuidACodigo = new Map();
        [...misReportes, ...todosReportes, ...misSolicitudes, ...todasSolicitudes].forEach(x => uuidACodigo.set(x.id, x.codigo));
        pubs.forEach(p => uuidACodigo.set(p.id, p.id)); // los avisos de "me gusta" y comentarios apuntan a la publicación

        const comentariosDe = new Map();
        comentarios.forEach(c => {
            if (!comentariosDe.has(c.publicacion_id)) comentariosDe.set(c.publicacion_id, []);
            comentariosDe.get(c.publicacion_id).push({
                id: c.id, autor: c.autor, texto: c.texto, fecha: Nube.hace(c.creado_en), mio: c.autor_id === uid
            });
        });

        const listas = {
            reportes: misReportes.map(Nube.aReporte),
            reportesZona: todosReportes.filter(r => !propiosR.has(r.codigo)).map(r => ({ ...Nube.aReporte(r), zona: true })),
            solicitudes: misSolicitudes.map(Nube.aSolicitud),
            solicitudesZona: todasSolicitudes.filter(s => !propiasS.has(s.codigo)).map(s => ({ ...Nube.aSolicitud(s), zona: true })),
            ofertas: ofertas.map(Nube.aOferta),
            notificaciones: notis.map(n => ({
                id: n.id, icono: n.icono, color: n.color, titulo: n.titulo, detalle: n.detalle || '',
                fecha: Nube.hace(n.creado_en), leida: n.leida, ruta: n.ruta || 'notificaciones',
                objetivoId: uuidACodigo.get(n.objetivo_id) || (n.ruta === 'contacto' ? n.objetivo_id : '')
            })),
            voluntarios: vols.map(v => ({
                id: v.id, nombre: v.nombre_visible, apellido: '', habilidades: v.habilidades || [],
                zona: v.distrito || 'Sin distrito', disponible: true, valoracion: null, ayudas: Number(v.ayudas) || 0,
                apoyo: v.apoyo || 'Disponible para ayudar a su comunidad', horario: v.horario || 'A coordinar'
            })),
            publicaciones: pubs.map(p => {
                const coments = comentariosDe.get(p.id) || [];
                return {
                    id: p.id, autor: p.autor, texto: p.texto, fecha: Nube.hace(p.creado_en),
                    meGusta: Number(p.total_me_gusta) || 0, miMeGusta: !!p.me_gusta_mio,
                    fotoUrl: p.foto_ruta ? Nube.urlFoto(p.foto_ruta) : '', fotoRuta: p.foto_ruta || '',
                    comentarios: coments, totalComentarios: coments.length, mia: p.autor_id === uid
                };
            }),
            asignaciones: asignaciones.map(a => ({
                id: a.id, tipo: a.tipo, voluntarioId: a.voluntario_id,
                objetivoId: uuidACodigo.get(a.reporte_id || a.solicitud_id) || ''
            })),
            misApoyos: apoyos.map(a => uuidACodigo.get(a.solicitud_id)).filter(Boolean),
            zonasSeguras: zonas.map(Nube.aZona)
        };
        return db.aplicarNube(listas, Nube.aUsuario(perfil, Nube.sesion.correo));
    },

    /* ============ Fotos de la comunidad ============ */
    urlFoto: (ruta) => `${CONFIG_NUBE.url}/storage/v1/object/public/fotos-comunidad/${ruta}`,

    /** Sube una foto JPG (ya reducida) a la carpeta de la persona y devuelve su ruta. */
    async subirFoto(blob) {
        await Nube.asegurarToken();
        const ruta = `${Nube.sesion.usuarioId}/${Nube.uuid()}.jpg`;
        let r;
        try {
            r = await fetch(`${CONFIG_NUBE.url}/storage/v1/object/fotos-comunidad/${ruta}`, {
                method: 'POST',
                headers: { apikey: CONFIG_NUBE.clave, Authorization: 'Bearer ' + Nube.sesion.accessToken, 'Content-Type': 'image/jpeg' },
                body: blob
            });
        } catch (e) {
            throw new ErrorNube('No se pudo conectar. Revisa tu internet e inténtalo de nuevo.', 'red');
        }
        if (!r.ok) {
            let d = null; try { d = await r.json(); } catch (e) { /* sin detalle */ }
            const falta = r.status === 404 || (d && /bucket not found/i.test(d.message || d.error || ''));
            throw new ErrorNube(falta ? 'Las fotos aún no están activadas en el servidor (falta ejecutar 003-comunidad.sql).' : 'No se pudo subir la foto.', r.status);
        }
        return ruta;
    },

    /** Borra una foto de la comunidad (solo se puede borrar la propia). */
    async borrarFoto(ruta) {
        await Nube.asegurarToken();
        await fetch(`${CONFIG_NUBE.url}/storage/v1/object/fotos-comunidad/${ruta}`, {
            method: 'DELETE',
            headers: { apikey: CONFIG_NUBE.clave, Authorization: 'Bearer ' + Nube.sesion.accessToken }
        });
    },

    /** Ejecuta algo sin bloquear la pantalla; si falla, avisa y vuelve a sincronizar. */
    enSegundoPlano(operacion, mensajeError) {
        Promise.resolve().then(operacion).catch(e => {
            if (typeof UI !== 'undefined') UI.toast(`${mensajeError}: ${e.message}`);
            Nube.sincronizar().then(() => app.alActualizarNube(true)).catch(() => {});
        });
    },

    iniciarSondeo() {
        Nube.detenerSondeo();
        const revisar = async () => {
            if (document.hidden || !navigator.onLine || !Nube.sesion) return;
            try { if (await Nube.sincronizar()) app.alActualizarNube(); } catch (e) { /* se reintenta en el próximo ciclo */ }
        };
        Nube._sondeo = setInterval(revisar, 20000);
        if (!Nube._escuchas) {
            Nube._escuchas = true;
            document.addEventListener('visibilitychange', revisar);
            window.addEventListener('online', revisar);
        }
    },

    detenerSondeo() {
        clearInterval(Nube._sondeo);
        Nube._sondeo = null;
    },

    /* ============ Escrituras ============ */
    async crearReporte({ tipo, descripcion, ubicacion, coordenadas, zona }) {
        const fila = await Nube.insertar('reportes', {
            client_id: Nube.uuid(), tipo, descripcion, ubicacion_texto: ubicacion,
            distrito: (zona && zona.distrito) || db.obtenerUsuario().distrito || null,
            ...(coordenadas ? { lat_aprox: coordenadas.lat, lon_aprox: coordenadas.lng } : {})
        });
        return Nube.aReporte(fila);
    },

    async crearSolicitud({ tipoAyuda, numeroPersonas, detalles, ubicacion, coordenadas, zona }) {
        const fila = await Nube.insertar('solicitudes', {
            client_id: Nube.uuid(), tipo_ayuda: tipoAyuda, numero_personas: numeroPersonas,
            detalles: detalles || null, ubicacion_texto: ubicacion, distrito: (zona && zona.distrito) || db.obtenerUsuario().distrito || null,
            ...(coordenadas ? { lat_aprox: coordenadas.lat, lon_aprox: coordenadas.lng } : {})
        });
        return Nube.aSolicitud(fila);
    },

    async crearOferta({ tipoApoyo, disponibilidad, contacto }) {
        const fila = await Nube.insertar('ofertas', {
            client_id: Nube.uuid(), tipo_apoyo: tipoApoyo, disponibilidad: disponibilidad || null,
            contacto_privado: contacto || null, distrito: db.obtenerUsuario().distrito || null
        });
        return Nube.aOferta(fila);
    },

    /** Convierte los cambios del formato local al de la tabla `perfiles` (solo columnas permitidas). */
    actualizarPerfil(cambios) {
        const fila = {};
        if ('nombre' in cambios) fila.nombre = cambios.nombre;
        if ('apellido' in cambios) fila.apellido = cambios.apellido;
        if ('nombreVisible' in cambios) fila.nombre_visible = cambios.nombreVisible;
        if ('telefono' in cambios) fila.celular = String(cambios.telefono || '').replace(/\D/g, '').replace(/^51/, '') || null;
        if ('fechaNacimiento' in cambios) fila.fecha_nacimiento = cambios.fechaNacimiento || null;
        if ('departamento' in cambios) fila.departamento = cambios.departamento || null;
        if ('provincia' in cambios) fila.provincia = cambios.provincia || null;
        if ('distrito' in cambios) fila.distrito = cambios.distrito || null;
        if ('rol' in cambios) fila.rol = cambios.rol;
        if ('habilidades' in cambios) fila.habilidades = cambios.habilidades;
        if ('apoyo' in cambios) fila.apoyo = cambios.apoyo || null;
        if ('horario' in cambios) fila.horario = cambios.horario || null;
        if (Object.keys(fila).length === 0) return Promise.resolve();
        return Nube.actualizar('perfiles', `id=eq.${Nube.sesion.usuarioId}`, fila);
    },

    /** Para estados y asignaciones se necesita el identificador interno (uuid) del caso. */
    uuidDe: (codigo, tipo) => {
        const lista = tipo === 'reporte' ? db.obtenerTodosReportes() : db.obtenerTodasSolicitudes();
        const x = lista.find(i => i.id === codigo);
        if (!x || !x.uuid) throw new ErrorNube('No encontramos ese caso. Actualiza e inténtalo de nuevo.', 'sin_caso');
        return x.uuid;
    }
};
