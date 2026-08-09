import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getAIModel } from '@/lib/ai';
import { PrismaClient } from '@prisma/client';
import { pipeline } from '@xenova/transformers';

const prisma = new PrismaClient();

let extractorPipeline: any = null;
async function getExtractor() {
  if (!extractorPipeline) {
    extractorPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true,
    });
  }
  return extractorPipeline;
}

export async function POST(req: Request) {
  try {
    const { content, channel = 'In-App', customerLabel = 'Standard', companyId } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Get the first company if companyId is not provided
    let finalCompanyId = companyId;
    if (!finalCompanyId) {
      const company = await prisma.company.findFirst();
      if (!company) {
        return NextResponse.json({ error: 'No company found. Please run seed script.' }, { status: 500 });
      }
      finalCompanyId = company.id;
    }

    // 1. Ask AI to classify using Vercel AI SDK (works with Claude OR Gemini)
    let sentiment = 'NEU';
    let sentimentScore = 0;
    let themes: string[] = ['General'];

    try {
      const { text } = await generateText({
        model: getAIModel('fast'),
        prompt: `You are a customer feedback classifier. Respond ONLY with a valid JSON object (no markdown, no code fences).
Classify this customer feedback into the following fields:
- sentiment: "POS", "NEG", or "NEU"
- sentimentScore: number from -1.0 to 1.0
- themes: array of 1-3 short theme strings (e.g. ["Onboarding", "Billing"])
- aiRationale: one sentence explanation

Feedback: "${content}"`,
      });

      // Parse the JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        sentiment = parsed.sentiment ?? 'NEU';
        sentimentScore = parsed.sentimentScore ?? 0;
        themes = parsed.themes ?? ['General'];
      }
    } catch (e) {
      console.error('AI classification failed:', e);
    }

    // 2. Ensure themes exist in the database
    const themeRecords = await Promise.all(
      themes.map(async (themeName: string) => {
        let theme = await prisma.theme.findFirst({ where: { name: themeName, companyId: finalCompanyId } });
        if (!theme) {
          theme = await prisma.theme.create({ data: { name: themeName, companyId: finalCompanyId, color: '#94a3b8' } });
        }
        return theme;
      })
    );

    // 3. Save feedback to database
    const feedback = await prisma.feedback.create({
      data: {
        content,
        channel,
        customerLabel,
        sentiment,
        sentimentScore,
        companyId: finalCompanyId,
        themes: {
          create: themeRecords.map((t: any) => ({ themeId: t.id }))
        }
      }
    });

    // 4. Generate local embedding and save via raw SQL
    try {
      const extractor = await getExtractor();
      const output = await extractor(content, { pooling: 'mean', normalize: true });
      const vector = Array.from(output.data);

      await prisma.$executeRaw`
        INSERT INTO "Embedding" ("id", "feedbackId", "vector")
        VALUES (gen_random_uuid(), ${feedback.id}, ${vector}::vector)
      `;
    } catch (e) {
      console.error('Failed to generate embedding:', e);
    }

    return NextResponse.json({ id: feedback.id, sentiment, sentimentScore, themes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
