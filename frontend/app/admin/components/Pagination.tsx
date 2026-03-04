'use client';

import styles from '../styles/Pagination.module.css';
import type { PaginationProps } from '../types';
import { getPageNumbers } from '../utils/pagination';

export default function Pagination(props: PaginationProps) {
  const {
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    pageSize = 10,
  } = props;

  const start = (currentPage - 1) * pageSize + 1;
  const end = totalItems != null ? Math.min(currentPage * pageSize, totalItems) : currentPage * pageSize;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const pages = getPageNumbers(currentPage, totalPages);
  const showNav = totalPages > 1;

  if (totalItems == null && !showNav) return null;

  return (
    <div className={styles.wrap}>
      {totalItems != null && (
        <span className={styles.info}>
          {totalItems === 0 ? `Showing 0 of 0` : `Showing ${start}-${end} of ${totalItems}`}
        </span>
      )}
      <nav className={styles.nav} aria-label="Pagination">
        <button
          type="button"
          className={styles.btn}
          disabled={!hasPrev}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          &#8249;
        </button>
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e-${i}`} className={styles.ellipsis}>&#8230;</span>
          ) : (
            <button
              key={p}
              type="button"
              className={p === currentPage ? styles.btnActive : styles.btn}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          className={styles.btn}
          disabled={!hasNext}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          &#8250;
        </button>
      </nav>
    </div>
  );
}
