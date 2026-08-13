import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Clean up existing data to prevent unique key collisions
  await prisma.feedbackTheme.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.report.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();

  // 2. Create Workspace
  const workspace = await prisma.workspace.create({
    data: { name: "Acme Corp (Demo)" }
  });

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 3. Create Users
  await prisma.user.createMany({
    data: [
      {
        name: "Demo Admin",
        email: "admin@acme.com",
        passwordHash: hashedPassword,
        role: Role.ADMIN,
        workspaceId: workspace.id
      },
      {
        name: "Demo Analyst",
        email: "analyst@acme.com",
        passwordHash: hashedPassword,
        role: Role.ANALYST,
        workspaceId: workspace.id
      },
      {
        name: "Demo Viewer",
        email: "viewer@acme.com",
        passwordHash: hashedPassword,
        role: Role.VIEWER,
        workspaceId: workspace.id
      }
    ],
    skipDuplicates: true // Prevents error if an email still collides
  });

  // 4. Create Feedbacks
  const sampleFeedbacks = [
    { content: "Onboarding took forever - I couldn't figure out how to invite my team.", channel: "Support Ticket", sentiment: "NEG", sentimentScore: -0.8 },
    { content: "The new dashboard is gorgeous and finally fast. Huge improvement.", channel: "App Store", sentiment: "POS", sentimentScore: 0.9 },
    { content: "It does the job, but the mobile experience needs work.", channel: "NPS Survey", sentiment: "NEU", sentimentScore: 0.1 },
    { content: "Prospect wants SSO before they'll sign - third time this month.", channel: "Sales Call", sentiment: "NEG", sentimentScore: -0.6 },
    { content: "Love the new export feature, saved me an hour today.", channel: "Community", sentiment: "POS", sentimentScore: 0.85 }
  ];

  for (const item of sampleFeedbacks) {
    await prisma.feedback.create({
      data: {
        content: item.content,
        channel: item.channel,
        sentiment: item.sentiment,
        sentimentScore: item.sentimentScore,
        workspaceId: workspace.id
      }
    });
  }

  console.log("Database successfully seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
  