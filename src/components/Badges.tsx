import { AlertTriangle, CheckCircle2, Clock, CloudUpload, XCircle } from 'lucide-react'
import type { Priority, SyncState } from '../types'

/** Los estados siempre llevan texto e icono, nunca solo color. */
export function SyncBadge({ sync, error }: { sync: SyncState; error?: string }) {
  if (sync === 'enviado')
    return <span className="inline-flex items-center gap-1 text-xs font-bold text-green-800"><CheckCircle2 size={14} /> Enviado</span>
  if (sync === 'error')
    return <span className="inline-flex items-center gap-1 text-xs font-bold text-red-800"><XCircle size={14} /> Error{error ? `: ${error}` : ''}</span>
  return <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800"><CloudUpload size={14} /> Pendiente de envío</span>
}

export function StatusPill({ label, tone = 'slate' }: { label: string; tone?: 'slate' | 'green' | 'amber' | 'red' | 'blue' }) {
  const tones = {
    slate: 'bg-white',
    green: 'bg-[#9be7b0]',
    amber: 'bg-inti',
    red: 'bg-[#ff9aa2]',
    blue: 'bg-[#8fe3e5]',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border-2 border-ink px-2 py-0.5 text-xs font-extrabold text-ink ${tones[tone]}`}>
      {label}
    </span>
  )
}

export function PriorityPill({ p }: { p: Priority }) {
  const tone = p === 'Alta' ? 'red' : p === 'Media' ? 'amber' : 'slate'
  return <StatusPill label={p} tone={tone} />
}

export function DemoTag() {
  return <span className="rounded border-2 border-ink bg-inti px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-ink">Demo</span>
}

export function EmergencyNotice() {
  return (
    <div className="flex gap-2 rounded-lg border-[3px] border-ink bg-[#ffd9dc] p-3 text-sm font-medium text-ink shadow-brut-sm" role="note">
      <AlertTriangle className="mt-0.5 shrink-0" size={18} />
      <p>
        Si hay peligro inmediato, llama a los servicios oficiales: <strong>Bomberos 116</strong>, <strong>Policía 105</strong>,{' '}
        <strong>SAMU 106</strong>. Cerca Perú no reemplaza a INDECI, la municipalidad ni a las líneas oficiales.
      </p>
    </div>
  )
}

export function Updated({ iso }: { iso: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
      <Clock size={12} /> Actualizado {new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
    </span>
  )
}
