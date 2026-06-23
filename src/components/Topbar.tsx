import { useMapStore } from '../store/useMapStore'

interface TopbarProps { onMenuToggle?: () => void; menuOpen?: boolean }

export function Topbar({ onMenuToggle, menuOpen }: TopbarProps) {
  const { zones } = useMapStore()
  const cities = new Set(zones.flatMap((z) => z.localidades.map((l) => l.id))).size

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo">FAUSOL</div>
        <div className="topbar-divider" />
        <span className="topbar-title">Mapa Estratégico</span>
      </div>
      <div className="topbar-right">
        <div className="topbar-stat">
          <span className="ts-value">{zones.length}</span>
          <span className="ts-label">zonas</span>
        </div>
        <div className="topbar-stat">
          <span className="ts-value">{cities}</span>
          <span className="ts-label">loc</span>
        </div>
        <div className="live-badge">
          <span className="live-dot" />
          LIVE
        </div>
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="Menú">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  )
}
