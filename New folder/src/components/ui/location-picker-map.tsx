"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface LocationPickerMapProps {
  center: [number, number]
  marker?: [number, number]
  onMapClick: (lat: number, lng: number) => void
}

export default function LocationPickerMap({ center, marker, onMapClick }: LocationPickerMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapRef.current = L.map(containerRef.current, {
      center,
      zoom: 6,
      zoomControl: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current)

    mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    if (marker) {
      if (markerRef.current) {
        markerRef.current.setLatLng(marker)
      } else {
        const icon = L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              width: 32px;
              height: 32px;
              background: #3b82f6;
              border: 3px solid white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="
                transform: rotate(45deg);
                color: white;
                font-size: 14px;
              " class="material-icons">location_on</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        })
        
        markerRef.current = L.marker(marker, { icon }).addTo(mapRef.current)
      }
      
      mapRef.current.setView(marker, Math.max(mapRef.current.getZoom(), 12))
    } else if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }
  }, [marker])

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full cursor-crosshair"
      style={{ minHeight: 300 }}
    />
  )
}
