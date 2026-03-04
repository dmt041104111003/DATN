import type { Certificate } from '../../lib/certificate';
import { formatDate } from '../../utils/date';
import { truncate } from '../../utils/string';

type Props = {
  styles: Record<string, string>;
  items: Certificate[];
  onDetail?: (cert: Certificate) => void;
  onEdit?: (cert: Certificate) => void;
  onDelete?: (cert: Certificate) => void;
};

export function CertTable({ styles, items, onDetail, onEdit, onDelete }: Props) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>No.</th>
            <th>Authority</th>
            <th>Expiry</th>
            <th>Issued</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', color: '#6b7280', padding: '1.5rem' }}>
                No data
              </td>
            </tr>
          ) : (
            items.map((cert) => (
            <tr key={cert.id}>
              <td>{cert.id}</td>
              <td title={cert.title}>
                <span className={styles.cellTruncate}>{truncate(cert.title)}</span>
              </td>
              <td title={cert.number ?? ''}>
                <span className={styles.cellTruncate}>{cert.number || '—'}</span>
              </td>
              <td title={cert.authority ?? ''}>
                <span className={styles.cellTruncate}>{cert.authority || '—'}</span>
              </td>
              <td>
                {cert.expiryDate ? formatDate(cert.expiryDate) : '—'}
              </td>
              <td>{formatDate(cert.issuedAt)}</td>
              <td>
                <div className={styles.actions}>
                  {onDetail && (
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => onDetail(cert)}
                      title="View details"
                    >
                      Detail
                    </button>
                  )}
                  {onEdit && (
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => onEdit(cert)}
                      title="Edit certificate"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      className={styles.btnDanger}
                      onClick={() => onDelete(cert)}
                      title="Delete certificate"
                    >
                      Delete
                    </button>
                  )}
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
