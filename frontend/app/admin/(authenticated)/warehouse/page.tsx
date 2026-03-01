'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import formStyles from '../../styles/Form.module.css';
import tableStyles from '../../styles/Table.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import Pagination from '../../components/Pagination';
import { readAccountFromToken, getAuthToken } from '../../lib/account';
import {
  getWarehouseItems,
  requestBurnNft,
  confirmBurnNft,
  type WarehouseItem,
} from '../../lib/warehouse';
import { getWalletChangeAddress, getWalletUtxos, signAndSubmitWithEternl } from '../../utils/wallet';
import { WarehouseHeader } from '../../components/warehouse/WarehouseHeader';
import { WarehouseSearch } from '../../components/warehouse/WarehouseSearch';
import { WarehouseTable } from '../../components/warehouse/WarehouseTable';
import { WarehouseCards } from '../../components/warehouse/WarehouseCards';

const styles = { ...formStyles, ...tableStyles, ...buttonStyles };
const PAGE_SIZE = 10;

const ALLOWED_WAREHOUSE_ROLES = ['ENTERPRISE', 'TRANSIT', 'AGENT'];

export default function WarehousePage() {
  const router = useRouter();
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [burningBatchId, setBurningBatchId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const account = readAccountFromToken();
    const role = account?.roleCode?.toUpperCase() ?? '';
    if (!account || !ALLOWED_WAREHOUSE_ROLES.includes(role)) {
      router.replace('/admin');
      return;
    }
  }, [router]);

  const loadMyWarehouse = async () => {
    const token = getAuthToken();
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const list = await getWarehouseItems(token);
      setItems(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load warehouse.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMyWarehouse();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const filteredItems = items.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      item.batchId.toLowerCase().includes(query) ||
      item.batchName.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paginatedList = filteredItems.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const handleBurn = async (item: WarehouseItem) => {
    if (
      !confirm(
        `Burn NFT "${item.batchName}" (${item.batchId})? Your wallet must hold this NFT.`,
      )
    ) {
      return;
    }
    const token = getAuthToken();
    const account = readAccountFromToken();
    if (!token || !account?.id) {
      setError('Session expired. Please log in again.');
      return;
    }
    setError('');
    setBurningBatchId(item.batchId);
    try {
      const changeAddress = await getWalletChangeAddress();
      const utxos = await getWalletUtxos();
      const { unsignedTx } = await requestBurnNft(token, {
        changeAddress,
        assetName: item.batchId,
        walletUtxos: utxos,
        policyId: item.policyId,
      });
      const txHash = await signAndSubmitWithEternl(unsignedTx);
      await confirmBurnNft(token, {
        txHash,
        assetName: item.batchId,
        profileId: account.id,
      });
      await loadMyWarehouse();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Burn failed.');
    } finally {
      setBurningBatchId(null);
    }
  };

  return (
    <>
      <WarehouseHeader styles={styles} />

      <WarehouseSearch
        styles={styles}
        query={searchQuery}
        onChange={setSearchQuery}
      />

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className={styles.formHint}>Loading...</p>
      ) : items.length === 0 ? (
        <div className={styles.formCard}>
          <p className={styles.formHint}>
            Your warehouse is empty. Each account has its own warehouse: ENTERPRISE
            gets items here after minting; other roles can only burn if the wallet
            holds the NFT.
          </p>
        </div>
      ) : (
        <>
          <WarehouseTable
            styles={styles}
            items={paginatedList}
            onBurn={handleBurn}
            burningBatchId={burningBatchId}
          />
          <WarehouseCards
            styles={styles}
            items={paginatedList}
            onBurn={handleBurn}
            burningBatchId={burningBatchId}
          />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filteredItems.length}
            pageSize={PAGE_SIZE}
          />
        </>
      )}
    </>
  );
}
