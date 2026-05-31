"use client";

import type { ReactNode } from "react";
import "@/features/public/shared/gov-bg.css";
import "./auth-page.css";

type Props = {
  title: string;
  subtitle?: string;
  onLogout?: () => void;
  children: ReactNode;
};

export function AuthPageShell({ title, subtitle, onLogout, children }: Props) {
  return (
    <div className="gov-bg auth-page mil-admin min-h-screen">
      <div className="auth-page__wrap">
        <header className="auth-page__header">
          <img src="/gov.png" alt="" className="auth-page__logo" />
          <div className="auth-page__titles">
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {onLogout ? (
            <button type="button" className="auth-page__logout" onClick={onLogout}>
              Đăng xuất
            </button>
          ) : null}
        </header>
        <div className="auth-page__card">{children}</div>
      </div>
    </div>
  );
}
