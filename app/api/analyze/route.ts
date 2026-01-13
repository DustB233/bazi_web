import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

function extractOutputText(responseJson: any): string {
  // Responses API often provides output_text
  if (typeof responseJson?.output_text === "string") return responseJson.output_text;

  // Fallback: try to walk the structure
  const out = responseJson?.output;
  if (Array.isArray(out)) {
    const parts: string[] = [];
    for (const item of out) {
      const content = item?.content;
      if (Array.isArray(content)) {
        for (const c of content) {
          const t = c?.text;
          if (typeof t === "string") parts.push(t);
          if (typeof t?.value === "string") parts.push(t.value);
        }
      }
    }
    if (parts.length) return parts.join("\n");
  }
  return "";
}

export async function POST(req: Request) {
  // Only allow “Compute + Analyze” for signed-in users
  const a = await auth();
  if (!a.userId) {
    return NextResponse.json(
      { error: "UNAUTHENTICATED", signInUrl: "/sign-in?redirect_url=/generate" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const apiBase = process.env.BAZI_API_BASE;
  const baziToken = process.env.BAZI_API_TOKEN;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!apiBase || !baziToken || !openaiKey) {
    return NextResponse.json(
      { error: "Missing env vars: BAZI_API_BASE / BAZI_API_TOKEN / OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  // 1) Call your BaZi compute backend
  const baziResp = await fetch(`${apiBase}/bazi/compute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${baziToken}`,
    },
    body: JSON.stringify(body),
  });

  const baziJson = await baziResp.json().catch(() => null);
  if (!baziResp.ok) {
    return NextResponse.json(
      { error: "BAZI_BACKEND_ERROR", status: baziResp.status, detail: baziJson },
      { status: baziResp.status }
    );
  }

  // 2) Call OpenAI to generate interpretation
  const systemPrompt = `You are a BaZi (八字) assistant.
Write a clear, structured reading in English (can include Chinese terms).
Be practical: personality tendencies, career themes, relationship style, and timing notes if present.
Avoid absolute claims; present as guidance.`;

  const userPrompt = `Here is the computed BaZi result JSON. Interpret it:

${JSON.stringify(baziJson, null, 2)}
`;

  const oaiResp = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [{ type: "text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [{ type: "text", text: userPrompt }],
        },
      ],
    }),
  });

  const oaiJson = await oaiResp.json().catch(() => null);
  if (!oaiResp.ok) {
    return NextResponse.json(
      { error: "OPENAI_ERROR", status: oaiResp.status, detail: oaiJson },
      { status: 500 }
    );
  }

  const analysis = extractOutputText(oaiJson);

  return NextResponse.json({
    analysis,
    // Optional return computed fields for debugging / later UI
    bazi: baziJson?.bazi ?? baziJson,
    times: baziJson?.times,
    resolved: baziJson?.resolved,
  });
}

