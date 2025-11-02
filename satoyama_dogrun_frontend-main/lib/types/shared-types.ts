// 共通型定義
export interface Tag {
  id: string
  label: string
}

export interface CalendarDay {
  date: number | null
  status: "open" | "closed" | "limited" | "empty"
  hours: string | null
  isEventDay: boolean
}

