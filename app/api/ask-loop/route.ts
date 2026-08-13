import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface CustomUser {
  id?: string;
  role?: string;
  workspaceId?: string;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as CustomUser | undefined;

  if (!session || !user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Fetch the 50 most recent feedback entries for context
    const feedbacks = await prisma.feedback.findMany({
      where: { workspaceId: user.workspaceId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        content: true,
        channel: true,
        sentiment: true,
        status: true,
        createdAt: true,
      },
    });

    if (feedbacks.length === 0) {
      return NextResponse.json({
        answer: "No customer feedback entries found in this workspace to analyze yet.",
      });
    }

    // Format feedback context for the model
    const feedbackContext = feedbacks
      .map(
        (f, index) =>
          `[${index + 1}] Channel: ${f.channel} | Sentiment: ${f.sentiment} | Status: ${f.status}\nContent: "${f.content}"`
      )
      .join("\n\n");

    const prompt = `You are an AI insight assistant for "Project LOOP", a customer feedback aggregation platform.
Analyze the following workspace customer feedback context and answer the user's query accurately, concisely, and professionally.

User Query: "${query}"

Feedback Context:
${feedbackContext}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({
      answer: response.text || "Unable to generate insights from feedback.",
    });
  } catch (err) {
    console.error("Ask LOOP Error:", err);
    return NextResponse.json(
      { error: "Failed to generate AI insights" },
      { status: 500 }
    );
  }
}
