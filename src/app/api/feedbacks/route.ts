import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: {
        themes: {
          include: { theme: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Format response to match the existing UI interface
    const formatted = feedbacks.map((f: any) => ({
      id: f.id,
      content: f.content,
      channel: f.channel,
      customerLabel: f.customerLabel || '',
      sentiment: f.sentiment || 'NEU',
      sentimentScore: f.sentimentScore || 0,
      status: f.status,
      featureArea: f.themes.length > 0 ? f.themes[0].theme.name : 'General',
      themes: f.themes.map((t: any) => t.theme.name),
      aiRationale: 'Classified via Ask LOOP AI',
      createdAt: f.createdAt.toISOString()
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
