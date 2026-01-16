"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new client_1.PrismaClient({ adapter: new adapter_pg_1.PrismaPg(pool) });
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
//# sourceMappingURL=seed.js.map