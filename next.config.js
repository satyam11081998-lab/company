const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@react-pdf/renderer'],
  images: { unoptimized: true },
  eslint: {
    ignoreDuringBuilds: true,
  },
  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2,
  },
  webpack: (config, { isServer }) => {
    // pdf.js (react-pdf, the viewer) optionally reaches for `canvas`, which is a
    // native Node module. Stubbing it is the documented workaround.
    config.resolve.alias.canvas = false;

    // fontkit was stubbed alongside canvas, but it is NOT a pdf.js dependency:
    // pdfjs-dist and react-pdf contain zero references to it. The only things
    // that import fontkit are @react-pdf/font and @react-pdf/pdfkit, i.e. the
    // PDF *generator*, which needs it to parse an embedded TTF.
    //
    // With the stub in place, `import * as fontkit from 'fontkit'` resolves to
    // an empty module and font embedding dies with "create is not a function".
    // That went unnoticed because the Cheat Sheet PDF only uses the built-in
    // Helvetica and never calls fontkit.create; the certificate is the first
    // document to register a real font.
    //
    // Keep the stub on the server (nothing generates PDFs there, and this
    // preserves the previous server-compile behaviour), but the browser must
    // get the real thing. If PDF generation ever moves server-side, delete this
    // branch rather than rediscovering the same error.
    if (isServer) {
      config.resolve.alias.fontkit = false;
    }

    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self';" },
          { key: "Access-Control-Allow-Origin", value: "https://mece.in" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        // Crawlable image URL for deck slides. The API route
        // (app/api/decks/[slug]/page/[n]) lives under /api, which robots.txt
        // disallows — so Google Images could never index a deck slide. Serving
        // the same bytes at /deck-img/<slug>/<n>.webp fixes that; the .webp
        // suffix also makes the middleware matcher skip it (no auth round-trip
        // per image), and the API route still enforces the paywall (403 past
        // the free limit).
        source: '/deck-img/:slug/:n',
        destination: '/api/decks/:slug/page/:n',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/learn',
        destination: '/learn/casebook',
        permanent: true,
      },
      {
        // "Explore MECE" is the pre-login dashboard itself, not a separate
        // marketing page. A 308 here rather than deleting the URL outright:
        // it was briefly in the sitemap and linked from the homepage nav, so
        // anything that already picked it up lands somewhere real instead of
        // a 404. redirects() runs before routing, so this wins over any
        // leftover app/explore-mece/page.tsx.
        source: '/explore-mece',
        destination: '/dashboard',
        permanent: true,
      },
      {
        // The MECE framework guide was briefly built at the site root before
        // moving under /learn, where the rest of the teaching material lives.
        // Cheap insurance: anything that picked up the root URL lands on the
        // real page instead of a 404, and the 308 passes signal along.
        source: '/mece-framework',
        destination: '/learn/mece-framework',
        permanent: true,
      },
    ];
  },
};
module.exports = nextConfig;
