/**
 * Componente: Sección 3 "Comunidad y Seguimiento" (Pantalla 30: Centro de ayuda)
 */

const CentroAyudaComponent = {
    preguntas: [
        ['¿Perú Vive reemplaza a los servicios de emergencia?', 'No. Perú Vive complementa la ayuda oficial. Si hay peligro inmediato, llama primero a Bomberos (116), Policía (105) o SAMU (106).'],
        ['¿Cómo reporto una emergencia?', 'Toca el botón rojo "Reportar" de la barra inferior, elige el tipo, cuéntanos qué pasa y confirma la ubicación. Son 4 pasos cortos.'],
        ['¿Qué significa que un reporte esté "Verificado"?', 'Que una persona de coordinación lo revisó. Un reporte nuevo aparece como "Pendiente" hasta que se revisa; no es una alerta oficial.'],
        ['¿Se ve mi ubicación exacta?', 'No. Guardamos y mostramos una ubicación aproximada, y siempre pedimos tu permiso antes de usar el GPS.'],
        ['¿Cómo ofrezco ayuda?', 'Entra a "Ofrece ayuda" desde el inicio, elige qué puedes dar y cuándo. Puedes pausar o retirar tu oferta en "Mis ayudas".']
    ],

    guias: [
        ['fa-triangle-exclamation', 'Cómo reportar una emergencia', 'reportar'],
        ['fa-hands-holding-child', 'Cómo pedir ayuda', 'ayuda'],
        ['fa-hand-holding-heart', 'Cómo ofrecer ayuda', 'ofrecer'],
        ['fa-map-location-dot', 'Cómo usar el mapa solidario', 'mapa'],
        ['fa-robot', 'Preguntar al asistente virtual', 'asistente'],
        ['fa-circle-play', 'Ver el tutorial de inicio', 'tutorial']
    ],

    render: () => `
        <div class="p-4 space-y-5 animate-fadeIn">
            ${UI.vistaAtras('Centro de ayuda', 'perfil', 'Resuelve tus dudas')}

            <section aria-label="Preguntas frecuentes">
                <h3 class="text-sm font-extrabold text-slate-800 mb-2"><i class="fa-regular fa-circle-question text-peru-red mr-1.5"></i> Preguntas frecuentes</h3>
                <div class="space-y-2">
                    ${CentroAyudaComponent.preguntas.map(([q, r]) => `
                        <details class="bg-white rounded-2xl border border-slate-200 shadow-sm group">
                            <summary class="cursor-pointer list-none p-3.5 flex items-center justify-between gap-2 text-sm font-bold text-slate-800">
                                ${q}<i class="fa-solid fa-chevron-down text-xs text-slate-400 group-open:rotate-180 transition"></i>
                            </summary>
                            <p class="px-3.5 pb-3.5 text-xs text-slate-600 leading-relaxed">${r}</p>
                        </details>`).join('')}
                </div>
            </section>

            <section aria-label="Guías de uso">
                <h3 class="text-sm font-extrabold text-slate-800 mb-2"><i class="fa-solid fa-book-open text-peru-red mr-1.5"></i> Guías de uso</h3>
                <div class="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                    ${CentroAyudaComponent.guias.map(([ico, txt, ruta]) => `
                        <button onclick="app.navegar('${ruta}')" class="w-full text-left p-3.5 flex items-center gap-3 text-sm font-semibold text-slate-700 hover:text-peru-red">
                            <i class="fa-solid ${ico} w-5 text-center text-peru-red" aria-hidden="true"></i><span class="flex-1">${txt}</span><i class="fa-solid fa-chevron-right text-xs text-slate-300"></i>
                        </button>`).join('')}
                </div>
            </section>

            <section aria-label="Contáctanos">
                <h3 class="text-sm font-extrabold text-slate-800 mb-2"><i class="fa-solid fa-phone-volume text-peru-red mr-1.5"></i> Contáctanos</h3>
                <div class="grid grid-cols-2 gap-2.5">
                    ${[['Policía', '105'], ['Bomberos', '116'], ['SAMU (salud)', '106'], ['Defensa Civil', '115']].map(([n, t]) => `
                        <a href="tel:${t}" class="bg-slate-900 text-white rounded-2xl p-3 text-center">
                            <div class="text-[11px] text-red-300 font-semibold">${n}</div><div class="text-xl font-extrabold">${t}</div>
                        </a>`).join('')}
                </div>
                <p class="text-[11px] text-slate-500 mt-2 text-center">Para consultas sobre la app: <b>soporte@peruvive.pe</b> (correo de ejemplo del prototipo).</p>
            </section>
        </div>`
};
