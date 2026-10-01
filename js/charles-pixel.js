/**
 * Charles' Bible - 심플 & 큐트 픽셀 양 찰스 (Simple & Cute Charles the Sheep)
 * 미니멀하고 귀여운 흑백 도트 캐릭터 및 5단계 상태
 */

const CHARLES_STAGES = {
  1: {
    stage: 1,
    name: "배고픈 찰스",
    title: "Charles is starving.",
    badge: "starving",
    level: 1,
    desc: "말씀이 고픈 아기 찰스"
  },
  2: {
    stage: 2,
    name: "풀먹는 찰스",
    title: "Charles is chewing the Word.",
    badge: "chewing",
    level: 2,
    desc: "말씀을 냠냠 먹는 찰스"
  },
  3: {
    stage: 3,
    name: "행복한 찰스",
    title: "Charles is joyful.",
    badge: "joyful",
    level: 3,
    desc: "기쁨이 가득한 찰스"
  },
  4: {
    stage: 4,
    name: "풍성한 찰스",
    title: "Charles is extra fluffy.",
    badge: "fluffy",
    level: 4,
    desc: "말씀으로 복슬복슬해진 찰스"
  },
  5: {
    stage: 5,
    name: "성령충만 찰스",
    title: "Charles is blessed.",
    badge: "blessed",
    level: 5,
    desc: "은혜와 축복이 넘치는 찰스"
  }
};

/**
 * 픽셀 맵 SVG 렌더러
 * . : 투명
 * B : Black (#111111)
 * W : White (#FFFFFF)
 * G : Light Gray (#E5E5E5)
 * P : Pink Blush (#FFAAA6)
 * Y : Yellow / Gold (#F1C40F)
 * S : Green Sprout (#2ECC71)
 */
// ==================== 4종 테스트 악세사리 픽셀 레이어 렌더러 ====================

// 1. 피크닉 데이지 풀밭 (Back / Floor)
function renderAccessoryDaisyField(scale) {
  let r = '';
  const grass = '#2ECC71';
  const darkGrass = '#27AE60';
  const white = '#FFFFFF';
  const yellow = '#F1C40F';
  // 바닥 잔디 픽셀
  for (let x = 0; x < 18; x += 2) {
    r += `<rect x="${x * scale}" y="${15 * scale}" width="${scale}" height="${scale}" fill="${darkGrass}" />`;
    if (x % 4 === 0) r += `<rect x="${x * scale}" y="${14 * scale}" width="${scale}" height="${scale}" fill="${grass}" />`;
  }
  // 좌측 데이지 꽃 (x=1, y=13)
  r += `<rect x="${1 * scale}" y="${13 * scale}" width="${scale}" height="${scale}" fill="${yellow}" />`;
  r += `<rect x="${0 * scale}" y="${13 * scale}" width="${scale}" height="${scale}" fill="${white}" />`;
  r += `<rect x="${2 * scale}" y="${13 * scale}" width="${scale}" height="${scale}" fill="${white}" />`;
  r += `<rect x="${1 * scale}" y="${12 * scale}" width="${scale}" height="${scale}" fill="${white}" />`;
  r += `<rect x="${1 * scale}" y="${14 * scale}" width="${scale}" height="${scale}" fill="${white}" />`;
  // 우측 데이지 꽃 (x=16, y=13)
  r += `<rect x="${16 * scale}" y="${13 * scale}" width="${scale}" height="${scale}" fill="${yellow}" />`;
  r += `<rect x="${15 * scale}" y="${13 * scale}" width="${scale}" height="${scale}" fill="${white}" />`;
  r += `<rect x="${17 * scale}" y="${13 * scale}" width="${scale}" height="${scale}" fill="${white}" />`;
  r += `<rect x="${16 * scale}" y="${12 * scale}" width="${scale}" height="${scale}" fill="${white}" />`;
  r += `<rect x="${16 * scale}" y="${14 * scale}" width="${scale}" height="${scale}" fill="${white}" />`;
  return r;
}

// 2. 귀여운 밀짚모자 (Head)
function renderAccessoryStrawHat(scale) {
  let r = '';
  // 모자 상단 (Crown)
  for (let x = 6; x <= 11; x++) r += `<rect x="${x * scale}" y="${0 * scale}" width="${scale}" height="${scale}" fill="#F4D03F" />`;
  for (let x = 6; x <= 11; x++) r += `<rect x="${x * scale}" y="${1 * scale}" width="${scale}" height="${scale}" fill="#F4D03F" />`;
  // 모자 리본 띠 (Ribbon)
  for (let x = 6; x <= 11; x++) r += `<rect x="${x * scale}" y="${2 * scale}" width="${scale}" height="${scale}" fill="#8B4513" />`;
  // 모자 챙 (Brim)
  for (let x = 3; x <= 14; x++) r += `<rect x="${x * scale}" y="${3 * scale}" width="${scale}" height="${scale}" fill="#F4D03F" />`;
  // 챙 테두리 포인트
  r += `<rect x="${2 * scale}" y="${3 * scale}" width="${scale}" height="${scale}" fill="#D4AC0D" />`;
  r += `<rect x="${15 * scale}" y="${3 * scale}" width="${scale}" height="${scale}" fill="#D4AC0D" />`;
  return r;
}

// 3. 둥근 범생이 안경 (Head)
function renderAccessoryGlasses(scale) {
  let r = '';
  const c = '#111111';
  // 좌측 림 (눈 cols 5~7)
  r += `<rect x="${5 * scale}" y="${5 * scale}" width="${3 * scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${4 * scale}" y="${6 * scale}" width="${scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${8 * scale}" y="${6 * scale}" width="${scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${5 * scale}" y="${7 * scale}" width="${3 * scale}" height="${scale}" fill="${c}" />`;
  // 안경 다리/브릿지 (cols 8~9)
  r += `<rect x="${8 * scale}" y="${6 * scale}" width="${2 * scale}" height="${scale}" fill="${c}" />`;
  // 우측 림 (눈 cols 10~12)
  r += `<rect x="${10 * scale}" y="${5 * scale}" width="${3 * scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${9 * scale}" y="${6 * scale}" width="${scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${13 * scale}" y="${6 * scale}" width="${scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${10 * scale}" y="${7 * scale}" width="${3 * scale}" height="${scale}" fill="${c}" />`;
  return r;
}

// 4. 작은 성경책 (Hold)
function renderAccessoryBible(scale) {
  let r = '';
  // 보라색 성경책 표지 (Purple #6C3483)
  for (let y = 9; y <= 13; y++) {
    for (let x = 13; x <= 16; x++) {
      r += `<rect x="${x * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="#6C3483" />`;
    }
  }
  // 책등 그림자 (#4A235A)
  for (let y = 9; y <= 13; y++) {
    r += `<rect x="${13 * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="#4A235A" />`;
  }
  // 책 하단 페이지 속지 (#FDFEFE)
  for (let x = 14; x <= 16; x++) {
    r += `<rect x="${x * scale}" y="${13 * scale}" width="${scale}" height="${scale}" fill="#FDFEFE" />`;
  }
  // 금박 십자가 (#F1C40F)
  for (let y = 10; y <= 12; y++) {
    r += `<rect x="${15 * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="#F1C40F" />`;
  }
  r += `<rect x="${14 * scale}" y="${11 * scale}" width="${scale}" height="${scale}" fill="#F1C40F" />`;
  r += `<rect x="${16 * scale}" y="${11 * scale}" width="${scale}" height="${scale}" fill="#F1C40F" />`;
  return r;
}

function renderSimplePixelGrid(rows, scale = 9, animClass = 'charles-static', equipped = {}) {
  const width = rows[0].length;
  const height = rows.length;
  const svgWidth = width * scale;
  const svgHeight = height * scale;

  // Layer 1: Back / Floor 악세사리
  let backRects = '';
  if (equipped && equipped.back === 'back_daisy_field') {
    backRects = renderAccessoryDaisyField(scale);
  }

  // Layer 2: 찰스 본체
  let bodyRects = '';
  for (let y = 0; y < height; y++) {
    const row = rows[y];
    for (let x = 0; x < width; x++) {
      const char = row[x];
      if (char === '.') continue;

      let fill = '#111111';
      if (char === 'W') fill = '#FFFFFF';
      else if (char === 'G') fill = '#EFEFEF';
      else if (char === 'P') fill = '#FFB6C1';
      else if (char === 'Y') fill = '#F4D03F';
      else if (char === 'S') fill = '#2ECC71';
      else if (char === 'B') fill = '#111111';

      bodyRects += `<rect x="${x * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="${fill}" />`;
    }
  }

  // Layer 3: Head 악세사리
  let headRects = '';
  if (equipped) {
    if (equipped.head === 'head_straw_hat') {
      headRects = renderAccessoryStrawHat(scale);
    } else if (equipped.head === 'head_glasses') {
      headRects = renderAccessoryGlasses(scale);
    }
  }

  // Layer 4: Hold 악세사리
  let holdRects = '';
  if (equipped && equipped.hold === 'hold_bible') {
    holdRects = renderAccessoryBible(scale);
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" 
         class="charles-svg ${animClass}" 
         style="image-rendering: pixelated; shape-rendering: crispEdges; width: 100%; height: auto; max-width: 150px; display: block; margin: 0 auto;">
      <g class="layer-back">${backRects}</g>
      <g class="layer-body">${bodyRects}</g>
      <g class="layer-head">${headRects}</g>
      <g class="layer-hold">${holdRects}</g>
    </svg>
  `;
}

// 18 x 16 심플 큐트 픽셀 그리드

// 1단계: 배고픈 아기 찰스 (동그랗게 웅크림, 촉촉한 점눈)
const SIMPLE_PIXEL_STAGE_1 = [
  "..................",
  "......BBBBBB......",
  "....BBWWWWWWBB....",
  "...BWWWWWWWWWWB...",
  "..BWWWWWWWWWWWWB..",
  ".B.BWWWWWWWWWW.B..",
  ".B.BWWBBWWBBWW.B..",
  "..BWWBBWWBBWWWWB..",
  "..BWWWWWWWWWWWWB..",
  "..BWWWW..WWWWWWB..",
  "..BWWWWWWWWWWWWB..",
  "...BBWWWWWWWWBB...",
  "....BBBBBBBBBB....",
  "......BB....BB....",
  "..................",
  ".................."
];

// 2단계: 말씀을 냠냠 먹는 찰스 (입에 귀여운 풀잎/두루마리 하나)
const SIMPLE_PIXEL_STAGE_2 = [
  "..................",
  "......BBBBBB......",
  "....BBWWWWWWBB....",
  "...BWWWWWWWWWWB...",
  "..BWWWWWWWWWWWWB..",
  ".B.BWWWWWWWWWW.B..",
  ".B.BWWBBWWBBWW.B..",
  "..BWWWWWWWWWWWWB..",
  "..BWWWWWWWWWWWWB..",
  "..BWWWWSBBWWWWWB..",
  "..BWWWSSBBWWWWWB..",
  "...BBWWWWWWWWBB...",
  "....BBBBBBBBBB....",
  ".....BB..BB..BB...",
  ".....BB..BB..BB...",
  ".................."
];

// 3단계: 행복한 찰스 (웃는 눈 ^ ^, 앙증맞은 볼터치)
const SIMPLE_PIXEL_STAGE_3 = [
  "..................",
  "......BBBBBB......",
  "....BBWWWWWWBB....",
  "...BWWWWWWWWWWB...",
  "..BWWWWWWWWWWWWB..",
  ".B.BWWWWWWWWWW.B..",
  ".B.BWWWWWWWWWW.B..",
  "..BWW.BW..WB.WWB..",
  "..BWWB.W..W.BWWB..",
  "..BWWPPWWWWPPWWB..",
  "..BWWWWBBBBWWWWB..",
  "...BBWWWWWWWWBB...",
  "....BBBBBBBBBB....",
  ".....BB......BB...",
  ".....BB......BB...",
  ".................."
];

// 4단계: 더욱 복슬복슬해진 찰스 (폭신폭신한 구름 털과 방울)
const SIMPLE_PIXEL_STAGE_4 = [
  "......BBBBBB......",
  "....BBWWWWWWBB....",
  "...BWWWWWWWWWWB...",
  "..BWWWWWWWWWWWWB..",
  ".B.BWWWWWWWWWW.B..",
  ".B.BWWBWWWWWBW.B..",
  "..BWWBBW..WBBWWB..",
  "..BWWWWWWWWWWWWB..",
  "..BWWPPWWWWPPWWB..",
  "..BWWWWBWWWWWWWB..",
  "..BBWWWYYYYWWWBB..",
  ".BWWBBBBBBBBBBWWB.",
  "..BBWWWWWWWWWWBB..",
  "....BBBBBBBBBB....",
  ".....BB......BB...",
  ".....BB......BB..."
];

// 5단계: 영광의 천사 찰스 (머리 위 빛나는 천사링 & 등 뒤의 앙증맞은 천사 날개)
const SIMPLE_PIXEL_STAGE_5 = [
  ".......YYYY.......",
  "......Y....Y......",
  ".......YYYY.......",
  "....BBWWWWWWBB....",
  "...BWWWWWWWWWWB...",
  ".B.BWWWWWWWWWW.B..",
  "BWWBWWWWWWWWWW.B..",
  "BWWWW.BW..WB.WWB..",
  ".BBWWB.W..W.BWWB..",
  "..BWWPPWWWWPPWWB..",
  ".BBWWWBBBBBBWWWBB.",
  "BWWBBWWWWWWWWBBWWB",
  ".BB.BBBBBBBBBB.BB.",
  "......BB....BB....",
  "......BB....BB....",
  ".................."
];

/**
 * 단계별 찰스 SVG 그래픽 및 메타 정보 반환
 */
function getCharlesVisual(stage = 1, scale = 8, equipped = null) {
  const safeStage = Math.max(1, Math.min(5, Math.floor(stage)));
  const info = CHARLES_STAGES[safeStage];

  let pixelMap = SIMPLE_PIXEL_STAGE_1;

  if (safeStage === 2) {
    pixelMap = SIMPLE_PIXEL_STAGE_2;
  } else if (safeStage === 3) {
    pixelMap = SIMPLE_PIXEL_STAGE_3;
  } else if (safeStage === 4) {
    pixelMap = SIMPLE_PIXEL_STAGE_4;
  } else if (safeStage === 5) {
    pixelMap = SIMPLE_PIXEL_STAGE_5;
  }

  let activeEquipped = equipped;
  if (!activeEquipped && typeof TalentService !== 'undefined' && TalentService.getEquipped) {
    activeEquipped = TalentService.getEquipped();
  }

  const svg = renderSimplePixelGrid(pixelMap, scale, 'charles-static', activeEquipped || {});

  return {
    stage: safeStage,
    info,
    svg,
    equipped: activeEquipped || {}
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CHARLES_STAGES, getCharlesVisual, renderSimplePixelGrid };
}
