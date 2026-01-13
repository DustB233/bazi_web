import { UserButton } from "@clerk/nextjs";

export default function GeneratePage() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      {/* top-right user menu */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <UserButton afterSignOutUrl="/" />
      </div>

      <h1 style={{ fontSize: 28, marginTop: 12 }}>Compute + Analyze</h1>
      <p style={{ opacity: 0.8 }}>
        You are signed in, so you can use the generator.
      </p>

      {/* TODO: paste your existing UI here */}
      <div style={{ marginTop: 18 }}>
        {/* Example placeholder */}
        <p>Put your input form + compute button + output here.</p>
      </div>
    </main>
  );
}
