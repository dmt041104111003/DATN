import type { OrderDeliveryItem } from '../../lib/order';

type Props = {
  styles: Record<string, string>;
  items: OrderDeliveryItem[];
  onComplete: (d: OrderDeliveryItem) => void;
};

export function OrderCards({ styles, items, onComplete }: Props) {
  return (
    <div className={styles.tableCards}>
      {items.map((d) => (
        <div key={d.id} className={styles.tableCard}>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Batch</span>
            <span className={styles.tableCardValue} title={d.batchId}>
              {d.batchId.slice(0, 16)}…
            </span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Recipient</span>
            <span className={styles.tableCardValue} title={d.recipientAddress}>
              {d.recipientAddress.slice(0, 20)}…
            </span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Tx</span>
            <span className={styles.tableCardValue}>
              <code style={{ fontSize: '0.75rem' }}>
                {d.lockTxHash.slice(0, 10)}…#{d.scriptOutputIndex}
              </code>
            </span>
          </div>
          <div className={styles.tableCardRow}>
            <span className={styles.tableCardLabel}>Status</span>
            <span className={styles.tableCardValue}>
              {d.status === 'DELIVERED' ? (
                <span style={{ color: '#059669', fontWeight: 600 }}>DELIVERED</span>
              ) : (
                <span>IN_TRANSIT</span>
              )}
            </span>
          </div>
          <div className={styles.tableCardActions}>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => onComplete(d)}
                disabled={d.status === 'DELIVERED' || !!d.unlockTxHash}
                title="View details"
              >
                Detail
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
