import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Supabaseクライアントを初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 画像一覧を取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("images")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "画像の取得に失敗しました" }, { status: 500 })
    }

    const images = data.map((image) => ({
      id: image.id,
      name: image.name,
      url: image.url,
      createdAt: image.created_at,
    }))

    return NextResponse.json({ images })
  } catch (error) {
    console.error("画像の取得に失敗しました", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// 画像をアップロード
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const name = formData.get("name") as string

    if (!file || !name) {
      return NextResponse.json({ error: "ファイルまたは名前が不足しています" }, { status: 400 })
    }

    // ファイル名を生成
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${session.user.id}/${fileName}`

    // ファイルをバッファに変換
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Storageにアップロード
    const { error: uploadError } = await supabase.storage.from("images").upload(filePath, buffer, {
      contentType: file.type,
    })

    if (uploadError) {
      return NextResponse.json({ error: "画像のアップロードに失敗しました" }, { status: 500 })
    }

    // 公開URLを取得
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath)

    // データベースに登録
    const { data, error } = await supabase
      .from("images")
      .insert({
        user_id: session.user.id,
        name: name,
        url: publicUrl,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "画像情報の登録に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({
      image: {
        id: data.id,
        name: data.name,
        url: data.url,
        createdAt: data.created_at,
      },
    })
  } catch (error) {
    console.error("画像のアップロードに失敗しました", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

