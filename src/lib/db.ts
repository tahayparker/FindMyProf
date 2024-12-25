import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    },
  },
  log: ['query', 'error', 'warn'],
});

// Only use accelerate in production
const client = process.env.NODE_ENV === 'production' 
  ? prisma.$extends(withAccelerate())
  : prisma;

export default client;