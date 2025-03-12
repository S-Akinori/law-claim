-- LINE Bot管理システムのデータベーススキーマ

-- アカウントテーブル（LINEアカウント情報）
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  channel_secret TEXT NOT NULL,
  access_token TEXT NOT NULL,
  spreadsheet_id TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- アカウントへのRLS（Row Level Security）ポリシー
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ユーザーは自分のアカウントのみアクセス可能" ON accounts
  FOR ALL USING (auth.uid() = user_id);

-- メッセージテーブル
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'carousel')),
  content TEXT NOT NULL,
  is_initial BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- メッセージへのRLSポリシー
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ユーザーは自分のメッセージのみアクセス可能" ON messages
  FOR ALL USING (auth.uid() = user_id);

-- メッセージオプション（カルーセル選択肢）テーブル
CREATE TABLE message_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  next_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- メッセージオプションへのRLSポリシー
ALTER TABLE message_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ユー���ーは自分のメッセージに関連するオプションのみアクセス可能" ON message_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = message_options.message_id
      AND messages.user_id = auth.uid()
    )
  );

-- 画像テーブル
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT, -- ストレージパスを追加
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 画像へのRLSポリシー
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ユーザーは自分の画像のみアクセス可能" ON images
  FOR ALL USING (auth.uid() = user_id);

-- 更新日時を自動的に更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 更新日時トリガーの設定
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_options_updated_at
  BEFORE UPDATE ON message_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

