import { useEffect, useRef } from 'react'
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
  rolo: '🌾',
  desmalezadora: '🐄',
  cisternas: '🐄',
}

function getEmoji(zone: Zone): string {
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

const ARG_BOUNDS = L.latLngBounds(L.latLng(-55.5, -74.0), L.latLng(-21.0, -53.0))

export function MapView() {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)
  const entriesRef = useRef<MarkerEntry[]>([])
  const prevSelectedRef = useRef<string | null>(null)

  const { selectedZoneId } = useMapStore()
  const visibleZones = useVisibleZones()

  // Init map once — no GeoJSON, starts instantly
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      center: [-38.5, -63.5],
      zoom: 4,
      minZoom: 4,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
      maxBounds: ARG_BOUNDS.pad(0.08),
      maxBoundsViscosity: 1.0,
    })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 2,
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    layerGroupRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // ── Rebuild markers only when visible zones change ──────────
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
        const marker = L.marker([loc.lat, loc.lng], { icon: makeIcon(zone, isSelected) })

        const pName = loc.provincia === 'La Roja' ? 'La Rioja' : loc.provincia
        const popupContent = `
          <div class="map-popup-inner">
            <div class="mp-city">${emoji} ${loc.nombre}</div>
            <div class="mp-province">${pName}</div>
            <div class="mp-product" style="color:${color}">
              <span class="mp-dot" style="background:${color}"></span>${product?.nombre ?? ''}
            </div>
            <div class="mp-badge mp-badge-${prov}">${prov === 'alta' ? 'Alta prioridad' : prov === 'media' ? 'Media prioridad' : 'Baja prioridad'}</div>
          </div>`

        marker.on('click', () => {
          const map = mapRef.current
          if (map) {
            L.popup({ autoPan: false, closeButton: false, className: 'map-popup', offset: [0, -10] })
              .setLatLng([loc.lat, loc.lng])
              .setContent(popupContent)
              .openOn(map)
          }
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

  // ── Selection update — icon swap only, no rebuild ───────────
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
