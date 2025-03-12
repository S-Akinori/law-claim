"use client"

import { useEffect, useState } from "react"
import { Plus, Trash } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function CarouselSettings({ accountId, accountName }) {
  // アカウントごとのカルーセルデータを取得
  const [carouselItems, setCarouselItems] = useState([])
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    buttonText: "",
    action: "",
    imageUrl: "/placeholder.svg?height=100&width=200",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 実際の実装ではAPIからデータを取得
    // ここではモックデータを使用
    const mockCarouselItems = {
      "1": [
        {
          id: "1",
          title: "通院中の方（東京）",
          description: "現在も通院されている方向けの慰謝料計算です。",
          buttonText: "通院中の方はこちら",
          action: "CALCULATE_ONGOING",
          imageUrl: "/placeholder.svg?height=100&width=200",
        },
        {
          id: "2",
          title: "通院終了の方（東京）",
          description: "すでに通院が終了している方向けの慰謝料計算です。",
          buttonText: "通院終了の方はこちら",
          action: "CALCULATE_COMPLETED",
          imageUrl: "/placeholder.svg?height=100&width=200",
        },
      ],
      "2": [
        {
          id: "1",
          title: "通院中の方（大阪）",
          description: "現在も通院されている方向けの慰謝料計算です。",
          buttonText: "通院中の方はこちら",
          action: "CALCULATE_ONGOING",
          imageUrl: "/placeholder.svg?height=100&width=200",
        },
        {
          id: "2",
          title: "通院終了の方（大阪）",
          description: "すでに通院が終了している方向けの慰謝料計算です。",
          buttonText: "通院終了の方はこちら",
          action: "CALCULATE_COMPLETED",
          imageUrl: "/placeholder.svg?height=100&width=200",
        },
      ],
    }

    setCarouselItems(mockCarouselItems[accountId] || [])
    setIsLoading(false)
  }, [accountId])

  const handleAddItem = () => {
    if (newItem.title && newItem.buttonText && newItem.action) {
      setCarouselItems([
        ...carouselItems,
        {
          id: Date.now().toString(),
          ...newItem,
        },
      ])
      setNewItem({
        title: "",
        description: "",
        buttonText: "",
        action: "",
        imageUrl: "/placeholder.svg?height=100&width=200",
      })
    }
  }

  const handleDeleteItem = (id) => {
    setCarouselItems(carouselItems.filter((item) => item.id !== id))
  }

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{accountName}のカルーセル設定</CardTitle>
        <CardDescription>
          「慰謝料計算をする」に応答するカルーセルメッセージの選択肢を設定します。
          このアカウント専用のカルーセル項目を作成できます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                placeholder="例: 通院中の方"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">説明文</Label>
              <Textarea
                id="description"
                placeholder="例: 現在も通院されている方向けの慰謝料計算です。"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="buttonText">ボタンテキスト</Label>
              <Input
                id="buttonText"
                placeholder="例: 通院中の方はこちら"
                value={newItem.buttonText}
                onChange={(e) => setNewItem({ ...newItem, buttonText: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="action">アクション識別子</Label>
              <Input
                id="action"
                placeholder="例: CALCULATE_ONGOING"
                value={newItem.action}
                onChange={(e) => setNewItem({ ...newItem, action: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUpload">カルーセル画像</Label>
              <Input id="imageUpload" type="file" />
            </div>
            <Button onClick={handleAddItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              カルーセル項目を追加
            </Button>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-medium">カルーセル項目一覧</h3>
          {carouselItems.length === 0 ? (
            <p className="text-muted-foreground">登録されているカルーセル項目はありません。</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {carouselItems.map((item) => (
                <div key={item.id} className="relative flex flex-col rounded-lg border p-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">削除</span>
                  </Button>
                  <div className="mb-2 h-32 w-full overflow-hidden rounded-md bg-muted">
                    <Image
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.title}
                      width={200}
                      height={100}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h4 className="mb-1 font-medium">{item.title}</h4>
                  <p className="mb-2 text-sm text-muted-foreground">{item.description}</p>
                  <div className="mt-auto">
                    <div className="rounded-md border p-2 text-center text-sm">{item.buttonText}</div>
                    <p className="mt-2 text-xs text-muted-foreground">アクション: {item.action}</p>
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

