/**
 * Conexión con la base de datos compartida de Perú Vive (Supabase): la misma que usa la app móvil.
 * Aquí se leen y escriben las tablas del esquema `supabase/001-esquema.sql` (y `003-comunidad.sql` para
 * comentarios y fotos de la comunidad). Todo lo privado (dirección escrita, teléfono, autoría de
 * reportes ajenos) lo filtran las vistas públicas y las políticas RLS del servidor, no esta app.
 */
import { supabase } from './supabase'
import type {
  AppNotification, EmergencyReport, HelpRequest, Post, PostComment, Priority, Profile, ResourceOffer, Role,
  StatusChange, Volunteer, ReportStatus, HelpStatus, ReportType,
} from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

export const SEPARADOR = ' — '

export function cliente() {
  if (!supabase) throw new Error('La app está en modo demostración.')
  return supabase
}

/* ============ Errores en español ============ */
export function traducir(e: { message?: string; code?: string; status?: number } | null | undefined): string {
  if (!e) return 'No se pudo completar la acción.'
  const msg = e.message ?? ''
  const mapa: [RegExp, string][] = [
    [/invalid login credentials/i, 'Correo o contraseña incorrectos.'],
    [/email not confirmed/i, 'Confirma tu correo antes de ingresar.'],
    [/user already registered|already been registered/i, 'Ya existe una cuenta con ese correo.'],
    [/password should be at least|weak password/i, 'La contraseña es muy débil. Usa al menos 8 caracteres.'],
    [/token has expired|otp.*expired|invalid.*token|otp_expired/i, 'El código es incorrecto o ya venció. Pide uno nuevo.'],
    [/rate limit|too many requests|over_email_send_rate_limit/i, 'Demasiados intentos. Espera un minuto e inténtalo otra vez.'],
    [/new password should be different/i, 'La nueva contraseña debe ser distinta a la actual.'],
    [/unable to validate email|invalid email/i, 'Ese correo no es válido.'],
    [/failed to fetch|network|load failed/i, 'No se pudo conectar. Revisa tu internet e inténtalo de nuevo.'],
    [/jwt expired/i, 'Tu sesión venció. Inicia sesión de nuevo.'],
    [/Error sending|sending (confirmation|recovery)/i, 'No pudimos enviar el correo. Inténtalo más tarde.'],
  ]
  for (const [re, txt] of mapa) if (re.test(msg)) return txt
  const porCodigo: Record<string, string> = {
    '42501': 'No tienes permiso para hacer esto.',
    '23505': 'Ese registro ya existe.',
    '23514': 'Algún dato no es válido. Revísalo e inténtalo de nuevo.',
    '22P02': 'Algún dato no tiene el formato correcto.',
    PGRST301: 'Tu sesión venció. Inicia sesión de nuevo.',
  }
  if (e.code && porCodigo[e.code]) return porCodigo[e.code]
  if (e.code === 'P0001' && msg) return msg // mensajes que la base ya escribe en español
  if (e.status === 429) return 'Demasiados intentos. Espera un minuto e inténtalo otra vez.'
  return msg || 'No se pudo completar la acción.'
}

/** Ejecuta una consulta y lanza un Error con mensaje en español si falla. */
async function ok<T = Row[]>(p: PromiseLike<{ data: unknown; error: { message?: string; code?: string } | null }>): Promise<T> {
  const { data, error } = await p
  if (error) {
    const e = new Error(traducir(error)) as Error & { code?: string }
    e.code = error.code
    throw e
  }
  return data as T
}

/* ============ Conversión servidor → app ============ */
const NIVEL_A_PRIORIDAD: Record<string, Priority> = { Alto: 'Alta', Medio: 'Media', Bajo: 'Baja' }
export const PRIORIDAD_A_NIVEL: Record<Priority, string> = { Alta: 'Alto', Media: 'Medio', Baja: 'Bajo' }
const num = (v: unknown) => (v === null || v === undefined ? null : Number(v))

const aReporte = (r: Row, uid: string, propio: boolean): EmergencyReport => ({
  id: r.id, clientId: r.client_id ?? r.id, code: r.codigo, tipo: r.tipo, descripcion: r.descripcion, estado: r.estado,
  prioridad: NIVEL_A_PRIORIDAD[r.nivel] ?? 'Media', distrito: r.distrito ?? '', referencia: r.ubicacion_texto ?? undefined,
  fotoRuta: r.foto_ruta ?? undefined, lat: num(r.lat_aprox), lon: num(r.lon_aprox), createdAt: r.creado_en,
  verifiedAt: r.revisado_en ?? undefined, sync: 'enviado', mine: propio || (r.usuario_id !== undefined && r.usuario_id === uid),
})

const aSolicitud = (s: Row, uid: string, propio: boolean, apoyadas: Set<string>): HelpRequest => ({
  id: s.id, clientId: s.client_id ?? s.id, code: s.codigo, categoria: s.tipo_ayuda, descripcion: s.detalles ?? '',
  personas: s.numero_personas ?? 1, distrito: s.distrito ?? '', referencia: s.ubicacion_texto ?? undefined, estado: s.estado,
  apoyos: 0, yoApoyo: apoyadas.has(s.id), lat: num(s.lat_aprox), lon: num(s.lon_aprox), createdAt: s.creado_en,
  sync: 'enviado', mine: propio || (s.usuario_id !== undefined && s.usuario_id === uid),
})

/** La descripción de una oferta viaja dentro de `disponibilidad` ("Hoy — 10 cajas de agua"), porque la tabla no tiene otro campo. */
export function unirOferta(cuando: string, descripcion: string): string {
  return (descripcion ? `${cuando}${SEPARADOR}${descripcion}` : cuando).slice(0, 120)
}
function partirOferta(texto: string | null | undefined): { disponibilidad: string; descripcion: string } {
  const t = texto ?? ''
  const i = t.indexOf(SEPARADOR)
  return i < 0 ? { disponibilidad: t, descripcion: '' } : { disponibilidad: t.slice(0, i), descripcion: t.slice(i + SEPARADOR.length) }
}
const aOferta = (o: Row, propio: boolean): ResourceOffer => {
  const p = partirOferta(o.disponibilidad)
  return {
    id: o.id, clientId: o.client_id ?? o.id, categoria: o.tipo_apoyo, descripcion: p.descripcion, disponibilidad: p.disponibilidad,
    distrito: o.distrito ?? '', estado: o.pausada ? 'Pausada' : 'Disponible', lat: null, lon: null, createdAt: o.creado_en,
    sync: 'enviado', mine: propio,
  }
}

/** Rutas de la app móvil → rutas de esta app. */
function rutaWeb(ruta: string | null | undefined): string {
  switch (ruta) {
    case 'historial': case 'perfil': return '/perfil'
    case 'seguimiento': case 'solicitudes': return '/solicitudes'
    case 'comunidad': return '/comunidad'
    case 'mapa': return '/mapa'
    default: return '/notificaciones'
  }
}

export function urlFotoComunidad(ruta: string): string {
  return cliente().storage.from('fotos-comunidad').getPublicUrl(ruta).data.publicUrl
}

/* ============ Lectura ============ */
export interface Snapshot {
  profile: Profile
  reports: EmergencyReport[]
  requests: HelpRequest[]
  offers: ResourceOffer[]
  volunteers: Volunteer[]
  notifications: AppNotification[]
  posts: Post[]
  history: StatusChange[]
}

export async function descargarTodo(uid: string, correo: string): Promise<Snapshot> {
  const sb = cliente()
  const perfiles = await ok<Row[]>(sb.from('perfiles').select('*').eq('id', uid))
  const p = perfiles[0]
  if (!p) throw new Error('No encontramos tu perfil. Cierra sesión y vuelve a entrar.')
  const coordina = p.rol === 'coordinador'

  const desc = { ascending: false }
  const [misReportes, misSolicitudes, misOfertas, notis, vols, pubs, apoyos, comentarios] = await Promise.all([
    ok<Row[]>(sb.from('reportes').select('*').eq('usuario_id', uid).order('creado_en', desc)),
    ok<Row[]>(sb.from('solicitudes').select('*').eq('usuario_id', uid).order('creado_en', desc)),
    ok<Row[]>(sb.from('ofertas').select('*').eq('usuario_id', uid).order('creado_en', desc)),
    ok<Row[]>(sb.from('notificaciones').select('*').order('creado_en', desc).limit(50)),
    ok<Row[]>(sb.from('directorio_voluntarios').select('*').limit(100)),
    ok<Row[]>(sb.from('publicaciones_con_autor').select('*').order('creado_en', desc).limit(40)),
    ok<Row[]>(sb.from('apoyos').select('solicitud_id').eq('usuario_id', uid)),
    // Los comentarios necesitan el ajuste 003; si aún no se ejecutó, la app sigue sin ellos.
    Promise.resolve(sb.from('comentarios_con_autor').select('*').order('creado_en', { ascending: true }).limit(500))
      .then((r) => (r.error ? [] : (r.data as Row[])), () => [] as Row[]),
  ])
  const apoyadas = new Set(apoyos.map((a) => a.solicitud_id as string))

  // Coordinación ve todo (con dirección escrita); el resto solo ve las vistas públicas.
  const [todosReportes, todasSolicitudes, ofertasAjenas, historial] = coordina
    ? await Promise.all([
        ok<Row[]>(sb.from('reportes').select('*').order('creado_en', desc).limit(300)),
        ok<Row[]>(sb.from('solicitudes').select('*').order('creado_en', desc).limit(300)),
        ok<Row[]>(sb.from('ofertas_publicas').select('*').order('creado_en', desc).limit(100)),
        ok<Row[]>(sb.from('historial_estados').select('*').order('creado_en', desc).limit(100)),
      ])
    : await Promise.all([
        ok<Row[]>(sb.from('reportes_publicos').select('*').order('creado_en', desc).limit(100)),
        ok<Row[]>(sb.from('solicitudes_cercanas').select('*').order('creado_en', desc).limit(100)),
        ok<Row[]>(sb.from('ofertas_publicas').select('*').order('creado_en', desc).limit(100)),
        Promise.resolve([] as Row[]),
      ])

  const codigosR = new Set(misReportes.map((r) => r.codigo))
  const codigosS = new Set(misSolicitudes.map((s) => s.codigo))
  const idsO = new Set(misOfertas.map((o) => o.id))
  const reports = [
    ...misReportes.map((r) => aReporte(r, uid, true)),
    ...todosReportes.filter((r) => !codigosR.has(r.codigo)).map((r) => aReporte(r, uid, false)),
  ]
  const requests = [
    ...misSolicitudes.map((s) => aSolicitud(s, uid, true, apoyadas)),
    ...todasSolicitudes.filter((s) => !codigosS.has(s.codigo)).map((s) => aSolicitud(s, uid, false, apoyadas)),
  ]
  const offers = [
    ...misOfertas.map((o) => aOferta(o, true)),
    ...ofertasAjenas.filter((o) => !idsO.has(o.id)).map((o) => aOferta(o, false)),
  ]
  const volunteers: Volunteer[] = vols.map((v) => ({
    id: v.id, nombre: v.nombre_visible, habilidades: v.habilidades ?? [], distrito: v.distrito ?? '',
    apoyo: v.apoyo ?? '', horario: v.horario ?? '', ayudas: Number(v.ayudas) || 0,
  }))

  const idACodigo = new Map<string, string>()
  ;[...todosReportes, ...misReportes, ...todasSolicitudes, ...misSolicitudes].forEach((x) => idACodigo.set(x.id, x.codigo))

  const notifications: AppNotification[] = notis.map((n) => ({
    id: n.id, titulo: n.titulo, detalle: n.detalle ?? '', createdAt: n.creado_en, leida: n.leida,
    ruta: rutaWeb(n.ruta), objetivoId: n.objetivo_id ?? undefined,
  }))

  const comentariosDe = new Map<string, PostComment[]>()
  comentarios.forEach((c) => {
    const lista = comentariosDe.get(c.publicacion_id) ?? []
    lista.push({ id: c.id, autor: c.autor, texto: c.texto, createdAt: c.creado_en, mio: c.autor_id === uid })
    comentariosDe.set(c.publicacion_id, lista)
  })
  const posts: Post[] = pubs.map((x) => ({
    id: x.id, autor: x.autor, texto: x.texto, createdAt: x.creado_en, meGusta: Number(x.total_me_gusta) || 0,
    miMeGusta: !!x.me_gusta_mio, fotoRuta: x.foto_ruta ?? undefined, fotoUrl: x.foto_ruta ? urlFotoComunidad(x.foto_ruta) : undefined,
    comentarios: comentariosDe.get(x.id) ?? [], mia: x.autor_id === uid,
  }))

  const history: StatusChange[] = historial.map((h) => ({
    id: String(h.id), at: h.creado_en, entity: idACodigo.get(h.entidad_id) ?? String(h.entidad_id).slice(0, 8),
    from: h.estado_anterior ?? '', to: h.estado_nuevo, by: 'Coordinación',
  }))

  const profile: Profile = {
    id: uid, correo, nombre: p.nombre ?? '', apellido: p.apellido ?? '', nombreVisible: p.nombre_visible,
    departamento: p.departamento ?? '', provincia: p.provincia ?? '', distrito: p.distrito ?? '', puntos: p.puntos ?? 0,
    rol: p.rol as Role, habilidades: p.habilidades ?? [], apoyo: p.apoyo ?? '', horario: p.horario ?? '',
    visibleEnDirectorio: p.visible_en_directorio !== false,
  }
  return { profile, reports, requests, offers, volunteers, notifications, posts, history }
}

/* ============ Escritura: reportes, solicitudes y ofertas ============ */
export type Pushable =
  | { kind: 'report'; item: EmergencyReport }
  | { kind: 'request'; item: HelpRequest }
  | { kind: 'offer'; item: ResourceOffer }

const textoUbicacion = (referencia: string | undefined, distrito: string) =>
  (referencia?.trim() || distrito || 'Ubicación en el mapa').slice(0, 200).padEnd(2, ' ')

/** Envía un elemento. Si ya estaba en el servidor (mismo client_id), se da por enviado. */
export async function enviar(p: Pushable, fotoRuta?: string): Promise<void> {
  const sb = cliente()
  let tabla: string
  let fila: Row
  if (p.kind === 'report') {
    tabla = 'reportes'
    fila = {
      client_id: p.item.clientId, tipo: p.item.tipo, descripcion: p.item.descripcion,
      ubicacion_texto: textoUbicacion(p.item.referencia, p.item.distrito), distrito: p.item.distrito || null,
      lat_aprox: p.item.lat, lon_aprox: p.item.lon, ...(fotoRuta ? { foto_ruta: fotoRuta } : {}),
    }
  } else if (p.kind === 'request') {
    tabla = 'solicitudes'
    fila = {
      client_id: p.item.clientId, tipo_ayuda: p.item.categoria, numero_personas: p.item.personas,
      detalles: p.item.descripcion || null, ubicacion_texto: textoUbicacion(p.item.referencia, p.item.distrito),
      distrito: p.item.distrito || null, lat_aprox: p.item.lat, lon_aprox: p.item.lon,
    }
  } else {
    tabla = 'ofertas'
    fila = {
      client_id: p.item.clientId, tipo_apoyo: p.item.categoria, disponibilidad: unirOferta(p.item.disponibilidad, p.item.descripcion),
      distrito: p.item.distrito || null,
    }
  }
  const { error } = await sb.from(tabla).insert(fila)
  if (error && error.code !== '23505') throw new Error(traducir(error))
}

export async function cambiarEstadoReporte(id: string, estado: ReportStatus): Promise<void> {
  await actualizarUna('reportes', id, { estado })
}
export async function cambiarNivelReporte(id: string, prioridad: Priority): Promise<void> {
  await actualizarUna('reportes', id, { nivel: PRIORIDAD_A_NIVEL[prioridad] })
}
export async function cambiarEstadoSolicitud(id: string, estado: HelpStatus): Promise<void> {
  await actualizarUna('solicitudes', id, { estado })
}
/** Si ninguna fila cambió, el servidor la rechazó por permisos: se avisa. */
async function actualizarUna(tabla: string, id: string, cambios: Row): Promise<void> {
  const data = await ok<Row[]>(cliente().from(tabla).update(cambios).eq('id', id).select('id'))
  if (!data || data.length === 0) throw new Error('No tienes permiso para hacer este cambio.')
}

export async function apoyarSolicitud(id: string): Promise<void> {
  await ok(cliente().rpc('apoyar_solicitud', { p_solicitud: id }))
}
export async function asignarVoluntarios(tipo: 'reporte' | 'solicitud', id: string, voluntarios: string[]): Promise<number> {
  return Number(await ok<number>(cliente().rpc('asignar_voluntarios', { p_tipo: tipo, p_id: id, p_voluntarios: voluntarios })))
}
export async function retirarOferta(id: string): Promise<void> {
  await ok(cliente().from('ofertas').delete().eq('id', id))
}
export async function pausarOferta(id: string, pausada: boolean): Promise<void> {
  await actualizarUna('ofertas', id, { pausada })
}

/* ============ Fotos ============ */
/** Sube una foto JPG ya reducida a la carpeta de la persona y devuelve su ruta. */
export async function subirFoto(bucket: 'fotos-reportes' | 'fotos-comunidad', uid: string, blob: Blob): Promise<string> {
  const ruta = `${uid}/${crypto.randomUUID()}.jpg`
  const { error } = await cliente().storage.from(bucket).upload(ruta, blob, { contentType: 'image/jpeg' })
  if (error) {
    if (/bucket not found/i.test(error.message)) throw new Error('Las fotos aún no están activadas en el servidor (falta ejecutar 003-comunidad.sql).')
    throw new Error('No se pudo subir la foto.')
  }
  return ruta
}
export async function borrarFoto(bucket: 'fotos-reportes' | 'fotos-comunidad', ruta: string): Promise<void> {
  await cliente().storage.from(bucket).remove([ruta])
}
export async function urlFirmada(bucket: 'fotos-reportes', ruta: string): Promise<string | null> {
  const { data } = await cliente().storage.from(bucket).createSignedUrl(ruta, 600)
  return data?.signedUrl ?? null
}

/* ============ Comunidad ============ */
export async function publicar(texto: string, fotoRuta?: string): Promise<void> {
  await ok(cliente().from('publicaciones').insert(fotoRuta ? { texto, foto_ruta: fotoRuta } : { texto }))
}
export async function darMeGusta(postId: string): Promise<void> {
  const { error } = await cliente().from('me_gusta').insert({ publicacion_id: postId })
  if (error && error.code !== '23505') throw new Error(traducir(error))
}
export async function quitarMeGusta(postId: string, uid: string): Promise<void> {
  await ok(cliente().from('me_gusta').delete().eq('publicacion_id', postId).eq('usuario_id', uid))
}
export async function comentar(postId: string, texto: string): Promise<void> {
  await ok(cliente().from('comentarios').insert({ publicacion_id: postId, texto }))
}
export async function borrarPublicacion(postId: string): Promise<void> {
  await ok(cliente().from('publicaciones').delete().eq('id', postId))
}
export async function borrarComentario(id: string): Promise<void> {
  await ok(cliente().from('comentarios').delete().eq('id', id))
}

/* ============ Avisos y perfil ============ */
export async function marcarLeida(id: string): Promise<void> {
  await ok(cliente().from('notificaciones').update({ leida: true }).eq('id', id))
}
export async function marcarTodasLeidas(): Promise<void> {
  await ok(cliente().from('notificaciones').update({ leida: true }).eq('leida', false))
}

export interface CambiosPerfil {
  nombreVisible?: string
  departamento?: string
  provincia?: string
  distrito?: string
  rol?: Role
  habilidades?: string[]
  apoyo?: string
  horario?: string
  visibleEnDirectorio?: boolean
}
export async function actualizarPerfil(uid: string, c: CambiosPerfil): Promise<void> {
  const fila: Row = {}
  if (c.nombreVisible !== undefined) fila.nombre_visible = c.nombreVisible
  if (c.departamento !== undefined) fila.departamento = c.departamento || null
  if (c.provincia !== undefined) fila.provincia = c.provincia || null
  if (c.distrito !== undefined) fila.distrito = c.distrito || null
  if (c.rol !== undefined) fila.rol = c.rol
  if (c.habilidades !== undefined) fila.habilidades = c.habilidades
  if (c.apoyo !== undefined) fila.apoyo = c.apoyo || null
  if (c.horario !== undefined) fila.horario = c.horario || null
  if (c.visibleEnDirectorio !== undefined) fila.visible_en_directorio = c.visibleEnDirectorio
  if (Object.keys(fila).length === 0) return
  await actualizarUna('perfiles', uid, fila)
}

export type { ReportType }
