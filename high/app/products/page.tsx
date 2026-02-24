import { Suspense } from 'react';
import { ProductsPageContent } from './ProductsPageContent';

function ProductsPageFallback() {
  return (
    <main className="min-h-screen m-0 p-0 bg-white dark:bg-gray-900">
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400 dark:text-gray-500">Loading...</div>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductsPageContent />
    </Suspense>
  );
}
