import { supabase } from './supabase'
import type { EmergencyReport, HelpRequest, ResourceOffer } from '../types'

export type Pushable =
  | { kind: 'report'; item: EmergencyReport }
  | { kind: 'request'; item: HelpRequest }
  | { kind: 'offer'; item: ResourceOffer }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Envía un elemento al servidor. Es idempotente: usa client_id como clave única,
 * así que reenviar tras un corte de red no crea duplicados.
 * En modo demo (sin Supabase) solo simula la latencia: los datos quedan en este dispositivo.
 */
export async function pushItem(p: Pushable): Promise<void> {
  if (!supabase) {
    await sleep(500)
    return
  }
  const { data } = await supabase.auth.getSession()
  if (!data.session) throw new Error('Inicia sesión para enviar tu solicitud.')

  let table: string
  let row: Record<string, unknown>
  if (p.kind === 'report') {
    table = 'emergency_reports'
    row = {
      client_id: p.item.clientId, code: p.item.code, tipo: p.item.tipo, descripcion: p.item.descripcion,
      lat_aprox: p.item.lat, lon_aprox: p.item.lon,
    }
  } else if (p.kind === 'request') {
    table = 'help_requests'
    row = {
      client_id: p.item.clientId, categoria: p.item.categoria, descripcion: p.item.descripcion,
      cantidad_personas: p.item.personas, zona: p.item.zona, lat_aprox: p.item.lat, lon_aprox: p.item.lon,
    }
  } else {
    table = 'resource_offers'
    row = {
      client_id: p.item.clientId, categoria: p.item.categoria, descripcion: p.item.descripcion,
      disponibilidad: p.item.disponibilidad, zona: p.item.zona, lat_aprox: p.item.lat, lon_aprox: p.item.lon,
    }
  }
  const { error } = await supabase.from(table).upsert(row, { onConflict: 'client_id', ignoreDuplicates: true })
  if (error) throw new Error(error.message)
}
