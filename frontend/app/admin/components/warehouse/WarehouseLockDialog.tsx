'use client';

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import formStyles from '../../styles/Form.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import dialogStyles from '../../styles/Dialog.module.css';
import { getAuthToken } from '../../lib/account';
import type { WarehouseItem } from '../../lib/warehouse';
import { getLockRecipientByRoadmap } from '../../lib/warehouse';
import {
  getScriptAddress,
  buildLockTx,
  confirmOrder,
  nftUnitFromPolicyAndName,
} from '../../lib/order';
import { getProfilesByRole, type ProfileByRole } from '../../lib/profiles';
import { getWalletChangeAddress, getWalletUtxos, signAndSubmitWithEternl } from '../../utils/wallet';
import { resolvePaymentKeyHash } from '@meshsdk/core';

const styles = { ...formStyles, ...buttonStyles, ...dialogStyles };
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

type Props = {
  open: boolean;
  item: WarehouseItem | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function WarehouseLockDialog({ open, item, onClose, onSuccess }: Props) {
  const [scriptAddress, setScriptAddress] = useState('');
  const [owner1Address, setOwner1Address] = useState('');
  const [shipperProfiles, setShipperProfiles] = useState<ProfileByRole[]>([]);
  const [shipperLoading, setShipperLoading] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState('');
  const [lockError, setLockError] = useState('');
  const [lockLoading, setLockLoading] = useState(false);
  const [lockTxHash, setLockTxHash] = useState('');

  useEffect(() => {
    getScriptAddress().then(setScriptAddress).catch(() => setScriptAddress(''));
  }, []);

  useEffect(() => {
    if (!open) return;
    const token = getAuthToken();
    if (!token) {
      setShipperProfiles([]);
      return;
    }
    setShipperLoading(true);
    getProfilesByRole(token, 'SHIPPER')
      .then(setShipperProfiles)
      .catch(() => setShipperProfiles([]))
      .finally(() => setShipperLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open || !item?.batchId?.trim()) {
      setRecipientAddress('');
      setRecipientError('');
      return;
    }
    const token = getAuthToken();
    if (!token) return;
    setRecipientError('');
    setRecipientLoading(true);
    getLockRecipientByRoadmap(token, item.batchId.trim())
      .then((data) => {
        const addr = data?.recipientAddress ?? null;
        setRecipientAddress(typeof addr === 'string' ? addr : '');
        setRecipientError(
          addr ? '' : 'No recipient from roadmap for this batch.',
        );
      })
      .catch((err) => {
        setRecipientAddress('');
        setRecipientError(err?.message ?? 'Failed to load recipient.');
      })
      .finally(() => setRecipientLoading(false));
  }, [open, item?.batchId]);

  useEffect(() => {
    if (!open) {
      setLockError('');
      setLockTxHash('');
      setOwner1Address('');
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!item?.batchId || !item?.policyId) return;
    setLockError('');
    setLockTxHash('');
    setLockLoading(true);
    try {
      const changeAddress = await getWalletChangeAddress();
      const utxos = await getWalletUtxos();
      const owner1 = owner1Address.trim();
      const recipient = recipientAddress.trim();
      if (!owner1 || !recipient) {
        throw new Error('Select Owner 1 and ensure Recipient is loaded.');
      }
      const ownersPkh = [resolvePaymentKeyHash(owner1), resolvePaymentKeyHash(recipient)];
      const ownerLines = [owner1, recipient];
      const assets: { unit: string; quantity: string }[] = [
        { unit: 'lovelace', quantity: '2000000' },
      ];
      const nftUnit = nftUnitFromPolicyAndName(
        item.policyId.trim(),
        item.batchId.trim(),
        '000de140',
      );
      if (nftUnit) assets.push({ unit: nftUnit, quantity: '1' });
      const { unsignedTx } = await buildLockTx({
        scriptAddress,
        ownersPkh,
        threshold: 2,
        recipientPkh: resolvePaymentKeyHash(recipient),
        assets,
        changeAddress,
        utxos,
      });
      const txHash = await signAndSubmitWithEternl(unsignedTx);
      setLockTxHash(txHash);
      try {
        await confirmOrder({
          lockTxHash: txHash,
          scriptOutputIndex: 0,
          batchId: item.batchId.trim(),
          policyId: item.policyId.trim() || undefined,
          recipientAddress: recipient,
          senderAddress: changeAddress,
          ownerAddresses: ownerLines,
        });
      } catch {
        // optional
      }
      const token = getAuthToken();
      if (token) {
        try {
          await fetch(`${BACKEND_URL}/warehouse/mark-shipped?token=${encodeURIComponent(token)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ batchId: item.batchId.trim() }),
          });
        } catch {
          // optional
        }
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setLockError(err instanceof Error ? err.message : 'Stock out failed.');
    } finally {
      setLockLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.dialogBackdrop} onClick={onClose} role="presentation">
      <div
        className={styles.dialogPanel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="warehouse-lock-title"
      >
        <div className={styles.dialogHeader}>
          <h2 id="warehouse-lock-title" className={styles.dialogTitle}>
            Stock out
          </h2>
          <button
            type="button"
            className={styles.dialogClose}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className={styles.dialogBody}>
          {item && (
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid #e5e7eb' }}>
                  <span className={styles.label} style={{ marginBottom: 0 }}>Batch</span>
                  <span style={{ fontSize: 14, color: '#374151' }}>{item.batchName} ({item.batchId})</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Owner 1 (shipper)</label>
                <select
                  className={styles.select}
                  value={owner1Address}
                  onChange={(e) => setOwner1Address(e.target.value)}
                  disabled={shipperLoading}
                >
                  <option value="">Select shipper</option>
                  {shipperProfiles.map((p) => (
                    <option key={p.id} value={p.walletAddress}>
                      {p.displayName} ({p.walletAddress})
                    </option>
                  ))}
                </select>
                {shipperLoading && <p className={styles.formHint} style={{ marginTop: 6 }}>Loading shippers...</p>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Recipient (Owner 2)</label>
                <input
                  className={styles.input}
                  value={recipientLoading ? 'Loading...' : recipientAddress}
                  readOnly
                  placeholder="From roadmap"
                />
                {recipientError && <p className={styles.formHint} style={{ marginTop: 6, color: '#6b7280' }}>{recipientError}</p>}
              </div>

              {lockError && <p className={styles.error}>{lockError}</p>}
              {lockTxHash && <p className={styles.successText}>Tx submitted: <code>{lockTxHash}</code></p>}

              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={lockLoading || recipientLoading || !recipientAddress.trim()}
                style={{ width: '100%', padding: 12, marginTop: 12 }}
              >
                {lockLoading ? 'Building & signing...' : 'Stock out'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
