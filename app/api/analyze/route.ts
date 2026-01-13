import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const BAZI_API_BASE = process.env.BAZI_API_BASE;
    const BAZI_API_TOKEN = process.env.BAZI_API_TOKEN;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!BAZI_API_BASE || !BAZI_API_TOKEN || !OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing env vars: BAZI_API_BASE / BAZI_API_TOKEN / OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const body = await req.json();

    // 1) Call your BaZi compute endpoint (your existing backend)
    const computeRes = await fetch(`${BAZI_API_BASE}/bazi/compute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BAZI_API_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    const computeText = await computeRes.text();
    if (!computeRes.ok) {
      return NextResponse.json(
        { error: `BaZi compute failed (${computeRes.status})`, detail: computeText },
        { status: 400 }
      );
    }

    let computeJson: any = null;
    try {
      computeJson = JSON.parse(computeText);
    } catch {
      // If backend returns text, still send it to the model
      computeJson = { raw: computeText };
    }

    // 2) Send compute output to OpenAI for interpretation
    const client = new OpenAI({ apiKey: OPENAI_API_KEY });

    const prompt = `
You are a BaZi (八字) analyst. Use the computed output below to produce a clean, user-facing reading.

Requirements:
- Start with "真太阳时" and key pillars summary if present
- Then give 6–10 bullet insights (personality, strengths, challenges)
- Then give 3 practical suggestions (career/relationships/health in general terms)
- Avoid showing raw JSON; write for a normal user.

Computed output:
${JSON.stringify(computeJson, null, 2)}
`.trim();

    const r = await client.responses.create({
      model: "gpt-5",
      input: prompt,
    });

    // responses API returns content in output_text
    // (this is the recommended SDK path) :contentReference[oaicite:3]{index=3}
    const analysis = (r as any).output_text ?? "";

    return NextResponse.json({
      analysis,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

