// ==============================================================================
// Charles' Bible - Supabase Edge Function: send-push
// 역할: 앱이 꺼져 있는 성도의 휴대폰(Android Chrome / iOS Safari 웹앱)으로 Web Push 발송
// 배포 위치: Supabase Dashboard -> [Edge Functions] -> Function 이름: send-push
// ==============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Charles' Bible 전용 VAPID 키 (프론트엔드 js/app.js의 VAPID_PUBLIC_KEY와 1:1 매칭됨)
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || 'BKx-JaFhMeMpXE9WW1w85zoPKMHSWkCnfI-tyr2LOzDEpdfiRBg1xiFh4NOp2per7O1Bqxn0YWAgTk9yaNdyOFU';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '9PRlzr0oB2CQxcB695nkXHmLW_mDfuCelhPKnx29N10';
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@charlesbible.app';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const targetType = body.target_type || 'USER'; // 'ALL' | 'USER'
    const targetUserId = body.target_user_id ? String(body.target_user_id).trim() : null;
    const senderUserId = body.sender_user_id ? String(body.sender_user_id).trim() : null;
    const title = body.title || '찰스 바이블 🌿';
    const messageBody = body.body || body.content || '새로운 소식이 도착했어요!';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase.from('user_push_subscriptions').select('*');
    if (targetType === 'USER' && targetUserId) {
      query = query.eq('user_id', targetUserId);
    }

    const { data: subs, error } = await query;
    if (error) {
      throw error;
    }

    if (!subs || subs.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: '등록된 푸시 구독 기기가 없습니다.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
        // 전체 공지일 때 발신자 본인은 제외(원할 경우)
        if (targetType === 'ALL' && senderUserId && row.user_id === senderUserId) {
          return;
        }
        const subObj = row.subscription;
        if (!subObj || !subObj.endpoint) return;

        try {
          await webpush.sendNotification(subObj, payloadStr);
          sentCount++;
        } catch (pushErr: any) {
          // 404 또는 410은 사용자가 앱을 삭제했거나 알림 권한을 해제한 만료된 구독
          if (pushErr && (pushErr.statusCode === 404 || pushErr.statusCode === 410)) {
            expiredIds.push(row.id);
          } else {
            console.warn('WebPush 발송 실패:', pushErr?.message || pushErr);
          }
        }
      })
    );

    // 만료된 구독 자동 정리
    if (expiredIds.length > 0) {
      await supabase.from('user_push_subscriptions').delete().in('id', expiredIds);
    }

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, cleaned: expiredIds.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || String(err) }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

