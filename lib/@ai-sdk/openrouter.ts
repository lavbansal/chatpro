import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV1 } from "ai";

// OpenRouter exposes an OpenAI-compatible API, so we reuse the OpenAI
// provider with a custom base URL instead of hand-rolling a LanguageModelV1.
const provider = createOpenAI({
  name: "openrouter",
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  headers: {
    "HTTP-Referer": "https://chatpro-drab.vercel.app",
    "X-Title": "ChatPro",
  },
});

export function openrouter(modelId: string): LanguageModelV1 {
  return provider.chat(modelId);
}
