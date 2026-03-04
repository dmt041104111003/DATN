'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getAuthToken } from '../../lib/account';
import { uploadImage } from '../../lib/upload';
import { createCertificate } from '../../lib/certificate';
import formStyles from '../../styles/Form.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import dialogStyles from '../../styles/Dialog.module.css';

const styles = { ...formStyles, ...buttonStyles, ...dialogStyles };

type CreateProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function CertCreateDialog({
  open,
  onClose,
  onSuccess,
}: CreateProps) {
  const [title, setTitle] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [number, setNumber] = useState('');
  const [authority, setAuthority] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [standardReference, setStandardReference] = useState('');
  const [scope, setScope] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle('');
      setImageDataUrl('');
      setNumber('');
      setAuthority('');
      setExpiryDate('');
      setDocumentType('');
      setStandardReference('');
      setScope('');
      setDocumentUrl('');
      setError('');
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setImageDataUrl(typeof dataUrl === 'string' ? dataUrl : '');
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsDataURL(file);
  };

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!number.trim()) {
      setError('Certificate number (No.) is required.');
      return;
    }
    if (!authority.trim()) {
      setError('Certificate authority is required.');
      return;
    }
    if (!imageDataUrl) {
      setError('Please upload a certificate image.');
      return;
    }
    const token = getAuthToken();
    if (!token) {
      setError('Session expired. Please log in again.');
      return;
    }
    setSubmitting(true);
    try {
      const { url } = await uploadImage(token, {
        imageDataUrl,
        folder: 'certificates',
      });
      await createCertificate(token, {
        title: title.trim(),
        imageUrl: url,
        number: number.trim(),
        authority: authority.trim(),
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        documentType: documentType.trim() || undefined,
        standardReference: standardReference.trim() || undefined,
        scope: scope.trim() || undefined,
        documentUrl: documentUrl.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create certificate.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.dialogBackdrop} onClick={onClose}>
      <div
        className={styles.dialogPanel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Add certificate</h2>
          <button
            type="button"
            className={styles.dialogClose}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.dialogBody}>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="cert-title" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Title
            </label>
            <input
              id="cert-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quality inspection certificate"
              required
              className={styles.input}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="cert-number" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Certificate No.
            </label>
            <input
              id="cert-number"
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="e.g. 1234/QĐ-NBC"
              required
              className={styles.input}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="cert-authority" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Authority
            </label>
            <input
              id="cert-authority"
              type="text"
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
              placeholder="e.g. NBC, Bộ NN&PTNT..."
              required
              className={styles.input}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="cert-expiry" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Expiry date (optional)
            </label>
            <input
              id="cert-expiry"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={styles.input}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="cert-documentType" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Document type (optional)
            </label>
            <input
              id="cert-documentType"
              type="text"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              placeholder="e.g. Quality inspection, Test report"
              className={styles.input}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="cert-standardReference" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Standard reference (optional)
            </label>
            <input
              id="cert-standardReference"
              type="text"
              value={standardReference}
              onChange={(e) => setStandardReference(e.target.value)}
              placeholder="e.g. ISO 22000, TCVN..."
              className={styles.input}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="cert-scope" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Scope (optional)
            </label>
            <input
              id="cert-scope"
              type="text"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="Phạm vi / mô tả ngắn"
              className={styles.input}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="cert-documentUrl" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Document URL (optional)
            </label>
            <input
              id="cert-documentUrl"
              type="url"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="https://... or ipfs://..."
              className={styles.input}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="cert-image" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Certificate image
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                ref={fileInputRef}
                id="cert-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                aria-hidden
              />
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
                title="Upload image (Cloudinary)"
              >
                {imageDataUrl ? 'Change image' : 'Choose image'}
              </button>
              {imageDataUrl && (
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Image selected</span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
