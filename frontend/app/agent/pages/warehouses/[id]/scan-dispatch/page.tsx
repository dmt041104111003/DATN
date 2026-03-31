import { ScanDispatchPage } from "./ScanDispatchPage";
import { AGENT_ROUTES } from "@/app/agent/constants/routes";

export default async function Page(props: { params: Promise<{ id: string }>; searchParams?: Promise<{ expected?: string }> }) {
  const params = await props.params;
  const id = String(params?.id || "").trim();
  const sp = props.searchParams ? await props.searchParams : {};
  const expected = String(sp?.expected || "").trim();
  return (
    <ScanDispatchPage
      warehouseId={id}
      expectedInventoryKey={expected || undefined}
      backHref={`${AGENT_ROUTES.warehouses}/${encodeURIComponent(id)}`}
    />
  );
}

