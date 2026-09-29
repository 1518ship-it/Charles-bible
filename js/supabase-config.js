/**
 * Charles' Bible - Supabase 클라우드 데이터베이스 설정
 */

const SUPABASE_CONFIG = {
  // 끝의 /rest/v1/ 을 제거한 베이스 URL 사용
  URL: 'https://ycljudckxqijyvyxrfak.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbGp1ZGNreHFpanl2eXhyZmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NTM3NDQsImV4cCI6MjEwNjIyOTc0NH0.EIHw5ixcl4bpBz8gRozwpnwgn9ckCb79oqyoKP1m7iU'
};

// Supabase JS 라이브러리가 로드되었을 때 클라이언트 인스턴스 초기화
let supabaseClient = null;

if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
    console.log("☁️ Supabase client connected successfully to:", SUPABASE_CONFIG.URL);
  } catch (err) {
    console.warn("⚠️ Supabase client initialization failed, fallback to local storage:", err);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SUPABASE_CONFIG, supabaseClient };
}
