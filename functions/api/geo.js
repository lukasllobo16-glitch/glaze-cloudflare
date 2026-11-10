// Cloudflare Pages Function — GET /api/geo  →  { country: "PT" }
// Uses Cloudflare's own IP geolocation (no third party).
export function onRequestGet({ request }) {
  const country = (request.cf && request.cf.country) || request.headers.get('cf-ipcountry') || null;
  return new Response(JSON.stringify({ country: country && country !== 'XX' ? country : null }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
