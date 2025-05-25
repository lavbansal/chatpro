// // app/api/chat/route.ts
// import { streamText } from "ai";
// import { openrouter } from "../../../lib/@ai-sdk/openrouter";

// export const runtime = 'edge'; // ⬅️ Edge Runtime flag

// export const maxDuration = 30;

// export async function POST(req: Request) {
//   const { messages } = await req.json();

//   const result = await streamText({
//     model: openrouter("mistralai/mistral-7b-instruct"),
//     messages,
//   });

//   return result.toDataStreamResponse();
// }




import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages,
  });
  return result.toDataStreamResponse();
}