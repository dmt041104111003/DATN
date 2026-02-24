'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import formStyles from '../../styles/Form.module.css';
import tableStyles from '../../styles/Table.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import dialogStyles from '../../styles/Dialog.module.css';
import paginationStyles from '../../styles/Pagination.module.css';
import Pagination from '../../components/Pagination';
import type { Category } from '../../types';

const styles = { ...formStyles, ...tableStyles, ...buttonStyles, ...dialogStyles, ...paginationStyles };
const PAGE_SIZE = 10;

export default function CategoriesPage() {
  const [list, setList] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [labelEn, setLabelEn] = useState('');
  const [labelVi, setLabelVi] = useState('');
  const [labelZh, setLabelZh] = useState('');
  const [labelFr, setLabelFr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionVi, setDescriptionVi] = useState('');
  const [descriptionZh, setDescriptionZh] = useState('');
  const [descriptionFr, setDescriptionFr] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [icon, setIcon] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchList = useCallback(async () => {
    const res = await fetch('/api/admin/categories');
    if (res.ok) setList(await res.json());
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paginatedList = list.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const resetForm = () => {
    setEditingId(null);
    setLabelEn('');
    setLabelVi('');
    setLabelZh('');
    setLabelFr('');
    setDescriptionEn('');
    setDescriptionVi('');
    setDescriptionZh('');
    setDescriptionFr('');
    setImageUrl('');
    setIcon('');
    setSortOrder(0);
    setError('');
    setOpen(false);
  };

  const openAdd = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setLabelEn(c.labelEn);
    setLabelVi(c.labelVi);
    setLabelZh(c.labelZh);
    setLabelFr(c.labelFr);
    setDescriptionEn(c.descriptionEn ?? '');
    setDescriptionVi(c.descriptionVi ?? '');
    setDescriptionZh(c.descriptionZh ?? '');
    setDescriptionFr(c.descriptionFr ?? '');
    setImageUrl(c.imageUrl ?? '');
    setIcon(c.icon ?? '');
    setSortOrder(c.sortOrder);
    setError('');
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = {
        labelEn,
        labelVi,
        labelZh,
        labelFr,
        descriptionEn: descriptionEn || undefined,
        descriptionVi: descriptionVi || undefined,
        descriptionZh: descriptionZh || undefined,
        descriptionFr: descriptionFr || undefined,
        imageUrl: imageUrl || undefined,
        icon: icon || undefined,
        sortOrder,
      };
      if (editingId) {
        const res = await fetch(`/api/admin/categories/${editingId}`, {
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
        const res = await fetch('/api/admin/categories', {
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
      fetchList();
    } catch {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa loại này?')) return;
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    fetchList();
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

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Quản lý loại</h1>
        <button type="button" className={styles.addIcon} onClick={openAdd} aria-label="Thêm loại" title="Thêm loại">+</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>EN</th>
              <th>VI</th>
              <th>ZH</th>
              <th>FR</th>
              <th>Mô tả</th>
              <th>Ảnh</th>
              <th>Thứ tự</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedList.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.labelEn}</td>
                <td>{c.labelVi}</td>
                <td>{c.labelZh}</td>
                <td>{c.labelFr}</td>
                <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.descriptionVi ?? undefined}>
                  {c.descriptionVi ? (c.descriptionVi.length > 40 ? `${c.descriptionVi.slice(0, 40)}…` : c.descriptionVi) : '—'}
                </td>
                <td>{c.imageUrl ? 'Có' : '—'}</td>
                <td>{c.sortOrder}</td>
                <td>
                  <div className={styles.actions}>
                    <button type="button" className={styles.btnSecondary} onClick={() => openEdit(c)}>
                      Sửa
                    </button>
                    <button type="button" className={styles.btnDanger} onClick={() => handleDelete(c.id)}>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.tableCards}>
        {paginatedList.map((c) => (
          <div key={c.id} className={styles.tableCard}>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>ID</span>
              <span className={styles.tableCardValue}>{c.id}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>EN</span>
              <span className={styles.tableCardValue}>{c.labelEn}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>VI</span>
              <span className={styles.tableCardValue}>{c.labelVi}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>ZH</span>
              <span className={styles.tableCardValue}>{c.labelZh}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>FR</span>
              <span className={styles.tableCardValue}>{c.labelFr}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>Mô tả (VI)</span>
              <span className={styles.tableCardValue}>{c.descriptionVi ?? '—'}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>Ảnh</span>
              <span className={styles.tableCardValue}>{c.imageUrl ? 'Có' : '—'}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>Thứ tự</span>
              <span className={styles.tableCardValue}>{c.sortOrder}</span>
            </div>
            <div className={styles.tableCardActions}>
              <div className={styles.actions}>
                <button type="button" className={styles.btnSecondary} onClick={() => openEdit(c)}>Sửa</button>
                <button type="button" className={styles.btnDanger} onClick={() => handleDelete(c.id)}>Xóa</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={list.length}
        pageSize={PAGE_SIZE}
      />

      {open && (
        <div className={styles.dialogBackdrop} onClick={() => setOpen(false)}>
          <div className={styles.dialogPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>{editingId ? 'Sửa loại' : 'Thêm loại'}</h2>
              <button type="button" className={styles.dialogClose} onClick={() => setOpen(false)} aria-label="Đóng">
                ×
              </button>
            </div>
            <div className={styles.dialogBody}>
              <form onSubmit={handleSubmit}>
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tên (English)</label>
                  <input className={styles.input} value={labelEn} onChange={(e) => setLabelEn(e.target.value)} placeholder="VD: Beverages" required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tên (Tiếng Việt)</label>
                  <input className={styles.input} value={labelVi} onChange={(e) => setLabelVi(e.target.value)} placeholder="VD: Đồ uống" required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tên (中文)</label>
                  <input className={styles.input} value={labelZh} onChange={(e) => setLabelZh(e.target.value)} placeholder="VD: 饮料" required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tên (Français)</label>
                  <input className={styles.input} value={labelFr} onChange={(e) => setLabelFr(e.target.value)} placeholder="VD: Boissons" required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Mô tả (English)</label>
                  <textarea className={styles.textarea} rows={3} value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} placeholder="Mô tả loại sản phẩm" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Mô tả (Tiếng Việt)</label>
                  <textarea className={styles.textarea} rows={3} value={descriptionVi} onChange={(e) => setDescriptionVi(e.target.value)} placeholder="Mô tả loại sản phẩm" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Mô tả (中文)</label>
                  <textarea className={styles.textarea} rows={3} value={descriptionZh} onChange={(e) => setDescriptionZh(e.target.value)} placeholder="类别描述" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Mô tả (Français)</label>
                  <textarea className={styles.textarea} rows={3} value={descriptionFr} onChange={(e) => setDescriptionFr(e.target.value)} placeholder="Description de la catégorie" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Ảnh banner (URL hoặc tải lên Cloudinary)</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input className={styles.input} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL hoặc bấm Tải ảnh. Để trống dùng logo.png" style={{ flex: '1 1 200px' }} />
                    <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                    <button type="button" className={styles.btnSecondary} onClick={() => imageInputRef.current?.click()} disabled={uploading}>
                      {uploading ? 'Đang tải...' : 'Tải ảnh'}
                    </button>
                  </div>
                  {imageUrl && <img src={imageUrl} alt="Preview" className={styles.imagePreview} style={{ marginTop: 8 }} />}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Icon (URL)</label>
                  <input className={styles.input} value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="https://..." />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Thứ tự</label>
                  <input type="number" className={styles.input} value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} placeholder="0" />
                </div>
                <div className={styles.headerActions} style={{ marginTop: '1rem' }}>
                  <button type="submit" className={styles.btnPrimary} disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button type="button" className={styles.btnSecondary} onClick={() => setOpen(false)}>
                    Hủy
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
