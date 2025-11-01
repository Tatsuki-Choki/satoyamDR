"use client"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // 認証チェックを無効化し、常に子コンポーネントを表示
  return <>{children}</>
}
