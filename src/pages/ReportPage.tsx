import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, CheckCircle2, ArrowRight } from 'lucide-react'
import Screen from '../components/Screen'
import LocationField, { type Point } from '../components/LocationField'
import { EmergencyNotice, SyncBadge, StatusPill } from '../components/Badges'
import { useStore } from '../lib/store'
import { REPORT_TYPES, type EmergencyReport, type ReportType } from '../types'
import { validateImage } from '../lib/utils'

const MAX = 200

export default function ReportPage() {
  const { addReport, reports, online } = useStore()
  const [step, setStep] = useState(1)
  const [tipo, setTipo] = useState<ReportType>('Huaico')
  const [desc, setDesc] = useState('')
  const [point, setPoint] = useState<Point | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoErr, setPhotoErr] = useState('')
  const [doneId, setDoneId] = useState<string | null>(null)

  const done: EmergencyReport | undefined = reports.find((r) => r.id === doneId)

  const onPhoto = (f?: File) => {
    if (!f) return
    const err = validateImage(f)
    setPhotoErr(err ?? '')
    if (!err) setPhotoUrl(URL.createObjectURL(f))
  }

  const submit = () => {
    if (!point) return
    const r = addReport({ tipo, descripcion: desc.trim(), lat: point.lat, lon: point.lon })
    setDoneId(r.id)
  }

  if (done) {
    return (
      <Screen title="Reporte recibido" hideNav>
        <div className="card space-y-3 text-center">
          <CheckCircle2 className="mx-auto text-green-600" size={56} />
          <p className="text-lg font-bold">{done.sync === 'enviado' ? 'Tu reporte fue enviado' : 'Tu reporte quedó guardado en este dispositivo'}</p>
          <p className="text-3xl font-extrabold tracking-wider text-brand-600">{done.code}</p>
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

  return (
    <Screen title="Reportar emergencia" back hideNav>
      <ol className="mb-4 flex justify-between text-sm" aria-label="Pasos">
        {stepNames.map((n, i) => (
          <li key={n} aria-current={step === i + 1 ? 'step' : undefined} className={`flex items-center gap-1.5 ${step === i + 1 ? 'font-bold text-brand-600' : 'text-slate-500'}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs text-white ${step >= i + 1 ? 'bg-brand-600' : 'bg-slate-400'}`}>{i + 1}</span>{n}
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
            <label className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white font-medium text-slate-700">
              <Camera /> Agregar foto
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
            </label>
            {photoErr && <p role="alert" className="mt-1 text-sm text-red-700">{photoErr}</p>}
            {photoUrl && <img src={photoUrl} alt="Vista previa de la foto" className="mt-2 h-28 rounded-lg object-cover" />}
            {photoUrl && <p className="text-xs text-slate-500">La subida de fotos al servidor aún no está activa en esta versión.</p>}
          </div>
          <button className="btn-primary" disabled={desc.trim().length < 5} onClick={() => setStep(2)}>Continuar <ArrowRight size={20} /></button>
          {desc.trim().length < 5 && <p className="text-center text-sm text-slate-500">Escribe al menos unas palabras para continuar.</p>}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="label">¿Dónde está pasando?</p>
          <LocationField value={point} onChange={setPoint} />
          <button className="btn-primary" disabled={!point} onClick={() => setStep(3)}>Continuar <ArrowRight size={20} /></button>
          {!point && <p className="text-center text-sm text-slate-500">Marca un punto en el mapa o usa tu ubicación.</p>}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="card space-y-1">
            <p className="text-sm text-slate-500">Tipo</p><p className="font-semibold">{tipo}</p>
            <p className="pt-2 text-sm text-slate-500">Descripción</p><p>{desc}</p>
            <p className="pt-2 text-sm text-slate-500">Ubicación</p><p>Punto aproximado marcado</p>
          </div>
          <EmergencyNotice />
          {!online && <p role="status" className="rounded-xl bg-slate-800 p-3 text-sm text-white">Sin conexión: se guardará como pendiente y se enviará después. No se envía hasta que vuelva internet.</p>}
          <button className="btn-primary" onClick={submit}>{online ? 'Enviar reporte' : 'Guardar para enviar después'}</button>
          <button className="btn-outline" onClick={() => setStep(2)}>Volver</button>
        </div>
      )}
    </Screen>
  )
}
