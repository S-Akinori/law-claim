import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Supabaseクライアントを初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// メッセージを取得
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }

    const { id } = params

    const { data: message, error } = await supabase
      .from("messages")
      .select(`
        *,
        options(*)
      `)
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: "メッセージの取得に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({
      message: {
        id: message.id,
        title: message.title, // nameからtitleに変更
        type: message.type,
        content: message.content,
        isInitial: message.is_initial,
        options: message.options.map((option: any) => ({
          id: option.id,
          text: option.text,
          imageId: option.image_id,
          nextMessageId: option.next_message_id,
        })),
      },
    })
  } catch (error) {
    console.error("メッセージの取得に失敗しました", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// メッセージを更新
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }

    const { id } = params
    const body = await req.json()

    // バリデーション
    if (!body.title || !body.type || !body.content) {
      // nameからtitleに変更
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 })
    }

    // メッセージの所有者を確認
    const { data: existingMessage, error: checkError } = await supabase
      .from("messages")
      .select("id")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single()

    if (checkError || !existingMessage) {
      return NextResponse.json({ error: "メッセージが見つかりません" }, { status: 404 })
    }

    // 初期メッセージの場合、既存の初期メッセージを確認
    if (body.isInitial) {
      const { data: existingInitial } = await supabase
        .from("messages")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("is_initial", true)
        .neq("id", id)
        .single()

      if (existingInitial) {
        // 既存の初期メッセージを更新
        await supabase.from("messages").update({ is_initial: false }).eq("id", existingInitial.id)
      }
    }

    // メッセージを更新
    const { error: updateError } = await supabase
      .from("messages")
      .update({
        title: body.title, // nameからtitleに変更
        type: body.type,
        content: body.content,
        is_initial: body.isInitial || false,
      })
      .eq("id", id)

    if (updateError) {
      return NextResponse.json({ error: "メッセージの更新に失敗しました" }, { status: 500 })
    }

    // 既存のオプションを削除
    const { error: deleteError } = await supabase.from("options").delete().eq("message_id", id)

    if (deleteError) {
      return NextResponse.json({ error: "メッセージオプションの削除に失敗しました" }, { status: 500 })
    }

    // オプションがある場合は作成
    if (body.options && body.options.length > 0) {
      // アカウント情報を取得
      const { data: account } = await supabase.from("messages").select("account_id").eq("id", id).single()

      if (!account) {
        return NextResponse.json({ error: "アカウント情報の取得に失敗しました" }, { status: 500 })
      }

      const options = body.options.map((option: any) => ({
        message_id: id,
        account_id: account.account_id,
        text: option.text,
        image_id: option.imageId || null,
        next_message_id: option.nextMessageId || null,
      }))

      const { error: optionsError } = await supabase.from("options").insert(options)

      if (optionsError) {
        return NextResponse.json({ error: "メッセージオプションの作成に失敗しました" }, { status: 500 })
      }
    }

    return NextResponse.json({
      message: {
        id,
        title: body.title, // nameからtitleに変更
        type: body.type,
        content: body.content,
        isInitial: body.isInitial,
        options: body.options || [],
      },
    })
  } catch (error) {
    console.error("メッセージの更新に失敗しました", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// メッセージを削除
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }

    const { id } = params

    // メッセージの所有者を確認
    const { data: existingMessage, error: checkError } = await supabase
      .from("messages")
      .select("id")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single()

    if (checkError || !existingMessage) {
      return NextResponse.json({ error: "メッセージが見つかりません" }, { status: 404 })
    }

    // メッセージを削除
    const { error } = await supabase.from("messages").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: "メッセージの削除に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("メッセージの削除に失敗しました", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

