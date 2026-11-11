/*
# 建立台東觀光遊客統計資料

1. 新增資料表
- `taitung_visitor_statistics`
- `id`: UUID 主鍵
- `month`: 統計月份，使用每月第一天表示
- `attraction_name`: 景點名稱
- `visitor_count`: 遊客人次
- `created_at`: 建立時間

2. 資料內容
- 匯入 2025 年 12 月與 2026 年 1 月的 21 個觀光景點統計。
- 總遊客人次以資料來源提供的總計列保留，方便核對原始報表。

3. 安全性
- 啟用 Row Level Security。
- 因為這是公開的觀光統計資料，允許匿名與已登入使用者讀取。
- 不開放前端寫入，避免統計資料被修改。

4. 重要說明
- `month` 與 `attraction_name` 組合唯一，避免同月份景點重複。
- 前端以月份排序與比較這些公開資料，不建立登入流程。
*/

CREATE TABLE IF NOT EXISTS public.taitung_visitor_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL,
  attraction_name text NOT NULL,
  visitor_count integer NOT NULL CHECK (visitor_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (month, attraction_name)
);

ALTER TABLE public.taitung_visitor_statistics ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.taitung_visitor_statistics TO anon, authenticated;

DROP POLICY IF EXISTS "公開讀取台東觀光統計" ON public.taitung_visitor_statistics;
CREATE POLICY "公開讀取台東觀光統計"
ON public.taitung_visitor_statistics
FOR SELECT
TO anon, authenticated
USING (true);

CREATE INDEX IF NOT EXISTS taitung_visitor_statistics_month_idx
ON public.taitung_visitor_statistics (month);

INSERT INTO public.taitung_visitor_statistics (month, attraction_name, visitor_count)
VALUES
  ('2025-12-01', '八仙洞遊憩區', 14389),
  ('2025-12-01', '三仙台遊憩區及周邊地區', 93653),
  ('2025-12-01', '東部海岸國家風景區及加路蘭休憩區', 185623),
  ('2025-12-01', '太麻里金針山', 1000),
  ('2025-12-01', '水陸生活研究館', 1445),
  ('2025-12-01', '卑南遺址公園', 31987),
  ('2025-12-01', '東管處都歷本部', 14885),
  ('2025-12-01', '知本森林遊樂區', 15320),
  ('2025-12-01', '知本溫泉', 60271),
  ('2025-12-01', '南湖初鹿地區', 120163),
  ('2025-12-01', '國立臺灣史前文化博物館', 8458),
  ('2025-12-01', '鹿野高臺及周邊地區', 84750),
  ('2025-12-01', '綠島遊憩區', 5139),
  ('2025-12-01', '蘭嶼', 1628),
  ('2025-12-01', '客家文化園區', 0),
  ('2025-12-01', '臺東森林公園', 84181),
  ('2025-12-01', '都蘭遊憩區及周邊地區', 146918),
  ('2025-12-01', '池上大坡池及周邊地區', 99732),
  ('2025-12-01', '關山小鎮地區', 94494),
  ('2025-12-01', '台東美術館', 11283),
  ('2025-12-01', '台東波浪屋', 50726),
  ('2025-12-01', '總遊客人次', 1126045),
  ('2026-01-01', '八仙洞遊憩區', 9595),
  ('2026-01-01', '三仙台遊憩區及周邊地區', 62722),
  ('2026-01-01', '東部海岸國家風景區及加路蘭休憩區', 51306),
  ('2026-01-01', '太麻里金針山', 1700),
  ('2026-01-01', '水陸生活研究館', 1718),
  ('2026-01-01', '卑南遺址公園', 21952),
  ('2026-01-01', '東管處都歷本部', 12917),
  ('2026-01-01', '知本森林遊樂區', 15175),
  ('2026-01-01', '知本溫泉', 53988),
  ('2026-01-01', '南湖初鹿地區', 55653),
  ('2026-01-01', '國立臺灣史前文化博物館', 10812),
  ('2026-01-01', '鹿野高臺及周邊地區', 68569),
  ('2026-01-01', '綠島遊憩區', 4411),
  ('2026-01-01', '蘭嶼', 1787),
  ('2026-01-01', '客家文化園區', 0),
  ('2026-01-01', '臺東森林公園', 13920),
  ('2026-01-01', '都蘭遊憩區及周邊地區', 95261),
  ('2026-01-01', '池上大坡池及周邊地區', 72317),
  ('2026-01-01', '關山小鎮地區', 99289),
  ('2026-01-01', '台東美術館', 8775),
  ('2026-01-01', '台東波浪屋', 51471),
  ('2026-01-01', '總遊客人次', 713338)
ON CONFLICT (month, attraction_name) DO UPDATE
SET visitor_count = EXCLUDED.visitor_count;