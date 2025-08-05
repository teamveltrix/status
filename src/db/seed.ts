import { auth } from "@/lib/auth";
import readline from "readline";
import "dotenv/config";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create a default user
  console.log("Creating default user...");

  // ask password input from user
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter password for the default user: ", async (password) => {
    rl.close();

    try {
      await auth.api.signUpEmail({
        body: {
          name: "Admin User",
          email: "raic_dev@proton.me",
          password: password,
        },
      });
    } catch (error) {
      console.error("❌ Error creating default user:", error);
      process.exit(1);
    }
  });
}

seed();
