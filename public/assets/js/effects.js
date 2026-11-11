/* =========================================================
   GLAZE — shared helpers (every page)
   currency menu + live prices, reveal on scroll, toast, nav state
   ========================================================= */
(function () {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Currency menu + prices ---------- */
  function initCurrency() {
    const C = window.GlazeCurrency; if (!C) return;
    const wrap = document.querySelector('[data-currency]');
    if (wrap) {
      const btn = wrap.querySelector('.currency-btn'), menu = wrap.querySelector('.currency-menu');
      let names; try { names = new Intl.DisplayNames(['en'], { type: 'currency' }); } catch (e) { names = { of: c => c }; }
      menu.innerHTML = '<div class="note">Prices are set for your location. You can pick another currency anytime.</div>' +
        C.SUPPORTED.map(c => `<button role="option" data-cur="${c}"><span>${names.of(c)}</span><span>${c}</span></button>`).join('');
      const toggle = open => { wrap.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); };
      btn.addEventListener('click', e => { e.stopPropagation(); toggle(!wrap.classList.contains('open')); });
      document.addEventListener('click', e => { if (!wrap.contains(e.target)) toggle(false); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
      menu.addEventListener('click', e => { const b = e.target.closest('[data-cur]'); if (b) { C.set(b.dataset.cur); toggle(false); } });
      document.querySelectorAll('[data-open-currency]').forEach(b => b.addEventListener('click', e => {
        e.stopPropagation(); window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); setTimeout(() => toggle(true), reduced ? 0 : 450);
      }));
    }
    C.onChange(st => {
      document.querySelectorAll('[data-currency-code]').forEach(el => (el.textContent = st.currency));
      document.querySelectorAll('[data-cur]').forEach(b => b.setAttribute('aria-selected', b.dataset.cur === st.currency));
      document.querySelectorAll('[data-price]').forEach(el => (el.textContent = C.format(C.price(el.dataset.price))));
      document.querySelectorAll('[data-currency-name]').forEach(el => {
        el.textContent = st.country && st.source === 'ip' ? `${st.currency} for ${C.countryName(st.country)}` : st.currency;
      });
      document.dispatchEvent(new CustomEvent('glaze:currency', { detail: st }));
    });
  }

  function toast(msg, ms = 4200) {
    const el = document.querySelector('[data-toast]'); if (!el) return;
    el.textContent = msg; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), ms);
  }

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
    : null;
  function reveal(root = document) {
    root.querySelectorAll('.reveal:not(.in)').forEach(el => (io ? io.observe(el) : el.classList.add('in')));
  }

  /* ---------- Nav border on scroll ---------- */
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', scrollY > 10);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  document.querySelectorAll('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));
  document.querySelectorAll('[data-support]').forEach(a => (a.href = 'mailto:' + window.GLAZE.supportEmail));
  document.querySelectorAll('[data-support-text]').forEach(el => (el.textContent = window.GLAZE.supportEmail));

  window.GlazeFX = { toast, reveal, reduced, initCurrency };
})();
