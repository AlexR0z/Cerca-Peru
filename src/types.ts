export type Role = 'ciudadano' | 'voluntario' | 'coordinador' | 'administrador'

export const REPORT_TYPES = ['Huaico', 'Inundación', 'Terremoto', 'Incendio', 'Deslizamiento', 'Emergencia médica', 'Otro'] as const
export type ReportType = (typeof REPORT_TYPES)[number]

export const REPORT_STATUSES = ['Recibido', 'En revisión', 'Verificado por coordinador', 'En atención', 'Resuelto', 'Descartado'] as const
export type ReportStatus = (typeof REPORT_STATUSES)[number]

export const HELP_CATEGORIES = ['Alimentos', 'Agua', 'Medicamentos', 'Refugio', 'Transporte', 'Herramientas', 'Otro'] as const
export type HelpCategory = (typeof HELP_CATEGORIES)[number]

export const HELP_STATUSES = ['Pendiente', 'En contacto', 'Apoyo confirmado', 'Atendida', 'Cancelada'] as const
export type HelpStatus = (typeof HELP_STATUSES)[number]

export const OFFER_CATEGORIES = ['Alimentos', 'Agua', 'Transporte', 'Herramientas', 'Refugio', 'Voluntariado', 'Otro'] as const
export type OfferCategory = (typeof OFFER_CATEGORIES)[number]

export type OfferStatus = 'Disponible' | 'Asignado' | 'Agotado' | 'Retirado'
export type Priority = 'Alta' | 'Media' | 'Baja'

/** Estado de envío al servidor. Nunca se muestra "Enviado" si no llegó. */
export type SyncState = 'pendiente' | 'enviado' | 'error'

interface Base {
  id: string
  /** Identificador generado en el dispositivo; evita duplicados al sincronizar. */
  clientId: string
  createdAt: string
  /** Coordenadas APROXIMADAS (se redondean antes de guardarse). */
  lat: number
  lon: number
  sync: SyncState
  syncError?: string
  /** true = dato ficticio de demostración */
  demo?: boolean
}

export interface EmergencyReport extends Base {
  code: string
  tipo: ReportType
  descripcion: string
  estado: ReportStatus
  prioridad: Priority
  verifiedBy?: string
  verifiedAt?: string
}

export interface HelpRequest extends Base {
  categoria: HelpCategory
  descripcion: string
  personas: number
  zona: string
  estado: HelpStatus
  prioridad: Priority
  acceptedBy?: string
  apoyos: number
}

export interface ResourceOffer extends Base {
  categoria: OfferCategory
  descripcion: string
  disponibilidad: string
  zona: string
  estado: OfferStatus
}

export interface Volunteer {
  id: string
  nombre: string
  habilidades: string[]
  rating: number
  valoraciones: number
  disponible: boolean
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
