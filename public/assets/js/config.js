/* =========================================================
   GLAZE — store configuration
   Edit prices, packs and wallpapers here. Everything on the
   site (homepage + checkout) reads from this file.
   ========================================================= */
window.GLAZE = {
  brand: 'Glaze',
  supportEmail: 'hello@yourdomain.com', // TODO: replace with your real support email

  stripe: {
    // Publishable key from Stripe → Developers → API keys (starts with pk_live_ or pk_test_).
    // It is safe to have it in the website. NEVER put the secret key (sk_...) here.
    publishableKey: 'pk_live_51RSydFKnSSh3AtrIiJPYbVxFJKnr0onxrGXeYSzxdpfwbYEoTddbFJl3PI25dIPrj3d6DS1qll0gFx3ZVya8ImnZ00nYgYWhqH',
    // Our server function that creates the embedded checkout (functions/api/checkout.js)
    endpoint: '/api/checkout',
    // Backup: used only if the embedded checkout can't load.
    paymentLinks: {
      phone: 'https://buy.stripe.com/fZu5kEb2xcBc4WL544afS01',
      desktop: 'https://buy.stripe.com/00w9AU8Up0Su88X400afS02',
      complete: 'https://buy.stripe.com/9B69AU1rXbx860PbssafS00'
    }
  },

  // Base currency is EUR. Fixed, hand-picked prices per currency
  // (rounded the way each market expects). Unknown countries fall back to USD.
  // NOTE: the server (functions/api/checkout.js) has its own copy of this
  // table — the browser never decides the price that gets charged.
  prices: {
    phone:    { EUR: 9.99,  USD: 11.99, GBP: 8.99,  CHF: 9.90,  CAD: 15.99, AUD: 17.99, BRL: 59.90,  MXN: 209, JPY: 1800, SEK: 109, NOK: 119, DKK: 75,  PLN: 42.99, INR: 999,  ZAR: 199, AED: 42.99 },
    desktop:  { EUR: 15.99, USD: 18.99, GBP: 13.99, CHF: 14.90, CAD: 24.99, AUD: 27.99, BRL: 94.90,  MXN: 339, JPY: 2800, SEK: 179, NOK: 189, DKK: 119, PLN: 67.99, INR: 1599, ZAR: 319, AED: 67.99 },
    complete: { EUR: 20.99, USD: 24.99, GBP: 17.99, CHF: 19.90, CAD: 32.99, AUD: 36.99, BRL: 124.90, MXN: 449, JPY: 3700, SEK: 229, NOK: 249, DKK: 159, PLN: 88.99, INR: 2099, ZAR: 419, AED: 89.99 }
  },

  packs: {
    phone: {
      name: 'Phone Pack',
      tagline: 'Every painting, made for your phone.',
      device: 'phone',
      features: [
        'The whole phone collection',
        'Recomposed for iPhone and Android',
        'Looks great on lock and home screen',
        'Download right after you pay'
      ],
      cover: ['assets/img/w/p1-s.webp', 'assets/img/w/p3-s.webp', 'assets/img/w/p6-s.webp']
    },
    desktop: {
      name: 'Desktop Pack',
      tagline: 'Turn your laptop into a gallery wall.',
      device: 'desktop',
      features: [
        'The whole desktop collection',
        '4K files for Mac and Windows',
        'Fits laptops, monitors and tablets',
        'Download right after you pay'
      ],
      cover: ['assets/img/w/d2-s.webp', 'assets/img/w/d6-s.webp', 'assets/img/w/d3-s.webp']
    },
    complete: {
      name: 'Complete Collection',
      tagline: 'Phone and desktop. Every screen covered.',
      device: 'both',
      featured: true,
      features: [
        'Everything in the Phone Pack',
        'Everything in the Desktop Pack',
        'The same look on every screen you own',
        'Download right after you pay'
      ],
      cover: ['assets/img/w/d4-s.webp', 'assets/img/w/p2-s.webp', 'assets/img/w/d7-s.webp']
    }
  },

  wallpapers: {
    desktop: [
      { id: 'd1', src: 'assets/img/w/d1.webp', thumb: 'assets/img/w/d1-s.webp', title: 'Off the Clock' },
      { id: 'd2', src: 'assets/img/w/d2.webp', thumb: 'assets/img/w/d2-s.webp', title: 'Starry Datejust' },
      { id: 'd3', src: 'assets/img/w/d3.webp', thumb: 'assets/img/w/d3-s.webp', title: 'Midnight Polo' },
      { id: 'd4', src: 'assets/img/w/d4.webp', thumb: 'assets/img/w/d4-s.webp', title: 'The World Is Yours' },
      { id: 'd5', src: 'assets/img/w/d5.webp', thumb: 'assets/img/w/d5-s.webp', title: 'Prancing' },
      { id: 'd6', src: 'assets/img/w/d6.webp', thumb: 'assets/img/w/d6-s.webp', title: 'Alpine Wall' },
      { id: 'd7', src: 'assets/img/w/d7.webp', thumb: 'assets/img/w/d7-s.webp', title: 'Cigar & Sea' }
    ],
    phone: [
      { id: 'p1', src: 'assets/img/w/p1.webp', thumb: 'assets/img/w/p1-s.webp', title: 'The World Is Yours' },
      { id: 'p2', src: 'assets/img/w/p2.webp', thumb: 'assets/img/w/p2-s.webp', title: 'Money Talks' },
      { id: 'p3', src: 'assets/img/w/p3.webp', thumb: 'assets/img/w/p3-s.webp', title: 'Green on Green' },
      { id: 'p4', src: 'assets/img/w/p4.webp', thumb: 'assets/img/w/p4-s.webp', title: 'Silence the Crowd' },
      { id: 'p5', src: 'assets/img/w/p5.webp', thumb: 'assets/img/w/p5-s.webp', title: 'No Risk, No Story' },
      { id: 'p6', src: 'assets/img/w/p6.webp', thumb: 'assets/img/w/p6-s.webp', title: 'The Resting King' }
    ]
  }
};
