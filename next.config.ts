import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
              "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data:",
              "connect-src 'self' https: http:",
              "img-src 'self' data: blob: https: http:",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      // Development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
      },
      // Production - يجب استخدام https فقط
      {
        protocol: 'https',
        hostname: 'api.fooz-gaming.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default nextConfig;
