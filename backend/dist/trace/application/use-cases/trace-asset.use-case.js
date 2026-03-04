"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceAssetUseCase = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const config_service_1 = require("../../../core/config/config.service");
const cardano_service_1 = require("../../../core/cardano/cardano.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
const order_service_1 = require("../../../order/order.service");
const utils_1 = require("../../../shared/common/utils");
const utils_2 = require("../../utils");
let TraceAssetUseCase = class TraceAssetUseCase {
    constructor(config, cardano, prisma, order) {
        this.config = config;
        this.cardano = cardano;
        this.prisma = prisma;
        this.order = order;
    }
    async execute(policyId, assetName) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14;
        const policyIdTrimmed = policyId.trim();
        const assetNameTrimmed = assetName.trim();
        const ref100Unit = (0, utils_1.buildRef100Unit)(policyIdTrimmed, assetNameTrimmed, this.config.cip68Prefix);
        let ref100Quantity = "0";
        try {
            const ref100Asset = (await this.cardano.blockfrostFetcher.fetchSpecificAsset(ref100Unit));
            ref100Quantity = (_a = ref100Asset === null || ref100Asset === void 0 ? void 0 : ref100Asset.quantity) !== null && _a !== void 0 ? _a : "0";
        }
        catch (_15) {
            throw new common_1.NotFoundException("Asset not found on chain for this policyId and assetName.");
        }
        if (ref100Quantity === "0") {
            throw new common_1.NotFoundException("Asset has been revoked (Ref100 burned) on chain.");
        }
        const prefix222 = this.config.cip68Prefix.USER_222;
        const nft222Unit = (0, utils_2.buildNft222Unit)(policyIdTrimmed, assetNameTrimmed, prefix222);
        let nft222Quantity = "0";
        try {
            const nft222Asset = (await this.cardano.blockfrostFetcher.fetchSpecificAsset(nft222Unit));
            nft222Quantity = (_b = nft222Asset === null || nft222Asset === void 0 ? void 0 : nft222Asset.quantity) !== null && _b !== void 0 ? _b : "0";
        }
        catch (_16) {
            nft222Quantity = "0";
        }
        const batch = await this.prisma.productBatch.findFirst({
            where: Object.assign({ code: assetNameTrimmed }, (policyIdTrimmed ? { policyId: policyIdTrimmed } : {})),
            include: {
                minterProfile: true,
                roadmaps: { orderBy: { hopIndex: "asc" } },
            },
        });
        if (!batch) {
            throw new common_1.NotFoundException("Asset not found for this policy and asset name.");
        }
        const rawMetadata = (_c = batch.metadata) !== null && _c !== void 0 ? _c : {};
        const metadata = Object.assign(Object.assign({}, rawMetadata), { policy_id: (_d = batch.policyId) !== null && _d !== void 0 ? _d : rawMetadata["policy_id"], name: (_e = batch.name) !== null && _e !== void 0 ? _e : rawMetadata["name"] });
        const properties = (_f = batch.properties) !== null && _f !== void 0 ? _f : {};
        const burnStatus = nft222Quantity === "0" ? "burned" : "active";
        let cert;
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
                    imageUrl: (_g = enterpriseCert.imageUrl) !== null && _g !== void 0 ? _g : null,
                    issuedAt: enterpriseCert.issuedAt,
                    batchId: batch.code,
                };
            }
        }
        let certificateUrl = null;
        let certificate;
        if (cert) {
            certificateUrl =
                typeof cert.imageUrl === "string" ? cert.imageUrl : null;
            certificate = {
                id: cert.id,
                title: cert.title,
                imageUrl: certificateUrl,
                issuedAt: (cert.issuedAt instanceof Date
                    ? cert.issuedAt
                    : new Date(cert.issuedAt)).toISOString(),
                batchId: cert.batchId,
            };
        }
        const roadmaps = (_h = batch.roadmaps) !== null && _h !== void 0 ? _h : [];
        const rawReceiverLocations = (_j = metadata.receiver_locations) !== null && _j !== void 0 ? _j : "";
        const rawMinterLocation = (_k = metadata.minter_location) !== null && _k !== void 0 ? _k : "";
        const decodedReceiverLocationsStr = (0, utils_2.decodeHexToUtf8)(rawReceiverLocations) || rawReceiverLocations;
        const decodedMinterLocation = (0, utils_2.decodeHexToUtf8)(rawMinterLocation) ||
            rawMinterLocation ||
            "Origin";
        const receiverLocationsArr = decodedReceiverLocationsStr
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean);
        const checkpointsPassed = roadmaps.map((r, i) => {
            var _a, _b;
            return ({
                step: r.hopIndex + 1,
                label: (_a = receiverLocationsArr[i]) !== null && _a !== void 0 ? _a : (r.action || `Step ${r.hopIndex + 1}`),
                txHash: (_b = r.txHash) !== null && _b !== void 0 ? _b : undefined,
                completed: !!r.txHash,
            });
        });
        const transportFlowComplete = roadmaps.length > 0 &&
            checkpointsPassed.every((c) => c.completed);
        const missingCheckpoints = checkpointsPassed
            .filter((c) => !c.completed)
            .map((c) => c.label);
        let lifecycleCompleted = false;
        if (transportFlowComplete &&
            roadmaps.length > 0 &&
            nft222Quantity === "0") {
            const lastHop = roadmaps[roadmaps.length - 1];
            const lastReceiverAddress = (_l = lastHop === null || lastHop === void 0 ? void 0 : lastHop.receiverAddress) === null || _l === void 0 ? void 0 : _l.trim();
            if (lastReceiverAddress) {
                const lastProfile = await this.prisma.profile.findUnique({
                    where: { walletAddress: lastReceiverAddress },
                    select: { id: true },
                });
                if (lastProfile) {
                    const warehouseRow = await this.prisma.warehouseInventory.findUnique({
                        where: {
                            batchId_profileId: {
                                batchId: batch.code,
                                profileId: lastProfile.id,
                            },
                        },
                        select: { status: true },
                    });
                    lifecycleCompleted = (warehouseRow === null || warehouseRow === void 0 ? void 0 : warehouseRow.status) === "BURNED";
                }
            }
        }
        const receiverCoords = (_m = metadata.receiver_coordinates) !== null && _m !== void 0 ? _m : "";
        const minterCoords = (_o = metadata.minter_coordinates) !== null && _o !== void 0 ? _o : "";
        const receiverLocations = receiverLocationsArr;
        const minterLocation = decodedMinterLocation;
        const minterCoordFromDb = ((_p = batch.minterProfile) === null || _p === void 0 ? void 0 : _p.coordinates)
            ? (0, utils_2.parseOneCoordinate)(batch.minterProfile.coordinates)
            : null;
        const originPointsFromMetadata = (0, utils_2.parseCoordinates)(minterCoords);
        const originPoint = minterCoordFromDb !== null && minterCoordFromDb !== void 0 ? minterCoordFromDb : (originPointsFromMetadata.length > 0
            ? originPointsFromMetadata[0]
            : null);
        const receiverAddressesRaw = roadmaps.map((r) => { var _a; return ((_a = r.receiverAddress) !== null && _a !== void 0 ? _a : "").trim(); });
        const receiverProfiles = receiverAddressesRaw.length > 0
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
        const profileByWallet = new Map(receiverProfiles.map((p) => [
            p.walletAddress.trim().toLowerCase(),
            p,
        ]));
        const receiverPointsFromMetadata = (0, utils_2.parseCoordinates)(receiverCoords);
        const receiverPoints = [];
        for (let i = 0; i < roadmaps.length; i++) {
            const addr = ((_q = roadmaps[i].receiverAddress) !== null && _q !== void 0 ? _q : "")
                .trim()
                .toLowerCase();
            const profile = addr ? profileByWallet.get(addr) : null;
            const fromDb = (profile === null || profile === void 0 ? void 0 : profile.coordinates)
                ? (0, utils_2.parseOneCoordinate)(profile.coordinates)
                : null;
            const fromMeta = receiverPointsFromMetadata[i];
            const point = (_r = fromDb !== null && fromDb !== void 0 ? fromDb : fromMeta) !== null && _r !== void 0 ? _r : null;
            receiverPoints.push(point);
        }
        const minterWalletLower = ((_t = (_s = batch.minterProfile) === null || _s === void 0 ? void 0 : _s.walletAddress) !== null && _t !== void 0 ? _t : "")
            .trim()
            .toLowerCase();
        let currentLocation;
        let holderLower = null;
        let holderReceiverIndex = -1;
        let holderLocationType;
        if (burnStatus === "active") {
            try {
                const holders = await this.cardano.blockfrostFetcher.fetchAssetAddresses(nft222Unit);
                const holderAddress = holders.length > 0 ? (_u = holders[0].address) === null || _u === void 0 ? void 0 : _u.trim() : null;
                if (holderAddress) {
                    holderLower = holderAddress.toLowerCase();
                    const roadmapList = (_v = batch.roadmaps) !== null && _v !== void 0 ? _v : [];
                    let scriptAddress = null;
                    try {
                        scriptAddress =
                            (_x = (_w = this.order.getScriptAddress()) === null || _w === void 0 ? void 0 : _w.trim().toLowerCase()) !== null && _x !== void 0 ? _x : null;
                    }
                    catch (_17) {
                        scriptAddress = null;
                    }
                    let label;
                    let lat = null;
                    let lng = null;
                    let locationType = "outside";
                    if (scriptAddress && holderLower === scriptAddress) {
                        label = "In transit (locked)";
                        locationType = "script";
                    }
                    else if (minterWalletLower &&
                        holderLower === minterWalletLower) {
                        label =
                            (_0 = (_z = (_y = batch.minterProfile) === null || _y === void 0 ? void 0 : _y.displayName) !== null && _z !== void 0 ? _z : minterLocation) !== null && _0 !== void 0 ? _0 : "Origin";
                        locationType = "minter";
                        if (originPoint) {
                            lat = originPoint.lat;
                            lng = originPoint.lng;
                        }
                    }
                    else {
                        const idx = roadmapList.findIndex((r) => {
                            var _a;
                            return ((_a = r.receiverAddress) !== null && _a !== void 0 ? _a : "")
                                .trim()
                                .toLowerCase() === holderLower;
                        });
                        if (idx >= 0) {
                            holderReceiverIndex = idx;
                            locationType = "receiver";
                            const receiverProfile = await this.prisma.profile.findFirst({
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
                                (_3 = (_2 = (_1 = receiverProfile === null || receiverProfile === void 0 ? void 0 : receiverProfile.displayName) !== null && _1 !== void 0 ? _1 : receiverLocationsArr[idx]) !== null && _2 !== void 0 ? _2 : roadmapList[idx].action) !== null && _3 !== void 0 ? _3 : `Stop ${idx + 1}`;
                            const fromDb = (receiverProfile === null || receiverProfile === void 0 ? void 0 : receiverProfile.coordinates)
                                ? (0, utils_2.parseOneCoordinate)(receiverProfile.coordinates)
                                : null;
                            const coord = fromDb !== null && fromDb !== void 0 ? fromDb : receiverPoints[idx];
                            if (coord) {
                                lat = coord.lat;
                                lng = coord.lng;
                            }
                        }
                        else {
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
            }
            catch (_18) {
            }
        }
        const hopInfos = [];
        const roadmapToHopIndex = new Array(roadmaps.length).fill(-1);
        if (minterWalletLower) {
            hopInfos.push({
                address: minterWalletLower,
                label: (_5 = (_4 = batch.minterProfile) === null || _4 === void 0 ? void 0 : _4.displayName) !== null && _5 !== void 0 ? _5 : minterLocation,
                point: originPoint,
                isOrigin: true,
            });
        }
        for (let i = 0; i < roadmaps.length; i++) {
            const addrRaw = ((_6 = roadmaps[i].receiverAddress) !== null && _6 !== void 0 ? _6 : "").trim();
            if (!addrRaw) {
                roadmapToHopIndex[i] = -1;
                continue;
            }
            const addrLower = addrRaw.toLowerCase();
            const profile = profileByWallet.get(addrLower);
            const point = receiverPoints[i];
            const label = (_11 = (_10 = (_8 = (_7 = profile === null || profile === void 0 ? void 0 : profile.displayName) !== null && _7 !== void 0 ? _7 : receiverLocations[i]) !== null && _8 !== void 0 ? _8 : (_9 = checkpointsPassed[i]) === null || _9 === void 0 ? void 0 : _9.label) !== null && _10 !== void 0 ? _10 : roadmaps[i].action) !== null && _11 !== void 0 ? _11 : `Stop ${i + 1}`;
            const hopIndex = hopInfos.length;
            hopInfos.push({
                address: addrLower,
                label,
                point: point !== null && point !== void 0 ? point : null,
                isOrigin: false,
            });
            roadmapToHopIndex[i] = hopIndex;
        }
        const deliveries = await this.prisma.deliveryOrder.findMany({
            where: { batchId: batch.code },
            orderBy: { createdAt: "asc" },
        });
        const executedPairs = new Set();
        for (const d of deliveries) {
            if (d.status === client_1.DeliveryStatus.IN_TRANSIT ||
                d.status === client_1.DeliveryStatus.DELIVERED) {
                const from = ((_12 = d.senderAddress) !== null && _12 !== void 0 ? _12 : "").trim().toLowerCase();
                const to = ((_13 = d.recipientAddress) !== null && _13 !== void 0 ? _13 : "").trim().toLowerCase();
                if (from && to) {
                    executedPairs.add(`${from}->${to}`);
                }
            }
        }
        let holderVerifiedByDelivery = true;
        if (holderLower && hopInfos.length > 0) {
            const hopIndex = hopInfos.findIndex((h) => h.address === holderLower);
            if (hopIndex > 0) {
                const from = hopInfos[hopIndex - 1].address;
                const to = hopInfos[hopIndex].address;
                holderVerifiedByDelivery = executedPairs.has(`${from}->${to}`);
            }
            else if (hopIndex === -1 &&
                currentLocation &&
                currentLocation.locationType !== "script" &&
                currentLocation.locationType !== "minter") {
                holderVerifiedByDelivery = false;
            }
        }
        if (currentLocation) {
            const unverified = currentLocation.locationType === "outside" ||
                (holderLower != null && !holderVerifiedByDelivery);
            if (unverified) {
                currentLocation = Object.assign(Object.assign({}, currentLocation), { unverified: true });
            }
        }
        let finalMapData = [];
        if (hopInfos.length > 0) {
            finalMapData = hopInfos
                .filter((h) => h.point)
                .map((h, index, arr) => {
                let status = "completed";
                if (index > 0) {
                    const from = arr[index - 1].address;
                    const to = h.address;
                    status = executedPairs.has(`${from}->${to}`)
                        ? "completed"
                        : "pending";
                }
                let label = h.label;
                if ((currentLocation === null || currentLocation === void 0 ? void 0 : currentLocation.unverified) &&
                    holderLower &&
                    h.address === holderLower) {
                    label = label
                        ? `${label} - Unidentified NFT`
                        : "Unidentified NFT";
                }
                return {
                    lat: h.point.lat,
                    lng: h.point.lng,
                    label,
                    status,
                    pointType: h.isOrigin ? "origin" : "receiver",
                };
            });
        }
        else if (currentLocation &&
            currentLocation.lat != null &&
            currentLocation.lng != null) {
            finalMapData = [
                {
                    lat: currentLocation.lat,
                    lng: currentLocation.lng,
                    label: currentLocation.label,
                    status: "completed",
                    pointType: currentLocation.locationType === "minter"
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
            display: (0, utils_2.buildDisplay)(metadata, properties, decodedMinterLocation, receiverLocationsArr, (_14 = batch.image) !== null && _14 !== void 0 ? _14 : null),
        };
    }
};
exports.TraceAssetUseCase = TraceAssetUseCase;
exports.TraceAssetUseCase = TraceAssetUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        cardano_service_1.CardanoService,
        prisma_service_1.PrismaService,
        order_service_1.OrderService])
], TraceAssetUseCase);
//# sourceMappingURL=trace-asset.use-case.js.map