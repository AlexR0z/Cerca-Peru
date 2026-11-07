export const CHACLACAYO: [number, number] = [-11.9753, -76.7686]

export const ZONES: { name: string; lat: number; lon: number }[] = [
  { name: 'Av. Nicolás Ayllón', lat: -11.9789, lon: -76.7712 },
  { name: 'Urb. Los Girasoles', lat: -11.9702, lon: -76.7605 },
  { name: 'Parque Central', lat: -11.9741, lon: -76.7694 },
  { name: 'Urb. Los Pinos', lat: -11.9668, lon: -76.7771 },
  { name: 'Morón Bajo', lat: -11.9822, lon: -76.7589 },
]

/**
 * Reduce la precisión a 3 decimales (≈ 110 m) para no exponer la ubicación exacta.
 * Se aplica antes de guardar o mostrar cualquier coordenada pública.
 */
export function approx(n: number): number {
  return Math.round(n * 1000) / 1000
}

export function uid(): string {
  return crypto.randomUUID()
}

export function reportCode(): string {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `CP-${new Date().getFullYear()}-${n}`
}

export function timeAgo(iso: string): string {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (min < 1) return 'Hace un momento'
  if (min < 60) return `Hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `Hace ${h} h`
  return `Hace ${Math.round(h / 24)} d`
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
}

export function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371
  const dLat = ((b[0] - a[0]) * Math.PI) / 180
  const dLon = ((b[1] - a[1]) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Usa una foto JPG, PNG o WebP.'
  if (file.size > MAX_IMAGE_BYTES) return 'La foto pesa más de 5 MB. Elige una más pequeña.'
  return null
}
