import withBundleAnalyzer from '@next/bundle-analyzer'({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  experimental: {
    serverActions: true,
  },
};

export default withBundleAnalyzer(nextConfig); 