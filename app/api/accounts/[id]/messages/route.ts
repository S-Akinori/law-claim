import { NextResponse } from "next/server"

// アカウント別メッセージ一覧を取得
export async function GET(req, { params }) {
  try {
    const { id } = params

    // モックデータ
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

    return NextResponse.json({ messages: mockMessages[id] || [] })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// 新しいメッセージを作成
export async function POST(req, { params }) {
  try {
    const { id } = params
    const body = await req.json()

    // バリデーション
    if (!body.trigger || !body.response) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 })
    }

    // データベースに新しいメッセージを保存
    const newMessage = {
      id: Date.now().toString(),
      accountId: id,
      trigger: body.trigger,
      response: body.response,
    }

    return NextResponse.json({ message: newMessage }, { status: 201 })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

