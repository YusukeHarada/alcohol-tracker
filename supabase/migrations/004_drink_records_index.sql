-- RLS述語（user_id = auth.uid()）と date 絞り込みの両方に効くインデックス。
-- listByDate / listByRange / addDrinkRecord の再集計がすべてこれを使う。
create index if not exists drink_records_user_date_idx
  on drink_records (user_id, date);
