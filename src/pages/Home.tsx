import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronRight, HandHeart, MapPinned, Route, Users } from 'lucide-react'
import Screen from '../components/Screen'
import { DemoTag } from '../components/Badges'
import { Chakana } from '../components/Peru'
import { useStore, isDemoMode } from '../lib/store'

const actions = [
  { to: '/reportar', label: 'Reportar emergencia', icon: AlertTriangle, cls: 'bg-brand-600 text-white' },
  { to: '/solicitar', label: 'Necesito ayuda', icon: Users, cls: 'bg-turq text-ink' },
  { to: '/ofrecer', label: 'Ofrecer ayuda', icon: HandHeart, cls: 'bg-inti text-ink' },
  { to: '/mapa', label: 'Mapa solidario', icon: MapPinned, cls: 'bg-magenta text-white' },
]

export default function Home() {
  const { displayName, zoneLabel, profile, unread } = useStore()
  return (
    <Screen title="Cerca Perú" subtitle="Mi cuadra, mi gente, mi alerta">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <p className="font-display text-2xl uppercase leading-tight">¡Hola, {displayName}!</p>
          <p className="font-bold text-slate-700">Zona: {zoneLabel} · <Link to="/perfil" className="underline">Cambiar</Link></p>
          <p className="mt-1 text-sm text-slate-600">
            {profile.puntos} puntos solidarios
            {unread > 0 && <> · <Link to="/notificaciones" className="font-bold underline">{unread} aviso(s) nuevo(s)</Link></>}
          </p>
        </div>

        {isDemoMode ? (
          <div className="flex items-start gap-3 rounded-lg border-[3px] border-ink bg-inti p-4 shadow-brut">
            <AlertTriangle size={24} className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium">
              <DemoTag /> <strong>Aviso de ejemplo.</strong> Esta demostración no muestra alertas oficiales. Consulta a INDECI y a tu municipalidad.
            </p>
          </div>
        ) : (
          <div className="card text-sm font-medium">Sin avisos por ahora. Consulta siempre a INDECI y a tu municipalidad.</div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        {actions.map(({ to, label, icon: Icon, cls }) => (
          <Link
            key={to}
            to={to}
            className={`${cls} flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-lg border-[3px] border-ink p-3 text-center font-display text-base uppercase leading-tight shadow-brut transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-lg active:translate-x-1 active:translate-y-1 active:shadow-none lg:min-h-[190px] lg:text-xl`}
          >
            <span className="rounded-lg border-[3px] border-ink bg-white p-2 text-ink"><Icon size={32} aria-hidden /></span>
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border-[3px] border-ink bg-morado p-4 text-white shadow-brut lg:col-span-1">
          <div className="flex items-center gap-3">
            <Chakana size={40} />
            <h2 className="text-2xl uppercase text-inti">Ayni</h2>
          </div>
          <p className="mt-2 font-bold">Hoy por ti, mañana por mí.</p>
          <p className="text-sm">En los Andes ayudarse entre vecinos es costumbre. Aquí también.</p>
        </div>

        <Link to="/mapa" className="card flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:shadow-brut-lg">
          <span className="rounded-lg border-[3px] border-ink bg-selva p-2 text-white"><Route /></span>
          <div className="flex-1">
            <p className="font-extrabold">Zonas de riesgo y puntos de encuentro</p>
            <p className="text-sm text-slate-700">Referencias orientativas. Aún sin fuente oficial cargada.</p>
          </div>
          <ChevronRight />
        </Link>

        <Link to="/tutorial" className="card flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:shadow-brut-lg">
          <div className="flex-1">
            <p className="font-extrabold">¿Primera vez? Mira cómo funciona</p>
            <p className="text-sm text-slate-700">Cuatro pasos cortos.</p>
          </div>
          <ChevronRight />
        </Link>
      </div>
    </Screen>
  )
}
