import { PrismaClient } from '@prisma/client';

// Create a separate Prisma instance for testing
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Clean database before each test
beforeEach(async () => {
  await testPrisma.inventoryLog.deleteMany();
  await testPrisma.sweet.deleteMany();
  await testPrisma.user.deleteMany();
});

// Close database connection after all tests
afterAll(async () => {
  await testPrisma.$disconnect();
});