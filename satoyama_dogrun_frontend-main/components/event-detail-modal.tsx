"use client"

import { useEffect, useState } from "react"
import { X, Calendar, MapPin, Users, Clock, DollarSign, Dog, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { apiClient } from "@/lib/api"

interface EventDetailModalProps {
  eventId: string | null
  isOpen: boolean
  onClose: () => void
  onRegistrationChange?: () => void
}

interface EventDetail {
  id: string
  title: string
  description?: string
  event_date: string
  start_time: string
  end_time: string
  location: string
  capacity: number
  fee: number
  status: string
  current_participants: number
  is_registered: boolean
  my_dogs_registered: string[]
}

interface Participant {
  id: string
  user_name: string
  dog_name?: string
}

export function EventDetailModal({ eventId, isOpen, onClose, onRegistrationChange }: EventDetailModalProps) {
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [userDogs, setUserDogs] = useState<any[]>([])
  const [selectedDogs, setSelectedDogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)

  useEffect(() => {
    if (eventId && isOpen) {
      fetchEventDetail()
      fetchUserDogs()
    }
  }, [eventId, isOpen])

  const fetchEventDetail = async () => {
    if (!eventId) return
    
    setLoading(true)
    try {
      const data = await apiClient.getEventDetail(eventId)
      setEvent(data)
      setSelectedDogs(data.my_dogs_registered || [])
      
      // 参加者一覧も取得
      const participantsData = await apiClient.getEventParticipants(eventId)
      setParticipants(participantsData)
    } catch (error) {
      console.error("イベント詳細取得エラー:", error)
      toast.error("イベント情報の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserDogs = async () => {
    try {
      const dogs = await apiClient.getUserDogs()
      setUserDogs(dogs)
    } catch (error) {
      console.error("犬情報取得エラー:", error)
    }
  }

  const handleRegistration = async () => {
    if (!event) return
    
    setSubmitting(true)
    try {
      if (event.is_registered) {
        // キャンセル
        await apiClient.cancelEventRegistration(event.id)
        toast.success("参加をキャンセルしました")
      } else {
        // 登録
        await apiClient.registerForEvent(event.id, selectedDogs)
        toast.success("イベントに参加登録しました")
      }
      
      // 詳細を再取得
      await fetchEventDetail()
      onRegistrationChange?.()
    } catch (error: any) {
      console.error("登録エラー:", error)
      toast.error(error.response?.data?.detail || "処理に失敗しました")
    } finally {
      setSubmitting(false)
    }
  }

  const toggleDogSelection = (dogId: string) => {
    setSelectedDogs(prev => 
      prev.includes(dogId) 
        ? prev.filter(id => id !== dogId)
        : [...prev, dogId]
    )
  }

  if (!event || loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "rgb(0, 8, 148)" }}></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const isFull = event.capacity > 0 && event.current_participants >= event.capacity
  const canRegister = !isFull && event.status === "reception" || event.status === "受付中"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading" style={{ color: "rgb(0, 8, 148)" }}>
            {event.title}
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* ステータスバッジ */}
          <div className="flex items-center space-x-2">
            {event.status === "reception" || event.status === "受付中" ? (
              <Badge className="bg-green-500 text-white">受付中</Badge>
            ) : event.status === "closed" || event.status === "終了" ? (
              <Badge className="bg-gray-500 text-white">終了</Badge>
            ) : (
              <Badge className="bg-yellow-500 text-white">準備中</Badge>
            )}
            {event.is_registered && (
              <Badge variant="outline" className="border-green-500 text-green-600">
                参加登録済
              </Badge>
            )}
            {isFull && (
              <Badge className="bg-red-500 text-white">満員</Badge>
            )}
          </div>

          {/* 説明 */}
          {event.description && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* イベント詳細 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="font-medium">
                {format(new Date(event.event_date), "yyyy年MM月dd日(E)", { locale: ja })}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <span>{event.start_time} - {event.end_time}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <span>{event.location}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-gray-500" />
              <span className={isFull ? "text-red-500 font-bold" : ""}>
                参加者: {event.current_participants}/{event.capacity}名
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-gray-500" />
              <span className="font-medium">
                {event.fee > 0 ? `参加費: ¥${event.fee.toLocaleString()}` : "参加費: 無料"}
              </span>
            </div>
          </div>

          {/* 参加者プログレスバー */}
          {event.capacity > 0 && (
            <div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min((event.current_participants / event.capacity) * 100, 100)}%`,
                    backgroundColor: isFull ? "rgb(239, 68, 68)" : "rgb(59, 130, 246)"
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">
                {Math.round((event.current_participants / event.capacity) * 100)}% 埋まっています
              </p>
            </div>
          )}

          <Separator />

          {/* 犬の選択（未登録の場合のみ） */}
          {!event.is_registered && userDogs.length > 0 && canRegister && (
            <div>
              <h3 className="font-medium mb-3">参加させる犬を選択</h3>
              <div className="space-y-2">
                {userDogs.map((dog) => (
                  <div key={dog.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                    <Checkbox 
                      checked={selectedDogs.includes(dog.id)}
                      onCheckedChange={() => toggleDogSelection(dog.id)}
                    />
                    <Dog className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{dog.name}</span>
                    {dog.breed && <span className="text-xs text-gray-500">({dog.breed})</span>}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ※犬を選択しない場合は飼い主のみの参加となります
              </p>
            </div>
          )}

          {/* 登録済みの犬表示 */}
          {event.is_registered && event.my_dogs_registered.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">登録済みの犬</h3>
              <div className="space-y-1">
                {event.my_dogs_registered.map((dogId) => {
                  const dog = userDogs.find(d => d.id === dogId)
                  return dog ? (
                    <div key={dogId} className="flex items-center space-x-2 text-sm">
                      <Dog className="h-4 w-4 text-green-500" />
                      <span>{dog.name}</span>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}

          {/* 参加者一覧 */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowParticipants(!showParticipants)}
              className="text-sm"
            >
              参加者一覧 ({participants.length}名) {showParticipants ? "▲" : "▼"}
            </Button>
            
            {showParticipants && (
              <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                {participants.length === 0 ? (
                  <p className="text-sm text-gray-500">まだ参加者はいません</p>
                ) : (
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center space-x-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{participant.user_name}</span>
                        {participant.dog_name && (
                          <>
                            <Dog className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">({participant.dog_name})</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* アクションボタン */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              閉じる
            </Button>
            {canRegister && (
              <Button
                onClick={handleRegistration}
                disabled={submitting}
                className="text-white"
                style={{ 
                  backgroundColor: event.is_registered ? "rgb(239, 68, 68)" : "rgb(0, 8, 148)" 
                }}
              >
                {submitting ? (
                  "処理中..."
                ) : event.is_registered ? (
                  "参加をキャンセル"
                ) : (
                  "参加登録する"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}