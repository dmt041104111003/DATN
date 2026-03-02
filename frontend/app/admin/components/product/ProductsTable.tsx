import type { Product } from '../../types';

type Props = {
  styles: Record<string, string>;
  items: Product[];
  onEdit: (p: Product) => void;
  onRevoke: (id: number) => void;
  onDownloadQr: (p: Product) => void;
};

export function ProductsTable({ styles, items, onEdit, onRevoke, onDownloadQr }: Props) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Name</th>
            <th>Image</th>
            <th>Download</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.code}</td>
              <td>{p.nameEn}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

