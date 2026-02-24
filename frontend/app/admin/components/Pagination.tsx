'use client';

import styles from '../styles/Pagination.module.css';

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
};

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | 'ellipsis')[] = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('ellipsis');
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push('ellipsis');
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push('ellipsis');
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push('ellipsis');
    pages.push(total);
  }
  return pages;
}

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
          {totalItems === 0 ? 'No data' : `Showing ${start}-${end} of ${totalItems}`}
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
