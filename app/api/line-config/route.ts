import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Supabaseクライアントを初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// LINE設定を取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }

    const { data, error } = await supabase.from("accounts").select("*").eq("user_id", session.user.id).single()

    if (error) {
      return NextResponse.json({ error: "LINE設定の取得に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ config: data })
  } catch (error) {
    console.error("LINE設定の取得に失敗しました", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// LINE設定を更新
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }

    const body = await req.json()

    // バリデーション
    if (!body.name || !body.channel_id || !body.channel_secret || !body.access_token) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 })
    }

    // 既存の設定を確認
    const { data: existingConfig } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", session.user.id)
      .single()

    let result

    if (existingConfig) {
      // 更新
      const { data, error } = await supabase
        .from("accounts")
        .update({
          name: body.name,
          channel_id: body.channel_id,
          channel_secret: body.channel_secret,
          access_token: body.access_token,
          spreadsheet_id: body.spreadsheet_id,
          image_url: body.image_url,
        })
        .eq("id", existingConfig.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: "LINE設定の更新に失敗しました" }, { status: 500 })
      }

      result = data
    } else {
      // 新規作成
      const { data, error } = await supabase
        .from("accounts")
        .insert({
          user_id: session.user.id,
          name: body.name,
          channel_id: body.channel_id,
          channel_secret: body.channel_secret,
          access_token: body.access_token,
          spreadsheet_id: body.spreadsheet_id,
          image_url: body.image_url,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: "LINE設定の作成に失敗しました" }, { status: 500 })
      }

      result = data
    }

    return NextResponse.json({ config: result })
  } catch (error) {
    console.error("LINE設定の更新に失敗しました", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

