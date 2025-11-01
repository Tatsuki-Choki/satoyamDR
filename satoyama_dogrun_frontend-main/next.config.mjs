/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // デプロイ最適化のために有効化
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
