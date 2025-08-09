import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/redis";
import OpenAI from "openai";

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

    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
            { error: "OpenAI API key is not configured." },
            { status: 500 }
        );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant designed to paraphrase text. Rewrite the user's text to improve clarity, change the tone, or alter the structure, while preserving the original meaning.",
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const paraphrasedText = completion.choices[0]?.message?.content;

    if (!paraphrasedText) {
        return NextResponse.json(
            { error: "Failed to get a response from the AI." },
            { status: 500 }
        );
    }

    return NextResponse.json({
      success: true,
      paraphrasedText,
    });
  } catch (error) {
    console.error("An error occurred during paraphrasing:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
