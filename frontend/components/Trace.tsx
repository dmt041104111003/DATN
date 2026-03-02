'use client';

import { useState } from 'react';
import { Header } from './Header';
import { submitTraceForm } from '@/lib/trace';
import { Globe } from '@/components/globe';

export function Trace() {
  const [policyId, setPolicyId] = useState('');
  const [assetName, setAssetName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const p = policyId?.trim();
    const a = assetName?.trim();
    if (!p || !a) {
      setError('Policy ID and Asset name are required.');
      return;
    }
    setLoading(true);
    try {
      const id = await submitTraceForm(p, a);
      window.location.href = `/trace/${id}`;
    } catch (err) {
      setError((err as Error).message ?? 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative w-full h-screen flex flex-col overflow-hidden bg-[#f2f2f2] service trace-section">
      <Header />

      <Globe />

      <div className="relative z-10 flex-1 flex items-center justify-center md:justify-center md:pl-[50%] px-4 py-20 md:py-24 min-h-0">
        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
          <input
            type="text"
            placeholder="Policy ID"
            value={policyId}
            onChange={(e) => setPolicyId(e.target.value)}
            disabled={loading}
            className="w-full px-5 py-3.5 text-base bg-white border border-gray-300 rounded-full outline-none focus:border-[#c41e3a] focus:ring-2 focus:ring-[#c41e3a]/20 text-gray-800 placeholder-gray-500 disabled:bg-gray-100 disabled:text-gray-400"
          />
          <input
            type="text"
            placeholder="Asset name"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            disabled={loading}
            className="w-full px-5 py-3.5 text-base bg-white border border-gray-300 rounded-full outline-none focus:border-[#c41e3a] focus:ring-2 focus:ring-[#c41e3a]/20 text-gray-800 placeholder-gray-500 disabled:bg-gray-100 disabled:text-gray-400"
          />
          {error && (
            <p className="text-sm text-[#c41e3a]" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-w-[260px] px-5 py-3.5 text-base font-semibold bg-[#c41e3a] hover:bg-[#a81930] text-white rounded-full border border-[#c41e3a] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Tracing…' : 'Trace'}
          </button>
        </form>
      </div>
    </section>
  );
}
