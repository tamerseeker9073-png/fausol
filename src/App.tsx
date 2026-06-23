import { Topbar } from './components/Topbar'
import { MapView } from './components/MapView'
import { Sidebar } from './components/Sidebar'
import { ZoneModal } from './components/ZoneModal'
import { useMapStore } from './store/useMapStore'

export default function App() {
  const { modalOpen } = useMapStore()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Topbar />
      <div className="app-body">
        <MapView />
        <Sidebar />
      </div>
      {modalOpen && <ZoneModal />}
    </div>
  )
}
