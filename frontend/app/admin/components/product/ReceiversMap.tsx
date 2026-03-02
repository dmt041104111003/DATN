'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { parseCoords, parseLocations } from '../../utils/coordinates';
import { moveItem } from '../../utils/array';
import { shortenAddress } from '../../utils/string';

type Props = {
  coordinates: string;
  locations: string;
  receiverList?: string[];
  receiverDisplayNames?: string[];
  minterCoordinates?: string;
  minterLocation?: string;
  onChange: (coords: string, locations: string, addresses?: string, displayNames?: string) => void;
};

export function ReceiversMap({ coordinates, locations, receiverList = [], receiverDisplayNames = [], minterCoordinates, minterLocation, onChange }: Props) {
  const mapRef = useRef<any | null>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const coordList = parseCoords(coordinates);
  const locList = parseLocations(locations);
  const n = receiverList.length;
  const items = Array.from({ length: n }, (_, i) => ({
    coord: coordList[i] ?? [0, 0],
    label: locList[i] ?? `#${i + 1}`,
    displayName: receiverDisplayNames[i] ?? '',
    shortAddress: receiverList[i] ? shortenAddress(receiverList[i]) : '',
    fullAddress: receiverList[i] ?? '',
  }));

  const handleRemove = (index: number) => {
    const len = receiverList.length;
    const newCoords = coordList.slice(0, len).filter((_, i) => i !== index);
    const newLocs = locList.slice(0, len).filter((_, i) => i !== index);
    const newAddresses = receiverList.filter((_, i) => i !== index).join(';');
    const newDisplayNames = receiverDisplayNames.slice(0, len).filter((_, i) => i !== index).join('\u241F');
    onChange(
      newCoords.map(([la, lo]) => `${la.toFixed(6)},${lo.toFixed(6)}`).join(';'),
      newLocs.join('; '),
      newAddresses,
      newDisplayNames
    );
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    const len = receiverList.length;
    const newCoords = moveItem(coordList.slice(0, len), fromIndex, toIndex);
    const newLocs = moveItem(locList.slice(0, len), fromIndex, toIndex);
    const newAddresses = moveItem([...receiverList], fromIndex, toIndex).join(';');
    const newDisplayNames = moveItem([...receiverDisplayNames].slice(0, len), fromIndex, toIndex).join('\u241F');
    onChange(
      newCoords.map(([la, lo]) => `${la.toFixed(6)},${lo.toFixed(6)}`).join(';'),
      newLocs.join('; '),
      newAddresses,
      newDisplayNames
    );
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let mounted = true;

    void import('leaflet').then((mod) => {
      const L = mod.default;
      if (!mounted || !containerRef.current || mapRef.current) return;

      const coordListLocal = parseCoords(coordinates);
      const locListLocal = parseLocations(locations);

      const minterCoord = (() => {
        if (!minterCoordinates?.trim()) return null;
        const parts = minterCoordinates.trim().split(',');
        if (parts.length !== 2) return null;
        const lat = Number(parts[0].trim());
        const lng = Number(parts[1].trim());
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return [lat, lng] as [number, number];
      })();

      const defaultLat = 21.0285;
      const defaultLng = 105.8542;
      const initialCenter =
        coordListLocal.length > 0
          ? coordListLocal[0]
          : minterCoord ?? ([defaultLat, defaultLng] as [number, number]);

      const map = L.map(containerRef.current).setView(initialCenter, 5);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const minterIcon = L.divIcon({
        className: '',
        html:
          '<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M12 1C7.5 1 4 4.6 4 9.1C4 15.1 10.7 25.8 11.5 27.1C11.7 27.4 11.8 27.5 12 27.5C12.2 27.5 12.3 27.4 12.5 27.1C13.3 25.8 20 15.1 20 9.1C20 4.6 16.5 1 12 1Z" fill="#0f766e" stroke="#ffffff" stroke-width="2"/>' +
          '<circle cx="12" cy="10.5" r="3" fill="#ffffff"/>' +
          '</svg>',
        iconSize: [24, 32],
        iconAnchor: [12, 32],
      });

      if (minterCoord) {
        const minterMarker = L.marker(minterCoord, { icon: minterIcon }).addTo(map);
        minterMarker.bindTooltip(minterLocation?.trim() || 'Minter (origin)', { direction: 'top' });
        markersRef.current.push(minterMarker);
      }

      const createMarkerIcon = (index: number) =>
        L.divIcon({
          className: '',
          html:
            '<div style="position:relative; width:24px; height:32px; display:flex; align-items:flex-end; justify-content:center;">' +
            '<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M12 1C7.5 1 4 4.6 4 9.1C4 15.1 10.7 25.8 11.5 27.1C11.7 27.4 11.8 27.5 12 27.5C12.2 27.5 12.3 27.4 12.5 27.1C13.3 25.8 20 15.1 20 9.1C20 4.6 16.5 1 12 1Z" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>' +
            '<circle cx="12" cy="10.5" r="3" fill="#ffffff"/>' +
            '</svg>' +
            `<div style="position:absolute; top:6px; left:0; right:0; text-align:center; font-size:10px; font-weight:600; color:#0f172a;">${index}</div>` +
            '</div>',
          iconSize: [24, 32],
          iconAnchor: [12, 32],
        });

      coordListLocal.forEach(([lat, lng], idx) => {
        const marker = L.marker([lat, lng], {
          icon: createMarkerIcon(idx + 1),
        }).addTo(map);
        const baseLabel = locListLocal[idx];
        const tooltipLabel = baseLabel ? `${idx + 1}. ${baseLabel}` : `#${idx + 1}`;
        marker.bindTooltip(tooltipLabel, { direction: 'top' });
        markersRef.current.push(marker);
      });

      const polylineLatLngs = minterCoord
        ? [minterCoord, ...coordListLocal]
        : coordListLocal;
      if (polylineLatLngs.length > 1) {
        polylineRef.current = L.polyline(polylineLatLngs, {
          color: '#2563eb',
          weight: 3,
          opacity: 0.7,
        }).addTo(map);
      }
    });

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
      polylineRef.current = null;
    };
  }, [coordinates, locations, receiverList, receiverDisplayNames, minterCoordinates, minterLocation, onChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            padding: 8,
            background: '#f8fafc',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 2 }}>
            Order (use ↑ ↓ to reorder)
          </span>
          {items.map((item, idx) => (
            <div
              key={`${item.coord[0]}-${item.coord[1]}-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
              }}
            >
              <span style={{ fontWeight: 600, color: '#334155', minWidth: 20 }}>
                {idx + 1}.
              </span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                {item.displayName && (
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.displayName}</span>
                )}
                <span style={{ fontSize: 12, color: '#64748b' }}>{item.label}</span>
                {item.fullAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(item.fullAddress);
                    }}
                    title="Click to copy full address"
                    style={{
                      fontSize: 11,
                      color: '#64748b',
                      fontFamily: 'monospace',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      textAlign: 'left',
                      alignSelf: 'flex-start',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                      e.currentTarget.style.color = '#334155';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                      e.currentTarget.style.color = '#64748b';
                    }}
                  >
                    {item.shortAddress}
                  </button>
                )}
              </div>
              <button
                type="button"
                title="Remove"
                onClick={() => handleRemove(idx)}
                style={{
                  padding: '2px 6px',
                  fontSize: 14,
                  lineHeight: 1,
                  border: '1px solid #cbd5e1',
                  borderRadius: 4,
                  background: '#fff',
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                ×
              </button>
              <button
                type="button"
                title="Move up"
                disabled={idx === 0}
                onClick={() => handleMove(idx, idx - 1)}
                style={{
                  padding: '2px 6px',
                  fontSize: 14,
                  lineHeight: 1,
                  border: '1px solid #cbd5e1',
                  borderRadius: 4,
                  background: idx === 0 ? '#f1f5f9' : '#fff',
                  cursor: idx === 0 ? 'not-allowed' : 'pointer',
                  color: idx === 0 ? '#94a3b8' : '#475569',
                }}
              >
                ↑
              </button>
              <button
                type="button"
                title="Move down"
                disabled={idx === items.length - 1}
                onClick={() => handleMove(idx, idx + 1)}
                style={{
                  padding: '2px 6px',
                  fontSize: 14,
                  lineHeight: 1,
                  border: '1px solid #cbd5e1',
                  borderRadius: 4,
                  background: idx === items.length - 1 ? '#f1f5f9' : '#fff',
                  cursor: idx === items.length - 1 ? 'not-allowed' : 'pointer',
                  color: idx === items.length - 1 ? '#94a3b8' : '#475569',
                }}
              >
                ↓
              </button>
            </div>
          ))}
        </div>
      )}
      <div
        ref={containerRef}
        style={{ width: '100%', height: 260, borderRadius: 8, overflow: 'hidden' }}
      />
    </div>
  );
}

