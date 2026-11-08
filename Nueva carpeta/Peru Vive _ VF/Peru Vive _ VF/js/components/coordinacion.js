/**
 * Componente: Sección 4 "Centro de Coordinación" (Pantallas 31 a 34)
 * Para autoridades y organizaciones. El acceso lo controla el router (rol coordinador).
 * - 31: Panel de coordinación      - 33: Asignación de voluntarios
 * - 32: Gestión de emergencias     - 34: Estadísticas e indicadores
 */

const CoordinacionComponent = {
    filtro: 'todos',

    iconoTipo: (tipo = '') => {
        const t = tipo.toLowerCase();
        if (t.includes('huayco')) return { i: 'fa-mountain', c: 'bg-orange-600' };
        if (t.includes('inund')) return { i: 'fa-water', c: 'bg-sky-600' };
        if (t.includes('sismo')) return { i: 'fa-house-crack', c: 'bg-amber-500' };
        if (t.includes('incendio')) return { i: 'fa-fire-flame-curved', c: 'bg-red-600' };
        return { i: 'fa-triangle-exclamation', c: 'bg-slate-600' };
    },

    /** Agrupa "Sismo leve" y "Sismo" bajo la misma categoría. */
    categoria: (tipo = '') => {
        const t = tipo.toLowerCase();
        if (t.includes('huayco')) return 'Huayco';
        if (t.includes('inund')) return 'Inundación';
        if (t.includes('sismo')) return 'Sismo';
        if (t.includes('incendio')) return 'Incendio';
        return 'Otros';
    },

    /* ============ 31. Panel de coordinación ============ */
    renderPanel: () => {
        const reportes = db.obtenerTodosReportes(), solicitudes = db.obtenerTodasSolicitudes(), vols = db.obtenerVoluntarios();
        const pendientes = reportes.filter(r => r.estado === 'Pendiente').slice(0, 3);
        const kpi = (num, texto, icono, clases, ruta) => `
            <button onclick="app.navegar('${ruta}')" class="${clases} rounded-2xl p-3.5 text-left shadow-md w-full">
                <i class="fa-solid ${icono} text-lg opacity-90" aria-hidden="true"></i>
                <div class="text-3xl font-extrabold leading-tight mt-1">${num}</div>
                <div class="text-xs font-semibold opacity-95">${texto}</div>
            </button>`;
        const acceso = (ruta, icono, titulo, sub) => `
            <button onclick="app.navegar('${ruta}')" class="w-full text-left bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex items-center gap-3">
                <div class="w-11 h-11 bg-violet-100 text-violet-700 rounded-xl flex items-center justify-center flex-shrink-0"><i class="fa-solid ${icono}" aria-hidden="true"></i></div>
                <div class="flex-1"><h3 class="text-sm font-bold">${titulo}</h3><p class="text-[11px] text-slate-500">${sub}</p></div>
                <i class="fa-solid fa-chevron-right text-xs text-slate-300"></i>
            </button>`;
        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${UI.vistaAtras('Coordinación', 'perfil', 'Panel de autoridades y organizaciones')}
                <div class="grid grid-cols-1 gap-3">
                    ${kpi(reportes.length, 'Emergencias', 'fa-triangle-exclamation', 'bg-gradient-to-r from-red-600 to-red-500 text-white', 'emergencias')}
                    ${kpi(solicitudes.length, 'Solicitudes de ayuda', 'fa-hands-holding-child', 'bg-amber-400 text-slate-900', 'solicitudes')}
                    ${kpi(vols.length, 'Voluntarios', 'fa-people-group', 'bg-teal-500 text-white', 'asignar')}
                </div>
                <div class="space-y-2.5">
                    ${acceso('emergencias', 'fa-list-check', 'Gestión de emergencias', 'Revisa, verifica y cambia el estado')}
                    ${acceso('asignar', 'fa-user-plus', 'Asignar voluntarios', 'Envía apoyo a una emergencia')}
                    ${acceso('zonas-seguras', 'fa-house-chimney-medical', 'Zonas seguras', 'Refugios, acopio y puntos de reunión')}
                    ${acceso('estadisticas', 'fa-chart-column', 'Estadísticas e indicadores', 'Resumen de la operación')}
                </div>
                <section aria-label="Pendientes por revisar">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Pendientes por revisar</h3>
                    ${pendientes.length === 0 ? `<div class="bg-white rounded-2xl p-4 border border-slate-200 text-center text-xs text-slate-500">No hay emergencias pendientes.</div>` : ''}
                    <div class="space-y-2">
                        ${pendientes.map(r => `
                        <button onclick="app.navegar('emergencias')" class="w-full text-left bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between gap-2">
                            <span class="text-sm font-bold truncate">${UI.esc(r.tipo)} <span class="font-normal text-xs text-slate-500">· ${UI.esc(r.ubicacion)}</span></span>${UI.chip(r.estado)}
                        </button>`).join('')}
                    </div>
                </section>
                <p class="text-[11px] text-center text-slate-400">Prototipo: los datos son de demostración y no representan alertas oficiales.</p>
            </div>`;
    },

    /* ============ 32. Gestión de emergencias ============ */
    renderEmergencias: () => {
        const f = CoordinacionComponent.filtro;
        const todos = db.obtenerTodosReportes();
        const lista = todos.filter(r => f === 'todos' || r.estado === f);
        const filtros = ['todos'].concat(ESTADOS_EMERGENCIA);
        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${UI.vistaAtras('Emergencias', 'coordinacion', `${lista.length} de ${todos.length} reportes`)}
                <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Filtrar por estado">
                    ${filtros.map(k => `
                        <button role="tab" aria-selected="${f === k}" onclick="CoordinacionComponent.filtrar('${k}')"
                            class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${f === k ? 'bg-violet-700 text-white' : 'bg-slate-100 text-slate-700'}">${k === 'todos' ? 'Todas' : k}</button>`).join('')}
                </div>
                <div class="space-y-3">
                    ${lista.length === 0 ? `<div class="bg-white rounded-2xl p-6 border border-slate-200 text-center text-sm text-slate-500">No hay emergencias con este estado.</div>` : ''}
                    ${lista.map(r => {
                        const ic = CoordinacionComponent.iconoTipo(r.tipo);
                        return `
                        <article class="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm">
                            <div class="flex items-center gap-3">
                                <div class="w-11 h-11 ${ic.c} text-white rounded-xl flex items-center justify-center flex-shrink-0"><i class="fa-solid ${ic.i}" aria-hidden="true"></i></div>
                                <div class="flex-1 min-w-0">
                                    <h3 class="text-sm font-bold truncate">${UI.esc(r.tipo)} <span class="text-[10px] font-normal text-slate-400">${UI.esc(r.id)}</span></h3>
                                    <p class="text-[11px] text-slate-500 truncate"><i class="fa-solid fa-location-dot mr-1"></i>${UI.esc(r.ubicacion)} · ${UI.esc(r.fecha)}</p>
                                </div>
                                <span id="chip-${r.id}">${UI.chip(r.estado)}</span>
                            </div>
                            <div class="mt-3 grid grid-cols-[1fr_auto] gap-2 items-end">
                                <div>
                                    <label for="est-${r.id}" class="text-[10px] font-bold text-slate-500 uppercase">Estado</label>
                                    <select id="est-${r.id}" onchange="CoordinacionComponent.cambiarEstado('${r.id}', this.value)" class="w-full border border-slate-300 rounded-lg px-2 py-2 text-xs bg-white">
                                        ${ESTADOS_EMERGENCIA.map(e => `<option ${e === r.estado ? 'selected' : ''}>${e}</option>`).join('')}
                                    </select>
                                </div>
                                <button onclick="app.navegar('asignar',{tipo:'reporte',id:'${r.id}'})" class="bg-violet-700 hover:bg-violet-800 text-white text-xs font-bold px-3 py-2.5 rounded-lg"><i class="fa-solid fa-user-plus mr-1"></i>Asignar</button>
                            </div>
                            <p id="rev-${r.id}" class="text-[10px] text-slate-400 mt-2">${r.revisadoPor ? `Revisado por ${UI.esc(r.revisadoPor)} · ${UI.esc(r.revisadoEn || '')}` : 'Sin revisar por coordinación'}</p>
                        </article>`;
                    }).join('')}
                </div>
            </div>`;
    },

    montarEmergencias: () => {},

    filtrar: (f) => { CoordinacionComponent.filtro = f; app.renderizar(); },

    /** Actualiza solo la tarjeta tocada (no mueve el scroll de la lista). */
    cambiarEstado: (id, estado) => {
        const r = db.actualizarEstadoReporte(id, estado);
        if (!r) return;
        document.getElementById('chip-' + id).innerHTML = UI.chip(r.estado);
        document.getElementById('rev-' + id).textContent = `Revisado por ${r.revisadoPor} · ${r.revisadoEn}`;
        UI.toast(`${r.id}: ${r.estado}`);
    },

    /* ============ 33. Asignar voluntario ============ */
    renderAsignar: (p = {}) => {
        const reportes = db.obtenerTodosReportes().filter(r => r.estado !== 'Resuelto');
        const solicitudes = db.obtenerTodasSolicitudes().filter(s => s.estado !== 'Atendida' && s.estado !== 'Cancelada');
        let tipo = p.tipo === 'solicitud' ? 'solicitud' : 'reporte';
        let id = p.id || (tipo === 'reporte' ? (reportes[0] || {}).id : (solicitudes[0] || {}).id);
        const objetivo = (tipo === 'reporte' ? reportes : solicitudes).find(x => x.id === id) || reportes[0];
        if (!objetivo) return `<div class="p-4">${UI.vistaAtras('Asignar voluntario', 'coordinacion')}<p class="text-sm text-slate-500 mt-4">No hay casos abiertos.</p></div>`;
        id = objetivo.id;

        const yaAsignados = db.obtenerTodo().asignaciones.filter(a => a.objetivoId === id).map(a => a.voluntarioId);
        const zonaObjetivo = (objetivo.ubicacion || '').split(',').pop().trim();
        const vols = db.obtenerVoluntarios().slice()
            .sort((a, b) => (b.disponible - a.disponible) || ((b.zona === zonaObjetivo) - (a.zona === zonaObjetivo)))
            .slice(0, 12);

        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${UI.vistaAtras('Asignar voluntario', 'emergencias', 'Elige a quién enviar')}
                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
                    <label for="objetivo" class="text-xs font-bold text-slate-600">Caso a atender</label>
                    <select id="objetivo" onchange="CoordinacionComponent.cambiarObjetivo(this.value)" class="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white">
                        <optgroup label="Emergencias">
                            ${reportes.map(r => `<option value="reporte:${r.id}" ${tipo === 'reporte' && r.id === id ? 'selected' : ''}>${UI.esc(r.tipo)} · ${UI.esc(r.ubicacion)}</option>`).join('')}
                        </optgroup>
                        <optgroup label="Solicitudes de ayuda">
                            ${solicitudes.slice(0, 15).map(s => `<option value="solicitud:${s.id}" ${tipo === 'solicitud' && s.id === id ? 'selected' : ''}>${UI.esc(s.tipoAyuda)} · ${UI.esc(s.ubicacion)}</option>`).join('')}
                        </optgroup>
                    </select>
                </div>

                <fieldset class="space-y-2">
                    <legend class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Voluntarios</legend>
                    ${vols.map(v => {
                        const ya = yaAsignados.includes(v.id);
                        const bloqueado = !v.disponible || ya;
                        return `
                        <label class="flex items-center gap-3 bg-white rounded-2xl p-3 border border-slate-200 ${bloqueado ? 'opacity-60' : 'cursor-pointer'}">
                            ${UI.avatar(UI.iniciales(v.nombre, v.apellido), 'w-10 h-10 text-xs')}
                            <span class="flex-1 min-w-0">
                                <span class="block text-sm font-bold truncate">${UI.esc(v.nombre)} ${UI.esc(v.apellido)}</span>
                                <span class="block text-[11px] text-slate-500 truncate">${v.habilidades.map(UI.esc).join(' · ')} · ${UI.esc(v.zona)}</span>
                                <span class="block text-[10px] ${ya ? 'text-violet-700' : v.disponible ? 'text-emerald-700' : 'text-slate-400'} font-semibold">${ya ? 'Ya asignado' : v.disponible ? 'Disponible' : 'No disponible'}</span>
                            </span>
                            <input type="checkbox" name="vol" value="${v.id}" ${bloqueado ? 'disabled' : ''} onchange="CoordinacionComponent.contarSeleccion()" class="w-5 h-5 accent-violet-700" aria-label="Seleccionar a ${UI.esc(v.nombre)} ${UI.esc(v.apellido)}">
                        </label>`;
                    }).join('')}
                </fieldset>

                <button id="btn-asignar" disabled onclick="CoordinacionComponent.asignar('${tipo}','${id}')"
                    class="w-full bg-violet-700 hover:bg-violet-800 text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition disabled:opacity-50">
                    Asignar
                </button>
            </div>`;
    },

    cambiarObjetivo: (valor) => {
        const [tipo, id] = valor.split(':');
        app.navegar('asignar', { tipo, id });
    },

    contarSeleccion: () => {
        const n = document.querySelectorAll('input[name=vol]:checked').length;
        const b = document.getElementById('btn-asignar');
        b.disabled = n === 0;
        b.textContent = n ? `Asignar (${n})` : 'Asignar';
    },

    asignar: async (tipo, id) => {
        const ids = Array.from(document.querySelectorAll('input[name=vol]:checked')).map(i => i.value);
        if (!ids.length) return;
        const boton = document.getElementById('btn-asignar');
        if (boton) { boton.disabled = true; boton.textContent = 'Asignando…'; }
        try {
            await db.asignarVoluntarios(tipo, id, ids); // en la nube espera la confirmación del servidor
        } catch (e) {
            UI.toast(e.message || 'No se pudo asignar. Inténtalo de nuevo.');
            if (boton) { boton.disabled = false; boton.textContent = `Asignar (${ids.length})`; }
            return;
        }
        UI.toast(`${ids.length} voluntario(s) asignado(s).`);
        app.navegar(tipo === 'reporte' ? 'emergencias' : 'coordinacion');
    },

    /* ============ 34. Estadísticas e indicadores ============ */
    renderEstadisticas: () => {
        const reportes = db.obtenerTodosReportes(), solicitudes = db.obtenerTodasSolicitudes(), vols = db.obtenerVoluntarios();
        const atendidas = reportes.filter(r => r.estado === 'En atención' || r.estado === 'Resuelto').length;
        const pct = reportes.length ? Math.round((atendidas / reportes.length) * 100) : 0;

        const cats = ['Huayco', 'Inundación', 'Sismo', 'Incendio', 'Otros'];
        const conteo = cats.map(c => reportes.filter(r => CoordinacionComponent.categoria(r.tipo) === c).length);
        const max = Math.max(1, ...conteo);

        const etapas = ETAPAS_SOLICITUD.map(e => ({ e, n: solicitudes.filter(s => s.estado === e).length }));
        const disp = vols.filter(v => v.disponible).length;

        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${UI.vistaAtras('Estadísticas', 'coordinacion', 'Indicadores de la operación')}

                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <h3 class="text-sm font-extrabold mb-3">Emergencias atendidas</h3>
                    <div class="flex items-center gap-4">
                        <div class="dona relative" style="--p:${pct}" role="img" aria-label="${pct}% de emergencias atendidas"><b>${pct}%</b></div>
                        <p class="text-xs text-slate-600 leading-relaxed"><b>${atendidas}</b> de <b>${reportes.length}</b> emergencias están en atención o resueltas.</p>
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <h3 class="text-sm font-extrabold mb-3">Emergencias por tipo</h3>
                    <div class="flex items-end gap-2" style="height:130px" role="img" aria-label="Gráfico de barras de emergencias por tipo">
                        ${cats.map((c, i) => `
                            <div class="barra-col h-full justify-end">
                                <span class="text-[11px] font-bold">${conteo[i]}</span>
                                <div class="barra" style="height:${Math.round((conteo[i] / max) * 90)}px"></div>
                            </div>`).join('')}
                    </div>
                    <div class="flex gap-2 mt-1">${cats.map(c => `<span class="flex-1 text-center text-[10px] text-slate-500">${c}</span>`).join('')}</div>
                </div>

                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
                    <h3 class="text-sm font-extrabold">Solicitudes por estado</h3>
                    ${etapas.map(x => `
                        <div>
                            <div class="flex justify-between text-xs"><span>${x.e}</span><b>${x.n}</b></div>
                            <div class="h-2 rounded-full bg-slate-100 mt-1"><div class="h-2 rounded-full bg-amber-500" style="width:${solicitudes.length ? Math.round((x.n / solicitudes.length) * 100) : 0}%"></div></div>
                        </div>`).join('')}
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-teal-500 text-white rounded-2xl p-3.5"><div class="text-2xl font-extrabold">${disp}/${vols.length}</div><div class="text-xs font-semibold">Voluntarios disponibles</div></div>
                    <div class="bg-violet-700 text-white rounded-2xl p-3.5"><div class="text-2xl font-extrabold">${db.obtenerTodo().asignaciones.length}</div><div class="text-xs font-semibold">Asignaciones realizadas</div></div>
                </div>
                <p class="text-[11px] text-center text-slate-400">Calculado con los datos de demostración guardados en este dispositivo.</p>
            </div>`;
    },

    /* ============ Zonas seguras (refugios, acopio, puntos de reunión y salud) ============ */
    CATEGORIAS_ZONA: {
        refugio: { texto: 'Refugio', icono: 'fa-house-chimney-medical', color: 'bg-emerald-600' },
        acopio: { texto: 'Centro de acopio', icono: 'fa-boxes-packing', color: 'bg-amber-600' },
        reunion: { texto: 'Punto de reunión', icono: 'fa-people-roof', color: 'bg-sky-700' },
        salud: { texto: 'Atención de salud', icono: 'fa-kit-medical', color: 'bg-teal-700' }
    },

    /** Ubicación exacta tomada con el GPS al agregar una zona (opcional; si no, se usa el centro del distrito). */
    coordenadasZona: null,
    abiertoFormZona: false,

    renderZonas: () => {
        const C = CoordinacionComponent;
        const zonas = db.obtenerZonasSeguras();
        const u = db.obtenerUsuario();
        const estados = ['Activo', 'Lleno', 'Cerrado'];
        const chipEstado = (e) => ({ Activo: 'bg-emerald-100 text-emerald-700', Lleno: 'bg-amber-100 text-amber-700', Cerrado: 'bg-slate-200 text-slate-600' }[e] || 'bg-slate-100 text-slate-600');
        const tarjeta = (z) => {
            const c = C.CATEGORIAS_ZONA[z.categoria] || C.CATEGORIAS_ZONA.refugio;
            return `
            <div class="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2.5">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 ${c.color} text-white rounded-xl flex items-center justify-center flex-shrink-0"><i class="fa-solid ${c.icono}" aria-hidden="true"></i></div>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-sm font-bold text-slate-900">${UI.esc(z.nombre)}</h3>
                        <p class="text-[11px] text-slate-500">${c.texto} · ${UI.esc(z.distrito || 'Sin distrito')}${z.capacidad ? ' · ' + z.capacidad + ' personas' : ''}</p>
                    </div>
                    <span class="chip-estado ${chipEstado(z.estado)}">${UI.esc(z.estado)}</span>
                </div>
                <div class="flex items-center gap-1.5" role="group" aria-label="Estado de ${UI.esc(z.nombre)}">
                    ${estados.map(e => `<button onclick="CoordinacionComponent.cambiarEstadoZona('${z.id}','${e}')" aria-pressed="${z.estado === e}"
                        class="flex-1 min-h-[40px] rounded-xl text-xs font-bold border-2 ${z.estado === e ? 'border-violet-700 bg-violet-50 text-violet-800' : 'border-slate-200 bg-white text-slate-600'}">${e}</button>`).join('')}
                    <button onclick="CoordinacionComponent.pedirBorrarZona('${z.id}')" aria-label="Borrar ${UI.esc(z.nombre)}" class="w-11 min-h-[40px] rounded-xl border-2 border-slate-200 text-peru-red"><i class="fa-regular fa-trash-can" aria-hidden="true"></i></button>
                </div>
            </div>`;
        };
        const campo = 'w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-violet-600';
        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${UI.vistaAtras('Zonas seguras', 'coordinacion', `${zonas.length} ${zonas.length === 1 ? 'zona' : 'zonas'} en el mapa`)}
                <details id="zona-nueva" class="bg-white rounded-2xl border border-slate-200 shadow-sm" ${C.abiertoFormZona ? 'open' : ''}>
                    <summary class="cursor-pointer list-none p-3.5 flex items-center gap-3 text-sm font-bold text-violet-800 min-h-[52px]">
                        <i class="fa-solid fa-circle-plus text-lg" aria-hidden="true"></i><span class="flex-1">Agregar una zona segura</span><i class="fa-solid fa-chevron-down text-xs text-slate-400" aria-hidden="true"></i>
                    </summary>
                    <form onsubmit="return CoordinacionComponent.guardarZona(event)" class="px-3.5 pb-4 space-y-3" novalidate>
                        <p class="text-[11px] text-slate-500">Usa lugares públicos (colegios, estadios, postas). Nunca domicilios de personas.</p>
                        <div><label for="zn-nombre" class="block text-xs font-bold text-slate-700 mb-1">Nombre *</label>
                            <input id="zn-nombre" type="text" maxlength="80" class="${campo}" placeholder="Ej. Colegio San Martín"></div>
                        <div><label for="zn-categoria" class="block text-xs font-bold text-slate-700 mb-1">Tipo *</label>
                            <select id="zn-categoria" class="${campo}">${Object.entries(C.CATEGORIAS_ZONA).map(([k, v]) => `<option value="${k}">${v.texto}</option>`).join('')}</select></div>
                        <div><label for="zn-distrito" class="block text-xs font-bold text-slate-700 mb-1">Distrito *</label>
                            <input id="zn-distrito" type="text" maxlength="60" class="${campo}" value="${UI.esc(u.distrito || '')}" placeholder="Ej. Chaclacayo"></div>
                        <div><label for="zn-direccion" class="block text-xs font-bold text-slate-700 mb-1">Dirección o referencia</label>
                            <input id="zn-direccion" type="text" maxlength="160" class="${campo}" placeholder="Ej. Av. Los Cedros s/n"></div>
                        <div><label for="zn-descripcion" class="block text-xs font-bold text-slate-700 mb-1">Descripción</label>
                            <textarea id="zn-descripcion" rows="2" maxlength="300" class="${campo}" placeholder="Qué ofrece: agua, carpas, atención médica…"></textarea></div>
                        <div class="grid grid-cols-2 gap-3">
                            <div><label for="zn-capacidad" class="block text-xs font-bold text-slate-700 mb-1">Capacidad</label>
                                <input id="zn-capacidad" type="number" min="0" max="100000" inputmode="numeric" class="${campo}" placeholder="Personas"></div>
                            <div><label for="zn-horario" class="block text-xs font-bold text-slate-700 mb-1">Horario</label>
                                <input id="zn-horario" type="text" maxlength="80" class="${campo}" placeholder="24 horas"></div>
                        </div>
                        <div>
                            <button type="button" id="zn-gps" onclick="CoordinacionComponent.usarUbicacionZona()" class="w-full min-h-[44px] rounded-xl border-2 border-violet-200 bg-violet-50 text-violet-800 text-sm font-bold">
                                <i class="fa-solid fa-crosshairs mr-1" aria-hidden="true"></i> ${C.coordenadasZona ? 'Ubicación guardada' : 'Estoy en la zona: usar mi ubicación'}
                            </button>
                            <p id="zn-msg" class="text-[11px] text-slate-500 mt-1" role="status">Si no la usas, el pin se pone en el centro del distrito.</p>
                        </div>
                        <p id="zn-error" class="text-xs font-semibold text-red-700 hidden" role="alert"></p>
                        <button type="submit" class="w-full bg-violet-700 hover:bg-violet-800 text-white font-bold py-3 rounded-xl text-sm min-h-[48px]"><i class="fa-solid fa-check mr-1" aria-hidden="true"></i> Guardar zona</button>
                    </form>
                </details>
                ${zonas.length === 0 ? `<div class="bg-white rounded-2xl p-6 border border-slate-200 text-center text-sm text-slate-500">Aún no hay zonas seguras. Agrega la primera.</div>` : ''}
                <div class="space-y-2.5">${zonas.map(tarjeta).join('')}</div>
                <p class="text-[11px] text-center text-slate-400">Las zonas se ven en el mapa solidario para todas las personas. Cambia a «Lleno» o «Cerrado» cuando corresponda.</p>
            </div>`;
    },

    usarUbicacionZona: async () => {
        const C = CoordinacionComponent, boton = document.getElementById('zn-gps'), msg = document.getElementById('zn-msg');
        boton.disabled = true;
        msg.textContent = 'Buscando tu ubicación…';
        try {
            const p = await UI.geolocalizar();
            C.coordenadasZona = { lat: Math.round(p.lat * 100000) / 100000, lon: Math.round(p.lng * 100000) / 100000 };
            const campoDistrito = document.getElementById('zn-distrito');
            const z = UI.zonaCercana(p.lat, p.lng);
            if (z && z.km <= 60 && campoDistrito && !campoDistrito.value.trim()) campoDistrito.value = z.distrito;
            boton.innerHTML = '<i class="fa-solid fa-crosshairs mr-1" aria-hidden="true"></i> Ubicación guardada';
            msg.textContent = p.antigua ? 'Usamos la última ubicación guardada en tu teléfono. Revisa que sea la de la zona.' : 'Listo: el pin se pondrá donde estás ahora.';
        } catch (e) {
            msg.textContent = e.message;
        }
        boton.disabled = false;
    },

    guardarZona: (e) => {
        e.preventDefault();
        const C = CoordinacionComponent;
        const v = (id) => (document.getElementById(id).value || '').trim();
        const error = (m) => { const el = document.getElementById('zn-error'); el.textContent = m; el.classList.remove('hidden'); return false; };
        if (v('zn-nombre').length < 3) return error('Escribe el nombre de la zona (mínimo 3 letras).');
        if (!v('zn-distrito')) return error('Indica el distrito.');
        const capacidad = v('zn-capacidad');
        if (capacidad !== '' && (isNaN(Number(capacidad)) || Number(capacidad) < 0)) return error('La capacidad debe ser un número.');
        let punto = C.coordenadasZona;
        if (!punto) {
            const centro = UI.puntoDeDistrito(v('zn-distrito'), db.obtenerUsuario().departamento || '');
            if (!centro) return error('No conocemos ese distrito. Revisa el nombre o usa tu ubicación actual.');
            punto = { lat: centro[0], lon: centro[1] };
        }
        const boton = e.target.querySelector('button[type="submit"]');
        boton.disabled = true;
        db.crearZonaSegura({
            nombre: v('zn-nombre'), categoria: v('zn-categoria'), distrito: v('zn-distrito'), direccion: v('zn-direccion'),
            descripcion: v('zn-descripcion'), capacidad, horario: v('zn-horario'), lat: punto.lat, lon: punto.lon
        }).then(() => {
            C.coordenadasZona = null;
            C.abiertoFormZona = false;
            UI.toast('Zona segura agregada. Ya se ve en el mapa.');
            app.renderizar();
        }).catch((err) => {
            boton.disabled = false;
            error(err.message || 'No se pudo guardar la zona.');
        });
        return false;
    },

    cambiarEstadoZona: (id, estado) => {
        db.cambiarEstadoZona(id, estado);
        UI.toast('Estado cambiado a «' + estado + '».');
        app.renderizar();
    },

    pedirBorrarZona: (id) => {
        const z = db.obtenerZonasSeguras().find(x => x.id === id);
        if (!z) return;
        UI.confirmar({
            titulo: '¿Borrar esta zona segura?',
            texto: `«${z.nombre}» dejará de verse en el mapa. No se puede deshacer.`,
            boton: 'Sí, borrar',
            alConfirmar: () => { db.eliminarZonaSegura(id); UI.toast('Zona borrada.'); app.renderizar(); }
        });
    }
};
