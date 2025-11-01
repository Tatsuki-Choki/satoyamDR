import type { DogProfile, Event, Post, Notice, Tag } from "./types"

export const currentUsers: DogProfile[] = [
  {
    id: 1,
    name: "ポチ",
    breed: "柴犬",
    weight: "8kg",
    owner: "田中さん",
    time: "30分前から",
    personality: ["人懐っこい", "活発"],
    lastVaccinationDate: "2025-01-15", // Within last year
  },
  {
    id: 2,
    name: "ハナ",
    breed: "ボーダーコリー",
    weight: "18kg",
    owner: "佐藤さん",
    time: "1時間前から",
    personality: ["遊び好き", "賢い"],
    lastVaccinationDate: "2023-03-20", // Older than a year
  },
  {
    id: 3,
    name: "チョコ",
    breed: "トイプードル",
    weight: "3kg",
    owner: "山田さん",
    time: "15分前から",
    personality: ["おとなしい", "甘えん坊"],
    lastVaccinationDate: "2024-06-01", // Within last year
  },
]

export const upcomingEvents: Event[] = [
  { id: 1, title: "犬の健康相談会", date: "3月25日", time: "10:00-12:00", participants: 8 },
  { id: 2, title: "春のドッグラン清掃", date: "3月30日", time: "9:00-11:00", participants: 15 },
  { id: 3, title: "しつけ教室", date: "4月5日", time: "14:00-16:00", participants: 12 },
]

export const initialRecentPosts: Post[] = [
  {
    id: 1,
    user: "田中さん",
    dog: "ポチ",
    content: "今日は元気いっぱいでした！ #里山ドッグラン #ポチ",
    image: true,
    likes: 5,
    comments: 2,
    time: "1時間前",
    tag: "satoyama-dogrun",
    isLiked: false,
    commentsList: [
      { id: 1, user: "佐藤さん", text: "ポチちゃん可愛いですね！" },
      { id: 2, user: "山田さん", text: "楽しそうで何よりです！" },
    ],
  },
  {
    id: 2,
    user: "佐藤さん",
    dog: "ハナ",
    content: "新しいおもちゃがお気に入りです #お気に入り #ハナ",
    image: true,
    likes: 8,
    comments: 3,
    time: "3時間前",
    tag: "toys",
    isLiked: false,
    commentsList: [
      { id: 1, user: "田中さん", text: "どこのおもちゃですか？うちの子も喜びそうです！" },
      { id: 2, user: "鈴木さん", text: "ハナちゃん、夢中ですね！" },
      { id: 3, user: "高橋さん", text: "可愛い！" },
    ],
  },
  {
    id: 3,
    user: "山田さん",
    dog: "チョコ",
    content: "お友達と仲良く遊んでいます #友達と遊ぶ #チョコ",
    image: false,
    likes: 6,
    comments: 1,
    time: "5時間前",
    tag: "daily-life",
    isLiked: false,
    commentsList: [{ id: 1, user: "田中さん", text: "チョコちゃん、社交的ですね！" }],
  },
]

export const initialNotices: Notice[] = [
  {
    id: 1,
    title: "芝生メンテナンスのお知らせ",
    content: "3月28日(木) 10:00-12:00 芝生メンテナンスのため一部エリア利用不可",
    date: "2025-03-28",
    read: false,
  },
  {
    id: 2,
    title: "春のイベント開催！",
    content: "4月10日に春のドッグランフェスティバルを開催します！詳細はイベントタブをご確認ください。",
    date: "2025-04-01",
    read: false,
  },
  {
    id: 3,
    title: "GW期間中の営業時間について",
    content: "ゴールデンウィーク期間中（5月3日〜5月6日）は、特別営業時間となります。詳細はカレンダーをご確認ください。",
    date: "2025-04-20",
    read: true,
  },
]

export const tags: Tag[] = [
  { id: "all", label: "すべて" },
  { id: "satoyama-dogrun", label: "里山ドッグラン" },
  { id: "dog-food", label: "ドッグフード" },
  { id: "vet-clinic", label: "動物病院" },
  { id: "training", label: "しつけ" },
  { id: "walks", label: "お散歩" },
  { id: "events", label: "イベント" },
  { id: "grooming", label: "お手入れ" },
  { id: "toys", label: "おもちゃ" },
  { id: "daily-life", label: "日常の一コマ" },
  { id: "trouble-consultation", label: "悩み相談" },
  { id: "other", label: "その他" },
]
