import { update } from "@/contract/scripts";

update().catch((err) => {
  console.error(err);
  process.exit(1);
});
