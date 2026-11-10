// Cloudflare Pages Function — GET /api/session?session_id=cs_...
// Returns the payment status and, only when paid, the download links for the pack.
// Download links come from environment variables DOWNLOAD_PHONE, DOWNLOAD_DESKTOP
// (and optionally DOWNLOAD_COMPLETE).

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

function downloadsFor(pack, env) {
  const phone = env.DOWNLOAD_PHONE && { label: 'Phone Pack', url: env.DOWNLOAD_PHONE };
  const desktop = env.DOWNLOAD_DESKTOP && { label: 'Desktop Pack', url: env.DOWNLOAD_DESKTOP };
  if (pack === 'phone') return [phone].filter(Boolean);
  if (pack === 'desktop') return [desktop].filter(Boolean);
  if (pack === 'complete') {
    if (env.DOWNLOAD_COMPLETE) return [{ label: 'Complete Collection', url: env.DOWNLOAD_COMPLETE }];
    return [phone, desktop].filter(Boolean);
  }
  return [];
}

export async function onRequestGet({ request, env }) {
  const id = new URL(request.url).searchParams.get('session_id') || '';
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return json({ error: 'Missing session' }, 400);
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Payments are not configured' }, 500);

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(id), {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` }
  });
  const s = await res.json();
  if (!res.ok) { console.error('[session]', s.error && s.error.message); return json({ error: 'Could not check the payment' }, 500); }

  const paid = s.status === 'complete' && s.payment_status === 'paid';
  const pack = s.metadata && s.metadata.pack;
  return json({
    status: s.status,
    paid,
    pack,
    email: s.customer_details ? s.customer_details.email : null,
    downloads: paid ? downloadsFor(pack, env) : []
  });
}
