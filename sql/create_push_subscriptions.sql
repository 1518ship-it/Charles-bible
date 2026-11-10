-- ==============================================================================
-- Charles' Bible - 모바일 웹앱(PWA) 백그라운드 Web Push 구독 저장 테이블 생성 SQL
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  endpoint text NOT NULL UNIQUE,
  subscription jsonb NOT NULL,
  user_agent text NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_push_subs_user_id ON public.user_push_subscriptions (user_id);

ALTER TABLE public.user_push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_push_subs_select_policy" ON public.user_push_subscriptions;
DROP POLICY IF EXISTS "user_push_subs_insert_policy" ON public.user_push_subscriptions;
DROP POLICY IF EXISTS "user_push_subs_update_policy" ON public.user_push_subscriptions;
DROP POLICY IF EXISTS "user_push_subs_delete_policy" ON public.user_push_subscriptions;

CREATE POLICY "user_push_subs_select_policy"
ON public.user_push_subscriptions FOR SELECT USING (true);

CREATE POLICY "user_push_subs_insert_policy"
ON public.user_push_subscriptions FOR INSERT
WITH CHECK (user_id IS NOT NULL AND length(user_id) > 0);

CREATE POLICY "user_push_subs_update_policy"
ON public.user_push_subscriptions FOR UPDATE
USING (user_id IS NOT NULL AND length(user_id) > 0)
WITH CHECK (user_id IS NOT NULL AND length(user_id) > 0);

CREATE POLICY "user_push_subs_delete_policy"
ON public.user_push_subscriptions FOR DELETE
USING (id IS NOT NULL);

GRANT ALL ON public.user_push_subscriptions TO anon, authenticated, service_role;

