"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GenerateClient() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onGenerate() {
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/generate");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/bazi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: 2005,
          month: 3,
          day: 4,
          time: "02:12",
          gender: "male",
          city: "qingdao",
          country: "china",
        }),
      });

      const data = await r.json();
      console.log(data);
      // set state -> show result on page
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={onGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>
    </div>
  );
}
