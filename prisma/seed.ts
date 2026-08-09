import { PrismaClient } from '@prisma/client';
import { pipeline } from '@xenova/transformers';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create a dummy Company
  const company = await prisma.company.create({
    data: { name: 'Acme Corp' },
  });
  console.log('Created Company:', company.id);

  // 2. Setup embedding pipeline
  console.log('Loading embedding model...');
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    quantized: true,
  });

  // 3. Create themes
  const themesData = [
    { name: 'Onboarding & Team Invites', description: 'Issues with inviting users and onboarding', color: '#6366f1', companyId: company.id },
    { name: 'Invoice & Billing Portal', description: 'Problems related to invoices or billing portal', color: '#f59e0b', companyId: company.id },
    { name: 'Enterprise SSO & Security', description: 'Feedback regarding SSO or SAML', color: '#10b981', companyId: company.id },
  ];

  const themes = await Promise.all(
    themesData.map((t) => prisma.theme.create({ data: t }))
  );
  console.log('Created Themes');

  // 4. Create some feedbacks
  const feedbacks = [
    {
      content: 'The new onboarding flow is very confusing, and invitations often expire.',
      channel: 'In-App',
      customerLabel: 'Pro',
      sentiment: 'NEG',
      sentimentScore: -0.8,
      status: 'NEW',
      companyId: company.id,
      themeId: themes[0].id,
    },
    {
      content: 'I need to download VAT invoices from the portal but the page times out.',
      channel: 'Support',
      customerLabel: 'Enterprise',
      sentiment: 'NEG',
      sentimentScore: -0.9,
      status: 'NEW',
      companyId: company.id,
      themeId: themes[1].id,
    },
    {
      content: 'SAML SSO integration was flawless, thanks!',
      channel: 'Zendesk',
      customerLabel: 'Enterprise',
      sentiment: 'POS',
      sentimentScore: 0.9,
      status: 'RESOLVED',
      companyId: company.id,
      themeId: themes[2].id,
    },
  ];

  for (const item of feedbacks) {
    const { themeId, ...feedbackData } = item;
    
    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        ...(feedbackData as any),
        themes: {
          create: [{ themeId }]
        }
      },
    });

    // Create embedding
    const output = await extractor(feedback.content, { pooling: 'mean', normalize: true });
    const vector = Array.from(output.data);
    
    // Insert vector using raw SQL
    await prisma.$executeRaw`
      INSERT INTO "Embedding" ("id", "feedbackId", "vector")
      VALUES (gen_random_uuid(), ${feedback.id}, ${vector}::vector)
    `;
    console.log('Created feedback & embedding:', feedback.id);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
