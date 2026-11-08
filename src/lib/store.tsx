import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  DEMO_NOTIFICATIONS, DEMO_OFFERS, DEMO_POSTS, DEMO_REPORTS, DEMO_REQUESTS, DEMO_RISK_AREAS, DEMO_VOLUNTEERS,
} from '../data/demo'
import * as cloud from './cloud'
import { puntoDeDepartamento, puntoDeDistrito, type Zona } from './geo'
import { isDemoMode, isEmbed, supabase } from './supabase'
import { approx, CHACLACAYO, reportCode, uid } from './utils'
import type {
  AppNotification, AuditEntry, EmergencyReport, HelpRequest, HelpStatus, Post, Priority, Profile, ReportStatus,
  ReportType, ResourceOffer, Role, RiskArea, StatusChange, Volunteer,
} from '../types'

/* ============ Estado ============ */
interface State {
  reports: EmergencyReport[]
  requests: HelpRequest[]
  offers: ResourceOffer[]
  volunteers: Volunteer[]
  riskAreas: RiskArea[]
  audit: AuditEntry[]
  history: StatusChange[]
  notifications: AppNotification[]
  posts: Post[]
  profile: Profile
  lastUpdated: string
}

const KEY = 'cerca-peru-v2'
const KEY_COLA = 'cerca-peru-cola-v2'

const perfilDemo = (): Profile => ({
  id: 'demo', correo: '', nombre: 'Vecino', apellido: '', nombreVisible: 'Vecino/a',
  departamento: 'Lima', provincia: 'Lima', distrito: 'Chaclacayo', puntos: 0,
  // El tablero de pantallas (embed) muestra también los paneles de coordinación.
  rol: isEmbed ? 'coordinador' : 'ciudadano', habilidades: [], apoyo: '', horario: '', visibleEnDirectorio: true,
})

function estadoInicial(): State {
  return {
    reports: DEMO_REPORTS, requests: DEMO_REQUESTS, offers: DEMO_OFFERS, volunteers: DEMO_VOLUNTEERS,
    riskAreas: DEMO_RISK_AREAS, audit: [], history: [], notifications: DEMO_NOTIFICATIONS, posts: DEMO_POSTS,
    profile: perfilDemo(), lastUpdated: new Date().toISOString(),
  }
}

/** En la nube no se inventa nada: todo viene del servidor. */
function estadoVacio(): State {
  return {
    reports: [], requests: [], offers: [], volunteers: [], riskAreas: DEMO_RISK_AREAS.map((a) => ({ ...a })),
    audit: [], history: [], notifications: [], posts: [],
    profile: { ...perfilDemo(), id: '', nombreVisible: '', departamento: '', provincia: '', distrito: '', rol: 'ciudadano' },
    lastUpdated: new Date().toISOString(),
  }
}

function cargar(): State {
  if (!isDemoMode || isEmbed) return isDemoMode ? estadoInicial() : estadoVacio()
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...estadoInicial(), ...JSON.parse(raw) }
  } catch {
    /* almacenamiento corrupto: se parte de cero */
  }
  return estadoInicial()
}

/* ============ Lo que reciben y devuelven las acciones ============ */
export interface NewReport { tipo: ReportType; descripcion: string; lat: number; lon: number; referencia?: string; zona?: Zona; foto?: Blob }
export interface NewRequest { categoria: string; descripcion: string; personas: number; referencia?: string; lat?: number; lon?: number; zona?: Zona }
export interface NewOffer { categoria: string; descripcion: string; disponibilidad: string }
export interface Result { ok: boolean; message: string }

type EnCola = cloud.Pushable

interface Ctx {
  mode: 'demo' | 'cloud'
  authReady: boolean
  session: { userId: string; email: string } | null
  online: boolean
  loading: boolean
  loadError: string
  pendingCount: number
  reports: EmergencyReport[]
  requests: HelpRequest[]
  offers: ResourceOffer[]
  volunteers: Volunteer[]
  riskAreas: RiskArea[]
  audit: AuditEntry[]
  history: StatusChange[]
  notifications: AppNotification[]
  posts: Post[]
  unread: number
  profile: Profile
  role: Role
  displayName: string
  zone: Zona
  zoneLabel: string
  center: [number, number]
  lastUpdated: string
  addReport: (r: NewReport) => EmergencyReport
  addRequest: (r: NewRequest) => HelpRequest
  addOffer: (o: NewOffer) => ResourceOffer
  setReportStatus: (id: string, status: ReportStatus, note?: string) => Promise<Result>
  setReportPriority: (id: string, p: Priority) => Promise<Result>
  acceptRequest: (id: string) => Promise<Result>
  setRequestStatus: (id: string, status: HelpStatus, note?: string) => Promise<Result>
  retireOffer: (id: string) => Promise<Result>
  assignVolunteers: (kind: 'reporte' | 'solicitud', id: string, volunteerIds: string[]) => Promise<Result>
  addPost: (texto: string, foto?: { url: string; blob: Blob }) => Promise<Result>
  toggleLike: (id: string) => Promise<Result>
  addComment: (postId: string, texto: string) => Promise<Result>
  deletePost: (id: string) => Promise<Result>
  deleteComment: (postId: string, commentId: string) => Promise<Result>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  updateProfile: (c: cloud.CambiosPerfil) => Promise<Result>
  refresh: () => Promise<void>
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

const falla = (e: unknown): Result => ({ ok: false, message: e instanceof Error ? e.message : 'No se pudo completar la acción.' })

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(cargar)
  const [queue, setQueue] = useState<EnCola[]>([])
  const [session, setSession] = useState<{ userId: string; email: string } | null>(null)
  const [authReady, setAuthReady] = useState(isDemoMode)
  const [online, setOnline] = useState(navigator.onLine)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const stateRef = useRef(state)
  stateRef.current = state
  const sessionRef = useRef(session)
  sessionRef.current = session
  const queueRef = useRef(queue)
  queueRef.current = queue
  const refreshing = useRef(false)
  const flushing = useRef(false)
  const fotos = useRef(new Map<string, Blob>())

  const patch = useCallback((fn: (s: State) => Partial<State>) => setState((s) => ({ ...s, ...fn(s) })), [])

  /* ---------- Persistencia ---------- */
  useEffect(() => {
    if (isDemoMode && !isEmbed) localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    if (!session) return
    localStorage.setItem(KEY_COLA, JSON.stringify({ userId: session.userId, items: queue }))
  }, [queue, session])

  /* ---------- Sesión (solo con la nube) ---------- */
  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => {
      const s = data.session
      setSession(s ? { userId: s.user.id, email: s.user.email ?? '' } : null)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => {
      setSession(s ? { userId: s.user.id, email: s.user.email ?? '' } : null)
      setAuthReady(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  /* ---------- Lectura desde el servidor ---------- */
  const refresh = useCallback(async () => {
    const s = sessionRef.current
    if (!supabase || !s || refreshing.current || !navigator.onLine) return
    refreshing.current = true
    try {
      const snap = await cloud.descargarTodo(s.userId, s.email)
      setState((st) => ({ ...st, ...snap, riskAreas: st.riskAreas, audit: [], lastUpdated: new Date().toISOString() }))
      setLoadError('')
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'No se pudieron cargar los datos.')
    } finally {
      refreshing.current = false
      setLoading(false)
    }
  }, [])

  /* ---------- Cola de envío (sin conexión) ---------- */
  const flush = useCallback(async () => {
    const s = sessionRef.current
    if (!supabase || !s || flushing.current || !navigator.onLine) return
    flushing.current = true
    try {
      let hubo = false
      for (const job of queueRef.current) {
        let error: string | undefined
        try {
          let ruta: string | undefined
          const foto = fotos.current.get(job.item.clientId)
          if (job.kind === 'report' && foto) {
            try { ruta = await cloud.subirFoto('fotos-reportes', s.userId, foto) } catch { /* el reporte se envía igual, sin la foto */ }
          }
          await cloud.enviar(job, ruta)
          fotos.current.delete(job.item.clientId)
          hubo = true
        } catch (e) {
          error = e instanceof Error ? e.message : 'No se pudo enviar.'
        }
        const cid = job.item.clientId
        setQueue((q) => (error ? q.map((x) => (x.item.clientId === cid ? ({ ...x, item: { ...x.item, sync: 'error', syncError: error } } as EnCola) : x)) : q.filter((x) => x.item.clientId !== cid)))
      }
      if (hubo) { flushing.current = false; await refresh() }
    } finally {
      flushing.current = false
    }
  }, [refresh])

  /* ---------- Al iniciar sesión: cargar, repetir cada 20 s y al volver a la pestaña ---------- */
  const userId = session?.userId
  useEffect(() => {
    if (!supabase) return
    if (!userId) { setState(estadoVacio()); setQueue([]); return }
    try {
      const guardada = JSON.parse(localStorage.getItem(KEY_COLA) || 'null')
      if (guardada && guardada.userId === userId && Array.isArray(guardada.items)) setQueue(guardada.items)
    } catch { /* cola corrupta: se ignora */ }
    setLoading(true)
    void refresh().then(() => flush())
    const cada = setInterval(() => { if (!document.hidden) void refresh().then(() => flush()) }, 20000)
    const alVolver = () => { if (!document.hidden) void refresh().then(() => flush()) }
    document.addEventListener('visibilitychange', alVolver)
    return () => { clearInterval(cada); document.removeEventListener('visibilitychange', alVolver) }
  }, [userId, refresh, flush])

  useEffect(() => {
    const on = () => { setOnline(true); void refresh().then(() => flush()) }
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [refresh, flush])

  /* ---------- Datos derivados ---------- */
  const profile = state.profile
  const role = profile.rol
  const displayName = profile.nombreVisible || 'Vecino/a'
  const zone: Zona = { departamento: profile.departamento, provincia: profile.provincia, distrito: profile.distrito }
  const zoneLabel = profile.distrito ? `${profile.distrito}, ${profile.departamento}` : 'Sin ubicación'
  const center: [number, number] = useMemo(
    () => (profile.distrito && puntoDeDistrito(profile.distrito, profile.departamento)) || (profile.departamento && puntoDeDepartamento(profile.departamento)) || CHACLACAYO,
    [profile.distrito, profile.departamento],
  )

  const mezclar = <T extends { clientId: string }>(enCola: T[], delServidor: T[]) =>
    [...enCola.filter((x) => !delServidor.some((y) => y.clientId === x.clientId)), ...delServidor]
  const reports = isDemoMode ? state.reports : mezclar(queue.flatMap((q) => (q.kind === 'report' ? [q.item] : [])), state.reports)
  const requests = isDemoMode ? state.requests : mezclar(queue.flatMap((q) => (q.kind === 'request' ? [q.item] : [])), state.requests)
  const offers = isDemoMode ? state.offers : mezclar(queue.flatMap((q) => (q.kind === 'offer' ? [q.item] : [])), state.offers)
  const pendingCount = isDemoMode
    ? [...state.reports, ...state.requests, ...state.offers].filter((x) => x.sync !== 'enviado').length
    : queue.length
  const unread = state.notifications.filter((n) => !n.leida).length

  /* ---------- Auxiliares de la demostración ---------- */
  const logAudit = (s: State, action: string, entity: string): AuditEntry[] => [
    { id: uid(), at: new Date().toISOString(), actor: `${s.profile.nombreVisible} (${s.profile.rol})`, action, entity },
    ...s.audit,
  ]
  const change = (s: State, entity: string, from: string, to: string, note?: string): StatusChange[] => [
    { id: uid(), at: new Date().toISOString(), entity, from, to, by: `${s.profile.nombreVisible} (${s.profile.rol})`, note },
    ...s.history,
  ]

  /** Demostración: marca como enviado un elemento recién creado (simula el envío). */
  const simularEnvio = (clientId: string) => {
    setTimeout(() => {
      setState((s) => {
        const marca = <T extends { clientId: string }>(l: T[]) => l.map((x) => (x.clientId === clientId ? { ...x, sync: 'enviado' as const } : x))
        return { ...s, reports: marca(s.reports), requests: marca(s.requests), offers: marca(s.offers), lastUpdated: new Date().toISOString() }
      })
    }, 500)
  }

  const base = (lat: number | null, lon: number | null) => {
    const id = uid()
    return {
      id, clientId: id, createdAt: new Date().toISOString(), lat: lat === null ? null : approx(lat), lon: lon === null ? null : approx(lon),
      sync: 'pendiente' as const, mine: true,
    }
  }
  const zonaDe = (z?: Zona) => z ?? zone
  const encolar = (job: EnCola) => {
    setQueue((q) => [job, ...q])
    setTimeout(() => void flush(), 0)
  }

  /* ---------- Acciones: crear ---------- */
  const addReport: Ctx['addReport'] = (r) => {
    const z = zonaDe(r.zona)
    const item: EmergencyReport = {
      ...base(r.lat, r.lon), code: isDemoMode ? reportCode() : 'Pendiente', tipo: r.tipo, descripcion: r.descripcion,
      estado: 'Pendiente', prioridad: 'Media', distrito: z.distrito, referencia: r.referencia,
    }
    if (isDemoMode) {
      patch((s) => ({ reports: [item, ...s.reports], audit: logAudit(s, 'Crear reporte', item.code) }))
      simularEnvio(item.clientId)
    } else {
      if (r.foto) fotos.current.set(item.clientId, r.foto)
      encolar({ kind: 'report', item })
    }
    return item
  }

  const addRequest: Ctx['addRequest'] = (r) => {
    const z = zonaDe(r.zona)
    const punto = r.lat !== undefined && r.lon !== undefined ? { lat: r.lat, lon: r.lon } : null
    const item: HelpRequest = {
      ...base(punto ? punto.lat : null, punto ? punto.lon : null), code: 'Pendiente', categoria: r.categoria, descripcion: r.descripcion,
      personas: r.personas, distrito: z.distrito, referencia: r.referencia, estado: 'Activa', apoyos: 0,
    }
    if (isDemoMode) {
      patch((s) => ({ requests: [item, ...s.requests], audit: logAudit(s, 'Crear solicitud', item.id.slice(0, 8)) }))
      simularEnvio(item.clientId)
    } else encolar({ kind: 'request', item })
    return item
  }

  const addOffer: Ctx['addOffer'] = (o) => {
    const item: ResourceOffer = {
      ...base(isDemoMode ? center[0] : null, isDemoMode ? center[1] : null), categoria: o.categoria, descripcion: o.descripcion,
      disponibilidad: o.disponibilidad, distrito: zone.distrito, estado: 'Disponible',
    }
    if (isDemoMode) {
      patch((s) => ({ offers: [item, ...s.offers], audit: logAudit(s, 'Crear oferta', item.id.slice(0, 8)) }))
      simularEnvio(item.clientId)
    } else encolar({ kind: 'offer', item })
    return item
  }

  /** Ejecuta algo contra el servidor y vuelve a leer. */
  const enServidor = async (accion: () => Promise<unknown>, mensaje: string): Promise<Result> => {
    try {
      await accion()
      await refresh()
      return { ok: true, message: mensaje }
    } catch (e) {
      return falla(e)
    }
  }

  /* ---------- Acciones: coordinación ---------- */
  const esCoord = role === 'coordinador'

  const setReportStatus: Ctx['setReportStatus'] = async (id, status, note) => {
    if (!esCoord) return { ok: false, message: 'Solo coordinación puede cambiar el estado.' }
    if (!isDemoMode) return enServidor(() => cloud.cambiarEstadoReporte(id, status), 'Estado actualizado.')
    patch((s) => {
      const cur = s.reports.find((r) => r.id === id)
      if (!cur || cur.estado === status) return {}
      return {
        reports: s.reports.map((r) => (r.id === id ? { ...r, estado: status, ...(status === 'Verificado' ? { verifiedAt: new Date().toISOString() } : {}) } : r)),
        history: change(s, cur.code, cur.estado, status, note),
        audit: logAudit(s, `Cambiar estado a "${status}"`, cur.code),
      }
    })
    return { ok: true, message: 'Estado actualizado.' }
  }

  const setReportPriority: Ctx['setReportPriority'] = async (id, p) => {
    if (!esCoord) return { ok: false, message: 'Solo coordinación puede cambiar la prioridad.' }
    if (!isDemoMode) return enServidor(() => cloud.cambiarNivelReporte(id, p), 'Prioridad actualizada.')
    patch((s) => ({
      reports: s.reports.map((r) => (r.id === id ? { ...r, prioridad: p } : r)),
      audit: logAudit(s, `Prioridad ${p}`, s.reports.find((r) => r.id === id)?.code ?? id),
    }))
    return { ok: true, message: 'Prioridad actualizada.' }
  }

  const acceptRequest: Ctx['acceptRequest'] = async (id) => {
    const cur = stateRef.current.requests.find((r) => r.id === id)
    if (!cur) return { ok: false, message: 'No encontramos la solicitud.' }
    if (!isDemoMode) return enServidor(() => cloud.apoyarSolicitud(id), 'Listo: te comprometiste a apoyar esta solicitud (+10 puntos).')
    if (cur.estado !== 'Activa') return { ok: false, message: 'Otra persona ya tomó esta solicitud.' }
    patch((st) => ({
      requests: st.requests.map((r) => (r.id === id ? { ...r, estado: 'En coordinación', yoApoyo: true, apoyos: r.apoyos + 1 } : r)),
      profile: { ...st.profile, puntos: st.profile.puntos + 10 },
      history: change(st, cur.code, 'Activa', 'En coordinación', 'Apoyada por una persona'),
      audit: logAudit(st, 'Apoyar solicitud', cur.code),
    }))
    return { ok: true, message: 'Listo: te comprometiste a apoyar esta solicitud (+10 puntos).' }
  }

  const setRequestStatus: Ctx['setRequestStatus'] = async (id, status, note) => {
    const cur = stateRef.current.requests.find((r) => r.id === id)
    if (!cur) return { ok: false, message: 'No encontramos la solicitud.' }
    if (!isDemoMode) return enServidor(() => cloud.cambiarEstadoSolicitud(id, status), 'Estado actualizado.')
    patch((s) => ({
      requests: s.requests.map((r) => (r.id === id ? { ...r, estado: status } : r)),
      history: change(s, cur.code, cur.estado, status, note),
      audit: logAudit(s, `Solicitud → ${status}`, cur.code),
    }))
    return { ok: true, message: 'Estado actualizado.' }
  }

  const retireOffer: Ctx['retireOffer'] = async (id) => {
    if (!isDemoMode) {
      const enCola = queueRef.current.find((q) => q.kind === 'offer' && q.item.id === id)
      if (enCola) { setQueue((q) => q.filter((x) => x !== enCola)); return { ok: true, message: 'Oferta retirada.' } }
      return enServidor(() => cloud.retirarOferta(id), 'Oferta retirada.')
    }
    patch((s) => ({ offers: s.offers.filter((o) => o.id !== id), audit: logAudit(s, 'Retirar oferta', id.slice(0, 8)) }))
    return { ok: true, message: 'Oferta retirada.' }
  }

  const assignVolunteers: Ctx['assignVolunteers'] = async (kind, id, ids) => {
    if (!esCoord) return { ok: false, message: 'Solo coordinación puede asignar voluntarios.' }
    if (ids.length === 0) return { ok: false, message: 'Elige al menos una persona.' }
    if (!isDemoMode) {
      try {
        const nuevos = await cloud.asignarVoluntarios(kind, id, ids)
        await refresh()
        return { ok: true, message: nuevos > 0 ? `Asignaste a ${nuevos} persona(s). Les avisamos.` : 'Esas personas ya estaban asignadas.' }
      } catch (e) { return falla(e) }
    }
    patch((s) => ({
      ...(kind === 'reporte'
        ? { reports: s.reports.map((r) => (r.id === id && r.estado !== 'Resuelto' ? { ...r, estado: 'En atención' as const } : r)) }
        : { requests: s.requests.map((r) => (r.id === id && (r.estado === 'Activa' || r.estado === 'En coordinación') ? { ...r, estado: 'En atención' as const } : r)) }),
      audit: logAudit(s, `Asignar ${ids.length} voluntario(s)`, id.slice(0, 8)),
    }))
    return { ok: true, message: `Asignaste a ${ids.length} persona(s).` }
  }

  /* ---------- Acciones: comunidad ---------- */
  const addPost: Ctx['addPost'] = async (texto, foto) => {
    if (!isDemoMode) {
      return enServidor(async () => {
        const ruta = foto ? await cloud.subirFoto('fotos-comunidad', stateRef.current.profile.id, foto.blob) : undefined
        await cloud.publicar(texto, ruta)
      }, 'Publicación compartida.')
    }
    const p = stateRef.current.profile
    patch((s) => ({
      posts: [{ id: uid(), autor: p.nombreVisible, texto, createdAt: new Date().toISOString(), meGusta: 0, miMeGusta: false, fotoUrl: foto?.url, comentarios: [], mia: true }, ...s.posts],
    }))
    return { ok: true, message: 'Publicación compartida.' }
  }

  const toggleLike: Ctx['toggleLike'] = async (id) => {
    const cur = stateRef.current.posts.find((p) => p.id === id)
    if (!cur) return { ok: false, message: 'No encontramos la publicación.' }
    const nuevo = !cur.miMeGusta
    patch((s) => ({ posts: s.posts.map((p) => (p.id === id ? { ...p, miMeGusta: nuevo, meGusta: p.meGusta + (nuevo ? 1 : -1) } : p)) }))
    if (isDemoMode) return { ok: true, message: '' }
    try {
      if (nuevo) await cloud.darMeGusta(id)
      else await cloud.quitarMeGusta(id, stateRef.current.profile.id)
      return { ok: true, message: '' }
    } catch (e) {
      await refresh()
      return falla(e)
    }
  }

  const addComment: Ctx['addComment'] = async (postId, texto) => {
    if (!isDemoMode) return enServidor(() => cloud.comentar(postId, texto), 'Comentario enviado.')
    const p = stateRef.current.profile
    patch((s) => ({
      posts: s.posts.map((x) => (x.id === postId ? { ...x, comentarios: [...x.comentarios, { id: uid(), autor: p.nombreVisible, texto, createdAt: new Date().toISOString(), mio: true }] } : x)),
    }))
    return { ok: true, message: 'Comentario enviado.' }
  }

  const deletePost: Ctx['deletePost'] = async (id) => {
    const cur = stateRef.current.posts.find((p) => p.id === id)
    if (!isDemoMode) {
      return enServidor(async () => {
        await cloud.borrarPublicacion(id)
        if (cur?.fotoRuta) { try { await cloud.borrarFoto('fotos-comunidad', cur.fotoRuta) } catch { /* la publicación ya se borró */ } }
      }, 'Publicación borrada.')
    }
    patch((s) => ({ posts: s.posts.filter((p) => p.id !== id) }))
    return { ok: true, message: 'Publicación borrada.' }
  }

  const deleteComment: Ctx['deleteComment'] = async (postId, commentId) => {
    if (!isDemoMode) return enServidor(() => cloud.borrarComentario(commentId), 'Comentario borrado.')
    patch((s) => ({ posts: s.posts.map((p) => (p.id === postId ? { ...p, comentarios: p.comentarios.filter((c) => c.id !== commentId) } : p)) }))
    return { ok: true, message: 'Comentario borrado.' }
  }

  /* ---------- Acciones: avisos y perfil ---------- */
  const markRead: Ctx['markRead'] = async (id) => {
    patch((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, leida: true } : n)) }))
    if (!isDemoMode) { try { await cloud.marcarLeida(id) } catch { /* se corrige en la próxima lectura */ } }
  }
  const markAllRead: Ctx['markAllRead'] = async () => {
    patch((s) => ({ notifications: s.notifications.map((n) => ({ ...n, leida: true })) }))
    if (!isDemoMode) { try { await cloud.marcarTodasLeidas() } catch { /* se corrige en la próxima lectura */ } }
  }

  const updateProfile: Ctx['updateProfile'] = async (c) => {
    const aplicar = (p: Profile): Profile => ({
      ...p,
      ...(c.nombreVisible !== undefined ? { nombreVisible: c.nombreVisible } : {}),
      ...(c.departamento !== undefined ? { departamento: c.departamento } : {}),
      ...(c.provincia !== undefined ? { provincia: c.provincia } : {}),
      ...(c.distrito !== undefined ? { distrito: c.distrito } : {}),
      ...(c.rol !== undefined ? { rol: c.rol } : {}),
      ...(c.habilidades !== undefined ? { habilidades: c.habilidades } : {}),
      ...(c.apoyo !== undefined ? { apoyo: c.apoyo } : {}),
      ...(c.horario !== undefined ? { horario: c.horario } : {}),
      ...(c.visibleEnDirectorio !== undefined ? { visibleEnDirectorio: c.visibleEnDirectorio } : {}),
    })
    if (isDemoMode) { patch((s) => ({ profile: aplicar(s.profile) })); return { ok: true, message: 'Cambios guardados.' } }
    try {
      await cloud.actualizarPerfil(stateRef.current.profile.id, c)
      patch((s) => ({ profile: aplicar(s.profile) }))
      await refresh()
      return { ok: true, message: 'Cambios guardados.' }
    } catch (e) { return falla(e) }
  }

  const setRole: Ctx['setRole'] = (r) => { if (isDemoMode) patch((s) => ({ profile: { ...s.profile, rol: r } })) }
  const resetDemo = () => { if (isDemoMode) setState(estadoInicial()) }
  const syncNow = async () => { await refresh(); await flush() }

  return (
    <StoreCtx.Provider
      value={{
        mode: isDemoMode ? 'demo' : 'cloud', authReady, session, online, loading, loadError, pendingCount,
        reports, requests, offers, volunteers: state.volunteers, riskAreas: state.riskAreas, audit: state.audit, history: state.history,
        notifications: state.notifications, posts: state.posts, unread, profile, role, displayName, zone, zoneLabel, center,
        lastUpdated: state.lastUpdated,
        addReport, addRequest, addOffer, setReportStatus, setReportPriority, acceptRequest, setRequestStatus, retireOffer,
        assignVolunteers, addPost, toggleLike, addComment, deletePost, deleteComment, markRead, markAllRead, updateProfile,
        refresh, syncNow, setRole, resetDemo,
      }}
    >
      {children}
    </StoreCtx.Provider>
  )
}

export { isDemoMode, isEmbed }
