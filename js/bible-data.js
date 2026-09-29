/**
 * Charles' Bible - Complete 66 Books Dataset & Bible Reader Engine
 * 개역개정 4판 (구약 39권 929장 + 신약 27권 260장 = 총 66권 1,189장 완전 데이터셋)
 */

const BIBLE_BOOKS = [
  // ==================== 구약 (39권 / 929장) ====================
  // 모세오경 (5권)
  { id: 'GEN', name: '창세기', eng: 'Genesis', file: 'Genesis.json', testament: 'OT', category: '모세오경', chapters: 50 },
  { id: 'EXO', name: '출애굽기', eng: 'Exodus', file: 'Exodus.json', testament: 'OT', category: '모세오경', chapters: 40 },
  { id: 'LEV', name: '레위기', eng: 'Leviticus', file: 'Leviticus.json', testament: 'OT', category: '모세오경', chapters: 27 },
  { id: 'NUM', name: '민수기', eng: 'Numbers', file: 'Numbers.json', testament: 'OT', category: '모세오경', chapters: 36 },
  { id: 'DEU', name: '신명기', eng: 'Deuteronomy', file: 'Deuteronomy.json', testament: 'OT', category: '모세오경', chapters: 34 },

  // 역사서 (12권)
  { id: 'JOS', name: '여호수아', eng: 'Joshua', file: 'Joshua.json', testament: 'OT', category: '역사서', chapters: 24 },
  { id: 'JDG', name: '사사기', eng: 'Judges', file: 'Judges.json', testament: 'OT', category: '역사서', chapters: 21 },
  { id: 'RUT', name: '룻기', eng: 'Ruth', file: 'Ruth.json', testament: 'OT', category: '역사서', chapters: 4 },
  { id: '1SA', name: '사무엘상', eng: '1 Samuel', file: '1Samuel.json', testament: 'OT', category: '역사서', chapters: 31 },
  { id: '2SA', name: '사무엘하', eng: '2 Samuel', file: '2Samuel.json', testament: 'OT', category: '역사서', chapters: 24 },
  { id: '1KI', name: '열왕기상', eng: '1 Kings', file: '1Kings.json', testament: 'OT', category: '역사서', chapters: 22 },
  { id: '2KI', name: '열왕기하', eng: '2 Kings', file: '2Kings.json', testament: 'OT', category: '역사서', chapters: 25 },
  { id: '1CH', name: '역대상', eng: '1 Chronicles', file: '1Chronicles.json', testament: 'OT', category: '역사서', chapters: 29 },
  { id: '2CH', name: '역대하', eng: '2 Chronicles', file: '2Chronicles.json', testament: 'OT', category: '역사서', chapters: 36 },
  { id: 'EZR', name: '에스라', eng: 'Ezra', file: 'Ezra.json', testament: 'OT', category: '역사서', chapters: 10 },
  { id: 'NEH', name: '느헤미야', eng: 'Nehemiah', file: 'Nehemiah.json', testament: 'OT', category: '역사서', chapters: 13 },
  { id: 'EST', name: '에스더', eng: 'Esther', file: 'Esther.json', testament: 'OT', category: '역사서', chapters: 10 },

  // 시가서 (5권)
  { id: 'JOB', name: '욥기', eng: 'Job', file: 'Job.json', testament: 'OT', category: '시가서', chapters: 42 },
  { id: 'PSA', name: '시편', eng: 'Psalms', file: 'Psalms.json', testament: 'OT', category: '시가서', chapters: 150 },
  { id: 'PRO', name: '잠언', eng: 'Proverbs', file: 'Proverbs.json', testament: 'OT', category: '시가서', chapters: 31 },
  { id: 'ECC', name: '전도서', eng: 'Ecclesiastes', file: 'Ecclesiastes.json', testament: 'OT', category: '시가서', chapters: 12 },
  { id: 'SNG', name: '아가', eng: 'Song of Solomon', file: 'SongofSolomon.json', testament: 'OT', category: '시가서', chapters: 8 },

  // 대선지서 (5권)
  { id: 'ISA', name: '이사야', eng: 'Isaiah', file: 'Isaiah.json', testament: 'OT', category: '대선지서', chapters: 66 },
  { id: 'JER', name: '예레미야', eng: 'Jeremiah', file: 'Jeremiah.json', testament: 'OT', category: '대선지서', chapters: 52 },
  { id: 'LAM', name: '예레미야애가', eng: 'Lamentations', file: 'Lamentations.json', testament: 'OT', category: '대선지서', chapters: 5 },
  { id: 'EZK', name: '에스겔', eng: 'Ezekiel', file: 'Ezekiel.json', testament: 'OT', category: '대선지서', chapters: 48 },
  { id: 'DAN', name: '다니엘', eng: 'Daniel', file: 'Daniel.json', testament: 'OT', category: '대선지서', chapters: 12 },

  // 소선지서 (12권)
  { id: 'HOS', name: '호세아', eng: 'Hosea', file: 'Hosea.json', testament: 'OT', category: '소선지서', chapters: 14 },
  { id: 'JOL', name: '요엘', eng: 'Joel', file: 'Joel.json', testament: 'OT', category: '소선지서', chapters: 3 },
  { id: 'AMO', name: '아모스', eng: 'Amos', file: 'Amos.json', testament: 'OT', category: '소선지서', chapters: 9 },
  { id: 'OBA', name: '오바댜', eng: 'Obadiah', file: 'Obadiah.json', testament: 'OT', category: '소선지서', chapters: 1 },
  { id: 'JON', name: '요나', eng: 'Jonah', file: 'Jonah.json', testament: 'OT', category: '소선지서', chapters: 4 },
  { id: 'MIC', name: '미가', eng: 'Micah', file: 'Micah.json', testament: 'OT', category: '소선지서', chapters: 7 },
  { id: 'NAM', name: '나훔', eng: 'Nahum', file: 'Nahum.json', testament: 'OT', category: '소선지서', chapters: 3 },
  { id: 'HAB', name: '하박국', eng: 'Habakkuk', file: 'Habakkuk.json', testament: 'OT', category: '소선지서', chapters: 3 },
  { id: 'ZEP', name: '스바냐', eng: 'Zephaniah', file: 'Zephaniah.json', testament: 'OT', category: '소선지서', chapters: 3 },
  { id: 'HAG', name: '학개', eng: 'Haggai', file: 'Haggai.json', testament: 'OT', category: '소선지서', chapters: 2 },
  { id: 'ZEC', name: '스가랴', eng: 'Zechariah', file: 'Zechariah.json', testament: 'OT', category: '소선지서', chapters: 14 },
  { id: 'MAL', name: '말라기', eng: 'Malachi', file: 'Malachi.json', testament: 'OT', category: '소선지서', chapters: 4 },

  // ==================== 신약 (27권 / 260장) ====================
  // 복음서 (4권)
  { id: 'MAT', name: '마태복음', eng: 'Matthew', file: 'Matthew.json', testament: 'NT', category: '복음서', chapters: 28 },
  { id: 'MRK', name: '마가복음', eng: 'Mark', file: 'Mark.json', testament: 'NT', category: '복음서', chapters: 16 },
  { id: 'LUK', name: '누가복음', eng: 'Luke', file: 'Luke.json', testament: 'NT', category: '복음서', chapters: 24 },
  { id: 'JHN', name: '요한복음', eng: 'John', file: 'John.json', testament: 'NT', category: '복음서', chapters: 21 },

  // 역사서 (1권)
  { id: 'ACT', name: '사도행전', eng: 'Acts', file: 'Acts.json', testament: 'NT', category: '역사서', chapters: 28 },

  // 바울서신 (14권)
  { id: 'ROM', name: '로마서', eng: 'Romans', file: 'Romans.json', testament: 'NT', category: '바울서신', chapters: 16 },
  { id: '1CO', name: '고린도전서', eng: '1 Corinthians', file: '1Corinthians.json', testament: 'NT', category: '바울서신', chapters: 16 },
  { id: '2CO', name: '고린도후서', eng: '2 Corinthians', file: '2Corinthians.json', testament: 'NT', category: '바울서신', chapters: 13 },
  { id: 'GAL', name: '갈라디아서', eng: 'Galatians', file: 'Galatians.json', testament: 'NT', category: '바울서신', chapters: 6 },
  { id: 'EPH', name: '에베소서', eng: 'Ephesians', file: 'Ephesians.json', testament: 'NT', category: '바울서신', chapters: 6 },
  { id: 'PHP', name: '빌립보서', eng: 'Philippians', file: 'Philippians.json', testament: 'NT', category: '바울서신', chapters: 4 },
  { id: 'COL', name: '골로새서', eng: 'Colossians', file: 'Colossians.json', testament: 'NT', category: '바울서신', chapters: 4 },
  { id: '1TH', name: '데살로니가전서', eng: '1 Thessalonians', file: '1Thessalonians.json', testament: 'NT', category: '바울서신', chapters: 5 },
  { id: '2TH', name: '데살로니가후서', eng: '2 Thessalonians', file: '2Thessalonians.json', testament: 'NT', category: '바울서신', chapters: 3 },
  { id: '1TI', name: '디모데전서', eng: '1 Timothy', file: '1Timothy.json', testament: 'NT', category: '바울서신', chapters: 6 },
  { id: '2TI', name: '디모데후서', eng: '2 Timothy', file: '2Timothy.json', testament: 'NT', category: '바울서신', chapters: 4 },
  { id: 'TIT', name: '디도서', eng: 'Titus', file: 'Titus.json', testament: 'NT', category: '바울서신', chapters: 3 },
  { id: 'PHM', name: '빌레몬서', eng: 'Philemon', file: 'Philemon.json', testament: 'NT', category: '바울서신', chapters: 1 },
  { id: 'HEB', name: '히브리서', eng: 'Hebrews', file: 'Hebrews.json', testament: 'NT', category: '공동/기타서신', chapters: 13 },

  // 일반서신 (7권)
  { id: 'JAS', name: '야고보서', eng: 'James', file: 'James.json', testament: 'NT', category: '공동/기타서신', chapters: 5 },
  { id: '1PE', name: '베드로전서', eng: '1 Peter', file: '1Peter.json', testament: 'NT', category: '공동/기타서신', chapters: 5 },
  { id: '2PE', name: '베드로후서', eng: '2 Peter', file: '2Peter.json', testament: 'NT', category: '공동/기타서신', chapters: 3 },
  { id: '1JN', name: '요한일서', eng: '1 John', file: '1John.json', testament: 'NT', category: '공동/기타서신', chapters: 5 },
  { id: '2JN', name: '요한이서', eng: '2 John', file: '2John.json', testament: 'NT', category: '공동/기타서신', chapters: 1 },
  { id: '3JN', name: '요한삼서', eng: '3 John', file: '3John.json', testament: 'NT', category: '공동/기타서신', chapters: 1 },
  { id: 'JUD', name: '유다서', eng: 'Jude', file: 'Jude.json', testament: 'NT', category: '공동/기타서신', chapters: 1 },

  // 예언서 (1권)
  { id: 'REV', name: '요한계시록', eng: 'Revelation', file: 'Revelation.json', testament: 'NT', category: '예언서', chapters: 22 }
];

const BIBLE_TOTAL_BOOKS = BIBLE_BOOKS.length; // 66
const BIBLE_TOTAL_CHAPTERS = BIBLE_BOOKS.reduce((sum, b) => sum + b.chapters, 0); // 1,189
const OT_CHAPTERS = BIBLE_BOOKS.filter(b => b.testament === 'OT').reduce((sum, b) => sum + b.chapters, 0); // 929
const NT_CHAPTERS = BIBLE_BOOKS.filter(b => b.testament === 'NT').reduce((sum, b) => sum + b.chapters, 0); // 260

/**
 * 성경 본문 텍스트 로더 서비스 (메모리 캐싱 + 로컬 JSON/온라인 폴백 지원)
 */
const BibleTextService = {
  cache: {},

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`스크립트 로드 실패: ${src}`));
      document.head.appendChild(script);
    });
  },

  async loadBookData(bookId) {
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book) throw new Error('존재하지 않는 책 ID입니다.');

    // 0. 메모리 캐시 확인
    if (this.cache[bookId]) {
      return this.cache[bookId];
    }

    // 1. 사전 적재된 전역 번들 데이터(신약 27권 등) 확인 (file:// 및 오프라인 즉각 대응)
    const bookEngName = book.file.replace('.json', '');
    if (window.__BIBLE_DATA__) {
      const preloaded = window.__BIBLE_DATA__[bookId] || window.__BIBLE_DATA__[book.eng] || window.__BIBLE_DATA__[bookEngName];
      if (preloaded) {
        this.cache[bookId] = preloaded;
        return preloaded;
      }
    }

    // 2. 로컬 JSON Fetch 시도 (HTTP / HTTPS 서버 환경)
    const localUrl = `./data/bible/${book.file}`;
    try {
      const res = await fetch(localUrl);
      if (res.ok) {
        const data = await res.json();
        this.cache[bookId] = data;
        return data;
      }
    } catch (localErr) {
      console.warn(`Local fetch failed for ${book.file}, trying dynamic script tag (file:/// support)...`, localErr);
    }

    // 3. 동적 스크립트 태그 로드 (file:/// 로컬 파일 직접 열기 시 CORS 우회 지원)
    try {
      const jsUrl = `./data/bible/${bookEngName}.js`;
      await this.loadScript(jsUrl);
      if (window.__BIBLE_DATA__) {
        const loaded = window.__BIBLE_DATA__[bookId] || window.__BIBLE_DATA__[book.eng] || window.__BIBLE_DATA__[bookEngName];
        if (loaded) {
          this.cache[bookId] = loaded;
          return loaded;
        }
      }
    } catch (scriptErr) {
      console.warn(`Dynamic script load failed for ${bookEngName}.js:`, scriptErr);
    }

    throw new Error(`성경 본문(${book.name})을 불러올 수 없습니다. 인터넷 연결 또는 로컬 서버를 확인해 주세요.`);
  },

  /**
   * 특정 권의 특정 장 본문 절(verses) 배열 가져오기
   * @param {string} bookId 'GEN' 등
   * @param {number} chapter 1, 2, ...
   * @returns {Promise<{ book: object, chapter: number, verses: Array<{ verse: number, text: string }> }>}
   */
  async getChapterVerses(bookId, chapter) {
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    const data = await this.loadBookData(bookId);

    const chapterData = data.chapters.find(c => c.chapter === Number(chapter));
    if (!chapterData) {
      throw new Error(`${book.name} ${chapter}장을 찾을 수 없습니다.`);
    }

    return {
      book,
      chapter: Number(chapter),
      verses: chapterData.verses
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BIBLE_BOOKS, BIBLE_TOTAL_BOOKS, BIBLE_TOTAL_CHAPTERS, OT_CHAPTERS, NT_CHAPTERS, BibleTextService };
}
