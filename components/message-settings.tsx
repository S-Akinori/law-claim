"use client"

import { useEffect, useState } from "react"
import { Plus, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function MessageSettings({ accountId, accountName }) {
  // アカウントごとのメッセージデータを取得
  const [messages, setMessages] = useState([])
  const [newTrigger, setNewTrigger] = useState("")
  const [newResponse, setNewResponse] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 実際の実装ではAPIからデータを取得
    // ここではモックデータを使用
    const mockMessages = {
      "1": [
        {
          id: "1",
          trigger: "慰謝料計算をする",
          response: "東京事務所の慰謝料計算を行います。以下から該当する項目を選択してください。",
        },
        {
          id: "2",
          trigger: "こんにちは",
          response: "こんにちは！東京事務所です。交通事故の慰謝料について何かお手伝いできることはありますか？",
        },
      ],
      "2": [
        {
          id: "1",
          trigger: "慰謝料計算をする",
          response: "大阪事務所の慰謝料計算を行います。以下から該当する項目を選択してください。",
        },
        {
          id: "2",
          trigger: "こんにちは",
          response: "こんにちは！大阪事務所です。交通事故の慰謝料について何かお手伝いできることはありますか？",
        },
      ],
    }

    setMessages(mockMessages[accountId] || [])
    setIsLoading(false)
  }, [accountId])

  const handleAddMessage = () => {
    if (newTrigger && newResponse) {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          trigger: newTrigger,
          response: newResponse,
        },
      ])
      setNewTrigger("")
      setNewResponse("")
    }
  }

  const handleDeleteMessage = (id) => {
    setMessages(messages.filter((message) => message.id !== id))
  }

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{accountName}のメッセージ設定</CardTitle>
        <CardDescription>
          このアカウント用のメッセージを設定します。ユーザーが特定のキーワードを入力したときの応答を定義できます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="trigger">トリガーキーワード</Label>
              <Input
                id="trigger"
                placeholder="例: 慰謝料計算をする"
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="response">応答メッセージ</Label>
              <Textarea
                id="response"
                placeholder="例: 交通事故の慰謝料計算を行います。以下から該当する項目を選択してください。"
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleAddMessage} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              メッセージを追加
            </Button>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-medium">登録済みメッセージ一覧</h3>
          {messages.length === 0 ? (
            <p className="text-muted-foreground">登録されているメッセージはありません。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">トリガーキーワード</TableHead>
                  <TableHead>応答メッセージ</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="font-medium">{message.trigger}</TableCell>
                    <TableCell>{message.response}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteMessage(message.id)}>
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">削除</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

