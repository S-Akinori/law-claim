"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { useSupabase } from "@/components/supabase-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSettings } from "@/components/message-settings"
import { CarouselSettings } from "@/components/carousel-settings"
import { AccountDetails } from "@/components/account-details"
import { ImageGallery } from "@/components/image-gallery"

export default function AccountPage({ params }) {
  const router = useRouter()
  const { user, isLoading } = useSupabase()
  const { id } = params
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }

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
      // アカウントが見つからない場合はアカウント一覧に戻る
      router.push("/dashboard/accounts")
    }
    setLoading(false)
  }, [id, router, isLoading, user])

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!account) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/accounts">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">戻る</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{account.name}の設定</h1>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">アカウント詳細</TabsTrigger>
            <TabsTrigger value="messages">メッセージ設定</TabsTrigger>
            <TabsTrigger value="carousel">カルーセル設定</TabsTrigger>
            <TabsTrigger value="images">画像ギャラリー</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <AccountDetails account={account} />
          </TabsContent>
          <TabsContent value="messages" className="space-y-4">
            <MessageSettings accountId={account.id} accountName={account.name} />
          </TabsContent>
          <TabsContent value="carousel" className="space-y-4">
            <CarouselSettings accountId={account.id} accountName={account.name} />
          </TabsContent>
          <TabsContent value="images" className="space-y-4">
            <ImageGallery accountId={account.id} accountName={account.name} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

