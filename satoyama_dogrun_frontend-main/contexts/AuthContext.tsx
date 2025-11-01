"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  user: any | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // 認証を常に有効にする
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [user, setUser] = useState<any | null>({ email: "admin@satoyama-dogrun.com", role: "admin" })

  // 初期化時にダミーの認証状態を設定
  useEffect(() => {
    setIsAuthenticated(true)
    setUser({ email: "admin@satoyama-dogrun.com", role: "admin" })
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // 常に認証成功とする
    setIsAuthenticated(true)
    setUser({ email: "admin@satoyama-dogrun.com", role: "admin" })
    return true
  }

  const logout = () => {
    // ログアウトしても認証状態を維持
    setIsAuthenticated(true)
    setUser({ email: "admin@satoyama-dogrun.com", role: "admin" })
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
