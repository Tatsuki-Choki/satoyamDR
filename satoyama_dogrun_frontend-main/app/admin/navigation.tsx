"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, LogOut, Users, FileText, Calendar, Settings, ClipboardCheck, ArrowLeft, Clock, Menu, X, BarChart3 } from "lucide-react"

export default function AdminNavigation() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // パスが変更されたらモバイルメニューを閉じる
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // ESCキーでメニューを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      // スクロールを無効化
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const handleLogout = () => {
    logout()
    router.push("/admin")
  }

  const navigationItems = [
    { name: "利用申請管理", href: "/admin/applications", icon: ClipboardCheck },
    { name: "スポンサーデータ", href: "/admin/sponsor-dashboard", icon: BarChart3 },
    { name: "ユーザー管理", href: "/admin/users", icon: Users },
    { name: "投稿管理", href: "/admin/posts", icon: FileText },
    { name: "イベント管理", href: "/admin/events", icon: Calendar },
    { name: "営業時間管理", href: "/admin/business-hours", icon: Clock },
    { name: "設定", href: "/admin/settings", icon: Settings },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsMobileMenuOpen(false) // モバイルメニューを閉じる
  }

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* ハンバーガーメニューボタン - タブレット以下で表示 */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="asics-primary"
          size="sm"
          onClick={toggleMenu}
          className="shadow-lg w-12 h-12"
          rounded="full"
          aria-label={isMobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* サイドバーナビゲーション - アシックス里山スタジアムスタイル */}
      <nav className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-asics-satoyama-blue to-asics-satoyama-blue-800 shadow-2xl z-40 transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Logo and Title - 波形デザイン */}
        <div className="relative p-6 border-b border-asics-satoyama-blue-600 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
              <path
                d="M0,40 Q50,20 100,40 T200,40 L200,80 L0,80 Z"
                fill="currentColor"
                className="text-asics-satoyama-green"
              />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-asics-satoyama-green" />
              <h1 className="text-xl font-heading font-bold text-white">
                里山ドッグラン
              </h1>
            </div>
            <p className="text-sm text-asics-satoyama-green/70 mt-1">管理システム</p>
          </div>
        </div>

        {/* Navigation Menu - ログイン時のみ表示 */}
        {isAuthenticated && (
          <div className="p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-asics-satoyama-gold text-white shadow-lg transform scale-105"
                        : "text-white/80 hover:text-white hover:bg-asics-satoyama-blue-600 hover:shadow-md"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        )}

        {/* User Info and Logout - ログイン時のみ表示 */}
        {isAuthenticated && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-asics-satoyama-blue-600 bg-asics-satoyama-blue-900">
            <div className="space-y-3">
              <div className="text-sm text-asics-satoyama-green/70 px-2">
                {user?.email}
              </div>
              <Button
                variant="asics-secondary"
                size="sm"
                onClick={() => router.push("/")}
                className="w-full flex items-center justify-center space-x-2 bg-white/10 border-white/30 text-white hover:bg-white hover:text-asics-satoyama-blue"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>ユーザー側へ戻る</span>
              </Button>
              <Button
                variant="asics-gold"
                size="sm"
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>ログアウト</span>
              </Button>
            </div>
          </div>
        )}

        {/* ログインしていない場合のメッセージ */}
        {!isAuthenticated && (
          <div className="p-4">
            <div className="text-center text-gray-500 text-sm">
              <p>ログインしてください</p>
            </div>
          </div>
        )}
      </nav>

      {/* モバイルメニューのオーバーレイ - タブレット以下で表示 */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
