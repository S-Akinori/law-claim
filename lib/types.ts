export type MessageType = "text" | "carousel"

// メッセージの基本インターフェース
export interface Message {
  id: string
  title: string // タイトルを追加
  content: string
  message_type: MessageType
  account_id: string
  options?: MessageOption[]
}

// メッセージオプション（カルーセル選択肢）
export interface MessageOption {
  id: string
  text: string // titleからtextに変更
  imageId?: string // imageUrlからimageIdに変更
  nextMessageId?: string // 次のメッセージへの参照
}

// 画像の型定義を修正
export interface ImageAsset {
  id: string
  name: string
  url: string
  account_id: string
  storage_path?: string
  createdAt: string
}

