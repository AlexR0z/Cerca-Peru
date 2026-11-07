import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import Screen from '../components/Screen'
import { SyncBadge } from '../components/Badges'
import { useStore } from '../lib/store'
import { OFFER_CATEGORIES, type OfferCategory } from '../types'
import { ZONES } from '../lib/utils'

const WHEN = ['Hoy, desde 2:00 p. m.', 'Hoy, todo el día', 'Mañana por la mañana', 'Cualquier momento']

export default function OfferPage() {
  const { addOffer, offers, retireOffer } = useStore()
  const [cat, setCat] = useState<OfferCategory>('Agua')
  const [desc, setDesc] = useState('')
  const [when, setWhen] = useState(WHEN[0])
  const [zona, setZona] = useState(ZONES[0].name)
  const [doneId, setDoneId] = useState<string | null>(null)
  const done = offers.find((o) => o.id === doneId)

  const submit = () => {
    const z = ZONES.find((x) => x.name === zona)!
    setDoneId(addOffer({ categoria: cat, descripcion: desc.trim(), disponibilidad: when, zona, lat: z.lat, lon: z.lon }).id)
  }

  if (done) {
    return (
      <Screen title="Oferta publicada" hideNav>
        <div className="card space-y-3 text-center">
          <CheckCircle2 className="mx-auto text-green-600" size={56} />
          <p className="text-lg font-bold">Gracias por ofrecer ayuda</p>
          <SyncBadge sync={done.sync} error={done.syncError} />
          <p className="text-sm text-slate-600">Estado: {done.estado}. Puedes retirarla cuando se agote.</p>
        </div>
        <button className="btn-outline mt-4" onClick={() => { retireOffer(done.id); setDoneId(null); setDesc('') }}>Retirar mi oferta</button>
        <Link to="/inicio" className="btn-primary mt-3">Volver al inicio</Link>
      </Screen>
    )
  }

  return (
    <Screen title="Ofrecer ayuda" back hideNav>
      <div className="space-y-4">
        <fieldset>
          <legend className="label">¿Qué puedes brindar?</legend>
          <div className="grid grid-cols-3 gap-2">
            {OFFER_CATEGORIES.map((c) => <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className="chip">{c}</button>)}
          </div>
        </fieldset>
        <div>
          <label htmlFor="od" className="label">Detalles de tu ayuda</label>
          <textarea id="od" rows={3} maxLength={200} className="field" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ej.: Puedo donar 10 cajas de agua y víveres básicos" />
          <p className="text-right text-xs text-slate-500">{desc.length}/200</p>
        </div>
        <div>
          <label htmlFor="ow" className="label">Disponibilidad</label>
          <select id="ow" className="field" value={when} onChange={(e) => setWhen(e.target.value)}>{WHEN.map((w) => <option key={w}>{w}</option>)}</select>
        </div>
        <div>
          <label htmlFor="oz" className="label">Zona aproximada</label>
          <select id="oz" className="field" value={zona} onChange={(e) => setZona(e.target.value)}>{ZONES.map((z) => <option key={z.name}>{z.name}</option>)}</select>
        </div>
        <button className="btn-primary" disabled={desc.trim().length < 5} onClick={submit}>Publicar ayuda</button>
      </div>
    </Screen>
  )
}
