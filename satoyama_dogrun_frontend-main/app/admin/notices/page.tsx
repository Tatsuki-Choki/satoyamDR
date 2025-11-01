"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Bell,
  Calendar,
  Eye,
  EyeOff,
  AlertTriangle
} from "lucide-react"

// 仮のお知らせデータ
const mockNotices = [
  {
    id: 1,
    title: "営業時間変更のお知らせ",
    content: "4月1日より営業時間を変更いたします。新しい営業時間は9:00-18:00となります。",
    type: "important",
    status: "published",
    priority: "high",
    createdAt: "2024-03-20",
    publishedAt: "2024-03-20",
    expiresAt: "2024-04-30",
    author: "里山ドッグラン運営",
    isPinned: true,
    viewCount: 156
  },
  {
    id: 2,
    title: "春のメンテナンス作業について",
    content: "3月25日から27日まで、春のメンテナンス作業のため一部エリアがご利用いただけません。",
    type: "maintenance",
    status: "published",
    priority: "medium",
    createdAt: "2024-03-18",
    publishedAt: "2024-03-18",
    expiresAt: "2024-03-28",
    author: "里山ドッグラン運営",
    isPinned: false,
    viewCount: 89
  },
  {
    id: 3,
    title: "新サービス開始のお知らせ",
    content: "4月15日より、犬の写真撮影サービスを開始いたします。プロカメラマンによる撮影が可能です。",
    type: "service",
    status: "draft",
    priority: "normal",
    createdAt: "2024-03-15",
    publishedAt: null,
    expiresAt: "2024-05-15",
    author: "里山ドッグラン運営",
    isPinned: false,
    viewCount: 0
  }
]

export default function NoticesManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const filteredNotices = mockNotices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || notice.status === statusFilter
    const matchesType = typeFilter === "all" || notice.type === typeFilter
    const matchesPriority = priorityFilter === "all" || notice.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">公開中</Badge>
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">下書き</Badge>
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800">アーカイブ</Badge>
      default:
        return <Badge variant="secondary">不明</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "important":
        return <Badge className="bg-red-100 text-red-800">重要</Badge>
      case "maintenance":
        return <Badge className="bg-orange-100 text-orange-800">メンテナンス</Badge>
      case "service":
        return <Badge className="bg-blue-100 text-blue-800">サービス</Badge>
      case "event":
        return <Badge className="bg-purple-100 text-purple-800">イベント</Badge>
      default:
        return <Badge variant="outline">その他</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">高</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">中</Badge>
      case "normal":
        return <Badge className="bg-green-100 text-green-800">低</Badge>
      default:
        return <Badge variant="secondary">不明</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center md:ml-0 ml-20">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">お知らせ管理</h1>
          <p className="text-gray-600 mt-1">ユーザー向けお知らせの作成・編集・管理</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          新規お知らせ作成
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
                  placeholder="お知らせタイトル、内容で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべてのステータス</option>
                <option value="published">公開中</option>
                <option value="draft">下書き</option>
                <option value="archived">アーカイブ</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべての種類</option>
                <option value="important">重要</option>
                <option value="maintenance">メンテナンス</option>
                <option value="service">サービス</option>
                <option value="event">イベント</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべての優先度</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="normal">低</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                フィルター
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notices List */}
      <Card>
        <CardHeader>
          <CardTitle>お知らせ一覧</CardTitle>
          <CardDescription>
            {filteredNotices.length}件のお知らせが見つかりました
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNotices.map((notice) => (
              <div key={notice.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bell className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{notice.title}</h3>
                          {notice.isPinned && (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">固定</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>作成者: {notice.author}</span>
                          <span>作成日: {notice.createdAt}</span>
                          {notice.publishedAt && (
                            <span>公開日: {notice.publishedAt}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {notice.content}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span>有効期限: {notice.expiresAt}</span>
                      <span>閲覧数: {notice.viewCount}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getTypeBadge(notice.type)}
                      {getPriorityBadge(notice.priority)}
                      {getStatusBadge(notice.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <div className="flex flex-col space-y-2">
                      {notice.status === "draft" && (
                        <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                          <Eye className="h-4 w-4 mr-1" />
                          公開
                        </Button>
                      )}
                      {notice.status === "published" && (
                        <Button size="sm" variant="outline" className="text-gray-600 border-gray-600 hover:bg-gray-50">
                          <EyeOff className="h-4 w-4 mr-1" />
                          非公開
                        </Button>
                      )}
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
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* No Notices Message */}
      {filteredNotices.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>条件に一致するお知らせが見つかりません</p>
              <p className="text-sm">検索条件を変更するか、新しいお知らせを作成してください</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
