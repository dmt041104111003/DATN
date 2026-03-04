import type { OrderDeliveryItem } from '../../lib/order';
import { formatDate } from '../../utils/date';

type Props = {
  styles: Record<string, string>;
  items: OrderDeliveryItem[];
  onDetail?: (d: OrderDeliveryItem) => void;
  onComplete: (d: OrderDeliveryItem) => void;
};

export function OrderTable({ styles, items, onDetail, onComplete }: Props) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Batch</th>
            <th>Recipient</th>
            <th>Tx</th>
            <th>Status</th>
            <th>Out</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', color: '#6b7280', padding: '1.5rem' }}>
                No data
              </td>
            </tr>
          ) : (
            items.map((d) => (
            <tr key={d.id}>
              <td>
                <span title={d.batchId}>{d.batchId.slice(0, 12)}…</span>
              </td>
              <td>
                <span title={d.recipientAddress}>
                  {d.recipientAddress.slice(0, 16)}…
                </span>
              </td>
              <td>
                <code style={{ fontSize: '0.75rem' }}>
                  {d.lockTxHash.slice(0, 10)}…#{d.scriptOutputIndex}
                </code>
              </td>
              <td>
                {d.status === 'DELIVERED' ? (
                  <span style={{ color: '#059669', fontWeight: 600 }}>DELIVERED</span>
                ) : (
                  <span>IN_TRANSIT</span>
                )}
              </td>
              <td>{d.outAt ? formatDate(d.outAt) : '–'}</td>
              <td>
                <div className={styles.actions}>
                  {onDetail && (
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => onDetail(d)}
                      title="View details"
                    >
                      Detail
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={() => onComplete(d)}
                    disabled={d.status === 'DELIVERED' || !!d.unlockTxHash}
                    title="Complete delivery"
                  >
                    Complete
                  </button>
                </div>
              </td>
            </tr>
          ))
          )}
        </tbody>
      </table>
    </div>
  );
}
