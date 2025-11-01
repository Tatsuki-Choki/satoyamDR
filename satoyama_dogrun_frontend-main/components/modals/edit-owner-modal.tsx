"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { ImabariResidency } from "@/lib/constants"
import type { OwnerProfile } from "@/lib/types"

interface EditOwnerModalProps {
  showEditOwnerModal: boolean
  setShowEditOwnerModal: (show: boolean) => void
  ownerProfile: OwnerProfile
  setOwnerProfile: (profile: OwnerProfile) => void
}

export function EditOwnerModal({
  showEditOwnerModal,
  setShowEditOwnerModal,
  ownerProfile,
  setOwnerProfile,
}: EditOwnerModalProps) {
  const handleSave = () => {
    // ここに保存ロジックを追加
    console.log("Owner profile saved:", ownerProfile)
    setShowEditOwnerModal(false)
  }

  return (
    <Dialog open={showEditOwnerModal} onOpenChange={setShowEditOwnerModal}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">飼い主プロフィールを編集</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => setShowEditOwnerModal(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* 住所 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right font-caption">
              住所
            </Label>
            <Input
              id="address"
              value={ownerProfile.address}
              onChange={(e) => setOwnerProfile({ ...ownerProfile, address: e.target.value })}
              className="col-span-3 font-caption"
            />
          </div>
          {/* 今治市内の居住歴 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imabariResidency" className="text-right font-caption">
              今治市内の居住歴
            </Label>
            <Select
              onValueChange={(value) =>
                setOwnerProfile({ ...ownerProfile, imabariResidency: value as ImabariResidency })
              }
              value={ownerProfile.imabariResidency}
            >
              <SelectTrigger id="imabariResidency" className="col-span-3 [&>svg]:!hidden justify-start">
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
          </div>
          {/* 名前(フルネーム) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right font-caption">
              お名前
            </Label>
            <Input
              id="fullName"
              value={ownerProfile.fullName}
              onChange={(e) => setOwnerProfile({ ...ownerProfile, fullName: e.target.value })}
              className="col-span-3 font-caption"
            />
          </div>
          {/* Emailアドレス */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right font-caption">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={ownerProfile.email}
              onChange={(e) => setOwnerProfile({ ...ownerProfile, email: e.target.value })}
              className="col-span-3 font-caption"
            />
          </div>
          {/* 携帯電話番号 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phoneNumber" className="text-right font-caption">
              携帯電話
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={ownerProfile.phoneNumber}
              onChange={(e) => setOwnerProfile({ ...ownerProfile, phoneNumber: e.target.value })}
              className="col-span-3 font-caption"
            />
          </div>
        </div>
        <Button onClick={handleSave} className="w-full text-white" style={{ backgroundColor: "rgb(0, 8, 148)" }}>
          保存
        </Button>
      </DialogContent>
    </Dialog>
  )
}
