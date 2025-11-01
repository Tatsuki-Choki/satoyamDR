"use client"

import { useEffect, useState, useRef } from "react"
import { Camera, X, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"

interface QRCodeScannerProps {
  isOpen: boolean
  onClose: () => void
  selectedDogs: string[]
  onScanSuccess: () => void
}

export function QRCodeScanner({ isOpen, onClose, selectedDogs, onScanSuccess }: QRCodeScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string>("")
  const [processing, setProcessing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // 背面カメラを優先
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setScanning(true)
      }
    } catch (error) {
      console.error("カメラアクセスエラー:", error)
      toast.error("カメラにアクセスできませんでした")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setScanning(false)
  }

  const handleManualInput = () => {
    const input = prompt("QRコードのデータを手動で入力してください:")
    if (input) {
      setScanResult(input)
      processQRCode(input)
    }
  }

  const processQRCode = async (qrData: string) => {
    setProcessing(true)
    try {
      // QRコードデータをパース
      let parsedData
      try {
        parsedData = JSON.parse(qrData.replace(/'/g, '"'))
      } catch {
        // 文字列として直接処理を試行
        parsedData = { user_id: qrData }
      }

      // バックエンドでQRコードスキャンと入場処理を同時実行
      const result = await apiClient.scanQRCode(parsedData)
      
      toast.success("入場処理が完了しました")
      onScanSuccess()
      onClose()
      
    } catch (error: any) {
      console.error("QRコード処理エラー:", error)
      toast.error(error.response?.data?.detail || "QRコードの処理に失敗しました")
    } finally {
      setProcessing(false)
    }
  }

  // 簡易的なQRコード検出（実際のプロダクションでは専用ライブラリを使用）
  const captureAndAnalyze = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // 実際の実装では、ここでQRコード読み取りライブラリを使用
    // 今回はデモ用の手動入力を促す
    handleManualInput()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-heading flex items-center" style={{ color: "rgb(0, 8, 148)" }}>
            <Camera className="h-5 w-5 mr-2" />
            QRコードスキャン
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* 選択された犬の表示 */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700 mb-2">入場予定の犬:</p>
            <div className="flex flex-wrap gap-1">
              {selectedDogs.map(dogId => (
                <span key={dogId} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  犬ID: {dogId}
                </span>
              ))}
            </div>
          </div>

          {/* カメラビュー */}
          <div className="relative">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {scanning ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">カメラを起動中...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* スキャンフレーム */}
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white rounded-lg shadow-lg">
                  <div className="w-full h-full border-2 border-dashed border-blue-400 rounded-lg"></div>
                </div>
              </div>
            )}
          </div>

          {/* 隠しcanvas（QRコード解析用） */}
          <canvas ref={canvasRef} className="hidden" />

          {/* 操作ボタン */}
          <div className="space-y-2">
            <Button
              onClick={captureAndAnalyze}
              disabled={!scanning || processing}
              className="w-full text-white"
              style={{ backgroundColor: "rgb(0, 8, 148)" }}
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  処理中...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  QRコードをスキャン
                </>
              )}
            </Button>
            
            <Button
              onClick={handleManualInput}
              variant="outline"
              className="w-full"
              disabled={processing}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              手動でコードを入力
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              QRコードをカメラの枠内に合わせてスキャンボタンを押してください
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
