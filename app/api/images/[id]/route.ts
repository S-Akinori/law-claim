import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Supabaseクライアントを初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 画像を削除
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }

    const { id } = params

    // 画像の所有者を確認
    const { data: image, error: checkError } = await supabase
      .from("images")
      .select("*")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single()

    if (checkError || !image) {
      return NextResponse.json({ error: "画像が見つかりません" }, { status: 404 })
    }

    // URLからパスを抽出
    const url = new URL(image.url)
    const pathMatch = url.pathname.match(/\/images\/([^?]+)/)
    if (pathMatch && pathMatch[1]) {
      // Storageから削除
      const { error: storageError } = await supabase.storage.from("images").remove([pathMatch[1]])

      if (storageError) {
        console.error("ストレージからの削除に失敗しました", storageError)
      }
    }

    // データベースから削除
    const { error } = await supabase.from("images").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: "画像の削除に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("画像の削除に失敗しました", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

