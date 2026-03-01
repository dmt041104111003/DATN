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
  batchOptions: { id: string; name: string; policyId?: string | null }[];
  onClose: () => void;
  onSuccess: () => void;
};

export function CertCreateDialog({
  open,
  batchOptions,
  onClose,
  onSuccess,
}: CreateProps) {
  const [title, setTitle] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [batchId, setBatchId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle('');
      setImageDataUrl('');
      setBatchId(batchOptions[0]?.id ?? '');
      setError('');
    }
  }, [open, batchOptions]);

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
    if (!title.trim() || !batchId.trim()) {
      setError('Title and batch are required.');
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
        batchId: batchId.trim(),
        imageUrl: url,
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
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="cert-batch" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Product batch
            </label>
            <select
              id="cert-batch"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              required
              className={styles.input}
              style={{ width: '100%' }}
            >
              <option value="">Select batch...</option>
              {batchOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.id})
                </option>
              ))}
            </select>
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
