// Define types for better type safety and readability

export interface DogProfile {
  id: number
  name: string
  breed: string
  weight: string
  owner: string
  time: string
  personality: string[]
  lastVaccinationDate?: string
}

export interface Event {
  id: number
  title: string
  date: string
  time: string
  participants: number
}

export interface Comment {
  id: number
  user: string
  text: string
}

export interface Post {
  id: number
  user: string
  dog: string
  content: string
  image: boolean
  likes: number
  comments: number
  time: string
  tag: string
  isLiked: boolean
  commentsList: Comment[]
}

export interface Notice {
  id: number
  title: string
  content: string
  date: string
  read: boolean
}

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

export interface OwnerProfile {
  fullName: string
  address: string
  email: string
  phoneNumber: string
  imabariResidency: string
  memberSince: string
}
