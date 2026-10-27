/**
 * Charles' Bible - 말씀 노트 및 형광펜 하이라이터 서비스 (BibleNotesService)
 * [Local-First 즉시 반영 + Supabase 클라우드 전용 테이블(user_bible_highlights) 동기화]
 */

const BibleNotesService = {
  _cache: null,
  _syncTimeout: null,
  _tableMissingWarned: false,

  getCurrentUserId() {
    if (typeof StorageService !== 'undefined' && StorageService.getCurrentUserId) {
      return StorageService.getCurrentUserId();
    }
    try {
      const uStr = localStorage.getItem('charles_current_user');
      if (uStr) {
        const u = JSON.parse(uStr);
        if (u && u.id) return String(u.id).trim();
      }
    } catch (e) {}
    return 'guest';
  },

  getUserKey() {
    const uid = this.getCurrentUserId();
    return `charles_user_${uid}_bible_highlights`;
  },

  /**
   * 로컬 스토리지에서 전체 하이라이트/노트 맵 로드
   * Key: `${bookId}_${chapter}_${verse}` (예: 'MAT_1_21')
   */
  _loadLocalData() {
    const key = this.getUserKey();
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        this._cache = JSON.parse(raw);
        return this._cache;
      }
    } catch (e) {
      console.warn('⚠️ 하이라이트 로컬 데이터 파싱 실패:', e);
    }
    this._cache = {};
    return this._cache;
  },

  _saveLocalData() {
    if (!this._cache) this._cache = {};
    const key = this.getUserKey();
    try {
      localStorage.setItem(key, JSON.stringify(this._cache));
    } catch (e) {
      console.warn('⚠️ 하이라이트 로컬 데이터 저장 실패:', e);
    }
  },

  init() {
    this._loadLocalData();
    // 로그인 상태라면 클라우드 동기화 1회 시도
    const uid = this.getCurrentUserId();
    if (uid && uid !== 'guest') {
      setTimeout(() => {
        this.syncFromCloud(uid);
      }, 500);
    }
  },

  /**
   * 특정 장(Chapter)에 속한 모든 절의 하이라이트/노트 반환
   * @param {string} bookId 'GEN', 'MAT' 등
   * @param {number|string} chapter 장 번호
   * @returns {Object.<number, Object>} 절 번호를 키로 하는 하이라이트 객체 맵
   */
  getHighlightsForChapter(bookId, chapter) {
    if (!this._cache) this._loadLocalData();
    const ch = Number(chapter);
    const result = {};
    const prefix = `${bookId}_${ch}_`;

    for (const [key, item] of Object.entries(this._cache)) {
      if (key.startsWith(prefix) && item) {
        const v = Number(item.verse);
        if (v) {
          result[v] = item;
        }
      }
    }
    return result;
  },

  /**
   * 특정 절(Verse)의 하이라이트/노트 데이터 단건 조회
   */
  getHighlight(bookId, chapter, verse) {
    if (!this._cache) this._loadLocalData();
    const key = `${bookId}_${Number(chapter)}_${Number(verse)}`;
    return this._cache[key] || null;
  },

  /**
   * 형광펜 하이라이트 설정
   * @param {string} bookId
   * @param {number|string} chapter
   * @param {number|string} verse
   * @param {string} color 'yellow' | 'green' | 'blue' | 'pink' | 'purple'
   * @param {string} verseText 구절 원문
   * @param {string} [bookName] 권 한글 이름
   */
  async setHighlight(bookId, chapter, verse, color, verseText, bookName = '') {
    if (!this._cache) this._loadLocalData();
    const ch = Number(chapter);
    const v = Number(verse);
    const key = `${bookId}_${ch}_${v}`;

    // 책 이름 폴백
    let bName = bookName;
    if (!bName && typeof BIBLE_BOOKS !== 'undefined') {
      const bObj = BIBLE_BOOKS.find(b => b.id === bookId);
      if (bObj) bName = bObj.name;
    }

    const existing = this._cache[key] || {};
    const nowIso = new Date().toISOString();

    const item = {
      user_id: this.getCurrentUserId(),
      book_id: bookId,
      book_name: bName || existing.book_name || bookId,
      chapter: ch,
      verse: v,
      verse_text: (verseText || existing.verse_text || '').trim(),
      color: color || 'yellow',
      note: existing.note || '',
      created_at: existing.created_at || nowIso,
      updated_at: nowIso
    };

    this._cache[key] = item;
    this._saveLocalData();

    // 클라우드 비동기 동기화
    this._syncSingleToCloud(item, false);
    return item;
  },

  /**
   * 형광펜 하이라이트 해제 (지우개)
   * 메모가 남아 있으면 색상만 'none'으로 변경하여 메모 보존, 메모도 없으면 완전 삭제
   */
  async removeHighlight(bookId, chapter, verse) {
    if (!this._cache) this._loadLocalData();
    const ch = Number(chapter);
    const v = Number(verse);
    const key = `${bookId}_${ch}_${v}`;
    const existing = this._cache[key];

    if (!existing) return null;

    const hasNote = existing.note && existing.note.trim().length > 0;
    if (hasNote) {
      // 묵상 메모가 남아있으므로 색상만 'none'으로 유지
      existing.color = 'none';
      existing.updated_at = new Date().toISOString();
      this._saveLocalData();
      this._syncSingleToCloud(existing, false);
      return existing;
    } else {
      // 메모도 없으므로 로컬 및 클라우드에서 완전 삭제
      delete this._cache[key];
      this._saveLocalData();
      this._syncSingleToCloud(existing, true);
      return null;
    }
  },

  /**
   * 묵상 노트(메모) 저장
   */
  async saveNote(bookId, chapter, verse, noteText, verseText = '', bookName = '', color = null) {
    if (!this._cache) this._loadLocalData();
    const ch = Number(chapter);
    const v = Number(verse);
    const key = `${bookId}_${ch}_${v}`;

    let bName = bookName;
    if (!bName && typeof BIBLE_BOOKS !== 'undefined') {
      const bObj = BIBLE_BOOKS.find(b => b.id === bookId);
      if (bObj) bName = bObj.name;
    }

    const existing = this._cache[key] || {};
    const nowIso = new Date().toISOString();

    const cleanNote = (noteText || '').trim();
    // 색상이 지정되지 않았다면 기존 색상 유지, 기존 색상도 없으면 'yellow' 기본 부여
    const effectiveColor = color || (existing.color && existing.color !== 'none' ? existing.color : 'yellow');

    const item = {
      user_id: this.getCurrentUserId(),
      book_id: bookId,
      book_name: bName || existing.book_name || bookId,
      chapter: ch,
      verse: v,
      verse_text: (verseText || existing.verse_text || '').trim(),
      color: effectiveColor,
      note: cleanNote,
      created_at: existing.created_at || nowIso,
      updated_at: nowIso
    };

    this._cache[key] = item;
    this._saveLocalData();

    this._syncSingleToCloud(item, false);
    return item;
  },

  /**
   * 묵상 노트(메모) 삭제
   */
  async deleteNote(bookId, chapter, verse) {
    if (!this._cache) this._loadLocalData();
    const ch = Number(chapter);
    const v = Number(verse);
    const key = `${bookId}_${ch}_${v}`;
    const existing = this._cache[key];

    if (!existing) return null;

    const hasHighlight = existing.color && existing.color !== 'none';
    if (hasHighlight) {
      // 하이라이트 색상은 유지하고 노트만 제거
      existing.note = '';
      existing.updated_at = new Date().toISOString();
      this._saveLocalData();
      this._syncSingleToCloud(existing, false);
      return existing;
    } else {
      // 하이라이트도 없으므로 완전 삭제
      delete this._cache[key];
      this._saveLocalData();
      this._syncSingleToCloud(existing, true);
      return null;
    }
  },

  /**
   * 전체 하이라이트 및 노트 개수 요약
   */
  getSummaryCounts() {
    if (!this._cache) this._loadLocalData();
    let totalHighlights = 0;
    let totalNotes = 0;

    for (const item of Object.values(this._cache)) {
      if (item) {
        if (item.color && item.color !== 'none') totalHighlights++;
        if (item.note && item.note.trim().length > 0) totalNotes++;
      }
    }
    return {
      total: Object.keys(this._cache).length,
      highlights: totalHighlights,
      notes: totalNotes
    };
  },

  /**
   * '내 말씀 노트 모음' 허브 조회를 위한 필터링 및 검색 목록 반환
   * @param {Object} options
   * @param {string} [options.color] 'all' | 'yellow' | 'green' | 'blue' | 'pink' | 'purple'
   * @param {boolean} [options.onlyNotes] true면 노트가 있는 구절만
   * @param {string} [options.keyword] 검색 키워드 (구절 본문, 책이름, 메모 검색)
   */
  getAllHighlights({ color = 'all', onlyNotes = false, keyword = '' } = {}) {
    if (!this._cache) this._loadLocalData();

    const list = Object.values(this._cache).filter(item => {
      if (!item) return false;

      // 노트 전용 필터
      if (onlyNotes && (!item.note || item.note.trim().length === 0)) {
        return false;
      }

      // 색상 필터
      if (color && color !== 'all') {
        if (item.color !== color) return false;
      }

      // 키워드 검색
      if (keyword && keyword.trim().length > 0) {
        const q = keyword.trim().toLowerCase();
        const inText = (item.verse_text || '').toLowerCase().includes(q);
        const inNote = (item.note || '').toLowerCase().includes(q);
        const inBook = (item.book_name || '').toLowerCase().includes(q);
        const inRef = `${item.chapter}장 ${item.verse}절`.includes(q);
        if (!inText && !inNote && !inBook && !inRef) return false;
      }

      return true;
    });

    // 최신 수정일순 정렬 (updated_at DESC)
    list.sort((a, b) => {
      const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
      const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
      return timeB - timeA;
    });

    return list;
  },

  // ==================== Supabase 클라우드 동기화 엔진 ====================

  /**
   * 단건 클라우드 비동기 동기화 (Upsert or Delete)
   */
  async _syncSingleToCloud(item, isDelete = false) {
    const uid = this.getCurrentUserId();
    if (!uid || uid === 'guest') return false;
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return false;

    try {
      if (isDelete) {
        const { error } = await supabaseClient
          .from('user_bible_highlights')
          .delete()
          .eq('user_id', uid)
          .eq('book_id', item.book_id)
          .eq('chapter', item.chapter)
          .eq('verse', item.verse);

        if (error) {
          if (error.code === '42P01') {
            this._warnTableMissing();
          } else {
            console.warn('☁️ 말씀 하이라이트 삭제 동기화 경고:', error.message || error);
          }
          return false;
        }
        return true;
      } else {
        const payload = {
          user_id: uid,
          book_id: item.book_id,
          book_name: item.book_name,
          chapter: item.chapter,
          verse: item.verse,
          verse_text: item.verse_text,
          color: item.color || 'yellow',
          note: item.note || '',
          updated_at: item.updated_at || new Date().toISOString()
        };

        const { error } = await supabaseClient
          .from('user_bible_highlights')
          .upsert(payload, { onConflict: 'user_id,book_id,chapter,verse' });

        if (error) {
          if (error.code === '42P01') {
            this._warnTableMissing();
          } else {
            console.warn('☁️ 말씀 하이라이트 저장 동기화 경고:', error.message || error);
          }
          return false;
        }
        return true;
      }
    } catch (err) {
      console.warn('☁️ 말씀 하이라이트 동기화 예외 발생:', err);
      return false;
    }
  },

  /**
   * Supabase 클라우드에서 사용자의 전체 하이라이트 및 묵상 노트 다운로드 및 병합
   */
  async syncFromCloud(userId) {
    const uid = userId || this.getCurrentUserId();
    if (!uid || uid === 'guest') return false;
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return false;

    try {
      const { data, error } = await supabaseClient
        .from('user_bible_highlights')
        .select('*')
        .eq('user_id', uid);

      if (error) {
        if (error.code === '42P01') {
          this._warnTableMissing();
        } else {
          console.warn('☁️ Supabase 하이라이트 다운로드 경고:', error.message || error);
        }
        return false;
      }

      if (Array.isArray(data)) {
        if (!this._cache) this._loadLocalData();
        let changed = false;

        data.forEach(remoteItem => {
          const key = `${remoteItem.book_id}_${remoteItem.chapter}_${remoteItem.verse}`;
          const localItem = this._cache[key];

          if (!localItem) {
            this._cache[key] = remoteItem;
            changed = true;
          } else {
            // 더 최신 타임스탬프를 가진 데이터 유지
            const remoteTime = new Date(remoteItem.updated_at || 0).getTime();
            const localTime = new Date(localItem.updated_at || 0).getTime();
            if (remoteTime > localTime) {
              this._cache[key] = remoteItem;
              changed = true;
            }
          }
        });

        if (changed) {
          this._saveLocalData();
          console.log(`☁️ Supabase 말씀 하이라이트 동기화 완료: 총 ${data.length}개 수신 및 로컬 병합`);
        }
        return true;
      }
    } catch (err) {
      console.warn('☁️ Supabase 하이라이트 동기화 에러:', err);
      return false;
    }
  },

  _warnTableMissing() {
    if (this._tableMissingWarned) return;
    this._tableMissingWarned = true;
    console.info(
      '💡 [알림] Supabase에 user_bible_highlights 테이블이 아직 생성되지 않았습니다.\n' +
      'sql/create_user_bible_highlights.sql 스크립트를 Supabase SQL Editor에서 실행하시면 클라우드 영구 저장이 활성화됩니다.\n' +
      '(현재는 로컬 스토리지에 안전하게 자동 저장됩니다.)'
    );
  }
};

if (typeof window !== 'undefined') {
  window.BibleNotesService = BibleNotesService;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BibleNotesService };
}
