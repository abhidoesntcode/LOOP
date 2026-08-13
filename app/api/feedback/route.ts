import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";

interface CustomUser {
  id?: string;
  role?: string;
  workspaceId?: string;
}

// GET: Fetch feedback for the user's workspace
export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as CustomUser | undefined;

  if (!session || !user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const feedbacks = await prisma.feedback.findMany({
      where: {
        workspaceId: user.workspaceId,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(feedbacks);
  } catch (err) {
    console.error("GET feedback error:", err);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}

// POST: Create feedback and analyze sentiment
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as CustomUser | undefined;

  if (!session || !user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, channel, sentiment, sentimentScore, autoAnalyze, customerLabel, sourceRef } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    let finalSentiment = sentiment || "NEU";
    let finalScore = sentimentScore ?? 0.0;

    if (autoAnalyze) {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("GEMINI_API_KEY is not configured.");
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Analyze the sentiment of this customer feedback: "${content}". 
Return a JSON object with keys "sentiment" ("POS" | "NEU" | "NEG") and "score" (a float number between -1.0 and 1.0).`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const text = response.text || "{}";
        const parsed = JSON.parse(text);

        if (parsed.sentiment) finalSentiment = parsed.sentiment;
        if (typeof parsed.score === "number") finalScore = parsed.score;
      } catch (aiErr) {
        console.error("Gemini AI Analysis Error:", aiErr);
        // Fallback to neutral on AI failure so creation still succeeds
        finalSentiment = "NEU";
        finalScore = 0.0;
      }
    }

    const newEntry = await prisma.feedback.create({
      data: {
        content,
        channel: channel || "Support Ticket",
        sentiment: finalSentiment,
        sentimentScore: finalScore,
        customerLabel: customerLabel || null,
        sourceRef: sourceRef || null,
        status: "NEW",
        workspaceId: user.workspaceId,
      },
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (err) {
    console.error("Feedback creation error:", err);
    return NextResponse.json({ error: "Failed to create feedback" }, { status: 500 });
  }
}
