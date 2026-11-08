/**
 * Componente: Sección 5 "Perfil y Configuración" (Pantallas 35 a 39)
 * - 35: Perfil              - 38: Seguridad
 * - 36: Editar perfil       - 39: Cerrar sesión
 * - 37: Configuración
 *
 * MODO DEMOSTRACIÓN: el cambio de contraseña y la verificación en 2 pasos se validan en pantalla
 * pero no hay servidor; la contraseña nunca se guarda.
 */

const CuentaComponent = {
    etiquetaRol: (rol) => ({ ciudadano: 'Ciudadano', voluntario: 'Voluntario', coordinador: 'Coordinación' }[rol] || 'Ciudadano'),

    fila: (ruta, icono, texto, extra = '') => `
        <button onclick="app.navegar('${ruta}')" class="w-full text-left p-3.5 flex items-center gap-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            <i class="fa-solid ${icono} w-5 text-center ${extra || 'text-peru-red'}" aria-hidden="true"></i>
            <span class="flex-1">${texto}</span>
            <i class="fa-solid fa-chevron-right text-xs text-slate-300" aria-hidden="true"></i>
        </button>`,

    /* ============ 35. Perfil ============ */
    renderPerfil: () => {
        const u = db.obtenerUsuario();
        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                <div id="guia-perfil" class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center">
                    ${UI.avatar(UI.iniciales(u.nombre, u.apellido), 'w-24 h-24 text-3xl mx-auto', u.avatar)}
                    <h2 class="text-lg font-extrabold mt-3">${UI.esc(u.nombre)} ${UI.esc(u.apellido)}</h2>
                    <p class="text-xs text-slate-500">${CuentaComponent.etiquetaRol(u.rol)} · ${UI.esc(u.ubicacion || '')}</p>
                    <button onclick="app.navegar('ubicacion',{volver:'perfil'})" class="mt-2 text-sm font-bold text-peru-red underline min-h-[44px]"><i class="fa-solid fa-location-crosshairs mr-1" aria-hidden="true"></i> Cambiar mi ubicación</button>
                    <div class="grid grid-cols-1 gap-3 mt-4 text-left">
                        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200"><span class="text-[10px] text-slate-400 block font-semibold">Puntos solidarios</span><span class="text-base font-extrabold text-peru-red">${u.puntosAyuda} pts</span></div>
                    </div>
                </div>

                <button onclick="GuiaComponent.iniciar()" class="w-full flex items-center gap-3 bg-white rounded-2xl p-4 border-2 border-[#1A1A1A] text-left min-h-[56px]">
                    <span class="w-11 h-11 rounded-xl bg-amber-400 border-2 border-[#1A1A1A] flex items-center justify-center flex-none" aria-hidden="true"><i class="fa-solid fa-compass"></i></span>
                    <span class="flex-1"><span class="block text-base font-bold">Ver la guía de la app</span><span class="block text-sm text-slate-600">Un recorrido corto por todo lo que puedes hacer</span></span>
                    <i class="fa-solid fa-chevron-right text-slate-400" aria-hidden="true"></i>
                </button>

                <div class="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
                    ${CuentaComponent.fila('editar-perfil', 'fa-user-pen', 'Editar perfil')}
                    ${CuentaComponent.fila('configuracion', 'fa-gear', 'Configuración')}
                    ${CuentaComponent.fila('seguridad', 'fa-shield-halved', 'Seguridad')}
                </div>
                <div class="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
                    ${CuentaComponent.fila('recompensas', 'fa-medal', 'Mis recompensas', 'text-amber-600')}
                    ${CuentaComponent.fila('mis-ayudas', 'fa-hand-holding-heart', 'Mis ayudas')}
                    ${CuentaComponent.fila('historial', 'fa-clock-rotate-left', 'Mi historial')}
                    ${CuentaComponent.fila('notificaciones', 'fa-bell', 'Notificaciones')}
                    ${CuentaComponent.fila('asistente', 'fa-robot', 'Asistente virtual')}
                    ${CuentaComponent.fila('centro-ayuda', 'fa-circle-question', 'Centro de ayuda')}
                    ${app.esCoordinador() ? CuentaComponent.fila('coordinacion', 'fa-people-roof', 'Centro de coordinación', 'text-violet-700') : ''}
                </div>
                <button onclick="app.navegar('cerrar-sesion')" class="w-full bg-white border-2 border-peru-red text-peru-red font-bold py-3 rounded-xl text-sm hover:bg-red-50 transition">
                    <i class="fa-solid fa-right-from-bracket mr-1"></i> Cerrar sesión
                </button>
            </div>`;
    },

    /* ============ 36. Editar perfil ============ */
    renderEditarPerfil: () => {
        const u = db.obtenerUsuario();
        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${UI.vistaAtras('Editar perfil', 'perfil')}
                <form class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3" novalidate onsubmit="CuentaComponent.guardarPerfil(event)">
                    <div class="flex justify-center">${UI.avatar(UI.iniciales(u.nombre, u.apellido), 'w-20 h-20 text-2xl', u.avatar)}</div>
                    ${UI.campo({ id: 'visible', etiqueta: 'Nombre visible', icono: 'fa-user', valor: u.nombreVisible || u.nombre, maxlen: 30 })}
                    ${UI.campo({ id: 'nombres', etiqueta: 'Nombres', icono: 'fa-user', valor: u.nombre, autocompletar: 'given-name' })}
                    ${UI.campo({ id: 'apellidos', etiqueta: 'Apellidos', icono: 'fa-user', valor: u.apellido, autocompletar: 'family-name' })}
                    ${UI.campo({ id: 'correo', etiqueta: 'Correo (opcional)', tipo: 'email', icono: 'fa-envelope', valor: u.correo || '', autocompletar: 'email' })}
                    <div id="aviso" class="aviso-global" role="alert"></div>
                    <button type="submit" class="btn-pill">Guardar cambios</button>
                    <button type="button" class="btn-pill gris" onclick="app.navegar('perfil')">Cancelar</button>
                </form>
            </div>`;
    },

    montarEditarPerfil: () => {},

    guardarPerfil: (e) => {
        e.preventDefault();
        ['visible', 'nombres', 'apellidos', 'correo'].forEach(UI.limpiarError);
        const d = { visible: UI.valor('visible'), nombres: UI.valor('nombres'), apellidos: UI.valor('apellidos'), correo: UI.valor('correo') };
        let hayError = false;
        if (d.visible.length < 2) hayError = UI.marcarError('visible', 'Escribe al menos 2 caracteres');
        if (!UI.validar.nombre(d.nombres)) hayError = UI.marcarError('nombres', 'Usa solo letras (mínimo 2)');
        if (!UI.validar.nombre(d.apellidos)) hayError = UI.marcarError('apellidos', 'Usa solo letras (mínimo 2)');
        if (d.correo && !UI.validar.correo(d.correo)) hayError = UI.marcarError('correo', 'Ingresa un correo válido');
        if (hayError) return;
        db.actualizarUsuario({ nombreVisible: d.visible, nombre: d.nombres, apellido: d.apellidos, correo: d.correo });
        UI.toast('Perfil actualizado.');
        app.navegar('perfil');
    },

    /* ============ 37. Configuración ============ */
    renderConfiguracion: () => {
        const u = db.obtenerUsuario(), p = u.preferencias || {};
        const fila = (id, titulo, sub, activo, pref) => `
            <div class="p-3.5 flex items-center gap-3">
                <div class="flex-1"><label for="${id}" class="text-sm font-bold text-slate-800 block">${titulo}</label><p class="text-[11px] text-slate-500">${sub}</p></div>
                ${UI.interruptor(id, activo, `CuentaComponent.guardarPref('${pref}', this.checked)`)}
            </div>`;
        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${UI.vistaAtras('Configuración', 'perfil')}

                <section class="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100" aria-label="Notificaciones y privacidad">
                    ${fila('pref-not', 'Notificaciones', 'Avisos sobre tus solicitudes y reportes', p.notificaciones !== false, 'notificaciones')}
                    ${fila('pref-ubi', 'Privacidad: ubicación aproximada', 'En el mapa público solo se muestra una zona aproximada', p.ubicacionAproximada !== false, 'ubicacionAproximada')}
                    ${fila('pref-dir', 'Aparecer en el directorio', 'Otras personas pueden ver que eres voluntario (sin teléfono ni dirección)', p.directorio !== false, 'directorio')}
                </section>

                <section class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm" aria-label="Idioma">
                    <label for="pref-idioma" class="text-sm font-bold text-slate-800 block mb-1.5">Idioma</label>
                    <select id="pref-idioma" onchange="CuentaComponent.guardarPref('idioma', this.value)" class="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white">
                        <option value="es" ${p.idioma === 'es' || !p.idioma ? 'selected' : ''}>Español</option>
                        <option value="qu" disabled>Quechua (próximamente)</option>
                        <option value="ay" disabled>Aymara (próximamente)</option>
                    </select>
                </section>

                ${Nube.activa ? CuentaComponent.seccionVoluntario(u) : `
                <section class="rounded-2xl p-4 border-2 border-dashed border-amber-400 bg-amber-50 space-y-3" aria-label="Herramientas de demostración">
                    <h3 class="text-sm font-extrabold text-amber-900"><i class="fa-solid fa-flask mr-1"></i> Solo para demostración</h3>
                    <div>
                        <label for="pref-rol" class="text-xs font-bold text-amber-900 block mb-1">Probar la app como…</label>
                        <select id="pref-rol" onchange="CuentaComponent.cambiarRol(this.value)" class="w-full border border-amber-300 rounded-xl px-3 py-2.5 text-sm bg-white">
                            ${['ciudadano', 'voluntario', 'coordinador'].map(r => `<option value="${r}" ${u.rol === r ? 'selected' : ''}>${CuentaComponent.etiquetaRol(r)}</option>`).join('')}
                        </select>
                        <p class="text-[10px] text-amber-800 mt-1">Con un servidor real, el rol lo asigna un administrador y no se elige aquí.</p>
                    </div>
                    <button onclick="CuentaComponent.reiniciarDemo()" class="w-full bg-white border border-amber-400 text-amber-900 font-bold py-2.5 rounded-xl text-xs">Restablecer datos de demostración</button>
                </section>`}
            </div>`;
    },

    /** Modo nube: la persona decide si quiere aparecer como voluntaria. El rol de coordinación no se elige aquí. */
    seccionVoluntario: (u) => {
        if (u.rol === 'coordinador') {
            return `<section class="rounded-2xl p-4 border border-violet-200 bg-violet-50 text-sm text-violet-900"><i class="fa-solid fa-people-roof mr-1"></i> Tu cuenta tiene rol de <b>coordinación</b>.</section>`;
        }
        const esVol = u.rol === 'voluntario';
        return `
        <section class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3" aria-label="Voluntariado">
            <div class="flex items-center gap-3">
                <div class="flex-1"><label for="sw-voluntario" class="text-sm font-bold text-slate-800 block">Quiero ser voluntario/a</label><p class="text-[11px] text-slate-500">Podrás recibir pedidos de coordinación. Solo se verá tu nombre visible, tu distrito y lo que escribas abajo.</p></div>
                ${UI.interruptor('sw-voluntario', esVol, 'CuentaComponent.alternarVoluntario(this.checked)')}
            </div>
            ${esVol ? `
            <form class="space-y-2 pt-2 border-t border-slate-100" onsubmit="CuentaComponent.guardarVoluntario(event)">
                <label for="vol-habilidades" class="text-xs font-bold text-slate-600 block">Habilidades (separadas por comas)</label>
                <input id="vol-habilidades" class="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm" maxlength="120" placeholder="Transporte, Primeros auxilios" value="${UI.esc((u.habilidades || []).join(', '))}">
                <label for="vol-apoyo" class="text-xs font-bold text-slate-600 block">¿Cómo puedes ayudar?</label>
                <input id="vol-apoyo" class="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm" maxlength="200" placeholder="Ej.: Traslado de víveres en camioneta" value="${UI.esc(u.apoyo || '')}">
                <label for="vol-horario" class="text-xs font-bold text-slate-600 block">Horario</label>
                <input id="vol-horario" class="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm" maxlength="80" placeholder="Ej.: Tardes y fines de semana" value="${UI.esc(u.horario || '')}">
                <button type="submit" class="w-full bg-peru-red text-white font-bold py-2.5 rounded-xl text-sm">Guardar mi ficha de voluntario</button>
            </form>` : ''}
        </section>`;
    },

    alternarVoluntario: (activo) => {
        db.actualizarUsuario({ rol: activo ? 'voluntario' : 'ciudadano' });
        UI.toast(activo ? 'Ahora apareces como voluntario/a.' : 'Dejaste de aparecer como voluntario/a.');
        app.renderizar();
    },

    guardarVoluntario: (e) => {
        e.preventDefault();
        const habilidades = UI.valor('vol-habilidades').split(',').map(h => h.trim()).filter(Boolean).slice(0, 8);
        db.actualizarUsuario({ habilidades, apoyo: UI.valor('vol-apoyo'), horario: UI.valor('vol-horario') });
        UI.toast('Ficha de voluntario guardada.');
    },

    guardarPref: (clave, valor) => {
        db.actualizarPreferencias({ [clave]: valor });
        UI.toast('Preferencia guardada.');
    },

    cambiarRol: (rol) => {
        db.actualizarUsuario({ rol });
        UI.toast('Ahora ves la app como: ' + CuentaComponent.etiquetaRol(rol));
    },

    reiniciarDemo: () => {
        if (!confirm('Se borrarán tus datos de prueba en este dispositivo y volverás a la presentación. ¿Continuar?')) return;
        db.reiniciar();
        sessionStorage.removeItem('pv_registro');
        app.navegar('splash');
    },

    /* ============ 38. Seguridad ============ */
    renderSeguridad: () => {
        const u = db.obtenerUsuario();
        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${UI.vistaAtras('Seguridad', 'perfil')}
                <form class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3" novalidate onsubmit="CuentaComponent.cambiarClave(event)">
                    <h3 class="text-sm font-extrabold"><i class="fa-solid fa-key text-peru-red mr-1.5"></i> Cambiar contraseña</h3>
                    ${UI.campo({ id: 'actual', etiqueta: 'Contraseña actual', tipo: 'password', icono: 'fa-lock', autocompletar: 'current-password', ojo: true })}
                    ${UI.campo({ id: 'nueva', etiqueta: 'Nueva contraseña', tipo: 'password', icono: 'fa-lock', autocompletar: 'new-password', ojo: true })}
                    ${UI.campo({ id: 'confirmar', etiqueta: 'Confirmar nueva contraseña', tipo: 'password', icono: 'fa-lock', autocompletar: 'new-password', ojo: true })}
                    <div id="aviso" class="aviso-global" role="alert"></div>
                    <button type="submit" class="btn-pill">Actualizar contraseña</button>
                </form>
                ${Nube.activa ? '' : `
                <section class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
                    <div class="flex-1">
                        <label for="dos-pasos" class="text-sm font-bold text-slate-800 block">Verificación en 2 pasos</label>
                        <p class="text-[11px] text-slate-500">Pediremos un código además de tu contraseña. (Demostración: no envía códigos reales.)</p>
                    </div>
                    ${UI.interruptor('dos-pasos', u.verificacion2pasos, 'CuentaComponent.alternarDosPasos(this.checked)')}
                </section>`}
            </div>`;
    },

    montarSeguridad: () => {},

    cambiarClave: async (e) => {
        e.preventDefault();
        ['actual', 'nueva', 'confirmar'].forEach(UI.limpiarError);
        const a = document.getElementById('actual').value, n = document.getElementById('nueva').value, c = document.getElementById('confirmar').value;
        let hayError = false;
        if (!a) hayError = UI.marcarError('actual', 'Ingresa tu contraseña actual');
        if (!UI.validar.clave(n)) hayError = UI.marcarError('nueva', 'La nueva contraseña debe tener al menos 8 caracteres');
        else if (n === a) hayError = UI.marcarError('nueva', 'Debe ser distinta a la actual');
        if (!c) hayError = UI.marcarError('confirmar', 'Confirma tu nueva contraseña');
        else if (c !== n) hayError = UI.marcarError('confirmar', 'Las contraseñas no coinciden');
        if (hayError) return;

        if (Nube.activa) {
            try {
                await Nube.cambiarClave(a, n); // comprueba la contraseña actual y luego guarda la nueva
            } catch (err) {
                if (err.codigo === 'invalid_credentials') UI.marcarError('actual', 'La contraseña actual no es correcta');
                else UI.avisoGlobal(err.message);
                return;
            }
            ['actual', 'nueva', 'confirmar'].forEach(id => { document.getElementById(id).value = ''; });
            UI.avisoGlobal('Contraseña actualizada.', true);
            return;
        }

        ['actual', 'nueva', 'confirmar'].forEach(id => { document.getElementById(id).value = ''; });
        UI.avisoGlobal('Contraseña actualizada (modo demostración).', true);
    },

    alternarDosPasos: (activo) => {
        db.actualizarUsuario({ verificacion2pasos: activo });
        UI.toast(activo ? 'Verificación en 2 pasos activada.' : 'Verificación en 2 pasos desactivada.');
    },

    /* ============ 39. Cerrar sesión ============ */
    renderCerrarSesion: () => `
        <div class="p-6 flex flex-col items-center text-center animate-fadeIn" style="padding-top:64px">
            <div class="w-20 h-20 rounded-full bg-red-50 text-peru-red flex items-center justify-center mb-4"><i class="fa-solid fa-right-from-bracket" style="font-size:2rem" aria-hidden="true"></i></div>
            <h2 class="text-xl font-extrabold">Cerrar sesión</h2>
            <p class="text-sm text-slate-500 mt-1 mb-6">¿Deseas cerrar tu sesión?</p>
            <div class="w-full space-y-2.5">
                <button class="btn-pill" onclick="CuentaComponent.confirmarCierre()">Cerrar sesión</button>
                <button class="btn-pill gris" onclick="app.navegar('perfil')">Cancelar</button>
            </div>
            <p class="text-[11px] text-slate-400 mt-5">${Nube.activa ? 'Tus datos siguen guardados en tu cuenta. Al volver a entrar los verás de nuevo.' : 'Tus datos de demostración seguirán guardados en este dispositivo.'}</p>
        </div>`,

    confirmarCierre: async () => {
        if (Nube.activa) {
            await Nube.salir();   // cierra la sesión en el servidor y borra la copia local de esta persona
            db.reiniciar();
            app.navegar('acceso');
            return;
        }
        if (!app.embed) db.actualizarSesion({ activa: false });
        app.navegar('acceso');
    }
};
