'use client';

import { useEffect, useRef } from 'react';

type Props = {
  routeCoordinates: string;
  height?: number;
};

function parseRouteCoords(str: string): [number, number][] {
  const points: [number, number][] = [];
  const pairs = str.split(';').map((s) => s.trim()).filter(Boolean);
  for (const pair of pairs) {
    const parts = pair.split(',');
    if (parts.length >= 2) {
      const lat = Number(parts[0]);
      const lng = Number(parts[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        points.push([lat, lng]);
      }
    }
  }
  return points;
}

export function RouteMap({ routeCoordinates, height = 360 }: Props) {
  const mapRef = useRef<any | null>(null);
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

      const defaultCenter: [number, number] = [21.0285, 105.8542];
      const points = parseRouteCoords(routeCoordinates);
      const hasRoute = points.length >= 2;

      const center = hasRoute
        ? points[Math.floor(points.length / 2)]
        : points[0] || defaultCenter;

      const map = L.map(containerRef.current).setView(center, hasRoute ? 6 : 10);
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

      if (hasRoute) {
        const polyline = L.polyline(points, {
          color: '#6366f1',
          weight: 4,
          opacity: 0.8,
        }).addTo(map);
        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

        points.forEach((pt, i) => {
          const isFirst = i === 0;
          const isLast = i === points.length - 1;
          const marker = L.marker(pt, { icon: markerIcon }).addTo(map);
          marker.bindTooltip(
            isFirst ? 'Start' : isLast ? 'End' : `Point ${i + 1}`,
            { direction: 'top' }
          );
        });
      } else if (points.length === 1) {
        const marker = L.marker(points[0], { icon: markerIcon }).addTo(map);
        marker.bindTooltip(
          `${points[0][0].toFixed(4)}, ${points[0][1].toFixed(4)}`,
          { direction: 'top' }
        );
      }
    });

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [routeCoordinates]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height, borderRadius: 8, overflow: 'hidden' }}
    />
  );
}
