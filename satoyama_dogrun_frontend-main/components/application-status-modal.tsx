"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react"
import { apiClient, ApplicationStatusResponse } from "@/lib/api"
import { toast } from "sonner"

interface ApplicationStatusModalProps {
  isOpen: boolean
  onClose: () => void
  applicationId?: string | null
}

export function ApplicationStatusModal({ isOpen, onClose, applicationId }: ApplicationStatusModalProps) {
  const [status, setStatus] = useState<ApplicationStatusResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchApplicationStatus()
    }
  }, [isOpen, applicationId])

  const fetchApplicationStatus = async () => {
    if (!applicationId) {
      toast.error("申請IDが見つかりません")
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.getApplicationStatus(applicationId)
      setStatus(response)
    } catch (error: any) {
      console.error("申請状況取得エラー:", error)
      toast.error("申請状況の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (!status) return null
    
    switch (status.status) {
      case 'pending':
        return <Clock className="h-8 w-8 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case 'rejected':
        return <XCircle className="h-8 w-8 text-red-500" />
      default:
        return <AlertCircle className="h-8 w-8 text-gray-500" />
    }
  }

  const getStatusBadge = () => {
    if (!status) return null
    
    switch (status.status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">審査中</Badge>
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">承認済み</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">却下</Badge>
      default:
        return <Badge variant="secondary">不明</Badge>
    }
  }

  const getStatusMessage = () => {
    if (!status) return ""
    
    switch (status.status) {
      case 'pending':
        return "申請を審査中です。管理者の承認をお待ちください。"
      case 'approved':
        return "申請が承認されました！ログインしてご利用ください。"
      case 'rejected':
        return "申請が却下されました。理由をご確認ください。"
      default:
        return ""
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>申請状況確認</DialogTitle>
          <DialogDescription>
            利用申請の審査状況を確認できます
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : status ? (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">申請ID</CardTitle>
                  {getStatusBadge()}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground font-mono">
                  {status.application_id}
                </p>
              </CardContent>
            </Card>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              {getStatusIcon()}
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  {status.status === 'pending' && '審査中'}
                  {status.status === 'approved' && '承認されました'}
                  {status.status === 'rejected' && '却下されました'}
                </h3>
                <p className="text-sm text-gray-600">
                  {getStatusMessage()}
                </p>
              </div>
            </div>

            {/* 申請日時 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">申請日時:</span>
                <span>{formatDate(status.created_at)}</span>
              </div>

              {/* 承認日時（承認済みの場合） */}
              {status.status === 'approved' && status.approved_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">承認日時:</span>
                  <span>{formatDate(status.approved_at)}</span>
                </div>
              )}

              {/* 却下理由（却下の場合） */}
              {status.status === 'rejected' && status.rejection_reason && (
                <Card className="mt-4 border-red-200 bg-red-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-red-800">却下理由</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-red-700">
                      {status.rejection_reason}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* アクションボタン */}
            <div className="flex justify-end space-x-2">
              {status.status === 'approved' && (
                <Button
                  variant="default"
                  onClick={() => {
                    onClose()
                    // ログイン画面に遷移するロジックをここに追加
                  }}
                >
                  ログインする
                </Button>
              )}
              {status.status === 'rejected' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose()
                    // 再申請画面に遷移するロジックをここに追加
                  }}
                >
                  再申請する
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                閉じる
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">申請情報が見つかりません</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}