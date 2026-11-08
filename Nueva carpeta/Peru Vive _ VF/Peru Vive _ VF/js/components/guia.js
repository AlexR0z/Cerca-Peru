/**
 * Componente: Guía de primer uso.
 * Recorre la app real resaltando cada parte con un recuadro amarillo y una explicación corta.
 * - Se abre sola la primera vez que la persona llega al Inicio (una vez por cuenta en este dispositivo).
 * - Se puede repetir desde Perfil → "Ver la guía de la app".
 * - No guarda datos personales: solo recuerda que ya se vio.
 */

const GuiaComponent = {
    activa: false,
    indice: 0,
    _token: 0,

    /** Cada paso: pantalla (ruta), parte a resaltar (objetivo, un selector CSS) y el texto. Sin objetivo = mensaje centrado. */
    PASOS: [
        { ruta: 'inicio', icono: 'fa-hand-peace', titulo: '¡Bienvenido a Perú Vive!', texto: 'En un minuto te mostramos cómo usar la app. Toca Siguiente para avanzar. Puedes salir cuando quieras con "Omitir guía".' },
        { ruta: 'inicio', objetivo: '#guia-ubicacion', icono: 'fa-location-dot', titulo: 'Tu zona', texto: 'Aquí ves dónde estás. Toca Cambiar para elegir otra zona o detectarla con el GPS, por ejemplo cuando viajas.' },
        { ruta: 'inicio', objetivo: '#guia-stats', icono: 'fa-hand-holding-heart', titulo: 'Tus puntos', texto: 'Ganas 10 puntos solidarios cada vez que te comprometes a apoyar a un vecino. Toca la tarjeta para saber de qué trata.' },
        { ruta: 'inicio', objetivo: '#guia-sos', icono: 'fa-triangle-exclamation', titulo: 'Reportar una emergencia', texto: 'Si ves un sismo, huayco, inundación o incendio, toca este botón rojo y sigue los pasos. Si hay peligro inmediato, llama primero a Policía (105), Bomberos (116) o SAMU (106).' },
        { ruta: 'inicio', objetivo: '#guia-acciones', icono: 'fa-list-check', titulo: '¿Qué necesitas hacer?', texto: 'Pedir ayuda: comida, refugio o apoyo. Dar ayuda: voluntariado y víveres. Ver el mapa: zonas de riesgo y refugios. Mi comunidad: tus vecinos y sus publicaciones.' },
        { ruta: 'inicio', objetivo: '#guia-mas', icono: 'fa-circle-info', titulo: 'Más opciones', texto: 'Cerca de ti, Seguimiento, Comunidad, Mis ayudas, Historial y Ayuda. Toca cualquiera para ver de qué trata y qué beneficios tiene antes de entrar.' },
        { ruta: 'inicio', objetivo: '#guia-alertas', icono: 'fa-shield-halved', titulo: 'Alertas cerca de ti', texto: 'Aquí aparecen las emergencias reportadas. Cada una muestra su estado, por ejemplo Pendiente o Verificado, y dónde ocurrió.' },
        { ruta: 'inicio', objetivo: '#main-header button[aria-label="Notificaciones"]', icono: 'fa-bell', titulo: 'Avisos', texto: 'Te avisamos cuando cambia el estado de tu reporte o solicitud, y cuando alguien da me gusta o comenta tu publicación. El punto amarillo indica avisos nuevos.' },
        { ruta: 'inicio', objetivo: '#header-avatar', icono: 'fa-user', titulo: 'Tu perfil', texto: 'Tocando tu foto o tu inicial entras a tu perfil: tus datos, tu ubicación, la privacidad y cerrar sesión.' },
        { ruta: 'inicio', objetivo: '#bottom-nav [data-route="mapa"]', icono: 'fa-map-location-dot', titulo: 'Mapa', texto: 'Mira en un mapa las alertas, las zonas de riesgo y los refugios cerca de ti.' },
        { ruta: 'inicio', objetivo: '#bottom-nav [data-route="asistente"]', icono: 'fa-robot', titulo: 'Asistente virtual', texto: 'Este botón del centro está en todas las pantallas. Pregúntale cómo reportar una emergencia, qué hacer en un sismo, cómo ganar puntos y más.' },
        { ruta: 'inicio', objetivo: '#bottom-nav [data-route="comunidad"]', icono: 'fa-people-group', titulo: 'Comunidad', texto: 'Voluntarios y publicaciones de tus vecinos. Vamos a verla por dentro.' },
        {
            ruta: 'comunidad', objetivo: '#guia-publicar', icono: 'fa-camera', titulo: 'Publica, comenta y reacciona',
            texto: 'Comparte un aviso con foto, da me gusta y comenta las publicaciones. Con el botón Borrar puedes eliminar tus propias publicaciones y comentarios cuando quieras.',
            antes: () => { if (typeof ComunidadComponent !== 'undefined') ComunidadComponent.tab = 'publicaciones'; }
        },
        { ruta: 'perfil', objetivo: '#guia-perfil', icono: 'fa-id-card', titulo: 'Tu perfil', texto: 'Aquí ves tus puntos y puedes cambiar tu ubicación, editar tus datos, revisar tus ayudas y tu historial, y cambiar la seguridad de tu cuenta.' },
        { ruta: 'inicio', icono: 'fa-flag-checkered', titulo: '¡Todo listo!', texto: 'Ya conoces Perú Vive. Cuando quieras, vuelve a ver esta guía desde Perfil → "Ver la guía de la app".' }
    ],

    _clave: () => 'peru_vive_guia_' + ((db.obtenerUsuario().correo || 'demo').toLowerCase()),
    yaVista: () => { try { return localStorage.getItem(GuiaComponent._clave()) === '1'; } catch (e) { return true; } },
    marcarVista: () => { try { localStorage.setItem(GuiaComponent._clave(), '1'); } catch (e) { /* sin almacenamiento: se omite */ } },
    esperar: (ms) => new Promise(r => setTimeout(r, ms)),

    /** La llama el enrutador al mostrar el Inicio: abre la guía solo si es la primera vez. */
    iniciarSiCorresponde: () => {
        if (app.embed || GuiaComponent.activa || GuiaComponent.yaVista()) return;
        setTimeout(() => { if (app.vistaActual === 'inicio' && !GuiaComponent.activa && !GuiaComponent.yaVista()) GuiaComponent.iniciar(); }, 700);
    },

    /** Abre la guía. `paso` (opcional) permite empezar en un paso concreto; lo usa el tablero de pantallas. */
    iniciar: (paso = 0) => {
        if (GuiaComponent.activa) return;
        GuiaComponent.activa = true;
        GuiaComponent._teclas = (e) => { if (e.key === 'Escape') GuiaComponent.terminar(false); };
        GuiaComponent._redimensionar = () => { if (GuiaComponent.activa) GuiaComponent.mostrar(GuiaComponent.indice, true); };
        document.addEventListener('keydown', GuiaComponent._teclas);
        window.addEventListener('resize', GuiaComponent._redimensionar);
        const i = Number.isInteger(paso) && paso >= 0 && paso < GuiaComponent.PASOS.length ? paso : 0;
        GuiaComponent.mostrar(i);
    },

    /** Muestra un paso: cambia de pantalla si hace falta, lleva la parte a la vista y la resalta. */
    mostrar: async (i, soloRedibujar = false) => {
        const g = GuiaComponent, paso = g.PASOS[i];
        if (!paso || !g.activa) return;
        g.indice = i;
        const token = ++g._token;
        if (!soloRedibujar) {
            if (paso.antes) paso.antes();
            const pantalla = app.vistaActual === 'guia' ? 'inicio' : app.vistaActual; // 'guia' es el Inicio abierto desde el tablero
            if (paso.ruta && pantalla !== paso.ruta) { app.navegar(paso.ruta); await g.esperar(500); }
            else if (paso.antes) { app.renderizar(); await g.esperar(150); }
        }
        if (token !== g._token || !g.activa) return;
        const el = paso.objetivo ? document.querySelector(paso.objetivo) : null;
        const vista = document.getElementById('router-view');
        if (el && vista.contains(el)) {
            // Si la parte es alta, se alinea arriba para que quepa también la explicación
            const alto = el.getBoundingClientRect().height;
            el.scrollIntoView({ block: alto > vista.clientHeight * 0.4 ? 'start' : 'center' });
            await g.esperar(120);
        } else if (!el) {
            vista.scrollTop = 0;
        }
        if (token !== g._token || !g.activa) return;
        g.dibujar(paso, el, i);
    },

    dibujar: (paso, el, i) => {
        const g = GuiaComponent, cont = document.getElementById('app-container');
        let capa = document.getElementById('pv-guia');
        if (!capa) {
            capa = document.createElement('div');
            capa.id = 'pv-guia';
            capa.style.cssText = 'position:absolute;inset:0;z-index:80;';
            cont.appendChild(capa);
        }
        const c = cont.getBoundingClientRect();
        const total = g.PASOS.length, ultimo = i === total - 1;
        const MARGEN = 12;
        let foco = '<div style="position:absolute;inset:0;background:rgba(0,0,0,.72)"></div>';
        let rec = null; // zona recuadrada, relativa a la pantalla

        if (el) {
            const r = el.getBoundingClientRect(), m = 6;
            rec = { top: r.top - c.top - m, left: r.left - c.left - m, w: r.width + 2 * m, h: r.height + 2 * m };
            foco = `<div style="position:absolute;top:${rec.top}px;left:${rec.left}px;width:${rec.w}px;height:${rec.h}px;border:4px solid #FFC21A;border-radius:18px;box-shadow:0 0 0 9999px rgba(0,0,0,.72);pointer-events:none"></div>`;
        }

        // La tarjeta es una columna: título arriba, texto en el medio (se desplaza si hace falta) y botones abajo, siempre visibles.
        capa.innerHTML = `
            <div aria-hidden="true">${foco}</div>
            <section role="dialog" aria-modal="true" aria-labelledby="pv-guia-t" style="position:absolute;left:${MARGEN}px;right:${MARGEN}px;visibility:hidden;display:flex;flex-direction:column;box-sizing:border-box;max-height:${c.height - 2 * MARGEN}px;background:#fff;color:#1A1A1A;border:3px solid #1A1A1A;border-radius:20px;padding:14px 16px;font-family:inherit;box-shadow:0 8px 30px rgba(0,0,0,.45)">
                <div style="display:flex;align-items:center;gap:10px;flex:none">
                    <span aria-hidden="true" style="width:44px;height:44px;border-radius:12px;background:#FFC21A;border:2px solid #1A1A1A;display:flex;align-items:center;justify-content:center;flex:none;font-size:20px"><i class="fa-solid ${paso.icono}"></i></span>
                    <h2 id="pv-guia-t" style="flex:1;margin:0;font-size:21px;font-weight:700;line-height:1.15">${UI.esc(paso.titulo)}</h2>
                    <span style="font-size:14px;color:#555;white-space:nowrap">${i + 1} de ${total}</span>
                </div>
                <div id="pv-guia-texto" style="flex:1 1 auto;min-height:0;overflow-y:auto;margin-top:8px">
                    <p style="margin:0;font-size:17px;line-height:1.4">${UI.esc(paso.texto)}</p>
                </div>
                <div aria-hidden="true" style="flex:none;margin-top:10px;height:8px;border-radius:999px;background:#E5E5E5;overflow:hidden"><div style="height:100%;width:${Math.round(((i + 1) / total) * 100)}%;background:#14753A"></div></div>
                <div style="flex:none;margin-top:10px;display:flex;align-items:center;gap:8px">
                    ${ultimo ? '' : '<button type="button" onclick="GuiaComponent.terminar(false)" style="background:none;border:0;font-size:16px;font-weight:700;text-decoration:underline;color:#444;padding:8px 4px;min-height:48px">Omitir guía</button>'}
                    <span style="flex:1"></span>
                    ${i > 0 ? '<button type="button" onclick="GuiaComponent.anterior()" style="border:3px solid #1A1A1A;background:#fff;border-radius:14px;font-size:17px;font-weight:700;padding:8px 14px;min-height:48px">Anterior</button>' : ''}
                    <button type="button" id="pv-guia-sig" onclick="GuiaComponent.siguiente()" style="border:3px solid #1A1A1A;background:#14753A;color:#fff;border-radius:14px;font-size:17px;font-weight:700;padding:8px 18px;min-height:48px">${ultimo ? '¡Empezar!' : 'Siguiente'}</button>
                </div>
            </section>`;

        // Se mide la tarjeta real y se coloca donde quepa: debajo de lo resaltado, si no arriba, y si no en el lado con más espacio.
        const tarjeta = capa.querySelector('section');
        const alto = tarjeta.offsetHeight;
        if (!rec) {
            tarjeta.style.top = Math.max(MARGEN, (c.height - alto) / 2) + 'px';
        } else {
            const abajo = c.height - (rec.top + rec.h) - 2 * MARGEN;
            const arriba = rec.top - 2 * MARGEN;
            if (alto <= abajo) tarjeta.style.top = (rec.top + rec.h + MARGEN) + 'px';
            else if (alto <= arriba) tarjeta.style.top = (rec.top - MARGEN - alto) + 'px';
            else if (Math.max(abajo, arriba) >= 220) {
                // No cabe entera en ningún lado: se usa el lado con más espacio y el texto se desplaza dentro de la tarjeta.
                const lado = Math.max(abajo, arriba);
                tarjeta.style.maxHeight = lado + 'px';
                tarjeta.style.top = (abajo >= arriba ? rec.top + rec.h + MARGEN : rec.top - MARGEN - Math.min(alto, lado)) + 'px';
            } else {
                // Lo resaltado ocupa casi toda la pantalla: la tarjeta va abajo, sobre él, con el texto desplazable.
                tarjeta.style.maxHeight = Math.min(alto, Math.round(c.height * 0.5)) + 'px';
                tarjeta.style.bottom = MARGEN + 'px';
            }
        }
        tarjeta.style.visibility = 'visible';
        const b = document.getElementById('pv-guia-sig');
        if (b) b.focus({ preventScroll: true });
    },

    siguiente: () => {
        const g = GuiaComponent;
        if (g.indice >= g.PASOS.length - 1) g.terminar(true);
        else g.mostrar(g.indice + 1);
    },

    anterior: () => { if (GuiaComponent.indice > 0) GuiaComponent.mostrar(GuiaComponent.indice - 1); },

    terminar: (completa) => {
        const g = GuiaComponent;
        if (!g.activa) return;
        g.activa = false;
        g._token++;
        const capa = document.getElementById('pv-guia');
        if (capa) capa.remove();
        document.removeEventListener('keydown', g._teclas);
        window.removeEventListener('resize', g._redimensionar);
        g.marcarVista();
        if (app.vistaActual !== 'inicio') app.navegar('inicio');
        UI.toast(completa ? '¡Listo! Puedes repetir la guía desde tu Perfil.' : 'Guía cerrada. La encuentras en tu Perfil.');
    }
};
