import type { Product } from '../../types';

type Props = {
  styles: Record<string, string>;
  items: Product[];
  onDetail?: (p: Product) => void;
  onEdit: (p: Product) => void;
  onRevoke: (id: number) => void;
  onDownloadQr: (p: Product) => void;
};

export function ProductsTable({ styles, items, onDetail, onEdit, onRevoke, onDownloadQr }: Props) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Batch ID</th>
            <th>Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Image</th>
            <th>Download</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', color: '#6b7280', padding: '1.5rem' }}>
                No data
              </td>
            </tr>
          ) : (
            items.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>
                <code style={{ fontSize: '0.8125rem' }} title={p.code}>
                  {p.code.length > 16 ? `${p.code.slice(0, 14)}…` : p.code}
                </code>
              </td>
              <td>{p.nameEn}</td>
              <td>{p.sku || '—'}</td>
              <td>{p.productCategory || '—'}</td>
              <td>{p.imageUrl ? 'Yes' : '—'}</td>
              <td>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => onDownloadQr(p)}
                  title="Download trace QR PDF"
                >
                  Download
                </button>
              </td>
              <td>
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

