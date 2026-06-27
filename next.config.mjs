/** @type {import('next').NextConfig} */
const nextConfig = {
  // Symulator frontend-only: eksport statyczny (bez serwera/API).
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
