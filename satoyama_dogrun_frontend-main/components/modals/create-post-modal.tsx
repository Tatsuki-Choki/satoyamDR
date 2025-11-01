"use client"

import type { FormEvent } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { tags } from "@/lib/data"

interface CreatePostModalProps {
  showCreatePostModal: boolean
  setShowCreatePostModal: (show: boolean) => void
  newPostCategory: string
  setNewPostCategory: (category: string) => void
  newPostContent: string
  setNewPostContent: (content: string) => void
  newPostHashtags: string
  setNewPostHashtags: (hashtags: string) => void
  newPostImageFile: File | null
  setNewPostImageFile: (file: File | null) => void
  handleNewPostSubmit: (e: FormEvent) => void
}

export function CreatePostModal({
  showCreatePostModal,
  setShowCreatePostModal,
  newPostCategory,
  setNewPostCategory,
  newPostContent,
  setNewPostContent,
  newPostHashtags,
  setNewPostHashtags,
  newPostImageFile,
  setNewPostImageFile,
  handleNewPostSubmit,
}: CreatePostModalProps) {
  return (
    <Dialog open={showCreatePostModal} onOpenChange={setShowCreatePostModal}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">新しい投稿を作成</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => setShowCreatePostModal(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <form onSubmit={handleNewPostSubmit} className="space-y-4 py-4">
          {/* Category */}
          <div>
            <Label htmlFor="postCategory" className="font-caption">
              カテゴリー <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={setNewPostCategory} value={newPostCategory} required>
              <SelectTrigger id="postCategory" className="w-full mt-1">
                <SelectValue placeholder="カテゴリーを選択" />
              </SelectTrigger>
              <SelectContent>
                {tags
                  .filter((tag) => tag.id !== "all")
                  .map(
                    (
                      tag, // Filter out 'all'
                    ) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.label}
                      </SelectItem>
                    ),
                  )}
              </SelectContent>
            </Select>
          </div>

          {/* Post Content */}
          <div>
            <Label htmlFor="postContent" className="font-caption">
              投稿内容 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="postContent"
              placeholder="今日のドッグランでの出来事をシェアしましょう！"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="mt-1 min-h-[100px]"
              required
            />
          </div>

          {/* Hashtags */}
          <div>
            <Label htmlFor="postHashtags" className="font-caption">
              ハッシュタグ (任意)
            </Label>
            <Input
              id="postHashtags"
              placeholder="#里山ドッグラン #ポチ"
              value={newPostHashtags}
              onChange={(e) => setNewPostHashtags(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label htmlFor="postImage" className="font-caption">
              画像の追加 (任意)
            </Label>
            <Input
              id="postImage"
              type="file"
              accept="image/*"
              onChange={(e) => setNewPostImageFile(e.target.files ? e.target.files[0] : null)}
              className="mt-1"
            />
            {newPostImageFile && (
              <p className="text-xs text-gray-500 mt-1">選択中のファイル: {newPostImageFile.name}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full text-white" style={{ backgroundColor: "rgb(0, 8, 148)" }}>
              投稿する
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
