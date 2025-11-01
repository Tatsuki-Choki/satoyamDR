"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dog, LogOut, Users, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { isVaccineUpToDate } from "@/lib/utils"
import { UserStatus } from "@/lib/constants"
import type { DogProfile, OwnerProfile } from "@/lib/types"
import { apiClient } from "@/lib/api"

interface ProfileSectionProps {
  userStatus: UserStatus
  loggedInUserDogs: DogProfile[]
  setLoggedInUserDogs: (dogs: DogProfile[]) => void
  setShowAddDogModal: (show: boolean) => void
  handleEditDog: (dogId: number) => void
  handleLogout: () => void
  ownerProfile: OwnerProfile
  setOwnerProfile: (profile: OwnerProfile) => void
  setShowEditOwnerModal: (show: boolean) => void
}

export function ProfileSection({
  userStatus,
  loggedInUserDogs,
  setLoggedInUserDogs,
  setShowAddDogModal,
  handleEditDog,
  handleLogout,
  ownerProfile,
  setOwnerProfile,
  setShowEditOwnerModal,
}: ProfileSectionProps) {
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)

  useEffect(() => {
    if (userStatus === UserStatus.LoggedIn) {
      fetchProfileData()
    }
  }, [userStatus])

  const fetchProfileData = async () => {
    setLoading(true)
    try {
      const profile = await apiClient.getUserProfile()
      setProfileData(profile)
      
      // 犬情報を更新
      if (profile.dogs) {
        const dogs = profile.dogs.map((dog: any) => ({
          id: dog.id,
          name: dog.name,
          breed: dog.breed || '不明',
          weight: dog.weight || '',
          personality: dog.personality ? dog.personality.split(',') : [],
          lastVaccinationDate: dog.lastVaccinationDate || new Date().toISOString(),
          avatar: '',
        }))
        setLoggedInUserDogs(dogs)
      }
      
      // オーナー情報を更新
      if (profile) {
        setOwnerProfile({
          ...ownerProfile,
          fullName: `${profile.last_name || ''} ${profile.first_name || ''}`.trim() || 'ユーザー',
          email: profile.email,
          phoneNumber: profile.phone_number || '',
          address: profile.address || '',
        })
      }
    } catch (error) {
      console.error("プロフィール取得エラー:", error)
      toast.error("プロフィール情報の取得に失敗しました")
    } finally {
      setLoading(false)
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
              マイページはログイン後に利用可能です
            </h2>
            <p className="text-sm text-gray-600 font-caption">
              プロフィールや利用統計は、ログインしてからご利用いただけます。
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* User Profile */}
      <Card className="border-asics-blue-100">
        <CardHeader>
          <CardTitle className="text-base flex items-center font-heading" style={{ color: "rgb(0, 8, 148)" }}>
            <Users className="h-5 w-5 mr-2" />
            飼い主プロフィール
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback
                className="text-lg font-heading"
                style={{ backgroundColor: "rgba(0, 8, 148, 0.1)", color: "rgb(0, 8, 148)" }}
              >
                田
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between w-full">
                <div>
                  <h2 className="font-heading" style={{ color: "rgb(0, 8, 148)" }}>
                    {ownerProfile.fullName}
                  </h2>
                  <p className="text-sm text-gray-500 font-caption">里山ドッグラン会員</p>
                  <p className="text-xs text-gray-400 font-caption">会員歴: {ownerProfile.memberSince}</p>
                </div>
                {/* Add Edit button for owner profile */}
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-asics-blue-200"
                  style={{ color: "rgb(0, 8, 148)" }}
                  onClick={() => setShowEditOwnerModal(true)}
                >
                  編集
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dog Profile */}
      <Card className="border-asics-blue-100">
        <CardHeader>
          <CardTitle className="text-base flex items-center font-heading" style={{ color: "rgb(0, 8, 148)" }}>
            <Dog className="h-5 w-5 mr-2" />
            愛犬プロフィール
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loggedInUserDogs.map((dog: DogProfile) => (
            <div key={dog.id} className="flex items-center space-x-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(255, 235, 0, 0.2)" }}
              >
                <Dog className="h-8 w-8" style={{ color: "rgb(0, 8, 148)" }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <h3 className="font-heading" style={{ color: "rgb(0, 8, 148)" }}>
                      {dog.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-caption">
                      {dog.breed} • {dog.weight}
                      {dog.lastVaccinationDate && isVaccineUpToDate(dog.lastVaccinationDate) && (
                        <span className="ml-2 text-green-600"> (ワクチン済)</span>
                      )}
                    </p>
                    <div className="flex space-x-1 mt-1">
                      {dog.personality &&
                        dog.personality.map((trait, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs border-asics-blue-200 font-caption"
                            style={{ color: "rgb(0, 8, 148)" }}
                          >
                            {trait}
                          </Badge>
                        ))}
                    </div>
                  </div>
                  {/* Add the Edit button here */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-asics-blue-200"
                    style={{ color: "rgb(0, 8, 148)" }}
                    onClick={() => handleEditDog(dog.id)}
                  >
                    編集
                  </Button>
                </div>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-transparent border-asics-blue-200"
            style={{ color: "rgb(0, 8, 148)" }}
            onClick={() => setShowAddDogModal(true)} // Open the new dog registration modal
          >
            新しい愛犬を登録する
          </Button>
          <p className="text-xs text-gray-500 font-caption mt-2">
            ワクチン接種日から1年が経過すると自動で登録が解除されます。
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="border-asics-blue-100">
        <CardHeader>
          <CardTitle className="text-base font-heading" style={{ color: "rgb(0, 8, 148)" }}>
            利用統計
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-caption">今月の利用回数</span>
            <span className="font-heading" style={{ color: "rgb(0, 8, 148)" }}>
              12回
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-caption">投稿数</span>
            <span className="font-heading" style={{ color: "rgb(0, 8, 148)" }}>
              24件
            </span>
          </div>
        </CardContent>
      </Card>
      <Button onClick={handleLogout} className="w-full text-white" style={{ backgroundColor: "rgb(0, 8, 148)" }}>
        <LogOut className="h-4 w-4 mr-2" />
        ログアウト
      </Button>
    </div>
  )
}
