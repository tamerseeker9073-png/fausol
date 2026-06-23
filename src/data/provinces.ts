// Exact shapeName values from GeoBoundaries GeoJSON
export const ARGENTINA_PROVINCES = [
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Ciudad Autónoma de Buenos Aires',
  'Corrientes',
  'Córdoba',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Roja',          // "La Rioja" in the GeoBoundaries dataset
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
] as const

export type ProvinceName = (typeof ARGENTINA_PROVINCES)[number]

export const PROVINCE_DISPLAY_NAME: Record<string, string> = {
  'La Roja': 'La Rioja',
  'Ciudad Autónoma de Buenos Aires': 'CABA',
  'Santiago del Estero': 'Santiago del Estero',
  'Tierra del Fuego': 'Tierra del Fuego',
}

export const displayName = (p: string) => PROVINCE_DISPLAY_NAME[p] ?? p
