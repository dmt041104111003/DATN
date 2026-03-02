'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { LanguageProvider } from '@/context/LanguageProvider';
import { RouteMap } from '@/components/RouteMap';
import type { TabId, TraceData } from '@/types/trace';
import { decodeTraceId, formatPropertyValue, mapDataToRouteCoords, getProductImageUrl, getAdditionalPropertyDisplayLabel } from '@/utils/utils';
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

                {tab === 'data' && (
                  <div className="bg-white border border-gray-300 shadow-sm min-w-0 overflow-hidden">
                    <section className="border-b border-gray-200">
                      <h2 className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-l-4 border-[#c41e3a] text-base font-semibold text-gray-900">
                        Product information
                      </h2>
                      <div className="p-4">
                        {(() => {
                          const productImgUrl = getProductImageUrl(data.display);
                          return productImgUrl ? (
                            <div className="flex flex-col sm:flex-row gap-4">
                              <img
                                src={productImgUrl}
                                alt={data.display?.name ?? 'Product'}
                                className="w-full sm:w-48 h-48 object-contain border border-gray-200 bg-gray-50 flex-shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-lg font-semibold text-gray-900 break-words">
                                  {data.display?.name ?? '—'}
                                </p>
                                {data.display?.standard && (
                                  <p className="text-sm text-gray-600 mt-1">Standard: {data.display.standard}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-lg font-semibold text-gray-900 break-words">
                                {data.display?.name ?? '—'}
                              </p>
                              {data.display?.standard && (
                                <p className="text-sm text-gray-600 mt-1">Standard: {data.display.standard}</p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </section>
                    <section>
                      <h2 className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-l-4 border-[#c41e3a] text-base font-semibold text-gray-900">
                        Trace information
                      </h2>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm min-w-0">
                          <thead>
                            <tr>
                              <th className="border border-gray-300 bg-gray-100 px-4 py-2.5 text-left font-semibold text-gray-800 w-40 sm:w-48">
                                Property
                              </th>
                              <th className="border border-gray-300 bg-gray-100 px-4 py-2.5 text-left font-semibold text-gray-800">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.display?.name && (
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 text-gray-700">Product name</td>
                                <td className="border border-gray-300 px-4 py-2 text-gray-900 break-words">{data.display.name}</td>
                              </tr>
                            )}
                            {data.display?.standard && (
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 text-gray-700">Standard</td>
                                <td className="border border-gray-300 px-4 py-2 text-gray-900 break-words">{data.display.standard}</td>
                              </tr>
                            )}
                            <tr>
                              <td className="border border-gray-300 px-4 py-2 text-gray-700">Policy ID</td>
                              <td className="border border-gray-300 px-4 py-2 font-mono text-gray-900 break-all text-xs sm:text-sm">
                                {paramsDecoded?.policyId ?? (data.metadata?.policy_id as string) ?? '—'}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2 text-gray-700">Asset name</td>
                              <td className="border border-gray-300 px-4 py-2 font-mono text-gray-900 break-all">
                                {paramsDecoded?.assetName ?? (data.metadata?.name as string) ?? '—'}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2 text-gray-700">Asset status</td>
                              <td className="border border-gray-300 px-4 py-2 text-gray-900">
                                {data.burnStatus === 'burned' ? 'Retired' : 'Active'}
                              </td>
                            </tr>
                            {data.display?.minter_location && (
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 text-gray-700">Origin</td>
                                <td className="border border-gray-300 px-4 py-2 text-gray-900 break-words">{data.display.minter_location}</td>
                              </tr>
                            )}
                            {data.display?.receiver_locations && data.display.receiver_locations.length > 0 && (
                              <tr>
                                <td className="border border-gray-300 px-4 py-2 text-gray-700 align-top">Supply chain checkpoints</td>
                                <td className="border border-gray-300 px-4 py-2 text-gray-900">
                                  <ul className="list-disc list-inside space-y-0.5 break-words">
                                    {data.display.receiver_locations.map((loc, i) => (
                                      <li key={i}>{loc}</li>
                                    ))}
                                  </ul>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </section>
                    {data.certificateUrl && (
                      <section className="border-t border-gray-200">
                        <h2 className="flex items-center gap-2 px-4 py-3 bg-gray-50 text-base font-semibold text-gray-900">
                          Certificate
                        </h2>
                        <div className="p-4 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                          <div className="md:col-span-2">
                            <img
                              src={data.certificateUrl}
                              alt={data.certificate?.title || 'Certificate'}
                              className="w-full max-h-96 object-contain border border-gray-200 bg-gray-50"
                            />
                          </div>
                          <div className="space-y-2 text-sm">
                            {data.certificate?.title && (
                              <p className="text-gray-800 font-semibold">
                                {data.certificate.title}
                              </p>
                            )}
                            <p className="text-gray-600">
                              <span className="font-medium">Batch ID: </span>
                              <span className="font-mono break-all">
                                {data.certificate?.batchId ?? (data.metadata?.['batchId'] as string) ?? '—'}
                              </span>
                            </p>
                            {data.certificate?.issuedAt && (
                              <p className="text-gray-600">
                                <span className="font-medium">Issued at: </span>
                                <span>
                                  {formatPropertyValue(data.certificate.issuedAt)}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </section>
                    )}
                    {data.display?.properties && Object.keys(data.display.properties).length > 0 && (
                      <section className="border-t border-gray-200">
                        <h2 className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-l-4 border-[#c41e3a] text-base font-semibold text-gray-900">
                          Additional properties
                        </h2>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-sm min-w-0">
                            <thead>
                              <tr>
                                <th className="border border-gray-300 bg-gray-100 px-4 py-2.5 text-left font-semibold text-gray-800 w-40 sm:w-48">
                                  Property
                                </th>
                                <th className="border border-gray-300 bg-gray-100 px-4 py-2.5 text-left font-semibold text-gray-800">
                                  Value
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(data.display.properties).map(([key, val]) => (
                                <tr key={key}>
                                  <td className="border border-gray-300 px-4 py-2 text-gray-700 capitalize">
                                    {getAdditionalPropertyDisplayLabel(key)}
                                  </td>
                                  <td className="border border-gray-300 px-4 py-2 font-mono text-gray-900 break-all text-xs sm:text-sm">
                                    {formatPropertyValue(val)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {tab === 'map' && (
                  <div className="bg-white border border-gray-300 shadow-sm overflow-hidden p-4 md:p-6">
                    {data.currentLocation && (
                      <div className="text-sm text-gray-700 mb-2">
                        <p className="font-medium text-gray-800 mb-1">Current holder address</p>
                        <p className="font-mono text-xs sm:text-sm break-all bg-gray-50 px-2 py-1.5 rounded border border-gray-200">
                          {data.currentLocation.address || '—'}
                        </p>
                        {data.currentLocation.lat != null && data.currentLocation.lng != null && (
                          <p className="text-gray-500 mt-1">Shown on map</p>
                        )}
                        {data.currentLocation.locationType === 'script' && (
                          <span className="block text-indigo-600 mt-1">NFT is locked at delivery script (shipper + receiver must sign to unlock).</span>
                        )}
                        {data.currentLocation.locationType === 'outside' && (
                          <span className="block text-amber-600 mt-1">NFT is held by a wallet not in the tracked supply chain.</span>
                        )}
                      </div>
                    )}
                    {routeLabel && !data.currentLocation && (
                      <p className="text-sm text-gray-600 mb-4">{routeLabel}</p>
                    )}
                    {routeCoords ? (
                      <RouteMap
                        routeCoordinates={routeCoords}
                        height={360}
                        labels={routeLabels}
                        pointTypes={routePointTypes}
                        extraPoints={extraPoints}
                      />
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
                        <p className="font-medium text-gray-800 mb-1">No map location</p>
                        <p>
                          {data.currentLocation?.locationType === 'script'
                            ? 'NFT is in transit (locked at delivery script). Map shows only tracked checkpoints (origin and receivers).'
                            : data.currentLocation?.locationType === 'outside'
                            ? 'NFT is outside the tracked supply chain. Route is shown only for tracked checkpoints.'
                            : 'No route data is available for this asset.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
}
