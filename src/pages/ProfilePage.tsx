import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HandHeart, HeartHandshake, LogOut, Mail } from 'lucide-react'
import Screen from '../components/Screen'
import { SyncBadge } from '../components/Badges'
import { useStore, isDemoMode } from '../lib/store'
import { supabase } from '../lib/supabase'
import type { Role } from '../types'

export default function ProfilePage() {
  const { displayName, role, setRole, requests, offers, reports, resetDemo, lastUpdated } = useStore()
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')

  const mineRequests = requests.filter((r) => !r.demo)
  const mineOffers = offers.filter((o) => !o.demo)
  const mineReports = reports.filter((r) => !r.demo)

  const signIn = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
    setMsg(error ? `No pudimos enviar el enlace: ${error.message}` : 'Te enviamos un enlace a tu correo. Ábrelo en este dispositivo.')
  }

  return (
    <Screen title="Mi perfil" width="narrow">
      <div className="card text-center">
        <div aria-hidden className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700">{displayName[0]}</div>
        <p className="mt-2 text-xl font-bold">{displayName}</p>
        <p className="capitalize text-slate-600">{role} · Chaclacayo</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="card text-center"><HandHeart className="mx-auto text-brand-600" /><p className="text-2xl font-extrabold">{mineOffers.length}</p><p className="text-sm text-slate-600">Ayudas ofrecidas</p></div>
        <div className="card text-center"><HeartHandshake className="mx-auto text-brand-600" /><p className="text-2xl font-extrabold">{mineRequests.length}</p><p className="text-sm text-slate-600">Solicitudes mías</p></div>
      </div>

      <h2 className="mb-2 mt-5 text-lg font-bold">Mis publicaciones</h2>
      <ul className="card space-y-2 text-sm">
        {mineReports.length + mineRequests.length + mineOffers.length === 0 && <li className="text-slate-500">Todavía no publicaste nada.</li>}
        {mineReports.map((r) => <li key={r.id} className="flex justify-between gap-2"><span>Reporte {r.code}: {r.tipo}</span><SyncBadge sync={r.sync} error={r.syncError} /></li>)}
        {mineRequests.map((r) => <li key={r.id} className="flex justify-between gap-2"><span>Solicitud: {r.categoria} ({r.estado})</span><SyncBadge sync={r.sync} error={r.syncError} /></li>)}
        {mineOffers.map((o) => <li key={o.id} className="flex justify-between gap-2"><span>Oferta: {o.categoria} ({o.estado})</span><SyncBadge sync={o.sync} error={o.syncError} /></li>)}
      </ul>

      <Link to="/tutorial" className="btn-outline mt-4">Ver tutorial</Link>

      {isDemoMode ? (
        <section className="card mt-5 space-y-3 border-2 border-dashed border-amber-400">
          <h2 className="font-bold">Herramientas de demostración</h2>
          <p className="text-sm text-slate-600">Solo existen en modo demo. Con Supabase, el rol lo asigna un administrador en el servidor.</p>
          <label htmlFor="role" className="label">Probar como…</label>
          <select id="role" className="field" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="ciudadano">Ciudadano</option>
            <option value="voluntario">Voluntario</option>
            <option value="coordinador">Coordinador</option>
            <option value="administrador">Administrador</option>
          </select>
          <button className="btn-outline" onClick={() => { if (confirm('Se borrarán tus datos de prueba en este dispositivo. ¿Continuar?')) resetDemo() }}>Reiniciar datos de demostración</button>
        </section>
      ) : (
        <section className="card mt-5 space-y-3">
          <h2 className="font-bold">Cuenta</h2>
          <label htmlFor="em" className="label">Correo electrónico</label>
          <input id="em" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn-primary" disabled={!email} onClick={() => void signIn()}><Mail size={20} /> Enviarme un enlace para entrar</button>
          <button className="btn-outline" onClick={() => void supabase?.auth.signOut()}><LogOut size={20} /> Cerrar sesión</button>
          {msg && <p role="status" className="text-sm">{msg}</p>}
        </section>
      )}

      <section className="mt-5 text-xs text-slate-500">
        <h2 className="font-semibold text-slate-700">Privacidad</h2>
        <p>Pedimos permiso antes de usar tu ubicación. En mapas públicos solo mostramos una ubicación aproximada y nunca tu teléfono, dirección ni datos médicos.</p>
        <p className="mt-2">Datos guardados en este dispositivo: {new Date(lastUpdated).toLocaleString('es-PE')}</p>
      </section>
    </Screen>
  )
}
