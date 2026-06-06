import { burn } from "@/contract/scripts";

burn().catch((err) => {
  console.error(err);
  process.exit(1);
});
