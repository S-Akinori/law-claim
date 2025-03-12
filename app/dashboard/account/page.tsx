"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { accountsApi, imagesApi } from "@/lib/supabase-client"
import { toast } from "@/hooks/use-toast"
import { LineBotConfig } from "@/components/line-bot-config"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ImageIcon } from "lucide-react"

export default function AccountPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    line_channel_access_token: "",
    line_channel_secret: "",
    spreadsheet_id: "",
    icon_url: "/placeholder.svg?height=100&width=100",
    homepage_url: "",
    email: "",
    tel: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [images, setImages] = useState<any[]>([])
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoadingImages, setIsLoadingImages] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // アカウント情報を取得
        const account = await accountsApi.getAccount()

        if (account) {
          setFormData({
            name: account.name || "",
            line_channel_access_token: account.line_channel_access_token || "",
            line_channel_secret: account.line_channel_secret || "",
            spreadsheet_id: account.spreadsheet_id || "",
            icon_url: account.icon_url || "/placeholder.svg?height=100&width=100",
            homepage_url: account.homepage_url || "",
            email: account.email || "",
            tel: account.tel || "",
          })
        }
      } catch (error) {
        console.error("アカウント情報の取得に失敗しました", error)
        toast({
          title: "エラー",
          description: "アカウント情報の取得に失敗しました",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const loadImages = async () => {
    try {
      setIsLoadingImages(true)
      const imagesData = await imagesApi.getImages()
      setImages(imagesData)
    } catch (error) {
      console.error("画像の取得に失敗しました", error)
      toast({
        title: "エラー",
        description: "画像の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoadingImages(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Supabaseを使用してアカウントを更新
      await accountsApi.upsertAccount(formData)

      toast({
        title: "保存完了",
        description: "アカウント情報を更新しました",
      })
    } catch (error) {
      console.error("アカウント更新エラー:", error)
      toast({
        title: "エラー",
        description: "アカウントの更新中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectImage = (url: string) => {
    setSelectedImage(url)
  }

  const handleConfirmImage = () => {
    if (selectedImage) {
      setFormData((prev) => ({
        ...prev,
        icon_url: selectedImage,
      }))
    }
    setIsImageDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">LINEアカウント設定</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>アカウント情報</CardTitle>
            <CardDescription>LINE Botアカウントの基本情報を管理します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">アカウント名 *</Label>
              <Input id="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">メールアドレス *</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tel">電話番号</Label>
              <Input id="tel" value={formData.tel} onChange={handleChange} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="homepage_url">ホームページURL</Label>
              <Input id="homepage_url" value={formData.homepage_url} onChange={handleChange} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="line_channel_access_token">LINEチャネルアクセストークン *</Label>
              <Input
                id="line_channel_access_token"
                value={formData.line_channel_access_token}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="line_channel_secret">LINEチャネルシークレット *</Label>
              <Input id="line_channel_secret" value={formData.line_channel_secret} onChange={handleChange} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="spreadsheet_id">スプレッドシートID</Label>
              <Input id="spreadsheet_id" value={formData.spreadsheet_id} onChange={handleChange} />
              <p className="text-sm text-muted-foreground">
                スプレッドシートのURLの「https://docs.google.com/spreadsheets/d/」の後ろの部分です
              </p>
            </div>

            <div className="grid gap-2">
              <Label>アイコン画像</Label>
              <div className="flex items-center space-x-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                  <Image
                    src={formData.icon_url || "/placeholder.svg"}
                    alt={`${formData.name}のアイコン画像`}
                    fill
                    className="object-cover"
                  />
                </div>
                <Dialog
                  open={isImageDialogOpen}
                  onOpenChange={(open) => {
                    setIsImageDialogOpen(open)
                    if (open) loadImages()
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" type="button">
                      <ImageIcon className="mr-2 h-4 w-4" />
                      画像を選択
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>画像を選択</DialogTitle>
                      <DialogDescription>アカウントに使用する画像を選択してください。</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-4 py-4 max-h-[400px] overflow-y-auto">
                      {isLoadingImages ? (
                        <p className="col-span-3 text-center py-4">画像を読み込み中...</p>
                      ) : images.length === 0 ? (
                        <p className="col-span-3 text-center py-4">
                          画像がありません。先に画像をアップロードしてください。
                        </p>
                      ) : (
                        images.map((image) => (
                          <div
                            key={image.id}
                            className={`relative h-32 overflow-hidden rounded-md border cursor-pointer transition-all ${
                              selectedImage === image.url ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => handleSelectImage(image.url)}
                          >
                            <Image
                              src={image.url || "/placeholder.svg"}
                              alt={image.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
                        キャンセル
                      </Button>
                      <Button onClick={handleConfirmImage} disabled={!selectedImage}>
                        選択
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Input
                id="icon_url"
                value={formData.icon_url}
                onChange={handleChange}
                placeholder="または画像URLを直接入力"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "更新中..." : "変更を保存"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <LineBotConfig />
    </div>
  )
}

