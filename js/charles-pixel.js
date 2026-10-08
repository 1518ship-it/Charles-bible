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

// 3. 둥근 범생이 안경 (Head / Body)
function renderAccessoryGlasses(scale, yOffset = 0) {
  let r = '';
  const c = '#111111';
  const dy = yOffset * scale;
  // 좌측 림 (눈 cols 5~7)
  r += `<rect x="${5 * scale}" y="${5 * scale + dy}" width="${3 * scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${4 * scale}" y="${6 * scale + dy}" width="${scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${8 * scale}" y="${6 * scale + dy}" width="${scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${5 * scale}" y="${7 * scale + dy}" width="${3 * scale}" height="${scale}" fill="${c}" />`;
  // 안경 다리/브릿지 (cols 8~9)
  r += `<rect x="${8 * scale}" y="${6 * scale + dy}" width="${2 * scale}" height="${scale}" fill="${c}" />`;
  // 우측 림 (눈 cols 10~12)
  r += `<rect x="${10 * scale}" y="${5 * scale + dy}" width="${3 * scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${9 * scale}" y="${6 * scale + dy}" width="${scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${13 * scale}" y="${6 * scale + dy}" width="${scale}" height="${scale}" fill="${c}" />`;
  r += `<rect x="${10 * scale}" y="${7 * scale + dy}" width="${3 * scale}" height="${scale}" fill="${c}" />`;
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

function renderAutumnAccessory(itemId, scale, offsetX = 0, offsetY = 0) {
  const itemData = (typeof AUTUMN_ITEM_PIXELS !== 'undefined') ? AUTUMN_ITEM_PIXELS[itemId] : null;
  if (!itemData || !itemData.pixels) return '';
  let r = '';
  const pixels = itemData.pixels;
  for (let i = 0; i < pixels.length; i++) {
    const px = pixels[i];
    const x = (px[0] + offsetX) * scale;
    const y = (px[1] + offsetY) * scale;
    r += `<rect x="${x}" y="${y}" width="${scale}" height="${scale}" fill="${px[2]}" />`;
  }
  return r;
}

/**
 * 4종 테스트 악세사리 및 가을 컬렉션 6종 실제 픽셀 아트 SVG 아이콘 생성
 */
function getAccessoryIconSvg(itemId) {
  if (itemId === 'head_straw_hat') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="1.5 -0.5 15 5" class="pixel-item-svg" shape-rendering="crispEdges">${renderAccessoryStrawHat(1)}</svg>`;
  } else if (itemId === 'head_glasses') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="3.5 4.5 11 4" class="pixel-item-svg" shape-rendering="crispEdges">${renderAccessoryGlasses(1)}</svg>`;
  } else if (itemId === 'hold_bible') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="12.5 8.5 5 6" class="pixel-item-svg" shape-rendering="crispEdges">${renderAccessoryBible(1)}</svg>`;
  } else if (itemId === 'back_daisy_field') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 11.5 19 5" class="pixel-item-svg" shape-rendering="crispEdges">${renderAccessoryDaisyField(1)}</svg>`;
  } else if (typeof AUTUMN_ITEM_PIXELS !== 'undefined' && AUTUMN_ITEM_PIXELS[itemId]) {
    const b = AUTUMN_ITEM_PIXELS[itemId].bounds;
    const pad = 1;
    const vb = `${b.minX - pad} ${b.minY - pad} ${b.maxX - b.minX + pad * 2 + 1} ${b.maxY - b.minY + pad * 2 + 1}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" class="pixel-item-svg" shape-rendering="crispEdges">${renderAutumnAccessory(itemId, 1)}</svg>`;
  }
  return '';
}

function renderSimplePixelGrid(rows, scale = 9, animClass = 'charles-static', equipped = {}) {
  const width = rows[0].length;
  const height = rows.length;

  // 가을 아이템 착용 여부 감지 (24x24 확장 캔버스)
  const isAutumn = equipped && (
    equipped.grass === 'back_maple_carpet' || equipped.back === 'back_maple_carpet' ||
    equipped.side === 'side_autumn_pumpkin' || equipped.hold === 'side_autumn_pumpkin' ||
    equipped.hold === 'hold_autumn_lantern' || equipped.hold === 'hold_apple_basket' ||
    equipped.neck === 'neck_acorn_scarf' ||
    equipped.head === 'head_maple_beret'
  );

  const finalWidth = isAutumn ? Math.max(24, width) : width;
  const finalHeight = isAutumn ? Math.max(24, height) : height;
  const svgWidth = finalWidth * scale;
  const svgHeight = finalHeight * scale;

  // Layer 1: Back / Floor 악세사리 (피크닉 데이지 풀밭 또는 황금빛 낙엽 카펫)
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

  // Layer 2: 찰스 본체
  let bodyRects = '';
  for (let y = 0; y < height; y++) {
    const row = rows[y];
    for (let x = 0; x < width; x++) {
      const char = row[x];
      if (char === '.') continue;

      let fill = '#18181B';
      if (char === 'W') fill = '#FFFFFF';
      else if (char === 'G') fill = '#E2E8F0';
      else if (char === 'P') fill = '#FF8EA3';
      else if (char === 'Y') fill = '#F4D03F';
      else if (char === 'S') fill = '#2ECC71';
      else if (char === 'B') fill = '#18181B';

      bodyRects += `<rect x="${x * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="${fill}" />`;
    }
  }

  // Layer 2.5: Neck 악세사리 (도토리 니트 목도리 - 찰스 목/가슴에 맞춤)
  let neckRects = '';
  if (equipped && (equipped.neck === 'neck_acorn_scarf' || equipped.neck_acorn_scarf)) {
    neckRects += renderAutumnAccessory('neck_acorn_scarf', scale, 0, -3);
  }

  // Layer 3: Glasses 악세사리 (몸통 부위 - 둥근 범생이 안경)
  let glassesRects = '';
  if (equipped && (equipped.glasses === 'head_glasses' || equipped.head === 'head_glasses' || equipped.body === 'head_glasses' || equipped.head_glasses)) {
    const glassesYOffset = (typeof SIMPLE_PIXEL_STAGE_4 !== 'undefined' && rows === SIMPLE_PIXEL_STAGE_4) ? 2 : 0;
    glassesRects = renderAccessoryGlasses(scale, glassesYOffset);
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

// 4단계: 풍성한 찰스 (복슬복슬 귀여운 털과 앙증맞은 볼터치)
const SIMPLE_PIXEL_STAGE_4 = [
  "..................",
  ".........BB.......",
  "......BBBWWBBB....",
  ".....BWWBWWBWWB...",
  ".......WWWWWW.....",
  "....BWWWWWWWWWWB..",
  "...BWWWWWWWWWWWB..",
  "..BWBWWWWWWWWWGB..",
  "...BWWWBBWWBBWG.B.",
  "..B.WWBBWWBBWWW.B.",
  "..B.WPPWWGWWPPWB..",
  "...BWWWWBBWWWWWB..",
  "....BWWWWWWWWWB...",
  ".....BBBBBBBBB....",
  ".....BB....BB.....",
  ".....BB....BB....."
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
  module.exports = { CHARLES_STAGES, getCharlesVisual, renderSimplePixelGrid, getAccessoryIconSvg };
}
