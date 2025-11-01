"use client"

import { X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

import type { Notice } from "@/lib/types"

interface NoticesModalProps {
  showNoticesModal: boolean
  setShowNoticesModal: (show: boolean) => void
  notices: Notice[]
  setNotices: (notices: Notice[]) => void
}

export function NoticesModal({ showNoticesModal, setShowNoticesModal, notices, setNotices }: NoticesModalProps) {
  // モーダルが開かれたときにすべてのお知らせを既読にする
  const handleOpenChange = (open: boolean) => {
    setShowNoticesModal(open)
    if (open) {
      setNotices(notices.map((notice) => ({ ...notice, read: true })))
    }
  }

  return (
    <Dialog open={showNoticesModal} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">お知らせ一覧</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => setShowNoticesModal(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <div className="space-y-4">
          {notices.map((notice: Notice) => (
            <Card
              key={notice.id}
              className={`border-asics-blue-100 ${!notice.read ? "bg-blue-50" : ""}`} // 未読の場合に背景色を変更
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 mt-0.5" style={{ color: "rgb(255, 235, 0)" }} />
                  <div className="flex-1">
                    <h3 className="font-heading text-sm" style={{ color: "rgb(0, 8, 148)" }}>
                      {notice.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-caption mt-1">
                      {new Date(notice.date).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm mt-1 font-caption" style={{ color: "rgb(0, 8, 148)" }}>
                      {notice.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
