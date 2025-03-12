"use client"

import { useState } from "react"
import { Plus, Settings, Trash } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// サンプルデータ
const initialAccounts = [
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

export function LineAccountList() {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState(null)

  const handleDeleteAccount = () => {
    setAccounts(accounts.filter((account) => account.id !== accountToDelete.id))
    setIsDeleteDialogOpen(false)
    setAccountToDelete(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/accounts/new">
            <Plus className="mr-2 h-4 w-4" />
            新規アカウント追加
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <div key={account.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{account.name}</h3>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/accounts/${account.id}`}>
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
            <div className="mt-2 flex items-center space-x-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-md">
                <Image
                  src={account.imageUrl || "/placeholder.svg"}
                  alt={`${account.name}のカスタム画像`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">チャネルID: {account.channelId}</p>
                <p className="text-sm text-muted-foreground">トークン: {account.accessToken.substring(0, 10)}...</p>
                <p className="text-sm text-muted-foreground">
                  スプレッドシートID: {account.spreadsheetId.substring(0, 8)}...
                </p>
              </div>
            </div>
          </div>
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
  )
}

