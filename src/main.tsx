import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import './styles/globals.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(<App />)
