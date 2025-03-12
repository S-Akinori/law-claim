export interface Account {
  id: string
  name: string
  channelId: string
  channelSecret: string
  accessToken: string
  spreadsheetId: string
  imageUrl: string
}

// メッセージモデル
export interface Message {
  id: string
  accountId: string
  trigger: string
  response: string
}

// カルーセル項目モデル
export interface CarouselItem {
  id: string
  accountId: string
  title: string
  description: string
  buttonText: string
  action: string
  imageUrl: string
}

// データベース操作のためのクラス
export class Database {
  // アカウント操作
  static async getAccounts(): Promise<Account[]> {
    // 実際の実装ではデータベースからデータを取得
    return []
  }

  static async getAccount(id: string): Promise<Account | null> {
    // 実際の実装ではデータベースからデータを取得
    return null
  }

  static async createAccount(account: Omit<Account, "id">): Promise<Account> {
    // 実際の実装ではデータベースにデータを保存
    return {
      id: Date.now().toString(),
      ...account,
    }
  }

  static async updateAccount(id: string, account: Partial<Account>): Promise<Account | null> {
    // 実際の実装ではデータベースのデータを更新
    return null
  }

  static async deleteAccount(id: string): Promise<boolean> {
    // 実際の実装ではデータベースからデータを削除
    return true
  }

  // メッセージ操作
  static async getMessages(accountId: string): Promise<Message[]> {
    // 実際の実装ではデータベースからデータを取得
    return []
  }

  static async createMessage(message: Omit<Message, "id">): Promise<Message> {
    // 実際の実装ではデータベースにデータを保存
    return {
      id: Date.now().toString(),
      ...message,
    }
  }

  static async deleteMessage(id: string): Promise<boolean> {
    // 実際の実装ではデータベースからデータを削除
    return true
  }

  // カルーセル項目操作
  static async getCarouselItems(accountId: string): Promise<CarouselItem[]> {
    // 実際の実装ではデータベースからデータを取得
    return []
  }

  static async createCarouselItem(item: Omit<CarouselItem, "id">): Promise<CarouselItem> {
    // 実際の実装ではデータベースにデータを保存
    return {
      id: Date.now().toString(),
      ...item,
    }
  }

  static async deleteCarouselItem(id: string): Promise<boolean> {
    // 実際の実装ではデータベースからデータを削除
    return true
  }
}

