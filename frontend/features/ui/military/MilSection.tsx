"use client";

import type { ReactNode } from "react";

export function MilSection({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mil-section">
      <header className="mil-section__head">
        <span className="mil-section__index">{String(index).padStart(2, "0")}</span>
        <h3 className="mil-section__title">{title}</h3>
      </header>
      <div className="mil-section__body">{children}</div>
    </section>
  );
}

export function MilGrid({ children }: { children: ReactNode }) {
  return <div className="mil-grid">{children}</div>;
}
