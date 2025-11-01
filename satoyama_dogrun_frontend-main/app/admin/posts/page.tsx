"use client"

import { useState } from "react"
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

// 仮の投稿データ
const mockPosts = [
  {
    id: 1,
    title: "今日のドッグラン",
    content: "今日は天気が良くて、愛犬と楽しい時間を過ごしました。他のワンちゃんたちとも仲良く遊べて良かったです。",
    author: "田中 太郎",
    authorEmail: "tanaka@example.com",
    status: "approved",
    createdAt: "2024-03-20 14:30",
    likes: 15,
    comments: 8,
    imageUrl: "/placeholder.jpg",
    tags: ["日常", "楽しい"]
  },
  {
    id: 2,
    title: "新しいおもちゃ",
    content: "ドッグランで新しいおもちゃを買いました。愛犬がとても気に入ってくれて嬉しいです。",
    author: "佐藤 花子",
    authorEmail: "sato@example.com",
    status: "pending",
    createdAt: "2024-03-19 16:45",
    likes: 8,
    comments: 3,
    imageUrl: "/placeholder.jpg",
    tags: ["おもちゃ", "購入"]
  },
  {
    id: 3,
    title: "トレーニングの成果",
    content: "最近のトレーニングの成果が出てきて、愛犬がとても良い子になりました。",
    author: "鈴木 次郎",
    authorEmail: "suzuki@example.com",
    status: "reported",
    createdAt: "2024-03-18 10:15",
    likes: 22,
    comments: 12,
    imageUrl: "/placeholder.jpg",
    tags: ["トレーニング", "成果"]
  }
]

// 仮のコメントデータ
const mockComments = {
  1: [
    {
      id: 1,
      author: "佐藤 花子",
      content: "素敵な投稿ですね！うちの子も同じような体験をしました。",
      createdAt: "2024-03-20 15:00",
      likes: 3
    },
    {
      id: 2,
      author: "鈴木 次郎",
      content: "天気が良いとワンちゃんも楽しそうですね。",
      createdAt: "2024-03-20 15:30",
      likes: 1
    },
    {
      id: 3,
      author: "高橋 美咲",
      content: "写真も素敵です！",
      createdAt: "2024-03-20 16:00",
      likes: 2
    }
  ],
  2: [
    {
      id: 4,
      author: "田中 太郎",
      content: "おもちゃの購入、お疲れ様でした！",
      createdAt: "2024-03-19 17:00",
      likes: 1
    },
    {
      id: 5,
      author: "山田 健太",
      content: "どのおもちゃを買われたんですか？",
      createdAt: "2024-03-19 17:15",
      likes: 0
    }
  ],
  3: [
    {
      id: 6,
      author: "田中 太郎",
      content: "トレーニングの成果、素晴らしいですね！",
      createdAt: "2024-03-18 11:00",
      likes: 4
    },
    {
      id: 7,
      author: "佐藤 花子",
      content: "どんなトレーニングをされたんですか？",
      createdAt: "2024-03-18 11:30",
      likes: 2
    },
    {
      id: 8,
      author: "高橋 美咲",
      content: "参考になります！",
      createdAt: "2024-03-18 12:00",
      likes: 1
    }
  ]
}

export default function PostsManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [tagFilter, setTagFilter] = useState("all")
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = tagFilter === "all" || post.tags.includes(tagFilter)
    return matchesSearch && matchesTag
  })



  const handleShowDetails = (post: any) => {
    setSelectedPost(post)
    setShowDetailsModal(true)
  }

  const handleCloseDetails = () => {
    setShowDetailsModal(false)
    setSelectedPost(null)
  }

  const handleDeletePost = (post: any) => {
    if (confirm(`「${post.title}」を削除しますか？\nこの操作は取り消せません。`)) {
      // 実際の実装では、APIを呼び出してデータベースから削除
      console.log(`投稿「${post.title}」を削除しました`)
      alert(`投稿「${post.title}」を削除しました`)
      // 投稿一覧から削除（実際の実装では、APIレスポンス後に状態を更新）
    }
  }

  const handleDeleteComment = (comment: any, post: any) => {
    if (confirm(`コメント「${comment.content.substring(0, 30)}...」を削除しますか？\nこの操作は取り消せません。`)) {
      // 実際の実装では、APIを呼び出してデータベースから削除
      console.log(`コメント「${comment.content.substring(0, 30)}...」を削除しました`)
      alert(`コメントを削除しました`)
      // コメント一覧から削除（実際の実装では、APIレスポンス後に状態を更新）
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
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべてのタグ</option>
                <option value="日常">日常</option>
                <option value="楽しい">楽しい</option>
                <option value="おもちゃ">おもちゃ</option>
                <option value="トレーニング">トレーニング</option>
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
            {filteredPosts.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{post.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {post.author}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {post.createdAt}
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
                        {post.likes}いいね
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {post.comments}コメント
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
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
            ))}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                      <p className="text-gray-900 text-lg font-medium">{selectedPost.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedPost.content}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">投稿者</label>
                        <p className="text-gray-900">{selectedPost.author}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">投稿日時</label>
                        <p className="text-gray-900">{selectedPost.createdAt}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">いいね数</label>
                        <p className="text-gray-900">{selectedPost.likes}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">タグ</label>
                      <div className="flex items-center space-x-2 mt-1">
                        {selectedPost.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* コメント一覧 */}
              <Card>
                <CardHeader>
                  <CardTitle>コメント一覧 ({selectedPost.comments}件)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockComments[selectedPost.id as keyof typeof mockComments] ? (
                      mockComments[selectedPost.id as keyof typeof mockComments].map((comment: any) => (
                        <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-3 bg-gray-50 rounded-r-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-3 w-3 text-blue-600" />
                              </div>
                              <span className="font-medium text-gray-900">{comment.author}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{comment.createdAt}</span>
                              <span className="flex items-center">
                                <Heart className="h-3 w-3 mr-1" />
                                {comment.likes}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start justify-between">
                            <p className="text-gray-700 flex-1">{comment.content}</p>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDeleteComment(comment, selectedPost)}
                              className="text-red-600 border-red-600 hover:bg-red-50 ml-2"
                            >
                              削除
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        コメントはありません
                      </div>
                    )}
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
