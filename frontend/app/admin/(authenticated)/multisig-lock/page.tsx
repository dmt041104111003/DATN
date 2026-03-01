'use client';

import { useState, useEffect } from 'react';
import formStyles from '../../styles/Form.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import { getMultisigScriptAddress, buildLockTx, nftUnitFromPolicyAndName } from '../../lib/multisig';
import { getWalletChangeAddress, getWalletUtxos, signAndSubmitWithEternl } from '../../utils/wallet';
import { resolvePaymentKeyHash } from '@meshsdk/core';

const styles = { ...formStyles, ...buttonStyles };

export default function LockPage() {
  const [scriptAddress, setScriptAddress] = useState('');
  const [owners, setOwners] = useState<string[]>(['', '']);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [multisigNftPolicyId, setMultisigNftPolicyId] = useState(
    'df7339e888a9b8d33302f6eda9e4cfb02fb37057cee7b25a64fd6276'
  );
  const [multisigNftAssetName, setMultisigNftAssetName] = useState('chuoitim-mm73raz2-thzr3s');
  const [lockError, setLockError] = useState('');
  const [lockLoading, setLockLoading] = useState(false);
  const [lockTxHash, setLockTxHash] = useState('');

  useEffect(() => {
    getMultisigScriptAddress()
      .then(setScriptAddress)
      .catch(() => setScriptAddress(''));
  }, []);

  const handleLock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLockError('');
    setLockTxHash('');
    setLockLoading(true);
    try {
      const changeAddress = await getWalletChangeAddress();
      const utxos = await getWalletUtxos();
      const ownerLines = owners.map((s) => s.trim()).filter(Boolean);
      if (ownerLines.length === 0) {
        throw new Error('Enter at least one owner address.');
      }
      const ownersPkh = ownerLines.map((addr) => resolvePaymentKeyHash(addr));
      const th = ownersPkh.length;
      const recipientPkh = resolvePaymentKeyHash(recipientAddress.trim());
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
        threshold: th,
        recipientPkh,
        assets,
        changeAddress,
        utxos,
      });
      const txHash = await signAndSubmitWithEternl(unsignedTx);
      setLockTxHash(txHash);
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
          <label className={styles.label}>Owners (bech32 address)</label>
          {owners.map((addr, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input
                className={styles.input}
                value={addr}
                onChange={(e) => {
                  const next = [...owners];
                  next[i] = e.target.value;
                  setOwners(next);
                }}
                placeholder="addr_test1..."
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setOwners(owners.filter((_, j) => j !== i))}
                disabled={owners.length <= 1}
                aria-label="Remove owner"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => setOwners([...owners, ''])}
            style={{ marginTop: 4 }}
          >
            Add owner
          </button>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Recipient when Unlock (address)</label>
          <input
            className={styles.input}
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="addr_test1..."
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>MULTISIG_NFT_POLICY_ID</label>
          <input
            className={styles.input}
            value={multisigNftPolicyId}
            onChange={(e) => setMultisigNftPolicyId(e.target.value)}
            placeholder="df7339e888a9b8d33302f6eda9e4cfb02fb37057cee7b25a64fd6276"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>MULTISIG_NFT_ASSET_NAME</label>
          <input
            className={styles.input}
            value={multisigNftAssetName}
            onChange={(e) => setMultisigNftAssetName(e.target.value)}
            placeholder="chuoitim-mm73raz2-thzr3s (or hex:...)"
          />
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
