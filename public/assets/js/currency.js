/* =========================================================
   GLAZE — automatic local currency
   1) a currency the visitor picked before (saved in the browser)
   2) the country of the visitor's IP
   3) the browser's time zone / language as a fallback
   4) USD for everyone else
   In production on Vercel/Cloudflare, the country comes for free from the
   request header (x-vercel-ip-country / cf-ipcountry) — see README.
   ========================================================= */
(function () {
  const EURO = ['AT','BE','HR','CY','EE','FI','FR','DE','GR','IE','IT','LV','LT','LU','MT','NL','PT','SK','SI','ES','AD','MC','SM','VA','ME','XK'];
  const MAP = { CH:'CHF', LI:'CHF', GB:'GBP', IM:'GBP', JE:'GBP', GG:'GBP', US:'USD', CA:'CAD', AU:'AUD', BR:'BRL', MX:'MXN', JP:'JPY',
                SE:'SEK', NO:'NOK', DK:'DKK', PL:'PLN', IN:'INR', ZA:'ZAR', AE:'AED' };
  EURO.forEach(c => (MAP[c] = 'EUR'));

  // Rough time zone → country hints (used only when the IP lookup fails)
  const TZ = { 'Europe/Zurich':'CH','Europe/London':'GB','Europe/Lisbon':'PT','Atlantic/Madeira':'PT','Atlantic/Azores':'PT','Europe/Madrid':'ES',
    'Europe/Paris':'FR','Europe/Berlin':'DE','Europe/Rome':'IT','Europe/Amsterdam':'NL','Europe/Brussels':'BE','Europe/Vienna':'AT','Europe/Dublin':'IE',
    'Europe/Stockholm':'SE','Europe/Oslo':'NO','Europe/Copenhagen':'DK','Europe/Warsaw':'PL','America/Sao_Paulo':'BR','America/Mexico_City':'MX',
    'Asia/Tokyo':'JP','Asia/Kolkata':'IN','Africa/Johannesburg':'ZA','Asia/Dubai':'AE','Australia/Sydney':'AU','Australia/Melbourne':'AU',
    'America/Toronto':'CA','America/Vancouver':'CA' };

  const SUPPORTED = Object.keys(window.GLAZE.prices.complete);
  const KEY = 'glaze.currency';
  let state = { currency: 'EUR', country: null, source: 'default' };
  const listeners = [];

  function safeGet() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function safeSet(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function guessCountryFromBrowser() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (TZ[tz]) return TZ[tz];
      if (tz && tz.startsWith('America/')) return 'US';
      if (tz && tz.startsWith('Europe/')) return 'EU';
    } catch (e) {}
    const lang = (navigator.language || '').split('-')[1];
    return lang ? lang.toUpperCase() : null;
  }

  async function countryFromIP() {
    // 1) Our own server function (functions/api/geo.js) — fast, no third party.
    try {
      const r = await fetch('/api/geo', { cache: 'no-store' });
      if (r.ok) { const d = await r.json(); if (d && /^[A-Z]{2}$/.test(d.country || '')) return d.country; }
    } catch (e) {}
    // 2) Free, keyless public lookup as a backup.
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    try {
      const r = await fetch('https://ipapi.co/country/', { signal: ctrl.signal });
      const c = (await r.text()).trim().toUpperCase();
      return /^[A-Z]{2}$/.test(c) ? c : null;
    } catch (e) { return null; } finally { clearTimeout(t); }
  }

  function currencyFor(country) {
    if (country === 'EU') return 'EUR';
    return MAP[country] || 'USD';
  }

  function emit() { listeners.forEach(fn => fn(state)); }

  const ready = (async () => {
    const saved = safeGet();
    if (saved && SUPPORTED.includes(saved)) {
      state = { currency: saved, country: null, source: 'saved' };
    } else {
      // Show a fast best guess first, then refine with the IP country.
      const guess = guessCountryFromBrowser();
      state = { currency: currencyFor(guess), country: guess !== 'EU' ? guess : null, source: 'browser' };
      emit();
      const ipCountry = await countryFromIP();
      if (ipCountry) state = { currency: currencyFor(ipCountry), country: ipCountry, source: 'ip' };
    }
    emit();
    return state;
  })();

  function format(amount, currency) {
    const c = currency || state.currency;
    const noDecimals = ['JPY', 'INR', 'MXN', 'SEK', 'NOK', 'DKK', 'ZAR'].includes(c) && Number.isInteger(amount);
    return new Intl.NumberFormat('en', {
      style: 'currency', currency: c, currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: noDecimals ? 0 : 2, maximumFractionDigits: noDecimals ? 0 : 2
    }).format(amount);
  }

  function price(pack, currency) { return window.GLAZE.prices[pack][currency || state.currency]; }

  function countryName(code) {
    try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code); } catch (e) { return code; }
  }

  window.GlazeCurrency = {
    ready, SUPPORTED, format, price, countryName, currencyFor,
    get: () => state,
    set(code) { if (!SUPPORTED.includes(code)) return; state = { ...state, currency: code, source: 'manual' }; safeSet(code); emit(); },
    onChange(fn) { listeners.push(fn); fn(state); }
  };
})();
