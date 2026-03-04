import type { TraceData, TraceIdParams } from '@/types/trace';
import { formatPropertyValue, getAdditionalPropertyDisplayLabel, getProductImageUrl } from '@/utils/utils';

type Props = {
  data: TraceData;
  paramsDecoded: TraceIdParams | null;
};

export function TraceDataTab({ data, paramsDecoded }: Props) {
  const explorerBase =
    process.env.NEXT_PUBLIC_EXPLORER_TX_URL ?? 'https://preprod.cexplorer.io/tx';
  return (
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
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-gray-700">Policy ID</td>
                <td className="border border-gray-300 px-4 py-2 font-mono text-gray-900 break-all text-xs sm:text-sm">
                  {data.core?.policyId ??
                    paramsDecoded?.policyId ??
                    (data.metadata?.policy_id as string) ??
                    '—'}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-gray-700">Asset name</td>
                <td className="border border-gray-300 px-4 py-2 font-mono text-gray-900 break-all">
                  {data.core?.assetName ??
                    paramsDecoded?.assetName ??
                    (data.metadata?.name as string) ??
                    '—'}
                </td>
              </tr>
              {data.core?.standard && (
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Standard</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900 break-words">
                    {data.core.standard}
                  </td>
                </tr>
              )}
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-gray-700">Asset status</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-900">
                  {data.burnStatus === 'burned' ? 'Retired' : 'Active'}
                </td>
              </tr>
              {data.core?.referenceUtxo && (
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Reference UTxO</td>
                  <td className="border border-gray-300 px-4 py-2 font-mono text-gray-900 break-all text-xs sm:text-sm">
                    {data.core.referenceUtxo}
                  </td>
                </tr>
              )}
              {data.core?.batch.originSiteCode && (
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Origin site code</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900 break-words">
                    {data.core.batch.originSiteCode}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {data.core?.certificates && data.core.certificates.length > 0 && (
        <section className="border-t border-gray-200">
          <h2 className="flex items-center gap-2 px-4 py-3 bg-gray-50 text-base font-semibold text-gray-900">
            Certificates
          </h2>
          <div className="p-4 min-w-0 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-800">
                    Title
                  </th>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-800">
                    Number
                  </th>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-800">
                    Authority
                  </th>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-800">
                    Expiry
                  </th>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-800">
                    Issuer
                  </th>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-800">
                    Document
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.core.certificates.map((c) => (
                  <tr key={c.id}>
                    <td className="border border-gray-300 px-3 py-2 text-gray-900">
                      {c.title}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-900">
                      {c.number ?? '—'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-900">
                      {c.authority ?? '—'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-900">
                      {c.expiryDate ? formatPropertyValue(c.expiryDate) : '—'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-900">
                      {c.issuerName ?? '—'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-900">
                      {c.documentUrl ? (
                        <a
                          href={c.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#c41e3a] hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {data.route?.steps && data.route.steps.length > 0 && (
        <section className="border-t border-gray-200">
          <h2 className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-l-4 border-[#c41e3a] text-base font-semibold text-gray-900">
            Route & audit trail
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm min-w-[640px]">
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-800">
                    Step
                  </th>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-800">
                    From
                  </th>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-800">
                    To
                  </th>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-800">
                    Carrier / Mode
                  </th>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-800">
                    Tx hash
                  </th>
                  <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-800">
                    Declaration
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.route.steps.map((s) => (
                  <tr key={s.stepIndex}>
                    <td className="border border-gray-300 px-3 py-2 text-gray-900">
                      {s.stepIndex + 1}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-900 text-xs sm:text-sm">
                      <div className="font-medium">{s.from.name ?? '—'}</div>
                      {s.from.location && (
                        <div className="text-gray-600">{s.from.location}</div>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-900 text-xs sm:text-sm">
                      <div className="font-medium">{s.to.name ?? '—'}</div>
                      {s.to.location && (
                        <div className="text-gray-600">{s.to.location}</div>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-900 text-xs sm:text-sm">
                      <div>{s.carrierName ?? '—'}</div>
                      {s.transportMode && (
                        <div className="text-gray-600">{s.transportMode}</div>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-900 text-xs font-mono break-all">
                      {s.txHash ? (
                        <a
                          href={`${explorerBase}/${s.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#c41e3a] hover:underline"
                        >
                          {s.txHash}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm">
                      {s.actualDepartureAt && s.txCreatedAt ? (
                        <div className="space-y-0.5">
                          <div>
                            <span className="font-medium">Departure: </span>
                            <span>{formatPropertyValue(s.actualDepartureAt)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Tx created: </span>
                            <span>{formatPropertyValue(s.txCreatedAt)}</span>
                          </div>
                          {s.delayedDeclaration && (
                            <div className="text-amber-700">Delayed declaration &gt; 24h</div>
                          )}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {data.shipping?.deliveries && data.shipping.deliveries.length > 0 && (
        <section className="border-t border-gray-200">
          <h2 className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-l-4 border-[#c41e3a] text-base font-semibold text-gray-900">
            Shipping responsibility
          </h2>
          <div className="p-4 space-y-3 text-sm">
            {data.shipping.deliveries.map((d) => (
              <div
                key={d.id}
                className="border border-gray-200 rounded-md px-3 py-2 bg-gray-50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-gray-800">
                    Delivery #{d.id} – {d.status}
                  </span>
                  {d.lockedInScript && (
                    <span className="text-xs text-indigo-700">
                      Locked in script (shipper + receiver must sign).
                    </span>
                  )}
                </div>
                <div className="mt-1 space-y-0.5">
                  {d.partialSignedByName && (
                    <p>
                      Đã ký bởi shipper:{' '}
                      <span className="font-medium">{d.partialSignedByName}</span>
                    </p>
                  )}
                  {d.secondSignedByName && d.actualDeliveryAt && (
                    <p>
                      Receiver{' '}
                      <span className="font-medium">{d.secondSignedByName}</span> xác
                      confirmed at{' '}
                      <span className="font-mono text-xs">
                        {formatPropertyValue(d.actualDeliveryAt)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.inventory && (
        <section className="border-t border-gray-200">
          <h2 className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-l-4 border-[#c41e3a] text-base font-semibold text-gray-900">
            Inventory & lifecycle
          </h2>
          <div className="p-4 text-sm space-y-1">
            <p>
              <span className="font-medium">Warehouse status: </span>
              <span>{data.inventory.status ?? '—'}</span>
            </p>
            {(data.inventory.zone ||
              data.inventory.aisle ||
              data.inventory.rack ||
              data.inventory.bin) && (
              <p>
                <span className="font-medium">Location: </span>
                <span>
                  {[data.inventory.zone, data.inventory.aisle, data.inventory.rack, data.inventory.bin]
                    .filter(Boolean)
                    .join(' / ') || '—'}
                </span>
              </p>
            )}
            <p>
              <span className="font-medium">Burn status: </span>
              <span>
                {data.inventory.burned || data.burnStatus === 'burned'
                  ? 'spent – lifecycle ended'
                  : 'active in supply chain'}
              </span>
            </p>
            {data.inventory.burnTxHash && (
              <p>
                <span className="font-medium">Burn tx: </span>
                <span className="font-mono text-xs break-all">
                  {data.inventory.burnTxHash}
                </span>
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

