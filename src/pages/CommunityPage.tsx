import { useState } from 'react'
import { Flag, Star } from 'lucide-react'
import Screen from '../components/Screen'
import { DemoTag } from '../components/Badges'
import { useStore } from '../lib/store'

export default function CommunityPage() {
  const { volunteers, offers } = useStore()
  const [tab, setTab] = useState<'vol' | 'rec'>('vol')
  const [flagged, setFlagged] = useState<string[]>([])

  return (
    <Screen title="Comunidad">
      <div role="tablist" className="mb-3 grid grid-cols-2 gap-2 lg:max-w-md">
        {([['vol', 'Voluntarios'], ['rec', 'Recursos']] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`min-h-[44px] rounded-full font-semibold ${tab === k ? 'bg-brand-600 text-white' : 'bg-white ring-1 ring-slate-300'}`}>{l}</button>
        ))}
      </div>

      {tab === 'vol' ? (
        <>
          <ul className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {volunteers.map((v) => (
              <li key={v.id} className="card flex items-center gap-3">
                <div aria-hidden className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">{v.nombre[0]}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{v.nombre} <DemoTag /></p>
                  <p className="text-sm text-green-700">{v.disponible ? 'Disponible' : 'No disponible'}</p>
                  <p className="flex items-center gap-1 text-sm"><Star size={14} className="fill-amber-400 text-amber-400" />{v.rating} ({v.valoraciones})</p>
                  <p className="mt-1 text-xs text-slate-600">{v.habilidades.join(' · ')}</p>
                </div>
                <button aria-label={`Reportar abuso de ${v.nombre}`} onClick={() => setFlagged((f) => [...f, v.id])}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 ring-1 ring-slate-300">
                  <Flag size={18} className={flagged.includes(v.id) ? 'text-brand-600' : ''} />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            Solo aparecen voluntarios que aceptaron estar en el directorio. Las valoraciones son opiniones vecinales: no son certificaciones
            profesionales ni verificación de identidad. No se muestran direcciones ni teléfonos.
          </p>
        </>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {offers.filter((o) => o.estado === 'Disponible').map((o) => (
            <li key={o.id} className="card">
              <p className="font-bold">{o.categoria} {o.demo && <DemoTag />}</p>
              <p>{o.descripcion}</p>
              <p className="text-sm text-slate-600">{o.zona} · {o.disponibilidad}</p>
            </li>
          ))}
        </ul>
      )}
    </Screen>
  )
}
