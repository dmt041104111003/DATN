import PublicTraceScanResultPage from "@/features/public/trace-scan-result/page";

type PageProps = {
  params: Promise<{ inventoryKey: string }>;
};

export default async function Page({ params }: PageProps) {
  const resolved = await params;
  const inventoryKey = decodeURIComponent(String(resolved?.inventoryKey || ""));
  return <PublicTraceScanResultPage inventoryKey={inventoryKey} />;
}

