"use client"

import { useEffect, useState } from "react"
import { QrCode, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"

interface QRCodeDisplayProps {
  isOpen: boolean
  onClose: () => void
  selectedDogs?: string[]
}

export function QRCodeDisplay({ isOpen, onClose, selectedDogs = [] }: QRCodeDisplayProps) {
  const [qrCode, setQrCode] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    if (isOpen) {
      generateQRCode()
    }
  }, [isOpen])

  useEffect(() => {
    if (expiresAt) {
      const interval = setInterval(() => {
        const now = new Date()
        const diff = expiresAt.getTime() - now.getTime()
        setTimeLeft(Math.max(0, Math.floor(diff / 1000)))
        
        if (diff <= 0) {
          clearInterval(interval)
          toast.warning("QRコードの有効期限が切れました。再生成してください。")
        }
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [expiresAt])

  const generateQRCode = async () => {
    setLoading(true)
    try {
      const data = await apiClient.generateQRCode(selectedDogs)
      setQrCode(data.qr_code)
      setExpiresAt(new Date(data.expires_at))
    } catch (error) {
      console.error("QRコード生成エラー:", error)
      toast.error("QRコードの生成に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-heading flex items-center" style={{ color: "rgb(0, 8, 148)" }}>
            <QrCode className="h-5 w-5 mr-2" />
            入場用QRコード
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "rgb(0, 8, 148)" }}></div>
            </div>
          ) : qrCode ? (
            <>
              <div className="flex justify-center">
                <img src={qrCode} alt="QRコード" className="w-64 h-64" />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  このQRコードを受付で提示してください
                </p>
                {timeLeft > 0 ? (
                  <p className={`text-sm font-medium ${timeLeft < 60 ? 'text-red-500' : 'text-gray-700'}`}>
                    有効期限: {formatTime(timeLeft)}
                  </p>
                ) : (
                  <p className="text-sm text-red-500 font-medium">
                    有効期限切れ
                  </p>
                )}
              </div>
              
              <Button
                onClick={generateQRCode}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                QRコードを再生成
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">QRコードを生成できませんでした</p>
              <Button
                onClick={generateQRCode}
                className="mt-4"
                style={{ backgroundColor: "rgb(0, 8, 148)" }}
              >
                再試行
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}