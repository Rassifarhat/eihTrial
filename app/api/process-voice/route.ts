import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import OpenAI from "openai";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ClinicalFormData {
  complaint: string;
  etiology_duration: string;
  conservative_result: string;
  physical_exam: string;
  goal: string;
  icd10: string;
  diagnosis: string;
  test: string;
  test_code: string;
  test_check: string;
}

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

async function generateClinicalData(transcript: string, testType: string): Promise<ClinicalFormData> {
  let specificInstructions = "";

  if (testType === "Medical Report") {
    specificInstructions = `
- For test: You MUST set this exactly to "conservative treatment"
- For test_code: You MUST leave this empty string ""
- For test_check: Return "no" (or empty string)
`;
  } else if (testType === "Physiotherapy") {
    specificInstructions = `
- For test: Use "Physiotherapy"
- For test_code: You MUST set this exactly to "12 sessions"
- For test_check: Return "yes"
`;
  } else {
    specificInstructions = `
- For test: Use the specific ${testType} name (e.g. "MRI Lumbar Spine")
- For test_code: Provide the CPT or procedure code
- For test_check: Return "yes"
`;
  }

  const systemPrompt = `You are a medical documentation assistant. 
The user has explicitly requested a: ${testType}

IMPORTANT REQUIREMENTS:
- For complaint: Extract the chief complaint
- For etiology_duration: Extract etiology and duration
- For diagnosis: Provide a clear medical diagnosis based on the symptoms (e.g. "Lumbar Radiculopathy", "Acute Bronchitis")
- For conservative_result: List 3-4 treatments... ALWAYS end with "failure to address pain"
- For physical_exam: List 4-5 relevant physical findings
- For goal: Explain why this request is needed
- For icd10: Provide the ICD-10 code
${specificInstructions}

Respond ONLY with valid JSON in this exact format:
{
  "complaint": "...",
  "etiology_duration": "...",
  "conservative_result": "...",
  "physical_exam": "...",
  "goal": "...",
  "icd10": "...",
  "diagnosis": "...",
  "test": "...",
  "test_code": "...",
  "test_check": "..." 
}`;

  const response = await openai.responses.create({
    model: "gpt-5-mini",
    instructions: systemPrompt,
    input: `Clinical description: ${transcript}\n\nRespond with valid JSON only.`,
    text: { format: { type: "json_object" } },
  });

  const content = response.output_text || "{}";
  return JSON.parse(content) as ClinicalFormData;
}

async function fillPdfForm(
  data: ClinicalFormData,
  insurer: string,
  testType: string
): Promise<{ pdfBytes: Uint8Array; filePath: string }> {
  let pdfFilename = "thiqa-fillable.pdf";
  const ins = insurer.toLowerCase();

  const insurerMap: Record<string, string> = {
    thiqa: "thiqa-fillable.pdf",
    daman: "daman-fillable.pdf",
    nas: "nas-fillable.pdf",
    adnic: "adnic-fillable.pdf",
    buhayra: "buhayra-fillable.pdf",
    inaya: "inaya-fillable.pdf",
    sukoun: "sukoun-fillable.pdf",
  };

  if (insurerMap[ins]) {
    pdfFilename = insurerMap[ins];
  }

  const pdfPath = path.join(process.cwd(), "public", "fillable_templates", pdfFilename);
  const pdfBytes = await readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  const textFieldMappings: { pdfField: string; dataKey: keyof ClinicalFormData }[] = [
    { pdfField: "complaint", dataKey: "complaint" },
    { pdfField: "etiology_duration", dataKey: "etiology_duration" },
    { pdfField: "conservative_result", dataKey: "conservative_result" },
    { pdfField: "physical_exam", dataKey: "physical_exam" },
    { pdfField: "goal", dataKey: "goal" },
    { pdfField: "icd10", dataKey: "icd10" },
    { pdfField: "diagnosis", dataKey: "diagnosis" },
    { pdfField: "test", dataKey: "test" },
    { pdfField: "test_code", dataKey: "test_code" },
  ];

  for (const mapping of textFieldMappings) {
    try {
      const field = form.getTextField(mapping.pdfField);
      const value = data[mapping.dataKey] || "";
      field.setText(value);
    } catch {
      // some PDFs might omit fields; continue
    }
  }

  if (testType !== "Medical Report") {
    const checkboxesToSet: Record<string, boolean> = {
      mri_check: false,
      ct_check: false,
      physiotherapy_check: false,
      admission_check: false,
    };

    const type = testType.toLowerCase();
    if (type.includes("mri")) checkboxesToSet.mri_check = true;
    else if (type.includes("ct")) checkboxesToSet.ct_check = true;
    else if (type.includes("physio")) checkboxesToSet.physiotherapy_check = true;
    else if (type.includes("admission")) checkboxesToSet.admission_check = true;

    for (const [boxName, shouldCheck] of Object.entries(checkboxesToSet)) {
      try {
        const checkBox = form.getCheckBox(boxName);
        if (shouldCheck) checkBox.check();
        else checkBox.uncheck();
      } catch {
        // field may not exist across PDFs
      }
    }
  }

  const filledPdfBytes = await pdfDoc.save();

  const homeDir = process.env.HOME || process.env.USERPROFILE || "~";
  const currentDate = new Date().toISOString().split("T")[0];
  const dateFolder = path.join(homeDir, "eihRequests", currentDate);

  await mkdir(dateFolder, { recursive: true });

  const filename = `${insurer.toLowerCase()}-${testType.replace(/\s+/g, "-")}-${randomUUID()}.pdf`;
  const filePath = path.join(dateFolder, filename);
  await writeFile(filePath, filledPdfBytes);

  return { pdfBytes: filledPdfBytes, filePath };
}

async function sendEmailWithPdf(
  pdfBytes: Uint8Array,
  filename: string,
  insurer: string,
  testType: string
): Promise<void> {
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
    subject: `${insurer} ${testType} Authorization Request - PDF Generated`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Medical Authorization Request</h2>
        <p>Your <strong>${testType}</strong> authorization request form for <strong>${insurer}</strong> has been generated.</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Insurer:</strong> ${insurer}</p>
          <p style="margin: 5px 0;"><strong>Test Type:</strong> ${testType}</p>
          <p style="margin: 5px 0;"><strong>File:</strong> ${filename}</p>
        </div>

        <p>Please find the completed authorization form attached to this email.</p>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
    attachments: [
      {
        filename,
        content: Buffer.from(pdfBytes),
        contentType: "application/pdf",
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const insurer = (formData.get("insurer") as string) || "Thiqa";
    const testType = (formData.get("testType") as string) || "MRI";
    const sendEmail = formData.get("sendEmail") as string | null;

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    const audioArrayBuffer = await audioFile.arrayBuffer();
    const mimeType = audioFile.type || "audio/webm";

    const transcript = await transcribeAudio(audioArrayBuffer, mimeType);
    const clinicalData = await generateClinicalData(transcript, testType);
    const { pdfBytes, filePath } = await fillPdfForm(clinicalData, insurer, testType);

    if (sendEmail === "yes") {
      const filename = `${insurer.toLowerCase()}-${testType.replace(/\s+/g, "-")}-form.pdf`;
      sendEmailWithPdf(pdfBytes, filename, insurer, testType).catch((err) => {
        console.error("Email sending failed:", err);
      });
    }

    return NextResponse.json({
      success: true,
      filePath,
      insurer,
      testType,
      emailSent: sendEmail === "yes",
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
