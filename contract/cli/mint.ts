import { mint } from "@/contract/scripts";

mint().catch((err) => {
  console.error(err);
  process.exit(1);
});
