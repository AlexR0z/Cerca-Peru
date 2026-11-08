/**
 * Cuentas: las mismas que usa la app móvil de Perú Vive (correo + contraseña, con códigos de 6 dígitos
 * enviados al correo para confirmar la cuenta y para recuperar la contraseña).
 * Para que el código llegue en vez de un enlace, las plantillas de correo de Supabase deben usar {{ .Token }}
 * (ver supabase/LEEME.md de Perú Vive).
 */
import { cliente, traducir } from './cloud'

const MARCA_RECUPERANDO = 'cp_recuperando'

/** true mientras la persona valida el código de recuperación y aún no puso su contraseña nueva. */
export const recuperando = () => sessionStorage.getItem(MARCA_RECUPERANDO) === '1'

export class ErrorCuenta extends Error {
  constructor(mensaje: string, public codigo?: string) { super(mensaje) }
}

function lanzar(e: { message?: string; code?: string; status?: number }): never {
  const sinConfirmar = /email not confirmed/i.test(e.message ?? '')
  throw new ErrorCuenta(traducir(e), sinConfirmar ? 'sin_confirmar' : e.code)
}

export async function entrar(correo: string, clave: string): Promise<void> {
  const { error } = await cliente().auth.signInWithPassword({ email: correo, password: clave })
  if (error) lanzar(error)
}

export interface DatosRegistro { correo: string; clave: string; nombre: string; apellido: string; nombreVisible: string }

/** Devuelve conSesion=true si el proyecto no exige confirmar el correo; si no, hay que ingresar el código que llegó. */
export async function registrar(d: DatosRegistro): Promise<{ conSesion: boolean }> {
  const { data, error } = await cliente().auth.signUp({
    email: d.correo, password: d.clave,
    options: { data: { nombre: d.nombre, apellido: d.apellido, nombre_visible: d.nombreVisible } },
  })
  if (error) lanzar(error)
  return { conSesion: !!data.session }
}

export async function verificarCodigoRegistro(correo: string, codigo: string): Promise<void> {
  const { data, error } = await cliente().auth.verifyOtp({ email: correo, token: codigo, type: 'email' })
  if (error) lanzar(error)
  if (!data.session) throw new ErrorCuenta(traducir({ message: 'otp_expired' }))
}

export async function reenviarCodigoRegistro(correo: string): Promise<void> {
  const { error } = await cliente().auth.resend({ type: 'signup', email: correo })
  if (error) lanzar(error)
}

/** Envía un código al correo. La respuesta es la misma exista o no la cuenta. */
export async function pedirCodigoRecuperacion(correo: string): Promise<void> {
  const { error } = await cliente().auth.resetPasswordForEmail(correo)
  if (error) lanzar(error)
}

/** Comprueba el código. Queda una sesión temporal SOLO para poner la contraseña nueva. */
export async function verificarCodigoRecuperacion(correo: string, codigo: string): Promise<void> {
  sessionStorage.setItem(MARCA_RECUPERANDO, '1')
  const { data, error } = await cliente().auth.verifyOtp({ email: correo, token: codigo, type: 'recovery' })
  if (error || !data.session) {
    sessionStorage.removeItem(MARCA_RECUPERANDO)
    if (error) lanzar(error)
    throw new ErrorCuenta(traducir({ message: 'otp_expired' }))
  }
}

/** Guarda la contraseña nueva y cierra la sesión temporal para que la persona entre con la nueva. */
export async function cambiarClaveRecuperada(nueva: string): Promise<void> {
  const sb = cliente()
  const { error } = await sb.auth.updateUser({ password: nueva })
  if (error) lanzar(error)
  sessionStorage.removeItem(MARCA_RECUPERANDO)
  await sb.auth.signOut({ scope: 'local' })
}

/** Cierra la sesión solo en este navegador (no en los demás dispositivos de la persona). */
export async function salir(): Promise<void> {
  sessionStorage.removeItem(MARCA_RECUPERANDO)
  await cliente().auth.signOut({ scope: 'local' })
}

export const validar = {
  correo: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  clave: (v: string) => v.length >= 8,
  nombre: (v: string) => /^\p{L}[\p{L}\s'.-]*$/u.test(v) && v.length >= 2,
}
