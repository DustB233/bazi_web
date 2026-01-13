import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const baziApiBase = process.env.BAZI_API_BASE;
    const baziToken = process.env.BAZI_API_TOKEN;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!baziApiBase || !baziToken || !openaiKey) {
      return NextResponse.json(
        { error: "Missing env vars: BAZI_API_BASE / BAZI_API_TOKEN / OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    // 1) Call your BaZi compute API
    const baziResp = await fetch(`${baziApiBase}/bazi/compute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${baziToken}`,
      },
      body: JSON.stringify(body),
    });

    const baziText = await baziResp.text();
    if (!baziResp.ok) {
      return new NextResponse(baziText, { status: baziResp.status });
    }
    const baziJson = JSON.parse(baziText);

    // 2) Load your own BaZi knowledge (simple version: local text files)
    // Put your notes under /bazi_knowledge/*.md and expand later to embeddings/vector DB.
    // (If you don’t have files yet, set knowledge = "" for now.)
    const knowledge = `
# Your BaZi Notes (placeholder)
- Add your own interpretations, rules, mappings, examples here.
- Later: replace with embeddings + retrieval for large knowledge bases.
`;

    // 3) Ask OpenAI to produce the analysis (optionally with web search tool)
    // Responses API: POST https://api.openai.com/v1/responses :contentReference[oaicite:1]{index=1}
    const prompt = `
You are a BaZi (八字) analyst. Use the user's BaZi computation JSON plus my private notes.
If you use outside facts, be explicit what you searched and why.

Return:
1) Summary (plain English + Chinese)
2) Key pillars / ten gods / elements balance (based on provided JSON fields)
3) Career / study / timing insights (no medical/legal claims)
4) If uncertain due to missing fields, say what’s missing.

=== My private notes ===
${knowledge}

=== BaZi JSON output ===
${JSON.stringify(baziJson, null, 2)}
`;

    const openaiResp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: prompt,
        // Optional: allow web search inside OpenAI tool system (internet-based)
        tools: [{ type: "web_search" }],
        // Optional: include sources in the output (very useful)
        include: ["web_search_call.action.sources"],
      }),
    });

    const out = await openaiResp.json();
    if (!openaiResp.ok) {
      return NextResponse.json(out, { status: openaiResp.status });
    }

    // Extract text safely (Responses API returns structured output)
    const analysisText =
      out.output_text ??
      out.output?.map((x: any) => x?.content?.map((c: any) => c?.text).join("\n")).join("\n") ??
      JSON.stringify(out);

    return NextResponse.json({
      bazi: baziJson,
      analysis: analysisText,
      raw_openai: out, // keep for debugging; remove later if you want
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
