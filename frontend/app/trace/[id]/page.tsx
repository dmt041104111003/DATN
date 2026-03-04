'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { LanguageProvider } from '@/context/LanguageProvider';
import type { TabId, TraceData } from '@/types/trace';
import { TraceDataTab } from '@/components/trace/TraceDataTab';
import { TraceMapTab } from '@/components/trace/TraceMapTab';
import { decodeTraceId, mapDataToRouteCoords } from '@/utils/utils';
import { fetchTrace } from '@/lib/trace';

export default function TraceResultPage() {
  const params = useParams();
  const [tab, setTab] = useState<TabId>('data');
  const [data, setData] = useState<TraceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paramsDecoded, setParamsDecoded] = useState<{ policyId: string; assetName: string } | null>(null);

  const id = typeof params?.id === 'string' ? params.id : '';

  useEffect(() => {
    const parsed = decodeTraceId(id);
    if (!parsed?.policyId?.trim() || !parsed?.assetName?.trim()) {
      setLoading(false);
      setError('Invalid trace ID.');
      return;
    }
    setParamsDecoded(parsed);
    fetchTrace(parsed.policyId, parsed.assetName)
      .then(setData)
      .catch((err) => setError((err as Error).message ?? 'Failed to load trace.'))
      .finally(() => setLoading(false));
  }, [id]);

  const routeCoords = data
    ? mapDataToRouteCoords(data.mapData) ||
      (data.currentLocation && data.currentLocation.lat != null && data.currentLocation.lng != null
        ? `${data.currentLocation.lat},${data.currentLocation.lng}`
        : '')
    : '';
  const rawRouteLabels = data?.mapData?.map((p) => p.label) ??
    (data?.currentLocation && data.currentLocation.lat != null && data.currentLocation.lng != null
      ? [data.currentLocation.label]
      : []);
  const routePointTypes = data?.mapData?.map((p) => p.pointType ?? 'receiver') ??
    (data?.currentLocation && data.currentLocation.lat != null && data.currentLocation.lng != null && data.currentLocation.locationType
      ? [data.currentLocation.locationType === 'minter' ? 'origin' : data.currentLocation.locationType === 'receiver' ? 'receiver' : data.currentLocation.locationType === 'script' ? 'script' : 'outside']
      : []);
  const routeLabel = data?.mapData?.map((p) => p.label).join(' → ') ??
    (data?.currentLocation && data.currentLocation.lat != null && data.currentLocation.lng != null
      ? data.currentLocation.label
      : '');

  const routeLabels = (() => {
    const labels = [...rawRouteLabels];
    if (
      data &&
      data.currentLocation &&
      data.currentLocation.lat != null &&
      data.currentLocation.lng != null &&
      labels.length === 1 &&
      (!data.mapData || !data.mapData.length) &&
      (data.currentLocation.locationType === 'outside' || data.currentLocation.unverified)
    ) {
      const base = labels[0] ?? '';
      labels[0] = base ? `${base} - Unidentified NFT` : 'Unidentified NFT';
    }
    return labels;
  })();

  const extraPoints = (() => {
    const extras: { lat: number; lng: number; label?: string; pointType?: 'origin' | 'receiver' | 'script' | 'outside' }[] = [];

    if (data?.mapData?.length) {
      let lastIndex = data.mapData.length - 1;
      for (let i = 1; i < data.mapData.length; i += 1) {
        if (data.mapData[i]?.status !== 'completed') {
          lastIndex = i - 1;
          break;
        }
      }
      const tail = data.mapData.slice(lastIndex + 1);
      for (const p of tail) {
        extras.push({
          lat: p.lat,
          lng: p.lng,
          label: p.label,
          pointType: p.pointType ?? 'receiver',
        });
      }
    }

    if (data && data.currentLocation && data.currentLocation.lat != null && data.currentLocation.lng != null) {
      const inMainRoute =
        data.mapData &&
        data.mapData.some(
          (p, idx) =>
            idx === 0 ||
            p.status === 'completed'
              ? p.lat === data.currentLocation!.lat && p.lng === data.currentLocation!.lng
              : false
        );
      const inExtras = extras.some(
        (p) => p.lat === data.currentLocation!.lat && p.lng === data.currentLocation!.lng
      );
      if (!inMainRoute && !inExtras) {
        const locationType = data.currentLocation.locationType;
        const pointType =
          locationType === 'minter'
            ? 'origin'
            : locationType === 'script'
            ? 'script'
            : locationType === 'outside'
            ? 'outside'
            : 'receiver';
        const baseLabel = data.currentLocation.label;
        const label =
          locationType === 'outside' || data.currentLocation.unverified
            ? (baseLabel ? `${baseLabel} - Unidentified NFT` : 'Unidentified NFT')
            : baseLabel;
        extras.push({
          lat: data.currentLocation.lat,
          lng: data.currentLocation.lng,
          label,
          pointType,
        });
      }
    }

    return extras;
  })();

  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-[#f2f2f2]">
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/';
              }}
              className="inline-block mb-4 text-sm text-[#c41e3a] hover:underline"
            >
              ← Back to home
            </a>
            {loading && (
              <p className="text-sm text-gray-600">Loading trace data…</p>
            )}
            {error && (
              <div className="border border-red-300 bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            {!loading && !error && data && (
              <>
                <div className="flex gap-0 border-b-2 border-[#c41e3a] mb-6">
                  <button
                    type="button"
                    onClick={() => setTab('data')}
                    className={`px-5 py-2.5 text-sm font-medium border border-gray-300 border-b-0 -mb-0.5 ${
                      tab === 'data'
                        ? 'bg-white text-[#c41e3a] border-[#c41e3a] relative z-10'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Trace data
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('map')}
                    className={`px-5 py-2.5 text-sm font-medium border border-gray-300 border-b-0 -mb-0.5 ${
                      tab === 'map'
                        ? 'bg-white text-[#c41e3a] border-[#c41e3a] relative z-10'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Route
                  </button>
                </div>

                {tab === 'data' && data && (
                  <TraceDataTab data={data} paramsDecoded={paramsDecoded} />
                )}

                {tab === 'map' && data && (
                  <TraceMapTab
                    data={data}
                    routeCoords={routeCoords}
                    routeLabels={routeLabels}
                    routePointTypes={routePointTypes}
                    extraPoints={extraPoints}
                    routeLabel={routeLabel}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
}
