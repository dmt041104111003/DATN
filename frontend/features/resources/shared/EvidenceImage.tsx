"use client";

import * as React from "react";
import { ipfsGatewayUrls } from "@/features/resources/shared/evidenceFiles";

export function EvidenceImage({
  uri,
  alt,
  className,
}: {
  uri: string;
  alt: string;
  className?: string;
}) {
  const urls = React.useMemo(() => ipfsGatewayUrls(uri), [uri]);
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => setIndex(0), [uri]);
  const src = urls[index] || "";

  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        setIndex((prev) => (prev + 1 < urls.length ? prev + 1 : prev));
      }}
    />
  );
}
