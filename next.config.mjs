import createNextBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = createNextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
};

export default withBundleAnalyzer(nextConfig); 