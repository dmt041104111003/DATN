import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AgentHomePage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Agent workspace</CardTitle>
          <CardDescription>
            Warehouses and profile for logistics agents.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
