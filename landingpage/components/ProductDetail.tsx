'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageProvider';
import { Language, ProductItem } from '@/types';

interface ProductDetailProps {
  product: ProductItem;
  relatedProducts?: ProductItem[];
}

const SECTION_FALLBACK: Record<Language, (n: number) => string> = {
  en: (n) => `Section ${n}`,
  vi: (n) => `Phần ${n}`,
  zh: (n) => `第${n}部分`,
  fr: (n) => `Section ${n}`,
};

function getYoutubeEmbedUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const u = url.trim();
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

const META_CODE: Record<Language, string> = {
  en: 'Code',
  vi: 'Mã',
  zh: '编号',
  fr: 'Code',
};

const MENU_TITLE: Record<Language, string> = {
  en: 'Contents',
  vi: 'Mục lục',
  zh: '目录',
  fr: 'Sommaire',
};

export function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  const { language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const title = product.name[language];
  const categoryLabel = product.categoryLabel?.[language];
  const hasBlocks = product.descriptionBlocks && product.descriptionBlocks.length > 0;
  const body = !hasBlocks ? (product.description?.[language]?.trim() ?? '') : '';
  const embedUrl = product.youtubeUrl ? getYoutubeEmbedUrl(product.youtubeUrl) : null;

  const scrollToSection = (id: string, idx?: number) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    if (idx != null) setActiveSection(idx);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!hasBlocks || !product.descriptionBlocks) return;
    const ids = product.descriptionBlocks.map((_, i) => `product-section-${i}`);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const idx = ids.indexOf(e.target.id);
          if (idx >= 0) setActiveSection(idx);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [hasBlocks, product.descriptionBlocks]);

  return (
    <article className="w-full py-8 md:py-14 bg-white dark:bg-gray-900">
      <div className={`mx-auto px-4 sm:px-6 md:px-8 ${hasBlocks ? 'max-w-6xl flex gap-8 md:gap-10' : 'max-w-3xl'}`}>
        {hasBlocks && product.descriptionBlocks && (
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <nav className="sticky top-28" aria-label="Mục lục">
              <ul className="space-y-1 text-sm">
                {product.descriptionBlocks.map((block, idx) => {
                  const label = block.title?.[language]?.trim() || SECTION_FALLBACK[language](idx + 1);
                  const isActive = activeSection === idx;
                  return (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(`product-section-${idx}`, idx)}
                        className={`w-full text-left py-2 px-3 rounded-lg transition-colors ${isActive ? 'text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      >
                        {label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        )}
        <div className={`flex-1 min-w-0 ${hasBlocks ? '' : 'max-w-3xl mx-auto'}`}>
        {hasBlocks && product.descriptionBlocks && (
          <div className="lg:hidden mb-6">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-2 py-2 px-4 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={MENU_TITLE[language]}
            >
              <span className="material-icons text-lg">menu</span>
              <span>{MENU_TITLE[language]}</span>
            </button>
            <div
              className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
              aria-modal="true"
              role="dialog"
              aria-hidden={!mobileMenuOpen}
            >
              <div
                className={`absolute inset-0 bg-black/30 transition-opacity duration-250 ease-out ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden
              />
              <aside
                className={`absolute top-0 left-0 bottom-0 w-64 max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl flex flex-col transition-transform duration-250 ease-out ${
                  mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{MENU_TITLE[language]}</span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close"
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>
                <nav className="flex-1 overflow-auto p-4" aria-label="Mục lục">
                  <ul className="space-y-1">
                    {product.descriptionBlocks.map((block, idx) => {
                      const label = block.title?.[language]?.trim() || SECTION_FALLBACK[language](idx + 1);
                      const isActive = activeSection === idx;
                      return (
                        <li key={idx}>
                          <button
                            type="button"
                            onClick={() => scrollToSection(`product-section-${idx}`, idx)}
                            className={`w-full text-left py-3 px-3 rounded-lg transition-colors ${isActive ? 'text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                          >
                            {label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </aside>
            </div>
          </div>
        )}
        {categoryLabel && (
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3">
            {categoryLabel}
          </p>
        )}

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-50 leading-tight mb-6">
          {title}
        </h1>

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

        {hasBlocks && product.descriptionBlocks && (
          <div className="space-y-10 mb-10">
            {product.descriptionBlocks.map((block, idx) => {
              const blockEmbedUrl = block.youtubeUrl ? getYoutubeEmbedUrl(block.youtubeUrl) : null;
              const sectionTitle = block.title?.[language]?.trim();
              return (
                <section key={idx} id={`product-section-${idx}`} className="space-y-4 scroll-mt-28">
                  {sectionTitle && (
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      {sectionTitle}
                    </h2>
                  )}
                  {block.image && (
                    <div className="relative w-full aspect-[16/10] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <Image
                        src={block.image}
                        alt=""
                        fill
                        unoptimized={block.image.startsWith('http')}
                        className="object-cover"
                        sizes="(max-width: 896px) 100vw, 896px"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo.png';
                        }}
                      />
                    </div>
                  )}
                  {block.text?.[language]?.trim() && (
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      {block.text[language].trim().split(/\n\n+/).map((para, i) => (
                        <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5 last:mb-0">
                          {para.trim()}
                        </p>
                      ))}
                    </div>
                  )}
                  {blockEmbedUrl && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                      <iframe
                        src={blockEmbedUrl}
                        title=""
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {!hasBlocks && body && (
          <div className="prose prose-lg dark:prose-invert max-w-none mb-10">
            {body.split(/\n\n+/).map((para, i) => (
              <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5 last:mb-0">
                {para.trim()}
              </p>
            ))}
          </div>
        )}

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

        <footer className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {META_CODE[language]}: {product.id}
            {categoryLabel && ` · ${categoryLabel}`}
          </p>
        </footer>

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
      </div>
    </article>
  );
}
