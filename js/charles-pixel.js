/**
 * Charles' Bible - 찰스 단계별 그래픽 및 픽셀 악세사리 렌더러
 * [공식 신규 1~5단계 찰스 및 가을/기본 컬렉션 24x24 완벽 핏 지원]
 */

const CHARLES_STAGES = {
  1: {
    stage: 1,
    name: "배고픈 찰스",
    title: "Charles is starving.",
    badge: "starving",
    level: 1,
    desc: "말씀이 고픈 아기 찰스",
    gaugeDesc: "말씀을 읽으면 건강하게 무럭무럭 자라나요!",
    dialogues: [
      "음메에~ 배고파요! 말씀 풀을 먹고 쑥쑥 자라고 싶어요 🐑",
      "오늘의 성경 말씀을 한 장 읽어주시면 힘이 번쩍 날 것 같아요! ✨",
      "말씀 묵상하러 가실 거죠? 찰스가 옆에서 응원할게요! 💕"
    ]
  },
  2: {
    stage: 2,
    name: "풀먹는 찰스",
    title: "Charles is chewing the Word.",
    badge: "chewing",
    level: 2,
    desc: "말씀을 냠냠 먹는 찰스",
    gaugeDesc: "말씀을 꾸준히 읽어 포동포동 털이 차오르고 있어요!",
    dialogues: [
      "우물우물~ 성경 말씀이 꿀보다 더 달콤해요! 🌿✨",
      "성도님 덕분에 영혼이 쑥쑥 살찌고 있어요! 히히 🐑",
      "오늘 읽은 말씀 한 구절, 마음에 꼭 품고 승리해요! 📖"
    ]
  },
  3: {
    stage: 3,
    name: "행복한 찰스",
    title: "Charles is joyful.",
    badge: "joyful",
    level: 3,
    desc: "기쁨이 가득한 찰스",
    gaugeDesc: "말씀의 힘으로 날마다 승리하며 기쁨이 샘솟아요!",
    dialogues: [
      "주님 안에서 늘 기뻐해요! 오늘도 싱글벙글 웃는 날~ 🌸",
      "성도님과 함께 걷는 말씀의 길, 찰스는 너무 행복해요! 🐑💕",
      "우리의 기쁨이 청년부 모든 지체들에게도 전해지길 바라요! ✨"
    ]
  },
  4: {
    stage: 4,
    name: "풍성한 찰스",
    title: "Charles is extra fluffy.",
    badge: "fluffy",
    level: 4,
    desc: "말씀으로 복슬복슬해진 찰스",
    gaugeDesc: "온유와 충성의 열매가 탐스럽게 맺혀가고 있어요!",
    dialogues: [
      "복슬복슬~ 말씀의 은혜가 몸도 마음도 따스하게 감싸줘요! ☁️",
      "이제 어떤 시련이 와도 말씀의 든든한 방패로 이겨낼 수 있어요! 🛡️",
      "선한 목자 되신 주님을 온 맘 다해 찬양합니다! 🐑🎶"
    ]
  },
  5: {
    stage: 5,
    name: "성령충만 찰스",
    title: "Charles is blessed.",
    badge: "blessed",
    level: 5,
    desc: "은혜와 축복이 넘치는 찰스",
    gaugeDesc: "할렐루야! 말씀 통독으로 하나님께 큰 영광을 올려드렸어요!",
    dialogues: [
      "할렐루야! 말씀의 면류관을 쓴 영광의 어린양 찰스예요! 👑✨",
      "끝까지 믿음의 경주를 완주하신 성도님, 정말 자랑스러워요! 🕊️",
      "주님의 보좌 앞에서 날마다 감사의 찬양을 올려드려요! 아멘! 🐑💖"
    ]
  }
};


// 李곗뒪 怨듭떇 1~5?④퀎 ?뺣? ?쎌? ?꾪듃 ?꾪듃
const CHARLES_NEW_STAGES = {
  1: [
    [9, 5, '#18181b'],
    [10, 5, '#18181b'],
    [11, 5, '#18181b'],
    [12, 5, '#18181b'],
    [13, 5, '#18181b'],
    [14, 5, '#18181b'],
    [7, 6, '#18181b'],
    [8, 6, '#18181b'],
    [9, 6, '#ffffff'],
    [10, 6, '#ffffff'],
    [11, 6, '#ffffff'],
    [12, 6, '#ffffff'],
    [13, 6, '#ffffff'],
    [14, 6, '#ffffff'],
    [15, 6, '#18181b'],
    [16, 6, '#18181b'],
    [6, 7, '#18181b'],
    [7, 7, '#ffffff'],
    [8, 7, '#ffffff'],
    [9, 7, '#ffffff'],
    [10, 7, '#ffffff'],
    [11, 7, '#ffffff'],
    [12, 7, '#ffffff'],
    [13, 7, '#ffffff'],
    [14, 7, '#ffffff'],
    [15, 7, '#ffffff'],
    [16, 7, '#ffffff'],
    [17, 7, '#18181b'],
    [5, 8, '#18181b'],
    [6, 8, '#ffffff'],
    [7, 8, '#ffffff'],
    [8, 8, '#ffffff'],
    [9, 8, '#ffffff'],
    [10, 8, '#ffffff'],
    [11, 8, '#ffffff'],
    [12, 8, '#ffffff'],
    [13, 8, '#ffffff'],
    [14, 8, '#ffffff'],
    [15, 8, '#ffffff'],
    [16, 8, '#ffffff'],
    [17, 8, '#18181b'],
    [4, 9, '#18181b'],
    [5, 9, '#ffffff'],
    [6, 9, '#18181b'],
    [7, 9, '#ffffff'],
    [8, 9, '#ffffff'],
    [9, 9, '#ffffff'],
    [10, 9, '#ffffff'],
    [11, 9, '#ffffff'],
    [12, 9, '#ffffff'],
    [13, 9, '#ffffff'],
    [14, 9, '#ffffff'],
    [15, 9, '#ffffff'],
    [16, 9, '#ffffff'],
    [17, 9, '#18181b'],
    [5, 10, '#18181b'],
    [6, 10, '#ffffff'],
    [7, 10, '#ffffff'],
    [8, 10, '#18181b'],
    [9, 10, '#18181b'],
    [10, 10, '#ffffff'],
    [11, 10, '#ffffff'],
    [12, 10, '#18181b'],
    [13, 10, '#18181b'],
    [14, 10, '#ffffff'],
    [15, 10, '#ffffff'],
    [16, 10, '#cbd5e1'],
    [17, 10, '#18181b'],
    [5, 11, '#18181b'],
    [6, 11, '#ffffff'],
    [7, 11, '#ffffff'],
    [8, 11, '#ffffff'],
    [9, 11, '#18181b'],
    [10, 11, '#18181b'],
    [11, 11, '#ffffff'],
    [12, 11, '#ffffff'],
    [13, 11, '#18181b'],
    [14, 11, '#18181b'],
    [15, 11, '#ffffff'],
    [16, 11, '#ffffff'],
    [17, 11, '#18181b'],
    [5, 12, '#18181b'],
    [6, 12, '#ffffff'],
    [7, 12, '#ffffff'],
    [8, 12, '#ffffff'],
    [9, 12, '#ffffff'],
    [10, 12, '#ffffff'],
    [11, 12, '#ffffff'],
    [12, 12, '#ffffff'],
    [13, 12, '#ffffff'],
    [14, 12, '#ffffff'],
    [15, 12, '#ffffff'],
    [16, 12, '#ffffff'],
    [17, 12, '#18181b'],
    [5, 13, '#18181b'],
    [6, 13, '#ffffff'],
    [7, 13, '#ffffff'],
    [8, 13, '#ffffff'],
    [9, 13, '#cbd5e1'],
    [10, 13, '#18181b'],
    [11, 13, '#ffffff'],
    [12, 13, '#18181b'],
    [13, 13, '#ffffff'],
    [14, 13, '#ffffff'],
    [15, 13, '#ffffff'],
    [16, 13, '#ffffff'],
    [17, 13, '#18181b'],
    [6, 14, '#18181b'],
    [7, 14, '#ffffff'],
    [8, 14, '#ffffff'],
    [9, 14, '#ffffff'],
    [10, 14, '#ffffff'],
    [11, 14, '#18181b'],
    [12, 14, '#ffffff'],
    [13, 14, '#ffffff'],
    [14, 14, '#ffffff'],
    [15, 14, '#ffffff'],
    [16, 14, '#18181b'],
    [7, 15, '#18181b'],
    [8, 15, '#18181b'],
    [9, 15, '#18181b'],
    [10, 15, '#18181b'],
    [11, 15, '#18181b'],
    [12, 15, '#18181b'],
    [13, 15, '#18181b'],
    [14, 15, '#18181b'],
    [15, 15, '#18181b'],
    [7, 16, '#18181b'],
    [8, 16, '#18181b'],
    [13, 16, '#18181b'],
    [14, 16, '#18181b'],
    [7, 17, '#18181b'],
    [8, 17, '#18181b'],
    [13, 17, '#18181b'],
    [14, 17, '#18181b'],
  ],
  2: [
    [9, 5, '#18181b'],
    [10, 5, '#18181b'],
    [11, 5, '#18181b'],
    [12, 5, '#18181b'],
    [13, 5, '#18181b'],
    [14, 5, '#18181b'],
    [7, 6, '#18181b'],
    [8, 6, '#18181b'],
    [9, 6, '#ffffff'],
    [10, 6, '#ffffff'],
    [11, 6, '#ffffff'],
    [12, 6, '#ffffff'],
    [13, 6, '#ffffff'],
    [14, 6, '#ffffff'],
    [15, 6, '#18181b'],
    [16, 6, '#18181b'],
    [6, 7, '#18181b'],
    [7, 7, '#ffffff'],
    [8, 7, '#ffffff'],
    [9, 7, '#ffffff'],
    [10, 7, '#ffffff'],
    [11, 7, '#ffffff'],
    [12, 7, '#ffffff'],
    [13, 7, '#ffffff'],
    [14, 7, '#ffffff'],
    [15, 7, '#ffffff'],
    [16, 7, '#ffffff'],
    [17, 7, '#18181b'],
    [5, 8, '#18181b'],
    [6, 8, '#ffffff'],
    [7, 8, '#ffffff'],
    [8, 8, '#ffffff'],
    [9, 8, '#ffffff'],
    [10, 8, '#ffffff'],
    [11, 8, '#ffffff'],
    [12, 8, '#ffffff'],
    [13, 8, '#ffffff'],
    [14, 8, '#ffffff'],
    [15, 8, '#ffffff'],
    [16, 8, '#ffffff'],
    [17, 8, '#18181b'],
    [4, 9, '#18181b'],
    [5, 9, '#ffffff'],
    [6, 9, '#18181b'],
    [7, 9, '#ffffff'],
    [8, 9, '#ffffff'],
    [9, 9, '#ffffff'],
    [10, 9, '#ffffff'],
    [11, 9, '#ffffff'],
    [12, 9, '#ffffff'],
    [13, 9, '#ffffff'],
    [14, 9, '#ffffff'],
    [15, 9, '#ffffff'],
    [16, 9, '#e2e8f0'],
    [17, 9, '#18181b'],
    [5, 10, '#18181b'],
    [6, 10, '#ffffff'],
    [7, 10, '#ffffff'],
    [8, 10, '#ffffff'],
    [9, 10, '#18181b'],
    [10, 10, '#18181b'],
    [11, 10, '#ffffff'],
    [12, 10, '#ffffff'],
    [13, 10, '#18181b'],
    [14, 10, '#18181b'],
    [15, 10, '#ffffff'],
    [16, 10, '#e2e8f0'],
    [17, 10, '#18181b'],
    [5, 11, '#18181b'],
    [6, 11, '#ffffff'],
    [7, 11, '#ffffff'],
    [8, 11, '#18181b'],
    [9, 11, '#18181b'],
    [10, 11, '#ffffff'],
    [11, 11, '#ffffff'],
    [12, 11, '#18181b'],
    [13, 11, '#52b788'],
    [14, 11, '#ffffff'],
    [15, 11, '#ffffff'],
    [16, 11, '#ffffff'],
    [17, 11, '#18181b'],
    [5, 12, '#18181b'],
    [6, 12, '#ffffff'],
    [7, 12, '#ff8ea3'],
    [8, 12, '#ffffff'],
    [9, 12, '#e2e8f0'],
    [10, 12, '#18181b'],
    [11, 12, '#52b788'],
    [12, 12, '#52b788'],
    [13, 12, '#52b788'],
    [14, 12, '#52b788'],
    [15, 12, '#ff8ea3'],
    [16, 12, '#ffffff'],
    [17, 12, '#18181b'],
    [5, 13, '#18181b'],
    [6, 13, '#ffffff'],
    [7, 13, '#ffffff'],
    [8, 13, '#ffffff'],
    [9, 13, '#ffffff'],
    [10, 13, '#ffffff'],
    [11, 13, '#ffffff'],
    [12, 13, '#ffffff'],
    [13, 13, '#52b788'],
    [14, 13, '#52b788'],
    [15, 13, '#ffffff'],
    [16, 13, '#ffffff'],
    [17, 13, '#18181b'],
    [6, 14, '#18181b'],
    [7, 14, '#ffffff'],
    [8, 14, '#ffffff'],
    [9, 14, '#ffffff'],
    [10, 14, '#ffffff'],
    [11, 14, '#ffffff'],
    [12, 14, '#ffffff'],
    [13, 14, '#ffffff'],
    [14, 14, '#ffffff'],
    [15, 14, '#ffffff'],
    [16, 14, '#18181b'],
    [7, 15, '#18181b'],
    [8, 15, '#18181b'],
    [9, 15, '#18181b'],
    [10, 15, '#18181b'],
    [11, 15, '#18181b'],
    [12, 15, '#18181b'],
    [13, 15, '#18181b'],
    [14, 15, '#18181b'],
    [15, 15, '#18181b'],
    [7, 16, '#18181b'],
    [8, 16, '#18181b'],
    [13, 16, '#18181b'],
    [14, 16, '#18181b'],
    [7, 17, '#18181b'],
    [8, 17, '#18181b'],
    [13, 17, '#18181b'],
    [14, 17, '#18181b'],
  ],
  3: [
    [9, 5, '#18181b'],
    [10, 5, '#18181b'],
    [11, 5, '#18181b'],
    [12, 5, '#18181b'],
    [13, 5, '#18181b'],
    [14, 5, '#18181b'],
    [7, 6, '#18181b'],
    [8, 6, '#18181b'],
    [9, 6, '#ffffff'],
    [10, 6, '#ffffff'],
    [11, 6, '#ffffff'],
    [12, 6, '#ffffff'],
    [13, 6, '#ffffff'],
    [14, 6, '#ffffff'],
    [15, 6, '#18181b'],
    [16, 6, '#18181b'],
    [6, 7, '#18181b'],
    [7, 7, '#ffffff'],
    [8, 7, '#ffffff'],
    [9, 7, '#ffffff'],
    [10, 7, '#ffffff'],
    [11, 7, '#ffffff'],
    [12, 7, '#ffffff'],
    [13, 7, '#ffffff'],
    [14, 7, '#ffffff'],
    [15, 7, '#ffffff'],
    [16, 7, '#ffffff'],
    [17, 7, '#18181b'],
    [5, 8, '#18181b'],
    [6, 8, '#ffffff'],
    [7, 8, '#ffffff'],
    [8, 8, '#ffffff'],
    [9, 8, '#ffffff'],
    [10, 8, '#ffffff'],
    [11, 8, '#ffffff'],
    [12, 8, '#ffffff'],
    [13, 8, '#ffffff'],
    [14, 8, '#ffffff'],
    [15, 8, '#ffffff'],
    [16, 8, '#ffffff'],
    [17, 8, '#18181b'],
    [4, 9, '#18181b'],
    [5, 9, '#ffffff'],
    [6, 9, '#18181b'],
    [7, 9, '#ffffff'],
    [8, 9, '#ffffff'],
    [9, 9, '#18181b'],
    [10, 9, '#ffffff'],
    [11, 9, '#ffffff'],
    [12, 9, '#ffffff'],
    [13, 9, '#18181b'],
    [14, 9, '#ffffff'],
    [15, 9, '#ffffff'],
    [16, 9, '#e2e8f0'],
    [17, 9, '#18181b'],
    [5, 10, '#18181b'],
    [6, 10, '#ffffff'],
    [7, 10, '#ffffff'],
    [8, 10, '#18181b'],
    [9, 10, '#ffffff'],
    [10, 10, '#18181b'],
    [11, 10, '#ffffff'],
    [12, 10, '#18181b'],
    [13, 10, '#ffffff'],
    [14, 10, '#18181b'],
    [15, 10, '#ffffff'],
    [16, 10, '#e2e8f0'],
    [17, 10, '#18181b'],
    [5, 11, '#18181b'],
    [6, 11, '#ffffff'],
    [7, 11, '#ff8ea3'],
    [8, 11, '#ff8ea3'],
    [9, 11, '#ffffff'],
    [10, 11, '#ffffff'],
    [11, 11, '#ffffff'],
    [12, 11, '#ffffff'],
    [13, 11, '#ffffff'],
    [14, 11, '#ff8ea3'],
    [15, 11, '#ff8ea3'],
    [16, 11, '#ffffff'],
    [17, 11, '#18181b'],
    [5, 12, '#18181b'],
    [6, 12, '#ffffff'],
    [7, 12, '#ffffff'],
    [8, 12, '#ffffff'],
    [9, 12, '#ffffff'],
    [10, 12, '#18181b'],
    [11, 12, '#18181b'],
    [12, 12, '#18181b'],
    [13, 12, '#ffffff'],
    [14, 12, '#ffffff'],
    [15, 12, '#ffffff'],
    [16, 12, '#ffffff'],
    [17, 12, '#18181b'],
    [5, 13, '#18181b'],
    [6, 13, '#ffffff'],
    [7, 13, '#ffffff'],
    [8, 13, '#ffffff'],
    [9, 13, '#ffffff'],
    [10, 13, '#ffffff'],
    [11, 13, '#ffffff'],
    [12, 13, '#ffffff'],
    [13, 13, '#ffffff'],
    [14, 13, '#ffffff'],
    [15, 13, '#ffffff'],
    [16, 13, '#ffffff'],
    [17, 13, '#18181b'],
    [6, 14, '#18181b'],
    [7, 14, '#ffffff'],
    [8, 14, '#ffffff'],
    [9, 14, '#ffffff'],
    [10, 14, '#ffffff'],
    [11, 14, '#ffffff'],
    [12, 14, '#ffffff'],
    [13, 14, '#ffffff'],
    [14, 14, '#ffffff'],
    [15, 14, '#ffffff'],
    [16, 14, '#18181b'],
    [7, 15, '#18181b'],
    [8, 15, '#18181b'],
    [9, 15, '#18181b'],
    [10, 15, '#18181b'],
    [11, 15, '#18181b'],
    [12, 15, '#18181b'],
    [13, 15, '#18181b'],
    [14, 15, '#18181b'],
    [15, 15, '#18181b'],
    [7, 16, '#18181b'],
    [8, 16, '#18181b'],
    [13, 16, '#18181b'],
    [14, 16, '#18181b'],
    [7, 17, '#18181b'],
    [8, 17, '#18181b'],
    [13, 17, '#18181b'],
    [14, 17, '#18181b'],
  ],
  4: [
    [11, 3, '#18181b'],
    [12, 3, '#18181b'],
    [8, 4, '#18181b'],
    [9, 4, '#18181b'],
    [10, 4, '#18181b'],
    [11, 4, '#ffffff'],
    [12, 4, '#ffffff'],
    [13, 4, '#18181b'],
    [14, 4, '#18181b'],
    [15, 4, '#18181b'],
    [7, 5, '#18181b'],
    [8, 5, '#ffffff'],
    [9, 5, '#ffffff'],
    [10, 5, '#18181b'],
    [11, 5, '#ffffff'],
    [12, 5, '#ffffff'],
    [13, 5, '#18181b'],
    [14, 5, '#ffffff'],
    [15, 5, '#ffffff'],
    [16, 5, '#18181b'],
    [9, 6, '#ffffff'],
    [10, 6, '#ffffff'],
    [11, 6, '#ffffff'],
    [12, 6, '#ffffff'],
    [13, 6, '#ffffff'],
    [14, 6, '#ffffff'],
    [6, 7, '#18181b'],
    [7, 7, '#ffffff'],
    [8, 7, '#ffffff'],
    [9, 7, '#ffffff'],
    [10, 7, '#ffffff'],
    [11, 7, '#ffffff'],
    [12, 7, '#ffffff'],
    [13, 7, '#ffffff'],
    [14, 7, '#ffffff'],
    [15, 7, '#ffffff'],
    [16, 7, '#ffffff'],
    [17, 7, '#18181b'],
    [5, 8, '#18181b'],
    [6, 8, '#ffffff'],
    [7, 8, '#ffffff'],
    [8, 8, '#ffffff'],
    [9, 8, '#ffffff'],
    [10, 8, '#ffffff'],
    [11, 8, '#ffffff'],
    [12, 8, '#ffffff'],
    [13, 8, '#ffffff'],
    [14, 8, '#ffffff'],
    [15, 8, '#ffffff'],
    [16, 8, '#ffffff'],
    [17, 8, '#18181b'],
    [4, 9, '#18181b'],
    [5, 9, '#ffffff'],
    [6, 9, '#18181b'],
    [7, 9, '#ffffff'],
    [8, 9, '#ffffff'],
    [9, 9, '#ffffff'],
    [10, 9, '#ffffff'],
    [11, 9, '#ffffff'],
    [12, 9, '#ffffff'],
    [13, 9, '#ffffff'],
    [14, 9, '#ffffff'],
    [15, 9, '#ffffff'],
    [16, 9, '#e2e8f0'],
    [17, 9, '#18181b'],
    [5, 10, '#18181b'],
    [6, 10, '#ffffff'],
    [7, 10, '#ffffff'],
    [8, 10, '#ffffff'],
    [9, 10, '#18181b'],
    [10, 10, '#18181b'],
    [11, 10, '#ffffff'],
    [12, 10, '#ffffff'],
    [13, 10, '#18181b'],
    [14, 10, '#18181b'],
    [15, 10, '#ffffff'],
    [16, 10, '#e2e8f0'],
    [18, 10, '#18181b'],
    [4, 11, '#18181b'],
    [6, 11, '#ffffff'],
    [7, 11, '#ffffff'],
    [8, 11, '#18181b'],
    [9, 11, '#18181b'],
    [10, 11, '#ffffff'],
    [11, 11, '#ffffff'],
    [12, 11, '#18181b'],
    [13, 11, '#18181b'],
    [14, 11, '#ffffff'],
    [15, 11, '#ffffff'],
    [16, 11, '#ffffff'],
    [18, 11, '#18181b'],
    [4, 12, '#18181b'],
    [6, 12, '#ffffff'],
    [7, 12, '#ff8ea3'],
    [8, 12, '#ff8ea3'],
    [9, 12, '#ffffff'],
    [10, 12, '#ffffff'],
    [11, 12, '#e2e8f0'],
    [12, 12, '#ffffff'],
    [13, 12, '#ffffff'],
    [14, 12, '#ff8ea3'],
    [15, 12, '#ff8ea3'],
    [16, 12, '#ffffff'],
    [17, 12, '#18181b'],
    [5, 13, '#18181b'],
    [6, 13, '#ffffff'],
    [7, 13, '#ffffff'],
    [8, 13, '#ffffff'],
    [9, 13, '#ffffff'],
    [10, 13, '#18181b'],
    [11, 13, '#18181b'],
    [12, 13, '#ffffff'],
    [13, 13, '#ffffff'],
    [14, 13, '#ffffff'],
    [15, 13, '#ffffff'],
    [16, 13, '#ffffff'],
    [17, 13, '#18181b'],
    [6, 14, '#18181b'],
    [7, 14, '#ffffff'],
    [8, 14, '#ffffff'],
    [9, 14, '#ffffff'],
    [10, 14, '#ffffff'],
    [11, 14, '#ffffff'],
    [12, 14, '#ffffff'],
    [13, 14, '#ffffff'],
    [14, 14, '#ffffff'],
    [15, 14, '#ffffff'],
    [16, 14, '#18181b'],
    [7, 15, '#18181b'],
    [8, 15, '#18181b'],
    [9, 15, '#18181b'],
    [10, 15, '#18181b'],
    [11, 15, '#18181b'],
    [12, 15, '#18181b'],
    [13, 15, '#18181b'],
    [14, 15, '#18181b'],
    [15, 15, '#18181b'],
    [7, 16, '#18181b'],
    [8, 16, '#18181b'],
    [13, 16, '#18181b'],
    [14, 16, '#18181b'],
    [7, 17, '#18181b'],
    [8, 17, '#18181b'],
    [13, 17, '#18181b'],
    [14, 17, '#18181b'],
  ],
  5: [
    [11, 3, '#ffd166'],
    [9, 5, '#18181b'],
    [10, 5, '#18181b'],
    [11, 5, '#18181b'],
    [12, 5, '#18181b'],
    [13, 5, '#18181b'],
    [14, 5, '#18181b'],
    [5, 6, '#ffd166'],
    [7, 6, '#18181b'],
    [8, 6, '#18181b'],
    [9, 6, '#fff3b0'],
    [10, 6, '#fff3b0'],
    [11, 6, '#fff3b0'],
    [12, 6, '#fff3b0'],
    [13, 6, '#fff3b0'],
    [14, 6, '#fff3b0'],
    [15, 6, '#18181b'],
    [16, 6, '#18181b'],
    [18, 6, '#ffd166'],
    [6, 7, '#18181b'],
    [7, 7, '#fff3b0'],
    [8, 7, '#fff3b0'],
    [9, 7, '#fff3b0'],
    [10, 7, '#fff3b0'],
    [11, 7, '#fff3b0'],
    [12, 7, '#fff3b0'],
    [13, 7, '#fff3b0'],
    [14, 7, '#fff3b0'],
    [15, 7, '#fff3b0'],
    [16, 7, '#fff3b0'],
    [17, 7, '#18181b'],
    [5, 8, '#18181b'],
    [6, 8, '#fff3b0'],
    [7, 8, '#fff3b0'],
    [8, 8, '#fff3b0'],
    [9, 8, '#fff3b0'],
    [10, 8, '#fff3b0'],
    [11, 8, '#fff3b0'],
    [12, 8, '#fff3b0'],
    [13, 8, '#fff3b0'],
    [14, 8, '#fff3b0'],
    [15, 8, '#fff3b0'],
    [16, 8, '#fff3b0'],
    [17, 8, '#18181b'],
    [4, 9, '#18181b'],
    [5, 9, '#ffffff'],
    [6, 9, '#18181b'],
    [7, 9, '#fff3b0'],
    [8, 9, '#ffffff'],
    [9, 9, '#18181b'],
    [10, 9, '#fff3b0'],
    [11, 9, '#fff3b0'],
    [12, 9, '#ffffff'],
    [13, 9, '#18181b'],
    [14, 9, '#fff3b0'],
    [15, 9, '#fff3b0'],
    [16, 9, '#fff3b0'],
    [17, 9, '#18181b'],
    [5, 10, '#18181b'],
    [6, 10, '#fff3b0'],
    [7, 10, '#fff3b0'],
    [8, 10, '#fff3b0'],
    [9, 10, '#18181b'],
    [10, 10, '#fff3b0'],
    [11, 10, '#fff3b0'],
    [12, 10, '#fff3b0'],
    [13, 10, '#18181b'],
    [14, 10, '#fff3b0'],
    [15, 10, '#fff3b0'],
    [16, 10, '#fff3b0'],
    [17, 10, '#18181b'],
    [5, 11, '#18181b'],
    [6, 11, '#fff3b0'],
    [7, 11, '#ff8ea3'],
    [8, 11, '#ff8ea3'],
    [9, 11, '#fff3b0'],
    [10, 11, '#18181b'],
    [11, 11, '#18181b'],
    [12, 11, '#18181b'],
    [13, 11, '#fff3b0'],
    [14, 11, '#ff8ea3'],
    [15, 11, '#ff8ea3'],
    [16, 11, '#fff3b0'],
    [17, 11, '#18181b'],
    [5, 12, '#18181b'],
    [6, 12, '#fff3b0'],
    [7, 12, '#fff3b0'],
    [8, 12, '#fff3b0'],
    [9, 12, '#fff3b0'],
    [10, 12, '#fff3b0'],
    [11, 12, '#fff3b0'],
    [12, 12, '#fff3b0'],
    [13, 12, '#fff3b0'],
    [14, 12, '#fff3b0'],
    [15, 12, '#fff3b0'],
    [16, 12, '#fff3b0'],
    [17, 12, '#18181b'],
    [5, 13, '#18181b'],
    [6, 13, '#fff3b0'],
    [7, 13, '#fff3b0'],
    [8, 13, '#fff3b0'],
    [9, 13, '#fff3b0'],
    [10, 13, '#fff3b0'],
    [11, 13, '#fff3b0'],
    [12, 13, '#fff3b0'],
    [13, 13, '#fff3b0'],
    [14, 13, '#fff3b0'],
    [15, 13, '#fff3b0'],
    [16, 13, '#fff3b0'],
    [17, 13, '#18181b'],
    [4, 14, '#ffd166'],
    [6, 14, '#18181b'],
    [7, 14, '#fff3b0'],
    [8, 14, '#fff3b0'],
    [9, 14, '#fff3b0'],
    [10, 14, '#fff3b0'],
    [11, 14, '#fff3b0'],
    [12, 14, '#fff3b0'],
    [13, 14, '#fff3b0'],
    [14, 14, '#fff3b0'],
    [15, 14, '#fff3b0'],
    [16, 14, '#18181b'],
    [18, 14, '#ffd166'],
    [7, 15, '#18181b'],
    [8, 15, '#18181b'],
    [9, 15, '#18181b'],
    [10, 15, '#18181b'],
    [11, 15, '#18181b'],
    [12, 15, '#18181b'],
    [13, 15, '#18181b'],
    [14, 15, '#18181b'],
    [15, 15, '#18181b'],
    [7, 16, '#18181b'],
    [8, 16, '#18181b'],
    [13, 16, '#18181b'],
    [14, 16, '#18181b'],
    [7, 17, '#18181b'],
    [8, 17, '#18181b'],
    [13, 17, '#18181b'],
    [14, 17, '#18181b'],
  ],
};


const AUTUMN_ITEM_PIXELS = {
  'side_autumn_pumpkin': {
    bounds: { minX: 0, maxX: 7, minY: 10, maxY: 18 },
    pixels: [
      [4, 10, '#65a30d'],
      [3, 11, '#65a30d'],
      [4, 11, '#65a30d'],
      [3, 12, '#18181b'],
      [2, 13, '#18181b'],
      [3, 13, '#18181b'],
      [4, 13, '#18181b'],
      [5, 13, '#18181b'],
      [1, 14, '#18181b'],
      [2, 14, '#fed7aa'],
      [3, 14, '#f97316'],
      [4, 14, '#f97316'],
      [5, 14, '#ea580c'],
      [6, 14, '#18181b'],
      [0, 15, '#18181b'],
      [1, 15, '#fed7aa'],
      [2, 15, '#f97316'],
      [3, 15, '#ea580c'],
      [4, 15, '#f97316'],
      [5, 15, '#ea580c'],
      [6, 15, '#9a3412'],
      [7, 15, '#18181b'],
      [0, 16, '#18181b'],
      [1, 16, '#f97316'],
      [2, 16, '#f97316'],
      [3, 16, '#ea580c'],
      [4, 16, '#f97316'],
      [5, 16, '#ea580c'],
      [6, 16, '#9a3412'],
      [7, 16, '#18181b'],
      [1, 17, '#18181b'],
      [2, 17, '#f97316'],
      [3, 17, '#9a3412'],
      [4, 17, '#ea580c'],
      [5, 17, '#9a3412'],
      [6, 17, '#18181b'],
      [2, 18, '#18181b'],
      [3, 18, '#18181b'],
      [4, 18, '#18181b'],
      [5, 18, '#18181b']
    ]
  },
  'neck_acorn_scarf': {
    bounds: { minX: 5, maxX: 17, minY: 12, maxY: 20 },
    pixels: [
      [6, 12, '#18181b'],
      [7, 12, '#18181b'],
      [8, 12, '#18181b'],
      [9, 12, '#18181b'],
      [10, 12, '#18181b'],
      [11, 12, '#18181b'],
      [12, 12, '#18181b'],
      [13, 12, '#18181b'],
      [14, 12, '#18181b'],
      [15, 12, '#18181b'],
      [16, 12, '#18181b'],
      [5, 13, '#18181b'],
      [6, 13, '#fde047'],
      [7, 13, '#d97706'],
      [8, 13, '#fde047'],
      [9, 13, '#d97706'],
      [10, 13, '#fde047'],
      [11, 13, '#d97706'],
      [12, 13, '#fde047'],
      [13, 13, '#d97706'],
      [14, 13, '#fde047'],
      [15, 13, '#d97706'],
      [16, 13, '#fde047'],
      [17, 13, '#18181b'],
      [5, 14, '#18181b'],
      [6, 14, '#d97706'],
      [7, 14, '#b45309'],
      [8, 14, '#d97706'],
      [9, 14, '#b45309'],
      [10, 14, '#d97706'],
      [11, 14, '#b45309'],
      [12, 14, '#d97706'],
      [13, 14, '#b45309'],
      [14, 14, '#d97706'],
      [15, 14, '#b45309'],
      [16, 14, '#d97706'],
      [17, 14, '#18181b'],
      [6, 15, '#18181b'],
      [7, 15, '#18181b'],
      [8, 15, '#18181b'],
      [9, 15, '#18181b'],
      [10, 15, '#78350f'],
      [11, 15, '#78350f'],
      [12, 15, '#18181b'],
      [13, 15, '#18181b'],
      [14, 15, '#18181b'],
      [15, 15, '#18181b'],
      [16, 15, '#18181b'],
      [6, 16, '#18181b'],
      [7, 16, '#d97706'],
      [8, 16, '#fde047'],
      [9, 16, '#18181b'],
      [10, 16, '#d97706'],
      [11, 16, '#d97706'],
      [6, 17, '#18181b'],
      [7, 17, '#b45309'],
      [8, 17, '#d97706'],
      [9, 17, '#18181b'],
      [10, 17, '#18181b'],
      [6, 18, '#18181b'],
      [7, 18, '#fde047'],
      [8, 18, '#b45309'],
      [9, 18, '#18181b'],
      [7, 19, '#fde047'],
      [8, 19, '#d97706'],
      [7, 20, '#18181b'],
      [8, 20, '#18181b']
    ]
  },
  'head_maple_beret': {
    bounds: { minX: 6, maxX: 18, minY: 1, maxY: 6 },
    pixels: [
      [12, 1, '#78350f'],
      [9, 2, '#18181b'],
      [10, 2, '#18181b'],
      [11, 2, '#18181b'],
      [12, 2, '#18181b'],
      [13, 2, '#18181b'],
      [14, 2, '#18181b'],
      [15, 2, '#18181b'],
      [7, 3, '#dc2626'],
      [8, 3, '#18181b'],
      [9, 3, '#f97316'],
      [10, 3, '#f97316'],
      [11, 3, '#f97316'],
      [12, 3, '#ea580c'],
      [13, 3, '#ea580c'],
      [14, 3, '#ea580c'],
      [15, 3, '#ea580c'],
      [16, 3, '#18181b'],
      [17, 3, '#18181b'],
      [6, 4, '#18181b'],
      [7, 4, '#dc2626'],
      [8, 4, '#fbbf24'],
      [9, 4, '#f97316'],
      [10, 4, '#f97316'],
      [11, 4, '#ea580c'],
      [12, 4, '#ea580c'],
      [13, 4, '#ea580c'],
      [14, 4, '#ea580c'],
      [15, 4, '#9a3412'],
      [16, 4, '#9a3412'],
      [17, 4, '#9a3412'],
      [18, 4, '#18181b'],
      [6, 5, '#18181b'],
      [7, 5, '#f97316'],
      [8, 5, '#dc2626'],
      [9, 5, '#f97316'],
      [10, 5, '#ea580c'],
      [11, 5, '#ea580c'],
      [12, 5, '#ea580c'],
      [13, 5, '#ea580c'],
      [14, 5, '#9a3412'],
      [15, 5, '#9a3412'],
      [16, 5, '#9a3412'],
      [17, 5, '#9a3412'],
      [18, 5, '#18181b'],
      [7, 6, '#18181b'],
      [8, 6, '#18181b'],
      [9, 6, '#18181b'],
      [10, 6, '#18181b'],
      [11, 6, '#18181b'],
      [12, 6, '#18181b'],
      [13, 6, '#18181b'],
      [14, 6, '#18181b'],
      [15, 6, '#18181b'],
      [16, 6, '#18181b'],
      [17, 6, '#18181b']
    ]
  },
  'back_maple_carpet': {
    bounds: { minX: 0, maxX: 23, minY: 13, maxY: 21 },
    pixels: [
      [22, 13, '#eab308'],
      [1, 14, '#ea580c'],
      [2, 16, '#fef08a'],
      [3, 16, '#eab308'],
      [17, 16, '#ea580c'],
      [21, 16, '#fef08a'],
      [22, 16, '#eab308'],
      [1, 17, '#fef08a'],
      [2, 17, '#eab308'],
      [3, 17, '#eab308'],
      [4, 17, '#eab308'],
      [6, 17, '#dc2626'],
      [11, 17, '#fef08a'],
      [12, 17, '#eab308'],
      [16, 17, '#ea580c'],
      [17, 17, '#dc2626'],
      [18, 17, '#ea580c'],
      [20, 17, '#eab308'],
      [21, 17, '#fef08a'],
      [22, 17, '#eab308'],
      [23, 17, '#eab308'],
      [0, 18, '#92400e'],
      [1, 18, '#78350f'],
      [2, 18, '#78350f'],
      [3, 18, '#92400e'],
      [4, 18, '#78350f'],
      [5, 18, '#dc2626'],
      [6, 18, '#ea580c'],
      [7, 18, '#dc2626'],
      [8, 18, '#78350f'],
      [9, 18, '#92400e'],
      [10, 18, '#eab308'],
      [11, 18, '#fef08a'],
      [12, 18, '#eab308'],
      [13, 18, '#eab308'],
      [14, 18, '#78350f'],
      [15, 18, '#92400e'],
      [16, 18, '#78350f'],
      [17, 18, '#dc2626'],
      [18, 18, '#92400e'],
      [19, 18, '#78350f'],
      [20, 18, '#78350f'],
      [21, 18, '#92400e'],
      [22, 18, '#a16207'],
      [23, 18, '#78350f'],
      [0, 19, '#78350f'],
      [1, 19, '#78350f'],
      [2, 19, '#78350f'],
      [3, 19, '#78350f'],
      [4, 19, '#78350f'],
      [5, 19, '#78350f'],
      [6, 19, '#dc2626'],
      [7, 19, '#78350f'],
      [8, 19, '#78350f'],
      [9, 19, '#78350f'],
      [10, 19, '#78350f'],
      [11, 19, '#a16207'],
      [12, 19, '#eab308'],
      [13, 19, '#78350f'],
      [14, 19, '#78350f'],
      [15, 19, '#78350f'],
      [16, 19, '#78350f'],
      [17, 19, '#78350f'],
      [18, 19, '#78350f'],
      [19, 19, '#78350f'],
      [20, 19, '#78350f'],
      [21, 19, '#78350f'],
      [22, 19, '#78350f'],
      [23, 19, '#78350f'],
      [0, 20, '#451a03'],
      [1, 20, '#451a03'],
      [2, 20, '#451a03'],
      [3, 20, '#451a03'],
      [4, 20, '#451a03'],
      [5, 20, '#451a03'],
      [6, 20, '#451a03'],
      [7, 20, '#451a03'],
      [8, 20, '#451a03'],
      [9, 20, '#451a03'],
      [10, 20, '#451a03'],
      [11, 20, '#451a03'],
      [12, 20, '#451a03'],
      [13, 20, '#451a03'],
      [14, 20, '#451a03'],
      [15, 20, '#451a03'],
      [16, 20, '#451a03'],
      [17, 20, '#451a03'],
      [18, 20, '#451a03'],
      [19, 20, '#451a03'],
      [20, 20, '#451a03'],
      [21, 20, '#451a03'],
      [22, 20, '#451a03'],
      [23, 20, '#451a03'],
      [0, 21, '#451a03'],
      [1, 21, '#451a03'],
      [2, 21, '#451a03'],
      [3, 21, '#451a03'],
      [4, 21, '#451a03'],
      [5, 21, '#451a03'],
      [6, 21, '#451a03'],
      [7, 21, '#451a03'],
      [8, 21, '#451a03'],
      [9, 21, '#451a03'],
      [10, 21, '#451a03'],
      [11, 21, '#451a03'],
      [12, 21, '#451a03'],
      [13, 21, '#451a03'],
      [14, 21, '#451a03'],
      [15, 21, '#451a03'],
      [16, 21, '#451a03'],
      [17, 21, '#451a03'],
      [18, 21, '#451a03'],
      [19, 21, '#451a03'],
      [20, 21, '#451a03'],
      [21, 21, '#451a03'],
      [22, 21, '#451a03'],
      [23, 21, '#451a03']
    ]
  },
  'hold_apple_basket': {
    bounds: { minX: 15, maxX: 22, minY: 10, maxY: 18 },
    pixels: [
      [18, 10, '#18181b'],
      [16, 11, '#65a30d'],
      [17, 11, '#18181b'],
      [18, 11, '#f87171'],
      [19, 11, '#ef4444'],
      [20, 11, '#18181b'],
      [15, 12, '#18181b'],
      [16, 12, '#84cc16'],
      [17, 12, '#18181b'],
      [20, 12, '#f87171'],
      [21, 12, '#ef4444'],
      [22, 12, '#18181b'],
      [15, 13, '#18181b'],
      [16, 13, '#18181b'],
      [17, 13, '#18181b'],
      [18, 13, '#18181b'],
      [19, 13, '#18181b'],
      [20, 13, '#18181b'],
      [21, 13, '#18181b'],
      [22, 13, '#18181b'],
      [15, 14, '#18181b'],
      [16, 14, '#d4a373'],
      [17, 14, '#a9714b'],
      [18, 14, '#d4a373'],
      [19, 14, '#a9714b'],
      [20, 14, '#d4a373'],
      [21, 14, '#a9714b'],
      [22, 14, '#18181b'],
      [15, 15, '#18181b'],
      [16, 15, '#a9714b'],
      [17, 15, '#d4a373'],
      [18, 15, '#a9714b'],
      [19, 15, '#d4a373'],
      [20, 15, '#a9714b'],
      [21, 15, '#d4a373'],
      [22, 15, '#18181b'],
      [15, 16, '#18181b'],
      [16, 16, '#d4a373'],
      [17, 16, '#a9714b'],
      [18, 16, '#d4a373'],
      [19, 16, '#a9714b'],
      [20, 16, '#d4a373'],
      [21, 16, '#a9714b'],
      [22, 16, '#18181b'],
      [15, 17, '#18181b'],
      [16, 17, '#a9714b'],
      [17, 17, '#d4a373'],
      [18, 17, '#a9714b'],
      [19, 17, '#d4a373'],
      [20, 17, '#a9714b'],
      [21, 17, '#d4a373'],
      [22, 17, '#18181b'],
      [16, 18, '#18181b'],
      [17, 18, '#18181b'],
      [18, 18, '#18181b'],
      [19, 18, '#18181b'],
      [20, 18, '#18181b'],
      [21, 18, '#18181b']
    ]
  },
  'hold_autumn_lantern': {
    bounds: { minX: 18, maxX: 22, minY: 6, maxY: 16 },
    pixels: [
      [20, 6, '#18181b'],
      [19, 7, '#18181b'],
      [21, 7, '#18181b'],
      [20, 8, '#b45309'],
      [19, 9, '#78350f'],
      [20, 9, '#78350f'],
      [21, 9, '#78350f'],
      [18, 10, '#18181b'],
      [19, 10, '#18181b'],
      [20, 10, '#18181b'],
      [21, 10, '#18181b'],
      [22, 10, '#18181b'],
      [18, 11, '#18181b'],
      [19, 11, '#fed7aa'],
      [20, 11, '#fef08a'],
      [21, 11, '#fed7aa'],
      [22, 11, '#18181b'],
      [18, 12, '#18181b'],
      [19, 12, '#fde047'],
      [20, 12, '#ffffff'],
      [21, 12, '#fde047'],
      [22, 12, '#18181b'],
      [18, 13, '#18181b'],
      [19, 13, '#fed7aa'],
      [20, 13, '#ea580c'],
      [21, 13, '#fed7aa'],
      [22, 13, '#18181b'],
      [18, 14, '#18181b'],
      [19, 14, '#fed7aa'],
      [20, 14, '#fef08a'],
      [21, 14, '#fed7aa'],
      [22, 14, '#18181b'],
      [18, 15, '#78350f'],
      [19, 15, '#78350f'],
      [20, 15, '#78350f'],
      [21, 15, '#78350f'],
      [22, 15, '#78350f'],
      [18, 16, '#18181b'],
      [19, 16, '#18181b'],
      [20, 16, '#18181b'],
      [21, 16, '#18181b'],
      [22, 16, '#18181b']
    ]
  }
};


// ==========================================
// 👒 기본 악세사리 4종 (새로운 찰스 24x24 피팅)
// ==========================================

// 1. 피크닉 데이지 풀밭 (Floor - 찰스 발밑 y:16~19, x:2~21에 화사하게 피어남)
function renderAccessoryDaisyField(scale) {
  let r = '';
  const green = '#2ECC71';
  const greenDark = '#27AE60';
  const white = '#FFFFFF';
  const yellow = '#F1C40F';

  // 잔디 베이스 바닥 (y:17~19)
  for (let x = 2; x <= 20; x++) {
    r += `<rect x="${x * scale}" y="${18 * scale}" width="${scale}" height="${scale}" fill="${green}" />`;
  }
  for (let x = 3; x <= 19; x++) {
    r += `<rect x="${x * scale}" y="${19 * scale}" width="${scale}" height="${scale}" fill="${greenDark}" />`;
  }

  // 잔디 뾰족 포인트 (y:16~17)
  const grassBlades = [2, 5, 8, 12, 16, 19];
  for (let i = 0; i < grassBlades.length; i++) {
    const gx = grassBlades[i];
    r += `<rect x="${gx * scale}" y="${17 * scale}" width="${scale}" height="${scale}" fill="${green}" />`;
  }

  // 좌측 데이지 꽃 (중심 5, 16)
  r += `<rect x="${5 * scale}" y="${16 * scale}" width="${scale}" height="${scale}" fill="${yellow}" />`;
  r += `<rect x="${4 * scale}" y="${16 * scale}" width="${scale}" height="${scale}" fill="${white}" />`;
  r += `<rect x="${6 * scale}" y="${16 * scale}" width="${scale}" height="${scale}" fill="${white}" />`;
  r += `<rect x="${5 * scale}" y="${15 * scale}" width="${scale}" height="${scale}" fill="${white}" />`;
  r += `<rect x="${5 * scale}" y="${17 * scale}" width="${scale}" height="${scale}" fill="${white}" />`;

  // 우측 데이지 꽃 (중심 18, 16)
  r += `<rect x="${18 * scale}" y="${16 * scale}" width="${scale}" height="${scale}" fill="${yellow}" />`;
  r += `<rect x="${17 * scale}" y="${16 * scale}" width="${scale}" height="${scale}" fill="${white}" />`;
  r += `<rect x="${19 * scale}" y="${16 * scale}" width="${scale}" height="${scale}" fill="${white}" />`;
  r += `<rect x="${18 * scale}" y="${15 * scale}" width="${scale}" height="${scale}" fill="${white}" />`;
  r += `<rect x="${18 * scale}" y="${17 * scale}" width="${scale}" height="${scale}" fill="${white}" />`;

  return r;
}

// 2. 귀여운 밀짚모자 (Head - 찰스 머리통 y:4~5, x:8~15 위에 씌워짐)
function renderAccessoryStrawHat(scale) {
  let r = '';
  // 모자 왕관 (Crown - y:2~3, x:8~14)
  for (let x = 9; x <= 14; x++) {
    r += `<rect x="${x * scale}" y="${2 * scale}" width="${scale}" height="${scale}" fill="#F4D03F" />`;
    r += `<rect x="${x * scale}" y="${3 * scale}" width="${scale}" height="${scale}" fill="#F4D03F" />`;
  }
  // 모자 리본 띠 (Ribbon - y:4, x:9~14)
  for (let x = 9; x <= 14; x++) {
    r += `<rect x="${x * scale}" y="${4 * scale}" width="${scale}" height="${scale}" fill="#8B4513" />`;
  }
  // 모자 챙 (Brim - y:5, x:6~17)
  for (let x = 6; x <= 17; x++) {
    r += `<rect x="${x * scale}" y="${5 * scale}" width="${scale}" height="${scale}" fill="#F4D03F" />`;
  }
  // 챙 테두리 포인트
  r += `<rect x="${5 * scale}" y="${5 * scale}" width="${scale}" height="${scale}" fill="#D4AC0D" />`;
  r += `<rect x="${18 * scale}" y="${5 * scale}" width="${scale}" height="${scale}" fill="#D4AC0D" />`;

  return r;
}

// 3. 둥근 범생이 안경 (Glasses - 찰스 눈 y:10~11, x:7~14에 맞춤)
function renderAccessoryGlasses(scale, yOffset = 0) {
  let r = '';
  const c = '#111111';
  const dy = yOffset * scale;

  // 좌측 림 (눈 x:7~9, y:9~11)
  r += `<rect x="${7 * scale}" y="${9 * scale + dy}" width="${3 * scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${6 * scale}" y="${10 * scale + dy}" width="${scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${10 * scale}" y="${10 * scale + dy}" width="${scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${7 * scale}" y="${11 * scale + dy}" width="${3 * scale}" height="${scale}" fill="${c}" />`;

  // 안경 브릿지 (x:10~11, y:10)
  r += `<rect x="${10 * scale}" y="${10 * scale + dy}" width="${2 * scale}" height="${scale}" fill="${c}" />`;

  // 우측 림 (눈 x:12~14, y:9~11)
  r += `<rect x="${12 * scale}" y="${9 * scale + dy}" width="${3 * scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${11 * scale}" y="${10 * scale + dy}" width="${scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${15 * scale}" y="${10 * scale + dy}" width="${scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${12 * scale}" y="${11 * scale + dy}" width="${3 * scale}" height="${scale}" fill="${c}" />`;

  return r;
}

// 4. 작은 성경책 (Hold - 찰스 오른쪽 품 y:12~15, x:14~17)
function renderAccessoryBible(scale) {
  let r = '';
  // 보라색 성경책 표지 (x:15~18, y:11~15)
  for (let y = 11; y <= 15; y++) {
    for (let x = 15; x <= 18; x++) {
      r += `<rect x="${x * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="#6C3483" />`;
    }
  }
  // 책등 그림자 (#4A235A)
  for (let y = 11; y <= 15; y++) {
    r += `<rect x="${15 * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="#4A235A" />`;
  }
  // 책 하단 페이지 속지 (#FDFEFE)
  for (let x = 16; x <= 18; x++) {
    r += `<rect x="${x * scale}" y="${15 * scale}" width="${scale}" height="${scale}" fill="#FDFEFE" />`;
  }
  // 금박 십자가 (#F1C40F)
  for (let y = 12; y <= 14; y++) {
    r += `<rect x="${17 * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="#F1C40F" />`;
  }
  r += `<rect x="${16 * scale}" y="${13 * scale}" width="${scale}" height="${scale}" fill="#F1C40F" />`;
  r += `<rect x="${18 * scale}" y="${13 * scale}" width="${scale}" height="${scale}" fill="#F1C40F" />`;

  return r;
}

// ==========================================
// 🍂 가을 컬렉션 악세사리 렌더러
// ==========================================
function renderAutumnAccessory(itemId, scale) {
  const itemData = (typeof AUTUMN_ITEM_PIXELS !== 'undefined') ? AUTUMN_ITEM_PIXELS[itemId] : null;
  if (!itemData || !itemData.pixels) return '';
  let r = '';
  const pixels = itemData.pixels;
  for (let i = 0; i < pixels.length; i++) {
    const px = pixels[i];
    r += `<rect x="${px[0] * scale}" y="${px[1] * scale}" width="${scale}" height="${scale}" fill="${px[2]}" />`;
  }
  return r;
}

/**
 * 아이템별 상점/옷장 전용 고화질 픽셀 SVG 아이콘 생성
 */
function getAccessoryIconSvg(itemId) {
  if (itemId === 'head_straw_hat') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="4.5 1.5 15 5" class="pixel-item-svg" shape-rendering="crispEdges">${renderAccessoryStrawHat(1)}</svg>`;
  } else if (itemId === 'head_glasses') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="5.5 8.5 11 4" class="pixel-item-svg" shape-rendering="crispEdges">${renderAccessoryGlasses(1)}</svg>`;
  } else if (itemId === 'hold_bible') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="14.5 10.5 5 6" class="pixel-item-svg" shape-rendering="crispEdges">${renderAccessoryBible(1)}</svg>`;
  } else if (itemId === 'back_daisy_field') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="1.5 14.5 20 6" class="pixel-item-svg" shape-rendering="crispEdges">${renderAccessoryDaisyField(1)}</svg>`;
  } else if (typeof AUTUMN_ITEM_PIXELS !== 'undefined' && AUTUMN_ITEM_PIXELS[itemId]) {
    const b = AUTUMN_ITEM_PIXELS[itemId].bounds;
    const pad = 1;
    const vb = (b.minX - pad) + ' ' + (b.minY - pad) + ' ' + (b.maxX - b.minX + pad * 2 + 1) + ' ' + (b.maxY - b.minY + pad * 2 + 1);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" class="pixel-item-svg" shape-rendering="crispEdges">${renderAutumnAccessory(itemId, 1)}</svg>`;
  }
  return '';
}

/**
 * 24x24 통일 규격 찰스 메인 픽셀 그리드 렌더러
 */
function renderSimplePixelGrid(stageOrRows, scale = 9, animClass = 'charles-static', equipped = {}) {
  // 캔버스 크기: 24x24 (찰스 중앙 배치, 모든 아이템과 100% 무결점 일체화)
  const canvasWidth = 24;
  const canvasHeight = 24;
  const svgWidth = canvasWidth * scale;
  const svgHeight = canvasHeight * scale;

  // Layer 1: Back / Floor 악세사리 (바닥 잔디/낙엽)
  let backRects = '';
  if (equipped) {
    if (equipped.grass === 'back_maple_carpet' || equipped.back === 'back_maple_carpet' || equipped.back_maple_carpet) {
      backRects += renderAutumnAccessory('back_maple_carpet', scale);
    } else if (equipped.grass === 'back_daisy_field' || equipped.back === 'back_daisy_field' || equipped.back_daisy_field) {
      backRects += renderAccessoryDaisyField(scale);
    }
  }

  // Layer 1.5: Side 소품 (탐스러운 가을 단호박 - 찰스 왼쪽 앞바닥)
  let sideRects = '';
  if (equipped && (equipped.side === 'side_autumn_pumpkin' || equipped.hold === 'side_autumn_pumpkin' || equipped.side_autumn_pumpkin)) {
    sideRects += renderAutumnAccessory('side_autumn_pumpkin', scale);
  }

  // Layer 2: 찰스 본체 (공식 신규 1~5단계 정밀 픽셀 데이터)
  let bodyRects = '';
  let currentStage = 1;
  if (typeof stageOrRows === 'number') {
    currentStage = Math.max(1, Math.min(5, Math.floor(stageOrRows)));
  } else if (Array.isArray(stageOrRows)) {
    currentStage = 1;
  }

  const stagePixels = (typeof CHARLES_NEW_STAGES !== 'undefined') ? CHARLES_NEW_STAGES[currentStage] : null;
  if (stagePixels && Array.isArray(stagePixels)) {
    for (let i = 0; i < stagePixels.length; i++) {
      const px = stagePixels[i];
      bodyRects += `<rect x="${px[0] * scale}" y="${px[1] * scale}" width="${scale}" height="${scale}" fill="${px[2]}" />`;
    }
  }

  // Layer 2.5: Neck 악세사리 (도토리 니트 목도리 - 찰스 목/가슴 둘레)
  let neckRects = '';
  if (equipped && (equipped.neck === 'neck_acorn_scarf' || equipped.neck_acorn_scarf)) {
    neckRects += renderAutumnAccessory('neck_acorn_scarf', scale);
  }

  // Layer 3: Glasses 악세사리 (둥근 범생이 안경)
  let glassesRects = '';
  if (equipped && (equipped.glasses === 'head_glasses' || equipped.head === 'head_glasses' || equipped.body === 'head_glasses' || equipped.head_glasses)) {
    glassesRects += renderAccessoryGlasses(scale, 0);
  }

  // Layer 4: Head 악세사리 (머리 부위 - 귀여운 밀짚모자 또는 단풍잎 베레모)
  let headRects = '';
  if (equipped) {
    if (equipped.head === 'head_maple_beret' || equipped.head_maple_beret) {
      headRects += renderAutumnAccessory('head_maple_beret', scale);
    } else if (equipped.head === 'head_straw_hat' || equipped.head_straw_hat) {
      headRects += renderAccessoryStrawHat(scale);
    }
  }

  // Layer 5: Hold 악세사리 (소품 - 작은 성경책 / 가을밤 랜턴 / 꿀사과 바구니)
  let holdRects = '';
  if (equipped) {
    if (equipped.hold === 'hold_autumn_lantern' || equipped.hold_autumn_lantern) {
      holdRects += renderAutumnAccessory('hold_autumn_lantern', scale);
    } else if (equipped.hold === 'hold_apple_basket' || equipped.hold_apple_basket) {
      holdRects += renderAutumnAccessory('hold_apple_basket', scale);
    } else if (equipped.hold === 'hold_bible' || equipped.body === 'hold_bible' || equipped.hold_bible) {
      holdRects += renderAccessoryBible(scale);
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" 
         class="charles-svg ${animClass}" 
         style="image-rendering: pixelated; shape-rendering: crispEdges; width: 100%; height: auto; max-width: 150px; display: block; margin: 0 auto;">
      <g class="layer-back">${backRects}</g>
      <g class="layer-side">${sideRects}</g>
      <g class="layer-body">${bodyRects}</g>
      <g class="layer-neck">${neckRects}</g>
      <g class="layer-glasses">${glassesRects}</g>
      <g class="layer-head">${headRects}</g>
      <g class="layer-hold">${holdRects}</g>
    </svg>
  `;
}

/**
 * 단계별 찰스 SVG 그래픽 및 메타 정보 반환
 */
function getCharlesVisual(stage = 1, scale = 9, equipped = null) {
  const safeStage = Math.max(1, Math.min(5, Math.floor(stage)));
  const info = CHARLES_STAGES[safeStage];

  let activeEquipped = equipped;
  if (!activeEquipped && typeof TalentService !== 'undefined' && TalentService.getEquipped) {
    activeEquipped = TalentService.getEquipped();
  }

  const svg = renderSimplePixelGrid(safeStage, scale, 'charles-static', activeEquipped || {});

  return {
    stage: safeStage,
    info,
    svg,
    equipped: activeEquipped || {}
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CHARLES_STAGES, CHARLES_NEW_STAGES, AUTUMN_ITEM_PIXELS, getCharlesVisual, renderSimplePixelGrid, getAccessoryIconSvg };
}