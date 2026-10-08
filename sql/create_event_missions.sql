-- ========================================================
-- Charles' Bible - 가을 특별 이벤트 미션 테이블 및 초기 데이터
-- 실행 위치: Supabase Dashboard -> SQL Editor -> New query
-- ========================================================

-- 1. 가을 특별 이벤트 미션 테이블 생성
CREATE TABLE IF NOT EXISTS event_missions (
  id VARCHAR(64) PRIMARY KEY,
  category VARCHAR(128) NOT NULL DEFAULT '가을은 독서의 계절이 아니라 통독의 계절~',
  subtitle VARCHAR(128) DEFAULT '[가을, 단풍, 그리고 성경통독...]',
  title VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(16) DEFAULT '🍁',
  reward INTEGER NOT NULL DEFAULT 1,
  mission_type VARCHAR(32) NOT NULL DEFAULT 'daily', -- 'once' (계정당 1회) or 'daily' (매일 반복)
  rule_type VARCHAR(64) NOT NULL, -- 'daily_count_15', 'time_morning', 'time_night'
  target_count INTEGER NOT NULL DEFAULT 1,
  unit VARCHAR(16) DEFAULT '장',
  start_date DATE NOT NULL DEFAULT '2026-10-08',
  end_date DATE NOT NULL DEFAULT '2026-11-15',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화 및 모든 사용자(익명/회원) 읽기 권한 허용
ALTER TABLE event_missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to event_missions" ON event_missions;
CREATE POLICY "Allow public read access to event_missions" 
ON event_missions FOR SELECT USING (true);

-- 2. 초기 특별 이벤트 미션 3종 데이터 등록 (UPSERT)
INSERT INTO event_missions (
  id, 
  category, 
  subtitle, 
  title, 
  description, 
  icon, 
  reward, 
  mission_type, 
  rule_type, 
  target_count, 
  unit, 
  start_date, 
  end_date, 
  is_active, 
  display_order
)
VALUES
(
  'event_autumn_15',
  '가을은 독서의 계절이 아니라 통독의 계절~',
  '[가을, 단풍, 그리고 성경통독...]',
  '도전! 성경읽기!!',
  '하루에 15장 이상 읽으면 달란트 3개 (계정당 한번)',
  '🍁',
  3,
  'once',
  'daily_count_15',
  15,
  '장',
  '2026-10-08',
  '2026-11-15',
  TRUE,
  1
),
(
  'event_autumn_morning',
  '가을은 독서의 계절이 아니라 통독의 계절~',
  '[가을, 단풍, 그리고 성경통독...]',
  '하루의 시작을 말씀과 함께!',
  '오전시간 (오전5시~오전11시)에 1장이상 읽으면 달란트 1개 (매일 반복)',
  '🌅',
  1,
  'daily',
  'time_morning',
  1,
  '장',
  '2026-10-08',
  '2026-11-15',
  TRUE,
  2
),
(
  'event_autumn_night',
  '가을은 독서의 계절이 아니라 통독의 계절~',
  '[가을, 단풍, 그리고 성경통독...]',
  '고된 하루를 보내고~',
  '저녁시간 (오후9시~밤12시)에 1장이상 읽으면 달란트 1개 (매일 반복)',
  '🌙',
  1,
  'daily',
  'time_night',
  1,
  '장',
  '2026-10-08',
  '2026-11-15',
  TRUE,
  3
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  subtitle = EXCLUDED.subtitle,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  reward = EXCLUDED.reward,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;
