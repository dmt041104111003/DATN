import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Hello World",
  description: "Simple Next.js Hello World app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
