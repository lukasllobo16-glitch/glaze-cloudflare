// Cloudflare Pages Function — POST /api/checkout  { pack, currency }  →  { clientSecret }
// Creates a Stripe Checkout Session shown INSIDE the Glaze site (Stripe Embedded Checkout).
// Prices live HERE on the server; keep them in sync with public/assets/js/config.js.
// Needs the encrypted environment variable STRIPE_SECRET_KEY (set in the Cloudflare dashboard).

const PRICES = {
  phone:    { EUR: 9.99,  USD: 11.99, GBP: 8.99,  CHF: 9.90,  CAD: 15.99, AUD: 17.99, BRL: 59.90,  MXN: 209, JPY: 1800, SEK: 109, NOK: 119, DKK: 75,  PLN: 42.99, INR: 999,  ZAR: 199, AED: 42.99 },
  desktop:  { EUR: 15.99, USD: 18.99, GBP: 13.99, CHF: 14.90, CAD: 24.99, AUD: 27.99, BRL: 94.90,  MXN: 339, JPY: 2800, SEK: 179, NOK: 189, DKK: 119, PLN: 67.99, INR: 1599, ZAR: 319, AED: 67.99 },
  complete: { EUR: 20.99, USD: 24.99, GBP: 17.99, CHF: 19.90, CAD: 32.99, AUD: 36.99, BRL: 124.90, MXN: 449, JPY: 3700, SEK: 229, NOK: 249, DKK: 159, PLN: 88.99, INR: 2099, ZAR: 419, AED: 89.99 }
};
const PRODUCTS = {
  phone:    { name: 'Glaze Phone Pack',           description: 'Every painting, made for your phone. Instant download.' },
  desktop:  { name: 'Glaze Desktop Pack',         description: 'Turn your laptop into a gallery wall. Instant download.' },
  complete: { name: 'Glaze Complete Collection', description: 'Phone and desktop. Every screen covered. Instant download.' }
};
const ZERO_DECIMAL = ['JPY'];

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Bad request' }, 400); }
  const { pack, currency } = body || {};
  const amount = PRICES[pack] && PRICES[pack][currency];
  if (!amount) return json({ error: 'Unknown pack or currency' }, 400);
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Payments are not configured' }, 500);

  const site = env.SITE_URL || new URL(request.url).origin;
  const p = new URLSearchParams();
  p.append('ui_mode', 'embedded');
  p.append('mode', 'payment');
  p.append('return_url', `${site}/thank-you.html?session_id={CHECKOUT_SESSION_ID}`);
  p.append('line_items[0][quantity]', '1');
  p.append('line_items[0][price_data][currency]', currency.toLowerCase());
  p.append('line_items[0][price_data][unit_amount]', String(ZERO_DECIMAL.includes(currency) ? Math.round(amount) : Math.round(amount * 100)));
  p.append('line_items[0][price_data][product_data][name]', PRODUCTS[pack].name);
  p.append('line_items[0][price_data][product_data][description]', PRODUCTS[pack].description);
  p.append('metadata[pack]', pack);
  p.append('payment_intent_data[metadata][pack]', pack);
  p.append('custom_text[submit][message]',
    'Digital download with instant access. By paying, you agree that your right of withdrawal ends once the files are available to you.');
  if (env.STRIPE_AUTOMATIC_TAX === 'true') { // turn on after activating Stripe Tax
    p.append('automatic_tax[enabled]', 'true');
    p.append('line_items[0][price_data][tax_behavior]', 'inclusive');
  }

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: p.toString()
  });
  const data = await res.json();
  if (!res.ok) { console.error('[checkout]', data.error && data.error.message); return json({ error: 'Could not start the payment' }, 500); }
  return json({ clientSecret: data.client_secret });
}
