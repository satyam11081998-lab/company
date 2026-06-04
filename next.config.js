const nextConfig = {
  output: 'standalone',
  images: { unoptimized: true },
  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2,
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
    ];
  },
};
module.exports = nextConfig;
