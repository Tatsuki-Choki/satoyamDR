import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "里山ドッグランコミュニティアプリ",
  description: "里山ドッグランのコミュニティアプリ",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className="font-body">{children}</body>
    </html>
  )
}
