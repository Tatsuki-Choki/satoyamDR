"use client"

import { useEffect, useState } from "react"
import { Heart, MessageCircle, MoreHorizontal, Hash } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"

interface PostData {
  id: string
  user_id: string
  user_name: string
  user_avatar?: string
  content: string
  images: string[]
  hashtags: string[]
  created_at: string
  comments_count: number
  likes_count: number
  is_liked: boolean
}

interface PostFeedProps {
  refreshKey?: number
}

export function PostFeed({ refreshKey }: PostFeedProps) {
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    fetchPosts()
  }, [refreshKey])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.error("認証トークンが見つかりません")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      } else {
        console.error("投稿の取得に失敗しました")
      }
    } catch (error) {
      console.error("投稿取得エラー:", error)
      toast.error("投稿の読み込みに失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      const token = localStorage.getItem("access_token")
      const method = isLiked ? "DELETE" : "POST"
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/like`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        // 投稿リストを更新
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              is_liked: !isLiked,
              likes_count: result.likes_count || (isLiked ? post.likes_count - 1 : post.likes_count + 1)
            }
          }
          return post
        }))
      }
    } catch (error) {
      console.error("いいねエラー:", error)
      toast.error("いいねの処理に失敗しました")
    }
  }

  const handleComment = async (postId: string) => {
    const comment = commentInputs[postId]
    if (!comment?.trim()) return

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: comment }),
      })

      if (response.ok) {
        // コメント入力をクリア
        setCommentInputs({ ...commentInputs, [postId]: "" })
        // 投稿リストを更新
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return { ...post, comments_count: post.comments_count + 1 }
          }
          return post
        }))
        toast.success("コメントを投稿しました")
      }
    } catch (error) {
      console.error("コメントエラー:", error)
      toast.error("コメントの投稿に失敗しました")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "rgb(0, 8, 148)" }}></div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <Card className="border-asics-blue-100">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">まだ投稿がありません</p>
          <p className="text-sm text-gray-400 mt-2">最初の投稿をしてみましょう！</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="border-asics-blue-100">
          <CardContent className="p-4">
            {/* ヘッダー */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback style={{ backgroundColor: "rgba(0, 8, 148, 0.1)", color: "rgb(0, 8, 148)" }}>
                    {post.user_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-heading text-sm" style={{ color: "rgb(0, 8, 148)" }}>
                    {post.user_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ja })}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* コンテンツ */}
            <div className="mb-3">
              <p className="text-sm font-body whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* ハッシュタグ */}
            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 画像 */}
            {post.images.length > 0 && (
              <div className={`grid gap-2 mb-3 ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                {post.images.map((image, index) => (
                  <img
                    key={index}
                    src={`${process.env.NEXT_PUBLIC_API_URL}${image}`}
                    alt={`投稿画像 ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex items-center space-x-4 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id, post.is_liked)}
                className={post.is_liked ? "text-red-500" : "text-gray-500"}
              >
                <Heart className={`h-4 w-4 mr-1 ${post.is_liked ? "fill-current" : ""}`} />
                <span className="text-xs">{post.likes_count}</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">{post.comments_count}</span>
              </Button>
            </div>

            {/* コメント入力 */}
            <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
              <Input
                placeholder="コメントを入力..."
                value={commentInputs[post.id] || ""}
                onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleComment(post.id)
                  }
                }}
                className="flex-1 text-sm"
              />
              <Button
                size="sm"
                onClick={() => handleComment(post.id)}
                disabled={!commentInputs[post.id]?.trim()}
                style={{ backgroundColor: "rgb(0, 8, 148)" }}
                className="text-white"
              >
                送信
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}