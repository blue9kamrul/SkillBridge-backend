import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const connectionString = `${process.env.DATABASE_URL}`;

// Configure connection pool with higher timeout and connection limits
const pool = new pg.Pool({
  connectionString,
  connectionTimeoutMillis: 30000, // 30 seconds
  max: 10, // Maximum pool size
  idleTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool);
const prismaBase = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

// Use Prisma extension to override emailVerified false to true
const prisma = prismaBase.$extends({
  query: {
    user: {
      async create({ args, query }) {
        if (
          args.data &&
          "emailVerified" in args.data &&
          args.data.emailVerified === false
        ) {
          args.data.emailVerified = true;
        }
        return query(args);
      },
      async update({ args, query }) {
        if (
          args.data &&
          "emailVerified" in args.data &&
          args.data.emailVerified === false
        ) {
          args.data.emailVerified = true;
        }
        return query(args);
      },
    },
  },
});

export { prisma };
