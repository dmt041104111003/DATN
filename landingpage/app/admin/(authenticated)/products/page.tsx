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
import { getProductLocale, getCommonLocale } from '../../constants/locale';
import { useAdminLanguage } from '../../context/AdminLanguageContext';
import type { Category, Product, DescriptionBlock } from '../../types';

const styles = { ...formStyles, ...tableStyles, ...buttonStyles, ...dialogStyles, ...tabStyles, ...paginationStyles };
const PAGE_SIZE = 10;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { adminLang, setAdminLang } = useAdminLanguage();
  const [activeTab, setActiveTab] = useState<LangId>('vi');

  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [slug, setSlug] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameVi, setNameVi] = useState('');
  const [nameZh, setNameZh] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [descriptionBlocks, setDescriptionBlocks] = useState<DescriptionBlock[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadBlockIndex, setUploadBlockIndex] = useState<number | null>(null);
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
    setDescriptionBlocks([]);
    setImageUrl('');
    setYoutubeUrl('');
    setSortOrder(0);
    setError('');
    setOpen(false);
    setActiveTab(adminLang);
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
    if (p.descriptionBlocks && Array.isArray(p.descriptionBlocks) && p.descriptionBlocks.length > 0) {
      setDescriptionBlocks(p.descriptionBlocks.map((b) => ({
        titleEn: (b as DescriptionBlock).titleEn ?? '',
        titleVi: (b as DescriptionBlock).titleVi ?? '',
        titleZh: (b as DescriptionBlock).titleZh ?? '',
        titleFr: (b as DescriptionBlock).titleFr ?? '',
        textEn: (b as DescriptionBlock).textEn ?? '',
        textVi: (b as DescriptionBlock).textVi ?? '',
        textZh: (b as DescriptionBlock).textZh ?? '',
        textFr: (b as DescriptionBlock).textFr ?? '',
        imageUrl: (b as DescriptionBlock).imageUrl ?? null,
        youtubeUrl: (b as DescriptionBlock).youtubeUrl ?? null,
      })));
    } else {
      setDescriptionBlocks([{
        titleEn: '', titleVi: '', titleZh: '', titleFr: '',
        textEn: p.descriptionEn ?? '',
        textVi: p.descriptionVi ?? '',
        textZh: p.descriptionZh ?? '',
        textFr: p.descriptionFr ?? '',
        imageUrl: null,
        youtubeUrl: null,
      }]);
    }
    setImageUrl(p.imageUrl ?? '');
    setYoutubeUrl(p.youtubeUrl ?? '');
    setSortOrder(p.sortOrder);
    setError('');
    setOpen(true);
    setActiveTab(adminLang);
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
        descriptionBlocks: descriptionBlocks.length
          ? descriptionBlocks.map((b) => ({
              titleEn: b.titleEn ?? '',
              titleVi: b.titleVi ?? '',
              titleZh: b.titleZh ?? '',
              titleFr: b.titleFr ?? '',
              textEn: b.textEn || '',
              textVi: b.textVi || '',
              textZh: b.textZh || '',
              textFr: b.textFr || '',
              imageUrl: b.imageUrl || null,
              youtubeUrl: b.youtubeUrl || null,
            }))
          : undefined,
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
          setError(data.error || t.errorUpdate);
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
          setError(data.error || t.errorCreate);
          return;
        }
      }
      resetForm();
      fetchProducts();
    } catch {
      setError(t.errorConnection);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      if (file) alert(t.chooseImageFile);
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        if (uploadBlockIndex !== null && uploadBlockIndex >= 0 && uploadBlockIndex < descriptionBlocks.length) {
          setDescriptionBlocks((prev) => prev.map((b, i) => i === uploadBlockIndex ? { ...b, imageUrl: data.url } : b));
        } else {
          setImageUrl(data.url);
        }
        e.target.value = '';
      } else {
        alert(data.error || t.uploadFailed);
      }
    } catch {
      alert(t.errorConnection);
    } finally {
      setUploading(false);
      setUploadBlockIndex(null);
    }
  };

  const nameByLang = { en: nameEn, vi: nameVi, zh: nameZh, fr: nameFr };
  const setNameByLang = { en: setNameEn, vi: setNameVi, zh: setNameZh, fr: setNameFr };

  const addDescriptionBlock = () => {
    setDescriptionBlocks((prev) => [...prev, { titleEn: '', titleVi: '', titleZh: '', titleFr: '', textEn: '', textVi: '', textZh: '', textFr: '', imageUrl: null, youtubeUrl: null }]);
  };
  const removeDescriptionBlock = (index: number) => {
    setDescriptionBlocks((prev) => prev.filter((_, i) => i !== index));
  };
  const updateBlock = (index: number, field: keyof DescriptionBlock, value: string | null) => {
    setDescriptionBlocks((prev) => prev.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };
  const triggerBlockImageUpload = (blockIndex: number) => {
    setUploadBlockIndex(blockIndex);
    setTimeout(() => imageInputRef.current?.click(), 0);
  };
  const triggerMainImageUpload = () => {
    setUploadBlockIndex(null);
    imageInputRef.current?.click();
  };

  const t = getProductLocale(adminLang);
  const commonLocale = getCommonLocale(adminLang);

  return (
    <>
      <div className={styles.tabs} style={{ marginBottom: 12 }}>
        {LANGUAGES.map((lang) => (
          <button key={lang.id} type="button" className={adminLang === lang.id ? styles.tabActive : styles.tab} onClick={() => setAdminLang(lang.id)}>
            {lang.label}
          </button>
        ))}
      </div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t.pageTitle}</h1>
        <button type="button" className={styles.addIcon} onClick={openAdd} aria-label={t.addProduct} title={t.addProduct}>+</button>
      </div>

      <div style={{ marginBottom: 12, display: 'flex', gap: 12, flexWrap: 'nowrap', alignItems: 'center' }}>
        <input
          type="search"
          placeholder={t.searchPlaceholder}
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
          <option value="">{t.allCategories}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.labelVi}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t.id}</th>
              <th>{t.slug}</th>
              <th>{t.name}</th>
              <th>{t.category}</th>
              <th>{t.image}</th>
              <th>{t.youtube}</th>
              <th>{t.order}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedList.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.slug}</td>
                <td>{p.nameVi}</td>
                <td>{p.category?.labelVi ?? p.categoryId}</td>
                <td>{p.imageUrl ? t.hasImage : '—'}</td>
                <td>{p.youtubeUrl ? t.hasImage : '—'}</td>
                <td>{p.sortOrder}</td>
                <td>
                  <div className={styles.actions}>
                    <button type="button" className={styles.btnSecondary} onClick={() => openEdit(p)}>{t.edit}</button>
                    <button type="button" className={styles.btnDanger} onClick={() => handleDelete(p.id)}>{t.delete}</button>
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
              <span className={styles.tableCardLabel}>{t.id}</span>
              <span className={styles.tableCardValue}>{p.id}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>{t.slug}</span>
              <span className={styles.tableCardValue}>{p.slug}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>{t.name}</span>
              <span className={styles.tableCardValue}>{p.nameVi}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>{t.category}</span>
              <span className={styles.tableCardValue}>{p.category?.labelVi ?? p.categoryId}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>{t.image}</span>
              <span className={styles.tableCardValue}>{p.imageUrl ? t.hasImage : '—'}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>{t.youtube}</span>
              <span className={styles.tableCardValue}>{p.youtubeUrl ? t.hasImage : '—'}</span>
            </div>
            <div className={styles.tableCardRow}>
              <span className={styles.tableCardLabel}>{t.order}</span>
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
        locale={commonLocale}
      />

      {open && (
        <div className={styles.dialogBackdrop} onClick={() => setOpen(false)}>
          <div className={styles.dialogPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>{editingId ? t.editProduct : t.addProductTitle}</h2>
              <button type="button" className={styles.dialogClose} onClick={() => setOpen(false)} aria-label={t.close}>×</button>
            </div>
            <div className={styles.dialogBody}>
              <form onSubmit={handleSubmit}>
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.type}</label>
                  <select className={styles.select} value={categoryId} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')} required>
                    <option value="">{t.selectCategory}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.labelVi}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.slug}</label>
                  <input className={styles.input} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="vd: vang-mieng-99" required />
                </div>

                <div className={styles.tabs}>
                  {LANGUAGES.map((lang) => (
                    <button key={lang.id} type="button" className={activeTab === lang.id ? styles.tabActive : styles.tab} onClick={() => { setActiveTab(lang.id); setAdminLang(lang.id); }}>
                      {lang.label}
                    </button>
                  ))}
                </div>
                {LANGUAGES.map((lang) => (
                  <div key={lang.id} className={activeTab === lang.id ? styles.tabPanelActive : styles.tabPanel}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>{t.name}</label>
                      <input className={styles.input} value={nameByLang[lang.id]} onChange={(e) => setNameByLang[lang.id](e.target.value)} placeholder="Nhập tên sản phẩm" required={activeTab === lang.id} />
                    </div>
                  </div>
                ))}

                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.descriptionBlocks}</label>
                  {descriptionBlocks.map((block, idx) => (
                    <div key={idx} className={styles.formGroup} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 12, background: '#f9f9f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <strong>{t.blockLabel} {idx + 1}</strong>
                        <button type="button" className={styles.btnDanger} onClick={() => removeDescriptionBlock(idx)} style={{ padding: '4px 10px', fontSize: 13 }}>{t.removeBlock}</button>
                      </div>
                      <div className={styles.formGroup} style={{ marginBottom: 8 }}>
                        <label className={styles.label}>{t.blockTitle}</label>
                        <div className={styles.tabs} style={{ marginBottom: 6 }}>
                          {LANGUAGES.map((l) => (
                            <button key={l.id} type="button" className={activeTab === l.id ? styles.tabActive : styles.tab} onClick={() => { setActiveTab(l.id); setAdminLang(l.id); }}>{l.label}</button>
                          ))}
                        </div>
                        {LANGUAGES.map((l) => {
                          const titleKey = `title${l.id.charAt(0).toUpperCase()}${l.id.slice(1)}` as keyof DescriptionBlock;
                          return (
                            <div key={l.id} className={activeTab === l.id ? styles.tabPanelActive : styles.tabPanel}>
                              <input className={styles.input} value={(block[titleKey] as string) ?? ''} onChange={(e) => updateBlock(idx, titleKey, e.target.value)} placeholder={t.blockTitle} />
                            </div>
                          );
                        })}
                      </div>
                      <div className={styles.tabs} style={{ marginBottom: 8 }}>
                        {LANGUAGES.map((l) => (
                          <button key={l.id} type="button" className={activeTab === l.id ? styles.tabActive : styles.tab} onClick={() => { setActiveTab(l.id); setAdminLang(l.id); }}>{l.label}</button>
                        ))}
                      </div>
                      {LANGUAGES.map((l) => {
                        const textKey = `text${l.id.charAt(0).toUpperCase()}${l.id.slice(1)}` as keyof DescriptionBlock;
                        return (
                          <div key={l.id} className={activeTab === l.id ? styles.tabPanelActive : styles.tabPanel}>
                            <textarea className={styles.textarea} rows={3} value={(block[textKey] as string) ?? ''} onChange={(e) => updateBlock(idx, textKey, e.target.value)} placeholder="Mô tả" />
                          </div>
                        );
                      })}
                      <div className={styles.formGroup} style={{ marginTop: 8 }}>
                        <label className={styles.label}>{t.imageInBlock}</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <input className={styles.input} value={block.imageUrl ?? ''} onChange={(e) => updateBlock(idx, 'imageUrl', e.target.value || null)} placeholder="URL hoặc bấm Tải ảnh" style={{ flex: '1 1 180px' }} />
                          <button type="button" className={styles.btnSecondary} onClick={() => triggerBlockImageUpload(idx)} disabled={uploading}>{t.uploadImage}</button>
                        </div>
                        {block.imageUrl && <img src={block.imageUrl} alt="" className={styles.imagePreview} style={{ marginTop: 6, maxHeight: 80 }} />}
                      </div>
                      <div className={styles.formGroup} style={{ marginTop: 8 }}>
                        <label className={styles.label}>{t.linkYoutube}</label>
                        <input className={styles.input} value={block.youtubeUrl ?? ''} onChange={(e) => updateBlock(idx, 'youtubeUrl', e.target.value || null)} placeholder="https://www.youtube.com/embed/... hoặc watch?v=..." />
                      </div>
                    </div>
                  ))}
                  <button type="button" className={styles.btnSecondary} onClick={addDescriptionBlock} style={{ marginTop: 8, marginBottom: 16 }} aria-label={t.addDescription} title={t.addDescription}>+ {t.addDescription}</button>
                </div>

                <div className={styles.formGroup} style={{ marginTop: 8 }}>
                  <label className={styles.label}>{t.mainImage}</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input className={styles.input} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL hoặc bấm Tải ảnh" style={{ flex: '1 1 200px' }} />
                    <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                    <button type="button" className={styles.btnSecondary} onClick={triggerMainImageUpload} disabled={uploading}>
                      {uploading ? t.uploading : t.uploadImage}
                    </button>
                  </div>
                  {imageUrl && <img src={imageUrl} alt="Preview" className={styles.imagePreview} style={{ marginTop: 8 }} />}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Link YouTube</label>
                  <input className={styles.input} value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/embed/..." />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t.order}</label>
                  <input type="number" className={styles.input} value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} placeholder="0" />
                </div>
                <div className={styles.headerActions} style={{ marginTop: '1rem' }}>
                  <button type="submit" className={styles.btnPrimary} disabled={loading}>{loading ? t.saving : t.save}</button>
                  <button type="button" className={styles.btnSecondary} onClick={() => setOpen(false)}>{t.cancel}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
