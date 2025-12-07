import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import OpenAI from "openai";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

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
  test_check: string;
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
    model: "gpt-4o-mini-transcribe",
    language: "en",
  });

  return transcription.text;
}

async function generateClinicalData(transcript: string): Promise<ClinicalFormData> {
  const systemPrompt = `You are a medical documentation assistant. Based on the clinical description provided, generate structured data for a Thiqa Authorization Request form (UAE health insurance).

If specific information is not provided in the transcript, generate medically appropriate content based on the context. The form is for requesting authorization for diagnostic tests.

IMPORTANT REQUIREMENTS:
- For conservative_result: List 3-4 conservative treatments that were attempted, and ALWAYS end with "failure to address pain" or "increase in pain despite treatment"
- For physical_exam: List 4-5 relevant physical examination findings for the mentioned pathology
- For goal: Explain why the test is needed, mentioning failure of conservative treatment and the suspected diagnosis the test might uncover
- For icd10: Provide the appropriate ICD-10 code for the complaint
- For test_check: Return "yes" (for the checkbox)
- For test_code: Provide the CPT or procedure code for the requested test

Respond ONLY with valid JSON in this exact format:
{
  "complaint": "chief complaint from transcript",
  "etiology_duration": "etiology and duration of symptoms",
  "conservative_result": "1. Treatment 1, 2. Treatment 2, 3. Treatment 3, 4. Treatment 4 - Patient reports failure to address pain/increase in pain despite conservative management",
  "physical_exam": "1. Finding 1, 2. Finding 2, 3. Finding 3, 4. Finding 4, 5. Finding 5",
  "goal": "To evaluate for [suspected diagnosis] given failure of conservative treatment. The test will help confirm/rule out [conditions].",
  "icd10": "M54.5",
  "test": "MRI Lumbar Spine",
  "test_check": "yes",
  "test_code": "72148"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
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

async function fillPdfForm(data: ClinicalFormData): Promise<{ pdfBytes: Uint8Array; filePath: string }> {
  const pdfPath = path.join(process.cwd(), "public", "thiqaForm_fillable.pdf");
  const pdfBytes = await readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  // Get all field names for debugging
  const fields = form.getFields();
  console.log(
    "Available PDF fields:",
    fields.map((f) => f.getName())
  );

  // Fill text fields
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

  // Handle checkbox
  if (data.test_check === "yes" || data.test_check === "on") {
    try {
      const checkBox = form.getCheckBox("test_check");
      checkBox.check();
    } catch (e) {
      console.warn('Could not check "test_check" field:', e);
    }
  }

  const filledPdfBytes = await pdfDoc.save();

  // Save to public/filled/ directory
  const filledDir = path.join(process.cwd(), "public", "filled");
  await mkdir(filledDir, { recursive: true });

  const filename = `thiqa-form-${randomUUID()}.pdf`;
  const filePath = path.join(filledDir, filename);
  await writeFile(filePath, filledPdfBytes);

  return { pdfBytes: filledPdfBytes, filePath: `/filled/${filename}` };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    // Convert File to ArrayBuffer
    const audioArrayBuffer = await audioFile.arrayBuffer();
    const mimeType = audioFile.type || "audio/webm";

    // Step 1: Transcribe audio
    console.log("Step 1: Transcribing audio...");
    const transcript = await transcribeAudio(audioArrayBuffer, mimeType);
    console.log("Transcript:", transcript);

    // Step 2: Generate structured clinical data
    console.log("Step 2: Generating clinical data...");
    const clinicalData = await generateClinicalData(transcript);
    console.log("Clinical data:", clinicalData);

    // Step 3: Fill PDF and save to filesystem
    console.log("Step 3: Filling PDF...");
    const { pdfBytes, filePath } = await fillPdfForm(clinicalData);
    console.log("PDF saved to:", filePath);

    // Return the filled PDF directly
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="filled-thiqa-form.pdf"',
        "X-File-Path": filePath,
      },
    });
  } catch (error) {
    console.error("Error processing voice request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
