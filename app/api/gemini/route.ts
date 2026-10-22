import { NextRequest, NextResponse } from "next/server";
import { callGeminiGenerate, DEFAULT_GEMINI_KEY, ACADEMIC_SYSTEM_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, systemInstruction, apiKey, model } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const key = apiKey || DEFAULT_GEMINI_KEY;
    const sysPrompt = systemInstruction || ACADEMIC_SYSTEM_PROMPT;
    const selectedModel = model || "gemini-flash-latest";

    try {
      const responseText = await callGeminiGenerate(prompt, sysPrompt, key, selectedModel);
      return NextResponse.json({ text: responseText, success: true, source: "gemini-live" });
    } catch (apiErr: any) {
      // Fallback synthesis if external Google network is restricted or timed out
      return NextResponse.json({
        text: null,
        success: false,
        fallbackMode: true,
        message: apiErr.message || "Gemini API unavailable, switched to local engine."
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
