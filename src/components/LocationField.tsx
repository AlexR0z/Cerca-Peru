import { useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet'
import { Crosshair } from 'lucide-react'
import { CHACLACAYO } from '../lib/utils'

export interface Point { lat: number; lon: number }

function ClickToMark({ onPick }: { onPick: (p: Point) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lon: e.latlng.lng }) })
  return null
}

/**
 * La geolocalización solo se pide cuando la persona toca el botón (consentimiento explícito).
 * Si no la concede, puede marcar el punto manualmente en el mapa.
 */
export default function LocationField({ value, onChange }: { value: Point | null; onChange: (p: Point) => void }) {
  const [msg, setMsg] = useState('')

  const useMyLocation = () => {
    if (!navigator.geolocation) return setMsg('Tu dispositivo no permite ubicación. Toca el mapa para marcar el punto.')
    setMsg('Buscando tu ubicación…')
    navigator.geolocation.getCurrentPosition(
      (pos) => { onChange({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setMsg('Ubicación tomada. Se guardará de forma aproximada.') },
      () => setMsg('No pudimos usar tu ubicación. Toca el mapa para marcar el punto.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={useMyLocation} className="btn-outline">
        <Crosshair size={20} /> Usar mi ubicación
      </button>
      <p className="text-sm text-slate-600">O toca el mapa para marcar el punto. Solo usamos una ubicación aproximada (unos 100 m).</p>
      <div className="h-56 overflow-hidden rounded-xl ring-1 ring-slate-300">
        <MapContainer center={value ? [value.lat, value.lon] : CHACLACAYO} zoom={14} className="h-full w-full" key={value ? 'p' : 'n'}>
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickToMark onPick={(p) => { onChange(p); setMsg('Punto marcado.') }} />
          {value && <CircleMarker center={[value.lat, value.lon]} radius={10} pathOptions={{ color: '#a50f1c', fillOpacity: 0.7 }} />}
        </MapContainer>
      </div>
      <p role="status" className="min-h-[1.25rem] text-sm text-slate-700">{msg}</p>
    </div>
  )
}
