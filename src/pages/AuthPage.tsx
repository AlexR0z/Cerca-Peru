import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { KeyRound, Mail, UserPlus } from 'lucide-react'
import { Chakana, TextileStrip } from '../components/Peru'
import { useStore } from '../lib/store'
import { isEmbed } from '../lib/supabase'
import * as auth from '../lib/auth'

type Modo = 'entrar' | 'crear' | 'codigo-registro' | 'recuperar' | 'codigo-recuperacion' | 'nueva-clave'

const TITULOS: Record<Modo, string> = {
  entrar: 'Iniciar sesión',
  crear: 'Crear cuenta',
  'codigo-registro': 'Confirma tu correo',
  recuperar: 'Recuperar contraseña',
  'codigo-recuperacion': 'Ingresa el código',
  'nueva-clave': 'Nueva contraseña',
}

/**
 * Acceso con la misma cuenta que la app móvil (Supabase: correo y contraseña).
 * Confirmar el correo y recuperar la contraseña se hacen con un código de 6 dígitos que llega al correo.
 */
export default function AuthPage() {
  const { mode, session, authReady } = useStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [modo, setModo] = useState<Modo>('entrar')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [clave2, setClave2] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [visible, setVisible] = useState('')
  const [visibleEditado, setVisibleEditado] = useState(false) // mientras no lo toque, sigue al nombre
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)

  // Si volvió con una recuperación a medias (se recargó la página), se continúa donde iba.
  useEffect(() => { if (auth.recuperando() && session) setModo('nueva-clave') }, [session])
  useEffect(() => { if (params.get('modo') === 'crear') setModo('crear') }, [params])

  // Sin la nube no hay cuentas: se pasa directo a la app. En el tablero de pantallas (embed) sí se muestra el formulario.
  if (mode === 'demo' && !isEmbed) return <Navigate to="/inicio" replace />
  if (authReady && session && !auth.recuperando() && modo !== 'nueva-clave') return <Navigate to="/inicio" replace />

  const ir = (m: Modo) => { setModo(m); setError(''); setAviso(''); setCodigo('') }

  const ejecutar = async (accion: () => Promise<void>) => {
    setOcupado(true); setError(''); setAviso('')
    try { await accion() } catch (e) {
      const ec = e as auth.ErrorCuenta
      if (ec.codigo === 'sin_confirmar') {
        setModo('codigo-registro')
        try { await auth.reenviarCodigoRegistro(correo.trim()); setAviso('Tu correo aún no está confirmado. Te enviamos un código nuevo.') } catch { /* se puede pedir otro */ }
      } else setError(ec.message || 'No se pudo completar la acción.')
    } finally { setOcupado(false) }
  }

  const entrar = (e: FormEvent) => {
    e.preventDefault()
    if (!auth.validar.correo(correo.trim())) return setError('Ingresa un correo válido.')
    if (!clave) return setError('Ingresa tu contraseña.')
    void ejecutar(async () => { await auth.entrar(correo.trim(), clave); navigate('/inicio', { replace: true }) })
  }

  const crear = (e: FormEvent) => {
    e.preventDefault()
    if (!auth.validar.nombre(nombre.trim()) || !auth.validar.nombre(apellido.trim())) return setError('Escribe tu nombre y tu apellido (solo letras).')
    if (visible.trim().length < 2 || visible.trim().length > 30) return setError('El nombre visible debe tener entre 2 y 30 caracteres.')
    if (!auth.validar.correo(correo.trim())) return setError('Ingresa un correo válido.')
    if (!auth.validar.clave(clave)) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (clave !== clave2) return setError('Las contraseñas no coinciden.')
    void ejecutar(async () => {
      const r = await auth.registrar({ correo: correo.trim(), clave, nombre: nombre.trim(), apellido: apellido.trim(), nombreVisible: visible.trim() })
      if (r.conSesion) navigate('/perfil?bienvenida=1', { replace: true })
      else { setModo('codigo-registro'); setAviso('Te enviamos un código de 6 dígitos a tu correo.') }
    })
  }

  const confirmarRegistro = (e: FormEvent) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(codigo)) return setError('El código tiene 6 dígitos.')
    void ejecutar(async () => { await auth.verificarCodigoRegistro(correo.trim(), codigo); navigate('/perfil?bienvenida=1', { replace: true }) })
  }

  const pedirRecuperacion = (e: FormEvent) => {
    e.preventDefault()
    if (!auth.validar.correo(correo.trim())) return setError('Ingresa un correo válido.')
    void ejecutar(async () => { await auth.pedirCodigoRecuperacion(correo.trim()); setModo('codigo-recuperacion'); setAviso('Si ese correo tiene cuenta, te enviamos un código de 6 dígitos.') })
  }

  const confirmarRecuperacion = (e: FormEvent) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(codigo)) return setError('El código tiene 6 dígitos.')
    void ejecutar(async () => { await auth.verificarCodigoRecuperacion(correo.trim(), codigo); setModo('nueva-clave') })
  }

  const guardarClave = (e: FormEvent) => {
    e.preventDefault()
    if (!auth.validar.clave(clave)) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (clave !== clave2) return setError('Las contraseñas no coinciden.')
    void ejecutar(async () => {
      await auth.cambiarClaveRecuperada(clave)
      setClave(''); setClave2(''); setModo('entrar'); setAviso('Listo: ya puedes entrar con tu contraseña nueva.')
    })
  }

  const reenviar = () => void ejecutar(async () => {
    if (modo === 'codigo-registro') await auth.reenviarCodigoRegistro(correo.trim())
    else await auth.pedirCodigoRecuperacion(correo.trim())
    setAviso('Te enviamos un código nuevo. Revisa también la carpeta de spam.')
  })

  const campoCodigo = (
    <div>
      <label htmlFor="codigo" className="label">Código de 6 dígitos</label>
      <input id="codigo" className="field text-center text-2xl tracking-[0.5em]" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} />
      <p className="mt-1 text-sm text-slate-600">Lo enviamos a <strong>{correo}</strong>. Si no lo ves, mira en spam.</p>
    </div>
  )

  return (
    <div className="flex min-h-full flex-col bg-crema">
      <TextileStrip height={14} />
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-8">
        <Link to="/" className="mb-5 flex items-center justify-center gap-3">
          <Chakana size={40} />
          <span className="font-display text-3xl uppercase leading-none text-brand-600">Cerca Perú</span>
        </Link>

        <div className="card space-y-4">
          <h1 className="text-center text-2xl uppercase">{TITULOS[modo]}</h1>
          <p className="text-center text-sm text-slate-600">Es la misma cuenta que usas en la app móvil de Perú Vive.</p>

          {aviso && <p role="status" className="rounded-lg border-[3px] border-ink bg-turq p-3 text-sm font-bold text-ink">{aviso}</p>}
          {error && <p role="alert" className="rounded-lg border-[3px] border-ink bg-[#ffd9dc] p-3 text-sm font-bold text-ink">{error}</p>}

          {modo === 'entrar' && (
            <form className="space-y-3" onSubmit={entrar} noValidate>
              <div><label htmlFor="correo" className="label">Correo electrónico</label>
                <input id="correo" type="email" className="field" autoComplete="username" value={correo} onChange={(e) => setCorreo(e.target.value)} /></div>
              <div><label htmlFor="clave" className="label">Contraseña</label>
                <input id="clave" type="password" className="field" autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} /></div>
              <button className="btn-primary" disabled={ocupado}><Mail size={20} /> {ocupado ? 'Entrando…' : 'Ingresar'}</button>
              <button type="button" className="w-full text-sm font-bold underline" onClick={() => ir('recuperar')}>¿Olvidaste tu contraseña?</button>
              <button type="button" className="btn-outline" onClick={() => ir('crear')}><UserPlus size={20} /> Crear cuenta</button>
            </form>
          )}

          {modo === 'crear' && (
            <form className="space-y-3" onSubmit={crear} noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div><label htmlFor="nom" className="label">Nombre</label><input id="nom" className="field" autoComplete="given-name" value={nombre} onChange={(e) => { setNombre(e.target.value); if (!visibleEditado) setVisible(e.target.value.trim().split(' ')[0].slice(0, 30)) }} /></div>
                <div><label htmlFor="ape" className="label">Apellido</label><input id="ape" className="field" autoComplete="family-name" value={apellido} onChange={(e) => setApellido(e.target.value)} /></div>
              </div>
              <div><label htmlFor="vis" className="label">Nombre visible</label>
                <input id="vis" className="field" maxLength={30} value={visible} onChange={(e) => { setVisibleEditado(true); setVisible(e.target.value) }} />
                <p className="text-xs text-slate-600">Es el único nombre que ven los demás.</p></div>
              <div><label htmlFor="correo" className="label">Correo electrónico</label>
                <input id="correo" type="email" className="field" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} /></div>
              <div><label htmlFor="clave" className="label">Contraseña (mínimo 8 caracteres)</label>
                <input id="clave" type="password" className="field" autoComplete="new-password" value={clave} onChange={(e) => setClave(e.target.value)} /></div>
              <div><label htmlFor="clave2" className="label">Repite la contraseña</label>
                <input id="clave2" type="password" className="field" autoComplete="new-password" value={clave2} onChange={(e) => setClave2(e.target.value)} /></div>
              <button className="btn-primary" disabled={ocupado}><UserPlus size={20} /> {ocupado ? 'Creando…' : 'Crear cuenta'}</button>
              <button type="button" className="btn-outline" onClick={() => ir('entrar')}>Ya tengo cuenta</button>
            </form>
          )}

          {modo === 'codigo-registro' && (
            <form className="space-y-3" onSubmit={confirmarRegistro} noValidate>
              {campoCodigo}
              <button className="btn-primary" disabled={ocupado}><KeyRound size={20} /> {ocupado ? 'Comprobando…' : 'Confirmar'}</button>
              <button type="button" className="w-full text-sm font-bold underline" onClick={reenviar}>Reenviar código</button>
              <button type="button" className="btn-outline" onClick={() => ir('entrar')}>Ya tengo cuenta</button>
            </form>
          )}

          {modo === 'recuperar' && (
            <form className="space-y-3" onSubmit={pedirRecuperacion} noValidate>
              <div><label htmlFor="correo" className="label">Correo electrónico</label>
                <input id="correo" type="email" className="field" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} /></div>
              <button className="btn-primary" disabled={ocupado}><Mail size={20} /> {ocupado ? 'Enviando…' : 'Enviarme un código'}</button>
              <button type="button" className="btn-outline" onClick={() => ir('entrar')}>Volver</button>
            </form>
          )}

          {modo === 'codigo-recuperacion' && (
            <form className="space-y-3" onSubmit={confirmarRecuperacion} noValidate>
              {campoCodigo}
              <button className="btn-primary" disabled={ocupado}><KeyRound size={20} /> {ocupado ? 'Comprobando…' : 'Continuar'}</button>
              <button type="button" className="w-full text-sm font-bold underline" onClick={reenviar}>Reenviar código</button>
              <button type="button" className="btn-outline" onClick={() => ir('entrar')}>Volver</button>
            </form>
          )}

          {modo === 'nueva-clave' && (
            <form className="space-y-3" onSubmit={guardarClave} noValidate>
              <div><label htmlFor="clave" className="label">Contraseña nueva (mínimo 8 caracteres)</label>
                <input id="clave" type="password" className="field" autoComplete="new-password" value={clave} onChange={(e) => setClave(e.target.value)} /></div>
              <div><label htmlFor="clave2" className="label">Repite la contraseña</label>
                <input id="clave2" type="password" className="field" autoComplete="new-password" value={clave2} onChange={(e) => setClave2(e.target.value)} /></div>
              <button className="btn-primary" disabled={ocupado}>{ocupado ? 'Guardando…' : 'Guardar contraseña'}</button>
            </form>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-slate-600">Prototipo comunitario. No es un sistema oficial de alerta ni de despacho de emergencias.</p>
      </div>
    </div>
  )
}
