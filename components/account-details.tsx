"use client"

import { useState } from "react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AccountDetails({ account }) {
  const [formData, setFormData] = useState({
    name: account.name,
    channelId: account.channelId,
    channelSecret: account.channelSecret,
    accessToken: account.accessToken,
    spreadsheetId: account.spreadsheetId,
    imageUrl: account.imageUrl,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // APIを呼び出してアカウントを更新
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert("アカウント情報を更新しました")
      } else {
        // エラーハンドリング
        const data = await response.json()
        alert(`エラー: ${data.error || "アカウントの更新に失敗しました"}`)
      }
    } catch (error) {
      console.error("アカウント更新エラー:", error)
      alert("アカウントの更新中にエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
            <Label htmlFor="channelId">チャネルID *</Label>
            <Input id="channelId" value={formData.channelId} onChange={handleChange} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="channelSecret">チャネルシークレット *</Label>
            <Input id="channelSecret" value={formData.channelSecret} onChange={handleChange} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="accessToken">アクセストークン *</Label>
            <Input id="accessToken" value={formData.accessToken} onChange={handleChange} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="spreadsheetId">スプレッドシートID *</Label>
            <Input id="spreadsheetId" value={formData.spreadsheetId} onChange={handleChange} required />
            <p className="text-sm text-muted-foreground">
              スプレッドシートのURLの「https://docs.google.com/spreadsheets/d/」の後ろの部分です
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="imageUpload">カスタム画像</Label>
            <div className="flex items-center space-x-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-md">
                <Image
                  src={formData.imageUrl || "/placeholder.svg"}
                  alt={`${formData.name}のカスタム画像`}
                  fill
                  className="object-cover"
                />
              </div>
              <Input id="imageUpload" type="file" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "更新中..." : "変更を保存"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

