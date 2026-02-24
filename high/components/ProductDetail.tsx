'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageProvider';
import { Language, ProductItem } from '@/types';

interface ProductDetailProps {
  product: ProductItem;
  relatedProducts?: ProductItem[];
}

function getYoutubeEmbedUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const u = url.trim();
  // Support both watch and embed forms
  const embedMatch = u.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch) return u;
  const watchMatch = u.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortMatch = u.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  if (/^[a-zA-Z0-9_-]{11}$/.test(u)) return `https://www.youtube.com/embed/${u}`;
  return null;
}

const RELATED_TITLE: Record<Language, string> = {
  en: 'Related',
  vi: 'Sản phẩm liên quan',
  zh: '相关产品',
  fr: 'Produits similaires',
};

export function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  const { language } = useLanguage();
  const title = product.name[language];
  const categoryLabel = product.categoryLabel?.[language];
  const body = product.description?.[language]?.trim() ?? '';
  const embedUrl = product.youtubeUrl ? getYoutubeEmbedUrl(product.youtubeUrl) : null;

  return (
    <article className="w-full py-8 md:py-14 bg-white dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Category / chuyên mục */}
        {categoryLabel && (
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3">
            {categoryLabel}
          </p>
        )}

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-50 leading-tight mb-6">
          {title}
        </h1>

        {/* Featured image */}
        <figure className="w-full mb-8">
          <div className="relative w-full aspect-[16/10] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <Image
              src={product.image}
              alt={title}
              fill
              unoptimized={product.image.startsWith('http')}
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
            {product.useLogoPlaceholder && (
              <div className="absolute inset-0 bg-black/30 pointer-events-none" aria-hidden />
            )}
          </div>
          {categoryLabel && (
            <figcaption className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {categoryLabel} — {title}
            </figcaption>
          )}
        </figure>

        {/* Body text */}
        {body && (
          <div className="prose prose-lg dark:prose-invert max-w-none mb-10">
            {body.split(/\n\n+/).map((para, i) => (
              <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5 last:mb-0">
                {para.trim()}
              </p>
            ))}
          </div>
        )}

        {/* Video embed */}
        {embedUrl && (
          <div className="mb-10">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={embedUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Meta (ID) - subtle, article-style */}
        <footer className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Mã: {product.id}
            {categoryLabel && ` · ${categoryLabel}`}
          </p>
        </footer>

        {/* Related products - 3 cards same type */}
        {relatedProducts.length > 0 && (
          <section className="mt-14 pt-10 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              {RELATED_TITLE[language]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.categorySlug ?? p.categoryId}/${p.slug}`}
                  className="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={p.image}
                      alt={p.name[language]}
                      fill
                      unoptimized={p.image.startsWith('http')}
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                    {p.useLogoPlaceholder && (
                      <div className="absolute inset-0 bg-black/40 dark:bg-black/50 pointer-events-none" aria-hidden />
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                      {p.name[language]}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
