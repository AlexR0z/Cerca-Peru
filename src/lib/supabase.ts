import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** null cuando no hay configuración: la app entra en MODO DEMO (datos locales). */
export const supabase = url && anon ? createClient(url, anon) : null
export const isDemoMode = !supabase
