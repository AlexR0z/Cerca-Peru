import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  AlertTriangle, ArrowLeft, Bell, ClipboardList, CloudOff, HandHeart, Home, Map as MapIcon,
  RefreshCw, ShieldCheck, User, Users,
} from 'lucide-react'
import { useStore, isDemoMode } from '../lib/store'
import { Chakana, TextileStrip } from './Peru'

interface Props {
  title: string
  subtitle?: string
  back?: boolean
  right?: ReactNode
  children: ReactNode
  /** Oculta la barra inferior en celular (pantallas de flujo). En escritorio la barra lateral siempre se muestra. */
  hideNav?: boolean
  /** Ancho del contenido en escritorio. Por defecto: ancho en listados, angosto en formularios. */
  width?: 'narrow' | 'wide'
}

export default function Screen({ title, subtitle, back, right, children, hideNav, width }: Props) {
  const navigate = useNavigate()
  const { online, pendingCount, syncNow, role, displayName, zoneLabel, unread, loadError, refresh } = useStore()
  const coord = role === 'coordinador'
  const wide = (width ?? (hideNav ? 'narrow' : 'wide')) === 'wide'

  const tabs = [
    { to: '/inicio', label: 'Inicio', icon: Home },
    { to: '/mapa', label: 'Mapa', icon: MapIcon },
    { to: '/solicitudes', label: 'Solicitudes', icon: ClipboardList },
    ...(coord ? [{ to: '/coordinacion', label: 'Coordinación', icon: ShieldCheck }] : []),
    { to: '/comunidad', label: 'Comunidad', icon: Users },
    { to: '/perfil', label: 'Perfil', icon: User },
  ]

  const quick = [
    { to: '/reportar', label: 'Reportar emergencia', icon: AlertTriangle },
    { to: '/solicitar', label: 'Necesito ayuda', icon: Users },
    { to: '/ofrecer', label: 'Ofrecer ayuda', icon: HandHeart },
    { to: '/notificaciones', label: unread > 0 ? `Avisos (${unread} nuevos)` : 'Avisos', icon: Bell },
  ]

  return (
    <div className="min-h-full lg:flex">
      {/* ===== Escritorio: barra lateral ===== */}
      <aside className="hidden w-72 shrink-0 flex-col border-r-[3px] border-ink bg-brand-600 text-white lg:sticky lg:top-0 lg:z-[1100] lg:flex lg:h-screen">
        <Link to="/" className="flex items-center gap-3 px-5 py-5">
          <Chakana size={40} />
          <span className="font-display text-2xl uppercase leading-none [text-shadow:3px_3px_0_#111]">Cerca<br />Perú</span>
        </Link>
        <TextileStrip />
        <nav aria-label="Navegación principal" className="mt-5 px-4">
          <ul className="space-y-2">
            {tabs.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex min-h-[46px] items-center gap-3 rounded-lg border-[3px] px-3 font-extrabold transition-all ${
                      isActive
                        ? 'border-ink bg-inti text-ink shadow-brut-sm'
                        : 'border-transparent text-white hover:border-ink hover:bg-brand-700'
                    }`
                  }
                >
                  <Icon size={20} aria-hidden /> {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 space-y-2 px-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-white/80">Acciones rápidas</p>
          {quick.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex min-h-[44px] items-center gap-3 rounded-lg border-[3px] border-ink bg-white px-3 text-sm font-extrabold text-ink shadow-brut-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
              <Icon size={18} aria-hidden /> {label}
            </Link>
          ))}
        </div>
        <div className="mt-auto">
          <div className="mx-4 mb-3 rounded-lg border-[3px] border-ink bg-morado p-3 text-xs">
            <p className="font-display uppercase text-inti">Ayni</p>
            <p className="font-medium">Hoy por ti, mañana por mí.</p>
          </div>
          <div className="border-t-[3px] border-ink bg-brand-700 px-5 py-3 text-xs">
            <p className="font-extrabold">{displayName}</p>
            <p className="capitalize text-white/80">{role} · {zoneLabel}</p>
          </div>
        </div>
      </aside>

      {/* ===== Contenido ===== */}
      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-[1100] border-b-[3px] border-ink bg-brand-600 pt-[max(0.5rem,env(safe-area-inset-top))] text-white lg:bg-inti lg:pt-0 lg:text-ink">
          <div className="mx-auto flex min-h-[56px] max-w-6xl items-center gap-2 px-4 pb-2 lg:px-8 lg:py-3">
            {back && (
              <button onClick={() => navigate(-1)} aria-label="Volver" className="-ml-1 flex h-11 w-11 items-center justify-center rounded-lg border-[3px] border-ink bg-white text-ink shadow-brut-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                <ArrowLeft />
              </button>
            )}
            <div className="min-w-0 flex-1 text-center lg:text-left">
              <h1 className="truncate text-lg uppercase leading-tight lg:text-3xl">{title}</h1>
              {subtitle && <p className="text-xs font-bold text-white/90 lg:text-sm lg:text-ink/80">{subtitle}</p>}
            </div>
            <div className="flex min-w-[2.75rem] justify-end gap-2">
              {right}
              <Link to="/notificaciones" aria-label={unread > 0 ? `Avisos: ${unread} nuevos` : 'Avisos'} className="relative flex h-11 w-11 items-center justify-center rounded-lg border-[3px] border-ink bg-white text-ink shadow-brut-sm lg:hidden">
                <Bell />
                {unread > 0 && <span aria-hidden className="absolute -right-1.5 -top-1.5 min-w-[20px] rounded-full border-2 border-ink bg-inti px-1 text-center text-[11px] font-extrabold leading-4">{unread > 9 ? '9+' : unread}</span>}
              </Link>
            </div>
          </div>
          <TextileStrip height={10} />
        </header>

        {isDemoMode && (
          <div className="border-b-[3px] border-ink bg-inti px-4 py-1.5 text-center text-xs font-extrabold text-ink lg:bg-white">
            Modo demostración: datos ficticios guardados solo en este dispositivo
          </div>
        )}
        {online && loadError && (
          <button onClick={() => void refresh()} className="flex items-center justify-center gap-2 border-b-[3px] border-ink bg-[#ffd9dc] px-4 py-2 text-sm font-extrabold text-ink">
            <RefreshCw size={16} /> {loadError} Toca para reintentar.
          </button>
        )}
        {!online && (
          <div role="status" className="flex items-center gap-2 border-b-[3px] border-ink bg-ink px-4 py-2 text-sm font-bold text-white">
            <CloudOff size={18} /> Sin conexión. Puedes preparar reportes; se enviarán cuando vuelva internet.
          </div>
        )}
        {online && pendingCount > 0 && (
          <button onClick={() => void syncNow()} className="flex items-center justify-center gap-2 border-b-[3px] border-ink bg-turq px-4 py-2 text-sm font-extrabold text-ink">
            <RefreshCw size={16} /> {pendingCount} pendiente(s) de envío. Toca para reintentar.
          </button>
        )}

        <main className={`mx-auto w-full flex-1 px-4 py-5 lg:px-8 lg:py-7 ${wide ? 'max-w-6xl' : 'max-w-2xl'} ${hideNav ? 'pb-8' : 'pb-32 lg:pb-8'}`}>
          {children}
        </main>
      </div>

      {/* ===== Celular: barra inferior ===== */}
      {!hideNav && (
        <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-[1100] border-t-[3px] border-ink bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
          <ul className="mx-auto flex max-w-2xl">
            {tabs.map(({ to, label, icon: Icon }) => (
              <li key={to} className="flex-1 border-r-2 border-ink last:border-r-0">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex min-h-[62px] flex-col items-center justify-center gap-0.5 text-[11px] font-extrabold text-ink ${isActive ? 'bg-inti' : 'bg-white'}`
                  }
                >
                  <Icon size={22} strokeWidth={2.5} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
