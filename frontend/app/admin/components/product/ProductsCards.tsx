import type { Product } from '../../types';

type Props = {
  styles: Record<string, string>;
  items: Product[];
  onDetail?: (p: Product) => void;
  onEdit: (p: Product) => void;
  onRevoke: (id: number) => void;
  onDownloadQr: (p: Product) => void;
};

export function ProductsCards({ styles, items, onDetail, onEdit, onRevoke, onDownloadQr }: Props) {
  return (
    <div className={styles.tableCards}>
      {items.length === 0 ? null : (
        items.map((p) => (
        <div key={p.id} className={styles.tableCard}>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>ID</span>
            <span className={styles.tableCardValue}>{p.id}</span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Batch ID</span>
            <span className={styles.tableCardValue}>{p.code}</span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Name</span>
            <span className={styles.tableCardValue}>{p.nameEn}</span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>SKU</span>
            <span className={styles.tableCardValue}>{p.sku || '—'}</span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Category</span>
            <span className={styles.tableCardValue}>{p.productCategory || '—'}</span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Image</span>
            <span className={styles.tableCardValue}>
              {p.imageUrl ? 'Yes' : '—'}
            </span>
          </div>
          <div className={styles.tableCardActions}>
            <div className={styles.actions}>
              {onDetail && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => onDetail(p)}
                  title="View details"
                >
                  Detail
                </button>
              )}
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => onEdit(p)}
              >
                Edit
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => onRevoke(p.id)}
              >
                Revoke
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => onDownloadQr(p)}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      ))
      )}
    </div>
  );
}

