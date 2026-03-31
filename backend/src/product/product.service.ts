import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockfrostProvider, CIP68_222, stringToHex } from '@meshsdk/core';
import { PlutusHelper } from './helpers/plutus.helper';

function normAddr(s: string): string {
  return (s || '').trim().toLowerCase();
}

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private async attachEntityMedia(input: {
    entityType: 'CONTAINER' | 'PLAN' | 'GROWING_AREA' | 'RECORD_OPERATION';
    entityKey: string;
    role: string;
    ipfsUri: string;
    createdByAddress?: string | null;
  }) {
    const ipfsUri = String(input.ipfsUri || '').trim();
    if (!ipfsUri) return;
    const media = await (this.prisma as any).media.upsert({
      where: { ipfsUri },
      create: {
        ipfsUri,
        ipfsHash: ipfsUri.startsWith('ipfs://') ? ipfsUri.slice('ipfs://'.length) : null,
        createdByAddress: input.createdByAddress || null,
      } as any,
      update: {} as any,
    });
    await (this.prisma as any).entityMedia.upsert({
      where: {
        entityType_entityKey_role: {
          entityType: input.entityType,
          entityKey: input.entityKey,
          role: input.role,
        },
      },
      create: {
        entityType: input.entityType,
        entityKey: input.entityKey,
        role: input.role,
        mediaId: String(media.id),
      } as any,
      update: {
        mediaId: String(media.id),
      } as any,
    });
  }

  private async getContainerMediaByRole(keys: string[], roles: string[]) {
    const out: Record<string, Record<string, string | null>> = {};
    const k = (keys || []).map((s) => String(s || '').trim()).filter(Boolean);
    if (k.length === 0) return out;
    const r = (roles || []).map((s) => String(s || '').trim()).filter(Boolean);
    if (r.length === 0) return out;
    const rows = await (this.prisma as any).entityMedia.findMany({
      where: {
        entityType: 'CONTAINER',
        entityKey: { in: k },
        role: { in: r },
      },
      select: {
        entityKey: true,
        role: true,
        media: { select: { ipfsUri: true } },
      },
    });
    for (const row of Array.isArray(rows) ? rows : []) {
      const key = String(row?.entityKey || '').trim();
      const role = String(row?.role || '').trim();
      const ipfsUri = String(row?.media?.ipfsUri || '').trim();
      if (!key || !role) continue;
      out[key] ||= {};
      out[key][role] = ipfsUri || null;
    }
    return out;
  }

  async create(data: {
    traceSchemeRef: string;
    lotReference: string;
    inventoryKey: string;
    confirmationRef: string;
    txHash?: string;
    custodyParties: string[];
    registeringCustodianAddress: string;
    warehouseId?: string | null;
    planInventoryKey?: string | null;
    passport: {
      name: string;
      description: string;
      roadmap?: string;
      location?: string;
      image?: string;
      containerType?: string;
      maxWeightValue?: string;
      maxWeightUnit?: string;
      maxVolumeValue?: string;
      maxVolumeUnit?: string;
    };
  }) {
    const warehouseId = (data.warehouseId || '').trim() || null;
    if (warehouseId) {
      const wh = await this.prisma.warehouse.findUnique({
        where: { id: warehouseId },
        select: { id: true, isActive: true },
      });
      if (!wh || !wh.isActive) {
        throw new BadRequestException('Storage warehouse not found or not permitted.');
      }
    }

    const product = await (this.prisma as any).container.create({
      data: {
        traceSchemeRef: data.traceSchemeRef,
        lotReference: data.lotReference,
        inventoryKey: data.inventoryKey,
        confirmationRef: data.confirmationRef,
        custodyRoster: data.custodyParties.join('\n'),
        planInventoryKey: (data.planInventoryKey || '').trim() || null,
        warehouseId,
        registeringCustodianAddress: data.registeringCustodianAddress,
        tradeTitle: data.passport.name,
        lotStory: data.passport.description,
        status: 'INITIAL',
        roadmap: data.passport.roadmap,
        location: data.passport.location,
        containerType: (data.passport.containerType || '').trim() || null,
        maxWeightValue: (data.passport.maxWeightValue || '').trim() || null,
        maxWeightUnit: (data.passport.maxWeightUnit || '').trim() || null,
        maxVolumeValue: (data.passport.maxVolumeValue || '').trim() || null,
        maxVolumeUnit: (data.passport.maxVolumeUnit || '').trim() || null,
      } as any,
    });

    const txHash = String(data.txHash || '').trim();
    if (txHash) {
      try {
        await (this.prisma as any).recordOperation.create({
          data: {
            entityType: 'CONTAINER',
            entityKey: product.inventoryKey,
            containerInventoryKey: product.inventoryKey,
            opType: 'CREATE',
            txHash,
            verified: false,
            payload: {
              warehouseId,
              lotReference: product.lotReference,
            },
          } as any,
        });
      } catch {
        // ignore
      }
    }

    const img = String(data.passport.image || '').trim();
    if (img) {
      await this.attachEntityMedia({
        entityType: 'CONTAINER',
        entityKey: product.inventoryKey,
        role: 'PRODUCT_IMAGE',
        ipfsUri: img,
        createdByAddress: data.registeringCustodianAddress,
      });
    }

    return {
      id: product.id,
      traceSchemeRef: product.traceSchemeRef,
      lotReference: product.lotReference,
      inventoryKey: product.inventoryKey,
      confirmationRef: product.confirmationRef,
    };
  }

  async findAll(registeringCustodianAddress?: string) {
    const where = registeringCustodianAddress
      ? {
          registeringCustodianAddress,
        }
      : undefined;

    const products = await (this.prisma as any).container.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const keys = products
      .map((p: any) => String(p.inventoryKey || '').trim())
      .filter(Boolean);
    const pendingByKey: Record<string, boolean> = {};
    if (keys.length > 0) {
      try {
        const pending = await (this.prisma as any).recordOperation.findMany({
          where: { entityType: 'CONTAINER', entityKey: { in: keys }, verified: false },
          select: { entityKey: true },
        });
        for (const row of Array.isArray(pending) ? pending : []) {
          const k = String(row?.entityKey || '').trim();
          if (k) pendingByKey[k] = true;
        }
      } catch {
        // ignore
      }
    }

    const mediaByKey = await this.getContainerMediaByRole(keys, [
      'PRODUCT_IMAGE',
      'PRODUCT_DISPATCH_IMAGE',
      'PRODUCT_CHECKIN_IMAGE',
      'PRODUCT_CONSUME_IMAGE',
    ]);

    return products.map((product: any) => {
      const k = String(product.inventoryKey || '').trim();
      const hasPending = Boolean(pendingByKey[k]);
      const m = mediaByKey[k] || {};
      return {
      id: product.id,
      traceSchemeRef: product.traceSchemeRef,
      lotReference: product.lotReference,
      inventoryKey: product.inventoryKey,
      confirmationRef: product.confirmationRef,
      custodyParties: product.custodyRoster.split('\n').filter((o) => o.trim().length > 0),
      name: product.tradeTitle,
      description: product.lotStory,
      roadmap: product.roadmap,
      location: product.location,
      imageIpfs: m['PRODUCT_IMAGE'] ?? null,
      dispatchImageIpfs: m['PRODUCT_DISPATCH_IMAGE'] ?? null,
      checkinImageIpfs: m['PRODUCT_CHECKIN_IMAGE'] ?? null,
      consumeImageIpfs: m['PRODUCT_CONSUME_IMAGE'] ?? null,
      planInventoryKey: (product as any).planInventoryKey ?? null,
      warehouseId: (product as any).warehouseId ?? null,
      containerType: (product as any).containerType ?? null,
      maxWeightValue: (product as any).maxWeightValue ?? null,
      maxWeightUnit: (product as any).maxWeightUnit ?? null,
      maxVolumeValue: (product as any).maxVolumeValue ?? null,
      maxVolumeUnit: (product as any).maxVolumeUnit ?? null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      status: product.status,
      verified: !hasPending,
      hasPending,
    };
    });
  }

  async findForSessionByInventoryKey(inventoryKey: string, sessionWallet: string) {
    const key = (inventoryKey || '').trim();
    const w = normAddr(sessionWallet);
    if (!key || !w) {
      return { ok: false as const, reason: 'bad_request' as const };
    }

    const product = await (this.prisma as any).container.findUnique({
      where: { inventoryKey: key },
    });

    if (!product) {
      return { ok: false as const, reason: 'not_found' as const };
    }

    const roster = String(product.custodyRoster || '')
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);

    const rosterNorm = roster.map(normAddr);
    const isMember =
      normAddr(product.registeringCustodianAddress) === w || rosterNorm.includes(w);

    if (!isMember) {
      return { ok: false as const, reason: 'forbidden' as const };
    }

    const mediaByKey = await this.getContainerMediaByRole([product.inventoryKey], [
      'PRODUCT_IMAGE',
      'PRODUCT_DISPATCH_IMAGE',
      'PRODUCT_CHECKIN_IMAGE',
      'PRODUCT_CONSUME_IMAGE',
    ]);
    const m = mediaByKey[String(product.inventoryKey || '').trim()] || {};

    return {
      ok: true as const,
      product: {
        inventoryKey: product.inventoryKey,
        lotReference: product.lotReference,
        traceSchemeRef: product.traceSchemeRef,
        custodyParties: roster,
        registeringCustodianAddress: product.registeringCustodianAddress,
        warehouseId: product.warehouseId,
        status: product.status,
        name: product.tradeTitle,
        description: product.lotStory,
        roadmap: product.roadmap,
        location: product.location,
        dispatchImageIpfs: m['PRODUCT_DISPATCH_IMAGE'] ?? null,
        imageIpfs: m['PRODUCT_IMAGE'] ?? null,
        checkinImageIpfs: m['PRODUCT_CHECKIN_IMAGE'] ?? null,
        consumeImageIpfs: m['PRODUCT_CONSUME_IMAGE'] ?? null,
        containerType: (product as any).containerType ?? null,
        maxWeightValue: (product as any).maxWeightValue ?? null,
        maxWeightUnit: (product as any).maxWeightUnit ?? null,
        maxVolumeValue: (product as any).maxVolumeValue ?? null,
        maxVolumeUnit: (product as any).maxVolumeUnit ?? null,
      },
    };
  }

  async updateByUnit(
    inventoryKey: string,
    custodianAddress: string,
    data: {
      confirmationRef: string;
      custodyParties?: string[];
      requesterRole?: string;
      warehouseId?: string | null;
      recordOutboundDispatch?: boolean;
      passport?: {
        name?: string;
        description?: string;
        roadmap?: string;
        location?: string;
        dispatchImage?: string;
        containerType?: string;
        maxWeightValue?: string;
        maxWeightUnit?: string;
        maxVolumeValue?: string;
        maxVolumeUnit?: string;
      };
    },
  ) {
    const trimmedKey = (inventoryKey || '').trim();
    const trimmedCustodian = (custodianAddress || '').trim();

    if (!trimmedKey || !trimmedCustodian) {
      return { success: false, message: 'inventoryKey and custodian account are required.' };
    }

    const existing = await (this.prisma as any).container.findUnique({
      where: { inventoryKey: trimmedKey },
      select: {
        inventoryKey: true,
        lotReference: true,
        registeringCustodianAddress: true,
        custodyRoster: true,
        tradeTitle: true,
        status: true,
        warehouseId: true,
      },
    });

    if (!existing) {
      return { success: false, message: 'Agri traceability lot not found.' };
    }

    if (
      (data.requesterRole || '').trim() === 'ENTERPRISE' &&
      existing.status === 'OUTBOUND_DISPATCH'
    ) {
      return {
        success: false,
        message:
          'This lot was dispatched from warehouse; the producer account may no longer update its passport.',
      };
    }

    const roster = String(existing.custodyRoster || '')
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);

    const rosterNorm = roster.map(normAddr);
    const isOwner =
      normAddr(existing.registeringCustodianAddress) === normAddr(trimmedCustodian) ||
      rosterNorm.includes(normAddr(trimmedCustodian));

    const isRegisteringProducer =
      normAddr(existing.registeringCustodianAddress) === normAddr(trimmedCustodian);

    const recordOutboundDispatch = data.recordOutboundDispatch === true;
    const roleUpper = (data.requesterRole || '').trim().toUpperCase();

    let warehouseSiteMatches = false;
    if (recordOutboundDispatch && existing.warehouseId) {
      const wh = await this.prisma.warehouse.findUnique({
        where: { id: existing.warehouseId },
        select: { siteCustodianAddress: true },
      });
      warehouseSiteMatches =
        !!wh && normAddr(wh.siteCustodianAddress || '') === normAddr(trimmedCustodian);
    }

    if (recordOutboundDispatch) {
      const pending = await (this.prisma as any).recordOperation.findFirst({
        where: {
          entityType: 'PRODUCT',
          entityKey: trimmedKey,
          verified: false,
        },
        select: { id: true },
      });
      if (pending) {
        return {
          success: false,
          message: 'Public record check is still pending. Please wait for verification before dispatch.',
        };
      }
      const ref = (data.confirmationRef || '').trim();
      if (!ref) {
        return {
          success: false,
          message:
            'A chain confirmation reference is required to record outbound warehouse dispatch.',
        };
      }
      let dispatchAuthorized = isRegisteringProducer;
      if (
        !dispatchAuthorized &&
        (roleUpper === 'AGENT' || roleUpper === 'TRANSIT') &&
        warehouseSiteMatches
      ) {
        dispatchAuthorized = true;
      }
      if (!dispatchAuthorized) {
        return {
          success: false,
          message:
            'This wallet is not authorized to record outbound dispatch for this lot.',
        };
      }
      if (existing.status === 'CONSUMED') {
        return {
          success: false,
          message: 'This lot is already marked fully consumed.',
        };
      }
      if (existing.status === 'OUTBOUND_DISPATCH') {
        return {
          success: false,
          message: 'This lot was already recorded as dispatched from warehouse.',
        };
      }
      if (!existing.warehouseId) {
        return {
          success: false,
          message: 'This lot is not assigned to a warehouse.',
        };
      }
      const widRaw = data.warehouseId;
      if (widRaw !== undefined && widRaw !== null && String(widRaw).trim()) {
        return {
          success: false,
          message: 'Inbound warehouse placement cannot be combined with outbound dispatch.',
        };
      }
    } else if (!isOwner) {
      return {
        success: false,
        message: 'This wallet is not authorized for this chain-of-custody action.',
      };
    }

    const updateData: Record<string, unknown> = {
      confirmationRef: data.confirmationRef,
    };

    if (data.custodyParties) {
      updateData.custodyRoster = data.custodyParties.join('\n');
    }

    if (data.passport) {
      const p = data.passport;
      if (typeof p.name !== 'undefined') {
        const next = String(p.name ?? '').trim();
        const cur = String((existing as any).tradeTitle ?? '').trim();
        if (next && cur && next !== cur) {
          return { success: false, message: 'Product name cannot be changed after creation.' };
        }
        updateData.tradeTitle = next;
      }
      if (typeof p.description !== 'undefined') updateData.lotStory = p.description;
      if (typeof p.roadmap !== 'undefined') updateData.roadmap = p.roadmap;
      if (typeof p.location !== 'undefined') updateData.location = p.location;
      if (typeof (p as any).image !== 'undefined') {
        const ipfs = (String((p as any).image ?? '') || '').trim();
        if (ipfs) {
          await this.attachEntityMedia({
            entityType: 'CONTAINER',
            entityKey: trimmedKey,
            role: 'PRODUCT_IMAGE',
            ipfsUri: ipfs,
            createdByAddress: trimmedCustodian,
          });
        }
      }
      if (typeof (p as any).dispatchImage !== 'undefined') {
        const ipfs = (String((p as any).dispatchImage ?? '') || '').trim();
        if (ipfs) {
          await this.attachEntityMedia({
            entityType: 'CONTAINER',
            entityKey: trimmedKey,
            role: 'PRODUCT_DISPATCH_IMAGE',
            ipfsUri: ipfs,
            createdByAddress: trimmedCustodian,
          });
        }
      }
      if (typeof (p as any).checkinImage !== 'undefined') {
        const ipfs = (String((p as any).checkinImage ?? '') || '').trim();
        if (ipfs) {
          await this.attachEntityMedia({
            entityType: 'CONTAINER',
            entityKey: trimmedKey,
            role: 'PRODUCT_CHECKIN_IMAGE',
            ipfsUri: ipfs,
            createdByAddress: trimmedCustodian,
          });
        }
      }
      if (typeof p.containerType !== 'undefined')
        updateData.containerType = (p.containerType || '').trim() || null;
      if (typeof p.maxWeightValue !== 'undefined')
        updateData.maxWeightValue = (p.maxWeightValue || '').trim() || null;
      if (typeof p.maxWeightUnit !== 'undefined')
        updateData.maxWeightUnit = (p.maxWeightUnit || '').trim() || null;
      if (typeof p.maxVolumeValue !== 'undefined')
        updateData.maxVolumeValue = (p.maxVolumeValue || '').trim() || null;
      if (typeof p.maxVolumeUnit !== 'undefined')
        updateData.maxVolumeUnit = (p.maxVolumeUnit || '').trim() || null;
    }

    let pendingOpType: 'DISPATCH' | 'CHECKIN' | null = null;
    let pendingPayload: any = null;
    if (recordOutboundDispatch) {
      // Like Plans: only apply warehouse/status after record-operation verification.
      pendingOpType = 'DISPATCH';
      pendingPayload = {
        status: 'OUTBOUND_DISPATCH',
        warehouseId: null,
        dispatchImage: (data.passport as any)?.dispatchImage,
      };
    }

    const widRaw = data.warehouseId;
    if (
      !recordOutboundDispatch &&
      widRaw !== undefined &&
      widRaw !== null &&
      String(widRaw).trim()
    ) {
      const wid = String(widRaw).trim();
      const role = (data.requesterRole || '').trim().toUpperCase();
      const canAssignInboundAsEnterprise = role === 'ENTERPRISE' && isRegisteringProducer;
      if (role !== 'AGENT' && role !== 'TRANSIT' && !canAssignInboundAsEnterprise) {
        return {
          success: false,
          message: 'Only field logistics or transit roles may assign inbound warehouse placement.',
        };
      }
      if (
        ![
          'INITIAL',
          'UPDATED',
          'INBOUND_CHECKIN',
          'OUTBOUND_DISPATCH',
        ].includes(String(existing.status || '').trim().toUpperCase())
      ) {
        return {
          success: false,
          message:
            'Inbound warehouse placement is only allowed for lots awaiting inbound or already checked-in.',
        };
      }
      if (existing.warehouseId && existing.warehouseId !== wid) {
        return {
          success: false,
          message: 'This lot is already assigned to another warehouse.',
        };
      }
      if (!existing.warehouseId) {
        const whWhere: any = canAssignInboundAsEnterprise
          ? { id: wid, isActive: true }
          : { id: wid, siteCustodianAddress: trimmedCustodian, isActive: true };
        const wh = await this.prisma.warehouse.findFirst({
          where: whWhere,
          select: { id: true, maxProducts: true },
        });
        if (!wh) {
          return {
            success: false,
            message: 'Storage warehouse not found or not permitted.',
          };
        }
        if (typeof wh.maxProducts === 'number' && wh.maxProducts > 0) {
          const count = await (this.prisma as any).container.count({
            where: { warehouseId: wh.id },
          });
          if (count >= wh.maxProducts) {
            return {
              success: false,
              message:
                'This warehouse has reached its inbound agri-lot capacity limit.',
            };
          }
        }
        // Like Plans: only apply inbound placement after record-operation verification.
        pendingOpType = 'CHECKIN';
        pendingPayload = {
          status: 'INBOUND_CHECKIN',
          warehouseId: wid,
          checkinImage: (data.passport as any)?.checkinImage,
        };
      }
    }

    await (this.prisma as any).container.update({
      where: { inventoryKey: trimmedKey },
      data: updateData,
    });

    const txHash = String(data.confirmationRef || '').trim();
    if (txHash) {
      try {
        const opType = pendingOpType || 'UPDATE';
        const payload =
          pendingOpType && pendingPayload
            ? {
                ...pendingPayload,
                lotReference: (existing as any).lotReference ?? null,
              }
            : {
                warehouseId: data.warehouseId ?? null,
                lotReference: (existing as any).lotReference ?? null,
              };
        const op = await (this.prisma as any).recordOperation.create({
          data: {
            entityType: 'CONTAINER',
            entityKey: trimmedKey,
            containerInventoryKey: trimmedKey,
            opType,
            txHash,
            verified: false,
            verifiedAt: null,
            payload,
          } as any,
        });

        if (opType === 'DISPATCH') {
          const ipfs = String((payload as any)?.dispatchImage || '').trim();
          if (ipfs) {
            await this.attachEntityMedia({
              entityType: 'CONTAINER',
              entityKey: trimmedKey,
              role: 'PRODUCT_DISPATCH_IMAGE',
              ipfsUri: ipfs,
              createdByAddress: trimmedCustodian,
            });
          }
        }
        if (opType === 'CHECKIN') {
          const ipfs = String((payload as any)?.checkinImage || '').trim();
          if (ipfs) {
            await this.attachEntityMedia({
              entityType: 'CONTAINER',
              entityKey: trimmedKey,
              role: 'PRODUCT_CHECKIN_IMAGE',
              ipfsUri: ipfs,
              createdByAddress: trimmedCustodian,
            });
          }
        }
      } catch {
        // ignore
      }
    }

    return {
      success: true,
      unit: trimmedKey,
      confirmationRef: data.confirmationRef,
    };
  }

  async updateLocationByUnit(params: {
    unit: string;
    walletAddress: string;
    location: string;
    confirmationRef: string;
    requesterRole?: string;
  }) {
    const inventoryKey = (params.unit || '').trim();
    const walletAddress = (params.walletAddress || '').trim();
    const location = (params.location || '').trim();
    const confirmationRef = (params.confirmationRef || '').trim();

    if (!inventoryKey || !walletAddress || !location || !confirmationRef) {
      return {
        success: false,
        message: 'inventoryKey, custodian, location, and confirmation reference are required.',
      };
    }

    const product = await (this.prisma as any).container.findUnique({
      where: { inventoryKey },
      select: {
        inventoryKey: true,
        custodyRoster: true,
        traceSchemeRef: true,
        lotReference: true,
        status: true,
      },
    });
    if (!product) {
      return { success: false, message: 'Agri traceability lot not found.' };
    }

    if (
      (params.requesterRole || '').trim() === 'ENTERPRISE' &&
      String(product.status) === 'OUTBOUND_DISPATCH'
    ) {
      return {
        success: false,
        message:
          'This lot was dispatched from warehouse; the producer account may no longer update checkpoint data.',
      };
    }

    const roster = String(product.custodyRoster || '')
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);

    if (!roster.map(normAddr).includes(normAddr(walletAddress))) {
      return {
        success: false,
        message: 'This wallet is not authorized for this chain-of-custody action.',
      };
    }

    try {
      const lotReference = String(product.lotReference || '').trim();
      if (!lotReference) {
        return { success: false, message: 'Agri traceability lot reference is missing.' };
      }

      const apiKey = (process.env.BLOCKFROST_API_KEY || '').trim();
      if (!apiKey) throw new Error('BLOCKFROST_API_KEY is not set');

      const plutusHelper = new PlutusHelper();
      const { policyId } = plutusHelper.getScripts(roster);
      const movementCredentialUnit = policyId + CIP68_222(stringToHex(lotReference));

      const blockfrostProvider = new BlockfrostProvider(apiKey);
      const utxos: any[] = await (blockfrostProvider as any).fetchAddressUTxOs(
        walletAddress,
        movementCredentialUnit,
      );

      const hasToken = Array.isArray(utxos)
        ? utxos.some((u) => {
            const amt = u?.output?.amount?.find((a: any) => a.unit === movementCredentialUnit);
            const q = amt?.quantity ?? '0';
            try {
              return BigInt(String(q)) > 0n;
            } catch {
              return false;
            }
          })
        : false;

      if (!hasToken) {
        return {
          success: false,
          message: 'This custodian is not carrying the movement credential for this lot.',
        };
      }
    } catch {
      return {
        success: false,
        message: 'This custodian is not carrying the movement credential for this lot.',
      };
    }

    await (this.prisma as any).container.update({
      where: { inventoryKey },
      data: { location, confirmationRef },
    });

    return { success: true, unit: inventoryKey, location };
  }

  async deleteByUnit(
    inventoryKey: string,
    custodianAddress: string,
    options?: { requesterRole?: string },
  ) {
    const trimmedKey = (inventoryKey || '').trim();
    const trimmedCustodian = (custodianAddress || '').trim();

    if (!trimmedKey || !trimmedCustodian) {
      return { success: false, message: 'inventoryKey and custodian account are required.' };
    }

    const existing = await (this.prisma as any).container.findUnique({
      where: { inventoryKey: trimmedKey },
      select: {
        inventoryKey: true,
        registeringCustodianAddress: true,
        custodyRoster: true,
        status: true,
      },
    });

    if (!existing) {
      return { success: false, message: 'Agri traceability lot not found.' };
    }

    if (
      (options?.requesterRole || '').trim() === 'ENTERPRISE' &&
      String(existing.status) === 'OUTBOUND_DISPATCH'
    ) {
      return {
        success: false,
        message:
          'This lot was dispatched from warehouse; the producer account may no longer retire (burn) it from here.',
      };
    }

    const roster = String(existing.custodyRoster || '')
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);

    const rosterNorm = roster.map(normAddr);
    const isOwner =
      normAddr(existing.registeringCustodianAddress) === normAddr(trimmedCustodian) ||
      rosterNorm.includes(normAddr(trimmedCustodian));

    if (!isOwner) {
      return {
        success: false,
        message: 'This wallet is not authorized for this chain-of-custody action.',
      };
    }

    await (this.prisma as any).container.delete({
      where: { inventoryKey: trimmedKey },
    });

    return { success: true, unit: trimmedKey };
  }

  async clearWarehouseByUnit(
    inventoryKey: string,
    sessionCustodianAddress: string,
    options?: {
      status?: 'INBOUND_CHECKIN' | 'CONSUMED' | 'OUTBOUND_DISPATCH';
      confirmationRef?: string;
      consumeImage?: string;
      requesterRole?: string;
    },
  ) {
    const existing = await (this.prisma as any).container.findUnique({
      where: { inventoryKey },
      select: {
        inventoryKey: true,
        registeringCustodianAddress: true,
        warehouseId: true,
        status: true,
      },
    });
    if (!existing) {
      return { success: false, message: 'Agri traceability lot not found.' };
    }

    const sessionNorm = normAddr(sessionCustodianAddress);
    const isRegisteringProducer =
      normAddr(existing.registeringCustodianAddress) === sessionNorm;

    let warehouseSiteMatches = false;
    if (existing.warehouseId) {
      const wh = await this.prisma.warehouse.findUnique({
        where: { id: existing.warehouseId },
        select: { siteCustodianAddress: true },
      });
      warehouseSiteMatches =
        !!wh && normAddr(wh.siteCustodianAddress || '') === sessionNorm;
    }

    const roleUpper = (options?.requesterRole || '').trim().toUpperCase();
    let authorized = isRegisteringProducer;
    if (!authorized && options?.status === 'OUTBOUND_DISPATCH') {
      if (
        (roleUpper === 'AGENT' || roleUpper === 'TRANSIT') &&
        warehouseSiteMatches
      ) {
        authorized = true;
      }
    }
    if (!authorized && options?.status === 'CONSUMED') {
      if (
        (roleUpper === 'AGENT' || roleUpper === 'TRANSIT') &&
        warehouseSiteMatches
      ) {
        authorized = true;
      }
    }
    if (!authorized) {
      return { success: false, message: 'Agri traceability lot not found.' };
    }

    if (options?.status === 'CONSUMED') {
      if (existing.status === 'CONSUMED') {
        return {
          success: false,
          message: 'This lot is already marked fully consumed.',
        };
      }
      if (String(existing.status) === 'OUTBOUND_DISPATCH') {
        return {
          success: false,
          message:
            'This lot was already recorded as dispatched from warehouse; consumption is not allowed.',
        };
      }
      if (!existing.warehouseId) {
        return {
          success: false,
          message: 'This lot is not assigned to a warehouse.',
        };
      }
    }

    if (options?.status === 'OUTBOUND_DISPATCH') {
      if (existing.status === 'CONSUMED') {
        return {
          success: false,
          message: 'This lot is already marked fully consumed.',
        };
      }
      if (String(existing.status) === 'OUTBOUND_DISPATCH') {
        return {
          success: false,
          message: 'This lot was already recorded as dispatched from warehouse.',
        };
      }
      if (!existing.warehouseId) {
        return {
          success: false,
          message: 'This lot is not assigned to a warehouse.',
        };
      }
    }

    // Like Plans: apply consume (status/warehouse) only after verification.
    const updateData: Record<string, unknown> = {};
    if (typeof options?.confirmationRef === 'string' && options.confirmationRef.trim()) {
      updateData.confirmationRef = options.confirmationRef.trim();
    }
    await (this.prisma as any).container.update({ where: { inventoryKey }, data: updateData });

    const txHash = String(options?.confirmationRef || '').trim();
    if (txHash && options?.status === 'CONSUMED') {
      try {
        const op = await (this.prisma as any).recordOperation.create({
          data: {
            entityType: 'CONTAINER',
            entityKey: inventoryKey,
            containerInventoryKey: inventoryKey,
            opType: 'CONSUME',
            txHash,
            verified: false,
            verifiedAt: null,
            payload: {
              status: 'CONSUMED',
              warehouseId: null,
              consumeImage: String(options?.consumeImage || '').trim() || null,
              previousWarehouseId: existing.warehouseId ?? null,
            },
          } as any,
        });

        const ipfs = String(options?.consumeImage || '').trim();
        if (ipfs) {
          await this.attachEntityMedia({
            entityType: 'CONTAINER',
            entityKey: inventoryKey,
            role: 'PRODUCT_CONSUME_IMAGE',
            ipfsUri: ipfs,
            createdByAddress: String(sessionCustodianAddress || '').trim(),
          });
        }
      } catch {
        // ignore
      }
    }

    return { success: true, unit: inventoryKey, previousWarehouseId: existing.warehouseId ?? null };
  }
}
