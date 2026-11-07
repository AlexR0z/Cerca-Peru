import { AlertTriangle, CheckCircle2, Clock, CloudUpload, XCircle } from 'lucide-react'
import type { Priority, SyncState } from '../types'

/** Los estados siempre llevan texto e icono, nunca solo color. */
export function SyncBadge({ sync, error }: { sync: SyncState; error?: string }) {
  if (sync === 'enviado')
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700"><CheckCircle2 size={14} /> Enviado</span>
  if (sync === 'error')
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700"><XCircle size={14} /> Error{error ? `: ${error}` : ''}</span>
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700"><CloudUpload size={14} /> Pendiente de envío</span>
}

export function StatusPill({ label, tone = 'slate' }: { label: string; tone?: 'slate' | 'green' | 'amber' | 'red' | 'blue' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-green-100 text-green-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
  }
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{label}</span>
}

export function PriorityPill({ p }: { p: Priority }) {
  const tone = p === 'Alta' ? 'red' : p === 'Media' ? 'amber' : 'slate'
  return <StatusPill label={p} tone={tone} />
}

export function DemoTag() {
  return <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">Demo</span>
}

export function EmergencyNotice() {
  return (
    <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900" role="note">
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
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      <Clock size={12} /> Actualizado {new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
    </span>
  )
}
