import { useState } from 'react'
import { MapPin, Users } from 'lucide-react'
import Screen from '../components/Screen'
import { DemoTag, PriorityPill, StatusPill, SyncBadge } from '../components/Badges'
import { useStore } from '../lib/store'
import { CHACLACAYO, distanceKm, timeAgo } from '../lib/utils'

type Filter = 'todas' | 'urgentes' | 'seguimiento'

export default function NearbyPage() {
  const { requests, acceptRequest, setRequestStatus, role } = useStore()
  const [filter, setFilter] = useState<Filter>('todas')
  const [msg, setMsg] = useState('')

  const list = requests
    .filter((r) => r.estado !== 'Cancelada' && r.estado !== 'Atendida')
    .filter((r) => (filter === 'urgentes' ? r.prioridad === 'Alta' : filter === 'seguimiento' ? r.estado !== 'Pendiente' : true))
    .sort((a, b) => (a.prioridad === b.prioridad ? +new Date(a.createdAt) - +new Date(b.createdAt) : a.prioridad === 'Alta' ? -1 : 1))

  const tabs: [Filter, string][] = [['todas', 'Todas'], ['urgentes', 'Urgentes'], ['seguimiento', 'En seguimiento']]

  return (
    <Screen title="Solicitudes cercanas">
      <div role="tablist" className="mb-3 flex gap-2 lg:max-w-lg">
        {tabs.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}
            className={`min-h-[44px] flex-1 rounded-full text-sm font-semibold ${filter === k ? 'bg-brand-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300'}`}>{l}</button>
        ))}
      </div>
      {msg && <p role="status" className="mb-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">{msg}</p>}
      <ul className="grid gap-3 lg:grid-cols-2">
        {list.length === 0 && <li className="card text-center text-slate-600">No hay solicitudes en esta lista.</li>}
        {list.map((r) => {
          const km = distanceKm(CHACLACAYO, [r.lat, r.lon])
          return (
            <li key={r.id} className="card space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <PriorityPill p={r.prioridad} /> <StatusPill label={r.estado} tone={r.estado === 'Pendiente' ? 'amber' : 'blue'} />
                {r.demo && <DemoTag />}
                <span className="ml-auto text-xs text-slate-500">{timeAgo(r.createdAt)}</span>
              </div>
              <p className="text-lg font-bold">{r.categoria}</p>
              <p>{r.descripcion}</p>
              <p className="flex items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1"><MapPin size={14} />{r.zona} · {km.toFixed(1)} km del centro</span>
                <span className="inline-flex items-center gap-1"><Users size={14} />{r.personas}</span>
              </p>
              {r.sync !== 'enviado' && <SyncBadge sync={r.sync} error={r.syncError} />}
              {r.estado === 'Pendiente' && (
                <button className="btn-primary" onClick={() => setMsg(acceptRequest(r.id).message)}>
                  {role === 'ciudadano' ? 'Quiero ayudar' : 'Aceptar solicitud'}
                </button>
              )}
              {r.acceptedBy && (
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span>Asignada a {r.acceptedBy}</span>
                  <button className="min-h-[44px] rounded-lg px-3 font-semibold text-brand-600 ring-1 ring-brand-600" onClick={() => setRequestStatus(r.id, 'Atendida', 'Cerrada por voluntario')}>Marcar atendida</button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </Screen>
  )
}
