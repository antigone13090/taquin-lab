// Free Cloudflare edge hosting. Only a fixed public build branch is readable.
// The CI pipeline publishes gh-pages only after tests and a production build.
const root =
  "https://raw.githubusercontent.com/antigone13090/taquin-lab/gh-pages";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};
export async function serve(request, load = fetch) {
  if (!["GET", "HEAD"].includes(request.method))
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  const path = new URL(request.url).pathname;
  if (
    path !== "/" &&
    path !== "/index.html" &&
    !/^\/assets\/[a-zA-Z0-9_.-]+\.(js|css|svg)$/.test(path)
  )
    return new Response("Not found", { status: 404 });
  const name = path === "/" ? "/index.html" : path;
  try {
    const upstream = await load(root + name, {
      cf: {
        cacheTtl: name === "/index.html" ? 30 : 86400,
        cacheEverything: true,
      },
    });
    if (!upstream.ok)
      return new Response(
        "TAQUIN LAB est en cours de publication. Réessayez dans quelques instants.",
        {
          status: name === "/index.html" ? 503 : 404,
          headers: { "Retry-After": "30" },
        },
      );
    const ext = name.slice(name.lastIndexOf("."));
    return new Response(request.method === "HEAD" ? null : upstream.body, {
      headers: {
        "Content-Type": mime[ext] || "application/octet-stream",
        "Cache-Control":
          name === "/index.html"
            ? "public, max-age=0, must-revalidate"
            : "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; worker-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'",
      },
    });
  } catch {
    return new Response("Publication temporairement indisponible", {
      status: 503,
      headers: { "Retry-After": "30" },
    });
  }
}
export default { fetch: (request) => serve(request) };
