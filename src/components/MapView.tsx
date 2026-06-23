import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { useMapStore, useVisibleZones } from '../store/useMapStore'
import { getProduct } from '../data/products'
import type { Zone, Localidad } from '../types'

import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow })

const ZONE_EMOJI: Record<string, string> = {
  embolsadora: '🌾',
  extractora: '🌾',
  rolo: '🐄',
  desmalezadora: '🐄',
  cisternas: '🌾',
}

function getEmoji(zone: Zone): string {
  if (zone.producto === 'cisternas' && zone.nombre.toLowerCase().includes('patagonia')) return '🐄'
  return ZONE_EMOJI[zone.producto] ?? '🌾'
}

const FONT_SIZE: Record<string, number> = { alta: 20, media: 15, baja: 11 }

function makeIcon(zone: Zone, selected: boolean): L.DivIcon {
  const emoji = getEmoji(zone)
  const base = FONT_SIZE[zone.prioridad] ?? 15
  const size = selected ? base + 7 : base
  return L.divIcon({
    html: `<div class="emoji-pin emoji-pin-${zone.prioridad}${selected ? ' emoji-pin-selected' : ''}" style="font-size:${size}px">${emoji}</div>`,
    className: '',
    iconSize: [size + 8, size + 8],
    iconAnchor: [(size + 8) / 2, (size + 8) / 2],
  })
}

interface MarkerEntry { marker: L.Marker; zone: Zone; loc: Localidad }

export function MapView() {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const provinceLayerRef = useRef<L.GeoJSON | null>(null)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)
  const entriesRef = useRef<MarkerEntry[]>([])
  const prevSelectedRef = useRef<string | null>(null)
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null)

  const { selectedZoneId } = useMapStore()
  const visibleZones = useVisibleZones()

  useEffect(() => {
    fetch('/argentina-provinces.geojson')
      .then((r) => r.json())
      .then((d) => setGeoData(d as GeoJSON.FeatureCollection))
      .catch(console.error)
  }, [])

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      center: [-38.5, -63.5],
      zoom: 4,
      minZoom: 3,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      updateWhenIdle: true,
      keepBuffer: 2,
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const lg = L.layerGroup().addTo(map)
    layerGroupRef.current = lg

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Province outlines — subtle, loaded once
  useEffect(() => {
    const map = mapRef.current
    if (!map || !geoData || provinceLayerRef.current) return
    const layer = L.geoJSON(geoData, {
      style: { fillColor: 'transparent', fillOpacity: 0, color: 'rgba(255,255,255,0.09)', weight: 0.7 },
    }).addTo(map)
    provinceLayerRef.current = layer
    try { map.fitBounds(layer.getBounds(), { padding: [24, 24] }) } catch {}
  }, [geoData])

  // ── Rebuild markers only when visible zones change ──────────
  // NOT on selectedZoneId — that's handled separately below
  useEffect(() => {
    const lg = layerGroupRef.current
    if (!lg) return

    lg.clearLayers()
    entriesRef.current = []

    const currentSelectedId = useMapStore.getState().selectedZoneId

    visibleZones.forEach((zone) => {
      const product = getProduct(zone.producto)
      const color = product?.color ?? '#888'
      const prov = zone.prioridad
      const emoji = getEmoji(zone)
      const isSelected = currentSelectedId === zone.id

      zone.localidades.forEach((loc) => {
        const marker = L.marker([loc.lat, loc.lng], {
          icon: makeIcon(zone, isSelected),
        })

        const pName = loc.provincia === 'La Roja' ? 'La Rioja' : loc.provincia
        marker.bindTooltip(
          `<div class="map-tooltip">
            <div class="tt-city">${emoji} ${loc.nombre}</div>
            <div class="tt-province-small">${pName}</div>
            <div class="tt-product" style="color:${color}">${product?.nombre ?? ''}</div>
            <div class="tt-meta">
              <span class="tt-priority tt-${prov}">${prov.toUpperCase()}</span>
              <span class="tt-budget">${zone.presupuesto}%</span>
            </div>
          </div>`,
          { permanent: false, direction: 'top', className: 'leaflet-tooltip-custom', offset: [0, -8] }
        )

        marker.on('click', () => {
          useMapStore.getState().selectZone(
            useMapStore.getState().selectedZoneId === zone.id ? null : zone.id
          )
        })

        lg.addLayer(marker)
        entriesRef.current.push({ marker, zone, loc })
      })
    })

    prevSelectedRef.current = currentSelectedId
  }, [visibleZones]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update selection WITHOUT rebuilding markers ─────────────
  useEffect(() => {
    const prev = prevSelectedRef.current
    const curr = selectedZoneId
    if (prev === curr) return

    entriesRef.current.forEach(({ marker, zone }) => {
      if (zone.id === prev || zone.id === curr) {
        marker.setIcon(makeIcon(zone, zone.id === curr))
      }
    })

    prevSelectedRef.current = curr
  }, [selectedZoneId])

  return (
    <div ref={containerRef} style={{ flex: 1, height: '100%', background: '#080C0A' }} />
  )
}
