"use client"

import { useEffect, useState, useRef } from "react"
import { Camera, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface QRScannerSimpleProps {
  isOpen: boolean
  onClose: () => void
  onScanSuccess?: () => void
  selectedDogs?: string[]
  mode?: 'entry' | 'exit'
}

export function QRScannerSimple({ isOpen, onClose, onScanSuccess, selectedDogs = [], mode = 'entry' }: QRScannerSimpleProps) {
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string>("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }
    
    return () => {
      stopCamera()
    }
  }, [isOpen])

  const startCamera = async () => {
    setCameraError("")
    setCameraActive(false)
    
    try {
      // カメラへのアクセス許可を要求
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // 背面カメラを優先
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
        toast.success("カメラが起動しました")
      }
    } catch (error: any) {
      console.error("カメラアクセスエラー:", error)
      let errorMessage = "カメラにアクセスできませんでした"
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "カメラの使用が許可されていません。ブラウザの設定を確認してください。"
      } else if (error.name === 'NotFoundError') {
        errorMessage = "カメラが見つかりません。"
      } else if (error.name === 'NotReadableError') {
        errorMessage = "カメラが他のアプリケーションで使用中です。"
      }
      
      setCameraError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  // QRコード読み取り成功をシミュレート
  const simulateQRSuccess = async () => {
    try {
      const actionText = mode === 'entry' ? '入場' : '退場'
      const successMessage = mode === 'entry' 
        ? "入場しました！ドッグランをお楽しみください🐕"
        : "退場しました！お疲れさまでした👋"
      
      // 成功メッセージを表示
      toast.success(`QRコード読み取り成功！${actionText}処理を開始します...`)
      
      // 少し待ってから完了メッセージ
      setTimeout(() => {
        toast.success(successMessage)
        
        // 成功コールバックを実行
        if (onScanSuccess) {
          onScanSuccess()
        }
        
        // モーダルを閉じる
        handleClose()
      }, 1500)
      
    } catch (error) {
      const actionText = mode === 'entry' ? '入場' : '退場'
      toast.error(`${actionText}処理に失敗しました`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-heading flex items-center" style={{ color: "rgb(0, 8, 148)" }}>
            <Camera className="h-5 w-5 mr-2" />
            {mode === 'entry' ? '入場用' : '退場用'}QRコードスキャナー
          </DialogTitle>
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* カメラビュー */}
          <div className="relative">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : cameraError ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-4">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 text-red-400" />
                    <p className="text-sm text-red-600 mb-4">{cameraError}</p>
                    <Button
                      onClick={startCamera}
                      variant="outline"
                      size="sm"
                    >
                      再試行
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">カメラを起動中...</p>
                    <div className="mt-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* スキャンフレーム */}
            {cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white rounded-lg shadow-lg">
                  <div className="w-full h-full border-2 border-dashed border-blue-400 rounded-lg animate-pulse"></div>
                </div>
              </div>
            )}
          </div>

          {/* 操作説明 */}
          <div className="text-center space-y-2">
            {cameraActive ? (
              <>
                <p className="text-sm font-medium text-gray-700">
                  QRコードをカメラの枠内に合わせてください
                </p>
                <p className="text-xs text-gray-500">
                  QRコードが認識されると自動的に処理されます
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-500">
                カメラの使用許可が必要です
              </p>
            )}
          </div>

          {/* 操作ボタン */}
          <div className="space-y-2">
            {cameraActive && (
              <Button
                onClick={simulateQRSuccess}
                className="w-full text-white"
                style={{ backgroundColor: "rgb(0, 8, 148)" }}
              >
                <Camera className="h-4 w-4 mr-2" />
                QRコードを読み取る（{mode === 'entry' ? '入場' : '退場'}デモ）
              </Button>
            )}
            
            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full"
            >
              閉じる
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
