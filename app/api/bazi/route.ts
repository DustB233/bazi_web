import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const apiBase = process.env.BAZI_API_BASE;
    const token = process.env.BAZI_API_TOKEN;

    if (!apiBase || !token) {
      return NextResponse.json(
        { error: "Missing BAZI_API_BASE or BAZI_API_TOKEN" },
        { status: 500 }
      );
    }

    const url = `${apiBase.replace(/\/+$/, "")}/bazi/compute`;

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const contentType = r.headers.get("content-type") || "";
    const raw = await r.text();

    // If backend returned JSON, forward JSON; otherwise forward text
    if (contentType.includes("application/json")) {
      return new NextResponse(raw, {
        status: r.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new NextResponse(raw, {
      status: r.status,
      headers: { "Content-Type": contentType || "text/plain" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Route crashed", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
