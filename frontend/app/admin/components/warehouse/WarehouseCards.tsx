import type { WarehouseItem } from '../../lib/warehouse';
import { formatDate } from '../../utils/date';

type Props = {
  styles: Record<string, string>;
  items: WarehouseItem[];
  onDetail?: (item: WarehouseItem) => void;
  onBurn: (item: WarehouseItem) => void;
  onLock: (item: WarehouseItem) => void;
  burningBatchId: string | null;
};

export function WarehouseCards({ styles, items, onDetail, onBurn, onLock, burningBatchId }: Props) {
  return (
    <div className={styles.tableCards}>
      {items.map((item, index) => {
        const statusLabel =
          item.status === 'CONSUMED'
            ? 'Consumed'
            : item.status === 'ON_WAY'
              ? 'On way'
              : 'In warehouse';
        const canBurn = item.status === 'IN_WAREHOUSE' && burningBatchId !== item.batchId;
        const canLock = item.status === 'IN_WAREHOUSE' && !!item.policyId;
        return (
        <div key={`wh-card-${item.batchId}-${index}`} className={styles.tableCard}>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Batch</span>
            <span className={styles.tableCardValue} title={`${item.batchName}\n${item.batchId}`}>
              {item.batchName.length > 20 ? `${item.batchName.slice(0, 18)}…` : item.batchName}
              <br />
              <small style={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                {item.batchId.length > 20 ? `${item.batchId.slice(0, 18)}…` : item.batchId}
              </small>
            </span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Status</span>
            <span className={styles.tableCardValue}>{statusLabel}</span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Received</span>
            <span className={styles.tableCardValue}>{formatDate(item.receivedAt)}</span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Out</span>
            <span className={styles.tableCardValue}>{item.outAt ? formatDate(item.outAt) : '–'}</span>
          </div>
          <div className={styles.tableCardActions}>
            <div className={styles.actions}>
              {onDetail && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => onDetail(item)}
                  title="View details"
                >
                  Detail
                </button>
              )}
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => onLock(item)}
                disabled={!canLock}
                title="Stock out"
              >
                Stock out
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={() => onBurn(item)}
                disabled={!canBurn}
                title="Burn"
              >
                {burningBatchId === item.batchId ? 'Burning...' : 'Burn'}
              </button>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}
