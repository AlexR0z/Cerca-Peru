import { Link } from 'react-router-dom'
import { AlertTriangle, Bell, ChevronRight, HandHeart, MapPinned, Route, Users } from 'lucide-react'
import Screen from '../components/Screen'
import { DemoTag } from '../components/Badges'
import { useStore, isDemoMode } from '../lib/store'

const actions = [
  { to: '/reportar', label: 'Reportar emergencia', icon: AlertTriangle, color: 'bg-brand-600' },
  { to: '/solicitar', label: 'Necesito ayuda', icon: Users, color: 'bg-help' },
  { to: '/ofrecer', label: 'Ofrecer ayuda', icon: HandHeart, color: 'bg-offer' },
  { to: '/mapa', label: 'Ver mapa solidario', icon: MapPinned, color: 'bg-map' },
]

export default function Home() {
  const { displayName } = useStore()
  return (
    <Screen title="Cerca Perú" right={<Link to="/perfil" aria-label="Notificaciones y perfil"><Bell /></Link>}>
      <div className="card mb-4">
        <p className="text-lg font-bold">Hola, {displayName}</p>
        <p className="text-sm text-slate-600">Zona: Chaclacayo, Lima</p>
      </div>

      {isDemoMode && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-800 ring-1 ring-brand-100">
          <AlertTriangle size={20} className="mt-0.5 shrink-0" />
          <p>
            <DemoTag /> <strong>Aviso de ejemplo.</strong> Esta demostración no muestra alertas oficiales. Consulta a INDECI y a tu municipalidad.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {actions.map(({ to, label, icon: Icon, color }) => (
          <Link key={to} to={to} className={`${color} flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center text-lg font-bold leading-tight text-white shadow transition hover:brightness-110 active:scale-[0.98] lg:min-h-[180px] lg:text-xl`}>
            <Icon size={36} aria-hidden />
            {label}
          </Link>
        ))}
      </div>

      <h2 className="mb-2 mt-6 text-lg font-bold">Te puede interesar</h2>
      <div className="grid gap-3 lg:grid-cols-2">
      <Link to="/mapa" className="card flex items-center gap-3">
        <Route className="text-offer" />
        <div className="flex-1">
          <p className="font-semibold">Zonas de riesgo y puntos de encuentro</p>
          <p className="text-sm text-slate-600">Referencias orientativas. Aún sin fuente oficial cargada.</p>
        </div>
        <ChevronRight className="text-slate-400" />
      </Link>
      <Link to="/tutorial" className="card flex items-center gap-3">
        <div className="flex-1">
          <p className="font-semibold">¿Primera vez? Mira cómo funciona</p>
          <p className="text-sm text-slate-600">Cuatro pasos cortos.</p>
        </div>
        <ChevronRight className="text-slate-400" />
      </Link>
      </div>
    </Screen>
  )
}
