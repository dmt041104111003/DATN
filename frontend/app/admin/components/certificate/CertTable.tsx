import type { Certificate } from '../../lib/certificate';
import { formatDate } from '../../utils/date';

type Props = {
  styles: Record<string, string>;
  items: Certificate[];
};

export function CertTable({ styles, items }: Props) {
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
            <th>Expiry</th>
            <th>Image</th>
            <th>Issued</th>
          </tr>
        </thead>
        <tbody>
          {items.map((cert) => (
            <tr key={cert.id}>
              <td>{cert.id}</td>
              <td>{cert.title}</td>
              <td>{cert.number || '—'}</td>
              <td>{cert.authority || '—'}</td>
              <td>{cert.documentType || '—'}</td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
