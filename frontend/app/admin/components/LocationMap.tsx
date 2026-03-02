'use client';

import { useEffect, useRef } from 'react';

type Props = {
  coordinates: string;
  tooltipText?: string;
  onChange: (coords: string, label: string) => void;
};

function parseCoordinateList(input: string): [number, number][] {
  const result: [number, number][] = [];
  if (!input) return result;
  const segments = input.split(';').map((s) => s.trim()).filter(Boolean);
  for (const seg of segments) {
    const parts = seg.split(',');
    if (parts.length !== 2) continue;
    const lat = Number(parts[0]);
    const lng = Number(parts[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      result.push([lat, lng]);
    }
  }
  return result;
}

export function LocationMap({ coordinates, tooltipText, onChange }: Props) {
  const mapRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let mounted = true;

    void import('leaflet').then((mod) => {
      if (typeof document !== 'undefined') {
        const id = 'leaflet-css';
        if (!document.getElementById(id)) {
          const link = document.createElement('link');
          link.id = id;
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
      }
      const L = mod.default;
      if (!mounted || !containerRef.current || mapRef.current) return;

      const defaultLat = 21.0285;
      const defaultLng = 105.8542;

      const parsedForCenter = parseCoordinateList(coordinates);
      const firstCoord = parsedForCenter[0];

      const initialCenter = firstCoord ?? ([defaultLat, defaultLng] as [number, number]);

      const map = L.map(containerRef.current).setView(initialCenter, 5);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const markerIcon = L.divIcon({
      className: '',
      html:
        '<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M12 1C7.5 1 4 4.6 4 9.1C4 15.1 10.7 25.8 11.5 27.1C11.7 27.4 11.8 27.5 12 27.5C12.2 27.5 12.3 27.4 12.5 27.1C13.3 25.8 20 15.1 20 9.1C20 4.6 16.5 1 12 1Z" fill="#6366f1" stroke="#ffffff" stroke-width="2"/>' +
        '<circle cx="12" cy="10.5" r="3" fill="#ffffff"/>' +
        '</svg>',
      iconSize: [24, 32],
      iconAnchor: [12, 32],
    });

    const parsedList = parseCoordinateList(coordinates);
    if (parsedList.length > 0) {
      const coordStrings = parsedList.map(
        ([lat, lng]) => `${lat.toFixed(6)},${lng.toFixed(6)}`,
      );
      const tooltipBase =
        tooltipText ||
        (coordStrings.length === 1
          ? coordStrings[0]
          : coordStrings.join(' → '));

      // Draw markers and a polyline for the path
      const latlngs: [number, number][] = [];
      parsedList.forEach(([lat, lng], index) => {
        latlngs.push([lat, lng]);
        const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
        if (index === 0) {
          marker.bindTooltip(`Start: ${coordStrings[index]}`, {
            direction: 'top',
          });
        } else if (index === parsedList.length - 1) {
          marker.bindTooltip(`End: ${coordStrings[index]}`, {
            direction: 'top',
          });
        } else {
          marker.bindTooltip(`Hop ${index}: ${coordStrings[index]}`, {
            direction: 'top',
          });
        }
        markerRef.current = marker;
      });
      if (latlngs.length > 1) {
        const poly = L.polyline(latlngs, {
          color: '#6366f1',
          weight: 3,
          opacity: 0.8,
        });
        poly.addTo(map);
        map.fitBounds(poly.getBounds(), { padding: [16, 16] });
      } else {
        map.setView(latlngs[0], 10);
      }
    }

    map.on('click', async (e: any) => {
      const { lat, lng } = e.latlng;
      const coordString = `${lat.toFixed(6)},${lng.toFixed(6)}`;
      let label = coordString;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );
        if (res.ok) {
          const data = (await res.json()) as {
            display_name?: string;
          };
          if (data.display_name) {
            label = data.display_name;
          }
        }
      } catch {
      }
      if (!markerRef.current) {
        const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
        markerRef.current = marker;
        marker.bindTooltip(label, { direction: 'top' });
      } else {
        markerRef.current.setLatLng([lat, lng]);
        markerRef.current.getTooltip()?.setContent(label);
      }
      onChange(coordString, label);
    });
    });

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [coordinates, tooltipText, onChange]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: 260, borderRadius: 8, overflow: 'hidden' }}
    />
  );
}
