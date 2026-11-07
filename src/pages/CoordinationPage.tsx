import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, HeartHandshake, Package, CheckCheck } from 'lucide-react'
import Screen from '../components/Screen'
import { DemoTag, PriorityPill, StatusPill } from '../components/Badges'
import { useStore } from '../lib/store'
import { REPORT_STATUSES, type Priority, type ReportStatus } from '../types'
import { formatDateTime, timeAgo } from '../lib/utils'

export default function CoordinationPage() {
  const { role, reports, requests, offers, audit, history, setReportStatus, setReportPriority } = useStore()
  const [filter, setFilter] = useState<ReportStatus | 'todos'>('todos')
  const [note, setNote] = useState<Record<string, string>>({})

  // Esta pantalla es solo de interfaz. La seguridad real la imponen las políticas RLS del backend.
  if (role !== 'coordinador' && role !== 'administrador') {
    return (
      <Screen title="Centro de coordinación">
        <div className="card text-center">
          <p className="text-lg font-bold">Acceso solo para coordinación</p>
          <p className="mt-1 text-slate-600">Tu cuenta no tiene este rol. Los roles los asigna un administrador.</p>
          <Link to="/perfil" className="btn-outline mt-4">Ir a mi perfil</Link>
        </div>
      </Screen>
    )
  }

  const kpis = [
    { label: 'Reportes recibidos', value: reports.length, icon: AlertTriangle, tone: 'bg-brand-50 text-brand-700' },
    { label: 'Solicitudes pendientes', value: requests.filter((r) => r.estado === 'Pendiente').length, icon: HeartHandshake, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Apoyos confirmados', value: requests.filter((r) => r.estado === 'En contacto' || r.estado === 'Apoyo confirmado').length, icon: CheckCheck, tone: 'bg-purple-50 text-purple-700' },
    { label: 'Recursos disponibles', value: offers.filter((o) => o.estado === 'Disponible').length, icon: Package, tone: 'bg-green-50 text-green-700' },
    { label: 'Casos resueltos', value: reports.filter((r) => r.estado === 'Resuelto').length + requests.filter((r) => r.estado === 'Atendida').length, icon: CheckCheck, tone: 'bg-slate-100 text-slate-700' },
  ]

  const list = reports.filter((r) => filter === 'todos' || r.estado === filter)

  return (
    <Screen title="Centro de coordinación" subtitle="Chaclacayo">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {kpis.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className={`rounded-2xl p-3 ${tone}`}>
            <Icon size={20} aria-hidden />
            <p className="text-3xl font-extrabold">{value}</p>
            <p className="text-xs font-medium">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-2 mt-5 text-lg font-bold">Reportes</h2>
      <label htmlFor="f" className="sr-only">Filtrar por estado</label>
      <select id="f" className="field mb-3 lg:max-w-xs" value={filter} onChange={(e) => setFilter(e.target.value as ReportStatus | 'todos')}>
        <option value="todos">Todos los estados</option>
        {REPORT_STATUSES.map((s) => <option key={s}>{s}</option>)}
      </select>
      <ul className="grid gap-3 lg:grid-cols-2">
        {list.map((r) => (
          <li key={r.id} className="card space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold">{r.tipo}</span> <span className="text-sm text-slate-500">{r.code}</span> {r.demo && <DemoTag />}
              <span className="ml-auto text-xs text-slate-500">{timeAgo(r.createdAt)}</span>
            </div>
            <p>{r.descripcion}</p>
            <div className="flex items-center gap-2"><PriorityPill p={r.prioridad} /><StatusPill label={r.estado} tone={r.estado === 'Verificado por coordinador' ? 'green' : 'amber'} /></div>
            {r.verifiedBy && <p className="text-xs text-slate-500">Verificado por {r.verifiedBy} el {formatDateTime(r.verifiedAt!)}</p>}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor={`s-${r.id}`} className="text-xs font-semibold">Estado</label>
                <select id={`s-${r.id}`} className="field py-2" value={r.estado} onChange={(e) => setReportStatus(r.id, e.target.value as ReportStatus, note[r.id])}>
                  {REPORT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor={`p-${r.id}`} className="text-xs font-semibold">Prioridad</label>
                <select id={`p-${r.id}`} className="field py-2" value={r.prioridad} onChange={(e) => setReportPriority(r.id, e.target.value as Priority)}>
                  {(['Alta', 'Media', 'Baja'] as Priority[]).map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <input aria-label="Nota interna" className="field py-2 text-sm" placeholder="Nota interna (se guarda al cambiar estado)" value={note[r.id] ?? ''} onChange={(e) => setNote({ ...note, [r.id]: e.target.value })} />
          </li>
        ))}
      </ul>

      <div className="lg:grid lg:grid-cols-2 lg:gap-6">
      <section>
      <h2 className="mb-2 mt-5 text-lg font-bold">Historial de cambios</h2>
      <ul className="card space-y-2 text-sm">
        {history.length === 0 && <li className="text-slate-500">Aún no hay cambios de estado.</li>}
        {history.slice(0, 10).map((h) => (
          <li key={h.id}><strong>{h.entity}</strong>: {h.from} → {h.to}{h.note ? ` · “${h.note}”` : ''}<br /><span className="text-xs text-slate-500">{h.by} · {formatDateTime(h.at)}</span></li>
        ))}
      </ul>
      </section>

      <section>
      <h2 className="mb-2 mt-5 text-lg font-bold">Auditoría</h2>
      <ul className="card space-y-1 text-sm">
        {audit.length === 0 && <li className="text-slate-500">Sin acciones registradas.</li>}
        {audit.slice(0, 10).map((a) => <li key={a.id}>{a.action} · {a.entity}<br /><span className="text-xs text-slate-500">{a.actor} · {formatDateTime(a.at)}</span></li>)}
      </ul>
      </section>
      </div>
    </Screen>
  )
}
