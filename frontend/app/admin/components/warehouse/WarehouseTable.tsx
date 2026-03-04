import type { WarehouseItem } from '../../lib/warehouse';
import { formatDate } from '../../utils/date';
import { truncate } from '../../utils/string';

type Props = {
  styles: Record<string, string>;
  items: WarehouseItem[];
  onDetail?: (item: WarehouseItem) => void;
  onBurn: (item: WarehouseItem) => void;
  onLock: (item: WarehouseItem) => void;
  burningBatchId: string | null;
};

export function WarehouseTable({ styles, items, onDetail, onBurn, onLock, burningBatchId }: Props) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Batch</th>
            <th>Status</th>
            <th>Received</th>
            <th>Out</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: '#6b7280', padding: '1.5rem' }}>
                No data
              </td>
            </tr>
          ) : (
            items.map((item, index) => {
            const statusLabel =
              item.status === 'CONSUMED'
                ? 'Consumed'
                : item.status === 'ON_WAY'
                  ? 'On way'
                  : 'In warehouse';
            const canBurn =
              item.status === 'IN_WAREHOUSE' && burningBatchId !== item.batchId;
            const canLock = item.status === 'IN_WAREHOUSE' && !!item.policyId;
            return (
            <tr key={`wh-${item.batchId}-${index}`}>
              <td title={`${item.batchName}\n${item.batchId}`}>
                <span className={styles.cellTruncate}>{truncate(item.batchName)}</span>
                <br />
                <small style={{ color: '#6b7280', fontSize: '0.8125rem' }} className={styles.cellTruncate} title={item.batchId}>
                  {truncate(item.batchId, 16)}
                </small>
              </td>
              <td>{statusLabel}</td>
              <td>{formatDate(item.receivedAt)}</td>
              <td>{item.outAt ? formatDate(item.outAt) : '–'}</td>
              <td>
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
                    title="Burn (wallet must hold this NFT)"
                  >
                    {burningBatchId === item.batchId ? 'Burning...' : 'Burn'}
                  </button>
                </div>
              </td>
            </tr>
            );
          })
          )}
        </tbody>
      </table>
    </div>
  );
}
