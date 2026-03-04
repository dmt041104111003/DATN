'use client';

import { useState, useEffect } from 'react';
import formStyles from '../../styles/Form.module.css';
import tableStyles from '../../styles/Table.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import dialogStyles from '../../styles/Dialog.module.css';
import paginationStyles from '../../styles/Pagination.module.css';
import Pagination from '../../components/Pagination';
import { getAuthToken } from '../../lib/account';
import { getDeliveries, type OrderDeliveryItem } from '../../lib/order';
import { OrderHeader } from '../../components/order/OrderHeader';
import { OrderSearch } from '../../components/order/OrderSearch';
import { OrderTable } from '../../components/order/OrderTable';
import { OrderCards } from '../../components/order/OrderCards';
import { OrderDialog } from '../../components/order/OrderDialog';
import { OrderDetailDialog } from '../../components/order/OrderDetailDialog';

const styles = { ...formStyles, ...tableStyles, ...buttonStyles, ...dialogStyles, ...paginationStyles };
const PAGE_SIZE = 10;

export default function OrderPage() {
  const [deliveries, setDeliveries] = useState<OrderDeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDelivery, setDialogDelivery] = useState<OrderDeliveryItem | null>(null);
  const [detailDelivery, setDetailDelivery] = useState<OrderDeliveryItem | null>(null);

  const loadDeliveries = async () => {
    const token = getAuthToken();
    if (!token) {
      setDeliveries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await getDeliveries(token);
      setDeliveries(list);
    } catch {
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDeliveries();
  }, []);

  useEffect(() => {
    if (dialogOpen && dialogDelivery && deliveries.length > 0) {
      const fresh = deliveries.find((d) => d.id === dialogDelivery.id);
      if (fresh) setDialogDelivery(fresh);
    }
  }, [deliveries, dialogOpen, dialogDelivery?.id]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const filteredItems = deliveries.filter((d) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      d.batchId.toLowerCase().includes(query) ||
      (d.recipientAddress || '').toLowerCase().includes(query) ||
      (d.lockTxHash || '').toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paginatedList = filteredItems.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const handleComplete = (d: OrderDeliveryItem) => {
    if (d.status === 'DELIVERED' || d.unlockTxHash) return;
    setDialogDelivery(d);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogDelivery(null);
  };

  return (
    <>
      <OrderHeader styles={styles} />
      <OrderSearch styles={styles} query={searchQuery} onChange={setSearchQuery} />

      <OrderTable
        styles={styles}
        items={paginatedList}
        onDetail={setDetailDelivery}
        onComplete={handleComplete}
      />
      <OrderCards
        styles={styles}
        items={paginatedList}
        onDetail={setDetailDelivery}
        onComplete={handleComplete}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filteredItems.length}
        pageSize={PAGE_SIZE}
      />

      <OrderDialog
        open={dialogOpen}
        delivery={dialogDelivery}
        onClose={handleDialogClose}
        onSuccess={loadDeliveries}
      />
      <OrderDetailDialog
        open={!!detailDelivery}
        delivery={detailDelivery}
        onClose={() => setDetailDelivery(null)}
      />
    </>
  );
}
