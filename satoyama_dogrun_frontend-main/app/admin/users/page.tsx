"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  Plus,
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  Phone
} from "lucide-react"
import { adminApiClient } from "@/lib/api/admin-api"
import { toast } from "sonner"

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await adminApiClient.getUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error("ユーザー取得エラー:", err)
      setError(err.response?.data?.detail || "ユーザー一覧の取得に失敗しました")
      toast.error("ユーザー一覧の取得に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const userName = `${user.last_name || ''} ${user.first_name || ''}`.trim()
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone_number?.includes(searchQuery)
    // ステータスフィルターは一旦無効化（APIから取得したデータにstatusフィールドがないため）
    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">承認済み</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">承認待ち</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">停止中</Badge>
      default:
        return <Badge variant="secondary">不明</Badge>
    }
  }

  const handleShowDetails = (user: any) => {
    setSelectedUser(user)
    setShowDetailsModal(true)
  }

  const handleCloseDetails = () => {
    setShowDetailsModal(false)
    setSelectedUser(null)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center md:ml-0 ml-20">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
          <p className="text-gray-600 mt-1">登録ユーザーの一覧と管理</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          新規ユーザー追加
        </Button>
      </div>

      {/* 現在の利用者詳細 */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            <CardTitle>現在の利用者詳細</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 利用者1: 田中 太郎 */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-lg">田中 太郎</h3>
                </div>
                <Badge className="bg-green-100 text-green-800">利用中</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>入場: 14:30</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>利用時間: 1時間30分</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>090-1234-5678</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>tanaka@example.com</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">愛犬情報</h4>
                  <div className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">ポチ</h5>
                      <Badge className="bg-green-100 text-green-800 text-xs">ワクチン有効</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>犬種: 柴犬</div>
                      <div>年齢: 3歳</div>
                      <div>体重: 12kg</div>
                      <div>性別: オス</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 強制退場ボタン */}
              <div className="pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (confirm("田中 太郎さんを強制退場させますか？")) {
                      alert("田中 太郎さんを強制退場させました")
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded text-sm flex items-center justify-center space-x-2 transition-colors"
                >
                  <UserX className="h-3 w-3" />
                  <span>強制退場</span>
                </button>
              </div>
            </div>

            {/* 利用者2: 佐藤 花子 */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-lg">佐藤 花子</h3>
                </div>
                <Badge className="bg-green-100 text-green-800">利用中</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>入場: 15:15</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>利用時間: 45分</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>080-9876-5432</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>sato@example.com</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">愛犬情報</h4>
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">ハナ</h5>
                        <Badge className="bg-green-100 text-green-800 text-xs">ワクチン有効</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>犬種: ボーダーコリー</div>
                        <div>年齢: 5歳</div>
                        <div>体重: 18kg</div>
                        <div>性別: メス</div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">チョコ</h5>
                        <Badge className="bg-green-100 text-green-800 text-xs">ワクチン有効</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>犬種: トイプードル</div>
                        <div>年齢: 2歳</div>
                        <div>体重: 4kg</div>
                        <div>性別: メス</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 強制退場ボタン */}
              <div className="pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (confirm("佐藤 花子さんを強制退場させますか？")) {
                      alert("佐藤 花子さんを強制退場させました")
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded text-sm flex items-center justify-center space-x-2 transition-colors"
                >
                  <UserX className="h-3 w-3" />
                  <span>強制退場</span>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ユーザー名またはメールアドレスで検索..."
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
                <option value="active">承認済み</option>
                <option value="pending">承認待ち</option>
                <option value="suspended">停止中</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                フィルター
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>ユーザー一覧</CardTitle>
          <CardDescription>
            {filteredUsers.length}件のユーザーが見つかりました
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">ユーザー</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">ステータス</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">登録日</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">犬の数</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">最終ログイン</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      読み込み中...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      ユーザーが見つかりません
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const userName = `${user.last_name || ''} ${user.first_name || ''}`.trim() || '名前なし'
                    const registrationDate = user.created_at 
                      ? new Date(user.created_at).toLocaleDateString('ja-JP')
                      : 'N/A'
                    return (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{userName}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {user.email || 'N/A'}
                            </div>
                            {user.phone_number && (
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                {user.phone_number}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className="bg-green-100 text-green-800">承認済み</Badge>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {registrationDate}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          - {/* 犬の数は別途取得が必要 */}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          - {/* 最終ログインは別途取得が必要 */}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleShowDetails(user)}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              詳細
                            </Button>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ユーザー詳細モーダル */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">ユーザー詳細情報</h2>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* 基本情報 */}
              <Card>
                <CardHeader>
                  <CardTitle>基本情報</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
                      <p className="text-gray-900">{`${selectedUser.last_name || ''} ${selectedUser.first_name || ''}`.trim() || '名前なし'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                      <p className="text-gray-900">{selectedUser.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                      <p className="text-gray-900">{selectedUser.phone_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                      <p className="text-gray-900">{selectedUser.address || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">都道府県</label>
                      <p className="text-gray-900">{selectedUser.prefecture || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">市区町村</label>
                      <p className="text-gray-900">{selectedUser.city || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">登録日</label>
                      <p className="text-gray-900">
                        {selectedUser.created_at 
                          ? new Date(selectedUser.created_at).toLocaleString('ja-JP')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 更新日時 */}
              <Card>
                <CardHeader>
                  <CardTitle>更新情報</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">作成日時</label>
                      <p className="text-gray-900">
                        {selectedUser.created_at 
                          ? new Date(selectedUser.created_at).toLocaleString('ja-JP')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">更新日時</label>
                      <p className="text-gray-900">
                        {selectedUser.updated_at 
                          ? new Date(selectedUser.updated_at).toLocaleString('ja-JP')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleCloseDetails} variant="outline">
                閉じる
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
