import { useState } from 'react';
import { homePathForRole } from '@/lib/app-routes';
const SETUP_PROFILE_KEY = 'pending_profile_setup';

interface WalletAPI {
  getChangeAddress: () => Promise<string | { address: string }>;
  getRewardAddresses?: () => Promise<string[]>;
  signData?: (address: string, payload: string) => Promise<{ signature: string; key: string }>;
  experimental?: any;
  enable?: () => Promise<unknown>;
}

interface VerifyResponse {
  needProfile?: boolean;
  roles?: Array<{ id: number; code: string; name?: string | null }>;
  token?: string;
  profile?: {
    id: string;
    role?: string;
    roleCode?: string;
    displayName: string;
    coordinates: any;
  };
}

type SetupProfileState = {
  walletAddress: string;
  roles: Array<{ id: number; code: string; name?: string | null }>;
} | null;

function saveSetupProfileState(state: SetupProfileState) {
  if (typeof window === 'undefined') return;
  if (!state) {
    window.sessionStorage.removeItem(SETUP_PROFILE_KEY);
    return;
  }
  window.sessionStorage.setItem(SETUP_PROFILE_KEY, JSON.stringify(state));
}

export function readSetupProfileState(): SetupProfileState {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SETUP_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SetupProfileState;
    if (!parsed?.walletAddress) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useWalletAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithEternl = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const cardano = (window as any).cardano;
      if (!cardano) {
        throw new Error('No Cardano wallet found. Please install a Cardano wallet like Eternl, Nami, or Flint.');
      }

      const eternl = cardano.eternl as WalletAPI | undefined;
      if (!eternl || typeof eternl.enable !== "function") {
        throw new Error(
          "Eternl wallet not found. Please install and enable the Eternl extension.",
        );
      }
      const api = (await (cardano.eternl as any).enable()) as WalletAPI;

      const changeAddressRaw = await api.getChangeAddress();
      
      let walletAddress: string;

      if (typeof changeAddressRaw === 'string') {
        walletAddress = changeAddressRaw;
      } else if (changeAddressRaw && typeof changeAddressRaw === 'object' && 'address' in changeAddressRaw) {
        walletAddress = changeAddressRaw.address;
      } else {
        throw new Error('Unable to get wallet address');
      }

      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      
      const nonceResponse = await fetch(`${BACKEND_URL}/auth/nonce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ stakeAddress: walletAddress }),
      });

      if (!nonceResponse.ok) {
        const errorText = await nonceResponse.text();
        throw new Error(`Failed to get nonce from server: ${errorText}`);
      }

      const { nonce } = await nonceResponse.json();

      const payloadHex = String(nonce || "").trim();
      if (!payloadHex) {
        throw new Error("Server returned empty nonce.");
      }
      
      const signer = api.signData || api.experimental?.signData;
      if (!signer) {
        throw new Error('Wallet does not support data signing');
      }

      let rewardAddresses: string[] = [];
      try {
        rewardAddresses = await api.getRewardAddresses?.() || [];
      } catch {
      }

      const signAddress = rewardAddresses[0] ?? walletAddress;
      const signed = await signer(signAddress, payloadHex);

      const verifyResponse = await fetch(`${BACKEND_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          stakeAddress: walletAddress,
          nonce: nonce,
          signature: signed.signature,
          key: signed.key,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify signature');
      }

      const verifyData: VerifyResponse = await verifyResponse.json();
      if (verifyData.needProfile) {
        const pending = {
          walletAddress,
          roles: Array.isArray(verifyData.roles) ? verifyData.roles : [],
        };
        saveSetupProfileState(pending);
        window.location.assign('/admin#/login');
      } else {
        saveSetupProfileState(null);
        const roleCode = verifyData?.profile?.roleCode || verifyData?.profile?.role;
        window.location.assign(homePathForRole(roleCode));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loginWithEternl,
    isLoading,
    error,
  };
}
