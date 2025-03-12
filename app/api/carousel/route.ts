import { NextResponse } from "next/server"

// カルーセル項目一覧を取得
export async function GET() {
  try {
    // データベースからカルーセル項目一覧を取得
    const carouselItems = [
      {
        id: "1",
        title: "通院中の方",
        description: "現在も通院されている方向けの慰謝料計算です。",
        buttonText: "通院中の方はこちら",
        action: "CALCULATE_ONGOING",
      },
      {
        id: "2",
        title: "通院終了の方",
        description: "すでに通院が終了している方向けの慰謝料計算です。",
        buttonText: "通院終了の方はこちら",
        action: "CALCULATE_COMPLETED",
      },
      {
        id: "3",
        title: "後遺障害がある方",
        description: "後遺障害が認定された方向けの慰謝料計算です。",
        buttonText: "後遺障害がある方はこちら",
        action: "CALCULATE_DISABILITY",
      },
    ]

    return NextResponse.json({ carouselItems })
  } catch (error) {
    console.error("Error fetching carousel items:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// 新しいカルーセル項目を作成
export async function POST(req) {
  try {
    const body = await req.json()

    // バリデーション
    if (!body.title || !body.buttonText || !body.action) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 })
    }

    // データベースに新しいカルーセル項目を保存
    const newItem = {
      id: Date.now().toString(),
      title: body.title,
      description: body.description || "",
      buttonText: body.buttonText,
      action: body.action,
    }

    return NextResponse.json({ carouselItem: newItem }, { status: 201 })
  } catch (error) {
    console.error("Error creating carousel item:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

