import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthStore {
  user: User | null;
  walletId: string | null;
  setUser: (user: User | null, walletId?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      walletId: null,

      setUser: (user, walletId) => {
        set({
          user,
          walletId: walletId || null,
        });
      },

      logout: () => {
        set({ user: null, walletId: null })
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage")
        }
      },
    }),
    { name: "auth-storage" }
  )
);
