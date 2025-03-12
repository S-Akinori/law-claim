"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash, Edit, MessageSquare } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Message } from "@/lib/types"
import { MessageDialog } from "@/components/message-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { messagesApi, accountsApi } from "@/lib/supabase-client"
import { toast } from "sonner"

export default function MessagesPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [account, setAccount] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // アカウント情報を取得
        const accountData = await accountsApi.getAccount()
        setAccount(accountData)

        if (accountData) {
          try {
            // アカウントIDを指定してメッセージ一覧を取得
            const messagesData = await messagesApi.getMessages(accountData.id)
            setMessages(messagesData)
          } catch (messageError) {
            console.error("メッセージの取得に失敗しました", messageError)
            toast.error(messageError instanceof Error ? messageError.message : "メッセージの取得に失敗しました")
          }
        }
      } catch (error) {
        console.error("データの取得に失敗しました", error)
        toast.error(error instanceof Error ? error.message : "データの取得に失敗しました")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleAddMessage = () => {
    setCurrentMessage(null)
    setIsDialogOpen(true)
  }

  const handleEditMessage = (message: Message) => {
    setCurrentMessage(message)
    setIsDialogOpen(true)
  }

  const handleDeleteMessage = async (id: string) => {
    if (confirm("このメッセージを削除してもよろしいですか？")) {
      try {
        setIsLoading(true)
        await messagesApi.deleteMessage(id)
        setMessages(messages.filter((message) => message.id !== id))
        toast.success("メッセージを削除しました")
      } catch (error) {
        console.error("メッセージの削除に失敗しました", error)
        toast.error("メッセージの削除に失敗しました", {
          description: error instanceof Error ? error.message : undefined,
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSaveMessage = async (message: Message) => {
    try {
      setIsLoading(true)

      if (currentMessage) {
        // 既存メッセージの更新
        try {
          const updatedMessage = await messagesApi.updateMessage(currentMessage.id, message)
          setMessages(messages.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)))
          toast.success("メッセージを更新しました")
          setIsDialogOpen(false)
        } catch (error) {
          console.error("メッセージの更新に失敗しました", error)

          // エラーメッセージを詳細に表示
          let errorMessage = "メッセージの更新に失敗しました"
          if (error instanceof Error) {
            errorMessage = error.message
          }

          toast.error(errorMessage)
        }
      } else {
        // 新規メッセージの追加
        try {
          const newMessage = await messagesApi.createMessage(message)
          setMessages([...messages, newMessage])
          toast.success("新しいメッセージを作成しました")
          setIsDialogOpen(false)
        } catch (error) {
          console.error("メッセージの作成に失敗しました", error)

          // エラーメッセージを詳細に表示
          let errorMessage = "メッセージの作成に失敗しました"
          if (error instanceof Error) {
            errorMessage = error.message
          }

          toast.error(errorMessage)
        }
      }
    } catch (error) {
      console.error("メッセージの保存に失敗しました", error)
      toast.error("メッセージの保存に失敗しました", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="space-y-6 p-8">
        <h1 className="text-3xl font-bold">メッセージ設定</h1>

        <Card>
          <CardHeader>
            <CardTitle>LINEアカウントが未設定です</CardTitle>
            <CardDescription>メッセージを設定するには、まずLINEアカウント情報を設定してください。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/account/setup">LINEアカウントを設定する</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">メッセージ設定</h1>
        <Button onClick={handleAddMessage} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          メッセージを追加
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{account.name}のメッセージ設定</CardTitle>
          <CardDescription>
            ユーザーとの会話フローを設定します。テキストメッセージやカルーセルメッセージを追加し、会話の流れを作成できます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">メッセージがありません</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-4">メッセージを追加して会話フローを作成しましょう</p>
              <Button onClick={handleAddMessage} disabled={isLoading}>
                <Plus className="mr-2 h-4 w-4" />
                メッセージを追加
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>タイプ</TableHead>
                  <TableHead>タイトル</TableHead>
                  <TableHead>内容</TableHead>
                  <TableHead>選択肢数</TableHead>
                  <TableHead className="w-[120px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <Badge variant={message.message_type === "text" ? "default" : "secondary"}>
                        {message.message_type === "text" ? "テキスト" : "カルーセル"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{message.title}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{message.content}</TableCell>
                    <TableCell>{message.options?.length || 0}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditMessage(message)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">編集</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMessage(message.id)}
                          disabled={isLoading}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">削除</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MessageDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        message={currentMessage}
        onSave={handleSaveMessage}
        availableMessages={messages}
      />
    </div>
  )
}

