'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductBanner } from '@/components/ProductBanner';
import { ProductList } from '@/components/ProductList';
import { Footer } from '@/components/Footer';
import Pagination from '@/app/admin/components/Pagination';
import { slugify } from '@/lib/slugify';
import { PRODUCT_CATEGORIES, ORDERED_CATEGORY_IDS } from '@/constants/products';
import type { ProductItem } from '@/types';

const CATEGORY_IDS = new Set(PRODUCT_CATEGORIES.map((c) => c.id));
const PAGE_SIZE = 12;

type ApiCategory = { id: number; labelEn: string };

function mapApiProductToItem(p: {
  id: number;
  categoryId: number;
  slug: string;
  nameEn: string;
  nameVi: string;
  nameZh: string;
  nameFr: string;
  imageUrl: string | null;
  category?: { labelEn: string };
}): ProductItem {
  return {
    id: String(p.id),
    categoryId: String(p.categoryId),
    categorySlug: p.category ? slugify(p.category.labelEn) : undefined,
    slug: p.slug,
    name: { en: p.nameEn, vi: p.nameVi, zh: p.nameZh, fr: p.nameFr },
    image: p.imageUrl || '/logo.png',
    useLogoPlaceholder: !p.imageUrl,
  };
}

export function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((list: ApiCategory[]) => {
        setApiCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, []);

  const slugToId = useMemo(() => {
    const map: Record<string, number> = {};
    apiCategories.forEach((c) => {
      map[slugify(c.labelEn)] = c.id;
    });
    return map;
  }, [apiCategories]);

  const categoryIdForApi = useMemo(() => {
    const type = searchParams.get('type');
    if (!type) return undefined;
    if (slugToId[type] != null) return slugToId[type];
    const num = Number(type);
    if (!Number.isNaN(num) && apiCategories.length > 0) {
      const ids = apiCategories.map((c) => c.id);
      if (ids.includes(num)) return num;
    }
    if (CATEGORY_IDS.has(type) && apiCategories.length > 0) {
      const index = ORDERED_CATEGORY_IDS.indexOf(type);
      const ids = apiCategories.map((c) => c.id);
      if (index >= 0 && index < ids.length) return ids[index];
    }
    return undefined;
  }, [searchParams, slugToId, apiCategories]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(PAGE_SIZE));
    if (categoryIdForApi != null) params.set('categoryId', String(categoryIdForApi));
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    fetch(`/api/products?${params}`)
      .then((res) => res.json())
      .then((data: { items?: unknown[]; total?: number }) => {
        const items = Array.isArray(data?.items) ? data.items : [];
        setProducts(items.map((p) => mapApiProductToItem(p as Parameters<typeof mapApiProductToItem>[0])));
        setTotal(Number(data?.total) ?? 0);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, categoryIdForApi, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [categoryIdForApi, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="min-h-screen m-0 p-0 bg-white dark:bg-gray-900">
      <ProductBanner />
      <div className="bg-white dark:bg-gray-900">
        {categoryIdForApi != null && (
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 lg:px-16 py-4">
            <input
              type="search"
              placeholder="Tìm theo tên hoặc ID sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        )}
        {loading ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">Đang tải...</div>
        ) : (
          <>
            <ProductList products={products} />
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 lg:px-16 pb-8 text-gray-700 dark:text-gray-300">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={total}
                pageSize={PAGE_SIZE}
              />
            </div>
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
