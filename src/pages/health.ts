export function GET(): Response {
  return Response.json(
    { status: "ok", service: "obsidi.xyz" },
    { headers: { "cache-control": "no-store" } }
  );
}
