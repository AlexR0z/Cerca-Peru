import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Modo presentación: el tablero de pantallas abre la app con "embed=1" (en la parte ?... o en la parte #...).
 * Ahí siempre se usan datos de demostración, sin iniciar sesión ni tocar el servidor.
 */
export const isEmbed = /[?&]embed=1(?=$|[&#])/.test(window.location.search + window.location.hash)

/**
 * Cliente de la base de datos compartida con la app móvil de Perú Vive (Supabase).
 * null cuando no hay configuración (o en modo presentación): la app entra en MODO DEMO con datos locales.
 */
export const supabase =
  !isEmbed && url && anon
    ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
    : null
export const isDemoMode = !supabase
