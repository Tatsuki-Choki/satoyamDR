import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CalendarDay, Tag } from "./types"
import { DayStatus } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isVaccineUpToDate = (vaccinationDate: string): boolean => {
  const vaccination = new Date(vaccinationDate)
  const now = new Date()
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  return vaccination >= oneYearAgo
}

export const generateDogrunCalendarDays = (year: number, month: number): CalendarDay[] => {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()

  const days: CalendarDay[] = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ date: null, status: DayStatus.Empty, hours: null, isEventDay: false })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    let status: DayStatus.Open | DayStatus.Closed | DayStatus.Limited = DayStatus.Open
    let hours: string | null = "6:00-22:00" // Default dog run hours

    const currentDate = new Date(year, month - 1, i)
    const dayOfWeek = currentDate.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Example: Dog run closed on Mondays (dayOfWeek === 1)
    if (dayOfWeek === 1) {
      status = DayStatus.Closed
      hours = null
    }
    // Example: Dog run closed on March 1st and 2nd (specific dates)
    if (month === 3 && (i === 1 || i === 2)) {
      status = DayStatus.Closed
      hours = null
    }
    // Example: Dog run limited hours on March 15th
    if (month === 3 && i === 15) {
      status = DayStatus.Limited
      hours = "6:00-18:00"
    }

    // Example: Event day on March 20th
    if (month === 3 && i === 20) {
      days.push({ date: i, status, hours, isEventDay: true })
    } else {
      days.push({ date: i, status, hours, isEventDay: false })
    }
  }
  return days
}

export const generateSalonCalendarDays = (year: number, month: number): CalendarDay[] => {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()

  const days: CalendarDay[] = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ date: null, status: DayStatus.Empty, hours: null, isEventDay: false })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    let status: DayStatus.Open | DayStatus.Closed | DayStatus.Limited = DayStatus.Open
    let hours: string | null = "10:00-18:00" // Default salon hours

    const currentDate = new Date(year, month - 1, i)
    const dayOfWeek = currentDate.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Example: Salon closed on Wednesdays (dayOfWeek === 3)
    if (dayOfWeek === 3) {
      status = DayStatus.Closed
      hours = null
    }
    // Example: Salon closed on March 1st and 2nd (specific dates)
    if (month === 3 && (i === 1 || i === 2)) {
      status = DayStatus.Closed
      hours = null
    }
    // Example: Salon limited hours on March 15th
    if (month === 3 && i === 15) {
      status = DayStatus.Limited
      hours = "10:00-14:00"
    }

    days.push({ date: i, status, hours, isEventDay: false }) // Salon calendar doesn't have dog run events
  }
  return days
}

export const getDayStyle = (status: DayStatus): React.CSSProperties => {
  switch (status) {
    case DayStatus.Open:
      return { backgroundColor: "rgba(0, 8, 148, 0.1)", color: "rgb(0, 8, 148)" }
    case DayStatus.Closed:
      return { backgroundColor: "rgba(255, 235, 0, 0.3)", color: "rgb(0, 8, 148)" }
    case DayStatus.Limited:
      return { backgroundColor: "rgba(144, 238, 144, 0.3)", color: "rgb(0, 8, 148)" } // Light green for limited hours
    case DayStatus.Empty:
    default:
      return {}
  }
}

export const getTagLabel = (tagId: string, tags: Tag[]): string => {
  const tag = tags.find((t) => t.id === tagId)
  return tag ? tag.label : "その他"
}

export const getTagColor = (tagId: string): string => {
  switch (tagId) {
    case "satoyama-dogrun":
      return "bg-blue-100 text-blue-800"
    case "dog-food":
      return "bg-green-100 text-green-800"
    case "vet-clinic":
      return "bg-purple-100 text-purple-800"
    case "training":
      return "bg-orange-100 text-orange-800"
    case "walks":
      return "bg-teal-100 text-teal-800"
    case "events":
      return "bg-red-100 text-red-800"
    case "grooming":
      return "bg-pink-100 text-pink-800"
    case "toys":
      return "bg-indigo-100 text-indigo-800"
    case "daily-life":
      return "bg-yellow-100 text-yellow-800"
    case "trouble-consultation":
      return "bg-gray-200 text-gray-800"
    case "other":
      return "bg-gray-100 text-gray-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export const renderContentWithHashtags = (content: string): string => {
  if (!content) return content
  
  const hashtagRegex = /#(\w+)/g
  return content.replace(hashtagRegex, '<span class="text-blue-600 font-medium">$&</span>')
}
