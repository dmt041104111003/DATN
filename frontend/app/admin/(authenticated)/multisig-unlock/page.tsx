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

export default function UnlockPage() {
  const [scriptAddress, setScriptAddress] = useState('');
  const [unlockPolicyId, setUnlockPolicyId] = useState(
    'df7339e888a9b8d33302f6eda9e4cfb02fb37057cee7b25a64fd6276'
  );
  const [unlockAssetName, setUnlockAssetName] = useState('chuoitim-mm73raz2-thzr3s');
  const [findByAssetLoading, setFindByAssetLoading] = useState(false);
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
  const [partialTxFromOther, setPartialTxFromOther] = useState('');
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

  const loadScriptUtxoByAsset = async () => {
    setUnlockError('');
    setDatumInfo(null);
    setOutputAddress('');
    setPartialSignedTxHex('');
    setPartialTxFromOther('');
    if (!unlockPolicyId.trim() || !unlockAssetName.trim()) {
      setUnlockError('Enter Policy ID and Asset name.');
      return;
    }
    setFindByAssetLoading(true);
    try {
      const utxo = await getScriptUtxoByAsset(unlockPolicyId, unlockAssetName, scriptAddress || undefined);
      if (!utxo) {
        setUnlockError('No UTxO at script containing this asset. Check policyId + assetName or lock may not exist yet.');
        setScriptUtxos([]);
        setSelectedUtxoIndex(-1);
        return;
      }
      setScriptUtxos([utxo]);
      setSelectedUtxoIndex(0);
      const info = await parseMultisigDatum({ scriptUtxo: utxo });
      setDatumInfo(info);
      if (info.recipientAddress) setOutputAddress(info.recipientAddress);
    } catch (err: unknown) {
      setUnlockError(err instanceof Error ? err.message : 'Find UTxO by asset failed.');
      setScriptUtxos([]);
      setSelectedUtxoIndex(-1);
    } finally {
      setFindByAssetLoading(false);
    }
  };

  const selectUtxoAndParseDatum = async (index: number) => {
    setSelectedUtxoIndex(index);
    setUnlockError('');
    setDatumInfo(null);
    setOutputAddress('');
    setPartialSignedTxHex('');
    const utxo = scriptUtxos[index];
    if (!utxo || typeof utxo !== 'object') return;
    try {
      const info = await parseMultisigDatum({ scriptUtxo: utxo });
      setDatumInfo(info);
      if (info.recipientAddress) {
        setOutputAddress(info.recipientAddress);
      }
    } catch (err: unknown) {
      setUnlockError(err instanceof Error ? err.message : 'Failed to parse datum.');
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError('');
    setUnlockTxHash('');
    setPartialSignedTxHex('');
    if (selectedUtxoIndex < 0 || !datumInfo || !outputAddress.trim()) {
      setUnlockError('Select UTxO, parse datum and enter output address.');
      return;
    }
    setUnlockLoading(true);
    try {
      const changeAddress = await getWalletChangeAddress();
      const utxos = await getWalletUtxos();
      const collaterals = await getWalletCollateral();
      const scriptUtxo = scriptUtxos[selectedUtxoIndex];
      const collateral = Array.isArray(collaterals) && collaterals.length > 0 ? collaterals[0] : null;
      if (!collateral) {
        throw new Error('Wallet has no collateral. Set up collateral in wallet.');
      }
      const pk = resolvePaymentKeyHash(changeAddress);
      const pkStr = typeof pk === 'string' ? pk : String(pk);
      const isOwnerByPkh = datumInfo.ownersPkh.length > 0 && datumInfo.ownersPkh.some((p) => pkhMatch(p, pkStr));
      const isOwnerByAddress =
        !isOwnerByPkh &&
        datumInfo.ownerAddresses?.length > 0 &&
        datumInfo.ownerAddresses.some((addr) => {
          try {
            return pkhMatch(resolvePaymentKeyHash(addr), pkStr);
          } catch {
            return false;
          }
        });
      const isOwner = isOwnerByPkh || !!isOwnerByAddress;
      if (!isOwner) {
        const hint =
          datumInfo.ownersPkh.length === 0
            ? ' Datum has no owners (parse error?). Try reloading UTxO or restart backend.'
            : ' Ensure you use the correct Owner 1 or Owner 2 wallet (same payment key as address at lock).';
        throw new Error('Current wallet address is not in the owner list of this UTxO.' + hint);
      }
      const scriptInput = (scriptUtxo as { input?: { txHash?: string; outputIndex?: number } })?.input;
      const filteredUtxos = (utxos as { input?: { txHash?: string; outputIndex?: number } }[]).filter(
        (u) =>
          !(
            u?.input?.txHash === scriptInput?.txHash &&
            u?.input?.outputIndex === scriptInput?.outputIndex
          )
      );
      const signingOwnersPkh = datumInfo.ownersPkh;
      const { unsignedTx } = await buildUnlockTx({
        scriptUtxo,
        outputAddress: outputAddress.trim(),
        signingOwnersPkh,
        threshold: datumInfo.threshold,
        collateral,
        changeAddress,
        utxos: filteredUtxos,
      });
      const signedTx = await signTxPartial(unsignedTx);
      if (datumInfo.threshold === 1) {
        const txHash = await submitSignedTxHex(signedTx);
        setUnlockTxHash(txHash);
      } else {
        setPartialSignedTxHex(signedTx);
      }
    } catch (err: unknown) {
      setUnlockError(err instanceof Error ? err.message : 'Unlock failed.');
    } finally {
      setUnlockLoading(false);
    }
  };

  const handleCosignAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCosignError('');
    const hex = partialTxFromOther.trim().replace(/^0x/, '');
    if (!hex || hex.length < 100) {
      setCosignError('Paste partial signed tx (hex) from the owner who signed first.');
      return;
    }
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
      setPartialTxFromOther('');
    } catch (err: unknown) {
      setCosignError(err instanceof Error ? err.message : 'Cosign or submit failed.');
    } finally {
      setCosignLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 className={styles.pageTitle}>Unlock</h1>

      <div className={styles.formGroup}>
        <label className={styles.label}>Find UTxO by Policy + Asset (NFT 222)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end' }}>
          <input
            className={styles.input}
            placeholder="Policy ID (56 hex)"
            value={unlockPolicyId}
            onChange={(e) => setUnlockPolicyId(e.target.value)}
            style={{ minWidth: 200 }}
          />
          <input
            className={styles.input}
            placeholder="Asset name (UTF-8 or hex:...)"
            value={unlockAssetName}
            onChange={(e) => setUnlockAssetName(e.target.value)}
            style={{ minWidth: 180 }}
          />
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={loadScriptUtxoByAsset}
            disabled={findByAssetLoading}
          >
            {findByAssetLoading ? 'Searching...' : 'Find UTxO by asset'}
          </button>
        </div>
      </div>
      {scriptUtxos.length > 0 && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Select UTxO to unlock (newest first)</label>
          <select
            className={styles.input}
            value={selectedUtxoIndex}
            onChange={(e) => selectUtxoAndParseDatum(Number(e.target.value))}
          >
            <option value={-1}>-- Select --</option>
            {scriptUtxos.map((u: unknown, i: number) => {
              const o = u as { input?: { txHash?: string; outputIndex?: number } };
              const label = `${o?.input?.txHash?.slice(0, 16)}...#${o?.input?.outputIndex ?? i}`;
              const suffix = i === 0 ? ' — Newest' : '';
              return (
                <option key={i} value={i}>
                  {label}{suffix}
                </option>
              );
            })}
          </select>
        </div>
      )}
      {datumInfo && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f9fafb', borderRadius: 8 }}>
          <div className={styles.label}>
            Datum: threshold = {datumInfo.threshold}, owners = {datumInfo.ownersPkh.length}
          </div>
          <div className={styles.label}>
            Recipient address (from lock): {datumInfo.recipientAddress || '(hex: ' + datumInfo.recipientPkh.slice(0, 24) + '...)'}
          </div>
          {datumInfo.ownerAddresses.length > 0 && datumInfo.threshold > 1 && (
            <div className={styles.label} style={{ marginTop: 8 }}>
              Owners to sign (matching wallets): {datumInfo.ownerAddresses.map((a, i) => (
                <span key={i} style={{ display: 'block', fontSize: '0.8rem', marginTop: 4 }}>
                  Owner {i + 1}: <code style={{ wordBreak: 'break-all' }}>{a}</code>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      {selectedUtxoIndex >= 0 && (
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
          {datumInfo && datumInfo.threshold > 1 && (
            <p style={{ marginBottom: 12, color: '#6b7280', fontSize: '0.875rem' }}>
              This unlock requires {datumInfo.threshold} signature(s). You sign first, copy the partial tx below and send it to the other owner so they open this page → paste in &quot;I am the second signer&quot; → Sign &amp; Submit.
            </p>
          )}
          {unlockError && <p className={styles.error}>{unlockError}</p>}
          {unlockTxHash && (
            <p style={{ color: 'green', marginBottom: 8 }}>
              Tx submitted: <code style={{ fontSize: '0.8rem' }}>{unlockTxHash}</code>
            </p>
          )}
          {partialSignedTxHex && (
            <div className={styles.formGroup} style={{ marginTop: 16 }}>
              <label className={styles.label}>Partial signed tx — send to other owner (hex)</label>
              <textarea
                className={styles.textarea}
                rows={4}
                readOnly
                value={partialSignedTxHex}
                style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
              />
              <button
                type="button"
                className={styles.btnSecondary}
                style={{ marginTop: 8 }}
                onClick={() => navigator.clipboard.writeText(partialSignedTxHex)}
              >
                Copy
              </button>
            </div>
          )}
          <button type="submit" className={styles.btnPrimary} disabled={unlockLoading}>
            {unlockLoading
              ? 'Building & signing...'
              : datumInfo && datumInfo.threshold > 1
                ? 'Build & sign (step 1/2)'
                : 'Unlock (build → sign → submit)'}
          </button>
        </form>
      )}

      <div style={{ marginTop: 32, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <form onSubmit={handleCosignAndSubmit}>
          <textarea
            className={styles.textarea}
            rows={3}
            value={partialTxFromOther}
            onChange={(e) => setPartialTxFromOther(e.target.value)}
            placeholder="Paste hex partial signed tx here..."
            style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
          />
          {cosignError && <p className={styles.error}>{cosignError}</p>}
          <button type="submit" className={styles.btnPrimary} disabled={cosignLoading} style={{ marginTop: 8 }}>
            {cosignLoading ? 'Signing & submitting...' : 'Sign & Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
