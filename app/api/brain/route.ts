import { streamText } from "ai";
import { groq } from '@ai-sdk/groq';

// Optional, but recommended: run on the edge runtime.
// See https://vercel.com/docs/concepts/functions/edge-functions
export const runtime = "edge";

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();
  const start = Date.now();

  // Request the OpenAI API for the response based on the prompt
  try {
    const result = streamText({
      model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
      messages,
    });

    return result.toDataStreamResponse({
      headers: {
        "X-LLM-Start": `${start}`,
        "X-LLM-Response": `${Date.now()}`,
      },
    });
  } catch (error) {
    console.error("test", error);
  }
}