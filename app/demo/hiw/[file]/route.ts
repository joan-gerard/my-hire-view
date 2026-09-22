const ALLOWED = new Set(["hiw-1.json", "hiw-2.json", "hiw-3.json"]);
const UPSTREAM = "https://parley-home.vercel.app/assets";

export async function GET(
  _request: Request,
  context: { params: Promise<{ file: string }> | { file: string } },
) {
  const { file } = await context.params;
  if (!ALLOWED.has(file)) {
    return new Response("Not found", { status: 404 });
  }

  const res = await fetch(`${UPSTREAM}/${file}`);
  if (!res.ok) {
    return new Response("Upstream error", { status: res.status });
  }

  return new Response(res.body, {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=86400",
    },
  });
}
