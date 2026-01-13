import BaziClient from "@/components/BaziClient";

export default function GeneratePage() {
  return (
    <main style={{ minHeight: "100vh", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Compute + Analyze</h1>
      <div style={{ marginTop: 16 }}>
        <BaziClient />
      </div>
    </main>
  );
}

