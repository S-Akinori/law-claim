"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Message, MessageOption } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash, ImageIcon, Upload, Loader2 } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { imagesApi } from "@/lib/supabase-client"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { accountsApi } from "@/lib/supabase-client"

interface MessageOptionItemProps {
  option: MessageOption
  index: number
  onUpdate: (index: number, option: MessageOption) => void
  onRemove: (index: number) => void
  availableMessages: Message[]
  images: any[]
  isLoadingImages: boolean
  onRefreshImages?: () => Promise<void>
}

export function MessageOptionItem({
  option,
  index,
  onUpdate,
  onRemove,
  availableMessages,
  images,
  isLoadingImages,
  onRefreshImages,
}: MessageOptionItemProps) {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(option.imageId || null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // 画像選択ダイアログを開く前に選択状態をリセット
  useEffect(() => {
    if (isImageDialogOpen) {
      // 現在の画像IDを設定
      setSelectedImageId(option.imageId || null)

      // 現在の画像URLを探す
      if (option.imageId) {
        const image = images.find((img) => img.id === option.imageId)
        if (image) {
          setSelectedImage(image.url)
        }
      }
    }
  }, [isImageDialogOpen, option.imageId, images])

  const handleChange = (field: keyof MessageOption, value: any) => {
    onUpdate(index, {
      ...option,
      [field]: value,
    })
  }

  const handleSelectImage = (imageId: string, imageUrl: string) => {
    setSelectedImageId(imageId)
    setSelectedImage(imageUrl)
  }

  const handleConfirmImage = () => {
    if (selectedImageId) {
      handleChange("imageId", selectedImageId)
    }
    setIsImageDialogOpen(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null)
    const file = e.target.files?.[0]
    if (file) {
      // ファイルサイズチェック（10MB以下）
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("ファイルサイズは10MB以下にしてください")
        return
      }

      // 画像ファイルタイプチェック
      if (!file.type.startsWith("image/")) {
        setUploadError("画像ファイルのみアップロード可能です")
        return
      }

      setNewImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // handleUploadImage 関数を修正
  const handleUploadImage = async () => {
    if (newImageFile) {
      try {
        setIsUploading(true)
        setUploadProgress(0)
        setUploadError(null)

        // ファイルサイズチェック（10MB以下）
        if (newImageFile.size > 10 * 1024 * 1024) {
          throw new Error("ファイルサイズは10MB以下にしてください")
        }

        // 画像ファイルタイプチェック
        if (!newImageFile.type.startsWith("image/")) {
          throw new Error("画像ファイルのみアップロード可能です")
        }

        // アップロード進捗をシミュレート（実際のAPIでは進捗取得が難しいため）
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const newProgress = prev + Math.random() * 10
            return newProgress >= 90 ? 90 : newProgress
          })
        }, 300)

        // アカウント情報を取得
        const account = await accountsApi.getAccount()
        if (!account) {
          throw new Error("アカウント情報の取得に失敗しました")
        }

        try {
          // アカウントIDを指定して画像をアップロード
          const newImage = await imagesApi.uploadImage(newImageFile, null, account.id)

          clearInterval(progressInterval)
          setUploadProgress(100)

          // アップロードした画像をオプションに設定
          handleChange("imageId", newImage.id)

          // 画像リストを更新
          if (onRefreshImages) {
            await onRefreshImages()
          }

          setNewImageFile(null)
          setNewImagePreview(null)
          setIsUploadDialogOpen(false)

          toast.success("画像をアップロードしました")
        } catch (uploadError) {
          clearInterval(progressInterval)
          console.error("画像のアップロードに失敗しました", uploadError)

          // エラーメッセージを詳細に表示
          let errorMessage = "画像のアップロードに失敗しました"
          if (uploadError instanceof Error) {
            errorMessage = uploadError.message

            // ストレージポリシーに関連するエラーの場合、より詳細なメッセージを表示
            if (errorMessage.includes("new row violates row-level security policy")) {
              errorMessage = "ストレージへのアクセス権限がありません。管理者に連絡してください。"
            } else if (errorMessage.includes("storage bucket not found")) {
              errorMessage = "ストレージバケットが見つかりません。管理者に連絡してください。"
            }
          }

          setUploadError(errorMessage)
          toast.error(errorMessage)
        }
      } catch (error) {
        console.error("画像のアップロードに失敗しました", error)
        setUploadError(error instanceof Error ? error.message : "画像のアップロードに失敗しました")
        toast.error("画像のアップロードに失敗しました", {
          description: error instanceof Error ? error.message : undefined,
        })
      } finally {
        setIsUploading(false)
      }
    }
  }

  // 現在の画像URLを取得
  const getCurrentImageUrl = () => {
    if (option.imageId) {
      const image = images.find((img) => img.id === option.imageId)
      return image ? image.url : "/placeholder.svg?height=100&width=200"
    }
    return "/placeholder.svg?height=100&width=200"
  }

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">選択肢 {index + 1}</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => onRemove(index)}>
            <Trash className="h-4 w-4" />
            <span className="sr-only">削除</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`option-text-${index}`}>テキスト</Label>
            <Input
              id={`option-text-${index}`}
              value={option.text}
              onChange={(e) => handleChange("text", e.target.value)}
              placeholder="例: 通院中の方"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`option-next-${index}`}>次のメッセージ</Label>
            <Select
              value={option.nextMessageId || ""}
              onValueChange={(value) => handleChange("nextMessageId", value === "none" ? null : value)}
            >
              <SelectTrigger id={`option-next-${index}`}>
                <SelectValue placeholder="次のメッセージを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">なし</SelectItem>
                {availableMessages.map((message) => (
                  <SelectItem key={message.id} value={message.id}>
                    {message.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>画像</Label>
          <div className="flex items-center space-x-4">
            <div className="relative h-20 w-32 overflow-hidden rounded-md border bg-muted">
              {option.imageId ? (
                <Image
                  src={getCurrentImageUrl() || "/placeholder.svg"}
                  alt={option.text || "選択肢画像"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8 opacity-50" />
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <Button variant="outline" size="sm" onClick={() => setIsImageDialogOpen(true)}>
                <ImageIcon className="mr-2 h-4 w-4" />
                ギャラリーから選択
              </Button>

              <Button variant="outline" size="sm" onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                新規アップロード
              </Button>
            </div>
          </div>
        </div>

        {option.imageId && (
          <div className="flex items-center justify-between mt-2">
            <Input
              id={`option-image-id-${index}`}
              value={option.imageId}
              readOnly
              className="text-xs font-mono"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => handleChange("imageId", "")}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )}

        {!option.imageId && (
          <div className="mt-2">
            <Badge variant="outline" className="text-muted-foreground">
              画像が設定されていません
            </Badge>
          </div>
        )}
      </CardContent>

      {/* 画像選択ダイアログ */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>画像を選択</DialogTitle>
            <DialogDescription>カルーセル選択肢に表示する画像を選択してください。</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4 max-h-[400px] overflow-y-auto">
            {isLoadingImages ? (
              <div className="col-span-3 flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">画像を読み込み中...</span>
              </div>
            ) : images.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-8 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">画像がありません。先に画像をアップロードしてください。</p>
                <Button
                  onClick={() => {
                    setIsImageDialogOpen(false)
                    setIsUploadDialogOpen(true)
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  画像をアップロード
                </Button>
              </div>
            ) : (
              <>
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`relative h-32 overflow-hidden rounded-md border cursor-pointer transition-all ${
                      selectedImageId === image.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleSelectImage(image.id, image.url)}
                  >
                    <Image src={image.url || "/placeholder.svg"} alt={image.name} fill className="object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                      <p className="text-xs text-white truncate">{image.name}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setIsImageDialogOpen(false)
                setIsUploadDialogOpen(true)
              }}
            >
              <Upload className="mr-2 h-4 w-4" />
              新規アップロード
            </Button>
            <div>
              <Button variant="outline" onClick={() => setIsImageDialogOpen(false)} className="mr-2">
                キャンセル
              </Button>
              <Button onClick={handleConfirmImage} disabled={!selectedImageId}>
                選択
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 画像アップロードダイアログ */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新しい画像をアップロード</DialogTitle>
            <DialogDescription>カルーセル選択肢に表示する画像をアップロードします。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor={`image-file-${index}`}>
                画像ファイル <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`image-file-${index}`}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">最大10MBまで、JPG、PNG、GIF形式</p>
            </div>

            {uploadError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{uploadError}</div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>アップロード中...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {newImagePreview && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">プレビュー</p>
                <div className="relative h-40 w-full overflow-hidden rounded-md bg-muted">
                  <Image src={newImagePreview || "/placeholder.svg"} alt="プレビュー" fill className="object-contain" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={isUploading}>
              キャンセル
            </Button>
            <Button onClick={handleUploadImage} disabled={!newImageFile || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  アップロード中...
                </>
              ) : (
                <>アップロード</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

