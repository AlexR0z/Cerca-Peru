import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, HandHeart, MapPinned, Users } from 'lucide-react'
import Screen from '../components/Screen'

const steps = [
  { icon: AlertTriangle, title: 'Reportar una emergencia', text: 'Elige el tipo, cuéntanos qué pasa y marca dónde. Recibirás un código de seguimiento.' },
  { icon: Users, title: 'Pedir ayuda', text: 'Elige lo que necesitas, describe tu situación y publica. No pongas tu teléfono ni tu dirección exacta.' },
  { icon: HandHeart, title: 'Ofrecer ayuda', text: 'Indica qué puedes dar, cuándo y en qué zona. Puedes retirar tu oferta cuando quieras.' },
  { icon: MapPinned, title: 'Mirar el mapa solidario', text: 'Verás zonas de riesgo, reportes y recursos. También hay una lista si prefieres no usar el mapa.' },
]

export default function TutorialPage() {
  const [i, setI] = useState(0)
  const { icon: Icon, title, text } = steps[i]
  return (
    <Screen title="Cómo funciona" back hideNav>
      <div className="card space-y-3 py-8 text-center">
        <Icon className="mx-auto text-brand-600" size={64} aria-hidden />
        <p className="text-sm text-slate-500">Paso {i + 1} de {steps.length}</p>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-lg text-slate-700">{text}</p>
      </div>
      <div className="mt-4 space-y-3">
        {i < steps.length - 1
          ? <button className="btn-primary" onClick={() => setI(i + 1)}>Siguiente</button>
          : <Link to="/inicio" className="btn-primary">Empezar</Link>}
        {i > 0 && <button className="btn-outline" onClick={() => setI(i - 1)}>Anterior</button>}
      </div>
    </Screen>
  )
}
