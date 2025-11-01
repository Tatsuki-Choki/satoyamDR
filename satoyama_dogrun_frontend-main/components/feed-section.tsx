"use client"
import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Heart, MessageCircle, Search, PlusCircle } from "lucide-react"
import { Input } from "@/components/ui/input"

import { tags } from "@/lib/data"
import { getTagColor, getTagLabel } from "@/lib/utils"
import type { Post } from "@/lib/types"
import { UserStatus } from "@/lib/constants"
import { PostFeed } from "@/components/post-feed"
import { CreatePostModal } from "@/components/create-post-modal"

interface FeedSectionProps {
  userStatus: UserStatus
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeTag: string
  setActiveTag: (tag: string) => void
  recentPosts: Post[]
  setRecentPosts: (posts: Post[]) => void
  setShowCreatePostModal: (show: boolean) => void
  setSelectedPostIdForComment: (id: number | null) => void
  setShowCommentModal: (show: boolean) => void
}

export function FeedSection({
  userStatus,
  searchQuery,
  setSearchQuery,
  activeTag,
  setActiveTag,
  recentPosts,
  setRecentPosts,
  setShowCreatePostModal,
  setSelectedPostIdForComment,
  setShowCommentModal,
}: FeedSectionProps) {
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const handleLikeToggle = (postId: number) => {
    setRecentPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  const filteredPosts = recentPosts.filter((post) => {
    const matchesTag = activeTag === "all" || post.tag === activeTag
    const matchesSearch =
      searchQuery === "" ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.dog.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTag && matchesSearch
  })

  if (userStatus !== UserStatus.LoggedIn) {
    return (
      <div className="space-y-6 text-center">
        <Card
          className="border-asics-blue-200"
          style={{ backgroundColor: "rgba(0, 8, 148, 0.05)", borderColor: "rgba(0, 8, 148, 0.2)" }}
        >
          <CardContent className="p-6">
            <h2 className="text-xl font-heading mb-4" style={{ color: "rgb(0, 8, 148)" }}>
              投稿機能はログイン後に利用可能です
            </h2>
            <p className="text-sm text-gray-600 font-caption">
              みんなの投稿の閲覧や新規投稿は、ログインしてからご利用いただけます。
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading" style={{ color: "rgb(0, 8, 148)" }}>
          みんなの投稿
        </h2>
        <Button
          size="sm"
          className="text-white"
          style={{ backgroundColor: "rgb(0, 8, 148)" }}
          onClick={() => setShowNewPostModal(true)}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          投稿する
        </Button>
      </div>

      {/* 新しいPostFeedコンポーネントを使用 */}
      <PostFeed refreshKey={refreshKey} />

      {/* 投稿作成モーダル */}
      <CreatePostModal
        isOpen={showNewPostModal}
        onClose={() => setShowNewPostModal(false)}
        onPostCreated={() => {
          setRefreshKey(prev => prev + 1) // フィードを更新
          setShowNewPostModal(false)
        }}
      />
    </div>
  )
}
