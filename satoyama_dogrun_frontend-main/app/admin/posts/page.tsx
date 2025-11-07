"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  Eye,
  MoreHorizontal,
  FileText,
  User,
  Calendar,
  MessageCircle,
  Heart,
  Trash2
} from "lucide-react"
import { adminApiClient } from "@/lib/api/admin-api"
import { toast } from "sonner"

export default function PostsManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [statusFilter])

  const fetchPosts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const status = statusFilter !== "all" ? statusFilter : undefined
      const data = await adminApiClient.getPosts(status)
      setPosts(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error("投稿取得エラー:", err)
      setError(err.response?.data?.detail || "投稿一覧の取得に失敗しました")
      toast.error("投稿一覧の取得に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">承認済み</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">承認待ち</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">却下</Badge>
      case "reported":
        return <Badge className="bg-orange-100 text-orange-800">報告あり</Badge>
      default:
        return <Badge variant="secondary">不明</Badge>
    }
  }

  const handleShowDetails = async (post: any) => {
    try {
      const detail = await adminApiClient.getPostDetail(post.id)
      setSelectedPost(detail)
      setShowDetailsModal(true)
    } catch (err: any) {
      console.error("投稿詳細取得エラー:", err)
      toast.error("投稿詳細の取得に失敗しました")
    }
  }

  const handleCloseDetails = () => {
    setShowDetailsModal(false)
    setSelectedPost(null)
  }

  const handleDeletePost = async (post: any) => {
    if (confirm(`この投稿を削除しますか？\nこの操作は取り消せません。`)) {
      try {
        await adminApiClient.deletePost(post.id)
        toast.success("投稿を削除しました")
        fetchPosts() // 一覧を再取得
      } catch (err: any) {
        console.error("投稿削除エラー:", err)
        toast.error("投稿の削除に失敗しました")
      }
    }
  }

  const handleUpdateStatus = async (postId: string, status: string) => {
    try {
      await adminApiClient.updatePostStatus(postId, status)
      toast.success("投稿ステータスを更新しました")
      fetchPosts() // 一覧を再取得
      if (showDetailsModal) {
        handleShowDetails({ id: postId })
      }
    } catch (err: any) {
      console.error("ステータス更新エラー:", err)
      toast.error("ステータスの更新に失敗しました")
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center md:ml-0 ml-20">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">投稿管理</h1>
          <p className="text-gray-600 mt-1">ユーザー投稿の一覧と管理</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Eye className="h-4 w-4 mr-2" />
          投稿プレビュー
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
                  placeholder="投稿タイトル、内容、投稿者で検索..."
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
                <option value="pending">承認待ち</option>
                <option value="approved">承認済み</option>
                <option value="rejected">却下</option>
                <option value="reported">報告あり</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                フィルター
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>投稿一覧</CardTitle>
          <CardDescription>
            {filteredPosts.length}件の投稿が見つかりました
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                読み込み中...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                {error}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                投稿が見つかりません
              </div>
            ) : (
              filteredPosts.map((post) => {
                const createdAt = post.created_at 
                  ? new Date(post.created_at).toLocaleString('ja-JP')
                  : 'N/A'
                return (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">投稿ID: {post.id.substring(0, 8)}...</h3>
                              {getStatusBadge(post.status)}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {post.user_name || '不明'}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {createdAt}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {post.content}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {post.likes_count || 0}いいね
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {post.comments_count || 0}コメント
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <div className="flex flex-col space-y-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleShowDetails(post)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            詳細
                          </Button>
                          {post.status === "pending" && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleUpdateStatus(post.id, "approved")}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                承認
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleUpdateStatus(post.id, "rejected")}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                却下
                              </Button>
                            </>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeletePost(post)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            削除
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* 投稿詳細モーダル */}
      {showDetailsModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">投稿詳細情報</h2>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* 投稿情報 */}
              <Card>
                <CardHeader>
                  <CardTitle>投稿内容</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">投稿ID</label>
                      <p className="text-gray-900 text-sm font-mono">{selectedPost.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedPost.content}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">投稿者</label>
                        <p className="text-gray-900">{selectedPost.user_name || '不明'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                        <div className="mt-1">{getStatusBadge(selectedPost.status)}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">投稿日時</label>
                        <p className="text-gray-900">
                          {selectedPost.created_at 
                            ? new Date(selectedPost.created_at).toLocaleString('ja-JP')
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">いいね数</label>
                        <p className="text-gray-900">{selectedPost.likes_count || 0}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">コメント数</label>
                        <p className="text-gray-900">{selectedPost.comments_count || 0}</p>
                      </div>
                      {selectedPost.admin_notes && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">管理者メモ</label>
                          <p className="text-gray-900 whitespace-pre-wrap">{selectedPost.admin_notes}</p>
                        </div>
                      )}
                    </div>
                    {selectedPost.status === "pending" && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button 
                          onClick={() => {
                            handleUpdateStatus(selectedPost.id, "approved")
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          承認する
                        </Button>
                        <Button 
                          onClick={() => {
                            handleUpdateStatus(selectedPost.id, "rejected")
                          }}
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          却下する
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* コメント一覧 */}
              <Card>
                <CardHeader>
                  <CardTitle>コメント一覧 ({selectedPost.comments_count || 0}件)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500 py-8">
                    コメント機能は別途実装が必要です
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
