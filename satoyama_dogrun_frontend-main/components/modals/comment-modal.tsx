"use client"

import type { FormEvent } from "react"
import { X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import type { Comment, Post } from "@/lib/types"

interface CommentModalProps {
  showCommentModal: boolean
  setShowCommentModal: (show: boolean) => void
  selectedPostIdForComment: number | null
  setSelectedPostIdForComment: (id: number | null) => void
  newCommentText: string
  setNewCommentText: (text: string) => void
  recentPosts: Post[]
  setRecentPosts: (posts: Post[]) => void
  handleAddComment: (e: FormEvent) => void
}

export function CommentModal({
  showCommentModal,
  setShowCommentModal,
  selectedPostIdForComment,
  setSelectedPostIdForComment,
  newCommentText,
  setNewCommentText,
  recentPosts,
  setRecentPosts,
  handleAddComment,
}: CommentModalProps) {
  const post = recentPosts.find((p) => p.id === selectedPostIdForComment)

  if (!post) return null // Don't render if no post is selected

  return (
    <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">コメント</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => {
              setShowCommentModal(false)
              setSelectedPostIdForComment(null)
              setNewCommentText("")
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Display existing comments */}
          {post.commentsList.length > 0 ? (
            <div className="space-y-3">
              {post.commentsList.map((comment: Comment) => (
                <div key={comment.id} className="flex items-start space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback style={{ backgroundColor: "rgba(0, 8, 148, 0.05)", color: "rgb(0, 8, 148)" }}>
                      {comment.user[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-gray-100 p-2 rounded-lg">
                    <p className="font-heading text-sm" style={{ color: "rgb(0, 8, 148)" }}>
                      {comment.user}
                    </p>
                    <p className="text-sm font-caption text-gray-700">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 font-caption">まだコメントはありません。</p>
          )}

          {/* New comment input */}
          <form onSubmit={handleAddComment} className="flex items-center space-x-2 pt-4 border-t">
            <Input
              placeholder="コメントを入力..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" size="sm" style={{ backgroundColor: "rgb(0, 8, 148)" }}>
              コメントする
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
