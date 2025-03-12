import type { Message, MessageOption } from "@/lib/types"
import type * as line from "@line/bot-sdk"

// テキストメッセージを作成
export function createTextMessage(text: string): line.TextMessage {
  return {
    type: "text",
    text: text,
  }
}

// カルーセルメッセージを作成
export function createCarouselMessage(message: Message, altText = "選択してください"): line.TemplateMessage {
  const options = message.options || []

  // カルーセルの列を作成
  const columns: line.TemplateColumn[] = options.map((option: MessageOption) => {
    return {
      thumbnailImageUrl: option.imageUrl || undefined,
      title: option.title.substring(0, 40), // LINE APIの制限に合わせて40文字に制限
      text: option.description ? option.description.substring(0, 60) : " ", // 60文字に制限
      actions: [
        {
          type: "postback",
          label: option.title.substring(0, 20), // 20文字に制限
          data: JSON.stringify({
            nextMessageId: option.nextMessageId,
          }),
          displayText: option.title,
        },
      ],
    }
  })

  return {
    type: "template",
    altText: altText,
    template: {
      type: "carousel",
      columns: columns,
    },
  }
}

// 確認メッセージを作成
export function createConfirmMessage(
  text: string,
  yesText = "はい",
  noText = "いいえ",
  yesData = "yes",
  noData = "no",
): line.TemplateMessage {
  return {
    type: "template",
    altText: text,
    template: {
      type: "confirm",
      text: text,
      actions: [
        {
          type: "postback",
          label: yesText,
          data: yesData,
          displayText: yesText,
        },
        {
          type: "postback",
          label: noText,
          data: noData,
          displayText: noText,
        },
      ],
    },
  }
}

// 画像メッセージを作成
export function createImageMessage(originalUrl: string, previewUrl: string = originalUrl): line.ImageMessage {
  return {
    type: "image",
    originalContentUrl: originalUrl,
    previewImageUrl: previewUrl,
  }
}

