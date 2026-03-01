import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";
import "../styles/landing.css";
import "../styles/globe.min.151d0a8243e1.css";
import "../styles/globe.override.css";

export const metadata = {
  title: "Trace.Lab3 - Origin Traceability",
  description: "Trace.Lab3 - Origin Traceability",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Script
          src="https://code.jquery.com/jquery-3.6.0.min.js"
          strategy="beforeInteractive"
        />
        <Script src="/js/d3.min.js" strategy="beforeInteractive" />
        <Script src="/js/topojson.min.js" strategy="beforeInteractive" />
        <Script src="/js/animation-data.js" strategy="beforeInteractive" />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"
          strategy="beforeInteractive"
        />
        <Script src="/js/globe.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
