/**
 * Componente: Vista "12. Mapa solidario" con Leaflet.js
 */

const MapaSolidarioComponent = {
    mapaInstance: null,
    markersLayer: null,
    eventos: [
        {
            id: 1,
            titulo: 'Huayco en Chaclacayo',
            descripcion: 'Desprendimiento de lodo y piedras en el km 24 de la Carretera Central. Tránsito interrumpido parcialmente y riesgo para viviendas cercanas.',
            nivel: 'Alto',
            tiempo: 'Hace 25 min',
            categoria: 'huayco',
            ubicacion: 'Km 24 Carretera Central, Chaclacayo',
            estado: 'Pendiente',
            alertas: ['Evita transitar por la Carretera Central en el tramo afectado.', 'Brigadas municipales en evaluación preliminar.'],
            lat: -11.9765,
            lng: -76.7760,
            iconoColor: '#D91424',
            faIcon: 'fa-mountain'
        },
        {
            id: 2,
            titulo: 'Inundación por desborde',
            descripcion: 'Acumulación de agua pluvial y aniego en viviendas cercanas al malecón de Chosica. Se recomienda proteger pertenencias y seguir indicaciones locales.',
            nivel: 'Medio',
            tiempo: 'Hace 1 hora',
            categoria: 'inundacion',
            ubicacion: 'Malecón de Chosica, Lima Este',
            estado: 'Verificado',
            alertas: ['Mantén documentos importantes en lugar seco.', 'Reporta zonas con mayor acumulación de agua.'],
            lat: -11.9438,
            lng: -76.7081,
            iconoColor: '#0284c7',
            faIcon: 'fa-water'
        },
        {
            id: 4,
            titulo: 'Deslizamiento en Ate',
            descripcion: 'Caída de piedras menor en la zona de Huaycán. Personal municipal en camino para evaluación y limpieza preventiva.',
            nivel: 'Medio',
            tiempo: 'Hace 40 min',
            categoria: 'huayco',
            ubicacion: 'Huaycán, Ate',
            estado: 'Pendiente',
            alertas: ['Precaución al circular por vías altas.'],
            lat: -12.0333,
            lng: -76.8500,
            iconoColor: '#D91424',
            faIcon: 'fa-mountain'
        },
    ],

    /** Convierte las zonas seguras al formato de los pines del mapa. */
    zonasComoEventos: (zonas) => {
        const CAT = {
            refugio: { color: '#059669', icono: 'fa-house-chimney-medical', etiqueta: 'Refugio' },
            acopio: { color: '#b45309', icono: 'fa-boxes-packing', etiqueta: 'Centro de acopio' },
            reunion: { color: '#1B5FB5', icono: 'fa-people-roof', etiqueta: 'Punto de reunión' },
            salud: { color: '#0f766e', icono: 'fa-kit-medical', etiqueta: 'Atención de salud' }
        };
        return (zonas || []).filter(z => Number.isFinite(z.lat) && Number.isFinite(z.lon)).map(z => {
            const c = CAT[z.categoria] || CAT.refugio;
            const detalles = [];
            if (z.capacidad) detalles.push(`Capacidad aproximada: ${z.capacidad} personas.`);
            if (z.direccion) detalles.push(`Dirección: ${z.direccion}.`);
            if (z.estado === 'Lleno') detalles.push('Está llena: confirma con coordinación antes de ir o busca otra zona segura cercana.');
            if (z.estado === 'Cerrado') detalles.push('Está cerrada por ahora. Busca otra zona segura cercana.');
            return {
                id: 'zona-' + z.id,
                titulo: z.nombre,
                descripcion: z.descripcion || c.etiqueta + ' habilitado por la comunidad y coordinación.',
                nivel: z.estado === 'Activo' ? 'Seguro' : 'Medio',
                etiquetaNivel: z.estado === 'Activo' ? 'Zona segura' : (z.estado === 'Lleno' ? 'Zona llena' : 'Zona cerrada'),
                tiempo: z.horario || 'Zona segura',
                categoria: 'refugio',
                categoriaEtiqueta: c.etiqueta,
                ubicacion: [z.direccion, z.distrito].filter(Boolean).join(', ') || 'Lima',
                estado: z.estado,
                alertas: detalles,
                lat: z.lat,
                lng: z.lon,
                iconoColor: z.estado === 'Cerrado' ? '#6b7280' : (z.estado === 'Lleno' ? '#d97706' : c.color),
                faIcon: c.icono
            };
        });
    },
    render: () => {
        // Permitir que el DOM renderice el contenedor antes de inicializar Leaflet
        setTimeout(() => {
            MapaSolidarioComponent.initMap();
        }, 100);

        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                
                <!-- Encabezado de la Vista -->
                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <div class="flex items-center justify-between mb-2">
                        <h2 class="text-base font-bold text-slate-800 flex items-center">
                            <i class="fa-solid fa-map-location-dot text-peru-red mr-2"></i> Mapa Solidario e Incidencias
                        </h2>
                        <span class="bg-red-50 text-peru-red font-bold text-[10px] px-2.5 py-1 rounded-full border border-red-200 flex items-center">
                            <i class="fa-solid fa-circle text-[6px] mr-1 text-red-600 animate-ping"></i> En Vivo
                        </span>
                    </div>
                    <p class="text-xs text-slate-500 mb-3">
                        Visualiza alertas en tiempo real, zonas de riesgo y zonas seguras (refugios, centros de acopio, puntos de reunión y atención de salud) en tu localidad mediante mapas interactivos.
                    </p>

                    <!-- Filtros Rápidos -->
                    <div class="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
                        <button onclick="MapaSolidarioComponent.filtrar('todos', this)" class="filtro-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-peru-red text-white shadow-sm whitespace-nowrap transition">
                            Todos
                        </button>
                        <button onclick="MapaSolidarioComponent.filtrar('huayco', this)" class="filtro-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap transition">
                            <i class="fa-solid fa-mountain text-amber-600 mr-1"></i> Huaycos
                        </button>
                        <button onclick="MapaSolidarioComponent.filtrar('inundacion', this)" class="filtro-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap transition">
                            <i class="fa-solid fa-water text-sky-600 mr-1"></i> Inundaciones
                        </button>
                        <button onclick="MapaSolidarioComponent.filtrar('refugio', this)" class="filtro-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap transition">
                            <i class="fa-solid fa-house-chimney-medical text-emerald-600 mr-1"></i> Zonas seguras
                        </button>
                    </div>
                </div>

                <!-- Contenedor del Mapa Interactivo Leaflet -->
                <div class="relative w-full h-[380px] bg-slate-200 rounded-2xl overflow-hidden shadow-inner border border-slate-300">
                    <div id="leaflet-map-element" class="w-full h-full z-10"></div>

                    <!-- Controles flotantes de zoom y ubicación -->
                    <div class="absolute bottom-4 right-4 flex flex-col space-y-2 z-20">
                        <button onclick="MapaSolidarioComponent.centrarUbicacionActual()" class="w-10 h-10 bg-white text-slate-700 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition border border-slate-200" title="Mi Ubicación">
                            <i class="fa-solid fa-crosshairs text-sm text-peru-red"></i>
                        </button>
                    </div>

                    <!-- Tarjeta Flotante de Detalle (Dinámica) - Vista 13: Detalle del punto -->
                    <div id="map-detail-card" class="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl border-t border-slate-200 hidden z-[1000] max-h-[75%] overflow-y-auto">
                        <div class="p-4 space-y-3">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-2">
                                    <span class="bg-red-50 text-peru-red text-[10px] font-bold px-2 py-1 rounded-full border border-red-100">Pantalla 13</span>
                                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Detalle del punto</span>
                                </div>
                                <button onclick="MapaSolidarioComponent.cerrarDetalle()" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center">
                                    <i class="fa-solid fa-xmark text-sm"></i>
                                </button>
                            </div>
                            <div>
                                <h4 id="detail-title" class="text-sm font-extrabold text-slate-900 leading-tight">Título del Evento</h4>
                                <div class="flex items-center flex-wrap gap-2 mt-2">
                                    <span id="detail-badge" class="px-2.5 py-1 rounded-full font-bold text-[10px] bg-red-100 text-red-700">Nivel: Alto</span>
                                    <span id="detail-estado" class="px-2.5 py-1 rounded-full font-bold text-[10px] bg-amber-100 text-amber-700 hidden">Estado</span>
                                    <span id="detail-time" class="text-[10px] text-slate-400 font-medium"><i class="fa-regular fa-clock mr-1"></i>Hace 25 min</span>
                                </div>
                            </div>
                            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Descripción</p>
                                <p id="detail-desc" class="text-xs text-slate-700 leading-relaxed">Descripción detallada del evento registrado en el mapa.</p>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                    <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ubicación</p>
                                    <p id="detail-ubicacion" class="text-xs font-semibold text-slate-800"><i class="fa-solid fa-location-dot text-peru-red mr-1"></i>Lima</p>
                                </div>
                                <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                    <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Categoría</p>
                                    <p id="detail-categoria" class="text-xs font-semibold text-slate-800">Emergencia</p>
                                </div>
                            </div>
                            <div id="detail-alertas-wrap" class="hidden">
                                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Alertas relacionadas</p>
                                <div id="detail-alertas" class="space-y-1.5"></div>
                            </div>
                            <div class="flex gap-2 pt-1">
                                <button onclick="app.navegar('reportar')" class="flex-1 bg-peru-red hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition">
                                    <i class="fa-solid fa-triangle-exclamation mr-1"></i> Reportar cerca
                                </button>
                                <button onclick="MapaSolidarioComponent.cerrarDetalle()" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition">
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                    <div id="map-detail-backdrop" class="absolute inset-0 bg-slate-900/20 hidden z-[999]" onclick="MapaSolidarioComponent.cerrarDetalle()"></div>
                </div>

                <!-- Leyenda Informativa -->
                <div class="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-around text-center">
                    <div>
                        <div class="w-3 h-3 bg-peru-red rounded-full mx-auto mb-1"></div>
                        <span class="text-[10px] font-bold text-slate-700">Riesgo Alto</span>
                    </div>
                    <div>
                        <div class="w-3 h-3 bg-sky-600 rounded-full mx-auto mb-1"></div>
                        <span class="text-[10px] font-bold text-slate-700">Aniego</span>
                    </div>
                    <div>
                        <div class="w-3 h-3 bg-emerald-600 rounded-full mx-auto mb-1"></div>
                        <span class="text-[10px] font-bold text-slate-700">Zona segura</span>
                    </div>
                </div>

            </div>
        `;
    },

    // Centro aproximado de cada distrito (los reportes no guardan un punto exacto, solo el distrito).
    centros: {
        'Chaclacayo': [-11.9753, -76.7686], 'Lurigancho-Chosica': [-11.9438, -76.7081], 'Lurigancho': [-11.9438, -76.7081], 'Ate': [-12.0258, -76.9139],
        'Cieneguilla': [-12.0820, -76.7770], 'Santa Anita': [-12.0436, -76.9703], 'Cercado de Lima': [-12.0464, -77.0428],
        'Miraflores': [-12.1211, -77.0297], 'San Juan de Lurigancho': [-11.9900, -77.0000]
    },

    // Centro aproximado de cada departamento (su capital). Se usa cuando no se conoce el punto del distrito.
    centrosDepartamento: {
        'Amazonas': [-6.23, -77.87], 'Áncash': [-9.53, -77.53], 'Apurímac': [-13.64, -72.88], 'Arequipa': [-16.40, -71.54],
        'Ayacucho': [-13.16, -74.22], 'Cajamarca': [-7.16, -78.51], 'Callao': [-12.05, -77.12], 'Cusco': [-13.53, -71.97],
        'Huancavelica': [-12.79, -74.98], 'Huánuco': [-9.93, -76.24], 'Ica': [-14.07, -75.73], 'Junín': [-12.07, -75.21],
        'La Libertad': [-8.11, -79.03], 'Lambayeque': [-6.77, -79.84], 'Lima': [-12.05, -77.04], 'Loreto': [-3.75, -73.25],
        'Madre de Dios': [-12.59, -69.19], 'Moquegua': [-17.19, -70.93], 'Pasco': [-10.68, -76.26], 'Piura': [-5.19, -80.63],
        'Puno': [-15.84, -70.02], 'San Martín': [-6.03, -76.97], 'Tacna': [-18.01, -70.25], 'Tumbes': [-3.57, -80.45],
        'Ucayali': [-8.38, -74.55]
    },

    /** Punto de referencia de un distrito: el suyo si lo conocemos; si no, la capital del departamento de la persona. */
    centroDe: (distrito) => {
        const m = MapaSolidarioComponent;
        const u = db.obtenerUsuario();
        return UI.puntoDeDistrito(distrito, u.departamento, u.provincia) || m.centros[distrito] || m.centrosDepartamento[u.departamento] || m.centros['Cercado de Lima'];
    },

    /**
     * Dónde abre el mapa: en la última ubicación real que la persona usó (botón de ubicación); si no la hay, en su distrito.
     * En la demostración (sin nube) y sin ubicación real se mantiene la vista de Lima, donde están los puntos de ejemplo.
     */
    vistaInicial: () => {
        const u = db.obtenerUsuario();
        if (u.coordenadas && typeof u.coordenadas.lat === 'number' && typeof u.coordenadas.lng === 'number') {
            return { centro: [u.coordenadas.lat, u.coordenadas.lng], zoom: 14, real: true };
        }
        if (!MODO_NUBE) return { centro: [-12.0464, -77.0428], zoom: 11, real: false };
        const punto = u.distrito ? UI.puntoDeDistrito(u.distrito, u.departamento, u.provincia) : null;
        if (punto) return { centro: punto, zoom: 13, real: false };
        const dep = MapaSolidarioComponent.centrosDepartamento[u.departamento];
        return dep ? { centro: dep, zoom: 11, real: false } : { centro: [-12.0464, -77.0428], zoom: 11, real: false };
    },

    miPosicionMarca: null,

    /** Punto azul "Tú estás aquí" con un círculo de unos 100 m (la ubicación es aproximada). */
    marcarMiPosicion: (punto) => {
        const m = MapaSolidarioComponent;
        if (!m.mapaInstance) return;
        if (m.miPosicionMarca) m.miPosicionMarca.remove();
        const icono = L.divIcon({
            className: 'custom-leaflet-marker',
            html: '<div style="width:18px;height:18px;border-radius:50%;background:#1d4ed8;border:3px solid #fff;box-shadow:0 0 0 6px rgba(29,78,216,.25)"></div>',
            iconSize: [18, 18], iconAnchor: [9, 9]
        });
        m.miPosicionMarca = L.marker([punto.lat, punto.lng], { icon: icono, interactive: false, keyboard: false }).addTo(m.mapaInstance);
    },

    /**
     * Posición del marcador. En modo local es aleatoria (como siempre). En la nube se usa el centro del distrito
     * con un pequeño desplazamiento fijo según el código del reporte, para que no se amontonen ni cambien de lugar.
     */
    posicion: (rep, indice) => {
        if (!MODO_NUBE) return { lat: -12.04 + (Math.random() * 0.08 - 0.04), lng: -77.04 + (Math.random() * 0.08 - 0.04) };
        if (typeof rep.lat === 'number' && typeof rep.lon === 'number') return { lat: rep.lat, lng: rep.lon };
        const centro = MapaSolidarioComponent.centroDe(rep.distrito);
        let h = 0;
        String(rep.id || indice).split('').forEach(c => { h = (h * 31 + c.charCodeAt(0)) % 9973; });
        return { lat: centro[0] + ((h % 100) / 100 - 0.5) * 0.014, lng: centro[1] + ((Math.floor(h / 100) % 100) / 100 - 0.5) * 0.014 };
    },

    initMap: () => {
        const container = document.getElementById('leaflet-map-element');
        if (!container) return;

        // Si ya existe una instancia previa, eliminarla para evitar duplicación al cambiar de ruta
        if (MapaSolidarioComponent.mapaInstance) {
            MapaSolidarioComponent.mapaInstance.remove();
            MapaSolidarioComponent.mapaInstance = null;
        }

        // El mapa abre donde está la persona (ubicación real o su distrito), no en un punto fijo de Lima.
        const vista = MapaSolidarioComponent.vistaInicial();
        const map = L.map('leaflet-map-element', {
            zoomControl: false
        }).setView(vista.centro, vista.zoom);

        // Añadir controles de zoom personalizados en la esquina superior derecha o inferior
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Capa de teselas (OpenStreetMap estilo limpio y claro)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Perú Vive'
        }).addTo(map);

        // Crear capa de grupo para los marcadores
        MapaSolidarioComponent.markersLayer = L.layerGroup().addTo(map);
        MapaSolidarioComponent.mapaInstance = map;
        MapaSolidarioComponent.miPosicionMarca = null;
        if (vista.real) MapaSolidarioComponent.marcarMiPosicion({ lat: vista.centro[0], lng: vista.centro[1] });

        // Renderizar todos los eventos iniciales
        MapaSolidarioComponent.renderizarMarcadores('todos');
    },

    renderizarMarcadores: (categoriaFiltro) => {
        if (!MapaSolidarioComponent.markersLayer) return;
        
        // Limpiar marcadores existentes
        MapaSolidarioComponent.markersLayer.clearLayers();

        // Obtener también reportes guardados en localStorage si existen para agregarlos al mapa
        let reportesLocal = [];
        try {
            // En la nube el mapa muestra los reportes de todas las personas; en modo local, solo los de este dispositivo.
            reportesLocal = typeof db !== 'undefined' && db.obtenerReportes
                ? (MODO_NUBE ? db.obtenerTodosReportes() : db.obtenerReportes())
                : [];
        } catch(e) {
            reportesLocal = [];
        }

        // Combinar eventos estáticos con reportes locales
        // Mapear reportes locales al formato de eventos
        const reportesMapeados = reportesLocal.map((rep, index) => {
            const tipo = (rep.tipo || '').toLowerCase();
            let categoria = 'huayco';
            let iconoColor = '#D91424';
            let faIcon = 'fa-triangle-exclamation';
            let categoriaEtiqueta = 'Emergencia reportada';
            if (tipo.includes('inund')) {
                categoria = 'inundacion'; iconoColor = '#0284c7'; faIcon = 'fa-water'; categoriaEtiqueta = 'Inundación / Anegamiento';
            } else if (tipo.includes('huayco') || tipo.includes('desliz')) {
                categoria = 'huayco'; iconoColor = '#D91424'; faIcon = 'fa-mountain'; categoriaEtiqueta = 'Huayco / Deslizamiento';
            } else if (tipo.includes('sismo')) {
                categoria = 'huayco'; iconoColor = '#d97706'; faIcon = 'fa-house-crack'; categoriaEtiqueta = 'Sismo / Movimiento telúrico';
            } else if (tipo.includes('incend')) {
                categoria = 'huayco'; iconoColor = '#dc2626'; faIcon = 'fa-fire-flame-curved'; categoriaEtiqueta = 'Incendio';
            }
            return {
                id: 'local-' + index,
                titulo: rep.tipo || 'Reporte Ciudadano',
                descripcion: rep.descripcion || 'Sin descripción adicional.',
                nivel: rep.nivel || 'Alto',
                tiempo: rep.fecha || 'Reciente',
                categoria,
                ubicacion: rep.ubicacion || 'Ubicación no especificada',
                estado: rep.estado || 'Pendiente',
                alertas: [MODO_NUBE
                    ? 'Reporte de un ciudadano, aún sin alerta oficial. La posición es aproximada (zona del distrito).'
                    : 'Reporte registrado por un ciudadano desde Perú Vive.'],
                ...MapaSolidarioComponent.posicion(rep, index),
                iconoColor,
                faIcon,
                categoriaEtiqueta
            };
        });

        // Zonas seguras (refugios, acopio, reunión, salud): en la nube vienen de la base; en la demostración, de los datos de ejemplo.
        const zonasMapeadas = MapaSolidarioComponent.zonasComoEventos(typeof db !== 'undefined' && db.obtenerZonasSeguras ? db.obtenerZonasSeguras() : []);

        // Los eventos fijos de abajo son de demostración: en la nube no se muestran para no confundirlos con alertas reales.
        const todosEventos = MODO_NUBE ? [...zonasMapeadas, ...reportesMapeados] : [...MapaSolidarioComponent.eventos, ...zonasMapeadas, ...reportesMapeados];

        todosEventos.forEach(evento => {
            if (categoriaFiltro !== 'todos' && evento.categoria !== categoriaFiltro) {
                return;
            }

            // Crear icono personalizado con FontAwesome
            const customHtml = `
                <div style="background-color: ${evento.iconoColor}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white; font-size: 14px;">
                    <i class="fa-solid ${evento.faIcon}"></i>
                </div>
            `;

            const customIcon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: customHtml,
                iconSize: [34, 34],
                iconAnchor: [17, 17],
                popupAnchor: [0, -18]
            });

            const marker = L.marker([evento.lat, evento.lng], { icon: customIcon });

            // Evento click en el marcador -> Vista 13 (detalle del punto / alertas)
            marker.on('click', () => {
                const etiquetaCategoria = evento.categoriaEtiqueta || {
                    huayco: 'Huayco / Deslizamiento',
                    inundacion: 'Inundación / Anegamiento',
                    refugio: 'Zona segura'
                }[evento.categoria] || 'Emergencia';

                MapaSolidarioComponent.mostrarDetalle(
                    evento.titulo,
                    evento.descripcion,
                    evento.nivel,
                    evento.tiempo,
                    {
                        ubicacion: evento.ubicacion,
                        estado: evento.estado,
                        categoriaEtiqueta: etiquetaCategoria,
                        etiquetaNivel: evento.etiquetaNivel,
                        alertas: evento.alertas
                    }
                );
            });

            MapaSolidarioComponent.markersLayer.addLayer(marker);
        });

        // La vista ya quedó en la zona de la persona (ver initMap); no se mueve al filtrar para no perderla de vista.
    },

    mostrarDetalle: (titulo, descripcion, nivel, tiempo, extra = {}) => {
        const card = document.getElementById('map-detail-card');
        const backdrop = document.getElementById('map-detail-backdrop');
        if (!card) return;

        document.getElementById('detail-title').innerText = titulo || 'Evento';
        document.getElementById('detail-desc').innerText = descripcion || 'Sin descripción disponible.';
        document.getElementById('detail-time').innerHTML = `<i class="fa-regular fa-clock mr-1"></i>${tiempo || 'Reciente'}`;
        document.getElementById('detail-ubicacion').innerHTML = `<i class="fa-solid fa-location-dot text-peru-red mr-1"></i>${extra.ubicacion || 'Lima Metropolitana'}`;
        document.getElementById('detail-categoria').innerText = extra.categoriaEtiqueta || 'Emergencia reportada';

        const badge = document.getElementById('detail-badge');
        badge.innerText = extra.etiquetaNivel || `Nivel: ${nivel || 'Medio'}`;
        if (nivel === 'Seguro') {
            badge.className = 'px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-700';
        } else if (nivel === 'Medio') {
            badge.className = 'px-2.5 py-1 rounded-full font-bold text-[10px] bg-amber-100 text-amber-700';
        } else {
            badge.className = 'px-2.5 py-1 rounded-full font-bold text-[10px] bg-red-100 text-red-700';
        }

        const estadoEl = document.getElementById('detail-estado');
        if (extra.estado) {
            estadoEl.innerText = `Estado: ${extra.estado}`;
            estadoEl.className = 'px-2.5 py-1 rounded-full font-bold text-[10px] bg-sky-100 text-sky-700';
            estadoEl.classList.remove('hidden');
        } else {
            estadoEl.classList.add('hidden');
        }

        const alertasWrap = document.getElementById('detail-alertas-wrap');
        const alertasEl = document.getElementById('detail-alertas');
        const alertas = Array.isArray(extra.alertas) ? extra.alertas : [];
        if (alertas.length && alertasEl && alertasWrap) {
            alertasEl.innerHTML = alertas.map(a => `
                <div class="flex items-start space-x-2 bg-amber-50 border border-amber-100 rounded-lg p-2">
                    <i class="fa-solid fa-bullhorn text-amber-600 text-[10px] mt-0.5"></i>
                    <span class="text-[11px] text-amber-900">${a}</span>
                </div>
            `).join('');
            alertasWrap.classList.remove('hidden');
        } else if (alertasWrap) {
            alertasWrap.classList.add('hidden');
        }

        card.classList.remove('hidden');
        if (backdrop) backdrop.classList.remove('hidden');
    },

    cerrarDetalle: () => {
        const card = document.getElementById('map-detail-card');
        const backdrop = document.getElementById('map-detail-backdrop');
        if (card) card.classList.add('hidden');
        if (backdrop) backdrop.classList.add('hidden');
    },

    filtrar: (categoria, botonActivo = null) => {
        // Actualizar estados visuales de botones de filtro
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.className = 'filtro-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap transition';
        });
        const boton = botonActivo || (typeof event !== 'undefined' ? event.currentTarget : null);
        if (boton) {
            boton.className = 'filtro-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-peru-red text-white shadow-sm whitespace-nowrap transition';
        }

        // Renderizar marcadores filtrados en Leaflet
        MapaSolidarioComponent.renderizarMarcadores(categoria);
        MapaSolidarioComponent.cerrarDetalle();
    },

    /** Botón de la mira: pide la ubicación real del teléfono, centra el mapa ahí y la recuerda para la próxima vez. */
    centrarUbicacionActual: async () => {
        const m = MapaSolidarioComponent;
        if (!m.mapaInstance) return;
        UI.toast('Buscando tu ubicación…');
        try {
            const p = await UI.geolocalizar();
            const punto = { lat: Math.round(p.lat * 1000) / 1000, lng: Math.round(p.lng * 1000) / 1000 }; // ≈110 m
            db.actualizarUsuario({ coordenadas: punto });
            m.marcarMiPosicion(punto);
            m.mapaInstance.setView([punto.lat, punto.lng], 15, { animate: true });
            const z = UI.zonaCercana(p.lat, p.lng);
            const cerca = z && z.km <= 60;
            m.mostrarDetalle(
                'Tu ubicación actual',
                cerca
                    ? `Estás cerca de ${z.distrito} (${z.provincia}, ${z.departamento})${p.antigua ? ', según la última ubicación guardada en tu teléfono' : ''}. Es una posición aproximada.`
                    : 'Posición aproximada de tu teléfono. Está lejos de los distritos del Perú de la lista.',
                'Seguro',
                p.antigua ? 'Última ubicación guardada' : 'Ahora mismo',
                {
                    ubicacion: cerca ? UI.textoZona(z) : 'Ubicación aproximada',
                    estado: 'Ubicación del teléfono',
                    categoriaEtiqueta: 'Tu ubicación',
                    alertas: ['Si esta no es tu zona de siempre, cámbiala en Inicio → Cambiar.']
                }
            );
        } catch (e) {
            UI.toast(e.message);
        }
    }
};
