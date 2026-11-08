/**
 * Tipos de la app. Los valores de las listas coinciden con los de la base de datos de Perú Vive
 * (supabase/001-esquema.sql), que comparten la app web y la app móvil.
 */

/** El administrador no existe en la base compartida: el máximo rol es coordinador. */
export type Role = 'ciudadano' | 'voluntario' | 'coordinador'

export const REPORT_TYPES = ['Sismo', 'Huayco', 'Inundación', 'Incendio', 'Deslizamiento', 'Otro'] as const
export type ReportType = (typeof REPORT_TYPES)[number]

export const REPORT_STATUSES = ['Pendiente', 'En revisión', 'Verificado', 'En atención', 'Resuelto'] as const
export type ReportStatus = (typeof REPORT_STATUSES)[number]

export const HELP_CATEGORIES = ['Alimentos', 'Agua', 'Medicamentos', 'Refugio', 'Transporte', 'Herramientas', 'Otro'] as const
export type HelpCategory = (typeof HELP_CATEGORIES)[number]

export const HELP_STATUSES = ['Activa', 'En coordinación', 'En atención', 'Atendida', 'Cancelada'] as const
export type HelpStatus = (typeof HELP_STATUSES)[number]

export const OFFER_CATEGORIES = ['Alimentos', 'Agua', 'Transporte', 'Herramientas', 'Refugio', 'Voluntariado', 'Otro'] as const
export type OfferCategory = (typeof OFFER_CATEGORIES)[number]

export type OfferStatus = 'Disponible' | 'Pausada'
/** En la base se guarda como nivel: Alto / Medio / Bajo. */
export type Priority = 'Alta' | 'Media' | 'Baja'

/** Estado de envío al servidor. Nunca se muestra "Enviado" si no llegó. */
export type SyncState = 'pendiente' | 'enviado' | 'error'

interface Base {
  id: string
  /** Identificador generado en el dispositivo; evita duplicados al sincronizar. */
  clientId: string
  createdAt: string
  /** Coordenadas APROXIMADAS (se redondean antes de guardarse). null = el servidor no las tiene. */
  lat: number | null
  lon: number | null
  sync: SyncState
  syncError?: string
  /** true = dato ficticio de demostración */
  demo?: boolean
  /** true = lo creó la persona que está usando la app */
  mine?: boolean
}

export interface EmergencyReport extends Base {
  code: string
  tipo: ReportType
  descripcion: string
  estado: ReportStatus
  prioridad: Priority
  /** Distrito donde ocurrió (el servidor nunca publica la dirección escrita). */
  distrito: string
  /** Dirección o referencia escrita: solo la ve quien reporta y la coordinación. */
  referencia?: string
  /** Foto subida al servidor (ruta en el contenedor privado). */
  fotoRuta?: string
  verifiedAt?: string
}

export interface HelpRequest extends Base {
  code: string
  categoria: string
  descripcion: string
  personas: number
  distrito: string
  referencia?: string
  estado: HelpStatus
  /** Solo la usan los datos de demostración. */
  prioridad?: Priority
  /** Demostración: cuántas personas ya apoyan. */
  apoyos: number
  /** Nube: la persona ya se comprometió a apoyarla. */
  yoApoyo?: boolean
}

export interface ResourceOffer extends Base {
  categoria: string
  descripcion: string
  disponibilidad: string
  distrito: string
  estado: OfferStatus
}

export interface Volunteer {
  id: string
  nombre: string
  habilidades: string[]
  distrito: string
  apoyo: string
  horario: string
  ayudas: number
  demo?: boolean
}

export interface RiskArea {
  id: string
  nombre: string
  tipo: string
  polygon: [number, number][]
  fuente: string
  fechaFuente: string
  esOficial: boolean
}

export interface AuditEntry {
  id: string
  at: string
  actor: string
  action: string
  entity: string
}

export interface StatusChange {
  id: string
  at: string
  entity: string
  from: string
  to: string
  by: string
  note?: string
}

export interface AppNotification {
  id: string
  titulo: string
  detalle: string
  createdAt: string
  leida: boolean
  /** Pantalla a la que lleva el aviso. */
  ruta?: string
  objetivoId?: string
}

export interface PostComment {
  id: string
  autor: string
  texto: string
  createdAt: string
  mio: boolean
}

export interface Post {
  id: string
  autor: string
  texto: string
  createdAt: string
  meGusta: number
  miMeGusta: boolean
  fotoUrl?: string
  fotoRuta?: string
  comentarios: PostComment[]
  mia: boolean
  demo?: boolean
}

export interface Profile {
  id: string
  correo: string
  nombre: string
  apellido: string
  nombreVisible: string
  departamento: string
  provincia: string
  distrito: string
  puntos: number
  rol: Role
  habilidades: string[]
  apoyo: string
  horario: string
  visibleEnDirectorio: boolean
}
