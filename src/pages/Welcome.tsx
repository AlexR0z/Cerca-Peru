import { Link } from 'react-router-dom'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { AndesScene, Chakana, TextileStrip } from '../components/Peru'
import { isDemoMode } from '../lib/supabase'

export default function Welcome() {
  return (
    <div className="flex min-h-full flex-col bg-brand-600 text-white">
      <TextileStrip height={18} />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-5 py-8 lg:max-w-6xl lg:grid lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-10">
        <div className="text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-lg border-[3px] border-ink bg-inti px-3 py-1 text-sm font-extrabold text-ink shadow-brut-sm">
            <Chakana size={20} /> Hecho en Perú · Misma cuenta que la app móvil
          </p>
          <h1 className="mt-4 text-6xl uppercase leading-[0.95] [text-shadow:5px_5px_0_#111] sm:text-7xl lg:text-8xl">
            Cerca<br />Perú
          </h1>
          <p className="mt-4 text-xl font-extrabold lg:text-2xl">Red de apoyo comunitario en emergencias</p>

          <blockquote className="mt-5 rounded-lg border-[3px] border-ink bg-crema p-4 text-lg font-bold text-ink shadow-brut">
            “Cuando más nos necesitamos, estamos más cerca.”
          </blockquote>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link to="/inicio" className="btn-light">Comenzar <ArrowRight size={20} /></Link>
            <Link to="/tutorial" className="btn-outline"><PlayCircle size={20} /> Ver cómo funciona</Link>
          </div>
          {!isDemoMode && <p className="mt-3 text-sm font-bold"><Link to="/acceso" className="underline">Iniciar sesión</Link> · <Link to="/acceso?modo=crear" className="underline">Crear cuenta</Link></p>}
          <p className="mt-5 text-xs font-medium text-white/90">
            Prototipo comunitario. No es un sistema oficial de alerta ni de despacho de emergencias.
          </p>
        </div>

        <div>
          <div className="overflow-hidden rounded-lg border-[3px] border-ink bg-white shadow-brut-lg">
            <AndesScene />
          </div>
          <p className="mt-4 text-center font-display text-lg uppercase [text-shadow:3px_3px_0_#111]">
            Ayni: hoy por ti, mañana por mí
          </p>
        </div>
      </div>
      <TextileStrip height={18} />
    </div>
  )
}
