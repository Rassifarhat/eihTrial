import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import nodemailer from "nodemailer";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `you act as an experienced orthopaedic surgeon. first you collect patient data. patient gender, age, diagnosis, brief history and risk factors, surgery title with details like anesthesia used and tourniquet if it applies. You do NOT proceed before collecting this data. you ask follow up questions to get all this data if they are not provided entirely. then you write a very detailed and very thorough and very extensive operative note like written by an experienced orthopedic surgeon. you write the operative note in one go without subtitles or subdivisions and without any starting info about the patient like patient name and doctor name, just the operative report. After the operative report is written i need : 1. pathological and normal findings during surgery. 2. a postoprative physician note. 3. a pre-operative and post-operative orders for the floor nurses.4. extensive education for the patient including psychological support.5. brief history leading to surgical decision.6. plan before the surgery including measurable and actionable goals.7.admission and post-operation diagnosis.8. extensive hospital course summary.9. discharge physical examination.10. procedure summary.11. condition at discharge.12.health education and instructions at home.13. list of reasons to visit the hospital immediatly after discharge.`;

async function transcribeAudio(audioBuffer: ArrayBuffer, mimeType: string): Promise<string> {
  const extension = mimeType.includes("webm")
    ? "webm"
    : mimeType.includes("mp4")
      ? "mp4"
      : mimeType.includes("wav")
        ? "wav"
        : mimeType.includes("ogg")
          ? "ogg"
          : "webm";

  const file = new File([audioBuffer], `audio.${extension}`, { type: mimeType });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "gpt-4o-transcribe",
    language: "en",
  });

  return transcription.text;
}

async function generateSurgicalReport(transcript: string): Promise<string> {
  const response = await openai.responses.create({
    model: "gpt-5-mini",
    instructions: SYSTEM_PROMPT,
    input: transcript,
    max_output_tokens: 8000,
  });

  return response.output_text || "";
}

async function sendEmailWithReport(report: string): Promise<void> {
  const recipientEmail = "farhat.rassi@eih.ae";

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: recipientEmail,
    subject: `Surgical Report - Generated ${new Date().toLocaleDateString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Surgical Report</h2>
        <p>A new surgical report has been generated.</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; font-family: monospace; font-size: 14px; line-height: 1.6;">
${report}
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This is an automated message from Emirates International Hospital Digital.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Handle JSON request (for sending email with existing report)
    if (contentType.includes("application/json")) {
      const body = await request.json();

      if (body.sendEmail && body.report) {
        await sendEmailWithReport(body.report);
        return NextResponse.json({
          success: true,
          emailSent: true,
        });
      }

      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Handle FormData request (audio processing)
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    const audioArrayBuffer = await audioFile.arrayBuffer();
    const mimeType = audioFile.type || "audio/webm";

    const transcript = await transcribeAudio(audioArrayBuffer, mimeType);
    const report = await generateSurgicalReport(transcript);

    return NextResponse.json({
      success: true,
      transcript,
      report,
    });
  } catch (error) {
    console.error("Error processing surgical report:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
