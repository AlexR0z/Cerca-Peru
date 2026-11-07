import { useState } from 'react'
import { CircleMarker, MapContainer, Polygon, Popup, TileLayer } from 'react-leaflet'
import { List, Map as MapIcon } from 'lucide-react'
import Screen from '../components/Screen'
import { DemoTag, StatusPill, Updated } from '../components/Badges'
import { useStore } from '../lib/store'
import { CHACLACAYO, formatDateTime, timeAgo } from '../lib/utils'

type Layer = 'riesgo' | 'reportes' | 'recursos'

export default function MapPage() {
  const { riskAreas, reports, offers, lastUpdated } = useStore()
  const [layers, setLayers] = useState<Record<Layer, boolean>>({ riesgo: true, reportes: true, recursos: true })
  const [list, setList] = useState(false)

  const toggle = (l: Layer) => setLayers((s) => ({ ...s, [l]: !s[l] }))
  // Los descartados no se muestran en el mapa público.
  const visibleReports = reports.filter((r) => r.estado !== 'Descartado' && r.estado !== 'Resuelto')
  const visibleOffers = offers.filter((o) => o.estado === 'Disponible')

  const toggles: { id: Layer; label: string; desc: string; color: string }[] = [
    { id: 'riesgo', label: 'Zonas de riesgo', desc: 'Quebradas y áreas expuestas', color: 'accent-red-600' },
    { id: 'reportes', label: 'Reportes ciudadanos', desc: 'Incidentes y su estado de revisión', color: 'accent-blue-600' },
    { id: 'recursos', label: 'Recursos solidarios', desc: 'Agua, alimentos, transporte', color: 'accent-green-600' },
  ]

  return (
    <Screen
      title="Mapa solidario" subtitle="Chaclacayo"
      right={
        <button onClick={() => setList(!list)} aria-label={list ? 'Ver mapa' : 'Ver lista'} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10">
          {list ? <MapIcon /> : <List />}
        </button>
      }
    >
      <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-6">
      <fieldset className="card mb-3 space-y-2 lg:sticky lg:top-24 lg:mb-0">
        <legend className="sr-only">Capas del mapa</legend>
        {toggles.map((t) => (
          <label key={t.id} className="flex min-h-[44px] items-center gap-3">
            <input type="checkbox" className={`h-6 w-6 ${t.color}`} checked={layers[t.id]} onChange={() => toggle(t.id)} />
            <span>
              <span className="block font-semibold leading-tight">{t.label}</span>
              <span className="text-sm text-slate-600">{t.desc}</span>
            </span>
          </label>
        ))}
        <Updated iso={lastUpdated} />
      </fieldset>

      <div className="min-w-0">
      {!list ? (
        <>
          <div className="h-[55vh] overflow-hidden rounded-2xl ring-1 ring-slate-300 lg:h-[68vh]">
            <MapContainer center={CHACLACAYO} zoom={14} className="h-full w-full">
              <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {layers.riesgo && riskAreas.map((a) => (
                <Polygon key={a.id} positions={a.polygon} pathOptions={{ color: '#dc2626', fillOpacity: 0.25, dashArray: a.esOficial ? undefined : '6 6' }}>
                  <Popup>
                    <strong>{a.nombre}</strong><br />
                    {a.esOficial ? 'Fuente oficial' : 'Referencia orientativa, no oficial'}<br />
                    Fuente: {a.fuente}<br />Fecha: {a.fechaFuente}
                  </Popup>
                </Polygon>
              ))}
              {layers.reportes && visibleReports.map((r) => {
                const verified = r.estado === 'Verificado por coordinador' || r.estado === 'En atención'
                return (
                  <CircleMarker key={r.id} center={[r.lat, r.lon]} radius={verified ? 11 : 9}
                    pathOptions={{ color: '#1d4ed8', fillColor: verified ? '#dc2626' : '#ffffff', fillOpacity: 0.9, weight: 3, dashArray: verified ? undefined : '3 3' }}>
                    <Popup>
                      <strong>{r.tipo}</strong> {r.demo && '(DEMO)'}<br />
                      {verified ? 'Verificado por coordinador' : 'Reporte ciudadano: pendiente de revisión'}<br />
                      {timeAgo(r.createdAt)}
                    </Popup>
                  </CircleMarker>
                )
              })}
              {layers.recursos && visibleOffers.map((o) => (
                <CircleMarker key={o.id} center={[o.lat, o.lon]} radius={9} pathOptions={{ color: '#15803d', fillColor: '#22c55e', fillOpacity: 0.9 }}>
                  <Popup>
                    <strong>{o.categoria}</strong> {o.demo && '(DEMO)'}<br />
                    {o.descripcion}<br />{o.disponibilidad}<br />Actualizado {formatDateTime(o.createdAt)}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
          <ul className="card mt-3 space-y-1 text-sm" aria-label="Leyenda">
            <li>▨ Zona de riesgo (línea punteada = referencia no oficial)</li>
            <li>◌ Reporte ciudadano <strong>pendiente de revisión</strong> (borde punteado)</li>
            <li>● Reporte <strong>verificado por coordinador</strong> (relleno rojo)</li>
            <li>● Recurso solidario disponible (verde)</li>
          </ul>
        </>
      ) : (
        <ul className="grid gap-2 xl:grid-cols-2">
          {layers.riesgo && riskAreas.map((a) => (
            <li key={a.id} className="card"><p className="font-semibold">{a.nombre}</p><p className="text-sm text-slate-600">Fuente: {a.fuente}</p></li>
          ))}
          {layers.reportes && visibleReports.map((r) => (
            <li key={r.id} className="card">
              <p className="font-semibold">{r.tipo} {r.demo && <DemoTag />}</p>
              <StatusPill label={r.estado === 'Verificado por coordinador' ? 'Verificado' : 'Pendiente de revisión'} tone={r.estado === 'Verificado por coordinador' ? 'green' : 'amber'} />
              <p className="mt-1 text-sm text-slate-600">{timeAgo(r.createdAt)}</p>
            </li>
          ))}
          {layers.recursos && visibleOffers.map((o) => (
            <li key={o.id} className="card"><p className="font-semibold">{o.categoria} {o.demo && <DemoTag />}</p><p className="text-sm">{o.descripcion}</p><p className="text-sm text-slate-600">{o.zona} · {o.disponibilidad}</p></li>
          ))}
        </ul>
      )}
      </div>
      </div>
    </Screen>
  )
}
