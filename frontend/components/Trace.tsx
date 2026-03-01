'use client';

import { useState } from 'react';
import { Header } from './Header';

function Globe() {
  return (
    <div className="globe" style={{ zIndex: 0 }}>
      <div className="worldmap" />
      <div className="puff" />
    </div>
  );
}

export function Trace() {
  const [policyId, setPolicyId] = useState('');
  const [assetName, setAssetName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className="relative w-full h-screen flex flex-col overflow-hidden bg-[#f6f6f6] dark:bg-gray-900 service trace-section">
      <Header />

      {/* Globe: con trực tiếp của section như Network → containing block = section, hiện đúng trên mobile */}
      <Globe />

      <div className="relative z-10 flex-1 flex items-center justify-center md:justify-center md:pl-[50%] px-4 py-20 md:py-24 min-h-0">
        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
          <input
              type="text"
              placeholder="Policy ID"
              value={policyId}
              onChange={(e) => setPolicyId(e.target.value)}
              className="w-full px-5 py-3.5 text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full outline-none focus:border-[#ee2c2c] dark:focus:border-red-500 text-gray-800 dark:text-gray-200 placeholder-gray-400"
            />
          <input
              type="text"
              placeholder="Asset name"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="w-full px-5 py-3.5 text-base bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full outline-none focus:border-[#ee2c2c] dark:focus:border-red-500 text-gray-800 dark:text-gray-200 placeholder-gray-400"
            />
          <button
              type="submit"
              className="w-full min-w-[260px] px-5 py-3.5 text-base font-semibold bg-[#e5e7eb] dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer transition-colors hover:bg-[#d1d5db] dark:hover:bg-gray-600"
            >
              Trace
            </button>
          </form>
      </div>
    </section>
  );
}
