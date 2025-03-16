import { createClient } from "@supabase/supabase-js"
import { Database } from "./supabase-types"

// 環境変数からSupabaseの設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Supabaseクライアントを作成（リフレッシュトークンを有効化）
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: "line-bot-admin-auth",
  },
})

export { createClient }

