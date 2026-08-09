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
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.fontkit = false;
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
    ];
  },
};
module.exports = nextConfig;
