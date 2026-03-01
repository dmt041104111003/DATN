import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

function createPgPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Missing DATABASE_URL for Prisma/Postgres connection");
  }

  let ssl: false | { rejectUnauthorized: boolean } | undefined = undefined;
  try {
    const parsed = new URL(url);
    const sslmode = (parsed.searchParams.get("sslmode") ?? "").toLowerCase();
    if (sslmode && sslmode !== "disable") {
      ssl = {
        rejectUnauthorized: sslmode === "verify-full",
      };
    }
  } catch {
  }

  return new Pool({
    connectionString: url,
    ssl,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

const pool = createPgPool();

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await pool.end();
  }
}

