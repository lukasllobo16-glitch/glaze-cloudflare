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
      tagline: 'Every painting, cut for your phone.',
      device: 'phone',
      features: [
        'The full phone collection',
        'Native vertical crops for iPhone & Android',
        'Lock screen & home screen ready',
        'Instant download after payment'
      ],
      cover: ['assets/img/p1.jpg', 'assets/img/p3.jpg', 'assets/img/p6.jpg']
    },
    desktop: {
      name: 'Desktop Pack',
      tagline: 'Gallery light for your laptop and monitor.',
      device: 'desktop',
      features: [
        'The full desktop collection',
        '4K files for Mac & Windows',
        'Laptop, monitor & tablet ready',
        'Instant download after payment'
      ],
      cover: ['assets/img/d2.jpg', 'assets/img/d6.jpg', 'assets/img/d3.jpg']
    },
    complete: {
      name: 'Complete Collection',
      tagline: 'Phone + Desktop. Every screen you own.',
      device: 'both',
      featured: true,
      features: [
        'Everything in the Phone Pack',
        'Everything in the Desktop Pack',
        'One look across every screen',
        'Instant download after payment'
      ],
      cover: ['assets/img/d4.jpg', 'assets/img/p2.jpg', 'assets/img/d7.jpg']
    }
  },

  wallpapers: {
    desktop: [
      { src: 'assets/img/d1.jpg', title: 'Off the Clock' },
      { src: 'assets/img/d2.jpg', title: 'Starry Datejust' },
      { src: 'assets/img/d3.jpg', title: 'Midnight Polo' },
      { src: 'assets/img/d4.jpg', title: 'The World Is Yours' },
      { src: 'assets/img/d5.jpg', title: 'Prancing' },
      { src: 'assets/img/d6.jpg', title: 'Alpine Wall' },
      { src: 'assets/img/d7.jpg', title: 'Cigar & Sea' }
    ],
    phone: [
      { src: 'assets/img/p1.jpg', title: 'The World Is Yours' },
      { src: 'assets/img/p2.jpg', title: 'Money Talks' },
      { src: 'assets/img/p3.jpg', title: 'Green on Green' },
      { src: 'assets/img/p4.jpg', title: 'Silence the Crowd' },
      { src: 'assets/img/p5.jpg', title: 'No Risk, No Story' },
      { src: 'assets/img/p6.jpg', title: 'The Resting King' }
    ]
  }
};
