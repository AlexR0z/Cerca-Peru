import type { EmergencyReport, HelpRequest, ResourceOffer, RiskArea, Volunteer } from '../types'

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
    id: 'r-1', clientId: 'r-1', code: 'CP-2026-1001', tipo: 'Huaico',
    descripcion: 'Desborde de quebrada, viviendas afectadas (DEMO).',
    lat: -11.979, lon: -76.771, estado: 'Verificado por coordinador', prioridad: 'Alta',
    createdAt: ago(45), sync: 'enviado', demo: true, verifiedBy: 'Coordinación demo', verifiedAt: ago(30),
  },
  {
    id: 'r-2', clientId: 'r-2', code: 'CP-2026-1002', tipo: 'Inundación',
    descripcion: 'Agua acumulada en la calle (DEMO).',
    lat: -11.9702, lon: -76.7605, estado: 'Recibido', prioridad: 'Media',
    createdAt: ago(12), sync: 'enviado', demo: true,
  },
  {
    id: 'r-3', clientId: 'r-3', code: 'CP-2026-1003', tipo: 'Deslizamiento',
    descripcion: 'Rocas sueltas en el camino (DEMO).',
    lat: -11.9668, lon: -76.7771, estado: 'En revisión', prioridad: 'Media',
    createdAt: ago(25), sync: 'enviado', demo: true,
  },
]

export const DEMO_REQUESTS: HelpRequest[] = [
  {
    id: 'h-1', clientId: 'h-1', categoria: 'Otro', descripcion: 'Apoyo por huaico: necesitamos ayuda para despejar la vivienda (DEMO).',
    personas: 4, zona: 'Av. Nicolás Ayllón', lat: -11.979, lon: -76.771, estado: 'Pendiente', prioridad: 'Alta',
    apoyos: 3, createdAt: ago(10), sync: 'enviado', demo: true,
  },
  {
    id: 'h-2', clientId: 'h-2', categoria: 'Agua', descripcion: 'Agua y alimentos para una familia (DEMO).',
    personas: 5, zona: 'Urb. Los Girasoles', lat: -11.9702, lon: -76.7605, estado: 'Pendiente', prioridad: 'Alta',
    apoyos: 2, createdAt: ago(25), sync: 'enviado', demo: true,
  },
  {
    id: 'h-3', clientId: 'h-3', categoria: 'Transporte', descripcion: 'Transporte de ayuda para adulto mayor (DEMO).',
    personas: 1, zona: 'Parque Central', lat: -11.9741, lon: -76.7694, estado: 'Pendiente', prioridad: 'Media',
    apoyos: 0, createdAt: ago(40), sync: 'enviado', demo: true,
  },
  {
    id: 'h-4', clientId: 'h-4', categoria: 'Refugio', descripcion: 'Familia requiere refugio temporal (DEMO).',
    personas: 6, zona: 'Urb. Los Pinos', lat: -11.9668, lon: -76.7771, estado: 'Pendiente', prioridad: 'Alta',
    apoyos: 0, createdAt: ago(55), sync: 'enviado', demo: true,
  },
]

export const DEMO_OFFERS: ResourceOffer[] = [
  {
    id: 'o-1', clientId: 'o-1', categoria: 'Agua', descripcion: '10 cajas de agua y víveres básicos (DEMO).',
    disponibilidad: 'Hoy, desde 2:00 p. m.', zona: 'Parque Central', lat: -11.974, lon: -76.769,
    estado: 'Disponible', createdAt: ago(60), sync: 'enviado', demo: true,
  },
  {
    id: 'o-2', clientId: 'o-2', categoria: 'Transporte', descripcion: 'Camioneta disponible para traslados (DEMO).',
    disponibilidad: 'Hoy, todo el día', zona: 'Morón Bajo', lat: -11.982, lon: -76.759,
    estado: 'Disponible', createdAt: ago(90), sync: 'enviado', demo: true,
  },
  {
    id: 'o-3', clientId: 'o-3', categoria: 'Refugio', descripcion: 'Espacio para 6 personas (DEMO).',
    disponibilidad: 'Desde hoy', zona: 'Urb. Los Pinos', lat: -11.967, lon: -76.777,
    estado: 'Disponible', createdAt: ago(120), sync: 'enviado', demo: true,
  },
]

export const DEMO_VOLUNTEERS: Volunteer[] = [
  { id: 'v-1', nombre: 'María Torres (demo)', habilidades: ['Logística', 'Alimentos'], rating: 4.9, valoraciones: 28, disponible: true },
  { id: 'v-2', nombre: 'Carlos Mendoza (demo)', habilidades: ['Transporte', 'Apoyo general'], rating: 4.8, valoraciones: 17, disponible: true },
  { id: 'v-3', nombre: 'Ana Quispe (demo)', habilidades: ['Salud', 'Primeros auxilios'], rating: 5.0, valoraciones: 12, disponible: true },
]
