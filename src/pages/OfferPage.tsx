import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import Screen from '../components/Screen'
import { SyncBadge } from '../components/Badges'
import { useStore } from '../lib/store'
import { OFFER_CATEGORIES, type OfferCategory } from '../types'

const WHEN = ['Hoy, desde 2:00 p. m.', 'Hoy, todo el día', 'Mañana por la mañana', 'Cualquier momento']

export default function OfferPage() {
  const { addOffer, offers, retireOffer, zoneLabel } = useStore()
  const [cat, setCat] = useState<OfferCategory>('Agua')
  const [desc, setDesc] = useState('')
  const [when, setWhen] = useState(WHEN[0])
  const [doneId, setDoneId] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const done = offers.find((o) => o.clientId === doneId)

  const submit = () => setDoneId(addOffer({ categoria: cat, descripcion: desc.trim(), disponibilidad: when }).clientId)

  if (done) {
    return (
      <Screen title="Oferta publicada" hideNav>
        <div className="card space-y-3 text-center">
          <CheckCircle2 className="mx-auto text-green-600" size={56} />
          <p className="text-lg font-bold">Gracias por ofrecer ayuda</p>
          <SyncBadge sync={done.sync} error={done.syncError} />
          <p className="text-sm text-slate-600">Estado: {done.estado}. Puedes retirarla cuando se agote.</p>
        </div>
        {msg && <p role="alert" className="mt-3 text-sm font-bold text-red-700">{msg}</p>}
        <button className="btn-outline mt-4" onClick={async () => {
          const r = await retireOffer(done.id)
          if (r.ok) { setDoneId(null); setDesc(''); setMsg('') } else setMsg(r.message)
        }}>Retirar mi oferta</button>
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
          <textarea id="od" rows={3} maxLength={80} className="field" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ej.: Puedo donar 10 cajas de agua" />
          <p className="text-right text-xs text-slate-500">{desc.length}/80</p>
        </div>
        <div>
          <label htmlFor="ow" className="label">Disponibilidad</label>
          <select id="ow" className="field" value={when} onChange={(e) => setWhen(e.target.value)}>{WHEN.map((w) => <option key={w}>{w}</option>)}</select>
        </div>
        <p className="card text-sm">Zona aproximada: <strong>{zoneLabel}</strong> (la de tu perfil). Tu teléfono y tu dirección no se publican.</p>
        <button className="btn-primary" disabled={desc.trim().length < 5} onClick={submit}>Publicar ayuda</button>
      </div>
    </Screen>
  )
}
