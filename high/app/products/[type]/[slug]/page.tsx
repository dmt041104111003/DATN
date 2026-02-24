'use client';

import { useParams, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { ProductDetail } from '@/components/ProductDetail';
import { Footer } from '@/components/Footer';
import { slugify } from '@/lib/slugify';
import type { ProductItem } from '@/types';

const LOGO_PLACEHOLDER = '/logo.png';

function mapApiProductToItem(p: {
  id: number;
  categoryId: number;
  slug: string;
  nameEn: string;
  nameVi: string;
  nameZh: string;
  nameFr: string;
  descriptionEn: string | null;
  descriptionVi: string | null;
  descriptionZh: string | null;
  descriptionFr: string | null;
  imageUrl: string | null;
  youtubeUrl?: string | null;
  category?: { labelEn: string; labelVi: string; labelZh: string; labelFr: string };
}): ProductItem {
  return {
    id: String(p.id),
    categoryId: String(p.categoryId),
    categorySlug: p.category ? slugify(p.category.labelEn) : undefined,
    slug: p.slug,
    name: { en: p.nameEn, vi: p.nameVi, zh: p.nameZh, fr: p.nameFr },
    image: p.imageUrl || LOGO_PLACEHOLDER,
    useLogoPlaceholder: !p.imageUrl,
    description: {
      en: p.descriptionEn ?? '',
      vi: p.descriptionVi ?? '',
      zh: p.descriptionZh ?? '',
      fr: p.descriptionFr ?? '',
    },
    categoryLabel: p.category
      ? { en: p.category.labelEn, vi: p.category.labelVi, zh: p.category.labelZh, fr: p.category.labelFr }
      : undefined,
    youtubeUrl: p.youtubeUrl ?? null,
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : undefined;
  const type = typeof params?.type === 'string' ? params.type : undefined;
  const [product, setProduct] = useState<ProductItem | null | undefined>(undefined);
  const [relatedProducts, setRelatedProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    if (!slug || !type) {
      setProduct(null);
      return;
    }
    fetch(`/api/products/${encodeURIComponent(slug)}?type=${encodeURIComponent(type)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => setProduct(mapApiProductToItem(data)))
      .catch(() => setProduct(null));
  }, [slug, type]);

  useEffect(() => {
    if (!product?.categoryId) {
      setRelatedProducts([]);
      return;
    }
    const params = new URLSearchParams({ categoryId: product.categoryId, pageSize: '4' });
    fetch(`/api/products?${params}`)
      .then((res) => res.json())
      .then((data: { items?: unknown[] }) => {
        const items = Array.isArray(data?.items) ? data.items : [];
        const mapped = items.map((p) => mapApiProductToItem(p as Parameters<typeof mapApiProductToItem>[0]));
        const related = mapped.filter((p) => p.slug !== product.slug).slice(0, 3);
        setRelatedProducts(related);
      })
      .catch(() => setRelatedProducts([]));
  }, [product?.categoryId, product?.slug]);

  if (product === undefined) {
    return (
      <main className="min-h-screen m-0 p-0 bg-white dark:bg-gray-900">
        <div className="min-h-[120px] flex flex-col bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <Header />
        </div>
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">Đang tải...</div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen m-0 p-0 bg-white dark:bg-gray-900">
      <div className="min-h-[120px] flex flex-col bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Header />
      </div>
      <ProductDetail product={product} relatedProducts={relatedProducts} />
      <Footer />
    </main>
  );
}
