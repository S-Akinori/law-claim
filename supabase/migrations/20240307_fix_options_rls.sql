-- optionsテーブルのRLSポリシーを修正

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "ユーザーは自分のメッセージに関連するオプションのみアクセス可能" ON options;

-- 新しいポリシーを作成
CREATE POLICY "ユーザーは自分のメッセージに関連するオプションのみアクセス可能" ON options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = options.message_id
      AND messages.user_id = auth.uid()
    )
  );

-- optionsテーブルにインデックスを追加して、RLSポリシーのパフォーマンスを向上
CREATE INDEX IF NOT EXISTS options_message_id_idx ON options(message_id);

