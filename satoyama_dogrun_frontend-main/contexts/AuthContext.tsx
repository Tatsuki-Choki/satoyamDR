"use client"

/**
 * Admin Authentication Context (Supabase Auth + Custom API)
 *
 * 管理者向けの認証コンテキスト
 * Supabase Authを使用しつつ、管理者権限の検証はカスタムAPIで実施
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User, Session } from "@supabase/supabase-js"
import { supabase, getCurrentUser, getCurrentSession, signOut as supabaseSignOut } from "@/lib/supabase/client"

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  is_active: boolean
}

interface AuthContextType {
  isAuthenticated: boolean
  user: AdminUser | null
  session: Session | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 初期化時にセッションを復元し、管理者権限を確認
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentSession = await getCurrentSession()
        const currentUser = await getCurrentUser()

        if (currentSession && currentUser) {
          // 管理者かどうかを確認
          const adminUser = await verifyAdminUser(currentUser.id)
          if (adminUser) {
            // Supabaseのアクセストークンをローカルストレージに保存
            localStorage.setItem('admin_access_token', currentSession.access_token)
            setSession(currentSession)
            setUser(adminUser)
            setIsAuthenticated(true)
          }
        }
      } catch (error) {
        console.error("Error initializing admin auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Admin auth state changed:", event)

        if (currentSession?.user) {
          const adminUser = await verifyAdminUser(currentSession.user.id)
          if (adminUser) {
            // Supabaseのアクセストークンをローカルストレージに保存
            localStorage.setItem('admin_access_token', currentSession.access_token)
            setSession(currentSession)
            setUser(adminUser)
            setIsAuthenticated(true)
          } else {
            // 管理者でない場合はログアウト
            localStorage.removeItem('admin_access_token')
            setSession(null)
            setUser(null)
            setIsAuthenticated(false)
          }
        } else {
          localStorage.removeItem('admin_access_token')
          setSession(null)
          setUser(null)
          setIsAuthenticated(false)
        }

        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  /**
   * 管理者ユーザーかどうかを確認
   */
  const verifyAdminUser = async (userId: string): Promise<AdminUser | null> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, name, role, is_active')
        .eq('id', userId)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error("Error verifying admin user:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in verifyAdminUser:", error)
      return null
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Supabase Authでサインイン
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user && data.session) {
        // 管理者権限を確認
        const adminUser = await verifyAdminUser(data.user.id)

        if (!adminUser) {
          // 管理者でない場合はサインアウト
          await supabaseSignOut()
          console.error("User is not an admin")
          return false
        }

        // Supabaseのアクセストークンをローカルストレージに保存（APIリクエスト用）
        localStorage.setItem('admin_access_token', data.session.access_token)

        setSession(data.session)
        setUser(adminUser)
        setIsAuthenticated(true)
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      setIsAuthenticated(false)
      setUser(null)
      setSession(null)
      return false
    }
  }

  const logout = async () => {
    try {
      await supabaseSignOut()
      // ローカルストレージからトークンを削除
      localStorage.removeItem('admin_access_token')
      setIsAuthenticated(false)
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, session, isLoading, login, logout }}>
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
