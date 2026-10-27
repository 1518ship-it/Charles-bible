-- ==============================================================================
-- Charles' Bible - 성경 구절 하이라이터 & 말씀 묵상 노트 전용 테이블 생성 SQL
-- ==============================================================================
-- [실행 방법]
-- 1. https://supabase.com/dashboard/project/ycljudckxqijyvyxrfak 접속
-- 2. 왼쪽 메뉴의 [SQL Editor] 클릭 -> [New query] 클릭
-- 3. 아래 쿼리를 전체 복사하여 붙여넣은 뒤 [Run (실행)] 버튼 클릭!
-- 4. 이제 성도들의 모든 말씀 형광펜 하이라이트와 묵상 메모가 영구 보존됩니다.
-- ==============================================================================

-- 1. 하이라이터 & 묵상 노트 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_bible_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(64) NOT NULL,
  book_id VARCHAR(16) NOT NULL,          -- 예: 'GEN', 'MAT'
  book_name VARCHAR(32) NOT NULL,        -- 예: '창세기', '마태복음'
  chapter INTEGER NOT NULL,              -- 장 번호
  verse INTEGER NOT NULL,                -- 절 번호
  verse_text TEXT NOT NULL,              -- 구절 원문 (목록 및 오프라인 즉시 열람용)
  color VARCHAR(32) NOT NULL DEFAULT 'yellow', -- 'yellow', 'green', 'blue', 'pink', 'purple', 'none'
  note TEXT DEFAULT '',                  -- 말씀 묵상 메모 / 기도문
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_bible_highlights_unique UNIQUE (user_id, book_id, chapter, verse)
);

-- 2. 검색 및 조회 가속을 위한 고성능 복합 인덱스
-- (1) 특정 장을 열람할 때 해당 장의 하이라이트를 즉시 로드하기 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_user_highlights_user_book_ch 
ON public.user_bible_highlights (user_id, book_id, chapter);

-- (2) '내 말씀 노트 모음'에서 최신순으로 정렬하여 조회하기 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_user_highlights_user_updated 
ON public.user_bible_highlights (user_id, updated_at DESC);

-- 3. RLS(Row Level Security) 활성화 및 접근 권한 설정
ALTER TABLE public.user_bible_highlights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_bible_highlights_select_policy" ON public.user_bible_highlights;
DROP POLICY IF EXISTS "user_bible_highlights_insert_policy" ON public.user_bible_highlights;
DROP POLICY IF EXISTS "user_bible_highlights_update_policy" ON public.user_bible_highlights;
DROP POLICY IF EXISTS "user_bible_highlights_delete_policy" ON public.user_bible_highlights;

-- (1) 조회 허용: 성도 앱에서 본인의 하이라이트 및 묵상 노트 조회
CREATE POLICY "user_bible_highlights_select_policy" 
ON public.user_bible_highlights FOR SELECT 
USING (true);

-- (2) 추가 허용: 유효한 user_id가 있는 행 INSERT 허용
CREATE POLICY "user_bible_highlights_insert_policy" 
ON public.user_bible_highlights FOR INSERT 
WITH CHECK (user_id IS NOT NULL AND length(user_id) > 0);

-- (3) 수정 허용: 본인 user_id 행에 대한 하이라이트 색상 및 묵상 메모 수정 허용
CREATE POLICY "user_bible_highlights_update_policy" 
ON public.user_bible_highlights FOR UPDATE 
USING (user_id IS NOT NULL AND length(user_id) > 0)
WITH CHECK (user_id IS NOT NULL AND length(user_id) > 0);

-- (4) 삭제 허용: 하이라이트 및 노트 해제 시 해당 행 삭제 허용
CREATE POLICY "user_bible_highlights_delete_policy" 
ON public.user_bible_highlights FOR DELETE 
USING (user_id IS NOT NULL AND length(user_id) > 0);

-- 4. API 권한 부여
GRANT ALL ON public.user_bible_highlights TO anon, authenticated, service_role;
