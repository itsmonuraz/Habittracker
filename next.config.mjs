/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Disabled for dynamic routing - re-enable when connecting backend with proper SSG
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
