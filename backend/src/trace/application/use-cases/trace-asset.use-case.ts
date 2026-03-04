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
      },
    });

    if (!batch) {
      throw new NotFoundException(
        "Asset not found for this policy and asset name.",
      );
    }

    const metadata: Record<string, unknown> = {
      name: batch.name,
      description: batch.description,
      image: batch.image,
      standard: batch.standard ?? "Traceability-v1",
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
            await this.prisma.warehouseInventory.findUnique({
              where: {
                batchId_profileId: {
                  batchId: batch.batchId,
                  profileId: lastProfile.id,
                },
              },
              select: { status: true },
            });
          lifecycleCompleted = warehouseRow?.status === "BURNED";
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
    for (const d of deliveries) {
      if (
        d.status === DeliveryStatus.IN_TRANSIT ||
        d.status === DeliveryStatus.DELIVERED
      ) {
        const from = (d.senderAddress ?? "").trim().toLowerCase();
        const to = (d.recipientAddress ?? "").trim().toLowerCase();
        if (from && to) {
          executedPairs.add(`${from}->${to}`);
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
    };
  }
}

