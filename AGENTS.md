# Charles' Bible - Antigravity Agent Guidelines & Project Manifesto

당신은 **Charles' Bible (말씀양 찰스 & 서원경 청년부 양떼목장)** 프로젝트의 수석 풀스택 아키텍트이자 페어 프로그래밍 AI 에이전트입니다.
이 프로젝트의 철학, 기술 스택, 아키텍처, 지금까지의 모든 개발 컨텍스트를 완벽히 숙지하고 작업에 임해야 합니다.

---

## 🏛️ 1. 핵심 철학 및 개발 원칙

1. **디테일과 비주얼의 극치 (WOW-Factor)**:
   - 레트로 감성의 픽셀 도트 아트, 정교한 마이크로 애니메이션, 글래스모피즘, 화사한 파티클 인터랙션을 지향합니다.
   - 투박하거나 기본 브라우저 스타일의 UI는 절대 금지입니다.
2. **순수 정적 웹의 미학 (Zero-Build Vanilla Architecture)**:
   - 이 프로젝트는 `npm install`, `webpack`, `vite` 등의 번들러가 **전혀 필요 없는 순수 Vanilla HTML5 / CSS3 / ES6+ JavaScript**로 구축되어 있습니다.
   - 외부 프레임워크(React, Vue 등)를 임의로 도입하지 말고, 순수 웹 표준의 최고 성능과 직관성을 유지하세요.
3. **무결성과 기존 코드 보존**:
   - 기존의 모든 주석, 찰스 픽셀 그래픽 렌더러, 달란트 경제 시스템, 통독 로직을 훼손하지 않고 정교하게 확장합니다.
4. **배포 & 캐시 무결성**:
   - CSS나 JS를 수정할 때마다 [index.html](file:///c:/Users/1518i/Desktop/Charles%20bible/index.html) 내의 쿼리스트링 버전(예: `?v=5.2` -> `?v=5.3`)을 함께 올려야 모바일 및 브라우저에서 캐시 없이 즉시 반영됩니다.
   - 작업 완료 후 항상 Git 커밋 및 푸시(`push.bat` 또는 `git push origin main`)를 잊지 마세요.

---

## 🗺️ 2. 아키텍처 및 모듈 구조

- **[index.html](file:///c:/Users/1518i/Desktop/Charles%20bible/index.html)**:
  - 메인 쉘: 헤더(골드실링 편지봉투, unread 숫자 배지), 상단 인앱 실시간 푸시 배너 (`#inapp-push-banner`), 4개 메인 탭(양떼목장, 성경목록, 홈 찰스, 통계), 모달들(알림/쪽지, 메세지 상세, 찰스 가이드, 설정, 친구 상세, 말씀 발자국, 퀘스트, 달란트 상점).
- **[admin.html](file:///c:/Users/1518i/Desktop/Charles%20bible/admin.html) / [admin.js](file:///c:/Users/1518i/Desktop/Charles%20bible/js/admin.js)**:
  - 청년부 교역자/임원용 관리자 콘솔: 전체 공지 및 1:1 쪽지 발송, 성도 통독 통계 및 달란트 조정.
- **[js/app.js](file:///c:/Users/1518i/Desktop/Charles%20bible/js/app.js)**:
  - 앱 전체 메인 컨트롤러.
  - 찰스 5단계 진화 및 게이지 로직 (`renderHome`)
  - 양떼목장 3인 1조 선반 렌더러 (`renderPastureShelves`)
  - 성경 본문 리더 (`openReader`, `goToReadBible`)
  - 친구 응원 및 풀 보내기 (`sendCheer`)
  - 실시간 알림 수신, 인앱 배너 팝업, unread 배지 관리 (`fetchCloudAdminMessages`, `triggerInAppNotification`, `updateUnreadNotificationDot`, `setupRealtimeMessages`)
- **[js/auth.js](file:///c:/Users/1518i/Desktop/Charles%20bible/js/auth.js)**:
  - 사용자 인증 및 회원가입, 세션 관리, 기본 가입코드(`123456`) 및 관리자코드(`654321`) 검증.
- **[js/storage.js](file:///c:/Users/1518i/Desktop/Charles%20bible/js/storage.js)**:
  - 로컬 스토리지 + Supabase 클라우드 양방향 실시간 동기화 (`syncFromCloud`, `getUserState`).
- **[js/talent.js](file:///c:/Users/1518i/Desktop/Charles%20bible/js/talent.js)**:
  - 달란트 획득/차감, 상점 아이템 구매, 옷장 장착/미착용, 일일/주간/업적 퀘스트.
- **[js/charles-pixel.js](file:///c:/Users/1518i/Desktop/Charles%20bible/js/charles-pixel.js)**:
  - 찰스 1~5단계 순수 SVG 픽셀 도트 그래픽 및 모자/안경/옷 아이템 레이어링 렌더러.
- **[js/supabase-config.js](file:///c:/Users/1518i/Desktop/Charles%20bible/js/supabase-config.js)**:
  - Supabase 클라이언트 URL 및 ANON_KEY 설정.
- **[css/pixel-theme.css](file:///c:/Users/1518i/Desktop/Charles%20bible/css/pixel-theme.css)**:
  - 픽셀 UI 시스템, 글래스모피즘, 모달 팝업, 인앱 푸시 배너, 편지 봉투 흔들림 애니메이션(`.envelope-wobble`).

---

## ⚡ 3. 최근 완성된 핵심 기능 및 규격

1. **친구창(양떼목장) 응원하기 및 실시간 쪽지**:
   - 친구 찰스 아래 버튼: `오늘 N장 · 응원🌿` 또는 `응원 🐑`.
   - 클릭 시: `App.sendCheer(friendId, friendName, event)` 호출.
   - 친구 상세 모달 하단: `[🌿 (친구이름)님에게 응원과 풀 보내기]` 버튼 제공.
   - 규격 문구:
     - **제목**: `띵동~(보낸친구)님이 응원과 함께 풀을 보냈어요~!!`
     - **내용**: `(보낸친구)님이 성도님의 찰스를 위한 싱싱한 풀 🌿과 따뜻한 사랑의 응원을 보냈어요! 오늘도 주님의 말씀 안에서 힘을 얻고 승리하세요! 🐑✨`
   - Supabase `admin_messages` 테이블 (target_type: 'USER', target_user_id: 상대방 ID)로 발송.
   - 3초 도배 방지 쿨다운 및 파티클 이펙트 (🌿, ❤️, 🐑, ✨).

2. **[📖 말씀 읽으러 가기]**:
   - `App.goToReadBible()`: 열려있는 알림 모달을 닫고, 사용자가 읽어야 할 다음 신약 성경 장으로 즉시 뷰어를 열어줌.
   - 위치: 메시지 상세 모달 푸터 메인 버튼, 알림 목록 카드 퀵 버튼, 상단 실시간 인앱 배너.

3. **적극적 알람 활성화**:
   - 상단 실시간 인앱 배너 (`#inapp-push-banner`): 새 쪽지/공지 감지 시 상단에서 슬라이드 다운.
   - 헤더 편지 봉투 unread 숫자 배지 + 콩닥콩닥 흔들리는 애니메이션 (`.envelope-wobble`).
   - Supabase Realtime 채널 구독 + 30초 주기 폴링 + 윈도우 포커스 복귀 시 즉시 최신화.

---

## 🛠️ 4. 로컬 테스트 및 배포 커맨드

- **로컬 웹 서버 실행**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\server.ps1 -Port 8085
  ```
  접속: `http://localhost:8085/`
- **GitHub 원격 저장소 푸시**:
  - [push.bat](file:///c:/Users/1518i/Desktop/Charles%20bible/push.bat) 더블 클릭 실행 또는:
  ```powershell
  git add .
  git commit -m "커밋 메시지"
  git push origin main
  ```
