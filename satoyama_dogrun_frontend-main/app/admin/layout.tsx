"use client"

import { AuthProvider } from "@/contexts/AuthContext"
import AdminNavigation from "./navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 認証チェックを無効化し、常に管理画面を表示
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminNavigation />
        <div className="md:ml-64 p-4 md:p-6">
          {children}
        </div>
      </div>
    </AuthProvider>
  )
}