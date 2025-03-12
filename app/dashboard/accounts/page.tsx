"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Settings, Trash } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { useSupabase } from "@/components/supabase-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AccountsPage() {
  const router = useRouter()
  const { user, isLoading } = useSupabase()
  const [accounts, setAccounts] = useState([
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
  ])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }

    // 実際の実装ではAPIからアカウント一覧を取得
    // fetchAccounts()
  }, [user, isLoading, router])

  const handleDeleteAccount = () => {
    setAccounts(accounts.filter((account) => account.id !== accountToDelete.id))
    setIsDeleteDialogOpen(false)
    setAccountToDelete(null)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">LINEアカウント管理</h1>
          <Button asChild>
            <Link href="/dashboard/accounts/new">
              <Plus className="mr-2 h-4 w-4" />
              新規アカウント追加
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{account.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/accounts/${account.id}`}>
                        <Settings className="h-4 w-4" />
                        <span className="sr-only">設定</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setAccountToDelete(account)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">削除</span>
                    </Button>
                  </div>
                </div>
                <CardDescription>チャネルID: {account.channelId}</CardDescription>
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
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">トークン: {account.accessToken.substring(0, 10)}...</p>
                    <p className="text-sm text-muted-foreground">
                      スプレッドシートID: {account.spreadsheetId.substring(0, 8)}...
                    </p>
                    <Button variant="outline" size="sm" asChild className="mt-2">
                      <Link href={`/dashboard/accounts/${account.id}`}>詳細設定</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 削除確認ダイアログ */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>アカウント削除の確認</DialogTitle>
              <DialogDescription>
                {accountToDelete && `「${accountToDelete.name}」を削除してもよろしいですか？`}
                この操作は元に戻せません。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                キャンセル
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                削除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

