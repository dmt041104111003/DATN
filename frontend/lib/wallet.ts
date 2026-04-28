async function getMeshWallet(): Promise<any | null> {
  if (typeof window === "undefined") return null;

  try {
    const { BrowserWallet } = await import("@meshsdk/core");
    return await BrowserWallet.enable("eternl");
  } catch {
    return null;
  }
}

async function getEternlApi(): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("Browser is not ready.");
  }

  const anyWindow = window as unknown as {
    cardano?: {
      eternl?: { enable: () => Promise<any> };
    };
  };

  if (!anyWindow.cardano || !anyWindow.cardano.eternl) {
    throw new Error("Required browser signer extension was not found or enabled.");
  }
  return await anyWindow.cardano.eternl.enable();
}

function extractSignedTxHex(rawSigned: unknown): string {
  if (!rawSigned) throw new Error("Signing failed for this record.");
  if (typeof rawSigned === "string") return rawSigned;

  if (Array.isArray(rawSigned)) {
    let hex = "";

    for (let i = 0; i < rawSigned.length; i += 1) {
      const b = rawSigned[i] & 0xff;
      hex += (b >>> 4).toString(16) + (b & 0x0f).toString(16);
    }

    return hex;
  }

  if (rawSigned && typeof rawSigned === "object") {
    const signed = rawSigned as any;
    if (typeof signed.signedTransaction === "string") return signed.signedTransaction;
    if (typeof signed.cborTx === "string") return signed.cborTx;
    if (typeof signed.tx === "string") return signed.tx;
    if (typeof signed.cbor === "string") return signed.cbor;
  }

  throw new Error("Unexpected format returned from signer.");
}

async function isLikelyFullTxHex(hex: string): Promise<boolean> {
  const clean = hex.trim().replace(/^0x/, "");
  if (clean.length < 200) return false;

  const firstByte = parseInt(clean.slice(0, 2), 16);
  const isArray = (firstByte >= 0x80 && firstByte <= 0x9b) || firstByte === 0x9f;
  if (!isArray) return false;

  try {
    const cst = await import("@meshsdk/core-cst");
    (cst as any).deserializeTx(clean);
    return true;
  } catch {
    return false;
  }
}

export async function signOutgoingAttestation(
  unsignedTx: string,
  opts?: { partialSign?: boolean },
): Promise<string> {
  let partialSign = false;
  if (opts && typeof opts.partialSign === "boolean") {
    partialSign = opts.partialSign;
  }

  const unsignedClean = unsignedTx.trim().replace(/^0x/, "");
  const wallet = await getMeshWallet();

  if (wallet && typeof (wallet as any).signTx === "function") {
    const rawSigned = await (wallet as any).signTx(unsignedClean, partialSign);
    const signedHex = extractSignedTxHex(rawSigned).trim().replace(/^0x/, "");
    if (signedHex && (await isLikelyFullTxHex(signedHex))) return signedHex;
  }

  const api = await getEternlApi();
  if (typeof (api as any).signTx !== "function") throw new Error("Connected signer does not support record signing.");

  const rawSigned = await (api as any).signTx(unsignedClean, partialSign);
  const signedHex = extractSignedTxHex(rawSigned).trim().replace(/^0x/, "");
  if (await isLikelyFullTxHex(signedHex)) return signedHex;

  try {
    const { BrowserWallet } = await import("@meshsdk/wallet");
    const merged = (BrowserWallet as any).addBrowserWitnesses(unsignedClean, signedHex);
    if (!merged || typeof merged !== "string") throw new Error("Could not merge signer proofs into the draft record.");

    const mergedHex = merged.trim().replace(/^0x/, "");
    if (await isLikelyFullTxHex(mergedHex)) return mergedHex;

    throw new Error("Merged attestation is not valid for publication.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Signer proof merge failed: ${msg}`);
  }
}

export async function publishAttestedRecord(signedPayloadHex: string): Promise<string> {
  const clean = signedPayloadHex.trim().replace(/^0x/, "");
  if (!clean) throw new Error("No signed record payload was provided.");

  const wallet = await getMeshWallet();
  if (wallet && typeof (wallet as any).submitTx === "function") {
    const txHash = await (wallet as any).submitTx(clean);
    if (txHash && typeof txHash === "string") return txHash;
  }

  const api = await getEternlApi();
  if (typeof (api as any).submitTx === "function") {
    const txHash = await (api as any).submitTx(clean);
    if (txHash && typeof txHash === "string") return txHash;
  }

  throw new Error("Connected signer cannot publish this record.");
}

