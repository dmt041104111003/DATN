'use client';

import { useEffect, useRef } from 'react';
import type { PointType, RouteMapProps } from '@/types/routemap';
import { parseRouteCoords, DEFAULT_MAP_CENTER, ROUTE_POLYLINE_OPTIONS } from '@/utils/routemap';

export function RouteMap({
  routeCoordinates,
  height = 360,
  labels,
  pointTypes,
  extraPoints,
}: RouteMapProps) {
  const mapRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let mounted = true;
    const types = pointTypes ?? [];
    const extras = extraPoints ?? [];

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

      const points = parseRouteCoords(routeCoordinates);
      const pointLabels = labels ?? [];

      const hasRoute = points.length >= 2;

      const center = hasRoute
        ? points[Math.floor(points.length / 2)]
        : points[0] || DEFAULT_MAP_CENTER;

      const map = L.map(containerRef.current).setView(center, hasRoute ? 6 : 10);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const createMarkerIcon = (kind: PointType) => {
        if (kind === 'script') {
          return L.divIcon({
            className: '',
            html:
              '<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">' +
              '<path d="M12 1C7.5 1 4 4.6 4 9.1C4 15.1 10.7 25.8 11.5 27.1C11.7 27.4 11.8 27.5 12 27.5C12.2 27.5 12.3 27.4 12.5 27.1C13.3 25.8 20 15.1 20 9.1C20 4.6 16.5 1 12 1Z" fill="#6366f1" stroke="#ffffff" stroke-width="2"/>' +
              '<path d="M8 12h8v6c0 2.2-1.8 4-4 4s-4-1.8-4-4v-6z" fill="#fff"/>' +
              '<rect x="10" y="10" width="4" height="3" rx="0.5" fill="#6366f1"/>' +
              '</svg>',
            iconSize: [24, 32],
            iconAnchor: [12, 32],
          });
        }
        if (kind === 'outside') {
          return L.divIcon({
            className: '',
            html:
              '<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">' +
              '<path d="M12 1C7.5 1 4 4.6 4 9.1C4 15.1 10.7 25.8 11.5 27.1C11.7 27.4 11.8 27.5 12 27.5C12.2 27.5 12.3 27.4 12.5 27.1C13.3 25.8 20 15.1 20 9.1C20 4.6 16.5 1 12 1Z" fill="#6b7280" stroke="#ffffff" stroke-width="2"/>' +
              '<text x="12" y="14" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">?</text>' +
              '</svg>',
            iconSize: [24, 32],
            iconAnchor: [12, 32],
          });
        }
        return L.divIcon({
          className: '',
          html:
            '<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M12 1C7.5 1 4 4.6 4 9.1C4 15.1 10.7 25.8 11.5 27.1C11.7 27.4 11.8 27.5 12 27.5C12.2 27.5 12.3 27.4 12.5 27.1C13.3 25.8 20 15.1 20 9.1C20 4.6 16.5 1 12 1Z" fill="#c41e3a" stroke="#ffffff" stroke-width="2"/>' +
            '<circle cx="12" cy="10.5" r="3" fill="#ffffff"/>' +
            '</svg>',
          iconSize: [24, 32],
          iconAnchor: [12, 32],
        });
      };

      if (hasRoute) {
        const polyline = L.polyline(points, ROUTE_POLYLINE_OPTIONS).addTo(map);
        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

        points.forEach((pt, i) => {
          const isFirst = i === 0;
          const isLast = i === points.length - 1;
          const pointType = types[i] ?? (isFirst ? 'origin' : isLast ? 'receiver' : 'receiver');
          const icon = createMarkerIcon(pointType);
          const marker = L.marker(pt, { icon }).addTo(map);
          const tooltipText = pointLabels[i] ?? (isFirst ? 'Start' : isLast ? 'End' : `Point ${i + 1}`);
          marker.bindTooltip(tooltipText, { direction: 'top' });
        });
      } else if (points.length === 1) {
        const pointType = types[0] ?? 'receiver';
        const icon = createMarkerIcon(pointType);
        const marker = L.marker(points[0], { icon }).addTo(map);
        marker.bindTooltip(
          pointLabels[0] ?? `${points[0][0].toFixed(4)}, ${points[0][1].toFixed(4)}`,
          { direction: 'top' }
        );
      }

      extras.forEach((p) => {
        const icon = createMarkerIcon(p.pointType ?? 'receiver');
        const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);
        const tooltipText =
          p.label ??
          `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`;
        marker.bindTooltip(tooltipText, { direction: 'top' });
      });
    });

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [
    routeCoordinates,
    labels?.join(','),
    pointTypes?.join(','),
    extraPoints ? extraPoints.map((p) => `${p.lat},${p.lng},${p.label ?? ''},${p.pointType ?? ''}`).join(';') : '',
  ]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height, borderRadius: 8, overflow: 'hidden' }}
    />
  );
}
