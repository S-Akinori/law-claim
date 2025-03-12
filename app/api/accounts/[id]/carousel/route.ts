import { NextResponse } from "next/server"

// アカウント別カルーセル項目一覧を取得
export async function GET(req, { params }) {
  try {
    const { id } = params

    // モックデータ
    const mockCarouselItems = {
      "1": [
        {
          id: "1",
          title: "通院中の方（東京）",
          description: "現在も通院されている方向けの慰謝料計算です。",
          buttonText: "通院中の方はこちら",
          action: "CALCULATE_ONGOING",
          imageUrl: "/placeholder.svg?height=100&width=200",
        },
        {
          id: "2",
          title: "通院終了の方（東京）",
          description: "すでに通院が終了している方向けの慰謝料計算です。",
          buttonText: "通院終了の方はこちら",
          action: "CALCULATE_COMPLETED",
          imageUrl: "/placeholder.svg?height=100&width=200",
        },
      ],
      "2": [
        {
          id: "1",
          title: "通院中の方（大阪）",
          description: "現在も通院されている方向けの慰謝料計算です。",
          buttonText: "通院中の方はこちら",
          action: "CALCULATE_ONGOING",
          imageUrl: "/placeholder.svg?height=100&width=200",
        },
        {
          id: "2",
          title: "通院終了の方（大阪）",
          description: "すでに通院が終了している方向けの慰謝料計算です。",
          buttonText: "通院終了の方はこちら",
          action: "CALCULATE_COMPLETED",
          imageUrl: "/placeholder.svg?height=100&width=200",
        },
      ],
    }

    return NextResponse.json({ carouselItems: mockCarouselItems[id] || [] })
  } catch (error) {
    console.error("Error fetching carousel items:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// 新しいカルーセル項目を作成
export async function POST(req, { params }) {
  try {
    const { id } = params
    const body = await req.json()

    // バリデーション
    if (!body.title || !body.buttonText || !body.action) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 })
    }

    // データベースに新しいカルーセル項目を保存
    const newItem = {
      id: Date.now().toString(),
      accountId: id,
      title: body.title,
      description: body.description || "",
      buttonText: body.buttonText,
      action: body.action,
      imageUrl: body.imageUrl || "/placeholder.svg?height=100&width=200",
    }

    return NextResponse.json({ carouselItem: newItem }, { status: 201 })
  } catch (error) {
    console.error("Error creating carousel item:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

