"use client"

import { useEffect, useState } from "react"
import { Camera, QrCode, ScanLine, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dog } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { UserStatus } from "@/lib/constants"
import type { DogProfile } from "@/lib/types"
import { EntryManagement } from "@/components/entry-management"
import { apiClient } from "@/lib/api"

interface EntrySectionProps {
  userStatus: UserStatus
  entryStep: string
  setEntryStep: (step: string) => void
  loggedInUserDogs: DogProfile[]
  selectedDogsForEntry: number[]
  setSelectedDogsForEntry: (dogs: number[]) => void
  isInDogRun: boolean
  setIsInDogRun: (inRun: boolean) => void
}

export function EntrySection({
  userStatus,
  entryStep,
  setEntryStep,
  loggedInUserDogs,
  selectedDogsForEntry,
  setSelectedDogsForEntry,
  isInDogRun,
  setIsInDogRun,
}: EntrySectionProps) {
  const [userDogs, setUserDogs] = useState<any[]>([])

  useEffect(() => {
    if (userStatus === UserStatus.LoggedIn) {
      fetchUserDogs()
    }
  }, [userStatus])

  const fetchUserDogs = async () => {
    try {
      const dogs = await apiClient.getUserDogs()
      setUserDogs(dogs)
    } catch (error) {
      console.error("犬情報取得エラー:", error)
    }
  }

  if (userStatus !== UserStatus.LoggedIn) {
    return (
      <div className="space-y-6 text-center">
        <Card
          className="border-asics-blue-200"
          style={{ backgroundColor: "rgba(0, 8, 148, 0.05)", borderColor: "rgba(0, 8, 148, 0.2)" }}
        >
          <CardContent className="p-6">
            <h2 className="text-xl font-heading mb-4" style={{ color: "rgb(0, 8, 148)" }}>
              入場機能はログイン後に利用可能です
            </h2>
            <p className="text-sm text-gray-600 font-caption">
              QRコードスキャンによる入場は、ログインしてからご利用いただけます。
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 新しい入場管理コンポーネントを使用 */}
      <EntryManagement userDogs={userDogs} />
    </div>
  )
}