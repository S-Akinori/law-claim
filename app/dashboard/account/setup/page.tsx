"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { accountsApi } from "@/lib/supabase-client"
import { toast } from "@/hooks/use-toast"

export default function AccountSetupPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Supabaseを使用してアカウントを作成
      await accountsApi.upsertAccount(formData)

      toast({
        title: "設定完了",
        description: "LINEアカウント情報を登録しました",
      })

      // 成功したらダッシュボードに戻る
      router.push("/dashboard")
    } catch (error) {
      console.error("アカウント作成エラー:", error)
      toast({
        title: "エラー",
        description: "アカウントの作成中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">LINEアカウント初期設定</h1>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>アカウント情報</CardTitle>
            <CardDescription>LINE Botアカウントの情報を入力してください。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">アカウント名 *</Label>
              <Input
                id="name"
                placeholder="例: 交通事故慰謝料Bot"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">メールアドレス *</Label>
              <Input
                id="email"
                type="email"
                placeholder="例: info@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tel">電話番号</Label>
              <Input id="tel" placeholder="例: 03-1234-5678" value={formData.tel} onChange={handleChange} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="homepage_url">ホームページURL</Label>
              <Input
                id="homepage_url"
                placeholder="例: https://example.com"
                value={formData.homepage_url}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="line_channel_access_token">LINEチャネルアクセストークン *</Label>
              <Input
                id="line_channel_access_token"
                placeholder="LINE Developersで取得したアクセストークン"
                value={formData.line_channel_access_token}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="line_channel_secret">LINEチャネルシークレット *</Label>
              <Input
                id="line_channel_secret"
                placeholder="LINE Developersで取得したチャネルシークレット"
                value={formData.line_channel_secret}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="spreadsheet_id">スプレッドシートID</Label>
              <Input
                id="spreadsheet_id"
                placeholder="データを保存するGoogleスプレッドシートのID"
                value={formData.spreadsheet_id}
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground">
                スプレッドシートのURLの「https://docs.google.com/spreadsheets/d/」の後ろの部分です
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="icon_url">アイコン画像URL</Label>
              <Input id="icon_url" placeholder="画像のURL" value={formData.icon_url} onChange={handleChange} />
              <p className="text-sm text-muted-foreground">画像ギャラリーからアップロードした画像のURLを使用できます</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "設定中..." : "アカウントを設定"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

