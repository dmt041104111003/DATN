import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TransitHomePage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Transit workspace</CardTitle>
          <CardDescription>
            Warehouses and operator profile aligned with field logistics and transit workflows.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
