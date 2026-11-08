/**
 * Componente: Sección 3 "Comunidad y Seguimiento" (Pantalla 29: Mis ayudas)
 * Lista las ayudas que la persona ofreció y las solicitudes que decidió apoyar.
 */

const MisAyudasComponent = {
    render: () => {
        const ofertas = db.obtenerOfertas();
        const apoyos = db.obtenerTodo().misApoyos.map(id => db.buscarSolicitud(id)).filter(Boolean);
        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${UI.vistaAtras('Mis ayudas', 'perfil', 'Lo que ofreces a tu comunidad')}

                <section class="space-y-2.5" aria-label="Ayudas que ofrezco">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Ayudas que ofrezco (${ofertas.length})</h3>
                    ${ofertas.length === 0 ? `<div class="bg-white rounded-2xl p-6 border border-slate-200 text-center text-sm text-slate-500">Aún no ofreces ninguna ayuda.</div>` : ''}
                    ${ofertas.map(o => {
                        const ic = SolicitudesComponent.icono(o.tipoApoyo);
                        return `
                        <div class="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm">
                            <div class="flex items-center gap-3">
                                <div class="w-11 h-11 ${ic.c} text-white rounded-xl flex items-center justify-center flex-shrink-0"><i class="fa-solid ${ic.i}" aria-hidden="true"></i></div>
                                <div class="flex-1 min-w-0">
                                    <h4 class="text-sm font-bold truncate">${UI.esc(o.tipoApoyo)}</h4>
                                    <p class="text-[11px] text-slate-500 truncate">${UI.esc(o.disponibilidad || 'Sin horario')}</p>
                                    ${UI.chip(o.pausada ? 'Pausada' : 'Disponible')}
                                </div>
                                <div class="flex flex-col items-center gap-1">
                                    ${UI.interruptor('sw-' + o.id, !o.pausada, `MisAyudasComponent.alternar('${o.id}')`)}
                                    <span class="text-[10px] text-slate-400">${o.pausada ? 'Pausada' : 'Activa'}</span>
                                </div>
                            </div>
                            <div class="mt-2 pt-2 border-t border-slate-100 text-right">
                                <button onclick="MisAyudasComponent.retirar('${o.id}')" class="text-[11px] font-bold text-slate-500 hover:text-peru-red"><i class="fa-regular fa-trash-can mr-1"></i> Retirar oferta</button>
                            </div>
                        </div>`;
                    }).join('')}
                    <button onclick="app.navegar('ofrecer')" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition"><i class="fa-solid fa-plus mr-1"></i> Ofrecer nueva ayuda</button>
                </section>

                <section class="space-y-2.5" aria-label="Solicitudes que apoyo">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">Solicitudes que apoyo (${apoyos.length})</h3>
                    ${apoyos.length === 0 ? `<div class="bg-white rounded-2xl p-5 border border-slate-200 text-center text-xs text-slate-500">Cuando apoyes una solicitud cercana aparecerá aquí.</div>` : ''}
                    ${apoyos.map(s => `
                        <button onclick="app.navegar('seguimiento',{id:'${s.id}'})" class="w-full text-left bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex items-center gap-3">
                            <div class="flex-1 min-w-0"><h4 class="text-sm font-bold truncate">${UI.esc(s.tipoAyuda)}</h4><p class="text-[11px] text-slate-400 truncate">${UI.esc(s.ubicacion)} · ${UI.esc(s.fecha)}</p></div>
                            ${UI.chip(s.estado)}
                        </button>`).join('')}
                </section>
            </div>`;
    },

    alternar: (id) => {
        const o = db.alternarOferta(id);
        UI.toast(o && o.pausada ? 'Oferta pausada: no aparecerá como disponible.' : 'Oferta activa nuevamente.');
        app.renderizar();
    },

    retirar: (id) => {
        if (!confirm('¿Retirar esta oferta de ayuda?')) return;
        db.retirarOferta(id);
        UI.toast('Oferta retirada.');
        app.renderizar();
    }
};
