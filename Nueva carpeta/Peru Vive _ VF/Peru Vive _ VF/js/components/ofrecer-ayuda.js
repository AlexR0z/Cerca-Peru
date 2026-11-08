/**
 * Componente: Módulo "Ofrecer Ayuda / Voluntariado" (Pantallas 20 y 21)
 * - 20: Seleccionar tipo de apoyo que el ciudadano puede brindar
 * - 21: Registrar disponibilidad y contacto, guardar en localStorage y confirmar
 */

const OfrecerAyudaComponent = {
    pasoActual: 1,
    datosOferta: {
        tipoApoyo: '',
        disponibilidad: '',
        disponibilidadDetalle: '',
        contacto: ''
    },

    iniciar: () => {
        OfrecerAyudaComponent.pasoActual = 1;
        OfrecerAyudaComponent.datosOferta = {
            tipoApoyo: '',
            disponibilidad: 'Hoy',
            disponibilidadDetalle: '',
            contacto: '+51 987 654 321'
        };
        OfrecerAyudaComponent.renderizarPaso();
    },

    renderizarPaso: () => {
        const contenedor = document.getElementById('router-view');
        if (!contenedor) return;
        contenedor.innerHTML = OfrecerAyudaComponent.obtenerHtmlPaso(OfrecerAyudaComponent.pasoActual);
        contenedor.scrollTop = 0;
    },

    obtenerHtmlPaso: (paso) => {
        switch (paso) {
            case 1: return OfrecerAyudaComponent.renderPantalla20();
            case 2: return OfrecerAyudaComponent.renderPantalla21();
            default: return OfrecerAyudaComponent.renderPantalla20();
        }
    },

    renderPantalla20: () => {
        const tipos = [
            { valor: 'Alimentos', icono: 'fa-box-open', color: 'bg-orange-500', desc: 'Víveres no perecibles y donaciones' },
            { valor: 'Agua', icono: 'fa-bottle-water', color: 'bg-sky-500', desc: 'Agua potable embotellada' },
            { valor: 'Transporte', icono: 'fa-truck', color: 'bg-indigo-600', desc: 'Movilidad y traslado de ayuda' },
            { valor: 'Voluntariado', icono: 'fa-people-group', color: 'bg-emerald-600', desc: 'Apoyo presencial y organización' },
            { valor: 'Otro', icono: 'fa-hand-holding-heart', color: 'bg-slate-600', desc: 'Otro tipo de apoyo solidario' }
        ];
        const d = OfrecerAyudaComponent.datosOferta;
        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <div class="flex items-center justify-between mb-2">
                        <button onclick="app.navegar('inicio')" class="text-slate-500 hover:text-peru-red text-sm font-semibold flex items-center">
                            <i class="fa-solid fa-chevron-left mr-1"></i> Inicio
                        </button>
                        <span class="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-100">Pantalla 20</span>
                    </div>
                    <h2 class="text-base font-bold text-slate-800 flex items-center">
                        <i class="fa-solid fa-hand-holding-heart text-emerald-600 mr-2"></i> Ofrecer Ayuda
                    </h2>
                    <p class="text-xs text-slate-500 mt-1">Selecciona el tipo de apoyo que puedes brindar para ayudar a tu comunidad en situaciones de emergencia.</p>
                </div>

                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
                    <label class="block text-xs font-bold text-slate-700 mb-1">Tipo de apoyo</label>
                    ${tipos.map(t => `
                        <button onclick="OfrecerAyudaComponent.seleccionarTipo('${t.valor}')" class="w-full flex items-center p-3.5 rounded-xl border-2 transition text-left ${d.tipoApoyo === t.valor ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}">
                            <div class="w-11 h-11 ${t.color} text-white rounded-xl flex items-center justify-center text-lg mr-3 shadow-sm flex-shrink-0">
                                <i class="fa-solid ${t.icono}"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="text-sm font-bold text-slate-900">${t.valor}</h4>
                                <p class="text-xs text-slate-500">${t.desc}</p>
                            </div>
                            <i class="fa-solid fa-circle-check text-lg ${d.tipoApoyo === t.valor ? 'text-emerald-600' : 'text-slate-200'}"></i>
                        </button>
                    `).join('')}
                </div>

                <button onclick="OfrecerAyudaComponent.irADisponibilidad()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition ${!d.tipoApoyo ? 'opacity-50 cursor-not-allowed' : ''}">
                    Continuar
                </button>
            </div>
        `;
    },

    renderPantalla21: (ofertaGuardada = null, exito = false) => {
        const d = OfrecerAyudaComponent.datosOferta;
        if (exito && ofertaGuardada) {
            return `
                <div class="p-4 space-y-4 animate-fadeIn">
                    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
                        <span class="inline-block text-[10px] font-bold text-slate-400 uppercase mb-3">Pantalla 21 · Confirmación</span>
                        <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <i class="fa-solid fa-circle-check text-4xl"></i>
                        </div>
                        <h2 class="text-lg font-extrabold text-slate-900 mb-1">¡Oferta registrada con éxito!</h2>
                        <p class="text-xs text-slate-500 mb-4">Tu apoyo solidario ha sido publicado en Perú Vive. Gracias por sumar a tu comunidad.</p>

                        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-4 shadow-sm">
                            <div class="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
                                <span class="text-[10px] font-bold text-slate-400 uppercase">Código de oferta</span>
                                <span class="text-xs font-extrabold text-emerald-700">${ofertaGuardada.id}</span>
                            </div>
                            <div class="space-y-1.5 text-xs">
                                <p><span class="font-semibold text-slate-700">Tipo de apoyo:</span> <span class="text-slate-600">${ofertaGuardada.tipoApoyo}</span></p>
                                <p><span class="font-semibold text-slate-700">Disponibilidad:</span> <span class="text-slate-600">${ofertaGuardada.disponibilidad}</span></p>
                                <p><span class="font-semibold text-slate-700">Contacto:</span> <span class="text-slate-600">${ofertaGuardada.contacto}</span></p>
                                <p><span class="font-semibold text-slate-700">Fecha:</span> <span class="text-slate-600">${ofertaGuardada.fecha}</span></p>
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

        const opcionesDisponibilidad = ['Hoy', 'Mañana', 'Esta semana', 'Fines de semana'];
        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <div class="flex items-center justify-between mb-2">
                        <button onclick="OfrecerAyudaComponent.volverATipo()" class="text-slate-500 hover:text-peru-red text-sm font-semibold flex items-center">
                            <i class="fa-solid fa-chevron-left mr-1"></i> Atrás
                        </button>
                        <span class="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-100">Pantalla 21</span>
                    </div>
                    <h2 class="text-base font-bold text-slate-800 flex items-center">
                        <i class="fa-solid fa-calendar-check text-emerald-600 mr-2"></i> Registrar Disponibilidad
                    </h2>
                    <p class="text-xs text-slate-500 mt-1">Indica cuándo puedes brindar apoyo y cómo pueden contactarte.</p>
                </div>

                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
                    <div class="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                        <span class="text-xs font-semibold text-slate-600">Tipo de apoyo seleccionado</span>
                        <span class="text-xs font-extrabold text-emerald-700">${d.tipoApoyo || '—'}</span>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-2">Disponibilidad horaria</label>
                        <div class="grid grid-cols-2 gap-2 mb-2.5">
                            ${opcionesDisponibilidad.map(op => `
                                <button onclick="OfrecerAyudaComponent.seleccionarDisponibilidad('${op}')" class="py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition ${d.disponibilidad === op ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}">
                                    ${op}
                                </button>
                            `).join('')}
                        </div>
                        <input type="text" id="disponibilidadDetalle" value="${d.disponibilidadDetalle}" placeholder="Ej. 08:00 a.m. - 12:00 p.m. / 6:00 p.m. - 9:00 p.m." class="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                        <p class="text-[10px] text-slate-400 mt-1">Puedes indicar rangos de horas o detalles adicionales.</p>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-1.5">Datos de contacto</label>
                        <input type="text" id="contactoOferta" value="${d.contacto}" placeholder="Ej. +51 987 654 321 / correo@ejemplo.com" class="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600">
                    </div>

                    <div class="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start space-x-2">
                        <i class="fa-solid fa-circle-info text-sky-600 mt-0.5 text-xs"></i>
                        <p class="text-[11px] text-sky-800">Al publicar tu oferta, quedará registrada para coordinación solidaria en la plataforma Perú Vive.</p>
                    </div>
                </div>

                <button onclick="OfrecerAyudaComponent.publicarOferta()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition">
                    <i class="fa-solid fa-paper-plane mr-2"></i> Publicar oferta de ayuda
                </button>
            </div>
        `;
    },

    seleccionarTipo: (tipo) => {
        OfrecerAyudaComponent.datosOferta.tipoApoyo = tipo;
        OfrecerAyudaComponent.renderizarPaso();
    },

    irADisponibilidad: () => {
        if (!OfrecerAyudaComponent.datosOferta.tipoApoyo) return;
        OfrecerAyudaComponent.pasoActual = 2;
        OfrecerAyudaComponent.renderizarPaso();
    },

    volverATipo: () => {
        // Capturar datos actuales si existen
        const detalle = document.getElementById('disponibilidadDetalle');
        const contacto = document.getElementById('contactoOferta');
        if (detalle) OfrecerAyudaComponent.datosOferta.disponibilidadDetalle = detalle.value.trim();
        if (contacto) OfrecerAyudaComponent.datosOferta.contacto = contacto.value.trim();
        OfrecerAyudaComponent.pasoActual = 1;
        OfrecerAyudaComponent.renderizarPaso();
    },

    seleccionarDisponibilidad: (opcion) => {
        OfrecerAyudaComponent.datosOferta.disponibilidad = opcion;
        const detalle = document.getElementById('disponibilidadDetalle');
        const contacto = document.getElementById('contactoOferta');
        if (detalle) OfrecerAyudaComponent.datosOferta.disponibilidadDetalle = detalle.value.trim();
        if (contacto) OfrecerAyudaComponent.datosOferta.contacto = contacto.value.trim();
        OfrecerAyudaComponent.renderizarPaso();
    },

    enviando: false,

    publicarOferta: async () => {
        if (OfrecerAyudaComponent.enviando) return; // evita publicar dos veces si se toca el botón de nuevo
        const d = OfrecerAyudaComponent.datosOferta;
        if (!d.tipoApoyo) {
            OfrecerAyudaComponent.pasoActual = 1;
            OfrecerAyudaComponent.renderizarPaso();
            return;
        }

        const detalle = document.getElementById('disponibilidadDetalle');
        const contacto = document.getElementById('contactoOferta');
        d.disponibilidadDetalle = detalle ? detalle.value.trim() : d.disponibilidadDetalle;
        d.contacto = contacto ? contacto.value.trim() : d.contacto;

        if (!d.contacto) {
            alert('Por favor, ingresa un dato de contacto para coordinar tu apoyo.');
            return;
        }

        const disponibilidadFinal = d.disponibilidadDetalle
            ? `${d.disponibilidad} · ${d.disponibilidadDetalle}`
            : d.disponibilidad;

        const ofertaAGuardar = {
            tipoApoyo: d.tipoApoyo,
            disponibilidad: disponibilidadFinal,
            contacto: d.contacto,
            fecha: new Date().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
        };

        let ofertaGuardada;
        OfrecerAyudaComponent.enviando = true;
        try {
            ofertaGuardada = await db.agregarOferta(ofertaAGuardar);
        } catch (e) {
            UI.toast(e.message || 'No se pudo publicar la oferta. Inténtalo de nuevo.');
            return;
        } finally {
            OfrecerAyudaComponent.enviando = false;
        }
        const contenedor = document.getElementById('router-view');
        if (contenedor) {
            contenedor.innerHTML = OfrecerAyudaComponent.renderPantalla21(ofertaGuardada, true);
            contenedor.scrollTop = 0;
        }
    }
};
