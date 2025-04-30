import { NextResponse, type NextRequest } from "next/server";

export const revalidate = 0;

export async function GET(request: NextRequest) {
  // Exit early for development mode to avoid unnecessary API calls
  if (process.env.DEEPGRAM_ENV === "development") {
    return NextResponse.json({
      key: process.env.DEEPGRAM_API_KEY ?? "",
    });
  }

  // Directly return the existing API key if no special key generation is needed
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key is missing" });
  }

  const response = NextResponse.json({ key: apiKey });
  response.headers.set("Surrogate-Control", "no-store");
  response.headers.set(
    "Cache-Control",
    "s-maxage=0, no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Expires", "0");

  return response;
}
