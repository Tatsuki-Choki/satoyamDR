"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { apiClient } from "@/lib/api"

interface AuthContextType {
  isAuthenticated: boolean
  user: any | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any | null>(null)

  // 初期化時にlocalStorageから認証状態を復元
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_access_token')
    if (adminToken) {
      setIsAuthenticated(true)
      setUser({ email: "admin@satoyama-dogrun.com", role: "admin" })
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // apiClient.adminLoginを使用してAPIを呼び出し、トークンを保存
      const response = await apiClient.adminLogin({ email, password })
      
      if (response.access_token) {
        setIsAuthenticated(true)
        setUser({ email, role: "admin" })
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      setIsAuthenticated(false)
      setUser(null)
      return false
    }
  }

  const logout = () => {
    // localStorageからトークンを削除
    localStorage.removeItem('admin_access_token')
    setIsAuthenticated(false)
    setUser(null)
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
