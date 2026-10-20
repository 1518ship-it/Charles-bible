-- ========================================================
-- Charles' Bible - 찬양집회 콜라보 이벤트 투표 테이블 생성 스크립트
-- 실행 위치: Supabase Dashboard -> SQL Editor -> New query
-- ========================================================

-- 1. 찬양집회 투표 테이블 생성
CREATE TABLE IF NOT EXISTS praise_event_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(64) NOT NULL,
  user_name VARCHAR(64),
  cell VARCHAR(64),
  song_id VARCHAR(64) NOT NULL,
  song_title VARCHAR(128) NOT NULL,
  banner_id VARCHAR(64) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT praise_event_votes_user_uniq UNIQUE (user_id)
);

-- 2. 검색 및 랭킹 집계용 인덱스
CREATE INDEX IF NOT EXISTS idx_praise_event_song_id ON praise_event_votes (song_id);
CREATE INDEX IF NOT EXISTS idx_praise_event_user_id ON praise_event_votes (user_id);

-- 3. RLS(Row Level Security) 활성화 및 접근 권한 설정
ALTER TABLE praise_event_votes ENABLE ROW LEVEL SECURITY;

-- 모든 사용자(익명/회원) 투표 결과 읽기 허용
DROP POLICY IF EXISTS "Allow public read access to praise_event_votes" ON praise_event_votes;
CREATE POLICY "Allow public read access to praise_event_votes" 
ON praise_event_votes FOR SELECT USING (true);

-- 모든 사용자 투표 등록(INSERT) 허용
DROP POLICY IF EXISTS "Allow public insert to praise_event_votes" ON praise_event_votes;
CREATE POLICY "Allow public insert to praise_event_votes" 
ON praise_event_votes FOR INSERT WITH CHECK (true);

-- 본인 투표 수정(UPDATE) 허용
DROP POLICY IF EXISTS "Allow public update to praise_event_votes" ON praise_event_votes;
CREATE POLICY "Allow public update to praise_event_votes" 
ON praise_event_votes FOR UPDATE USING (true) WITH CHECK (true);
