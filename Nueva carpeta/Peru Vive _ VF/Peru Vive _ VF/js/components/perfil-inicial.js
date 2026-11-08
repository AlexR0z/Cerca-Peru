/**
 * Componente: Sección 1 "Inicio y Acceso" (Pantallas 08 a 10)
 * - 08: Completar perfil (foto, nombre visible, fecha de nacimiento con listas de día, mes y año)
 * - 09: Tu ubicación (departamento, provincia, distrito, ubicación actual con permiso)
 * - 10: Tutorial inicial (3 pasos)
 */

// La lista completa de departamentos, provincias y distritos (UBIGEO) está en js/ubigeo.js.

const PerfilInicialComponent = {
    MESES: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    avatarTemporal: '',
    coordenadas: null,
    slide: 0,

    esperar: (ms) => new Promise(r => setTimeout(r, ms)),

    /* ============ 08. Completar perfil ============ */
    htmlAvatar: () => {
        const foto = PerfilInicialComponent.avatarTemporal;
        return `
            <div class="relative" style="width:128px;height:128px">
                <div class="w-full h-full rounded-full overflow-hidden border-[3px] border-slate-300 bg-slate-100 flex items-center justify-center">
                    ${foto ? `<img src="${foto}" alt="Tu foto de perfil" class="w-full h-full object-cover">`
                           : `<i class="fa-solid fa-user text-slate-300" style="font-size:3.6rem" aria-hidden="true"></i>`}
                </div>
                <button type="button" onclick="document.getElementById('archivo-foto').click()" aria-label="Agregar foto de perfil"
                    class="absolute -right-1 -bottom-1 w-11 h-11 rounded-full bg-peru-red text-white border-[3px] border-white flex items-center justify-center shadow">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
            ${foto ? `<button type="button" class="link-sutil mt-1 underline" onclick="PerfilInicialComponent.quitarFoto()">Quitar foto</button>` : ''}`;
    },

    renderCompletarPerfil: () => {
        PerfilInicialComponent.avatarTemporal = db.obtenerUsuario().avatar || '';
        const u = db.obtenerUsuario();
        return UI.marcoAuth(`
            <i class="fa-regular fa-user text-peru-red" style="font-size:3rem" aria-hidden="true"></i>
            <h1>Completa tu perfil</h1>
            <form id="f-perfil" class="auth-form" style="margin-top:14px" novalidate onsubmit="PerfilInicialComponent.enviarPerfil(event)">
                <div id="bloque-avatar" class="flex flex-col items-center">${PerfilInicialComponent.htmlAvatar()}</div>
                <input id="archivo-foto" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" tabindex="-1" onchange="PerfilInicialComponent.elegirFoto(this)">
                <span class="campo-error text-center" id="e-foto" role="alert"></span>
                ${UI.campo({ id: 'visible', etiqueta: 'Nombre visible', icono: 'fa-user', valor: u.nombreVisible || '', maxlen: 30, autocompletar: 'nickname' })}
                ${PerfilInicialComponent.selectorFecha(u.fechaNacimiento || '')}
                <div id="aviso" class="aviso-global" role="alert"></div>
                <button id="boton" type="submit" class="btn-pill">Continuar</button>
            </form>`);
    },

    montarCompletarPerfil: () => {},

    /**
     * Fecha de nacimiento con tres listas (día, mes y año): no depende del calendario del navegador,
     * que fallaba en algunos celulares. Se guarda igual que antes: "AAAA-MM-DD".
     */
    selectorFecha: (valor) => {
        const [a = '', m = '', d = ''] = /^\d{4}-\d{2}-\d{2}$/.test(valor) ? valor.split('-') : [];
        const hoy = new Date().getFullYear();
        const opcion = (v, texto, elegido) => `<option value="${v}" ${String(v) === String(elegido) ? 'selected' : ''}>${texto}</option>`;
        const lista = (id, etiqueta, opciones) => `
            <div class="campo-pill" style="padding:0 6px 0 12px">
                <select id="${id}" aria-label="${etiqueta}" onchange="UI.limpiarError('nacimiento')">${opciones}</select>
            </div>`;
        const dias = opcion('', 'Día', d) + Array.from({ length: 31 }, (_, i) => opcion(String(i + 1).padStart(2, '0'), i + 1, d)).join('');
        const meses = opcion('', 'Mes', m) + PerfilInicialComponent.MESES.map((n, i) => opcion(String(i + 1).padStart(2, '0'), n, m)).join('');
        const anios = opcion('', 'Año', a) + Array.from({ length: hoy - 1899 }, (_, i) => opcion(hoy - i, hoy - i, a)).join('');
        return `
            <div>
                <p class="text-sm font-bold text-slate-700 mb-1.5 ml-1">Fecha de nacimiento</p>
                <div id="w-nacimiento" class="fecha-trio" role="group" aria-label="Fecha de nacimiento">
                    ${lista('nac-dia', 'Día de nacimiento', dias)}
                    ${lista('nac-mes', 'Mes de nacimiento', meses)}
                    ${lista('nac-anio', 'Año de nacimiento', anios)}
                </div>
                <span class="campo-error" id="e-nacimiento" role="alert"></span>
            </div>`;
    },

    /** Lee las tres listas. Devuelve '' si falta alguna, 'invalida' si la fecha no existe (31 de febrero) o el texto AAAA-MM-DD. */
    leerFecha: () => {
        const d = UI.valor('nac-dia'), m = UI.valor('nac-mes'), a = UI.valor('nac-anio');
        if (!d || !m || !a) return '';
        const f = new Date(Number(a), Number(m) - 1, Number(d));
        if (f.getFullYear() !== Number(a) || f.getMonth() !== Number(m) - 1 || f.getDate() !== Number(d)) return 'invalida';
        return `${a}-${m}-${d}`;
    },

    /** Reduce la foto a 256 px para que ocupe poco espacio en el dispositivo. */
    reducirImagen: (archivo) => new Promise((ok, fallo) => {
        const url = URL.createObjectURL(archivo), img = new Image();
        img.onload = () => {
            const L = 256, c = document.createElement('canvas');
            c.width = c.height = L;
            const m = Math.min(img.width, img.height);
            c.getContext('2d').drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, L, L);
            URL.revokeObjectURL(url);
            ok(c.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => { URL.revokeObjectURL(url); fallo(new Error('No pudimos leer esa imagen. Prueba con otra.')); };
        img.src = url;
    }),

    elegirFoto: async (input) => {
        const archivo = input.files && input.files[0];
        const error = document.getElementById('e-foto');
        error.textContent = '';
        if (!archivo) return;
        if (!/^image\/(jpeg|png|webp)$/.test(archivo.type)) { error.textContent = 'Elige una imagen JPG, PNG o WEBP.'; return; }
        if (archivo.size > 10 * 1048576) { error.textContent = 'La imagen pesa más de 10 MB. Elige una más liviana.'; return; }
        try {
            PerfilInicialComponent.avatarTemporal = await PerfilInicialComponent.reducirImagen(archivo);
            document.getElementById('bloque-avatar').innerHTML = PerfilInicialComponent.htmlAvatar();
        } catch (e) { error.textContent = e.message; }
        input.value = '';
    },

    quitarFoto: () => {
        PerfilInicialComponent.avatarTemporal = '';
        document.getElementById('bloque-avatar').innerHTML = PerfilInicialComponent.htmlAvatar();
    },

    enviarPerfil: async (e) => {
        e.preventDefault();
        ['visible', 'nacimiento'].forEach(UI.limpiarError);
        const nombre = UI.valor('visible').replace(/\s+/g, ' '), fecha = PerfilInicialComponent.leerFecha();
        const hoy = new Date().toISOString().slice(0, 10);
        let hayError = false;
        if (!nombre) hayError = UI.marcarError('visible', 'Ingresa tu nombre visible');
        else if (nombre.length < 2) hayError = UI.marcarError('visible', 'Escribe al menos 2 caracteres');
        else if (!/^[\p{L}\p{N}][\p{L}\p{N}\s'._-]*$/u.test(nombre)) hayError = UI.marcarError('visible', 'Usa solo letras, números y espacios');
        if (!fecha) hayError = UI.marcarError('nacimiento', 'Elige el día, el mes y el año');
        else if (fecha === 'invalida') hayError = UI.marcarError('nacimiento', 'Esa fecha no existe. Revisa el día y el mes');
        else if (fecha > hoy) hayError = UI.marcarError('nacimiento', 'La fecha no puede ser futura');
        else if (fecha < '1900-01-01') hayError = UI.marcarError('nacimiento', 'La fecha no es válida');
        if (hayError) return;

        const boton = document.getElementById('boton');
        boton.disabled = true; boton.textContent = 'Guardando…';
        await PerfilInicialComponent.esperar(400);
        db.actualizarUsuario({ nombreVisible: nombre, fechaNacimiento: fecha, avatar: PerfilInicialComponent.avatarTemporal });
        app.navegar('ubicacion');
    },

    /* ============ 09. Tu ubicación ============ */
    opciones: (lista, elegido, vacio) =>
        `<option value="">${vacio}</option>` + lista.map(x => `<option value="${UI.esc(x)}" ${x === elegido ? 'selected' : ''}>${UI.esc(x)}</option>`).join(''),

    // Pantalla a la que se vuelve al guardar: el tutorial (primera vez) o desde donde se pidió cambiarla.
    destinoUbicacion: 'tutorial',

    renderUbicacion: (p = {}) => {
        const cambio = ['inicio', 'perfil'].includes(p.volver);
        PerfilInicialComponent.destinoUbicacion = cambio ? p.volver : 'tutorial';
        const u = db.obtenerUsuario();
        const dep = UBIGEO[u.departamento] ? u.departamento : '';
        const prov = dep && UBIGEO[dep][u.provincia] ? u.provincia : '';
        const dis = prov && UBIGEO[dep][prov].includes(u.distrito) ? u.distrito : '';
        PerfilInicialComponent.coordenadas = null;
        const sel = (id, ico, contenido) => `
            <div>
                <div class="campo-pill" id="w-${id}">
                    <i class="fa-solid ${ico} ico" aria-hidden="true"></i>
                    <select id="${id}" aria-label="${id[0].toUpperCase() + id.slice(1)}" onchange="PerfilInicialComponent.cambioSelect('${id}')">${contenido}</select>
                </div>
                <span class="campo-error" id="e-${id}" role="alert"></span>
            </div>`;
        return UI.marcoAuth(`
            <i class="fa-solid fa-location-dot text-peru-red" style="font-size:3rem" aria-hidden="true"></i>
            <h1>${cambio ? 'Cambiar mi ubicación' : 'Tu ubicación'}</h1>
            <p class="auth-sub">${cambio ? 'Elige tu zona a mano o deja que el teléfono la detecte. Puedes cambiarla cuando te muevas.' : 'Así te mostramos las alertas y la ayuda que hay cerca de ti.'}</p>
            <form id="f-ubicacion" class="auth-form" style="gap:11px" novalidate onsubmit="PerfilInicialComponent.enviarUbicacion(event)">
                ${sel('departamento', 'fa-map', PerfilInicialComponent.opciones(Object.keys(UBIGEO), dep, 'Departamento'))}
                ${sel('provincia', 'fa-map-pin', PerfilInicialComponent.opciones(dep ? Object.keys(UBIGEO[dep]) : [], prov, 'Provincia'))}
                ${sel('distrito', 'fa-location-crosshairs', PerfilInicialComponent.opciones(prov ? UBIGEO[dep][prov] : [], dis, 'Distrito'))}
                <button type="button" id="boton-gps" class="btn-pill claro" onclick="PerfilInicialComponent.usarMiUbicacion()">
                    <i class="fa-solid fa-crosshairs"></i> Usar mi ubicación actual
                </button>
                <p id="msg-gps" class="text-center text-xs text-slate-600" role="status"></p>
                <div id="aviso" class="aviso-global" role="alert"></div>
                <button id="boton" type="submit" class="btn-pill">Continuar</button>
                <p class="text-center text-xs text-slate-500">Solo guardamos una ubicación aproximada. La lista incluye los 25 departamentos del Perú.</p>
            </form>`, cambio ? { atras: p.volver } : {});
    },

    montarUbicacion: () => {},

    cambioSelect: (id) => {
        UI.limpiarError(id);
        const dep = document.getElementById('departamento').value;
        if (id === 'departamento') {
            document.getElementById('provincia').innerHTML = PerfilInicialComponent.opciones(dep ? Object.keys(UBIGEO[dep]) : [], '', 'Provincia');
            document.getElementById('distrito').innerHTML = PerfilInicialComponent.opciones([], '', 'Distrito');
        } else if (id === 'provincia') {
            const prov = document.getElementById('provincia').value;
            document.getElementById('distrito').innerHTML = PerfilInicialComponent.opciones(prov ? UBIGEO[dep][prov] : [], '', 'Distrito');
        }
    },

    usarMiUbicacion: async () => {
        const boton = document.getElementById('boton-gps'), msg = document.getElementById('msg-gps');
        boton.disabled = true; msg.textContent = 'Buscando tu ubicación…';
        try {
            const p = await UI.geolocalizar();
            // Se guarda redondeada (≈110 m) para no registrar la ubicación exacta.
            PerfilInicialComponent.coordenadas = { lat: Math.round(p.lat * 1000) / 1000, lng: Math.round(p.lng * 1000) / 1000 };
            const z = UI.zonaCercana(p.lat, p.lng);
            if (z && z.km <= 60) {
                // Se rellenan las tres listas con el distrito más cercano; la persona puede corregirlo.
                document.getElementById('departamento').value = z.departamento; PerfilInicialComponent.cambioSelect('departamento');
                document.getElementById('provincia').value = z.provincia; PerfilInicialComponent.cambioSelect('provincia');
                document.getElementById('distrito').value = z.distrito;
                ['departamento', 'provincia', 'distrito'].forEach(UI.limpiarError);
                msg.textContent = `Detectamos que estás cerca de ${z.distrito} (${z.provincia}, ${z.departamento})${p.antigua ? ', según la última ubicación guardada en tu teléfono' : ''}. Si no es correcto, cámbialo en las listas.`;
            } else {
                msg.textContent = 'Tu ubicación parece estar lejos de los distritos del Perú. Elige tu zona en las listas.';
            }
        } catch (err) {
            msg.textContent = err.message;
        }
        boton.disabled = false;
    },

    enviarUbicacion: async (e) => {
        e.preventDefault();
        ['departamento', 'provincia', 'distrito'].forEach(UI.limpiarError);
        const dep = UI.valor('departamento'), prov = UI.valor('provincia'), dis = UI.valor('distrito');
        let hayError = false;
        if (!dep) hayError = UI.marcarError('departamento', 'Selecciona tu departamento');
        if (!prov) hayError = UI.marcarError('provincia', 'Selecciona tu provincia');
        if (!dis) hayError = UI.marcarError('distrito', 'Selecciona tu distrito');
        if (hayError) return;

        const boton = document.getElementById('boton');
        boton.disabled = true; boton.textContent = 'Guardando…';
        await PerfilInicialComponent.esperar(400);
        const cambios = { departamento: dep, provincia: prov, distrito: dis, ubicacion: `${dis}, ${dep}` };
        // Sin GPS en este guardado, se olvida la ubicación real anterior: el mapa vuelve a abrir en el distrito elegido.
        cambios.coordenadas = PerfilInicialComponent.coordenadas || null;
        db.actualizarUsuario(cambios);
        if (PerfilInicialComponent.destinoUbicacion !== 'tutorial') UI.toast('Ubicación actualizada: ' + cambios.ubicacion);
        app.navegar(PerfilInicialComponent.destinoUbicacion);
    },

    /* ============ 10. Tutorial inicial ============ */
    slides: [
        { titulo: 'Conoce cómo funciona Perú Vive', texto: 'Reporta emergencias, pide u ofrece ayuda y mira qué pasa cerca de ti, todo en un solo lugar.', icono: 'fa-location-dot', color: '#D91424' },
        { titulo: 'Reporta y pide ayuda', texto: 'Avisa de una emergencia en pocos pasos o solicita apoyo para tu familia. Puedes seguir cada solicitud.', icono: 'fa-triangle-exclamation', color: '#F6B90E' },
        { titulo: 'Ayuda a tu comunidad', texto: 'Ofrece alimentos, transporte o tu tiempo, y consulta el mapa solidario para ver dónde se necesita.', icono: 'fa-hand-holding-heart', color: '#12A4A0' }
    ],

    renderTutorial: () => {
        PerfilInicialComponent.slide = 0;
        return PerfilInicialComponent.htmlTutorial();
    },

    htmlTutorial: () => {
        const i = PerfilInicialComponent.slide, s = PerfilInicialComponent.slides[i], ultimo = i === PerfilInicialComponent.slides.length - 1;
        // Los botones van en un pie fijo abajo: siempre se ven, aunque la pantalla sea baja o la letra del teléfono sea grande.
        return `
        <div class="auth tutorial animate-fadeIn">
            <main class="auth-in tutorial-contenido">
            <div class="mt-2 mb-2" aria-hidden="true">
                <svg viewBox="0 0 170 210" style="height:clamp(110px, 24vh, 210px);width:auto">
                    <rect x="38" y="8" width="94" height="194" rx="20" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>
                    <rect x="48" y="26" width="74" height="150" rx="10" fill="#e3f1ea"/>
                    <path d="M48 70 L122 96 M60 176 L96 26 M48 130 L122 118" stroke="#fff" stroke-width="6" fill="none"/>
                    <circle cx="85" cy="92" r="26" fill="${s.color}" opacity=".18"/>
                    <path d="M85 112 C70 94 66 84 66 76 a19 19 0 0 1 38 0 c0 8 -4 18 -19 36z" fill="${s.color}"/>
                    <circle cx="85" cy="76" r="7" fill="#fff"/>
                    <rect x="68" y="186" width="34" height="5" rx="2.5" fill="#cbd5e1"/>
                </svg>
            </div>
            <i class="fa-solid ${s.icono}" style="font-size:1.6rem;color:${s.color}" aria-hidden="true"></i>
            <h1 style="margin-top:10px">${s.titulo}</h1>
            <p class="auth-sub" style="min-height:72px">${s.texto}</p>
            <div class="flex gap-2 my-4" role="group" aria-label="Paso ${i + 1} de ${PerfilInicialComponent.slides.length}">
                ${PerfilInicialComponent.slides.map((_, k) => `<span class="rounded-full" style="width:${k === i ? 22 : 9}px;height:9px;background:${k === i ? '#D91424' : '#e5e7eb'};transition:width .2s"></span>`).join('')}
            </div>
            </main>
            <div class="tutorial-pie">
                <button class="btn-pill" onclick="PerfilInicialComponent.siguiente()">${ultimo ? 'Comenzar' : 'Siguiente'}</button>
                <div class="flex items-center justify-between">
                    ${i > 0 ? `<button class="link-sutil" onclick="PerfilInicialComponent.anterior()">Anterior</button>` : '<span></span>'}
                    ${ultimo ? '<span></span>' : `<button class="link-sutil font-semibold" onclick="PerfilInicialComponent.terminar()">Omitir</button>`}
                </div>
            </div>
        </div>`;
    },

    montarTutorial: () => {},

    redibujar: () => { document.getElementById('router-view').innerHTML = PerfilInicialComponent.htmlTutorial(); },
    siguiente: () => {
        if (PerfilInicialComponent.slide >= PerfilInicialComponent.slides.length - 1) return PerfilInicialComponent.terminar();
        PerfilInicialComponent.slide++; PerfilInicialComponent.redibujar();
    },
    anterior: () => { if (PerfilInicialComponent.slide > 0) { PerfilInicialComponent.slide--; PerfilInicialComponent.redibujar(); } },
    terminar: () => {
        if (!app.embed) db.actualizarSesion({ activa: true, nuevaCuenta: false, tutorialVisto: true });
        app.navegar('inicio');
    }
};
