"use client"

import type { FormEvent } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { NewDogRegistrationStatus } from "@/lib/constants"
import type { DogProfile } from "@/lib/types"

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

interface AddDogRegistrationModalProps {
  showAddDogModal: boolean
  setShowAddDogModal: (show: boolean) => void
  newDogRegistrationStatus: NewDogRegistrationStatus
  setNewDogRegistrationStatus: (status: NewDogRegistrationStatus) => void
  newDogName: string
  setNewDogName: (name: string) => void
  newDogBreed: string
  setNewDogBreed: (breed: string) => void
  newDogWeight: string
  setNewDogWeight: (weight: string) => void
  newDogPersonality: string[]
  setNewDogPersonality: (personality: string[]) => void
  newDogLastVaccinationDate: string
  setNewDogLastVaccinationDate: (date: string) => void
  newDogVaccinationCertificateFile: File | null
  setNewDogVaccinationCertificateFile: (file: File | null) => void
  setLoggedInUserDogs: (dogs: DogProfile[]) => void
  handleAddDogRegistrationSubmit: (e: FormEvent) => void
  handleApproveNewDog: () => void
}

export function AddDogRegistrationModal({
  showAddDogModal,
  setShowAddDogModal,
  newDogRegistrationStatus,
  setNewDogRegistrationStatus,
  newDogName,
  setNewDogName,
  newDogBreed,
  setNewDogBreed,
  newDogWeight,
  setNewDogWeight,
  newDogPersonality,
  setNewDogPersonality,
  newDogLastVaccinationDate,
  setNewDogLastVaccinationDate,
  newDogVaccinationCertificateFile,
  setNewDogVaccinationCertificateFile,
  setLoggedInUserDogs,
  handleAddDogRegistrationSubmit,
  handleApproveNewDog,
}: AddDogRegistrationModalProps) {
  return (
    <Dialog open={showAddDogModal} onOpenChange={setShowAddDogModal}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">新しい愛犬の登録申請</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => {
              setShowAddDogModal(false)
              setNewDogRegistrationStatus(NewDogRegistrationStatus.Initial) // Reset status on close
              setNewDogName("")
              setNewDogBreed("")
              setNewDogWeight("")
              setNewDogPersonality([])
              setNewDogLastVaccinationDate("")
              setNewDogVaccinationCertificateFile(null) // Clear the file input state
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        {newDogRegistrationStatus === NewDogRegistrationStatus.Initial && (
          <form onSubmit={handleAddDogRegistrationSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="newDogName" className="font-caption">
                愛犬のお名前 <span className="text-red-500">*</span>
              </Label>
              <Input id="newDogName" value={newDogName} onChange={(e) => setNewDogName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="newDogBreed" className="font-caption">
                犬種 <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={setNewDogBreed} value={newDogBreed} required>
                <SelectTrigger>
                  <SelectValue placeholder="犬種を選ぶ" />
                </SelectTrigger>
                <SelectContent>
                  {dogBreeds.map((breed) => (
                    <SelectItem key={breed} value={breed}>
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newDogBreed === "その他" && (
                <Input
                  id="otherDogBreed"
                  placeholder="犬種を入力してください"
                  value={newDogBreed === "その他" ? "" : newDogBreed} // Clear input if 'その他' is selected
                  onChange={(e) => setNewDogBreed(e.target.value)}
                  className="mt-2"
                  required
                />
              )}
            </div>
            <div>
              <Label htmlFor="newDogWeight" className="font-caption">
                体重 (kg) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newDogWeight"
                type="number"
                step="0.1"
                value={newDogWeight}
                onChange={(e) => setNewDogWeight(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="newDogPersonality" className="font-caption">
                性格 (カンマ区切りで複数入力可)
              </Label>
              <Input
                id="newDogPersonality"
                placeholder="例: 人懐っこい, 活発"
                value={newDogPersonality.join(", ")} // Display as comma-separated string
                onChange={(e) =>
                  setNewDogPersonality(
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                } // Parse back to array
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newDogVaccinationDate" className="font-caption">
                最終ワクチン接種日
              </Label>
              <Input
                id="newDogVaccinationDate"
                type="date"
                value={newDogLastVaccinationDate}
                onChange={(e) => setNewDogLastVaccinationDate(e.target.value)}
              />
            </div>
            {/* 新しい愛犬のワクチン接種証明書 */}
            <div>
              <Label
                htmlFor="newDogVaccinationCertificate"
                className="block text-sm font-caption font-medium text-gray-700"
              >
                ワクチン接種証明書 (ファイル添付) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="file"
                id="newDogVaccinationCertificate"
                accept=".pdf,.jpg,.jpeg,.png" // Accept common image and PDF formats
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => setNewDogVaccinationCertificateFile(e.target.files ? e.target.files[0] : null)}
                required
              />
              {newDogVaccinationCertificateFile && (
                <p className="text-xs text-gray-500 mt-1">選択中のファイル: {newDogVaccinationCertificateFile.name}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full text-white" style={{ backgroundColor: "rgb(0, 8, 148)" }}>
                申請を送信する
              </Button>
            </DialogFooter>
          </form>
        )}

        {newDogRegistrationStatus === NewDogRegistrationStatus.Pending && (
          <div className="text-center py-8">
            <h3 className="text-xl font-heading mb-4" style={{ color: "rgb(0, 8, 148)" }}>
              愛犬の登録申請を審査中
            </h3>
            <p className="text-sm text-gray-600 font-caption mb-6">
              新しい愛犬の登録申請を審査中です。承認までしばらくお待ちください。
            </p>
            <Button
              onClick={handleApproveNewDog}
              className="w-full text-white"
              style={{ backgroundColor: "rgb(0, 8, 148)" }}
            >
              承認する (デモ用)
            </Button>
          </div>
        )}

        {newDogRegistrationStatus === NewDogRegistrationStatus.Approved && (
          <div className="text-center py-8">
            <h3 className="text-xl font-heading mb-4" style={{ color: "rgb(0, 8, 148)" }}>
              愛犬の登録が完了しました！
            </h3>
            <p className="text-sm text-gray-600 font-caption mb-6">
              新しい愛犬のプロフィールがマイページに追加されました。
            </p>
            <Button
              onClick={() => {
                setShowAddDogModal(false)
                setNewDogRegistrationStatus(NewDogRegistrationStatus.Initial)
                setNewDogName("")
                setNewDogBreed("")
                setNewDogWeight("")
                setNewDogPersonality([])
                setNewDogLastVaccinationDate("")
                setNewDogVaccinationCertificateFile(null) // Clear the file input state
              }}
              className="w-full text-white"
              style={{ backgroundColor: "rgb(0, 8, 148)" }}
            >
              閉じる
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
