-- optionsテーブルの外部キー制約を確認・修正

-- 既存の外部キー制約を確認
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'options_message_id_fkey' 
    AND table_name = 'options'
  ) THEN
    -- 外部キー制約が存在しない場合は追加
    ALTER TABLE options
    ADD CONSTRAINT options_message_id_fkey
    FOREIGN KEY (message_id)
    REFERENCES messages(id)
    ON DELETE CASCADE;
  END IF;
END
$$;

-- optionsテーブルにインデックスを追加
CREATE INDEX IF NOT EXISTS options_message_id_idx ON options(message_id);
CREATE INDEX IF NOT EXISTS options_account_id_idx ON options(account_id);
CREATE INDEX IF NOT EXISTS options_image_id_idx ON options(image_id);

-- messagesテーブルにインデックスを追加
CREATE INDEX IF NOT EXISTS messages_account_id_idx ON messages(account_id);
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);

