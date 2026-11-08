/**
 * Componente: Sección 3 "Comunidad y Seguimiento" (Pantallas 22 a 25)
 * - 22: Solicitudes cercanas      - 24: Seguimiento de solicitud
 * - 23: Detalle de solicitud      - 25: Mi historial
 */

const SolicitudesComponent = {
    filtro: 'todas',
    tabHistorial: 'solicitudes',

    /** Icono y color según el tipo de ayuda (el texto puede ser libre). */
    icono: (tipo = '') => {
        const t = tipo.toLowerCase();
        if (t.includes('agua')) return { i: 'fa-droplet', c: 'bg-sky-600' };
        if (t.includes('aliment') || t.includes('víveres') || t.includes('viveres')) return { i: 'fa-bowl-food', c: 'bg-orange-500' };
        if (t.includes('medic')) return { i: 'fa-kit-medical', c: 'bg-rose-600' };
        if (t.includes('transp') || t.includes('traslado')) return { i: 'fa-truck', c: 'bg-indigo-600' };
        if (t.includes('refugio')) return { i: 'fa-house-chimney', c: 'bg-emerald-600' };
        if (t.includes('log')) return { i: 'fa-boxes-packing', c: 'bg-amber-600' };
        if (t.includes('volunt')) return { i: 'fa-hand-holding-heart', c: 'bg-pink-600' };
        return { i: 'fa-hands-holding-child', c: 'bg-slate-600' };
    },

    /* ============ 22. Solicitudes cercanas ============ */
    renderCercanas: () => {
        const distrito = db.obtenerUsuario().distrito || 'Chaclacayo';
        const f = SolicitudesComponent.filtro;
        let lista = db.obtenerSolicitudesZona().filter(s => s.estado !== 'Atendida' && s.estado !== 'Cancelada');
        // Primero las de la zona del usuario
        lista.sort((a, b) => (b.ubicacion === distrito) - (a.ubicacion === distrito));
        if (f === 'activas') lista = lista.filter(s => s.estado === 'Activa');
        if (f === 'atencion') lista = lista.filter(s => s.estado === 'En atención' || s.estado === 'En coordinación');
        const filtros = [['todas', 'Todas'], ['activas', 'Sin atender'], ['atencion', 'En atención']];

        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${UI.vistaAtras('Solicitudes cerca de ti', 'inicio', `Cerca de ${UI.esc(distrito)}`)}
                <div class="flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Filtrar solicitudes">
                    ${filtros.map(([k, l]) => `
                        <button role="tab" aria-selected="${f === k}" onclick="SolicitudesComponent.filtrar('${k}')"
                            class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${f === k ? 'bg-peru-red text-white' : 'bg-slate-100 text-slate-700'}">${l}</button>`).join('')}
                </div>
                <div class="space-y-2.5">
                    ${lista.length === 0 ? `<div class="bg-white rounded-2xl p-6 border border-slate-200 text-center text-sm text-slate-500">No hay solicitudes en esta lista.</div>` : ''}
                    ${lista.slice(0, 12).map(s => {
                        const ic = SolicitudesComponent.icono(s.tipoAyuda);
                        return `
                        <button onclick="app.navegar('solicitud-detalle',{id:'${s.id}'})" class="w-full text-left bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex items-center gap-3 hover:border-red-200 transition">
                            <div class="w-11 h-11 ${ic.c} text-white rounded-xl flex items-center justify-center text-lg flex-shrink-0"><i class="fa-solid ${ic.i}" aria-hidden="true"></i></div>
                            <div class="flex-1 min-w-0">
                                <div class="flex justify-between items-center gap-2">
                                    <h3 class="text-sm font-bold text-slate-900 truncate">${UI.esc(s.tipoAyuda)}</h3>
                                    ${UI.chip(s.estado)}
                                </div>
                                <p class="text-xs text-slate-500 truncate"><i class="fa-solid fa-location-dot mr-1"></i>${UI.esc(s.ubicacion)} · ${UI.esc(s.fecha)}</p>
                                <p class="text-[11px] text-slate-400"><i class="fa-solid fa-user-group mr-1"></i>${s.numeroPersonas} ${s.numeroPersonas === 1 ? 'persona' : 'personas'}</p>
                            </div>
                            <i class="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                        </button>`;
                    }).join('')}
                </div>
                <p class="text-[11px] text-center text-slate-400">Por privacidad no mostramos nombres, teléfonos ni direcciones exactas.</p>
            </div>`;
    },

    filtrar: (f) => { SolicitudesComponent.filtro = f; app.renderizar(); },

    /* ============ 23. Detalle de solicitud ============ */
    renderDetalle: (p = {}) => {
        const s = db.buscarSolicitud(p.id || 'ZS-001') || db.obtenerSolicitudesZona()[0];
        if (!s) return SolicitudesComponent.vacio('Detalle de solicitud', 'solicitudes', 'No encontramos esa solicitud. Puede que ya no esté disponible.');
        const ic = SolicitudesComponent.icono(s.tipoAyuda);
        const yaApoyo = db.obtenerTodo().misApoyos.includes(s.id);
        const cerrada = s.estado === 'Atendida' || s.estado === 'Cancelada';
        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${UI.vistaAtras('Detalle de solicitud', 'solicitudes')}
                <div class="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                    <div class="h-36 ${ic.c} text-white flex flex-col items-center justify-center gap-2" role="img" aria-label="Ilustración de ${UI.esc(s.tipoAyuda)}">
                        <i class="fa-solid ${ic.i}" style="font-size:3rem" aria-hidden="true"></i>
                        <span class="text-[11px] font-semibold bg-black/20 px-2.5 py-0.5 rounded-full">Imagen de ejemplo</span>
                    </div>
                    <div class="p-4 space-y-3">
                        <div class="flex justify-between items-start gap-2">
                            <h3 class="text-lg font-extrabold text-slate-900 leading-tight">${UI.esc(s.tipoAyuda)}</h3>
                            ${UI.chip(s.estado)}
                        </div>
                        <ul class="text-xs text-slate-600 space-y-1.5">
                            <li><i class="fa-solid fa-location-dot w-4 text-peru-red"></i> ${UI.esc(s.ubicacion)}</li>
                            <li><i class="fa-solid fa-user-group w-4 text-peru-red"></i> ${s.numeroPersonas} ${s.numeroPersonas === 1 ? 'persona' : 'personas'}</li>
                            <li><i class="fa-regular fa-clock w-4 text-peru-red"></i> ${UI.esc(s.fecha)}</li>
                        </ul>
                        <p class="text-sm text-slate-700 leading-relaxed">${UI.esc(s.detalles || 'Sin detalles adicionales.')}</p>
                    </div>
                </div>
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800">
                    <i class="fa-solid fa-shield-halved mr-1"></i> Los datos de contacto de la familia los gestiona coordinación. Tú no verás su teléfono ni su dirección exacta.
                </div>
                ${cerrada
                    ? `<div class="text-center text-sm font-semibold text-slate-500">Esta solicitud ya no necesita apoyo.</div>`
                    : yaApoyo
                        ? `<button onclick="app.navegar('seguimiento',{id:'${s.id}'})" class="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-md text-sm"><i class="fa-solid fa-circle-check mr-1"></i> Ya apoyas esta solicitud · Ver seguimiento</button>`
                        : `<button onclick="SolicitudesComponent.apoyar('${s.id}')" class="w-full bg-peru-red hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition"><i class="fa-solid fa-hand-holding-heart mr-1"></i> Apoyar</button>`}
            </div>`;
    },

    montarDetalle: () => {},

    apoyar: async (id) => {
        try {
            await db.apoyarSolicitud(id); // en la nube espera la confirmación del servidor
            UI.toast('¡Gracias! Coordinación se comunicará contigo.');
            app.renderizar();
        } catch (e) {
            UI.toast(e.message || 'No se pudo registrar tu apoyo.');
        }
    },

    /** Pantalla para cuando no hay nada que mostrar (por ejemplo, una cuenta nueva sin solicitudes). */
    vacio: (titulo, volverA, texto) => `
        <div class="p-4 space-y-4 animate-fadeIn">
            ${UI.vistaAtras(titulo, volverA)}
            <div class="bg-white rounded-2xl p-8 border border-slate-200 text-center">
                <i class="fa-regular fa-folder-open text-slate-300" style="font-size:2.5rem" aria-hidden="true"></i>
                <p class="text-sm text-slate-500 mt-3">${texto}</p>
            </div>
        </div>`,

    /* ============ 24. Seguimiento de solicitud ============ */
    renderSeguimiento: (p = {}) => {
        const s = (p.id && db.buscarSolicitud(p.id)) || db.obtenerSolicitudes()[0] || db.obtenerSolicitudesZona()[0];
        if (!s) return SolicitudesComponent.vacio('Seguimiento de solicitud', 'inicio', 'Todavía no tienes solicitudes para seguir. Cuando pidas ayuda, aquí verás cómo avanza.');
        const etapas = [
            { t: 'Solicitada', d: 'Tu solicitud fue registrada.', h: '10:20 a. m.' },
            { t: 'En coordinación', d: 'Coordinación revisa tu caso y busca apoyo.', h: '10:35 a. m.' },
            { t: 'En atención', d: 'Un voluntario va en camino o ya te está apoyando.', h: '11:10 a. m.' },
            { t: 'Resuelta', d: 'La ayuda fue entregada. ¡Gracias por avisar!', h: '12:00 m.' }
        ];
        const actual = Math.max(0, ETAPAS_SOLICITUD.indexOf(s.estado));
        const fin = actual === etapas.length - 1;
        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${UI.vistaAtras('Seguimiento de solicitud', 'historial', UI.esc(s.id))}
                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
                    <div class="w-11 h-11 ${SolicitudesComponent.icono(s.tipoAyuda).c} text-white rounded-xl flex items-center justify-center flex-shrink-0"><i class="fa-solid ${SolicitudesComponent.icono(s.tipoAyuda).i}" aria-hidden="true"></i></div>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-sm font-bold truncate">${UI.esc(s.tipoAyuda)}</h3>
                        <p class="text-xs text-slate-500">${s.numeroPersonas} personas · ${UI.esc(s.ubicacion)}</p>
                    </div>
                    ${UI.chip(s.estado)}
                </div>
                <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <ol class="linea" aria-label="Etapas de tu solicitud">
                        ${etapas.map((e, k) => `
                            <li class="${k <= actual ? 'hecho' : ''} ${k === actual && !fin ? 'actual' : ''}" ${k === actual ? 'aria-current="step"' : ''}>
                                <span class="punto" aria-hidden="true">${k <= actual ? '<i class="fa-solid fa-check"></i>' : ''}</span>
                                <div class="font-bold text-sm">${e.t} <span class="font-normal text-[11px] text-slate-400 ml-1">${k <= actual ? e.h : 'Pendiente'}</span></div>
                                <p class="text-xs ${k <= actual ? 'text-slate-600' : 'text-slate-400'}">${e.d}</p>
                            </li>`).join('')}
                    </ol>
                </div>
                ${fin || (Nube.activa && !app.esCoordinador()) ? '' : `
                <button onclick="SolicitudesComponent.simularAvance('${s.id}')" class="w-full bg-white border-2 border-dashed border-slate-300 text-slate-600 font-bold py-3 rounded-xl text-xs hover:border-peru-red hover:text-peru-red transition">
                    <i class="fa-solid fa-forward-step mr-1"></i> ${Nube.activa ? 'Avanzar a la siguiente etapa (coordinación)' : 'Simular avance de la solicitud (demostración)'}
                </button>`}
                <button onclick="app.navegar('historial')" class="w-full bg-slate-900 text-white font-bold py-3 rounded-xl text-sm">Ver mi historial</button>
            </div>`;
    },

    simularAvance: (id) => {
        const s = db.avanzarSolicitud(id);
        if (s) UI.toast('Estado actualizado: ' + s.estado);
        app.renderizar();
    },

    /* ============ 25. Mi historial ============ */
    renderHistorial: () => {
        const tab = SolicitudesComponent.tabHistorial;
        const reportes = db.obtenerReportes(), solicitudes = db.obtenerSolicitudes();
        const ofertas = db.obtenerOfertas();
        const apoyos = db.obtenerTodo().misApoyos.map(id => db.buscarSolicitud(id)).filter(Boolean);

        const filaSolicitud = (s) => {
            const ic = SolicitudesComponent.icono(s.tipoAyuda);
            return `
            <button onclick="app.navegar('seguimiento',{id:'${s.id}'})" class="w-full text-left bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex items-center gap-3">
                <div class="w-10 h-10 ${ic.c} text-white rounded-xl flex items-center justify-center flex-shrink-0"><i class="fa-solid ${ic.i}" aria-hidden="true"></i></div>
                <div class="flex-1 min-w-0"><h3 class="text-sm font-bold truncate">${UI.esc(s.tipoAyuda)}</h3><p class="text-[11px] text-slate-400">${UI.esc(s.fecha)} · ${UI.esc(s.id)}</p></div>
                ${UI.chip(s.estado)}
            </button>`;
        };
        const filaReporte = (r) => `
            <div class="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex items-center gap-3">
                <div class="w-10 h-10 bg-peru-red text-white rounded-xl flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i></div>
                <div class="flex-1 min-w-0"><h3 class="text-sm font-bold truncate">Reporte: ${UI.esc(r.tipo)}</h3><p class="text-[11px] text-slate-400 truncate">${UI.esc(r.fecha)} · ${UI.esc(r.ubicacion)}</p></div>
                ${UI.chip(r.estado)}
            </div>`;
        const filaOferta = (o) => {
            const ic = SolicitudesComponent.icono(o.tipoApoyo);
            return `
            <div class="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex items-center gap-3">
                <div class="w-10 h-10 ${ic.c} text-white rounded-xl flex items-center justify-center flex-shrink-0"><i class="fa-solid ${ic.i}" aria-hidden="true"></i></div>
                <div class="flex-1 min-w-0"><h3 class="text-sm font-bold truncate">${UI.esc(o.tipoApoyo)}</h3><p class="text-[11px] text-slate-400 truncate">${UI.esc(o.disponibilidad || '')} · ${UI.esc(o.fecha)}</p></div>
                ${UI.chip(o.pausada ? 'Pausada' : 'Disponible')}
            </div>`;
        };
        const vacio = (txt) => `<div class="bg-white rounded-2xl p-6 border border-slate-200 text-center text-sm text-slate-500">${txt}</div>`;

        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${UI.vistaAtras('Mi historial', 'inicio', 'Tus solicitudes, reportes y ayudas')}
                <div class="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl" role="tablist">
                    ${[['solicitudes', 'Solicitudes'], ['ayudas', 'Ayudas']].map(([k, l]) => `
                        <button role="tab" aria-selected="${tab === k}" onclick="SolicitudesComponent.cambiarTab('${k}')"
                            class="py-2 rounded-lg text-sm font-bold ${tab === k ? 'bg-white text-peru-red shadow' : 'text-slate-500'}">${l}</button>`).join('')}
                </div>
                <div class="space-y-2.5">
                    ${tab === 'solicitudes'
                        ? (solicitudes.length + reportes.length === 0 ? vacio('Todavía no tienes solicitudes ni reportes.') : solicitudes.map(filaSolicitud).join('') + reportes.map(filaReporte).join(''))
                        : (ofertas.length + apoyos.length === 0 ? vacio('Todavía no has ofrecido ayuda.') : ofertas.map(filaOferta).join('') + apoyos.map(filaSolicitud).join(''))}
                </div>
            </div>`;
    },

    cambiarTab: (t) => { SolicitudesComponent.tabHistorial = t; app.renderizar(); }
};
