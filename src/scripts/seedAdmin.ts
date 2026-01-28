import "dotenv/config";
import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";

async function seedAdmin() {
  try {
    console.log("***** Admin Seeding Started....");
    const adminData = {
      name: "Admin",
      email: "admin@admin.com",
      role: UserRole.ADMIN,
      password: "admin1234",
    };
    console.log("***** Checking Admin Exist or not");
    // check user exist on db or not
    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });

    if (existingUser) {
      throw new Error("User already exists!!");
    }

    const backendUrl =
      process.env.BETTER_AUTH_URL ||
      `http://localhost:${process.env.PORT || 5000}`;

    console.log(
      `***** Creating admin via ${backendUrl}/api/auth/sign-up/email`,
    );

    const signUpAdmin = await fetch(`${backendUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: backendUrl, // Required by better-auth
      },
      body: JSON.stringify(adminData),
    });

    if (signUpAdmin.ok) {
      console.log("**** Admin created");
      await prisma.user.update({
        where: {
          email: adminData.email,
        },
        data: {
          emailVerified: true,
        },
      });

      console.log("**** Email verification status updated!");
      console.log("******* SUCCESS ******");
      console.log(`Admin can now login with:`);
      console.log(`  Email: ${adminData.email}`);
      console.log(`  Password: ${adminData.password}`);
    } else {
      const error = await signUpAdmin.json();
      throw new Error(`Failed to create admin: ${JSON.stringify(error)}`);
    }
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1); // Exit with error code
  }
}

seedAdmin();
