"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { accountsApi } from "@/lib/supabase-client"
import { toast } from "sonner"
import { Copy } from "lucide-react"

export function LineBotConfig() {
  const [config, setConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true)
        const data = await accountsApi.getLineBotConfig()
        if (data) {
          setConfig(data)
        } else {
          // アカウント情報がない場合は空の設定を表示
          setConfig({
            webhookUrl: `${window.location.origin}/api/line-webhook`,
            channelSecret: "未設定",
            accessToken: "未設定",
          })
        }
      } catch (error) {
        console.error("LINE Bot設定の取得に失敗しました", error)
        toast.error("LINE Bot設定の取得に失敗しました")
      } finally {
        setIsLoading(false)
      }
    }

    loadConfig()
  }, [])

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success(`${label}をクリップボードにコピーしました`)
      },
      () => {
        toast.error("クリップボードへのコピーに失敗しました")
      },
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>LINE Bot設定</CardTitle>
          <CardDescription>LINE Developersで設定するための情報</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <p>読み込み中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>LINE Bot設定</CardTitle>
          <CardDescription>LINE Developersで設定するための情報</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">アカウント情報が設定されていません。</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>LINE Bot設定</CardTitle>
        <CardDescription>LINE Developersで設定するための情報</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Webhook URL</Label>
          <div className="flex items-center space-x-2">
            <Input value={config.webhookUrl} readOnly />
            <Button variant="outline" size="icon" onClick={() => handleCopy(config.webhookUrl, "Webhook URL")}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>チャネルシークレット</Label>
          <div className="flex items-center space-x-2">
            <Input value={config.channelSecret} readOnly />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(config.channelSecret, "チャネルシークレット")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>アクセストークン</Label>
          <div className="flex items-center space-x-2">
            <Input value={config.accessToken} readOnly />
            <Button variant="outline" size="icon" onClick={() => handleCopy(config.accessToken, "アクセストークン")}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-md bg-muted p-4">
          <h4 className="mb-2 font-medium">LINE Developersでの設定手順</h4>
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            <li>LINE Developersコンソールにログインします</li>
            <li>プロバイダーとチャネルを作成します</li>
            <li>「Messaging API設定」タブを開きます</li>
            <li>「Webhook URL」に上記のURLを設定します</li>
            <li>「Webhookの利用」をオンにします</li>
            <li>「応答メッセージ」をオフにします</li>
            <li>必要に応じて、「チャネルアクセストークン」を発行します</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

