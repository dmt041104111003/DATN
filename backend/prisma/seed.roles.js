const { PrismaClient } = require("@prisma/client");

const ROLES = [
  { code: "ENTERPRISE", name: "Enterprise" },
  { code: "AGENT", name: "Field logistics agent" },
  { code: "TRANSIT", name: "Transit" },
];

async function main() {
  const prisma = new PrismaClient();
  try {
    for (const r of ROLES) {
      await prisma.role.upsert({
        where: { code: r.code },
        create: { code: r.code, name: r.name },
        update: { name: r.name },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

