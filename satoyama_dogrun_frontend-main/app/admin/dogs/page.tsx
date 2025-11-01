"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  Plus,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Dog,
  User,
  Calendar
} from "lucide-react"

// 仮の犬のデータ
const mockDogs = [
  {
    id: 1,
    name: "ポチ",
    breed: "ゴールデンレトリバー",
    owner: "田中 太郎",
    ownerEmail: "tanaka@example.com",
    status: "approved",
    registrationDate: "2024-01-15",
    lastVisit: "2024-03-20",
    age: 3,
    weight: 25.5,
    vaccinations: "完了"
  },
  {
    id: 2,
    name: "ハチ",
    breed: "柴犬",
    owner: "佐藤 花子",
    ownerEmail: "sato@example.com",
    status: "pending",
    registrationDate: "2024-03-18",
    lastVisit: "2024-03-19",
    age: 5,
    weight: 12.0,
    vaccinations: "完了"
  },
  {
    id: 3,
    name: "マロン",
    breed: "トイプードル",
    owner: "鈴木 次郎",
    ownerEmail: "suzuki@example.com",
    status: "suspended",
    registrationDate: "2024-02-10",
    lastVisit: "2024-03-15",
    age: 2,
    weight: 4.5,
    vaccinations: "未完了"
  }
]

export default function DogsManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [breedFilter, setBreedFilter] = useState("all")

  const filteredDogs = mockDogs.filter(dog => {
    const matchesSearch = dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dog.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dog.breed.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || dog.status === statusFilter
    const matchesBreed = breedFilter === "all" || dog.breed === breedFilter
    return matchesSearch && matchesStatus && matchesBreed
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">承認済み</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">承認待ち</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">停止中</Badge>
      default:
        return <Badge variant="secondary">不明</Badge>
    }
  }

  const getVaccinationBadge = (vaccinations: string) => {
    if (vaccinations === "完了") {
      return <Badge className="bg-green-100 text-green-800">完了</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">未完了</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center md:ml-0 ml-20">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">犬の管理</h1>
          <p className="text-gray-600 mt-1">登録された犬の情報管理</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          新規犬登録
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="犬の名前、飼い主、犬種で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべてのステータス</option>
                <option value="approved">承認済み</option>
                <option value="pending">承認待ち</option>
                <option value="suspended">停止中</option>
              </select>
              <select
                value={breedFilter}
                onChange={(e) => setBreedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべての犬種</option>
                <option value="ゴールデンレトリバー">ゴールデンレトリバー</option>
                <option value="柴犬">柴犬</option>
                <option value="トイプードル">トイプードル</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                フィルター
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dogs Table */}
      <Card>
        <CardHeader>
          <CardTitle>犬の一覧</CardTitle>
          <CardDescription>
            {filteredDogs.length}件の犬が登録されています
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">犬の情報</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">飼い主</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">ステータス</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">ワクチン</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">登録日</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">最終来場</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredDogs.map((dog) => (
                  <tr key={dog.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Dog className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{dog.name}</div>
                          <div className="text-sm text-gray-500">{dog.breed}</div>
                          <div className="text-sm text-gray-500">{dog.age}歳 / {dog.weight}kg</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{dog.owner}</div>
                          <div className="text-sm text-gray-500">{dog.ownerEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(dog.status)}
                    </td>
                    <td className="py-4 px-4">
                      {getVaccinationBadge(dog.vaccinations)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {dog.registrationDate}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {dog.lastVisit}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {dog.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              承認
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                              <XCircle className="h-4 w-4 mr-1" />
                              却下
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
