"use client";

import { useMemo, useState } from "react";

type FormState = {
  year: string;
  month: string;
  day: string;
  time: string; // "HH:MM"
  gender: "male" | "female";
  city: string;
  country: string;
  tz: string;
  use_dst: boolean;
};

export default function Home() {
  const [form, setForm] = useState<FormState>({
    year: "2005",
    month: "3",
    day: "4",
    time: "02:12",
    gender: "male",
    city: "Qingdao",
    country: "China",
    tz: "Asia/Shanghai",
    use_dst: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const payload = useMemo(() => {
    return {
      year: Number(form.year),
      month: Number(form.month),
      day: Number(form.day),
      time: form.time,
      gender: form.gender,
      city: form.city || null,
      country: form.country || null,
      tz: form.tz || null,
      use_dst: form.use_dst,
    };
  }, [form]);

  async function onSubmit() {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await r.text();

      if (!r.ok) {
        // show server error text directly (super helpful for debugging)
        throw new Error(`HTTP ${r.status}: ${text}`);
      }

      const json = JSON.parse(text);
      setData(json);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Compute + Analyze</h1>

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
        <Field label="Year">
          <input
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            style={inputStyle}
            placeholder="2005"
          />
        </Field>

        <Field label="Month">
          <input
            value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}
            style={inputStyle}
            placeholder="3"
          />
        </Field>

        <Field label="Day">
          <input
            value={form.day}
            onChange={(e) => setForm({ ...form, day: e.target.value })}
            style={inputStyle}
            placeholder="4"
          />
        </Field>

        <Field label="Time (HH:MM)">
          <input
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            style={inputStyle}
            placeholder="02:12"
          />
        </Field>

        <Field label="Gender">
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
            style={inputStyle}
          >
            <option value="male">male</option>
            <option value="female">female</option>
          </select>
        </Field>

        <Field label="Time zone (IANA)">
          <input
            value={form.tz}
            onChange={(e) => setForm({ ...form, tz: e.target.value })}
            style={inputStyle}
            placeholder="Asia/Shanghai"
          />
        </Field>

        <Field label="City">
          <input
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            style={inputStyle}
            placeholder="Qingdao"
          />
        </Field>

        <Field label="Country">
          <input
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            style={inputStyle}
            placeholder="China"
          />
        </Field>

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, alignItems: "center" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={form.use_dst}
              onChange={(e) => setForm({ ...form, use_dst: e.target.checked })}
            />
            use_dst
          </label>

          <button
            onClick={onSubmit}
            disabled={loading}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #333",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Running..." : "Compute + Analyze"}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 12, opacity: 0.8 }}>
        <div style={{ fontSize: 12 }}>Request payload preview:</div>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, border: "1px solid #222", padding: 12, borderRadius: 10 }}>
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>

      {error && (
        <div style={{ border: "1px solid #5a1a1a", padding: 12, borderRadius: 10, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Error</div>
          <pre style={{ whiteSpace: "pre-wrap" }}>{error}</pre>
        </div>
      )}

      {data && (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ border: "1px solid #333", padding: 12, borderRadius: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Analysis</div>
            <pre style={{ whiteSpace: "pre-wrap" }}>{data.analysis ?? "(no analysis field returned)"}</pre>
          </div>

          <div style={{ border: "1px solid #333", padding: 12, borderRadius: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>BaZi JSON</div>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
              {JSON.stringify(data.bazi ?? data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12, opacity: 0.85 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #333",
  background: "transparent",
  color: "inherit",
};

