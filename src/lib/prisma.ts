import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prismaBase = new PrismaClient({ adapter });

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
