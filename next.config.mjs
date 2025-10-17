/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Remove basePath and assetPrefix for custom domain
  // basePath: '/HabbitTracker',
  // assetPrefix: '/HabbitTracker/',
};

export default nextConfig;
