'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageProvider';
import { PRODUCT_PAGE_TITLE } from '@/constants/products';
import { ProductItem } from '@/types';
import Image from 'next/image';

interface ProductListProps {
  products: ProductItem[];
}

export function ProductList({ products }: ProductListProps) {
  const { language } = useLanguage();

  return (
    <section className="w-full py-8 md:py-12 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 lg:px-16">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {PRODUCT_PAGE_TITLE[language]}
          </h2>
          <div className="h-1 w-16 bg-red-500 dark:bg-red-600 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.categorySlug ?? product.categoryId}/${product.slug}`}
              className="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-xl dark:hover:border-gray-600 transition-all"
            >
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                <Image
                  src={product.image}
                  alt={product.name[language]}
                  fill
                  unoptimized={product.image.startsWith('http')}
                  className="object-cover"
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
                {product.useLogoPlaceholder && (
                  <div className="absolute inset-0 bg-black/40 dark:bg-black/50 pointer-events-none" aria-hidden />
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-100 line-clamp-2">
                  {product.name[language]}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
