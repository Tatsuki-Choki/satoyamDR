"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  User,
  Dog,
  Phone,
  Mail
} from "lucide-react"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"

export default function ApplicationsManagement() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("pending")
  const [applications, setApplications] = useState<any[]>([])

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setIsLoading(true)
    try {
      console.log("Fetching applications...")
      const response = await apiClient.getAdminApplications()
      console.log("Applications response:", response)
      setApplications(Array.isArray(response) ? response : response.applications || [])
      setError(null)
    } catch (error: any) {
      console.error("Applications fetch error:", error)
      setError(error.response?.data?.detail || "申請データの取得に失敗しました")
      toast.error("申請データの取得に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (applicationId: string) => {
    try {
      await apiClient.approveApplication(applicationId, "承認")
      toast.success("申請を承認しました")
      fetchApplications()
    } catch (error: any) {
      console.error("Approval error:", error)
      toast.error("承認に失敗しました")
    }
  }

  const handleReject = async (applicationId: string) => {
    try {
      await apiClient.rejectApplication(applicationId, "却下")
      toast.success("申請を却下しました")
      fetchApplications()
    } catch (error: any) {
      console.error("Rejection error:", error)
      toast.error("却下に失敗しました")
    }
  }

  const filteredApplications = applications.filter(app => {
    if (activeTab === "pending") return app.status === "pending"
    if (activeTab === "approved") return app.status === "approved"
    if (activeTab === "rejected") return app.status === "rejected"
    return true
  })

  const renderApplicationCard = (application: any) => (
    <Card key={application.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-lg">
                {application.user_name}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{application.user_email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>{application.user_phone}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">申請日</div>
            <div className="font-medium">
              {new Date(application.created_at).toLocaleDateString('ja-JP')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">犬の情報</h4>
            <div className="bg-gray-50 p-3 rounded space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Dog className="h-4 w-4 text-gray-500" />
                <span>名前: {application.dog_name}</span>
              </div>
              <div>犬種: {application.dog_breed || "未記入"}</div>
              <div>体重: {application.dog_weight || "未記入"}</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">ステータス</h4>
            <div className="bg-gray-50 p-3 rounded space-y-2">
              <Badge 
                variant={
                  application.status === 'pending' ? 'secondary' :
                  application.status === 'approved' ? 'default' :
                  'destructive'
                }
                className="w-fit"
              >
                {application.status === 'pending' ? '審査中' :
                 application.status === 'approved' ? '承認済み' :
                 '却下'}
              </Badge>
              {application.admin_notes && (
                <div className="text-sm text-gray-600">
                  メモ: {application.admin_notes}
                </div>
              )}
            </div>
          </div>
        </div>

        {application.status === 'pending' && (
          <div className="flex space-x-3 pt-4 border-t">
            <Button 
              onClick={() => handleApprove(application.id)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              承認
            </Button>
            <Button 
              onClick={() => handleReject(application.id)}
              variant="destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              却下
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">申請データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>エラー: {error}</p>
          <Button onClick={fetchApplications} className="mt-4">
            再試行
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">申請管理</h1>
        
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === "pending" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("pending")}
            className="relative"
          >
            <Clock className="h-4 w-4 mr-2" />
            審査中
            {applications.filter(app => app.status === 'pending').length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {applications.filter(app => app.status === 'pending').length}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === "approved" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("approved")}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            承認済み
          </Button>
          <Button
            variant={activeTab === "rejected" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("rejected")}
          >
            <XCircle className="h-4 w-4 mr-2" />
            却下
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500 py-8">
                <p>
                  {activeTab === "pending" ? "審査中の申請はありません" :
                   activeTab === "approved" ? "承認済みの申請はありません" :
                   "却下された申請はありません"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map(renderApplicationCard)
        )}
      </div>
    </div>
  )
}