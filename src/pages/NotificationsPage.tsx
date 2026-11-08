import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import Screen from '../components/Screen'
import { useStore } from '../lib/store'
import { timeAgo } from '../lib/utils'
import type { AppNotification } from '../types'

/** Avisos: cambios de estado de tus reportes y solicitudes, y cuando alguien da me gusta o comenta tu publicación. */
export default function NotificationsPage() {
  const { notifications, unread, markRead, markAllRead } = useStore()
  const navigate = useNavigate()

  const abrir = (n: AppNotification) => {
    void markRead(n.id)
    const ruta = n.ruta ?? '/notificaciones'
    // Los avisos de la comunidad llevan a la publicación con sus comentarios.
    if (ruta === '/comunidad' && n.objetivoId) navigate(`/comunidad?post=${n.objetivoId}`)
    else navigate(ruta)
  }

  return (
    <Screen title="Avisos" subtitle={unread ? `${unread} sin leer` : 'Todo al día'} width="narrow">
      {unread > 0 && (
        <button onClick={() => void markAllRead()} className="btn-outline mb-3"><CheckCheck size={20} /> Marcar todo como leído</button>
      )}
      <ul className="space-y-3">
        {notifications.length === 0 && <li className="card text-center text-slate-600">No tienes avisos todavía.</li>}
        {notifications.map((n) => (
          <li key={n.id}>
            <button onClick={() => abrir(n)} className={`card flex w-full items-start gap-3 text-left ${n.leida ? '' : 'bg-[#fff3d1]'}`}>
              <span aria-hidden className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-[3px] border-ink bg-inti text-ink"><Bell size={18} /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-extrabold">{n.titulo}</span>
                <span className="block break-words text-sm text-slate-700">{n.detalle}</span>
                <span className="block text-xs text-slate-500">{timeAgo(n.createdAt)}</span>
              </span>
              {!n.leida && <span className="mt-1 rounded-full border-2 border-ink bg-brand-600 px-2 text-xs font-extrabold text-white">Nuevo</span>}
            </button>
          </li>
        ))}
      </ul>
    </Screen>
  )
}
