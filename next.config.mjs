/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  swcMinify: false,
  experimental: {
    forceSwcTransforms: false
  }
};

export default nextConfig;
