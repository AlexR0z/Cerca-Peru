import { Link } from 'react-router-dom'
import { ArrowRight, Mountain, PlayCircle } from 'lucide-react'

export default function Welcome() {
  return (
    <div className="min-h-full bg-gradient-to-b from-brand-700 via-brand-600 to-brand-800 text-white lg:bg-gradient-to-br">
      <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-between px-6 pb-8 pt-16 text-center lg:min-h-screen lg:max-w-3xl lg:justify-center lg:gap-12 lg:py-16">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 lg:flex-none">
          <Mountain size={88} strokeWidth={1.5} aria-hidden className="lg:h-28 lg:w-28" />
          <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl">Cerca Perú</h1>
          <p className="max-w-xs text-lg text-white/90 lg:max-w-none lg:text-2xl">Red de apoyo comunitario en emergencias</p>
          <p className="mt-6 max-w-xs text-xl font-medium lg:max-w-none lg:text-2xl">“Cuando más nos necesitamos, estamos más cerca.”</p>
        </div>
        <div className="space-y-3">
          <p className="text-xs text-white/70 lg:text-sm">
            Piloto en Chaclacayo, Lima. No es un sistema oficial de alerta ni de despacho de emergencias.
          </p>
          <div className="space-y-3 lg:mx-auto lg:grid lg:max-w-xl lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            <Link to="/inicio" className="btn-light">Comenzar <ArrowRight size={20} /></Link>
            <Link to="/tutorial" className="btn border-2 border-white/70 text-white hover:bg-white/10">
              <PlayCircle size={20} /> Ver cómo funciona
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
