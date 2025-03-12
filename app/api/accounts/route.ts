import { NextResponse } from "next/server"

// アカウント一覧を取得
export async function GET() {
  try {
    // データベースからアカウント一覧を取得
    // 実際の実装ではデータベースクエリを行います
    const accounts = [
      {
        id: "1",
        name: "東京事務所",
        channelId: "1234567890",
        channelSecret: "abcdef1234567890",
        accessToken: "ABCDEFGhijklmnopqrstuvwxyz",
        spreadsheetId: "1a2b3c4d5e6f7g8h9i0j",
        imageUrl: "/placeholder.svg?height=100&width=100",
      },
      {
        id: "2",
        name: "大阪事務所",
        channelId: "0987654321",
        channelSecret: "zyxwvu9876543210",
        accessToken: "ZYXWVUtsrqponmlkjihgfedcba",
        spreadsheetId: "0j9i8h7g6f5e4d3c2b1a",
        imageUrl: "/placeholder.svg?height=100&width=100",
      },
    ]

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// 新しいアカウントを作成
export async function POST(req) {
  try {
    const body = await req.json()

    // バリデーション
    if (!body.name || !body.channelId || !body.channelSecret || !body.accessToken || !body.spreadsheetId) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 })
    }

    // データベースに新しいアカウントを保存
    const newAccount = {
      id: Date.now().toString(),
      name: body.name,
      channelId: body.channelId,
      channelSecret: body.channelSecret,
      accessToken: body.accessToken,
      spreadsheetId: body.spreadsheetId,
      imageUrl: body.imageUrl || "/placeholder.svg?height=100&width=100",
    }

    return NextResponse.json({ account: newAccount }, { status: 201 })
  } catch (error) {
    console.error("Error creating account:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

