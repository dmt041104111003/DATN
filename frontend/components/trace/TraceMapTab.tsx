import { RouteMap } from '@/components/RouteMap';
import type { TraceData } from '@/types/trace';
import { formatPropertyValue } from '@/utils/utils';

type ExtraPoint = { lat: number; lng: number; label?: string; pointType?: 'origin' | 'receiver' | 'script' | 'outside' };

type Props = {
  data: TraceData;
  routeCoords: string;
  routeLabels: string[];
  routePointTypes: ('origin' | 'receiver' | 'script' | 'outside')[];
  extraPoints: ExtraPoint[];
  routeLabel: string;
};

export function TraceMapTab({
  data,
  routeCoords,
  routeLabels,
  routePointTypes,
  extraPoints,
  routeLabel,
}: Props) {
  return (
    <div className="bg-white border border-gray-300 shadow-sm overflow-hidden p-4 md:p-6">
      {data.currentLocation && (
        <div className="text-sm text-gray-700 mb-2 space-y-1.5">
          <p className="font-medium text-gray-800 mb-0.5">Current holder</p>
          <p className="text-sm text-gray-900">
            {data.route?.steps && data.route.steps.length > 0
              ? (() => {
                  const holderAddr = data.currentLocation?.address?.trim().toLowerCase() || '';
                  const lastStep = data.route.steps
                    .slice()
                    .reverse()
                    .find((s) => (s.to.address || '').trim().toLowerCase() === holderAddr);
                  if (lastStep?.to.name || lastStep?.to.location) {
                    return (
                      <>
                        <span className="font-semibold">
                          {lastStep.to.name ?? '—'}
                        </span>
                        {lastStep.to.location && (
                          <span className="text-gray-600">
                            {` – ${lastStep.to.location}`}
                          </span>
                        )}
                      </>
                    );
                  }
                  return data.currentLocation.label || '—';
                })()
              : data.currentLocation.label || '—'}
          </p>
          <p className="text-xs text-gray-600 break-all">
            Wallet:{' '}
            <span className="font-mono bg-gray-50 px-2 py-1.5 rounded border border-gray-200">
              {data.currentLocation.address || '—'}
            </span>
          </p>
          {data.currentLocation.lat != null && data.currentLocation.lng != null && (
            <p className="text-gray-500 mt-0.5">Shown on map</p>
          )}
          {data.currentLocation.locationType === 'script' && (
            <span className="block text-indigo-600">
              NFT is locked at delivery script (shipper + receiver must sign to unlock).
            </span>
          )}
          {data.currentLocation.locationType === 'outside' && (
            <span className="block text-amber-600">
              NFT is held by a wallet not in the tracked supply chain.
            </span>
          )}
          {data.shipping?.deliveries && data.shipping.deliveries.length > 0 && (
            <div className="mt-1 text-xs text-gray-700">
              {(() => {
                const active = data.shipping!.deliveries.find((d) => d.lockedInScript) ??
                  data.shipping!.deliveries[0];
                if (!active) return null;
                const shipper = active.partialSignedByName;
                return shipper ? (
                  <p>
                    Shipper responsible for current leg:{' '}
                    <span className="font-medium">{shipper}</span>
                  </p>
                ) : null;
              })()}
            </div>
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
  );
}

