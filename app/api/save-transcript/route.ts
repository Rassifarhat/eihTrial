import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      sessionId,
      doctorLanguage,
      patientLanguage,
      entries,
      generateSummary,
    } = body as {
      sessionId: string;
      doctorLanguage: string;
      patientLanguage: string;
      entries: Array<{
        id: string;
        direction: string;
        inputEnglish?: string;
        outputEnglish?: string;
        inputLanguage?: string;
        excludeFromSummary?: boolean;
        timestamp: number;
      }>;
      generateSummary?: boolean;
    };

    if (!sessionId || !entries) {
      return NextResponse.json({ error: "Missing sessionId or entries" }, { status: 400 });
    }

    const transcriptsDir = path.join(process.cwd(), "public", "transcripts");
    await mkdir(transcriptsDir, { recursive: true });

    const transcriptPath = path.join(transcriptsDir, `${sessionId}.json`);
    await writeFile(
      transcriptPath,
      JSON.stringify(
        {
          sessionId,
          doctorLanguage,
          patientLanguage,
          entries,
          savedAt: new Date().toISOString(),
        },
        null,
        2
      ),
      "utf-8"
    );

    let summaryPath: string | null = null;

    if (generateSummary) {
      const combined = entries
        .filter((e) => !e.excludeFromSummary)
        .map((e) => {
          const speaker = e.direction === "patient-to-doc" ? "patient" : "doctor";
          const text = e.inputEnglish || e.outputEnglish || "";
          return text ? `${speaker}: ${text}` : "";
        })
        .filter(Boolean)
        .join("\n");

      const prompt = `
You are a clinical summarizer. Given a bilingual conversation transcript converted to English, produce structured JSON with the fields:
{
  "chief_complaint": string,
  "history_of_present_illness": string,
  "assessment": string,
  "plan": string,
  "follow_up": string,
  "missing_information": string[]
}
Use "unknown" when data is missing. Do not hallucinate.
Conversation:
${combined}
`;

      const completion = await openai.responses.create({
        model: "gpt-5-mini",
        instructions: "You are a clinical note assistant. Be concise and structured.",
        input: `${prompt}\n\nRespond with valid JSON only.`,
        text: { format: { type: "json_object" } },
      });

      const content = completion.output_text || "{}";
      const summary = JSON.parse(content);
      summaryPath = path.join(transcriptsDir, `${sessionId}-summary.json`);
      await writeFile(summaryPath, JSON.stringify(summary, null, 2), "utf-8");
    }

    return NextResponse.json({
      ok: true,
      transcriptPath: `/transcripts/${sessionId}.json`,
      summaryPath: summaryPath ? `/transcripts/${sessionId}-summary.json` : null,
    });
  } catch (error) {
    console.error("save-transcript error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save transcript" },
      { status: 500 }
    );
  }
}
