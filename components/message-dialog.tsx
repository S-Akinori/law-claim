"use client"

import { useState, useEffect } from "react"
import type { Message, MessageOption, MessageType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageOptionItem } from "@/components/message-option-item"
import { imagesApi } from "@/lib/supabase-client"
import { toast } from "sonner"
import { accountsApi } from "@/lib/supabase-client"

interface MessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: Message | null
  onSave: (message: Message) => void
  availableMessages: Message[]
}

export function MessageDialog({ open, onOpenChange, message, onSave, availableMessages }: MessageDialogProps) {
  const [formData, setFormData] = useState<Message>({
    id: "",
    title: "",
    content: "",
    message_type: "text",
    account_id: "",
    options: [],
  })
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<any[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(false)

  useEffect(() => {
    if (message) {
      setFormData({
        ...message,
        title: message.title || "",
        options: message.options || [],
      })
    } else {
      setFormData({
        id: "",
        title: "",
        content: "",
        message_type: "text",
        account_id: "",
        options: [],
      })
    }
    setError(null)
  }, [message, open])

  // 画像の読み込みと更新処理を追加
  const loadImages = async () => {
    setIsLoadingImages(true)
    try {
      // アカウントIDを取得
      const account = await accountsApi.getAccount()
      if (!account) {
        toast.error("アカウント情報の取得に失敗しました")
        return
      }

      // アカウントIDを指定して画像を取得
      const imagesData = await imagesApi.getImages(account.id)
      setImages(imagesData)
    } catch (error) {
      console.error("画像の取得に失敗しました", error)
      toast.error("画像の取得に失敗しました")
    } finally {
      setIsLoadingImages(false)
    }
  }

  // 画像リストを更新する関数を追加
  const refreshImages = async () => {
    await loadImages()
  }

  // useEffectの中で画像を読み込む処理を修正
  useEffect(() => {
    // ダイアログが開かれたときに画像を読み込む
    if (open) {
      loadImages()
    }
  }, [open])

  const handleChange = (field: keyof Message, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddOption = () => {
    const newOption: MessageOption = {
      id: `opt_${Date.now()}`,
      text: "",
      imageId: null,
    }

    setFormData((prev) => ({
      ...prev,
      options: [...(prev.options || []), newOption],
    }))
  }

  const handleUpdateOption = (index: number, option: MessageOption) => {
    const newOptions = [...(formData.options || [])]
    newOptions[index] = option

    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }))
  }

  const handleRemoveOption = (index: number) => {
    const newOptions = [...(formData.options || [])]
    newOptions.splice(index, 1)

    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }))
  }

  const handleSubmit = () => {
    // バリデーション
    if (!formData.title.trim()) {
      setError("メッセージタイトルを入力してください")
      return
    }

    if (!formData.content.trim()) {
      setError("メッセージ内容を入力してください")
      return
    }

    if (formData.message_type === "carousel" && (!formData.options || formData.options.length === 0)) {
      setError("カルーセルメッセージには少なくとも1つの選択肢が必要です")
      return
    }

    if (formData.message_type === "carousel") {
      // 選択肢のバリデーション
      for (const option of formData.options || []) {
        if (!option.text.trim()) {
          setError("すべての選択肢にテキストを入力してください")
          return
        }
      }
    }

    try {
      onSave(formData)
    } catch (error) {
      console.error("メッセージの保存に失敗しました", error)
      setError(error instanceof Error ? error.message : "メッセージの保存に失敗しました")
    }
  }

  // 自分自身を除く利用可能なメッセージリスト
  const nextMessageOptions = availableMessages.filter((m) => m.id !== formData.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{message ? "メッセージを編集" : "新しいメッセージを追加"}</DialogTitle>
          <DialogDescription>
            {message
              ? "既存のメッセージを編集します。"
              : "新しいメッセージを作成します。テキストメッセージまたはカルーセルメッセージを選択できます。"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">メッセージタイトル</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="メッセージのタイトルを入力してください"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message_type">メッセージタイプ</Label>
            <Select
              value={formData.message_type}
              onValueChange={(value) => handleChange("message_type", value as MessageType)}
            >
              <SelectTrigger id="message_type">
                <SelectValue placeholder="タイプを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">テキスト</SelectItem>
                <SelectItem value="carousel">カルーセル</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">メッセージ内容</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              placeholder="メッセージの内容を入力してください"
              rows={4}
            />
          </div>

          {formData.message_type === "carousel" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>カルーセル選択肢</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                  <Plus className="mr-2 h-4 w-4" />
                  選択肢を追加
                </Button>
              </div>

              {formData.options && formData.options.length > 0 ? (
                <div className="space-y-4">
                  {formData.options.map((option, index) => (
                    <MessageOptionItem
                      key={option.id}
                      option={option}
                      index={index}
                      onUpdate={handleUpdateOption}
                      onRemove={handleRemoveOption}
                      availableMessages={nextMessageOptions}
                      images={images}
                      isLoadingImages={isLoadingImages}
                      onRefreshImages={refreshImages}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">選択肢がありません</p>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                    <Plus className="mr-2 h-4 w-4" />
                    選択肢を追加
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

