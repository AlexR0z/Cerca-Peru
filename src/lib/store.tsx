import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { DEMO_OFFERS, DEMO_REPORTS, DEMO_REQUESTS, DEMO_RISK_AREAS, DEMO_VOLUNTEERS } from '../data/demo'
import { pushItem, type Pushable } from './backend'
import { isDemoMode, supabase } from './supabase'
import { approx, reportCode, uid } from './utils'
import type {
  AuditEntry, EmergencyReport, HelpRequest, HelpStatus, Priority, ReportStatus, ReportType,
  ResourceOffer, Role, RiskArea, StatusChange, Volunteer, HelpCategory, OfferCategory,
} from '../types'

const KEY = 'cerca-peru-v1'

interface State {
  reports: EmergencyReport[]
  requests: HelpRequest[]
  offers: ResourceOffer[]
  volunteers: Volunteer[]
  riskAreas: RiskArea[]
  audit: AuditEntry[]
  history: StatusChange[]
  role: Role
  displayName: string
  lastUpdated: string
}

function initialState(): State {
  return {
    reports: DEMO_REPORTS, requests: DEMO_REQUESTS, offers: DEMO_OFFERS,
    volunteers: DEMO_VOLUNTEERS, riskAreas: DEMO_RISK_AREAS, audit: [], history: [],
    role: 'ciudadano', displayName: 'Vecino/a',
    lastUpdated: new Date().toISOString(),
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...initialState(), ...JSON.parse(raw) }
  } catch {
    /* almacenamiento corrupto: se parte de cero */
  }
  return initialState()
}

export interface NewReport { tipo: ReportType; descripcion: string; lat: number; lon: number }
export interface NewRequest { categoria: HelpCategory; descripcion: string; personas: number; zona: string; lat: number; lon: number }
export interface NewOffer { categoria: OfferCategory; descripcion: string; disponibilidad: string; zona: string; lat: number; lon: number }

interface Ctx extends State {
  online: boolean
  pendingCount: number
  addReport: (r: NewReport) => EmergencyReport
  addRequest: (r: NewRequest) => HelpRequest
  addOffer: (o: NewOffer) => ResourceOffer
  setReportStatus: (id: string, status: ReportStatus, note?: string) => void
  setReportPriority: (id: string, p: Priority) => void
  acceptRequest: (id: string) => { ok: boolean; message: string }
  setRequestStatus: (id: string, status: HelpStatus, note?: string) => void
  retireOffer: (id: string) => void
  syncNow: () => Promise<void>
  setRole: (r: Role) => void
  resetDemo: () => void
}

const StoreCtx = createContext<Ctx | null>(null)

export function useStore(): Ctx {
  const c = useContext(StoreCtx)
  if (!c) throw new Error('useStore fuera de StoreProvider')
  return c
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)
  const [online, setOnline] = useState(navigator.onLine)
  const syncing = useRef(false)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const patch = useCallback((fn: (s: State) => Partial<State>) => {
    setState((s) => ({ ...s, ...fn(s) }))
  }, [])

  const logAudit = (s: State, action: string, entity: string): AuditEntry[] => [
    { id: uid(), at: new Date().toISOString(), actor: `${s.displayName} (${s.role})`, action, entity },
    ...s.audit,
  ]

  /* ---------- Sincronización con cola local ---------- */
  const syncNow = useCallback(async () => {
    if (syncing.current || !navigator.onLine) return
    syncing.current = true
    try {
      const s = stateRef.current
      const jobs: Pushable[] = [
        ...s.reports.filter((x) => x.sync !== 'enviado').map((item) => ({ kind: 'report' as const, item })),
        ...s.requests.filter((x) => x.sync !== 'enviado').map((item) => ({ kind: 'request' as const, item })),
        ...s.offers.filter((x) => x.sync !== 'enviado').map((item) => ({ kind: 'offer' as const, item })),
      ]
      for (const job of jobs) {
        let sync: 'enviado' | 'error' = 'enviado'
        let syncError: string | undefined
        try {
          await pushItem(job)
        } catch (e) {
          sync = 'error'
          syncError = e instanceof Error ? e.message : 'No se pudo enviar.'
        }
        const mark = <T extends { clientId: string }>(list: T[]) =>
          list.map((x) => (x.clientId === job.item.clientId ? { ...x, sync, syncError } : x))
        setState((st) => ({
          ...st,
          reports: job.kind === 'report' ? mark(st.reports) : st.reports,
          requests: job.kind === 'request' ? mark(st.requests) : st.requests,
          offers: job.kind === 'offer' ? mark(st.offers) : st.offers,
          lastUpdated: new Date().toISOString(),
        }))
      }
    } finally {
      syncing.current = false
    }
  }, [])

  useEffect(() => {
    const on = () => { setOnline(true); void syncNow() }
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    void syncNow()
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [syncNow])

  /* Con Supabase: el rol sale del perfil en el servidor, no del cliente. */
  useEffect(() => {
    if (!supabase) return
    const load = async () => {
      const { data } = await supabase!.auth.getUser()
      if (!data.user) return
      const { data: p } = await supabase!.from('profiles').select('rol,nombre_visible').eq('id', data.user.id).single()
      if (p) patch(() => ({ role: p.rol as Role, displayName: p.nombre_visible as string }))
    }
    void load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => void load())
    return () => sub.subscription.unsubscribe()
  }, [patch])

  /* ---------- Acciones ---------- */
  const base = (lat: number, lon: number) => {
    const id = uid()
    return { id, clientId: id, createdAt: new Date().toISOString(), lat: approx(lat), lon: approx(lon), sync: 'pendiente' as const }
  }

  const afterAdd = () => { if (navigator.onLine) setTimeout(() => void syncNow(), 0) }

  const addReport: Ctx['addReport'] = (r) => {
    const item: EmergencyReport = {
      ...base(r.lat, r.lon), code: reportCode(), tipo: r.tipo, descripcion: r.descripcion,
      estado: 'Recibido', prioridad: 'Media',
    }
    patch((s) => ({ reports: [item, ...s.reports], audit: logAudit(s, 'Crear reporte', item.code) }))
    afterAdd()
    return item
  }

  const addRequest: Ctx['addRequest'] = (r) => {
    const item: HelpRequest = {
      ...base(r.lat, r.lon), categoria: r.categoria, descripcion: r.descripcion, personas: r.personas,
      zona: r.zona, estado: 'Pendiente', prioridad: 'Media', apoyos: 0,
    }
    patch((s) => ({ requests: [item, ...s.requests], audit: logAudit(s, 'Crear solicitud', item.id.slice(0, 8)) }))
    afterAdd()
    return item
  }

  const addOffer: Ctx['addOffer'] = (o) => {
    const item: ResourceOffer = { ...base(o.lat, o.lon), ...o, lat: approx(o.lat), lon: approx(o.lon), estado: 'Disponible' }
    patch((s) => ({ offers: [item, ...s.offers], audit: logAudit(s, 'Crear oferta', item.id.slice(0, 8)) }))
    afterAdd()
    return item
  }

  const change = (s: State, entity: string, from: string, to: string, note?: string): StatusChange[] => [
    { id: uid(), at: new Date().toISOString(), entity, from, to, by: `${s.displayName} (${s.role})`, note },
    ...s.history,
  ]

  const setReportStatus: Ctx['setReportStatus'] = (id, status, note) =>
    patch((s) => {
      const cur = s.reports.find((r) => r.id === id)
      if (!cur || cur.estado === status) return {}
      // Solo coordinación/administración puede verificar. En Supabase lo exige además el backend (RLS).
      if (s.role !== 'coordinador' && s.role !== 'administrador') return {}
      const verified = status === 'Verificado por coordinador'
      return {
        reports: s.reports.map((r) =>
          r.id === id
            ? { ...r, estado: status, ...(verified ? { verifiedBy: s.displayName, verifiedAt: new Date().toISOString() } : {}) }
            : r,
        ),
        history: change(s, cur.code, cur.estado, status, note),
        audit: logAudit(s, `Cambiar estado a "${status}"`, cur.code),
      }
    })

  const setReportPriority: Ctx['setReportPriority'] = (id, p) =>
    patch((s) => {
      if (s.role !== 'coordinador' && s.role !== 'administrador') return {}
      return {
        reports: s.reports.map((r) => (r.id === id ? { ...r, prioridad: p } : r)),
        audit: logAudit(s, `Prioridad ${p}`, s.reports.find((r) => r.id === id)?.code ?? id),
      }
    })

  const acceptRequest: Ctx['acceptRequest'] = (id) => {
    const s = stateRef.current
    const cur = s.requests.find((r) => r.id === id)
    if (!cur) return { ok: false, message: 'No encontramos la solicitud.' }
    if (s.role === 'ciudadano') return { ok: false, message: 'Activa tu perfil de voluntario para aceptar solicitudes.' }
    // Control de concurrencia: solo se acepta si sigue pendiente (en Supabase lo garantiza accept_request()).
    if (cur.estado !== 'Pendiente' || cur.acceptedBy)
      return { ok: false, message: 'Otra persona ya tomó esta solicitud.' }
    patch((st) => ({
      requests: st.requests.map((r) =>
        r.id === id ? { ...r, estado: 'En contacto', acceptedBy: st.displayName, apoyos: r.apoyos + 1 } : r,
      ),
      history: change(st, id.slice(0, 8), 'Pendiente', 'En contacto', 'Aceptada por voluntario'),
      audit: logAudit(st, 'Aceptar solicitud', id.slice(0, 8)),
    }))
    return { ok: true, message: 'Listo, la solicitud quedó asignada a ti.' }
  }

  const setRequestStatus: Ctx['setRequestStatus'] = (id, status, note) =>
    patch((s) => {
      const cur = s.requests.find((r) => r.id === id)
      if (!cur || cur.estado === status) return {}
      return {
        requests: s.requests.map((r) => (r.id === id ? { ...r, estado: status } : r)),
        history: change(s, id.slice(0, 8), cur.estado, status, note),
        audit: logAudit(s, `Solicitud → ${status}`, id.slice(0, 8)),
      }
    })

  const retireOffer: Ctx['retireOffer'] = (id) =>
    patch((s) => ({
      offers: s.offers.map((o) => (o.id === id ? { ...o, estado: 'Retirado' } : o)),
      audit: logAudit(s, 'Retirar oferta', id.slice(0, 8)),
    }))

  const setRole: Ctx['setRole'] = (r) => patch(() => ({ role: r }))
  const resetDemo = () => setState(initialState())

  const pendingCount = [...state.reports, ...state.requests, ...state.offers].filter((x) => x.sync !== 'enviado').length

  return (
    <StoreCtx.Provider
      value={{
        ...state, online, pendingCount, addReport, addRequest, addOffer, setReportStatus, setReportPriority,
        acceptRequest, setRequestStatus, retireOffer, syncNow, setRole, resetDemo,
      }}
    >
      {children}
    </StoreCtx.Provider>
  )
}

export { isDemoMode }
