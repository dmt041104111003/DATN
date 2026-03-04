import { Injectable, NotFoundException } from "@nestjs/common";
import { DeliveryStatus } from "@prisma/client";
import { ConfigService } from "../../../core/config/config.service";
import { CardanoService } from "../../../core/cardano/cardano.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { OrderService } from "../../../order/order.service";
import { buildRef100Unit } from "../../../shared/common/utils";
import {
  buildDisplay,
  buildNft222Unit,
  decodeHexToUtf8,
  parseCoordinates,
  parseOneCoordinate,
} from "../../utils";
import type { TraceResponse } from "../../domain/trace.types";

@Injectable()
export class TraceAssetUseCase {
  constructor(
    private readonly config: ConfigService,
    private readonly cardano: CardanoService,
    private readonly prisma: PrismaService,
    private readonly order: OrderService
  ) {}

  async execute(policyId: string, assetName: string): Promise<TraceResponse> {
    const policyIdTrimmed = policyId.trim();
    const assetNameTrimmed = assetName.trim();

    const ref100Unit = buildRef100Unit(
      policyIdTrimmed,
      assetNameTrimmed,
      this.config.cip68Prefix,
    );
    let ref100Quantity = "0";
    try {
      const ref100Asset = (await this.cardano.blockfrostFetcher.fetchSpecificAsset(
        ref100Unit
      )) as {
        quantity?: string;
      };
      ref100Quantity = ref100Asset?.quantity ?? "0";
    } catch {
      throw new NotFoundException(
        "Asset not found on chain for this policyId and assetName.",
      );
    }

    if (ref100Quantity === "0") {
      throw new NotFoundException(
        "Asset has been revoked (Ref100 burned) on chain.",
      );
    }

    const prefix222 = this.config.cip68Prefix.USER_222;
    const nft222Unit = buildNft222Unit(
      policyIdTrimmed,
      assetNameTrimmed,
      prefix222
    );
    let nft222Quantity = "0";
    try {
      const nft222Asset = (await this.cardano.blockfrostFetcher.fetchSpecificAsset(
        nft222Unit
      )) as { quantity?: string };
      nft222Quantity = nft222Asset?.quantity ?? "0";
    } catch {
      nft222Quantity = "0";
    }

    const batch = await this.prisma.productBatch.findFirst({
      where: {
        batchId: assetNameTrimmed,
        ...(policyIdTrimmed ? { policyId: policyIdTrimmed } : {}),
      },
      include: {
        minterProfile: true,
        roadmaps: { orderBy: { stepIndex: "asc" } },
        certificates: {
          include: {
            issuerProfile: true,
          },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException(
        "Asset not found for this policy and asset name.",
      );
    }

    const standard = batch.standard ?? "Traceability-v1";

    const metadata: Record<string, unknown> = {
      name: batch.name,
      description: batch.description,
      image: batch.image,
      standard,
      policy_id: batch.policyId ?? undefined,
    };
    const properties: Record<string, unknown> = {};
    if (batch.expiryDate) {
      properties.ngayHetHan =
        batch.expiryDate instanceof Date
          ? batch.expiryDate.toISOString()
          : String(batch.expiryDate);
    }

    const burnStatus: "active" | "burned" =
      nft222Quantity === "0" ? "burned" : "active";

    const coreCertificates =
      (batch.certificates ?? []).map((c: any) => ({
        id: c.id as number,
        title: c.title as string,
        number: (c.number as string) ?? null,
        authority: (c.authority as string) ?? null,
        expiryDate: c.expiryDate
          ? (c.expiryDate instanceof Date
              ? c.expiryDate.toISOString()
              : new Date(c.expiryDate as any).toISOString())
          : null,
        documentUrl: (c.documentUrl as string) ?? null,
        issuerName:
          (c.issuerProfile?.displayName as string | undefined) ?? null,
      })) ?? [];

    const core = {
      policyId: policyIdTrimmed,
      assetName: assetNameTrimmed,
      standard,
      referenceUtxo:
        (batch.referenceUtxo as string | null | undefined) ?? null,
      batch: {
        name: batch.name as string,
        description: (batch.description as string | null) ?? null,
        image: (batch.image as string | null) ?? null,
        originSiteCode: (batch.originSiteCode as string | null) ?? null,
        minterName:
          (batch.minterProfile?.displayName as string | undefined) ?? null,
        minterLocation:
          (batch.minterProfile?.location as string | undefined) ?? null,
      },
      certificates: coreCertificates,
    };

    let cert:
      | {
          id: number;
          title: string;
          imageUrl: string | null;
          issuedAt: Date | string;
          batchId: string;
        }
      | undefined;

    // Chỉ dùng certificate cấp cho doanh nghiệp (Profile), không dùng cert theo từng lô
    if (batch.minterProfileId) {
      const enterpriseCert = await this.prisma.certificate.findFirst({
        where: { subjectProfileId: batch.minterProfileId },
        orderBy: [
          { expiryDate: "desc" },
          { issuedAt: "desc" },
        ],
      });
      if (enterpriseCert) {
        cert = {
          id: enterpriseCert.id,
          title: enterpriseCert.title,
          imageUrl: enterpriseCert.imageUrl ?? null,
          issuedAt: enterpriseCert.issuedAt,
            batchId: batch.batchId,
        };
      }
    }
    let certificateUrl: string | null = null;
    let certificate: TraceResponse["certificate"] | undefined;
    if (cert) {
      certificateUrl =
        typeof cert.imageUrl === "string" ? cert.imageUrl : null;
      certificate = {
        id: cert.id,
        title: cert.title,
        imageUrl: certificateUrl,
        issuedAt: (
          cert.issuedAt instanceof Date
            ? cert.issuedAt
            : new Date(cert.issuedAt)
        ).toISOString(),
        batchId: cert.batchId,
      };
    }

    const roadmaps = batch.roadmaps ?? [];
    const rawReceiverLocations = (metadata.receiver_locations as string) ?? "";
    const rawMinterLocation = (metadata.minter_location as string) ?? "";
    const decodedReceiverLocationsStr =
      decodeHexToUtf8(rawReceiverLocations) || rawReceiverLocations;
    const decodedMinterLocation =
      decodeHexToUtf8(rawMinterLocation) ||
      rawMinterLocation ||
      "Origin";
    const receiverLocationsArr = decodedReceiverLocationsStr
      .split(";")
      .map((s: string) => s.trim())
      .filter(Boolean);

    const checkpointsPassed = roadmaps.map((r, i) => ({
      step: r.stepIndex + 1,
      label:
        receiverLocationsArr[i] ??
        (r.action || `Step ${r.stepIndex + 1}`),
      txHash: r.txHash ?? undefined,
      completed: !!r.txHash,
    }));
    const transportFlowComplete =
      roadmaps.length > 0 &&
      checkpointsPassed.every((c) => c.completed);
    const missingCheckpoints: string[] = checkpointsPassed
      .filter((c) => !c.completed)
      .map((c) => c.label);

    let lifecycleCompleted = false;
    if (
      transportFlowComplete &&
      roadmaps.length > 0 &&
      nft222Quantity === "0"
    ) {
      const lastHop = roadmaps[roadmaps.length - 1];
      const lastReceiverAddress = lastHop?.toAddress?.trim();
      if (lastReceiverAddress) {
        const lastProfile = await this.prisma.profile.findUnique({
          where: { walletAddress: lastReceiverAddress },
          select: { id: true },
        });
        if (lastProfile) {
          const warehouseRow =
            await this.prisma.warehouseInventory.findFirst({
              where: {
                batchId: batch.batchId,
                profileId: lastProfile.id,
              },
              select: { status: true, consumedAt: true },
            });
          lifecycleCompleted = warehouseRow?.status === "CONSUMED";
        }
      }
    }

    const receiverCoords = (metadata.receiver_coordinates as string) ?? "";
    const minterCoords = (metadata.minter_coordinates as string) ?? "";
    const receiverLocations = receiverLocationsArr;
    const minterLocation = decodedMinterLocation;

    const minterCoordFromDb = batch.minterProfile?.coordinates
      ? parseOneCoordinate(batch.minterProfile.coordinates)
      : null;
    const originPointsFromMetadata = parseCoordinates(minterCoords);
    const originPoint =
      minterCoordFromDb ??
      (originPointsFromMetadata.length > 0
        ? originPointsFromMetadata[0]
        : null);

    const receiverAddressesRaw = roadmaps.map((r) =>
      (r.toAddress ?? "").trim(),
    );
    const receiverProfiles =
      receiverAddressesRaw.length > 0
        ? await this.prisma.profile.findMany({
            where: {
              walletAddress: {
                in: receiverAddressesRaw.filter(Boolean),
              },
            },
            select: {
              walletAddress: true,
              coordinates: true,
              displayName: true,
            },
          })
        : [];
    const profileByWallet = new Map(
      receiverProfiles.map((p) => [
        p.walletAddress.trim().toLowerCase(),
        p,
      ]),
    );
    const receiverPointsFromMetadata = parseCoordinates(receiverCoords);

    const receiverPoints: Array<{ lat: number; lng: number } | null> =
      [];
    for (let i = 0; i < roadmaps.length; i++) {
      const addr = (roadmaps[i].toAddress ?? "")
        .trim()
        .toLowerCase();
      const profile = addr ? profileByWallet.get(addr) : null;
      const fromDb = profile?.coordinates
        ? parseOneCoordinate(profile.coordinates)
        : null;
      const fromMeta = receiverPointsFromMetadata[i];
      const point = fromDb ?? fromMeta ?? null;
      receiverPoints.push(point);
    }

    const minterWalletLower = (
      batch.minterProfile?.walletAddress ?? ""
    )
      .trim()
      .toLowerCase();

    type CurrentLocation = {
      address: string;
      label: string;
      lat: number | null;
      lng: number | null;
      locationType?: "minter" | "receiver" | "script" | "outside";
      unverified?: boolean;
    };

    let currentLocation: CurrentLocation | undefined;
    let holderLower: string | null = null;
    let holderReceiverIndex = -1;
    let holderLocationType:
      | "minter"
      | "receiver"
      | "script"
      | "outside"
      | undefined;

    if (burnStatus === "active") {
      try {
        const holders =
          await this.cardano.blockfrostFetcher.fetchAssetAddresses(
            nft222Unit,
          );
        const holderAddress =
          holders.length > 0 ? holders[0].address?.trim() : null;
        if (holderAddress) {
          holderLower = holderAddress.toLowerCase();
          const roadmapList = batch.roadmaps ?? [];
          let scriptAddress: string | null = null;
          try {
            scriptAddress =
              this.order.getScriptAddress()?.trim().toLowerCase() ??
              null;
          } catch {
            scriptAddress = null;
          }

          let label: string;
          let lat: number | null = null;
          let lng: number | null = null;
          let locationType: "minter" | "receiver" | "script" | "outside" =
            "outside";

          if (scriptAddress && holderLower === scriptAddress) {
            label = "In transit (locked)";
            locationType = "script";
          } else if (
            minterWalletLower &&
            holderLower === minterWalletLower
          ) {
            label =
              batch.minterProfile?.displayName ??
              minterLocation ??
              "Origin";
            locationType = "minter";
            if (originPoint) {
              lat = originPoint.lat;
              lng = originPoint.lng;
            }
          } else {
            const idx = roadmapList.findIndex(
              (r) =>
                (r.toAddress ?? "")
                  .trim()
                  .toLowerCase() === holderLower,
            );
            if (idx >= 0) {
              holderReceiverIndex = idx;
              locationType = "receiver";
              const receiverProfile =
                await this.prisma.profile.findFirst({
                  where: {
                    walletAddress: {
                      equals: holderAddress,
                      mode: "insensitive",
                    },
                  },
                  select: {
                    coordinates: true,
                    location: true,
                    displayName: true,
                  },
                });
              label =
                receiverProfile?.displayName ??
                receiverLocationsArr[idx] ??
                roadmapList[idx].action ??
                `Stop ${idx + 1}`;
              const fromDb = receiverProfile?.coordinates
                ? parseOneCoordinate(receiverProfile.coordinates)
                : null;
              const coord = fromDb ?? receiverPoints[idx];
              if (coord) {
                lat = coord.lat;
                lng = coord.lng;
              }
            } else {
              label = "Outside supply chain";
            }
          }

          holderLocationType = locationType;
          currentLocation = {
            address: holderAddress,
            label,
            lat,
            lng,
            locationType,
          };
        }
      } catch {
        // ignore cardano error when resolving holder
      }
    }

    type MapPoint = {
      lat: number;
      lng: number;
      label: string;
      status: "completed" | "pending";
      pointType: "origin" | "receiver" | "script" | "outside";
    };

    type HopInfo = {
      address: string;
      label: string;
      point: { lat: number; lng: number } | null;
      isOrigin: boolean;
    };

    const hopInfos: HopInfo[] = [];
    const roadmapToHopIndex: number[] = new Array(roadmaps.length).fill(
      -1,
    );

    if (minterWalletLower) {
      hopInfos.push({
        address: minterWalletLower,
        label: batch.minterProfile?.displayName ?? minterLocation,
        point: originPoint,
        isOrigin: true,
      });
    }

    for (let i = 0; i < roadmaps.length; i++) {
      const addrRaw = (roadmaps[i].toAddress ?? "").trim();
      if (!addrRaw) {
        roadmapToHopIndex[i] = -1;
        continue;
      }
      const addrLower = addrRaw.toLowerCase();
      const profile = profileByWallet.get(addrLower) as {
        displayName?: string;
      } | undefined;
      const point = receiverPoints[i];
      const label =
        profile?.displayName ??
        receiverLocations[i] ??
        checkpointsPassed[i]?.label ??
        roadmaps[i].action ??
        `Stop ${i + 1}`;
      const hopIndex = hopInfos.length;
      hopInfos.push({
        address: addrLower,
        label,
        point: point ?? null,
        isOrigin: false,
      });
      roadmapToHopIndex[i] = hopIndex;
    }

    const deliveries = await this.prisma.deliveryOrder.findMany({
      where: { batchId: batch.batchId },
      orderBy: { createdAt: "asc" },
    });

    const executedPairs = new Set<string>();
    const deliveryByPair = new Map<
      string,
      {
        id: number;
        status: DeliveryStatus;
        senderAddress: string | null;
        recipientAddress: string | null;
        createdAt: Date;
        actualPickupAt: Date | null;
        actualDeliveryAt: Date | null;
        partialSignedByAddress: string | null;
        secondSignedByAddress: string | null;
      }
    >();

    for (const d of deliveries) {
      if (
        d.status === DeliveryStatus.IN_TRANSIT ||
        d.status === DeliveryStatus.DELIVERED
      ) {
        const from = (d.senderAddress ?? "").trim().toLowerCase();
        const to = (d.recipientAddress ?? "").trim().toLowerCase();
        if (from && to) {
          executedPairs.add(`${from}->${to}`);
          deliveryByPair.set(`${from}->${to}`, {
            id: d.id,
            status: d.status,
            senderAddress: d.senderAddress,
            recipientAddress: d.recipientAddress,
            createdAt: d.createdAt,
            actualPickupAt: d.actualPickupAt ?? null,
            actualDeliveryAt: d.actualDeliveryAt ?? null,
            partialSignedByAddress: d.partialSignedByAddress ?? null,
            secondSignedByAddress: d.secondSignedByAddress ?? null,
          });
        }
      }
    }

    let holderVerifiedByDelivery = true;
    if (holderLower && hopInfos.length > 0) {
      const hopIndex = hopInfos.findIndex(
        (h) => h.address === holderLower,
      );
      if (hopIndex > 0) {
        const from = hopInfos[hopIndex - 1].address;
        const to = hopInfos[hopIndex].address;
        holderVerifiedByDelivery = executedPairs.has(`${from}->${to}`);
      } else if (
        hopIndex === -1 &&
        currentLocation &&
        currentLocation.locationType !== "script" &&
        currentLocation.locationType !== "minter"
      ) {
        holderVerifiedByDelivery = false;
      }
    }

    if (currentLocation) {
      const unverified =
        currentLocation.locationType === "outside" ||
        (holderLower != null && !holderVerifiedByDelivery);
      if (unverified) {
        currentLocation = { ...currentLocation, unverified: true };
      }
    }

    let finalMapData: MapPoint[] = [];

    if (hopInfos.length > 0) {
      finalMapData = hopInfos
        .filter((h) => h.point)
        .map((h, index, arr) => {
          let status: "completed" | "pending" = "completed";
          if (index > 0) {
            const from = arr[index - 1].address;
            const to = h.address;
            status = executedPairs.has(`${from}->${to}`)
              ? "completed"
              : "pending";
          }
          let label = h.label;
          if (
            currentLocation?.unverified &&
            holderLower &&
            h.address === holderLower
          ) {
            label = label
              ? `${label} - Unidentified NFT`
              : "Unidentified NFT";
          }
          return {
            lat: h.point!.lat,
            lng: h.point!.lng,
            label,
            status,
            pointType: h.isOrigin ? "origin" : "receiver",
          };
        });
    } else if (
      currentLocation &&
      currentLocation.lat != null &&
      currentLocation.lng != null
    ) {
      finalMapData = [
        {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          label: currentLocation.label,
          status: "completed",
          pointType:
            currentLocation.locationType === "minter"
              ? "origin"
              : "receiver",
        },
      ];
    }

    const routeSteps =
      roadmaps.length > 0
        ? await Promise.all(
            roadmaps.map(async (rm, index) => {
              const fromAddrLower =
                index === 0
                  ? minterWalletLower
                  : ((roadmaps[index - 1].toAddress ?? "")
                      .trim()
                      .toLowerCase() || null);
              const toAddrLower = (rm.toAddress ?? "").trim().toLowerCase() || null;

              const fromProfile = fromAddrLower
                ? profileByWallet.get(fromAddrLower) ?? null
                : null;
              const toProfile = toAddrLower
                ? profileByWallet.get(toAddrLower) ?? null
                : null;

              const pairKey =
                fromAddrLower && toAddrLower
                  ? `${fromAddrLower}->${toAddrLower}`
                  : "";
              const d = pairKey ? deliveryByPair.get(pairKey) : undefined;

              let actualDepartureAt: string | null = null;
              let txCreatedAt: string | null = null;
              let delayedDeclaration = false;
              if (d) {
                // dùng actualPickupAt như "thời điểm rời kho" (actualDepartureAt logic)
                if (d.actualPickupAt) {
                  actualDepartureAt = d.actualPickupAt.toISOString();
                }
                if (d.createdAt) {
                  txCreatedAt = d.createdAt.toISOString();
                }
                if (actualDepartureAt && txCreatedAt) {
                  const dep = new Date(actualDepartureAt).getTime();
                  const created = new Date(txCreatedAt).getTime();
                  const diffMs = Math.abs(dep - created);
                  const oneDayMs = 24 * 60 * 60 * 1000;
                  delayedDeclaration = diffMs > oneDayMs;
                }
              }

              return {
                stepIndex: rm.stepIndex,
                from: {
                  address: fromAddrLower,
                  name: (fromProfile as any)?.displayName ?? null,
                  location: (fromProfile as any)?.location ?? null,
                },
                to: {
                  address: toAddrLower,
                  name: (toProfile as any)?.displayName ?? null,
                  location: (toProfile as any)?.location ?? null,
                },
                carrierName: (rm.carrierName as string | null) ?? null,
                transportMode: (rm.transportMode as string | null) ?? null,
                txHash: (rm.txHash as string | null) ?? null,
                actualDepartureAt,
                txCreatedAt,
                delayedDeclaration,
              };
            }),
          )
        : [];

    // Build shipping evidence list
    const addrSet = new Set<string>();
    for (const d of deliveries) {
      if (d.senderAddress) {
        addrSet.add(d.senderAddress.trim().toLowerCase());
      }
      if (d.recipientAddress) {
        addrSet.add(d.recipientAddress.trim().toLowerCase());
      }
      if (d.partialSignedByAddress) {
        addrSet.add(d.partialSignedByAddress.trim().toLowerCase());
      }
      if (d.secondSignedByAddress) {
        addrSet.add(d.secondSignedByAddress.trim().toLowerCase());
      }
    }
    const extraProfiles =
      addrSet.size > 0
        ? await this.prisma.profile.findMany({
            where: {
              walletAddress: {
                in: Array.from(addrSet),
              },
            },
            select: {
              walletAddress: true,
              displayName: true,
            },
          })
        : [];
    for (const p of extraProfiles) {
      const key = p.walletAddress.trim().toLowerCase();
      if (!profileByWallet.has(key)) {
        profileByWallet.set(key, p as any);
      }
    }

    const shippingDeliveries = deliveries.map((d) => {
      const partialAddr = d.partialSignedByAddress
        ? d.partialSignedByAddress.trim().toLowerCase()
        : null;
      const secondAddr = d.secondSignedByAddress
        ? d.secondSignedByAddress.trim().toLowerCase()
        : null;
      const partialProfile = partialAddr
        ? (profileByWallet.get(partialAddr) as any)
        : null;
      const secondProfile = secondAddr
        ? (profileByWallet.get(secondAddr) as any)
        : null;
      return {
        id: d.id,
        status: d.status,
        lockedInScript: d.status === DeliveryStatus.IN_TRANSIT,
        partialSignedByAddress: d.partialSignedByAddress ?? null,
        partialSignedByName: partialProfile?.displayName ?? null,
        secondSignedByAddress: d.secondSignedByAddress ?? null,
        secondSignedByName: secondProfile?.displayName ?? null,
        actualPickupAt: d.actualPickupAt
          ? d.actualPickupAt.toISOString()
          : null,
        actualDeliveryAt: d.actualDeliveryAt
          ? d.actualDeliveryAt.toISOString()
          : null,
      };
    });

    // Inventory snapshot
    const inventories = await this.prisma.warehouseInventory.findMany({
      where: { batchId: batch.batchId },
      orderBy: { receivedAt: "desc" },
    });
    let inventoryInfo: {
      status: string | null;
      zone: string | null;
      aisle: string | null;
      rack: string | null;
      bin: string | null;
      burnTxHash: string | null;
      burned: boolean;
    } | null = null;
    if (inventories.length > 0) {
      const inv = inventories[0];
      inventoryInfo = {
        status: inv.status ?? null,
        zone: inv.zone ?? null,
        aisle: inv.aisle ?? null,
        rack: inv.rack ?? null,
        bin: inv.bin ?? null,
        burnTxHash: inv.burnTxHash ?? null,
        burned:
          inv.status === "CONSUMED" ||
          !!inv.burnTxHash ||
          burnStatus === "burned",
      };
    }

    return {
      metadata,
      properties,
      certificateUrl,
      certificate,
      lifecycle: {
        completed: lifecycleCompleted,
        checkpointsPassed,
        missingCheckpoints,
      },
      burnStatus,
      mapData: finalMapData.length > 0 ? finalMapData : undefined,
      currentLocation,
      display: buildDisplay(
        metadata,
        properties,
        decodedMinterLocation,
        receiverLocationsArr,
        batch.image ?? null,
      ),
      core,
      route: { steps: routeSteps },
      shipping: { deliveries: shippingDeliveries },
      inventory: inventoryInfo,
    };
  }
}

