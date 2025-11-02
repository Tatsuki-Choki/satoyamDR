"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Heart, MessageCircle, MoreHorizontal, Hash } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"

interface CommentData {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  user_name?: string
}

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
  latest_comment?: CommentData
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

  const fetchLatestComment = async (postId: string): Promise<CommentData | null> => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return null

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const comments = await response.json()
        // 最新のコメント（最初の1つ）を返す
        if (Array.isArray(comments) && comments.length > 0) {
          return comments[0] // バックエンドは降順で返すので最初が最新
        }
      }
      return null
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("コメント取得エラー:", error)
      }
      return null
    }
  }

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        if (process.env.NODE_ENV === 'development') {
          console.error("認証トークンが見つかりません")
        }
        toast.error("ログインが必要です")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("認証が必要です。再度ログインしてください")
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // レスポンスの検証
      if (!Array.isArray(data)) {
        if (process.env.NODE_ENV === 'development') {
          console.error("予期しないデータ形式:", data)
        }
        toast.error("データの取得に失敗しました")
        return
      }
      
      // 各投稿の最新コメントを取得
      const postsWithComments = await Promise.all(
        data.map(async (post: PostData) => {
          // コメントがある場合のみ最新コメントを取得
          if (post.comments_count > 0) {
            const latestComment = await fetchLatestComment(post.id)
            return { ...post, latest_comment: latestComment }
          }
          return post
        })
      )
      
      setPosts(postsWithComments)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("投稿取得エラー:", error)
      }
      toast.error("投稿の読み込みに失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        toast.error("ログインが必要です")
        return
      }

      const method = isLiked ? "DELETE" : "POST"
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/like`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("認証が必要です。再度ログインしてください")
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // レスポンスの検証
      if (typeof result.likes_count !== 'number') {
        if (process.env.NODE_ENV === 'development') {
          console.error("予期しないレスポンス形式:", result)
        }
      }

      // 投稿リストを更新（関数型更新で競合状態を回避）
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            is_liked: !isLiked,
            likes_count: result.likes_count ?? (isLiked ? post.likes_count - 1 : post.likes_count + 1)
          }
        }
        return post
      }))
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("いいねエラー:", error)
      }
      toast.error("いいねの処理に失敗しました")
    }
  }

  const handleComment = async (postId: string) => {
    const comment = commentInputs[postId]
    if (!comment?.trim()) return

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        toast.error("ログインが必要です")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: comment }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("認証が必要です。再度ログインしてください")
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newComment = await response.json()
      
      // レスポンスの検証
      if (!newComment || !newComment.id || !newComment.content) {
        if (process.env.NODE_ENV === 'development') {
          console.error("予期しないコメントレスポンス形式:", newComment)
        }
        toast.error("コメントの投稿に失敗しました")
        return
      }

      // コメント入力をクリア
      setCommentInputs(prev => ({ ...prev, [postId]: "" }))
      
      // 投稿リストを更新（最新コメントも更新・関数型更新で競合状態を回避）
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return { 
            ...post, 
            comments_count: post.comments_count + 1,
            latest_comment: {
              id: newComment.id,
              post_id: newComment.post_id,
              user_id: newComment.user_id,
              user_name: newComment.user_name,
              content: newComment.content,
              created_at: newComment.created_at,
            }
          }
        }
        return post
      }))
      toast.success("コメントを投稿しました")
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("コメントエラー:", error)
      }
      toast.error("コメントの投稿に失敗しました")
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-asics-blue-100">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 mb-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-20 w-full mb-3" />
              <Skeleton className="h-48 w-full mb-3" />
              <div className="flex items-center space-x-4 pt-3">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
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
                {post.images.map((image, index) => {
                  const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}${image}`
                  return (
                    <div key={index} className="relative w-full aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={imageUrl}
                        alt={`投稿画像 ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
                    </div>
                  )
                })}
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

            {/* 最新コメント表示 */}
            {post.latest_comment && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-start space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback style={{ backgroundColor: "rgba(0, 8, 148, 0.1)", color: "rgb(0, 8, 148)", fontSize: "10px" }}>
                      {post.latest_comment.user_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium" style={{ color: "rgb(0, 8, 148)" }}>
                        {post.latest_comment.user_name || "ユーザー"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(post.latest_comment.created_at), { addSuffix: true, locale: ja })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700">{post.latest_comment.content}</p>
                  </div>
                </div>
              </div>
            )}

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