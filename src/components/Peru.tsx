import { useId } from 'react'

/** Chakana: la cruz andina escalonada, símbolo de los tres mundos. */
export function Chakana({ size = 32, className = '', fill = '#ffc20e' }: { size?: number; className?: string; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="-4 -4 108 108" className={className} aria-hidden>
      <path
        d="M40 0H60V20H80V40H100V60H80V80H60V100H40V80H20V60H0V40H20V20H40Z"
        fill={fill} stroke="#111" strokeWidth="6" strokeLinejoin="miter"
      />
      <circle cx="50" cy="50" r="9" fill="#111" />
    </svg>
  )
}

/** Guarda de textil andino (greca escalonada) para separar secciones. */
export function TextileStrip({ className = '', height = 14 }: { className?: string; height?: number }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width="100%" height={height} className={`block ${className}`} aria-hidden preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="28" height="14" patternUnits="userSpaceOnUse">
          <rect width="28" height="14" fill="#111" />
          <polygon points="0,14 0,8 7,8 7,2 14,2 14,8 21,8 21,14" fill="#ffc20e" />
          <polygon points="14,0 14,2 21,2 21,8 28,8 28,0" fill="#c2006b" />
          <polygon points="0,0 0,2 7,2 7,0" fill="#00b5b8" />
          <rect x="24" y="10" width="4" height="4" fill="#d91023" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

function Llama({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const s = { stroke: '#111', strokeWidth: 3.5, strokeLinejoin: 'round' as const }
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <polygon points="20,46 8,40 18,56" fill="#fff4db" {...s} />
      {[24, 36, 50, 60].map((lx) => <rect key={lx} x={lx} y={64} width={7} height={22} fill="#fff4db" {...s} />)}
      <rect x={20} y={38} width={48} height={28} rx={4} fill="#fff4db" {...s} />
      <rect x={54} y={14} width={13} height={30} fill="#fff4db" {...s} />
      <rect x={54} y={6} width={26} height={15} rx={3} fill="#fff4db" {...s} />
      <polygon points="58,7 60,-3 65,7" fill="#fff4db" {...s} />
      <polygon points="66,7 69,-3 73,7" fill="#fff4db" {...s} />
      <circle cx={68} cy={12} r={2.2} fill="#111" />
      {/* aguayo (manta tejida) */}
      <rect x={28} y={38} width={30} height={20} fill="#c2006b" {...s} />
      <rect x={28} y={44} width={30} height={4} fill="#ffc20e" stroke="#111" strokeWidth={2} />
      <rect x={28} y={51} width={30} height={3} fill="#00b5b8" stroke="#111" strokeWidth={2} />
    </g>
  )
}

function House({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke="#111" strokeWidth="3.5" strokeLinejoin="round">
      <rect width="34" height="24" fill="#fff4db" />
      <polygon points="-4,0 17,-16 38,0" fill="#d91023" />
      <rect x="13" y="10" width="9" height="14" fill="#111" />
    </g>
  )
}

/** Ilustración plana: Andes, inti (sol), chakana, casitas y una llama con aguayo. */
export function AndesScene({ className = '' }: { className?: string }) {
  const rays = Array.from({ length: 12 }, (_, i) => i * 30)
  return (
    <svg viewBox="0 0 400 240" className={`block w-full ${className}`} role="img" aria-label="Ilustración de los Andes con una llama, el sol y casitas de un pueblo">
      <rect width="400" height="240" fill="#8fe3e5" />
      <g transform="translate(300 68)">
        {rays.map((a) => (
          <line key={a} x1="0" y1="-42" x2="0" y2="-56" transform={`rotate(${a})`} stroke="#111" strokeWidth="5" strokeLinecap="round" />
        ))}
        <circle r="34" fill="#ffc20e" stroke="#111" strokeWidth="4" />
        <circle r="14" fill="#fff4db" stroke="#111" strokeWidth="3" />
      </g>
      <polygon points="0,205 70,90 130,160 190,70 270,170 330,112 400,190 400,240 0,240" fill="#5b2a86" stroke="#111" strokeWidth="4" strokeLinejoin="round" />
      <polygon points="70,90 54,115 64,110 72,120 82,110 91,115" fill="#fff" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
      <polygon points="190,70 170,100 183,94 192,105 203,95 214,100" fill="#fff" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
      <path d="M0 232 L0 208 Q90 182 180 210 T400 206 L400 240 Z" fill="#1b9e4b" stroke="#111" strokeWidth="4" strokeLinejoin="round" />
      <House x={36} y={200} />
      <House x={318} y={200} />
      <Llama x={150} y={142} scale={0.95} />
      <g transform="translate(14 14)"><Chakana size={44} /></g>
    </svg>
  )
}
