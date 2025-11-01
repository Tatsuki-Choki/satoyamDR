"use client"

import { useEffect, useState } from "react"
import { LogIn, LogOut, Users, Dog, Clock, History, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { apiClient } from "@/lib/api"
import { QRScannerSimple } from "@/components/qr-scanner-simple"

interface EntryManagementProps {
  userDogs: any[]
}

export function EntryManagement({ userDogs }: EntryManagementProps) {
  const [isInPark, setIsInPark] = useState(false)
  const [selectedDogs, setSelectedDogs] = useState<string[]>([])
  const [currentVisitors, setCurrentVisitors] = useState<any>()
  const [entryHistory, setEntryHistory] = useState<any[]>([])
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showExitQRScanner, setShowExitQRScanner] = useState(false)
  const [selectedDogsForExit, setSelectedDogsForExit] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    fetchCurrentStatus()
    fetchEntryHistory()
  }, [])

  const fetchCurrentStatus = async () => {
    try {
      // 現在の在場者情報を取得
      const visitors = await apiClient.getCurrentVisitors()
      setCurrentVisitors(visitors)
      
      // 自分の履歴から現在の状態を判定
      const history = await apiClient.getEntryHistory(1)
      if (history.length > 0 && history[0].action === "entry") {
        setIsInPark(true)
      }
    } catch (error) {
      console.error("状態取得エラー:", error)
    }
  }

  const fetchEntryHistory = async () => {
    try {
      const history = await apiClient.getEntryHistory(10)
      setEntryHistory(history)
    } catch (error) {
      console.error("履歴取得エラー:", error)
    }
  }

  const handleEntry = async () => {
    if (selectedDogs.length === 0) {
      toast.error("入場させる犬を選択してください")
      return
    }

    setLoading(true)
    try {
      const result = await apiClient.enterDogRun(selectedDogs)
      toast.success("入場処理が完了しました")
      setIsInPark(true)
      setSelectedDogs([])
      await fetchCurrentStatus()
      await fetchEntryHistory()
    } catch (error: any) {
      console.error("入場エラー:", error)
      toast.error(error.response?.data?.detail || "入場処理に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const handleExit = async () => {
    if (selectedDogsForExit.length === 0) {
      toast.error("退場させる犬を選択してください")
      return
    }

    setLoading(true)
    try {
      // 選択された犬の情報を取得してメッセージに含める
      const selectedDogNames = selectedDogsForExit.map(dogId => {
        const dog = userDogs.find(d => d.id === dogId)
        return dog ? dog.name : dogId
      }).join(', ')

      // 実際のAPIではselectedDogsForExitを送信するが、今回はデモなのでフロントエンドのみ
      // const result = await apiClient.exitDogRun(selectedDogsForExit)
      
      toast.success(`${selectedDogNames}が退場しました！`)
      setIsInPark(false)
      setSelectedDogsForExit([])
      await fetchCurrentStatus()
      await fetchEntryHistory()
    } catch (error: any) {
      console.error("退場エラー:", error)
      toast.error(error.response?.data?.detail || "退場処理に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const toggleDogSelection = (dogId: string) => {
    setSelectedDogs(prev => 
      prev.includes(dogId) 
        ? prev.filter(id => id !== dogId)
        : [...prev, dogId]
    )
  }

  const toggleExitDogSelection = (dogId: string) => {
    setSelectedDogsForExit(prev => 
      prev.includes(dogId) 
        ? prev.filter(id => id !== dogId)
        : [...prev, dogId]
    )
  }

  const handleQRScanSuccess = async () => {
    // 入場状態に変更
    setIsInPark(true)
    
    // 選択された犬をリセット
    setSelectedDogs([])
    
    // 現在の状態と履歴を更新
    await fetchCurrentStatus()
    await fetchEntryHistory()
  }

  const handleExitQRScanSuccess = async () => {
    // 退場状態に変更
    setIsInPark(false)
    
    // 選択された犬をリセット
    setSelectedDogsForExit([])
    
    // 現在の状態と履歴を更新
    await fetchCurrentStatus()
    await fetchEntryHistory()
  }

  return (
    <div className="space-y-6">
      {/* 現在の状態 */}
      <Card className="border-asics-blue-100">
        <CardHeader>
          <CardTitle className="text-lg font-heading flex items-center justify-between" style={{ color: "rgb(0, 8, 148)" }}>
            <span className="flex items-center">
              {isInPark ? <LogOut className="h-5 w-5 mr-2" /> : <LogIn className="h-5 w-5 mr-2" />}
              {isInPark ? "現在入場中" : "入場受付"}
            </span>
            {isInPark && (
              <Badge className="bg-green-500 text-white">IN PARK</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isInPark ? (
            <>
              {/* QRコード読み取りボタン */}
              <Button
                onClick={() => setShowQRScanner(true)}
                variant="outline"
                className="w-full"
                disabled={selectedDogs.length === 0 || loading}
              >
                <Camera className="h-4 w-4 mr-2" />
                QRコードを読み取る
              </Button>
              
              {/* 犬選択状態のメッセージ */}
              {selectedDogs.length === 0 ? (
                <div className="text-center py-2">
                  <p className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                    ⚠️ 入場する犬を選択してください
                  </p>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    ✅ {selectedDogs.length}頭の犬が選択されています
                  </p>
                </div>
              )}

              <Separator />

              {/* 犬の選択 */}
              <div>
                <p className="text-sm font-medium mb-3">入場する犬を選択</p>
                {userDogs.length > 0 ? (
                  <div className="space-y-2">
                    {userDogs.map((dog) => (
                      <div key={dog.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                        <Checkbox 
                          checked={selectedDogs.includes(dog.id)}
                          onCheckedChange={() => toggleDogSelection(dog.id)}
                          disabled={loading}
                        />
                        <Dog className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{dog.name}</span>
                        {dog.breed && <span className="text-xs text-gray-500">({dog.breed})</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">登録された犬がいません</p>
                )}
              </div>

              {/* 入場ボタン */}
              <Button
                onClick={handleEntry}
                disabled={selectedDogs.length === 0 || loading}
                className="w-full text-white"
                style={{ backgroundColor: "rgb(0, 8, 148)" }}
              >
                {loading ? "処理中..." : "入場する"}
              </Button>
            </>
          ) : (
            <>
              <div className="text-center py-4 mb-4">
                <p className="text-lg mb-2">ドッグランをお楽しみください！</p>
                <p className="text-sm text-gray-600">退場時はQRコードを読み取ってください</p>
              </div>

              {/* 退場用QRコード読み取りボタン */}
              <Button
                onClick={() => setShowExitQRScanner(true)}
                variant="outline"
                className="w-full"
                disabled={selectedDogsForExit.length === 0 || loading}
              >
                <Camera className="h-4 w-4 mr-2" />
                QRコードを読み取って退場
              </Button>
              
              {/* 退場する犬の選択状態メッセージ */}
              {selectedDogsForExit.length === 0 ? (
                <div className="text-center py-2">
                  <p className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                    ⚠️ 退場する犬を選択してください
                  </p>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    ✅ {selectedDogsForExit.length}頭の犬が選択されています
                  </p>
                </div>
              )}

              <Separator />

              {/* 退場する犬の選択 */}
              <div>
                <p className="text-sm font-medium mb-3">退場する犬を選択</p>
                {userDogs.length > 0 ? (
                  <div className="space-y-2">
                    {userDogs.map((dog) => (
                      <div key={dog.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                        <Checkbox 
                          checked={selectedDogsForExit.includes(dog.id)}
                          onCheckedChange={() => toggleExitDogSelection(dog.id)}
                          disabled={loading}
                        />
                        <Dog className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{dog.name}</span>
                        {dog.breed && <span className="text-xs text-gray-500">({dog.breed})</span>}
                        <Badge variant="secondary" className="ml-auto text-xs">
                          入場中
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">入場中の犬がいません</p>
                )}
              </div>

              <Separator />

              {/* 手動退場ボタン */}
              <Button
                onClick={handleExit}
                disabled={selectedDogsForExit.length === 0 || loading}
                className="w-full text-white bg-red-500 hover:bg-red-600"
              >
                {loading ? "処理中..." : "退場する"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* 利用履歴 */}
      <Card className="border-asics-blue-100">
        <CardHeader>
          <CardTitle 
            className="text-base font-heading flex items-center justify-between cursor-pointer"
            style={{ color: "rgb(0, 8, 148)" }}
            onClick={() => setShowHistory(!showHistory)}
          >
            <span className="flex items-center">
              <History className="h-5 w-5 mr-2" />
              利用履歴
            </span>
            <span className="text-xs">{showHistory ? "▲" : "▼"}</span>
          </CardTitle>
        </CardHeader>
        {showHistory && (
          <CardContent>
            {entryHistory.length > 0 ? (
              <div className="space-y-2">
                {entryHistory.map((record) => (
                  <div key={record.id} className="flex items-center justify-between text-sm py-2 border-b">
                    <div className="flex items-center space-x-2">
                      {record.action === "entry" ? (
                        <LogIn className="h-4 w-4 text-green-500" />
                      ) : (
                        <LogOut className="h-4 w-4 text-red-500" />
                      )}
                      <span>{record.action === "entry" ? "入場" : "退場"}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(new Date(record.occurred_at), "MM/dd HH:mm", { locale: ja })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">利用履歴はありません</p>
            )}
          </CardContent>
        )}
      </Card>

      {/* 入場用QRコードスキャナーモーダル */}
      <QRScannerSimple
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanSuccess={handleQRScanSuccess}
        selectedDogs={selectedDogs}
      />

      {/* 退場用QRコードスキャナーモーダル */}
      <QRScannerSimple
        isOpen={showExitQRScanner}
        onClose={() => setShowExitQRScanner(false)}
        onScanSuccess={handleExitQRScanSuccess}
        selectedDogs={selectedDogsForExit}
        mode="exit"
      />
    </div>
  )
}