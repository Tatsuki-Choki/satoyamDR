"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Eye, EyeOff } from "lucide-react"

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("admin@satoyama-dogrun.com")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // AuthContextのlogin関数を使用
      const success = await login(email, password)
      
      if (success) {
        // ログイン成功
        console.log("Login successful")
        
        // 少し待ってから利用申請管理ページにリダイレクト（チャンクロードエラーを防ぐ）
        setTimeout(() => {
          try {
            router.push("/admin/applications")
          } catch (navigationError) {
            console.error("Navigation error:", navigationError)
            // フォールバック: ページをリロード
            window.location.href = "/admin/applications"
          }
        }, 100)
      } else {
        setError("メールアドレスまたはパスワードが正しくありません")
      }
    } catch (err) {
      setError("ログイン処理中にエラーが発生しました")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-blue-600">
            管理者ログイン
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            里山ドッグラン管理システム
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  パスワード
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="パスワードを入力"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "ログイン中..." : "ログイン"}
              </Button>

              {/* Back to User Side Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-md transition duration-200"
                disabled={isLoading}
              >
                ユーザー側に戻る
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                デモ用認証情報
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>メール: admin@satoyama-dogrun.com</p>
                <p>パスワード: admin2025!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Disclaimer */}
        <p className="text-xs text-gray-500 text-center">
          不正アクセスは記録され、法的措置の対象となります
        </p>
      </div>
    </div>
  )
}
