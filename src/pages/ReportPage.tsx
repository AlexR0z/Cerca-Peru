import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, CheckCircle2, ArrowRight } from 'lucide-react'
import Screen from '../components/Screen'
import LocationField, { type Point } from '../components/LocationField'
import { EmergencyNotice, SyncBadge, StatusPill } from '../components/Badges'
import { useStore } from '../lib/store'
import { zonaCercana, type Zona } from '../lib/geo'
import { REPORT_TYPES, type EmergencyReport, type ReportType } from '../types'
import { reducirFoto, validateImage } from '../lib/utils'

const MAX = 200

export default function ReportPage() {
  const { addReport, reports, online, zoneLabel, mode } = useStore()
  const [step, setStep] = useState(1)
  const [tipo, setTipo] = useState<ReportType>('Huayco')
  const [desc, setDesc] = useState('')
  const [point, setPoint] = useState<Point | null>(null)
  const [referencia, setReferencia] = useState('')
  const [zona, setZona] = useState<Zona | null>(null)
  const [photo, setPhoto] = useState<{ url: string; blob: Blob } | null>(null)
  const [photoErr, setPhotoErr] = useState('')
  const [doneId, setDoneId] = useState<string | null>(null)

  const done: EmergencyReport | undefined = reports.find((r) => r.clientId === doneId)

  const onPhoto = async (f?: File) => {
    if (!f) return
    const err = validateImage(f)
    setPhotoErr(err ?? '')
    if (err) return
    try { setPhoto(await reducirFoto(f)) } catch (e) { setPhotoErr(e instanceof Error ? e.message : 'No pudimos leer esa imagen.') }
  }

  /** Al marcar el punto (o usar el GPS) se sugiere el distrito donde está; la persona puede dejar el de su perfil. */
  const onPoint = (p: Point) => {
    setPoint(p)
    const z = zonaCercana(p.lat, p.lon)
    setZona(z && z.km <= 60 ? { departamento: z.departamento, provincia: z.provincia, distrito: z.distrito } : null)
  }

  const submit = () => {
    if (!point) return
    const r = addReport({ tipo, descripcion: desc.trim(), lat: point.lat, lon: point.lon, referencia: referencia.trim() || undefined, zona: zona ?? undefined, foto: photo?.blob })
    setDoneId(r.clientId)
  }

  if (done) {
    return (
      <Screen title="Reporte recibido" hideNav>
        <div className="card space-y-3 text-center">
          <CheckCircle2 className="mx-auto text-green-600" size={56} />
          <p className="text-lg font-bold">{done.sync === 'enviado' ? 'Tu reporte fue enviado' : 'Tu reporte quedó guardado en este dispositivo'}</p>
          {done.code === 'Pendiente'
            ? <p className="text-sm font-bold text-slate-600">El código se asigna cuando llega al servidor.</p>
            : <p className="text-3xl font-extrabold tracking-wider text-brand-600">{done.code}</p>}
          <div className="flex justify-center gap-2"><StatusPill label={done.estado} tone="blue" /> <SyncBadge sync={done.sync} error={done.syncError} /></div>
          {done.sync !== 'enviado' && (
            <p className="text-sm text-slate-600">
              {online ? 'Enviando…' : 'No tienes conexión. Lo enviaremos automáticamente cuando vuelva internet.'}
            </p>
          )}
          <p className="text-sm text-slate-600">Un reporte ciudadano no es una alerta oficial. Un coordinador lo revisará.</p>
        </div>
        <div className="mt-4"><EmergencyNotice /></div>
        <Link to="/inicio" className="btn-primary mt-4">Volver al inicio</Link>
      </Screen>
    )
  }

  const stepNames = ['Detalle', 'Ubicación', 'Confirmar']
  const dondeTexto = zona ? `${zona.distrito}, ${zona.departamento}` : zoneLabel

  return (
    <Screen title="Reportar emergencia" back hideNav>
      <ol className="mb-4 flex justify-between text-sm" aria-label="Pasos">
        {stepNames.map((n, i) => (
          <li key={n} aria-current={step === i + 1 ? 'step' : undefined} className={`flex items-center gap-1.5 ${step === i + 1 ? 'font-bold text-brand-600' : 'text-slate-500'}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-md border-2 border-ink text-xs font-extrabold ${step >= i + 1 ? 'bg-inti text-ink' : 'bg-white text-ink'}`}>{i + 1}</span>{n}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <div className="space-y-4">
          <fieldset>
            <legend className="label">Tipo de emergencia</legend>
            <div className="grid grid-cols-3 gap-2">
              {REPORT_TYPES.map((t) => (
                <button key={t} type="button" aria-pressed={tipo === t} onClick={() => setTipo(t)} className="chip">{t}</button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="desc" className="label">Descripción</label>
            <textarea id="desc" className="field" rows={4} maxLength={MAX} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="¿Qué está pasando? Ej.: desborde de quebrada, viviendas afectadas" />
            <p className="text-right text-xs text-slate-500">{desc.length}/{MAX}</p>
          </div>
          <div>
            <span className="label">Foto (opcional)</span>
            <label className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-lg border-[3px] border-dashed border-ink bg-white font-bold text-ink">
              <Camera /> {photo ? 'Cambiar foto' : 'Agregar foto'}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => void onPhoto(e.target.files?.[0])} />
            </label>
            {photoErr && <p role="alert" className="mt-1 text-sm text-red-700">{photoErr}</p>}
            {photo && <img src={photo.url} alt="Vista previa de la foto" className="mt-2 h-28 rounded-lg object-cover" />}
            {photo && (
              <p className="text-xs text-slate-500">
                {mode === 'cloud' ? 'La foto se envía junto con el reporte. Solo la ve quien reporta y la coordinación.' : 'En la demostración la foto no se guarda.'}
              </p>
            )}
          </div>
          <button className="btn-primary" disabled={desc.trim().length < 5} onClick={() => setStep(2)}>Continuar <ArrowRight size={20} /></button>
          {desc.trim().length < 5 && <p className="text-center text-sm text-slate-500">Escribe al menos unas palabras para continuar.</p>}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="label">¿Dónde está pasando?</p>
          <LocationField value={point} onChange={onPoint} />
          <div>
            <label htmlFor="ref" className="label">Referencia (opcional)</label>
            <input id="ref" className="field" maxLength={150} value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ej.: frente al colegio, cerca del puente" />
            <p className="text-xs text-slate-500">Solo la ven quien reporta y la coordinación. En el mapa público no se muestra.</p>
          </div>
          <button className="btn-primary" disabled={!point} onClick={() => setStep(3)}>Continuar <ArrowRight size={20} /></button>
          {!point && <p className="text-center text-sm text-slate-500">Marca un punto en el mapa o usa tu ubicación.</p>}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="card space-y-1">
            <p className="text-sm text-slate-500">Tipo</p><p className="font-semibold">{tipo}</p>
            <p className="pt-2 text-sm text-slate-500">Descripción</p><p>{desc}</p>
            <p className="pt-2 text-sm text-slate-500">Ubicación</p><p>Punto aproximado marcado · {dondeTexto}{referencia.trim() ? ` · ${referencia.trim()}` : ''}</p>
          </div>
          <EmergencyNotice />
          {!online && <p role="status" className="rounded-lg border-[3px] border-ink bg-ink p-3 text-sm font-bold text-white shadow-brut-sm">Sin conexión: se guardará como pendiente y se enviará después. No se envía hasta que vuelva internet.</p>}
          <button className="btn-primary" onClick={submit}>{online ? 'Enviar reporte' : 'Guardar para enviar después'}</button>
          <button className="btn-outline" onClick={() => setStep(2)}>Volver</button>
        </div>
      )}
    </Screen>
  )
}
