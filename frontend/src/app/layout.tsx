import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { AlertProvider } from "@/contexts/alert-context";
import { ConfirmProvider } from "@/contexts/confirm-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HSupply - Product Origin Traceability",
    template: "%s | HSupply",
  },
  description: "Blockchain-powered product origin traceability system on Cardano. Verify authenticity and trace complete product history.",
  keywords: ["product traceability", "supply chain", "blockchain", "Cardano", "NFT", "origin verification"],
  authors: [{ name: "HSupply" }],
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "HSupply - Product Origin Traceability",
    description: "Blockchain-powered product origin traceability on Cardano",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AlertProvider>
            <ConfirmProvider>{children}</ConfirmProvider>
          </AlertProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
