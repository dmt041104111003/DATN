'use client';

import { useState, useEffect } from 'react';
import formStyles from '../../styles/Form.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import { getMultisigScriptAddress, buildLockTx, nftUnitFromPolicyAndName } from '../../lib/multisig';
import { getWalletChangeAddress, getWalletUtxos, signAndSubmitWithEternl } from '../../utils/wallet';
import { resolvePaymentKeyHash } from '@meshsdk/core';
import { getProfilesByRole, type ProfileByRole } from '../../lib/profiles';

const styles = { ...formStyles, ...buttonStyles };
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';
const AUTH_COOKIE = 'auth_token';

type WarehouseNft = { batchId: string; batchName: string; policyId: string | null };

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const cookie = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${AUTH_COOKIE}=`));
  return cookie ? decodeURIComponent(cookie.split('=')[1] ?? '') : '';
}

export default function LockPage() {
  const [scriptAddress, setScriptAddress] = useState('');
  const [owner1Address, setOwner1Address] = useState('');
  const [shipperProfiles, setShipperProfiles] = useState<ProfileByRole[]>([]);
  const [shipperLoading, setShipperLoading] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState('');
  const [warehouseNfts, setWarehouseNfts] = useState<WarehouseNft[]>([]);
  const [selectedNftKey, setSelectedNftKey] = useState<string>('');
  const [multisigNftPolicyId, setMultisigNftPolicyId] = useState('');
  const [multisigNftAssetName, setMultisigNftAssetName] = useState('');
  const [lockError, setLockError] = useState('');
  const [lockLoading, setLockLoading] = useState(false);
  const [lockTxHash, setLockTxHash] = useState('');

  useEffect(() => {
    getMultisigScriptAddress()
      .then(setScriptAddress)
      .catch(() => setScriptAddress(''));
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setShipperProfiles([]);
      return;
    }
    setShipperLoading(true);
    getProfilesByRole(token, 'SHIPPER')
      .then(setShipperProfiles)
      .catch(() => setShipperProfiles([]))
      .finally(() => setShipperLoading(false));
  }, []);

  const loadWarehouseNfts = () => {
    const token = getToken();
    if (!token) {
      setWarehouseNfts([]);
      return;
    }
    fetch(`${BACKEND_URL}/trace/warehouses?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data?.items) ? data.items : [];
        const nfts: WarehouseNft[] = items
          .filter((i: { policyId?: string | null }) => i.policyId)
          .map((i: { batchId: string; batchName: string; policyId: string | null }) => ({
            batchId: i.batchId,
            batchName: i.batchName,
            policyId: i.policyId ?? null,
          }));
        setWarehouseNfts(nfts);
        setSelectedNftKey(nfts.length > 0 ? `${nfts[0].policyId}|${nfts[0].batchId}` : '');
      })
      .catch(() => setWarehouseNfts([]));
  };

  useEffect(() => {
    loadWarehouseNfts();
  }, []);

  useEffect(() => {
    if (!selectedNftKey || !warehouseNfts.length) return;
    const [policyId, batchId] = selectedNftKey.split('|');
    if (policyId && batchId) {
      setMultisigNftPolicyId(policyId);
      setMultisigNftAssetName(batchId);
    }
  }, [selectedNftKey, warehouseNfts]);

  useEffect(() => {
    const token = getToken();
    if (!token || !multisigNftAssetName.trim()) {
      setRecipientAddress('');
      setRecipientError('');
      return;
    }
    setRecipientError('');
    setRecipientLoading(true);
    fetch(
      `${BACKEND_URL}/trace/lock-recipient-by-roadmap?batchId=${encodeURIComponent(multisigNftAssetName.trim())}&token=${encodeURIComponent(token)}`
    )
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err?.message || `HTTP ${res.status}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        const addr = data?.recipientAddress ?? null;
        setRecipientAddress(typeof addr === 'string' ? addr : '');
        setRecipientError(
          data?.recipientAddress ? '' : 'Không có recipient theo roadmap cho batch này (cần roadmap hopIndex 0 nếu bạn là minter, hoặc bạn nằm trong roadmap).'
        );
      })
      .catch((err) => {
        setRecipientAddress('');
        setRecipientError(err?.message || 'Không thể load recipient từ roadmap.');
      })
      .finally(() => setRecipientLoading(false));
  }, [multisigNftAssetName]);

  const handleLock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLockError('');
    setLockTxHash('');
    setLockLoading(true);
    try {
      const changeAddress = await getWalletChangeAddress();
      const utxos = await getWalletUtxos();
      const owner1 = owner1Address.trim();
      const recipient = recipientAddress.trim();
      if (!owner1 || !recipient) {
        throw new Error('Nhập đủ Owner 1 và Recipient (Owner 2).');
      }
      const ownersPkh = [resolvePaymentKeyHash(owner1), resolvePaymentKeyHash(recipient)];
      const ownerLines = [owner1, recipient];
      const assets: { unit: string; quantity: string }[] = [
        { unit: 'lovelace', quantity: '2000000' },
      ];
      const nftUnit = nftUnitFromPolicyAndName(
        multisigNftPolicyId.trim(),
        multisigNftAssetName.trim(),
        '000de140'
      );
      if (nftUnit) {
        assets.push({ unit: nftUnit, quantity: '1' });
      }
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
        await fetch(`${BACKEND_URL}/multisig/lock/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lockTxHash: txHash,
            scriptOutputIndex: 0,
            batchId: multisigNftAssetName.trim(),
            policyId: multisigNftPolicyId.trim() || undefined,
            recipientAddress: recipient,
            senderAddress: changeAddress,
            ownerAddresses: ownerLines,
          }),
        });
      } catch {
        // optional: lưu trạng thái đang giao
      }
      const token = getToken();
      if (token && multisigNftAssetName.trim()) {
        try {
          await fetch(
            `${BACKEND_URL}/trace/warehouses/mark-shipped?token=${encodeURIComponent(token)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ batchId: multisigNftAssetName.trim() }),
            },
          );
        } catch {
          // optional: sync warehouse status to shipped
        }
      }
      window.location.reload();
    } catch (err: unknown) {
      setLockError(err instanceof Error ? err.message : 'Lock failed.');
    } finally {
      setLockLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 className={styles.pageTitle}>Lock</h1>


      <form onSubmit={handleLock}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Owner 1 (shipper — chọn từ danh sách)</label>
          <select
            className={styles.select}
            value={owner1Address}
            onChange={(e) => setOwner1Address(e.target.value)}
            disabled={shipperLoading}
          >
            <option value="">-- Chọn shipper --</option>
            {shipperProfiles.map((p) => (
              <option key={p.id} value={p.walletAddress}>
                {p.displayName} ({p.walletAddress})
              </option>
            ))}
          </select>
          {shipperLoading && (
            <p className={styles.formHint} style={{ marginTop: 6 }}>Đang tải danh sách shipper...</p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Recipient when Unlock (cũng là Owner 2) — tự động từ roadmap theo batch</label>
          <input
            className={styles.input}
            value={recipientLoading ? 'Đang load...' : recipientAddress}
            readOnly
            placeholder="Chọn NFT (batch) để tự động load từ roadmap"
          />
          {recipientError && (
            <p className={styles.formHint} style={{ marginTop: 6, color: 'var(--color-text-muted, #666)' }}>
              {recipientError}
            </p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>NFT từ kho của tôi (MULTISIG NFT 222)</label>
          <select
            className={styles.select}
            value={selectedNftKey}
            onChange={(e) => setSelectedNftKey(e.target.value)}
          >
            <option value="">-- Chọn NFT trong kho --</option>
            {warehouseNfts.map((nft) => {
              const key = `${nft.policyId}|${nft.batchId}`;
              return (
                <option key={key} value={key}>
                  {nft.batchName} ({nft.batchId})
                </option>
              );
            })}
          </select>
          {warehouseNfts.length === 0 && (
            <p className={styles.formHint} style={{ marginTop: 6 }}>
              Đăng nhập và có NFT trong kho (trang Kho hàng NFT) để chọn. Chỉ NFT có policyId mới hiển thị.
            </p>
          )}
        </div>
        {lockError && <p className={styles.error}>{lockError}</p>}
        {lockTxHash && (
          <p style={{ color: 'green', marginBottom: 8 }}>
            Tx submitted: <code style={{ fontSize: '0.8rem' }}>{lockTxHash}</code>
          </p>
        )}
        <button type="submit" className={styles.btnPrimary} disabled={lockLoading}>
          {lockLoading ? 'Building & signing...' : 'Lock (build tx → sign → submit)'}
        </button>
      </form>
    </div>
  );
}
