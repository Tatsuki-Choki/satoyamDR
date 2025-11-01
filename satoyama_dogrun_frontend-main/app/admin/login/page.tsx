"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLogin() {
  const router = useRouter()

  useEffect(() => {
    // 認証なしで直接管理画面に遷移
    router.push("/admin")
  }, [])

  return null
}