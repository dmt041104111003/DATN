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
import type { ProfileOption } from '../../types';
import { uploadFileToIpfs } from '../../lib/ipfs';
import { getAuthToken } from '../../lib/account';
import { getBatchByAssetName, getProductRoadmap } from '../../lib/product';
import { getCertificates, getCertificateIdsByBatch, setCertificatesForBatch } from '../../lib/certificate';
import { encodeTraceId } from '@/utils/utils';
import { ProductDialog } from '../../components/product/ProductDialog';

const styles = { ...formStyles, ...tableStyles, ...buttonStyles, ...dialogStyles, ...paginationStyles };
const PAGE_SIZE = 10;
const DEFAULT_IMAGE_IPFS = 'ipfs://bafkreiak6rnkvx24nks3yadlg6x6emr6jtfbflufke5dzxi2sr66usyyne';
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';
const AUTH_COOKIE = 'auth_token';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [code, setCode] = useState('');
  const [nameEn, setNameEn] = useState('Cam sành XNK 1.5kg');
  const [descriptionEn, setDescriptionEn] = useState('Sample traceability product');
  const [imageUrl, setImageUrl] = useState('');
  const [sku, setSku] = useState('SKU-TRACE-001');
  const [productCategory, setProductCategory] = useState('FRUIT');
  const [storageCondition, setStorageCondition] = useState('AMBIENT');
  const [originSiteCode, setOriginSiteCode] = useState('WH-HCM-01');
  const [expiryDate, setExpiryDate] = useState(nowForDateTimeLocal);
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
  const lastAddedReceiverRef = useRef<string | null>(null);
  const [certificateOptions, setCertificateOptions] = useState<{ id: number; title: string }[]>([]);
  const [selectedCertificateIds, setSelectedCertificateIds] = useState<number[]>([]);

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
    const res = await fetch(`${BACKEND_URL}/product/batches?token=${encodeURIComponent(token)}`, {
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
      .map((b: {
        id?: number;
        batchId?: string;
        name?: string;
        description?: string | null;
        image?: string | null;
        sku?: string | null;
        productCategory?: string | null;
        storageCondition?: string | null;
        originSiteCode?: string | null;
        grossWeightKg?: number | null;
        netWeightKg?: number | null;
      }) => ({
        id: Number(b?.id ?? 0),
        code: String(b?.batchId ?? ''),
        nameEn: String(b?.name ?? ''),
        descriptionEn: b?.description != null ? String(b.description) : null,
        imageUrl: b?.image ? String(b.image) : null,
        sku: b?.sku ?? null,
        productCategory: b?.productCategory ?? null,
        storageCondition: b?.storageCondition ?? null,
        originSiteCode: b?.originSiteCode ?? null,
        grossWeightKg:
          b?.grossWeightKg != null ? Number(b.grossWeightKg) : null,
        netWeightKg: b?.netWeightKg != null ? Number(b.netWeightKg) : null,
      }))
      .filter((p) => !!p.code);
    setProducts(mapped);
  };

  useEffect(() => {
    void loadBatches();
  }, []);

  useEffect(() => {
    const n = receiverList.length;
    if (receiverDisplayNames.length > n) {
      setReceiverDisplayNames((names) => names.slice(0, n));
    }
    if (receiverLocations) {
      const parts = receiverLocations.split(';').map((s) => s.trim()).filter(Boolean);
      if (parts.length > n) {
        setReceiverLocations(parts.slice(0, n).join('; '));
      }
    }
    if (receiverCoordinates) {
      const parts = receiverCoordinates.split(';').map((s) => s.trim()).filter(Boolean);
      if (parts.length > n) {
        setReceiverCoordinates(parts.slice(0, n).join(';'));
      }
    }
  }, [receiverList.length]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const filteredProducts = products.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    return (
      !query ||
      p.id === Number(query) ||
      p.code.toLowerCase().includes(query) ||
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
    if (lastAddedReceiverRef.current === profile.walletAddress) {
      lastAddedReceiverRef.current = null;
      return;
    }
    lastAddedReceiverRef.current = profile.walletAddress;
    setReceiverList((prev) => {
      if (prev.includes(profile.walletAddress)) {
        lastAddedReceiverRef.current = null;
        return prev;
      }
      setReceiverDisplayNames((names) => [...names, profile.displayName]);
      setReceiverLocations((locPrev) =>
        locPrev ? `${locPrev}; ${profile.location ?? ''}` : (profile.location ?? '')
      );
      setReceiverCoordinates((coordPrev) =>
        coordPrev ? `${coordPrev};${profile.coordinates}` : (profile.coordinates ?? '')
      );
      queueMicrotask(() => {
        lastAddedReceiverRef.current = null;
      });
      return [...prev, profile.walletAddress];
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setCode('');
    setNameEn('Cam sành XNK 1.5kg');
    setDescriptionEn('Sample traceability product');
    setImageUrl('');
    setSku('SKU-TRACE-001');
    setProductCategory('FRUIT');
    setStorageCondition('AMBIENT');
    setOriginSiteCode('WH-HCM-01');
    setExpiryDate(nowForDateTimeLocal());
    setReceiverList([]);
    setReceiverDisplayNames([]);
    setReceiverLocations('');
    setReceiverCoordinates('');
    setMinterLocation('');
    setMinterCoordinates('');
    setError('');
    setOpen(false);
    setSelectedCertificateIds([]);
  };

  const loadProfiles = async (): Promise<ProfileOption[]> => {
    const cookie = typeof document !== 'undefined'
      ? document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${AUTH_COOKIE}=`))
      : null;
    const token = cookie ? decodeURIComponent(cookie.split('=')[1] ?? '') : '';
    if (!token) return [];
    const res = await fetch(`${BACKEND_URL}/profile/profiles?token=${encodeURIComponent(token)}`);
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? (data as ProfileOption[]) : [];
    setProfiles(list);
    return list;
  };

  const loadCertificateOptions = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const { items } = await getCertificates(token, { pageSize: 500 });
      setCertificateOptions(items.map((c) => ({ id: c.id, title: c.title })));
    } catch {
      setCertificateOptions([]);
    }
  };

  const openAdd = () => {
    resetForm();
    setCode(randomAssetName());
    const account = readAccountFromToken();
    setMinterLocation(account?.location ?? '');
    setMinterCoordinates(account?.coordinates ?? '');
    void loadProfiles();
    setSelectedCertificateIds([]);
    void loadCertificateOptions();
    setOpen(true);
  };

  const openEdit = async (p: Product) => {
    setEditingId(p.id);
    setCode(p.code);
    setNameEn(p.nameEn);
    setDescriptionEn(p.descriptionEn ?? '');
    setImageUrl(p.imageUrl ?? '');
    setSku(p.sku ?? '');
    setProductCategory(p.productCategory ?? '');
    setStorageCondition(p.storageCondition ?? '');
    setOriginSiteCode(p.originSiteCode ?? '');
    setError('');
    const account = readAccountFromToken();
    setMinterLocation(account?.location ?? '');
    setMinterCoordinates(account?.coordinates ?? '');

    const existingProfiles = profiles.length ? profiles : await loadProfiles();

    const token = getAuthToken();
    if (token) {
      try {
        const ids = await getCertificateIdsByBatch(token, p.code);
        setSelectedCertificateIds(ids);
      } catch {
        setSelectedCertificateIds([]);
      }
      try {
        const roadmap = await getProductRoadmap(token, p.code);
        const list: string[] = [];
        const names: string[] = [];
        const locs: string[] = [];
        const coords: string[] = [];

        roadmap.forEach((hop) => {
          const addr = hop.toAddress?.trim();
          if (!addr) return;
          const prof = existingProfiles.find(
            (x) => x.walletAddress.trim().toLowerCase() === addr.toLowerCase(),
          );
          if (!prof || !prof.coordinates) return;
          list.push(prof.walletAddress);
          names.push(prof.displayName);
          locs.push(prof.location ?? '');
          coords.push(prof.coordinates ?? '');
        });

        if (list.length) {
          setReceiverList(list);
          setReceiverDisplayNames(names);
          setReceiverLocations(locs.join('; '));
          setReceiverCoordinates(coords.join(';'));
        }
      } catch {
      }
    }

    void loadCertificateOptions();
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nameEn.trim()) {
      setError('Name is required.');
      return;
    }

    const effectiveImage = imageUrl.trim() || DEFAULT_IMAGE_IPFS;

    let assetName = code.trim();
    if (!assetName) {
      assetName = randomAssetName();
      setCode(assetName);
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
    const properties: Record<string, unknown> = {
      ngayHetHan: effectiveExpiry,
      current_holder_id: account.stakeAddress,
      sku: sku || undefined,
      productCategory: productCategory || undefined,
      storageCondition: storageCondition || undefined,
      originSiteCode: originSiteCode || undefined,
    };

    setLoading(true);
    try {
      const changeAddress = await getWalletChangeAddress();
      const utxoAddresses = await getWalletUtxoAddresses();
      const cookie = typeof document !== 'undefined'
        ? document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${AUTH_COOKIE}=`))
        : null;
      const token = cookie ? decodeURIComponent(cookie.split('=')[1] ?? '') : '';
      if (!token) throw new Error('Session expired. Please log in again.');

      const isEdit = editingId !== null;
      const url = `${BACKEND_URL}/product/${isEdit ? 'update' : 'mint'}?token=${encodeURIComponent(token)}`;
      const body: any = {
        changeAddress,
        utxoAddresses,
        assetName,
        name: nameEn,
        image: effectiveImage,
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
        const confirmUrl = `${BACKEND_URL}/product/${isEdit ? 'update' : 'mint'}/confirm?token=${encodeURIComponent(token)}`;
        const confirmBody = isEdit
          ? {
              txHash,
              assetName,
              profileId,
              name: nameEn,
              image: effectiveImage,
              standard: 'Traceability-v1',
              properties,
              metadata: { name: nameEn, image: effectiveImage, standard: 'Traceability-v1' },
              receivers: receiverList.length ? receiverList : [account.stakeAddress],
            }
          : {
              txHash,
              assetName,
              name: nameEn,
              image: effectiveImage,
              minterProfileId: profileId,
              policyId: data.policyId,
              standard: 'Traceability-v1',
              properties,
              metadata: { name: nameEn, image: effectiveImage, standard: 'Traceability-v1' },
              receivers: receiverList.length ? receiverList : [account.stakeAddress],
            };
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

      try {
        await setCertificatesForBatch(token, assetName, selectedCertificateIds);
      } catch {
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
      const utxoAddresses = await getWalletUtxoAddresses();
      const cookie = typeof document !== 'undefined'
        ? document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${AUTH_COOKIE}=`))
        : null;
      const token = cookie ? decodeURIComponent(cookie.split('=')[1] ?? '') : '';
      if (!token) throw new Error('Session expired. Please log in again.');

      const res = await fetch(`${BACKEND_URL}/product/revoke?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changeAddress,
          utxoAddresses: await getWalletUtxoAddresses(),
          assetName: target.code,
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
        const confirmRes = await fetch(`${BACKEND_URL}/product/revoke/confirm?token=${encodeURIComponent(token)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ txHash, assetName: target.code, profileId: account.id }),
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

  const handleDownloadQr = async (p: Product) => {
    if (typeof window === 'undefined') return;
    try {
      const info = await getBatchByAssetName(p.code);
      if (!info || !info.policyId) {
        alert('Policy ID not found for this batch.');
        return;
      }
      const traceId = encodeTraceId(info.policyId, info.assetName);
      const origin =
        typeof window !== 'undefined'
          ? window.location.origin.replace(/\/+$/, '')
          : '';
      const traceUrl = `${origin}/trace/${traceId}`;

      const [jsPdfModule, qrModule] = await Promise.all([
        import('jspdf'),
        import('qrcode'),
      ]);
      const JsPdfCtor: any =
        (jsPdfModule as any).jsPDF ||
        (jsPdfModule as any).default ||
        jsPdfModule;
      const QRCode = (qrModule as any).default || qrModule;

      const qrDataUrl: string = await QRCode.toDataURL(traceUrl, {
        margin: 1,
        width: 256,
      });

      const doc = new JsPdfCtor();
      const qrSize = 120;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const x = (pageWidth - qrSize) / 2;
      const y = (pageHeight - qrSize) / 2;
      doc.addImage(qrDataUrl, 'PNG', x, y, qrSize, qrSize);

      doc.save(`trace-${info.assetName}.pdf`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate QR PDF for this batch.',
      );
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) {
      if (file) setError('Please choose an image file (jpg, png, webp...)');
      return;
    }
    const token = getAuthToken();
    if (!token) {
      setError('Session expired. Please log in again.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const { ipfsHash } = await uploadFileToIpfs(token, file);
      setImageUrl(ipfsHash ? `ipfs://${ipfsHash.replace(/^ipfs:\/\//, '')}` : '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image to IPFS.');
    } finally {
      setUploading(false);
    }
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
        onDownloadQr={handleDownloadQr}
      />

      <ProductsCards
        styles={styles}
        items={paginatedList}
        onEdit={openEdit}
        onRevoke={handleRevoke}
        onDownloadQr={handleDownloadQr}
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
        code={code}
        nameEn={nameEn}
        descriptionEn={descriptionEn}
        sku={sku}
        productCategory={productCategory}
        storageCondition={storageCondition}
        originSiteCode={originSiteCode}
        expiryDate={expiryDate}
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
        onSkuChange={setSku}
        onProductCategoryChange={setProductCategory}
        onStorageConditionChange={setStorageCondition}
        onOriginSiteCodeChange={setOriginSiteCode}
        onExpiryChange={setExpiryDate}
        onAddReceiverFromProfile={addReceiverFromProfile}
        onReceiverLocationsChange={setReceiverLocations}
        onReceiverCoordinatesChange={setReceiverCoordinates}
        onReceiverListChange={setReceiverList}
        onReceiverDisplayNamesChange={setReceiverDisplayNames}
        onImageUrlChange={setImageUrl}
        onUploadClick={() => imageInputRef.current?.click()}
        onImageUpload={handleImageUpload}
        certificateOptions={certificateOptions}
        selectedCertificateIds={selectedCertificateIds}
        onCertificateIdsChange={setSelectedCertificateIds}
      />

    </>
  );
}
