import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EnterpriseHomePage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Producer & supply-chain workspace</CardTitle>
          <CardDescription>
            Issue traceability lots, maintain master data for farms, commodities, and
            certificates, and manage warehouse logistics for agri-food provenance.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
