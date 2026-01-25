"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import gsap from "gsap"
import type { RoadmapEntry } from "@/types"

interface LeafletMapProps {
  roadmap: RoadmapEntry[]
  businessGps?: string
  businessName?: string
  currentStep?: number
  onMarkerClick: (entry: RoadmapEntry) => void
}

function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let shift = 0
    let result = 0
    let byte

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const dlat = result & 1 ? ~(result >> 1) : result >> 1
    lat += dlat

    shift = 0
    result = 0

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const dlng = result & 1 ? ~(result >> 1) : result >> 1
    lng += dlng

    points.push([lat / 1e5, lng / 1e5])
  }

  return points
}

export default function LeafletMap({
  roadmap,
  businessGps,
  businessName,
  currentStep = 0,
  onMarkerClick,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const truckMarkerRef = useRef<L.Marker | null>(null)
  const animationRef = useRef<number | null>(null)
  const routeCoordsRef = useRef<[number, number][]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const confirmedRoadmap = roadmap.filter((entry) => entry.isCompleted).sort((a, b) => a.stepOrder - b.stepOrder)
    const nextPending = roadmap.find((entry) => entry.stepOrder === currentStep && !entry.isCompleted)

    const allEntries: { lat: number; lng: number; entry: RoadmapEntry; isPending: boolean; isOrigin: boolean }[] = []

    const originEntry: RoadmapEntry = {
      id: 'origin',
      stepOrder: -1,
      location: businessName || 'Manufacturer',
      gpsCoordinates: businessGps,
      isCompleted: true,
      timestamp: new Date().toISOString(),
      quantityIn: 0,
      quantityOut: 0,
      quantitySold: 0,
      agent: null,
    }

    let originAdded = false
    if (businessGps) {
      const [lat, lng] = businessGps.split(",").map(Number)
      if (!isNaN(lat) && !isNaN(lng)) {
        allEntries.push({
          lat,
          lng,
          entry: originEntry,
          isPending: false,
          isOrigin: true,
        })
        originAdded = true
      }
    }

    if (!originAdded && roadmap.length > 0) {
      const firstAgent = roadmap[0]
      const firstGps = firstAgent.gpsCoordinates || firstAgent.agent?.gpsCoordinates
      if (firstGps) {
        const [lat, lng] = firstGps.split(",").map(Number)
        if (!isNaN(lat) && !isNaN(lng)) {
          const offsetLat = lat + 0.02
          const offsetLng = lng - 0.02
          allEntries.push({
            lat: offsetLat,
            lng: offsetLng,
            entry: { ...originEntry, gpsCoordinates: `${offsetLat},${offsetLng}` },
            isPending: false,
            isOrigin: true,
          })
          originAdded = true
        }
      }
    }

    confirmedRoadmap.forEach((entry) => {
      const gps = entry.confirmGps || entry.gpsCoordinates || entry.agent?.gpsCoordinates
      if (gps) {
        const [lat, lng] = gps.split(",").map(Number)
        if (!isNaN(lat) && !isNaN(lng)) {
          allEntries.push({ lat, lng, entry, isPending: false, isOrigin: false })
        }
      }
    })

    if (nextPending) {
      const gps = nextPending.gpsCoordinates || nextPending.agent?.gpsCoordinates
      if (gps) {
        const [lat, lng] = gps.split(",").map(Number)
        if (!isNaN(lat) && !isNaN(lng)) {
          allEntries.push({ lat, lng, entry: nextPending, isPending: true, isOrigin: false })
        }
      }
    }

    const coordinates = allEntries
    const confirmedCoords = coordinates.filter(c => !c.isPending)
    const pendingCoord = coordinates.find(c => c.isPending)
    const lastConfirmed = confirmedCoords[confirmedCoords.length - 1]

    if (coordinates.length === 0) {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: false,
        center: [16.0, 106.0],
        zoom: 5,
      })
      mapInstanceRef.current = map
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '',
        maxZoom: 19,
      }).addTo(map)
      setIsLoading(false)
      return () => {
        map.remove()
        mapInstanceRef.current = null
      }
    }

    const bounds = L.latLngBounds(coordinates.map((c) => [c.lat, c.lng]))

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: false,
    }).fitBounds(bounds, { padding: [50, 50] })

    mapInstanceRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '',
      maxZoom: 19,
    }).addTo(map)

    const createMarkerIcon = (index: number, isOrigin: boolean, isPending: boolean, agentName: string) => {
      const markerId = `marker-${index}`
      const color = isOrigin ? "#22c55e" : isPending ? "#f59e0b" : "#ea4335"
      const statusLabel = isOrigin ? "✓ Origin" : isPending ? "⏳ Pending" : "✓ Confirmed"
      
      return L.divIcon({
        className: "custom-marker",
        html: `
          <div id="${markerId}" style="
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          " class="marker-pin" data-entry-id="${index}">
            <div style="
              font-size: 8px;
              font-weight: 600;
              color: ${isOrigin ? '#15803d' : isPending ? '#b45309' : '#1e40af'};
              white-space: nowrap;
              background: white;
              padding: 2px 5px;
              border-radius: 6px;
              margin-bottom: 2px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.15);
              max-width: 70px;
              overflow: hidden;
              text-overflow: ellipsis;
            ">${agentName}</div>
            <div style="
              font-size: 7px;
              color: ${isOrigin ? '#15803d' : isPending ? '#b45309' : '#166534'};
              margin-bottom: 2px;
            ">${statusLabel}</div>
            <svg viewBox="0 0 24 36" width="22" height="32" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25)); ${isPending ? 'opacity: 0.7;' : ''}">
              <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="${color}"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
            </svg>
          </div>
        `,
        iconSize: [22, 56],
        iconAnchor: [11, 56],
        popupAnchor: [0, -56],
      })
    }

    const markerElements: HTMLElement[] = []

    coordinates.forEach(({ lat, lng, entry, isPending, isOrigin }, index) => {
      const agentName = isOrigin ? (businessName || "Manufacturer") : (entry.agent?.name || entry.location || "Agent")
      const entryToPass = { ...entry }

      const marker = L.marker([lat, lng], {
        icon: createMarkerIcon(index, isOrigin, isPending, agentName),
        zIndexOffset: isPending ? 300 : isOrigin ? 100 : 200,
      }).addTo(map)

      marker.on("click", function(e) {
        L.DomEvent.stopPropagation(e)
        onMarkerClick(entryToPass)
      })

      setTimeout(() => {
        const markerEl = document.getElementById(`marker-${index}`)
        if (markerEl) {
          markerElements.push(markerEl)
          gsap.set(markerEl, { scale: 0, opacity: 0 })
          gsap.to(markerEl, {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            delay: index * 0.1,
            ease: "power2.out",
          })
        }
      }, 100)
    })

    const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return R * c
    }

    let activeSegmentDistance = 0
    if (lastConfirmed && pendingCoord) {
      activeSegmentDistance = Math.round(calcDistance(lastConfirmed.lat, lastConfirmed.lng, pendingCoord.lat, pendingCoord.lng))
    }

    const hasActiveSegment = lastConfirmed && pendingCoord
    const hasConfirmedRoute = confirmedCoords.length >= 2

    if (!hasActiveSegment && !hasConfirmedRoute) {
      setIsLoading(false)
      return () => {
        map.remove()
        mapInstanceRef.current = null
      }
    }

    const createTruckIcon = (info: string) => L.divIcon({
      className: "truck-marker",
      html: `
        <div id="truck-marker" style="display: flex; align-items: center; gap: 4px;">
          <span class="material-icons" style="
            color: #374151;
            font-size: 18px;
            filter: drop-shadow(0 0 2px white) drop-shadow(0 0 2px white) drop-shadow(0 1px 2px rgba(0,0,0,0.3));
          ">local_shipping</span>
          <div style="
            font-size: 9px;
            font-weight: 500;
            color: #1f2937;
            white-space: nowrap;
            background: white;
            padding: 2px 6px;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            line-height: 1.3;
          ">${info}</div>
        </div>
      `,
      iconSize: [120, 20],
      iconAnchor: [9, 10],
    })

    let isMounted = true

    const fetchRoute = async () => {
      try {
        if (hasConfirmedRoute) {
          const waypoints = confirmedCoords.map(c => `${c.lng},${c.lat}`).join(';')
          const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=polyline`
          
          const response = await fetch(osrmUrl)
          const data = await response.json()

          if (!isMounted || !mapInstanceRef.current) return

          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const confirmedRoute = decodePolyline(data.routes[0].geometry)

            L.polyline(confirmedRoute, {
              color: "#000",
              weight: 6,
              opacity: 0.1,
              lineCap: "round",
              lineJoin: "round",
            }).addTo(map)

            L.polyline(confirmedRoute, {
              color: "#22c55e",
              weight: 5,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }).addTo(map)
          }
        }

        if (!isMounted || !mapInstanceRef.current) return

        if (hasActiveSegment && lastConfirmed && pendingCoord) {
          const activeWaypoints = `${lastConfirmed.lng},${lastConfirmed.lat};${pendingCoord.lng},${pendingCoord.lat}`
          const activeOsrmUrl = `https://router.project-osrm.org/route/v1/driving/${activeWaypoints}?overview=full&geometries=polyline`
          
          const activeResponse = await fetch(activeOsrmUrl)
          const activeData = await activeResponse.json()

          if (!isMounted || !mapInstanceRef.current) return

          let activeRoute: [number, number][] = []
          if (activeData.code === 'Ok' && activeData.routes && activeData.routes.length > 0) {
            activeRoute = decodePolyline(activeData.routes[0].geometry)
          } else {
            activeRoute = [[lastConfirmed.lat, lastConfirmed.lng], [pendingCoord.lat, pendingCoord.lng]]
          }
          routeCoordsRef.current = activeRoute

          L.polyline(activeRoute, {
            color: "#000",
            weight: 6,
            opacity: 0.05,
            lineCap: "round",
            lineJoin: "round",
          }).addTo(map)

          const animatedLine = L.polyline(activeRoute, {
            color: "#f59e0b",
            weight: 4,
            opacity: 0.8,
            lineCap: "round",
            lineJoin: "round",
            dashArray: "12, 8",
            dashOffset: "0",
          }).addTo(map)

          let dashOffset = 0
          const animateDash = () => {
            if (!isMounted) return
            dashOffset -= 0.8
            animatedLine.setStyle({ dashOffset: String(dashOffset) })
            animationRef.current = requestAnimationFrame(animateDash)
          }
          animateDash()

          const truckInfo = `${activeSegmentDistance}km → ${pendingCoord.entry.agent?.name || 'Next'}`
          const truckMarker = L.marker(activeRoute[0], { 
            icon: createTruckIcon(truckInfo), 
            zIndexOffset: 1000 
          }).addTo(map)
          truckMarkerRef.current = truckMarker

          const totalPoints = activeRoute.length
          let currentPointIndex = 0
          let subProgress = 0

          const animateTruck = () => {
            if (!isMounted) return
            if (currentPointIndex >= totalPoints - 1) {
              setTimeout(() => {
                if (!isMounted) return
                currentPointIndex = 0
                subProgress = 0
                truckMarker.setLatLng(activeRoute[0])
                requestAnimationFrame(animateTruck)
              }, 2000)
              return
            }

            subProgress += 0.15
            if (subProgress >= 1) {
              subProgress = 0
              currentPointIndex = Math.min(currentPointIndex + 1, totalPoints - 1)
            }

            const currentPos = activeRoute[currentPointIndex]
            const nextPos = activeRoute[Math.min(currentPointIndex + 1, totalPoints - 1)]
            const lat = currentPos[0] + (nextPos[0] - currentPos[0]) * subProgress
            const lng = currentPos[1] + (nextPos[1] - currentPos[1]) * subProgress
            truckMarker.setLatLng([lat, lng])

            requestAnimationFrame(animateTruck)
          }

          setTimeout(() => { if (isMounted) animateTruck() }, 1000)
        } else if (lastConfirmed && !pendingCoord) {
          const truckMarker = L.marker([lastConfirmed.lat, lastConfirmed.lng], { 
            icon: createTruckIcon("Delivered ✓"), 
            zIndexOffset: 1000 
          }).addTo(map)
          truckMarkerRef.current = truckMarker
        }
          
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching route:', error)
        drawFallbackRoute(map, createTruckIcon)
        setIsLoading(false)
      }
    }

    const drawFallbackRoute = (
      map: L.Map, 
      createIcon: typeof createTruckIcon
    ) => {
      if (hasConfirmedRoute) {
        const confirmedRouteCoords = confirmedCoords.map(({ lat, lng }) => [lat, lng] as [number, number])
        L.polyline(confirmedRouteCoords, {
          color: "#22c55e",
          weight: 5,
          opacity: 0.9,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map)
      }

      if (hasActiveSegment && lastConfirmed && pendingCoord) {
        const activeRouteCoords: [number, number][] = [
          [lastConfirmed.lat, lastConfirmed.lng],
          [pendingCoord.lat, pendingCoord.lng]
        ]
        routeCoordsRef.current = activeRouteCoords

        L.polyline(activeRouteCoords, {
          color: "#f59e0b",
          weight: 4,
          opacity: 0.8,
          lineCap: "round",
          lineJoin: "round",
          dashArray: "12, 8",
        }).addTo(map)

        const truckInfo = `${activeSegmentDistance}km → ${pendingCoord.entry.agent?.name || 'Next'}`
        const truckMarker = L.marker(activeRouteCoords[0], { 
          icon: createIcon(truckInfo), 
          zIndexOffset: 1000 
        }).addTo(map)
        truckMarkerRef.current = truckMarker

        let progress = 0
        const animateFallback = () => {
          if (!isMounted) return
          progress += 0.005
          if (progress >= 1) {
            progress = 0
          }
          const lat = activeRouteCoords[0][0] + (activeRouteCoords[1][0] - activeRouteCoords[0][0]) * progress
          const lng = activeRouteCoords[0][1] + (activeRouteCoords[1][1] - activeRouteCoords[0][1]) * progress
          truckMarker.setLatLng([lat, lng])
          requestAnimationFrame(animateFallback)
        }
        setTimeout(() => { if (isMounted) animateFallback() }, 500)
      } else if (lastConfirmed) {
        const truckMarker = L.marker([lastConfirmed.lat, lastConfirmed.lng], { 
          icon: createIcon("Delivered ✓"), 
          zIndexOffset: 1000 
        }).addTo(map)
        truckMarkerRef.current = truckMarker
      }
    }

    fetchRoute()

    return () => {
      isMounted = false
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [roadmap, businessGps, businessName, currentStep, onMarkerClick])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full [&_.leaflet-popup-content-wrapper]:rounded-xl [&_.leaflet-popup-content-wrapper]:shadow-lg [&_.leaflet-popup-content]:m-3 [&_.leaflet-popup-close-button]:border-0 [&_.leaflet-popup-close-button]:bg-transparent [&_.leaflet-popup-close-button]:shadow-none [&_.leaflet-container_a]:border-0 [&_.leaflet-control-zoom_a]:border-0" />
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading route...</span>
          </div>
        </div>
      )}
    </div>
  )
}
