import { createClient } from "@supabase/supabase-js"

// 環境変数からSupabaseの設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

/**
 * Supabaseのストレージバケットを設定する関数
 * この関数は管理者が初期設定時に実行する想定
 */
export async function setupStorage() {
  try {
    // サービスロールキーを使用したクライアントを作成（RLSをバイパス）
    // 注意: この関数は初期セットアップ時のみ使用し、通常の操作では使用しない
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // imagesバケットが存在するか確認
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

    if (bucketsError) {
      console.error("バケット一覧の取得に失敗しました", bucketsError)
      throw bucketsError
    }

    const imagesBucket = buckets?.find((bucket) => bucket.name === "images")

    // バケットが存在しない場合は作成
    if (!imagesBucket) {
      const { data, error } = await supabaseAdmin.storage.createBucket("images", {
        public: true, // 公開バケット
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      })

      if (error) {
        console.error("バケット作成エラー", error)
        throw error
      }

      console.log("imagesバケットを作成しました", data)
    } else {
      console.log("imagesバケットは既に存在します")
    }

    // 以下のポリシーを設定
    // 1. 公開読み取りポリシー - 誰でも画像を読み取れる
    const { error: publicReadPolicyError } = await supabaseAdmin.storage.from("images").createPolicy("public-read", {
      name: "public-read",
      definition: {
        statements: [
          {
            effect: "allow",
            action: "select",
            principal: "*",
          },
        ],
      },
    })

    if (publicReadPolicyError) {
      console.error("公開読み取りポリシー設定エラー", publicReadPolicyError)
    } else {
      console.log("公開読み取りポリシーを設定しました")
    }

    // 2. 認証済みユーザー書き込みポリシー - 認証済みユーザーは自分のフォルダに書き込める
    const { error: authInsertPolicyError } = await supabaseAdmin.storage.from("images").createPolicy("auth-insert", {
      name: "auth-insert",
      definition: {
        statements: [
          {
            effect: "allow",
            action: "insert",
            principal: "authenticated",
            condition: "storage.foldername(1) = auth.uid()::text",
          },
        ],
      },
    })

    if (authInsertPolicyError) {
      console.error("認証済みユーザー書き込みポリシー設定エラー", authInsertPolicyError)
    } else {
      console.log("認証済みユーザー書き込みポリシーを設定しました")
    }

    // 3. 認証済みユーザー更新ポリシー - 認証済みユーザーは自分のフォルダ内のファイルを更新できる
    const { error: authUpdatePolicyError } = await supabaseAdmin.storage.from("images").createPolicy("auth-update", {
      name: "auth-update",
      definition: {
        statements: [
          {
            effect: "allow",
            action: "update",
            principal: "authenticated",
            condition: "storage.foldername(1) = auth.uid()::text",
          },
        ],
      },
    })

    if (authUpdatePolicyError) {
      console.error("認証済みユーザー更新ポリシー設定エラー", authUpdatePolicyError)
    } else {
      console.log("認証済みユーザー更新ポリシーを設定しました")
    }

    // 4. 認証済みユーザー削除ポリシー - 認証済みユーザーは自分のフォルダ内のファイルを削除できる
    const { error: authDeletePolicyError } = await supabaseAdmin.storage.from("images").createPolicy("auth-delete", {
      name: "auth-delete",
      definition: {
        statements: [
          {
            effect: "allow",
            action: "delete",
            principal: "authenticated",
            condition: "storage.foldername(1) = auth.uid()::text",
          },
        ],
      },
    })

    if (authDeletePolicyError) {
      console.error("認証済みユーザー削除ポリシー設定エラー", authDeletePolicyError)
    } else {
      console.log("認証済みユーザー削除ポリシーを設定しました")
    }

    return { success: true }
  } catch (error) {
    console.error("ストレージ設定エラー", error)
    return { success: false, error }
  }
}

