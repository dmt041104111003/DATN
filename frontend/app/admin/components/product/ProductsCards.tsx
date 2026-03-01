import type { Product } from '../../types';

type Props = {
  styles: Record<string, string>;
  items: Product[];
  onEdit: (p: Product) => void;
  onRevoke: (id: number) => void;
};

export function ProductsCards({ styles, items, onEdit, onRevoke }: Props) {
  return (
    <div className={styles.tableCards}>
      {items.map((p) => (
        <div key={p.id} className={styles.tableCard}>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>ID</span>
            <span className={styles.tableCardValue}>{p.id}</span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Code</span>
            <span className={styles.tableCardValue}>{p.code}</span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Name</span>
            <span className={styles.tableCardValue}>{p.nameEn}</span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Image</span>
            <span className={styles.tableCardValue}>
              {p.imageUrl ? 'Yes' : '—'}
            </span>
          </div>
          <div className={styles.tableCardActions}>
            <div className={styles.actions}>
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

