'use client';

import { useLanguage } from '@/context/LanguageProvider';
import {
  PRODUCT_SEARCH_PLACEHOLDER,
  PRODUCT_FILTER_SORT,
  PRODUCT_SORT_OPTIONS,
  PRODUCT_TYPE_LABEL,
  PRODUCT_TYPE_OPTIONS,
  PRODUCT_CATEGORIES,
} from '@/constants/products';

type SortKey = 'newest';
type ProductTypeFilter = string;

interface ProductFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  productType: ProductTypeFilter;
  onProductTypeChange: (value: ProductTypeFilter) => void;
  sortBy: SortKey;
  onSortChange: (value: SortKey) => void;
}

export function ProductFilter({
  searchQuery,
  onSearchChange,
  productType,
  onProductTypeChange,
  sortBy,
  onSortChange,
}: ProductFilterProps) {
  const { language } = useLanguage();

  return (
    <section className="w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 lg:px-16 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={PRODUCT_SEARCH_PLACEHOLDER[language]}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {PRODUCT_TYPE_LABEL[language]}:
            </span>
            <select
              value={productType}
              onChange={(e) => onProductTypeChange(e.target.value as ProductTypeFilter)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">{PRODUCT_TYPE_OPTIONS.all[language]}</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label[language]}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {PRODUCT_FILTER_SORT[language]}:
            </span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortKey)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="newest">{PRODUCT_SORT_OPTIONS.newest[language]}</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
