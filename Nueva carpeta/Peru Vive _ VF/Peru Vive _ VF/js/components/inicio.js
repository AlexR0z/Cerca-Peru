/**
 * Componente: Vista "11. Inicio (Panel principal)"
 * Diseño accesible y amigable: letra grande (Atkinson Hyperlegible), bordes gruesos,
 * tarjetas de colores y un botón de emergencia siempre visible.
 */

const FRASES_APP = {
    principal: 'Ayuda cerca de ti, en un toque.',
    lema: 'Mi cuadra, mi gente, mi alerta.',
    barrio: 'Cuando el barrio avisa, el barrio responde.'
};

const InicioComponent = {
    /** Texto de cada apartado "adicional": se muestra al tocarlo, antes de entrar. */
    INFO: {
        puntos: {
            titulo: 'Puntos solidarios', icono: 'fa-hand-holding-heart', color: '#14753A',
            queEs: 'Son el reconocimiento por ayudar a tus vecinos. Sumas 10 puntos cada vez que te comprometes a apoyar una solicitud de ayuda cercana.',
            beneficios: [
                'Ves cuánto has aportado a tu comunidad, en el inicio y en tu perfil.',
                'Te reconocen como vecino solidario y te animan a seguir ayudando.',
                'Tu ayuda queda registrada en "Mis ayudas" para que le des seguimiento.'
            ],
            nota: 'Con tus puntos subes de insignia y desbloqueas beneficios de reconocimiento. No se cambian por dinero.',
            boton: { texto: 'Ver mis recompensas', ruta: 'recompensas' }
        },
        solicitudes: {
            titulo: 'Cerca de ti', icono: 'fa-location-dot', color: '#B45309',
            queEs: 'Lista de solicitudes de ayuda de vecinos de tu zona, para que veas quién necesita apoyo cerca.',
            beneficios: [
                'Encuentras dónde tu ayuda hace más falta.',
                'Te comprometes a apoyar con un toque y ganas 10 puntos solidarios.',
                'No se muestran direcciones exactas ni teléfonos, para cuidar a las personas.'
            ],
            boton: { texto: 'Ir a Cerca de ti', ruta: 'solicitudes' }
        },
        seguimiento: {
            titulo: 'Seguimiento', icono: 'fa-route', color: '#6A2C91',
            queEs: 'Muestra en qué etapa va cada solicitud que hiciste: Activa, En coordinación, En atención y Atendida.',
            beneficios: [
                'Sabes en qué paso está tu pedido sin tener que preguntar.',
                'Recibes un aviso cuando su estado cambia.',
                'Puedes cancelar una solicitud si ya no la necesitas.'
            ],
            boton: { texto: 'Ir a Seguimiento', ruta: 'seguimiento' }
        },
        comunidad: {
            titulo: 'Comunidad', icono: 'fa-people-group', color: '#C2255C',
            queEs: 'Espacio para ver voluntarios de tu zona y las publicaciones de tus vecinos. Puedes publicar con foto, dar me gusta y comentar.',
            beneficios: [
                'Encuentras voluntarios y sus habilidades: transporte, primeros auxilios, alimentos y más.',
                'Compartes avisos, fotos y novedades con tu barrio.',
                'Te avisamos cuando alguien da me gusta o comenta tu publicación.'
            ],
            boton: { texto: 'Ir a Comunidad', ruta: 'comunidad' }
        },
        'mis-ayudas': {
            titulo: 'Mis ayudas', icono: 'fa-hand-holding-heart', color: '#14753A',
            queEs: 'Reúne en un solo lugar la ayuda que ofreciste y las solicitudes que te comprometiste a apoyar.',
            beneficios: [
                'Ves toda la ayuda que has dado, ordenada.',
                'Puedes pausar o retirar una oferta cuando no estés disponible.',
                'Llevas el control de tus aportes y de tus puntos solidarios.'
            ],
            boton: { texto: 'Ir a Mis ayudas', ruta: 'mis-ayudas' }
        },
        historial: {
            titulo: 'Historial', icono: 'fa-clock-rotate-left', color: '#1B5FB5',
            queEs: 'Lista de las emergencias que reportaste y el estado de cada una.',
            beneficios: [
                'Compruebas si tu reporte fue verificado o resuelto.',
                'Tienes un registro de lo que avisaste a tu comunidad.',
                'Recibes un aviso cuando coordinación cambia el estado.'
            ],
            boton: { texto: 'Ir al Historial', ruta: 'historial' }
        },
        'centro-ayuda': {
            titulo: 'Ayuda', icono: 'fa-circle-question', color: '#4B5563',
            queEs: 'Guía con preguntas frecuentes sobre cómo usar Perú Vive y los teléfonos de emergencia.',
            beneficios: [
                'Resuelves tus dudas sin esperar a nadie.',
                'Aprendes cómo reportar, pedir y ofrecer ayuda.',
                'Tienes a mano los números de Policía, Bomberos, SAMU y Defensa Civil.'
            ],
            boton: { texto: 'Ir a Ayuda', ruta: 'centro-ayuda' }
        }
    },

    abrirInfo: (clave) => {
        const info = InicioComponent.INFO[clave];
        if (info) UI.hoja(info);
    },

    render: () => {
        const usuario = db.obtenerUsuario();
        const nombre = usuario.nombreVisible || usuario.nombre || 'vecino';
        const alertas = db.obtenerTodosReportes().slice(0, 3);
        const puntos = Number(usuario.puntosAyuda) || 0;

        const principal = (ruta, color, texto, icono, titulo, sub) => `
            <button onclick="app.navegar('${ruta}')" class="pv-tarjeta" style="background:${color};color:${texto};border:3px solid #1A1A1A;border-radius:20px;padding:16px 12px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;min-height:178px">
                <i class="fa-solid ${icono}" style="font-size:44px;margin-top:4px" aria-hidden="true"></i>
                <span style="font-size:23px;font-weight:700;line-height:1.1">${titulo}</span>
                <span style="font-size:17px;line-height:1.25">${sub}</span>
            </button>`;

        const extra = ([ruta, ico, txt, color]) => `
            <button onclick="InicioComponent.abrirInfo('${ruta}')" class="pv-tarjeta" aria-label="${txt}: de qué trata y beneficios"
                style="background:#fff;border:3px solid #1A1A1A;border-radius:18px;padding:12px 6px;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;min-height:104px">
                <span style="width:44px;height:44px;border-radius:12px;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px" aria-hidden="true"><i class="fa-solid ${ico}"></i></span>
                <span style="font-size:16px;font-weight:700;line-height:1.1">${txt}</span>
            </button>`;

        return `
            <div class="animate-fadeIn" style="font-family:inherit;color:#1A1A1A;padding-bottom:12px">

                <!-- Saludo -->
                <div style="padding:22px 20px 0">
                    <h1 style="margin:0;font-size:32px;line-height:1.15;font-weight:700">¡Hola, ${UI.esc(nombre)}!</h1>
                    <div style="margin-top:12px;display:inline-flex;align-items:center;gap:10px;background:#E3F4E8;border:2px solid #14753A;border-radius:999px;padding:8px 16px">
                        <i class="fa-solid fa-check" style="color:#14753A;font-size:18px" aria-hidden="true"></i>
                        <span style="font-size:19px;font-weight:700;color:#0B4F25">Tu zona está monitoreada</span>
                    </div>
                    <p style="margin:12px 0 0;font-size:19px;line-height:1.4;color:#333">Mantén la calma y revisa las alertas de tu comunidad.</p>
                    <div id="guia-ubicacion" style="margin-top:12px;display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;font-size:20px;font-weight:700">
                        <span><i class="fa-solid fa-location-dot" style="color:#A80F1D;margin-right:8px" aria-hidden="true"></i>${UI.esc(usuario.ubicacion || 'Sin ubicación')}</span>
                        <button onclick="app.navegar('ubicacion',{volver:'inicio'})" aria-label="Cambiar mi ubicación" style="background:#fff;border:2px solid #1A1A1A;border-radius:999px;padding:4px 14px;font-size:16px;font-weight:700;min-height:40px">
                            <i class="fa-solid fa-location-crosshairs" aria-hidden="true"></i> Cambiar
                        </button>
                    </div>
                </div>

                <!-- Datos personales (tócalos para saber de qué tratan) -->
                <div id="guia-stats" style="margin:18px 20px 0;display:flex;gap:12px">
                    <button onclick="InicioComponent.abrirInfo('puntos')" class="pv-tarjeta" aria-label="${puntos} puntos solidarios. Toca para saber de qué trata" style="flex:1;background:#FFE08A;border-radius:16px;padding:12px 14px;border:2px solid #1A1A1A;text-align:left">
                        <div style="font-size:34px;font-weight:700;line-height:1">${puntos}</div>
                        <div style="font-size:17px;font-weight:700;margin-top:4px">puntos solidarios</div>
                        <div style="font-size:14px;margin-top:2px;text-decoration:underline">¿Para qué sirven?</div>
                    </button>
                </div>

                <!-- Emergencia -->
                <div style="padding:22px 20px 0">
                    <button id="guia-sos" onclick="app.navegar('reportar')" class="pv-sos pv-tarjeta" style="width:100%;box-sizing:border-box;background:#C8102E;color:#fff;border:4px solid #1A1A1A;border-radius:24px;padding:20px;display:flex;align-items:center;gap:16px;text-align:left">
                        <span style="width:68px;height:68px;border-radius:18px;background:#fff;display:flex;align-items:center;justify-content:center;flex:none;color:#C8102E;font-size:34px" aria-hidden="true"><i class="fa-solid fa-triangle-exclamation"></i></span>
                        <span>
                            <span style="display:block;font-size:26px;font-weight:700;line-height:1.1">REPORTAR EMERGENCIA</span>
                            <span style="display:block;font-size:18px;margin-top:4px">Toca aquí para avisar ahora</span>
                        </span>
                    </button>
                    <p style="margin:10px 0 0;text-align:center;font-size:18px;font-weight:700;color:#A80F1D">${FRASES_APP.principal}</p>
                </div>

                <!-- Accesos principales -->
                <h2 style="margin:24px 20px 12px;font-size:26px;font-weight:700">¿Qué necesitas hacer?</h2>
                <div id="guia-acciones" style="margin:0 20px;display:grid;grid-template-columns:1fr 1fr;gap:14px">
                    ${principal('ayuda', '#FFC21A', '#1A1A1A', 'fa-hands-holding-child', 'Pedir ayuda', 'Comida, refugio o apoyo')}
                    ${principal('ofrecer', '#14753A', '#FFFFFF', 'fa-hand-holding-heart', 'Dar ayuda', 'Voluntariado y víveres')}
                    ${principal('mapa', '#1B5FB5', '#FFFFFF', 'fa-map-location-dot', 'Ver el mapa', 'Zonas de riesgo y refugios')}
                    ${principal('comunidad', '#6A2C91', '#FFFFFF', 'fa-people-group', 'Mi comunidad', 'Alertas y seguimiento')}
                </div>

                <!-- Más opciones: cada una explica de qué trata y sus beneficios -->
                <h2 style="margin:26px 20px 4px;font-size:26px;font-weight:700">Más opciones</h2>
                <p style="margin:0 20px 12px;font-size:17px;color:#333">Toca una para saber de qué trata y qué beneficios tiene.</p>
                <div id="guia-mas" style="margin:0 20px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
                    ${[
                        ['solicitudes', 'fa-location-dot', 'Cerca de ti', '#B45309'],
                        ['seguimiento', 'fa-route', 'Seguimiento', '#6A2C91'],
                        ['comunidad', 'fa-people-group', 'Comunidad', '#C2255C'],
                        ['mis-ayudas', 'fa-hand-holding-heart', 'Mis ayudas', '#14753A'],
                        ['historial', 'fa-clock-rotate-left', 'Historial', '#1B5FB5'],
                        ['centro-ayuda', 'fa-circle-question', 'Ayuda', '#4B5563']
                    ].map(extra).join('')}
                </div>
                <!-- Recompensas -->
                <div id="guia-recompensas" style="margin:14px 20px 0;display:flex;flex-direction:column;gap:10px">
                    <button onclick="app.navegar('recompensas')" class="pv-tarjeta" style="width:100%;background:#0B5D36;color:#fff;border:3px solid #1A1A1A;border-radius:18px;padding:14px;display:flex;align-items:center;gap:12px;text-align:left">
                        <i class="fa-solid fa-medal" style="font-size:28px;color:#FFD54A" aria-hidden="true"></i>
                        <span style="flex:1"><span style="display:block;font-size:20px;font-weight:700">Mis recompensas</span><span style="display:block;font-size:16px">${RecompensasComponent.estado(puntos).actual.nombre} · ${puntos} puntos</span></span>
                        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                    </button>
                </div>
                ${app.esCoordinador() ? `
                <div style="padding:14px 20px 0">
                    <button onclick="app.navegar('coordinacion')" class="pv-tarjeta" style="width:100%;background:#4C1D95;color:#fff;border:3px solid #1A1A1A;border-radius:18px;padding:14px;display:flex;align-items:center;gap:12px;text-align:left">
                        <i class="fa-solid fa-people-roof" style="font-size:26px" aria-hidden="true"></i>
                        <span style="flex:1"><span style="display:block;font-size:20px;font-weight:700">Centro de coordinación</span><span style="display:block;font-size:16px">Para autoridades y organizaciones</span></span>
                        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                    </button>
                </div>` : ''}

                <!-- Alertas -->
                <div style="margin:26px 20px 12px;display:flex;align-items:center;justify-content:space-between">
                    <h2 style="margin:0;font-size:26px;font-weight:700">Alertas cerca de ti</h2>
                    ${alertas.length ? `<button onclick="app.navegar('historial')" style="background:none;border:0;font-size:18px;font-weight:700;color:#A80F1D;text-decoration:underline;padding:6px">Ver todo</button>` : ''}
                </div>
                <div id="guia-alertas" style="margin:0 20px;display:grid;gap:12px">
                    ${alertas.length === 0 ? `
                    <div style="border:3px solid #1A1A1A;border-radius:20px;padding:16px;display:flex;align-items:center;gap:14px;background:#F2F2F2">
                        <i class="fa-solid fa-shield-halved" style="color:#14753A;font-size:36px" aria-hidden="true"></i>
                        <div>
                            <div style="font-size:21px;font-weight:700">Sin alertas por ahora</div>
                            <div style="font-size:17px;color:#333;margin-top:2px">Te avisaremos si algo cambia en tu zona.</div>
                        </div>
                    </div>` : alertas.map(rep => `
                    <div style="border:3px solid #1A1A1A;border-radius:20px;padding:14px;background:#fff">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                            <h3 style="margin:0;font-size:21px;font-weight:700"><i class="fa-solid fa-triangle-exclamation" style="color:#C8102E;margin-right:8px" aria-hidden="true"></i>${UI.esc(rep.tipo)}</h3>
                            ${UI.chip(rep.estado)}
                        </div>
                        <p style="margin:6px 0 0;font-size:17px;line-height:1.35;color:#333">${UI.esc(rep.descripcion)}</p>
                        <p style="margin:6px 0 0;font-size:15px;color:#555"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${UI.esc(rep.ubicacion)} · ${UI.esc(rep.fecha)}</p>
                    </div>`).join('')}
                </div>

                <!-- Líneas de emergencia -->
                <div style="margin:22px 20px 0;background:#1A1A1A;color:#fff;border-radius:20px;padding:16px;display:flex;align-items:center;justify-content:space-between;gap:10px">
                    <div>
                        <div style="font-size:15px;font-weight:700;color:#FFB4B4;text-transform:uppercase">Líneas de emergencia 24/7</div>
                        <div style="font-size:19px;font-weight:700">Policía 105 · Bomberos 116</div>
                    </div>
                    <a href="tel:105" style="background:#fff;color:#1A1A1A;font-weight:700;font-size:18px;border-radius:14px;padding:12px 16px;text-decoration:none">Llamar</a>
                </div>

                <p style="margin:22px 20px 8px;text-align:center;font-size:20px;font-weight:700;color:#A80F1D">${FRASES_APP.barrio}</p>
            </div>`;
    }
};
