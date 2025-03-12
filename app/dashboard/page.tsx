"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, MessageSquare, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useSupabase()
  const [account, setAccount] = useState(null)
  const [stats, setStats] = useState({
    messageCount: 0,
    optionCount: 0,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    // 実際の実装ではAPIからユーザーのLINEアカウント情報を取得
    // ここではモックデータを使用
    const fetchAccount = async () => {
      // モックデータ
      const mockAccount = {
        id: "1",
        name: "交通事故慰謝料Bot",
        channelId: "1234567890",
        channelSecret: "abcdef1234567890",
        accessToken: "ABCDEFGhijklmnopqrstuvwxyz",
        spreadsheetId: "1a2b3c4d5e6f7g8h9i0j",
        imageUrl: "/placeholder.svg?height=100&width=100",
      }

      setAccount(mockAccount)

      // 統計情報も取得
      setStats({
        messageCount: 4,
        optionCount: 2,
      })
    }

    fetchAccount()
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (!user) {
    return null // useEffectでリダイレクトするため
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>

        {account ? (
          <>
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>LINEアカウント情報</CardTitle>
                <CardDescription>現在接続されているLINEアカウントの情報です</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md">
                    <Image
                      src={account.imageUrl || "/placeholder.svg"}
                      alt={`${account.name}のカスタム画像`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">{account.name}</h3>
                    <p className="text-sm text-muted-foreground">チャネルID: {account.channelId}</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/account">アカウント設定を編集</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">メッセージ数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.messageCount}</div>
                  <Button variant="ghost" size="sm" asChild className="mt-2 px-0">
                    <Link href="/dashboard/messages">メッセージを管理</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">選択肢数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.optionCount}</div>
                  <Button variant="ghost" size="sm" asChild className="mt-2 px-0">
                    <Link href="/dashboard/messages">選択肢を管理</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-2xl font-bold mt-8">クイックアクセス</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>LINEアカウント設定</CardTitle>
                  <CardDescription>LINEアカウントの基本設定</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-4">
                  <Button asChild>
                    <Link href="/dashboard/account">
                      <User className="mr-2 h-4 w-4" />
                      アカウント設定へ
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>メッセージ設定</CardTitle>
                  <CardDescription>会話フローとメッセージの設定</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-4">
                  <Button asChild>
                    <Link href="/dashboard/messages">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      メッセージ設定へ
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>システム設定</CardTitle>
                  <CardDescription>システム設定の変更</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-4">
                  <Button asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      設定へ
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>LINEアカウントが未設定です</CardTitle>
              <CardDescription>LINE Botを使用するには、LINEアカウント情報を設定してください。</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/account/setup">
                  <User className="mr-2 h-4 w-4" />
                  LINEアカウントを設定する
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

