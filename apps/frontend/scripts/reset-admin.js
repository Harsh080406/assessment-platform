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

  // 1. Upsert Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@aurapath.com" },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
    create: {
      email: "admin@aurapath.com",
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  });

  const adminAuth = await prisma.authMethod.findFirst({
    where: { userId: admin.id, type: AuthType.PASSWORD },
  });
  if (!adminAuth) {
    await prisma.authMethod.create({
      data: { userId: admin.id, type: AuthType.PASSWORD },
    });
  }

  // 2. Upsert Staff
  const staff = await prisma.user.upsert({
    where: { email: "staff@aurapath.com" },
    update: {
      passwordHash,
      role: UserRole.STAFF,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
    create: {
      email: "staff@aurapath.com",
      passwordHash,
      role: UserRole.STAFF,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  });

  const staffAuth = await prisma.authMethod.findFirst({
    where: { userId: staff.id, type: AuthType.PASSWORD },
  });
  if (!staffAuth) {
    await prisma.authMethod.create({
      data: { userId: staff.id, type: AuthType.PASSWORD },
    });
  }

  // 3. Upsert Student
  const student = await prisma.user.upsert({
    where: { email: "student@aurapath.com" },
    update: {
      passwordHash,
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
    create: {
      email: "student@aurapath.com",
      passwordHash,
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  });

  const studentAuth = await prisma.authMethod.findFirst({
    where: { userId: student.id, type: AuthType.PASSWORD },
  });
  if (!studentAuth) {
    await prisma.authMethod.create({
      data: { userId: student.id, type: AuthType.PASSWORD },
    });
  }

  console.log("✓ Successfully verified & updated credentials in database:");
  console.log("  ----------------------------------------------");
  console.log("  ADMIN:   admin@aurapath.com   / Password123!");
  console.log("  STAFF:   staff@aurapath.com   / Password123!");
  console.log("  STUDENT: student@aurapath.com / Password123!");
  console.log("  ----------------------------------------------");

  await prisma.$disconnect();
}

resetAdmin().catch((err) => {
  console.error("Error resetting admin:", err);
  process.exit(1);
});
