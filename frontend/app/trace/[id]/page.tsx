'use client';

import { useState } from 'react';
import { LanguageProvider } from '@/context/LanguageProvider';
import { RouteMap } from '@/components/RouteMap';
import { MOCK_TRACE_DATA, MOCK_ROUTE_COORDS, MOCK_ROUTE_LABEL } from '@/constants/mock';

type TabId = 'data' | 'map';

export default function TraceResultPage() {
  const [tab, setTab] = useState<TabId>('data');

  return (
    <LanguageProvider>
    <div className="min-h-screen flex flex-col bg-[#f6f6f6] dark:bg-gray-900">
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          window.location.href = '/';
        }}
        className="fixed top-4 left-6 z-50 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:underline"
      >
        Back to home
      </a>
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 pt-14 pb-6 md:py-8">
          <div className="relative z-10 flex gap-1 p-1 rounded-full bg-gray-200 dark:bg-gray-700 w-fit mb-6 mt-2 md:mt-0">
            <button
              type="button"
              onClick={() => setTab('data')}
              className={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#ee2c2c] focus-visible:ring-offset-2 ${
                tab === 'data'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Data
            </button>
            <button
              type="button"
              onClick={() => setTab('map')}
              className={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#ee2c2c] focus-visible:ring-offset-2 ${
                tab === 'map'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Route
            </button>
          </div>

          {tab === 'data' && (
            <div className="relative z-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 md:p-6">
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Trace data
                </h2>
                <dl className="space-y-2 text-sm">
                  <div className="min-w-0">
                    <dt className="text-gray-500 dark:text-gray-400">Policy ID</dt>
                    <dd className="text-gray-800 dark:text-gray-200 font-mono break-all">
                      {MOCK_TRACE_DATA.policyId}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Asset name</dt>
                    <dd className="text-gray-800 dark:text-gray-200">
                      {MOCK_TRACE_DATA.assetName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Created</dt>
                    <dd className="text-gray-800 dark:text-gray-200">
                      {new Date(MOCK_TRACE_DATA.createdAt).toLocaleString()}
                    </dd>
                  </div>
                </dl>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">
                  Steps
                </h3>
                <ul className="space-y-2">
                  {MOCK_TRACE_DATA.steps.map((s) => (
                    <li
                      key={s.step}
                      className="flex flex-wrap items-baseline gap-2 text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                    >
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        Step {s.step}:
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{s.location}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">{s.timestamp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === 'map' && (
            <div className="relative z-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden p-4 md:p-6">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Route
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {MOCK_ROUTE_LABEL}
              </p>
              <RouteMap routeCoordinates={MOCK_ROUTE_COORDS} height={360} />
            </div>
          )}
        </div>
      </div>
    </div>
    </LanguageProvider>
  );
}
