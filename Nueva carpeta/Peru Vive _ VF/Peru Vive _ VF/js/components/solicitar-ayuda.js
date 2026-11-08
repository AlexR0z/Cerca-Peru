/**
 * Componente: Módulo "Solicitar Ayuda" (Pantallas 18 y 19)
 * - 18: Formulario para seleccionar tipo de ayuda, número de personas y detalles
 * - 19: Detalle/confirmación, envío a localStorage y mensaje de éxito
 */

const SolicitarAyudaComponent = {
    pasoActual: 1,
    datosSolicitud: {
        tipoAyuda: '',
        numeroPersonas: 1,
        detalles: '',
        ubicacion: '',
        coordenadas: null
    },

    iniciar: () => {
        SolicitarAyudaComponent.pasoActual = 1;
        SolicitarAyudaComponent.datosSolicitud = {
            tipoAyuda: '',
            numeroPersonas: 1,
            detalles: '',
            ubicacion: db.obtenerUsuario().ubicacion || '', // la zona que la persona eligió en su perfil
            coordenadas: null,
            zona: null
        };
        SolicitarAyudaComponent.renderizarPaso();
    },

    renderizarPaso: () => {
        const contenedor = document.getElementById('router-view');
        if (!contenedor) return;
        contenedor.innerHTML = SolicitarAyudaComponent.obtenerHtmlPaso(SolicitarAyudaComponent.pasoActual);
        contenedor.scrollTop = 0;
    },

    obtenerHtmlPaso: (paso) => {
        switch (paso) {
            case 1: return SolicitarAyudaComponent.renderPantalla18();
            case 2: return SolicitarAyudaComponent.renderPantalla19();
            default: return SolicitarAyudaComponent.renderPantalla18();
        }
    },

    renderPantalla18: () => {
        const tipos = [
            { valor: 'Alimentos', icono: 'fa-bowl-food', color: 'bg-orange-500' },
            { valor: 'Agua', icono: 'fa-bottle-water', color: 'bg-sky-500' },
            { valor: 'Medicamentos', icono: 'fa-kit-medical', color: 'bg-emerald-600' },
            { valor: 'Transporte', icono: 'fa-truck-medical', color: 'bg-indigo-600' },
            { valor: 'Refugio', icono: 'fa-house-chimney', color: 'bg-amber-600' },
            { valor: 'Otro', icono: 'fa-hand-holding-heart', color: 'bg-slate-600' }
        ];
        const d = SolicitarAyudaComponent.datosSolicitud;
        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <div class="flex items-center justify-between mb-2">
                        <button onclick="app.navegar('inicio')" class="text-slate-500 hover:text-peru-red text-sm font-semibold flex items-center">
                            <i class="fa-solid fa-chevron-left mr-1"></i> Inicio
                        </button>
                        <span class="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-100">Pantalla 18</span>
                    </div>
                    <h2 class="text-base font-bold text-slate-800 flex items-center">
                        <i class="fa-solid fa-hands-holding-child text-amber-600 mr-2"></i> Solicitar Ayuda
                    </h2>
                    <p class="text-xs text-slate-500 mt-1">Indica el tipo de asistencia que necesitas para coordinar apoyo con la comunidad y autoridades.</p>
                </div>

                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-2">Tipo de ayuda necesaria</label>
                        <div class="grid grid-cols-2 gap-2.5">
                            ${tipos.map(t => `
                                <button onclick="SolicitarAyudaComponent.seleccionarTipo('${t.valor}')" class="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition text-center ${d.tipoAyuda === t.valor ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}">
                                    <div class="w-10 h-10 ${t.color} text-white rounded-xl flex items-center justify-center mb-1.5 shadow-sm">
                                        <i class="fa-solid ${t.icono}"></i>
                                    </div>
                                    <span class="text-xs font-bold text-slate-800">${t.valor}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1.5">Número de personas afectadas</label>
                        <div class="flex items-center space-x-3 bg-slate-50 border border-slate-300 rounded-xl p-2">
                            <button onclick="SolicitarAyudaComponent.cambiarPersonas(-1)" class="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100">-</button>
                            <input type="number" id="numeroPersonasSolicitud" min="1" max="99" value="${d.numeroPersonas}" oninput="SolicitarAyudaComponent.actualizarPersonas(this.value)" class="flex-1 text-center text-sm font-bold bg-transparent text-slate-800 focus:outline-none">
                            <button onclick="SolicitarAyudaComponent.cambiarPersonas(1)" class="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100">+</button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1.5">Detalles adicionales</label>
                        <textarea id="detallesSolicitud" rows="3" maxlength="250" placeholder="Ej. Requerimos agua potable para 3 niños y 2 adultos mayores. Hay dificultad de acceso por aniego." class="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500">${d.detalles}</textarea>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1.5">Ubicación de entrega / referencia</label>
                        <input type="text" id="ubicacionSolicitud" maxlength="200" value="${UI.esc(d.ubicacion)}" class="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" placeholder="Ej. Av. Principal con Jr. Lima, frente al colegio">
                        <button type="button" id="botonGpsSolicitud" onclick="SolicitarAyudaComponent.usarMiUbicacion()" class="mt-2 w-full text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 min-h-[44px]">
                            <i class="fa-solid fa-crosshairs text-slate-500 mr-1"></i> ${d.coordenadas ? 'Ubicación actual guardada' : 'Usar mi ubicación actual'}
                        </button>
                        <p id="mensajeGpsSolicitud" class="text-xs text-slate-600 mt-1" role="status"></p>
                    </div>
                </div>

                <button onclick="SolicitarAyudaComponent.irAConfirmacion()" class="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition ${!d.tipoAyuda ? 'opacity-50 cursor-not-allowed' : ''}">
                    Revisar solicitud
                </button>
            </div>
        `;
    },

    renderPantalla19: (solicitudGuardada = null, exito = false) => {
        const d = SolicitarAyudaComponent.datosSolicitud;
        if (exito && solicitudGuardada) {
            return `
                <div class="p-4 space-y-4 animate-fadeIn">
                    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
                        <span class="inline-block text-[10px] font-bold text-slate-400 uppercase mb-3">Pantalla 19 · Confirmación</span>
                        <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <i class="fa-solid fa-circle-check text-4xl"></i>
                        </div>
                        <h2 class="text-lg font-extrabold text-slate-900 mb-1">¡Solicitud enviada con éxito!</h2>
                        <p class="text-xs text-slate-500 mb-4">Tu solicitud ha sido registrada. La comunidad y los equipos de apoyo podrán visualizarla.</p>

                        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-4 shadow-sm">
                            <div class="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
                                <span class="text-[10px] font-bold text-slate-400 uppercase">Código de solicitud</span>
                                <span class="text-xs font-extrabold text-amber-600">${solicitudGuardada.id}</span>
                            </div>
                            <div class="space-y-1.5 text-xs">
                                <p><span class="font-semibold text-slate-700">Tipo de ayuda:</span> <span class="text-slate-600">${solicitudGuardada.tipoAyuda}</span></p>
                                <p><span class="font-semibold text-slate-700">Personas afectadas:</span> <span class="text-slate-600">${solicitudGuardada.numeroPersonas}</span></p>
                                <p><span class="font-semibold text-slate-700">Ubicación:</span> <span class="text-slate-600">${solicitudGuardada.ubicacion}</span></p>
                                <p><span class="font-semibold text-slate-700">Estado:</span> <span class="text-emerald-700 font-semibold">${solicitudGuardada.estado}</span></p>
                            </div>
                        </div>

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
            `;
        }

        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <div class="flex items-center justify-between mb-2">
                        <button onclick="SolicitarAyudaComponent.volverAFormulario()" class="text-slate-500 hover:text-peru-red text-sm font-semibold flex items-center">
                            <i class="fa-solid fa-chevron-left mr-1"></i> Editar
                        </button>
                        <span class="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-100">Pantalla 19</span>
                    </div>
                    <h2 class="text-base font-bold text-slate-800 flex items-center">
                        <i class="fa-solid fa-clipboard-check text-amber-600 mr-2"></i> Detalle de la Solicitud
                    </h2>
                    <p class="text-xs text-slate-500 mt-1">Revisa la información antes de enviar tu solicitud de ayuda.</p>
                </div>

                <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="bg-amber-500 px-4 py-3 text-white">
                        <p class="text-[10px] uppercase tracking-wider font-semibold text-amber-100">Resumen de solicitud</p>
                        <h3 class="text-sm font-extrabold mt-0.5">${d.tipoAyuda || '—'}</h3>
                    </div>
                    <div class="p-4 space-y-3">
                        <div class="flex items-start justify-between py-2 border-b border-slate-100">
                            <span class="text-xs font-semibold text-slate-500">Personas afectadas</span>
                            <span class="text-xs font-bold text-slate-800">${d.numeroPersonas}</span>
                        </div>
                        <div class="flex items-start justify-between py-2 border-b border-slate-100">
                            <span class="text-xs font-semibold text-slate-500">Ubicación</span>
                            <span class="text-xs font-bold text-slate-800 text-right max-w-[60%]">${d.ubicacion || '—'}</span>
                        </div>
                        <div class="pt-1">
                            <span class="text-xs font-semibold text-slate-500 block mb-1">Detalles adicionales</span>
                            <p class="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3">${d.detalles || 'Sin detalles adicionales.'}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start space-x-2">
                    <i class="fa-solid fa-circle-info text-sky-600 mt-0.5 text-xs"></i>
                    <p class="text-[11px] text-sky-800">Al enviar, tu solicitud quedará registrada en el sistema local de Perú Vive para seguimiento comunitario.</p>
                </div>

                <button onclick="SolicitarAyudaComponent.enviarSolicitud()" class="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition">
                    <i class="fa-solid fa-paper-plane mr-2"></i> Enviar solicitud
                </button>
            </div>
        `;
    },

    seleccionarTipo: (tipo) => {
        SolicitarAyudaComponent.datosSolicitud.tipoAyuda = tipo;
        SolicitarAyudaComponent.renderizarPaso();
    },

    cambiarPersonas: (delta) => {
        const actual = parseInt(SolicitarAyudaComponent.datosSolicitud.numeroPersonas, 10) || 1;
        const nuevo = Math.min(99, Math.max(1, actual + delta));
        SolicitarAyudaComponent.datosSolicitud.numeroPersonas = nuevo;
        const input = document.getElementById('numeroPersonasSolicitud');
        if (input) input.value = nuevo;
    },

    actualizarPersonas: (valor) => {
        const n = parseInt(valor, 10);
        SolicitarAyudaComponent.datosSolicitud.numeroPersonas = Number.isFinite(n) && n > 0 ? Math.min(99, n) : 1;
    },

    irAConfirmacion: () => {
        const d = SolicitarAyudaComponent.datosSolicitud;
        if (!d.tipoAyuda) {
            alert('Por favor, selecciona el tipo de ayuda necesaria.');
            return;
        }
        const detalles = document.getElementById('detallesSolicitud');
        const ubicacion = document.getElementById('ubicacionSolicitud');
        const num = document.getElementById('numeroPersonasSolicitud');
        d.detalles = detalles ? detalles.value.trim() : d.detalles;
        d.ubicacion = ubicacion ? ubicacion.value.trim() : d.ubicacion;
        d.numeroPersonas = num ? Math.max(1, parseInt(num.value, 10) || 1) : d.numeroPersonas;

        if (!d.ubicacion) {
            alert('Por favor, indica la ubicación de entrega o referencia.');
            return;
        }

        SolicitarAyudaComponent.pasoActual = 2;
        SolicitarAyudaComponent.renderizarPaso();
    },

    /** Pide la ubicación del teléfono (con permiso) y la guarda redondeada (≈110 m), nunca la exacta. */
    usarMiUbicacion: async () => {
        const boton = document.getElementById('botonGpsSolicitud'), msg = document.getElementById('mensajeGpsSolicitud');
        boton.disabled = true;
        msg.textContent = 'Buscando tu ubicación…';
        try {
            const p = await UI.geolocalizar();
            SolicitarAyudaComponent.datosSolicitud.coordenadas = { lat: Math.round(p.lat * 1000) / 1000, lng: Math.round(p.lng * 1000) / 1000 };
            const input = document.getElementById('ubicacionSolicitud');
            const delPerfil = db.obtenerUsuario().ubicacion || '';
            const z = UI.zonaCercana(p.lat, p.lng);
            const cerca = z && z.km <= 60;
            SolicitarAyudaComponent.datosSolicitud.zona = cerca ? z : null;
            // Si la persona aún no escribió nada propio, el texto pasa a ser el distrito donde está ahora
            if (input && (!input.value.trim() || input.value.trim() === delPerfil)) input.value = cerca ? UI.textoZona(z) : (delPerfil || 'Ubicación actual');
            boton.innerHTML = '<i class="fa-solid fa-crosshairs text-slate-500 mr-1"></i> Ubicación actual guardada';
            msg.textContent = (cerca ? `Detectamos que estás cerca de ${z.distrito} (${z.provincia})${p.antigua ? ', según la última ubicación guardada en tu teléfono' : ''}. ` : '')
                + 'Guardamos tu ubicación aproximada. Agrega una referencia para que te encuentren.';
        } catch (e) {
            msg.textContent = e.message;
        }
        boton.disabled = false;
    },

    volverAFormulario: () => {
        SolicitarAyudaComponent.pasoActual = 1;
        SolicitarAyudaComponent.renderizarPaso();
    },

    enviando: false,

    enviarSolicitud: async () => {
        if (SolicitarAyudaComponent.enviando) return; // evita enviar dos veces si se toca el botón de nuevo
        const d = SolicitarAyudaComponent.datosSolicitud;
        if (!d.tipoAyuda) return;

        const solicitudAGuardar = {
            tipoAyuda: d.tipoAyuda,
            numeroPersonas: d.numeroPersonas,
            detalles: d.detalles || '',
            ubicacion: d.ubicacion,
            coordenadas: d.coordenadas || null,
            zona: d.zona || null,
            estado: 'Activa',
            fecha: new Date().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
        };

        let solicitudGuardada;
        SolicitarAyudaComponent.enviando = true;
        try {
            solicitudGuardada = await db.agregarSolicitud(solicitudAGuardar);
        } catch (e) {
            UI.toast(e.message || 'No se pudo enviar la solicitud. Inténtalo de nuevo.');
            return;
        } finally {
            SolicitarAyudaComponent.enviando = false;
        }
        const contenedor = document.getElementById('router-view');
        if (contenedor) {
            contenedor.innerHTML = SolicitarAyudaComponent.renderPantalla19(solicitudGuardada, true);
            contenedor.scrollTop = 0;
        }
    }
};
