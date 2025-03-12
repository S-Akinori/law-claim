"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DashboardHeader } from "@/components/dashboard-header"

export default function NewAccountPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    channelId: "",
    channelSecret: "",
    accessToken: "",
    spreadsheetId: "",
    imageUrl: "/placeholder.svg?height=100&width=100",
  })

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // APIを呼び出してアカウントを作成
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // 成功したらアカウント一覧ページに戻る
        router.push("/")
        router.refresh()
      } else {
        // エラーハンドリング
        const data = await response.json()
        alert(`エラー: ${data.error || "アカウントの作成に失敗しました"}`)
      }
    } catch (error) {
      console.error("アカウント作成エラー:", error)
      alert("アカウントの作成中にエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">戻る</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">新規LINEアカウント登録</h2>
        </div>

        <Card className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>アカウント情報</CardTitle>
              <CardDescription>新しいLINE Botアカウントの情報を入力してください。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">アカウント名 *</Label>
                <Input id="name" placeholder="例: 東京事務所" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="channelId">チャネルID *</Label>
                <Input
                  id="channelId"
                  placeholder="LINE Developersで取得したチャネルID"
                  value={formData.channelId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="channelSecret">チャネルシークレット *</Label>
                <Input
                  id="channelSecret"
                  placeholder="LINE Developersで取得したチャネルシークレット"
                  value={formData.channelSecret}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accessToken">アクセストークン *</Label>
                <Input
                  id="accessToken"
                  placeholder="LINE Developersで取得したアクセストークン"
                  value={formData.accessToken}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="spreadsheetId">スプレッドシートID *</Label>
                <Input
                  id="spreadsheetId"
                  placeholder="データを保存するGoogleスプレッドシートのID"
                  value={formData.spreadsheetId}
                  onChange={handleChange}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  スプレッドシートのURLの「https://docs.google.com/spreadsheets/d/」の後ろの部分です
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="imageUpload">カスタム画像</Label>
                <Input id="imageUpload" type="file" />
                <p className="text-sm text-muted-foreground">
                  カルーセルメッセージで使用する画像をアップロードできます
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" asChild>
                <Link href="/">キャンセル</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "登録中..." : "アカウントを登録"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}

