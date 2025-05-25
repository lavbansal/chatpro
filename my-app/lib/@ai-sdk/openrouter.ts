import type {
  LanguageModelV1,
  LanguageModelV1CallOptions,
  LanguageModelV1StreamPart,
} from "ai";

export function openrouter(modelId: string): LanguageModelV1 {
  return {
    specificationVersion: "v1",
    modelId,
    provider: "openrouter",
    defaultObjectGenerationMode: "tool",

    async doStream(options: LanguageModelV1CallOptions) {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "My Assistant App",
        },
        body: JSON.stringify({
          model: modelId,
          messages: options.prompt as any,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to OpenRouter");
      }

      return {
        stream: response.body as unknown as ReadableStream<LanguageModelV1StreamPart>,
        rawCall: {
          rawPrompt: options.prompt,
          rawSettings: { model: modelId },
        },
      };
    },

    async doGenerate() {
      throw new Error("doGenerate not implemented");
    },
  };
}
