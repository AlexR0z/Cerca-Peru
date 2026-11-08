import { useState } from 'react'
import { Crosshair } from 'lucide-react'
import { UBIGEO } from '../data/ubigeo'
import { zonaCercana, type Zona } from '../lib/geo'

/**
 * Elegir departamento, provincia y distrito del Perú (1 874 distritos), o dejar que el GPS sugiera el más cercano.
 * La ubicación del teléfono solo se pide al tocar el botón.
 */
export default function ZonePicker({ value, onChange }: { value: Zona; onChange: (z: Zona) => void }) {
  const [msg, setMsg] = useState('')
  const [buscando, setBuscando] = useState(false)
  const departamentos = Object.keys(UBIGEO)
  const provincias = value.departamento && UBIGEO[value.departamento] ? Object.keys(UBIGEO[value.departamento]) : []
  const distritos = provincias.includes(value.provincia) ? UBIGEO[value.departamento][value.provincia] : []

  const detectar = () => {
    if (!navigator.geolocation) return setMsg('Tu dispositivo no permite obtener la ubicación. Elige tu zona en las listas.')
    setBuscando(true)
    setMsg('Buscando tu ubicación…')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBuscando(false)
        const z = zonaCercana(pos.coords.latitude, pos.coords.longitude)
        if (z && z.km <= 60) {
          onChange({ departamento: z.departamento, provincia: z.provincia, distrito: z.distrito })
          setMsg(`Detectamos que estás cerca de ${z.distrito} (${z.provincia}, ${z.departamento}). Si no es correcto, cámbialo en las listas.`)
        } else setMsg('Tu ubicación parece estar lejos de los distritos del Perú. Elige tu zona en las listas.')
      },
      () => { setBuscando(false); setMsg('No pudimos obtener tu ubicación. Revisa el permiso o elige tu zona en las listas.') },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 0 },
    )
  }

  return (
    <div className="space-y-3">
      <button type="button" className="btn-outline" disabled={buscando} onClick={detectar}>
        <Crosshair size={20} /> Usar mi ubicación actual
      </button>
      <p role="status" className="min-h-[1.25rem] text-sm text-slate-700">{msg}</p>
      <div>
        <label htmlFor="zdep" className="label">Departamento</label>
        <select id="zdep" className="field" value={value.departamento} onChange={(e) => onChange({ departamento: e.target.value, provincia: '', distrito: '' })}>
          <option value="">Elige…</option>
          {departamentos.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="zprov" className="label">Provincia</label>
        <select id="zprov" className="field" disabled={!provincias.length} value={value.provincia} onChange={(e) => onChange({ ...value, provincia: e.target.value, distrito: '' })}>
          <option value="">Elige…</option>
          {provincias.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="zdis" className="label">Distrito</label>
        <select id="zdis" className="field" disabled={!distritos.length} value={value.distrito} onChange={(e) => onChange({ ...value, distrito: e.target.value })}>
          <option value="">Elige…</option>
          {distritos.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
    </div>
  )
}
