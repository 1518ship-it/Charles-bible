/**
 * Charles' Bible - 찰스 아이템 연구소 & 피팅 스튜디오 (Item Test Lab)
 * [출시 전 사전 검증, 픽셀 도트 에디터, 1~5단계 진화 핏 튜닝, 프리셋 및 코드 생성]
 */

// ==========================================
// ❄️ 신규 출시 예정 프로토타입 아이템 픽셀 데이터
// ==========================================
const PROTOTYPE_ITEM_PIXELS = {
  // 1. 포근한 산타 모자 (Head: 빨간 삼각 모자 + 흰 방울)
  'head_santa_hat': {
    slot: 'head',
    name: '포근한 산타 모자',
    category: '머리',
    icon: '🎅',
    desc: '성탄의 기쁨을 전하는 따뜻한 붉은 털모자와 하얀 방울',
    pixels: [
      // 상단 방울 (x: 17, y: 1~2)
      [17, 1, '#18181b'], [18, 1, '#18181b'],
      [16, 2, '#18181b'], [17, 2, '#ffffff'], [18, 2, '#ffffff'], [19, 2, '#18181b'],
      [17, 3, '#18181b'], [18, 3, '#18181b'],
      // 모자 본체 (빨강)
      [12, 1, '#18181b'], [13, 1, '#18181b'],
      [11, 2, '#18181b'], [12, 2, '#dc2626'], [13, 2, '#dc2626'], [14, 2, '#18181b'],
      [10, 3, '#18181b'], [11, 3, '#dc2626'], [12, 3, '#ef4444'], [13, 3, '#ef4444'], [14, 3, '#dc2626'], [15, 3, '#18181b'], [16, 3, '#dc2626'],
      [9, 4, '#18181b'], [10, 4, '#dc2626'], [11, 4, '#ef4444'], [12, 4, '#ef4444'], [13, 4, '#ef4444'], [14, 4, '#ef4444'], [15, 4, '#dc2626'], [16, 4, '#18181b'],
      // 하단 흰색 털 테두리 (Brim)
      [7, 5, '#18181b'], [8, 5, '#ffffff'], [9, 5, '#ffffff'], [10, 5, '#ffffff'], [11, 5, '#ffffff'], [12, 5, '#ffffff'], [13, 5, '#ffffff'], [14, 5, '#ffffff'], [15, 5, '#ffffff'], [16, 5, '#ffffff'], [17, 5, '#18181b'],
      [7, 6, '#18181b'], [8, 6, '#e2e8f0'], [9, 6, '#e2e8f0'], [10, 6, '#e2e8f0'], [11, 6, '#e2e8f0'], [12, 6, '#e2e8f0'], [13, 6, '#e2e8f0'], [14, 6, '#e2e8f0'], [15, 6, '#e2e8f0'], [16, 6, '#e2e8f0'], [17, 6, '#18181b']
    ]
  },

  // 2. 영광의 황금 면류관 (Head: 3개 봉우리 + 루비/에메랄드 보석)
  'head_golden_crown': {
    slot: 'head',
    name: '영광의 황금 면류관',
    category: '머리',
    icon: '👑',
    desc: '믿음의 경주를 완주한 성도에게 주어지는 영광의 생명 면류관',
    pixels: [
      // 3개 십자가 봉우리
      [8, 1, '#fbbf24'], [12, 0, '#fbbf24'], [16, 1, '#fbbf24'],
      [8, 2, '#18181b'], [12, 1, '#18181b'], [16, 2, '#18181b'],
      [8, 3, '#f59e0b'], [12, 2, '#fef08a'], [12, 3, '#f59e0b'], [16, 3, '#f59e0b'],
      [9, 3, '#18181b'], [11, 3, '#18181b'], [13, 3, '#18181b'], [15, 3, '#18181b'],
      // 왕관 몸통
      [8, 4, '#fbbf24'], [9, 4, '#ef4444'], [10, 4, '#fbbf24'], [11, 4, '#fef08a'], [12, 4, '#10b981'], [13, 4, '#fef08a'], [14, 4, '#fbbf24'], [15, 4, '#3b82f6'], [16, 4, '#fbbf24'],
      // 하단 림
      [7, 5, '#18181b'], [8, 5, '#d97706'], [9, 5, '#fbbf24'], [10, 5, '#fbbf24'], [11, 5, '#fbbf24'], [12, 5, '#fbbf24'], [13, 5, '#fbbf24'], [14, 5, '#fbbf24'], [15, 5, '#fbbf24'], [16, 5, '#d97706'], [17, 5, '#18181b']
    ]
  },

  // 3. 포근한 눈꽃 귀도리 (Head: 하늘빛 귀마개)
  'head_snow_earmuffs': {
    slot: 'head',
    name: '포근한 눈꽃 귀도리',
    category: '머리',
    icon: '🎧',
    desc: '겨울 칼바람에도 찰스의 귀를 따스하게 보호해주는 털 귀도리',
    pixels: [
      // 머리띠 아치
      [10, 4, '#38bdf8'], [11, 4, '#38bdf8'], [12, 4, '#38bdf8'], [13, 4, '#38bdf8'], [14, 4, '#38bdf8'],
      [9, 5, '#0284c7'], [15, 5, '#0284c7'],
      [8, 6, '#0284c7'], [16, 6, '#0284c7'],
      // 왼쪽 귀마개 솜 (x: 5~7, y: 7~10)
      [5, 7, '#18181b'], [6, 7, '#ffffff'], [7, 7, '#18181b'],
      [4, 8, '#18181b'], [5, 8, '#ffffff'], [6, 8, '#bae6fd'], [7, 8, '#ffffff'], [8, 8, '#18181b'],
      [4, 9, '#18181b'], [5, 9, '#ffffff'], [6, 9, '#38bdf8'], [7, 9, '#ffffff'], [8, 9, '#18181b'],
      [5, 10, '#18181b'], [6, 10, '#ffffff'], [7, 10, '#18181b'],
      // 오른쪽 귀마개 솜 (x: 17~19, y: 7~10)
      [17, 7, '#18181b'], [18, 7, '#ffffff'], [19, 7, '#18181b'],
      [16, 8, '#18181b'], [17, 8, '#ffffff'], [18, 8, '#bae6fd'], [19, 8, '#ffffff'], [20, 8, '#18181b'],
      [16, 9, '#18181b'], [17, 9, '#ffffff'], [18, 9, '#38bdf8'], [19, 9, '#ffffff'], [20, 9, '#18181b'],
      [17, 10, '#18181b'], [18, 10, '#ffffff'], [19, 10, '#18181b']
    ]
  },

  // 4. 빨간 체크 방울 목도리 (Neck: 목에 두르고 앞으로 늘어진 목도리)
  'neck_winter_muffler': {
    slot: 'neck',
    name: '빨간 체크 방울 목도리',
    category: '목',
    icon: '🧣',
    desc: '찰스의 목둘레를 따스하게 감싸주는 크리스마스 레드 체크 패턴 목도리',
    pixels: [
      // 목 둘레 상단 (y: 13, x: 6~17 - 찰스 입 아래로 완벽하게 배치)
      [6, 13, '#18181b'], [7, 13, '#dc2626'], [8, 13, '#ffffff'], [9, 13, '#dc2626'], [10, 13, '#dc2626'], [11, 13, '#ffffff'], [12, 13, '#dc2626'], [13, 13, '#dc2626'], [14, 13, '#ffffff'], [15, 13, '#dc2626'], [16, 13, '#dc2626'], [17, 13, '#18181b'],
      // 목 둘레 하단 (y: 14)
      [6, 14, '#18181b'], [7, 14, '#b91c1c'], [8, 14, '#dc2626'], [9, 14, '#ffffff'], [10, 14, '#dc2626'], [11, 14, '#dc2626'], [12, 14, '#ffffff'], [13, 14, '#dc2626'], [14, 14, '#dc2626'], [15, 14, '#ffffff'], [16, 14, '#b91c1c'], [17, 14, '#18181b'],
      // 아래로 늘어진 꼬리 (x: 7~9, y: 15~16)
      [7, 15, '#dc2626'], [8, 15, '#ffffff'], [9, 15, '#dc2626'],
      [7, 16, '#b91c1c'], [8, 16, '#dc2626'], [9, 16, '#ffffff'],
      // 꼬리 끝 흰색 눈꽃 수술 방울 (y: 17)
      [7, 17, '#ffffff'], [8, 17, '#ffffff'], [9, 17, '#ffffff']
    ]
  },

  // 5. 순결한 천사의 작은 날개 (Back/Wings: 찰스 등 뒤 좌우 날개)
  'back_angel_wings': {
    slot: 'back',
    name: '순결한 천사의 작은 날개',
    category: '등',
    icon: '🪽',
    desc: '하늘의 찬양과 기도를 올려드리는 거룩하고 순결한 천사 날개',
    pixels: [
      // 좌측 날개 (x: 1~5, y: 7~13)
      [3, 7, '#e0f2fe'], [4, 7, '#ffffff'],
      [2, 8, '#bae6fd'], [3, 8, '#ffffff'], [4, 8, '#ffffff'], [5, 8, '#ffffff'],
      [1, 9, '#7dd3fc'], [2, 9, '#ffffff'], [3, 9, '#ffffff'], [4, 9, '#ffffff'],
      [1, 10, '#38bdf8'], [2, 10, '#ffffff'], [3, 10, '#ffffff'],
      [2, 11, '#bae6fd'], [3, 11, '#ffffff'], [4, 11, '#ffffff'],
      [3, 12, '#e0f2fe'], [4, 12, '#ffffff'],
      // 우측 날개 (x: 18~22, y: 7~13)
      [19, 7, '#ffffff'], [20, 7, '#e0f2fe'],
      [18, 8, '#ffffff'], [19, 8, '#ffffff'], [20, 8, '#ffffff'], [21, 8, '#bae6fd'],
      [19, 9, '#ffffff'], [20, 9, '#ffffff'], [21, 9, '#ffffff'], [22, 9, '#7dd3fc'],
      [20, 10, '#ffffff'], [21, 10, '#ffffff'], [22, 10, '#38bdf8'],
      [19, 11, '#ffffff'], [20, 11, '#ffffff'], [21, 11, '#bae6fd'],
      [19, 12, '#ffffff'], [20, 12, '#e0f2fe']
    ]
  },

  // 6. 선한 목자의 지팡이 (Hold: 오른손 둥근 목자 지팡이)
  'hold_shepherd_staff': {
    slot: 'hold',
    name: '선한 목자의 지팡이',
    category: '소품',
    icon: '🦯',
    desc: '주의 지팡이와 막대기가 나를 안위하시나이다 (시편 23편)',
    pixels: [
      // 지팡이 머리 굽은 손잡이 (Hook)
      [18, 5, '#b45309'], [19, 5, '#d97706'], [20, 5, '#b45309'],
      [17, 6, '#b45309'], [20, 6, '#78350f'], [21, 6, '#b45309'],
      [17, 7, '#78350f'], [21, 7, '#78350f'],
      [17, 8, '#b45309'],
      // 수직 기둥 (Shaft)
      [17, 9, '#92400e'], [17, 10, '#b45309'], [17, 11, '#d97706'], [17, 12, '#b45309'],
      [17, 13, '#92400e'], [17, 14, '#b45309'], [17, 15, '#d97706'], [17, 16, '#b45309'],
      [17, 17, '#78350f'], [17, 18, '#451a03']
    ]
  },

  // 7. 김 솔솔 핫초코 머그잔 (Hold: 모락모락 김이 올라오는 빨간 머그)
  'hold_hot_cocoa': {
    slot: 'hold',
    name: '김 솔솔 핫초코 머그잔',
    category: '소품',
    icon: '☕',
    desc: '얼어붙은 몸과 마음을 녹여주는 달콤하고 따뜻한 핫초코',
    pixels: [
      // 수증기 김 (Steam)
      [18, 9, '#e2e8f0'],
      [17, 10, '#e2e8f0'], [19, 10, '#cbd5e1'],
      [18, 11, '#94a3b8'],
      // 머그컵 상단 크림
      [16, 12, '#ffffff'], [17, 12, '#fed7aa'], [18, 12, '#ffffff'], [19, 12, '#fed7aa'],
      // 머그컵 몸체 (Red Cup)
      [15, 13, '#ef4444'], [16, 13, '#dc2626'], [17, 13, '#dc2626'], [18, 13, '#dc2626'], [19, 13, '#dc2626'],
      [15, 14, '#b91c1c'], [16, 14, '#dc2626'], [17, 14, '#ffffff'], [18, 14, '#dc2626'], [19, 14, '#b91c1c'], [20, 14, '#ef4444'],
      [15, 15, '#b91c1c'], [16, 15, '#dc2626'], [17, 15, '#dc2626'], [18, 15, '#dc2626'], [19, 15, '#b91c1c'], [20, 15, '#ef4444'],
      [16, 16, '#991b1b'], [17, 16, '#991b1b'], [18, 16, '#991b1b'], [19, 16, '#991b1b']
    ]
  },

  // 8. 오병이어 바구니 (Hold: 떡 다섯 개와 물고기 두 마리)
  'hold_five_loaves': {
    slot: 'hold',
    name: '오병이어 바구니',
    category: '소품',
    icon: '🐟',
    desc: '감사와 나눔의 기적이 일어나는 풍성한 오병이어 바구니',
    pixels: [
      // 물고기 2마리 은빛 꼬리
      [16, 10, '#94a3b8'], [17, 10, '#cbd5e1'], [19, 10, '#94a3b8'], [20, 10, '#cbd5e1'],
      // 황금 보리떡
      [15, 11, '#fde047'], [16, 11, '#f59e0b'], [17, 11, '#fde047'], [18, 11, '#f59e0b'], [19, 11, '#fde047'], [20, 11, '#f59e0b'],
      // 라탄 바구니
      [14, 12, '#18181b'], [15, 12, '#d97706'], [16, 12, '#b45309'], [17, 12, '#d97706'], [18, 12, '#b45309'], [19, 12, '#d97706'], [20, 12, '#b45309'], [21, 12, '#18181b'],
      [15, 13, '#b45309'], [16, 13, '#d97706'], [17, 13, '#b45309'], [18, 13, '#d97706'], [19, 13, '#b45309'], [20, 13, '#d97706'],
      [15, 14, '#78350f'], [16, 14, '#b45309'], [17, 14, '#d97706'], [18, 14, '#b45309'], [19, 14, '#d97706'], [20, 14, '#78350f'],
      [16, 15, '#78350f'], [17, 15, '#78350f'], [18, 15, '#78350f'], [19, 15, '#78350f']
    ]
  },

  // 9. 찰스 꼬마 눈사람 (Side: 찰스 왼쪽 앞 귀여운 눈사람)
  'side_winter_snowman': {
    slot: 'side',
    name: '찰스 꼬마 눈사람',
    category: '소품',
    icon: '⛄',
    desc: '찰스를 쏙 빼닮아 방긋 웃고 있는 깜찍한 아기 눈사람',
    pixels: [
      // 머리 모자 버킷
      [2, 10, '#ef4444'], [3, 10, '#ef4444'], [4, 10, '#ef4444'],
      // 눈사람 머리 (x: 1~5, y: 11~13)
      [1, 11, '#ffffff'], [2, 11, '#18181b'], [3, 11, '#ffffff'], [4, 11, '#18181b'], [5, 11, '#ffffff'],
      [1, 12, '#ffffff'], [2, 12, '#ffffff'], [3, 12, '#f97316'], [4, 12, '#f97316'], [5, 12, '#ffffff'],
      [1, 13, '#ffffff'], [2, 13, '#ffedd5'], [3, 13, '#ffffff'], [4, 13, '#ffedd5'], [5, 13, '#ffffff'],
      // 목도리
      [1, 14, '#10b981'], [2, 14, '#10b981'], [3, 14, '#10b981'], [4, 14, '#10b981'], [5, 14, '#10b981'], [6, 14, '#10b981'],
      // 몸통
      [0, 15, '#e0f2fe'], [1, 15, '#ffffff'], [2, 15, '#18181b'], [3, 15, '#ffffff'], [4, 15, '#ffffff'], [5, 15, '#ffffff'], [6, 15, '#e0f2fe'],
      [0, 16, '#e0f2fe'], [1, 16, '#ffffff'], [2, 16, '#ffffff'], [3, 16, '#18181b'], [4, 16, '#ffffff'], [5, 16, '#ffffff'], [6, 16, '#e0f2fe'],
      [0, 17, '#bae6fd'], [1, 17, '#ffffff'], [2, 17, '#ffffff'], [3, 17, '#ffffff'], [4, 17, '#ffffff'], [5, 17, '#ffffff'], [6, 17, '#bae6fd']
    ]
  },

  // 10. 은혜의 선물상자 (Side: 리본 달린 선물상자)
  'side_blessing_giftbox': {
    slot: 'side',
    name: '은혜의 선물상자',
    category: '소품',
    icon: '🎁',
    desc: '하늘로부터 내려오는 온갖 좋은 은사와 온전한 선물의 상자',
    pixels: [
      // 리본 보우 (Ribbon bow)
      [2, 12, '#facc15'], [3, 12, '#fef08a'], [4, 12, '#fef08a'], [5, 12, '#facc15'],
      // 뚜껑 (Lid)
      [1, 13, '#dc2626'], [2, 13, '#dc2626'], [3, 13, '#facc15'], [4, 13, '#facc15'], [5, 13, '#dc2626'], [6, 13, '#dc2626'],
      // 상자 몸통
      [2, 14, '#b91c1c'], [3, 14, '#facc15'], [4, 14, '#facc15'], [5, 14, '#b91c1c'],
      [2, 15, '#b91c1c'], [3, 15, '#facc15'], [4, 15, '#facc15'], [5, 15, '#b91c1c'],
      [2, 16, '#991b1b'], [3, 16, '#facc15'], [4, 16, '#facc15'], [5, 16, '#991b1b'],
      [2, 17, '#991b1b'], [3, 17, '#eab308'], [4, 17, '#eab308'], [5, 17, '#991b1b']
    ]
  },

  // 11. 말씀보다 달콤한 꿀단지 (Side: 항아리와 흐르는 꿀)
  'side_honey_jar': {
    slot: 'side',
    name: '달콤한 꿀단지',
    category: '소품',
    icon: '🍯',
    desc: '주의 말씀의 맛이 내게 어찌 그리 단지요 꿀보다 더 다나이다 (시 119:103)',
    pixels: [
      // 꿀단지 뚜껑
      [2, 12, '#b45309'], [3, 12, '#d97706'], [4, 12, '#d97706'], [5, 12, '#b45309'],
      // 단지 입구
      [1, 13, '#78350f'], [2, 13, '#f59e0b'], [3, 13, '#fef08a'], [4, 13, '#f59e0b'], [5, 13, '#f59e0b'], [6, 13, '#78350f'],
      // 단지 몸통 & 꿀방울
      [1, 14, '#b45309'], [2, 14, '#fbbf24'], [3, 14, '#fef08a'], [4, 14, '#b45309'], [5, 14, '#d97706'], [6, 14, '#b45309'],
      [1, 15, '#92400e'], [2, 15, '#b45309'], [3, 15, '#fbbf24'], [4, 15, '#b45309'], [5, 15, '#b45309'], [6, 15, '#92400e'],
      [2, 16, '#78350f'], [3, 16, '#92400e'], [4, 16, '#92400e'], [5, 16, '#78350f']
    ]
  },

  // 12. 소복소복 흰 눈밭 카펫 (Floor/Grass: 찰스 발밑 흰 눈 카펫)
  'back_snow_carpet': {
    slot: 'grass',
    name: '소복소복 흰 눈밭 카펫',
    category: '잔디',
    icon: '❄️',
    desc: '찰스의 발걸음마다 뽀드득 맑은 소리가 나는 깨끗한 눈밭',
    pixels: [
      // 상단 눈꽃 층
      [3, 17, '#ffffff'], [6, 17, '#ffffff'], [7, 17, '#ffffff'], [12, 17, '#ffffff'], [13, 17, '#ffffff'], [18, 17, '#ffffff'],
      // 눈밭 메인 층
      [2, 18, '#ffffff'], [3, 18, '#ffffff'], [4, 18, '#ffffff'], [5, 18, '#ffffff'], [6, 18, '#ffffff'], [7, 18, '#ffffff'], [8, 18, '#ffffff'], [9, 18, '#ffffff'], [10, 18, '#ffffff'], [11, 18, '#ffffff'], [12, 18, '#ffffff'], [13, 18, '#ffffff'], [14, 18, '#ffffff'], [15, 18, '#ffffff'], [16, 18, '#ffffff'], [17, 18, '#ffffff'], [18, 18, '#ffffff'], [19, 18, '#ffffff'], [20, 18, '#ffffff'],
      // 하단 그림자/얼음빛 층
      [2, 19, '#e0f2fe'], [3, 19, '#e0f2fe'], [4, 19, '#bae6fd'], [5, 19, '#e0f2fe'], [6, 19, '#bae6fd'], [7, 19, '#e0f2fe'], [8, 19, '#e0f2fe'], [9, 19, '#bae6fd'], [10, 19, '#e0f2fe'], [11, 19, '#e0f2fe'], [12, 19, '#bae6fd'], [13, 19, '#e0f2fe'], [14, 19, '#bae6fd'], [15, 19, '#e0f2fe'], [16, 19, '#e0f2fe'], [17, 19, '#bae6fd'], [18, 19, '#e0f2fe'], [19, 19, '#bae6fd'], [20, 19, '#e0f2fe']
    ]
  }
};

// ==========================================
// 🎸 찬양집회 스페셜 악기 및 소품 픽셀 데이터 (8종)
// ==========================================
const PRAISE_MUSIC_ITEM_PIXELS = {
  // 1. 워십 보컬 마이크 (Hold: 찰스 오른쪽 앞발로 쥐고 찬양하는 실버 & 골드 마이크 + 피어오르는 찬양 음표)
  'hold_worship_mic': {
    slot: 'hold',
    name: '워십 보컬 마이크',
    category: '찬양 악기',
    icon: '🎤',
    desc: '찰스가 오른손에 야무지게 쥐고 주를 향한 감사의 찬양을 드리는 반짝이는 보컬 마이크',
    pixels: [
      // 피어오르는 찬양의 황금빛 & 로즈빛 음표 (♪, ♫) & 스파클 (찰스 오른쪽 머리 위 x: 17~22, y: 6~9)
      [19, 6, '#facc15'], [20, 6, '#facc15'], [19, 7, '#f59e0b'],
      [17, 8, '#fb7185'], [18, 8, '#f43f5e'], [17, 9, '#e11d48'],
      [21, 9, '#fde047'], [22, 9, '#f59e0b'],
      // 은빛 & 크롬 둥근 마이크 그릴 헤드 (x: 15~18, y: 10~12)
      [16, 10, '#ffffff'], [17, 10, '#e2e8f0'], [18, 10, '#cbd5e1'],
      [15, 11, '#ffffff'], [16, 11, '#cbd5e1'], [17, 11, '#94a3b8'], [18, 11, '#64748b'],
      [15, 12, '#e2e8f0'], [16, 12, '#94a3b8'], [17, 12, '#64748b'],
      // 로즈골드 & 골드 링 액센트 (y: 13)
      [16, 13, '#f59e0b'], [17, 13, '#fbbf24'],
      // 찰스의 앙증맞은 하얀 앞발굽이 마이크를 꼭 쥐고 있는 모습 (x: 14~16, y: 13~14)
      [14, 13, '#18181b'], [15, 13, '#ffffff'],
      [14, 14, '#18181b'], [15, 14, '#ffffff'], [16, 14, '#ffffff'],
      // 슬림 매트블랙 & 메탈 손잡이 바디 (x: 16~17, y: 14~16)
      [17, 14, '#3f3f46'],
      [16, 15, '#27272a'], [17, 15, '#18181b'],
      [16, 16, '#18181b'], [17, 16, '#27272a'],
      // 마이크 하단 케이블 & 엔드핀 (y: 17)
      [17, 17, '#52525b']
    ]
  },

  // 2. 어쿠스틱 찬양 통기타 (Hold: 찰스 가슴과 배 아래쪽으로 포근하게 안고 치는 둥근 통기타)
  'hold_acoustic_guitar': {
    slot: 'hold',
    name: '어쿠스틱 찬양 통기타',
    category: '찬양 악기',
    icon: '🎸',
    desc: '가슴과 배 아래로 포근히 안고 주님의 선하심을 노래하는 따스한 허니우드 울림의 통기타',
    pixels: [
      // 헤드스톡 & 금빛 조율 페그 (왼쪽 x:3~5, y:12~14 - 귀여운 미니 헤드)
      [3, 12, '#facc15'], [5, 12, '#facc15'],
      [4, 12, '#92400e'],
      [3, 13, '#78350f'], [4, 13, '#b45309'], [5, 13, '#78350f'],
      [3, 14, '#facc15'], [4, 14, '#92400e'], [5, 14, '#facc15'],
      // 넥 지판 & 플랫 (Fretboard - x:6~9, y:13~14)
      [6, 13, '#b45309'], [7, 13, '#fef08a'], [8, 13, '#b45309'], [9, 13, '#fef08a'],
      [6, 14, '#78350f'], [7, 14, '#92400e'], [8, 14, '#78350f'], [9, 14, '#92400e'],
      // 찰스 왼쪽 앞발(왼손): 넥 지판을 짚고 있는 하얀 발굽 (x:7~8, y:12~13)
      [7, 12, '#18181b'], [8, 12, '#18181b'],
      [7, 13, '#ffffff'], [8, 13, '#ffffff'],
      // 브라운 가죽 멜빵 스트랩 (찰스 어깨 사선 x:9~11, y:11~13)
      [9, 11, '#78350f'], [10, 12, '#92400e'], [11, 13, '#78350f'],
      // 둥글둥글 귀여운 바디 상단 (y:14)
      [10, 14, '#78350f'], [11, 14, '#b45309'], [12, 14, '#d97706'],
      [15, 14, '#d97706'], [16, 14, '#b45309'], [17, 14, '#78350f'],
      // 찰스 오른쪽 앞발(오른손): 사운드홀 위에서 스트로크하는 하얀 발굽 (x:13~14, y:13~14)
      [13, 13, '#18181b'], [14, 13, '#18181b'],
      [13, 14, '#ffffff'], [14, 14, '#ffffff'],
      // 바디 중앙 & 까만 사운드홀 + 아이보리 로제트 링 (y:15)
      [9, 15, '#78350f'], [10, 15, '#d97706'], [11, 15, '#f59e0b'], [12, 15, '#fef08a'],
      [13, 15, '#18181b'], [14, 15, '#18181b'], // 블랙 사운드홀
      [15, 15, '#fef08a'], [16, 15, '#f59e0b'], [17, 15, '#d97706'], [18, 15, '#78350f'],
      // 바디 하단 & 우드 브릿지 + 화이트 핀 (y:16)
      [9, 16, '#78350f'], [10, 16, '#d97706'], [11, 16, '#f59e0b'], [12, 16, '#f59e0b'],
      [13, 16, '#451a03'], [14, 16, '#ffffff'], [15, 16, '#451a03'], // 브릿지 & 화이트 핀
      [16, 16, '#f59e0b'], [17, 16, '#d97706'], [18, 16, '#78350f'],
      // 바디 하단 통통하고 큰 울림통 (y:17)
      [10, 17, '#78350f'], [11, 17, '#b45309'], [12, 17, '#d97706'], [13, 17, '#f59e0b'],
      [14, 17, '#f59e0b'], [15, 17, '#d97706'], [16, 17, '#b45309'], [17, 17, '#78350f'],
      // 바디 최하단 라운드 아웃라인 (y:18)
      [11, 18, '#78350f'], [12, 18, '#78350f'], [13, 18, '#78350f'],
      [14, 18, '#78350f'], [15, 18, '#78350f'], [16, 18, '#78350f']
    ]
  },

  // 3. 은빛 빈티지 스탠드 마이크 (Side: 찰스 바로 앞에 세워진 크롬 스탠드 마이크)
  'side_vintage_stand_mic': {
    slot: 'side',
    name: '은빛 스탠드 마이크',
    category: '찬양 악기',
    icon: '🎙️',
    desc: '찰스 바로 앞에 세워져 은혜로운 찬양을 이끄는 프로페셔널 빈티지 스탠드 마이크',
    pixels: [
      // 공중에 피어나는 핑크빛 찬양 음표
      [7, 7, '#f43f5e'], [8, 7, '#f43f5e'], [7, 8, '#fb7185'],
      // 빈티지 크롬 마이크 헤드 (찰스 입높이 y:10~12, x:8~10)
      [8, 10, '#cbd5e1'], [9, 10, '#ffffff'],
      [7, 11, '#94a3b8'], [8, 11, '#ffffff'], [9, 11, '#cbd5e1'], [10, 11, '#64748b'],
      [8, 12, '#64748b'], [9, 12, '#94a3b8'],
      // 조인트 마운트 & 클러치
      [7, 12, '#cbd5e1'], [7, 13, '#334155'],
      // 스탠드 크롬 기둥 (y:14~17, x:7)
      [7, 14, '#e2e8f0'],
      [7, 15, '#cbd5e1'],
      [7, 16, '#94a3b8'],
      [7, 17, '#e2e8f0'],
      // 원형 안정 베이스 받침대 (바닥 y:18)
      [5, 18, '#334155'], [6, 18, '#64748b'], [7, 18, '#cbd5e1'], [8, 18, '#64748b'], [9, 18, '#334155']
    ]
  },

  // 4. 워십 건반 신디사이저 (Side: 찰스 곁에 놓인 흑백 건반과 스탠드)
  'side_worship_synth': {
    slot: 'side',
    name: '워십 건반 신디사이저',
    category: '찬양 악기',
    icon: '🎹',
    desc: '찰스 곁에 놓여 영혼을 울리는 화음과 감동적인 멜로디를 수놓는 찬양팀 신디사이저',
    pixels: [
      // 하늘빛 음표 (♪)
      [3, 10, '#38bdf8'], [4, 10, '#38bdf8'], [3, 11, '#0284c7'],
      // 상단 컨트롤 패널 (LED 표시창 & 버튼)
      [2, 13, '#18181b'], [3, 13, '#27272a'], [4, 13, '#06b6d4'], [5, 13, '#27272a'], [6, 13, '#ef4444'], [7, 13, '#27272a'], [8, 13, '#18181b'],
      // 흑백 건반 상단 (y:14)
      [2, 14, '#ffffff'], [3, 14, '#18181b'], [4, 14, '#ffffff'], [5, 14, '#18181b'], [6, 14, '#ffffff'], [7, 14, '#18181b'], [8, 14, '#ffffff'],
      // 찰스 왼발굽이 건반을 연주하는 디테일
      [8, 13, '#18181b'], [9, 13, '#ffffff'], [8, 14, '#ffffff'],
      // 흰 건반 하단 (y:15)
      [2, 15, '#f8fafc'], [3, 15, '#e2e8f0'], [4, 15, '#f8fafc'], [5, 15, '#e2e8f0'], [6, 15, '#f8fafc'], [7, 15, '#e2e8f0'], [8, 15, '#f8fafc'],
      // 본체 하단 프레임 (y:16)
      [2, 16, '#18181b'], [3, 16, '#3f3f46'], [4, 16, '#3f3f46'], [5, 16, '#3f3f46'], [6, 16, '#3f3f46'], [7, 16, '#3f3f46'], [8, 16, '#18181b'],
      // X자 스탠드 다리 (y:17~18)
      [3, 17, '#52525b'], [7, 17, '#52525b'],
      [2, 18, '#3f3f46'], [4, 18, '#52525b'], [6, 18, '#52525b'], [8, 18, '#3f3f46']
    ]
  },

  // 5. 기쁨의 찬양 탬버린 (Hold: 황금 방울 징글과 하늘/코랄 리본)
  'hold_praise_tambourine': {
    slot: 'hold',
    name: '기쁨의 찬양 탬버린',
    category: '찬양 악기',
    icon: '🪘',
    desc: '소고 치며 춤추어 주를 찬양할지어다! 기쁨의 리듬을 더하는 찬양 탬버린',
    pixels: [
      // 둥근 원형 골드 프레임 & 방울
      [16, 9, '#fbbf24'], [17, 9, '#f59e0b'], [18, 9, '#fbbf24'],
      [15, 10, '#f59e0b'], [16, 10, '#e2e8f0'], [18, 10, '#e2e8f0'], [19, 10, '#f59e0b'],
      [15, 11, '#d97706'], [19, 11, '#d97706'],
      [15, 12, '#f59e0b'], [16, 12, '#e2e8f0'], [18, 12, '#e2e8f0'], [19, 12, '#f59e0b'],
      [16, 13, '#fbbf24'], [17, 13, '#f59e0b'], [18, 13, '#fbbf24'],
      // 찰스의 하얀 발굽이 탬버린 하단을 쥐고 있음
      [15, 13, '#ffffff'], [16, 13, '#ffffff'], [15, 12, '#18181b'],
      // 흩날리는 축복 리본
      [17, 14, '#38bdf8'], [18, 14, '#f43f5e'],
      [16, 15, '#0284c7'], [18, 15, '#e11d48']
    ]
  },

  // 6. 프로 모니터링 헤드폰 (Head: 찰스 양쪽 귀에 정확히 핏되는 골드 링 블랙 헤드폰)
  'head_worship_headphones': {
    slot: 'head',
    name: '프로 모니터링 헤드폰',
    category: '찬양 악기',
    icon: '🎧',
    desc: '양쪽 귀에 완벽히 밀착되어 찬양의 모든 화음을 섬세하게 모니터링하는 전문 헤드폰',
    pixels: [
      // 헤드밴드 상단 아치 (y:4~6, x:7~15)
      [10, 4, '#18181b'], [11, 4, '#27272a'], [12, 4, '#facc15'], [13, 4, '#27272a'], [14, 4, '#18181b'],
      [9, 5, '#18181b'], [15, 5, '#18181b'],
      [8, 6, '#3f3f46'], [16, 6, '#3f3f46'],
      // 좌측 이어컵 (x:4~7, y:7~10)
      [5, 7, '#18181b'], [6, 7, '#3f3f46'], [7, 7, '#18181b'],
      [4, 8, '#18181b'], [5, 8, '#facc15'], [6, 8, '#52525b'], [7, 8, '#27272a'],
      [4, 9, '#18181b'], [5, 9, '#facc15'], [6, 9, '#3f3f46'], [7, 9, '#27272a'],
      [5, 10, '#18181b'], [6, 10, '#27272a'], [7, 10, '#18181b'],
      // 우측 이어컵 (대칭 x:15~18, y:7~10)
      [15, 7, '#18181b'], [16, 7, '#3f3f46'], [17, 7, '#18181b'],
      [15, 8, '#27272a'], [16, 8, '#52525b'], [17, 8, '#facc15'], [18, 8, '#18181b'],
      [15, 9, '#27272a'], [16, 9, '#3f3f46'], [17, 9, '#facc15'], [18, 9, '#18181b'],
      [15, 10, '#18181b'], [16, 10, '#27272a'], [17, 10, '#18181b']
    ]
  },

  // 7. 찬양의 멜로디 음표 아우라 (Back: 찰스 주변을 맴도는 다채로운 음표)
  'back_melody_aura': {
    slot: 'back',
    name: '찬양의 멜로디 음표 아우라',
    category: '찬양 악기',
    icon: '🎵',
    desc: '성도들의 뜨거운 찬양 소리가 천상의 화음으로 피어나는 찬양 음표 아우라',
    pixels: [
      // 하늘빛 음표 (♪)
      [3, 4, '#38bdf8'], [4, 4, '#38bdf8'], [3, 5, '#0284c7'],
      // 골드 2연음표 (♫)
      [11, 2, '#facc15'], [12, 2, '#facc15'], [13, 2, '#facc15'],
      [11, 3, '#f59e0b'], [13, 3, '#f59e0b'],
      // 로즈핑크 음표
      [20, 4, '#f43f5e'], [21, 4, '#f43f5e'], [20, 5, '#e11d48'],
      // 에메랄드 16분 음표
      [1, 9, '#10b981'], [2, 9, '#34d399'], [1, 10, '#059669'],
      // 바이올렛 퍼플 음표
      [21, 10, '#8b5cf6'], [22, 10, '#a78bfa'], [21, 11, '#7c3aed'],
      // 반짝임 스파클
      [2, 13, '#a3e635'], [22, 13, '#fb7185']
    ]
  },

  // 8. 워십 일렉 기타 (Hold: 찰스 가슴과 배 아래쪽으로 안고 치는 캔디레드 일렉 기타)
  'hold_electric_guitar': {
    slot: 'hold',
    name: '워십 일렉 기타',
    category: '찬양 악기',
    icon: '🎸',
    desc: '가슴과 배 아래로 안고 살아계신 주를 힘차게 찬양하는 날렵하고 귀여운 캔디 레드 일렉 기타',
    pixels: [
      // 헤드스톡 & 실버 조율 페그 (왼쪽 x:2~5, y:12~14 - 날렵하고 귀여운 샤프 헤드)
      [2, 12, '#cbd5e1'], [3, 12, '#cbd5e1'], [4, 12, '#cbd5e1'],
      [2, 13, '#dc2626'], [3, 13, '#ef4444'], [4, 13, '#dc2626'],
      [4, 14, '#18181b'],
      // 넥 지판 & 플랫 (Fretboard - x:5~9, y:13~14)
      [5, 13, '#cbd5e1'], [6, 13, '#94a3b8'], [7, 13, '#cbd5e1'], [8, 13, '#94a3b8'], [9, 13, '#cbd5e1'],
      [5, 14, '#475569'], [6, 14, '#334155'], [7, 14, '#475569'], [8, 14, '#334155'], [9, 14, '#475569'],
      // 찰스 왼쪽 앞발(왼손): 지판을 잡고 있는 하얀 발굽 (x:7~8, y:12~13)
      [7, 12, '#18181b'], [8, 12, '#18181b'],
      [7, 13, '#ffffff'], [8, 13, '#ffffff'],
      // 블랙 일렉 스트랩 (찰스 어깨 사선 x:9~11, y:11~13)
      [9, 11, '#27272a'], [10, 12, '#27272a'], [11, 13, '#27272a'],
      // 일렉 바디 상단 더블 컷어웨이 뿔 (y:14)
      [9, 14, '#dc2626'], [10, 14, '#ef4444'], [11, 14, '#dc2626'],
      [15, 14, '#ef4444'], [16, 14, '#dc2626'],
      // 찰스 오른쪽 앞발(오른손): 바디 위에서 피킹하는 하얀 발굽 (x:13~14, y:13~14)
      [13, 13, '#18181b'], [14, 13, '#18181b'],
      [13, 14, '#ffffff'], [14, 14, '#ffffff'],
      // 픽업 & 화이트 픽가드 (y:15)
      [9, 15, '#b91c1c'], [10, 15, '#dc2626'], [11, 15, '#ffffff'], [12, 15, '#ffffff'],
      [13, 15, '#18181b'], [14, 15, '#18181b'], // 블랙 험버커 픽업
      [15, 15, '#ffffff'], [16, 15, '#ef4444'], [17, 15, '#dc2626'],
      // 크롬 브릿지 & 골드 볼륨 노브 (y:16)
      [9, 16, '#b91c1c'], [10, 16, '#ef4444'], [11, 16, '#ffffff'],
      [12, 16, '#cbd5e1'], [13, 16, '#cbd5e1'], // 크롬 브릿지
      [14, 16, '#facc15'], // 골드 볼륨 노브
      [15, 16, '#ef4444'], [16, 16, '#dc2626'], [17, 16, '#b91c1c'],
      // 바디 하단 곡선 (y:17)
      [10, 17, '#991b1b'], [11, 17, '#dc2626'], [12, 17, '#ef4444'], [13, 17, '#ef4444'],
      [14, 17, '#ef4444'], [15, 17, '#dc2626'], [16, 17, '#991b1b'],
      // 바디 최하단 라운드 (y:18)
      [11, 18, '#991b1b'], [12, 18, '#991b1b'], [13, 18, '#991b1b'], [14, 18, '#991b1b'], [15, 18, '#991b1b']
    ]
  }
};

// 통합 아이템 픽셀 도우미 함수
function getAnyItemPixels(id) {
  if (!id) return null;
  if (typeof PRAISE_MUSIC_ITEM_PIXELS !== 'undefined' && PRAISE_MUSIC_ITEM_PIXELS[id]) {
    return PRAISE_MUSIC_ITEM_PIXELS[id].pixels;
  }
  if (typeof PROTOTYPE_ITEM_PIXELS !== 'undefined' && PROTOTYPE_ITEM_PIXELS[id]) {
    return PROTOTYPE_ITEM_PIXELS[id].pixels;
  }
  if (typeof AUTUMN_ITEM_PIXELS !== 'undefined' && AUTUMN_ITEM_PIXELS[id]) {
    return AUTUMN_ITEM_PIXELS[id].pixels;
  }
  return null;
}

// 통합 아이템 정보 도우미 함수
function getAnyItemInfo(id) {
  if (!id) return null;
  if (typeof TALENT_ITEMS !== 'undefined' && TALENT_ITEMS[id]) return TALENT_ITEMS[id];
  if (typeof PRAISE_MUSIC_ITEM_PIXELS !== 'undefined' && PRAISE_MUSIC_ITEM_PIXELS[id]) return PRAISE_MUSIC_ITEM_PIXELS[id];
  if (typeof PROTOTYPE_ITEM_PIXELS !== 'undefined' && PROTOTYPE_ITEM_PIXELS[id]) return PROTOTYPE_ITEM_PIXELS[id];
  if (typeof AUTUMN_ITEM_PIXELS !== 'undefined' && AUTUMN_ITEM_PIXELS[id]) return AUTUMN_ITEM_PIXELS[id];
  return null;
}

if (typeof window !== 'undefined') {
  window.getAnyItemPixels = getAnyItemPixels;
  window.getAnyItemInfo = getAnyItemInfo;
}

// ==========================================
// 🧪 Item Test Studio Controller
// ==========================================
const ItemStudio = {
  stage: 3,
  scale: 10,
  theme: 'theme-white',
  animClass: 'charles-static',
  showGrid: false,
  showGuide: false,
  activeDrawColor: '#18181b',
  drawTool: 'pencil', // pencil | eraser
  isMouseDown: false,
  equipped: {},
  customPixels: [],
  customSlot: 'head',
  originalUserEquippedBackup: null,

  init() {
    this.initSessionInfo();
    this.renderAllCatalogs();
    this.initPixelCanvas();
    this.updateCanvas();
    this.bindEvents();
    console.log('🧪 Charles Item Test Studio Initialized with Praise Instruments!');
  },

  renderAllCatalogs() {
    this.renderCurrentCatalog();
    this.renderPraiseMusicCatalog();
    this.renderPrototypeCatalog();
  },

  initSessionInfo() {
    const chip = document.getElementById('studio-user-chip');
    if (!chip) return;

    let uid = 'guest';
    let name = '체험 유저';
    try {
      if (typeof StorageService !== 'undefined' && StorageService.getCurrentUserId) {
        uid = StorageService.getCurrentUserId();
      }
      const userListStr = localStorage.getItem('charles_users_list');
      if (userListStr) {
        const users = JSON.parse(userListStr);
        const u = users.find(x => x.id === uid);
        if (u) name = u.name || u.callName || uid;
      }
    } catch (e) {
      console.warn('Session inspect failed:', e);
    }
    chip.innerHTML = `🐑 접속: <strong>${name}</strong> (${uid})`;
  },

  // 1. 기존 상점/배너 카탈로그 렌더링
  renderCurrentCatalog() {
    const container = document.getElementById('released-items-container');
    if (!container) return;

    let html = '';
    const items = (typeof TALENT_ITEMS !== 'undefined') ? TALENT_ITEMS : {};

    for (const [id, item] of Object.entries(items)) {
      const isEq = this.isEquipped(id);
      const iconSvg = (typeof getAccessoryIconSvg === 'function') ? getAccessoryIconSvg(id) : '';

      html += `
        <div class="item-test-card ${isEq ? 'equipped' : ''}" onclick="ItemStudio.toggleEquip('${id}')" id="card-${id}">
          <div class="item-card-top">
            <span class="item-slot-tag">${item.category || item.slot}</span>
            <span class="item-equip-status">${isEq ? '착용중 ✓' : ''}</span>
          </div>
          <div class="item-preview-box">
            ${iconSvg || `<span style="font-size: 26px;">${item.icon || '✨'}</span>`}
          </div>
          <div class="item-title">${item.name}</div>
          <div class="item-desc">${item.desc || ''}</div>
        </div>
      `;
    }
    container.innerHTML = html;
  },

  // 2. 찬양집회 스페셜 악기 카탈로그 렌더링
  renderPraiseMusicCatalog() {
    const container = document.getElementById('praise-items-container');
    if (!container) return;

    let html = '';
    for (const [id, item] of Object.entries(PRAISE_MUSIC_ITEM_PIXELS)) {
      const isEq = this.isEquipped(id);
      const iconSvg = this.generateItemSvg(item.pixels);

      html += `
        <div class="item-test-card ${isEq ? 'equipped' : ''}" onclick="ItemStudio.toggleEquip('${id}')" id="card-${id}">
          <div class="item-card-top">
            <span class="item-slot-tag" style="background: #f3e8ff; color: #7c3aed; border: 1px solid #d8b4fe;">찬양: ${item.category}</span>
            <span class="item-equip-status">${isEq ? '착용중 ✓' : ''}</span>
          </div>
          <div class="item-preview-box">
            ${iconSvg || `<span style="font-size: 26px;">${item.icon || '🎸'}</span>`}
          </div>
          <div class="item-title">${item.name}</div>
          <div class="item-desc">${item.desc || ''}</div>
        </div>
      `;
    }
    container.innerHTML = html;
  },

  // 3. 신규 프로토타입 카탈로그 렌더링
  renderPrototypeCatalog() {
    const container = document.getElementById('prototype-items-container');
    if (!container) return;

    let html = '';
    for (const [id, item] of Object.entries(PROTOTYPE_ITEM_PIXELS)) {
      const isEq = this.isEquipped(id);
      const iconSvg = this.generateItemSvg(item.pixels);

      html += `
        <div class="item-test-card ${isEq ? 'equipped' : ''}" onclick="ItemStudio.toggleEquip('${id}')" id="card-${id}">
          <div class="item-card-top">
            <span class="item-slot-tag" style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;">신규: ${item.category}</span>
            <span class="item-equip-status">${isEq ? '착용중 ✓' : ''}</span>
          </div>
          <div class="item-preview-box">
            ${iconSvg || `<span style="font-size: 26px;">${item.icon || '❄️'}</span>`}
          </div>
          <div class="item-title">${item.name}</div>
          <div class="item-desc">${item.desc || ''}</div>
        </div>
      `;
    }
    container.innerHTML = html;
  },

  // 픽셀 배열로부터 미리보기 SVG 생성기
  generateItemSvg(pixels, scale = 3) {
    if (!pixels || !pixels.length) return '';
    let minX = 24, maxX = 0, minY = 24, maxY = 0;
    for (const [x, y] of pixels) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const pad = 1.5;
    const vb = `${(minX - pad) * scale} ${(minY - pad) * scale} ${(maxX - minX + pad * 2 + 1) * scale} ${(maxY - minY + pad * 2 + 1) * scale}`;
    let rects = '';
    for (const [x, y, color] of pixels) {
      rects += `<rect x="${x * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="${color}" />`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" shape-rendering="crispEdges" style="width: auto; height: 50px; max-width: 64px; max-height: 50px; display: block; margin: 0 auto;">${rects}</svg>`;
  },

  // 장착 토글
  toggleEquip(itemId) {
    const item = getAnyItemInfo(itemId);
    if (!item) return;

    let slot = item.slot;
    if (slot === 'banner') slot = 'banner';
    else if (slot === 'grass' || slot === 'floor') slot = 'grass';
    else if (slot === 'neck') slot = 'neck';
    else if (slot === 'glasses') slot = 'glasses';
    else if (slot === 'head') slot = 'head';
    else if (slot === 'hold') slot = 'hold';
    else if (slot === 'side') slot = 'side';
    else if (slot === 'back') slot = 'back';

    if (this.equipped[slot] === itemId) {
      delete this.equipped[slot];
      this.showToast(`'${item.name}' 착용을 해제했습니다.`);
    } else {
      this.equipped[slot] = itemId;
      this.showToast(`'${item.name}'을(를) 착용했습니다! 🐑`);
    }

    this.updateCanvas();
    this.renderAllCatalogs();
    this.updateEquippedChips();
    this.updateJsonViewer();
  },

  // 전체 벗기기
  resetAllEquipped() {
    this.equipped = {};
    this.customPixels = [];
    this.updateCanvas();
    this.renderAllCatalogs();
    this.updateEquippedChips();
    this.updateJsonViewer();
    this.clearPixelCanvas();
    this.showToast('모든 아이템을 벗겼습니다.');
  },

  isEquipped(itemId) {
    return Object.values(this.equipped).includes(itemId);
  },

  // 스테이지 변경 (1~5)
  setStage(st) {
    this.stage = Math.max(1, Math.min(5, st));
    document.querySelectorAll('.stage-select-btn').forEach((btn, idx) => {
      btn.classList.toggle('active', idx + 1 === this.stage);
    });
    this.updateCanvas();
    this.updateJsonViewer();
  },

  // 배경 테마 변경
  setTheme(themeName) {
    this.theme = themeName;
    const stageBox = document.getElementById('charles-stage-box');
    if (stageBox) {
      stageBox.className = `charles-canvas-stage ${themeName}`;
    }
  },

  // 스케일/줌 변경
  setScale(sc) {
    this.scale = parseInt(sc, 10) || 10;
    const valText = document.getElementById('zoom-val-text');
    if (valText) valText.textContent = `${this.scale}x`;
    this.updateCanvas();
  },

  // 애니메이션 변경
  setAnim(anim) {
    this.animClass = anim;
    this.updateCanvas();
  },

  // 픽셀 격자 토글
  toggleGrid(on) {
    this.showGrid = on;
    const overlay = document.getElementById('charles-grid-overlay');
    if (overlay) {
      overlay.classList.toggle('active', on);
      overlay.style.backgroundSize = `${this.scale}px ${this.scale}px`;
    }
  },

  // ==========================================
  // 🌟 핵심: 찰스 + 프로토타입 + 커스텀 도트 통합 렌더러
  // ==========================================
  updateCanvas() {
    const slotEl = document.getElementById('charles-avatar-slot');
    if (!slotEl) return;

    // 1. 배너 및 상단 장식 착용 여부에 따른 동적 뷰포트 헤드룸(상단 여백) 계산
    const hasBanner = !!(this.equipped && this.equipped.banner);
    const bannerId = this.equipped ? this.equipped.banner : null;
    const hasMelody = this.equipped && this.equipped.back === 'back_melody_aura';

    const scale = this.scale;
    const canvasWidth = 24;
    const canvasHeight = 24;

    // 상단 돌출 아이템(배너: -6.0, 멜로디: -3.0, 왕관/산타모/귀도리: 0~2)을 위해 넉넉한 헤드룸 확보
    let topPaddingGrid = 4.0; // 기본 헤드룸: 왕관(y:0), 모자, 귀도리가 위로 닿지 않고 40px 여유 확보
    if (hasBanner) {
      topPaddingGrid = 9.0; // 배너 착용 시: -9.0까지 상단 확장 (배너가 -6.0에 위치하므로 상단 30px 완전 여유)
    } else if (hasMelody) {
      topPaddingGrid = 6.0; // 멜로디 음표 착용 시 여유 확보
    }

    const bottomPaddingGrid = 2.0; // 바닥 잔디/그림자 여유 공간
    const svgWidth = canvasWidth * scale;
    const viewBoxMinY = Math.round(-topPaddingGrid * scale);
    const viewBoxHeight = Math.round((canvasHeight + topPaddingGrid + bottomPaddingGrid) * scale);

    // Layer 0.5: 등 뒤 날개 / 멜로디 아우라 (Back)
    let backRects = '';
    const backItem = this.equipped.back;
    if (backItem && getAnyItemPixels(backItem)) {
      backRects += this.renderPixelArray(getAnyItemPixels(backItem), scale);
    } else if (this.customSlot === 'back' && this.customPixels.length) {
      backRects += this.renderPixelArray(this.customPixels, scale);
    }

    // Layer 1: Floor / Grass (바닥 잔디/눈꽃)
    let grassRects = '';
    const grassItem = this.equipped.grass;
    if (grassItem) {
      if (grassItem === 'back_maple_carpet' && typeof renderAutumnAccessory === 'function') {
        grassRects += renderAutumnAccessory('back_maple_carpet', scale);
      } else if (grassItem === 'back_daisy_field' && typeof renderAccessoryDaisyField === 'function') {
        grassRects += renderAccessoryDaisyField(scale);
      } else if (getAnyItemPixels(grassItem)) {
        grassRects += this.renderPixelArray(getAnyItemPixels(grassItem), scale);
      }
    }
    if (this.customSlot === 'grass' && this.customPixels.length) {
      grassRects += this.renderPixelArray(this.customPixels, scale);
    }

    // Layer 1.5: Side 소품 (스탠드 마이크, 신디사이저, 단호박, 눈사람, 선물상자 등)
    let sideRects = '';
    const sideItem = this.equipped.side;
    if (sideItem) {
      if (sideItem === 'side_autumn_pumpkin' && typeof renderAutumnAccessory === 'function') {
        sideRects += renderAutumnAccessory('side_autumn_pumpkin', scale);
      } else if (getAnyItemPixels(sideItem)) {
        sideRects += this.renderPixelArray(getAnyItemPixels(sideItem), scale);
      }
    }
    if (this.customSlot === 'side' && this.customPixels.length) {
      sideRects += this.renderPixelArray(this.customPixels, scale);
    }

    // Layer 2: 찰스 본체 (1~5단계 정밀 픽셀)
    let bodyRects = '';
    const stagePixels = (typeof CHARLES_NEW_STAGES !== 'undefined') ? CHARLES_NEW_STAGES[this.stage] : null;
    if (stagePixels && Array.isArray(stagePixels)) {
      for (let i = 0; i < stagePixels.length; i++) {
        const px = stagePixels[i];
        bodyRects += `<rect x="${px[0] * scale}" y="${px[1] * scale}" width="${scale}" height="${scale}" fill="${px[2]}" />`;
      }
    }

    // Layer 2.5: Neck 목도리
    let neckRects = '';
    const neckItem = this.equipped.neck;
    if (neckItem) {
      if (neckItem === 'neck_acorn_scarf' && typeof renderAutumnAccessory === 'function') {
        neckRects += renderAutumnAccessory('neck_acorn_scarf', scale);
      } else if (getAnyItemPixels(neckItem)) {
        neckRects += this.renderPixelArray(getAnyItemPixels(neckItem), scale);
      }
    }
    if (this.customSlot === 'neck' && this.customPixels.length) {
      neckRects += this.renderPixelArray(this.customPixels, scale);
    }

    // Layer 3: Glasses 안경
    let glassesRects = '';
    const glassesItem = this.equipped.glasses;
    if (glassesItem === 'head_glasses' && typeof renderAccessoryGlasses === 'function') {
      glassesRects += renderAccessoryGlasses(scale, 0);
    }

    // Layer 4: Head 모자/헤어/헤드폰
    let headRects = '';
    const headItem = this.equipped.head;
    if (headItem) {
      if (headItem === 'head_maple_beret' && typeof renderAutumnAccessory === 'function') {
        headRects += renderAutumnAccessory('head_maple_beret', scale);
      } else if (headItem === 'head_straw_hat' && typeof renderAccessoryStrawHat === 'function') {
        headRects += renderAccessoryStrawHat(scale);
      } else if (getAnyItemPixels(headItem)) {
        headRects += this.renderPixelArray(getAnyItemPixels(headItem), scale);
      }
    }
    if (this.customSlot === 'head' && this.customPixels.length) {
      headRects += this.renderPixelArray(this.customPixels, scale);
    }

    // Layer 5: Hold 손 소품 (마이크, 통기타, 일렉기타, 탬버린, 성경 등)
    let holdRects = '';
    const holdItem = this.equipped.hold;
    if (holdItem) {
      if (holdItem === 'hold_bible' && typeof renderAccessoryBible === 'function') {
        holdRects += renderAccessoryBible(scale);
      } else if ((holdItem === 'hold_autumn_lantern' || holdItem === 'hold_apple_basket') && typeof renderAutumnAccessory === 'function') {
        holdRects += renderAutumnAccessory(holdItem, scale);
      } else if (getAnyItemPixels(holdItem)) {
        holdRects += this.renderPixelArray(getAnyItemPixels(holdItem), scale);
      }
    }
    if (this.customSlot === 'hold' && this.customPixels.length) {
      holdRects += this.renderPixelArray(this.customPixels, scale);
    }

    // Layer 6: Banner 머리 위 찬양 배너
    let bannerRects = '';
    if (bannerId && typeof renderAccessoryHeaderBanner === 'function') {
      bannerRects += renderAccessoryHeaderBanner(bannerId, scale);
    }

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${viewBoxMinY} ${svgWidth} ${viewBoxHeight}" 
           class="charles-svg ${this.animClass}" 
           style="image-rendering: pixelated; shape-rendering: crispEdges; width: 100%; height: auto; max-width: 220px; display: block; margin: 0 auto;">
        <g class="layer-back">${backRects}</g>
        <g class="layer-grass">${grassRects}</g>
        <g class="layer-body">${bodyRects}</g>
        <g class="layer-side">${sideRects}</g>
        <g class="layer-neck">${neckRects}</g>
        <g class="layer-glasses">${glassesRects}</g>
        <g class="layer-head">${headRects}</g>
        <g class="layer-hold">${holdRects}</g>
        <g class="layer-banner">${bannerRects}</g>
      </svg>
    `;

    slotEl.innerHTML = svg;

    // 그리드 오버레이 크기 갱신
    if (this.showGrid) {
      this.toggleGrid(true);
    }
  },

  renderPixelArray(pixels, scale) {
    if (!pixels || !Array.isArray(pixels)) return '';
    let res = '';
    for (let i = 0; i < pixels.length; i++) {
      const p = pixels[i];
      res += `<rect x="${p[0] * scale}" y="${p[1] * scale}" width="${scale}" height="${scale}" fill="${p[2]}" />`;
    }
    return res;
  },

  // 착용 중인 슬롯 칩 UI 갱신
  updateEquippedChips() {
    const container = document.getElementById('equipped-slots-list');
    if (!container) return;

    const slots = ['head', 'glasses', 'neck', 'hold', 'side', 'grass', 'back', 'banner'];
    let html = '';

    for (const s of slots) {
      const itemId = this.equipped[s];
      if (!itemId) continue;

      const itemInfo = getAnyItemInfo(itemId);
      const name = itemInfo ? itemInfo.name : itemId;
      const icon = itemInfo ? (itemInfo.icon || '✨') : '🏷️';

      html += `
        <div class="slot-chip">
          <div class="slot-chip-left">
            <span class="slot-icon">${icon}</span>
            <div class="slot-info">
              <span class="slot-type">${s}</span>
              <span class="slot-name">${name}</span>
            </div>
          </div>
          <button type="button" class="btn-slot-remove" onclick="ItemStudio.unequipSlot('${s}')" title="벗기기">&times;</button>
        </div>
      `;
    }

    if (!html) {
      html = `<div style="grid-column: span 2; text-align: center; color: #9ca3af; font-size: 11.5px; padding: 12px 0;">착용 중인 아이템이 없습니다 🐑</div>`;
    }

    container.innerHTML = html;
  },

  unequipSlot(slot) {
    delete this.equipped[slot];
    this.updateCanvas();
    this.renderCurrentCatalog();
    this.renderPrototypeCatalog();
    this.updateEquippedChips();
    this.updateJsonViewer();
  },

  // JSON 뷰어 갱신
  updateJsonViewer() {
    const viewer = document.getElementById('json-code-viewer');
    if (!viewer) return;

    const exportData = {
      stage: this.stage,
      equipped: this.equipped,
      itemsCount: Object.keys(this.equipped).length,
      timestamp: new Date().toISOString()
    };

    viewer.textContent = JSON.stringify(exportData, null, 2);
  },

  // ==========================================
  // 🎨 인터랙티브 픽셀 도트 에디터
  // ==========================================
  initPixelCanvas() {
    const grid = document.getElementById('pixel-grid-canvas');
    if (!grid) return;

    grid.innerHTML = '';
    for (let y = 0; y < 24; y++) {
      for (let x = 0; x < 24; x++) {
        const cell = document.createElement('div');
        cell.className = 'pixel-grid-cell';
        cell.dataset.x = x;
        cell.dataset.y = y;
        grid.appendChild(cell);
      }
    }

    // 마우스 이벤트 바인딩
    grid.addEventListener('mousedown', (e) => {
      this.isMouseDown = true;
      this.handleCellPaint(e.target);
    });

    grid.addEventListener('mouseover', (e) => {
      if (this.isMouseDown) {
        this.handleCellPaint(e.target);
      }
      this.updateHudCoords(e.target);
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    this.renderColorPalette();
  },

  handleCellPaint(target) {
    if (!target || !target.classList.contains('pixel-grid-cell')) return;
    const x = parseInt(target.dataset.x, 10);
    const y = parseInt(target.dataset.y, 10);

    if (this.drawTool === 'eraser') {
      target.style.backgroundColor = '';
      this.customPixels = this.customPixels.filter(p => !(p[0] === x && p[1] === y));
    } else {
      target.style.backgroundColor = this.activeDrawColor;
      this.customPixels = this.customPixels.filter(p => !(p[0] === x && p[1] === y));
      this.customPixels.push([x, y, this.activeDrawColor]);
    }

    this.updateCanvas();
    this.updateDotCodeExport();
  },

  updateHudCoords(target) {
    const hud = document.getElementById('hud-coords-text');
    if (!hud) return;
    if (target && target.classList.contains('pixel-grid-cell')) {
      hud.textContent = `X: ${target.dataset.x}, Y: ${target.dataset.y}`;
    }
  },

  renderColorPalette() {
    const container = document.getElementById('color-palette-container');
    if (!container) return;

    const defaultColors = [
      '#18181b', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
      '#8b5cf6', '#ec4899', '#b45309', '#78350f', '#fde047', '#a7f3d0', '#bae6fd', '#cbd5e1'
    ];

    let html = '';
    defaultColors.forEach(c => {
      html += `<div class="color-swatch ${c === this.activeDrawColor ? 'active' : ''}" style="background-color: ${c};" onclick="ItemStudio.setDrawColor('${c}', this)"></div>`;
    });
    container.innerHTML = html;
  },

  setDrawColor(c, el) {
    this.activeDrawColor = c;
    this.drawTool = 'pencil';
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    if (el) el.classList.add('active');
    const customPicker = document.getElementById('custom-color-picker');
    if (customPicker) customPicker.value = c;
  },

  setDrawTool(tool) {
    this.drawTool = tool;
    document.getElementById('tool-pencil')?.classList.toggle('active', tool === 'pencil');
    document.getElementById('tool-eraser')?.classList.toggle('active', tool === 'eraser');
  },

  clearPixelCanvas() {
    this.customPixels = [];
    document.querySelectorAll('.pixel-grid-cell').forEach(cell => cell.style.backgroundColor = '');
    this.updateCanvas();
    this.updateDotCodeExport();
    this.showToast('도트 캔버스를 초기화했습니다.');
  },

  setCustomSlot(slot) {
    this.customSlot = slot;
    this.updateCanvas();
    this.updateDotCodeExport();
  },

  // 찰스 투명 실루엣 가이드 토글
  toggleGuideLayer(on) {
    this.showGuide = on;
    const stagePixels = (typeof CHARLES_NEW_STAGES !== 'undefined') ? CHARLES_NEW_STAGES[this.stage] : null;
    document.querySelectorAll('.pixel-grid-cell').forEach(cell => {
      const x = parseInt(cell.dataset.x, 10);
      const y = parseInt(cell.dataset.y, 10);
      const isCharles = stagePixels && stagePixels.some(p => p[0] === x && p[1] === y);
      if (on && isCharles && !cell.style.backgroundColor) {
        cell.style.boxShadow = 'inset 0 0 0 100px rgba(16, 185, 129, 0.15)';
      } else if (!on) {
        cell.style.boxShadow = '';
      }
    });
  },

  // 픽셀 배열 코드 생성
  updateDotCodeExport() {
    const viewer = document.getElementById('dot-code-export-viewer');
    if (!viewer) return;

    if (!this.customPixels.length) {
      viewer.textContent = `// 도트를 찍으면 이곳에 JavaScript 코드가 실시간으로 자동 생성됩니다.`;
      return;
    }

    let minX = 24, maxX = 0, minY = 24, maxY = 0;
    for (const [x, y] of this.customPixels) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    const code = `// [신규 아이템: ${this.customSlot} 슬롯]
bounds: { minX: ${minX}, maxX: ${maxX}, minY: ${minY}, maxY: ${maxY} },
pixels: ${JSON.stringify(this.customPixels)}`;

    viewer.textContent = code;
  },

  // ==========================================
  // 💾 프리셋 및 계정 주입
  // ==========================================
  applyPreset(presetName) {
    if (presetName === 'classic') {
      this.equipped = {
        head: 'head_straw_hat',
        glasses: 'head_glasses',
        hold: 'hold_bible',
        grass: 'back_daisy_field'
      };
      this.setStage(3);
      this.setTheme('theme-pasture');
    } else if (presetName === 'autumn') {
      this.equipped = {
        head: 'head_maple_beret',
        neck: 'neck_acorn_scarf',
        hold: 'hold_apple_basket',
        side: 'side_autumn_pumpkin',
        grass: 'back_maple_carpet'
      };
      this.setStage(4);
      this.setTheme('theme-autumn');
    } else if (presetName === 'xmas') {
      this.equipped = {
        head: 'head_santa_hat',
        neck: 'neck_winter_muffler',
        hold: 'hold_hot_cocoa',
        side: 'side_winter_snowman',
        grass: 'back_snow_carpet'
      };
      this.setStage(4);
      this.setTheme('theme-winter');
    } else if (presetName === 'blessed') {
      this.equipped = {
        head: 'head_golden_crown',
        back: 'back_angel_wings',
        hold: 'hold_shepherd_staff',
        banner: 'banner_only_jesus'
      };
      this.setStage(5);
      this.setTheme('theme-night');
    } else if (presetName === 'worship_guitar') {
      this.equipped = {
        hold: 'hold_acoustic_guitar',
        side: 'side_vintage_stand_mic',
        back: 'back_melody_aura',
        head: 'head_worship_headphones',
        banner: 'banner_king_god'
      };
      this.setStage(4);
      this.setTheme('theme-night');
    } else if (presetName === 'worship_vocal') {
      this.equipped = {
        hold: 'hold_worship_mic',
        side: 'side_worship_synth',
        back: 'back_melody_aura',
        banner: 'banner_living_hope'
      };
      this.setStage(5);
      this.setTheme('theme-pasture');
    }

    this.updateCanvas();
    this.renderAllCatalogs();
    this.updateEquippedChips();
    this.updateJsonViewer();
    this.showToast(`'${presetName}' 프리셋을 적용했습니다! ✨`);
  },

  // 내 실제 계정에 임시 주입하기
  injectToMyAccount() {
    let uid = 'guest';
    try {
      if (typeof StorageService !== 'undefined' && StorageService.getCurrentUserId) {
        uid = StorageService.getCurrentUserId();
      }
    } catch (e) {}

    const key = `charles_user_${uid}_equipped`;
    // 백업
    if (!this.originalUserEquippedBackup) {
      this.originalUserEquippedBackup = localStorage.getItem(key);
    }

    localStorage.setItem(key, JSON.stringify(this.equipped));
    this.showToast(`현재 기기의 내 계정(${uid})에 착용 상태를 임시 주입했습니다! 🐑`);
  },

  restoreMyAccount() {
    let uid = 'guest';
    try {
      if (typeof StorageService !== 'undefined' && StorageService.getCurrentUserId) {
        uid = StorageService.getCurrentUserId();
      }
    } catch (e) {}

    const key = `charles_user_${uid}_equipped`;
    if (this.originalUserEquippedBackup !== null) {
      localStorage.setItem(key, this.originalUserEquippedBackup);
      this.showToast('원래 계정의 착용 상태로 복구했습니다.');
    } else {
      this.showToast('복구할 백업 내역이 없습니다.');
    }
  },

  // 복사 유틸
  copyToClipboard(text, msg = '클립보드에 복사되었습니다!') {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(msg);
    }).catch(err => {
      console.error(err);
      this.showToast('복사에 실패했습니다.');
    });
  },

  copyEquippedJson() {
    const text = JSON.stringify(this.equipped, null, 2);
    this.copyToClipboard(text, '착용 JSON이 복사되었습니다! 📋');
  },

  copyDotCode() {
    const viewer = document.getElementById('dot-code-export-viewer');
    if (viewer) {
      this.copyToClipboard(viewer.textContent, '픽셀 코드가 복사되었습니다! 📋');
    }
  },

  showToast(msg) {
    const toast = document.getElementById('studio-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  },

  switchTab(tabId) {
    document.querySelectorAll('.studio-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === `tab-pane-${tabId}`));
  },

  bindEvents() {
    // 탭 전환
    document.querySelectorAll('.studio-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // 컬러 피커
    const picker = document.getElementById('custom-color-picker');
    if (picker) {
      picker.addEventListener('input', (e) => {
        this.setDrawColor(e.target.value);
      });
    }
  }
};

window.addEventListener('DOMContentLoaded', () => {
  ItemStudio.init();
});
