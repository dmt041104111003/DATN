import type { WarehouseItem } from '../../lib/warehouse';
import { formatDate } from '../../utils/date';

type Props = {
  styles: Record<string, string>;
  items: WarehouseItem[];
  onBurn: (item: WarehouseItem) => void;
  onLock: (item: WarehouseItem) => void;
  burningBatchId: string | null;
};

export function WarehouseCards({ styles, items, onBurn, onLock, burningBatchId }: Props) {
  return (
    <div className={styles.tableCards}>
      {items.map((item) => (
        <div key={item.batchId} className={styles.tableCard}>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Name</span>
            <span className={styles.tableCardValue}>
              {item.batchName}
              <br />
              <small style={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                {item.batchId}
              </small>
            </span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Qty</span>
            <span className={styles.tableCardValue}>{item.quantity}</span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Received</span>
            <span className={styles.tableCardValue}>{formatDate(item.mintedAt)}</span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Shipped</span>
            <span className={styles.tableCardValue}>{item.status === 'SHIPPED' ? 'Yes' : '—'}</span>
          </div>
          <div className={styles.tableCardActions}>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => onLock(item)}
                disabled={item.status === 'SHIPPED' || !item.policyId}
                title="Stock out"
                >
                  Stock out
                </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={() => onBurn(item)}
                disabled={burningBatchId === item.batchId || item.status === 'SHIPPED'}
                title="Burn"
              >
                {burningBatchId === item.batchId ? 'Burning...' : 'Burn'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
