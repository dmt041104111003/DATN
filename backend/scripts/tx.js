require("dotenv").config();
const cbor = require("cbor");
const { BlockFrostAPI } = require("@blockfrost/blockfrost-js");

const CIP68_100_PREFIX = "000643b0";
const CIP68_222_PREFIX = "000de140";

function getArg(name) {
  const idx = process.argv.findIndex((x) => x === name);
  if (idx < 0) return "";
  return String(process.argv[idx + 1] || "").trim();
}

function getPositionalArg(index) {
  const args = process.argv.slice(2).filter((x) => !String(x).startsWith("-"));
  return String(args[index] || "").trim();
}

function parseDatumObject(rawHex) {
  const cborDatum = Buffer.from(String(rawHex || "").replace(/^0x/, ""), "hex");
  const decoded = cbor.decodeFirstSync(cborDatum);
  const datumMap = Array.isArray(decoded) ? decoded[0] : decoded?.value?.[0];
  if (!(datumMap instanceof Map)) {
    throw new Error("Invalid inline datum format.");
  }
  const obj = {};
  for (const [k, v] of datumMap.entries()) {
    const key = Buffer.isBuffer(k) || k instanceof Uint8Array ? Buffer.from(k).toString("utf-8") : String(k);
    const value = Buffer.isBuffer(v) || v instanceof Uint8Array ? Buffer.from(v).toString("utf-8") : v;
    obj[key] = value;
  }
  return obj;
}

function decodeAssetNameFromUnit(unit) {
  const u = String(unit || "").trim().toLowerCase();
  if (!u || u.length <= 56) return "";
  const rest = u.slice(56);
  const hex = rest.startsWith(CIP68_100_PREFIX) ? rest.slice(CIP68_100_PREFIX.length) : rest;
  if (!hex || hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) return "";
  return Buffer.from(hex, "hex").toString("utf-8");
}

function encodeAssetNameToRefUnit(policyId, assetName) {
  const p = String(policyId || "").trim().toLowerCase();
  const a = String(assetName || "").trim();
  if (!p || !a || !/^[0-9a-f]{56}$/i.test(p)) return "";
  const assetHex = Buffer.from(a, "utf-8").toString("hex").toLowerCase();
  return `${p}${CIP68_100_PREFIX}${assetHex}`;
}

function parseOwnersFromMetadata(metadata) {
  const tryParse = (raw) => {
    if (Array.isArray(raw)) return raw.map((x) => String(x || "").trim()).filter(Boolean);
    const text = String(raw || "").trim();
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.map((x) => String(x || "").trim()).filter(Boolean);
    } catch {}
    return [];
  };
  const fromOwners = tryParse(metadata?.owners);
  if (fromOwners.length) return fromOwners;
  const fromParticipants = tryParse(metadata?.participant_wallet_addresses);
  if (fromParticipants.length) return fromParticipants;
  return [];
}

function parseProductionRefInline(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const dot = raw.indexOf(".");
  if (dot <= 0) return null;
  const policyId = raw.slice(0, dot).trim().toLowerCase();
  const assetName = raw.slice(dot + 1).trim();
  if (!/^[0-9a-f]{56}$/i.test(policyId) || !assetName) return null;
  return { policyId, assetName };
}

async function readLatestDatumByUnit(api, unit) {
  const refs = await api.assetsTransactions(unit, { count: 1, page: 1, order: "desc" });
  const latestTxHash = String(refs?.[0]?.tx_hash || "").trim();
  if (!latestTxHash) return null;
  const utxos = await api.txsUtxos(latestTxHash);
  const outputs = Array.isArray(utxos?.outputs) ? utxos.outputs : [];
  const outputWithDatum =
    outputs.find(
      (o) =>
        String(o?.inline_datum || "").trim() &&
        Array.isArray(o?.amount) &&
        o.amount.some((a) => String(a?.unit || "").trim().toLowerCase() === String(unit).toLowerCase()),
    ) || outputs.find((o) => String(o?.inline_datum || "").trim());
  if (!outputWithDatum) return null;
  const rawDatum = String(outputWithDatum.inline_datum || "").trim();
  if (!rawDatum) return null;
  const metadata = parseDatumObject(rawDatum);
  const cip68Unit = (outputWithDatum.amount || [])
    .map((a) => String(a?.unit || "").trim())
    .find((u) => u !== "lovelace" && u.toLowerCase().slice(56).startsWith(CIP68_100_PREFIX)) || "";
  const assetName = decodeAssetNameFromUnit(cip68Unit);
  const owners = parseOwnersFromMetadata(metadata);
  return { txHash: latestTxHash, owners, assetName, metadata };
}

async function main() {
  const txHash = getPositionalArg(0) || getArg("--tx") || getArg("-t");
  const apiKey = getArg("--api-key") || process.env.BLOCKFROST_API_KEY || "";
  const network = (getArg("--network") || process.env.APP_NETWORK || "preprod").toLowerCase() === "mainnet" ? "mainnet" : "preprod";

  if (!txHash) {
    throw new Error("Missing txHash. Usage: npm run tx -- <txHash>");
  }
  if (!apiKey) {
    throw new Error("Missing Blockfrost API key. Use --api-key or BLOCKFROST_API_KEY");
  }

  const api = new BlockFrostAPI({ projectId: apiKey, network });
  const utxos = await api.txsUtxos(txHash);
  const outputs = Array.isArray(utxos?.outputs) ? utxos.outputs : [];

  const outputWithDatum =
    outputs.find((o) => String(o?.inline_datum || "").trim() && Array.isArray(o?.amount) && o.amount.some((a) => String(a?.unit || "").includes(CIP68_100_PREFIX))) ||
    outputs.find((o) => String(o?.inline_datum || "").trim());

  if (!outputWithDatum) {
    throw new Error("No output with inline_datum found in this transaction.");
  }

  const rawDatum = String(outputWithDatum.inline_datum || "").trim();
  const metadata = parseDatumObject(rawDatum);

  const cip68Unit = (outputWithDatum.amount || [])
    .map((a) => String(a?.unit || "").trim())
    .find((u) => u !== "lovelace" && u.toLowerCase().slice(56).startsWith(CIP68_100_PREFIX)) || "";
  const assetName = decodeAssetNameFromUnit(cip68Unit);
  const owners = parseOwnersFromMetadata(metadata);
  const productionRef = parseProductionRefInline(metadata?.production_ref_inline);
  let production = null;
  if (productionRef) {
    const productionUnit = encodeAssetNameToRefUnit(productionRef.policyId, productionRef.assetName);
    if (productionUnit) {
      try {
        production = await readLatestDatumByUnit(api, productionUnit);
      } catch {
        production = null;
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        txHash,
        network,
        owners,
        assetName,
        metadata,
        productionRefInline: productionRef || null,
        production,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error("[inspect-tx] ERROR:", err?.message || err);
  process.exit(1);
});

