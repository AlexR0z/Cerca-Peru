import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Send } from 'lucide-react'
import Screen from '../components/Screen'
import LocationField, { type Point } from '../components/LocationField'
import { SyncBadge, StatusPill } from '../components/Badges'
import { useStore } from '../lib/store'
import { zonaCercana, type Zona } from '../lib/geo'
import { HELP_CATEGORIES, type HelpCategory } from '../types'

export default function RequestPage() {
  const { addRequest, requests, zoneLabel, zone } = useStore()
  const [cat, setCat] = useState<HelpCategory>('Alimentos')
  const [desc, setDesc] = useState('')
  const [personas, setPersonas] = useState(1)
  const [referencia, setReferencia] = useState('')
  const [point, setPoint] = useState<Point | null>(null)
  const [zonaGps, setZonaGps] = useState<Zona | null>(null)
  const [doneId, setDoneId] = useState<string | null>(null)
  const done = requests.find((r) => r.clientId === doneId)

  const onPoint = (p: Point) => {
    setPoint(p)
    const z = zonaCercana(p.lat, p.lon)
    setZonaGps(z && z.km <= 60 ? { departamento: z.departamento, provincia: z.provincia, distrito: z.distrito } : null)
  }

  const submit = () => {
    setDoneId(addRequest({
      categoria: cat, descripcion: desc.trim(), personas, referencia: referencia.trim() || undefined,
      lat: point?.lat, lon: point?.lon, zona: zonaGps ?? undefined,
    }).clientId)
  }

  if (done) {
    return (
      <Screen title="Solicitud publicada" hideNav>
        <div className="card space-y-3 text-center">
          <CheckCircle2 className="mx-auto text-green-600" size={56} />
          <p className="text-lg font-bold">Tu solicitud quedó registrada</p>
          {done.code !== 'Pendiente' && <p className="text-2xl font-extrabold tracking-wider text-brand-600">{done.code}</p>}
          <div className="flex justify-center gap-2"><StatusPill label={done.estado} tone="amber" /><SyncBadge sync={done.sync} error={done.syncError} /></div>
          <p className="text-sm text-slate-600">Verás aquí cuando alguien responda. Tu nombre, tu teléfono y tu dirección no se muestran públicamente.</p>
        </div>
        <Link to="/solicitudes" className="btn-primary mt-4">Ver solicitudes</Link>
      </Screen>
    )
  }

  return (
    <Screen title="Necesito ayuda" back hideNav>
      <div className="space-y-4">
        <fieldset>
          <legend className="label">¿Qué necesitas?</legend>
          <div className="grid grid-cols-3 gap-2">
            {HELP_CATEGORIES.map((c) => <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className="chip">{c}</button>)}
          </div>
        </fieldset>
        <div>
          <label htmlFor="d" className="label">Descripción</label>
          <textarea id="d" rows={3} maxLength={200} className="field" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ej.: Necesitamos alimentos para 4 personas" />
          <p className="text-right text-xs text-slate-500">{desc.length}/200</p>
        </div>
        <div>
          <label htmlFor="p" className="label">¿Cuántas personas?</label>
          <input id="p" type="number" min={1} max={99} className="field" value={personas} onChange={(e) => setPersonas(Math.min(99, Math.max(1, Number(e.target.value) || 1)))} />
        </div>
        <div className="card">
          <p className="label">Zona</p>
          <p className="font-bold">{zonaGps ? `${zonaGps.distrito}, ${zonaGps.departamento}` : zoneLabel}</p>
          {!zone.distrito && <p className="text-sm text-red-700">Aún no elegiste tu ubicación. Hazlo en <Link to="/perfil" className="underline">tu perfil</Link>.</p>}
          <label htmlFor="ref" className="label mt-3">Referencia (opcional)</label>
          <input id="ref" className="field" maxLength={150} value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ej.: cerca del parque, casa de reja verde" />
          <p className="text-xs text-slate-500">Solo la ven quien pide y la coordinación. No escribas teléfonos.</p>
        </div>
        <details className="card">
          <summary className="cursor-pointer font-semibold">Marcar un punto más preciso (opcional)</summary>
          <div className="mt-3"><LocationField value={point} onChange={onPoint} /></div>
        </details>
        <p className="text-sm text-slate-600">No escribas teléfonos ni tu dirección exacta. La coordinación te contactará por la app.</p>
        <button className="btn-primary" disabled={desc.trim().length < 5} onClick={submit}><Send size={20} /> Publicar solicitud</button>
      </div>
    </Screen>
  )
}
