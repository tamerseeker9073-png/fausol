import { create } from 'zustand'
import type { Zone, Priority } from '../types'
import { DEFAULT_ZONES } from '../data/defaultZones'
import { PRODUCTS } from '../data/products'

const KEY = 'fausol_map_zones'

const load = (): Zone[] => {
  try {
    const s = localStorage.getItem(KEY)
    if (s) return JSON.parse(s) as Zone[]
  } catch {}
  return DEFAULT_ZONES
}

const save = (z: Zone[]) => localStorage.setItem(KEY, JSON.stringify(z))

interface MapStore {
  zones: Zone[]
  selectedZoneId: string | null
  activeProducts: string[]
  activePriorities: Priority[]
  modalOpen: boolean
  editingZoneId: string | null

  addZone: (z: Zone) => void
  updateZone: (id: string, patch: Partial<Zone>) => void
  deleteZone: (id: string) => void
  reset: () => void

  selectZone: (id: string | null) => void
  openModal: (editId?: string) => void
  closeModal: () => void
  toggleProduct: (id: string) => void
  togglePriority: (p: Priority) => void
}

export const useMapStore = create<MapStore>((set, get) => ({
  zones: load(),
  selectedZoneId: null,
  activeProducts: PRODUCTS.map((p) => p.id),
  activePriorities: ['alta', 'media', 'baja'],
  modalOpen: false,
  editingZoneId: null,

  addZone: (z) => {
    const zones = [...get().zones, z]
    save(zones)
    set({ zones, modalOpen: false, selectedZoneId: z.id })
  },

  updateZone: (id, patch) => {
    const zones = get().zones.map((z) => (z.id === id ? { ...z, ...patch } : z))
    save(zones)
    set({ zones, modalOpen: false })
  },

  deleteZone: (id) => {
    const zones = get().zones.filter((z) => z.id !== id)
    save(zones)
    set({ zones, selectedZoneId: null })
  },

  reset: () => {
    localStorage.removeItem(KEY)
    set({ zones: DEFAULT_ZONES, selectedZoneId: null })
  },

  selectZone: (id) => set({ selectedZoneId: id }),
  openModal: (editId) => set({ modalOpen: true, editingZoneId: editId ?? null }),
  closeModal: () => set({ modalOpen: false, editingZoneId: null }),
  toggleProduct: (id) => {
    const a = get().activeProducts
    set({ activeProducts: a.includes(id) ? a.filter((x) => x !== id) : [...a, id] })
  },
  togglePriority: (p) => {
    const a = get().activePriorities
    set({ activePriorities: a.includes(p) ? a.filter((x) => x !== p) : [...a, p] })
  },
}))

export const useVisibleZones = () => {
  const { zones, activeProducts, activePriorities } = useMapStore()
  return zones.filter(
    (z) => activeProducts.includes(z.producto) && activePriorities.includes(z.prioridad)
  )
}

export const useStats = () => {
  const { zones } = useMapStore()
  return {
    total: zones.length,
    totalCities: new Set(zones.flatMap((z) => z.localidades.map((l) => l.id))).size,
    byProduct: PRODUCTS.map((p) => ({
      product: p,
      count: zones.filter((z) => z.producto === p.id).length,
      cities: new Set(
        zones.filter((z) => z.producto === p.id).flatMap((z) => z.localidades.map((l) => l.id))
      ).size,
    })),
  }
}
