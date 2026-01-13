"use client";

import { useMemo, useState } from "react";

type FormState = {
  year: string;
  month: string;
  day: string;
  time: string; // HH:MM
  gender: "male" | "female";
  city: string;
  country: string;
  tz: string;
};

export default function BaziClient() {
  const [form, setForm] = useState<FormState>({
    year: "2005",
    month: "3",
    day: "4",
    time: "02:12",
    gender: "male",
    city: "Qingdao",
    country: "China",
    tz: "Asia/Shanghai",
  });

  const payload = useMemo(() => {
    // IMPORTANT: send fields at TOP LEVEL (not nested under "bazi")
    return {
      calendar: "gregorian",
      year: Number(form.year),
      month: Number(form.month),
      day: Number(form.day),
      time: form.time,
      gender: form.gender,
      city: form.city || null,
      country: form.country || null,
      tz: form.tz || null,
      use_dst: false,
      // lon/lat optional — your backend can fill these if you do city lookup server-side
      lon: null,
      lat: null,
    };
  }, [form]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Final user-visible result:
  const [analysis, setAnalysis] = useState<string>("");

  // Optional raw debug:
  const [raw, setRaw] = useState<any>(null);
  const [showRaw, setShowRaw] = useState(false);

  async function onSubmit() {
    setLoading(true);
    setError(null);
    setAnalysis("");
    setRaw(null);

    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // If not logged in, backend returns 401 + signInUrl
      if (r.status === 401) {
        const j = await r.json().catch(() => null);
        const signInUrl = j?.signInUrl || "/sign-in?redirect_url=/generate";
        window.location.href = signInUrl;
        return;
      }

      const j = await r.json().catch(() => null);

      if (!r.ok) {
        setError(j?.error ? JSON.stringify(j, null, 2) : "Request failed");
        return;
      }

      setAnalysis(j.analysis || "");
      setRaw(j); // keep it for debugging, but hide by default
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  const fieldStyle: React.CSSProperties = {
    display: "grid",
    gap: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #333",
    background: "#111",
    color: "#fff",
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12,
          padding: 16,
          border: "1px solid #333",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <div style={fieldStyle}>
          <label>Year</label>
          <input
            style={inputStyle}
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
          />
        </div>

        <div style={fieldStyle}>
          <label>Month</label>
          <input
            style={inputStyle}
            value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}
          />
        </div>

        <div style={fieldStyle}>
          <label>Day</label>
          <input
            style={inputStyle}
            value={form.day}
            onChange={(e) => setForm({ ...form, day: e.target.value })}
          />
        </div>

        <div style={fieldStyle}>
          <label>Time (HH:MM)</label>
          <input
            style={inputStyle}
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>

        <div style={fieldStyle}>
          <label>Gender</label>
          <select
            style={inputStyle}
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
          >
            <option value="male">male</option>
            <option value="female">female</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label>City</label>
          <input
            style={inputStyle}
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </div>

        <div style={fieldStyle}>
          <label>Country</label>
          <input
            style={inputStyle}
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </div>

        <div style={fieldStyle}>
          <label>Timezone (optional)</label>
          <input
            style={inputStyle}
            value={form.tz}
            onChange={(e) => setForm({ ...form, tz: e.target.value })}
          />
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={loading}
        style={{
          padding: "10px 14px",
          borderRadius: 999,
          border: "1px solid #333",
          background: loading ? "#222" : "#fff",
          color: loading ? "#aaa" : "#000",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 700,
        }}
      >
        {loading ? "Working..." : "Compute + Analyze"}
      </button>

      {error && (
        <pre style={{ marginTop: 16, color: "#ff6b6b", whiteSpace: "pre-wrap" }}>
          {error}
        </pre>
      )}

      {analysis && (
        <div style={{ marginTop: 16, padding: 16, border: "1px solid #333", borderRadius: 12 }}>
          <h2 style={{ margin: 0, marginBottom: 10 }}>Analysis</h2>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{analysis}</div>

          {raw && (
            <div style={{ marginTop: 14 }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={showRaw}
                  onChange={(e) => setShowRaw(e.target.checked)}
                />
                Show raw data (debug)
              </label>

              {showRaw && (
                <pre style={{ marginTop: 10, whiteSpace: "pre-wrap", color: "#aaa" }}>
                  {JSON.stringify(raw, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
