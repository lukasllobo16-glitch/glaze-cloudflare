/* =========================================================
   GLAZE — checkout page
   Stripe Embedded Checkout: the Stripe payment form is shown INSIDE
   this page. Our server (/api/checkout, a Netlify Function) creates the
   session with the right pack, price and currency.
   If the server is not reachable (e.g. local preview), the page falls
   back to the Stripe Payment Link for that pack.
   ========================================================= */
(function () {
  const G = window.GLAZE, C = window.GlazeCurrency, FX = window.GlazeFX;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const KEYS = ['phone', 'desktop', 'complete'];
  let pack = new URLSearchParams(location.search).get('pack');
  if (!KEYS.includes(pack)) pack = 'complete';

  /* ---------- Pack choices ---------- */
  const opts = $('[data-options]');
  opts.innerHTML = KEYS.map(k => `
    <label class="pack-opt" data-opt="${k}">
      <input type="radio" name="pack" value="${k}">
      <span class="radio"></span>
      <span><b>${G.packs[k].name}</b><small>${G.packs[k].tagline}</small></span>
      <span class="p" data-price="${k}"></span>
    </label>`).join('');
  opts.addEventListener('change', e => { if (e.target.name === 'pack') select(e.target.value); });

  const LAYOUT = {
    phone:    [['p1', 'left:12%;top:16%;width:22%;aspect-ratio:9/19.5;transform:rotate(-8deg)'], ['p3', 'left:39%;top:8%;width:22%;aspect-ratio:9/19.5;z-index:2'], ['p6', 'left:66%;top:16%;width:22%;aspect-ratio:9/19.5;transform:rotate(8deg)']],
    desktop:  [['d2', 'left:6%;top:12%;width:58%;aspect-ratio:16/9;transform:rotate(-4deg)'], ['d6', 'left:22%;top:40%;width:58%;aspect-ratio:16/9;z-index:2'], ['d3', 'left:38%;top:8%;width:56%;aspect-ratio:16/9;transform:rotate(4deg)']],
    complete: [['d4', 'left:5%;top:14%;width:62%;aspect-ratio:16/9;transform:rotate(-3deg)'], ['d7', 'left:14%;top:46%;width:52%;aspect-ratio:16/9;transform:rotate(3deg)'], ['p2', 'left:68%;top:7%;width:22%;aspect-ratio:9/19.5;z-index:2;transform:rotate(6deg)']]
  };
  const preview = $('[data-preview]');

  function select(k) {
    pack = k;
    $$('[data-opt]').forEach(o => { const on = o.dataset.opt === k; o.classList.toggle('sel', on); $('input', o).checked = on; });
    preview.innerHTML = LAYOUT[k].map(([n, s]) => `<img src="assets/img/${n}.jpg" alt="" style="${s}">`).join('');
    try { history.replaceState(null, '', `?pack=${k}`); } catch (e) {}
    updateSummary();
    scheduleMount();
  }

  function updateSummary() {
    $('[data-sum-name]').textContent = G.packs[pack].name;
    $('[data-sum-price]').textContent = C.format(C.price(pack));
    $$('[data-sum-total]').forEach(el => (el.textContent = C.format(C.price(pack))));
    const saveRow = $('[data-sum-save-row]');
    if (pack === 'complete') {
      const s = Math.round((C.price('phone') + C.price('desktop') - C.price('complete')) * 100) / 100;
      $('[data-sum-save]').textContent = C.format(s); saveRow.hidden = false;
    } else saveRow.hidden = true;
  }

  /* ---------- Stripe Embedded Checkout ---------- */
  const mountEl = $('#stripe-checkout'), loading = $('[data-pay-loading]'), fallbackEl = $('[data-pay-fallback]');
  let stripe = null, embedded = null, queue = Promise.resolve(), timer = 0, mountedKey = '';

  function showLoading() { fallbackEl.hidden = true; mountEl.hidden = false; if (!mountEl.contains(loading)) mountEl.appendChild(loading); loading.hidden = false; }

  function showFallback() {
    const link = G.stripe.paymentLinks && G.stripe.paymentLinks[pack];
    mountEl.hidden = true; fallbackEl.hidden = false;
    const a = $('[data-fallback-link]');
    if (link) {
      const url = new URL(link); url.searchParams.set('locale', 'auto');
      a.href = url.toString(); a.removeAttribute('aria-disabled');
    } else { a.href = '#'; a.setAttribute('aria-disabled', 'true'); }
  }

  async function doMount() {
    const key = pack + ':' + C.get().currency;
    if (key === mountedKey && embedded) return;
    if (embedded) { embedded.destroy(); embedded = null; mountedKey = ''; }
    showLoading();
    if (!window.Stripe || !G.stripe.publishableKey) return showFallback();
    stripe = stripe || window.Stripe(G.stripe.publishableKey);
    try {
      const res = await fetch(G.stripe.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack, currency: C.get().currency })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.clientSecret) throw new Error(data.error || 'no session');
      embedded = await stripe.initEmbeddedCheckout({ fetchClientSecret: async () => data.clientSecret });
      loading.remove();
      embedded.mount('#stripe-checkout');
      mountedKey = key;
    } catch (e) {
      console.warn('[Glaze] embedded checkout unavailable, using Payment Link instead:', e.message);
      showFallback();
    }
  }

  // Re-create the payment form when the pack or currency changes (one at a time).
  function scheduleMount() {
    clearTimeout(timer);
    timer = setTimeout(() => { queue = queue.then(doMount, doMount); }, 250);
  }

  document.addEventListener('glaze:currency', () => { updateSummary(); scheduleMount(); });

  FX.initCurrency();
  select(pack);
})();
