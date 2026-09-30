/**
 * Charles' Bible - 심플 & 큐트 픽셀 양 찰스 (Simple & Cute Charles the Sheep)
 * 미니멀하고 귀여운 흑백 도트 캐릭터 및 5단계 상태
 */

const CHARLES_STAGES = {
  1: {
    stage: 1,
    title: "Charles is starving...",
    level: 1
  },
  2: {
    stage: 2,
    title: "Charles is chewing the Word",
    level: 2
  },
  3: {
    stage: 3,
    title: "Charles is happy",
    level: 3
  },
  4: {
    stage: 4,
    title: "Charles is fluffy",
    level: 4
  },
  5: {
    stage: 5,
    title: "Charles is holy & full of grace",
    level: 5
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
function renderSimplePixelGrid(rows, scale = 9, animClass = 'cute-idle') {
  const width = rows[0].length;
  const height = rows.length;
  const svgWidth = width * scale;
  const svgHeight = height * scale;

  let rects = '';
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

      rects += `<rect x="${x * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="${fill}" />`;
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" 
         class="charles-svg ${animClass}" 
         style="image-rendering: pixelated; shape-rendering: crispEdges; width: 100%; height: auto; max-width: 220px; display: block; margin: 0 auto;">
      ${rects}
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
function getCharlesVisual(stage = 1, scale = 8) {
  const safeStage = Math.max(1, Math.min(5, Math.floor(stage)));
  const info = CHARLES_STAGES[safeStage];

  let pixelMap = SIMPLE_PIXEL_STAGE_1;
  let animClass = 'cute-breathe';

  if (safeStage === 2) {
    pixelMap = SIMPLE_PIXEL_STAGE_2;
    animClass = 'cute-chew';
  } else if (safeStage === 3) {
    pixelMap = SIMPLE_PIXEL_STAGE_3;
    animClass = 'cute-bounce';
  } else if (safeStage === 4) {
    pixelMap = SIMPLE_PIXEL_STAGE_4;
    animClass = 'cute-hop';
  } else if (safeStage === 5) {
    pixelMap = SIMPLE_PIXEL_STAGE_5;
    animClass = 'cute-float';
  }

  const svg = renderSimplePixelGrid(pixelMap, scale, animClass);

  return {
    stage: safeStage,
    info,
    svg
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CHARLES_STAGES, getCharlesVisual, renderSimplePixelGrid };
}
