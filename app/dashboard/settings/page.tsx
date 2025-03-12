"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const router = useRouter()
  const { user, isLoading } = useSupabase()
  const [settings, setSettings] = useState({
    webhookUrl: "https://example.com/api/line-webhook",
    notificationEmail: "",
    enableNotifications: true,
    enableLogging: true,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }

    // 実際の実装ではAPIから設定を取得
    if (user) {
      setSettings((prevSettings) => ({
        ...prevSettings,
        notificationEmail: user.email || "",
      }))
    }
  }, [user, isLoading, router, settings])

  const handleChange = (e) => {
    const { id, value } = e.target
    setSettings((prev) => ({ ...prev, [id]: value }))
  }

  const handleSwitchChange = (id, checked) => {
    setSettings((prev) => ({ ...prev, [id]: checked }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // 設定を保存する処理
    alert("設定を保存しました")
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
        <h1 className="text-3xl font-bold">設定</h1>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>システム設定</CardTitle>
              <CardDescription>システム全体の設定を行います。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={settings.webhookUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/api/line-webhook"
                />
                <p className="text-sm text-muted-foreground">LINE Developersに設定するWebhook URLです</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notificationEmail">通知用メールアドレス</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  value={settings.notificationEmail}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableNotifications">メール通知</Label>
                  <p className="text-sm text-muted-foreground">エラーや重要な情報をメールで通知します</p>
                </div>
                <Switch
                  id="enableNotifications"
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => handleSwitchChange("enableNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableLogging">ログ記録</Label>
                  <p className="text-sm text-muted-foreground">システムの動作ログを記録します</p>
                </div>
                <Switch
                  id="enableLogging"
                  checked={settings.enableLogging}
                  onCheckedChange={(checked) => handleSwitchChange("enableLogging", checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">設定を保存</Button>
            </CardFooter>
          </Card>
        </form>

        <Card>
          <CardHeader>
            <CardTitle>アカウント情報</CardTitle>
            <CardDescription>ログイン中のアカウント情報です。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-semibold">メールアドレス:</span> {user.email}
            </div>
            <div>
              <span className="font-semibold">ユーザーID:</span> {user.id}
            </div>
            <div>
              <span className="font-semibold">最終ログイン:</span>{" "}
              {new Date(user.last_sign_in_at || "").toLocaleString("ja-JP")}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

