import type { Product } from '../types'

export const PRODUCTS: Product[] = [
  { id: 'rolo', nombre: 'Rolo Colonizador (TT)', fabricante: 'Tatu Marchesan', color: '#2ECC71' },
  { id: 'cisternas', nombre: 'Cisternas Metalpaz', fabricante: 'Metalpaz', color: '#3498DB' },
  { id: 'desmalezadora', nombre: 'Desmalezadoras Agromec', fabricante: 'Agromec', color: '#E67E22' },
  { id: 'extractora', nombre: 'Extractora de grano (Agromec)', fabricante: 'Agromec', color: '#9B59B6' },
  { id: 'embolsadora', nombre: 'Embolsadora de granos (Agromec)', fabricante: 'Agromec', color: '#F1C40F' },
]

export const getProduct = (id: string): Product | undefined =>
  PRODUCTS.find((p) => p.id === id)

export const getProductByName = (nombre: string): Product | undefined =>
  PRODUCTS.find((p) => p.nombre === nombre)
