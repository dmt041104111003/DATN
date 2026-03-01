import type { Product } from '../../types';

type Props = {
  styles: Record<string, string>;
  items: Product[];
  onEdit: (p: Product) => void;
  onRevoke: (id: number) => void;
};

export function ProductsTable({ styles, items, onEdit, onRevoke }: Props) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Name</th>
            <th>Image</th>
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

