import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@supabase/ssr";

const openai = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
});

export async function POST(request: NextRequest) {
  // Verify auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dimension, dimensionLabel, score, answers } = await request.json();

  const prompt = `Du är en empatisk livscoach som hjälper människor förstå orsakerna bakom sin livssituation.

En person har bedömt sitt livsområde "${dimensionLabel}" till ${score}/10.

De har svarat på följande frågor:
${answers.map((a: { question: string; answer: string }) => `- ${a.question}: ${a.answer}`).join("\n")}

Skriv en kort, reflekterande sammanfattning (3-5 meningar) av de troliga orsakerna bakom personens bedömning. Var varm och uppmuntrande i tonen. Använd "du"-form. Skriv på svenska.

Avsluta med en kort uppmuntran om att det är bra att reflektera och att nästa steg är att sätta mål.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    const analysis = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}
