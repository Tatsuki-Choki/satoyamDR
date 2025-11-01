"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Star,
  Save,
  Plus,
  Trash2
} from "lucide-react"

// 営業時間の型定義
interface BusinessHours {
  open: string
  close: string
}

// 日付の型定義
interface DaySchedule {
  date: number
  dayOfWeek: string
  businessHours: BusinessHours
  isOpen: boolean
  isEventDay: boolean
}

// 施設の型定義
interface Facility {
  id: string
  name: string
  color: string
  defaultHours: BusinessHours
  days: DaySchedule[]
}

export default function BusinessHoursManagement() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [facilities, setFacilities] = useState<Facility[]>([
    {
      id: "dogrun",
      name: "里山ドッグラン",
      color: "purple",
      defaultHours: { open: "09:00", close: "18:00" },
      days: []
    },
    {
      id: "salon",
      name: "里山サロン",
      color: "green",
      defaultHours: { open: "10:00", close: "19:00" },
      days: []
    }
  ])
  
  // モーダル状態
  const [selectedDay, setSelectedDay] = useState<{ facilityId: string; day: DaySchedule } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 月の日数を取得
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  // 曜日を取得
  const getDayOfWeek = (date: Date) => {
    const days = ["日", "月", "火", "水", "木", "金", "土"]
    return days[date.getDay()]
  }

  // カレンダーの日付を生成
  const generateCalendarDays = (month: Date) => {
    const daysInMonth = getDaysInMonth(month)
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
    
    return Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(month.getFullYear(), month.getMonth(), index + 1)
      return {
        date: index + 1,
        dayOfWeek: getDayOfWeek(date),
        businessHours: { open: "09:00", close: "18:00" },
        isOpen: true,
        isEventDay: false
      }
    })
  }

  // 月を変更
  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
    
    // 新しい月の日付を生成
    const newDays = generateCalendarDays(newMonth)
    setFacilities(prev => prev.map(facility => ({
      ...facility,
      days: newDays.map(day => ({
        ...day,
        businessHours: facility.defaultHours
      }))
    })))
  }

  // 営業時間を更新
  const updateBusinessHours = (facilityId: string, date: number, field: 'open' | 'close', value: string) => {
    setFacilities(prev => prev.map(facility => {
      if (facility.id === facilityId) {
        return {
          ...facility,
          days: facility.days.map(day => {
            if (day.date === date) {
              return {
                ...day,
                businessHours: {
                  ...day.businessHours,
                  [field]: value
                }
              }
            }
            return day
          })
        }
      }
      return facility
    }))
  }

  // 営業状態を切り替え
  const toggleBusinessStatus = (facilityId: string, date: number) => {
    setFacilities(prev => prev.map(facility => {
      if (facility.id === facilityId) {
        return {
          ...facility,
          days: facility.days.map(day => {
            if (day.date === date) {
              return {
                ...day,
                isOpen: !day.isOpen
              }
            }
            return day
          })
        }
      }
      return facility
    }))
  }

  // イベント日を切り替え
  const toggleEventDay = (facilityId: string, date: number) => {
    setFacilities(prev => prev.map(facility => {
      if (facility.id === facilityId) {
        return {
          ...facility,
          days: facility.days.map(day => {
            if (day.date === date) {
              return {
                ...day,
                isEventDay: !day.isEventDay
              }
            }
            return day
          })
        }
      }
      return facility
    }))
  }

  // デフォルト営業時間を設定
  const setDefaultHours = (facilityId: string, hours: BusinessHours) => {
    setFacilities(prev => prev.map(facility => {
      if (facility.id === facilityId) {
        return {
          ...facility,
          defaultHours: hours,
          days: facility.days.map(day => ({
            ...day,
            businessHours: hours
          }))
        }
      }
      return facility
    }))
  }

  // 日付をクリックしてモーダルを開く
  const openDayModal = (facilityId: string, day: DaySchedule) => {
    setSelectedDay({ facilityId, day })
    setIsModalOpen(true)
  }

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedDay(null)
  }

  // モーダル内で営業時間を更新
  const updateModalBusinessHours = (field: 'open' | 'close', value: string) => {
    if (selectedDay) {
      updateBusinessHours(selectedDay.facilityId, selectedDay.day.date, field, value)
    }
  }

  // モーダル内で営業状態を切り替え
  const toggleModalBusinessStatus = () => {
    if (selectedDay) {
      toggleBusinessStatus(selectedDay.facilityId, selectedDay.day.date)
    }
  }

  // モーダル内でイベント日を切り替え
  const toggleModalEventDay = () => {
    if (selectedDay) {
      toggleEventDay(selectedDay.facilityId, selectedDay.day.date)
    }
  }

  // モーダル内でデフォルトに戻す
  const resetToDefault = () => {
    if (selectedDay) {
      const facility = facilities.find(f => f.id === selectedDay.facilityId)
      if (facility) {
        updateBusinessHours(selectedDay.facilityId, selectedDay.day.date, 'open', facility.defaultHours.open)
        updateBusinessHours(selectedDay.facilityId, selectedDay.day.date, 'close', facility.defaultHours.close)
      }
    }
  }

  // 保存
  const handleSave = () => {
    // 実際の実装では、APIを呼び出してデータベースに保存
    console.log("営業時間を保存しました:", facilities)
    alert("営業時間を保存しました")
  }

  // 初期化時にカレンダーを生成
  useState(() => {
    const initialDays = generateCalendarDays(currentMonth)
    setFacilities(prev => prev.map(facility => ({
      ...facility,
      days: initialDays.map(day => ({
        ...day,
        businessHours: facility.defaultHours
      }))
    })))
  })

  const formatMonth = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center md:ml-0 ml-20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">営業時間管理</h1>
          <p className="text-gray-600 mt-1">ドッグランの営業時間と定休日の設定</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          新規時間帯追加
        </Button>
      </div>

      {/* 本日の開館情報 */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <CardTitle className="text-base sm:text-lg">本日の開館情報</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">開館時間</div>
              <div className="text-lg sm:text-xl font-bold text-gray-900">09:00</div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">閉館時間</div>
              <div className="text-lg sm:text-xl font-bold text-gray-900">18:00</div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">営業状況</div>
              <div className={`text-base sm:text-lg font-bold ${
                facilities.some(f => f.days.some(d => d.date === new Date().getDate() && d.isOpen))
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {facilities.some(f => f.days.some(d => d.date === new Date().getDate() && d.isOpen))
                  ? '営業日'
                  : '休業日'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 月選択 */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex items-center justify-center space-x-3 sm:space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeMonth('prev')}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg sm:text-xl font-semibold">{formatMonth(currentMonth)}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeMonth('next')}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 営業カレンダー */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {facilities.map((facility) => (
          <Card key={facility.id}>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-${facility.color}-500`}></div>
                <span>{facility.name}</span>
              </CardTitle>
              <CardDescription className="text-sm">
                デフォルト営業時間: {facility.defaultHours.open} - {facility.defaultHours.close}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              {/* デフォルト営業時間設定 */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">デフォルト営業時間</h4>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    type="time"
                    value={facility.defaultHours.open}
                    onChange={(e) => setDefaultHours(facility.id, { ...facility.defaultHours, open: e.target.value })}
                    className="w-full sm:w-24 text-sm"
                  />
                  <span className="text-gray-500">-</span>
                  <Input
                    type="time"
                    value={facility.defaultHours.close}
                    onChange={(e) => setDefaultHours(facility.id, { ...facility.defaultHours, close: e.target.value })}
                    className="w-full sm:w-24 text-sm"
                  />
                </div>
              </div>

              {/* モバイル向けヘルパーテキスト */}
              <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg sm:hidden">
                <p className="text-xs text-blue-700">
                  💡 日付をタップして営業時間を設定できます
                </p>
              </div>

              {/* カレンダー */}
              {/* モバイル向けのカレンダー */}
              <div className="block sm:hidden">
                <div className="grid grid-cols-7 gap-1">
                  {/* 曜日ヘッダー */}
                  {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                      {day}
                    </div>
                  ))}

                  {/* 日付セル */}
                  {facility.days.map((day) => (
                    <div
                      key={day.date}
                      className={`p-2 border rounded-lg text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                        day.isOpen 
                          ? day.isEventDay 
                            ? 'bg-yellow-100 border-yellow-300' 
                            : 'bg-gray-100 border-gray-300'
                          : 'bg-yellow-200 border-yellow-400'
                      }`}
                      onClick={() => openDayModal(facility.id, day)}
                    >
                      <div className="font-medium text-sm">{day.date}</div>
                      {day.isEventDay && (
                        <Star className="h-3 w-3 text-yellow-600 mx-auto mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* PC向けのカレンダー */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-7 gap-1">
                  {/* 曜日ヘッダー */}
                  {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}

                  {/* 日付セル */}
                  {facility.days.map((day) => (
                    <div
                      key={day.date}
                      className={`p-3 border rounded-lg text-center text-sm min-h-[140px] cursor-pointer hover:bg-gray-50 transition-colors ${
                        day.isOpen 
                          ? day.isEventDay 
                            ? 'bg-yellow-100 border-yellow-300' 
                            : 'bg-gray-100 border-gray-300'
                          : 'bg-yellow-200 border-yellow-400'
                      }`}
                      onClick={() => openDayModal(facility.id, day)}
                    >
                      <div className="font-medium mb-1">{day.date}</div>
                      {day.isOpen && (
                        <div className="text-xs text-gray-600">
                          {day.businessHours.open} - {day.businessHours.close}
                        </div>
                      )}
                      {!day.isOpen && (
                        <div className="text-xs text-yellow-700">休業</div>
                      )}
                      {day.isEventDay && (
                        <div className="mt-1">
                          <Star className="h-3 w-3 text-yellow-600 mx-auto" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 日付設定モーダル */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && `${selectedDay.day.date}日 (${selectedDay.day.dayOfWeek}) の設定`}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDay && (
            <div className="space-y-4">
              {/* 営業時間設定 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">営業時間</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={selectedDay.day.businessHours.open}
                    onChange={(e) => updateModalBusinessHours('open', e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-gray-500">-</span>
                  <Input
                    type="time"
                    value={selectedDay.day.businessHours.close}
                    onChange={(e) => updateModalBusinessHours('close', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* 営業状態 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">営業状態</label>
                <div className="flex space-x-2">
                  <Button
                    variant={selectedDay.day.isOpen ? "default" : "outline"}
                    onClick={toggleModalBusinessStatus}
                    className="flex-1"
                  >
                    {selectedDay.day.isOpen ? "営業日" : "営業日にする"}
                  </Button>
                  <Button
                    variant={!selectedDay.day.isOpen ? "default" : "outline"}
                    onClick={toggleModalBusinessStatus}
                    className="flex-1"
                  >
                    {!selectedDay.day.isOpen ? "休業日" : "休業日にする"}
                  </Button>
                </div>
              </div>

              {/* イベント日 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">イベント日</label>
                <Button
                  variant={selectedDay.day.isEventDay ? "default" : "outline"}
                  onClick={toggleModalEventDay}
                  className="w-full"
                >
                  {selectedDay.day.isEventDay ? "イベント日" : "イベント日にする"}
                </Button>
              </div>

              {/* デフォルトに戻す */}
              <Button
                variant="outline"
                onClick={resetToDefault}
                className="w-full"
              >
                デフォルトに戻す
              </Button>

              {/* 閉じる */}
              <Button
                onClick={closeModal}
                className="w-full"
              >
                閉じる
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
