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
  assetPrefix: '/graduate-tracking',
  output: 'standalone',

  async redirects() {
    return [
      {
        source: '/',
        destination: '/graduate-tracking',
        permanent: false,
        basePath: false,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
