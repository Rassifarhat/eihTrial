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
  diagnosis: string; // New field
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
    file: file,
    model: "whisper-1",
    language: "en",
  });

  return transcription.text;
}

async function generateClinicalData(transcript: string, testType: string): Promise<ClinicalFormData> {
  // Logic for dynamic prompts
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
    // Standard logic for MRI, CT, Admission, etc.
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

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Clinical description: ${transcript}` },
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
  let pdfFilename = "thiqa-fillable.pdf"; // Default fallback
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
  } else {
    // If unknown, fallback to thiqa but maybe warn?
    console.warn(`Unknown insurer ${insurer}, falling back to Thiqa`);
  }

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
    { pdfField: "diagnosis", dataKey: "diagnosis" }, // New field
    { pdfField: "test", dataKey: "test" },
    { pdfField: "test_code", dataKey: "test_code" },
  ];

  for (const mapping of textFieldMappings) {
    try {
      const field = form.getTextField(mapping.pdfField);
      // Ensure we don't pass null/undefined
      const value = data[mapping.dataKey] || "";
      field.setText(value);
    } catch (e) {
      // Some PDFs might NOT have 'diagnosis' etc.
      // console.warn(`Could not fill field "${mapping.pdfField}":`, e);
      // Squelch this common warning if fields vary by PDF
    }
  }

  // 3. Handle Checkboxes
  // If "Medical Report", we probably don't tick any boxes?
  // User says: Report does not include any test.

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
      } catch (e) {
        // Field might not exist in all PDFs
      }
    }
  }

  const filledPdfBytes = await pdfDoc.save();

  // Save to ~/eihRequests/{current-date}/ directory
  const homeDir = process.env.HOME || process.env.USERPROFILE || "~";
  const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const dateFolder = path.join(homeDir, "eihRequests", currentDate);

  // Create date-based folder if it doesn't exist
  await mkdir(dateFolder, { recursive: true });

  const filename = `${insurer.toLowerCase()}-${testType.replace(/\s+/g, '-')}-${randomUUID()}.pdf`;
  const filePath = path.join(dateFolder, filename);
  await writeFile(filePath, filledPdfBytes);

  console.log(`PDF saved to: ${filePath}`);

  return { pdfBytes: filledPdfBytes, filePath: filePath };
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
    const sendEmail = formData.get("sendEmail") as string | null; // "yes" or null

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
    console.log("Clinical data:", clinicalData);

    // Step 3: Fill PDF
    console.log(`Step 3: Filling ${insurer} PDF...`);
    const { pdfBytes, filePath } = await fillPdfForm(clinicalData, insurer, testType);

    // Step 4: Send email if user approved
    if (sendEmail === "yes") {
      const filename = `${insurer.toLowerCase()}-${testType.replace(/\s+/g, '-')}-form.pdf`;
      sendEmailWithPdf(pdfBytes, filename, insurer, testType).catch((err) => {
        console.error("Email sending failed:", err);
        // Don't fail the request if email fails
      });
      console.log("Email will be sent to farhat.rassi@eih.ae");
    }

    // Return success with file path
    return NextResponse.json({
      success: true,
      filePath: filePath,
      insurer: insurer,
      testType: testType,
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
