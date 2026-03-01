'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import formStyles from '../../styles/Form.module.css';
import tableStyles from '../../styles/Table.module.css';
import buttonStyles from '../../styles/Buttons.module.css';
import dialogStyles from '../../styles/Dialog.module.css';
import paginationStyles from '../../styles/Pagination.module.css';
import Pagination from '../../components/Pagination';
import type { Product } from '../../types';
import { randomAssetName } from '../../utils/asset';
import { nowForDateTimeLocal } from '../../utils/date';
import { readAccountFromToken } from '../../lib/account';
import { getWalletChangeAddress, getWalletUtxoAddresses, signAndSubmitWithEternl } from '../../utils/wallet';
import { ProductsHeader } from '../../components/product/ProductsHeader';
import { ProductsSearch } from '../../components/product/ProductsSearch';
import { ProductsTable } from '../../components/product/ProductsTable';
import { ProductsCards } from '../../components/product/ProductsCards';
import { ProductDialog, type ProfileOption } from '../../components/product/ProductDialog';

const styles = { ...formStyles, ...tableStyles, ...buttonStyles, ...dialogStyles, ...paginationStyles };
const PAGE_SIZE = 10;
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';
const AUTH_COOKIE = 'auth_token';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [slug, setSlug] = useState('');
  const [nameEn, setNameEn] = useState('Cam sành XNK 1.5kg');
  const [descriptionEn, setDescriptionEn] = useState('Sample traceability product');
  const [imageUrl, setImageUrl] = useState('ipfs://<hash_anh_dai_dien>');
  const [expiryDate, setExpiryDate] = useState(nowForDateTimeLocal);
  const [certificateHash, setCertificateHash] = useState(
    'ipfs://<hash_ket_qua_kiem_nghiem>',
  );
  const [receiverList, setReceiverList] = useState<string[]>([]);
  const [receiverDisplayNames, setReceiverDisplayNames] = useState<string[]>([]);
  const [receiverLocations, setReceiverLocations] = useState('');
  const [receiverCoordinates, setReceiverCoordinates] = useState('');
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [minterLocation, setMinterLocation] = useState('');
  const [minterCoordinates, setMinterCoordinates] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const account = readAccountFromToken();
    if (!account || account.roleCode?.toUpperCase() !== 'ENTERPRISE') {
      router.replace('/admin');
      return;
    }
  }, [router]);

  const loadBatches = async () => {
    const account = readAccountFromToken();
    if (!account || account.roleCode?.toUpperCase() !== 'ENTERPRISE') return;
    const cookie = typeof document !== 'undefined'
      ? document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${AUTH_COOKIE}=`))
      : null;
    const token = cookie ? decodeURIComponent(cookie.split('=')[1] ?? '') : '';
    if (!token) {
      setProducts([]);
      return;
    }
    const res = await fetch(`${BACKEND_URL}/trace/batches?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) {
      setProducts([]);
      return;
    }
    const items: any[] = Array.isArray(data?.items) ? data.items : [];
    const mapped: Product[] = items
      .map((b, i) => ({
        id: i + 1,
        slug: String(b?.id ?? ''),
        nameEn: String(b?.name ?? ''),
        descriptionEn: null,
        imageUrl: b?.image ? String(b.image) : null,
      }))
      .filter((p) => !!p.slug);
    setProducts(mapped);
  };

  useEffect(() => {
    void loadBatches();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const filteredProducts = products.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    return (
      !query ||
      p.id === Number(query) ||
      p.slug.toLowerCase().includes(query) ||
      p.nameEn.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paginatedList = filteredProducts.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const addReceiverFromProfile = (profile: ProfileOption) => {
    if (!profile.coordinates) return;
    setReceiverList((prev) => {
      if (prev.includes(profile.walletAddress)) return prev;
      setReceiverDisplayNames((names) => [...names, profile.displayName]);
      setReceiverLocations((locPrev) =>
        locPrev ? `${locPrev}; ${profile.location ?? ''}` : (profile.location ?? '')
      );
      setReceiverCoordinates((coordPrev) =>
        coordPrev ? `${coordPrev};${profile.coordinates}` : (profile.coordinates ?? '')
      );
      return [...prev, profile.walletAddress];
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setSlug('');
    setNameEn('Cam sành XNK 1.5kg');
    setDescriptionEn('Sample traceability product');
    setImageUrl('ipfs://<hash_anh_dai_dien>');
    setExpiryDate(nowForDateTimeLocal());
    setCertificateHash('ipfs://<hash_ket_qua_kiem_nghiem>');
    setReceiverList([]);
    setReceiverDisplayNames([]);
    setReceiverLocations('');
    setReceiverCoordinates('');
    setMinterLocation('');
    setMinterCoordinates('');
    setError('');
    setOpen(false);
  };

  const loadProfiles = async () => {
    const cookie = typeof document !== 'undefined'
      ? document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${AUTH_COOKIE}=`))
      : null;
    const token = cookie ? decodeURIComponent(cookie.split('=')[1] ?? '') : '';
    if (!token) return;
    const res = await fetch(`${BACKEND_URL}/auth/profiles?token=${encodeURIComponent(token)}`);
    if (!res.ok) return;
    const data = await res.json();
    setProfiles(Array.isArray(data) ? data : []);
  };

  const openAdd = () => {
    resetForm();
    setSlug(randomAssetName());
    const account = readAccountFromToken();
    setMinterLocation(account?.location ?? '');
    setMinterCoordinates(account?.coordinates ?? '');
    void loadProfiles();
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setSlug(p.slug);
    setNameEn(p.nameEn);
    setDescriptionEn(p.descriptionEn ?? '');
    setImageUrl(p.imageUrl ?? '');
    setError('');
    const account = readAccountFromToken();
    setMinterLocation(account?.location ?? '');
    setMinterCoordinates(account?.coordinates ?? '');
    void loadProfiles();
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nameEn.trim()) {
      setError('Name is required.');
      return;
    }

    let assetName = slug.trim();
    if (!assetName) {
      assetName = randomAssetName();
      setSlug(assetName);
    }

    const account = readAccountFromToken();
    if (!account || !account.stakeAddress) {
      setError('Missing wallet address from token.');
      return;
    }

    let effectiveExpiry = expiryDate.trim();
    if (!effectiveExpiry) {
      effectiveExpiry = '2023-07-18T17:00:00Z';
    } else {
      const parsed = new Date(effectiveExpiry);
      if (!Number.isNaN(parsed.getTime())) {
        effectiveExpiry = parsed.toISOString();
      }
    }
    const effectiveCertificateHash =
      certificateHash.trim() || 'ipfs://<hash_ket_qua_kiem_nghiem>';
    const properties: Record<string, unknown> = {
      ngayHetHan: effectiveExpiry,
      current_holder_id: account.stakeAddress,
      certificate_hash: effectiveCertificateHash,
    };

    setLoading(true);
    try {
      const changeAddress = await getWalletChangeAddress();
      const utxoAddresses = await getWalletUtxoAddresses();

      const isEdit = editingId !== null;
      const url = `${BACKEND_URL}/trace/${isEdit ? 'update' : 'mint'}`;
      const body: any = {
        changeAddress,
        utxoAddresses,
        assetName,
        name: nameEn,
        image: imageUrl || '',
        receivers: receiverList.length ? receiverList : [account.stakeAddress],
        receiverLocations,
        receiverCoordinates,
        minterLocation,
        minterCoordinates,
        propertiesJson: JSON.stringify(properties),
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || `Unable to ${isEdit ? 'update' : 'mint'} product.`,
        );
      }

      if (data?.unsignedTx) {
        const txHash = await signAndSubmitWithEternl(data.unsignedTx);
        const profileId = account.id;
        const confirmUrl = `${BACKEND_URL}/trace/${isEdit ? 'update' : 'mint'}/confirm`;
        const confirmBody = isEdit
          ? {
              txHash,
              assetName,
              profileId,
              name: nameEn,
              image: imageUrl || '',
              standard: 'Traceability-v1',
              properties,
            }
          : { txHash, assetName, name: nameEn, image: imageUrl || '', minterProfileId: profileId };
        const confirmRes = await fetch(confirmUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(confirmBody),
        });
        if (!confirmRes.ok) {
          const confirmData = await confirmRes.json();
          throw new Error(confirmData?.message || confirmData?.error || 'Confirm failed.');
        }
      }

      await loadBatches();

      resetForm();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'An error occurred while saving the product.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: number) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    if (!confirm('Are you sure you want to revoke this product?')) return;

    const account = readAccountFromToken();
    if (!account) {
      setError('Missing account from token.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const changeAddress = await getWalletChangeAddress();
      const res = await fetch(`${BACKEND_URL}/trace/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changeAddress,
          utxoAddresses: await getWalletUtxoAddresses(),
          assetName: target.slug,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || 'Unable to revoke product.',
        );
      }

      if (data?.unsignedTx) {
        const txHash = await signAndSubmitWithEternl(data.unsignedTx);
        const confirmRes = await fetch(`${BACKEND_URL}/trace/revoke/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ txHash, assetName: target.slug, profileId: account.id }),
        });
        if (!confirmRes.ok) {
          const confirmData = await confirmRes.json();
          throw new Error(confirmData?.message || confirmData?.error || 'Confirm revoke failed.');
        }
      }

      await loadBatches();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'An error occurred while revoking the product.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      if (file) alert('Please choose an image file (jpg, png, webp...)');
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(typeof reader.result === 'string' ? reader.result : '');
      setUploading(false);
      e.target.value = '';
    };
    reader.onerror = () => {
      alert('Failed to read image file');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <ProductsHeader styles={styles} onAdd={openAdd} />

      <ProductsSearch
        styles={styles}
        query={searchQuery}
        onChange={setSearchQuery}
      />

      <ProductsTable
        styles={styles}
        items={paginatedList}
        onEdit={openEdit}
        onRevoke={handleRevoke}
      />

      <ProductsCards
        styles={styles}
        items={paginatedList}
        onEdit={openEdit}
        onRevoke={handleRevoke}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={products.length}
        pageSize={PAGE_SIZE}
      />

      <ProductDialog
        styles={styles}
        open={open}
        editingId={editingId}
        error={error}
        loading={loading}
        uploading={uploading}
        slug={slug}
        nameEn={nameEn}
        descriptionEn={descriptionEn}
        expiryDate={expiryDate}
        certificateHash={certificateHash}
        receiverList={receiverList}
        receiverDisplayNames={receiverDisplayNames}
        receiverLocations={receiverLocations}
        receiverCoordinates={receiverCoordinates}
        profiles={profiles}
        minterLocation={minterLocation}
        minterCoordinates={minterCoordinates}
        imageUrl={imageUrl}
        imageInputRef={imageInputRef}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        onNameChange={setNameEn}
        onDescriptionChange={setDescriptionEn}
        onExpiryChange={setExpiryDate}
        onCertificateHashChange={setCertificateHash}
        onAddReceiverFromProfile={addReceiverFromProfile}
        onReceiverLocationsChange={setReceiverLocations}
        onReceiverCoordinatesChange={setReceiverCoordinates}
        onReceiverListChange={setReceiverList}
        onReceiverDisplayNamesChange={setReceiverDisplayNames}
        onImageUrlChange={setImageUrl}
        onUploadClick={() => imageInputRef.current?.click()}
        onImageUpload={handleImageUpload}
      />
    </>
  );
}
