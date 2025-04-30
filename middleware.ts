import { NextResponse, type NextRequest } from "next/server";

const corsOptions = {
  allowedMethods: (process.env?.ALLOWED_METHODS || "").split(","),
  allowedOrigins: (process.env?.ALLOWED_ORIGIN || "").split(","),
  allowedHeaders: (process.env?.ALLOWED_HEADERS || "").split(","),
  exposedHeaders: (process.env?.EXPOSED_HEADERS || "").split(","),
  maxAge:
    (process.env?.PREFLIGHT_MAX_AGE &&
      parseInt(process.env?.PREFLIGHT_MAX_AGE)) ||
    undefined,
  credentials: process.env?.CREDENTIALS === "true",
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get request origin
  const origin = request.headers.get("origin") ?? "";

  // Allow requests from allowed origins
  if (
    corsOptions.allowedOrigins.includes("*") ||
    corsOptions.allowedOrigins.includes(origin)
  ) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  // CORS Headers
  response.headers.set(
    "Access-Control-Allow-Credentials",
    corsOptions.credentials.toString()
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    corsOptions.allowedMethods.join(",")
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    corsOptions.allowedHeaders.join(",")
  );
  response.headers.set(
    "Access-Control-Expose-Headers",
    corsOptions.exposedHeaders.join(",")
  );
  if (corsOptions.maxAge) {
    response.headers.set("Access-Control-Max-Age", corsOptions.maxAge.toString());
  }

  // 🔥 Allow embedding in iframe (Fixes the issue)
  response.headers.set("X-Frame-Options", "ALLOW-FROM http://localhost:3000");
  response.headers.set(
    "Content-Security-Policy",
    "frame-ancestors 'self' http://localhost:3000;"
  );

  return response;
}

// Apply middleware only to API routes
export const config = {
  matcher: "/api/:path*",
};
