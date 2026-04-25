import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface WalletAPI {
  getChangeAddress: () => Promise<string | { address: string }>;
  getRewardAddresses?: () => Promise<string[]>;
  signData?: (address: string, payload: string) => Promise<{ signature: string; key: string }>;
  experimental?: any;
  enable?: () => Promise<unknown>;
}

interface VerifyResponse {
  needProfile?: boolean;
  roles?: Array<{ id: number; code: string }>;
  token?: string;
  profile?: {
    id: string;
    role?: string;
    roleCode?: string;
    displayName: string;
    location: string | null;
    coordinates: any;
  };
}

export function useWalletAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loginWithEternl = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const cardano = (window as any).cardano;
      if (!cardano) {
        throw new Error('No Cardano wallet found. Please install a Cardano wallet like Eternl, Nami, or Flint.');
      }

      if (typeof window === "undefined") {
        throw new Error("Browser is not ready.");
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
      } catch (e) {
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

      if (verifyData.needProfile === true) {
        sessionStorage.setItem('profile_setup', JSON.stringify({
          stakeAddress: walletAddress,
          roles: verifyData.roles || [],
        }));
        router.replace('/role-setup');
      } else {
        router.replace('/enterprise/admin');
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
