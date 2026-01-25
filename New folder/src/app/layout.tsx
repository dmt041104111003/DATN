import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const lexend = Lexend({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: {
    default: "HSupply - Product Origin Traceability",
    template: "%s | HSupply",
  },
  description: "Blockchain-powered product origin traceability system on Cardano. Verify authenticity and trace complete product history.",
  keywords: ["product traceability", "supply chain", "blockchain", "Cardano", "NFT", "origin verification"],
  authors: [{ name: "HSupply" }],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "HSupply - Product Origin Traceability",
    description: "Blockchain-powered product origin traceability on Cardano",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className={lexend.className}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
