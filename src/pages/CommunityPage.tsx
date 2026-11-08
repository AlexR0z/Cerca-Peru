import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Camera, Flag, Heart, MessageCircle, Send, Trash2 } from 'lucide-react'
import Screen from '../components/Screen'
import { DemoTag } from '../components/Badges'
import { useStore } from '../lib/store'
import { reducirFoto, timeAgo, validateImage } from '../lib/utils'
import type { Post } from '../types'

type Tab = 'vol' | 'pub' | 'rec'

function PostCard({ p, abierta, resaltada, alternar }: { p: Post; abierta: boolean; resaltada: boolean; alternar: () => void }) {
  const { toggleLike, addComment, deletePost, deleteComment, role } = useStore()
  const [texto, setTexto] = useState('')
  const [confirmar, setConfirmar] = useState<string | null>(null) // 'post' o el id del comentario
  const [msg, setMsg] = useState('')
  const puedeBorrarPost = p.mia || role === 'coordinador'

  const comentar = async (e: FormEvent) => {
    e.preventDefault()
    const t = texto.trim().replace(/\s+/g, ' ')
    if (!t) return
    const r = await addComment(p.id, t)
    if (r.ok) setTexto(''); else setMsg(r.message)
  }

  return (
    <li id={`pub-${p.id}`} className={`card space-y-2 ${resaltada ? 'ring-4 ring-inti' : ''}`}>
      <div className="flex items-center gap-2">
        <div aria-hidden className="flex h-10 w-10 items-center justify-center rounded-lg border-[3px] border-ink bg-inti font-display text-ink">{p.autor[0]}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{p.autor} {p.demo && <DemoTag />}</p>
          <p className="text-xs text-slate-500">{timeAgo(p.createdAt)}</p>
        </div>
        {puedeBorrarPost
          ? <button onClick={() => setConfirmar('post')} aria-label="Borrar publicación" className="flex min-h-[44px] items-center gap-1 rounded-lg border-[3px] border-ink bg-white px-3 text-sm font-extrabold text-brand-600 shadow-brut-sm"><Trash2 size={16} /> Borrar</button>
          : <button onClick={() => setMsg('Gracias, revisaremos esta publicación.')} aria-label="Reportar publicación" className="flex h-11 w-11 items-center justify-center rounded-lg border-[3px] border-ink bg-white text-ink shadow-brut-sm"><Flag size={18} /></button>}
      </div>

      {confirmar === 'post' && (
        <div role="alertdialog" className="rounded-lg border-[3px] border-ink bg-[#ffd9dc] p-3">
          <p className="font-bold">¿Borrar esta publicación?</p>
          <p className="text-sm">Se borrarán también su foto y sus comentarios. No se puede deshacer.</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button className="btn-outline" autoFocus onClick={() => setConfirmar(null)}>Cancelar</button>
            <button className="btn-primary" onClick={async () => { const r = await deletePost(p.id); if (!r.ok) { setMsg(r.message); setConfirmar(null) } }}>Sí, borrar</button>
          </div>
        </div>
      )}

      <p className="whitespace-pre-line break-words">{p.texto}</p>
      {p.fotoUrl && <img src={p.fotoUrl} alt="Foto de la publicación" loading="lazy" className="max-h-80 w-full rounded-lg border-[3px] border-ink object-cover" />}

      <div className="flex gap-2">
        <button onClick={async () => { const r = await toggleLike(p.id); if (!r.ok) setMsg(r.message) }} aria-pressed={p.miMeGusta}
          className={`flex min-h-[44px] items-center gap-2 rounded-lg border-[3px] border-ink px-3 font-extrabold shadow-brut-sm ${p.miMeGusta ? 'bg-[#ffd9dc] text-brand-600' : 'bg-white text-ink'}`}>
          <Heart size={18} className={p.miMeGusta ? 'fill-brand-600' : ''} /> {p.meGusta} Me gusta
        </button>
        <button onClick={alternar} aria-expanded={abierta}
          className={`flex min-h-[44px] items-center gap-2 rounded-lg border-[3px] border-ink px-3 font-extrabold shadow-brut-sm ${abierta ? 'bg-turq' : 'bg-white'} text-ink`}>
          <MessageCircle size={18} /> {p.comentarios.length} Comentar
        </button>
      </div>
      {msg && <p role="status" className="text-sm font-bold text-slate-700">{msg}</p>}

      {abierta && (
        <div className="space-y-2">
          {p.comentarios.length === 0 && <p className="text-sm text-slate-600">Todavía no hay comentarios. ¡Escribe el primero!</p>}
          {p.comentarios.map((c) => (
            <div key={c.id} className="flex items-start gap-2 rounded-lg bg-crema p-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{c.autor}{c.mio && <span className="font-normal text-slate-500"> (tú)</span>} <span className="font-normal text-slate-500">· {timeAgo(c.createdAt)}</span></p>
                <p className="break-words">{c.texto}</p>
                {confirmar === c.id && (
                  <div role="alertdialog" className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-bold">¿Borrar este comentario?</span>
                    <button className="rounded-lg border-[3px] border-ink bg-white px-2 font-extrabold" autoFocus onClick={() => setConfirmar(null)}>Cancelar</button>
                    <button className="rounded-lg border-[3px] border-ink bg-brand-600 px-2 font-extrabold text-white" onClick={async () => { const r = await deleteComment(p.id, c.id); setConfirmar(null); if (!r.ok) setMsg(r.message) }}>Sí, borrar</button>
                  </div>
                )}
              </div>
              {(c.mio || role === 'coordinador') && confirmar !== c.id && (
                <button onClick={() => setConfirmar(c.id)} aria-label="Borrar comentario" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-brand-600"><Trash2 size={18} /></button>
              )}
            </div>
          ))}
          <form onSubmit={comentar} className="flex gap-2">
            <label htmlFor={`com-${p.id}`} className="sr-only">Escribe un comentario</label>
            <input id={`com-${p.id}`} className="field" maxLength={200} autoComplete="off" placeholder="Escribe un comentario…" value={texto} onChange={(e) => setTexto(e.target.value)} />
            <button className="btn-primary !w-auto px-4" aria-label="Enviar comentario" disabled={!texto.trim()}><Send size={18} /></button>
          </form>
        </div>
      )}
    </li>
  )
}

export default function CommunityPage() {
  const { volunteers, offers, posts, addPost } = useStore()
  const [params] = useSearchParams()
  const [tab, setTab] = useState<Tab>(params.get('post') ? 'pub' : 'vol')
  const [flagged, setFlagged] = useState<string[]>([])
  const [texto, setTexto] = useState('')
  const [foto, setFoto] = useState<{ url: string; blob: Blob } | null>(null)
  const [err, setErr] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [abiertas, setAbiertas] = useState<string[]>(params.get('post') ? [params.get('post')!] : [])
  const resaltada = params.get('post')

  // Al llegar desde un aviso, la publicación se muestra en pantalla.
  useEffect(() => {
    if (resaltada) document.getElementById(`pub-${resaltada}`)?.scrollIntoView({ block: 'center' })
  }, [resaltada, posts.length])

  const elegirFoto = async (f?: File) => {
    if (!f) return
    const e = validateImage(f)
    setErr(e ?? '')
    if (e) return
    try { setFoto(await reducirFoto(f)) } catch (x) { setErr(x instanceof Error ? x.message : 'No pudimos leer esa imagen.') }
  }

  const publicar = async (e: FormEvent) => {
    e.preventDefault()
    if (texto.trim().length < 5) return setErr('Escribe al menos 5 caracteres.')
    setEnviando(true)
    const r = await addPost(texto.trim(), foto ?? undefined)
    setEnviando(false)
    if (r.ok) { setTexto(''); setFoto(null); setErr('') } else setErr(r.message)
  }

  const tabs: [Tab, string][] = [['vol', 'Voluntarios'], ['pub', 'Publicaciones'], ['rec', 'Recursos']]

  return (
    <Screen title="Comunidad">
      <div role="tablist" className="mb-3 grid grid-cols-3 gap-2 lg:max-w-xl">
        {tabs.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className="tab">{l}</button>
        ))}
      </div>

      {tab === 'vol' && (
        <>
          <ul className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {volunteers.length === 0 && <li className="card text-center text-slate-600">Todavía no hay voluntarios en el directorio.</li>}
            {volunteers.map((v) => (
              <li key={v.id} className="card flex items-center gap-3">
                <div aria-hidden className="flex h-12 w-12 items-center justify-center rounded-lg border-[3px] border-ink bg-inti font-display text-ink">{v.nombre[0]}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{v.nombre} {v.demo && <DemoTag />}</p>
                  <p className="text-sm text-green-700">{v.distrito || 'Zona sin indicar'}{v.horario ? ` · ${v.horario}` : ''}</p>
                  {v.apoyo && <p className="text-sm">{v.apoyo}</p>}
                  <p className="mt-1 text-xs text-slate-600">{v.habilidades.join(' · ')}{v.habilidades.length ? ' · ' : ''}{v.ayudas} ayuda(s) dada(s)</p>
                </div>
                <button aria-label={`Reportar abuso de ${v.nombre}`} onClick={() => setFlagged((f) => [...f, v.id])}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border-[3px] border-ink bg-white text-ink shadow-brut-sm">
                  <Flag size={18} className={flagged.includes(v.id) ? 'text-brand-600' : ''} />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            Solo aparecen voluntarios que aceptaron estar en el directorio. No son certificaciones profesionales ni verificación de identidad.
            No se muestran direcciones ni teléfonos.
          </p>
        </>
      )}

      {tab === 'pub' && (
        <div className="lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <form onSubmit={publicar} className="card mb-4 space-y-2 lg:sticky lg:top-24 lg:mb-0">
            <label htmlFor="texto-pub" className="label">Comparte algo con tu comunidad</label>
            <textarea id="texto-pub" rows={3} maxLength={280} className="field" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ej.: Este sábado repartimos agua en el parque central" />
            {foto && <img src={foto.url} alt="Foto que vas a publicar" className="max-h-56 w-full rounded-lg border-[3px] border-ink object-cover" />}
            {err && <p role="alert" className="text-sm font-bold text-red-700">{err}</p>}
            <div className="flex items-center justify-between gap-2">
              <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border-[3px] border-ink bg-white px-3 font-extrabold text-ink shadow-brut-sm">
                <Camera size={18} /> {foto ? 'Cambiar foto' : 'Agregar foto'}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => void elegirFoto(e.target.files?.[0])} />
              </label>
              <button className="btn-primary !w-auto px-5" disabled={enviando}>{enviando ? 'Publicando…' : 'Publicar'}</button>
            </div>
            <p className="text-xs text-slate-500">No compartas teléfonos ni direcciones exactas.</p>
          </form>
          <ul className="space-y-3">
            {posts.length === 0 && <li className="card text-center text-slate-600">Aún no hay publicaciones. ¡Sé la primera persona en compartir algo!</li>}
            {posts.map((p) => (
              <PostCard key={p.id} p={p} resaltada={resaltada === p.id} abierta={abiertas.includes(p.id)}
                alternar={() => setAbiertas((a) => (a.includes(p.id) ? a.filter((x) => x !== p.id) : [...a, p.id]))} />
            ))}
          </ul>
        </div>
      )}

      {tab === 'rec' && (
        <ul className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {offers.filter((o) => o.estado === 'Disponible').length === 0 && <li className="card text-center text-slate-600">Todavía no hay recursos publicados.</li>}
          {offers.filter((o) => o.estado === 'Disponible').map((o) => (
            <li key={o.id} className="card">
              <p className="font-bold">{o.categoria} {o.demo && <DemoTag />}</p>
              {o.descripcion && <p>{o.descripcion}</p>}
              <p className="text-sm text-slate-600">{o.distrito} · {o.disponibilidad}</p>
            </li>
          ))}
        </ul>
      )}
    </Screen>
  )
}
