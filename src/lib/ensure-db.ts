import { prisma } from "@/lib/prisma";

let ensured = false;

export async function ensurePackageBundleTable() {
  if (ensured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`packagebundle\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`name\` VARCHAR(191) NOT NULL,
        \`subtitle\` VARCHAR(191) NOT NULL DEFAULT '',
        \`tier\` VARCHAR(191) NOT NULL DEFAULT 'Premium',
        \`items\` TEXT NOT NULL,
        \`totalPrice\` DOUBLE NOT NULL DEFAULT 0,
        \`discountPrice\` DOUBLE NOT NULL DEFAULT 0,
        \`finalPrice\` DOUBLE NOT NULL DEFAULT 0,
        \`platformsIncluded\` TEXT NULL,
        \`deliverables\` TEXT NULL,
        \`paymentTerms\` TEXT NULL,
        \`specialNote\` VARCHAR(191) NOT NULL DEFAULT '',
        \`sortOrder\` INT NOT NULL DEFAULT 0,
        \`isActive\` BOOLEAN NOT NULL DEFAULT true,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    ensured = true;
  } catch (err) {
    console.warn("Auto-migration note:", err);
  }
}

