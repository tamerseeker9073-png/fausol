import { useState } from 'react'
import { Topbar } from './components/Topbar'
import { MapView } from './components/MapView'
import { Sidebar } from './components/Sidebar'
import { ZoneModal } from './components/ZoneModal'
import { useMapStore } from './store/useMapStore'

export default function App() {
  const { modalOpen } = useMapStore()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Topbar onMenuToggle={() => setMenuOpen(o => !o)} menuOpen={menuOpen} />
      <div className="app-body">
        <MapView />
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />}
      {modalOpen && <ZoneModal />}
    </div>
  )
}
