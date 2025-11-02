"use client"

import { Activity, Clock, Dog, Users, MapPin, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroupItem } from "@/components/ui/radio-group"

import { termsOfUseText, UserStatus, ImabariResidency } from "@/lib/constants"
import type { DogProfile } from "@/lib/types"
import { useState, useMemo, useCallback, FormEvent } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"

const dogBreeds = [
  "トイ・プードル",
  "チワワ",
  "ミニチュア・ダックスフンド",
  "ポメラニアン",
  "マルチーズ",
  "シーズー",
  "パピヨン",
  "ヨークシャー・テリア",
  "ペキニーズ",
  "ジャック・ラッセル・テリア",
  "ビション・フリーゼ",
  "フレンチ・ブルドッグ",
  "柴犬",
  "コーギー",
  "キャバリア・キング・チャールズ・スパニエル",
  "シェットランド・シープドッグ",
  "ビーグル",
  "ボストン・テリア",
  "アメリカン・コッカー・スパニエル",
  "ゴールデン・レトリーバー",
  "ラブラドール・レトリーバー",
  "シベリアン・ハスキー",
  "バーニーズ・マウンテン・ドッグ",
  "ボーダー・コリー",
  "ドーベルマン",
  "グレート・ピレニーズ",
  "ジャーマン・シェパード・ドッグ",
  "秋田犬",
  "その他",
]

// 現在利用中のワンちゃんのモックデータ
const currentDogs = [
  {
    id: 1,
    breed: "柴犬",
    vaccinationStatus: "ワクチン済",
    characteristics: ["人懐っこい", "活発"],
    timeSpent: "30分前から",
    icon: "🐕"
  },
  {
    id: 2,
    breed: "ボーダーコリー",
    vaccinationStatus: "ワクチン済",
    characteristics: ["遊び好き", "賢い"],
    timeSpent: "1時間前から",
    icon: "🐕"
  },
  {
    id: 3,
    breed: "トイプードル",
    vaccinationStatus: "ワクチン済",
    characteristics: ["おとなしい", "甘えん坊"],
    timeSpent: "15分前から",
    icon: "🐕"
  }
]

interface HomeSectionProps {
  userStatus: any
  setUserStatus: (status: any) => void
  showTerms: boolean
  setShowTerms: (show: boolean) => void
  loginError: string
  setLoginError: (error: string) => void
  vaccinationCertificateFile: File | null
  setVaccinationCertificateFile: (file: File | null) => void
  selectedImabariResidency: string
  setSelectedImabariResidency: (residency: string) => void
  handleRegistrationSubmit: (
    formData: FormData
  ) => void
  handleLoginSubmit: (e: FormEvent) => void
  handleForgotPasswordSubmit: (e: FormEvent) => void
  handleDemoLogin: () => void
  handleLogout: () => void
  onCheckApplicationStatus?: () => void
  postalCode: string
  setPostalCode: (code: string) => void
  prefecture: string
  setPrefecture: (prefecture: string) => void
  city: string
  setCity: (city: string) => void
  street: string
  setStreet: (street: string) => void
  building: string
  setBuilding: (building: string) => void
  applicationDate: string
  setApplicationDate: (date: string) => void
}

export function HomeSection({
  userStatus,
  setUserStatus,
  showTerms,
  setShowTerms,
  loginError,
  setLoginError,
  vaccinationCertificateFile,
  setVaccinationCertificateFile,
  selectedImabariResidency,
  setSelectedImabariResidency,
  handleRegistrationSubmit,
  handleLoginSubmit,
  handleForgotPasswordSubmit,
  handleDemoLogin,
  handleLogout,
  onCheckApplicationStatus,
  postalCode,
  setPostalCode,
  prefecture,
  setPrefecture,
  city,
  setCity,
  street,
  setStreet,
  building,
  setBuilding,
  applicationDate,
  setApplicationDate,
}: HomeSectionProps) {
  const [dogName, setDogName] = useState("")
  const [dogBreed, setDogBreed] = useState("")
  const [dogWeight, setDogWeight] = useState("")
  const [dogAge, setDogAge] = useState<number | undefined>()
  const [dogGender, setDogGender] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agree, setAgree] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  const isFormValid = useMemo(() => {
    return (
      agree &&
      applicationDate &&
      postalCode &&
      prefecture &&
      city &&
      street &&
      fullName &&
      email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      phoneNumber &&
      selectedImabariResidency &&
      dogName &&
      dogBreed &&
      dogWeight &&
      vaccinationCertificateFile &&
      password &&
      confirmPassword &&
      password === confirmPassword
    )
  }, [
    agree,
    applicationDate,
    postalCode,
    prefecture,
    city,
    street,
    fullName,
    email,
    phoneNumber,
    selectedImabariResidency,
    dogName,
    dogBreed,
    dogWeight,
    vaccinationCertificateFile,
    password,
    confirmPassword,
  ])

  const handlePostalCodeChange = async (e: React.FocusEvent<HTMLInputElement>) => {
    const code = e.target.value.replace(/-/g, "") // ハイフンを削除
    setPostalCode(code)

    if (code.length === 7) {
      try {
        const res = await fetch(`https://madefor.github.io/postal-code-api/api/v1/${code.substring(0, 3)}/${code.substring(3, 7)}.json`)
        const data = await res.json()
        if (data && data.data && data.data.length > 0) {
          const addressData = data.data[0].ja
          setPrefecture(addressData.prefecture)
          setCity(addressData.address1 + addressData.address2)
          setStreet(addressData.address3)
        } else {
          setPrefecture("")
          setCity("")
          setStreet("")
          alert("郵便番号が見つかりません。住所を手動で入力してください。")
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("郵便番号検索エラー:", error)
        }
        alert("郵便番号検索中にエラーが発生しました。住所を手動で入力してください。")
      }
    }
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (process.env.NODE_ENV === 'development') {
      console.log("フォーム送信開始");
    }
    
    // FormDataオブジェクトを作成
    const formData = new FormData();
    formData.append('agree', agree.toString());
    formData.append('applicationDate', applicationDate);
    formData.append('postalCode', postalCode);
    formData.append('prefecture', prefecture);
    formData.append('city', city);
    formData.append('street', street);
    formData.append('building', building);
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('phoneNumber', phoneNumber);
    formData.append('imabariResidency', selectedImabariResidency);
    formData.append('dogName', dogName);
    formData.append('dogBreed', dogBreed);
    formData.append('dogWeight', dogWeight);
    if (dogAge) {
      formData.append('dogAge', dogAge.toString());
    }
    if (dogGender) {
      formData.append('dogGender', dogGender);
    }
    formData.append('password', password);
    if (vaccinationCertificateFile) {
      formData.append('vaccine_certificate', vaccinationCertificateFile);
    }

    // 親コンポーネントの送信ハンドラを呼び出す
    if (process.env.NODE_ENV === 'development') {
      console.log("handleRegistrationSubmit呼び出し開始", formData);
    }
    handleRegistrationSubmit(formData);
  }

  const today = new Date()
  const formattedDate = today.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  return (
    <section id="home" className="relative w-full">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col space-y-4">
          {/* 営業時間・入館情報 */}
          <div className="bg-blue-900 text-white p-4 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold">本日開館 | 9:00~17:00</div>
            </div>
          </div>

          {/* 現在の利用状況 */}
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-900" />
                  <span className="text-sm font-medium text-gray-700">現在の利用状況</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">{currentDogs.length}匹</div>
                  <div className="text-xs text-gray-500">最終更新: 5分前</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 現在利用中のワンちゃん */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-900" />
              <h3 className="text-lg font-medium text-gray-900">現在利用中のワンちゃん</h3>
            </div>
            {currentDogs.map((dog) => (
              <Card key={dog.id} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center text-lg">
                      {dog.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {dog.breed}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                          {dog.vaccinationStatus}
                        </Badge>
                        {dog.characteristics.map((char, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {char}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{dog.timeSpent}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 利用申請が必要セクション - ログイン前のみ表示（ログインフォーム・利用申請フォーム表示中は非表示） */}
          {userStatus !== UserStatus.LoggedIn && 
           userStatus !== UserStatus.LoginForm && 
           userStatus !== UserStatus.ForgotPasswordForm && 
           userStatus !== UserStatus.ForgotPasswordSent &&
           userStatus !== UserStatus.RegistrationForm && (
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-blue-900 mb-3">
                  里山ドッグランのご利用には申請が必要です
                </h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  安全で快適な環境を提供するため、初回利用時には簡単な申請と審査をお願いしております。
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => setUserStatus(UserStatus.RegistrationForm)}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white"
                  >
                    利用申請をする
                  </Button>
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => setUserStatus(UserStatus.LoginForm)}
                      variant="outline" 
                      className="flex-1 border-blue-900 text-blue-900 hover:bg-blue-50"
                    >
                      ログイン
                    </Button>
                    <Button 
                      onClick={() => window.open('/admin', '_blank')}
                      variant="outline" 
                      className="flex-1 border-gray-400 text-gray-600 hover:bg-gray-50"
                    >
                      管理者ログイン
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 利用申請フォーム */}
          {userStatus === UserStatus.RegistrationForm && (
            <div className="space-y-6 mt-6">
              <Card className="border-asics-blue-100">
                <CardContent className="p-4">
                  <form onSubmit={onSubmit} className="space-y-4">
                    {/* 1. 利用規約・確認事項に同意 */}
                    <div className="flex items-center">
                      <input
                        id="agree"
                        name="agree"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        required
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                      />
                      <label htmlFor="agree" className="ml-2 block text-sm text-gray-900 font-caption">
                        利用規約・確認事項を読み、
                        <Dialog open={showTerms} onOpenChange={setShowTerms}>
                          <DialogTrigger asChild>
                            <Button variant="link" className="p-0 h-auto text-blue-600 text-sm font-caption">
                              こちら
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="font-heading">利用規約</DialogTitle>
                            </DialogHeader>
                            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap font-caption">
                              {termsOfUseText}
                            </div>
                          </DialogContent>
                        </Dialog>
                        に同意します
                      </label>
                    </div>
                    {/* 2. 申込年月日 */}
                    <div>
                      <Label htmlFor="applicationDate" className="block text-sm font-caption font-medium text-gray-700">
                        申込年月日
                      </Label>
                      <Input
                        type="date"
                        id="applicationDate"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        value={applicationDate}
                        onChange={(e) => setApplicationDate(e.target.value)}
                      />
                    </div>
                    {/* 3. 住所 */}
                    <div>
                      <Label htmlFor="postalCode" className="block text-sm font-caption font-medium text-gray-700">
                        郵便番号
                      </Label>
                      <Input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例: 123-4567"
                        maxLength={8}
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        onBlur={handlePostalCodeChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="prefecture" className="block text-sm font-caption font-medium text-gray-700">
                        住所（都道府県）
                      </Label>
                      <Input
                        type="text"
                        id="prefecture"
                        name="prefecture"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例: 東京都"
                        required
                        value={prefecture}
                        onChange={(e) => setPrefecture(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="block text-sm font-caption font-medium text-gray-700">
                        住所（市区町村）
                      </Label>
                      <Input
                        type="text"
                        id="city"
                        name="city"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例: 渋谷区"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="street" className="block text-sm font-caption font-medium text-gray-700">
                        住所（番地）
                      </Label>
                      <Input
                        type="text"
                        id="street"
                        name="street"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例: 1-1-1"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="building" className="block text-sm font-caption font-medium text-gray-700">
                        住所（マンション名・部屋番号など）
                      </Label>
                      <Input
                        type="text"
                        id="building"
                        name="building"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例: 〇〇マンション101号室 (任意)"
                        value={building}
                        onChange={(e) => setBuilding(e.target.value)}
                      />
                    </div>
                    {/* 4. 名前(フルネーム) */}
                    <div>
                      <Label htmlFor="fullName" className="block text-sm font-caption font-medium text-gray-700">
                        お名前 (フルネーム)
                      </Label>
                      <Input
                        type="text"
                        id="fullName"
                        name="fullName"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="田中 太郎"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    {/* 5. Emailアドレス(連絡先) */}
                    <div>
                      <Label htmlFor="email" className="block text-sm font-caption font-medium text-gray-700">
                        Emailアドレス (連絡先)
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="your@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {/* 6. 携帯電話番号(緊急時連絡先) */}
                    <div>
                      <Label htmlFor="phoneNumber" className="block text-sm font-caption font-medium text-gray-700">
                        携帯電話番号 (緊急時連絡先)
                      </Label>
                      <Input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="090-1234-5678"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    {/* 7. 今治市在住の有無 */}
                    <div>
                      <Label htmlFor="imabariResidency" className="block text-sm font-caption font-medium text-gray-700">
                        今治市内の居住歴
                      </Label>
                      <Select onValueChange={setSelectedImabariResidency} value={selectedImabariResidency} required>
                        <SelectTrigger
                          id="imabariResidency"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 [&>svg]:!hidden justify-start"
                        >
                          <SelectValue placeholder="選択してください" className="text-left" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ImabariResidency.LessThan1Year}>1年未満</SelectItem>
                          <SelectItem value={ImabariResidency.OneToThreeYears}>1年以上3年未満</SelectItem>
                          <SelectItem value={ImabariResidency.ThreeToFiveYears}>3年以上5年未満</SelectItem>
                          <SelectItem value={ImabariResidency.MoreThan5Years}>5年以上</SelectItem>
                          <SelectItem value={ImabariResidency.NotInImabari}>今治市内には住んでいない</SelectItem>
                        </SelectContent>
                      </Select>
                      <input type="hidden" name="imabariResidency" value={selectedImabariResidency} />
                    </div>
                    {/* 8. ワンちゃんのお名前 */}
                    <div>
                      <Label htmlFor="dogName" className="block text-sm font-caption font-medium text-gray-700">
                        ワンちゃんのお名前
                      </Label>
                      <Input
                        type="text"
                        id="dogName"
                        name="dogName"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ポチ"
                        required
                        value={dogName}
                        onChange={(e) => setDogName(e.target.value)}
                      />
                    </div>
                    {/* 9. 犬種 */}
                    <div>
                      <Label htmlFor="dogBreed" className="block text-sm font-caption font-medium text-gray-700">
                        犬種
                      </Label>
                      <Select onValueChange={setDogBreed} value={dogBreed} required>
                        <SelectTrigger
                          id="dogBreed"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 [&>svg]:!hidden justify-start"
                        >
                          <SelectValue placeholder="犬種を選ぶ" className="text-left" />
                        </SelectTrigger>
                        <SelectContent>
                          {dogBreeds.map((breed) => (
                            <SelectItem key={breed} value={breed}>
                              {breed}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input type="hidden" name="dogBreed" value={dogBreed} />
                      {dogBreed === "その他" && (
                        <Input
                          type="text"
                          id="otherDogBreed"
                          className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="犬種を入力してください"
                          value={dogBreed === "その他" ? "" : dogBreed} // Clear input if 'その他' is selected
                          onChange={(e) => setDogBreed(e.target.value)}
                          required
                        />
                      )}
                    </div>
                    {/* New Dog Gender Field */}
                    <div>
                      <Label htmlFor="dogGender" className="block text-sm font-caption font-medium text-gray-700">
                        ワンちゃんの性別
                      </Label>
                      <Select onValueChange={setDogGender} value={dogGender}>
                        <SelectTrigger
                          id="dogGender"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 [&>svg]:!hidden justify-start"
                        >
                          <SelectValue placeholder="性別を選ぶ" className="text-left" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">オス</SelectItem>
                          <SelectItem value="female">メス</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* New Dog Age Field */}
                    <div>
                      <Label htmlFor="dogAge" className="block text-sm font-caption font-medium text-gray-700">
                        ワンちゃんが生まれた年
                      </Label>
                      <Select onValueChange={(value) => setDogAge(parseInt(value))} value={dogAge?.toString()}>
                        <SelectTrigger
                          id="dogAge"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 [&>svg]:!hidden justify-start"
                        >
                          <SelectValue placeholder="生まれた年を選ぶ" className="text-left" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 2100 - 1990 + 1 }, (_, i) => 1990 + i).map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* 10. ワンちゃんの体重 */}
                    <div>
                      <Label htmlFor="dogWeight" className="block text-sm font-caption font-medium text-gray-700">
                        ワンちゃんの体重 (kg)
                      </Label>
                      <Input
                        type="number"
                        id="dogWeight"
                        name="dogWeight"
                        step="0.1"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="8.5"
                        required
                        value={dogWeight}
                        onChange={(e) => setDogWeight(e.target.value)}
                      />
                    </div>
                    {/* 11. ワクチン接種証明書 */}
                    <div>
                      <Label
                        htmlFor="vaccinationCertificate"
                        className="block text-sm font-caption font-medium text-gray-700"
                      >
                        ワクチンの接種証明書 (ファイル添付) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="file"
                        id="vaccinationCertificate"
                        name="vaccinationCertificate"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => setVaccinationCertificateFile(e.target.files ? e.target.files[0] : null)}
                        required
                      />
                      {vaccinationCertificateFile && (
                        <p className="text-xs text-gray-500 mt-1">選択中のファイル: {vaccinationCertificateFile.name}</p>
                      )}
                    </div>
                    {/* 12. パスワード設定 */}
                    <div>
                      <Label htmlFor="password" className="block text-sm font-caption font-medium text-gray-700">
                        ログインパスワード
                      </Label>
                      <Input
                        type="password"
                        id="password"
                        name="password"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="block text-sm font-caption font-medium text-gray-700">
                      ログインパスワード (確認用)
                      </Label>
                      <Input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      {password !== confirmPassword && confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">パスワードが一致しません。</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full font-caption"
                      disabled={!isFormValid}
                    >
                      利用申請
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* その他の状態表示 */}
          {userStatus === UserStatus.RegistrationPending && (
            <div className="space-y-4">
              <h2 className="text-lg font-heading mb-4" style={{ color: "rgb(0, 8, 148)" }}>
                申請中です
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-caption">
                利用申請ありがとうございます。管理者の承認をお待ちください。
              </p>
              <Button 
                onClick={onCheckApplicationStatus}
                variant="outline"
                className="w-full font-caption"
              >
                申請状況を確認
              </Button>
              <Button onClick={handleLogout} className="w-full font-caption">
                ログアウト
              </Button>
            </div>
          )}

          {userStatus === UserStatus.LoggedIn && (
            <div className="space-y-4">
              <Button onClick={handleLogout} className="w-full font-caption">
                ログアウト
              </Button>
              <Button 
                onClick={() => window.open('/admin', '_blank')}
                variant="outline"
                className="w-full font-caption border-gray-400 text-gray-600 hover:bg-gray-50"
              >
                管理者ログイン
              </Button>
            </div>
          )}

          {userStatus === UserStatus.LoginForm && (
            <div className="space-y-6 mt-6">
              <Card className="border-asics-blue-100">
                <CardContent className="p-4">
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="loginEmail" className="block text-sm font-caption font-medium text-gray-700">
                        Emailアドレス
                      </Label>
                      <Input
                        type="email"
                        id="loginEmail"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="your@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="loginPassword" className="block text-sm font-caption font-medium text-gray-700">
                        パスワード
                      </Label>
                      <Input
                        type="password"
                        id="loginPassword"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    {loginError && <p className="text-red-500 text-sm font-caption">{loginError}</p>}
                    <Button type="submit" className="w-full font-caption">
                      ログイン
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setUserStatus(UserStatus.ForgotPasswordForm)}
                      variant="link"
                      className="w-full font-caption"
                    >
                      パスワードをお忘れですか？
                    </Button>
                  </form>
                  <div className="mt-4 text-left text-sm">
                    <Button onClick={handleDemoLogin} variant="outline" className="w-full font-caption">
                      デモで試す
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {userStatus === UserStatus.ForgotPasswordForm && (
            <div className="space-y-6 mt-6">
              <h2 className="text-lg font-heading mb-4" style={{ color: "rgb(0, 8, 148)" }}>
                パスワードをリセット
              </h2>
              <Card className="border-asics-blue-100">
                <CardContent className="p-4">
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="resetEmail" className="block text-sm font-caption font-medium text-gray-700">
                        登録済みのEmailアドレス
                      </Label>
                      <Input
                        type="email"
                        id="resetEmail"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="your@example.com"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full font-caption">
                      パスワードリセットリンクを送信
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setUserStatus(UserStatus.LoginForm)}
                      variant="link"
                      className="w-full font-caption"
                    >
                      ログインに戻る
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {userStatus === UserStatus.ForgotPasswordSent && (
            <div className="space-y-4">
              <h2 className="text-lg font-heading mb-4" style={{ color: "rgb(0, 8, 148)" }}>
                パスワードリセット
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-caption">
                パスワードリセットのリンクをメールで送信しました。メールを確認し、指示に従ってパスワードを再設定してください。
              </p>
              <Button onClick={() => setUserStatus((UserStatus as any).LoginForm)} className="w-full font-caption">
                ログインに戻る
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
