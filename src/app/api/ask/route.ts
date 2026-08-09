import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getAIModel } from '@/lib/ai';
import { prisma } from '@/lib/prisma';
import { pipeline } from '@xenova/transformers';

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
    const { question } = await req.json();
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // 1. Embed the question locally
    let vector: number[] = [];
    try {
      const extractor = await getExtractor();
      const output = await extractor(question, { pooling: 'mean', normalize: true });
      vector = Array.from(output.data);
    } catch (e) {
      console.error('Failed to generate embedding for question:', e);
      return NextResponse.json({ error: 'Embedding service unavailable' }, { status: 500 });
    }

    // 2. Perform vector similarity search via pgvector
    const vectorString = `[${vector.join(',')}]`;
    const similarItems: any[] = await prisma.$queryRaw`
      SELECT f.id, f.content, f.channel, f.sentiment, f."customerLabel", e.vector <-> ${vectorString}::vector as distance
      FROM "Feedback" f
      JOIN "Embedding" e ON f.id = e."feedbackId"
      ORDER BY distance ASC
      LIMIT 10
    `;

    if (similarItems.length === 0) {
      return NextResponse.json({ answer: "No feedback data found in the database. Please ingest some feedback first.", citedItems: [] });
    }

    // 3. Ask AI (Claude or Gemini) using Vercel AI SDK
    const contextText = similarItems
      .map((item, idx) => `[Record ${idx + 1}] Channel: ${item.channel}, Sentiment: ${item.sentiment}, Customer: ${item.customerLabel}, Content: "${item.content}"`)
      .join('\n');

    const { text } = await generateText({
      model: getAIModel('smart'),
      messages: [
        {
          role: 'system',
          content: 'You are Ask LOOP, an AI assistant that answers questions about customer feedback. Ground your answers strictly in the provided feedback records. Be concise and cite specific records when possible.',
        },
        {
          role: 'user',
          content: `Here are the most relevant customer feedback records:\n\n${contextText}\n\nQuestion: ${question}`,
        },
      ],
    });

    return NextResponse.json({ answer: text, citedItems: similarItems });
  } catch (error: any) {
    console.error('Ask route error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
