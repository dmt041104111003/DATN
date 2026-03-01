'use client';

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import formStyles from '../../styles/Form.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import dialogStyles from '../../styles/Dialog.module.css';
import {
  getScriptAddress,
  getScriptUtxoByAsset,
  parseDatum,
  buildUnlockTx,
  mergePartialTx,
  completeOrder,
  savePartialTx,
  pkhMatch,
  type OrderDeliveryItem,
  type DatumInfo,
} from '../../lib/order';
import { getAuthToken } from '../../lib/account';
import {
  getWalletChangeAddress,
  getWalletUtxos,
  getWalletCollateral,
  signTxPartial,
  signTxPartialForCosign,
  submitSignedTxHex,
} from '../../utils/wallet';
import { truncate } from '../../utils/string';
import { resolvePaymentKeyHash } from '@meshsdk/core';

const styles = { ...formStyles, ...buttonStyles, ...dialogStyles };

type Props = {
  open: boolean;
  delivery: OrderDeliveryItem | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function OrderDialog({ open, delivery, onClose, onSuccess }: Props) {
  const [scriptAddress, setScriptAddress] = useState('');
  const [datumInfo, setDatumInfo] = useState<DatumInfo | null>(null);
  const [outputAddress, setOutputAddress] = useState('');
  const [scriptUtxos, setScriptUtxos] = useState<unknown[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [completedTxHash, setCompletedTxHash] = useState('');
  const [cosignLoading, setCosignLoading] = useState(false);
  const [cosignError, setCosignError] = useState('');
  const [currentWalletAddress, setCurrentWalletAddress] = useState('');

  useEffect(() => {
    getScriptAddress().then(setScriptAddress).catch(() => setScriptAddress(''));
  }, []);

  useEffect(() => {
    getWalletChangeAddress()
      .then(setCurrentWalletAddress)
      .catch(() => setCurrentWalletAddress(''));
  }, []);

  useEffect(() => {
    if (!open || !delivery) return;
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
    setError('');
    setCompletedTxHash('');
    setCosignError('');
  }, [open, delivery?.id]);

  const handleCompleteOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!delivery || !datumInfo || !outputAddress.trim()) {
      setError('Check the output address.');
      return;
    }
    setError('');
    setCompletedTxHash('');
    setLoading(true);
    try {
      let scriptUtxo = scriptUtxos[0];
      let currentDatumInfo = datumInfo;
      if (!scriptUtxo && delivery.policyId?.trim() && delivery.batchId?.trim()) {
        const utxo = await getScriptUtxoByAsset(
          delivery.policyId.trim(),
          delivery.batchId.trim(),
          scriptAddress || undefined,
        );
        if (!utxo) {
          setError('UTxO not found on chain. Order may not be confirmed yet.');
          return;
        }
        scriptUtxo = utxo;
        setScriptUtxos([utxo]);
        const info = await parseDatum({ scriptUtxo: utxo });
        currentDatumInfo = { ...datumInfo, ownersPkh: info.ownersPkh, recipientPkh: info.recipientPkh };
        setDatumInfo(currentDatumInfo);
      } else if (!scriptUtxo) {
        setError('Missing UTxO. Order needs policyId and batchId.');
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
        throw new Error('Current wallet is not in the owner list. Use Owner 1 or Owner 2 wallet.');
      }
      const scriptInput = (scriptUtxo as { input?: { txHash?: string; outputIndex?: number } })?.input;
      const filteredUtxos = (utxos as { input?: { txHash?: string; outputIndex?: number } }[]).filter(
        (u) =>
          !(
            u?.input?.txHash === scriptInput?.txHash &&
            u?.input?.outputIndex === scriptInput?.outputIndex
          ),
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
        setCompletedTxHash(txHash);
        try {
          await completeOrder({
            unlockTxHash: txHash,
            witnessCount: 1,
            signedByAddress: changeAddress || undefined,
            deliveryId: delivery.id,
          });
        } catch {}
        onSuccess();
        onClose();
      } else {
        const token = getAuthToken() ?? '';
        if (token) {
          try {
            await savePartialTx(delivery.id, token, signedTx);
            onSuccess();
          } catch (saveErr) {
            const msg = saveErr instanceof Error ? saveErr.message : 'Could not save partial tx to server.';
            setError(msg + ' (Other party can still paste hex to sign step 2.)');
          }
        } else {
          setError('Not logged in — cannot save partial tx. Other party must paste hex manually.');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Complete order failed.');
    } finally {
      setLoading(false);
    }
  };

  const hasPartialFromDb = !!(delivery?.partialSignedTxHex?.trim());
  const currentWalletNorm = (currentWalletAddress || '').trim().toLowerCase();
  const isFirstSigner = !!(
    currentWalletNorm &&
    delivery?.partialSignedByAddress &&
    delivery.partialSignedByAddress.trim().toLowerCase() === currentWalletNorm
  );
  const showRound2Button =
    hasPartialFromDb &&
    !isFirstSigner &&
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
          `Transaction has only ${witnessCount} signature(s); at least 2 required for 2-of-2.`,
        );
        return;
      }
      if (!requiredSigners || requiredSigners.length < 2) {
        setCosignError(
          'Transaction missing required signers. Owner 1 should sign first, then send partial tx to Owner 2.',
        );
        return;
      }
      const txHash = await submitSignedTxHex(mergedTxHex);
      setCompletedTxHash(txHash);
      const changeAddress = await getWalletChangeAddress();
      try {
        await completeOrder({
          unlockTxHash: txHash,
          witnessCount,
          signedByAddress: changeAddress || undefined,
          deliveryId: delivery?.id,
        });
      } catch {}
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setCosignError(err instanceof Error ? err.message : 'Cosign or submit failed.');
    } finally {
      setCosignLoading(false);
    }
  };

  const handleSignRound2 = async (e: FormEvent) => {
    e.preventDefault();
    if (!delivery?.partialSignedTxHex?.trim()) return;
    const hex = delivery.partialSignedTxHex.trim().replace(/^0x/, '');
    await doCosignAndSubmit(hex);
  };

  if (!open) return null;

  return (
    <div className={styles.dialogBackdrop} onClick={loading || cosignLoading ? undefined : onClose} role="presentation">
      <div
        className={styles.dialogPanel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-dialog-title"
        style={loading || cosignLoading ? { pointerEvents: 'none' } : undefined}
      >
        <div className={styles.dialogHeader}>
          <h2 id="order-dialog-title" className={styles.dialogTitle}>
            Complete order
          </h2>
          <button type="button" className={styles.dialogClose} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className={styles.dialogBody}>
          {delivery && (
            <>
              <div className={styles.formGroup} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid #e5e7eb' }}>
                  <span className={styles.label} style={{ marginBottom: 0 }}>Batch</span>
                  <span style={{ fontSize: 14, color: '#374151' }}>{delivery.batchId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span className={styles.label} style={{ marginBottom: 0 }}>Transaction</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#374151' }}>{truncate(delivery.lockTxHash, 16)}#{delivery.scriptOutputIndex}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
                  <span className={styles.label} style={{ marginBottom: 0 }}>Status</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{delivery.status === 'DELIVERED' ? 'DELIVERED' : 'IN_DELIVERY'}</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Recipient address</label>
                <input
                  className={styles.input}
                  value={outputAddress}
                  onChange={(e) => setOutputAddress(e.target.value)}
                  placeholder="addr_test1..."
                  disabled={!!showRound2Button}
                />
              </div>

              {datumInfo && datumInfo.ownerAddresses.length > 0 && datumInfo.threshold > 1 && (
                <div className={styles.formGroup} style={{ marginBottom: 12 }}>
                  <span className={styles.label}>Signing</span>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                    {datumInfo.ownerAddresses.map((_, i) => {
                      const addr = datumInfo!.ownerAddresses[i];
                      const addrNorm = (addr || '').trim().toLowerCase();
                      const signed = !!(
                        (delivery?.partialSignedByAddress && delivery.partialSignedByAddress.trim().toLowerCase() === addrNorm) ||
                        (delivery?.secondSignedByAddress && delivery.secondSignedByAddress.trim().toLowerCase() === addrNorm)
                      );
                      return (
                        <span key={i} style={{ fontSize: 13, color: '#6b7280' }}>
                          Signer {i + 1}: {signed ? 'Signed' : 'Pending'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <form onSubmit={showRound2Button ? handleSignRound2 : handleCompleteOrder}>
                {showRound2Button && !completedTxHash && (
                  <p className={styles.formHint} style={{ marginBottom: 12 }}>Other party has signed. Click below to complete.</p>
                )}
                {error && <p className={styles.error}>{error}</p>}
                {cosignError && <p className={styles.error}>{cosignError}</p>}
                {completedTxHash ? (
                  <p className={styles.successText}>
                    Order completed. Tx: <code>{truncate(completedTxHash, 24)}</code>
                  </p>
                ) : (
                  <>
                    {showRound2Button ? (
                      <button type="submit" className={styles.btnPrimary} disabled={cosignLoading} style={{ width: '100%', padding: 12 }}>
                        {cosignLoading ? 'Signing & submitting...' : 'Complete delivery'}
                      </button>
                    ) : isFirstSigner && hasPartialFromDb ? (
                      <p className={styles.formHint}>You signed step 1. Waiting for other party to complete.</p>
                    ) : (
                      <button type="submit" className={styles.btnPrimary} disabled={loading} style={{ width: '100%', padding: 12 }}>
                        {loading ? 'Building & signing...' : datumInfo && datumInfo.threshold > 1 ? 'Sign' : 'Complete delivery'}
                      </button>
                    )}
                  </>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
