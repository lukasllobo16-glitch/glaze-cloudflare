/* =========================================================
   GLAZE — shared effects (used on every page)
   - Liquid glass: refraction on Chromium, pointer-following rim light
   - "Snap" particle dissolve (canvas)
   - 3D tilt
   - Currency menu + live prices
   ========================================================= */
(function () {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isChromium = !!(navigator.userAgentData && navigator.userAgentData.brands.some(b => /Chromium/.test(b.brand)));
  if (isChromium) document.documentElement.classList.add('lg-refract');


  /* ---------- Rim light follows the pointer on glass ---------- */
  document.addEventListener('pointermove', e => {
    const el = e.target.closest && e.target.closest('.glass');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  }, { passive: true });

  /* ---------- 3D tilt ---------- */
  function tilt(el, max = 8) {
    if (reduced || matchMedia('(hover: none)').matches) return;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ty', ((px - .5) * max * 2) + 'deg');
      el.style.setProperty('--tx', ((.5 - py) * max * 2) + 'deg');
      el.style.setProperty('--gx', px * 100 + '%'); el.style.setProperty('--gy', py * 100 + '%');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--tx', '0deg'); el.style.setProperty('--ty', '0deg'); });
  }

  /* ---------- Particle dissolve ("snap") ----------
     Takes a picture (an <img> or a canvas), turns every 2×2 block of
     pixels into a particle, then blows them away left → right as dust. */
  class Dissolver {
    constructor(canvas, opts = {}) {
      this.canvas = canvas; this.ctx = canvas.getContext('2d', { willReadFrequently: true });
      this.step = opts.step || 2; this.duration = 0; this.raf = 0;
    }
    fit() {
      const r = this.canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 1.25);
      this.w = this.canvas.width = Math.max(2, Math.round(r.width * scale));
      this.h = this.canvas.height = Math.max(2, Math.round(r.height * scale));
    }
    drawCover(source) {
      const sw = source.naturalWidth || source.width, sh = source.naturalHeight || source.height;
      const s = Math.max(this.w / sw, this.h / sh), dw = sw * s, dh = sh * s;
      this.ctx.clearRect(0, 0, this.w, this.h);
      this.ctx.drawImage(source, (this.w - dw) / 2, (this.h - dh) / 2, dw, dh);
    }
    capture() {
      const { w, h, step } = this; const data = this.ctx.getImageData(0, 0, w, h).data;
      const cols = Math.ceil(w / step), rows = Math.ceil(h / step), n = cols * rows;
      const P = this.p = { n, x: new Float32Array(n), y: new Float32Array(n), vx: new Float32Array(n), vy: new Float32Array(n),
        delay: new Float32Array(n), life: new Float32Array(n), seed: new Float32Array(n), c: new Uint8ClampedArray(n * 3) };
      let i = 0;
      for (let yy = 0; yy < rows; yy++) for (let xx = 0; xx < cols; xx++, i++) {
        const x = xx * step, y = yy * step, o = (y * w + x) * 4;
        P.x[i] = x; P.y[i] = y; P.c[i * 3] = data[o]; P.c[i * 3 + 1] = data[o + 1]; P.c[i * 3 + 2] = data[o + 2];
        const band = Math.sin(y * 0.02) * 0.08 + Math.random() * 0.55;
        P.delay[i] = (x / w) * 1.1 + band;
        P.life[i] = 0.9 + Math.random() * 0.9;
        P.vx[i] = 30 + Math.random() * 120; P.vy[i] = -(15 + Math.random() * 80); P.seed[i] = Math.random() * 6.28;
      }
      this.duration = 1.1 + 0.6 + 1.8;
      this.out = this.ctx.createImageData(w, h);
    }
    render(t) {
      const { w, h, step, p: P } = this; const buf = this.out.data; buf.fill(0);
      for (let i = 0; i < P.n; i++) {
        const lt = t - P.delay[i]; let x = P.x[i], y = P.y[i], a = 255, s = step;
        if (lt > 0) {
          const k = lt / P.life[i]; if (k >= 1) continue;
          const e = lt * lt * 0.9 + lt * 0.4; // accelerate like ash caught in wind
          x += P.vx[i] * e + Math.sin(lt * 4 + P.seed[i]) * 6;
          y += P.vy[i] * e + Math.cos(lt * 3 + P.seed[i]) * 4;
          a = 255 * (1 - k) * (1 - k); s = k > 0.35 ? 1 : step;
        }
        x |= 0; y |= 0;
        for (let yy = 0; yy < s; yy++) { const py = y + yy; if (py < 0 || py >= h) continue;
          for (let xx = 0; xx < s; xx++) { const px = x + xx; if (px < 0 || px >= w) continue;
            const o = (py * w + px) * 4; buf[o] = P.c[i * 3]; buf[o + 1] = P.c[i * 3 + 1]; buf[o + 2] = P.c[i * 3 + 2]; buf[o + 3] = a; } }
      }
      this.ctx.putImageData(this.out, 0, 0);
    }
    /* source already drawn on the canvas → dissolve it */
    play() {
      cancelAnimationFrame(this.raf);
      if (reduced) { this.ctx.clearRect(0, 0, this.w, this.h); return Promise.resolve(); }
      this.capture(); const start = performance.now();
      return new Promise(res => {
        const tick = now => {
          const t = (now - start) / 1000; this.render(t);
          if (t < this.duration) this.raf = requestAnimationFrame(tick);
          else { this.ctx.clearRect(0, 0, this.w, this.h); res(); }
        };
        this.raf = requestAnimationFrame(tick);
      });
    }
  }

  /* ---------- Currency menu + prices ---------- */
  function initCurrency() {
    const C = window.GlazeCurrency; if (!C) return;
    const wrap = document.querySelector('[data-currency]');
    if (wrap) {
      const btn = wrap.querySelector('.currency-btn'), menu = wrap.querySelector('.currency-menu');
      const names = new Intl.DisplayNames(['en'], { type: 'currency' });
      menu.innerHTML = '<div class="note">Prices are detected from your location. Pick another currency anytime.</div>' +
        C.SUPPORTED.map(c => `<button role="option" data-cur="${c}"><span>${names.of(c)}</span><span>${c}</span></button>`).join('');
      const toggle = open => { wrap.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); };
      btn.addEventListener('click', e => { e.stopPropagation(); toggle(!wrap.classList.contains('open')); });
      document.addEventListener('click', e => { if (!wrap.contains(e.target)) toggle(false); });
      menu.addEventListener('click', e => { const b = e.target.closest('[data-cur]'); if (b) { C.set(b.dataset.cur); toggle(false); } });
      document.querySelectorAll('[data-open-currency]').forEach(b => b.addEventListener('click', e => {
        e.stopPropagation(); window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => toggle(true), 500); }));
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

  function reveal() {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  /* ---------- Logo: turn the white-on-black logo into a clean transparent one ---------- */
  function cleanLogo(img) {
    const run = () => {
      try {
        const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
        const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0, 0, c.width, c.height), p = d.data;
        for (let i = 0; i < p.length; i += 4) {
          const l = (p[i] + p[i + 1] + p[i + 2]) / 3;
          p[i + 3] = Math.max(0, Math.min(255, (l - 70) * 255 / 120)); p[i] = p[i + 1] = p[i + 2] = 255;
        }
        ctx.putImageData(d, 0, 0); img.src = c.toDataURL(); img.classList.add('clean');
      } catch (e) {}
    };
    if (img.complete && img.naturalWidth) run(); else img.addEventListener('load', run, { once: true });
  }
  document.querySelectorAll('img[data-logo]').forEach(cleanLogo);

  document.querySelectorAll('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));
  document.querySelectorAll('[data-support]').forEach(a => (a.href = 'mailto:' + window.GLAZE.supportEmail));

  window.GlazeFX = { Dissolver, tilt, toast, reveal, reduced, initCurrency };
})();
