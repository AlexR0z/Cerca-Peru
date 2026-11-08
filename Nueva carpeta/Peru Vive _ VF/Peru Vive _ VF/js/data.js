/**
 * Manejo de datos y persistencia local (localStorage) para Perú Vive.
 *
 * Compatibilidad: los datos guardados por versiones anteriores se conservan. Las claves nuevas
 * (sesión, notificaciones, voluntarios, etc.) se agregan al iniciar sin tocar reportes,
 * solicitudes ni ofertas que ya existan.
 */

// Con la nube activa se usa otro almacenamiento, para no mezclar datos reales con los de demostración.
const DB_KEY = MODO_NUBE ? 'peru_vive_nube_v1' : 'peru_vive_db_v1';

// Etapas por las que avanza una solicitud de ayuda (pantalla 24)
const ETAPAS_SOLICITUD = ['Activa', 'En coordinación', 'En atención', 'Atendida'];
// Estados que puede tener una emergencia (pantalla 32)
const ESTADOS_EMERGENCIA = ['Pendiente', 'En revisión', 'Verificado', 'En atención', 'Resuelto'];

/* ---------- Generadores de datos de demostración (determinísticos) ---------- */
const _NOMBRES = ['Carlos', 'Ana', 'Luis', 'María', 'José', 'Rosa', 'Miguel', 'Lucía', 'Jorge', 'Elena', 'Pedro', 'Carmen', 'Diego', 'Sofía', 'Raúl'];
const _APELLIDOS = ['Ramos', 'Torres', 'Quispe', 'Huamán', 'Flores', 'Condori', 'Mamani', 'Vargas', 'Rojas', 'Chávez', 'Paredes', 'Salazar', 'Castillo', 'Mendoza', 'Ccori'];
const _HABILIDADES = ['Transporte', 'Logística', 'Primeros auxilios', 'Alimentos', 'Búsqueda y rescate', 'Apoyo psicológico', 'Construcción', 'Comunicaciones'];
const _DISTRITOS = ['Chaclacayo', 'Lurigancho-Chosica', 'Ate', 'Cieneguilla', 'Santa Anita', 'Cercado de Lima'];

function _generarVoluntarios() {
    const destacados = [
        { id: 'VOL-001', nombre: 'Carlos', apellido: 'Ramos', habilidades: ['Transporte', 'Logística'], zona: 'Chaclacayo', disponible: true, valoracion: 4.9, ayudas: 38, apoyo: 'Apoyo en transporte de víveres y personas', horario: 'Tardes y fines de semana' },
        { id: 'VOL-002', nombre: 'Ana', apellido: 'Torres', habilidades: ['Logística', 'Alimentos'], zona: 'Chaclacayo', disponible: true, valoracion: 4.8, ayudas: 27, apoyo: 'Armado y reparto de kits de alimentos', horario: 'Mañanas' },
        { id: 'VOL-003', nombre: 'Luis', apellido: 'Quispe', habilidades: ['Primeros auxilios'], zona: 'Lurigancho-Chosica', disponible: true, valoracion: 5.0, ayudas: 19, apoyo: 'Primeros auxilios y orientación básica de salud', horario: 'Disponible 24 h' },
        { id: 'VOL-004', nombre: 'María', apellido: 'Huamán', habilidades: ['Apoyo psicológico'], zona: 'Ate', disponible: false, valoracion: 4.7, ayudas: 12, apoyo: 'Acompañamiento emocional a familias afectadas', horario: 'Noches' }
    ];
    const lista = destacados.slice();
    for (let i = lista.length; i < 45; i++) {
        lista.push({
            id: 'VOL-' + String(i + 1).padStart(3, '0'),
            nombre: _NOMBRES[(i * 7) % _NOMBRES.length],
            apellido: _APELLIDOS[(i * 5 + 3) % _APELLIDOS.length],
            habilidades: [_HABILIDADES[i % _HABILIDADES.length], _HABILIDADES[(i + 3) % _HABILIDADES.length]],
            zona: _DISTRITOS[i % _DISTRITOS.length],
            disponible: i % 4 !== 0,
            valoracion: Math.round((4.2 + ((i * 13) % 8) / 10) * 10) / 10,
            ayudas: 3 + ((i * 11) % 30),
            apoyo: 'Apoyo en ' + _HABILIDADES[i % _HABILIDADES.length].toLowerCase(),
            horario: i % 2 ? 'Tardes' : 'Fines de semana'
        });
    }
    return lista;
}

function _generarReportesZona() {
    const tipos = ['Huayco', 'Inundación', 'Sismo', 'Incendio', 'Huayco', 'Inundación', 'Sismo', 'Huayco', 'Incendio', 'Inundación'];
    const sitios = ['Km 24 Carretera Central, Chaclacayo', 'Malecón de Chosica', 'Huaycán, Ate', 'Cieneguilla, Lima', 'Santa Anita, Lima', 'Jr. Cusco, Cercado', 'Quebrada Pedregal, Chaclacayo', 'Av. Los Próceres, Ate', 'Mercado Zonal, Chosica', 'Urb. Los Girasoles, Chaclacayo'];
    const estados = ['Pendiente', 'En revisión', 'Verificado', 'En atención', 'Resuelto', 'Pendiente', 'En atención', 'Verificado', 'En revisión', 'Pendiente'];
    const tiempos = ['Hace 10 min', 'Hace 25 min', 'Hace 40 min', 'Hace 1 h', 'Hace 2 h', 'Hace 3 h', 'Hace 5 h', 'Ayer', 'Ayer', 'Hace 2 días'];
    return tipos.map((tipo, i) => ({
        id: 'ZR-' + String(i + 1).padStart(3, '0'),
        tipo,
        descripcion: tipo + ' reportado por vecinos de la zona (dato de demostración).',
        ubicacion: sitios[i],
        fecha: tiempos[i],
        estado: estados[i],
        nivel: i % 3 === 0 ? 'Alto' : i % 3 === 1 ? 'Medio' : 'Bajo',
        zona: true
    }));
}

function _generarSolicitudesZona() {
    const base = [
        { tipoAyuda: 'Agua y alimentos', personas: 4, ubicacion: 'Chaclacayo', fecha: 'Hace 15 min', detalles: 'Familia con niños pequeños sin acceso a agua potable ni víveres desde ayer.' },
        { tipoAyuda: 'Apoyo en traslado', personas: 2, ubicacion: 'Chaclacayo', fecha: 'Hace 40 min', detalles: 'Adulto mayor necesita traslado a un centro de salud por el camino alterno.' },
        { tipoAyuda: 'Refugio temporal', personas: 5, ubicacion: 'Chaclacayo', fecha: 'Hace 1 h', detalles: 'Vivienda afectada por el huayco, la familia busca un lugar donde pasar la noche.' }
    ];
    const tipos = ['Alimentos', 'Agua', 'Medicamentos', 'Transporte', 'Refugio', 'Otro'];
    const lista = base.map((b, i) => ({
        id: 'ZS-' + String(i + 1).padStart(3, '0'), tipoAyuda: b.tipoAyuda, numeroPersonas: b.personas,
        detalles: b.detalles, ubicacion: b.ubicacion, fecha: b.fecha, estado: 'Activa', zona: true
    }));
    for (let i = lista.length; i < 27; i++) {
        lista.push({
            id: 'ZS-' + String(i + 1).padStart(3, '0'),
            tipoAyuda: tipos[i % tipos.length],
            numeroPersonas: 1 + (i % 6),
            detalles: 'Solicitud registrada por un vecino de la zona (dato de demostración).',
            ubicacion: _DISTRITOS[i % _DISTRITOS.length],
            fecha: i % 3 === 0 ? 'Ayer' : 'Hace ' + (2 + (i % 9)) + ' h',
            estado: ETAPAS_SOLICITUD[i % 4],
            zona: true
        });
    }
    return lista;
}

/** Zonas seguras de demostración (en la nube vienen de la tabla zonas_seguras). Son lugares de ejemplo, no refugios oficiales. */
const ZONAS_SEGURAS_DEMO = [
    { id: 'ZN-001', nombre: 'Estadio Municipal', categoria: 'refugio', descripcion: 'Carpas, alimentos no perecibles y asistencia médica para familias afectadas. Dato de ejemplo.', direccion: 'Cercado de Lima', distrito: 'Lima', lat: -12.0464, lon: -77.0428, estado: 'Lleno', capacidad: 500, horario: 'Abierto 24 horas' },
    { id: 'ZN-002', nombre: 'Colegio parroquial Santa Rosa', categoria: 'refugio', descripcion: 'Aulas habilitadas como albergue temporal con apoyo de voluntarios. Dato de ejemplo.', direccion: 'Santa Anita', distrito: 'Santa Anita', lat: -12.0430, lon: -76.9710, estado: 'Activo', capacidad: 200, horario: 'Abierto 24 horas' },
    { id: 'ZN-003', nombre: 'Losa deportiva Los Cedros', categoria: 'refugio', descripcion: 'Espacio techado con baños y agua. Dato de ejemplo.', direccion: 'Av. Los Cedros s/n', distrito: 'Chaclacayo', lat: -11.9740, lon: -76.7700, estado: 'Activo', capacidad: 120, horario: 'Abierto 24 horas' },
    { id: 'ZN-004', nombre: 'Centro de acopio municipal', categoria: 'acopio', descripcion: 'Recibe víveres no perecibles, agua, abrigo y artículos de higiene. Dato de ejemplo.', direccion: 'Av. Central s/n', distrito: 'Ate', lat: -12.0260, lon: -76.9180, estado: 'Activo', capacidad: null, horario: '8:00 a.m. a 8:00 p.m.' },
    { id: 'ZN-005', nombre: 'Parque principal', categoria: 'reunion', descripcion: 'Punto de reunión abierto y amplio, lejos de postes y laderas. Dato de ejemplo.', direccion: 'Plaza principal', distrito: 'San Juan de Lurigancho', lat: -11.9770, lon: -77.0070, estado: 'Activo', capacidad: null, horario: 'Siempre disponible' },
    { id: 'ZN-006', nombre: 'Posta de salud', categoria: 'salud', descripcion: 'Atención de emergencias y primeros auxilios. Dato de ejemplo.', direccion: 'Av. Lima 450', distrito: 'Lurigancho', lat: -11.9370, lon: -76.6980, estado: 'Activo', capacidad: null, horario: 'Abierto 24 horas' }
];
const datosIniciales = {
    usuario: {
        nombre: "Said",
        apellido: "Aguirre",
        telefono: "+51 987 999 000",
        dni: "70943210",
        ubicacion: "Chaclacayo, Lima",
        puntosAyuda: 120,
        rachaDias: 5,
        correo: "said.aguirre@correo.pe",
        nombreVisible: "Said",
        fechaNacimiento: "1998-05-14",
        rol: "ciudadano",
        departamento: "Lima",
        provincia: "Lima",
        distrito: "Chaclacayo",
        avatar: "",
        verificacion2pasos: false,
        preferencias: { notificaciones: true, ubicacionAproximada: true, directorio: true, idioma: "es" }
    },
    reportes: [
        {
            id: "REP-001",
            tipo: "Inundación",
            descripcion: "Acumulación de agua debido a crecida de acequia principal en la cuadra 4.",
            ubicacion: "Av. Los Proceres 452, Lima",
            fecha: "Hace 15 min",
            estado: "Pendiente",
            nivel: "Alto"
        },
        {
            id: "REP-002",
            tipo: "Sismo leve",
            descripcion: "Movimiento telúrico percibido sin daños estructurales aparentes en viviendas.",
            ubicacion: "Jr. Cusco 120, Cercado",
            fecha: "Hace 2 horas",
            estado: "Verificado",
            nivel: "Medio"
        }
    ],
    solicitudes: [
        {
            id: "SOL-001",
            tipoAyuda: "Agua potable y víveres",
            numeroPersonas: 4,
            detalles: "Familia con niños pequeños requiere agua embotellada y alimentos no perecibles.",
            ubicacion: "Calle Las Begonias 310",
            fecha: "Hoy, 10:30 AM",
            estado: "Activa"
        }
    ],
    ofertas: [
        { id: "OFE-001", tipoApoyo: "Transporte", disponibilidad: "Fines de semana y tardes", contacto: "+51 912 345 678", fecha: "Ayer" },
        { id: "OFE-002", tipoApoyo: "Alimentos", disponibilidad: "Hoy", contacto: "+51 912 345 678", fecha: "Hace 3 días" },
        { id: "OFE-003", tipoApoyo: "Apoyo logístico", disponibilidad: "Mañanas", contacto: "+51 912 345 678", fecha: "Hace 5 días" }
    ],
    // ----- Claves nuevas (se agregan sin borrar lo anterior) -----
    sesion: { activa: false, nuevaCuenta: false, tutorialVisto: false },
    notificaciones: [
        { id: 'NOT-001', icono: 'fa-hand-holding-heart', color: 'bg-emerald-600', titulo: 'Tu solicitud está en atención', detalle: 'Un voluntario ya coordina tu solicitud SOL-001.', fecha: 'Hace 5 min', leida: false, ruta: 'seguimiento' },
        { id: 'NOT-002', icono: 'fa-box-open', color: 'bg-sky-600', titulo: 'Nueva ayuda disponible cerca', detalle: 'Hay un punto de entrega de agua a 1.2 km de ti.', fecha: 'Hace 30 min', leida: false, ruta: 'solicitudes' },
        { id: 'NOT-003', icono: 'fa-circle-check', color: 'bg-peru-red', titulo: 'Tu reporte fue validado', detalle: 'El reporte REP-002 fue verificado por coordinación.', fecha: 'Hace 1 h', leida: true, ruta: 'historial' },
        { id: 'NOT-005', icono: 'fa-hand-holding-heart', color: 'bg-emerald-600', titulo: 'Un vecino pidió tu ayuda', detalle: 'Rosa Quispe (ejemplo) quiere contactarte. Toca para responderle.', fecha: 'Hace 2 min', leida: false, ruta: 'contacto', objetivoId: 'CON-001' },
        { id: 'NOT-004', icono: 'fa-bullhorn', color: 'bg-amber-500', titulo: 'Aviso de ejemplo (demostración)', detalle: 'Este es un aviso ficticio. Consulta siempre a INDECI y a tu municipalidad.', fecha: 'Ayer', leida: true, ruta: 'notificaciones' }
    ],
    voluntarios: _generarVoluntarios(),
    publicaciones: [
        { id: 'PUB-001', autor: 'Municipalidad (ejemplo)', texto: 'Recuerda tener una mochila de emergencia lista: agua, linterna, botiquín y copias de tus documentos.', fecha: 'Hace 2 h', meGusta: 14, miMeGusta: false },
        {
            id: 'PUB-002', autor: 'Ana Torres', texto: 'Este sábado armamos kits de alimentos en el colegio de Chaclacayo. ¡Se necesitan manos!', fecha: 'Hace 5 h', meGusta: 9, miMeGusta: false,
            comentarios: [
                { id: 'COM-001', autor: 'Carlos Ramos', texto: '¡Cuenten conmigo! Llevo bolsas y guantes.', fecha: 'Hace 4 h', mio: false },
                { id: 'COM-002', autor: 'Lucía Quispe', texto: 'Yo llevo el agua para todos.', fecha: 'Hace 3 h', mio: false }
            ],
            totalComentarios: 2
        },
        { id: 'PUB-003', autor: 'Carlos Ramos', texto: 'Tengo una camioneta disponible para trasladar víveres a zonas altas esta tarde.', fecha: 'Ayer', meGusta: 6, miMeGusta: false }
    ],
    reportesZona: _generarReportesZona(),
    solicitudesZona: _generarSolicitudesZona(),
    asignaciones: [],
    misApoyos: [],
    zonasSeguras: ZONAS_SEGURAS_DEMO
};

// En modo nube no hay personas, reportes ni solicitudes inventadas: todo viene del servidor.
if (MODO_NUBE) {
    Object.assign(datosIniciales, {
        reportes: [], solicitudes: [], ofertas: [], notificaciones: [], voluntarios: [], publicaciones: [],
        reportesZona: [], solicitudesZona: [], asignaciones: [], misApoyos: [], zonasSeguras: []
    });
    datosIniciales.usuario = {
        nombre: '', apellido: '', telefono: '', dni: '', ubicacion: '', puntosAyuda: 0, rachaDias: 0,
        correo: '', nombreVisible: '', fechaNacimiento: '', rol: 'ciudadano',
        departamento: '', provincia: '', distrito: '', avatar: '', verificacion2pasos: false,
        preferencias: { notificaciones: true, ubicacionAproximada: true, directorio: true, idioma: 'es' }
    };
}

class BaseDatos {
    constructor() {
        this.inicializar();
    }

    inicializar() {
        const guardado = localStorage.getItem(DB_KEY);
        if (!guardado) {
            localStorage.setItem(DB_KEY, JSON.stringify(datosIniciales));
            return;
        }
        // Fusión no destructiva: solo se agregan las claves que falten.
        try {
            const data = JSON.parse(guardado);
            let cambio = false;
            Object.keys(datosIniciales).forEach(clave => {
                if (data[clave] === undefined) {
                    data[clave] = JSON.parse(JSON.stringify(datosIniciales[clave]));
                    cambio = true;
                } else if (clave === 'usuario') {
                    Object.keys(datosIniciales.usuario).forEach(k => {
                        if (data.usuario[k] === undefined) { data.usuario[k] = datosIniciales.usuario[k]; cambio = true; }
                    });
                }
            });
            // Demostración: las publicaciones de ejemplo guardadas antes de existir los comentarios reciben los suyos.
            if (!MODO_NUBE && Array.isArray(data.publicaciones)) {
                datosIniciales.publicaciones.forEach(semilla => {
                    const p = data.publicaciones.find(x => x.id === semilla.id);
                    if (p && p.comentarios === undefined) {
                        p.comentarios = JSON.parse(JSON.stringify(semilla.comentarios || []));
                        p.totalComentarios = p.comentarios.length;
                        cambio = true;
                    }
                });
            }
            if (cambio) this.guardarTodo(data);
        } catch (e) {
            localStorage.setItem(DB_KEY, JSON.stringify(datosIniciales));
        }
    }

    obtenerTodo() {
        const data = localStorage.getItem(DB_KEY);
        return data ? JSON.parse(data) : JSON.parse(JSON.stringify(datosIniciales));
    }

    guardarTodo(data) {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    }

    /** Restablece los datos de demostración (también cierra la sesión). */
    reiniciar() {
        localStorage.setItem(DB_KEY, JSON.stringify(datosIniciales));
    }

    /**
     * Modo nube: reemplaza las listas por lo que dice el servidor.
     * Conserva lo que solo vive en este dispositivo (foto, preferencias, avance del tutorial).
     * Devuelve true si algo cambió, para saber si hay que redibujar la pantalla.
     */
    aplicarNube(listas, usuarioNube) {
        const data = this.obtenerTodo();
        const antes = JSON.stringify([data.usuario, Object.keys(listas).map(k => data[k])]);
        Object.assign(data, listas);
        data.usuario = Object.assign({}, data.usuario, usuarioNube);
        const cambio = antes !== JSON.stringify([data.usuario, Object.keys(listas).map(k => data[k])]);
        if (cambio) this.guardarTodo(data);
        return cambio;
    }

    /* ---------- Sesión ---------- */
    obtenerSesion() {
        return this.obtenerTodo().sesion || { activa: false };
    }

    actualizarSesion(cambios) {
        const data = this.obtenerTodo();
        data.sesion = Object.assign({}, data.sesion, cambios);
        this.guardarTodo(data);
        return data.sesion;
    }

    /* ---------- Usuario ---------- */
    obtenerUsuario() {
        return this.obtenerTodo().usuario;
    }

    actualizarUsuario(cambios) {
        const data = this.obtenerTodo();
        data.usuario = Object.assign({}, data.usuario, cambios);
        this.guardarTodo(data);
        if (MODO_NUBE && Nube.sesion) Nube.enSegundoPlano(() => Nube.actualizarPerfil(cambios), 'No se pudo guardar tu perfil');
        return data.usuario;
    }

    actualizarPreferencias(cambios) {
        const data = this.obtenerTodo();
        data.usuario.preferencias = Object.assign({}, data.usuario.preferencias, cambios);
        this.guardarTodo(data);
        if (MODO_NUBE && Nube.sesion && 'directorio' in cambios) {
            Nube.enSegundoPlano(() => Nube.actualizar('perfiles', `id=eq.${Nube.sesion.usuarioId}`, { visible_en_directorio: !!cambios.directorio }),
                'No se pudo guardar tu preferencia');
        }
        return data.usuario.preferencias;
    }

    /* ---------- Reportes ---------- */
    obtenerReportes() {
        return this.obtenerTodo().reportes;
    }

    obtenerTodosReportes() {
        const data = this.obtenerTodo();
        return data.reportes.concat(data.reportesZona);
    }

    /** En modo nube devuelve una promesa (hay que esperar al servidor); en modo local devuelve el reporte. */
    agregarReporte(nuevoReporte) {
        if (MODO_NUBE) {
            return Nube.crearReporte(nuevoReporte).then(rep => {
                const d = this.obtenerTodo();
                d.reportes.unshift(rep);
                this.guardarTodo(d);
                return rep;
            });
        }
        const db = this.obtenerTodo();
        const reporteConId = {
            id: `REP-${String(db.reportes.length + 1).padStart(3, '0')}`,
            fecha: 'Hace un momento',
            estado: 'Pendiente',
            ...nuevoReporte
        };
        db.reportes.unshift(reporteConId);
        this.guardarTodo(db);
        return reporteConId;
    }

    /** Cambia el estado de cualquier emergencia (propia o de la zona). */
    actualizarEstadoReporte(id, estado) {
        const data = this.obtenerTodo();
        const r = data.reportes.concat(data.reportesZona).find(x => x.id === id);
        if (!r) return null;
        r.estado = estado;
        // Queda registrado quién cambió el estado (trazabilidad de coordinación)
        r.revisadoPor = `${data.usuario.nombre} ${data.usuario.apellido}`;
        r.revisadoEn = 'Hace un momento';
        this.guardarTodo(data);
        if (MODO_NUBE) {
            // Solo coordinación puede hacerlo: si el servidor lo rechaza, se avisa y se restaura la pantalla.
            Nube.enSegundoPlano(() => Nube.actualizar('reportes', `id=eq.${Nube.uuidDe(id, 'reporte')}`, { estado }), 'No se pudo cambiar el estado');
        }
        return r;
    }

    /* ---------- Solicitudes ---------- */
    obtenerSolicitudes() {
        return this.obtenerTodo().solicitudes;
    }

    obtenerSolicitudesZona() {
        return this.obtenerTodo().solicitudesZona;
    }

    obtenerTodasSolicitudes() {
        const data = this.obtenerTodo();
        return data.solicitudes.concat(data.solicitudesZona);
    }

    buscarSolicitud(id) {
        return this.obtenerTodasSolicitudes().find(s => s.id === id) || null;
    }

    agregarSolicitud(nuevaSolicitud) {
        if (MODO_NUBE) {
            return Nube.crearSolicitud(nuevaSolicitud).then(sol => {
                const d = this.obtenerTodo();
                d.solicitudes.unshift(sol);
                this.guardarTodo(d);
                return sol;
            });
        }
        const db = this.obtenerTodo();
        const solicitudConId = {
            id: `SOL-${String(db.solicitudes.length + 1).padStart(3, '0')}`,
            fecha: 'Hace un momento',
            estado: 'Activa',
            ...nuevaSolicitud
        };
        db.solicitudes.unshift(solicitudConId);
        this.guardarTodo(db);
        return solicitudConId;
    }

    /** Avanza una solicitud a la siguiente etapa (Activa → En coordinación → En atención → Atendida). */
    avanzarSolicitud(id) {
        const data = this.obtenerTodo();
        const s = data.solicitudes.concat(data.solicitudesZona).find(x => x.id === id);
        if (!s) return null;
        const i = ETAPAS_SOLICITUD.indexOf(s.estado);
        if (i >= 0 && i < ETAPAS_SOLICITUD.length - 1) s.estado = ETAPAS_SOLICITUD[i + 1];
        this.guardarTodo(data);
        if (MODO_NUBE) {
            Nube.enSegundoPlano(() => Nube.actualizar('solicitudes', `id=eq.${Nube.uuidDe(id, 'solicitud')}`, { estado: s.estado }), 'No se pudo cambiar el estado');
        }
        return s;
    }

    /** El usuario se compromete a apoyar una solicitud de la zona. */
    apoyarSolicitud(id) {
        if (MODO_NUBE) {
            // El servidor decide (no permite apoyar la propia solicitud ni dos veces); luego se recarga todo.
            return (async () => {
                await Nube.rpc('apoyar_solicitud', { p_solicitud: Nube.uuidDe(id, 'solicitud') });
                await Nube.sincronizar(true);
                return this.buscarSolicitud(id);
            })();
        }
        const data = this.obtenerTodo();
        const s = data.solicitudesZona.find(x => x.id === id);
        if (!s) return null;
        if (!data.misApoyos.includes(id)) data.misApoyos.unshift(id);
        if (s.estado === 'Activa') s.estado = 'En coordinación';
        data.usuario.puntosAyuda += 10;
        this.guardarTodo(data);
        return s;
    }

    /* ---------- Ofertas ---------- */
    obtenerOfertas() {
        return this.obtenerTodo().ofertas;
    }

    agregarOferta(nuevaOferta) {
        if (MODO_NUBE) {
            return Nube.crearOferta(nuevaOferta).then(of => {
                const d = this.obtenerTodo();
                d.ofertas.unshift(of);
                this.guardarTodo(d);
                return of;
            });
        }
        const db = this.obtenerTodo();
        const ofertaConId = {
            id: `OFE-${String(db.ofertas.length + 1).padStart(3, '0')}`,
            fecha: 'Hace un momento',
            ...nuevaOferta
        };
        db.ofertas.unshift(ofertaConId);
        this.guardarTodo(db);
        return ofertaConId;
    }

    /** Pausa o reactiva una oferta propia (pantalla 29). */
    alternarOferta(id) {
        const data = this.obtenerTodo();
        const o = data.ofertas.find(x => x.id === id);
        if (!o) return null;
        o.pausada = !o.pausada;
        this.guardarTodo(data);
        if (MODO_NUBE) Nube.enSegundoPlano(() => Nube.actualizar('ofertas', `id=eq.${id}`, { pausada: o.pausada }), 'No se pudo cambiar la oferta');
        return o;
    }

    retirarOferta(id) {
        const data = this.obtenerTodo();
        data.ofertas = data.ofertas.filter(x => x.id !== id);
        this.guardarTodo(data);
        if (MODO_NUBE) Nube.enSegundoPlano(() => Nube.borrar('ofertas', `id=eq.${id}`), 'No se pudo retirar la oferta');
    }

    /* ---------- Notificaciones ---------- */
    obtenerNotificaciones() {
        return this.obtenerTodo().notificaciones;
    }

    contarNoLeidas() {
        return this.obtenerNotificaciones().filter(n => !n.leida).length;
    }

    marcarNotificacionLeida(id) {
        const data = this.obtenerTodo();
        const n = data.notificaciones.find(x => x.id === id);
        if (n) n.leida = true;
        this.guardarTodo(data);
        if (MODO_NUBE && n) Nube.enSegundoPlano(() => Nube.actualizar('notificaciones', `id=eq.${id}`, { leida: true }), 'No se pudo marcar como leída');
    }

    marcarTodasLeidas() {
        const data = this.obtenerTodo();
        data.notificaciones.forEach(n => { n.leida = true; });
        this.guardarTodo(data);
        if (MODO_NUBE) {
            Nube.enSegundoPlano(() => Nube.pedir('/rest/v1/notificaciones?leida=eq.false', { metodo: 'PATCH', cuerpo: { leida: true } }),
                'No se pudieron marcar como leídas');
        }
    }

    /* ---------- Zonas seguras (refugios, acopio, puntos de reunión, salud) ---------- */
    obtenerZonasSeguras() {
        return this.obtenerTodo().zonasSeguras || [];
    }

    /** Coordinación agrega una zona. En la nube se guarda en la tabla zonas_seguras. Devuelve una promesa. */
    crearZonaSegura(z) {
        const limpia = {
            nombre: String(z.nombre || '').trim().slice(0, 80), categoria: z.categoria || 'refugio',
            descripcion: String(z.descripcion || '').trim().slice(0, 300), direccion: String(z.direccion || '').trim().slice(0, 160),
            distrito: String(z.distrito || '').trim().slice(0, 60), lat: Math.round(Number(z.lat) * 100000) / 100000,
            lon: Math.round(Number(z.lon) * 100000) / 100000, estado: z.estado || 'Activo',
            capacidad: z.capacidad === '' || z.capacidad == null || isNaN(Number(z.capacidad)) ? null : Math.max(0, Math.round(Number(z.capacidad))),
            horario: String(z.horario || '').trim().slice(0, 80)
        };
        const guardar = (zona) => { const d = this.obtenerTodo(); d.zonasSeguras = d.zonasSeguras || []; d.zonasSeguras.push(zona); this.guardarTodo(d); return zona; };
        if (MODO_NUBE) {
            return Nube.insertar('zonas_seguras', {
                ...limpia, descripcion: limpia.descripcion || null, direccion: limpia.direccion || null,
                distrito: limpia.distrito || null, horario: limpia.horario || null
            }).then(fila => guardar(Nube.aZona(fila)));
        }
        return Promise.resolve(guardar({ id: 'ZN-' + Date.now().toString(36), ...limpia }));
    }

    cambiarEstadoZona(id, estado) {
        const data = this.obtenerTodo();
        const z = (data.zonasSeguras || []).find(x => x.id === id);
        if (!z) return null;
        const antes = z.estado;
        z.estado = estado;
        this.guardarTodo(data);
        if (MODO_NUBE) Nube.enSegundoPlano(() => Nube.actualizar('zonas_seguras', `id=eq.${id}`, { estado }), 'No se pudo cambiar el estado de la zona');
        return antes;
    }

    eliminarZonaSegura(id) {
        const data = this.obtenerTodo();
        data.zonasSeguras = (data.zonasSeguras || []).filter(x => x.id !== id);
        this.guardarTodo(data);
        if (MODO_NUBE) Nube.enSegundoPlano(() => Nube.borrar('zonas_seguras', `id=eq.${id}`), 'No se pudo borrar la zona');
    }

    /* ---------- Comunidad ---------- */
    obtenerVoluntarios() {
        return this.obtenerTodo().voluntarios;
    }

    obtenerVoluntario(id) {
        return this.obtenerVoluntarios().find(v => v.id === id) || null;
    }

    obtenerPublicaciones() {
        return this.obtenerTodo().publicaciones;
    }

    /**
     * Publica en la comunidad. `foto` (opcional) = { url: dataURL para mostrarla al instante, blob: archivo ya reducido }.
     */
    agregarPublicacion(texto, foto = null) {
        const data = this.obtenerTodo();
        const u = data.usuario;
        const id = 'PUB-' + Date.now().toString(36);
        const pub = {
            id, autor: (u.nombreVisible || (u.nombre + ' ' + u.apellido)).trim(), texto, fecha: 'Hace un momento',
            meGusta: 0, miMeGusta: false, fotoUrl: foto ? foto.url : '', comentarios: [], totalComentarios: 0, mia: true
        };
        data.publicaciones.unshift(pub);
        this.guardarTodo(data);
        if (MODO_NUBE) {
            // La publicación aparece al instante; el servidor le da su identificador definitivo al sincronizar.
            Nube.enSegundoPlano(async () => {
                const ruta = foto && foto.blob ? await Nube.subirFoto(foto.blob) : null;
                await Nube.insertar('publicaciones', ruta ? { texto, foto_ruta: ruta } : { texto });
                await Nube.sincronizar(true);
                app.alActualizarNube(true);
            }, 'No se pudo publicar');
        } else if (!app.embed) {
            this._simularVecinos(id);
        }
        return pub;
    }

    /**
     * Solo en la demostración (no hay otras personas): un vecino de ejemplo reacciona a tu publicación
     * para que se vean los avisos de "me gusta" y de comentarios.
     */
    _simularVecinos(pubId) {
        const aviso = (retraso, titulo, detalle, icono, color, alMostrar) => setTimeout(() => {
            const data = this.obtenerTodo();
            const p = data.publicaciones.find(x => x.id === pubId);
            if (!p) return;
            alMostrar(p);
            data.notificaciones.unshift({
                id: 'NOT-' + Date.now().toString(36), icono, color, titulo, detalle, fecha: 'Hace un momento',
                leida: false, ruta: 'comunidad', objetivoId: pubId
            });
            this.guardarTodo(data);
            if (typeof app !== 'undefined' && app.sesionActiva()) { UI.toast(titulo); app.alActualizarNube(); }
        }, retraso);
        aviso(7000, 'Le gustó tu publicación', 'Ana Torres (ejemplo) le dio me gusta a tu publicación.', 'fa-heart', 'bg-pink-600', (p) => { p.meGusta += 1; });
        aviso(14000, 'Comentaron tu publicación', 'Carlos Ramos (ejemplo) comentó: ¡Cuenta conmigo para ayudar!', 'fa-comment', 'bg-sky-600', (p) => {
            p.comentarios = p.comentarios || [];
            p.comentarios.push({ id: 'COM-' + Date.now().toString(36), autor: 'Carlos Ramos', texto: '¡Cuenta conmigo para ayudar!', fecha: 'Hace un momento', mio: false });
            p.totalComentarios = p.comentarios.length;
        });
    }

    /** Borra una publicación (con su foto y comentarios). Devuelve true si se pudo. */
    eliminarPublicacion(id) {
        const data = this.obtenerTodo();
        const p = data.publicaciones.find(x => x.id === id);
        if (!p) return false;
        if (MODO_NUBE && String(id).startsWith('PUB-')) { UI.toast('Tu publicación se está guardando. Inténtalo en unos segundos.'); return false; }
        data.publicaciones = data.publicaciones.filter(x => x.id !== id);
        this.guardarTodo(data);
        if (MODO_NUBE) {
            Nube.enSegundoPlano(async () => {
                await Nube.borrar('publicaciones', `id=eq.${id}`);
                if (p.fotoRuta) { try { await Nube.borrarFoto(p.fotoRuta); } catch (e) { /* la publicación ya se borró */ } }
                await Nube.sincronizar(true);
                app.alActualizarNube();
            }, 'No se pudo borrar la publicación');
        }
        return true;
    }

    /** Borra un comentario. Devuelve true si se pudo. */
    eliminarComentario(pubId, comId) {
        const data = this.obtenerTodo();
        const p = data.publicaciones.find(x => x.id === pubId);
        if (!p) return false;
        if (MODO_NUBE && String(comId).startsWith('COM-')) { UI.toast('Tu comentario se está guardando. Inténtalo en unos segundos.'); return false; }
        p.comentarios = (p.comentarios || []).filter(c => c.id !== comId);
        p.totalComentarios = p.comentarios.length;
        this.guardarTodo(data);
        if (MODO_NUBE) {
            Nube.enSegundoPlano(async () => { await Nube.borrar('comentarios', `id=eq.${comId}`); await Nube.sincronizar(true); app.alActualizarNube(); },
                'No se pudo borrar el comentario');
        }
        return true;
    }

    /** Comenta una publicación. Devuelve el comentario, o null si no se pudo. */
    agregarComentario(pubId, texto) {
        const data = this.obtenerTodo();
        const p = data.publicaciones.find(x => x.id === pubId);
        if (!p) return null;
        if (MODO_NUBE && String(pubId).startsWith('PUB-')) { UI.toast('Tu publicación se está guardando. Inténtalo en unos segundos.'); return null; }
        const u = data.usuario;
        const com = {
            id: 'COM-' + Date.now().toString(36), autor: (u.nombreVisible || u.nombre || 'Yo'), texto,
            fecha: 'Hace un momento', mio: true
        };
        p.comentarios = p.comentarios || [];
        p.comentarios.push(com);
        p.totalComentarios = p.comentarios.length;
        this.guardarTodo(data);
        if (MODO_NUBE) {
            Nube.enSegundoPlano(async () => { await Nube.insertar('comentarios', { publicacion_id: pubId, texto }); await Nube.sincronizar(true); app.alActualizarNube(); },
                'No se pudo comentar');
        }
        return com;
    }

    alternarMeGusta(id) {
        const data = this.obtenerTodo();
        const p = data.publicaciones.find(x => x.id === id);
        if (!p) return null;
        if (MODO_NUBE && String(id).startsWith('PUB-')) { UI.toast('Tu publicación se está guardando. Inténtalo en unos segundos.'); return null; }
        p.miMeGusta = !p.miMeGusta;
        p.meGusta += p.miMeGusta ? 1 : -1;
        this.guardarTodo(data);
        if (MODO_NUBE && !String(id).startsWith('PUB-')) {  // 'PUB-…' = publicación recién creada, aún sin identificador del servidor
            Nube.enSegundoPlano(() => p.miMeGusta
                ? Nube.insertar('me_gusta', { publicacion_id: id })
                : Nube.borrar('me_gusta', `publicacion_id=eq.${id}&usuario_id=eq.${Nube.sesion.usuarioId}`), 'No se pudo registrar tu "me gusta"');
        }
        return p;
    }

    /* ---------- Coordinación ---------- */
    /** Asigna voluntarios a una emergencia o solicitud y la pasa a "En atención" si estaba pendiente. */
    asignarVoluntarios(tipo, objetivoId, idsVoluntarios) {
        if (MODO_NUBE) {
            return (async () => {
                await Nube.rpc('asignar_voluntarios', { p_tipo: tipo, p_id: Nube.uuidDe(objetivoId, tipo), p_voluntarios: idsVoluntarios });
                await Nube.sincronizar(true);
            })();
        }
        const data = this.obtenerTodo();
        idsVoluntarios.forEach(vid => {
            data.asignaciones.unshift({ id: 'ASG-' + String(data.asignaciones.length + 1).padStart(3, '0'), tipo, objetivoId, voluntarioId: vid, fecha: 'Hace un momento' });
        });
        if (tipo === 'reporte') {
            const r = data.reportes.concat(data.reportesZona).find(x => x.id === objetivoId);
            if (r && (r.estado === 'Pendiente' || r.estado === 'En revisión' || r.estado === 'Verificado')) r.estado = 'En atención';
        } else {
            const s = data.solicitudes.concat(data.solicitudesZona).find(x => x.id === objetivoId);
            if (s && (s.estado === 'Activa' || s.estado === 'En coordinación')) s.estado = 'En atención';
        }
        this.guardarTodo(data);
    }
}

const db = new BaseDatos();
