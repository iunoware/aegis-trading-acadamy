const path = require("path");
require("dotenv").config();

const { PrismaClient } = require("../src/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const usersCount = await prisma.user.count();
  const studentsCount = await prisma.user.count({ where: { role: 'STUDENT', deletedAt: null } });
  const subs = await prisma.subscription.findMany({ include: { plan: true } });
  const orders = await prisma.order.findMany({ include: { user: true, plan: true } });
  const payments = await prisma.payment.findMany();

  console.log("=== DB SUMMARY ===");
  console.log("Total Users:", usersCount);
  console.log("Students Count:", studentsCount);
  console.log("Subscriptions Count:", subs.length);
  console.log("Orders Count:", orders.length);
  console.log("Payments Count:", payments.length);

  console.log("\n=== SUBSCRIPTIONS ===");
  console.dir(subs, { depth: null });

  console.log("\n=== RECENT ORDERS ===");
  console.dir(orders, { depth: null });

  console.log("\n=== PAYMENTS ===");
  console.dir(payments, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
