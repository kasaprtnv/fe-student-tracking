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
  basePath: '/graduate-tracking',
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
