'use client';

import { useState, useEffect } from 'react';
import formStyles from '../../styles/Form.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import {
  getMultisigScriptAddress,
  getScriptUtxoByAsset,
  parseMultisigDatum,
  buildUnlockTx,
  mergePartialTx,
  pkhMatch,
  getLockDeliveries,
  savePartialTx,
  type LockDeliveryItem,
} from '../../lib/multisig';
import {
  getWalletChangeAddress,
  getWalletUtxos,
  getWalletCollateral,
  signTxPartial,
  signTxPartialForCosign,
  submitSignedTxHex,
} from '../../utils/wallet';
import { resolvePaymentKeyHash } from '@meshsdk/core';

const styles = { ...formStyles, ...buttonStyles };
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';
const AUTH_COOKIE = 'auth_token';
function getToken(): string {
  const cookie = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${AUTH_COOKIE}=`));
  return cookie ? decodeURIComponent(cookie.split('=')[1] ?? '') : '';
}

export default function UnlockPage() {
  const [scriptAddress, setScriptAddress] = useState('');
  const [deliveries, setDeliveries] = useState<LockDeliveryItem[]>([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | ''>('');
  const [scriptUtxos, setScriptUtxos] = useState<unknown[]>([]);
  const [selectedUtxoIndex, setSelectedUtxoIndex] = useState<number>(-1);
  const [datumInfo, setDatumInfo] = useState<{
    ownersPkh: string[];
    threshold: number;
    recipientPkh: string;
    recipientAddress: string;
    ownerAddresses: string[];
  } | null>(null);
  const [outputAddress, setOutputAddress] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockTxHash, setUnlockTxHash] = useState('');
  const [partialSignedTxHex, setPartialSignedTxHex] = useState('');
  const [cosignLoading, setCosignLoading] = useState(false);
  const [cosignError, setCosignError] = useState('');
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>('');

  useEffect(() => {
    getMultisigScriptAddress()
      .then(setScriptAddress)
      .catch(() => setScriptAddress(''));
  }, []);

  useEffect(() => {
    getWalletChangeAddress()
      .then(setCurrentWalletAddress)
      .catch(() => setCurrentWalletAddress(''));
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    setDeliveriesLoading(true);
    getLockDeliveries(token)
      .then(setDeliveries)
      .catch(() => setDeliveries([]))
      .finally(() => setDeliveriesLoading(false));
  }, []);

  const loadScriptUtxoForDelivery = (delivery: LockDeliveryItem) => {
    setUnlockError('');
    setPartialSignedTxHex('');
    const owners = Array.isArray(delivery.ownerAddresses) ? delivery.ownerAddresses : [];
    setDatumInfo({
      ownersPkh: [],
      threshold: 2,
      recipientPkh: '',
      recipientAddress: delivery.recipientAddress?.trim() || '',
      ownerAddresses: owners,
    });
    setOutputAddress(delivery.recipientAddress?.trim() || '');
    setScriptUtxos([]);
    setSelectedUtxoIndex(-1);
  };

  const handleDeliverySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value === '' ? '' : Number(e.target.value);
    setSelectedDeliveryId(id);
    setScriptUtxos([]);
    setSelectedUtxoIndex(-1);
    setDatumInfo(null);
    setOutputAddress('');
    setPartialSignedTxHex('');
    setUnlockTxHash('');
    setUnlockError('');
    if (id === '') return;
    const d = deliveries.find((x) => x.id === id);
    if (d) loadScriptUtxoForDelivery(d);
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError('');
    setUnlockTxHash('');
    setPartialSignedTxHex('');
    const delivery = selectedDeliveryId === '' ? null : deliveries.find((d) => d.id === selectedDeliveryId);
    if (!delivery || !datumInfo || !outputAddress.trim()) {
      setUnlockError('Chọn giao dịch và kiểm tra output address.');
      return;
    }
    setUnlockLoading(true);
    try {
      let scriptUtxo = scriptUtxos[0];
      let currentDatumInfo = datumInfo;
      if (!scriptUtxo && delivery.policyId?.trim() && delivery.batchId?.trim()) {
        const utxo = await getScriptUtxoByAsset(
          delivery.policyId.trim(),
          delivery.batchId.trim(),
          scriptAddress || undefined
        );
        if (!utxo) {
          setUnlockError('Không tìm thấy UTxO trên chain cho giao dịch này. Có thể lock chưa được confirm.');
          return;
        }
        scriptUtxo = utxo;
        setScriptUtxos([utxo]);
        const info = await parseMultisigDatum({ scriptUtxo: utxo });
        currentDatumInfo = { ...datumInfo, ownersPkh: info.ownersPkh, recipientPkh: info.recipientPkh };
        setDatumInfo(currentDatumInfo);
      } else if (!scriptUtxo) {
        setUnlockError('Thiếu thông tin UTxO. Delivery cần policyId và batchId.');
        return;
      }
      const changeAddress = await getWalletChangeAddress();
      const utxos = await getWalletUtxos();
      const collaterals = await getWalletCollateral();
      const collateral = Array.isArray(collaterals) && collaterals.length > 0 ? collaterals[0] : null;
      if (!collateral) {
        throw new Error('Wallet has no collateral. Set up collateral in wallet.');
      }
      const pk = resolvePaymentKeyHash(changeAddress);
      const pkStr = typeof pk === 'string' ? pk : String(pk);
      const isOwnerByPkh = currentDatumInfo.ownersPkh.length > 0 && currentDatumInfo.ownersPkh.some((p) => pkhMatch(p, pkStr));
      const isOwnerByAddress =
        !isOwnerByPkh &&
        currentDatumInfo.ownerAddresses?.length > 0 &&
        currentDatumInfo.ownerAddresses.some((addr) => {
          try {
            return pkhMatch(resolvePaymentKeyHash(addr), pkStr);
          } catch {
            return false;
          }
        });
      const isOwner = isOwnerByPkh || !!isOwnerByAddress;
      if (!isOwner) {
        const hint = currentDatumInfo.ownersPkh.length === 0
          ? ' Dùng đúng ví Owner 1 hoặc Owner 2.'
          : ' Dùng đúng ví Owner 1 hoặc Owner 2 (cùng địa chỉ lúc lock).';
        throw new Error('Ví hiện tại không nằm trong danh sách owner.' + hint);
      }
      const scriptInput = (scriptUtxo as { input?: { txHash?: string; outputIndex?: number } })?.input;
      const filteredUtxos = (utxos as { input?: { txHash?: string; outputIndex?: number } }[]).filter(
        (u) =>
          !(
            u?.input?.txHash === scriptInput?.txHash &&
            u?.input?.outputIndex === scriptInput?.outputIndex
          )
      );
      const { unsignedTx } = await buildUnlockTx({
        scriptUtxo,
        outputAddress: outputAddress.trim(),
        signingOwnersPkh: currentDatumInfo.ownersPkh,
        threshold: currentDatumInfo.threshold,
        collateral,
        changeAddress,
        utxos: filteredUtxos,
      });
      const signedTx = await signTxPartial(unsignedTx);
      if (currentDatumInfo.threshold === 1) {
        const txHash = await submitSignedTxHex(signedTx);
        setUnlockTxHash(txHash);
      } else {
        setPartialSignedTxHex(signedTx);
        const token = getToken();
        if (token && selectedDeliveryId !== '') {
          try {
            await savePartialTx(Number(selectedDeliveryId), token, signedTx);
            const list = await getLockDeliveries(token);
            setDeliveries(list);
          } catch (saveErr) {
            const msg = saveErr instanceof Error ? saveErr.message : 'Không lưu được partial tx vào server.';
            setUnlockError(msg + ' (Bên kia vẫn có thể paste hex để ký lượt 2.)');
          }
        } else {
          if (!token) setUnlockError('Chưa đăng nhập — không lưu được partial tx. Bên kia cần paste hex thủ công.');
          if (selectedDeliveryId === '') setUnlockError('Chọn giao dịch ở dropdown phía trên trước khi ký để lưu partial tx.');
        }
      }
    } catch (err: unknown) {
      setUnlockError(err instanceof Error ? err.message : 'Unlock failed.');
    } finally {
      setUnlockLoading(false);
    }
  };

  const selectedDelivery = selectedDeliveryId === '' ? null : deliveries.find((d) => d.id === selectedDeliveryId);
  const hasPartialFromDb = !!(selectedDelivery?.partialSignedTxHex?.trim());
  const currentWalletNorm = (currentWalletAddress || '').trim().toLowerCase();
  const isFirstSigner = !!(
    currentWalletNorm &&
    selectedDelivery?.partialSignedByAddress &&
    selectedDelivery.partialSignedByAddress.trim().toLowerCase() === currentWalletNorm
  );
  const isSecondSigner = !!(
    currentWalletNorm &&
    selectedDelivery?.secondSignedByAddress &&
    selectedDelivery.secondSignedByAddress.trim().toLowerCase() === currentWalletNorm
  );
  const showRound2Button =
    hasPartialFromDb &&
    !isFirstSigner &&
    !isSecondSigner &&
    datumInfo &&
    datumInfo.threshold > 1;

  const doCosignAndSubmit = async (hex: string) => {
    setCosignError('');
    setCosignLoading(true);
    try {
      const signedTx = await signTxPartialForCosign(hex);
      const { mergedTxHex, witnessCount, requiredSigners } = await mergePartialTx(hex, signedTx);
      if (witnessCount < 2) {
        setCosignError(
          `Transaction has only ${witnessCount} signature(s); at least 2 required for 2-of-2. Ensure you pasted the correct partial tx from owner 1 and are signed in with owner 2 wallet.`,
        );
        return;
      }
      if (!requiredSigners || requiredSigners.length < 2) {
        setCosignError(
          'Transaction missing required signers (multisig script will fail on-chain). Owner 1 may have rebuilt the tx and lost them. Fix: Owner 1 get unsigned tx from this app (click Unlock), sign immediately with wallet (do not modify tx), copy partial tx and send to Owner 2. If still failing, try a different wallet for step 1.',
        );
        return;
      }
      const txHash = await submitSignedTxHex(mergedTxHex);
      setUnlockTxHash(txHash);
      const changeAddress = await getWalletChangeAddress();
      try {
        await fetch(`${BACKEND_URL}/multisig/unlock/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            unlockTxHash: txHash,
            witnessCount,
            signedByAddress: changeAddress || undefined,
            deliveryId: selectedDeliveryId !== '' ? Number(selectedDeliveryId) : undefined,
          }),
        });
        const token = getToken();
        if (token) {
          const list = await getLockDeliveries(token);
          setDeliveries(list);
        }
      } catch {
        // optional
      }
    } catch (err: unknown) {
      setCosignError(err instanceof Error ? err.message : 'Cosign or submit failed.');
    } finally {
      setCosignLoading(false);
    }
  };

  const handleSignRound2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery?.partialSignedTxHex?.trim()) return;
    const hex = selectedDelivery.partialSignedTxHex.trim().replace(/^0x/, '');
    await doCosignAndSubmit(hex);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 className={styles.pageTitle}>Unlock</h1>

      <div className={styles.formGroup}>
        <label className={styles.label}>Giao dịch đang giao (chỉ hiển thị cho owner, không hiển thị cho người gửi)</label>
        <select
          className={styles.input}
          value={selectedDeliveryId}
          onChange={handleDeliverySelect}
          disabled={deliveriesLoading}
          style={{ minWidth: 320 }}
        >
          <option value="">
            {deliveriesLoading ? 'Đang tải...' : deliveries.length === 0 ? 'Không có giao dịch nào' : '-- Chọn giao dịch --'}
          </option>
          {deliveries.map((d) => (
            <option key={d.id} value={d.id}>
              batch {d.batchId} · lock {d.lockTxHash.slice(0, 12)}…#{d.scriptOutputIndex} → {d.recipientAddress.slice(0, 16)}…
            </option>
          ))}
        </select>
      </div>
      {datumInfo && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f9fafb', borderRadius: 8 }}>
          <div className={styles.label}>
            Datum: threshold = {datumInfo.threshold}, owners = {datumInfo.ownerAddresses.length || datumInfo.ownersPkh.length}
          </div>
          <div className={styles.label}>
            Recipient address (from lock): {datumInfo.recipientAddress || '(hex: ' + (datumInfo.recipientPkh || '').slice(0, 24) + '...)'}
          </div>
          {datumInfo.ownerAddresses.length > 0 && datumInfo.threshold > 1 && (
            <div className={styles.label} style={{ marginTop: 8 }}>
              Owners to sign (matching wallets): {datumInfo.ownerAddresses.map((a, i) => {
                const addrNorm = (a || '').trim().toLowerCase();
                const signed = !!(
                  (selectedDelivery?.partialSignedByAddress && selectedDelivery.partialSignedByAddress.trim().toLowerCase() === addrNorm) ||
                  (selectedDelivery?.secondSignedByAddress && selectedDelivery.secondSignedByAddress.trim().toLowerCase() === addrNorm)
                );
                return (
                  <span key={i} style={{ display: 'block', fontSize: '0.8rem', marginTop: 4 }}>
                    Owner {i + 1}: <code style={{ wordBreak: 'break-all' }}>{a}</code>
                    {signed && <strong style={{ color: '#16a34a', marginLeft: 6 }}>— Đã ký</strong>}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
      {datumInfo && (
        <form onSubmit={handleUnlock}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Output address (lovelace + assets) — pre-filled from datum, editable</label>
            <input
              className={styles.input}
              value={outputAddress}
              onChange={(e) => setOutputAddress(e.target.value)}
              placeholder="addr_test1..."
            />
          </div>
          {showRound2Button && !unlockTxHash && (
            <p style={{ marginBottom: 12, color: '#16a34a', fontSize: '0.875rem' }}>
              Bên kia đã ký. Bấm &quot;Ký lượt 2 &amp; Submit&quot; để ký và gửi giao dịch.
            </p>
          )}
          {unlockError && <p className={styles.error}>{unlockError}</p>}
          {cosignError && <p className={styles.error}>{cosignError}</p>}
          {unlockTxHash ? (
            <div style={{ padding: 16, background: '#ecfdf5', borderRadius: 8, marginBottom: 12 }}>
              <p style={{ color: '#059669', fontWeight: 600, marginBottom: 8 }}>Hoàn thành — Đã unlock thành công</p>
              <p style={{ color: '#047857', fontSize: '0.875rem' }}>
                Tx: <code style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>{unlockTxHash}</code>
              </p>
            </div>
          ) : (
          <>
          {showRound2Button ? (
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={cosignLoading}
              onClick={handleSignRound2}
            >
              {cosignLoading ? 'Đang ký & gửi...' : 'Ký lượt 2 & Submit'}
            </button>
          ) : isFirstSigner && hasPartialFromDb ? (
            <span style={{ color: '#6b7280' }}>Đã ký lượt 1 — không cần thao tác thêm.</span>
          ) : (
          <button type="submit" className={styles.btnPrimary} disabled={unlockLoading}>
            {unlockLoading
              ? 'Building & signing...'
              : datumInfo && datumInfo.threshold > 1
                ? 'Build & sign (step 1/2)'
                : 'Unlock (build → sign → submit)'}
          </button>
          )}
          </>
          )}
        </form>
      )}

    </div>
  );
}
