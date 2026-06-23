import { useState } from 'react'
import { useMapStore, useVisibleZones, useStats } from '../store/useMapStore'
import { PRODUCTS, getProduct } from '../data/products'
import type { Priority } from '../types'

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  alta: { label: 'Alta', color: '#ef4444' },
  media: { label: 'Media', color: '#f59e0b' },
  baja: { label: 'Baja', color: '#6b7280' },
}

interface SidebarProps { open?: boolean; onClose?: () => void }

export function Sidebar({ open, onClose: _onClose }: SidebarProps) {
  const {
    zones, selectedZoneId, activeProducts, activePriorities,
    selectZone, toggleProduct, togglePriority, openModal, deleteZone, reset,
  } = useMapStore()
  const visibleZones = useVisibleZones()
  const stats = useStats()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const handleDelete = (id: string) => {
    if (confirmDelete === id) { deleteZone(id); setConfirmDelete(null) }
    else { setConfirmDelete(id); setTimeout(() => setConfirmDelete(null), 3000) }
  }

  const handleReset = () => {
    if (confirmReset) { reset(); setConfirmReset(false) }
    else { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 3000) }
  }

  return (
    <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
      {/* ── New zone button ── */}
      <div className="sidebar-section">
        <button className="btn-new-zone" onClick={() => openModal()}>
          <span className="btn-plus">＋</span> Nueva zona
        </button>
      </div>

      {/* ── Product filters ── */}
      <div className="sidebar-section">
        <p className="section-label">Productos</p>
        <div className="product-filters">
          {PRODUCTS.map((p) => {
            const active = activeProducts.includes(p.id)
            const count = zones.filter((z) => z.producto === p.id).length
            return (
              <button key={p.id}
                className={`product-filter ${active ? 'product-filter-on' : 'product-filter-off'}`}
                onClick={() => toggleProduct(p.id)}>
                <span className="pf-dot" style={{ background: active ? p.color : '#2a3a2e' }} />
                <span className="pf-name">{p.nombre}</span>
                {count > 0 && <span className="pf-count">{count}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Priority filters ── */}
      <div className="sidebar-section sidebar-section-row">
        <p className="section-label" style={{ marginBottom: 0, marginRight: 12 }}>Prioridad</p>
        <div className="priority-filters">
          {(['alta', 'media', 'baja'] as Priority[]).map((p) => {
            const { label, color } = PRIORITY_CONFIG[p]
            const active = activePriorities.includes(p)
            return (
              <button key={p} onClick={() => togglePriority(p)} className="prio-filter"
                style={active ? { borderColor: color, color, background: color + '18' } : {}}>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Zone list (scrollable) ── */}
      <div className="sidebar-scroll">
        <div className="sidebar-section">
          <p className="section-label">Zonas ({visibleZones.length})</p>
        </div>

        <div className="zone-list">
          {visibleZones.length === 0 && (
            <div className="zone-empty">
              No hay zonas visibles.<br />Ajustá los filtros o creá una nueva.
            </div>
          )}

          {visibleZones.map((zone) => {
            const product = getProduct(zone.producto)
            const color = product?.color ?? '#888'
            const isSelected = selectedZoneId === zone.id
            const { label: prioLabel, color: prioColor } = PRIORITY_CONFIG[zone.prioridad]

            return (
              <div key={zone.id} className={`zone-item ${isSelected ? 'zone-item-selected' : ''}`}
                style={isSelected ? { borderLeftColor: color } : {}}>

                <button className="zone-header" onClick={() => selectZone(isSelected ? null : zone.id)}>
                  <span className="zone-dot" style={{ background: color }} />
                  <span className="zone-name">{zone.nombre}</span>
                  <span className="zone-prio"
                    style={{ color: prioColor, borderColor: prioColor + '44', background: prioColor + '14' }}>
                    {prioLabel}
                  </span>
                  <span className="zone-arrow">{isSelected ? '▲' : '▼'}</span>
                </button>

                {/* City chips */}
                <div className="zone-provinces">
                  {zone.localidades.slice(0, 5).map((l) => (
                    <span key={l.id} className="province-chip">{l.nombre}</span>
                  ))}
                  {zone.localidades.length > 5 && (
                    <span className="province-chip province-chip-more">+{zone.localidades.length - 5}</span>
                  )}
                </div>

                {/* Expanded detail */}
                {isSelected && (
                  <div className="zone-detail">
                    {zone.justificacion && <p className="zone-justif">{zone.justificacion}</p>}

                    <div className="zone-budget">
                      <span className="zb-label">Presupuesto</span>
                      <span className="zb-value" style={{ color }}>{zone.presupuesto}%</span>
                    </div>
                    <div className="budget-bar">
                      <div className="budget-fill" style={{ width: `${zone.presupuesto}%`, background: color }} />
                    </div>

                    {zone.localidades.length > 0 && (
                      <div className="zone-cities-full">
                        <span className="cities-label">{zone.localidades.length} localidades</span>
                        <div className="cities-list">
                          {zone.localidades.map((l) => (
                            <span key={l.id} className="city-tag"
                              style={{ borderColor: color + '40', color: color + 'cc' }}>
                              {l.nombre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {zone.estacionalidad.length > 0 && (
                      <div className="zone-season">
                        <span className="season-label">Pico</span>
                        <div className="season-months">
                          {zone.estacionalidad.map((m) => (
                            <span key={m} className="season-chip"
                              style={{ color, borderColor: color + '50', background: color + '15' }}>
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="zone-actions">
                      <button className="btn-edit" onClick={() => openModal(zone.id)}>Editar</button>
                      <button className="btn-delete" onClick={() => handleDelete(zone.id)}
                        style={confirmDelete === zone.id ? { borderColor: '#ef4444', color: '#fca5a5', background: '#7f1d1d40' } : {}}>
                        {confirmDelete === zone.id ? '¿Confirmar?' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="sidebar-stats">
        <div className="stats-row">
          <span className="stats-label">Zonas activas</span>
          <span className="stats-value">{stats.total}</span>
        </div>
        <div className="stats-row">
          <span className="stats-label">Localidades cubiertas</span>
          <span className="stats-value">{stats.totalCities}</span>
        </div>

        <div className="stats-bars">
          {stats.byProduct.filter((x) => x.count > 0).map(({ product, cities }) => (
            <div key={product.id} className="stats-bar-row">
              <span className="sbar-name">{product.nombre}</span>
              <span className="sbar-count" style={{ color: product.color }}>{cities}c</span>
              <div className="sbar-track">
                <div className="sbar-fill" style={{ width: `${Math.min((cities / 20) * 100, 100)}%`, background: product.color }} />
              </div>
            </div>
          ))}
        </div>

        <button className="btn-reset" onClick={handleReset}
          style={confirmReset ? { borderColor: '#ef4444', color: '#fca5a5' } : {}}>
          {confirmReset ? '⚠ Confirmar reset' : 'Resetear mapa'}
        </button>
      </div>
    </aside>
  )
}
