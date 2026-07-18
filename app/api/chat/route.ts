import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
  toUIMessageStream,
  type LanguageModel,
  type ToolSet,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { openrouter } from "@/lib/@ai-sdk/openrouter";
import {
  DEFAULT_MODEL_ID,
  findChatModel,
  PROVIDER_ENV_KEYS,
  type ChatModel,
} from "@/lib/models";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are ChatPro, a helpful and accurate AI assistant.
Answer concisely and format responses in Markdown when it improves readability.
When asked about current weather, use the getWeather tool instead of guessing.
If a tool call fails, tell the user what went wrong instead of inventing data.`;

const WEB_SEARCH_PROMPT = `For questions about current events, recent developments, or facts likely to have changed since your training data, use the webSearch tool and cite the source URLs in your answer.`;

// WMO weather interpretation codes used by Open-Meteo.
const WEATHER_CODES: Record<number, string> = {
  0: "clear sky",
  1: "mainly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "fog",
  48: "depositing rime fog",
  51: "light drizzle",
  53: "moderate drizzle",
  55: "dense drizzle",
  61: "light rain",
  63: "moderate rain",
  65: "heavy rain",
  66: "light freezing rain",
  67: "heavy freezing rain",
  71: "light snow",
  73: "moderate snow",
  75: "heavy snow",
  77: "snow grains",
  80: "light rain showers",
  81: "moderate rain showers",
  82: "violent rain showers",
  85: "light snow showers",
  86: "heavy snow showers",
  95: "thunderstorm",
  96: "thunderstorm with light hail",
  99: "thunderstorm with heavy hail",
};

const getWeather = tool({
  description:
    "Get the current weather for a city or place name. Uses the free Open-Meteo API.",
  inputSchema: z.object({
    location: z
      .string()
      .describe('City or place name, e.g. "Tokyo" or "Berlin, Germany"'),
  }),
  execute: async ({ location }) => {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`,
    );
    if (!geoRes.ok) {
      throw new Error(`Geocoding failed with status ${geoRes.status}`);
    }
    const geo = (await geoRes.json()) as {
      results?: {
        name: string;
        country?: string;
        latitude: number;
        longitude: number;
      }[];
    };
    const place = geo.results?.[0];
    if (!place) {
      return { error: `No location found matching "${location}"` };
    }

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`,
    );
    if (!weatherRes.ok) {
      throw new Error(`Weather lookup failed with status ${weatherRes.status}`);
    }
    const weather = (await weatherRes.json()) as {
      current: {
        temperature_2m: number;
        relative_humidity_2m: number;
        weather_code: number;
        wind_speed_10m: number;
      };
    };

    return {
      location: [place.name, place.country].filter(Boolean).join(", "),
      temperatureC: weather.current.temperature_2m,
      humidityPercent: weather.current.relative_humidity_2m,
      windSpeedKmh: weather.current.wind_speed_10m,
      conditions:
        WEATHER_CODES[weather.current.weather_code] ??
        `weather code ${weather.current.weather_code}`,
    };
  },
});

const webSearch = tool({
  description:
    "Search the web for current information. Returns the top results with title, URL, and a content snippet. Cite the URLs of results you use.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify({ query, max_results: 5, include_answer: true }),
    });
    if (!res.ok) {
      throw new Error(`Web search failed with status ${res.status}`);
    }
    const data = (await res.json()) as {
      answer?: string;
      results?: { title: string; url: string; content: string }[];
    };
    return {
      answer: data.answer,
      results: (data.results ?? []).map(({ title, url, content }) => ({
        title,
        url,
        content,
      })),
    };
  },
});

function buildTools(): ToolSet {
  const tools: ToolSet = { getWeather };
  // Only offer web search when the server is configured for it, so the model
  // never calls a tool that is guaranteed to fail.
  if (process.env.TAVILY_API_KEY) {
    tools.webSearch = webSearch;
  }
  return tools;
}

function errorResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain" },
  });
}

function getLanguageModel(model: ChatModel): LanguageModel {
  switch (model.provider) {
    case "openai":
      return openai(model.id);
    case "google":
      return google(model.id);
    case "openrouter":
      return openrouter(model.id);
  }
}

export async function POST(req: Request) {
  let body: { messages?: UIMessage[]; model?: string; system?: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  const { messages, model: modelId = DEFAULT_MODEL_ID, system } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return errorResponse("Request must include a non-empty messages array.", 400);
  }

  const model = findChatModel(modelId);
  if (!model) {
    return errorResponse(`Unknown model "${modelId}".`, 400);
  }

  const envKey = PROVIDER_ENV_KEYS[model.provider];
  if (!process.env[envKey]) {
    return errorResponse(
      `${model.label} is unavailable: set ${envKey} in .env.local and restart the server.`,
      503,
    );
  }

  const tools = buildTools();

  let modelMessages;
  try {
    modelMessages = await convertToModelMessages(messages, { tools });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Invalid messages.",
      400,
    );
  }

  try {
    const result = streamText({
      model: getLanguageModel(model),
      instructions: [
        SYSTEM_PROMPT,
        tools.webSearch ? WEB_SEARCH_PROMPT : undefined,
        system,
      ]
        .filter((part): part is string => Boolean(part))
        .join("\n\n"),
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(5),
    });
    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        onError: (error) =>
          error instanceof Error ? error.message : "An unknown error occurred.",
      }),
    });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "An unknown error occurred.",
      500,
    );
  }
}
