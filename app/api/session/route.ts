import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-realtime-mini-2025-12-15",
      }),
    });

    const data = await response.json();
    const status = response.status;

    return NextResponse.json(data, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Error in /api/session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
