'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import formStyles from '../../styles/Form.module.css';
import tableStyles from '../../styles/Table.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import Pagination from '../../components/Pagination';
import { readAccountFromToken, getAuthToken } from '../../lib/account';
import {
  getCertificates,
  deleteCertificate,
  type Certificate,
} from '../../lib/certificate';
import { CertHeader } from '../../components/certificate/CertHeader';
import { CertSearch } from '../../components/certificate/CertSearch';
import { CertTable } from '../../components/certificate/CertTable';
import { CertCards } from '../../components/certificate/CertCards';
import { CertCreateDialog } from '../../components/certificate/CertDialog';
import { CertDetailDialog } from '../../components/certificate/CertDetailDialog';

const styles = { ...formStyles, ...tableStyles, ...buttonStyles };
const PAGE_SIZE = 10;
const ALLOWED_ROLES = ['ENTERPRISE'];

export default function CertificatePage() {
  const router = useRouter();
  const [items, setItems] = useState<Certificate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [detailCert, setDetailCert] = useState<Certificate | null>(null);

  useEffect(() => {
    const account = readAccountFromToken();
    const role = account?.roleCode?.toUpperCase() ?? '';
    if (!account || !ALLOWED_ROLES.includes(role)) {
      router.replace('/admin');
      return;
    }
  }, [router]);

  const loadCertificates = async () => {
    const token = getAuthToken();
    if (!token) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { items: list, total: t } = await getCertificates(token, {
        page,
        pageSize: PAGE_SIZE,
        search: searchQuery.trim() || undefined,
      });
      setItems(list);
      setTotal(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load certificates.');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCertificates();
  }, [page, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginatedList = items;

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const handleDelete = async (cert: Certificate) => {
    if (!confirm(`Delete certificate "${cert.title}" (ID ${cert.id})?`)) return;
    const token = getAuthToken();
    if (!token) {
      setError('Session expired. Please log in again.');
      return;
    }
    setError('');
    try {
      await deleteCertificate(token, cert.id);
      await loadCertificates();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete certificate.');
    }
  };

  return (
    <>
      <CertHeader
        styles={styles}
        onAdd={() => { setEditingCert(null); setCreateDialogOpen(true); }}
      />

      <CertSearch
        styles={styles}
        query={searchQuery}
        onChange={setSearchQuery}
      />

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <CertTable
        styles={styles}
        items={paginatedList}
        onDetail={setDetailCert}
        onEdit={(c) => { setEditingCert(c); setCreateDialogOpen(true); }}
        onDelete={handleDelete}
      />
      <CertCards
        styles={styles}
        items={paginatedList}
        onDetail={setDetailCert}
        onEdit={(c) => { setEditingCert(c); setCreateDialogOpen(true); }}
        onDelete={handleDelete}
      />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={total}
        pageSize={PAGE_SIZE}
      />

      <CertCreateDialog
        open={createDialogOpen}
        onClose={() => { setCreateDialogOpen(false); setEditingCert(null); }}
        onSuccess={loadCertificates}
        editingCert={editingCert}
      />
      <CertDetailDialog
        open={!!detailCert}
        cert={detailCert}
        onClose={() => setDetailCert(null)}
      />
    </>
  );
}
