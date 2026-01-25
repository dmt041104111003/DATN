"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Address,
  Transaction as CslTransaction,
  TransactionWitnessSet,
} from "@meshsdk/core-cst";

function hexToBech32(hexAddress: string): string {
  if (hexAddress.startsWith("addr")) {
    return hexAddress;
  }
  const addr = Address.fromString(hexAddress);
  if (!addr) {
    throw new Error("Invalid address format");
  }
  return addr.toBech32();
}

export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  apiVersion: string;
}

interface CardanoWalletApi {
  getNetworkId: () => Promise<number>;
  getUsedAddresses: () => Promise<string[]>;
  getUnusedAddresses: () => Promise<string[]>;
  getChangeAddress: () => Promise<string>;
  getRewardAddresses: () => Promise<string[]>;
  signData: (addr: string, payload: string) => Promise<{ signature: string; key: string }>;
  signTx: (tx: string, partialSign?: boolean) => Promise<string>;
  submitTx: (tx: string) => Promise<string>;
}

declare global {
  interface Window {
    cardano?: Record<string, {
      name: string;
      icon: string;
      apiVersion: string;
      enable: () => Promise<CardanoWalletApi>;
      isEnabled: () => Promise<boolean>;
    }>;
  }
}

const KNOWN_WALLETS = [
  { id: "nami", displayName: "Nami" },
  { id: "eternl", displayName: "Eternl" },
  { id: "flint", displayName: "Flint" },
  { id: "gerowallet", displayName: "Gero" },
  { id: "typhoncip30", displayName: "Typhon" },
  { id: "nufi", displayName: "NuFi" },
  { id: "lace", displayName: "Lace" },
  { id: "vespr", displayName: "Vespr" },
  { id: "begin", displayName: "Begin" },
  { id: "yoroi", displayName: "Yoroi" },
];

export function useWalletDetection() {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const detectWallets = () => {
      if (typeof window === "undefined" || !window.cardano) {
        setIsDetecting(false);
        return;
      }

      const detected: WalletInfo[] = [];

      for (const wallet of KNOWN_WALLETS) {
        const provider = window.cardano[wallet.id];
        if (provider) {
          detected.push({
            id: wallet.id,
            name: provider.name || wallet.displayName,
            icon: provider.icon || "",
            apiVersion: provider.apiVersion || "",
          });
        }
      }

      for (const [key, provider] of Object.entries(window.cardano)) {
        if (
          provider &&
          typeof provider === "object" &&
          "enable" in provider &&
          !detected.find((w) => w.id === key)
        ) {
          detected.push({
            id: key,
            name: provider.name || key,
            icon: provider.icon || "",
            apiVersion: provider.apiVersion || "",
          });
        }
      }

      setWallets(detected);
      setIsDetecting(false);
    };

    const timer = setTimeout(detectWallets, 100);
    return () => clearTimeout(timer);
  }, []);

  return { wallets, isDetecting };
}

function assembleSignedTx(unsignedTxCbor: string, witnessSetCbor: string): string {
  const unsignedTx = CslTransaction.fromCbor(unsignedTxCbor);
  const walletWitnessSet = TransactionWitnessSet.fromCbor(witnessSetCbor);
  const originalWitnessSet = unsignedTx.witnessSet();
  const mergedWitnessSet = new TransactionWitnessSet();
  const vkeyWitnesses = walletWitnessSet.vkeys();
  if (vkeyWitnesses) {
    mergedWitnessSet.setVkeys(vkeyWitnesses);
  }
  
  const plutusScripts = originalWitnessSet?.plutusV3Scripts();
  if (plutusScripts) {
    mergedWitnessSet.setPlutusV3Scripts(plutusScripts);
  }
  
  const redeemers = originalWitnessSet?.redeemers();
  if (redeemers) {
    mergedWitnessSet.setRedeemers(redeemers);
  }
  
  const plutusData = originalWitnessSet?.plutusData();
  if (plutusData) {
    mergedWitnessSet.setPlutusData(plutusData);
  }
  
  const signedTx = new CslTransaction(
    unsignedTx.body(),
    mergedWitnessSet,
    unsignedTx.auxiliaryData()
  );
  
  return signedTx.toCbor();
}

export function useWalletConnect() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const enableWallet = useCallback(async (walletId: string): Promise<{
    address: string;
    hexAddress: string;
  } | null> => {
    if (typeof window === "undefined" || !window.cardano) {
      setError("Cardano wallet not found");
      return null;
    }

    const provider = window.cardano[walletId];
    if (!provider) {
      setError(`${walletId} wallet not found`);
      return null;
    }

    setConnecting(walletId);
    setError(null);

    try {
      const api = await provider.enable();
      
      const usedAddresses = await api.getUsedAddresses();
      const unusedAddresses = await api.getUnusedAddresses();
      const addresses = [...usedAddresses, ...unusedAddresses];
      
      if (addresses.length === 0) {
        throw new Error("No addresses found in wallet");
      }

      const hexAddress = addresses[0];
      const bech32Address = hexToBech32(hexAddress);

      return { address: bech32Address, hexAddress };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(message);
      return null;
    }
  }, []);

  const signNonce = useCallback(async (walletId: string, hexAddress: string, nonce: string): Promise<{
    signature: string;
    key: string;
  } | null> => {
    if (typeof window === "undefined" || !window.cardano) {
      setError("Cardano wallet not found");
      return null;
    }

    const provider = window.cardano[walletId];
    if (!provider) {
      setError(`${walletId} wallet not found`);
      return null;
    }

    try {
      const api = await provider.enable();
      const { signature, key } = await api.signData(hexAddress, nonce);
      return { signature, key };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign message";
      setError(message);
      return null;
    } finally {
      setConnecting(null);
    }
  }, []);

  const signTx = useCallback(async (walletId: string, unsignedTxCbor: string): Promise<string> => {
    console.log("[Wallet] signTx called", { walletId, txLength: unsignedTxCbor?.length });
    
    if (typeof window === "undefined" || !window.cardano) {
      throw new Error("Cardano wallet not found");
    }

    const provider = window.cardano[walletId];
    if (!provider) {
      throw new Error(`Wallet "${walletId}" not found. Please reconnect.`);
    }

    if (!unsignedTxCbor) {
      console.error("[Wallet] Transaction CBOR is missing");
      throw new Error("Transaction data is missing");
    }

    console.log("[Wallet] Transaction CBOR:", {
      length: unsignedTxCbor.length,
      prefix: unsignedTxCbor.slice(0, 30),
      isHex: /^[0-9a-fA-F]+$/.test(unsignedTxCbor),
    });

    try {
      console.log("[Wallet] Enabling wallet API...");
      const api = await provider.enable();
      
      console.log("[Wallet] Calling signTx...");
      const signResult = await api.signTx(unsignedTxCbor, false);
      console.log("[Wallet] Sign result:", {
        length: signResult.length,
        prefix: signResult.slice(0, 30),
        isFullTx: signResult.startsWith("84"),
      });
      
      const signedTxCbor = signResult.startsWith("84")
        ? signResult
        : assembleSignedTx(unsignedTxCbor, signResult);
      
      console.log("[Wallet] Signed transaction ready:", { length: signedTxCbor.length });
      return signedTxCbor;
    } catch (err: unknown) {
      console.error("[Wallet] Sign error:", err);
      
      let message = "Failed to sign transaction";
      
      if (err instanceof Error) {
        message = err.message;
        console.error("[Wallet] Error message:", message);
        if (message.toLowerCase().includes("cancel") || 
            message.toLowerCase().includes("reject") ||
            message.toLowerCase().includes("declined")) {
          message = "Transaction cancelled by user";
        }
      } else if (err && typeof err === "object") {
        const errObj = err as Record<string, unknown>;
        console.error("[Wallet] Error object:", errObj);
        if (errObj.code === 1 || errObj.code === 2 || errObj.code === -2) {
          message = "Transaction cancelled by user";
        } else if (typeof errObj.info === "string") {
          message = errObj.info;
        } else if (typeof errObj.message === "string") {
          message = errObj.message;
        }
      }
      
      setError(message);
      throw new Error(message);
    }
  }, []);

  return { enableWallet, signNonce, signTx, connecting, error, setError };
}
