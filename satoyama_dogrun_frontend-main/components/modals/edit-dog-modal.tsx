"use client"

import type { FormEvent } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import type { DogProfile } from "@/lib/types"

interface EditDogModalProps {
  editingDogId: number | null
  setEditingDogId: (id: number | null) => void
  editedDogName: string
  setEditedDogName: (name: string) => void
  editedDogBreed: string
  setEditedDogBreed: (breed: string) => void
  editedDogWeight: string
  setEditedDogWeight: (weight: string) => void
  editedDogPersonality: string[]
  setEditedDogPersonality: (personality: string[]) => void
  loggedInUserDogs: DogProfile[]
  setLoggedInUserDogs: (dogs: DogProfile[]) => void
  handleSaveDogEdit: (e: FormEvent) => void
  handleCancelDogEdit: () => void
}

export function EditDogModal({
  editingDogId,
  setEditingDogId,
  editedDogName,
  setEditedDogName,
  editedDogBreed,
  setEditedDogBreed,
  editedDogWeight,
  setEditedDogWeight,
  editedDogPersonality,
  setEditedDogPersonality,
  loggedInUserDogs,
  setLoggedInUserDogs,
  handleSaveDogEdit,
  handleCancelDogEdit,
}: EditDogModalProps) {
  const dogBeingEdited = loggedInUserDogs.find((dog) => dog.id === editingDogId)

  if (!dogBeingEdited) return null

  return (
    <Dialog open={editingDogId !== null} onOpenChange={handleCancelDogEdit}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">愛犬情報を編集</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={handleCancelDogEdit}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <form onSubmit={handleSaveDogEdit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="editDogName" className="font-caption">
              愛犬のお名前
            </Label>
            <Input id="editDogName" value={editedDogName} onChange={(e) => setEditedDogName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="editDogBreed" className="font-caption">
              犬種
            </Label>
            <Input
              id="editDogBreed"
              value={editedDogBreed}
              onChange={(e) => setEditedDogBreed(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="editDogWeight" className="font-caption">
              体重 (kg)
            </Label>
            <Input
              id="editDogWeight"
              type="number"
              step="0.1"
              value={editedDogWeight}
              onChange={(e) => setEditedDogWeight(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="editDogPersonality" className="font-caption">
              性格 (カンマ区切りで複数入力可)
            </Label>
            <Input
              id="editDogPersonality"
              placeholder="例: 人懐っこい, 活発"
              value={editedDogPersonality.join(", ")}
              onChange={(e) =>
                setEditedDogPersonality(
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full text-white" style={{ backgroundColor: "rgb(0, 8, 148)" }}>
              保存する
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelDogEdit}
              className="w-full bg-transparent border-asics-blue-200"
              style={{ color: "rgb(0, 8, 148)" }}
            >
              キャンセル
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
