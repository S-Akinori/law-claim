"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Trash, Upload } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { imagesApi, accountsApi } from "@/lib/supabase-client"
import { toast } from "sonner"

export default function ImagesPage() {
  const [images, setImages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [account, setAccount] = useState<any>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // アカウント情報を取得
        const accountData = await accountsApi.getAccount()
        setAccount(accountData)

        if (accountData) {
          // アカウントIDを指定して画像一覧を取得
          const imagesData = await imagesApi.getImages(accountData.id)
          setImages(imagesData)
        }
      } catch (error) {
        console.error("データの取得に失敗しました", error)
        toast.error("データの取得に失敗しました")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // handleUploadImage 関数内のエラーハンドリングを改善
  const handleUploadImage = async () => {
    if (!newImageFile || !account) {
      toast.error("画像ファイルを選択してください")
      return
    }

    try {
      setIsUploading(true)

      // ファイルサイズチェック（10MB以下）
      if (newImageFile.size > 10 * 1024 * 1024) {
        throw new Error("ファイルサイズは10MB以下にしてください")
      }

      // 画像ファイルタイプチェック
      if (!newImageFile.type.startsWith("image/")) {
        throw new Error("画像ファイルのみアップロード可能です")
      }

      // アカウントIDを指定して画像をアップロード
      try {
        const newImage = await imagesApi.uploadImage(newImageFile, null, account.id)

        // 画像リストを更新
        setImages([newImage, ...images])

        // フォームをリセット
        setNewImageFile(null)
        setNewImagePreview(null)
        setIsUploadDialogOpen(false)

        toast.success("画像をアップロードしました")
      } catch (uploadError) {
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

        toast.error(errorMessage)
      }
    } catch (error) {
      console.error("画像のアップロードに失敗しました", error)
      toast.error("画像のアップロードに失敗しました", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsUploading(false)
    }
  }

  // 画像削除前に使用状況をチェックする処理を追加
  const handleDeleteImage = async (id: string) => {
    try {
      // 画像情報を取得
      const image = images.find((img) => img.id === id)
      if (!image) return

      // 画像が使用されているかチェック
      const isUsed = await imagesApi.checkImageUsage(id, account.id)

      if (isUsed) {
        // 使用されている場合は警告
        if (
          !confirm(
            "この画像はメッセージオプションで使用されています。削除すると関連する選択肢の画像が表示されなくなります。本当に削除しますか？",
          )
        ) {
          return
        }
      } else {
        // 使用されていない場合は通常の確認
        if (!confirm("この画像を削除してもよろしいですか？")) {
          return
        }
      }

      setIsLoading(true)
      await imagesApi.deleteImage(id, account.id)
      setImages(images.filter((image) => image.id !== id))
      toast.success("画像を削除しました")
    } catch (error) {
      console.error("画像の削除に失敗しました", error)
      toast.error("画像の削除に失敗しました", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 画像の表示名を取得する関数
  const getImageDisplayName = (image: any) => {
    // nameプロパティがある場合はそれを使用
    if (image.name) return image.name

    // URLからファイル名を抽出
    try {
      const url = new URL(image.url)
      const pathParts = url.pathname.split("/")
      return pathParts[pathParts.length - 1] || `画像 ${image.id}`
    } catch (e) {
      return `画像 ${image.id}`
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="space-y-6 p-8">
        <h1 className="text-3xl font-bold">画像ギャラリー</h1>

        <Card>
          <CardHeader>
            <CardTitle>LINEアカウントが未設定です</CardTitle>
            <CardDescription>画像を管理するには、まずLINEアカウント情報を設定してください。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/account/setup">LINEアカウントを設定する</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">画像ギャラリー</h1>

      <Card>
        <CardHeader>
          <CardTitle>{account.name}の画像ギャラリー</CardTitle>
          <CardDescription>カルーセルメッセージなどで使用する画像を管理します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              画像をアップロード
            </Button>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">画像一覧</h3>
            {images.length === 0 ? (
              <p className="text-muted-foreground">登録されている画像はありません。</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {images.map((image) => (
                  <div key={image.id} className="relative flex flex-col rounded-lg border p-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={isLoading}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">削除</span>
                    </Button>
                    <div className="mb-2 h-40 w-full overflow-hidden rounded-md bg-muted">
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt={getImageDisplayName(image)}
                        width={300}
                        height={200}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h4 className="mb-1 font-medium">{getImageDisplayName(image)}</h4>
                    <p className="text-xs text-muted-foreground">
                      アップロード日: {new Date(image.created_at).toLocaleDateString("ja-JP")}
                    </p>
                    <div className="mt-2">
                      <Input readOnly value={image.url} className="text-xs" onClick={(e) => e.currentTarget.select()} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 画像アップロードダイアログ */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新しい画像をアップロード</DialogTitle>
            <DialogDescription>カルーセルメッセージなどで使用する画像をアップロードします。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="imageFile">画像ファイル</Label>
              <Input id="imageFile" type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
              <p className="text-xs text-muted-foreground">最大10MB、JPG、PNG、GIF形式</p>
            </div>
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
              {isUploading ? "アップロード中..." : "アップロード"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

