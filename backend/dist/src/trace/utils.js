"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildNft222Unit = buildNft222Unit;
exports.decodeHexToUtf8 = decodeHexToUtf8;
exports.parseOneCoordinate = parseOneCoordinate;
exports.parseCoordinates = parseCoordinates;
exports.buildDisplay = buildDisplay;
function buildNft222Unit(policyId, assetName, prefix222) {
    const hexName = Buffer.from(assetName, "utf8").toString("hex");
    return `${policyId}${prefix222}${hexName}`;
}
function decodeHexToUtf8(value) {
    if (value == null)
        return "";
    const s = String(value).trim();
    if (!s)
        return "";
    let hex = s;
    if (hex.startsWith("0x") || hex.startsWith("0X"))
        hex = hex.slice(2);
    if (!/^[0-9a-fA-F]*$/.test(hex))
        return s;
    try {
        return Buffer.from(hex, "hex").toString("utf8");
    }
    catch (_a) {
        return s;
    }
}
function parseOneCoordinate(coordsStr) {
    if (!coordsStr || typeof coordsStr !== "string")
        return null;
    const trimmed = coordsStr.trim();
    const parts = trimmed.split(",").map((s) => s.trim());
    if (parts.length < 2)
        return null;
    const lat = Number(parts[0]);
    const lng = Number(parts[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng))
        return null;
    return { lat, lng };
}
function parseCoordinates(coordsStr) {
    if (!coordsStr || typeof coordsStr !== "string")
        return [];
    const points = [];
    const pairs = coordsStr.split(";").map((s) => s.trim()).filter(Boolean);
    for (const pair of pairs) {
        const parts = pair.split(",").map((s) => s.trim());
        if (parts.length >= 2) {
            const lat = Number(parts[0]);
            const lng = Number(parts[1]);
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
                points.push({ lat, lng });
            }
        }
    }
    return points;
}
function buildDisplay(metadata, properties, minterLocation, receiverLocations, batchImage) {
    var _a, _b, _c, _d, _e, _f;
    const rawImage = (_b = (_a = metadata.image) !== null && _a !== void 0 ? _a : batchImage) !== null && _b !== void 0 ? _b : "";
    let imageUrl = "";
    if (rawImage && typeof rawImage === "string") {
        const image = String(rawImage).trim();
        const pinataBase = "https://gateway.pinata.cloud/ipfs/";
        if (image.startsWith("http")) {
            imageUrl = image;
        }
        else if (image.length > 0) {
            const cid = image.replace(/^ipfs:\/\//, "").trim();
            if (cid) {
                imageUrl = `${pinataBase}${cid}`;
            }
        }
    }
    return {
        name: (_c = metadata.name) !== null && _c !== void 0 ? _c : "",
        standard: (_d = metadata.standard) !== null && _d !== void 0 ? _d : "",
        image: rawImage || undefined,
        imageUrl: imageUrl || undefined,
        minter_location: minterLocation || undefined,
        receiver_locations: receiverLocations.length > 0 ? receiverLocations : undefined,
        receiver_coordinates: (_e = metadata.receiver_coordinates) !== null && _e !== void 0 ? _e : undefined,
        minter_coordinates: (_f = metadata.minter_coordinates) !== null && _f !== void 0 ? _f : undefined,
        properties: properties && Object.keys(properties).length > 0 ? properties : undefined,
    };
}
//# sourceMappingURL=utils.js.map