/**
 * Componente: Sección 3 "Comunidad y Seguimiento" (Pantalla 28: Notificaciones)
 */

const NotificacionesComponent = {
    render: () => {
        const lista = db.obtenerNotificaciones();
        const sinLeer = lista.filter(n => !n.leida).length;
        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${UI.vistaAtras('Notificaciones', 'inicio', sinLeer ? `${sinLeer} sin leer` : 'Todo al día')}
                ${sinLeer ? `<button onclick="NotificacionesComponent.marcarTodas()" class="text-xs font-bold text-peru-red hover:underline"><i class="fa-solid fa-check-double mr-1"></i> Marcar todo como leído</button>` : ''}
                <div class="space-y-2.5">
                    ${lista.length === 0 ? `<div class="bg-white rounded-2xl p-6 border border-slate-200 text-center text-sm text-slate-500">No tienes notificaciones.</div>` : ''}
                    ${lista.map(n => `
                        <button onclick="NotificacionesComponent.abrir('${n.id}')" class="w-full text-left rounded-2xl p-3.5 border shadow-sm flex items-start gap-3 ${n.leida ? 'bg-white border-slate-200' : 'bg-red-50 border-red-200'}">
                            <div class="w-10 h-10 ${n.color} text-white rounded-xl flex items-center justify-center flex-shrink-0"><i class="fa-solid ${n.icono}" aria-hidden="true"></i></div>
                            <div class="flex-1 min-w-0">
                                <h3 class="text-sm font-bold text-slate-900">${UI.esc(n.titulo)}</h3>
                                <p class="text-xs text-slate-600">${UI.esc(n.detalle)}</p>
                                <span class="text-[10px] text-slate-400">${UI.esc(n.fecha)}</span>
                            </div>
                            ${n.leida ? '' : '<span class="w-2.5 h-2.5 bg-peru-red rounded-full mt-1.5 flex-shrink-0" aria-label="Sin leer"></span>'}
                        </button>`).join('')}
                </div>
            </div>`;
    },

    abrir: (id) => {
        const n = db.obtenerNotificaciones().find(x => x.id === id);
        db.marcarNotificacionLeida(id);
        // Las notificaciones de la nube traen el caso al que se refieren (objetivoId) para abrirlo directamente.
        app.navegar(n && n.ruta && n.ruta !== 'notificaciones' ? n.ruta : 'notificaciones', n && n.objetivoId ? { id: n.objetivoId } : {});
    },

    marcarTodas: () => {
        db.marcarTodasLeidas();
        UI.toast('Notificaciones marcadas como leídas.');
        app.renderizar();
    }
};
