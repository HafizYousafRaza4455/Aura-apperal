import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  experimental: {
    // optimizePackageImports for luxury UI packages
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
