import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import OpenAI from "openai";
import { readFile, writeFile, mkdir } from "fs/promises";
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
  test: string;
  test_code: string;
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
    file: file,
    model: "whisper-1",
    language: "en",
  });

  return transcription.text;
}

async function generateClinicalData(transcript: string, testType: string): Promise<ClinicalFormData> {
  const systemPrompt = `You are a medical documentation assistant. Based on the clinical description provided, generate structured data for a Health Insurance Authorization Request form.
  
The user has explicitly requested a: ${testType}

If specific information is not provided in the transcript, generate medically appropriate content based on the context.

IMPORTANT REQUIREMENTS:
- For conservative_result: List 3-4 conservative treatments that were attempted, and ALWAYS end with "failure to address pain" or "increase in pain despite treatment"
- For physical_exam: List 4-5 relevant physical examination findings for the mentioned pathology
- For goal: Explain why the ${testType} is needed, mentioning failure of conservative treatment and the suspected diagnosis the test might uncover
- For icd10: Provide the appropriate ICD-10 code for the complaint
- For test: Use the specific ${testType} name (e.g. "MRI Lumbar Spine" if context implies spine, or just "${testType}")
- For test_code: Provide the CPT or procedure code for the requested test

Respond ONLY with valid JSON in this exact format:
{
  "complaint": "chief complaint from transcript",
  "etiology_duration": "etiology and duration of symptoms",
  "conservative_result": "1. Treatment 1, 2. Treatment 2... - Patient reports failure to address pain...",
  "physical_exam": "1. Finding 1, 2. Finding 2...",
  "goal": "To evaluate for [suspected diagnosis]...",
  "icd10": "M54.5",
  "test": "MRI Lumbar Spine",
  "test_code": "72148"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Clinical description from voice dictation: ${transcript}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content || "{}";
  return JSON.parse(content) as ClinicalFormData;
}

async function fillPdfForm(
  data: ClinicalFormData,
  insurer: string,
  testType: string
): Promise<{ pdfBytes: Uint8Array; filePath: string }> {

  // 1. Select the correct PDF file
  let pdfFilename = "thiqa-fillable.pdf"; // Default
  if (insurer.toLowerCase() === "daman") pdfFilename = "daman-fillable.pdf";
  if (insurer.toLowerCase() === "nas") pdfFilename = "nas-fillable.pdf";

  const pdfPath = path.join(process.cwd(), "public", pdfFilename);
  console.log(`Using PDF template: ${pdfFilename}`);

  const pdfBytes = await readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  // 2. Fill text fields
  const textFieldMappings: { pdfField: string; dataKey: keyof ClinicalFormData }[] = [
    { pdfField: "complaint", dataKey: "complaint" },
    { pdfField: "etiology_duration", dataKey: "etiology_duration" },
    { pdfField: "conservative_result", dataKey: "conservative_result" },
    { pdfField: "physical_exam", dataKey: "physical_exam" },
    { pdfField: "goal", dataKey: "goal" },
    { pdfField: "icd10", dataKey: "icd10" },
    { pdfField: "test", dataKey: "test" },
    { pdfField: "test_code", dataKey: "test_code" },
  ];

  for (const mapping of textFieldMappings) {
    try {
      const field = form.getTextField(mapping.pdfField);
      field.setText(data[mapping.dataKey] || "");
    } catch (e) {
      console.warn(`Could not fill field "${mapping.pdfField}":`, e);
    }
  }

  // 3. Handle Checkboxes based on testType
  // Reset all first (optional, but good practice if reusing objects, though we load fresh)
  // Logic: mri_check, ct_check, physiotherapy_check, admission_check

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
    } catch (e) {
      // Only warn if we EXPECTED to check it, or maybe just log debug
      // Use case: if user asked for MRI but mri_check doesn't exist in PDF
      if (shouldCheck) console.warn(`Could not check "${boxName}":`, e);
    }
  }

  const filledPdfBytes = await pdfDoc.save();

  // Save to public/filled/ directory
  const filledDir = path.join(process.cwd(), "public", "filled");
  await mkdir(filledDir, { recursive: true });

  const filename = `${insurer.toLowerCase()}-${type.replace(/\s+/g, '-')}-${randomUUID()}.pdf`;
  const filePath = path.join(filledDir, filename);
  await writeFile(filePath, filledPdfBytes);

  return { pdfBytes: filledPdfBytes, filePath: `/filled/${filename}` };
}

async function sendEmailWithPdf(
  pdfBytes: Uint8Array,
  filename: string,
  recipientEmail: string,
  insurer: string,
  testType: string
): Promise<void> {
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
        filename: filename,
        content: Buffer.from(pdfBytes),
        contentType: "application/pdf",
      },
    ],
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email sent successfully to ${recipientEmail}`);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const insurer = (formData.get("insurer") as string) || "Thiqa";
    const testType = (formData.get("testType") as string) || "MRI";
    const email = formData.get("email") as string | null;

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    const audioArrayBuffer = await audioFile.arrayBuffer();
    const mimeType = audioFile.type || "audio/webm";

    // Step 1: Transcribe
    console.log("Step 1: Transcribing...");
    const transcript = await transcribeAudio(audioArrayBuffer, mimeType);
    console.log("Transcript:", transcript);

    // Step 2: Generate data (aware of test type)
    console.log(`Step 2: Generating data for ${testType}...`);
    const clinicalData = await generateClinicalData(transcript, testType);

    // Step 3: Fill PDF
    console.log(`Step 3: Filling ${insurer} PDF...`);
    const { pdfBytes, filePath } = await fillPdfForm(clinicalData, insurer, testType);

    // Step 4: Send email if provided (optional, don't block response)
    if (email && email.includes("@")) {
      const filename = `${insurer.toLowerCase()}-${testType.toLowerCase().replace(/\s+/g, '-')}-form.pdf`;
      sendEmailWithPdf(pdfBytes, filename, email, insurer, testType).catch((err) => {
        console.error("Email sending failed:", err);
        // Don't fail the request if email fails
      });
    }

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="filled-${insurer}-${testType}.pdf"`,
        "X-File-Path": filePath,
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
