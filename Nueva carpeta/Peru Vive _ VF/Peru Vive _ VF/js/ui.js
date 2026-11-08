/**
 * Utilidades de interfaz compartidas por todos los componentes de Perú Vive.
 * Solo construyen HTML o validan datos; no guardan nada (eso es trabajo de data.js).
 */

const UI = {
    esc: (valor) => String(valor ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),

    iniciales: (nombre = '', apellido = '') => ((nombre.trim()[0] || '') + (apellido.trim()[0] || '')).toUpperCase() || '?',

    /* ---------- Avisos ---------- */
    toast: (mensaje) => {
        let t = document.getElementById('toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'toast';
            t.setAttribute('role', 'status');
            t.className = 'fixed left-1/2 -translate-x-1/2 bottom-24 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg max-w-[90%] text-center';
            document.body.appendChild(t);
        }
        t.textContent = mensaje;
        t.style.display = 'block';
        clearTimeout(UI._tt);
        UI._tt = setTimeout(() => { t.style.display = 'none'; }, 2400);
    },

    /**
     * Hoja inferior que explica de qué trata un apartado y qué beneficios tiene.
     * info = { titulo, icono, color, queEs, beneficios: [], nota?, boton?: { texto, ruta } }
     */
    hoja: (info) => {
        UI.cerrarHoja();
        const cont = document.getElementById('app-container') || document.body;
        const fondo = document.createElement('div');
        fondo.id = 'pv-hoja';
        fondo.className = 'pv-hoja-fondo';
        fondo.addEventListener('click', (e) => { if (e.target === fondo) UI.cerrarHoja(); });
        fondo.innerHTML = `
            <section class="pv-hoja" role="dialog" aria-modal="true" aria-labelledby="pv-hoja-titulo" style="font-family:inherit;color:#1A1A1A">
                <div class="flex items-center gap-3">
                    <span class="w-14 h-14 rounded-2xl flex items-center justify-center flex-none text-white text-2xl" style="background:${info.color};border:3px solid #1A1A1A" aria-hidden="true"><i class="fa-solid ${info.icono}"></i></span>
                    <h2 id="pv-hoja-titulo" class="flex-1 font-bold leading-tight" style="font-size:24px">${UI.esc(info.titulo)}</h2>
                    <button type="button" onclick="UI.cerrarHoja()" aria-label="Cerrar" class="w-12 h-12 rounded-full flex items-center justify-center flex-none" style="border:3px solid #1A1A1A;background:#fff"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>
                <h3 class="font-bold mt-5 mb-1" style="font-size:19px">¿De qué trata?</h3>
                <p style="font-size:18px;line-height:1.45;color:#333">${UI.esc(info.queEs)}</p>
                <h3 class="font-bold mt-5 mb-2" style="font-size:19px">Beneficios</h3>
                <ul class="space-y-2">
                    ${info.beneficios.map(b => `
                        <li class="flex items-start gap-3" style="font-size:18px;line-height:1.4">
                            <i class="fa-solid fa-circle-check mt-1 flex-none" style="color:#14753A" aria-hidden="true"></i><span>${UI.esc(b)}</span>
                        </li>`).join('')}
                </ul>
                ${info.nota ? `<p class="mt-4 rounded-xl p-3" style="background:#FFF1C2;border:2px solid #1A1A1A;font-size:16px">${UI.esc(info.nota)}</p>` : ''}
                ${info.boton ? `<button type="button" onclick="UI.cerrarHoja();app.navegar('${info.boton.ruta}')" class="w-full mt-5 font-bold text-white rounded-2xl py-4" style="background:${info.color};border:3px solid #1A1A1A;font-size:20px">${UI.esc(info.boton.texto)}</button>` : ''}
                <button type="button" onclick="UI.cerrarHoja()" class="w-full mt-3 font-bold rounded-2xl py-3" style="border:3px solid #1A1A1A;background:#fff;font-size:18px">Cerrar</button>
            </section>`;
        cont.appendChild(fondo);
        fondo.querySelector('button').focus();
        UI._teclaHoja = (e) => { if (e.key === 'Escape') UI.cerrarHoja(); };
        document.addEventListener('keydown', UI._teclaHoja);
    },

    /**
     * Pregunta de confirmación propia (no usa confirm() del navegador, que no se muestra en el WebView de Android).
     * { titulo, texto, boton = 'Eliminar', alConfirmar }
     */
    confirmar: ({ titulo, texto, boton = 'Eliminar', alConfirmar }) => {
        UI.cerrarHoja();
        const cont = document.getElementById('app-container') || document.body;
        const fondo = document.createElement('div');
        fondo.id = 'pv-hoja';
        fondo.className = 'pv-hoja-fondo';
        fondo.addEventListener('click', (e) => { if (e.target === fondo) UI.cerrarHoja(); });
        UI._alConfirmar = alConfirmar;
        fondo.innerHTML = `
            <section class="pv-hoja" role="alertdialog" aria-modal="true" aria-labelledby="pv-conf-t" style="font-family:inherit;color:#1A1A1A">
                <h2 id="pv-conf-t" class="font-bold leading-tight" style="font-size:24px">${UI.esc(titulo)}</h2>
                <p class="mt-2" style="font-size:18px;line-height:1.45;color:#333">${UI.esc(texto)}</p>
                <button type="button" onclick="UI.cerrarHoja();if(UI._alConfirmar)UI._alConfirmar()" class="w-full mt-5 font-bold text-white rounded-2xl py-4" style="background:#C8102E;border:3px solid #1A1A1A;font-size:20px">${UI.esc(boton)}</button>
                <button type="button" onclick="UI.cerrarHoja()" class="w-full mt-3 font-bold rounded-2xl py-3" style="border:3px solid #1A1A1A;background:#fff;font-size:18px">Cancelar</button>
            </section>`;
        cont.appendChild(fondo);
        fondo.querySelectorAll('button')[1].focus(); // el foco queda en "Cancelar" para no borrar sin querer
        UI._teclaHoja = (e) => { if (e.key === 'Escape') UI.cerrarHoja(); };
        document.addEventListener('keydown', UI._teclaHoja);
    },

    cerrarHoja: () => {
        const h = document.getElementById('pv-hoja');
        if (h) h.remove();
        if (UI._teclaHoja) { document.removeEventListener('keydown', UI._teclaHoja); UI._teclaHoja = null; }
    },

    /* ---------- Estados con texto + color (nunca solo color) ---------- */
    chip: (estado) => {
        const mapa = {
            'Pendiente': 'bg-amber-100 text-amber-700', 'Activa': 'bg-amber-100 text-amber-700', 'Reportado': 'bg-amber-100 text-amber-700',
            'En revisión': 'bg-sky-100 text-sky-700', 'Verificado': 'bg-emerald-100 text-emerald-700',
            'En coordinación': 'bg-violet-100 text-violet-700', 'En atención': 'bg-blue-100 text-blue-700',
            'Resuelto': 'bg-green-100 text-green-700', 'Atendida': 'bg-green-100 text-green-700',
            'Disponible': 'bg-emerald-100 text-emerald-700', 'Pausada': 'bg-slate-200 text-slate-600',
            'Cancelada': 'bg-slate-200 text-slate-600'
        };
        return `<span class="chip-estado ${mapa[estado] || 'bg-slate-100 text-slate-600'}">${UI.esc(estado)}</span>`;
    },

    /* ---------- Cabecera de vista interna ---------- */
    vistaAtras: (titulo, ruta = 'inicio', subtitulo = '', derecha = '') => `
        <div class="flex items-center gap-3 mb-1">
            <button onclick="app.navegar('${ruta}')" aria-label="Volver" class="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-peru-red flex items-center justify-center flex-shrink-0">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
            <div class="flex-1 min-w-0">
                <h2 class="text-base font-extrabold text-slate-900 leading-tight truncate">${titulo}</h2>
                ${subtitulo ? `<p class="text-[11px] text-slate-500 truncate">${subtitulo}</p>` : ''}
            </div>
            ${derecha}
        </div>`,

    avatar: (iniciales, clases = 'w-12 h-12 text-base', foto = '') => foto
        ? `<img src="${UI.esc(foto)}" alt="" class="${clases} rounded-full object-cover flex-shrink-0">`
        : `<div aria-hidden="true" class="${clases} rounded-full bg-red-100 text-peru-red font-extrabold flex items-center justify-center flex-shrink-0">${UI.esc(iniciales)}</div>`,

    interruptor: (id, activo, alCambiar) => `
        <label class="interruptor">
            <input type="checkbox" id="${id}" ${activo ? 'checked' : ''} onchange="${alCambiar}">
            <span></span>
        </label>`,

    /* ---------- Campos de formulario (estilo píldora del boceto) ---------- */
    // Íconos que FontAwesome gratuito ofrece en versión lineal; el resto se dibuja en sólido.
    ICONOS_LINEALES: ['fa-user', 'fa-envelope', 'fa-calendar'],

    campo: ({ id, etiqueta, tipo = 'text', icono = '', valor = '', autocompletar = '', modo = '', maxlen = '', ojo = false, obligatorio = false }) => `
        <div>
            <div class="campo-pill" id="w-${id}">
                ${icono ? `<i class="${UI.ICONOS_LINEALES.includes(icono) ? 'fa-regular' : 'fa-solid'} ${icono} ico" aria-hidden="true"></i>` : ''}
                <input id="${id}" type="${tipo}" placeholder="${UI.esc(etiqueta)}" aria-label="${UI.esc(etiqueta)}"
                    value="${UI.esc(valor)}" ${autocompletar ? `autocomplete="${autocompletar}"` : ''}
                    ${modo ? `inputmode="${modo}"` : ''} ${maxlen ? `maxlength="${maxlen}"` : ''} ${obligatorio ? 'required' : ''}
                    oninput="UI.limpiarError('${id}')">
                ${ojo ? `<button type="button" class="campo-ojo" aria-label="Mostrar contraseña" aria-pressed="false" onclick="UI.alternarOjo('${id}', this)"><i class="fa-regular fa-eye"></i></button>` : ''}
            </div>
            <span class="campo-error" id="e-${id}" role="alert"></span>
        </div>`,

    alternarOjo: (id, boton) => {
        const input = document.getElementById(id);
        const ver = input.type === 'password';
        input.type = ver ? 'text' : 'password';
        boton.setAttribute('aria-pressed', String(ver));
        boton.setAttribute('aria-label', ver ? 'Ocultar contraseña' : 'Mostrar contraseña');
        boton.innerHTML = `<i class="fa-regular ${ver ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
    },

    marcarError: (id, mensaje) => {
        const e = document.getElementById('e-' + id), w = document.getElementById('w-' + id);
        if (e) e.textContent = mensaje;
        if (w) w.classList.add('mal');
        return true;
    },

    limpiarError: (id) => {
        const e = document.getElementById('e-' + id), w = document.getElementById('w-' + id);
        if (e) e.textContent = '';
        if (w) w.classList.remove('mal');
        const g = document.getElementById('aviso');
        if (g) { g.textContent = ''; g.className = 'aviso-global'; }
    },

    avisoGlobal: (mensaje, ok = false) => {
        const g = document.getElementById('aviso');
        if (g) { g.textContent = mensaje; g.className = 'aviso-global' + (ok ? ' ok' : ''); }
    },

    valor: (id) => (document.getElementById(id)?.value || '').trim(),

    /* ---------- Validaciones ---------- */
    validar: {
        celular: (v) => /^9\d{8}$/.test(v),
        correo: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        correoOCelular: (v) => v.includes('@') ? UI.validar.correo(v) : UI.validar.celular(v),
        nombre: (v) => /^\p{L}[\p{L}\s'.-]*$/u.test(v) && v.length >= 2,
        clave: (v) => v.length >= 8
    },

    /* ---------- Marco de pantalla de acceso ---------- */
    marcoAuth: (contenido, { atras = '', onda = true } = {}) => `
        <div class="auth animate-fadeIn">
            ${atras ? `<button class="auth-atras" onclick="app.navegar('${atras}')" aria-label="Volver"><i class="fa-solid fa-chevron-left"></i></button>` : ''}
            <main class="auth-in">${contenido}</main>
            ${onda ? UI.onda() : ''}
        </div>`,

    onda: () => `
        <svg class="auth-onda" viewBox="0 0 400 150" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 70 C80 30 150 110 230 70 S350 20 400 60 V150 H0Z" fill="#fde2e4"/>
            <path d="M0 100 C90 70 160 130 240 100 S350 70 400 95 V150 H0Z" fill="#f9b4ba"/>
            <path d="M0 125 C100 105 170 150 250 125 S360 105 400 122 V150 H0Z" fill="#D91424"/>
        </svg>`,

    logo: (ancho = 150) => `<img src="img/logo-horizontal.webp" alt="Perú Vive" style="width:${ancho}px;height:auto">`,
    corazon: (ancho = 72) => `<img src="img/corazon.webp" alt="" style="width:${ancho}px;height:auto" aria-hidden="true">`,

    /**
     * Distrito del Perú más cercano a un punto GPS (usa js/ubigeo.js, sin internet).
     * Es una sugerencia: se compara con el punto central de cada distrito.
     * Devuelve { departamento, provincia, distrito, km } o null si no hay lista.
     */
    zonaCercana: (lat, lng) => {
        if (typeof UBIGEO_PUNTOS === 'undefined') return null;
        const k = Math.cos(lat * Math.PI / 180);
        let mejor = null;
        for (const dep in UBIGEO_PUNTOS) {
            for (const prov in UBIGEO_PUNTOS[dep]) {
                UBIGEO_PUNTOS[dep][prov].forEach((p, i) => {
                    if (!p) return;
                    const dx = (lng - p[1]) * k, dy = lat - p[0], d2 = dx * dx + dy * dy;
                    if (!mejor || d2 < mejor.d2) mejor = { d2, departamento: dep, provincia: prov, distrito: UBIGEO[dep][prov][i] };
                });
            }
        }
        if (!mejor) return null;
        return { departamento: mejor.departamento, provincia: mejor.provincia, distrito: mejor.distrito, km: Math.round(Math.sqrt(mejor.d2) * 111) };
    },

    /** Punto aproximado [lat, lon] de un distrito; si el nombre se repite, se prefiere el departamento y la provincia indicados. */
    puntoDeDistrito: (distrito, departamento = '', provincia = '') => {
        if (typeof UBIGEO_PUNTOS === 'undefined' || !distrito) return null;
        let primero = null;
        for (const dep in UBIGEO) {
            for (const prov in UBIGEO[dep]) {
                const i = UBIGEO[dep][prov].indexOf(distrito);
                if (i < 0 || !UBIGEO_PUNTOS[dep][prov][i]) continue;
                if (dep === departamento && (!provincia || prov === provincia)) return UBIGEO_PUNTOS[dep][prov][i];
                if (!primero || dep === departamento) primero = UBIGEO_PUNTOS[dep][prov][i];
            }
        }
        return primero;
    },

    /** Texto corto de una zona: "Distrito, Departamento". */
    textoZona: (z) => `${z.distrito}, ${z.departamento}`,

    /* ---------- Ubicación del dispositivo (siempre con permiso del usuario) ---------- */
    geolocalizar: () => new Promise((resolver, rechazar) => {
        const bien = (p) => resolver({ lat: p.coords.latitude, lng: p.coords.longitude });
        const motivo = (e) => new Error(
            e.code === 1 ? 'No hay permiso de ubicación precisa. En Ajustes → Aplicaciones → Perú Vive → Permisos → Ubicación, elige "Permitir" y activa "Usar ubicación precisa", o elige tu zona en las listas.'
            : e.code === 3 ? 'Tardó demasiado en encontrarte. Sal a un lugar abierto, revisa que la ubicación (GPS) del teléfono esté activada y vuelve a intentar, o elige tu zona en las listas.'
            : 'No pudimos obtener tu ubicación. Revisa que la ubicación (GPS) del teléfono esté activada, o elige tu zona en las listas.');
        // 1.º intento rápido (red o última posición conocida). Si falla por señal o por el modo de ubicación del
        // teléfono, 2.º intento con GPS, con más tiempo. Si el problema es el permiso, no tiene sentido repetir.
        // Último recurso en la app Android: la última posición que el teléfono tiene guardada. Sirve para sugerir el
        // distrito aunque el navegador interno no consiga una posición nueva (permiso solo aproximado, GPS dormido...).
        const fallar = (e) => {
            const guardada = UI.ubicacionDeLaApp();
            if (guardada) resolver({ lat: guardada.lat, lng: guardada.lng, antigua: guardada.edad > 600000 });
            else rechazar(motivo(e));
        };
        if (!navigator.geolocation) return fallar({ code: 2 });
        navigator.geolocation.getCurrentPosition(bien, (e1) => {
            if (e1.code === 1) return fallar(e1);
            navigator.geolocation.getCurrentPosition(bien, fallar, { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 });
        }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 });
    }),

    /** Solo en la app Android: última ubicación conocida del teléfono, o null si no hay permiso o ninguna posición guardada. */
    ubicacionDeLaApp: () => {
        try {
            if (!window.AndroidUbicacion) return null;
            const [lat, lng, edad] = String(window.AndroidUbicacion.ultimaPosicion()).split(',').map(Number);
            return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng, edad: edad || 0 } : null;
        } catch (e) {
            return null;
        }
    }
};
