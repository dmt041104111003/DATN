import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log('Seeding database...');

  const services = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Best option for personal use & your next project.',
      price: 29,
      duration: 30,
    },
    {
      id: 'company',
      name: 'Company',
      description: 'Relevant for multiple users, extended & premium support.',
      price: 99,
      duration: 90,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Best for large scale uses and extended redistribution rights.',
      price: 499,
      duration: 365,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: service,
      create: service,
    });
    console.log(`Upserted service: ${service.name}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
