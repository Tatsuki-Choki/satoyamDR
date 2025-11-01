"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Clock
} from "lucide-react"

// 仮のイベントデータ
const mockEvents = [
  {
    id: 1,
    title: "春のドッグランフェス",
    description: "春の訪れを祝って、愛犬と一緒に楽しい時間を過ごしましょう。各種イベントやプレゼントもあります。",
    date: "2024-04-15",
    time: "10:00-16:00",
    location: "里山ドッグラン",
    maxParticipants: 50,
    currentParticipants: 32,
    price: "無料"
  },
  {
    id: 2,
    title: "犬のしつけ教室",
    description: "プロのトレーナーによる犬のしつけ教室です。基本的なコマンドから応用まで学べます。",
    date: "2024-03-25",
    time: "14:00-16:00",
    location: "里山サロン",
    maxParticipants: 20,
    currentParticipants: 18,
    price: "2,000円"
  },
  {
    id: 3,
    title: "夏の水遊び大会",
    description: "暑い夏を涼しく過ごそう！愛犬と一緒に水遊びを楽しむイベントです。",
    date: "2024-07-20",
    time: "13:00-17:00",
    location: "里山ドッグラン",
    maxParticipants: 30,
    currentParticipants: 0,
    price: "500円"
  }
]

export default function EventsManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [events, setEvents] = useState(mockEvents) // イベントリストの状態管理
  const [newEvent, setNewEvent] = useState({
    name: "",
    venue: "里山ドッグラン",
    maxParticipants: 20,
    date: "",
    time: "",
    description: "",
    isFree: true,
    price: ""
  })

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })



  const getDateStatus = (date: string) => {
    const eventDate = new Date(date)
    const today = new Date()
    if (eventDate < today) return "past"
    if (eventDate.toDateString() === today.toDateString()) return "ongoing"
    return "upcoming"
  }

  const handleCreateEvent = () => {
    // バリデーション: 有料選択時に料金が入力されていない場合
    if (!newEvent.isFree && !newEvent.price.trim()) {
      alert("有料イベントの場合は料金を入力してください")
      return
    }

    // 新規イベントを作成
    const createdEvent = {
      id: Date.now(), // 一時的なID生成
      title: newEvent.name,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.venue,
      maxParticipants: newEvent.maxParticipants,
      currentParticipants: 0,
      price: newEvent.isFree ? "無料" : newEvent.price
    }

    // イベントリストに追加
    setEvents(prevEvents => [...prevEvents, createdEvent])

    // 実際の実装では、APIを呼び出してデータベースに保存
    console.log("新規イベントを作成しました:", createdEvent)
    alert("新規イベントを作成しました")
    
    // モーダルを閉じてフォームをリセット
    setShowCreateModal(false)
    setNewEvent({
      name: "",
      venue: "里山ドッグラン",
      maxParticipants: 20,
      date: "",
      time: "",
      description: "",
      isFree: true,
      price: ""
    })
  }

  const handleCancelCreate = () => {
    setShowCreateModal(false)
    setNewEvent({
      name: "",
      venue: "里山ドッグラン",
      maxParticipants: 20,
      date: "",
      time: "",
      description: "",
      isFree: true,
      price: ""
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center md:ml-0 ml-20">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">イベント管理</h1>
          <p className="text-gray-600 mt-1">ドッグランイベントの作成・編集・管理</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          新規イベント作成
        </Button>
      </div>



      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="イベントタイトル、説明で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">
                    {event.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Event Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {event.date} {event.time}
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {event.currentParticipants}/{event.maxParticipants}人
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {event.price}
                </div>
              </div>



              {/* Actions */}
              <div className="flex items-center justify-end pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    編集
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-1" />
                    削除
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Events Message */}
      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>条件に一致するイベントが見つかりません</p>
              <p className="text-sm">検索条件を変更するか、新しいイベントを作成してください</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 新規イベント作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-600">新規イベント作成</h2>
              <button
                onClick={handleCancelCreate}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 左列 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">イベント名</label>
                  <Input
                    placeholder="イベント名を入力"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最大参加者数</label>
                  <Input
                    type="number"
                    value={newEvent.maxParticipants}
                    onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: parseInt(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">開催時間</label>
                  <Input
                    placeholder="例: 10:00-12:00"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">イベント説明</label>
                  <textarea
                    placeholder="イベントの詳細を入力"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 右列 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">会場</label>
                  <select
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="里山ドッグラン">里山ドッグラン</option>
                    <option value="里山サロン">里山サロン</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">開催日</label>
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">料金設定</label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isFree"
                          checked={newEvent.isFree}
                          onChange={() => setNewEvent({ ...newEvent, isFree: true, price: "" })}
                          className="mr-2"
                        />
                        無料
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isFree"
                          checked={!newEvent.isFree}
                          onChange={() => setNewEvent({ ...newEvent, isFree: false, price: "" })}
                          className="mr-2"
                        />
                        有料
                      </label>
                    </div>
                    {!newEvent.isFree && (
                      <div>
                        <Input
                          placeholder="料金を入力（例: 1000円）"
                          value={newEvent.price}
                          onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                onClick={handleCancelCreate}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleCreateEvent}
                className="bg-purple-600 hover:bg-purple-700"
              >
                作成
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
