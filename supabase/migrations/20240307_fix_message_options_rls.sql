-- message_optionsテーブルのRLSポリシーを修正

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "ユーザーは自分のメッセージに関連するオプションのみアクセス可能" ON message_options;

-- 新しいポリシーを作成
CREATE POLICY "ユーザーは自分のメッセージに関連するオプションのみアクセス可能" ON message_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = message_options.message_id
      AND messages.user_id = auth.uid()
    )
  );

-- message_optionsテーブルにインデックスを追加して、RLSポリシーのパフォーマンスを向上
CREATE INDEX IF NOT EXISTS message_options_message_id_idx ON message_options(message_id);

