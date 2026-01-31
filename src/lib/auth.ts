import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: process.env.APP_URL ? [process.env.APP_URL] : [],
  session: ({
    cookie: {
      name: "better-auth.session_token",
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  } as unknown) as any,
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false, // Set to false for development - users auto-verified
  },
  emailVerification: {
    sendOnSignUp: false, // Do not send verification email on signup
    autoSignInAfterVerification: true,
    // sendVerificationEmail is not needed when sendOnSignUp is false
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});

//
// GOOGLE_CLIENT_ID
// GOOGLE_CLIENT_SECRET
