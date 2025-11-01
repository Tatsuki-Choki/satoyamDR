"use client"

import { useEffect, useState } from "react"
import { Calendar, MapPin, Users, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { apiClient } from "@/lib/api"

interface EventData {
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
  is_registered?: boolean
}

interface EventListProps {
  onEventClick?: (eventId: string) => void
  isAuthenticated?: boolean
}

export function EventList({ onEventClick, isAuthenticated = true }: EventListProps) {
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [isAuthenticated])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      // 認証状態に応じてAPIを使い分け
      const data = isAuthenticated 
        ? await apiClient.getEvents(true)
        : await apiClient.getPublicEvents()
      setEvents(data)
    } catch (error) {
      console.error("イベント取得エラー:", error)
      // 認証エラーの場合はパブリックAPIにフォールバック
      try {
        const publicData = await apiClient.getPublicEvents()
        setEvents(publicData)
      } catch (publicError) {
        console.error("パブリックイベント取得エラー:", publicError)
        toast.error("イベント情報の取得に失敗しました")
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reception":
      case "受付中":
        return <Badge className="bg-green-500 text-white">受付中</Badge>
      case "preparing":
      case "準備中":
        return <Badge className="bg-yellow-500 text-white">準備中</Badge>
      case "closed":
      case "終了":
        return <Badge className="bg-gray-500 text-white">終了</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getCapacityColor = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100
    if (percentage >= 90) return "text-red-500"
    if (percentage >= 70) return "text-yellow-500"
    return "text-green-500"
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "rgb(0, 8, 148)" }}></div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <Card className="border-asics-blue-100">
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">現在開催予定のイベントはありません</p>
          <p className="text-sm text-gray-400 mt-2">新しいイベントが追加されるまでお待ちください</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card 
          key={event.id} 
          className="border-asics-blue-100 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onEventClick?.(event.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg font-heading" style={{ color: "rgb(0, 8, 148)" }}>
                  {event.title}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {format(new Date(event.event_date), "yyyy年MM月dd日(E)", { locale: ja })}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {getStatusBadge(event.status)}
                {event.is_registered && (
                  <Badge variant="outline" className="border-green-500 text-green-600">
                    参加登録済
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {event.description && (
              <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{event.start_time} - {event.end_time}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{event.location}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className={getCapacityColor(event.current_participants, event.capacity)}>
                  {event.current_participants}/{event.capacity}名
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span>{event.fee > 0 ? `¥${event.fee.toLocaleString()}` : "無料"}</span>
              </div>
            </div>

            {event.capacity > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min((event.current_participants / event.capacity) * 100, 100)}%`,
                    backgroundColor: event.current_participants >= event.capacity ? "rgb(239, 68, 68)" : undefined
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}