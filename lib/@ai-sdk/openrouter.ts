import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

// OpenRouter exposes an OpenAI-compatible chat completions API, so we reuse
// the OpenAI provider with a custom base URL instead of adding a dedicated
// provider package.
const provider = createOpenAI({
  name: "openrouter",
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  headers: {
    "HTTP-Referer": "https://chatpro-drab.vercel.app",
    "X-Title": "ChatPro",
  },
});

export function openrouter(modelId: string): LanguageModel {
  return provider.chat(modelId);
}
