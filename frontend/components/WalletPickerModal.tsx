"use client";

import * as React from "react";
import { BrowserWallet } from "@meshsdk/wallet";

export type CardanoWalletOption = {
  id: string;
  name: string;
  icon: string;
  version: string;
};

type WalletPickerModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (walletId: string) => void;
  isLoading?: boolean;
};

export function WalletPickerModal({ open, onClose, onSelect, isLoading }: WalletPickerModalProps) {
  const [wallets, setWallets] = React.useState<CardanoWalletOption[]>([]);

  React.useEffect(() => {
    if (!open) return;
    setWallets(BrowserWallet.getInstalledWallets() as CardanoWalletOption[]);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md overflow-hidden bg-white border border-[#e8c4ca] rounded-sm shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-stretch bg-gradient-to-r from-[#8f1529] via-[#c41e3a] to-[#a81830] text-white border-l-4 border-[#d4af37]">
          <span className="flex items-center px-3 py-2 font-bold font-mono text-xs bg-black/20 tracking-wider">VÍ</span>
          <h2 id="wallet-picker-title" className="flex items-center m-0 px-3 py-2 text-sm font-bold uppercase tracking-wider">
            Chọn ví Cardano
          </h2>
        </div>
        <div className="p-4 space-y-3 bg-white">
          {wallets.length === 0 ? (
            <p className="text-sm text-gray-700 text-center py-4">
              Chưa phát hiện ví Cardano. Cài extension Eternl, Nami, Lace, Flint… rồi tải lại trang.
            </p>
          ) : (
            <ul className="space-y-2">
              {wallets.map((wallet) => (
                <li key={wallet.id}>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => onSelect(wallet.id)}
                    className="w-full flex items-center gap-3 p-3 border border-[#e8c4ca] rounded-sm hover:bg-[#fdf5f6] hover:border-[#c41e3a] transition-colors disabled:opacity-60 text-left"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={wallet.icon} alt="" className="w-9 h-9 rounded-sm object-contain" />
                    <span className="flex-1 font-semibold text-[#8f1529]">{wallet.name}</span>
                    <span className="text-xs text-gray-500">v{wallet.version}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full border-2 border-[#c41e3a] text-[#c41e3a] font-bold py-2.5 text-sm rounded-sm hover:bg-[#fdf5f6]"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
