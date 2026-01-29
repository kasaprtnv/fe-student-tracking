import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
  },
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['10.44.1.49:8085', '10.44.1.49', 'localhost:3000'],
    },
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
