import { useState, useEffect, useRef } from 'react'
import { useMapStore } from '../store/useMapStore'
import { PRODUCTS } from '../data/products'
import { CIUDADES, searchCiudades } from '../data/cities'
import type { Priority, Month, Localidad } from '../types'

const MONTHS: Month[] = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'alta', label: 'Alta', color: '#ef4444' },
  { value: 'media', label: 'Media', color: '#f59e0b' },
  { value: 'baja', label: 'Baja', color: '#6b7280' },
]

export function ZoneModal() {
  const { zones, editingZoneId, closeModal, addZone, updateZone } = useMapStore()
  const existing = editingZoneId ? zones.find((z) => z.id === editingZoneId) : null

  const [nombre, setNombre] = useState(existing?.nombre ?? '')
  const [producto, setProducto] = useState(existing?.producto ?? PRODUCTS[0].id)
  const [prioridad, setPrioridad] = useState<Priority>(existing?.prioridad ?? 'alta')
  const [justificacion, setJustificacion] = useState(existing?.justificacion ?? '')
  const [presupuesto, setPresupuesto] = useState(existing?.presupuesto ?? 20)
  const [estacionalidad, setEstacionalidad] = useState<Month[]>(existing?.estacionalidad ?? [])
  const [localidades, setLocalidades] = useState<Localidad[]>(existing?.localidades ?? [])
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<typeof CIUDADES>([])
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (existing) {
      setNombre(existing.nombre)
      setProducto(existing.producto)
      setPrioridad(existing.prioridad)
      setJustificacion(existing.justificacion)
      setPresupuesto(existing.presupuesto)
      setEstacionalidad(existing.estacionalidad)
      setLocalidades(existing.localidades)
    }
  }, [existing])

  useEffect(() => {
    setResults(search.length >= 2 ? searchCiudades(search, 10) : [])
  }, [search])

  const addLocalidad = (c: (typeof CIUDADES)[number]) => {
    if (localidades.find((l) => l.id === c.id)) return
    setLocalidades((p) => [...p, { id: c.id, nombre: c.nombre, provincia: c.provincia, lat: c.lat, lng: c.lng }])
    setSearch('')
    setResults([])
    searchRef.current?.focus()
  }

  const removeLocalidad = (id: string) =>
    setLocalidades((p) => p.filter((l) => l.id !== id))

  const toggleMonth = (m: Month) =>
    setEstacionalidad((p) => p.includes(m) ? p.filter((x) => x !== m) : [...p, m])

  const currentColor = PRODUCTS.find((p) => p.id === producto)?.color ?? '#3DB53D'

  const handleSave = () => {
    if (!nombre.trim() || localidades.length === 0) return
    if (existing) {
      updateZone(existing.id, { nombre, producto, prioridad, justificacion, presupuesto, estacionalidad, localidades })
    } else {
      addZone({ id: `zone-${Date.now()}`, nombre, producto, prioridad, justificacion, presupuesto, estacionalidad, localidades })
    }
    closeModal()
  }

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-label">{existing ? 'Editar zona' : 'Nueva zona'}</p>
            <h3 className="modal-title">{existing ? existing.nombre : 'Configurar zona estratégica'}</h3>
          </div>
          <button className="modal-close" onClick={closeModal}>×</button>
        </div>

        <div className="modal-body">
          {/* Nombre */}
          <div className="field">
            <label className="field-label">Nombre de la zona</label>
            <input
              className="field-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Pampeana Norte — Embolsadora"
            />
          </div>

          {/* Producto */}
          <div className="field">
            <label className="field-label">Producto</label>
            <div className="product-grid">
              {PRODUCTS.map((p) => (
                <button key={p.id} onClick={() => setProducto(p.id)}
                  className={`product-btn ${producto === p.id ? 'product-btn-active' : ''}`}
                  style={producto === p.id ? { borderColor: p.color, background: p.color + '18', color: p.color } : {}}>
                  <span className="product-dot" style={{ background: p.color }} />
                  <span className="product-name">{p.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prioridad */}
          <div className="field">
            <label className="field-label">Prioridad</label>
            <div className="priority-row">
              {PRIORITIES.map(({ value, label, color }) => (
                <button key={value} onClick={() => setPrioridad(value)} className="priority-btn"
                  style={prioridad === value ? { borderColor: color, background: color + '22', color } : {}}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Localidades */}
          <div className="field">
            <label className="field-label">
              Localidades
              <span className="field-count">{localidades.length} ciudades</span>
            </label>

            {/* Search */}
            <div className="city-search-wrap">
              <input
                ref={searchRef}
                className="field-input city-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar ciudad o pueblo..."
              />
              {results.length > 0 && (
                <div className="city-dropdown">
                  {results.map((c) => {
                    const alreadyIn = !!localidades.find((l) => l.id === c.id)
                    return (
                      <button
                        key={c.id}
                        className={`city-option ${alreadyIn ? 'city-option-taken' : ''}`}
                        onClick={() => !alreadyIn && addLocalidad(c)}
                      >
                        <span className="co-name">{c.nombre}</span>
                        <span className="co-prov">{c.provincia === 'La Roja' ? 'La Rioja' : c.provincia}</span>
                        {alreadyIn && <span className="co-check">✓</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Selected chips */}
            {localidades.length > 0 && (
              <div className="city-chips">
                {localidades.map((l) => (
                  <span key={l.id} className="city-chip" style={{ borderColor: currentColor + '60', background: currentColor + '12', color: currentColor }}>
                    {l.nombre}
                    <button className="chip-remove" onClick={() => removeLocalidad(l.id)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Justificación */}
          <div className="field">
            <label className="field-label">
              Justificación estratégica
              <span className="field-count">{justificacion.length}/300</span>
            </label>
            <textarea
              className="field-textarea" value={justificacion} rows={3}
              onChange={(e) => setJustificacion(e.target.value.slice(0, 300))}
              placeholder="¿Por qué esta zona es prioritaria para este producto?"
            />
          </div>

          {/* Presupuesto */}
          <div className="field">
            <label className="field-label">
              Presupuesto relativo
              <span className="field-count" style={{ color: currentColor }}>{presupuesto}%</span>
            </label>
            <input type="range" min={0} max={100} value={presupuesto}
              onChange={(e) => setPresupuesto(Number(e.target.value))}
              className="field-range" style={{ accentColor: currentColor }} />
          </div>

          {/* Estacionalidad */}
          <div className="field">
            <label className="field-label">Meses de mayor actividad</label>
            <div className="month-row">
              {MONTHS.map((m) => {
                const active = estacionalidad.includes(m)
                return (
                  <button key={m} onClick={() => toggleMonth(m)} className="month-btn"
                    style={active ? { borderColor: currentColor, background: currentColor + '25', color: currentColor } : {}}>
                    {m}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
          <button className="btn-save" onClick={handleSave}
            disabled={!nombre.trim() || localidades.length === 0}
            style={{ background: currentColor, opacity: (!nombre.trim() || localidades.length === 0) ? 0.4 : 1 }}>
            {existing ? 'Guardar cambios' : 'Crear zona'}
          </button>
        </div>
      </div>
    </div>
  )
}
