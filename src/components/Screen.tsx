import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  AlertTriangle, ArrowLeft, ClipboardList, CloudOff, HandHeart, Home, Map as MapIcon,
  Mountain, RefreshCw, ShieldCheck, User, Users,
} from 'lucide-react'
import { useStore, isDemoMode } from '../lib/store'

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
  const { online, pendingCount, syncNow, role, displayName } = useStore()
  const coord = role === 'coordinador' || role === 'administrador'
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
  ]

  return (
    <div className="min-h-full bg-slate-50 lg:flex">
      {/* ===== Escritorio: barra lateral ===== */}
      <aside className="hidden w-64 shrink-0 flex-col bg-gradient-to-b from-brand-700 to-brand-800 text-white lg:sticky lg:top-0 lg:z-[1100] lg:flex lg:h-screen">
        <Link to="/" className="flex items-center gap-2 px-5 py-5 text-xl font-extrabold">
          <Mountain size={28} aria-hidden /> Cerca Perú
        </Link>
        <nav aria-label="Navegación principal" className="px-3">
          <ul className="space-y-1">
            {tabs.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex min-h-[44px] items-center gap-3 rounded-xl px-3 font-medium ${isActive ? 'bg-white text-brand-700' : 'text-white/90 hover:bg-white/10'}`
                  }
                >
                  <Icon size={20} aria-hidden /> {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 space-y-2 px-3">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-white/60">Acciones rápidas</p>
          {quick.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex min-h-[44px] items-center gap-3 rounded-xl border border-white/30 px-3 text-sm font-semibold hover:bg-white/10">
              <Icon size={18} aria-hidden /> {label}
            </Link>
          ))}
        </div>
        <div className="mt-auto p-4 text-xs text-white/70">
          <p className="font-semibold text-white">{displayName}</p>
          <p className="capitalize">{role} · Chaclacayo</p>
        </div>
      </aside>

      {/* ===== Contenido ===== */}
      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-[1100] bg-gradient-to-b from-brand-600 to-brand-800 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white lg:border-b lg:border-slate-200 lg:bg-none lg:bg-white lg:px-8 lg:pb-3 lg:pt-3 lg:text-slate-900">
          <div className="mx-auto flex min-h-[44px] max-w-6xl items-center gap-2">
            {back && (
              <button onClick={() => navigate(-1)} aria-label="Volver" className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 lg:hover:bg-slate-100">
                <ArrowLeft />
              </button>
            )}
            <div className="min-w-0 flex-1 text-center lg:text-left">
              <h1 className="truncate text-lg font-bold lg:text-2xl">{title}</h1>
              {subtitle && <p className="text-xs text-white/80 lg:text-sm lg:text-slate-500">{subtitle}</p>}
            </div>
            <div className="flex min-w-[2.75rem] justify-end">{right}</div>
          </div>
        </header>

        {isDemoMode && (
          <div className="bg-amber-100 px-4 py-1.5 text-center text-xs font-medium text-amber-900">
            Modo demostración: datos ficticios guardados solo en este dispositivo
          </div>
        )}
        {!online && (
          <div role="status" className="flex items-center gap-2 bg-slate-800 px-4 py-2 text-sm text-white">
            <CloudOff size={18} /> Sin conexión. Puedes preparar reportes; se enviarán cuando vuelva internet.
          </div>
        )}
        {online && pendingCount > 0 && (
          <button onClick={() => void syncNow()} className="flex items-center justify-center gap-2 bg-blue-50 px-4 py-2 text-sm text-blue-900">
            <RefreshCw size={16} /> {pendingCount} pendiente(s) de envío. Toca para reintentar.
          </button>
        )}

        <main className={`mx-auto w-full flex-1 px-4 py-4 lg:px-8 lg:py-6 ${wide ? 'max-w-6xl' : 'max-w-2xl'} ${hideNav ? 'pb-6' : 'pb-28 lg:pb-6'}`}>
          {children}
        </main>
      </div>

      {/* ===== Celular: barra inferior ===== */}
      {!hideNav && (
        <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-[1100] border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
          <ul className="mx-auto flex max-w-2xl">
            {tabs.map(({ to, label, icon: Icon }) => (
              <li key={to} className="flex-1">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${isActive ? 'text-brand-600' : 'text-slate-500'}`
                  }
                >
                  <Icon size={22} />
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
