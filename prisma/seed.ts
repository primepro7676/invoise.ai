import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// =========================================================
// DATABASE CONNECTION
// =========================================================

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT || "3306"),
  user: process.env.DATABASE_USER || "u509897240_sales",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "u509897240_myinvoise",
  connectionLimit: 5,
});

const prisma = new PrismaClient({
  adapter,
});

// =========================================================
// MAIN
// =========================================================

async function main() {
  console.log("");
  console.log("==========================================");
  console.log("       STARTING DATABASE SEED");
  console.log("==========================================");

  // =========================================================
  // ADMIN USER
  // =========================================================

  const email = (
    process.env.SEED_ADMIN_EMAIL || "admin@primepro.ai"
  )
    .trim()
    .toLowerCase();

  const password =
    process.env.SEED_ADMIN_PASSWORD || "Admin@789";

  if (!email || !password) {
    throw new Error("Admin email or password is missing.");
  }

  console.log("");
  console.log("Creating/updating admin...");
  console.log(`Admin email: ${email}`);

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.admin.findUnique({
    where: {
      email,
    },
  });

  let admin;

  if (existingAdmin) {
    admin = await prisma.admin.update({
      where: {
        id: existingAdmin.id,
      },
      data: {
        name: "Admin",
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("Existing admin updated successfully.");
  } else {
    admin = await prisma.admin.create({
      data: {
        id: crypto.randomUUID(),
        name: "Admin",
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("New admin created successfully.");
  }

  console.log(`Admin ID: ${admin.id}`);

  // =========================================================
  // COMPANY SETTINGS
  // =========================================================

  console.log("");
  console.log("Creating company settings...");

  await prisma.companySettings.upsert({
    where: {
      id: "singleton",
    },
    update: {},
    create: {
      id: "singleton",
    },
  });

  // =========================================================
  // GENERAL TERMS
  // =========================================================

  console.log("Creating general terms...");

  await prisma.generalTerms.upsert({
    where: {
      id: "singleton",
    },
    update: {},
    create: {
      id: "singleton",
    },
  });

  // =========================================================
  // SERVICE CATEGORIES
  // =========================================================

  const categories: {
    name: string;
    sortOrder: number;
    packages: {
      name: string;
      price: number;
      isCustom?: boolean;
    }[];
    terms: string;
  }[] = [
    {
      name: "Website Development",
      sortOrder: 1,

      packages: [
        {
          name: "Premium",
          price: 10000,
        },
        {
          name: "Pro",
          price: 15000,
        },
        {
          name: "Ultra Pro",
          price: 25000,
        },
        {
          name: "Custom Price",
          price: 0,
          isCustom: true,
        },
      ],

      terms:
        "1. Development covers the pages and features agreed with the customer.\n" +
        "2. Customer shall provide required content, images, logo and business information.\n" +
        "3. Additional features or revisions outside the agreed scope may be charged separately.\n" +
        "4. Domain, hosting and third-party services are separate unless included in the selected package.\n" +
        "5. Final deployment is subject to the agreed payment and delivery terms.",
    },

    {
      name: "Application Development",
      sortOrder: 2,

      packages: [
        {
          name: "Package 1",
          price: 75000,
        },
        {
          name: "Package 2",
          price: 80000,
        },
        {
          name: "Package 3",
          price: 85000,
        },
        {
          name: "Custom Price",
          price: 0,
          isCustom: true,
        },
      ],

      terms:
        "1. Development covers the platforms (iOS/Android/Web) and features agreed with the customer.\n" +
        "2. Source code delivery and third-party licensing are as per the agreed scope.\n" +
        "3. Additional features, integrations, or platform ports may be charged separately.\n" +
        "4. App store publishing fees (Apple/Google) are borne by the customer unless included.\n" +
        "5. Final delivery is subject to the agreed payment and testing sign-off.",
    },

    {
      name: "WhatsApp API",
      sortOrder: 3,

      packages: [
        {
          name: "Starter",
          price: 5000,
        },
        {
          name: "Growth",
          price: 12000,
        },
        {
          name: "Enterprise",
          price: 25000,
        },
        {
          name: "Custom Price",
          price: 0,
          isCustom: true,
        },
      ],

      terms:
        "1. API setup is subject to applicable WhatsApp and third-party platform requirements.\n" +
        "2. Template approvals, messaging limits and third-party charges are governed by the provider.\n" +
        "3. Additional integrations or custom workflows may be charged separately.",
    },

    {
      name: "Lead Generation",
      sortOrder: 4,

      packages: [
        {
          name: "Basic",
          price: 8000,
        },
        {
          name: "Standard",
          price: 15000,
        },
        {
          name: "Advanced",
          price: 30000,
        },
        {
          name: "Custom Price",
          price: 0,
          isCustom: true,
        },
      ],

      terms:
        "1. Lead generation campaigns are run on the agreed platforms and budget.\n" +
        "2. Ad spend, if any, is separate from the service fee unless included.\n" +
        "3. Lead quality is subject to market conditions and targeting parameters agreed upon.\n" +
        "4. Reporting and optimization frequency is as per the selected package.",
    },

    {
      name: "Business Automation",
      sortOrder: 5,

      packages: [
        {
          name: "Essential",
          price: 12000,
        },
        {
          name: "Professional",
          price: 25000,
        },
        {
          name: "Enterprise",
          price: 45000,
        },
        {
          name: "Custom Price",
          price: 0,
          isCustom: true,
        },
      ],

      terms:
        "1. Automation covers the workflows and integrations agreed with the customer.\n" +
        "2. Third-party software, API and subscription charges are separate unless included in the package.\n" +
        "3. Additional workflows or integrations may be charged separately.",
    },
  ];

  // =========================================================
  // CREATE / UPDATE CATEGORIES
  // =========================================================

  console.log("");
  console.log("Creating service categories...");

  for (const categoryData of categories) {
    console.log(`Processing: ${categoryData.name}`);

    const category = await prisma.serviceCategory.upsert({
      where: {
        name: categoryData.name,
      },

      update: {
        sortOrder: categoryData.sortOrder,
      },

      create: {
        name: categoryData.name,
        sortOrder: categoryData.sortOrder,
      },
    });

    // =======================================================
    // PACKAGES
    // =======================================================

    for (const [index, packageData] of categoryData.packages.entries()) {
      const existingPackage = await prisma.package.findFirst({
        where: {
          categoryId: category.id,
          name: packageData.name,
        },
      });

      if (existingPackage) {
        await prisma.package.update({
          where: {
            id: existingPackage.id,
          },

          data: {
            price: packageData.price,
            isCustom: Boolean(packageData.isCustom),
            sortOrder: index,
          },
        });
      } else {
        await prisma.package.create({
          data: {
            categoryId: category.id,
            name: packageData.name,
            price: packageData.price,
            isCustom: Boolean(packageData.isCustom),
            sortOrder: index,
          },
        });
      }
    }

    // =======================================================
    // TERMS AND CONDITIONS
    // =======================================================

    await prisma.termsAndConditions.upsert({
      where: {
        categoryId: category.id,
      },

      update: {
        content: categoryData.terms,
      },

      create: {
        categoryId: category.id,
        content: categoryData.terms,
      },
    });
  }

  // =========================================================
  // SUCCESS
  // =========================================================

  console.log("");
  console.log("==========================================");
  console.log("        DATABASE SEED COMPLETE");
  console.log("==========================================");
  console.log("");
  console.log("ADMIN LOGIN DETAILS");
  console.log("------------------------------------------");
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log("------------------------------------------");
  console.log("");
  console.log("Admin account created/updated successfully.");
  console.log("");
  console.log("==========================================");
}

// =========================================================
// RUN SEED
// =========================================================

main()
  .catch((error) => {
    console.error("");
    console.error("==========================================");
    console.error("❌ DATABASE SEED FAILED");
    console.error("==========================================");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });