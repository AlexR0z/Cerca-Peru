/**
 * Componente: Sección 3 "Comunidad y Seguimiento" (Pantallas 26 y 27)
 * - 26: Comunidad (voluntarios y publicaciones)
 * - 27: Perfil de voluntario
 */

const ComunidadComponent = {
    tab: 'voluntarios',

    estrellas: (n) => {
        const llenas = Math.round(n);
        return Array.from({ length: 5 }, (_, i) => `<i class="fa-solid fa-star ${i < llenas ? 'text-amber-400' : 'text-slate-200'}" aria-hidden="true"></i>`).join('');
    },

    /* ============ 26. Comunidad ============ */
    renderComunidad: (p = {}) => {
        // Llegada desde un aviso (me gusta o comentario): se abre esa publicación con sus comentarios.
        if (p && p.id) {
            ComunidadComponent.tab = 'publicaciones';
            ComunidadComponent.abiertas.add(p.id);
            ComunidadComponent.resaltar = p.id;
        }
        const tab = ComunidadComponent.tab;
        const distrito = db.obtenerUsuario().distrito || 'Chaclacayo';
        const vols = db.obtenerVoluntarios();
        const enZona = vols.filter(v => v.disponible && v.zona === distrito);
        const lista = vols.filter(v => v.disponible).sort((a, b) => (b.zona === distrito) - (a.zona === distrito)).slice(0, 12);
        const pubs = db.obtenerPublicaciones();

        const tarjetaTab = (k, icono, color, titulo, sub) => `
            <button role="tab" aria-selected="${tab === k}" onclick="ComunidadComponent.cambiarTab('${k}')"
                class="text-left rounded-2xl p-3.5 border-2 transition ${tab === k ? 'border-peru-red bg-red-50' : 'border-slate-200 bg-white'}">
                <div class="w-10 h-10 ${color} text-white rounded-xl flex items-center justify-center mb-2"><i class="fa-solid ${icono}" aria-hidden="true"></i></div>
                <div class="text-sm font-extrabold text-slate-900">${titulo}</div>
                <div class="text-[11px] text-slate-500">${sub}</div>
            </button>`;

        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${UI.vistaAtras('Comunidad', 'inicio', 'Vecinos que se ayudan')}
                <div class="grid grid-cols-2 gap-3" role="tablist">
                    ${tarjetaTab('voluntarios', 'fa-people-group', 'bg-amber-500', 'Voluntarios', `${enZona.length} activos en tu zona`)}
                    ${tarjetaTab('publicaciones', 'fa-newspaper', 'bg-pink-600', 'Publicaciones', 'Información y novedades')}
                </div>

                ${tab === 'voluntarios' ? `
                <div class="space-y-2.5">
                    ${lista.map(v => `
                        <button onclick="app.navegar('voluntario',{id:'${v.id}'})" class="w-full text-left bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex items-center gap-3">
                            ${UI.avatar(UI.iniciales(v.nombre, v.apellido), 'w-11 h-11 text-sm')}
                            <div class="flex-1 min-w-0">
                                <h3 class="text-sm font-bold truncate">${UI.esc(v.nombre)} ${UI.esc(v.apellido)}</h3>
                                <p class="text-[11px] text-slate-500 truncate">${v.habilidades.map(UI.esc).join(' · ')}</p>
                                <p class="text-[11px] text-slate-400"><i class="fa-solid fa-location-dot mr-1"></i>${UI.esc(v.zona)}</p>
                            </div>
                            <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Disponible</span>
                        </button>`).join('')}
                </div>
                <p class="text-[11px] text-center text-slate-400">Solo aparecen voluntarios que aceptaron estar en el directorio. Las valoraciones son opiniones de vecinos, no certificaciones.</p>
                ` : `
                <form id="guia-publicar" class="bg-white rounded-2xl p-3.5 border-2 border-[#1A1A1A] space-y-2" onsubmit="ComunidadComponent.publicar(event)">
                    <label for="texto-pub" class="text-base font-bold text-slate-900">Comparte algo con tu comunidad</label>
                    <textarea id="texto-pub" rows="2" maxlength="280" placeholder="Ej.: Este sábado repartimos agua en el parque central" class="w-full border-2 border-slate-400 rounded-xl p-2.5 text-base"></textarea>
                    ${ComunidadComponent.fotoPendiente ? `
                    <div class="relative">
                        <img src="${UI.esc(ComunidadComponent.fotoPendiente.url)}" alt="Foto que vas a publicar" class="w-full max-h-64 object-cover rounded-xl border-2 border-[#1A1A1A]">
                        <button type="button" onclick="ComunidadComponent.quitarFoto()" aria-label="Quitar foto" class="absolute top-2 right-2 w-11 h-11 rounded-full bg-white border-2 border-[#1A1A1A] flex items-center justify-center"><i class="fa-solid fa-xmark"></i></button>
                    </div>` : ''}
                    <input id="foto-pub" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" tabindex="-1" onchange="ComunidadComponent.elegirFoto(this)">
                    <p id="error-foto-pub" class="text-sm font-bold text-peru-red" role="alert"></p>
                    <div class="flex items-center justify-between gap-2">
                        <button type="button" onclick="document.getElementById('foto-pub').click()" class="flex items-center gap-2 font-bold text-base px-3 py-2.5 rounded-xl border-2 border-[#1A1A1A] bg-white">
                            <i class="fa-solid fa-camera" aria-hidden="true"></i> ${ComunidadComponent.fotoPendiente ? 'Cambiar foto' : 'Agregar foto'}
                        </button>
                        <button type="submit" class="bg-peru-red text-white font-bold text-base px-5 py-2.5 rounded-xl border-2 border-[#1A1A1A]">Publicar</button>
                    </div>
                    <p class="text-sm text-slate-600">No compartas teléfonos ni direcciones exactas.</p>
                </form>
                <div class="space-y-3">
                    ${pubs.length === 0 ? '<div class="bg-white rounded-2xl p-6 border-2 border-[#1A1A1A] text-center text-base text-slate-600">Aún no hay publicaciones. ¡Sé la primera persona en compartir algo!</div>' : ''}
                    ${pubs.map(ComunidadComponent.htmlPublicacion).join('')}
                </div>`}
            </div>`;
    },

    htmlPublicacion: (p) => {
        const abierta = ComunidadComponent.abiertas.has(p.id);
        const coments = p.comentarios || [];
        const total = p.totalComentarios ?? coments.length;
        const partes = String(p.autor || '').split(' ');
        return `
            <article id="pub-${UI.esc(p.id)}" class="bg-white rounded-2xl p-3.5 border-2 border-[#1A1A1A] ${ComunidadComponent.resaltar === p.id ? 'ring-4 ring-yellow-300' : ''}">
                <div class="flex items-center gap-2 mb-2">
                    ${UI.avatar(UI.iniciales(partes[0], partes[1] || ''), 'w-10 h-10 text-sm')}
                    <div class="flex-1 min-w-0"><div class="text-base font-bold truncate">${UI.esc(p.autor)}</div><div class="text-sm text-slate-500">${UI.esc(p.fecha)}</div></div>
                    ${p.mia || app.esCoordinador()
                        ? `<button onclick="ComunidadComponent.pedirBorrarPublicacion('${UI.esc(p.id)}')" aria-label="Borrar publicación" class="flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl border-2 border-[#1A1A1A] bg-white text-base font-bold text-peru-red"><i class="fa-regular fa-trash-can" aria-hidden="true"></i> Borrar</button>`
                        : `<button onclick="UI.toast('Gracias, revisaremos esta publicación.')" aria-label="Reportar publicación" class="w-11 h-11 rounded-full text-slate-500 hover:text-peru-red"><i class="fa-regular fa-flag"></i></button>`}
                </div>
                <p class="text-base text-slate-800 leading-snug">${UI.esc(p.texto)}</p>
                ${p.fotoUrl ? `<img src="${UI.esc(p.fotoUrl)}" alt="Foto de la publicación" loading="lazy" class="mt-2 w-full max-h-80 object-cover rounded-xl border-2 border-[#1A1A1A]">` : ''}
                <div class="mt-3 flex items-center gap-2">
                    <button onclick="ComunidadComponent.meGusta('${UI.esc(p.id)}')" aria-pressed="${p.miMeGusta}" class="flex items-center gap-2 min-h-[44px] px-3 rounded-xl border-2 border-[#1A1A1A] text-base font-bold ${p.miMeGusta ? 'bg-pink-100 text-peru-red' : 'bg-white text-slate-700'}">
                        <i class="${p.miMeGusta ? 'fa-solid' : 'fa-regular'} fa-heart" aria-hidden="true"></i>${p.meGusta} Me gusta
                    </button>
                    <button onclick="ComunidadComponent.alternarComentarios('${UI.esc(p.id)}')" aria-expanded="${abierta}" class="flex items-center gap-2 min-h-[44px] px-3 rounded-xl border-2 border-[#1A1A1A] text-base font-bold ${abierta ? 'bg-sky-100' : 'bg-white'} text-slate-700">
                        <i class="fa-regular fa-comment" aria-hidden="true"></i>${total} Comentar
                    </button>
                </div>
                ${abierta ? `
                <div class="mt-3 space-y-2">
                    ${coments.length === 0 ? '<p class="text-base text-slate-600">Todavía no hay comentarios. ¡Escribe el primero!</p>' : ''}
                    ${coments.map(c => `
                        <div class="pv-comentario flex items-start gap-2">
                            <div class="flex-1 min-w-0">
                                <div class="text-sm font-bold">${UI.esc(c.autor)}${c.mio ? ' <span class="text-slate-500 font-normal">(tú)</span>' : ''} <span class="text-slate-500 font-normal">· ${UI.esc(c.fecha)}</span></div>
                                <p class="text-base leading-snug break-words">${UI.esc(c.texto)}</p>
                            </div>
                            ${c.mio || app.esCoordinador()
                                ? `<button onclick="ComunidadComponent.pedirBorrarComentario('${UI.esc(p.id)}','${UI.esc(c.id)}')" aria-label="Borrar comentario" class="w-11 h-11 flex-none rounded-xl text-peru-red flex items-center justify-center"><i class="fa-regular fa-trash-can" aria-hidden="true"></i></button>` : ''}
                        </div>`).join('')}
                    <form class="flex items-center gap-2" onsubmit="ComunidadComponent.comentar(event, '${UI.esc(p.id)}')">
                        <label class="sr-only" for="com-${UI.esc(p.id)}">Escribe un comentario</label>
                        <input id="com-${UI.esc(p.id)}" data-borrador maxlength="200" autocomplete="off" placeholder="Escribe un comentario…" class="flex-1 min-w-0 border-2 border-slate-400 rounded-xl px-3 h-12 text-base">
                        <button type="submit" aria-label="Enviar comentario" class="w-12 h-12 rounded-xl bg-peru-red text-white border-2 border-[#1A1A1A] flex items-center justify-center"><i class="fa-solid fa-paper-plane"></i></button>
                    </form>
                </div>` : ''}
            </article>`;
    },

    /** Si se llega desde un aviso, se abre la publicación con sus comentarios y se muestra en pantalla. */
    montarComunidad: (p = {}) => {
        const id = p.id;
        if (!id) return;
        const el = document.getElementById('pub-' + id);
        if (el) el.scrollIntoView({ block: 'center' });
        if (p.confirmar) ComunidadComponent.pedirBorrarPublicacion(id); // vista previa de la pregunta (tablero de pantallas)
        setTimeout(() => { ComunidadComponent.resaltar = null; }, 4000);
    },

    /** Redibuja conservando lo que la persona estaba escribiendo y el lugar donde estaba. */
    refrescar: () => {
        const vista = document.getElementById('router-view');
        const y = vista.scrollTop;
        const borradores = {};
        vista.querySelectorAll('#texto-pub, [data-borrador]').forEach(e => { borradores[e.id] = e.value; });
        const enfocado = document.activeElement && document.activeElement.id;
        vista.innerHTML = ComunidadComponent.renderComunidad();
        Object.entries(borradores).forEach(([id, v]) => { const e = document.getElementById(id); if (e) e.value = v; });
        vista.scrollTop = y;
        const f = enfocado && document.getElementById(enfocado);
        if (f && /^(INPUT|TEXTAREA)$/.test(f.tagName)) f.focus();
    },

    cambiarTab: (t) => { ComunidadComponent.tab = t; ComunidadComponent.refrescar(); },

    /* ---------- Foto de la publicación ---------- */
    fotoPendiente: null, // { url, blob }

    /** Reduce la foto (lado mayor 1000 px, JPG) para que se suba rápido y ocupe poco. */
    reducirFoto: (archivo) => new Promise((ok, fallo) => {
        const url = URL.createObjectURL(archivo), img = new Image();
        img.onload = () => {
            const max = 1000, escala = Math.min(1, max / Math.max(img.width, img.height));
            const c = document.createElement('canvas');
            c.width = Math.round(img.width * escala); c.height = Math.round(img.height * escala);
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(url);
            c.toBlob((blob) => {
                if (!blob) return fallo(new Error('No pudimos procesar esa imagen. Prueba con otra.'));
                const lector = new FileReader();
                lector.onload = () => ok({ url: lector.result, blob });
                lector.onerror = () => fallo(new Error('No pudimos leer esa imagen. Prueba con otra.'));
                lector.readAsDataURL(blob);
            }, 'image/jpeg', 0.8);
        };
        img.onerror = () => { URL.revokeObjectURL(url); fallo(new Error('No pudimos leer esa imagen. Prueba con otra.')); };
        img.src = url;
    }),

    elegirFoto: async (input) => {
        const archivo = input.files && input.files[0];
        if (!archivo) return;
        const error = document.getElementById('error-foto-pub');
        if (!/^image\/(jpeg|png|webp)$/.test(archivo.type)) { error.textContent = 'Elige una imagen JPG, PNG o WEBP.'; input.value = ''; return; }
        if (archivo.size > 15 * 1048576) { error.textContent = 'La imagen pesa más de 15 MB. Elige una más liviana.'; input.value = ''; return; }
        try {
            ComunidadComponent.fotoPendiente = await ComunidadComponent.reducirFoto(archivo);
            ComunidadComponent.refrescar();
        } catch (e) { error.textContent = e.message; }
        input.value = '';
    },

    quitarFoto: () => { ComunidadComponent.fotoPendiente = null; ComunidadComponent.refrescar(); },

    publicar: (e) => {
        e.preventDefault();
        const texto = UI.valor('texto-pub');
        if (texto.length < 5) { UI.toast('Escribe al menos 5 caracteres.'); return; }
        db.agregarPublicacion(texto, ComunidadComponent.fotoPendiente);
        ComunidadComponent.fotoPendiente = null;
        document.getElementById('texto-pub').value = '';
        ComunidadComponent.refrescar();
        UI.toast('Publicación compartida.');
    },

    meGusta: (id) => { db.alternarMeGusta(id); ComunidadComponent.refrescar(); },

    /* ---------- Comentarios ---------- */
    abiertas: new Set(),
    resaltar: null,

    alternarComentarios: (id) => {
        if (ComunidadComponent.abiertas.has(id)) ComunidadComponent.abiertas.delete(id);
        else ComunidadComponent.abiertas.add(id);
        ComunidadComponent.refrescar();
        const campo = document.getElementById('com-' + id);
        if (campo) campo.focus();
    },

    pedirBorrarPublicacion: (id) => UI.confirmar({
        titulo: '¿Borrar esta publicación?',
        texto: 'Se borrarán también su foto y sus comentarios. No se puede deshacer.',
        boton: 'Sí, borrar',
        alConfirmar: () => {
            if (!db.eliminarPublicacion(id)) return;
            ComunidadComponent.abiertas.delete(id);
            ComunidadComponent.refrescar();
            UI.toast('Publicación borrada.');
        }
    }),

    pedirBorrarComentario: (pubId, comId) => UI.confirmar({
        titulo: '¿Borrar este comentario?',
        texto: 'No se puede deshacer.',
        boton: 'Sí, borrar',
        alConfirmar: () => {
            if (!db.eliminarComentario(pubId, comId)) return;
            ComunidadComponent.refrescar();
            UI.toast('Comentario borrado.');
        }
    }),

    comentar: (e, id) => {
        e.preventDefault();
        const campo = document.getElementById('com-' + id);
        const texto = (campo.value || '').trim().replace(/\s+/g, ' ');
        if (!texto) { UI.toast('Escribe tu comentario.'); return; }
        if (!db.agregarComentario(id, texto)) return;
        campo.value = '';
        ComunidadComponent.refrescar();
        const nuevo = document.getElementById('com-' + id);
        if (nuevo) nuevo.focus();
        UI.toast('Comentario enviado.');
    },

    /* ============ 27. Perfil de voluntario ============ */
    renderVoluntario: (p = {}) => {
        const v = db.obtenerVoluntario(p.id || 'VOL-001') || db.obtenerVoluntarios()[0];
        if (!v) return SolicitudesComponent.vacio('Voluntario', 'comunidad', 'No encontramos a esta persona. Puede que ya no esté en el directorio.');
        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${UI.vistaAtras('Voluntario', 'comunidad')}
                <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center">
                    ${UI.avatar(UI.iniciales(v.nombre, v.apellido), 'w-24 h-24 text-3xl mx-auto')}
                    <h2 class="text-lg font-extrabold mt-3">${UI.esc(v.nombre)} ${UI.esc(v.apellido)}</h2>
                    <p class="text-xs text-slate-500">Voluntario · ${UI.esc(v.zona)}</p>
                    ${v.valoracion == null ? '' : `<div class="mt-1 text-sm" aria-label="Valoración ${v.valoracion} de 5">${ComunidadComponent.estrellas(v.valoracion)} <span class="text-xs text-slate-500 ml-1">${v.valoracion}</span></div>`}
                    <span class="inline-block mt-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${v.disponible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}">${v.disponible ? 'Disponible ahora' : 'No disponible'}</span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-white rounded-2xl p-3 border border-slate-200 text-center"><div class="text-xl font-extrabold text-peru-red">${v.ayudas}</div><div class="text-[11px] text-slate-500">Ayudas realizadas</div></div>
                    <div class="bg-white rounded-2xl p-3 border border-slate-200 text-center"><div class="text-xl font-extrabold text-peru-red">${UI.esc(v.horario)}</div><div class="text-[11px] text-slate-500">Horario</div></div>
                </div>
                <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Puede ayudar con</h3>
                    <p class="text-sm text-slate-700 mb-3">${UI.esc(v.apoyo)}</p>
                    <div class="flex flex-wrap gap-1.5">${v.habilidades.map(h => `<span class="text-[11px] font-semibold bg-red-50 text-peru-red px-2.5 py-1 rounded-full">${UI.esc(h)}</span>`).join('')}</div>
                </div>
                ${ComunidadComponent.contactados.has(v.id) ? `
                <button id="btn-contactar" disabled class="w-full bg-peru-red text-white font-bold py-3.5 rounded-xl shadow-md text-sm opacity-60">
                    <i class="fa-solid fa-check mr-1"></i> Aviso enviado
                </button>` : `
                <button id="btn-contactar" onclick="ComunidadComponent.pedirContactar('${v.id}')" ${v.disponible ? '' : 'disabled'}
                    class="w-full bg-peru-red hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition disabled:opacity-50">
                    <i class="fa-regular fa-comment-dots mr-1"></i> Contactar
                </button>`}
                <p class="text-[11px] text-center text-slate-400">Le llega un aviso a su campana de Notificaciones. Solo si tú lo pides, esa persona verá tu celular para responderte. Su número no se muestra.</p>
            </div>`;
    },

    /** Voluntarios a los que ya se les avisó en esta sesión (para no repetir el aviso). */
    contactados: new Set(),

    /** Pide permiso para compartir el celular antes de avisar. */
    pedirContactar: (id) => {
        const v = db.obtenerVoluntario(id);
        if (!v) return;
        if (!/9\d{8}$/.test(String(db.obtenerUsuario().telefono || '').replace(/\D/g, ''))) {
            UI.toast('Primero agrega tu celular en Perfil → Editar perfil.');
            return;
        }
        UI.confirmar({
            titulo: `¿Avisar a ${v.nombre}?`,
            texto: `Le llegará un aviso a sus notificaciones. Para que pueda responderte, ${v.nombre} verá tu nombre, tu zona y tu celular. Su número no se muestra.`,
            boton: 'Sí, avisar',
            alConfirmar: () => ComunidadComponent.contactar(id)
        });
    },

    contactar: async (id) => {
        const v = db.obtenerVoluntario(id);
        const b = document.getElementById('btn-contactar');
        if (b) { b.disabled = true; b.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Enviando…'; }
        try {
            if (MODO_NUBE) await Nube.rpc('contactar_voluntario', { p_voluntario: id });
            ComunidadComponent.contactados.add(id);
            if (b) b.innerHTML = '<i class="fa-solid fa-check mr-1"></i> Aviso enviado';
            UI.toast(MODO_NUBE
                ? `Le avisamos a ${v ? v.nombre : 'la persona'}. Te escribirá o te llamará.`
                : `Aviso enviado (demostración). En la app real le llega a ${v ? v.nombre : 'la persona'} a su campana de Notificaciones.`);
        } catch (e) {
            if (b) { b.disabled = false; b.innerHTML = '<i class="fa-regular fa-comment-dots mr-1"></i> Contactar'; }
            UI.toast(e.message || 'No se pudo enviar el aviso. Inténtalo de nuevo.');
        }
    },

    /* ============ Aviso recibido: un vecino pidió tu ayuda (voluntario) ============ */
    renderContacto: () => `
        <div class="p-4 space-y-4 animate-fadeIn">
            ${UI.vistaAtras('Un vecino pidió tu ayuda', 'notificaciones', 'Aviso recibido')}
            <div id="contacto-cuerpo" role="status" class="bg-white rounded-2xl p-6 border border-slate-200 text-center text-sm text-slate-500">
                <i class="fa-solid fa-spinner fa-spin mr-1" aria-hidden="true"></i> Cargando…
            </div>
        </div>`,

    montarContacto: async (p = {}) => {
        const cuerpo = () => document.getElementById('contacto-cuerpo');
        let c = null;
        try {
            if (MODO_NUBE) {
                const r = await Nube.rpc('ver_contacto', { p_contacto: p.id });
                c = Array.isArray(r) ? r[0] : r;
            } else {
                // Demostración: una persona de ejemplo (el número es ficticio)
                c = { nombre: 'Rosa Quispe (ejemplo)', distrito: 'Chaclacayo', celular: '900000000', creado_en: new Date().toISOString() };
            }
        } catch (e) {
            if (cuerpo()) cuerpo().innerHTML = `<i class="fa-solid fa-circle-exclamation text-amber-500 mr-1" aria-hidden="true"></i> ${UI.esc(e.message || 'No pudimos abrir este aviso.')}`;
            return;
        }
        if (!cuerpo() || !c) return;
        const num = String(c.celular || '').replace(/\D/g, '').replace(/^51(?=9\d{8}$)/, '');
        const valido = /^9\d{8}$/.test(num);
        const saludo = encodeURIComponent('Hola, soy voluntario de Perú Vive. Vi tu aviso y quiero ayudarte. ¿Qué necesitas?');
        cuerpo().className = 'space-y-4';
        cuerpo().removeAttribute('role');
        cuerpo().innerHTML = `
            <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center">
                ${UI.avatar(UI.iniciales(c.nombre), 'w-20 h-20 text-2xl mx-auto')}
                <h2 class="text-lg font-extrabold mt-3">${UI.esc(c.nombre)}</h2>
                <p class="text-xs text-slate-500">Vecino de ${UI.esc(c.distrito || 'tu zona')}</p>
                <p class="text-sm text-slate-700 mt-3">Pidió tu ayuda y te compartió su celular para que le respondas.</p>
            </div>
            ${valido ? `
            <a href="https://wa.me/51${num}?text=${saludo}" target="_blank" rel="noopener" class="block w-full text-center bg-[#128C4A] text-white font-bold py-3.5 rounded-xl shadow-md text-sm">
                <i class="fa-brands fa-whatsapp mr-1" aria-hidden="true"></i> Escribir por WhatsApp
            </a>
            <a href="tel:+51${num}" class="block w-full text-center bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-md text-sm">
                <i class="fa-solid fa-phone mr-1" aria-hidden="true"></i> Llamar · ${num.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}
            </a>` : `
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">Esta persona no dejó un celular válido. Búscala en la comunidad para coordinar.</div>`}
            <p class="text-[11px] text-center text-slate-400">Usa este número solo para coordinar la ayuda. Si hay peligro inmediato, llama a Policía (105), Bomberos (116) o SAMU (106).</p>`;
    }
};
