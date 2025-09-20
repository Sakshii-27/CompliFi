import { NextRequest } from "next/server";

// Configure backend URL via env or fallback
const BACKEND_CHAT_URL = process.env.CHATBOT_BACKEND_URL || process.env.NEXT_PUBLIC_CHATBOT_BACKEND_URL || "http://localhost:8000/chat";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const res = await fetch(BACKEND_CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({ error: "Invalid JSON from backend" }));

    return new Response(JSON.stringify(data), {
      status: res.ok ? 200 : res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || "Failed to reach chatbot backend" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
