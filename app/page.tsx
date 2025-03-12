import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Supabase認証システム</h1>
          <p className="mt-2 text-gray-600">Supabaseを使用したユーザー認証システムのデモです。</p>
        </div>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/login">ログイン</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/register">新規登録</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

