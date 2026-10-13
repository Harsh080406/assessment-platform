const fs = require("fs");
const path = require("path");

// Load .env file
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        const val = valueParts.join("=").replace(/^["']|["']$/g, "");
        process.env[key.trim()] = val;
      }
    }
  });
}

// Try pooler port 6543 or 5432 with pgbouncer/sslmode
if (process.env.DATABASE_URL) {
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl.includes("pgbouncer=true")) {
    dbUrl += (dbUrl.includes("?") ? "&" : "?") + "pgbouncer=true&connection_limit=1";
  }
  process.env.DATABASE_URL = dbUrl;
}

const { PrismaClient, UserRole, UserStatus, AuthType } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function resetAdmin() {
  console.log("Connecting to database with URL:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"));
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const accounts = [
    { email: "admin@aurapath.com", role: UserRole.ADMIN },
    { email: "staff@aurapath.com", role: UserRole.STAFF },
    { email: "student@aurapath.com", role: UserRole.STUDENT },
    { email: "admin@alderwoodvantage.com", role: UserRole.ADMIN },
    { email: "staff@alderwoodvantage.com", role: UserRole.STAFF },
    { email: "student@alderwoodvantage.com", role: UserRole.STUDENT },
  ];

  for (const acc of accounts) {
    const user = await prisma.user.upsert({
      where: { email: acc.email },
      update: {
        passwordHash,
        role: acc.role,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
      },
      create: {
        email: acc.email,
        passwordHash,
        role: acc.role,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
      },
    });

    const auth = await prisma.authMethod.findFirst({
      where: { userId: user.id, type: AuthType.PASSWORD },
    });
    if (!auth) {
      await prisma.authMethod.create({
        data: { userId: user.id, type: AuthType.PASSWORD },
      });
    }
  }

  console.log("✓ Successfully verified & updated credentials in database:");
  console.log("  ----------------------------------------------");
  console.log("  ADMIN:   admin@alderwoodvantage.com   / Password123!");
  console.log("  STAFF:   staff@alderwoodvantage.com   / Password123!");
  console.log("  STUDENT: student@alderwoodvantage.com / Password123!");
  console.log("  ----------------------------------------------");

  await prisma.$disconnect();
}

resetAdmin().catch((err) => {
  console.error("Error resetting admin:", err);
  process.exit(1);
});
