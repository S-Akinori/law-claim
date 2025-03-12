-- message_optionsテーブルの外部キー制約を確認・修正

-- 既存の外部キー制約を確認
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'message_options_message_id_fkey' 
    AND table_name = 'message_options'
  ) THEN
    -- 外部キー制約が存在しない場合は追加
    ALTER TABLE message_options
    ADD CONSTRAINT message_options_message_id_fkey
    FOREIGN KEY (message_id)
    REFERENCES messages(id)
    ON DELETE CASCADE;
  END IF;
END
$$;

-- message_optionsテーブルにインデックスを追加
CREATE INDEX IF NOT EXISTS message_options_message_id_idx ON message_options(message_id);

-- messagesテーブルにインデックスを追加
CREATE INDEX IF NOT EXISTS messages_account_id_idx ON messages(account_id);
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);

