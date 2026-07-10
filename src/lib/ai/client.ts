import OpenAI from "openai";

export function isLiveAiConfigured(): boolean { return process.env.DEMO_MODE === "false" && Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL); }
export function getOpenAIClient(): OpenAI {
  if (!isLiveAiConfigured()) throw new Error("Live AI is not configured. Set DEMO_MODE=false, OPENAI_API_KEY, and OPENAI_MODEL server-side.");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
