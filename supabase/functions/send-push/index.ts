// ==============================================================================
// Charles' Bible - Supabase Edge Function: send-push (배포 이름: hyper-service)
// 역할: 앱이 꺼져 있는 성도의 휴대폰(Android Chrome / iOS Safari 웹앱)으로 Web Push 발송
//
// 🔐 보안 설정 (Supabase Dashboard -> Edge Functions -> Secrets 에 반드시 등록)
//   VAPID_PUBLIC_KEY   : 공개키  (js/app.js 의 VAPID_PUBLIC_KEY 와 동일해야 함)
//   VAPID_PRIVATE_KEY  : 비공개키 (절대 코드/Git 저장소에 넣지 마세요!)
//   VAPID_SUBJECT      : (선택) mailto:관리자이메일
// ==============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
const reply = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: jsonHeaders });

// 키는 환경변수(Secrets)에서만 읽습니다. 코드에 기본값을 두지 않습니다.
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@charlesbible.app';
const DEFAULT_ADMIN_CODE = '654321';

const vapidReady = !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
if (vapidReady) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// 동일 수신자에게 짧은 시간 내 연속 발송 방지 (도배/남용 차단)
const lastSentAt = new Map<string, number>();
const USER_COOLDOWN_MS = 2000;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return reply({ success: false, error: 'method not allowed' }, 405);
  }
  if (!vapidReady) {
    console.error('VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY secrets are not configured.');
    return reply({ success: false, error: 'push not configured' }, 500);
  }

  try {
    const body = await req.json();
    const targetType = body.target_type === 'ALL' ? 'ALL' : 'USER';
    const targetUserId = body.target_user_id ? String(body.target_user_id).trim() : '';
    const senderUserId = body.sender_user_id ? String(body.sender_user_id).trim() : '';
    const title = String(body.title || '찰스 바이블 🌿').slice(0, 80);
    const messageBody = String(body.body || body.content || '새로운 소식이 도착했어요!').slice(0, 300);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (targetType === 'ALL') {
      // 전체 발송은 관리자 코드를 확인한 요청만 허용
      const { data: cfg } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'admin_code')
        .maybeSingle();
      const adminCode = (cfg && cfg.value ? String(cfg.value).trim() : DEFAULT_ADMIN_CODE);
      const supplied = body.admin_key ? String(body.admin_key).trim() : '';
      if (!supplied || supplied !== adminCode) {
        return reply({ success: false, error: 'forbidden' }, 403);
      }
    } else {
      // 개별 발송은 수신자 지정이 필수이며, 연속 발송을 제한
      if (!targetUserId) {
        return reply({ success: false, error: 'target_user_id required' }, 400);
      }
      const now = Date.now();
      const prev = lastSentAt.get(targetUserId) || 0;
      if (now - prev < USER_COOLDOWN_MS) {
        return reply({ success: true, sent: 0, message: 'throttled' });
      }
      lastSentAt.set(targetUserId, now);
      if (lastSentAt.size > 500) {
        for (const [k, t] of lastSentAt) {
          if (now - t > 60000) lastSentAt.delete(k);
        }
      }
    }

    let query = supabase.from('user_push_subscriptions').select('*');
    if (targetType === 'USER') {
      query = query.eq('user_id', targetUserId);
    }

    const { data: subs, error } = await query;
    if (error) {
      throw error;
    }

    if (!subs || subs.length === 0) {
      return reply({ success: true, sent: 0, message: '등록된 푸시 구독 기기가 없습니다.' });
    }

    // 알림 클릭 시 이동 URL은 서버에서 고정 (클라이언트 입력 무시)
    const payloadStr = JSON.stringify({
      title,
      body: messageBody,
      icon: './icon-192.png',
      badge: './favicon-32x32.png',
      tag: 'charles-push-' + Date.now(),
      url: './index.html?openMessages=1'
    });

    let sentCount = 0;
    const expiredIds: string[] = [];

    await Promise.all(
      subs.map(async (row: any) => {
        if (targetType === 'ALL' && senderUserId && row.user_id === senderUserId) {
          return;
        }
        const subObj = row.subscription;
        if (!subObj || !subObj.endpoint) return;

        try {
          await webpush.sendNotification(subObj, payloadStr);
          sentCount++;
        } catch (pushErr: any) {
          // 404/410: 만료·삭제된 구독 / 401/403: 이전 VAPID 키로 만든 구독(키 교체 후 무효)
          const code = pushErr && pushErr.statusCode;
          if (code === 404 || code === 410 || code === 401 || code === 403) {
            expiredIds.push(row.id);
          } else {
            console.warn('WebPush 발송 실패:', pushErr?.message || pushErr);
          }
        }
      })
    );

    if (expiredIds.length > 0) {
      await supabase.from('user_push_subscriptions').delete().in('id', expiredIds);
    }

    return reply({ success: true, sent: sentCount, cleaned: expiredIds.length });
  } catch (err: any) {
    console.error('send-push error:', err?.message || err);
    return reply({ success: false, error: 'bad request' }, 400);
  }
});
