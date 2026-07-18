export type ModelProvider = "openai" | "google" | "openrouter";

export type ChatModel = {
  id: string;
  label: string;
  provider: ModelProvider;
  supportsImages: boolean;
};

export const PROVIDER_ENV_KEYS: Record<ModelProvider, string> = {
  openai: "OPENAI_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
};

export const CHAT_MODELS: ChatModel[] = [
  {
    id: "gpt-4o-mini",
    label: "GPT-4o mini",
    provider: "openai",
    supportsImages: true,
  },
  { id: "gpt-4o", label: "GPT-4o", provider: "openai", supportsImages: true },
  {
    id: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    provider: "google",
    supportsImages: true,
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    label: "Llama 3.3 70B (OpenRouter)",
    provider: "openrouter",
    supportsImages: false,
  },
];

export const DEFAULT_MODEL_ID = "gpt-4o-mini";

export function findChatModel(id: string): ChatModel | undefined {
  return CHAT_MODELS.find((m) => m.id === id);
}
