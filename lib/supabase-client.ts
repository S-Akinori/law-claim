import { supabase } from "@/lib/supabase"

// 現在のユーザーIDを取得する関数
async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) {
    throw new Error("認証情報の取得に失敗しました")
  }
  return data.session.user.id
}

// アカウント関連のAPI
export const accountsApi = {
  async getAccount() {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase.from("accounts").select("*").eq("user_id", userId).single()

    if (error) {
      throw new Error("アカウント情報の取得に失敗しました")
    }

    return data
  },

  async upsertAccount(accountData) {
    const userId = await getCurrentUserId()
    
    const { data, error } = await supabase.from("accounts").upsert({
      ...accountData,
      user_id: userId,
    })

    if (error) {
      throw new Error("アカウントの作成または更新に失敗しました")
    }

    return data
  },

  async getLineBotConfig() {
    try {
      // アカウント情報を取得
      const account = await this.getAccount()

      if (!account) {
        return null
      }

      // LINE Bot設定情報を返す
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""
      return {
        webhookUrl: `${appUrl}/api/line-webhook`,
        channelSecret: account.line_channel_secret,
        accessToken: account.line_channel_access_token,
      }
    } catch (error) {
      console.error("LINE Bot設定の取得に失敗しました", error)
      throw new Error("LINE Bot設定の取得に失敗しました")
    }
  },
}

// メッセージ関連のAPI
export const messagesApi = {
  async getMessages(accountId = '') {
    try {
      // アカウントIDが指定されていない場合は取得
      if (!accountId) {
        const account = await accountsApi.getAccount()
        if (!account) {
          throw new Error("アカウント情報の取得に失敗しました")
        }
        accountId = account.id
      }

      // 1. まずメッセージを取得
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("account_id", accountId)

      if (messagesError) {
        console.error("メッセージの取得に失敗しました", messagesError)
        throw new Error("メッセージの取得に失敗しました: " + messagesError.message)
      }

      // メッセージがない場合は空の配列を返す
      if (!messagesData || messagesData.length === 0) {
        return []
      }

      // 2. 次にメッセージIDの配列を作成
      const messageIds = messagesData.map((message) => message.id)

      // 3. メッセージオプションを取得
      const { data: optionsData, error: optionsError } = await supabase
        .from("options")
        .select("*")
        .in("message_id", messageIds)

      if (optionsError) {
        console.error("メッセージオプションの取得に失敗しました", optionsError)
        throw new Error("メッセージオプションの取得に失敗しました: " + optionsError.message)
      }

      // 4. 画像情報を取得
      const { data: imagesData, error: imagesError } = await supabase
        .from("images")
        .select("*")
        .eq("account_id", accountId)

      if (imagesError) {
        console.error("画像情報の取得に失敗しました", imagesError)
        // 画像情報の取得に失敗しても処理を続行
      }

      // 画像IDからURLへのマッピングを作成
      const imageMap: { [key: string]: string } = {}
      if (imagesData) {
        imagesData.forEach((image) => {
          imageMap[image.id] = image.url
        })
      }

      // 5. メッセージとオプションを結合
      const messages = messagesData.map((message) => {
        // このメッセージに関連するオプションをフィルタリング
        const messageOptions = optionsData ? optionsData.filter((option) => option.message_id === message.id) : []

        // 変換したオプションを含むメッセージオブジェクトを返す
        return {
          id: message.id,
          title: message.title,
          content: message.content,
          message_type: message.type,
          account_id: message.account_id,
          options: messageOptions.map((option) => ({
            id: option.id,
            text: option.text,
            imageId: option.image_id,
            imageUrl: option.image_id ? imageMap[option.image_id] : null, // フロントエンド用に画像URLも提供
            nextMessageId: option.next_message_id,
          })),
        }
      })

      return messages
    } catch (error) {
      console.error("メッセージの取得に失敗しました", error)
      throw error
    }
  },

  async createMessage(messageData) {
    try {
      // アカウント情報を取得
      const account = await accountsApi.getAccount()
      if (!account) {
        throw new Error("アカウント情報の取得に失敗しました")
      }

      // トランザクションを使用してメッセージとオプションを一度に保存
      // 1. メッセージを作成 - user_idフィールドを削除
      const { data: message, error: messageError } = await supabase
        .from("messages")
        .insert({
          account_id: account.id,
          title: messageData.title,
          type: messageData.message_type,
          content: messageData.content,
        })
        .select()
        .single()

      if (messageError) {
        console.error("メッセージの作成に失敗しました", messageError)
        throw new Error("メッセージの作成に失敗しました: " + messageError.message)
      }

      // 2. オプションがある場合は作成
      if (messageData.options && messageData.options.length > 0) {
        const options = messageData.options.map((option) => ({
          account_id: account.id,
          message_id: message.id,
          text: option.text,
          image_id: option.imageId || null,
          next_message_id: option.nextMessageId || null,
        }))

        const { error: optionsError } = await supabase.from("options").insert(options)

        if (optionsError) {
          console.error("メッセージオプションの作成に失敗しました", optionsError)
          throw new Error("メッセージオプションの作成に失敗しました: " + optionsError.message)
        }
      }

      // 作成したメッセージを返す
      return {
        id: message.id,
        title: message.title,
        content: message.content,
        message_type: message.type,
        account_id: message.account_id,
        options: messageData.options || [],
      }
    } catch (error) {
      console.error("メッセージの作成に失敗しました", error)
      throw error
    }
  },

  async updateMessage(id, messageData) {
    try {
      // アカウント情報を取得して、そのアカウントに属するメッセージのみを更新できるようにする
      const account = await accountsApi.getAccount()
      if (!account) {
        throw new Error("アカウント情報の取得に失敗しました")
      }

      // 1. メッセージを更新 - user_idの条件を削除し、account_idを使用
      const { data: message, error: messageError } = await supabase
        .from("messages")
        .update({
          title: messageData.title,
          type: messageData.message_type,
          content: messageData.content,
        })
        .eq("id", id)
        .eq("account_id", account.id) // user_idの代わりにaccount_idを使用
        .select()
        .single()

      if (messageError) {
        console.error("メッセージの更新に失敗しました", messageError)
        throw new Error("メッセージの更新に失敗しました: " + messageError.message)
      }

      // 2. 既存のオプションを削除
      const { error: deleteError } = await supabase.from("options").delete().eq("message_id", id)

      if (deleteError) {
        console.error("メッセージオプションの削除に失敗しました", deleteError)
        throw new Error("メッセージオプションの削除に失敗しました: " + deleteError.message)
      }

      // 3. オプションがある場合は作成
      if (messageData.options && messageData.options.length > 0) {
        const options = messageData.options.map((option) => ({
          account_id: account.id,
          message_id: id,
          text: option.text,
          image_id: option.imageId || null,
          next_message_id: option.nextMessageId || null,
        }))

        const { error: optionsError } = await supabase.from("options").insert(options)

        if (optionsError) {
          console.error("メッセージオプションの作成に失敗しました", optionsError)
          throw new Error("メッセージオプションの作成に失敗しました: " + optionsError.message)
        }
      }

      // 更新したメッセージを返す
      return {
        id: message.id,
        title: message.title,
        content: message.content,
        message_type: message.type,
        account_id: message.account_id,
        options: messageData.options || [],
      }
    } catch (error) {
      console.error("メッセージの更新に失敗しました", error)
      throw error
    }
  },

  async deleteMessage(id) {
    try {
      // アカウント情報を取得して、そのアカウントに属するメッセージのみを削除できるようにする
      const account = await accountsApi.getAccount()
      if (!account) {
        throw new Error("アカウント情報の取得に失敗しました")
      }

      // メッセージを削除（カスケード削除によりオプションも削除される）
      // user_idの条件を削除し、account_idを使用
      const { error } = await supabase.from("messages").delete().eq("id", id).eq("account_id", account.id)

      if (error) {
        console.error("メッセージの削除に失敗しました", error)
        throw new Error("メッセージの削除に失敗しました: " + error.message)
      }
    } catch (error) {
      console.error("メッセージの削除に失敗しました", error)
      throw error
    }
  },
}

// 画像関連のAPI
export const imagesApi = {
  async getImages(accountId = '') {
    if (!accountId) {
      const account = await accountsApi.getAccount()
      if (!account) {
        throw new Error("アカウント情報の取得に失敗しました")
      }
      accountId = account.id
    }

    const { data, error } = await supabase.from("images").select("*").eq("account_id", accountId)

    if (error) {
      throw new Error("画像の取得に失敗しました")
    }

    // nameフィールドがない場合、URLからファイル名を抽出して表示用の名前を追加
    return data.map((image) => ({
      ...image,
      // URLからファイル名を抽出して表示用の名前として使用
      name: image.url.split("/").pop() || `画像 ${image.id}`,
    }))
  },

  // 画像アップロード関数
  async uploadImage(file, name, accountId) {
    try {
      // アカウントIDが指定されていない場合は取得
      if (!accountId) {
        const account = await accountsApi.getAccount()
        if (!account) {
          throw new Error("アカウント情報の取得に失敗しました")
        }
        accountId = account.id
      }

      // 現在のユーザーIDを取得
      const userId = await getCurrentUserId()

      // ファイル名を生成
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      // 新しいパス構造: userId/accountId/fileName
      const filePath = `${userId}/${accountId}/${fileName}`

      // ファイルをバッファに変換
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // ユーザーIDフォルダとアカウントIDフォルダが存在するか確認し、なければ作成（空ファイルをアップロード）
      try {
        // ユーザーIDフォルダの確認
        const { data: userFolderExists, error: userFolderError } = await supabase.storage.from("images").list(userId)

        if (userFolderError) {
          // フォルダが存在しない場合はエラーになるため、作成を試みる
          await supabase.storage.from("images").upload(`${userId}/.keep`, new Uint8Array(0))
        } else if (!userFolderExists || userFolderExists.length === 0) {
          // フォルダは存在するが空の場合
          await supabase.storage.from("images").upload(`${userId}/.keep`, new Uint8Array(0))
        }

        // アカウントIDフォルダの確認
        const { data: accountFolderExists, error: accountFolderError } = await supabase.storage
          .from("images")
          .list(`${userId}/${accountId}`)

        if (accountFolderError) {
          // フォルダが存在しない場合はエラーになるため、作成を試みる
          await supabase.storage.from("images").upload(`${userId}/${accountId}/.keep`, new Uint8Array(0))
        } else if (!accountFolderExists || accountFolderExists.length === 0) {
          // フォルダは存在するが空の場合
          await supabase.storage.from("images").upload(`${userId}/${accountId}/.keep`, new Uint8Array(0))
        }
      } catch (folderError) {
        console.error("フォルダの確認/作成に失敗しました", folderError)
        // エラーがあっても続行を試みる
      }

      // Storageにアップロード
      const { error: uploadError } = await supabase.storage.from("images").upload(filePath, buffer, {
        contentType: file.type,
      })

      if (uploadError) {
        throw new Error("画像のアップロードに失敗しました: " + uploadError.message)
      }

      // 公開URLを取得
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath)

      // データベースに登録 - nameとstorage_pathフィールドを削除
      const { data, error } = await supabase
        .from("images")
        .insert({
          url: publicUrl,
          account_id: accountId,
          user_id: userId,
        })
        .select()
        .single()

      if (error) {
        throw new Error("画像情報の登録に失敗しました: " + error.message)
      }

      // 表示用の名前を追加
      return {
        ...data,
        name: file.name || publicUrl.split("/").pop() || `画像 ${data.id}`,
      }
    } catch (error) {
      console.error("画像のアップロードに失敗しました", error)
      throw error
    }
  },

  async deleteImage(id, accountId) {
    if (!accountId) {
      const account = await accountsApi.getAccount()
      if (!account) {
        throw new Error("アカウント情報の取得に失敗しました")
      }
      accountId = account.id
    }

    try {
      // 画像情報を取得
      const { data: image, error: getError } = await supabase
        .from("images")
        .select("url")
        .eq("id", id)
        .eq("account_id", accountId)
        .single()

      if (getError) {
        throw new Error("画像情報の取得に失敗しました: " + getError.message)
      }

      // URLからストレージのパスを抽出
      // 例: https://xxx.supabase.co/storage/v1/object/public/images/userId/accountId/fileName
      // から userId/accountId/fileName を抽出
      try {
        const url = new URL(image.url)
        const pathParts = url.pathname.split("/")
        // "public"の後の部分がバケット名とパス
        const publicIndex = pathParts.indexOf("public")
        if (publicIndex !== -1 && pathParts.length > publicIndex + 2) {
          const bucket = pathParts[publicIndex + 1] // バケット名（images）
          const storagePath = pathParts.slice(publicIndex + 2).join("/") // 実際のパス

          // ストレージから削除
          const { error: storageError } = await supabase.storage.from(bucket).remove([storagePath])
          if (storageError) {
            console.error("ストレージからの削除に失敗しました", storageError)
          }
        }
      } catch (urlError) {
        console.error("URLの解析に失敗しました", urlError)
        // URLの解析に失敗しても、データベースからの削除は続行
      }

      // データベースから削除
      const { error } = await supabase.from("images").delete().eq("id", id).eq("account_id", accountId)

      if (error) {
        throw new Error("画像の削除に失敗しました: " + error.message)
      }
    } catch (error) {
      console.error("画像の削除処理に失敗しました", error)
      throw error
    }
  },

  async checkImageUsage(imageId, accountId) {
    // 実装例: メッセージオプションで画像が使用されているかチェック
    if (!accountId) {
      const account = await accountsApi.getAccount()
      if (!account) {
        throw new Error("アカウント情報の取得に失敗しました")
      }
      accountId = account.id
    }

    const { data, error } = await supabase.from("options").select("id").eq("image_id", imageId).limit(1)

    if (error) {
      throw new Error("画像の使用状況の確認に失敗しました")
    }

    return data && data.length > 0
  },
}

