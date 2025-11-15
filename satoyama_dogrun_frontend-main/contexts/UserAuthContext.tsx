"use client"

/**
 * User Authentication Context (Supabase Auth)
 *
 * 一般ユーザー向けの認証コンテキスト
 * Supabase Authを使用
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User, Session } from "@supabase/supabase-js"
import { supabase, getCurrentUser, getCurrentSession, signOut as supabaseSignOut } from "@/lib/supabase/client"

interface UserAuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, metadata?: { name?: string }) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: { name?: string; avatar_url?: string; bio?: string }) => Promise<{ error: Error | null }>
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 初期化時にセッションを復元
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentSession = await getCurrentSession()
        const currentUser = await getCurrentUser()

        setSession(currentSession)
        setUser(currentUser)
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event)
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  /**
   * サインアップ
   */
  const signUp = async (
    email: string,
    password: string,
    metadata?: { name?: string }
  ): Promise<{ error: Error | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      if (error) throw error

      // usersテーブルにレコードを作成（トリガーで自動作成される場合はこの処理は不要）
      if (data.user && metadata?.name) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: metadata.name,
          })

        if (profileError) {
          console.error("Error creating user profile:", profileError)
        }
      }

      return { error: null }
    } catch (error) {
      console.error("Sign up error:", error)
      return { error: error as Error }
    }
  }

  /**
   * サインイン
   */
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error("Sign in error:", error)
      return { error: error as Error }
    }
  }

  /**
   * サインアウト
   */
  const signOut = async (): Promise<void> => {
    try {
      await supabaseSignOut()
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  /**
   * プロフィール更新
   */
  const updateProfile = async (
    updates: { name?: string; avatar_url?: string; bio?: string }
  ): Promise<{ error: Error | null }> => {
    try {
      if (!user) {
        throw new Error("No user logged in")
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error("Update profile error:", error)
      return { error: error as Error }
    }
  }

  return (
    <UserAuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signUp,
        signIn,
        signOut,
        updateProfile
      }}
    >
      {children}
    </UserAuthContext.Provider>
  )
}

export function useUserAuth() {
  const context = useContext(UserAuthContext)
  if (context === undefined) {
    throw new Error("useUserAuth must be used within a UserAuthProvider")
  }
  return context
}
