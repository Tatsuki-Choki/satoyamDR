"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  Users, 
  Dog, 
  Star, 
  Package,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Download,
  Calendar
} from "lucide-react"

// ダミーデータ
const eventData = {
  dogFoodTasting: {
    totalParticipants: 45,
    date: "2024-03-15",
    satisfaction: 4.3,
    responses: [
      { breed: "柴犬", age: 3, reaction: "完食", rating: 5, wouldBuyAgain: true },
      { breed: "トイプードル", age: 2, reaction: "半分残し", rating: 3, wouldBuyAgain: false },
      { breed: "ゴールデンレトリバー", age: 5, reaction: "完食", rating: 5, wouldBuyAgain: true },
      { breed: "チワワ", age: 1, reaction: "少し食べた", rating: 2, wouldBuyAgain: false },
      { breed: "柴犬", age: 4, reaction: "完食", rating: 4, wouldBuyAgain: true },
    ],
    feedback: [
      "粒が少し大きいかも",
      "うちの子はとても気に入ったようです！",
      "もう少し柔らかいと良い",
      "匂いがとても良い",
    ]
  },
  toiletTrial: {
    totalParticipants: 32,
    date: "2024-03-22",
    satisfaction: 4.5,
    responses: [
      { breed: "柴犬", age: 2, usage: "すぐに使用", purchaseIntent: "購入したい", feedback: "吸収力が良い" },
      { breed: "トイプードル", age: 1, usage: "警戒後使用", purchaseIntent: "検討中", feedback: "サイズがちょうど良い" },
      { breed: "ミニチュアダックス", age: 3, usage: "すぐに使用", purchaseIntent: "購入したい", feedback: "消臭効果が高い" },
      { breed: "チワワ", age: 4, usage: "使用せず", purchaseIntent: "購入しない", feedback: "素材の感触が苦手そう" },
    ]
  }
}

// 犬種別集計
const breedStats = [
  { breed: "柴犬", count: 12, satisfaction: 4.5 },
  { breed: "トイプードル", count: 8, satisfaction: 3.8 },
  { breed: "ゴールデンレトリバー", count: 6, satisfaction: 4.7 },
  { breed: "チワワ", count: 5, satisfaction: 3.2 },
  { breed: "その他", count: 14, satisfaction: 4.0 },
]

export default function SponsorDashboard() {
  const [selectedEvent, setSelectedEvent] = useState("dogfood")

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">スポンサーダッシュボード</h1>
        <p className="text-blue-100">ユニ・チャーム様 専用データ分析</p>
      </div>

      {/* サマリーカード */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総イベント参加者数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">77</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              先月比 +23%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均満足度</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.4</div>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">購入意向率</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              イベント後の購入意向
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">リピート希望率</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              次回も参加したい
            </p>
          </CardContent>
        </Card>
      </div>

      {/* イベント別詳細 */}
      <Tabs value={selectedEvent} onValueChange={setSelectedEvent}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="dogfood">ドッグフード試食会</TabsTrigger>
          <TabsTrigger value="toilet">ペット用トイレ体験</TabsTrigger>
        </TabsList>

        <TabsContent value="dogfood" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ドッグフード試食会 分析レポート</CardTitle>
              <CardDescription>
                <Calendar className="inline h-3 w-3 mr-1" />
                開催日: 2024年3月15日 | 参加: 45頭
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 反応分布 */}
              <div>
                <h3 className="font-semibold mb-2">試食反応の分布</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>完食</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                      </div>
                      <span className="text-sm">27頭 (60%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>半分程度</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "25%" }}></div>
                      </div>
                      <span className="text-sm">11頭 (25%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>少し食べた</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: "15%" }}></div>
                      </div>
                      <span className="text-sm">7頭 (15%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 犬種別満足度 */}
              <div>
                <h3 className="font-semibold mb-2">犬種別の満足度</h3>
                <div className="space-y-2">
                  {breedStats.map((stat) => (
                    <div key={stat.breed} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Dog className="h-4 w-4" />
                        <span>{stat.breed}</span>
                        <Badge variant="secondary">{stat.count}頭</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i <= Math.round(stat.satisfaction) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="text-sm ml-1">{stat.satisfaction}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* フィードバック */}
              <div>
                <h3 className="font-semibold mb-2">
                  <MessageSquare className="inline h-4 w-4 mr-1" />
                  飼い主様からのフィードバック
                </h3>
                <div className="space-y-2">
                  {eventData.dogFoodTasting.feedback.map((comment, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm">{comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="toilet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ペット用トイレ体験会 分析レポート</CardTitle>
              <CardDescription>
                <Calendar className="inline h-3 w-3 mr-1" />
                開催日: 2024年3月22日 | 参加: 32頭
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 使用反応 */}
              <div>
                <h3 className="font-semibold mb-2">使用反応</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>すぐに使用</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "70%" }}></div>
                      </div>
                      <span className="text-sm">22頭 (70%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>警戒後使用</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "20%" }}></div>
                      </div>
                      <span className="text-sm">6頭 (20%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>使用せず</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: "10%" }}></div>
                      </div>
                      <span className="text-sm">4頭 (10%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 購入意向 */}
              <div>
                <h3 className="font-semibold mb-2">購入意向調査</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-3 bg-green-50 rounded">
                    <ThumbsUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-green-600">75%</div>
                    <div className="text-xs">購入したい</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded">
                    <MessageSquare className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-yellow-600">18%</div>
                    <div className="text-xs">検討中</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <ThumbsDown className="h-6 w-6 text-gray-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-gray-600">7%</div>
                    <div className="text-xs">購入しない</div>
                  </div>
                </div>
              </div>

              {/* 詳細フィードバック */}
              <div>
                <h3 className="font-semibold mb-2">詳細フィードバック</h3>
                <div className="space-y-2">
                  {eventData.toiletTrial.responses.map((response, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Dog className="h-4 w-4" />
                          <span className="font-medium">{response.breed}</span>
                          <Badge variant="outline">{response.age}歳</Badge>
                        </div>
                        <Badge 
                          variant={response.purchaseIntent === "購入したい" ? "default" : 
                                  response.purchaseIntent === "検討中" ? "secondary" : "outline"}
                        >
                          {response.purchaseIntent}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">使用状況: {response.usage}</p>
                      <p className="text-sm mt-1">「{response.feedback}」</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* エクスポートボタン */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-semibold">レポートのエクスポート</p>
            <p className="text-sm text-gray-500">データをPDF形式でダウンロード</p>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            PDFダウンロード
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}