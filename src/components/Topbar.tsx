import { useMapStore } from '../store/useMapStore'

export function Topbar() {
  const { zones } = useMapStore()
  const cities = new Set(zones.flatMap((z) => z.localidades.map((l) => l.id))).size

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo">FAUSOL</div>
        <div className="topbar-divider" />
        <span className="topbar-title">Mapa Estratégico de Publicidad</span>
      </div>
      <div className="topbar-right">
        <div className="topbar-stat">
          <span className="ts-value">{zones.length}</span>
          <span className="ts-label">zonas</span>
        </div>
        <div className="topbar-stat">
          <span className="ts-value">{cities}</span>
          <span className="ts-label">localidades</span>
        </div>
        <div className="live-badge">
          <span className="live-dot" />
          LIVE
        </div>
      </div>
    </header>
  )
}
