import type { Certificate } from '../../lib/certificate';
import { formatDate } from '../../utils/date';

type Props = {
  styles: Record<string, string>;
  items: Certificate[];
  onDetail?: (cert: Certificate) => void;
};

export function CertTable({ styles, items, onDetail }: Props) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>No.</th>
            <th>Authority</th>
            <th>Document type</th>
            <th>Standard</th>
            <th>Scope</th>
            <th>Expiry</th>
            <th>Image</th>
            <th>Issued</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={11} style={{ textAlign: 'center', color: '#6b7280', padding: '1.5rem' }}>
                No data
              </td>
            </tr>
          ) : (
            items.map((cert) => (
            <tr key={cert.id}>
              <td>{cert.id}</td>
              <td>{cert.title}</td>
              <td>{cert.number || '—'}</td>
              <td>{cert.authority || '—'}</td>
              <td>{cert.documentType || '—'}</td>
              <td>{cert.standardReference || '—'}</td>
              <td>
                <span title={cert.scope ?? ''}>
                  {cert.scope && cert.scope.length > 20 ? `${cert.scope.slice(0, 20)}…` : (cert.scope || '—')}
                </span>
              </td>
              <td>
                {cert.expiryDate ? formatDate(cert.expiryDate) : '—'}
              </td>
              <td>
                {cert.imageUrl ? (
                  <a
                    href={cert.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open image"
                    style={{
                      fontSize: '0.8125rem',
                      color: 'inherit',
                      textDecoration: 'underline',
                    }}
                  >
                    View
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td>{formatDate(cert.issuedAt)}</td>
              <td>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => onDetail?.(cert)}
                    title="View details"
                  >
                    Detail
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
