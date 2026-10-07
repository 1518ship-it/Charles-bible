# 🐑 Charles' Bible (말씀양 찰스) - 개발 및 프로젝트 인수인계 가이드

> 이 문서는 다른 노트북 또는 새로운 작업 환경의 **Antigravity(안티그래비티) IDE**에서 이 프로젝트를 열었을 때, AI와 개발자가 즉시 모든 맥락을 파악하고 작업을 이어갈 수 있도록 정리한 완전 가이드입니다.

---

## 📌 1. 프로젝트 개요

- **프로젝트명**: Charles' Bible (서원경 청년부 양떼목장 & 성경 통독 웹앱)
- **GitHub 저장소**: `https://github.com/1518ship-it/Charles-bible.git` (`main` 브랜치)
- **기술 스택**:
  - **Core**: Vanilla HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3
  - **Database & Realtime**: [Supabase](https://ycljudckxqijyvyxrfak.supabase.co) (PostgreSQL + Row Level Security + Realtime)
  - **디자인/그래픽**: 레트로 픽셀 아트 SVG 렌더러 (`charles-pixel.js`), 글래스모피즘 & 미니멀 UI
  - **특징**: `npm install`이나 빌드(Webpack/Vite 등)가 필요 없는 **순수 정적 웹앱(Static Web)** 구조로, 폴더를 열고 바로 브라우저에서 실행하거나 배포할 수 있습니다.

---

## 📂 2. 핵심 파일 및 디렉토리 구조

```
Charles bible/
├── index.html                 # 메인 사용자 웹앱 (양떼목장, 성경목록, 홈 대형 찰스, 통계, 알림/모달)
├── admin.html                 # 청년부 관리자 콘솔 (성도 통독 현황, 달란트 관리, 공지/쪽지 발송)
├── manifest.json              # 모바일 PWA 웹앱 매니페스트
├── server.ps1                 # 로컬 테스트용 경량 PowerShell HTTP 서버 (포트 8085)
├── push.bat / push.cmd        # GitHub 원격 저장소 자동 푸시 스크립트 (어느 경로에서나 실행 가능)
├── supabase_user_summary.sql  # Supabase DB 테이블, 뷰, RLS 정책 전체 정의 SQL
│
├── css/
│   ├── pixel-theme.css        # 메인 앱 디자인 시스템, 픽셀 아이콘, 애니메이션, 모달 스타일
│   └── admin.css              # 관리자 콘솔 전용 스타일시트
│
├── js/
│   ├── app.js                 # 앱 라이프사이클, 탭 전환, 찰스 인터랙션, 알림/쪽지, 양떼목장
│   ├── auth.js                # 회원가입, 로그인, 세션 유지, 보안키(가입코드/관리자코드) 검증
│   ├── storage.js             # 로컬 스토리지 & Supabase 클라우드 양방향 실시간 동기화
│   ├── talent.js              # 달란트 상점, 옷장(치장 아이템 인벤토리), 퀘스트 & 업적
│   ├── charles-pixel.js       # 찰스 단계별(1~5단계) 및 치장 아이템 SVG 픽셀 도트 렌더러
│   ├── bible-data.js          # 신약 27권 메타데이터 및 텍스트 데이터 맵
│   └── supabase-config.js     # Supabase 연결 설정 (URL & Anon Key)
│
└── data/
    └── bible-nt-bundle.js     # 신약 성경 개역개정 전체 본문 데이터
```

---

## 🚀 3. 핵심 시스템 및 최근 구현 내역

### 1) 친구창(양떼목장) 응원 및 실시간 쪽지 연동
- **친구 찰스 아래 [응원] 버튼**:
  - 오늘 읽은 장수가 있으면 `오늘 N장 · 응원🌿`, 없으면 `응원 🐑`으로 라벨링.
  - 클릭 시 상대방에게 Supabase `admin_messages` 테이블(USER 타입)로 1:1 쪽지 즉시 발송.
  - 친구 정보 모달(`friend-detail-modal`) 하단에도 `[🌿 (친구이름)님에게 응원과 풀 보내기]` 전용 버튼 제공.
  - 발송 시 화면에 사랑스러운 파티클(🌿, ❤️, 🐑, ✨) 및 토스트 안내와 3초 연속 클릭 쿨다운 적용.
- **요청 문구 규격**:
  - 제목: `띵동~(보낸 친구이름)님이 응원과 함께 풀을 보냈어요~!!`
  - 내용: `(보낸 친구이름)님이 성도님의 찰스를 위한 싱싱한 풀 🌿과 따뜻한 사랑의 응원을 보냈어요! 오늘도 주님의 말씀 안에서 힘을 얻고 승리하세요! 🐑✨`

### 2) [📖 말씀 읽으러 가기] 완벽 연동
- 메시지 상세 모달(`message-detail-modal-overlay`) 하단 푸터에 **초록색 메인 액션 버튼** 배치.
- 알림 목록 카드 및 상단 실시간 인앱 배너에서도 원클릭 `[📖 말씀 읽기]` 제공.
- 클릭 시 모달이 닫히며 사용자가 읽어야 할 **다음 신약 성경 본문 뷰어(`openReader`)로 즉시 이동**.

### 3) 적극적 알림(Alarm) 시스템
- **상단 인앱 실시간 푸시 배너 (`inapp-push-banner`)**: 새 쪽지/공지 감지 시 상단에서 부드럽게 슬라이드 다운 팝업.
- **헤더 편지 봉투 애니메이션 & 카운트 배지**: 안 읽은 알림 개수가 표시되는 빨간 숫자 뱃지 + 편지 봉투가 콩닥콩닥 흔들리는 `envelope-wobble` 애니메이션.
- **실시간 감지**: Supabase Realtime 구독(`admin_messages` INSERT 감지) + 30초 폴링 + 창 포커스 복귀(`focus`/`visibilitychange`) 즉시 동기화.

---

## 💻 4. 다른 노트북에서 이어서 작업하는 방법

### 1단계: USB로 폴더 복사
- 현재 노트북의 `Charles bible` 폴더 **전체**를 USB에 복사합니다.
- **중요**: 숨김 폴더인 `.git` 폴더가 함께 복사되도록 확인하세요 (Git 커밋 히스토리 및 원격 연결 유지).

### 2단계: 다른 노트북에서 열기
1. 새 노트북의 원하는 위치(예: `C:\Users\사용자명\Desktop\Charles bible`)에 폴더를 붙여넣습니다.
2. 새 노트북의 **Antigravity IDE**를 실행하고, **[File] -> [Open Folder]**로 `Charles bible` 폴더를 엽니다.

### 3단계: 다른 노트북의 안티그래비티 AI에게 프롬프트
새 노트북의 안티그래비티 AI 채팅창에 아래와 같이 입력하시면 바로 완벽하게 이어 작업할 수 있습니다:
> *"루트 디렉토리의 PROJECT_CONTEXT.md 파일을 먼저 읽고 프로젝트 아키텍처를 파악한 뒤, 이어서 다음 작업을 진행해줘."*

### 4단계: 로컬 테스트 & GitHub 배포
- **로컬 테스트**: `server.ps1`을 실행하면 `http://localhost:8085/`에서 바로 테스트할 수 있습니다.
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\server.ps1 -Port 8085
  ```
- **GitHub 배포**: 폴더 안의 **`push.bat`** 파일을 더블클릭하면 최신 변경사항이 원격 저장소(`main` 브랜치)로 바로 푸시됩니다.
  - *Tip*: 배포 시 브라우저 캐시 무효화를 위해 `index.html` 내의 CSS/JS 쿼리스트링 버전(예: `?v=5.2` -> `?v=5.3`)을 함께 올려주시면 좋습니다.
