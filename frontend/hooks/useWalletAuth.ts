import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface WalletAPI {
  getChangeAddress: () => Promise<string | { address: string }>;
  getRewardAddresses?: () => Promise<string[]>;
  signData?: (address: string, payload: string) => Promise<{ signature: string; key: string }>;
  experimental?: any;
}

interface VerifyResponse {
  needProfile?: boolean;
  roles?: Array<{ id: number; code: string }>;
  token?: string;
  profile?: {
    id: string;
    role: string;
    displayName: string;
    avatarUrl: string;
    location: string | null;
    coordinates: any;
  };
}

export function useWalletAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const stringToHex = (str: string): string => {
    return Buffer.from(str, 'utf8').toString('hex');
  };

  const loginWithEternl = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const cardano = (window as any).cardano;
      if (!cardano) {
        throw new Error('No Cardano wallet found. Please install a Cardano wallet like Eternl, Nami, or Flint.');
      }

      const availableWallets = Object.keys(cardano);
      
      let walletAPI = null;
      let walletName = '';

      const walletPriority = ['eternl', 'nami', 'flint', 'gero', 'lace'];
      
      for (const wallet of walletPriority) {
        if (cardano[wallet]) {
          walletName = wallet;
          try {
            walletAPI = await cardano[wallet].enable();
            break;
          } catch (err) {
            continue;
          }
        }
      }

      if (!walletAPI) {
        throw new Error('No wallet could be enabled. Please make sure your wallet is unlocked and try again.');
      }

      const api = walletAPI as WalletAPI;

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
        body: JSON.stringify({ stakeAddress: walletAddress }),
      });

      if (!nonceResponse.ok) {
        const errorText = await nonceResponse.text();
        throw new Error(`Failed to get nonce from server: ${errorText}`);
      }

      const { nonce } = await nonceResponse.json();

      const payloadHex = stringToHex(nonce);
      
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
        if (verifyData.token) {
          document.cookie = `auth_token=${verifyData.token}; path=/; max-age=604800`;
        }

        sessionStorage.setItem('profile_setup', JSON.stringify({
          stakeAddress: walletAddress,
          roles: verifyData.roles || [],
        }));
        router.replace('/role-setup');
      } else if (verifyData.token) {
        document.cookie = `auth_token=${verifyData.token}; path=/; max-age=604800`;
        router.replace('/dashboard');
      } else {
        throw new Error('Invalid response from server');
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
