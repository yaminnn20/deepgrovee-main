import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

// Optional, but recommended: run on the edge runtime.
export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const start = Date.now();

  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  try {
    const response = await client.chat.completions.create({
      model: "gemma2-9b-it",
      temperature: 0.2,
      stream: true,
      messages: messages,
    });

    const stream = OpenAIStream(response);

    return new StreamingTextResponse(stream, {
      headers: {
        "X-LLM-Start": `${start}`,
        "X-LLM-Response": `${Date.now()}`,
      },
    });
  } catch (error) {
    console.error("Error in Groq API call:", error);
    return new Response(JSON.stringify({ error: "Failed to process request" }), { 
      status: 500 
    });
  }
}
