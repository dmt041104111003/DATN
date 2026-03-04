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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32;
        const policyIdTrimmed = policyId.trim();
        const assetNameTrimmed = assetName.trim();
        const ref100Unit = (0, utils_1.buildRef100Unit)(policyIdTrimmed, assetNameTrimmed, this.config.cip68Prefix);
        let ref100Quantity = "0";
        try {
            const ref100Asset = (await this.cardano.blockfrostFetcher.fetchSpecificAsset(ref100Unit));
            ref100Quantity = (_a = ref100Asset === null || ref100Asset === void 0 ? void 0 : ref100Asset.quantity) !== null && _a !== void 0 ? _a : "0";
        }
        catch (_33) {
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
        catch (_34) {
            nft222Quantity = "0";
        }
        const batch = await this.prisma.productBatch.findFirst({
            where: Object.assign({ batchId: assetNameTrimmed }, (policyIdTrimmed ? { policyId: policyIdTrimmed } : {})),
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
            throw new common_1.NotFoundException("Asset not found for this policy and asset name.");
        }
        const standard = (_c = batch.standard) !== null && _c !== void 0 ? _c : "Traceability-v1";
        const metadata = {
            name: batch.name,
            description: batch.description,
            image: batch.image,
            standard,
            policy_id: (_d = batch.policyId) !== null && _d !== void 0 ? _d : undefined,
        };
        const properties = {};
        if (batch.expiryDate) {
            properties.ngayHetHan =
                batch.expiryDate instanceof Date
                    ? batch.expiryDate.toISOString()
                    : String(batch.expiryDate);
        }
        const burnStatus = nft222Quantity === "0" ? "burned" : "active";
        const coreCertificates = (_f = ((_e = batch.certificates) !== null && _e !== void 0 ? _e : []).map((c) => {
            var _a, _b, _c, _d, _e;
            return ({
                id: c.id,
                title: c.title,
                number: (_a = c.number) !== null && _a !== void 0 ? _a : null,
                authority: (_b = c.authority) !== null && _b !== void 0 ? _b : null,
                expiryDate: c.expiryDate
                    ? (c.expiryDate instanceof Date
                        ? c.expiryDate.toISOString()
                        : new Date(c.expiryDate).toISOString())
                    : null,
                documentUrl: (_c = c.documentUrl) !== null && _c !== void 0 ? _c : null,
                issuerName: (_e = (_d = c.issuerProfile) === null || _d === void 0 ? void 0 : _d.displayName) !== null && _e !== void 0 ? _e : null,
            });
        })) !== null && _f !== void 0 ? _f : [];
        const core = {
            policyId: policyIdTrimmed,
            assetName: assetNameTrimmed,
            standard,
            referenceUtxo: (_g = batch.referenceUtxo) !== null && _g !== void 0 ? _g : null,
            batch: {
                name: batch.name,
                description: (_h = batch.description) !== null && _h !== void 0 ? _h : null,
                image: (_j = batch.image) !== null && _j !== void 0 ? _j : null,
                originSiteCode: (_k = batch.originSiteCode) !== null && _k !== void 0 ? _k : null,
                minterName: (_m = (_l = batch.minterProfile) === null || _l === void 0 ? void 0 : _l.displayName) !== null && _m !== void 0 ? _m : null,
                minterLocation: (_p = (_o = batch.minterProfile) === null || _o === void 0 ? void 0 : _o.location) !== null && _p !== void 0 ? _p : null,
            },
            certificates: coreCertificates,
        };
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
                    imageUrl: (_q = enterpriseCert.imageUrl) !== null && _q !== void 0 ? _q : null,
                    issuedAt: enterpriseCert.issuedAt,
                    batchId: batch.batchId,
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
        const roadmaps = (_r = batch.roadmaps) !== null && _r !== void 0 ? _r : [];
        const rawReceiverLocations = (_s = metadata.receiver_locations) !== null && _s !== void 0 ? _s : "";
        const rawMinterLocation = (_t = metadata.minter_location) !== null && _t !== void 0 ? _t : "";
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
                step: r.stepIndex + 1,
                label: (_a = receiverLocationsArr[i]) !== null && _a !== void 0 ? _a : (r.action || `Step ${r.stepIndex + 1}`),
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
            const lastReceiverAddress = (_u = lastHop === null || lastHop === void 0 ? void 0 : lastHop.toAddress) === null || _u === void 0 ? void 0 : _u.trim();
            if (lastReceiverAddress) {
                const lastProfile = await this.prisma.profile.findUnique({
                    where: { walletAddress: lastReceiverAddress },
                    select: { id: true },
                });
                if (lastProfile) {
                    const warehouseRow = await this.prisma.warehouseInventory.findFirst({
                        where: {
                            batchId: batch.batchId,
                            profileId: lastProfile.id,
                        },
                        select: { status: true, consumedAt: true },
                    });
                    lifecycleCompleted = (warehouseRow === null || warehouseRow === void 0 ? void 0 : warehouseRow.status) === "CONSUMED";
                }
            }
        }
        const receiverCoords = (_v = metadata.receiver_coordinates) !== null && _v !== void 0 ? _v : "";
        const minterCoords = (_w = metadata.minter_coordinates) !== null && _w !== void 0 ? _w : "";
        const receiverLocations = receiverLocationsArr;
        const minterLocation = decodedMinterLocation;
        const minterCoordFromDb = ((_x = batch.minterProfile) === null || _x === void 0 ? void 0 : _x.coordinates)
            ? (0, utils_2.parseOneCoordinate)(batch.minterProfile.coordinates)
            : null;
        const originPointsFromMetadata = (0, utils_2.parseCoordinates)(minterCoords);
        const originPoint = minterCoordFromDb !== null && minterCoordFromDb !== void 0 ? minterCoordFromDb : (originPointsFromMetadata.length > 0
            ? originPointsFromMetadata[0]
            : null);
        const receiverAddressesRaw = roadmaps.map((r) => { var _a; return ((_a = r.toAddress) !== null && _a !== void 0 ? _a : "").trim(); });
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
            const addr = ((_y = roadmaps[i].toAddress) !== null && _y !== void 0 ? _y : "")
                .trim()
                .toLowerCase();
            const profile = addr ? profileByWallet.get(addr) : null;
            const fromDb = (profile === null || profile === void 0 ? void 0 : profile.coordinates)
                ? (0, utils_2.parseOneCoordinate)(profile.coordinates)
                : null;
            const fromMeta = receiverPointsFromMetadata[i];
            const point = (_z = fromDb !== null && fromDb !== void 0 ? fromDb : fromMeta) !== null && _z !== void 0 ? _z : null;
            receiverPoints.push(point);
        }
        const minterWalletLower = ((_1 = (_0 = batch.minterProfile) === null || _0 === void 0 ? void 0 : _0.walletAddress) !== null && _1 !== void 0 ? _1 : "")
            .trim()
            .toLowerCase();
        let currentLocation;
        let holderLower = null;
        let holderReceiverIndex = -1;
        let holderLocationType;
        if (burnStatus === "active") {
            try {
                const holders = await this.cardano.blockfrostFetcher.fetchAssetAddresses(nft222Unit);
                const holderAddress = holders.length > 0 ? (_2 = holders[0].address) === null || _2 === void 0 ? void 0 : _2.trim() : null;
                if (holderAddress) {
                    holderLower = holderAddress.toLowerCase();
                    const roadmapList = (_3 = batch.roadmaps) !== null && _3 !== void 0 ? _3 : [];
                    let scriptAddress = null;
                    try {
                        scriptAddress =
                            (_5 = (_4 = this.order.getScriptAddress()) === null || _4 === void 0 ? void 0 : _4.trim().toLowerCase()) !== null && _5 !== void 0 ? _5 : null;
                    }
                    catch (_35) {
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
                            (_8 = (_7 = (_6 = batch.minterProfile) === null || _6 === void 0 ? void 0 : _6.displayName) !== null && _7 !== void 0 ? _7 : minterLocation) !== null && _8 !== void 0 ? _8 : "Origin";
                        locationType = "minter";
                        if (originPoint) {
                            lat = originPoint.lat;
                            lng = originPoint.lng;
                        }
                    }
                    else {
                        const idx = roadmapList.findIndex((r) => {
                            var _a;
                            return ((_a = r.toAddress) !== null && _a !== void 0 ? _a : "")
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
                                (_11 = (_10 = (_9 = receiverProfile === null || receiverProfile === void 0 ? void 0 : receiverProfile.displayName) !== null && _9 !== void 0 ? _9 : receiverLocationsArr[idx]) !== null && _10 !== void 0 ? _10 : roadmapList[idx].action) !== null && _11 !== void 0 ? _11 : `Stop ${idx + 1}`;
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
            catch (_36) {
            }
        }
        const hopInfos = [];
        const roadmapToHopIndex = new Array(roadmaps.length).fill(-1);
        if (minterWalletLower) {
            hopInfos.push({
                address: minterWalletLower,
                label: (_13 = (_12 = batch.minterProfile) === null || _12 === void 0 ? void 0 : _12.displayName) !== null && _13 !== void 0 ? _13 : minterLocation,
                point: originPoint,
                isOrigin: true,
            });
        }
        for (let i = 0; i < roadmaps.length; i++) {
            const addrRaw = ((_14 = roadmaps[i].toAddress) !== null && _14 !== void 0 ? _14 : "").trim();
            if (!addrRaw) {
                roadmapToHopIndex[i] = -1;
                continue;
            }
            const addrLower = addrRaw.toLowerCase();
            const profile = profileByWallet.get(addrLower);
            const point = receiverPoints[i];
            const label = (_19 = (_18 = (_16 = (_15 = profile === null || profile === void 0 ? void 0 : profile.displayName) !== null && _15 !== void 0 ? _15 : receiverLocations[i]) !== null && _16 !== void 0 ? _16 : (_17 = checkpointsPassed[i]) === null || _17 === void 0 ? void 0 : _17.label) !== null && _18 !== void 0 ? _18 : roadmaps[i].action) !== null && _19 !== void 0 ? _19 : `Stop ${i + 1}`;
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
            where: { batchId: batch.batchId },
            orderBy: { createdAt: "asc" },
        });
        const executedPairs = new Set();
        const deliveryByPair = new Map();
        for (const d of deliveries) {
            if (d.status === client_1.DeliveryStatus.IN_TRANSIT ||
                d.status === client_1.DeliveryStatus.DELIVERED) {
                const from = ((_20 = d.senderAddress) !== null && _20 !== void 0 ? _20 : "").trim().toLowerCase();
                const to = ((_21 = d.recipientAddress) !== null && _21 !== void 0 ? _21 : "").trim().toLowerCase();
                if (from && to) {
                    executedPairs.add(`${from}->${to}`);
                    deliveryByPair.set(`${from}->${to}`, {
                        id: d.id,
                        status: d.status,
                        senderAddress: d.senderAddress,
                        recipientAddress: d.recipientAddress,
                        createdAt: d.createdAt,
                        actualPickupAt: (_22 = d.actualPickupAt) !== null && _22 !== void 0 ? _22 : null,
                        actualDeliveryAt: (_23 = d.actualDeliveryAt) !== null && _23 !== void 0 ? _23 : null,
                        partialSignedByAddress: (_24 = d.partialSignedByAddress) !== null && _24 !== void 0 ? _24 : null,
                        secondSignedByAddress: (_25 = d.secondSignedByAddress) !== null && _25 !== void 0 ? _25 : null,
                    });
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
        const routeSteps = roadmaps.length > 0
            ? await Promise.all(roadmaps.map(async (rm, index) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                const fromAddrLower = index === 0
                    ? minterWalletLower
                    : (((_a = roadmaps[index - 1].toAddress) !== null && _a !== void 0 ? _a : "")
                        .trim()
                        .toLowerCase() || null);
                const toAddrLower = ((_b = rm.toAddress) !== null && _b !== void 0 ? _b : "").trim().toLowerCase() || null;
                const fromProfile = fromAddrLower
                    ? (_c = profileByWallet.get(fromAddrLower)) !== null && _c !== void 0 ? _c : null
                    : null;
                const toProfile = toAddrLower
                    ? (_d = profileByWallet.get(toAddrLower)) !== null && _d !== void 0 ? _d : null
                    : null;
                const pairKey = fromAddrLower && toAddrLower
                    ? `${fromAddrLower}->${toAddrLower}`
                    : "";
                const d = pairKey ? deliveryByPair.get(pairKey) : undefined;
                let actualDepartureAt = null;
                let txCreatedAt = null;
                let delayedDeclaration = false;
                if (d) {
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
                        name: (_e = fromProfile === null || fromProfile === void 0 ? void 0 : fromProfile.displayName) !== null && _e !== void 0 ? _e : null,
                        location: (_f = fromProfile === null || fromProfile === void 0 ? void 0 : fromProfile.location) !== null && _f !== void 0 ? _f : null,
                    },
                    to: {
                        address: toAddrLower,
                        name: (_g = toProfile === null || toProfile === void 0 ? void 0 : toProfile.displayName) !== null && _g !== void 0 ? _g : null,
                        location: (_h = toProfile === null || toProfile === void 0 ? void 0 : toProfile.location) !== null && _h !== void 0 ? _h : null,
                    },
                    carrierName: (_j = rm.carrierName) !== null && _j !== void 0 ? _j : null,
                    transportMode: (_k = rm.transportMode) !== null && _k !== void 0 ? _k : null,
                    txHash: (_l = rm.txHash) !== null && _l !== void 0 ? _l : null,
                    actualDepartureAt,
                    txCreatedAt,
                    delayedDeclaration,
                };
            }))
            : [];
        const addrSet = new Set();
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
        const extraProfiles = addrSet.size > 0
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
                profileByWallet.set(key, p);
            }
        }
        const shippingDeliveries = deliveries.map((d) => {
            var _a, _b, _c, _d;
            const partialAddr = d.partialSignedByAddress
                ? d.partialSignedByAddress.trim().toLowerCase()
                : null;
            const secondAddr = d.secondSignedByAddress
                ? d.secondSignedByAddress.trim().toLowerCase()
                : null;
            const partialProfile = partialAddr
                ? profileByWallet.get(partialAddr)
                : null;
            const secondProfile = secondAddr
                ? profileByWallet.get(secondAddr)
                : null;
            return {
                id: d.id,
                status: d.status,
                lockedInScript: d.status === client_1.DeliveryStatus.IN_TRANSIT,
                partialSignedByAddress: (_a = d.partialSignedByAddress) !== null && _a !== void 0 ? _a : null,
                partialSignedByName: (_b = partialProfile === null || partialProfile === void 0 ? void 0 : partialProfile.displayName) !== null && _b !== void 0 ? _b : null,
                secondSignedByAddress: (_c = d.secondSignedByAddress) !== null && _c !== void 0 ? _c : null,
                secondSignedByName: (_d = secondProfile === null || secondProfile === void 0 ? void 0 : secondProfile.displayName) !== null && _d !== void 0 ? _d : null,
                actualPickupAt: d.actualPickupAt
                    ? d.actualPickupAt.toISOString()
                    : null,
                actualDeliveryAt: d.actualDeliveryAt
                    ? d.actualDeliveryAt.toISOString()
                    : null,
            };
        });
        const inventories = await this.prisma.warehouseInventory.findMany({
            where: { batchId: batch.batchId },
            orderBy: { receivedAt: "desc" },
        });
        let inventoryInfo = null;
        if (inventories.length > 0) {
            const inv = inventories[0];
            inventoryInfo = {
                status: (_26 = inv.status) !== null && _26 !== void 0 ? _26 : null,
                zone: (_27 = inv.zone) !== null && _27 !== void 0 ? _27 : null,
                aisle: (_28 = inv.aisle) !== null && _28 !== void 0 ? _28 : null,
                rack: (_29 = inv.rack) !== null && _29 !== void 0 ? _29 : null,
                bin: (_30 = inv.bin) !== null && _30 !== void 0 ? _30 : null,
                burnTxHash: (_31 = inv.burnTxHash) !== null && _31 !== void 0 ? _31 : null,
                burned: inv.status === "CONSUMED" ||
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
            display: (0, utils_2.buildDisplay)(metadata, properties, decodedMinterLocation, receiverLocationsArr, (_32 = batch.image) !== null && _32 !== void 0 ? _32 : null),
            core,
            route: { steps: routeSteps },
            shipping: { deliveries: shippingDeliveries },
            inventory: inventoryInfo,
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