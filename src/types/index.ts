export type Priority = 'alta' | 'media' | 'baja'

export type Month = 'Ene' | 'Feb' | 'Mar' | 'Abr' | 'May' | 'Jun' | 'Jul' | 'Ago' | 'Sep' | 'Oct' | 'Nov' | 'Dic'

export interface Product {
  id: string
  nombre: string
  fabricante: string
  color: string
}

export interface Localidad {
  id: string
  nombre: string
  provincia: string
  lat: number
  lng: number
}

export interface Zone {
  id: string
  nombre: string
  producto: string
  prioridad: Priority
  justificacion: string
  presupuesto: number
  estacionalidad: Month[]
  localidades: Localidad[]
}
