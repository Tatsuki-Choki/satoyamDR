/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // デプロイ最適化のために有効化
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // パフォーマンス最適化設定
  images: {
    // 画像最適化を有効化（パフォーマンス向上）
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    // 外部ドメインの場合はここに追加
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
    ],
  },
  // 圧縮と最適化
  compress: true,
  // コード分割とチャンク最適化
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // パフォーマンス最適化
  poweredByHeader: false,
  reactStrictMode: true,
}

export default nextConfig
