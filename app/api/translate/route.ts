import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body?.text as string | undefined;
    const target = (body?.target as string | undefined) || "english";
    const includeDetection = Boolean(body?.includeDetection);

    console.log("[translate API] Received request:", { text, target });

    if (!text) {
      console.log("[translate API] Missing text - returning 400");
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const prompt = `Translate the following into ${target}. Return JSON with:
- translated_text: the translation
- detected_language: ISO 639-1 code for the source language (or "unknown")
Text: ${text}`;
    console.log("[translate API] Calling OpenAI with prompt length:", prompt.length);

    const completion = await openai.responses.create({
      model: "gpt-5-mini",
      instructions:
        "You are a precise medical interpreter. Return valid JSON only with translated_text and detected_language.",
      input: prompt,
      text: { format: { type: "json_object" } },
    });

    const raw = completion.output_text || "{}";
    let translated = "";
    let detectedLanguage = "unknown";

    try {
      const parsed = JSON.parse(raw);
      translated = parsed.translated_text || parsed.translation || "";
      detectedLanguage = parsed.detected_language || "unknown";
    } catch {
      translated = raw;
    }

    console.log("[translate API] OpenAI response:", { translated, detectedLanguage, originalText: text });

    return NextResponse.json({
      translated,
      detectedLanguage: includeDetection ? detectedLanguage : undefined,
    });
  } catch (error) {
    console.error("[translate API] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Translation failed" },
      { status: 500 }
    );
  }
}
