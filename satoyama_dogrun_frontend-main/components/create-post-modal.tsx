"use client"

import { useState } from "react"
import { X, Image, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated: () => void
}

export function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const [content, setContent] = useState("")
  const [hashtags, setHashtags] = useState("")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 4) // 最大4枚まで
      setSelectedImages(files)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("投稿内容を入力してください")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("content", content)
      
      if (hashtags.trim()) {
        formData.append("hashtags", hashtags)
      }
      
      selectedImages.forEach((image) => {
        formData.append("images", image)
      })

      // APIクライアントを使用して投稿を作成
      await apiClient.createPost({
        content,
        category: "general",
        hashtags: hashtags.trim(),
        image: selectedImages[0] // 暫定的に最初の画像のみ
      })

      toast.success("投稿を作成しました")
      onPostCreated()
      onClose()
      
      // フォームをリセット
      setContent("")
      setHashtags("")
      setSelectedImages([])
    } catch (error) {
      console.error("投稿作成エラー:", error)
      toast.error("投稿の作成に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-heading" style={{ color: "rgb(0, 8, 148)" }}>
            新しい投稿を作成
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* 投稿内容 */}
          <div>
            <Textarea
              placeholder="今日のわんちゃんの様子を投稿してみましょう..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {content.length}/500
            </p>
          </div>

          {/* ハッシュタグ */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Hash className="h-4 w-4" style={{ color: "rgb(0, 8, 148)" }} />
              <span className="text-sm font-caption">ハッシュタグ</span>
            </div>
            <Input
              placeholder="#柴犬 #ドッグラン #今治"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* 画像選択 */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Image className="h-4 w-4" style={{ color: "rgb(0, 8, 148)" }} />
              <span className="text-sm font-caption">写真を追加（最大4枚）</span>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
            >
              {selectedImages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`選択画像 ${index + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <Image className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    クリックして画像を選択
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* 投稿ボタン */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              style={{ backgroundColor: "rgb(0, 8, 148)" }}
              className="text-white"
            >
              {isSubmitting ? "投稿中..." : "投稿する"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}