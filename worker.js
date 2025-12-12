export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }

    // Upstream: allow override via env
    const upstream = env.UPSTREAM_URL || "https://api.cursor.com/v1/chat/completions";

    try {
      const body = await request.json();

      const r = await fetch(upstream, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.CURSOR_API_KEY}`,
          "X-API-Key": env.CURSOR_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const text = await r.text();
      return new Response(text, {
        status: r.status,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(`Proxy error: ${e}`, { status: 500, headers: cors });
    }
  }
}

