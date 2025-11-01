"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Building2, 
  Bell, 
  Shield, 
  Database,
  Save,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // 基本設定
  const [basicSettings, setBasicSettings] = useState({
    facilityName: "里山ドッグラン",
    facilityDescription: "自然豊かな里山で犬と一緒に楽しめるドッグラン",
    contactEmail: "info@satoyama-dogrun.com",
    contactPhone: "03-1234-5678",
    address: "東京都○○区○○町1-2-3",
    businessHours: "9:00-17:00",
    maxCapacity: "50",
    pricePerHour: "1000"
  })

  // 通知設定
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    maintenanceAlerts: true,
    userRegistrationAlerts: true,
    eventReminders: true
  })

  // セキュリティ設定
  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    requirePhoneVerification: false,
    maxLoginAttempts: "5",
    sessionTimeout: "24",
    twoFactorAuth: false
  })

  // システム設定
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,
    backupFrequency: "daily",
    logRetention: "30"
  })

  const handleSave = async (section: string) => {
    setIsLoading(true)
    try {
      // ここでAPIを呼び出して設定を保存
      await new Promise(resolve => setTimeout(resolve, 1000)) // 模擬的な遅延
      
      toast({
        title: "設定を保存しました",
        description: `${section}の設定が正常に保存されました。`,
      })
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: "設定の保存に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = (section: string) => {
    toast({
      title: "設定をリセットしました",
      description: `${section}の設定がデフォルト値に戻されました。`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center md:ml-0 ml-20">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">システム設定</h1>
          <p className="text-gray-600 mt-1">システム全体の設定と管理</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          設定を保存
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">基本設定</TabsTrigger>
          <TabsTrigger value="notifications">通知設定</TabsTrigger>
          <TabsTrigger value="security">セキュリティ</TabsTrigger>
          <TabsTrigger value="system">システム</TabsTrigger>
        </TabsList>

        {/* 基本設定 */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                施設情報
              </CardTitle>
              <CardDescription>ドッグランの基本情報を設定します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facilityName">施設名</Label>
                  <Input
                    id="facilityName"
                    value={basicSettings.facilityName}
                    onChange={(e) => setBasicSettings(prev => ({ ...prev, facilityName: e.target.value }))}
                    placeholder="施設名を入力"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxCapacity">最大収容数</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    value={basicSettings.maxCapacity}
                    onChange={(e) => setBasicSettings(prev => ({ ...prev, maxCapacity: e.target.value }))}
                    placeholder="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerHour">1時間あたりの料金</Label>
                  <Input
                    id="pricePerHour"
                    type="number"
                    value={basicSettings.pricePerHour}
                    onChange={(e) => setBasicSettings(prev => ({ ...prev, pricePerHour: e.target.value }))}
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessHours">営業時間</Label>
                  <Input
                    id="businessHours"
                    value={basicSettings.businessHours}
                    onChange={(e) => setBasicSettings(prev => ({ ...prev, businessHours: e.target.value }))}
                    placeholder="9:00-17:00"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="facilityDescription">施設説明</Label>
                <Textarea
                  id="facilityDescription"
                  value={basicSettings.facilityDescription}
                  onChange={(e) => setBasicSettings(prev => ({ ...prev, facilityDescription: e.target.value }))}
                  placeholder="施設の特徴や魅力を説明"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">連絡先メール</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={basicSettings.contactEmail}
                    onChange={(e) => setBasicSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="info@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">連絡先電話番号</Label>
                  <Input
                    id="contactPhone"
                    value={basicSettings.contactPhone}
                    onChange={(e) => setBasicSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="03-1234-5678"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">住所</Label>
                <Input
                  id="address"
                  value={basicSettings.address}
                  onChange={(e) => setBasicSettings(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="施設の住所を入力"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleReset("基本設定")}>
                  リセット
                </Button>
                <Button onClick={() => handleSave("基本設定")} disabled={isLoading}>
                  {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知設定 */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                通知設定
              </CardTitle>
              <CardDescription>各種通知の有効/無効を設定します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>メール通知</Label>
                    <p className="text-sm text-muted-foreground">重要な情報をメールで通知</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS通知</Label>
                    <p className="text-sm text-muted-foreground">緊急時のみSMSで通知</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>プッシュ通知</Label>
                    <p className="text-sm text-muted-foreground">アプリ内でプッシュ通知</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>メンテナンス通知</Label>
                    <p className="text-sm text-muted-foreground">システムメンテナンスの通知</p>
                  </div>
                  <Switch
                    checked={notificationSettings.maintenanceAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, maintenanceAlerts: checked }))}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>ユーザー登録通知</Label>
                    <p className="text-sm text-muted-foreground">新規ユーザー登録の通知</p>
                  </div>
                  <Switch
                    checked={notificationSettings.userRegistrationAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, userRegistrationAlerts: checked }))}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>イベントリマインダー</Label>
                    <p className="text-sm text-muted-foreground">イベント前のリマインダー通知</p>
                  </div>
                  <Switch
                    checked={notificationSettings.eventReminders}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, eventReminders: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleReset("通知設定")}>
                  リセット
                </Button>
                <Button onClick={() => handleSave("通知設定")} disabled={isLoading}>
                  {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* セキュリティ設定 */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                セキュリティ設定
              </CardTitle>
              <CardDescription>アカウントとセキュリティの設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>メール認証必須</Label>
                    <p className="text-sm text-muted-foreground">ユーザー登録時にメール認証を必須にする</p>
                  </div>
                  <Switch
                    checked={securitySettings.requireEmailVerification}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>電話認証必須</Label>
                    <p className="text-sm text-muted-foreground">ユーザー登録時に電話認証を必須にする</p>
                  </div>
                  <Switch
                    checked={securitySettings.requirePhoneVerification}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requirePhoneVerification: checked }))}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>二要素認証</Label>
                    <p className="text-sm text-muted-foreground">管理者アカウントに二要素認証を有効にする</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">最大ログイン試行回数</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: e.target.value }))}
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">セッションタイムアウト（時間）</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                    placeholder="24"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleReset("セキュリティ設定")}>
                  リセット
                </Button>
                <Button onClick={() => handleSave("セキュリティ設定")} disabled={isLoading}>
                  {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* システム設定 */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                システム設定
              </CardTitle>
              <CardDescription>システムの動作に関する設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>メンテナンスモード</Label>
                    <p className="text-sm text-muted-foreground">システムをメンテナンスモードにする</p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>デバッグモード</Label>
                    <p className="text-sm text-muted-foreground">開発者向けのデバッグ情報を表示</p>
                  </div>
                  <Switch
                    checked={systemSettings.debugMode}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, debugMode: checked }))}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>自動バックアップ</Label>
                    <p className="text-sm text-muted-foreground">データベースの自動バックアップを有効にする</p>
                  </div>
                  <Switch
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoBackup: checked }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">バックアップ頻度</Label>
                  <Select
                    value={systemSettings.backupFrequency}
                    onValueChange={(value) => setSystemSettings(prev => ({ ...prev, backupFrequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="バックアップ頻度を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">毎時</SelectItem>
                      <SelectItem value="daily">毎日</SelectItem>
                      <SelectItem value="weekly">毎週</SelectItem>
                      <SelectItem value="monthly">毎月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logRetention">ログ保持期間（日）</Label>
                  <Input
                    id="logRetention"
                    type="number"
                    value={systemSettings.logRetention}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, logRetention: e.target.value }))}
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleReset("システム設定")}>
                  リセット
                </Button>
                <Button onClick={() => handleSave("システム設定")} disabled={isLoading}>
                  {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
