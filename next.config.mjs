/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for GitHub Pages
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
