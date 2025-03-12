"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSettings } from "@/components/message-settings"
import { CarouselSettings } from "@/components/carousel-settings"
import { DashboardHeader } from "@/components/dashboard-header"
import { AccountDetails } from "@/components/account-details"

export default function AccountPage({ params }) {
  const router = useRouter()
  const { id } = params
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 実際の実装ではAPIからアカウント情報を取得
    // ここではモックデータを使用
    const mockAccounts = [
      {
        id: "1",
        name: "東京事務所",
        channelId: "1234567890",
        channelSecret: "abcdef1234567890",
        accessToken: "ABCDEFGhijklmnopqrstuvwxyz",
        spreadsheetId: "1a2b3c4d5e6f7g8h9i0j",
        imageUrl: "/placeholder.svg?height=100&width=100",
      },
      {
        id: "2",
        name: "大阪事務所",
        channelId: "0987654321",
        channelSecret: "zyxwvu9876543210",
        accessToken: "ZYXWVUtsrqponmlkjihgfedcba",
        spreadsheetId: "0j9i8h7g6f5e4d3c2b1a",
        imageUrl: "/placeholder.svg?height=100&width=100",
      },
    ]

    const foundAccount = mockAccounts.find((acc) => acc.id === id)
    if (foundAccount) {
      setAccount(foundAccount)
    } else {
      // アカウントが見つからない場合はホームに戻る
      router.push("/")
    }
    setLoading(false)
  }, [id, router])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">読み込み中...</div>
  }

  if (!account) {
    return <div className="flex min-h-screen items-center justify-center">アカウントが見つかりません</div>
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
          <h2 className="text-3xl font-bold tracking-tight">{account.name}の設定</h2>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">アカウント詳細</TabsTrigger>
            <TabsTrigger value="messages">メッセージ設定</TabsTrigger>
            <TabsTrigger value="carousel">カルーセル設定</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <AccountDetails account={account} />
          </TabsContent>
          <TabsContent value="messages" className="space-y-4">
            <MessageSettings accountId={account.id} />
          </TabsContent>
          <TabsContent value="carousel" className="space-y-4">
            <CarouselSettings accountId={account.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

