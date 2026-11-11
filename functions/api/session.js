// Cloudflare Pages Function — GET /api/session?session_id=cs_...
// Returns the payment status and, only when paid, the download links for the pack.
// Download links come from environment variables DOWNLOAD_PHONE, DOWNLOAD_DESKTOP
// (and optionally DOWNLOAD_COMPLETE).

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// Default links (Dropbox folders, dl=1 = download straight away as one .zip).
// They are only ever sent to the browser AFTER Stripe confirms the payment.
// Cloudflare environment variables with the same names override these.
const LINKS = {
  DOWNLOAD_PHONE: 'https://www.dropbox.com/scl/fo/yhbb8eom788xudlbt2qhp/ALDCNT4xDsCYuE3kJcmpp2o?rlkey=ckz48t6jau3096l5artptmuwj&dl=1',
  DOWNLOAD_DESKTOP: 'https://www.dropbox.com/scl/fo/4mjuilvepok9073k462lg/ADgH1PiDyEXgTJvXxJ7tgC8?rlkey=7w0we1jhbyht65p5ds3vukyrh&dl=1',
  DOWNLOAD_COMPLETE: 'https://www.dropbox.com/scl/fo/8tm4tyrvt4wprme3mzr1h/AC3YnwqGuCDZlynTP_Fpbsc?rlkey=ahb8pmqda064ej52uoird8rt6&dl=1'
};
const link = (env, k) => env[k] || LINKS[k];

function downloadsFor(pack, env) {
  if (pack === 'phone') return [{ label: 'Phone Pack', url: link(env, 'DOWNLOAD_PHONE') }];
  if (pack === 'desktop') return [{ label: 'Desktop Pack', url: link(env, 'DOWNLOAD_DESKTOP') }];
  if (pack === 'complete') return [{ label: 'Complete Collection', url: link(env, 'DOWNLOAD_COMPLETE') }];
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
