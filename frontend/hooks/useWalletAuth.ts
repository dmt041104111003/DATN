import { useEffect, useState } from "react";

const SETUP_PROFILE_KEY = "pending_profile_setup";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

type WalletAPI = {
  getChangeAddress: () => Promise<string | { address: string }>;
  getRewardAddresses?: () => Promise<string[]>;
  signData?: (address: string, payload: string) => Promise<{ signature: string; key: string }>;
  experimental?: any;
  enable?: () => Promise<unknown>;
};

type SetupProfileState = {
  walletAddress: string;
  roles: Array<{ id: number; code: string; name?: string | null }>;
};

export function readSetupProfileState(): SetupProfileState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(SETUP_PROFILE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SetupProfileState;
    if (!parsed || !parsed.walletAddress) return null;

    return parsed;
  } catch {
    return null;
  }
}

function getAddress(value: any) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object" && typeof value.address === "string") return value.address.trim();
  if (value.paymentAddress) return String(value.paymentAddress).trim();
  if (value.walletAddress) return String(value.walletAddress).trim();
  if (value.sub) return String(value.sub).trim();
  return "";
}

function homePathForRole(role: string | null | undefined) {
  const code = String(role || "").toUpperCase();
  if (code === "TRANSIT") return "/transit";
  if (code === "AGENT") return "/agent";
  return "/enterprise";
}

async function getNonce(walletAddress: string) {
  const response = await fetch(`${BACKEND_URL}/auth/nonce`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ stakeAddress: walletAddress }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get nonce from server: ${errorText}`);
  }

  const json = await response.json();
  const nonce = String(json?.nonce || "").trim();
  if (!nonce) throw new Error("Server returned empty nonce.");

  return nonce;
}

async function signNonce(api: WalletAPI, walletAddress: string, nonce: string) {
  let signer = api.signData;
  if (!signer && api.experimental) signer = api.experimental.signData;
  if (!signer) throw new Error("Wallet does not support data signing");

  let rewardAddresses: string[] = [];

  try {
    if (api.getRewardAddresses) {
      const rows = await api.getRewardAddresses();
      if (Array.isArray(rows)) rewardAddresses = rows;
    }
  } catch {}

  let signAddress = walletAddress;
  if (rewardAddresses.length > 0) signAddress = rewardAddresses[0];

  return signer(signAddress, nonce);
}

async function verifyWallet(walletAddress: string, nonce: string, signed: { signature: string; key: string }) {
  const response = await fetch(`${BACKEND_URL}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      stakeAddress: walletAddress,
      nonce,
      signature: signed.signature,
      key: signed.key,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to verify signature");
  }

  return response.json();
}

export function useWalletAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setup, setSetup] = useState<SetupProfileState | null>(null);

  const loginWithWallet = async (walletId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const cardano = (window as any).cardano;
      if (!cardano) {
        throw new Error("Không tìm thấy ví Cardano. Hãy cài extension ví (Eternl, Nami, Lace, Flint…).");
      }

      const walletEntry = cardano[walletId] as WalletAPI | undefined;
      if (!walletEntry || typeof walletEntry.enable !== "function") {
        throw new Error(`Không kết nối được ví "${walletId}". Kiểm tra extension đã bật.`);
      }

      const api = (await walletEntry.enable()) as WalletAPI;
      const walletAddress = getAddress(await api.getChangeAddress());
      if (!walletAddress) throw new Error("Unable to get wallet address");
      const nonce = await getNonce(walletAddress);
      const signed = await signNonce(api, walletAddress, nonce);
      const verifyData = await verifyWallet(walletAddress, nonce, signed);

      if (verifyData.needProfile) {
        const roles = Array.isArray(verifyData.roles) ? verifyData.roles : [];
        const setupState = { walletAddress, roles };
        window.sessionStorage.setItem(SETUP_PROFILE_KEY, JSON.stringify(setupState));
        window.location.assign("/admin#/login");
      } else {
        window.sessionStorage.removeItem(SETUP_PROFILE_KEY);
        const roleCode = verifyData.profile?.roleCode || verifyData.profile?.role;
        window.location.assign(homePathForRole(roleCode));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const hydrate = async () => {
      const pending = readSetupProfileState();
      if (pending) {
        setSetup(pending);
        return;
      }

      const meResponse = await fetch(`${BACKEND_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      }).catch(() => null);
      if (!meResponse || !meResponse.ok) return;

      const meJson = await meResponse.json();
      const hasRole = meJson?.profile?.roleCode || meJson?.user?.roleCode || meJson?.user?.role;
      if (hasRole) {
        const target = homePathForRole(hasRole);
        const currentPath = window.location.pathname;
        const isAuthEntry =
          currentPath === "/" ||
          currentPath.startsWith("/admin");
        if (isAuthEntry && currentPath !== target) {
          window.location.assign(target);
        }
        return;
      }

      const walletAddress = getAddress(meJson?.user);
      if (!walletAddress) return;

      const rolesResponse = await fetch(`${BACKEND_URL}/auth/roles`, {
        method: "GET",
        credentials: "include",
      }).catch(() => null);

      let roles = [];
      if (rolesResponse && rolesResponse.ok) {
        const rows = await rolesResponse.json();
        if (Array.isArray(rows)) roles = rows;
      }

      setSetup({ walletAddress, roles });
    };

    hydrate().catch(() => undefined);
  }, []);

  let firstRoleCode = "";
  if (setup && Array.isArray(setup.roles) && setup.roles.length > 0) {
    firstRoleCode = String(setup.roles[0]?.code || "");
  }

  const walletAddress = setup ? setup.walletAddress : "";
  const setupDefaults = { walletAddress, displayName: "", roleCode: firstRoleCode, phoneNumber: "" };

  return {
    loginWithWallet,
    isLoading,
    error,
    setup,
    setupDefaults,
  };
}
