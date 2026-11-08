/**
 * Componente: Recompensas (insignias y beneficios por puntos solidarios).
 * Las insignias NO se guardan: se calculan siempre a partir de usuario.puntosAyuda,
 * así que no cambia el formato de los datos y funciona igual en demostración y con la nube.
 * Los beneficios son de reconocimiento dentro de la app; no se cambian por dinero.
 */

const RecompensasComponent = {
    /** Pestaña abierta: 'insignias' | 'beneficios'. */
    tab: 'insignias',

    /** Insignias en orden. `desde` son los puntos necesarios. */
    NIVELES: [
        {
            id: 'semilla', nombre: 'Semilla solidaria', desde: 0, icono: 'fa-seedling', color: '#6B7280',
            resumen: 'Tu punto de partida en la comunidad.',
            beneficios: [
                'Acceso a todas las funciones de la app: reportar, pedir y ofrecer ayuda.',
                'Tu primera insignia aparece en tu perfil.'
            ]
        },
        {
            id: 'vecino', nombre: 'Vecino solidario', desde: 50, icono: 'fa-house-chimney-user', color: '#14753A',
            resumen: 'Ya ayudaste varias veces a tu cuadra.',
            beneficios: [
                'Insignia verde visible en tu perfil.',
                'Mensaje de agradecimiento de la comunidad al desbloquearla.',
                'Reconocimiento como vecino que responde cuando se le necesita.'
            ]
        },
        {
            id: 'aliado', nombre: 'Aliado de la comunidad', desde: 100, icono: 'fa-handshake-angle', color: '#1B5FB5',
            resumen: 'Tu ayuda ya es constante y confiable.',
            beneficios: [
                'Insignia azul de aliado en tu perfil.',
                'Mención como aliado en tu historial de ayudas (ejemplo del prototipo).',
                'Las dudas más frecuentes las resuelves con el asistente virtual.'
            ]
        },
        {
            id: 'guardian', nombre: 'Guardián del barrio', desde: 200, icono: 'fa-shield-heart', color: '#B45309',
            resumen: 'Cuidas a tu barrio en las emergencias.',
            beneficios: [
                'Insignia dorada de guardián.',
                'Certificado simbólico de voluntariado (ejemplo del prototipo).',
                'Prioridad para ser sugerido como apoyo en solicitudes cercanas (ejemplo del prototipo).'
            ]
        },
        {
            id: 'heroe', nombre: 'Héroe Perú Vive', desde: 300, icono: 'fa-medal', color: '#6A2C91',
            resumen: 'Eres un ejemplo para toda la comunidad.',
            beneficios: [
                'Insignia morada de héroe.',
                'Invitación a ser voluntario destacado en campañas de la comunidad.',
                'Tu nombre en el muro de reconocimiento (ejemplo del prototipo).'
            ]
        },
        {
            id: 'leyenda', nombre: 'Leyenda solidaria', desde: 400, icono: 'fa-crown', color: '#A80F1D',
            resumen: 'El nivel más alto de Perú Vive.',
            beneficios: [
                'Insignia roja de leyenda, la más alta de la app.',
                'Reconocimiento especial y carta de agradecimiento (ejemplo del prototipo).',
                'Participas en la propuesta de nuevas ideas para la app.'
            ]
        }
    ],

    /** Insignia actual, siguiente y avance, según los puntos. */
    estado: (puntos) => {
        const n = RecompensasComponent.NIVELES;
        let i = 0;
        n.forEach((nivel, k) => { if (puntos >= nivel.desde) i = k; });
        const actual = n[i];
        const siguiente = n[i + 1] || null;
        const avance = siguiente ? Math.round(((puntos - actual.desde) / (siguiente.desde - actual.desde)) * 100) : 100;
        return { indice: i, actual, siguiente, avance, faltan: siguiente ? siguiente.desde - puntos : 0 };
    },

    cambiarTab: (tab) => {
        RecompensasComponent.tab = tab;
        document.getElementById('router-view').innerHTML = RecompensasComponent.render();
    },

    /** Muestra los beneficios de una insignia en una hoja inferior. */
    verInsignia: (id) => {
        const nivel = RecompensasComponent.NIVELES.find(n => n.id === id);
        if (!nivel) return;
        const puntos = Number(db.obtenerUsuario().puntosAyuda) || 0;
        const logrado = puntos >= nivel.desde;
        UI.hoja({
            titulo: nivel.nombre, icono: nivel.icono, color: nivel.color,
            queEs: logrado ? `¡Ya la tienes! ${nivel.resumen}` : `${nivel.resumen} Te faltan ${nivel.desde - puntos} puntos para obtenerla.`,
            beneficios: nivel.beneficios,
            nota: 'Los beneficios son de reconocimiento dentro de la app. No se cambian por dinero.',
            boton: logrado ? null : { texto: 'Ver quién necesita ayuda', ruta: 'solicitudes' }
        });
    },

    /** Insignia dibujada como círculo (bloqueada = gris con candado). */
    _medalla: (nivel, logrado, tam = 56) => `
        <span style="width:${tam}px;height:${tam}px;border-radius:50%;background:${logrado ? nivel.color : '#E5E7EB'};color:${logrado ? '#fff' : '#9CA3AF'};display:flex;align-items:center;justify-content:center;font-size:${Math.round(tam * 0.42)}px;flex:none;border:3px solid ${logrado ? '#1A1A1A' : '#D1D5DB'}" aria-hidden="true">
            <i class="fa-solid ${logrado ? nivel.icono : 'fa-lock'}"></i>
        </span>`,

    render: () => {
        const R = RecompensasComponent;
        const u = db.obtenerUsuario();
        const puntos = Number(u.puntosAyuda) || 0;
        const e = R.estado(puntos);
        const nombre = u.nombreVisible || u.nombre || 'vecino';
        const tope = R.NIVELES[R.NIVELES.length - 1].desde;
        const pctBarra = Math.min(100, Math.round((puntos / tope) * 100));

        const hitos = R.NIVELES.filter(n => n.desde > 0).map(n => {
            const logrado = puntos >= n.desde;
            return `<div style="position:absolute;left:${(n.desde / tope) * 100}%;top:0;transform:translateX(-50%);text-align:center">
                <span style="display:block;width:14px;height:14px;border-radius:50%;background:${logrado ? '#E0A800' : '#D1D5DB'};border:2px solid #fff;margin:0 auto"></span>
                <span style="display:block;font-size:12px;font-weight:700;margin-top:4px;color:${logrado ? '#1A1A1A' : '#6B7280'}">${n.desde}</span>
            </div>`;
        }).join('');

        const tarjetaInsignia = (n) => {
            const logrado = puntos >= n.desde;
            return `
            <button onclick="RecompensasComponent.verInsignia('${n.id}')" class="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left" aria-label="${n.nombre}. ${logrado ? 'Ya la tienes' : 'Bloqueada'}. Toca para ver sus beneficios">
                <span class="flex items-center gap-3 p-4">
                    ${R._medalla(n, logrado)}
                    <span class="flex-1">
                        <span class="block text-base font-extrabold text-slate-800">${n.nombre}</span>
                        <span class="block text-sm text-slate-500 mt-0.5">${n.resumen}</span>
                    </span>
                </span>
                <span class="block text-center text-sm font-bold py-2.5 text-white" style="background:${logrado ? '#0B5D36' : '#6B7280'}">
                    ${logrado ? '<i class="fa-solid fa-check mr-1" aria-hidden="true"></i> Obtenida' : `Desde ${n.desde} <i class="fa-solid fa-star text-amber-300" aria-hidden="true"></i>`}
                </span>
            </button>`;
        };

        const tarjetaBeneficios = (n) => {
            const logrado = puntos >= n.desde;
            return `
            <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4" aria-label="Beneficios de ${n.nombre}">
                <div class="flex items-center gap-3">
                    ${R._medalla(n, logrado, 44)}
                    <div class="flex-1">
                        <h3 class="text-base font-extrabold text-slate-800">${n.nombre}</h3>
                        <p class="text-xs font-semibold ${logrado ? 'text-green-700' : 'text-slate-500'}">${logrado ? 'Desbloqueada' : `Se desbloquea con ${n.desde} puntos`}</p>
                    </div>
                </div>
                <ul class="mt-3 space-y-1.5 text-sm text-slate-700">
                    ${n.beneficios.map(b => `<li class="flex gap-2"><i class="fa-solid ${logrado ? 'fa-circle-check text-green-600' : 'fa-lock text-slate-400'} mt-1 text-xs" aria-hidden="true"></i><span>${b}</span></li>`).join('')}
                </ul>
            </section>`;
        };

        const pestana = (id, ico, txt) => `
            <button onclick="RecompensasComponent.cambiarTab('${id}')" role="tab" aria-selected="${R.tab === id}"
                class="flex-1 rounded-2xl py-3 text-base font-bold flex flex-col items-center gap-1 min-h-[64px] ${R.tab === id ? 'bg-white border-2 border-[#0B5D36] text-[#0B5D36]' : 'bg-slate-100 border-2 border-transparent text-slate-500'}">
                <i class="fa-solid ${ico}" aria-hidden="true"></i>${txt}
            </button>`;

        return `
            <div class="p-4 space-y-4 animate-fadeIn">
                ${UI.vistaAtras('Mis recompensas', 'inicio', 'Insignias y beneficios')}

                <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4" aria-label="Tus puntos">
                    <p class="text-sm text-slate-500">¡Hola, ${UI.esc(nombre)}!</p>
                    <p class="text-4xl font-extrabold text-slate-900 leading-tight">${puntos} <i class="fa-solid fa-star text-amber-400 text-3xl" aria-hidden="true"></i></p>
                    <p class="text-sm text-slate-600">puntos solidarios acumulados</p>

                    <div class="flex items-center gap-3 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        ${R._medalla(e.actual, true, 48)}
                        <div class="flex-1">
                            <span class="block text-xs font-semibold text-slate-500">Tu insignia</span>
                            <span class="block text-base font-extrabold text-slate-800">${e.actual.nombre}</span>
                        </div>
                    </div>

                    <div style="position:relative;height:46px;margin:22px 10px 0">
                        <div style="position:absolute;top:6px;left:0;right:0;height:3px;background:#E5E7EB;border-radius:2px"></div>
                        <div style="position:absolute;top:6px;left:0;width:${pctBarra}%;height:3px;background:#E0A800;border-radius:2px"></div>
                        ${hitos}
                    </div>

                    <p class="text-sm mt-1 ${e.siguiente ? 'text-slate-700' : 'text-green-700 font-bold'}">
                        ${e.siguiente ? `Te faltan <b>${e.faltan}</b> puntos para «${e.siguiente.nombre}». Cada apoyo a un vecino suma 10.` : '¡Tienes la insignia más alta! Gracias por ayudar.'}
                    </p>
                    <button onclick="app.navegar('solicitudes')" class="mt-3 w-full bg-[#0B5D36] text-white font-bold py-3 rounded-xl min-h-[48px]">
                        <i class="fa-solid fa-hand-holding-heart mr-1" aria-hidden="true"></i> Ganar puntos ayudando
                    </button>
                </section>

                <div class="flex gap-3" role="tablist">
                    ${pestana('insignias', 'fa-medal', 'Insignias')}
                    ${pestana('beneficios', 'fa-gift', 'Beneficios')}
                </div>

                ${R.tab === 'insignias' ? `
                    <h2 class="text-lg font-extrabold text-slate-800">Tus puntos te invitan a crecer</h2>
                    <div class="space-y-3">${R.NIVELES.map(tarjetaInsignia).join('')}</div>`
                : `
                    <h2 class="text-lg font-extrabold text-slate-800">Beneficios por cada insignia</h2>
                    <div class="space-y-3">${R.NIVELES.map(tarjetaBeneficios).join('')}</div>
                    <p class="text-xs text-slate-500 text-center">Son reconocimientos dentro de la app (ejemplos del prototipo). No se cambian por dinero.</p>`}
            </div>`;
    }
};
