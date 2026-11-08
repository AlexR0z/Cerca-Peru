import { UBIGEO, UBIGEO_PUNTOS } from '../data/ubigeo'

export interface Zona { departamento: string; provincia: string; distrito: string }

/** Punto aproximado de un distrito. Si el nombre se repite en varias provincias, se prefiere el departamento indicado. */
export function puntoDeDistrito(distrito: string, departamento?: string): [number, number] | null {
  let mejor: [number, number] | null = null
  for (const dep of Object.keys(UBIGEO)) {
    for (const prov of Object.keys(UBIGEO[dep])) {
      const i = UBIGEO[dep][prov].indexOf(distrito)
      if (i < 0) continue
      const p = UBIGEO_PUNTOS[dep][prov][i]
      if (!p) continue
      if (dep === departamento) return p
      if (!mejor) mejor = p
    }
  }
  return mejor
}

/** Punto aproximado de la capital de un departamento (primer distrito de su provincia homónima). */
export function puntoDeDepartamento(departamento: string): [number, number] | null {
  const provs = UBIGEO[departamento]
  if (!provs) return null
  const prov = provs[departamento] ? departamento : Object.keys(provs)[0]
  const i = Math.max(0, UBIGEO[departamento][prov].indexOf(departamento))
  return UBIGEO_PUNTOS[departamento][prov][i] ?? UBIGEO_PUNTOS[departamento][prov][0] ?? null
}

/**
 * Distrito del Perú más cercano a un punto GPS (sin internet: compara con el punto central de cada distrito).
 * Es una sugerencia que la persona puede corregir. `km` es la distancia aproximada al punto del distrito.
 */
export function zonaCercana(lat: number, lon: number): (Zona & { km: number }) | null {
  const k = Math.cos((lat * Math.PI) / 180)
  let mejor: { d2: number } & Zona | null = null
  for (const dep of Object.keys(UBIGEO_PUNTOS)) {
    for (const prov of Object.keys(UBIGEO_PUNTOS[dep])) {
      UBIGEO_PUNTOS[dep][prov].forEach((p, i) => {
        if (!p) return
        const dx = (lon - p[1]) * k
        const dy = lat - p[0]
        const d2 = dx * dx + dy * dy
        if (!mejor || d2 < mejor.d2) mejor = { d2, departamento: dep, provincia: prov, distrito: UBIGEO[dep][prov][i] }
      })
    }
  }
  if (!mejor) return null
  const m = mejor as { d2: number } & Zona
  return { departamento: m.departamento, provincia: m.provincia, distrito: m.distrito, km: Math.round(Math.sqrt(m.d2) * 111) }
}

/** Texto corto de una zona: "Distrito, Departamento". */
export const textoZona = (z: Pick<Zona, 'distrito' | 'departamento'>) => `${z.distrito}, ${z.departamento}`

/**
 * Posición para dibujar un elemento en el mapa. Si el servidor no tiene coordenadas, se usa el punto del distrito
 * con un desplazamiento fijo (según su código) para que varios elementos no se amontonen ni cambien de lugar.
 */
export function posicionEnMapa(item: { id: string; lat: number | null; lon: number | null; distrito?: string }, departamento?: string): [number, number] | null {
  if (typeof item.lat === 'number' && typeof item.lon === 'number') return [item.lat, item.lon]
  const base = (item.distrito && puntoDeDistrito(item.distrito, departamento)) || (departamento ? puntoDeDepartamento(departamento) : null)
  if (!base) return null
  let h = 0
  for (const c of item.id) h = (h * 31 + c.charCodeAt(0)) % 9973
  return [base[0] + ((h % 100) / 100 - 0.5) * 0.014, base[1] + ((Math.floor(h / 100) % 100) / 100 - 0.5) * 0.014]
}
