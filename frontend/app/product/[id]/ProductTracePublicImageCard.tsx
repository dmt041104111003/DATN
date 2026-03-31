"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function ProductTracePublicImageCard({
  imageUrl,
  title,
}: {
  imageUrl: string;
  title: string;
}) {
  const [src, setSrc] = React.useState<string>("");

  React.useEffect(() => {
    setSrc(String(imageUrl || "").trim());
  }, [imageUrl]);

  return (
    <Card className="order-1 flex max-h-[min(48vh,18rem)] min-h-0 flex-col gap-0 overflow-hidden rounded-none py-0 lg:h-full lg:max-h-none lg:order-none">
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        {src ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={src}
              src={src}
              alt={title}
              className="min-h-[10rem] w-full min-w-0 flex-1 object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                setSrc("/logo.png");
              }}
            />
          </>
        ) : (
          <div className="bg-muted/40 flex min-h-[8rem] flex-1 flex-col items-center justify-center px-4 py-8">
            <p className="text-muted-foreground text-center text-base italic">
              No product image on file for this lot.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

