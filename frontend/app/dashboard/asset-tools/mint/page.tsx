"use client";

import * as React from "react";
import { AssetForm } from "../AssetForm";

export default function MintPage() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <AssetForm mode="mint" />
    </div>
  );
}

