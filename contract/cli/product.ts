import { queryProduct } from "@/contract/scripts";

queryProduct().catch((err) => {
  console.error(err);
  process.exit(1);
});
