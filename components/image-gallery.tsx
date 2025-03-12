"use client"

import { useEffect, useState } from "react"
import { Trash, Upload } from "lucide-react"
import Image from "next/image"

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
  DialogTrigger,
} from "@/components/ui/dialog"

export function ImageGallery({ accountId, accountName }) {
  // アカウントごとの画像データを取得
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [newImageName, setNewImageName] = useState("")
  const [newImageFile, setNewImageFile] = useState(null)
  const [newImagePreview, setNewImagePreview] = useState(null)

  useEffect(() => {
    // 実際の実装ではAPIからデータを取得
    // ここではモックデータを使用
    const mockImages = {
      "1": [
        {
          id: "1",
          name: "東京事務所ロゴ",
          url: "/placeholder.svg?height=200&width=300",
          createdAt: "2023-05-15T10:30:00Z",
        },
        {
          id: "2",
          name: "通院中アイコン",
          url: "/placeholder.svg?height=200&width=300",
          createdAt: "2023-05-16T14:20:00Z",
        },
        {
          id: "3",
          name: "通院終了アイコン",
          url: "/placeholder.svg?height=200&width=300",
          createdAt: "2023-05-17T09:45:00Z",
        },
      ],
      "2": [
        {
          id: "1",
          name: "大阪事務所ロゴ",
          url: "/placeholder.svg?height=200&width=300",
          createdAt: "2023-06-10T11:15:00Z",
        },
        {
          id: "2",
          name: "通院中アイコン",
          url: "/placeholder.svg?height=200&width=300",
          createdAt: "2023-06-11T16:30:00Z",
        },
      ],
    }

    setImages(mockImages[accountId] || [])
    setIsLoading(false)
  }, [accountId])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadImage = () => {
    if (newImageName && newImageFile) {
      // 実際の実装ではAPIを呼び出して画像をアップロード
      // ここではモックデータを使用
      const newImage = {
        id: Date.now().toString(),
        name: newImageName,
        url: newImagePreview || "/placeholder.svg?height=200&width=300",
        createdAt: new Date().toISOString(),
      }

      setImages([...images, newImage])
      setNewImageName("")
      setNewImageFile(null)
      setNewImagePreview(null)
      setIsUploadDialogOpen(false)
    }
  }

  const handleDeleteImage = (id) => {
    setImages(images.filter((image) => image.id !== id))
  }

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{accountName}の画像ギャラリー</CardTitle>
        <CardDescription>
          このアカウント用の画像を管理します。カルーセルメッセージなどで使用する画像をアップロードできます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-end">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                画像をアップロード
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新しい画像をアップロード</DialogTitle>
                <DialogDescription>カルーセルメッセージなどで使用する画像をアップロードします。</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="imageName">画像名</Label>
                  <Input
                    id="imageName"
                    placeholder="例: 東京事務所ロゴ"
                    value={newImageName}
                    onChange={(e) => setNewImageName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="imageFile">画像ファイル</Label>
                  <Input id="imageFile" type="file" accept="image/*" onChange={handleFileChange} />
                </div>
                {newImagePreview && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium">プレビュー</p>
                    <div className="relative h-40 w-full overflow-hidden rounded-md bg-muted">
                      <Image
                        src={newImagePreview || "/placeholder.svg"}
                        alt="プレビュー"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleUploadImage} disabled={!newImageName || !newImageFile}>
                  アップロード
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">削除</span>
                  </Button>
                  <div className="mb-2 h-40 w-full overflow-hidden rounded-md bg-muted">
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={image.name}
                      width={300}
                      height={200}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h4 className="mb-1 font-medium">{image.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    アップロード日: {new Date(image.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                  <div className="mt-2">
                    <Input readOnly value={image.url} className="text-xs" onClick={(e) => e.target.select()} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

