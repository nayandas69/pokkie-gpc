import type { APIRoute } from "astro";

export const prerender = false;

const UPSTREAM_HEALTH_URL =
  "https://github-profile-card-blue.vercel.app/health";
const TIMEOUT_MS = 5000;

export const GET: APIRoute = async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(UPSTREAM_HEALTH_URL, {
      cache: "no-store",
      signal: controller.signal,
      headers: { accept: "application/json" },
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status !== "ok") {
      return Response.json(
        { status: "error", message: "Card service is not healthy." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    return Response.json(
      { status: "ok", timestamp: data.timestamp },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "error", message: "Card service health check failed." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  } finally {
    clearTimeout(timeout);
  }
};
