import type { AppNotification, EmergencyReport, HelpRequest, Post, ResourceOffer, RiskArea, Volunteer } from '../types'

/**
 * DATOS FICTICIOS DE DEMOSTRACIÓN.
 * Nada de lo siguiente es información oficial ni de personas reales.
 * Las zonas de riesgo son referencias orientativas, NO datos de INDECI ni de la municipalidad.
 */

const ago = (min: number) => new Date(Date.now() - min * 60000).toISOString()

export const DEMO_RISK_AREAS: RiskArea[] = [
  {
    id: 'ra-1',
    nombre: 'Quebrada de ejemplo (referencia orientativa)',
    tipo: 'Quebrada',
    polygon: [
      [-11.9745, -76.7745],
      [-11.9772, -76.7728],
      [-11.9803, -76.7695],
      [-11.9835, -76.7655],
      [-11.9822, -76.7640],
      [-11.9788, -76.7676],
      [-11.9758, -76.7710],
      [-11.9732, -76.7728],
    ],
    fuente: 'DEMO — dato ficticio, no oficial',
    fechaFuente: '2026-11-06',
    esOficial: false,
  },
]

export const DEMO_REPORTS: EmergencyReport[] = [
  {
    id: 'r-1', clientId: 'r-1', code: 'REP-0001', tipo: 'Huayco', distrito: 'Chaclacayo',
    descripcion: 'Desborde de quebrada, viviendas afectadas (DEMO).',
    lat: -11.979, lon: -76.771, estado: 'Verificado', prioridad: 'Alta',
    createdAt: ago(45), sync: 'enviado', demo: true, verifiedAt: ago(30),
  },
  {
    id: 'r-2', clientId: 'r-2', code: 'REP-0002', tipo: 'Inundación', distrito: 'Chaclacayo',
    descripcion: 'Agua acumulada en la calle (DEMO).',
    lat: -11.9702, lon: -76.7605, estado: 'Pendiente', prioridad: 'Media',
    createdAt: ago(12), sync: 'enviado', demo: true,
  },
  {
    id: 'r-3', clientId: 'r-3', code: 'REP-0003', tipo: 'Deslizamiento', distrito: 'Chaclacayo',
    descripcion: 'Rocas sueltas en el camino (DEMO).',
    lat: -11.9668, lon: -76.7771, estado: 'En revisión', prioridad: 'Media',
    createdAt: ago(25), sync: 'enviado', demo: true,
  },
]

export const DEMO_REQUESTS: HelpRequest[] = [
  {
    id: 'h-1', clientId: 'h-1', code: 'SOL-0001', categoria: 'Otro', descripcion: 'Apoyo por huayco: necesitamos ayuda para despejar la vivienda (DEMO).',
    personas: 4, distrito: 'Chaclacayo', lat: -11.979, lon: -76.771, estado: 'Activa', prioridad: 'Alta',
    apoyos: 3, createdAt: ago(10), sync: 'enviado', demo: true,
  },
  {
    id: 'h-2', clientId: 'h-2', code: 'SOL-0002', categoria: 'Agua', descripcion: 'Agua y alimentos para una familia (DEMO).',
    personas: 5, distrito: 'Chaclacayo', lat: -11.9702, lon: -76.7605, estado: 'Activa', prioridad: 'Alta',
    apoyos: 2, createdAt: ago(25), sync: 'enviado', demo: true,
  },
  {
    id: 'h-3', clientId: 'h-3', code: 'SOL-0003', categoria: 'Transporte', descripcion: 'Transporte de ayuda para adulto mayor (DEMO).',
    personas: 1, distrito: 'Chaclacayo', lat: -11.9741, lon: -76.7694, estado: 'Activa', prioridad: 'Media',
    apoyos: 0, createdAt: ago(40), sync: 'enviado', demo: true,
  },
  {
    id: 'h-4', clientId: 'h-4', code: 'SOL-0004', categoria: 'Refugio', descripcion: 'Familia requiere refugio temporal (DEMO).',
    personas: 6, distrito: 'Chaclacayo', lat: -11.9668, lon: -76.7771, estado: 'Activa', prioridad: 'Alta',
    apoyos: 0, createdAt: ago(55), sync: 'enviado', demo: true,
  },
]

export const DEMO_OFFERS: ResourceOffer[] = [
  {
    id: 'o-1', clientId: 'o-1', categoria: 'Agua', descripcion: '10 cajas de agua y víveres básicos (DEMO).',
    disponibilidad: 'Hoy, desde 2:00 p. m.', distrito: 'Chaclacayo', lat: -11.974, lon: -76.769,
    estado: 'Disponible', createdAt: ago(60), sync: 'enviado', demo: true,
  },
  {
    id: 'o-2', clientId: 'o-2', categoria: 'Transporte', descripcion: 'Camioneta disponible para traslados (DEMO).',
    disponibilidad: 'Hoy, todo el día', distrito: 'Chaclacayo', lat: -11.982, lon: -76.759,
    estado: 'Disponible', createdAt: ago(90), sync: 'enviado', demo: true,
  },
  {
    id: 'o-3', clientId: 'o-3', categoria: 'Refugio', descripcion: 'Espacio para 6 personas (DEMO).',
    disponibilidad: 'Desde hoy', distrito: 'Chaclacayo', lat: -11.967, lon: -76.777,
    estado: 'Disponible', createdAt: ago(120), sync: 'enviado', demo: true,
  },
]

export const DEMO_VOLUNTEERS: Volunteer[] = [
  { id: 'v-1', nombre: 'María Torres (demo)', habilidades: ['Logística', 'Alimentos'], distrito: 'Chaclacayo', apoyo: 'Armo kits de alimentos y los reparto.', horario: 'Tardes', ayudas: 28, demo: true },
  { id: 'v-2', nombre: 'Carlos Mendoza (demo)', habilidades: ['Transporte', 'Apoyo general'], distrito: 'Chaclacayo', apoyo: 'Camioneta para trasladar víveres.', horario: 'Fines de semana', ayudas: 17, demo: true },
  { id: 'v-3', nombre: 'Ana Quispe (demo)', habilidades: ['Salud', 'Primeros auxilios'], distrito: 'Chaclacayo', apoyo: 'Primeros auxilios básicos.', horario: 'Mañanas', ayudas: 12, demo: true },
]

export const DEMO_NOTIFICATIONS: AppNotification[] = [
  { id: 'n-1', titulo: 'Tu solicitud cambió de estado', detalle: 'La solicitud SOL-0001 ahora está: En coordinación. (DEMO)', createdAt: ago(5), leida: false, ruta: '/solicitudes' },
  { id: 'n-2', titulo: 'Le gustó tu publicación', detalle: 'Ana Torres le dio me gusta a tu publicación. (DEMO)', createdAt: ago(40), leida: false, ruta: '/comunidad' },
  { id: 'n-3', titulo: 'Tu reporte cambió de estado', detalle: 'El reporte REP-0001 ahora está: Verificado. (DEMO)', createdAt: ago(90), leida: true, ruta: '/perfil' },
]

export const DEMO_POSTS: Post[] = [
  {
    id: 'p-1', autor: 'Municipalidad (ejemplo)', texto: 'Recuerda tener una mochila de emergencia lista: agua, linterna, botiquín y copias de tus documentos.',
    createdAt: ago(120), meGusta: 14, miMeGusta: false, comentarios: [], mia: false, demo: true,
  },
  {
    id: 'p-2', autor: 'Ana Torres', texto: 'Este sábado armamos kits de alimentos en el colegio de Chaclacayo. ¡Se necesitan manos!',
    createdAt: ago(300), meGusta: 9, miMeGusta: false, mia: false, demo: true,
    comentarios: [
      { id: 'c-1', autor: 'Carlos Ramos', texto: '¡Cuenten conmigo! Llevo bolsas y guantes.', createdAt: ago(240), mio: false },
      { id: 'c-2', autor: 'Lucía Quispe', texto: 'Yo llevo el agua para todos.', createdAt: ago(180), mio: false },
    ],
  },
]
