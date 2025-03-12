import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import * as line from "@line/bot-sdk"
import { createTextMessage, createCarouselMessage } from "@/lib/line-utils"

// Supabaseクライアントを初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// LINE SDKの設定
const defaultLineConfig = {
  channelAccessToken: "",
  channelSecret: "",
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const signature = req.headers.get("x-line-signature") || ""

    // イベントの処理
    const events = body.events || []

    for (const event of events) {
      // ユーザーIDからアカウント情報を取得
      const userId = event.source.userId
      const accountInfo = await getAccountInfoByUserId(userId)

      if (!accountInfo) {
        console.error("アカウント情報が見つかりません", userId)
        continue
      }

      // LINE SDKの設定を更新
      const lineConfig = {
        ...defaultLineConfig,
        channelAccessToken: accountInfo.access_token,
        channelSecret: accountInfo.channel_secret,
      }

      // LINE SDKクライアントを初期化
      const client = new line.Client(lineConfig)

      // メッセージイベントの処理
      if (event.type === "message" && event.message.type === "text") {
        await handleMessageEvent(client, event, accountInfo.user_id)
      } else if (event.type === "postback") {
        await handlePostbackEvent(client, event, accountInfo.user_id)
      } else if (event.type === "follow") {
        await handleFollowEvent(client, event, accountInfo.user_id)
      }
    }

    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("LINE Webhook Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// ユーザーIDからアカウント情報を取得
async function getAccountInfoByUserId(userId: string) {
  // 実際の実装では、LINEユーザーIDとアカウントの紐付けテーブルを使用
  // ここではデモのため、最初のアカウントを返す
  const { data, error } = await supabase.from("accounts").select("*").limit(1).single()

  if (error) {
    console.error("アカウント情報の取得に失敗しました", error)
    return null
  }

  return data
}

// メッセージイベントの処理
async function handleMessageEvent(client: line.Client, event: any, userId: string) {
  const { replyToken, message } = event
  const { text } = message

  try {
    // 初期メッセージを取得
    const initialMessage = await getInitialMessage(userId)

    if (initialMessage && text.includes(initialMessage.content)) {
      // 初期メッセージに一致する場合、カルーセルメッセージを送信
      await handleInitialMessage(client, replyToken, userId)
    } else {
      // その他のメッセージを処理
      await handleTextMessage(client, replyToken, text, userId)
    }
  } catch (error) {
    console.error("メッセージイベントの処理に失敗しました", error)
    await client.replyMessage(
      replyToken,
      createTextMessage("申し訳ありません。メッセージの処理中にエラーが発生しました。"),
    )
  }
}

// ポストバックイベントの処理
async function handlePostbackEvent(client: line.Client, event: any, userId: string) {
  const { replyToken, postback } = event

  try {
    // ポストバックデータをパース
    const postbackData = JSON.parse(postback.data)
    const nextMessageId = postbackData.nextMessageId

    if (nextMessageId) {
      // 次のメッセージを取得
      const { data: message, error } = await supabase
        .from("messages")
        .select(`
          *,
          options:message_options(*)
        `)
        .eq("id", nextMessageId)
        .single()

      if (error) {
        console.error("次のメッセージの取得に失敗しました", error)
        await client.replyMessage(
          replyToken,
          createTextMessage("申し訳ありません。メッセージの処理中にエラーが発生しました。"),
        )
        return
      }

      // メッセージタイプに応じた処理
      if (message.type === "text") {
        await client.replyMessage(replyToken, createTextMessage(message.content))
      } else if (message.type === "carousel") {
        const carouselMessage = createCarouselMessage(
          {
            id: message.id,
            name: message.name,
            type: message.type,
            content: message.content,
            options: message.options.map((option: any) => ({
              id: option.id,
              title: option.title,
              description: option.description,
              imageUrl: option.image_url,
              nextMessageId: option.next_message_id,
            })),
          },
          message.content,
        )

        await client.replyMessage(replyToken, carouselMessage)
      }
    }
  } catch (error) {
    console.error("ポストバックイベントの処理に失敗しました", error)
    await client.replyMessage(
      replyToken,
      createTextMessage("申し訳ありません。メッセージの処理中にエラーが発生しました。"),
    )
  }
}

// フォローイベントの処理
async function handleFollowEvent(client: line.Client, event: any, userId: string) {
  const { replyToken } = event

  try {
    // 初期メッセージを取得
    const initialMessage = await getInitialMessage(userId)

    if (initialMessage) {
      await client.replyMessage(replyToken, createTextMessage(initialMessage.content))
    } else {
      await client.replyMessage(replyToken, createTextMessage("友だち追加ありがとうございます！"))
    }
  } catch (error) {
    console.error("フォローイベントの処理に失敗しました", error)
  }
}

// 初期メッセージを取得
async function getInitialMessage(userId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("user_id", userId)
    .eq("is_initial", true)
    .limit(1)
    .single()

  if (error) {
    console.error("初期メッセージの取得に失敗しました", error)
    return null
  }

  return data
}

// 初期メッセージの処理
async function handleInitialMessage(client: line.Client, replyToken: string, userId: string) {
  // カルーセルメッセージを取得
  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      *,
      options:message_options(*)
    `)
    .eq("user_id", userId)
    .eq("type", "carousel")
    .limit(1)

  if (error || messages.length === 0) {
    console.error("カルーセルメッセージの取得に失敗しました", error)
    await client.replyMessage(
      replyToken,
      createTextMessage("申し訳ありません。メッセージの処理中にエラーが発生しました。"),
    )
    return
  }

  const message = messages[0]

  // カルーセルメッセージを送信
  const carouselMessage = createCarouselMessage(
    {
      id: message.id,
      name: message.name,
      type: message.type,
      content: message.content,
      options: message.options.map((option: any) => ({
        id: option.id,
        title: option.title,
        description: option.description,
        imageUrl: option.image_url,
        nextMessageId: option.next_message_id,
      })),
    },
    message.content,
  )

  await client.replyMessage(replyToken, carouselMessage)
}

// テキストメッセージの処理
async function handleTextMessage(client: line.Client, replyToken: string, text: string, userId: string) {
  // テキストに一致するメッセージを検索
  const { data: messages, error } = await supabase.from("messages").select("*").eq("user_id", userId).eq("type", "text")

  if (error) {
    console.error("メッセージの取得に失敗しました", error)
    await client.replyMessage(
      replyToken,
      createTextMessage("申し訳ありません。メッセージの処理中にエラーが発生しました。"),
    )
    return
  }

  // テキストに一致するメッセージを探す
  const matchedMessage = messages.find((message) => text.includes(message.content) || message.content.includes(text))

  if (matchedMessage) {
    // 一致するメッセージが見つかった場合
    await client.replyMessage(replyToken, createTextMessage(matchedMessage.content))
  } else {
    // 一致するメッセージが見つからない場合
    const defaultMessage = "申し訳ありません。お問い合わせ内容に対応するメッセージが見つかりませんでした。"
    await client.replyMessage(replyToken, createTextMessage(defaultMessage))
  }
}

