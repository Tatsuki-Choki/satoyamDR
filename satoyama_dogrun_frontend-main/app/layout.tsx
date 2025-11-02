import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "里山ドッグランコミュニティアプリ",
  description: "里山ドッグランのコミュニティアプリ",
  generator: 'v0.dev',
  // パフォーマンス最適化
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#000894",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <head>
        {/* プリコネクトでAPIサーバーへの接続を最適化 */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"} />
        {/* DNSプリフェッチ */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"} />
      </head>
      <body className="font-body">{children}</body>
    </html>
  )
}
