'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import formStyles from '../../styles/Form.module.css';
import tableStyles from '../../styles/Table.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import dialogStyles from '../../styles/Dialog.module.css';
import tabStyles from '../../styles/Tabs.module.css';
import paginationStyles from '../../styles/Pagination.module.css';
import Pagination from '../../components/Pagination';
import { LANGUAGES, type LangId } from '../../constants/admin';
import type { Category, Product } from '../../types';

const styles = { ...formStyles, ...tableStyles, ...buttonStyles, ...dialogStyles, ...tabStyles, ...paginationStyles };
const PAGE_SIZE = 10;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<LangId>('vi');

  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [slug, setSlug] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameVi, setNameVi] = useState('');
  const [nameZh, setNameZh] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionVi, setDescriptionVi] = useState('');
  const [descriptionZh, setDescriptionZh] = useState('');
  const [descriptionFr, setDescriptionFr] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<number | ''>('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (filterCategoryId !== '') params.set('categoryId', String(filterCategoryId));
    const res = await fetch(`/api/admin/products?${params}`);
    if (res.ok) setProducts(await res.json());
  }, [searchQuery, filterCategoryId]);
  const fetchCategories = useCallback(async () => {
    const res = await fetch('/api/admin/categories');
    if (res.ok) setCategories(await res.json());
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterCategoryId]);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paginatedList = products.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const resetForm = () => {
    setEditingId(null);
    setCategoryId('');
    setSlug('');
    setNameEn('');
    setNameVi('');
    setNameZh('');
    setNameFr('');
    setDescriptionEn('');
    setDescriptionVi('');
    setDescriptionZh('');
    setDescriptionFr('');
    setImageUrl('');
    setYoutubeUrl('');
    setSortOrder(0);
    setError('');
    setOpen(false);
    setActiveTab('vi');
  };

  const openAdd = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setCategoryId(p.categoryId);
    setSlug(p.slug);
    setNameEn(p.nameEn);
    setNameVi(p.nameVi);
    setNameZh(p.nameZh);
    setNameFr(p.nameFr);
    setDescriptionEn(p.descriptionEn ?? '');
    setDescriptionVi(p.descriptionVi ?? '');
    setDescriptionZh(p.descriptionZh ?? '');
    setDescriptionFr(p.descriptionFr ?? '');
    setImageUrl(p.imageUrl ?? '');
    setYoutubeUrl(p.youtubeUrl ?? '');
    setSortOrder(p.sortOrder);
    setError('');
    setOpen(true);
    setActiveTab('vi');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = {
        categoryId: Number(categoryId),
        slug: slug.trim(),
        nameEn,
        nameVi,
        nameZh,
        nameFr,
        descriptionEn: descriptionEn || undefined,
        descriptionVi: descriptionVi || undefined,
        descriptionZh: descriptionZh || undefined,
        descriptionFr: descriptionFr || undefined,
        imageUrl: imageUrl || undefined,
        youtubeUrl: youtubeUrl || undefined,
        sortOrder,
      };
      if (editingId) {
        const res = await fetch(`/api/admin/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Lỗi cập nhật');
          return;
        }
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Lỗi thêm mới');
          return;
        }
      }
      resetForm();
      fetchProducts();
    } catch {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      if (file) alert('Vui lòng chọn file ảnh (jpg, png, webp...)');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setImageUrl(data.url);
        e.target.value = '';
      } else {
        alert(data.error || 'Tải ảnh lên thất bại');
      }
    } catch {
      alert('Lỗi kết nối');
    } finally {
      setUploading(false);
    }
  };

  const nameByLang = { en: nameEn, vi: nameVi, zh: nameZh, fr: nameFr };
  const descByLang = { en: descriptionEn, vi: descriptionVi, zh: descriptionZh, fr: descriptionFr };
  const setNameByLang = { en: setNameEn, vi: setNameVi, zh: setNameZh, fr: setNameFr };
  const setDescByLang = { en: setDescriptionEn, vi: setDescriptionVi, zh: setDescriptionZh, fr: setDescriptionFr };

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Quản lý sản phẩm</h1>
        <button type="button" className={styles.addIcon} onClick={openAdd} aria-label="Thêm sản phẩm" title="Thêm sản phẩm">+</button>
      </div>

      <div style={{ marginBottom: 12, display: 'flex', gap: 12, flexWrap: 'nowrap', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Tìm theo tên hoặc ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.input}
          style={{ flex: 2, minWidth: 0 }}
        />
        <select
          className={styles.select}
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value ? Number(e.target.value) : '')}
          style={{ flex: 1, minWidth: 0 }}
        >
          <option value="">Tất cả loại</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.labelVi}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Slug</th>
              <th>Tên (VI)</th>
              <th>Loại</th>
              <th>Ảnh</th>
              <th>YouTube</th>
              <th>Thứ tự</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedList.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.slug}</td>
                <td>{p.nameVi}</td>
                <td>{p.category?.labelVi ?? p.categoryId}</td>
                <td>{p.imageUrl ? 'Có' : '—'}</td>
                <td>{p.youtubeUrl ? 'Có' : '—'}</td>
                <td>{p.sortOrder}</td>
                <td>
                  <div className={styles.actions}>
                    <button type="button" className={styles.btnSecondary} onClick={() => openEdit(p)}>Sửa</button>
                    <button type="button" className={styles.btnDanger} onClick={() => handleDelete(p.id)}>Xóa</button>
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
              <span className={styles.tableCardLabel}>Tên (VI)</span>
              <span className={styles.tableCardValue}>{p.nameVi}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>Loại</span>
              <span className={styles.tableCardValue}>{p.category?.labelVi ?? p.categoryId}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>Ảnh</span>
              <span className={styles.tableCardValue}>{p.imageUrl ? 'Có' : '—'}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>YouTube</span>
              <span className={styles.tableCardValue}>{p.youtubeUrl ? 'Có' : '—'}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>Thứ tự</span>
              <span className={styles.tableCardValue}>{p.sortOrder}</span>
            </div>
            <div className={styles.tableCardActions}>
              <div className={styles.actions}>
                <button type="button" className={styles.btnSecondary} onClick={() => openEdit(p)}>Sửa</button>
                <button type="button" className={styles.btnDanger} onClick={() => handleDelete(p.id)}>Xóa</button>
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
              <h2 className={styles.dialogTitle}>{editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
              <button type="button" className={styles.dialogClose} onClick={() => setOpen(false)} aria-label="Đóng">×</button>
            </div>
            <div className={styles.dialogBody}>
              <form onSubmit={handleSubmit}>
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Loại</label>
                  <select className={styles.select} value={categoryId} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')} required>
                    <option value="">-- Chọn loại --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.labelVi}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Slug (URL)</label>
                  <input className={styles.input} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="vd: vang-mieng-99" required />
                </div>

                <div className={styles.tabs}>
                  {LANGUAGES.map((lang) => (
                    <button key={lang.id} type="button" className={activeTab === lang.id ? styles.tabActive : styles.tab} onClick={() => setActiveTab(lang.id)}>
                      {lang.label}
                    </button>
                  ))}
                </div>
                {LANGUAGES.map((lang) => (
                  <div key={lang.id} className={activeTab === lang.id ? styles.tabPanelActive : styles.tabPanel}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Tên ({lang.label})</label>
                      <input className={styles.input} value={nameByLang[lang.id]} onChange={(e) => setNameByLang[lang.id](e.target.value)} placeholder="Nhập tên sản phẩm" required={activeTab === lang.id} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Mô tả ({lang.label})</label>
                      <textarea className={styles.textarea} rows={4} value={descByLang[lang.id]} onChange={(e) => setDescByLang[lang.id](e.target.value)} placeholder="Nhập mô tả sản phẩm" />
                    </div>
                  </div>
                ))}

                <div className={styles.formGroup}>
                  <label className={styles.label}>Ảnh (URL hoặc tải lên Cloudinary)</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input className={styles.input} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL hoặc bấm Tải ảnh" style={{ flex: '1 1 200px' }} />
                    <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                    <button type="button" className={styles.btnSecondary} onClick={() => imageInputRef.current?.click()} disabled={uploading}>
                      {uploading ? 'Đang tải...' : 'Tải ảnh'}
                    </button>
                  </div>
                  {imageUrl && <img src={imageUrl} alt="Preview" className={styles.imagePreview} style={{ marginTop: 8 }} />}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Link YouTube (nhúng)</label>
                  <input className={styles.input} value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/embed/..." />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Thứ tự</label>
                  <input type="number" className={styles.input} value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} placeholder="0" />
                </div>
                <div className={styles.headerActions} style={{ marginTop: '1rem' }}>
                  <button type="submit" className={styles.btnPrimary} disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</button>
                  <button type="button" className={styles.btnSecondary} onClick={() => setOpen(false)}>Hủy</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
