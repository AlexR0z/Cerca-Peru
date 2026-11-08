/**
 * Componente: Sección 1 "Inicio y Acceso" (Pantallas 01 a 07)
 * - 01: Presentación        - 05: Verificación (código de 6 dígitos)
 * - 02: Acceso              - 06: Recuperar contraseña
 * - 03: Iniciar sesión      - 07: Nueva contraseña
 * - 04: Crear cuenta
 *
 * MODO DEMOSTRACIÓN: no hay servidor de autenticación conectado. Los datos se validan en pantalla
 * y se guardan solo en este dispositivo. No se envía ningún SMS ni correo, y la contraseña
 * NO se guarda en ningún lugar.
 */

const AccesoComponent = {
    /* ---------- Registro pendiente de verificación (solo durante la sesión del navegador) ---------- */
    leerPendiente: () => {
        try { return JSON.parse(sessionStorage.getItem('pv_registro') || 'null'); } catch (e) { return null; }
    },
    guardarPendiente: (datos) => sessionStorage.setItem('pv_registro', JSON.stringify(datos)),

    esperar: (ms) => new Promise(r => setTimeout(r, ms)),

    /* ============ 01. Presentación ============ */
    renderPresentacion: () => `
        <div class="h-full relative">
            <button class="presentacion" style="background-image:url('img/presentacion.webp')"
                onclick="app.navegar('acceso')" aria-label="Perú Vive. Comunidad, prevención y apoyo ante emergencias. Toca para continuar"></button>
            <span class="absolute left-1/2 -translate-x-1/2 bottom-5 bg-white/90 text-peru-red text-xs font-bold px-4 py-1.5 rounded-full shadow animate-pulse pointer-events-none">
                Toca para continuar
            </span>
        </div>`,

    /* ============ 02. Acceso ============ */
    renderAcceso: () => UI.marcoAuth(`
        ${UI.logo(150)}
        <img src="img/personas.webp" alt="Tres jóvenes sonriendo, parte de la comunidad Perú Vive" class="w-full max-w-[300px] mt-6" style="height:auto">
        <h1>Bienvenido a<br>Perú Vive</h1>
        <p class="auth-sub">Comunidad, prevención y apoyo ante emergencias.</p>
        <p class="text-center font-bold" style="color:#A80F1D;font-size:1.15rem;margin-top:10px">Ayuda cerca de ti, en un toque.</p>
        <p class="text-center font-bold text-slate-700" style="font-size:1rem;margin-top:2px">Mi cuadra, mi gente, mi alerta.</p>
        <div class="auth-form" style="margin-top:20px">
            <button class="btn-pill" onclick="app.navegar('login')">Iniciar sesión</button>
            <button class="btn-pill dorado" onclick="app.navegar('registro')">Crear cuenta</button>
        </div>`),

    /* ============ 03. Iniciar sesión ============ */
    renderLogin: () => UI.marcoAuth(`
        ${UI.corazon(78)}
        <h1>Iniciar sesión</h1>
        <form id="f-login" class="auth-form" novalidate onsubmit="AccesoComponent.enviarLogin(event)">
            ${UI.campo({ id: 'usuario', etiqueta: Nube.activa ? 'Correo electrónico' : 'Correo o celular', icono: 'fa-envelope', autocompletar: 'username', modo: 'email' })}
            ${UI.campo({ id: 'clave', etiqueta: 'Contraseña', tipo: 'password', icono: 'fa-lock', autocompletar: 'current-password', ojo: true })}
            <div id="aviso" class="aviso-global" role="alert"></div>
            <button type="button" class="link-sutil self-center" style="justify-self:center" onclick="app.navegar('recuperar')">¿Olvidaste tu contraseña?</button>
            <button id="boton" type="submit" class="btn-pill">Ingresar</button>
            <p class="text-center text-sm text-slate-600">¿No tienes cuenta? <button type="button" class="font-bold text-peru-red underline" onclick="app.navegar('registro')">Crear cuenta</button></p>
            ${Nube.activa ? '' : '<p class="text-center text-[11px] text-slate-400">Modo demostración: con datos válidos, cualquier contraseña permite entrar.</p>'}
        </form>`, { atras: 'acceso' }),

    montarLogin: () => { if (!app.embed) document.getElementById('usuario')?.focus(); },

    enviarLogin: async (e) => {
        e.preventDefault();
        ['usuario', 'clave'].forEach(UI.limpiarError);
        const id = UI.valor('usuario'), clave = document.getElementById('clave').value;
        let hayError = false;
        if (!id) hayError = UI.marcarError('usuario', 'Ingresa tu correo o celular');
        else if (!UI.validar.correoOCelular(id)) hayError = UI.marcarError('usuario', id.includes('@') ? 'Ingresa un correo válido' : 'El celular debe tener 9 dígitos y empezar con 9');
        if (!clave) hayError = UI.marcarError('clave', 'Ingresa tu contraseña');
        if (Nube.activa && id && !id.includes('@')) hayError = UI.marcarError('usuario', 'Ingresa con tu correo electrónico');
        if (hayError) return;

        const boton = document.getElementById('boton');
        boton.disabled = true; boton.textContent = 'Ingresando…';

        if (Nube.activa) {
            try {
                await Nube.ingresar(id, clave);
                await Nube.sincronizar();
                Nube.iniciarSondeo();
                app.navegar('inicio');
            } catch (e) {
                // Cuenta creada pero con el correo sin confirmar: se manda un código nuevo y se pide aquí.
                if (e.codigo === 'email_not_confirmed') {
                    try { await Nube.reenviarCodigoRegistro(id); } catch (x) { /* si no se puede reenviar, igual se muestra la pantalla */ }
                    sessionStorage.setItem('pv_confirmar', id);
                    AccesoComponent.reenviarDesde = Date.now() + 60000;
                    UI.toast('Falta confirmar tu correo. Te enviamos un código.');
                    app.navegar('codigo-registro');
                    return;
                }
                if (e.codigo !== 'invalid_credentials') await Nube.salir();
                UI.avisoGlobal(e.message);
                boton.disabled = false; boton.textContent = 'Ingresar';
            }
            return;
        }

        await AccesoComponent.esperar(500);
        db.actualizarSesion({ activa: true, nuevaCuenta: false });
        app.navegar('inicio');
    },

    /* ============ 04. Crear cuenta ============ */
    renderRegistro: () => UI.marcoAuth(`
        <i class="fa-regular fa-user text-peru-red" style="font-size:3rem" aria-hidden="true"></i>
        <h1>Crear cuenta</h1>
        <form id="f-registro" class="auth-form" style="gap:11px;margin-top:10px" novalidate onsubmit="AccesoComponent.enviarRegistro(event)">
            ${UI.campo({ id: 'nombres', etiqueta: 'Nombres', icono: 'fa-user', autocompletar: 'given-name' })}
            ${UI.campo({ id: 'apellidos', etiqueta: 'Apellidos', icono: 'fa-user', autocompletar: 'family-name' })}
            ${UI.campo({ id: 'celular', etiqueta: Nube.activa ? 'Celular (opcional)' : 'Celular', tipo: 'tel', icono: 'fa-mobile-screen', autocompletar: 'tel-national', modo: 'numeric', maxlen: 9 })}
            ${UI.campo({ id: 'correo', etiqueta: Nube.activa ? 'Correo electrónico' : 'Correo (opcional)', tipo: 'email', icono: 'fa-envelope', autocompletar: 'email' })}
            ${UI.campo({ id: 'clave', etiqueta: 'Contraseña (mín. 8)', tipo: 'password', icono: 'fa-lock', autocompletar: 'new-password', ojo: true })}
            <div id="aviso" class="aviso-global" role="alert"></div>
            <button id="boton" type="submit" class="btn-pill" style="margin-top:6px">Registrarme</button>
            <p class="text-center text-sm text-slate-600">¿Ya tienes cuenta? <button type="button" class="font-bold text-peru-red underline" onclick="app.navegar('login')">Inicia sesión</button></p>
        </form>`, { atras: 'acceso' }),

    montarRegistro: () => {
        const c = document.getElementById('celular');
        c.oninput = () => { c.value = c.value.replace(/\D/g, '').slice(0, 9); UI.limpiarError('celular'); };
    },

    enviarRegistro: async (e) => {
        e.preventDefault();
        ['nombres', 'apellidos', 'celular', 'correo', 'clave'].forEach(UI.limpiarError);
        const d = {
            nombres: UI.valor('nombres').replace(/\s+/g, ' '), apellidos: UI.valor('apellidos').replace(/\s+/g, ' '),
            celular: UI.valor('celular'), correo: UI.valor('correo')
        };
        const clave = document.getElementById('clave').value;
        let hayError = false;
        if (!UI.validar.nombre(d.nombres)) hayError = UI.marcarError('nombres', d.nombres ? 'Usa solo letras (mínimo 2)' : 'Ingresa tus nombres');
        if (!UI.validar.nombre(d.apellidos)) hayError = UI.marcarError('apellidos', d.apellidos ? 'Usa solo letras (mínimo 2)' : 'Ingresa tus apellidos');
        // En la nube el celular es opcional (se ingresa con correo); en modo local es obligatorio.
        if ((!Nube.activa || d.celular) && !UI.validar.celular(d.celular)) hayError = UI.marcarError('celular', 'Ingresa 9 dígitos que empiecen con 9');
        if (Nube.activa && !d.correo) hayError = UI.marcarError('correo', 'Ingresa tu correo electrónico');
        else if (d.correo && !UI.validar.correo(d.correo)) hayError = UI.marcarError('correo', 'Ingresa un correo válido');
        if (!UI.validar.clave(clave)) hayError = UI.marcarError('clave', 'La contraseña debe tener al menos 8 caracteres');
        if (hayError) return;

        const boton = document.getElementById('boton');
        boton.disabled = true; boton.textContent = 'Registrando…';

        if (Nube.activa) {
            const primero = (t) => { const w = t.split(' ')[0]; return w.length >= 2 ? w : t.slice(0, 30); };
            try {
                const r = await Nube.registrar({
                    correo: d.correo, clave, nombre: primero(d.nombres), apellido: primero(d.apellidos), nombreVisible: primero(d.nombres)
                });
                sessionStorage.setItem('pv_registro_extra', JSON.stringify({ celular: d.celular || '' }));
                if (r.conSesion) {
                    // El proyecto NO exige confirmar el correo: la cuenta ya quedó creada y con sesión.
                    await AccesoComponent.finalizarRegistroNube();
                    return;
                }
                // El proyecto exige confirmar el correo: se manda un código y se pide aquí mismo.
                // Si el correo ya tenía cuenta, el servidor responde igual (no se revela) y simplemente no llega código.
                sessionStorage.setItem('pv_confirmar', d.correo);
                AccesoComponent.reenviarDesde = Date.now() + 60000;
                app.navegar('codigo-registro');
                return;
            } catch (e) {
                UI.avisoGlobal(e.message);
            }
            boton.disabled = false; boton.textContent = 'Registrarme';
            return;
        }

        await AccesoComponent.esperar(500);
        AccesoComponent.guardarPendiente(d); // la contraseña no se guarda
        app.navegar('verificar');
    },

    /* ============ 05. Verificación ============ */
    renderVerificar: () => {
        const p = AccesoComponent.leerPendiente();
        const destino = p ? `+51 ••• ••• ${p.celular.slice(-3)}` : 'tu celular';
        return UI.marcoAuth(`
            ${UI.corazon(72)}
            <h1>Verifica tu cuenta</h1>
            <p class="auth-sub">Ingresa el código de 6 dígitos enviado a <b>${UI.esc(destino)}</b></p>
            <form id="f-otp" class="w-full" novalidate onsubmit="AccesoComponent.enviarVerificar(event)">
                <div class="otp" id="w-otp" role="group" aria-label="Código de verificación de 6 dígitos">
                    ${[0, 1, 2, 3, 4, 5].map(i => `<input id="otp${i}" inputmode="numeric" maxlength="1" autocomplete="${i === 0 ? 'one-time-code' : 'off'}" aria-label="Dígito ${i + 1}">`).join('')}
                </div>
                <span class="campo-error text-center" id="e-otp" role="alert"></span>
                <div id="aviso" class="aviso-global mt-3" role="alert"></div>
                <button id="boton" type="submit" class="btn-pill" style="margin-top:28px">Verificar</button>
                <p class="text-center text-sm mt-3"><button type="button" class="link-sutil" onclick="UI.toast('Modo demostración: no se envió ningún SMS real.')">Reenviar código</button></p>
                <p class="text-center text-[11px] text-slate-400">Modo demostración: escribe cualquier código de 6 dígitos.</p>
            </form>`, { atras: 'registro' });
    },

    montarVerificar: () => {
        const cajas = [0, 1, 2, 3, 4, 5].map(i => document.getElementById('otp' + i));
        cajas.forEach((c, i) => {
            c.oninput = () => {
                c.value = c.value.replace(/\D/g, '').slice(-1);
                UI.limpiarError('otp');
                if (c.value && cajas[i + 1]) cajas[i + 1].focus();
            };
            c.onkeydown = (ev) => { if (ev.key === 'Backspace' && !c.value && cajas[i - 1]) cajas[i - 1].focus(); };
            c.onpaste = (ev) => {
                const txt = (ev.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
                if (!txt) return;
                ev.preventDefault();
                txt.split('').forEach((d, k) => { cajas[k].value = d; });
                cajas[Math.min(txt.length, 5)].focus();
            };
        });
        if (!app.embed) cajas[0].focus();
    },

    enviarVerificar: async (e) => {
        e.preventDefault();
        const codigo = [0, 1, 2, 3, 4, 5].map(i => document.getElementById('otp' + i).value).join('');
        if (!/^\d{6}$/.test(codigo)) { UI.marcarError('otp', 'Ingresa los 6 dígitos del código'); return; }

        const boton = document.getElementById('boton');
        boton.disabled = true; boton.textContent = 'Verificando…';
        await AccesoComponent.esperar(500);

        // Se crea la cuenta local con los datos del registro (si existen)
        const p = AccesoComponent.leerPendiente();
        if (p) {
            db.actualizarUsuario({
                nombre: p.nombres.split(' ')[0], apellido: p.apellidos.split(' ')[0],
                telefono: '+51 ' + p.celular, correo: p.correo || '', nombreVisible: p.nombres.split(' ')[0],
                puntosAyuda: 0, rachaDias: 1
            });
            sessionStorage.removeItem('pv_registro');
        }
        db.actualizarSesion({ activa: true, nuevaCuenta: true, tutorialVisto: false });
        app.navegar('completar-perfil');
    },

    /* ============ 06. Recuperar contraseña ============ */
    renderRecuperar: () => Nube.activa ? UI.marcoAuth(`
        <i class="fa-solid fa-sun text-amber-400" style="font-size:3rem" aria-hidden="true"></i>
        <h1>Recuperar<br>contraseña</h1>
        <p class="auth-sub">Escribe el correo de tu cuenta y te enviaremos un código para crear una contraseña nueva.</p>
        <form id="f-recuperar" class="auth-form" novalidate onsubmit="AccesoComponent.enviarRecuperar(event)">
            ${UI.campo({ id: 'usuario', etiqueta: 'Correo electrónico', tipo: 'email', icono: 'fa-envelope', autocompletar: 'username', modo: 'email' })}
            <div id="aviso" class="aviso-global" role="alert"></div>
            <button id="boton" type="submit" class="btn-pill">Enviar código</button>
            <p class="text-center text-[11px] text-slate-400">Si no lo ves en unos minutos, revisa la carpeta de spam.</p>
        </form>`, { atras: 'login' }) : UI.marcoAuth(`
        <i class="fa-solid fa-sun text-amber-400" style="font-size:3rem" aria-hidden="true"></i>
        <h1>Recuperar<br>contraseña</h1>
        <p class="auth-sub">Ingresa tu correo o celular para enviarte un código.</p>
        <form id="f-recuperar" class="auth-form" novalidate onsubmit="AccesoComponent.enviarRecuperar(event)">
            ${UI.campo({ id: 'usuario', etiqueta: 'Correo o celular', icono: 'fa-envelope', autocompletar: 'username' })}
            <div id="aviso" class="aviso-global" role="alert"></div>
            <button id="boton" type="submit" class="btn-pill">Enviar código</button>
            <p class="text-center text-[11px] text-slate-400">Modo demostración: no se envía ningún código real.</p>
        </form>`, { atras: 'login' }),

    montarRecuperar: () => { if (!app.embed) document.getElementById('usuario')?.focus(); },

    enviarRecuperar: async (e) => {
        e.preventDefault();
        UI.limpiarError('usuario');
        const id = UI.valor('usuario');

        if (Nube.activa) {
            if (!id) return UI.marcarError('usuario', 'Ingresa tu correo electrónico');
            if (!UI.validar.correo(id)) return UI.marcarError('usuario', 'Ingresa un correo válido');
            const boton = document.getElementById('boton');
            boton.disabled = true; boton.textContent = 'Enviando…';
            try {
                await Nube.pedirCodigoRecuperacion(id);
            } catch (err) {
                UI.avisoGlobal(err.message);
                boton.disabled = false; boton.textContent = 'Enviar código';
                return;
            }
            // Por seguridad la respuesta es igual exista o no la cuenta: no se confirma si el correo está registrado.
            sessionStorage.setItem('pv_recuperar', id);
            AccesoComponent.reenviarDesde = Date.now() + 60000;
            app.navegar('codigo-recuperacion');
            return;
        }

        if (!id) return UI.marcarError('usuario', 'Ingresa tu correo o celular');
        if (!UI.validar.correoOCelular(id)) return UI.marcarError('usuario', id.includes('@') ? 'Ingresa un correo válido' : 'El celular debe tener 9 dígitos y empezar con 9');

        const boton = document.getElementById('boton');
        boton.disabled = true; boton.textContent = 'Enviando…';
        await AccesoComponent.esperar(500);
        UI.toast('Modo demostración: código simulado');
        app.navegar('nueva-clave');
    },

    /* ============ 06b. Código de recuperación (solo con la nube) ============ */
    reenviarDesde: 0,
    cuentaAtras: null,

    /** "ana.lopez@gmail.com" → "an•••@gmail.com" (no se muestra el correo completo en pantalla). */
    ocultarCorreo: (c) => {
        const [u, d] = c.split('@');
        return (u || '').slice(0, 2) + '•••@' + (d || '');
    },

    /**
     * La misma pantalla de código sirve para dos casos (los dos con la nube):
     *   'recuperacion' → olvidé mi contraseña      'registro' → confirmar mi correo al crear la cuenta
     * Nunca se afirma si el correo tiene o no cuenta: la respuesta del servidor es la misma en ambos casos.
     */
    CODIGOS: {
        recuperacion: {
            clave: 'pv_recuperar', atras: 'recuperar', otro: 'recuperar', titulo: 'Revisa tu<br>correo',
            texto: (c) => `Si existe una cuenta con <b>${c}</b>, te enviamos un código. Escríbelo aquí.`,
            reenviar: (c) => Nube.pedirCodigoRecuperacion(c),
            verificar: (c, k) => Nube.verificarCodigoRecuperacion(c, k),
            despues: () => app.navegar('nueva-clave')
        },
        registro: {
            clave: 'pv_confirmar', atras: 'registro', otro: 'registro', titulo: 'Confirma tu<br>correo',
            texto: (c) => `Si <b>${c}</b> todavía no tiene cuenta, te enviamos un código para confirmarla. Escríbelo aquí.`,
            reenviar: (c) => Nube.reenviarCodigoRegistro(c),
            verificar: (c, k) => Nube.verificarCodigoRegistro(c, k),
            despues: () => AccesoComponent.finalizarRegistroNube()
        }
    },

    renderCodigoRecuperacion: () => AccesoComponent.renderCodigo('recuperacion'),
    renderCodigoRegistro: () => AccesoComponent.renderCodigo('registro'),

    renderCodigo: (modo) => {
        const c = AccesoComponent.CODIGOS[modo];
        const correo = sessionStorage.getItem(c.clave);
        if (!Nube.activa || !correo) { setTimeout(() => app.navegar(c.otro), 0); return ''; }
        return UI.marcoAuth(`
            <i class="fa-solid fa-envelope-open-text text-peru-red" style="font-size:3rem" aria-hidden="true"></i>
            <h1>${c.titulo}</h1>
            <p class="auth-sub">${c.texto(UI.esc(AccesoComponent.ocultarCorreo(correo)))}</p>
            <form id="f-codigo" class="auth-form" novalidate onsubmit="AccesoComponent.enviarCodigo(event, '${modo}')">
                ${UI.campo({ id: 'codigo', etiqueta: 'Código del correo', icono: 'fa-key', autocompletar: 'one-time-code', modo: 'numeric', maxlen: 10 })}
                <div id="aviso" class="aviso-global" role="alert"></div>
                <button id="boton" type="submit" class="btn-pill">Continuar</button>
                <button id="reenviar" type="button" class="link-sutil" style="justify-self:center" onclick="AccesoComponent.reenviarCodigo('${modo}')"></button>
                <button type="button" class="link-sutil" style="justify-self:center" onclick="app.navegar('${c.otro}')">Usar otro correo</button>
                ${modo === 'registro' ? `<button type="button" class="link-sutil" style="justify-self:center" onclick="app.navegar('login')">Ya tengo cuenta: iniciar sesión</button>` : ''}
                <p class="text-center text-[11px] text-slate-400">El código dura 1 hora. Si no lo ves, revisa la carpeta de spam.</p>
            </form>`, { atras: c.atras });
    },

    montarCodigoRecuperacion: () => AccesoComponent.montarCodigo('recuperacion'),
    montarCodigoRegistro: () => AccesoComponent.montarCodigo('registro'),

    montarCodigo: (modo) => {
        AccesoComponent.modoCodigo = modo;
        const campo = document.getElementById('codigo');
        if (!campo) return;
        campo.oninput = () => { campo.value = campo.value.replace(/\D/g, '').slice(0, 10); UI.limpiarError('codigo'); };
        if (!app.embed) campo.focus();

        // "Reenviar" se habilita a los 60 s (Supabase no permite pedir otro código antes).
        clearInterval(AccesoComponent.cuentaAtras);
        const pintar = () => {
            const b = document.getElementById('reenviar');
            if (!b) { clearInterval(AccesoComponent.cuentaAtras); return; }
            const falta = Math.ceil((AccesoComponent.reenviarDesde - Date.now()) / 1000);
            b.disabled = falta > 0;
            b.textContent = falta > 0 ? `Reenviar código en ${falta} s` : 'Reenviar código';
        };
        pintar();
        AccesoComponent.cuentaAtras = setInterval(pintar, 1000);
    },

    reenviarCodigo: async (modo = 'recuperacion') => {
        const c = AccesoComponent.CODIGOS[modo];
        const correo = sessionStorage.getItem(c.clave);
        const b = document.getElementById('reenviar');
        if (!correo || !b || b.disabled) return;
        b.disabled = true; b.textContent = 'Enviando…';
        try {
            await c.reenviar(correo);
            AccesoComponent.reenviarDesde = Date.now() + 60000;
            UI.toast('Te enviamos un código nuevo.');
        } catch (err) {
            UI.avisoGlobal(err.message);
            AccesoComponent.reenviarDesde = Date.now() + 15000; // un respiro corto antes de reintentar
        }
        AccesoComponent.montarCodigo(modo);
    },

    enviarCodigoRecuperacion: (e) => AccesoComponent.enviarCodigo(e, 'recuperacion'),

    enviarCodigo: async (e, modo = 'recuperacion') => {
        e.preventDefault();
        const c = AccesoComponent.CODIGOS[modo];
        UI.limpiarError('codigo');
        const codigo = UI.valor('codigo').replace(/\D/g, '');
        const correo = sessionStorage.getItem(c.clave);
        if (codigo.length < 6) return UI.marcarError('codigo', 'Escribe el código completo (mínimo 6 dígitos)');
        const boton = document.getElementById('boton');
        boton.disabled = true; boton.textContent = 'Verificando…';
        try {
            await c.verificar(correo, codigo);
        } catch (err) {
            UI.marcarError('codigo', err.message);
            boton.disabled = false; boton.textContent = 'Continuar';
            return;
        }
        clearInterval(AccesoComponent.cuentaAtras);
        await c.despues();
    },

    /** Tras crear la cuenta (con o sin código de correo): guarda el celular opcional, descarga datos y sigue al perfil. */
    finalizarRegistroNube: async () => {
        let extra = {};
        try { extra = JSON.parse(sessionStorage.getItem('pv_registro_extra') || '{}'); } catch (e) { /* sin datos extra */ }
        if (extra.celular) {
            try { await Nube.actualizar('perfiles', `id=eq.${Nube.sesion.usuarioId}`, { celular: extra.celular }); }
            catch (e) { /* el celular es opcional: si falla, se puede completar luego */ }
        }
        sessionStorage.removeItem('pv_registro_extra');
        sessionStorage.removeItem('pv_confirmar');
        await Nube.sincronizar();
        Nube.iniciarSondeo();
        db.actualizarSesion({ nuevaCuenta: true, tutorialVisto: false });
        app.navegar('completar-perfil'); // en la nube no hay código por SMS: se pasa directo al perfil
    },

    /* ============ 07. Nueva contraseña ============ */
    renderNuevaClave: () => (Nube.activa && !Nube._recuperacion)
        // Sin haber escrito antes un código válido no se puede llegar aquí (por ejemplo, al recargar la página).
        ? (setTimeout(() => app.navegar('recuperar'), 0), '')
        : UI.marcoAuth(`
        <i class="fa-solid fa-sun text-amber-400" style="font-size:3rem" aria-hidden="true"></i>
        <h1>Nueva<br>contraseña</h1>
        <p class="auth-sub">Crea una nueva contraseña de al menos 8 caracteres.</p>
        <form id="f-nueva" class="auth-form" novalidate onsubmit="AccesoComponent.enviarNuevaClave(event)">
            ${UI.campo({ id: 'nueva', etiqueta: 'Nueva contraseña', tipo: 'password', icono: 'fa-lock', autocompletar: 'new-password', ojo: true })}
            ${UI.campo({ id: 'confirmar', etiqueta: 'Confirmar contraseña', tipo: 'password', icono: 'fa-lock', autocompletar: 'new-password', ojo: true })}
            <div id="aviso" class="aviso-global" role="alert"></div>
            <button id="boton" type="submit" class="btn-pill">Actualizar</button>
        </form>`, { atras: 'recuperar' }),

    montarNuevaClave: () => { if (!app.embed) document.getElementById('nueva')?.focus(); },

    enviarNuevaClave: async (e) => {
        e.preventDefault();
        ['nueva', 'confirmar'].forEach(UI.limpiarError);
        const a = document.getElementById('nueva').value, b = document.getElementById('confirmar').value;
        let hayError = false;
        if (!UI.validar.clave(a)) hayError = UI.marcarError('nueva', a ? 'La contraseña debe tener al menos 8 caracteres' : 'Ingresa tu nueva contraseña');
        if (!b) hayError = UI.marcarError('confirmar', 'Confirma tu nueva contraseña');
        else if (a !== b) hayError = UI.marcarError('confirmar', 'Las contraseñas no coinciden');
        if (hayError) return;

        const boton = document.getElementById('boton');
        boton.disabled = true; boton.textContent = 'Actualizando…';

        if (Nube.activa) {
            try {
                await Nube.cambiarClaveRecuperada(a);
            } catch (err) {
                // Si la sesión temporal venció o se perdió, hay que pedir un código nuevo.
                if (err.codigo === 'sin_codigo' || /venci/i.test(err.message)) {
                    UI.toast('Pasó demasiado tiempo. Pide un código nuevo.');
                    app.navegar('recuperar');
                    return;
                }
                UI.avisoGlobal(err.message);
                boton.disabled = false; boton.textContent = 'Actualizar';
                return;
            }
            sessionStorage.removeItem('pv_recuperar');
            UI.toast('Contraseña actualizada. Ya puedes iniciar sesión.');
            app.navegar('login');
            return;
        }

        await AccesoComponent.esperar(500);
        UI.toast('Contraseña actualizada. Ya puedes iniciar sesión.');
        app.navegar('login');
    }
};
