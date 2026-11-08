import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, HeartHandshake, Package, CheckCheck } from 'lucide-react'
import Screen from '../components/Screen'
import { DemoTag, PriorityPill, StatusPill } from '../components/Badges'
import { useStore } from '../lib/store'
import { urlFirmada } from '../lib/cloud'
import { HELP_STATUSES, REPORT_STATUSES, type HelpStatus, type Priority, type ReportStatus } from '../types'
import { formatDateTime, timeAgo } from '../lib/utils'

/** Foto de un reporte: el contenedor es privado, así que se pide un enlace temporal (solo coordinación o quien reportó). */
function FotoReporte({ ruta }: { ruta: string }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => { let vivo = true; void urlFirmada('fotos-reportes', ruta).then((u) => { if (vivo) setUrl(u) }).catch(() => undefined); return () => { vivo = false } }, [ruta])
  return url ? <img src={url} alt="Foto del reporte" loading="lazy" className="max-h-48 rounded-lg border-[3px] border-ink object-cover" /> : null
}

function Asignar({ kind, id }: { kind: 'reporte' | 'solicitud'; id: string }) {
  const { volunteers, assignVolunteers } = useStore()
  const [sel, setSel] = useState<string[]>([])
  const [msg, setMsg] = useState('')
  return (
    <details className="rounded-lg border-2 border-dashed border-ink p-2">
      <summary className="cursor-pointer text-sm font-bold">Asignar voluntarios</summary>
      <div className="mt-2 space-y-1">
        {volunteers.length === 0 && <p className="text-sm text-slate-600">No hay voluntarios en el directorio.</p>}
        {volunteers.map((v) => (
          <label key={v.id} className="flex min-h-[40px] items-center gap-2 text-sm">
            <input type="checkbox" className="h-5 w-5" checked={sel.includes(v.id)} onChange={() => setSel((s) => (s.includes(v.id) ? s.filter((x) => x !== v.id) : [...s, v.id]))} />
            {v.nombre} <span className="text-slate-500">{v.distrito}</span>
          </label>
        ))}
        {volunteers.length > 0 && (
          <button className="btn-outline" onClick={async () => { const r = await assignVolunteers(kind, id, sel); setMsg(r.message); if (r.ok) setSel([]) }}>Asignar a {sel.length || '…'}</button>
        )}
        {msg && <p role="status" className="text-sm font-bold">{msg}</p>}
      </div>
    </details>
  )
}

export default function CoordinationPage() {
  const { role, reports, requests, offers, audit, history, setReportStatus, setReportPriority, setRequestStatus, zoneLabel, mode } = useStore()
  const [filter, setFilter] = useState<ReportStatus | 'todos'>('todos')
  const [note, setNote] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState('')

  // Esta pantalla es solo de interfaz. La seguridad real la imponen las políticas RLS del servidor.
  if (role !== 'coordinador') {
    return (
      <Screen title="Centro de coordinación">
        <div className="card text-center">
          <p className="text-lg font-bold">Acceso solo para coordinación</p>
          <p className="mt-1 text-slate-600">Tu cuenta no tiene este rol. Los coordinadores los nombra el equipo desde la base de datos.</p>
          <Link to="/perfil" className="btn-outline mt-4">Ir a mi perfil</Link>
        </div>
      </Screen>
    )
  }

  const aviso = (r: { ok: boolean; message: string }) => setMsg(r.message)
  const abiertasSol = requests.filter((r) => r.estado !== 'Atendida' && r.estado !== 'Cancelada')

  const kpis = [
    { label: 'Reportes recibidos', value: reports.length, icon: AlertTriangle, tone: 'bg-[#ff9aa2]' },
    { label: 'Solicitudes sin atender', value: requests.filter((r) => r.estado === 'Activa').length, icon: HeartHandshake, tone: 'bg-[#8fe3e5]' },
    { label: 'Apoyos en marcha', value: requests.filter((r) => r.estado === 'En coordinación' || r.estado === 'En atención').length, icon: CheckCheck, tone: 'bg-[#e6b8f5]' },
    { label: 'Recursos disponibles', value: offers.filter((o) => o.estado === 'Disponible').length, icon: Package, tone: 'bg-[#9be7b0]' },
    { label: 'Casos resueltos', value: reports.filter((r) => r.estado === 'Resuelto').length + requests.filter((r) => r.estado === 'Atendida').length, icon: CheckCheck, tone: 'bg-inti' },
  ]

  const list = reports.filter((r) => filter === 'todos' || r.estado === filter)

  return (
    <Screen title="Centro de coordinación" subtitle={zoneLabel}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {kpis.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className={`rounded-lg border-[3px] border-ink p-3 shadow-brut ${tone}`}>
            <Icon size={20} aria-hidden />
            <p className="font-display text-4xl">{value}</p>
            <p className="text-xs font-medium">{label}</p>
          </div>
        ))}
      </div>
      {msg && <p role="status" className="mt-3 rounded-lg border-[3px] border-ink bg-turq p-3 text-sm font-bold text-ink shadow-brut-sm">{msg}</p>}

      <h2 className="mb-2 mt-5 text-lg font-bold">Reportes</h2>
      <label htmlFor="f" className="sr-only">Filtrar por estado</label>
      <select id="f" className="field mb-3 lg:max-w-xs" value={filter} onChange={(e) => setFilter(e.target.value as ReportStatus | 'todos')}>
        <option value="todos">Todos los estados</option>
        {REPORT_STATUSES.map((s) => <option key={s}>{s}</option>)}
      </select>
      <ul className="grid gap-3 lg:grid-cols-2">
        {list.length === 0 && <li className="card text-center text-slate-600">No hay reportes con ese estado.</li>}
        {list.map((r) => (
          <li key={r.id} className="card space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold">{r.tipo}</span> <span className="text-sm text-slate-500">{r.code}</span> {r.demo && <DemoTag />}
              <span className="ml-auto text-xs text-slate-500">{timeAgo(r.createdAt)}</span>
            </div>
            <p>{r.descripcion}</p>
            {(r.referencia || r.distrito) && <p className="text-sm text-slate-600">{r.distrito}{r.referencia ? ` · ${r.referencia}` : ''}</p>}
            {r.fotoRuta && mode === 'cloud' && <FotoReporte ruta={r.fotoRuta} />}
            <div className="flex items-center gap-2"><PriorityPill p={r.prioridad} /><StatusPill label={r.estado} tone={r.estado === 'Verificado' ? 'green' : 'amber'} /></div>
            {r.verifiedAt && <p className="text-xs text-slate-500">Revisado el {formatDateTime(r.verifiedAt)}</p>}
            {r.sync === 'enviado' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor={`s-${r.id}`} className="text-xs font-semibold">Estado</label>
                    <select id={`s-${r.id}`} className="field py-2" value={r.estado} onChange={async (e) => aviso(await setReportStatus(r.id, e.target.value as ReportStatus, note[r.id]))}>
                      {REPORT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`p-${r.id}`} className="text-xs font-semibold">Prioridad</label>
                    <select id={`p-${r.id}`} className="field py-2" value={r.prioridad} onChange={async (e) => aviso(await setReportPriority(r.id, e.target.value as Priority))}>
                      {(['Alta', 'Media', 'Baja'] as Priority[]).map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                {mode === 'demo' && (
                  <input aria-label="Nota interna" className="field py-2 text-sm" placeholder="Nota interna (se guarda al cambiar estado)" value={note[r.id] ?? ''} onChange={(e) => setNote({ ...note, [r.id]: e.target.value })} />
                )}
                <Asignar kind="reporte" id={r.id} />
              </>
            )}
          </li>
        ))}
      </ul>

      <h2 className="mb-2 mt-6 text-lg font-bold">Solicitudes de ayuda</h2>
      <ul className="grid gap-3 lg:grid-cols-2">
        {abiertasSol.length === 0 && <li className="card text-center text-slate-600">No hay solicitudes abiertas.</li>}
        {abiertasSol.map((r) => (
          <li key={r.id} className="card space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold">{r.categoria}</span> <span className="text-sm text-slate-500">{r.code}</span> {r.demo && <DemoTag />}
              <span className="ml-auto text-xs text-slate-500">{timeAgo(r.createdAt)}</span>
            </div>
            {r.descripcion && <p>{r.descripcion}</p>}
            <p className="text-sm text-slate-600">{r.personas} persona(s) · {r.distrito}{r.referencia ? ` · ${r.referencia}` : ''}</p>
            {r.sync === 'enviado' && (
              <>
                <div>
                  <label htmlFor={`rs-${r.id}`} className="text-xs font-semibold">Estado</label>
                  <select id={`rs-${r.id}`} className="field py-2" value={r.estado} onChange={async (e) => aviso(await setRequestStatus(r.id, e.target.value as HelpStatus))}>
                    {HELP_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <Asignar kind="solicitud" id={r.id} />
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="lg:grid lg:grid-cols-2 lg:gap-6">
        <section>
          <h2 className="mb-2 mt-5 text-lg font-bold">Historial de cambios</h2>
          <ul className="card space-y-2 text-sm">
            {history.length === 0 && <li className="text-slate-500">Aún no hay cambios de estado.</li>}
            {history.slice(0, 10).map((h) => (
              <li key={h.id}><strong>{h.entity}</strong>: {h.from || 'Nuevo'} → {h.to}{h.note ? ` · “${h.note}”` : ''}<br /><span className="text-xs text-slate-500">{h.by} · {formatDateTime(h.at)}</span></li>
            ))}
          </ul>
        </section>

        {mode === 'demo' && (
          <section>
            <h2 className="mb-2 mt-5 text-lg font-bold">Auditoría</h2>
            <ul className="card space-y-1 text-sm">
              {audit.length === 0 && <li className="text-slate-500">Sin acciones registradas.</li>}
              {audit.slice(0, 10).map((a) => <li key={a.id}>{a.action} · {a.entity}<br /><span className="text-xs text-slate-500">{a.actor} · {formatDateTime(a.at)}</span></li>)}
            </ul>
          </section>
        )}
      </div>
    </Screen>
  )
}
