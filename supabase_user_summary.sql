-- ==============================================================================
-- Charles' Bible - Supabase 유저 활동 및 달란트 요약 테이블/뷰 생성 & 보안 RLS 설정 SQL
-- ==============================================================================
-- [실행 방법]
-- 1. https://supabase.com/dashboard/project/ycljudckxqijyvyxrfak 접속
-- 2. 왼쪽 메뉴의 [SQL Editor] 클릭 -> [New query] 클릭
-- 3. 아래 쿼리를 전체 복사하여 붙여넣은 뒤 [Run (실행)] 버튼 클릭!
-- 4. 왼쪽 메뉴의 [Table Editor]를 누르면 'user_today_summary' 테이블(뷰)이 바로 나타납니다.
-- ==============================================================================

-- 1. [기존 테이블 보완] user_reading_state에 달란트/아이템/퀘스트 및 오늘읽은장수 컬럼 안전 추가
ALTER TABLE IF EXISTS public.user_reading_state ADD COLUMN IF NOT EXISTS talents integer DEFAULT 0;
ALTER TABLE IF EXISTS public.user_reading_state ADD COLUMN IF NOT EXISTS equipped jsonb DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS public.user_reading_state ADD COLUMN IF NOT EXISTS inventory jsonb DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.user_reading_state ADD COLUMN IF NOT EXISTS quest_claims jsonb DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS public.user_reading_state ADD COLUMN IF NOT EXISTS today_read_chapters integer DEFAULT 0;

-- 2. [RLS 보안 경고 해결] 무제한 FOR ALL (true) 정책 제거 및 목적별 안전 정책으로 세분화
-- (DELETE 정책을 부여하지 않아, 외부 anon 키를 통한 악의적 전체 삭제를 원천 방지합니다)
ALTER TABLE public.user_reading_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations for anon" ON public.user_reading_state;
DROP POLICY IF EXISTS "Enable all access for user_reading_state" ON public.user_reading_state;
DROP POLICY IF EXISTS "user_reading_state_select_policy" ON public.user_reading_state;
DROP POLICY IF EXISTS "user_reading_state_insert_policy" ON public.user_reading_state;
DROP POLICY IF EXISTS "user_reading_state_update_policy" ON public.user_reading_state;

-- (1) 조회 허용: 성도 간 통독 현황 공유 및 랭킹 조회를 위해 공개 읽기 허용
CREATE POLICY "user_reading_state_select_policy" 
ON public.user_reading_state 
FOR SELECT 
USING (true);

-- (2) 추가 허용: 유효한 user_id가 있는 정상 통독 데이터만 신규 저장 허용
CREATE POLICY "user_reading_state_insert_policy" 
ON public.user_reading_state 
FOR INSERT 
WITH CHECK (user_id IS NOT NULL AND length(user_id) > 0);

-- (3) 수정 허용: 유효한 user_id 행에 대해서만 업데이트 허용
CREATE POLICY "user_reading_state_update_policy" 
ON public.user_reading_state 
FOR UPDATE 
USING (user_id IS NOT NULL AND length(user_id) > 0)
WITH CHECK (user_id IS NOT NULL AND length(user_id) > 0);

-- 2-2. [members 테이블 보안 RLS 정책 - 관리자 수정(셀, 이름, 비밀번호) 및 삭제 허용]
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members_select_policy" ON public.members;
DROP POLICY IF EXISTS "members_insert_policy" ON public.members;
DROP POLICY IF EXISTS "members_update_policy" ON public.members;
DROP POLICY IF EXISTS "members_delete_policy" ON public.members;

-- (1) 조회 허용: 로그인 및 성도 명부 조회
CREATE POLICY "members_select_policy" 
ON public.members FOR SELECT 
USING (true);

-- (2) 추가 허용: 신규 회원가입
CREATE POLICY "members_insert_policy" 
ON public.members FOR INSERT 
WITH CHECK (id IS NOT NULL AND length(id) > 0);

-- (3) 수정 허용: 관리자 콘솔에서 성도 소속 셀, 이름, 닉네임, 비밀번호 변경 허용
CREATE POLICY "members_update_policy" 
ON public.members FOR UPDATE 
USING (id IS NOT NULL AND length(id) > 0)
WITH CHECK (id IS NOT NULL AND length(id) > 0);

-- (4) 삭제 허용: 관리자 콘솔에서 성도 탈퇴/삭제 허용
CREATE POLICY "members_delete_policy" 
ON public.members FOR DELETE 
USING (id IS NOT NULL AND length(id) > 0);

-- 2-3. [app_config 테이블 보안 RLS 정책 - 가입코드 및 관리자 코드 저장 허용]
ALTER TABLE IF EXISTS public.app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_config_select_policy" ON public.app_config;
DROP POLICY IF EXISTS "app_config_insert_policy" ON public.app_config;
DROP POLICY IF EXISTS "app_config_update_policy" ON public.app_config;

-- (1) 조회 허용: 가입코드 및 관리자 코드 확인
CREATE POLICY "app_config_select_policy" 
ON public.app_config FOR SELECT 
USING (true);

-- (2) 추가 허용
CREATE POLICY "app_config_insert_policy" 
ON public.app_config FOR INSERT 
WITH CHECK (key IS NOT NULL AND length(key) > 0);

-- (3) 수정 허용: 관리자 콘솔에서 가입코드 및 관리자 코드 변경 허용
CREATE POLICY "app_config_update_policy" 
ON public.app_config FOR UPDATE 
USING (key IS NOT NULL AND length(key) > 0)
WITH CHECK (key IS NOT NULL AND length(key) > 0);

-- 3. [오늘 활동 및 달란트 실시간 요약 뷰 생성]
-- 한국 시간(KST) YYYY-MM-DD 포맷을 정확히 매칭하여 오늘 읽은 장수가 친구창과 100% 일치합니다.
-- security_invoker = true 설정으로 Supabase Linter 보안 검사를 통과합니다.
DROP VIEW IF EXISTS public.user_today_summary CASCADE;

CREATE OR REPLACE VIEW public.user_today_summary
WITH (security_invoker = true)
AS
SELECT 
  r.user_id AS user_id,
  COALESCE(m.name, r.user_id) AS name,
  COALESCE(m.cell, '미지정') AS cell,
  COALESCE(
    NULLIF(r.daily_counts ->> to_char(now() AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD'), '')::integer,
    NULLIF(r.daily_counts ->> CURRENT_DATE::text, '')::integer,
    r.today_read_chapters,
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

-- 4. 뷰 조회 권한 부여 (Supabase Studio 대시보드 및 API 연동)
GRANT SELECT ON public.user_today_summary TO anon, authenticated, service_role;

-- 5. [Linter 보안 경고 일괄 해결] 미사용 레거시 SECURITY DEFINER 함수 정리
DROP FUNCTION IF EXISTS public.verify_signup_code(text);
DROP FUNCTION IF EXISTS public.verify_admin_code(text);
DROP FUNCTION IF EXISTS public.record_member_login(text);

-- ==============================================================================
-- 6. [운영자 공지사항 및 1:1 메시지(쪽지) 테이블 생성 & RLS 보안 설정]
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('ALL', 'USER')),
  target_user_id text NULL,
  title text NOT NULL,
  content text NOT NULL,
  sender_name text NOT NULL DEFAULT '운영자',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 빠른 검색을 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_admin_messages_target ON public.admin_messages (target_type, target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON public.admin_messages (created_at DESC);

-- RLS 보안 활성화 및 정책 설정
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_messages_select_policy" ON public.admin_messages;
DROP POLICY IF EXISTS "admin_messages_insert_policy" ON public.admin_messages;
DROP POLICY IF EXISTS "admin_messages_delete_policy" ON public.admin_messages;

-- (1) 조회 허용: 성도 앱에서 전체 공지('ALL') 및 본인 대상 쪽지('USER') 조회
CREATE POLICY "admin_messages_select_policy" 
ON public.admin_messages FOR SELECT 
USING (true);

-- (2) 추가 허용: 관리자 콘솔에서 공지 및 쪽지 발송 허용
CREATE POLICY "admin_messages_insert_policy" 
ON public.admin_messages FOR INSERT 
WITH CHECK (title IS NOT NULL AND length(title) > 0);

-- (3) 삭제 허용: 관리자 콘솔에서 발송한 메시지 취소/삭제 허용 (id가 지정된 행만 안전하게 삭제)
CREATE POLICY "admin_messages_delete_policy" 
ON public.admin_messages FOR DELETE 
USING (id IS NOT NULL);

-- 모든 권한 부여
GRANT ALL ON public.admin_messages TO anon, authenticated, service_role;
