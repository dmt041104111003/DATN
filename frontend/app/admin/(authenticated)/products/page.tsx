'use client';

import { useState, useEffect, useRef } from 'react';
import formStyles from '../../styles/Form.module.css';
import tableStyles from '../../styles/Table.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import dialogStyles from '../../styles/Dialog.module.css';
import paginationStyles from '../../styles/Pagination.module.css';
import Pagination from '../../components/Pagination';
import type { Product } from '../../types';
import { MOCK_PRODUCTS } from '../../constants/mock';

const styles = { ...formStyles, ...tableStyles, ...buttonStyles, ...dialogStyles, ...paginationStyles };
const PAGE_SIZE = 10;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [slug, setSlug] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const filteredProducts = products.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    return (
      !query ||
      p.id === Number(query) ||
      p.slug.toLowerCase().includes(query) ||
      p.nameEn.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paginatedList = filteredProducts.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const resetForm = () => {
    setEditingId(null);
    setSlug('');
    setNameEn('');
    setDescriptionEn('');
    setImageUrl('');
    setError('');
    setOpen(false);
  };

  const openAdd = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setSlug(p.slug);
    setNameEn(p.nameEn);
    setDescriptionEn(p.descriptionEn ?? '');
    setImageUrl(p.imageUrl ?? '');
    setError('');
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const base: Omit<Product, 'id'> = {
      slug: slug.trim(),
      nameEn,
      descriptionEn: descriptionEn || null,
      imageUrl: imageUrl || null,
    };

    setProducts((prev) => {
      if (editingId) {
        return prev.map((p) => (p.id === editingId ? { ...p, ...base } : p));
      }
      const nextId = prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1;
      return [...prev, { id: nextId, ...base }];
    });

    resetForm();
    setLoading(false);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      if (file) alert('Please choose an image file (jpg, png, webp...)');
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(typeof reader.result === 'string' ? reader.result : '');
      setUploading(false);
      e.target.value = '';
    };
    reader.onerror = () => {
      alert('Failed to read image file');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Products</h1>
        <button type="button" className={styles.addIcon} onClick={openAdd} aria-label="Add product" title="Add product">
          +
        </button>
      </div>

      <div style={{ marginBottom: 12, display: 'flex', gap: 12, flexWrap: 'nowrap', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.input}
          style={{ flex: 2, minWidth: 0 }}
        />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Slug</th>
              <th>Name</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedList.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.slug}</td>
                <td>{p.nameEn}</td>
                <td>{p.imageUrl ? 'Yes' : '—'}</td>
                <td>
                  <div className={styles.actions}>
                    <button type="button" className={styles.btnSecondary} onClick={() => openEdit(p)}>
                      Edit
                    </button>
                    <button type="button" className={styles.btnDanger} onClick={() => handleDelete(p.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.tableCards}>
        {paginatedList.map((p) => (
          <div key={p.id} className={styles.tableCard}>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>ID</span>
              <span className={styles.tableCardValue}>{p.id}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>Slug</span>
              <span className={styles.tableCardValue}>{p.slug}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>Name</span>
              <span className={styles.tableCardValue}>{p.nameEn}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>Image</span>
              <span className={styles.tableCardValue}>{p.imageUrl ? 'Yes' : '—'}</span>
            </div>
            <div className={styles.tableCardActions}>
              <div className={styles.actions}>
                <button type="button" className={styles.btnSecondary} onClick={() => openEdit(p)}>
                  Edit
                </button>
                <button type="button" className={styles.btnDanger} onClick={() => handleDelete(p.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={products.length}
        pageSize={PAGE_SIZE}
      />

      {open && (
        <div className={styles.dialogBackdrop} onClick={() => setOpen(false)}>
          <div className={styles.dialogPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>{editingId ? 'Edit product' : 'Add product'}</h2>
              <button type="button" className={styles.dialogClose} onClick={() => setOpen(false)} aria-label="Close">
                ×
              </button>
            </div>
            <div className={styles.dialogBody}>
              <form onSubmit={handleSubmit}>
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Slug (URL)</label>
                  <input
                    className={styles.input}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. soft-drink-can-330"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Name</label>
                  <input
                    className={styles.input}
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    placeholder="Enter product description"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Image (URL or upload)</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      className={styles.input}
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Image URL or click Upload"
                      style={{ flex: '1 1 200px' }}
                    />
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload image'}
                    </button>
                  </div>
                  {imageUrl && (
                    <img src={imageUrl} alt="Preview" className={styles.imagePreview} style={{ marginTop: 8 }} />
                  )}
                </div>
                <div className={styles.headerActions} style={{ marginTop: '1rem' }}>
                  <button type="submit" className={styles.btnPrimary} disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" className={styles.btnSecondary} onClick={() => setOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
