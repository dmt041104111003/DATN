import { queryTracking } from "@/contract/scripts";

queryTracking().catch((err) => {
  console.error(err);
  process.exit(1);
});
