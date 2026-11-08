/**
 * Componente: Flujo completo "Reportar Emergencia" (Pantallas 13 a 17)
 * - 13: Detalle del punto / Alertas recientes
 * - 14: Seleccionar tipo de emergencia
 * - 15: Describir la emergencia y adjuntar foto (simulado)
 * - 16: Confirmar ubicación
 * - 17: Confirmación y registro en localStorage
 */

const ReportarEmergenciaComponent = {
    pasoActual: 1,
    datosReporte: {
        tipo: '',
        descripcion: '',
        fotoUrl: '',
        ubicacion: '',
        coordenadas: null
    },

    iniciar: () => {
        ReportarEmergenciaComponent.pasoActual = 1;
        ReportarEmergenciaComponent.datosReporte = {
            tipo: '',
            descripcion: '',
            fotoUrl: '',
            ubicacion: db.obtenerUsuario().ubicacion || '', // la zona que la persona eligió en su perfil
            coordenadas: null,
            zona: null
        };
        ReportarEmergenciaComponent.renderizarPaso();
    },

    renderizarPaso: () => {
        const contenedor = document.getElementById('router-view');
        if (!contenedor) return;
        contenedor.innerHTML = ReportarEmergenciaComponent.obtenerHtmlPaso(ReportarEmergenciaComponent.pasoActual);
        contenedor.scrollTop = 0;
    },

    obtenerHtmlPaso: (paso) => {
        switch (paso) {
            case 1: return ReportarEmergenciaComponent.renderPantalla13();
            case 2: return ReportarEmergenciaComponent.renderPantalla14();
            case 3: return ReportarEmergenciaComponent.renderPantalla15();
            case 4: return ReportarEmergenciaComponent.renderPantalla16();
            case 5: return ReportarEmergenciaComponent.renderPantalla17();
            default: return ReportarEmergenciaComponent.renderPantalla13();
        }
    },

    renderEncabezadoFlujo: (titulo, subtitulo, paso, total = 4) => `
        <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between mb-2">
                <button onclick="ReportarEmergenciaComponent.retroceder()" class="text-slate-500 hover:text-peru-red text-sm font-semibold flex items-center">
                    <i class="fa-solid fa-chevron-left mr-1"></i> Atrás
                </button>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paso ${paso} de ${total}</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                <div class="bg-peru-red h-1.5 rounded-full transition-all" style="width: ${(paso / total) * 100}%"></div>
            </div>
            <h2 class="text-base font-bold text-slate-800">${titulo}</h2>
            <p class="text-xs text-slate-500 mt-1">${subtitulo}</p>
        </div>
    `,

    // Pantalla 13: Detalle del punto / Alertas
    renderPantalla13: () => {
        const reportes = db.obtenerReportes().slice(0, 2);
        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <div class="flex items-center justify-between mb-2">
                        <button onclick="app.navegar('inicio')" class="text-slate-500 hover:text-peru-red text-sm font-semibold flex items-center">
                            <i class="fa-solid fa-chevron-left mr-1"></i> Inicio
                        </button>
                        <span class="bg-red-50 text-peru-red text-[10px] font-bold px-2 py-1 rounded-full border border-red-100">Pantalla 13</span>
                    </div>
                    <h2 class="text-base font-bold text-slate-800 flex items-center">
                        <i class="fa-solid fa-location-crosshairs text-peru-red mr-2"></i> Detalle del Punto y Alertas
                    </h2>
                    <p class="text-xs text-slate-500 mt-1">Revisa alertas activas cerca de tu zona antes de reportar una nueva emergencia.</p>
                </div>

                <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 text-white shadow-md">
                    <div class="flex items-start justify-between">
                        <div>
                            <p class="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">Zona monitoreada</p>
                            <h3 class="text-sm font-bold mt-0.5">${UI.esc(db.obtenerUsuario().ubicacion || 'Tu zona')}</h3>
                            <p class="text-xs text-slate-300 mt-1"><i class="fa-solid fa-shield-halved text-yellow-400 mr-1"></i> ${db.obtenerTodosReportes().filter(r => r.estado !== 'Resuelto').length} alertas activas registradas</p>
                        </div>
                        <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <i class="fa-solid fa-map-pin text-yellow-400"></i>
                        </div>
                    </div>
                </div>

                <div class="space-y-2.5">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Alertas recientes en la zona</h3>
                    ${reportes.map(r => `
                        <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                            <div class="flex justify-between items-center mb-1">
                                <span class="font-bold text-xs text-slate-900">${r.tipo}</span>
                                <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700">${r.estado}</span>
                            </div>
                            <p class="text-xs text-slate-600 line-clamp-2">${r.descripcion}</p>
                            <span class="text-[10px] text-slate-400 mt-1 block"><i class="fa-solid fa-clock mr-1"></i>${r.fecha}</span>
                        </div>
                    `).join('')}
                </div>

                <button onclick="ReportarEmergenciaComponent.avanzar()" class="w-full bg-peru-red hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition flex items-center justify-center">
                    <i class="fa-solid fa-triangle-exclamation mr-2"></i> Reportar nueva emergencia
                </button>
            </div>
        `;
    },

    // Pantalla 14: Seleccionar tipo de emergencia
    renderPantalla14: () => {
        const tipos = [
            { valor: 'Sismo', icono: 'fa-house-crack', color: 'bg-amber-500', desc: 'Movimiento telúrico o temblor' },
            { valor: 'Huayco', icono: 'fa-mountain', color: 'bg-orange-600', desc: 'Deslizamiento de lodo y piedras' },
            { valor: 'Inundación', icono: 'fa-water', color: 'bg-sky-600', desc: 'Desborde, aniego o acumulación de agua' },
            { valor: 'Incendio', icono: 'fa-fire-flame-curved', color: 'bg-red-600', desc: 'Fuego urbano, forestal o estructural' }
        ];
        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${ReportarEmergenciaComponent.renderEncabezadoFlujo(
                    'Seleccionar tipo de emergencia',
                    'Elige la categoría que mejor describa la situación que deseas reportar.',
                    1, 4
                )}
                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-[10px] font-bold text-slate-400 uppercase">Pantalla 14</span>
                    </div>
                    ${tipos.map(t => `
                        <button onclick="ReportarEmergenciaComponent.seleccionarTipo('${t.valor}')" class="w-full flex items-center p-3.5 rounded-xl border-2 transition text-left ${ReportarEmergenciaComponent.datosReporte.tipo === t.valor ? 'border-peru-red bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}">
                            <div class="w-11 h-11 ${t.color} text-white rounded-xl flex items-center justify-center text-lg mr-3 shadow-sm flex-shrink-0">
                                <i class="fa-solid ${t.icono}"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="text-sm font-bold text-slate-900">${t.valor}</h4>
                                <p class="text-xs text-slate-500">${t.desc}</p>
                            </div>
                            <i class="fa-solid fa-circle-check text-lg ${ReportarEmergenciaComponent.datosReporte.tipo === t.valor ? 'text-peru-red' : 'text-slate-200'}"></i>
                        </button>
                    `).join('')}
                </div>
                <button onclick="ReportarEmergenciaComponent.irADescripcion()" class="w-full bg-peru-red hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition ${!ReportarEmergenciaComponent.datosReporte.tipo ? 'opacity-50 cursor-not-allowed' : ''}">
                    Continuar
                </button>
            </div>
        `;
    },

    // Pantalla 15: Describir la emergencia y adjuntar foto
    renderPantalla15: () => `
        <div class="p-4 space-y-4 animate-fadeIn">
            ${ReportarEmergenciaComponent.renderEncabezadoFlujo(
                'Describir la emergencia',
                'Proporciona detalles claros y, si es posible, adjunta una foto de referencia.',
                2, 4
            )}
            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold text-slate-400 uppercase">Pantalla 15</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-peru-red border border-red-100">${ReportarEmergenciaComponent.datosReporte.tipo}</span>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1.5">Descripción de los hechos</label>
                    <textarea id="descripcionEmergencia" rows="4" maxlength="300" placeholder="Ej. Se observa acumulación de lodo en la vía principal, bloqueando el acceso vehicular..." class="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-peru-red focus:ring-1 focus:ring-peru-red">${ReportarEmergenciaComponent.datosReporte.descripcion}</textarea>
                    <p class="text-[10px] text-slate-400 mt-1 text-right">Máx. 300 caracteres</p>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1.5">Adjuntar foto (simulado)</label>
                    <input type="file" id="fotoEmergencia" accept="image/*" class="hidden" onchange="ReportarEmergenciaComponent.simularCargaFoto(this)">
                    <button onclick="document.getElementById('fotoEmergencia').click()" class="w-full border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-peru-red hover:bg-red-50/30 transition">
                        <div id="previewFoto" class="${ReportarEmergenciaComponent.datosReporte.fotoUrl ? '' : 'hidden'} mb-2">
                            <img id="imgPreview" src="${ReportarEmergenciaComponent.datosReporte.fotoUrl}" alt="Vista previa" class="w-full h-28 object-cover rounded-lg border border-slate-200">
                        </div>
                        <div id="placeholderFoto" class="${ReportarEmergenciaComponent.datosReporte.fotoUrl ? 'hidden' : ''}">
                            <i class="fa-solid fa-camera text-2xl text-slate-400 mb-1"></i>
                            <p class="text-xs font-semibold text-slate-600">Toca para subir una foto</p>
                            <p class="text-[10px] text-slate-400">JPG, PNG (simulación de adjunto)</p>
                        </div>
                        <p id="nombreFoto" class="text-[10px] text-emerald-600 font-semibold mt-1 ${ReportarEmergenciaComponent.datosReporte.fotoUrl ? '' : 'hidden'}"><i class="fa-solid fa-circle-check mr-1"></i>Foto adjuntada correctamente</p>
                    </button>
                </div>
            </div>
            <button onclick="ReportarEmergenciaComponent.irAUbicacion()" class="w-full bg-peru-red hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition">
                Continuar a ubicación
            </button>
        </div>
    `,

    // Pantalla 16: Ubicación de la emergencia
    renderPantalla16: () => `
        <div class="p-4 space-y-4 animate-fadeIn">
            ${ReportarEmergenciaComponent.renderEncabezadoFlujo(
                'Ubicación de la emergencia',
                'Confirma o ajusta la dirección donde ocurre el evento reportado.',
                3, 4
            )}
            <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
                <span class="text-[10px] font-bold text-slate-400 uppercase">Pantalla 16</span>
                <div class="bg-slate-100 rounded-xl h-32 relative overflow-hidden border border-slate-200 flex items-center justify-center">
                    <div class="absolute inset-0 opacity-50 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:14px_14px]"></div>
                    <div class="relative z-10 text-center">
                        <div class="w-10 h-10 bg-peru-red text-white rounded-full flex items-center justify-center mx-auto shadow-lg border-2 border-white mb-1">
                            <i class="fa-solid fa-location-dot"></i>
                        </div>
                        <span id="etiquetaPunto" class="text-[10px] font-bold bg-white/90 px-2 py-1 rounded-md shadow text-slate-700">${ReportarEmergenciaComponent.datosReporte.coordenadas ? 'Ubicación actual guardada' : 'Punto seleccionado'}</span>
                    </div>
                </div>
                <div>
                    <label for="ubicacionEmergencia" class="block text-xs font-bold text-slate-700 mb-1.5">Dirección / Referencia</label>
                    <input type="text" id="ubicacionEmergencia" maxlength="200" value="${UI.esc(ReportarEmergenciaComponent.datosReporte.ubicacion)}" class="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-peru-red focus:ring-1 focus:ring-peru-red" placeholder="Ej. Av. Principal con Jr. Lima, frente al colegio">
                </div>
                <div class="grid ${db.obtenerUsuario().ubicacion ? 'grid-cols-2' : 'grid-cols-1'} gap-2">
                    ${db.obtenerUsuario().ubicacion ? `
                    <button type="button" onclick="ReportarEmergenciaComponent.usarUbicacionSugerida(${UI.esc(JSON.stringify(db.obtenerUsuario().ubicacion))})" class="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 min-h-[44px]">
                        <i class="fa-solid fa-map-pin text-peru-red mr-1"></i> Mi zona: ${UI.esc(db.obtenerUsuario().distrito || db.obtenerUsuario().ubicacion)}
                    </button>` : ''}
                    <button type="button" id="botonGpsReporte" onclick="ReportarEmergenciaComponent.usarMiUbicacion()" class="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 min-h-[44px]">
                        <i class="fa-solid fa-crosshairs text-slate-500 mr-1"></i> Usar mi ubicación actual
                    </button>
                </div>
                <p id="mensajeGpsReporte" class="text-xs text-slate-600" role="status"></p>
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2">
                    <i class="fa-solid fa-circle-info text-amber-600 mt-0.5 text-xs"></i>
                    <p class="text-[11px] text-amber-800">Verifica que la ubicación sea correcta para facilitar la atención de brigadas y voluntarios.</p>
                </div>
            </div>
            <button onclick="ReportarEmergenciaComponent.confirmarYGuardar()" class="w-full bg-peru-red hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition">
                Confirmar y enviar reporte
            </button>
        </div>
    `,

    // Pantalla 17: Confirmación del reporte
    renderPantalla17: (reporteGuardado = null) => `
        <div class="p-4 space-y-4 animate-fadeIn">
            <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
                <span class="inline-block text-[10px] font-bold text-slate-400 uppercase mb-3">Pantalla 17</span>
                <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <i class="fa-solid fa-circle-check text-4xl"></i>
                </div>
                <h2 class="text-lg font-extrabold text-slate-900 mb-1">¡Reporte enviado con éxito!</h2>
                <p class="text-xs text-slate-500 mb-4">Tu reporte ha sido registrado y será visible para las autoridades y la comunidad.</p>

                ${reporteGuardado ? `
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[10px] font-bold text-slate-400 uppercase">Código</span>
                        <span class="text-xs font-extrabold text-peru-red">${reporteGuardado.id}</span>
                    </div>
                    <div class="space-y-1.5 text-xs">
                        <p><span class="font-semibold text-slate-700">Tipo:</span> <span class="text-slate-600">${reporteGuardado.tipo}</span></p>
                        <p><span class="font-semibold text-slate-700">Ubicación:</span> <span class="text-slate-600">${reporteGuardado.ubicacion}</span></p>
                        <p><span class="font-semibold text-slate-700">Estado:</span> <span class="text-amber-700 font-semibold">${reporteGuardado.estado}</span></p>
                        <p><span class="font-semibold text-slate-700">Fecha:</span> <span class="text-slate-600">${reporteGuardado.fecha}</span></p>
                    </div>
                </div>
                ` : ''}

                <div class="space-y-2.5">
                    <button onclick="app.navegar('historial')" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition">
                        <i class="fa-solid fa-clock-rotate-left mr-2"></i> Ver en Historial
                    </button>
                    <button onclick="app.navegar('inicio')" class="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl text-sm transition">
                        Volver al Inicio
                    </button>
                </div>
            </div>
        </div>
    `,

    // Navegación del flujo
    avanzar: () => {
        if (ReportarEmergenciaComponent.pasoActual < 5) {
            ReportarEmergenciaComponent.pasoActual += 1;
            ReportarEmergenciaComponent.renderizarPaso();
        }
    },

    retroceder: () => {
        if (ReportarEmergenciaComponent.pasoActual <= 1) {
            app.navegar('inicio');
            return;
        }
        if (ReportarEmergenciaComponent.pasoActual === 5) {
            app.navegar('inicio');
            return;
        }
        ReportarEmergenciaComponent.pasoActual -= 1;
        ReportarEmergenciaComponent.renderizarPaso();
    },

    seleccionarTipo: (tipo) => {
        ReportarEmergenciaComponent.datosReporte.tipo = tipo;
        ReportarEmergenciaComponent.renderizarPaso();
    },

    irADescripcion: () => {
        if (!ReportarEmergenciaComponent.datosReporte.tipo) return;
        ReportarEmergenciaComponent.pasoActual = 3;
        ReportarEmergenciaComponent.renderizarPaso();
    },

    simularCargaFoto: (input) => {
        const archivo = input && input.files ? input.files[0] : null;
        if (archivo) {
            // Simulación: usamos un nombre de referencia y una URL de placeholder local (data URI simple no pesado)
            ReportarEmergenciaComponent.datosReporte.fotoUrl = `foto-adjunta://${archivo.name}`;
            const preview = document.getElementById('previewFoto');
            const img = document.getElementById('imgPreview');
            const placeholder = document.getElementById('placeholderFoto');
            const nombre = document.getElementById('nombreFoto');
            if (preview && img) {
                const lector = new FileReader();
                lector.onload = (e) => {
                    img.src = e.target.result;
                    ReportarEmergenciaComponent.datosReporte.fotoUrl = e.target.result; // guarda data URL simulada
                };
                lector.readAsDataURL(archivo);
                preview.classList.remove('hidden');
            }
            if (placeholder) placeholder.classList.add('hidden');
            if (nombre) nombre.classList.remove('hidden');
        }
    },

    irAUbicacion: () => {
        const descripcionInput = document.getElementById('descripcionEmergencia');
        const descripcion = descripcionInput ? descripcionInput.value.trim() : '';
        if (!descripcion) {
            alert('Por favor, ingresa una descripción breve de la emergencia.');
            return;
        }
        ReportarEmergenciaComponent.datosReporte.descripcion = descripcion;
        ReportarEmergenciaComponent.pasoActual = 4;
        ReportarEmergenciaComponent.renderizarPaso();
    },

    usarUbicacionSugerida: (ubicacion) => {
        ReportarEmergenciaComponent.datosReporte.ubicacion = ubicacion;
        const input = document.getElementById('ubicacionEmergencia');
        if (input) input.value = ubicacion;
    },

    /** Pide la ubicación del teléfono (con permiso) y la guarda redondeada (≈110 m), nunca la exacta. */
    usarMiUbicacion: async () => {
        const boton = document.getElementById('botonGpsReporte'), msg = document.getElementById('mensajeGpsReporte');
        boton.disabled = true;
        msg.textContent = 'Buscando tu ubicación…';
        try {
            const p = await UI.geolocalizar();
            ReportarEmergenciaComponent.datosReporte.coordenadas = { lat: Math.round(p.lat * 1000) / 1000, lng: Math.round(p.lng * 1000) / 1000 };
            const input = document.getElementById('ubicacionEmergencia');
            const delPerfil = db.obtenerUsuario().ubicacion || '';
            const z = UI.zonaCercana(p.lat, p.lng);
            const cerca = z && z.km <= 60;
            ReportarEmergenciaComponent.datosReporte.zona = cerca ? z : null;
            // Si la persona aún no escribió nada propio, el texto pasa a ser el distrito donde está ahora
            if (input && (!input.value.trim() || input.value.trim() === delPerfil)) input.value = cerca ? UI.textoZona(z) : (delPerfil || 'Ubicación actual');
            const etiqueta = document.getElementById('etiquetaPunto');
            if (etiqueta) etiqueta.textContent = 'Ubicación actual guardada';
            msg.textContent = (cerca ? `Detectamos que estás cerca de ${z.distrito} (${z.provincia})${p.antigua ? ', según la última ubicación guardada en tu teléfono' : ''}. ` : '')
                + 'Guardamos tu ubicación aproximada. Agrega una referencia (calle, colegio, parque) para que te encuentren.';
        } catch (e) {
            msg.textContent = e.message;
        }
        boton.disabled = false;
    },

    enviando: false,

    confirmarYGuardar: async () => {
        if (ReportarEmergenciaComponent.enviando) return; // evita enviar dos veces si se toca el botón de nuevo
        const ubicacionInput = document.getElementById('ubicacionEmergencia');
        const ubicacion = ubicacionInput ? ubicacionInput.value.trim() : ReportarEmergenciaComponent.datosReporte.ubicacion;
        if (!ubicacion) {
            alert('Por favor, confirma la ubicación de la emergencia.');
            return;
        }
        if (!ReportarEmergenciaComponent.datosReporte.tipo || !ReportarEmergenciaComponent.datosReporte.descripcion) {
            alert('Faltan datos del reporte. Por favor, completa los pasos anteriores.');
            ReportarEmergenciaComponent.pasoActual = 2;
            ReportarEmergenciaComponent.renderizarPaso();
            return;
        }

        ReportarEmergenciaComponent.datosReporte.ubicacion = ubicacion;

        // Guardar en localStorage usando la estructura de Reporte
        const reporteAGuardar = {
            tipo: ReportarEmergenciaComponent.datosReporte.tipo,
            descripcion: ReportarEmergenciaComponent.datosReporte.descripcion,
            fotoUrl: ReportarEmergenciaComponent.datosReporte.fotoUrl || '',
            ubicacion: ReportarEmergenciaComponent.datosReporte.ubicacion,
            coordenadas: ReportarEmergenciaComponent.datosReporte.coordenadas || null,
            zona: ReportarEmergenciaComponent.datosReporte.zona || null,
            estado: 'Pendiente',
            fecha: new Date().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
        };

        // En la nube hay que esperar la respuesta del servidor; si falla, el reporte NO se da por enviado.
        let reporteGuardado;
        ReportarEmergenciaComponent.enviando = true;
        try {
            reporteGuardado = await db.agregarReporte(reporteAGuardar);
        } catch (e) {
            UI.toast(e.message || 'No se pudo enviar el reporte. Inténtalo de nuevo.');
            return;
        } finally {
            ReportarEmergenciaComponent.enviando = false;
        }
        ReportarEmergenciaComponent.pasoActual = 5;
        const contenedor = document.getElementById('router-view');
        if (contenedor) {
            contenedor.innerHTML = ReportarEmergenciaComponent.renderPantalla17(reporteGuardado);
            contenedor.scrollTop = 0;
        }
    }
};
