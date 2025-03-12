import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Supabaseクライアントを初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// メッセージ一覧を取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        options:message_options(*)
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ error: "メッセージの取得に失敗しました" }, { status: 500 })
    }

    // データ形式を変換
    const messages = data.map((message) => ({
      id: message.id,
      name: message.name,
      type: message.type,
      content: message.content,
      isInitial: message.is_initial,
      options: message.options.map((option: any) => ({
        id: option.id,
        title: option.title,
        description: option.description,
        imageUrl: option.image_url,
        nextMessageId: option.next_message_id,
      })),
    }))

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("メッセージの取得に失敗しました", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// メッセージを作成
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }

    const body = await req.json()

    // バリデーション
    if (!body.name || !body.type || !body.content) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 })
    }

    // 初期メッセージの場合、既存の初期メッセージを確認
    if (body.isInitial) {
      const { data: existingInitial } = await supabase
        .from("messages")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("is_initial", true)
        .single()

      if (existingInitial) {
        // 既存の初期メッセージを更新
        await supabase.from("messages").update({ is_initial: false }).eq("id", existingInitial.id)
      }
    }

    // メッセージを作成
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        user_id: session.user.id,
        name: body.name,
        type: body.type,
        content: body.content,
        is_initial: body.isInitial || false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "メッセージの作成に失敗しました" }, { status: 500 })
    }

    // オプションがある場合は作成
    if (body.options && body.options.length > 0) {
      const options = body.options.map((option: any) => ({
        message_id: message.id,
        title: option.title,
        description: option.description || null,
        image_url: option.imageUrl || null,
        next_message_id: option.nextMessageId || null,
      }))

      const { error: optionsError } = await supabase.from("message_options").insert(options)

      if (optionsError) {
        return NextResponse.json({ error: "メッセージオプションの作成に失敗しました" }, { status: 500 })
      }
    }

    return NextResponse.json({
      message: {
        id: message.id,
        name: message.name,
        type: message.type,
        content: message.content,
        isInitial: message.is_initial,
        options: body.options || [],
      },
    })
  } catch (error) {
    console.error("メッセージの作成に失敗しました", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

