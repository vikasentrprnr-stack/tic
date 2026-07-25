import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, ticker } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        reply: `(Groq Key Missing) Add GROQ_API_KEY to .env.local and restart your dev server. Query: ${message}`
      });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are an elite quantitative analyst at a top hedge fund. Answer concisely (under 3 sentences) focusing on macroeconomic factors affecting ${ticker}.`
          },
          { role: "user", content: message }
        ],
        temperature: 0.5,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error("Groq API Error:", errData);
      return NextResponse.json({ reply: `Groq Agent error (${response.status}). Check server logs.` });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No correlation output generated.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chat API Internal Error:", error);
    return NextResponse.json({ reply: "Correlation service temporarily offline." });
  }
}