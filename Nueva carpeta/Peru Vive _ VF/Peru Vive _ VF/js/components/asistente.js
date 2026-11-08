/**
 * Componente: Asistente virtual (chatbot básico).
 * Funciona sin internet y sin servicios externos: busca palabras clave en lo que escribe la persona
 * y responde con textos fijos. La conversación vive solo en memoria (se borra al recargar la app).
 * Cada respuesta puede traer botones para ir a una pantalla (acciones) y preguntas relacionadas (seguir).
 */

const AsistenteComponent = {
    /** Conversación actual: { de: 'bot' | 'yo', texto, acciones?: [[texto, ruta]], chips?: [pregunta] }. */
    mensajes: [],

    /** Preguntas que se ofrecen al empezar y cuando no se entiende algo. */
    SUGERENCIAS: [
        '¿Cómo reporto una emergencia?', '¿Qué hago en un sismo?', '¿Cómo gano puntos?', '¿Qué insignias hay?',
        '¿Cómo pido ayuda?', '¿Cómo contacto a un voluntario?', 'Números de emergencia', '¿Qué temas conoces?'
    ],

    /**
     * Temas: claves (sin tildes; las de varias palabras valen doble), texto y botones.
     * Gana el tema con más puntos; si empatan, el que aparece primero. Los más específicos van antes.
     */
    TEMAS: [
        /* ---------- Qué hacer en una emergencia ---------- */
        {
            claves: ['sismo', 'temblor', 'terremoto', 'tiembla', 'temblando', 'temblo', 'esta temblando', 'movimiento fuerte', 'que hago en un sismo', 'durante un sismo'],
            texto: 'Si tiembla: mantén la calma, agáchate, cúbrete bajo una mesa resistente o junto a una pared interior y sujétate. Aléjate de ventanas y objetos que puedan caer, y no uses el ascensor. Cuando pare, sal con calma hacia tu punto de reunión y ten cuidado con las réplicas. Si estás en la costa y el sismo fue muy fuerte, sube a zona alta sin esperar una alerta.',
            acciones: [['Reportar un sismo', 'reportar']],
            seguir: ['Mochila de emergencia', 'Números de emergencia']
        },
        {
            claves: ['huayco', 'huaico', 'aluvion', 'deslizamiento', 'derrumbe', 'quebrada', 'lluvias', 'lluvia'],
            texto: 'Ante un huayco o deslizamiento: aléjate de quebradas, ríos y laderas, y sube a una zona alta y firme. No cruces corrientes de agua ni de lodo, aunque parezcan bajas. Sigue las indicaciones de Defensa Civil (115) y avisa a tus vecinos. Después puedes reportarlo en la app.',
            acciones: [['Reportar un huayco', 'reportar'], ['Abrir el mapa', 'mapa']],
            seguir: ['Inundación', 'Números de emergencia']
        },
        {
            claves: ['inundacion', 'inundado', 'inundando', 'inundada', 'se inundo', 'desborde', 'crecida', 'se inunda', 'agua sube'],
            texto: 'Ante una inundación: sube a un lugar alto, no camines ni manejes por agua en movimiento y, si es seguro, corta la electricidad. Lleva documentos, agua y tu mochila de emergencia. Evita el contacto con el agua estancada. Puedes reportarla para que tus vecinos y coordinación lo sepan.',
            acciones: [['Reportar inundación', 'reportar']],
            seguir: ['Mochila de emergencia', 'Pedir refugio']
        },
        {
            claves: ['incendio', 'fuego', 'humo', 'quemadura', 'se quema'],
            texto: 'Si hay fuego: sal de inmediato y cierra la puerta al salir. Si hay humo, avanza agachado y cúbrete la nariz y la boca con un paño. No uses el ascensor ni regreses por tus cosas. Llama a Bomberos (116) desde un lugar seguro y luego avisa en la app.',
            acciones: [['Reportar incendio', 'reportar']],
            seguir: ['Números de emergencia', 'Primeros auxilios']
        },
        {
            claves: ['tsunami', 'maremoto', 'costa', 'mar'],
            texto: 'Si estás cerca del mar y el sismo es fuerte o largo, evacúa a pie hacia una zona alta de inmediato, sin esperar una alerta oficial. Aléjate de la playa y no regreses hasta que las autoridades (INDECI, Marina) lo indiquen.',
            acciones: [['Abrir el mapa', 'mapa']],
            seguir: ['¿Qué hago en un sismo?', 'Mochila de emergencia']
        },
        {
            claves: ['mochila', 'kit', 'botiquin', 'prepararme', 'prevencion', 'preparar', 'estar preparado', 'plan familiar'],
            texto: 'Mochila de emergencia: agua (al menos 3 litros por persona), comida que no se malogre, linterna con pilas, radio a pilas, botiquín, silbato, copias de documentos, algo de efectivo, abrigo y tus medicinas. Acuerda con tu familia un punto de reunión y revisa la mochila cada 6 meses.',
            seguir: ['¿Qué hago en un sismo?', 'Primeros auxilios']
        },
        {
            claves: ['primeros auxilios', 'herido', 'heridos', 'sangre', 'sangrando', 'desmayo', 'lesionado', 'accidente', 'ambulancia'],
            texto: 'Llama primero al SAMU (106). Mientras llega ayuda: no muevas a una persona con posible lesión en el cuello o la espalda, salvo que haya peligro. Si sangra, presiona la herida con una tela limpia. Mantén a la persona abrigada y tranquila. Estos consejos no reemplazan la atención médica.',
            acciones: [['Ver números de emergencia', 'centro-ayuda']],
            seguir: ['Números de emergencia', 'Incendio']
        },

        /* ---------- Usar la app ---------- */
        {
            claves: ['emergencia', 'reportar', 'reporte', 'reporto', 'avisar', 'alarma', 'sos', 'denunciar'],
            texto: 'Para reportar una emergencia, toca el botón rojo «Reportar emergencia» en Inicio. Son 4 pasos cortos: eliges el tipo (sismo, huayco, inundación, incendio…), cuentas qué pasa, confirmas la ubicación y envías. Si hay peligro inmediato, llama primero al 105, 116 o 106.',
            acciones: [['Reportar ahora', 'reportar']],
            seguir: ['¿Puedo adjuntar una foto?', '¿Qué significa Verificado?', 'Números de emergencia']
        },
        {
            claves: ['foto', 'fotos', 'imagen', 'adjuntar', 'subir foto', 'camara'],
            texto: 'Puedes adjuntar una foto al reportar una emergencia y al publicar en la comunidad. Es opcional. Evita mostrar rostros de menores o datos privados, y no te pongas en peligro para tomarla.',
            acciones: [['Ir a mi comunidad', 'comunidad']],
            seguir: ['¿Cómo reporto una emergencia?']
        },
        {
            claves: ['verificado', 'pendiente', 'en revision', 'estado de mi reporte', 'estado', 'cuanto demora', 'cuando responden', 'validar', 'validado'],
            texto: 'Un reporte nuevo aparece como «Pendiente» hasta que una persona de coordinación lo revisa. Luego pasa a «Verificado», «En atención» y «Resuelto». «Verificado» no es una alerta oficial: siempre consulta a INDECI y a tu municipalidad. Te avisamos de cada cambio en Notificaciones.',
            acciones: [['Ver mi seguimiento', 'seguimiento'], ['Mi historial', 'historial']],
            seguir: ['¿Dónde veo mis notificaciones?']
        },
        {
            claves: ['historial', 'mis reportes', 'mis solicitudes', 'seguimiento', 'ver mis pedidos', 'mi caso'],
            texto: 'En «Seguimiento» ves cómo avanzan tus reportes y solicitudes, y en «Historial» el registro de todo lo que hiciste. Los encuentras desde «Más opciones» en Inicio.',
            acciones: [['Seguimiento', 'seguimiento'], ['Historial', 'historial']]
        },
        {
            claves: ['pedir', 'pido', 'pides', 'solicito', 'solicitar', 'solicitud', 'necesito', 'comida', 'refugio', 'agua', 'abrigo', 'ayuda humanitaria', 'damnificado', 'albergue'],
            texto: 'Para pedir ayuda, entra a «Pedir ayuda» en Inicio, elige qué necesitas (comida, refugio, abrigo…), indica cuántas personas son y envía. Tus vecinos podrán verla y apoyarte. Nunca mostramos tu dirección exacta.',
            acciones: [['Pedir ayuda', 'ayuda'], ['Ver mi seguimiento', 'seguimiento']],
            seguir: ['¿Qué pasa después de pedir ayuda?', '¿Cómo contacto a un voluntario?']
        },
        {
            claves: ['despues de pedir', 'que pasa despues', 'nadie responde', 'no me ayudan', 'sin respuesta', 'cuando me ayudan'],
            texto: 'Tu solicitud queda visible para tus vecinos y voluntarios cercanos. Cuando alguien se compromete a apoyarte, pasa a «En coordinación» y te llega un aviso. Coordinación también puede asignar voluntarios. Si es urgente, no esperes: llama al 105, 116 o 106.',
            acciones: [['Ver mi seguimiento', 'seguimiento']],
            seguir: ['¿Cómo contacto a un voluntario?', 'Números de emergencia']
        },
        {
            claves: ['contacto a un voluntario', 'contactar', 'contactar voluntario', 'hablar con un voluntario', 'escribir a un voluntario', 'whatsapp', 'llamar a un voluntario', 'comunicarme con'],
            texto: 'Entra a «Comunidad», abre el perfil de un voluntario y toca «Contactar». Te preguntaremos si aceptas compartir tu nombre, tu zona y tu celular. Él recibe un aviso en sus Notificaciones y puede escribirte por WhatsApp o llamarte. Su número no se muestra. Necesitas tener tu celular guardado en tu perfil.',
            acciones: [['Ver voluntarios', 'comunidad'], ['Editar perfil', 'editar-perfil']],
            seguir: ['¿Cómo ofrezco ayuda?']
        },
        {
            claves: ['ofrecer', 'ofrezco', 'doy', 'voluntario', 'voluntaria', 'voluntariado', 'ser voluntario', 'donar', 'donacion', 'viveres', 'apoyar', 'colaborar', 'dar ayuda'],
            texto: 'Para ayudar, entra a «Dar ayuda» en Inicio, elige qué puedes dar y cuándo. También puedes apoyar solicitudes cercanas: cada compromiso te da 10 puntos. En «Mis ayudas» puedes pausar o retirar lo que ofreciste. Para aparecer en el directorio de voluntarios, activa esa opción en Configuración.',
            acciones: [['Dar ayuda', 'ofrecer'], ['Ver quién necesita ayuda', 'solicitudes'], ['Mis ayudas', 'mis-ayudas']],
            seguir: ['¿Cómo gano puntos?', '¿Puedo donar dinero?']
        },
        {
            claves: ['donar dinero', 'dinero', 'cuenta bancaria', 'yape', 'plin', 'depositar', 'transferencia', 'pagar', 'cobran', 'gratis', 'costo', 'cuesta'],
            texto: 'Perú Vive es gratuita y no recibe ni gestiona dinero. Los puntos y las insignias no se cambian por dinero. Desconfía de quien te pida depósitos o claves en nombre de la app. Para donar, usa los canales oficiales de INDECI, la Cruz Roja Peruana o tu municipalidad.',
            seguir: ['¿Cómo ofrezco ayuda?', 'Privacidad y seguridad']
        },
        {
            claves: ['pausar', 'retirar oferta', 'cancelar oferta', 'mis ayudas', 'quitar mi oferta', 'ya no puedo ayudar', 'cambiar mi oferta'],
            texto: 'En «Mis ayudas» ves todo lo que ofreciste. Desde ahí puedes pausar, reactivar o retirar una oferta cuando no estés disponible.',
            acciones: [['Ir a Mis ayudas', 'mis-ayudas']]
        },
        {
            claves: ['mapa', 'zonas de riesgo', 'zona de riesgo', 'refugios', 'filtros', 'pines', 'pin', 'cerca de mi'],
            texto: 'El mapa solidario muestra alertas, zonas de riesgo y refugios. Puedes filtrar por tipo y tocar un pin para ver su detalle y estado. Toca el botón de la mira para centrarlo en tu ubicación real.',
            acciones: [['Abrir el mapa', 'mapa']],
            seguir: ['No me ubica el GPS', '¿Qué significa Verificado?']
        },
        {
            claves: ['no me ubica', 'gps', 'no funciona la ubicacion', 'permiso de ubicacion', 'ubicacion incorrecta', 'ubicacion equivocada', 'no detecta', 'mal ubicado', 'ubicacion apagada'],
            texto: 'Si la ubicación falla: 1) activa el GPS del teléfono, 2) da permiso de ubicación a Perú Vive en Ajustes, 3) sal a un lugar abierto y vuelve a intentar. Si aun así no funciona, elige tu distrito manualmente en Inicio → «Cambiar». Tu zona se usa solo de forma aproximada.',
            acciones: [['Cambiar mi ubicación', 'ubicacion']],
            seguir: ['¿Se ve mi ubicación exacta?']
        },
        {
            claves: ['ubicacion', 'distrito', 'cambiar de zona', 'mi zona', 'donde estoy', 'lima', 'viajo', 'cambiar zona', 'departamento'],
            texto: 'Puedes cambiar tu zona en Inicio → «Cambiar»: eliges tu departamento, provincia y distrito, o lo detectas con el GPS. Siempre pedimos tu permiso. El mapa y las alertas se ajustan a la zona que elijas.',
            acciones: [['Cambiar mi ubicación', 'ubicacion']],
            seguir: ['No me ubica el GPS']
        },
        {
            claves: ['ubicacion exacta', 'se ve mi ubicacion', 'direccion exacta', 'privacidad', 'datos', 'seguro', 'seguridad', 'mis datos', 'quien ve', 'telefono publico', 'es seguro'],
            texto: 'Cuidamos tus datos: no mostramos direcciones exactas ni teléfonos, y la ubicación que se comparte es aproximada (unos 100 metros). Tu celular solo lo ve un voluntario cuando tú decides avisarle. Siempre pedimos permiso antes de usar el GPS.',
            acciones: [['Ir a Seguridad', 'seguridad']],
            seguir: ['Cambiar mi clave', '¿Cómo contacto a un voluntario?']
        },
        {
            claves: ['clave', 'contrasena', 'password', 'olvide mi clave', 'cambiar clave', 'recuperar', 'no puedo entrar', 'no puedo ingresar', 'restablecer'],
            texto: 'Para cambiar tu clave ve a Perfil → Seguridad. Si la olvidaste, en la pantalla de inicio de sesión toca «Olvidé mi clave» y te enviaremos un código a tu correo. Nunca compartas tu clave ni tu código con nadie.',
            acciones: [['Ir a Seguridad', 'seguridad']]
        },
        {
            claves: ['cerrar sesion', 'salir de la cuenta', 'salir', 'cambiar de cuenta'],
            texto: 'Para cerrar sesión, ve a Perfil y toca «Cerrar sesión», al final de la pantalla.',
            acciones: [['Ir a mi perfil', 'perfil']]
        },
        {
            claves: ['perfil', 'editar', 'nombre', 'datos personales', 'foto de perfil', 'cuenta', 'avatar', 'celular', 'correo', 'cambiar mi nombre', 'cambiar mi celular'],
            texto: 'Para cambiar tus datos, tu celular o tu foto, ve a Perfil → «Editar perfil».',
            acciones: [['Editar perfil', 'editar-perfil']]
        },
        {
            claves: ['configuracion', 'ajustes', 'directorio', 'preferencias', 'desactivar notificaciones', 'idioma'],
            texto: 'En Perfil → Configuración puedes elegir si quieres avisos, si tu ubicación se muestra solo de forma aproximada y si apareces en el directorio de voluntarios.',
            acciones: [['Ir a Configuración', 'configuracion']]
        },
        {
            claves: ['comunidad', 'publicar', 'publicacion', 'publicaciones', 'comentar', 'comentario', 'comentarios', 'vecinos', 'me gusta', 'borrar', 'eliminar', 'muro'],
            texto: 'En «Mi comunidad» puedes publicar mensajes con foto, dar me gusta y comentar. Si quieres borrar algo tuyo, abre la publicación o el comentario y usa la opción de eliminar. Sé respetuoso: no compartas datos privados de otras personas.',
            acciones: [['Ir a mi comunidad', 'comunidad']],
            seguir: ['¿Dónde veo mis notificaciones?']
        },
        {
            claves: ['notificacion', 'notificaciones', 'aviso', 'avisos', 'campana', 'me llego un aviso', 'novedades'],
            texto: 'Tus avisos (me gusta, comentarios, novedades de tus reportes y personas que piden tu ayuda) llegan a «Notificaciones», en la campana de arriba. Un punto amarillo o rojo indica que hay algo nuevo sin leer.',
            acciones: [['Ver notificaciones', 'notificaciones']]
        },
        {
            claves: ['coordinacion', 'coordinador', 'autoridades', 'municipalidad', 'indeci', 'defensa civil'],
            texto: 'Coordinación es el equipo (autoridades y organizaciones) que revisa los reportes, verifica la información y asigna voluntarios a los casos. Perú Vive complementa a INDECI y a tu municipalidad, pero no los reemplaza. Para alertas oficiales, consulta siempre sus canales.',
            seguir: ['¿Qué significa Verificado?', 'Números de emergencia']
        },
        {
            claves: ['internet', 'sin senal', 'sin datos', 'sin conexion', 'offline', 'sin wifi', 'no tengo senal'],
            texto: 'Para enviar reportes, pedir ayuda y recibir avisos necesitas conexión a internet. Las llamadas de emergencia (105, 116, 106, 115) funcionan sin internet. Si no tienes señal, llama o busca un lugar con cobertura.',
            acciones: [['Ver números de emergencia', 'centro-ayuda']]
        },
        {
            claves: ['falsa alarma', 'reporte falso', 'me equivoque', 'error en mi reporte', 'reporte equivocado', 'abuso', 'bromas', 'broma'],
            texto: 'Los reportes falsos pueden quitar ayuda a quien la necesita y la coordinación los revisa. Si te equivocaste, avisa a tus vecinos desde la comunidad y no reenvíes el reporte. Usa la app solo para situaciones reales.',
            seguir: ['¿Qué significa Verificado?']
        },
        {
            claves: ['guia', 'tutorial', 'como uso la app', 'como uso peru vive', 'como funciona', 'que es peru vive', 'para que sirve', 'aprender', 'primera vez'],
            texto: 'Perú Vive conecta a vecinos para reportar emergencias, pedir y dar ayuda, y cuidar su comunidad. Si quieres un recorrido paso a paso, puedes ver la guía de la app cuando quieras.',
            acciones: [['Ver la guía', 'guia'], ['Centro de ayuda', 'centro-ayuda']],
            seguir: ['¿Qué temas conoces?']
        },
        {
            claves: ['soporte', 'contacto de la app', 'problema con la app', 'error', 'falla', 'se cierra', 'no carga', 'no abre', 'bug', 'reclamo', 'queja'],
            texto: 'Lamento el inconveniente. Prueba cerrar y volver a abrir la app, y revisa tu conexión. Si sigue fallando, escribe a soporte@peruvive.pe (correo de ejemplo del prototipo) contándonos qué hacías y qué mensaje apareció.',
            acciones: [['Centro de ayuda', 'centro-ayuda']]
        },

        /* ---------- Recompensas ---------- */
        {
            claves: ['insignia', 'insignias', 'nivel', 'niveles', 'beneficio', 'beneficios', 'recompensa', 'recompensas', 'premio', 'premios', 'canjear', 'canje', 'rewards'],
            texto: () => {
                const p = Number(db.obtenerUsuario().puntosAyuda) || 0;
                const e = RecompensasComponent.estado(p);
                const sig = e.siguiente ? ` Te faltan ${e.faltan} puntos para «${e.siguiente.nombre}».` : ' ¡Ya tienes la insignia más alta!';
                return `Hay 6 insignias: Semilla solidaria, Vecino solidario (50 puntos), Aliado de la comunidad (100), Guardián del barrio (200), Héroe Perú Vive (300) y Leyenda solidaria (400). Cada una trae beneficios de reconocimiento (no se cambian por dinero). Tu insignia actual es «${e.actual.nombre}».${sig}`;
            },
            acciones: [['Ver mis recompensas', 'recompensas']],
            seguir: ['¿Cómo gano puntos?', 'Beneficios de Guardián']
        },
        {
            claves: ['punto', 'puntos', 'ganar', 'gano', 'ganas', 'sumar', 'sumo', 'acumular', 'cuantos puntos', 'mis puntos', 'puntos solidarios'],
            texto: () => {
                const p = Number(db.obtenerUsuario().puntosAyuda) || 0;
                const e = RecompensasComponent.estado(p);
                const sig = e.siguiente ? ` Te faltan ${e.faltan} para la insignia «${e.siguiente.nombre}».` : '';
                return `Ganas 10 puntos solidarios cada vez que te comprometes a apoyar la solicitud de un vecino. Ahora tienes ${p} puntos.${sig} Con ellos subes de insignia y desbloqueas beneficios de reconocimiento.`;
            },
            acciones: [['Ver quién necesita ayuda', 'solicitudes'], ['Mis recompensas', 'recompensas']],
            seguir: ['¿Qué insignias hay?']
        },

        /* ---------- Teléfonos y conversación ---------- */
        {
            claves: ['numero', 'numeros', 'llamar', 'telefono', 'telefonos', 'bomberos', 'policia', 'samu', 'urgencia', 'numeros de emergencia', 'emergencias', 'llamo'],
            texto: 'Números de emergencia en Perú: Policía 105, Bomberos 116, SAMU (salud) 106 y Defensa Civil 115. Llama primero si hay peligro inmediato. Perú Vive complementa la ayuda oficial, no la reemplaza.',
            acciones: [['Ver centro de ayuda', 'centro-ayuda']],
            seguir: ['¿Cómo reporto una emergencia?', 'Primeros auxilios']
        },
        {
            claves: ['quien eres', 'como te llamas', 'eres un robot', 'eres real', 'eres humano', 'tu nombre', 'eres una persona'],
            texto: 'Soy el asistente virtual de Perú Vive, un programa con respuestas preparadas. No soy una persona ni un servicio de emergencia. Puedo orientarte sobre la app y darte consejos básicos de prevención.',
            seguir: ['¿Qué temas conoces?', 'Números de emergencia']
        },
        {
            claves: ['que temas conoces', 'que puedes hacer', 'en que me ayudas', 'menu', 'temas', 'opciones', 'que sabes', 'que me puedes decir', 'ayudame', 'como me ayudas'],
            texto: 'Puedo ayudarte con: qué hacer en sismo, huayco, inundación o incendio · reportar, pedir y ofrecer ayuda · contactar voluntarios · mapa y ubicación · puntos e insignias · privacidad, clave y perfil · notificaciones. Toca una pregunta o escribe la tuya.',
            sugerir: true
        }
    ],

    SALUDOS: ['hola', 'holi', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'saludos', 'que tal'],
    GRACIAS: ['gracias', 'muchas gracias', 'listo', 'ok', 'vale', 'perfecto', 'genial', 'excelente', 'entendido', 'ya entendi', 'buen servicio'],
    DESPEDIDAS: ['chau', 'chao', 'adios', 'hasta luego', 'nos vemos', 'bye'],

    /** Quita tildes, mayúsculas y signos para comparar. */
    normalizar: (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9ñ\s]/g, ' ').replace(/\s+/g, ' ').trim(),

    /** ¿La clave aparece en el texto? Una palabra larga también cuenta como inicio de otra (emergencia → emergencias). */
    _coincide: (t, c) => t.includes(' ' + c + ' ') || (c.length > 4 && !c.includes(' ') && t.includes(' ' + c)),

    /** Devuelve { texto, acciones, chips, sugerir } para lo que escribió la persona. */
    responder: (entrada) => {
        const A = AsistenteComponent;
        const limpio = A.normalizar(entrada);
        const t = ' ' + limpio + ' ';
        const u = db.obtenerUsuario();
        const nombre = (u.nombreVisible || u.nombre || '').trim();

        // Si nombran una insignia (Guardián, Héroe…), se explica esa insignia
        const nivel = RecompensasComponent.NIVELES.find(n => A._coincide(t, n.id === 'vecino' ? 'vecino solidario' : n.id));
        if (nivel) {
            const p = Number(u.puntosAyuda) || 0;
            const logrado = p >= nivel.desde;
            return {
                texto: `«${nivel.nombre}»: ${nivel.resumen} Se obtiene con ${nivel.desde} puntos${logrado ? ' (¡ya la tienes!)' : ` (te faltan ${nivel.desde - p})`}. Beneficios: ${nivel.beneficios.join(' ')}`,
                acciones: [['Ver mis recompensas', 'recompensas']], chips: ['¿Qué insignias hay?', '¿Cómo gano puntos?']
            };
        }
        let mejor = null, mejorPuntaje = 0;
        A.TEMAS.forEach(tema => {
            const puntaje = tema.claves.reduce((n, c) => n + (A._coincide(t, c) ? (c.includes(' ') ? 2 : 1) : 0), 0);
            if (puntaje > mejorPuntaje) { mejor = tema; mejorPuntaje = puntaje; }
        });
        if (mejor) {
            return { texto: typeof mejor.texto === 'function' ? mejor.texto() : mejor.texto, acciones: mejor.acciones, chips: mejor.seguir, sugerir: !!mejor.sugerir };
        }

        if (A.GRACIAS.includes(limpio)) return { texto: '¡Con gusto! Si tienes otra duda, aquí estoy.', chips: ['¿Qué temas conoces?'] };
        if (A.DESPEDIDAS.includes(limpio)) return { texto: '¡Hasta pronto! Cuida de ti y de tu comunidad. Si hay peligro, llama al 105, 116 o 106.' };
        if (A.SALUDOS.some(s => limpio === s || limpio.startsWith(s + ' '))) {
            return { texto: `¡Hola${nombre ? ', ' + nombre : ''}! Soy el asistente de Perú Vive. Pregúntame cómo reportar una emergencia, qué hacer en un sismo, cómo pedir o dar ayuda, ganar puntos o qué insignias hay.`, sugerir: true };
        }
        return {
            texto: 'No estoy seguro de haber entendido. Puedo ayudarte con emergencias, prevención, pedir o dar ayuda, el mapa, tu ubicación, puntos e insignias. Prueba con una de estas preguntas o con otras palabras.',
            sugerir: true
        };
    },

    enviar: (texto) => {
        const A = AsistenteComponent;
        const limpio = String(texto || '').trim().slice(0, 200);
        if (!limpio) return;
        A.mensajes.push({ de: 'yo', texto: limpio });
        const r = A.responder(limpio);
        A.mensajes.push({ de: 'bot', texto: r.texto, acciones: r.acciones, chips: r.chips, sugerir: r.sugerir });
        A.pintar();
    },

    alEnviar: (e) => {
        e.preventDefault();
        const campo = document.getElementById('asistente-campo');
        AsistenteComponent.enviar(campo.value);
        campo.value = '';
        campo.focus();
        return false;
    },

    _burbuja: (m, i, todos) => {
        const esBot = m.de === 'bot';
        const ultimo = i === todos.length - 1; // las preguntas sugeridas solo se ofrecen en la última respuesta
        const acciones = (m.acciones || []).map(([txt, ruta]) =>
            `<button onclick="app.navegar('${ruta}')" class="mt-2 mr-2 text-sm font-bold text-peru-red bg-red-50 border border-red-200 rounded-full px-3 py-2 min-h-[40px]">${UI.esc(txt)} <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i></button>`).join('');
        const lista = m.sugerir ? AsistenteComponent.SUGERENCIAS : (m.chips || []);
        const chips = ultimo && esBot ? lista.map(s =>
            `<button onclick="AsistenteComponent.enviar(this.textContent)" class="mt-2 mr-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-full px-3 py-2 min-h-[40px]">${UI.esc(s)}</button>`).join('') : '';
        return `
            <div class="flex ${esBot ? 'justify-start' : 'justify-end'}">
                ${esBot ? '<span class="w-8 h-8 rounded-full bg-peru-red text-white flex items-center justify-center mr-2 flex-none text-sm" aria-hidden="true"><i class="fa-solid fa-robot"></i></span>' : ''}
                <div class="max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${esBot ? 'bg-white border border-slate-200 text-slate-800' : 'bg-peru-red text-white'}">
                    <span class="sr-only">${esBot ? 'Asistente: ' : 'Tú: '}</span>${UI.esc(m.texto)}${acciones ? `<div>${acciones}</div>` : ''}${chips ? `<div>${chips}</div>` : ''}
                </div>
            </div>`;
    },

    pintar: () => {
        const caja = document.getElementById('asistente-mensajes');
        if (!caja) return;
        caja.innerHTML = AsistenteComponent.mensajes.map(AsistenteComponent._burbuja).join('');
        caja.scrollTop = caja.scrollHeight;
    },

    limpiar: () => {
        AsistenteComponent.mensajes = [];
        AsistenteComponent.empezar();
        AsistenteComponent.pintar();
    },

    empezar: () => {
        const A = AsistenteComponent;
        if (A.mensajes.length) return;
        const nombre = (db.obtenerUsuario().nombreVisible || db.obtenerUsuario().nombre || '').trim();
        A.mensajes.push({
            de: 'bot', sugerir: true,
            texto: `¡Hola${nombre ? ', ' + nombre : ''}! Soy el asistente de Perú Vive. Escríbeme tu duda o toca una pregunta. Si hay peligro inmediato, llama primero al 105, 116 o 106.`
        });
    },

    render: () => {
        AsistenteComponent.empezar();
        return `
            <div class="p-4 flex flex-col animate-fadeIn" style="min-height:calc(100% - 8px)">
                ${UI.vistaAtras('Asistente virtual', 'inicio', 'Respuestas rápidas sobre la app y tu seguridad',
                    '<button onclick="AsistenteComponent.limpiar()" aria-label="Borrar la conversación" class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0"><i class="fa-regular fa-trash-can"></i></button>')}
                <div id="asistente-mensajes" class="flex-1 space-y-3 mt-3 overflow-y-auto" style="max-height:calc(100dvh - 330px);min-height:220px" role="log" aria-live="polite"></div>
                <form onsubmit="return AsistenteComponent.alEnviar(event)" class="flex gap-2 mt-3 sticky bottom-0">
                    <input id="asistente-campo" type="text" maxlength="200" autocomplete="off" placeholder="Escribe tu pregunta…" aria-label="Escribe tu pregunta"
                        class="flex-1 border-2 border-slate-300 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:border-peru-red min-h-[48px]">
                    <button type="submit" aria-label="Enviar" class="bg-peru-red text-white rounded-xl w-12 min-h-[48px] flex items-center justify-center"><i class="fa-solid fa-paper-plane"></i></button>
                </form>
            </div>`;
    },

    montar: () => AsistenteComponent.pintar()
};
