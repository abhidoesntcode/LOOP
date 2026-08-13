import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const themes = await prisma.theme.findMany({
      include: {
        _count: {
          select: { feedback: true }
        }
      }
    });

    const formatted = themes.map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description || '',
      color: t.color || '#6366f1',
      count: t._count.feedback
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
