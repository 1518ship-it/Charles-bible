-- ==============================================================================
-- Charles' Bible - Supabase 유저 활동 및 달란트 요약 테이블/뷰 생성 SQL
-- ==============================================================================
-- [실행 방법]
-- 1. https://supabase.com/dashboard/project/ycljudckxqijyvyxrfak 접속
-- 2. 왼쪽 메뉴의 [SQL Editor] 클릭 -> [New query] 클릭
-- 3. 아래 쿼리를 전체 복사하여 붙여넣은 뒤 [Run (실행)] 버튼 클릭!
-- 4. 왼쪽 메뉴의 [Table Editor]를 누르면 'user_today_summary' 테이블(뷰)이 바로 나타납니다.
-- ==============================================================================

-- 1. [기존 테이블 보완] user_reading_state에 달란트/아이템/퀘스트 컬럼 안전 추가
ALTER TABLE IF EXISTS public.user_reading_state ADD COLUMN IF NOT EXISTS talents integer DEFAULT 0;
ALTER TABLE IF EXISTS public.user_reading_state ADD COLUMN IF NOT EXISTS equipped jsonb DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS public.user_reading_state ADD COLUMN IF NOT EXISTS inventory jsonb DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.user_reading_state ADD COLUMN IF NOT EXISTS quest_claims jsonb DEFAULT '{}'::jsonb;

-- 2. [오늘 활동 및 달란트 실시간 요약 뷰 생성]
-- Supabase Table Editor에서 'user_today_summary'를 누르면 별도 테이블로 바로 확인할 수 있습니다.
-- 자정(00:00 KST)이 지나면 오늘 읽은 장수가 한국 시간 기준으로 자동 0으로 리셋되어 언제나 정확합니다.
DROP VIEW IF EXISTS public.user_today_summary CASCADE;

CREATE OR REPLACE VIEW public.user_today_summary
WITH (security_invoker = true)
AS
SELECT 
  r.user_id AS user_id,
  COALESCE(m.name, r.user_id) AS name,
  COALESCE(m.cell, '미지정') AS cell,
  COALESCE(
    NULLIF(r.daily_counts ->> (CURRENT_DATE AT TIME ZONE 'Asia/Seoul')::text, '')::integer, 
    0
  ) AS today_read_chapters,
  COALESCE(
    r.talents,
    ((r.daily_counts -> '__talent_data__' ->> 'talents')::integer),
    0
  ) AS talents,
  COALESCE(r.streak_count, 0) AS streak_days,
  COALESCE(r.max_streak, 0) AS max_streak,
  COALESCE(r.charles_stage, 1) AS charles_stage,
  r.last_read_date AS last_read_date,
  r.updated_at AS last_synced_at
FROM public.user_reading_state r
LEFT JOIN public.members m ON r.user_id = m.id
ORDER BY today_read_chapters DESC, streak_days DESC, talents DESC;

-- 3. 조회 권한 부여 (Supabase Studio 대시보드 및 API 연동)
GRANT SELECT ON public.user_today_summary TO anon, authenticated, service_role;

-- 4. (선택사항) 물리적 누적 테이블이 필요한 경우를 위한 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_daily_summary (
  id text PRIMARY KEY, -- 'user_id_YYYY-MM-DD'
  user_id text NOT NULL,
  user_name text,
  cell text,
  date text NOT NULL, -- 'YYYY-MM-DD'
  today_read_chapters integer DEFAULT 0,
  talents integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  charles_stage integer DEFAULT 1,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_daily_summary ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_daily_summary' AND policyname = 'Enable all access for user_daily_summary'
  ) THEN
    CREATE POLICY "Enable all access for user_daily_summary" 
    ON public.user_daily_summary FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
