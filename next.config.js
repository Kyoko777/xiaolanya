/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : undefined,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
