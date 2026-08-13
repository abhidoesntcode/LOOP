import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getAIModel } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { periodStart, periodEnd } = await req.json();

    // Fetch stats from DB
    const feedbacks = await prisma.feedback.findMany({
      where: {
        createdAt: {
          gte: new Date(periodStart || Date.now() - 30 * 24 * 60 * 60 * 1000),
          lte: new Date(periodEnd || Date.now()),
        }
      },
      include: {
        themes: {
          include: { theme: true }
        }
      }
    });

    if (feedbacks.length === 0) {
      return NextResponse.json({ error: 'No feedback found for this period' }, { status: 400 });
    }

    const posCount = feedbacks.filter((f: any) => f.sentiment === 'POS').length;
    const negCount = feedbacks.filter((f: any) => f.sentiment === 'NEG').length;
    const themeCounts: Record<string, number> = {};

    feedbacks.forEach((f: any) => {
      f.themes.forEach((t: any) => {
        themeCounts[t.theme.name] = (themeCounts[t.theme.name] || 0) + 1;
      });
    });

    const stats = {
      total: feedbacks.length,
      positive: posCount,
      negative: negCount,
      neutral: feedbacks.length - posCount - negCount,
      topThemes: Object.entries(themeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
    };

    // Generate VoC report using Vercel AI SDK (Claude or Gemini)
    const { text } = await generateText({
      model: getAIModel('smart'),
      messages: [
        {
          role: 'system',
          content: 'You are an expert product analyst. Write concise, actionable Voice of Customer (VoC) reports in Markdown format. Focus on insights and recommended actions.'
        },
        {
          role: 'user',
          content: `Write a VoC report for this period's customer feedback:\n\n${JSON.stringify(stats, null, 2)}\n\nInclude: executive summary, sentiment breakdown, top themes analysis, and 3 recommended actions.`,
        },
      ],
    });

    // Save report
    const workspace = await prisma.workspace.findFirst();
    const user = await prisma.user.findFirst();

    if (!workspace || !user) {
      return NextResponse.json({ error: 'Workspace or user not found' }, { status: 500 });
    }

    const report = await prisma.report.create({
      data: {
        title: `VoC Report - ${new Date().toLocaleDateString()}`,
        periodStart: new Date(periodStart || Date.now() - 30 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(periodEnd || Date.now()),
        contentJson: JSON.stringify({ markdown: text, stats }),
        workspaceId: workspace.id,
        userId: user.id,
      }
    });

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
