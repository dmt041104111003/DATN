import { ScanDispatchPage } from "./ScanDispatchPage";
import { TRANSIT_ROUTES } from "@/app/transit/constants/routes";

export default async function Page(props: { params: Promise<{ id: string }>; searchParams?: Promise<{ expected?: string }> }) {
  const params = await props.params;
  const id = String(params?.id || "").trim();
  const sp = props.searchParams ? await props.searchParams : {};
  const expected = String(sp?.expected || "").trim();
  return (
    <ScanDispatchPage
      warehouseId={id}
      expectedInventoryKey={expected || undefined}
      backHref={`${TRANSIT_ROUTES.warehouses}/${encodeURIComponent(id)}`}
    />
  );
}

