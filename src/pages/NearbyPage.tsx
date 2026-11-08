import { useState } from 'react'
import { MapPin, Users } from 'lucide-react'
import Screen from '../components/Screen'
import { DemoTag, PriorityPill, StatusPill, SyncBadge } from '../components/Badges'
import { useStore } from '../lib/store'
import { distanceKm, timeAgo } from '../lib/utils'
import type { HelpStatus } from '../types'

type Filter = 'todas' | 'nuevas' | 'seguimiento' | 'mias'

const TONO: Record<HelpStatus, 'amber' | 'blue' | 'green' | 'slate'> = {
  Activa: 'amber', 'En coordinación': 'blue', 'En atención': 'blue', Atendida: 'green', Cancelada: 'slate',
}

export default function NearbyPage() {
  const { requests, acceptRequest, setRequestStatus, role, center } = useStore()
  const [filter, setFilter] = useState<Filter>('todas')
  const [msg, setMsg] = useState('')
  const [bad, setBad] = useState(false)

  const aviso = (r: { ok: boolean; message: string }) => { setMsg(r.message); setBad(!r.ok) }
  const activas = (e: HelpStatus) => e !== 'Cancelada' && e !== 'Atendida'

  const list = requests
    .filter((r) => (filter === 'mias' ? !!r.mine : activas(r.estado)))
    .filter((r) => (filter === 'nuevas' ? r.estado === 'Activa' : filter === 'seguimiento' ? r.estado !== 'Activa' : true))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

  const tabs: [Filter, string][] = [['todas', 'Todas'], ['nuevas', 'Nuevas'], ['seguimiento', 'En seguimiento'], ['mias', 'Mías']]

  return (
    <Screen title="Solicitudes cercanas">
      <div role="tablist" className="mb-3 flex flex-wrap gap-2 lg:max-w-xl">
        {tabs.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}
            className="tab">{l}</button>
        ))}
      </div>
      {msg && <p role="status" className={`mb-3 rounded-lg border-[3px] border-ink p-3 text-sm font-bold text-ink shadow-brut-sm ${bad ? 'bg-[#ffd9dc]' : 'bg-turq'}`}>{msg}</p>}
      <ul className="grid gap-3 lg:grid-cols-2">
        {list.length === 0 && <li className="card text-center text-slate-600">No hay solicitudes en esta lista.</li>}
        {list.map((r) => {
          const km = r.lat !== null && r.lon !== null ? distanceKm(center, [r.lat, r.lon]) : null
          const puedeApoyar = !r.mine && activas(r.estado) && !r.yoApoyo
          return (
            <li key={r.id} className="card space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {r.prioridad && <PriorityPill p={r.prioridad} />} <StatusPill label={r.estado} tone={TONO[r.estado]} />
                {r.mine && <StatusPill label="Mía" tone="green" />}
                {r.demo && <DemoTag />}
                <span className="ml-auto text-xs text-slate-500">{timeAgo(r.createdAt)}</span>
              </div>
              <p className="text-lg font-bold">{r.categoria}</p>
              {r.descripcion && <p>{r.descripcion}</p>}
              <p className="flex items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1"><MapPin size={14} />{r.distrito || 'Zona sin indicar'}{km !== null ? ` · ${km.toFixed(1)} km de tu zona` : ''}</span>
                <span className="inline-flex items-center gap-1"><Users size={14} />{r.personas}</span>
              </p>
              {r.referencia && (r.mine || role === 'coordinador') && <p className="text-sm text-slate-600">Referencia: {r.referencia}</p>}
              {r.sync !== 'enviado' && <SyncBadge sync={r.sync} error={r.syncError} />}
              {puedeApoyar && (
                <button className="btn-primary" onClick={async () => aviso(await acceptRequest(r.id))}>
                  {role === 'ciudadano' ? 'Quiero ayudar' : 'Aceptar solicitud'}
                </button>
              )}
              {r.yoApoyo && <p className="text-sm font-bold text-green-800">Te comprometiste a apoyar esta solicitud.</p>}
              {r.mine && r.estado === 'Activa' && r.sync === 'enviado' && (
                <button className="min-h-[44px] rounded-lg border-[3px] border-ink bg-white px-3 font-extrabold text-ink shadow-brut-sm" onClick={async () => aviso(await setRequestStatus(r.id, 'Cancelada', 'Cancelada por quien la pidió'))}>Cancelar mi solicitud</button>
              )}
              {role === 'coordinador' && activas(r.estado) && r.sync === 'enviado' && (
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span>Coordinación</span>
                  <button className="min-h-[44px] rounded-lg border-[3px] border-ink bg-white px-3 font-extrabold text-ink shadow-brut-sm" onClick={async () => aviso(await setRequestStatus(r.id, 'Atendida', 'Cerrada por coordinación'))}>Marcar atendida</button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </Screen>
  )
}
