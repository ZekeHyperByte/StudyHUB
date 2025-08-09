import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/redis";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { limited } = await checkRateLimit(req);
    if (limited) {
      return NextResponse.json(
        { error: "You have exceeded the daily limit of 5 requests." },
        { status: 429 }
      );
    }

    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
            { error: "Gemini API key is not configured." },
            { status: 500 }
        );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    const prompt = `Summarize the following text, capturing the key points and main ideas:\n\n${text}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const summarizedText = response.text();

    return NextResponse.json({
      success: true,
      summarizedText,
    });
  } catch (error) {
    console.error("An error occurred during summarization:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
