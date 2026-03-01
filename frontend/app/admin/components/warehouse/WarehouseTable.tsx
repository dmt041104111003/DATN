import type { WarehouseItem } from '../../lib/warehouse';
import { formatDate } from '../../utils/date';

type Props = {
  styles: Record<string, string>;
  items: WarehouseItem[];
  onBurn: (item: WarehouseItem) => void;
  onLock: (item: WarehouseItem) => void;
  burningBatchId: string | null;
};

export function WarehouseTable({ styles, items, onBurn, onLock, burningBatchId }: Props) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Qty</th>
            <th>Received</th>
            <th>Shipped</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.batchId}>
              <td>
                <span title={item.batchId}>{item.batchName}</span>
                <br />
                <small style={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                  {item.batchId}
                </small>
              </td>
              <td>{item.quantity}</td>
              <td>{formatDate(item.mintedAt)}</td>
              <td>{item.status === 'SHIPPED' ? 'Yes' : '—'}</td>
              <td>
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
                    title="Burn (wallet must hold this NFT)"
                    >
                    {burningBatchId === item.batchId ? 'Burning...' : 'Burn'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
