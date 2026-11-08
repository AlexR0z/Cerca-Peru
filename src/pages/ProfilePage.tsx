import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, HandHeart, HeartHandshake, LogIn, LogOut } from 'lucide-react'
import Screen from '../components/Screen'
import ZonePicker from '../components/ZonePicker'
import { SyncBadge } from '../components/Badges'
import { useStore, isDemoMode } from '../lib/store'
import * as auth from '../lib/auth'
import type { Zona } from '../lib/geo'
import type { Role } from '../types'

const HABILIDADES = ['Transporte', 'Logística', 'Primeros auxilios', 'Alimentos', 'Búsqueda y rescate', 'Apoyo psicológico', 'Construcción', 'Comunicaciones']

export default function ProfilePage() {
  const { profile, reports, requests, offers, role, setRole, resetDemo, updateProfile, session, unread, lastUpdated } = useStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [zona, setZona] = useState<Zona>({ departamento: profile.departamento, provincia: profile.provincia, distrito: profile.distrito })
  const [visible, setVisible] = useState(profile.nombreVisible)
  const [esVoluntario, setEsVoluntario] = useState(profile.rol === 'voluntario')
  const [habilidades, setHabilidades] = useState<string[]>(profile.habilidades)
  const [apoyo, setApoyo] = useState(profile.apoyo)
  const [horario, setHorario] = useState(profile.horario)
  const [msg, setMsg] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Los datos del servidor llegan después de abrir la pantalla: se rellenan una sola vez.
  useEffect(() => {
    setZona({ departamento: profile.departamento, provincia: profile.provincia, distrito: profile.distrito })
    setVisible(profile.nombreVisible); setEsVoluntario(profile.rol === 'voluntario')
    setHabilidades(profile.habilidades); setApoyo(profile.apoyo); setHorario(profile.horario)
  }, [profile.id, profile.departamento, profile.distrito, profile.nombreVisible, profile.rol]) // eslint-disable-line react-hooks/exhaustive-deps

  const mias = {
    reportes: reports.filter((r) => r.mine),
    solicitudes: requests.filter((r) => r.mine),
    ofertas: offers.filter((o) => o.mine),
  }
  const soloDemo = isDemoMode

  const guardar = async () => {
    if (visible.trim().length < 2 || visible.trim().length > 30) return setMsg('El nombre visible debe tener entre 2 y 30 caracteres.')
    if (!zona.distrito) return setMsg('Elige tu departamento, provincia y distrito.')
    setGuardando(true)
    const rol: Role | undefined = profile.rol === 'coordinador' ? undefined : esVoluntario ? 'voluntario' : 'ciudadano'
    const r = await updateProfile({
      nombreVisible: visible.trim(), departamento: zona.departamento, provincia: zona.provincia, distrito: zona.distrito,
      ...(rol ? { rol, habilidades, apoyo: apoyo.trim(), horario: horario.trim() } : {}),
    })
    setGuardando(false)
    setMsg(r.message)
  }

  return (
    <Screen title="Mi perfil" width="narrow">
      {params.get('bienvenida') && (
        <p role="status" className="mb-3 rounded-lg border-[3px] border-ink bg-turq p-3 text-sm font-bold text-ink shadow-brut-sm">
          ¡Bienvenido/a! Elige tu ubicación abajo para ver lo que pasa cerca de ti.
        </p>
      )}
      <div className="card text-center">
        <div aria-hidden className="mx-auto flex h-20 w-20 items-center justify-center rounded-lg border-[3px] border-ink bg-inti font-display text-3xl text-ink shadow-brut-sm">{(profile.nombreVisible || '?')[0]}</div>
        <p className="mt-2 text-xl font-bold">{profile.nombreVisible || 'Vecino/a'}</p>
        <p className="capitalize text-slate-600">{role} · {profile.distrito ? `${profile.distrito}, ${profile.departamento}` : 'Sin ubicación'}</p>
        {session?.email && <p className="text-xs text-slate-500">{session.email}</p>}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="card text-center"><HandHeart className="mx-auto text-brand-600" /><p className="text-2xl font-extrabold">{mias.ofertas.length}</p><p className="text-xs text-slate-600">Ayudas ofrecidas</p></div>
        <div className="card text-center"><HeartHandshake className="mx-auto text-brand-600" /><p className="text-2xl font-extrabold">{mias.solicitudes.length}</p><p className="text-xs text-slate-600">Solicitudes mías</p></div>
        <div className="card text-center"><p className="font-display text-2xl text-brand-600">{profile.puntos}</p><p className="text-xs text-slate-600">Puntos solidarios</p></div>
      </div>

      <Link to="/notificaciones" className="btn-outline mt-3"><Bell size={20} /> Avisos {unread > 0 ? `(${unread} nuevos)` : ''}</Link>

      <section className="card mt-4 space-y-3">
        <h2 className="font-bold">Mis datos</h2>
        <div>
          <label htmlFor="vis" className="label">Nombre visible</label>
          <input id="vis" className="field" maxLength={30} value={visible} onChange={(e) => setVisible(e.target.value)} />
        </div>
        <h3 className="label">Mi ubicación</h3>
        <ZonePicker value={zona} onChange={setZona} />
        {profile.rol !== 'coordinador' && (
          <div className="space-y-3 border-t-2 border-dashed border-ink pt-3">
            <label className="flex min-h-[44px] items-center gap-3 font-bold">
              <input type="checkbox" className="h-6 w-6" checked={esVoluntario} onChange={(e) => setEsVoluntario(e.target.checked)} />
              Quiero ser voluntario/a
            </label>
            {esVoluntario && (
              <>
                <p className="text-sm text-slate-600">Solo se verán tu nombre visible, tu distrito y lo que escribas aquí. Nunca tu teléfono ni tu dirección.</p>
                <div className="flex flex-wrap gap-2">
                  {HABILIDADES.map((h) => (
                    <button key={h} type="button" aria-pressed={habilidades.includes(h)} className="chip" onClick={() => setHabilidades((l) => (l.includes(h) ? l.filter((x) => x !== h) : [...l, h]))}>{h}</button>
                  ))}
                </div>
                <div><label htmlFor="apo" className="label">¿En qué puedes ayudar?</label><input id="apo" className="field" maxLength={200} value={apoyo} onChange={(e) => setApoyo(e.target.value)} /></div>
                <div><label htmlFor="hor" className="label">Horario</label><input id="hor" className="field" maxLength={80} value={horario} onChange={(e) => setHorario(e.target.value)} placeholder="Ej.: tardes y fines de semana" /></div>
              </>
            )}
          </div>
        )}
        <button className="btn-primary" disabled={guardando} onClick={() => void guardar()}>{guardando ? 'Guardando…' : 'Guardar cambios'}</button>
        {msg && <p role="status" className="text-sm font-bold">{msg}</p>}
      </section>

      <h2 className="mb-2 mt-5 text-lg font-bold">Mis publicaciones</h2>
      <ul className="card space-y-2 text-sm">
        {mias.reportes.length + mias.solicitudes.length + mias.ofertas.length === 0 && <li className="text-slate-500">Todavía no publicaste nada.</li>}
        {mias.reportes.map((r) => <li key={r.id} className="flex justify-between gap-2"><span>Reporte {r.code === 'Pendiente' ? '' : r.code}: {r.tipo} ({r.estado})</span><SyncBadge sync={r.sync} error={r.syncError} /></li>)}
        {mias.solicitudes.map((r) => <li key={r.id} className="flex justify-between gap-2"><span>Solicitud {r.code === 'Pendiente' ? '' : r.code}: {r.categoria} ({r.estado})</span><SyncBadge sync={r.sync} error={r.syncError} /></li>)}
        {mias.ofertas.map((o) => <li key={o.id} className="flex justify-between gap-2"><span>Oferta: {o.categoria} ({o.estado})</span><SyncBadge sync={o.sync} error={o.syncError} /></li>)}
      </ul>

      <Link to="/tutorial" className="btn-outline mt-4">Ver tutorial</Link>

      {soloDemo ? (
        <section className="card mt-5 space-y-3 border-dashed bg-crema">
          <h2 className="font-bold">Herramientas de demostración</h2>
          <p className="text-sm text-slate-600">Solo existen en modo demo. Con la cuenta real, el rol de coordinador lo asigna el equipo desde la base de datos.</p>
          <label htmlFor="role" className="label">Probar como…</label>
          <select id="role" className="field" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="ciudadano">Ciudadano</option>
            <option value="voluntario">Voluntario</option>
            <option value="coordinador">Coordinador</option>
          </select>
          <button className="btn-outline" onClick={() => { if (confirm('Se borrarán tus datos de prueba en este dispositivo. ¿Continuar?')) resetDemo() }}>Reiniciar datos de demostración</button>
        </section>
      ) : (
        <section className="card mt-5 space-y-3">
          <h2 className="font-bold">Cuenta</h2>
          <p className="text-sm text-slate-600">Es la misma cuenta que usas en la app móvil de Perú Vive.</p>
          {session ? (
            <button className="btn-outline" onClick={async () => { await auth.salir(); navigate('/acceso') }}><LogOut size={20} /> Cerrar sesión</button>
          ) : (
            <Link to="/acceso" className="btn-primary"><LogIn size={20} /> Iniciar sesión</Link>
          )}
        </section>
      )}

      <section className="mt-5 text-xs text-slate-500">
        <h2 className="font-semibold text-slate-700">Privacidad</h2>
        <p>Pedimos permiso antes de usar tu ubicación. En los mapas públicos solo mostramos una ubicación aproximada y nunca tu teléfono, dirección ni datos médicos.</p>
        <p className="mt-2">Datos actualizados: {new Date(lastUpdated).toLocaleString('es-PE')}</p>
      </section>
    </Screen>
  )
}
