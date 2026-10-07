/**
 * Charles' Bible - LocalStorage 데이터 관리, 통독 진도, 스트릭, 찰스 상태 연산
 * [유저별 격리 스토리지 + 일일 자정 평가 엔진 + Supabase 클라우드 동기화]
 */

const STORAGE_KEYS = {
  LEGACY_PROGRESS: 'charles_read_progress',
  LEGACY_HISTORY: 'charles_read_history',
  LEGACY_STREAK: 'charles_streak_info',
  SETTINGS: 'charles_app_settings'
};

const StorageService = {
  // 현재 로그인 사용자 ID 가져오기 (비로그인 시 'guest')
  getCurrentUserId() {
    try {
      const uStr = localStorage.getItem('charles_current_user');
      if (uStr) {
        const u = JSON.parse(uStr);
        if (u && u.id) return String(u.id).trim();
      }
    } catch (e) {}
    return 'guest';
  },

  // 유저별 격리 스토리지 키 생성
  getUserKey(baseKey) {
    const uid = this.getCurrentUserId();
    return `charles_user_${uid}_${baseKey}`;
  },

  // 로컬 오늘 날짜 문자열 YYYY-MM-DD
  getTodayDateStr() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 날짜 연산 헬퍼: baseDateStr (YYYY-MM-DD) + days
  addDays(dateStr, days) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const ry = date.getFullYear();
    const rm = String(date.getMonth() + 1).padStart(2, '0');
    const rd = String(date.getDate()).padStart(2, '0');
    return `${ry}-${rm}-${rd}`;
  },

  // 어제 날짜 문자열 YYYY-MM-DD (refDateStr 지정 시 해당 날짜의 전날 반환)
  getYesterdayDateStr(refDateStr = null) {
    if (refDateStr) {
      return this.addDays(refDateStr, -1);
    }
    return this.addDays(this.getTodayDateStr(), -1);
  },

  // ==================== 1. 성경 진행도 (User-Scoped) ====================
  getProgress() {
    const key = this.getUserKey('progress');
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);

      // 레거시 전역 데이터가 있으면 첫 1회 마이그레이션
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_PROGRESS);
      if (legacy && this.getCurrentUserId() !== 'guest') {
        localStorage.setItem(key, legacy);
        return JSON.parse(legacy);
      }
      return {};
    } catch (e) {
      return {};
    }
  },

  isChapterRead(bookId, chapter) {
    const progress = this.getProgress();
    return !!progress[`${bookId}_${chapter}`];
  },

  setChapterRead(bookId, chapter, markAsRead = true) {
    const key = `${bookId}_${chapter}`;
    const progress = this.getProgress();
    const alreadyRead = !!progress[key];

    if (markAsRead) {
      if (!alreadyRead) {
        progress[key] = true;
        this.saveProgress(progress);
        this.recordHistory(bookId, chapter);
        this.updateStreak();
        this.incrementDailyCount(this.getTodayDateStr());
        this.scheduleCloudSync();
        return true;
      }
      return false;
    } else {
      if (alreadyRead) {
        delete progress[key];
        this.saveProgress(progress);
        this.scheduleCloudSync();
        return true;
      }
      return false;
    }
  },

  toggleChapter(bookId, chapter) {
    const key = `${bookId}_${chapter}`;
    const progress = this.getProgress();
    const isNowRead = !progress[key];
    this.setChapterRead(bookId, chapter, isNowRead);
    return isNowRead;
  },

  saveProgress(progress) {
    const key = this.getUserKey('progress');
    localStorage.setItem(key, JSON.stringify(progress));
  },

  // ==================== 2. 일별 읽은 장 수 (Daily Counts) ====================
  getDailyCounts() {
    const key = this.getUserKey('daily_counts');
    try {
      const data = localStorage.getItem(key);
      const parsed = data ? JSON.parse(data) : {};
      if (parsed && typeof parsed === 'object') {
        const { __talent_data__, ...rest } = parsed;
        return rest;
      }
      return {};
    } catch (e) {
      return {};
    }
  },

  getDailyReadCount(dateStr) {
    const counts = this.getDailyCounts();
    return counts[dateStr] || 0;
  },

  incrementDailyCount(dateStr) {
    const key = this.getUserKey('daily_counts');
    const counts = this.getDailyCounts();
    counts[dateStr] = (counts[dateStr] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(counts));
  },

  getTodayReadCount() {
    return this.getDailyReadCount(this.getTodayDateStr());
  },

  // ==================== 3. 찰스 일일 평가 엔진 (Midnight Evaluator) ====================
  /**
   * 찰스의 단계 변화 규칙:
   * 1. 매일 밤 12시(자정) 기준 하루 동안 읽은 성경 장 수로 평가
   *    - 0장 읽음: 이전 단계로 하락 (최하 1단계)
   *    - 1~2장 읽음: 현재 단계 유지 (단, 5단계는 제외)
   *    - 3장 이상 읽음: 다음 단계로 성장 (최대 5단계)
   * 2. 최고단계(5단계)를 유지하려면 하루에 5장 이상 읽어야 함
   *    (5단계에서 1~4장 통독 시 4단계로 하락, 5장 이상 통독 시 5단계 유지)
   */

  /**
   * 캘린더 데이터(daily_counts)를 기준으로 어제 자정까지의 찰스 성장 단계를 결정론적(Deterministic)으로 산출
   * @param {Object} [dailyCounts] - 날짜별 통독 장수 딕셔너리 {"YYYY-MM-DD": count, ...}
   * @param {string} [todayStr] - 기준 오늘 날짜 (기본: getTodayDateStr())
   * @returns {number} 찰스 공식 성장 단계 (1~5)
   */
  calculateStageFromDaily(dailyCounts = null, todayStr = null) {
    const counts = dailyCounts || this.getDailyCounts();
    const today = todayStr || this.getTodayDateStr();
    const yesterday = this.getYesterdayDateStr(today);

    // 실제 1장 이상 읽은 날짜 목록
    const validDates = Object.keys(counts)
      .filter(d => d !== '__talent_data__' && /^\d{4}-\d{2}-\d{2}$/.test(d) && (counts[d] || 0) > 0)
      .sort();

    // 통독 기록이 전혀 없으면 기본 1단계
    if (validDates.length === 0) {
      return 1;
    }

    const firstDate = validDates[0];
    let currentStage = 1;

    // 첫 통독 시작일부터 어제까지 매일의 성경 통독 장수로 순차적 성장/하락 평가
    let cursorDate = firstDate;
    while (cursorDate <= yesterday) {
      const readCount = counts[cursorDate] || 0;

      if (readCount === 0) {
        // 0장 읽음: 단계 하락
        currentStage = Math.max(1, currentStage - 1);
      } else if (readCount >= 1 && readCount <= 2) {
        // 1~2장 읽음: 유지 (단, 5단계는 5장 미만이므로 4단계로 하락)
        if (currentStage === 5) {
          currentStage = 4;
        }
      } else if (readCount >= 3 && readCount <= 4) {
        // 3~4장 읽음: 성장 (단, 5단계는 5장 미만이므로 4단계로 하락)
        if (currentStage === 5) {
          currentStage = 4;
        } else {
          currentStage = Math.min(5, currentStage + 1);
        }
      } else if (readCount >= 5) {
        // 5장 이상 읽음: 5단계 유지 또는 다음 단계 성장
        currentStage = Math.min(5, currentStage + 1);
      }

      cursorDate = this.addDays(cursorDate, 1);
    }

    return currentStage;
  },

  evaluateCharlesMidnight() {
    const stageKey = this.getUserKey('stage');
    const lastEvalKey = this.getUserKey('last_evaluated_date');
    const yesterday = this.getYesterdayDateStr();

    // 캘린더 데이터를 기반으로 100% 무결점 결정론적 단계 계산
    const currentStage = this.calculateStageFromDaily();

    localStorage.setItem(lastEvalKey, yesterday);
    localStorage.setItem(stageKey, String(currentStage));

    return currentStage;
  },

  // 찰스 현재 단계 조회 (캘린더 기반 항상 최신 정밀 평가)
  getCharlesStage() {
    return this.evaluateCharlesMidnight();
  },

  // 오늘 밤 자정 예상 평가 상태 헬퍼
  getTodayForecast() {
    const currentStage = this.getCharlesStage();
    const todayRead = this.getTodayReadCount();

    let targetStage = currentStage;
    let message = '';
    let statusClass = 'maintain';

    if (todayRead === 0) {
      targetStage = Math.max(1, currentStage - 1);
      statusClass = 'down';
      message = '오늘 1장 이상 읽지 않으면 내일 찰스 단계가 내려가요! 🥺';
    } else if (todayRead >= 1 && todayRead <= 2) {
      if (currentStage === 5) {
        targetStage = 4;
        statusClass = 'down';
        message = `5단계 유지를 위해 오늘 ${5 - todayRead}장 더 읽어야 해요! 🌿`;
      } else {
        targetStage = currentStage;
        statusClass = 'maintain';
        message = `찰스 상태가 유지됩니다. ${3 - todayRead}장 더 읽으면 내일 승급해요! 🌱`;
      }
    } else if (todayRead >= 3 && todayRead <= 4) {
      if (currentStage === 5) {
        targetStage = 4;
        statusClass = 'down';
        message = `5단계 유지를 위해 오늘 ${5 - todayRead}장 더 읽어야 해요! 🌿`;
      } else {
        targetStage = Math.min(5, currentStage + 1);
        statusClass = 'up';
        message = `오늘 밤 다음 단계(${targetStage}단계)로 성장해요! 🎉`;
      }
    } else {
      // 5장 이상
      targetStage = Math.min(5, currentStage + 1);
      statusClass = 'up';
      if (currentStage === 5) {
        message = `완벽해요! 오늘 밤에도 최고 5단계가 유지됩니다 👑✨`;
      } else {
        message = `오늘 밤 다음 단계(${targetStage}단계)로 멋지게 성장해요! 🌿✨`;
      }
    }

    return {
      currentStage,
      todayRead,
      targetStage,
      statusClass,
      message
    };
  },

  // ==================== 4. 스트릭 & 히스토리 (User-Scoped) ====================
  recordHistory(bookId, chapter) {
    const key = this.getUserKey('history');
    try {
      const historyStr = localStorage.getItem(key);
      const history = historyStr ? JSON.parse(historyStr) : [];
      history.unshift({
        bookId,
        chapter,
        timestamp: new Date().toISOString(),
        date: this.getTodayDateStr()
      });
      if (history.length > 500) history.pop();
      localStorage.setItem(key, JSON.stringify(history));
    } catch (e) {}
  },

  getHistory() {
    const key = this.getUserKey('history');
    try {
      const str = localStorage.getItem(key);
      return str ? JSON.parse(str) : [];
    } catch (e) {
      return [];
    }
  },

  // ==================== 4. 연속 통독 일수 (Streak) - 캘린더(daily_counts) 기반 실시간 순수 계산 ====================
  /**
   * 캘린더 데이터(daily_counts)를 기준으로 연속 통독 일수(streak)를 순수 함수로 정밀 계산
   * @param {Object} [dailyCounts] - 날짜별 통독 장수 딕셔너리 {"YYYY-MM-DD": count, ...}
   * @param {string} [todayStr] - 기준 오늘 날짜 (기본: getTodayDateStr())
   * @returns {{ count: number, maxStreak: number, lastDate: string|null }}
   */
  calculateStreakFromDaily(dailyCounts = null, todayStr = null) {
    const counts = dailyCounts || this.getDailyCounts();
    const today = todayStr || this.getTodayDateStr();
    const yesterday = this.getYesterdayDateStr(today);

    // 실제 1장 이상 읽은 날짜 목록 (메타데이터 __talent_data__ 제외)
    const validDates = Object.keys(counts)
      .filter(d => d !== '__talent_data__' && /^\d{4}-\d{2}-\d{2}$/.test(d) && (counts[d] || 0) > 0)
      .sort();

    if (validDates.length === 0) {
      return { count: 0, maxStreak: 0, lastDate: null };
    }

    const lastDate = validDates[validDates.length - 1];

    // 1) 현재 연속 통독 일수 (currentStreak) 계산
    let currentStreak = 0;
    const todayRead = counts[today] || 0;
    const yesterdayRead = counts[yesterday] || 0;

    let checkDate = null;
    if (todayRead > 0) {
      // 오늘 읽었음 -> 오늘부터 역순으로 연속 일수 카운트
      checkDate = today;
    } else if (yesterdayRead > 0) {
      // 오늘 아직 안 읽었으나 어제 읽었음 -> 어제까지의 연속 기록 유지
      checkDate = yesterday;
    } else {
      // 오늘과 어제 모두 통독 기록 없음 -> 연속 통독 끊김 (0일)
      checkDate = null;
    }

    if (checkDate) {
      let cur = checkDate;
      while ((counts[cur] || 0) > 0) {
        currentStreak++;
        cur = this.addDays(cur, -1);
      }
    }

    // 2) 전체 기간 중 최대 연속 통독 일수 (maxStreak) 계산
    let maxStreak = 0;
    let tempStreak = 0;
    let prevDate = null;

    for (const d of validDates) {
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const expectedNext = this.addDays(prevDate, 1);
        if (d === expectedNext) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
      prevDate = d;
    }

    return {
      count: currentStreak,
      maxStreak: Math.max(maxStreak, currentStreak),
      lastDate: lastDate
    };
  },

  updateStreak() {
    // 캘린더 데이터를 바탕으로 최신 스트릭 정보 산출 및 로컬 스토리지 동기화
    const streak = this.getStreakInfo();
    const key = this.getUserKey('streak');
    try {
      localStorage.setItem(key, JSON.stringify(streak));
    } catch (e) {}
    return streak;
  },

  getStreakInfo() {
    // 로컬 스토리지에 캐시된 캘린더(daily_counts)로부터 항상 100% 실시간 무결점 계산
    const counts = this.getDailyCounts();
    const streak = this.calculateStreakFromDaily(counts);
    const key = this.getUserKey('streak');
    try {
      localStorage.setItem(key, JSON.stringify(streak));
    } catch (e) {}
    return streak;
  },

  // ==================== 5. 전체 통계 ====================
  getStats() {
    const progress = this.getProgress();
    const totalChapters = 1189; // 성경 전체 66권 장 수
    const OT_CHAPTERS = 929;
    const NT_CHAPTERS = 260;

    let totalRead = 0;
    let otRead = 0;
    let ntRead = 0;

    const bookProgress = {};
    BIBLE_BOOKS.forEach(b => {
      bookProgress[b.id] = 0;
    });

    Object.keys(progress).forEach(key => {
      if (!progress[key]) return;
      totalRead++;
      const [bId] = key.split('_');
      if (bookProgress[bId] !== undefined) {
        bookProgress[bId]++;
      }
      const book = BIBLE_BOOKS.find(b => b.id === bId);
      if (book) {
        if (book.testament === 'OT') otRead++;
        else if (book.testament === 'NT') ntRead++;
      }
    });

    const percent = Math.min(100, Math.round((totalRead / totalChapters) * 1000) / 10);
    const otPercent = Math.min(100, Math.round((otRead / OT_CHAPTERS) * 1000) / 10);
    const ntPercent = Math.min(100, Math.round((ntRead / NT_CHAPTERS) * 1000) / 10);

    return {
      totalRead,
      totalChapters,
      percent,
      otRead,
      otTotal: OT_CHAPTERS,
      otPercent,
      ntRead,
      ntTotal: NT_CHAPTERS,
      ntPercent,
      bookProgress,
      remaining: totalChapters - totalRead
    };
  },

  // 신약 27권 전체(260장) 완독 여부 확인 (데이터 상 100% 무결점 판정)
  isNTComplete() {
    const stats = this.getStats();
    return stats.ntRead >= stats.ntTotal && stats.ntTotal > 0;
  },

  getAchievements() {
    const stats = this.getStats();
    const streak = this.getStreakInfo();

    const isPentateuchComplete = ['GEN', 'EXO', 'LEV', 'NUM', 'DEU'].every(
      id => stats.bookProgress[id] === BIBLE_BOOKS.find(b => b.id === id).chapters
    );

    const isPsalmsComplete = stats.bookProgress['PSA'] === 150;
    const isGospelsComplete = ['MAT', 'MRK', 'LUK', 'JHN'].every(
      id => stats.bookProgress[id] === BIBLE_BOOKS.find(b => b.id === id).chapters
    );
    const isNTComplete = this.isNTComplete();
    const isAllComplete = stats.totalRead === stats.totalChapters;

    return [
      { id: 'first_step', name: '첫 걸음', desc: '성경 1장 이상 완독', icon: '🌱', unlocked: stats.totalRead >= 1 },
      { id: 'streak_3', name: '착한 목자', desc: '3일 연속 성경 읽기', icon: '🔥', unlocked: streak.maxStreak >= 3 },
      { id: 'streak_7', name: '신실한 목자', desc: '7일 연속 성경 읽기', icon: '⭐', unlocked: streak.maxStreak >= 7 },
      { id: 'pentateuch', name: '율법의 빛', desc: '모세오경 (창~신) 완독', icon: '📜', unlocked: isPentateuchComplete },
      { id: 'psalms', name: '찬양의 노래', desc: '시편 150장 전체 완독', icon: '🎵', unlocked: isPsalmsComplete },
      { id: 'gospels', name: '예수의 생애', desc: '사복음서 (마~요) 완독', icon: '✝️', unlocked: isGospelsComplete },
      { id: 'nt_master', name: '새 언약의 성취', desc: '신약 27권 전체 완독', icon: '🕊️', unlocked: isNTComplete },
      { id: 'bible_master', name: '말씀의 면류관', desc: '성경 66권 1,189장 완독', icon: '👑', unlocked: isAllComplete }
    ];
  },

  // ==================== 6. Supabase 클라우드 동기화 ====================
  _syncTimeout: null,
  _supportsTalentColumns: null, // null: 미확인, true: 지원, false: 기본 컬럼만 사용

  scheduleCloudSync() {
    if (this._syncTimeout) clearTimeout(this._syncTimeout);
    this._syncTimeout = setTimeout(() => {
      this.saveToCloud();
    }, 1200);
  },

  async saveToCloud() {
    const uid = this.getCurrentUserId();
    if (!uid || uid === 'guest') return false;

    if (typeof supabaseClient === 'undefined' || !supabaseClient) return false;

    try {
      // 1) 달란트 및 퀘스트 데이터 패키징
      const talentPayload = {
        talents: typeof TalentService !== 'undefined' ? TalentService.getTalents() : parseInt(localStorage.getItem(this.getUserKey('talents')) || '0', 10),
        equipped: typeof TalentService !== 'undefined' ? TalentService.getEquipped() : JSON.parse(localStorage.getItem(this.getUserKey('equipped')) || '{}'),
        inventory: typeof TalentService !== 'undefined' ? TalentService.getInventory() : JSON.parse(localStorage.getItem(this.getUserKey('inventory')) || '[]'),
        quest_claims: typeof TalentService !== 'undefined' ? TalentService.getClaimedRecord() : JSON.parse(localStorage.getItem(this.getUserKey('quest_claims')) || '{}'),
        updated_at: localStorage.getItem(this.getUserKey('talents_updated_at')) || new Date().toISOString()
      };

      // 2) JSONB 컬럼인 daily_counts에 항상 임베드하여 Supabase 스키마 마이그레이션 없이도 모든 기기 즉시 동기화 보장
      const dailyCounts = { ...this.getDailyCounts() };
      dailyCounts.__talent_data__ = talentPayload;

      const streakInfo = this.getStreakInfo();
      const stage = this.getCharlesStage();
      const todayRead = this.getTodayReadCount();

      const payload = {
        user_id: uid,
        charles_stage: stage,
        read_progress: this.getProgress(),
        daily_counts: dailyCounts,
        read_history: this.getHistory(),
        streak_count: streakInfo.count || 0,
        max_streak: streakInfo.maxStreak || 0,
        last_evaluated_date: localStorage.getItem(this.getUserKey('last_evaluated_date')) || this.getYesterdayDateStr(),
        last_read_date: streakInfo.lastDate || this.getTodayDateStr(),
        updated_at: new Date().toISOString()
      };

      // Supabase 테이블에 개별 달란트 및 오늘 읽은 장수 컬럼이 존재하는 경우 함께 전송
      if (this._supportsTalentColumns !== false) {
        payload.talents = talentPayload.talents;
        payload.equipped = talentPayload.equipped;
        payload.inventory = talentPayload.inventory;
        payload.quest_claims = talentPayload.quest_claims;
        payload.today_read_chapters = this.getTodayReadCount();
      }

      let { error } = await supabaseClient
        .from('user_reading_state')
        .upsert(payload, { onConflict: 'user_id' });

      // Supabase 테이블에 달란트/아이템/오늘읽은장수 개별 컬럼이 아직 없을 경우의 자동 폴백
      if (error && (error.code === '42703' || error.code === 'PGRST204' || (error.message && error.message.includes('column')))) {
        this._supportsTalentColumns = false;
        console.warn('☁️ Supabase 테이블에 개별 컬럼 미존재 감지 -> daily_counts JSONB 임베딩으로 안전하게 동기화합니다.');
        delete payload.talents;
        delete payload.equipped;
        delete payload.inventory;
        delete payload.quest_claims;
        delete payload.today_read_chapters;
        const retryRes = await supabaseClient
          .from('user_reading_state')
          .upsert(payload, { onConflict: 'user_id' });
        error = retryRes.error;
      } else if (!error && this._supportsTalentColumns === null) {
        this._supportsTalentColumns = true;
      }

      if (error) {
        if (error.code === '42P01') {
          console.warn('☁️ Supabase에 user_reading_state 테이블이 없습니다. 관리자 사이트의 쿼리를 확인하세요.');
        } else {
          console.warn('☁️ Cloud sync warning:', error.message || error);
        }
        return false;
      } else {
        const readCount = Object.keys(payload.read_progress || {}).length;
        const todayCount = (payload.daily_counts || {})[this.getTodayDateStr()] || 0;
        console.log(`☁️ Supabase 동기화 완료: [${uid}] - 총 ${readCount}장 읽음, 오늘 ${todayCount}장 읽음, 달란트 ${talentPayload.talents}`);
        return true;
      }
    } catch (err) {
      console.warn('☁️ Cloud sync error:', err);
      return false;
    }
  },

  async syncFromCloud(userId) {
    const uid = userId || this.getCurrentUserId();
    if (!uid || uid === 'guest') return false;

    if (typeof supabaseClient === 'undefined' || !supabaseClient) return false;

    try {
      const { data, error } = await supabaseClient
        .from('user_reading_state')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (!error && data) {
        console.log('☁️ Supabase에서 유저 통독 및 달란트 데이터 수신 및 통합:', uid);

        let hasNewerLocalData = false;

        // 1) 성경 진행도 (read_progress) 양방향 합집합 병합
        const localProgress = this.getProgress();
        const remoteProgress = (data.read_progress && typeof data.read_progress === 'object') ? data.read_progress : {};
        const mergedProgress = { ...remoteProgress, ...localProgress };
        
        if (Object.keys(mergedProgress).length > Object.keys(remoteProgress).length) {
          hasNewerLocalData = true;
        }
        localStorage.setItem(`charles_user_${uid}_progress`, JSON.stringify(mergedProgress));

        // 2) 일별 읽은 장수 (daily_counts) 날짜별 최대값 보존 병합 & 임베디드 달란트 메타데이터 추출
        const rawRemoteDaily = (data.daily_counts && typeof data.daily_counts === 'object') ? data.daily_counts : {};
        const remoteTalentMeta = (rawRemoteDaily && rawRemoteDaily.__talent_data__) || {
          talents: data.talents,
          equipped: data.equipped,
          inventory: data.inventory,
          quest_claims: data.quest_claims,
          updated_at: data.updated_at
        };

        const localDaily = this.getDailyCounts();
        const mergedDaily = {};
        for (const [k, v] of Object.entries(rawRemoteDaily)) {
          if (k !== '__talent_data__' && typeof v === 'number') {
            mergedDaily[k] = v;
          }
        }
        for (const [dateStr, count] of Object.entries(localDaily)) {
          if (dateStr === '__talent_data__') continue;
          const rCount = mergedDaily[dateStr] || 0;
          if (count > rCount) {
            hasNewerLocalData = true;
          }
          mergedDaily[dateStr] = Math.max(rCount, count);
        }
        localStorage.setItem(`charles_user_${uid}_daily_counts`, JSON.stringify(mergedDaily));

        // 3) 읽은 히스토리 (read_history) 중복 없이 병합
        const localHistory = this.getHistory();
        const remoteHistory = Array.isArray(data.read_history) ? data.read_history : [];
        const seenKeys = new Set();
        const mergedHistory = [];
        for (const h of [...localHistory, ...remoteHistory]) {
          if (!h || !h.date) continue;
          const k = `${h.date}_${h.bookId}_${h.chapter}`;
          if (!seenKeys.has(k)) {
            seenKeys.add(k);
            mergedHistory.push(h);
          }
        }
        mergedHistory.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        localStorage.setItem(`charles_user_${uid}_history`, JSON.stringify(mergedHistory));

        // 4) 찰스 성장 단계: 병합된 최신 캘린더(daily_counts)로부터 100% 결정론적 정밀 산출!
        const finalStage = this.calculateStageFromDaily(mergedDaily);
        localStorage.setItem(`charles_user_${uid}_stage`, String(finalStage));
        localStorage.setItem(`charles_user_${uid}_last_evaluated_date`, this.getYesterdayDateStr());

        // 5) 스트릭 정보: 병합된 최신 캘린더(daily_counts)로부터 100% 정밀 재계산!
        const recalculatedStreak = this.calculateStreakFromDaily(mergedDaily);
        localStorage.setItem(`charles_user_${uid}_streak`, JSON.stringify(recalculatedStreak));

        // DB에 저장된 스트릭/단계가 캘린더 정밀 계산 값과 다르면 클라우드 자가 치유(Self-Healing) 트리거
        if (data.charles_stage !== finalStage || data.streak_count !== recalculatedStreak.count) {
          hasNewerLocalData = true;
        }

        // 7) 기기 간 퀘스트 수령 내역 완전 통합 (중복 수령 원천 방지)
        const todayStr = this.getTodayDateStr();
        const remoteClaims = (remoteTalentMeta && remoteTalentMeta.quest_claims && typeof remoteTalentMeta.quest_claims === 'object')
          ? remoteTalentMeta.quest_claims
          : ((data.quest_claims && typeof data.quest_claims === 'object') ? data.quest_claims : {});
        const localClaims = JSON.parse(localStorage.getItem(`charles_user_${uid}_quest_claims`) || '{}');

        const mergedClaims = { ...remoteClaims, ...localClaims };
        if (remoteClaims.daily_login === todayStr || localClaims.daily_login === todayStr) {
          mergedClaims.daily_login = todayStr;
        }
        if (remoteClaims.daily_read_3 === todayStr || localClaims.daily_read_3 === todayStr) {
          mergedClaims.daily_read_3 = todayStr;
        }
        mergedClaims.weekly_streak_cycle = Math.max(
          parseInt(localClaims.weekly_streak_cycle || 0, 10),
          parseInt(remoteClaims.weekly_streak_cycle || 0, 10)
        );
        if (localClaims.weekly_streak_claimed_at || remoteClaims.weekly_streak_claimed_at) {
          mergedClaims.weekly_streak_claimed_at = localClaims.weekly_streak_claimed_at || remoteClaims.weekly_streak_claimed_at;
        }
        if (localClaims.achieve_nt_complete || remoteClaims.achieve_nt_complete) {
          mergedClaims.achieve_nt_complete = true;
          mergedClaims.achieve_nt_claimed_at = localClaims.achieve_nt_claimed_at || remoteClaims.achieve_nt_claimed_at;
        }
        if (JSON.stringify(mergedClaims) !== JSON.stringify(remoteClaims)) {
          hasNewerLocalData = true;
        }
        localStorage.setItem(`charles_user_${uid}_quest_claims`, JSON.stringify(mergedClaims));

        // 8) 인벤토리 합집합 병합 (어느 기기에서 샀든 모든 기기에서 보유)
        const remoteInv = (remoteTalentMeta && Array.isArray(remoteTalentMeta.inventory))
          ? remoteTalentMeta.inventory
          : (Array.isArray(data.inventory) ? data.inventory : []);
        const localInv = JSON.parse(localStorage.getItem(`charles_user_${uid}_inventory`) || '[]');
        const combinedInv = Array.from(new Set([...remoteInv, ...localInv]));
        if (combinedInv.length > remoteInv.length) {
          hasNewerLocalData = true;
        }
        localStorage.setItem(`charles_user_${uid}_inventory`, JSON.stringify(combinedInv));

        // 9) 달란트 잔액 통합 (타임스탬프 기반 최신 상태 보존 및 최초 마이그레이션 보호)
        const localTalents = parseInt(localStorage.getItem(`charles_user_${uid}_talents`) || '0', 10);
        const localTalentsUpdatedAt = localStorage.getItem(`charles_user_${uid}_talents_updated_at`);
        const remoteTalents = (remoteTalentMeta && typeof remoteTalentMeta.talents === 'number')
          ? remoteTalentMeta.talents
          : (typeof data.talents === 'number' ? data.talents : null);
        const remoteTalentsUpdatedAt = (remoteTalentMeta && remoteTalentMeta.updated_at) || data.updated_at;

        if (remoteTalents !== null) {
          let minExpected = 0;
          if (typeof TalentService !== 'undefined' && TalentService.getExpectedMinTalents) {
            minExpected = TalentService.getExpectedMinTalents();
          }

          if (!remoteTalentsUpdatedAt && !localTalentsUpdatedAt) {
            // 둘 다 타임스탬프가 없는 초기 전환 시: 달란트 손실 방지를 위해 Max값 사용
            const bestTalents = Math.max(localTalents, remoteTalents, minExpected);
            localStorage.setItem(`charles_user_${uid}_talents`, String(bestTalents));
            localStorage.setItem(`charles_user_${uid}_talents_updated_at`, new Date().toISOString());
            hasNewerLocalData = true;
          } else {
            const remoteTime = new Date(remoteTalentsUpdatedAt || '1970-01-01T00:00:00.000Z').getTime();
            const localTime = new Date(localTalentsUpdatedAt || '1970-01-01T00:00:00.000Z').getTime();

            let targetTalents = localTalents;
            if (isNaN(localTime) || remoteTime >= localTime) {
              // 원격 데이터가 최신이거나 같음 -> 원격 잔액으로 동기화
              targetTalents = remoteTalents;
              if (remoteTalentsUpdatedAt) {
                localStorage.setItem(`charles_user_${uid}_talents_updated_at`, remoteTalentsUpdatedAt);
              }
            } else {
              // 로컬에 아직 클라우드로 올라가지 않은 변경이 있음
              hasNewerLocalData = true;
            }

            // 달란트 유실 방지: 퀘스트 수령 보상 최소 보장값 미달 시 즉시 자가 치유
            if (targetTalents < minExpected) {
              console.warn(`🪙 [Cloud Sync Self-Healing] 유저 [${uid}] 달란트 유실 감지 (${targetTalents} < 최소보장 ${minExpected}). 정상 복구합니다.`);
              targetTalents = minExpected;
              localStorage.setItem(`charles_user_${uid}_talents_updated_at`, new Date().toISOString());
              hasNewerLocalData = true;
            }

            localStorage.setItem(`charles_user_${uid}_talents`, String(targetTalents));
          }
        } else if (localTalents > 0) {
          // 원격에 달란트 데이터가 아예 없으나 로컬에 잔액이 있는 경우 -> 원격으로 업로드 필요
          hasNewerLocalData = true;
        }

        // 10) 착용 아이템 (equipped) 동기화
        const remoteEq = (remoteTalentMeta && remoteTalentMeta.equipped && typeof remoteTalentMeta.equipped === 'object')
          ? remoteTalentMeta.equipped
          : ((data.equipped && typeof data.equipped === 'object') ? data.equipped : null);
        if (remoteEq) {
          const hasLocalEq = !!localStorage.getItem(`charles_user_${uid}_equipped`);
          const remoteTime = new Date(remoteTalentsUpdatedAt || '1970-01-01T00:00:00.000Z').getTime();
          const localTime = new Date(localTalentsUpdatedAt || '1970-01-01T00:00:00.000Z').getTime();
          if (!hasLocalEq || isNaN(localTime) || remoteTime >= localTime) {
            localStorage.setItem(`charles_user_${uid}_equipped`, JSON.stringify(remoteEq));
          }
        }

        // 11) 자정 평가 재확인
        this.evaluateCharlesMidnight();

        // 12) 로컬에 새로운 읽음/달란트 기록이 있었다면 원격 Supabase도 최신 병합본으로 즉시 갱신
        if (hasNewerLocalData) {
          this.scheduleCloudSync();
        }

        // 13) 동기화 완료 커스텀 이벤트 발행 (UI 실시간 갱신용)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('charles-cloud-synced', { detail: { userId: uid } }));
        }

        return true;
      }
    } catch (err) {
      console.warn('☁️ Cloud fetch error:', err);
    }
    return false;
  },

  // ==================== 6-1. 친구 통독 및 찰스 정보 조회 ====================
  async getUserState(userId) {
    const todayStr = this.getTodayDateStr();
    const uid = String(userId || '').trim();

    // 1) 본인인 경우 실시간 로컬 데이터 반환
    if (uid === this.getCurrentUserId()) {
      return {
        userId: uid,
        stage: this.getCharlesStage(),
        streakCount: this.getStreakInfo().count || 0,
        todayRead: this.getTodayReadCount(),
        talents: typeof TalentService !== 'undefined' ? TalentService.getTalents() : (parseInt(localStorage.getItem(this.getUserKey('talents')) || '0', 10)),
        equipped: typeof TalentService !== 'undefined' ? TalentService.getEquipped() : {},
        dailyCounts: this.getDailyCounts()
      };
    }

    // 2) 로컬 스토리지에 캐시된 데이터 (오프라인/로컬 테스트 대응)
    let stage = 1;
    let streakCount = 0;
    let todayRead = 0;
    let talents = 0;
    let equipped = {};
    let dailyCounts = {};

    try {
      const s = localStorage.getItem(`charles_user_${uid}_stage`);
      if (s) stage = parseInt(s, 10) || 1;

      const strk = localStorage.getItem(`charles_user_${uid}_streak`);
      if (strk) {
        const parsed = JSON.parse(strk);
        streakCount = (parsed && parsed.count) || 0;
      }

      const dc = localStorage.getItem(`charles_user_${uid}_daily_counts`);
      if (dc) {
        const parsed = JSON.parse(dc);
        if (parsed && typeof parsed === 'object') {
          dailyCounts = parsed;
          if (parsed[todayStr]) todayRead = parsed[todayStr] || 0;
        }
      }

      const tal = localStorage.getItem(`charles_user_${uid}_talents`);
      if (tal) talents = parseInt(tal, 10) || 0;

      const eq = localStorage.getItem(`charles_user_${uid}_equipped`);
      if (eq) {
        const parsed = JSON.parse(eq);
        if (parsed && typeof parsed === 'object') equipped = parsed;
      }
    } catch (e) {}

    // 3) Supabase user_reading_state 테이블에서 최신 원격 조회
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        let { data, error } = await supabaseClient
          .from('user_reading_state')
          .select('charles_stage, streak_count, daily_counts, equipped')
          .eq('user_id', uid)
          .maybeSingle();

        // equipped 컬럼이 아직 DB에 없을 경우 fallback
        if (error && error.message && (error.message.includes('equipped') || error.code === '42703')) {
          const fallback = await supabaseClient
            .from('user_reading_state')
            .select('charles_stage, streak_count, daily_counts')
            .eq('user_id', uid)
            .maybeSingle();
          data = fallback.data;
          error = fallback.error;
        }

        if (!error && data) {
          if (data.charles_stage) stage = data.charles_stage;
          if (data.streak_count !== undefined && data.streak_count !== null) streakCount = data.streak_count;
          if (data.daily_counts && typeof data.daily_counts === 'object') {
            dailyCounts = data.daily_counts;
            todayRead = data.daily_counts[todayStr] || 0;
            // 캘린더 기반 무결점 보정
            const derivedStreak = this.calculateStreakFromDaily(data.daily_counts, todayStr);
            streakCount = derivedStreak.count;
            stage = this.calculateStageFromDaily(data.daily_counts, todayStr);

            if (data.daily_counts.__talent_data__ && data.daily_counts.__talent_data__.equipped) {
              equipped = data.daily_counts.__talent_data__.equipped;
            }
            if (data.daily_counts.__talent_data__ && data.daily_counts.__talent_data__.talents !== undefined) {
              talents = data.daily_counts.__talent_data__.talents;
            }
          }
          if (data.talents !== undefined && data.talents !== null) {
            talents = data.talents;
          }
          if (data.equipped && typeof data.equipped === 'object' && Object.keys(data.equipped).length > 0) {
            equipped = data.equipped;
          }
          if (equipped && Object.keys(equipped).length > 0) {
            try {
              localStorage.setItem(`charles_user_${uid}_equipped`, JSON.stringify(equipped));
            } catch (e) {}
          }
          try {
            localStorage.setItem(`charles_user_${uid}_talents`, String(talents));
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Supabase getUserState warning:', err);
      }
    }

    return {
      userId: uid,
      stage,
      streakCount,
      todayRead,
      talents,
      equipped,
      dailyCounts
    };
  },

  // ==================== 6-2. 전체/다수 친구 통독 및 찰스 정보 일괄(Batch) 1회 조회 ====================
  async getAllUsersStates(userIds = []) {
    const todayStr = this.getTodayDateStr();
    const currentUid = this.getCurrentUserId();
    const stateMap = {};

    const cleanIds = (Array.isArray(userIds) ? userIds : [])
      .map(id => String(id || '').trim())
      .filter(Boolean);

    // 1) 로컬 스토리지 캐시로 기본값 우선 채우기 (오프라인 지원 및 즉시 화면 렌더링)
    cleanIds.forEach(uid => {
      if (uid === currentUid) {
        stateMap[uid] = {
          userId: uid,
          stage: this.getCharlesStage(),
          streakCount: this.getStreakInfo().count || 0,
          todayRead: this.getTodayReadCount(),
          talents: typeof TalentService !== 'undefined' ? TalentService.getTalents() : (parseInt(localStorage.getItem(this.getUserKey('talents')) || '0', 10)),
          equipped: typeof TalentService !== 'undefined' ? TalentService.getEquipped() : {},
          dailyCounts: this.getDailyCounts()
        };
        return;
      }

      let stage = 1;
      let streakCount = 0;
      let todayRead = 0;
      let talents = 0;
      let equipped = {};
      let dailyCounts = {};

      try {
        const s = localStorage.getItem(`charles_user_${uid}_stage`);
        if (s) stage = parseInt(s, 10) || 1;

        const strk = localStorage.getItem(`charles_user_${uid}_streak`);
        if (strk) {
          const parsed = JSON.parse(strk);
          streakCount = (parsed && parsed.count) || 0;
        }

        const dc = localStorage.getItem(`charles_user_${uid}_daily_counts`);
        if (dc) {
          const parsed = JSON.parse(dc);
          if (parsed && typeof parsed === 'object') {
            dailyCounts = parsed;
            if (parsed[todayStr]) todayRead = parsed[todayStr] || 0;
          }
        }

        const tal = localStorage.getItem(`charles_user_${uid}_talents`);
        if (tal) talents = parseInt(tal, 10) || 0;

        const eq = localStorage.getItem(`charles_user_${uid}_equipped`);
        if (eq) {
          const parsed = JSON.parse(eq);
          if (parsed && typeof parsed === 'object') equipped = parsed;
        }
      } catch (e) {}

      stateMap[uid] = { userId: uid, stage, streakCount, todayRead, talents, equipped, dailyCounts };
    });

    // 2) Supabase에서 1회의 단일 쿼리로 전체 친구 상태 일괄(Batch) 조회!
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        const selectFields = (this._supportsTalentColumns === false)
          ? 'user_id, charles_stage, streak_count, daily_counts'
          : 'user_id, charles_stage, streak_count, daily_counts, equipped';

        let query = supabaseClient
          .from('user_reading_state')
          .select(selectFields);

        // 100명 이하일 때는 in 필터, 그 이상이거나 빈 목록이면 전체 테이블 1회 조회
        if (cleanIds.length > 0 && cleanIds.length <= 100) {
          query = query.in('user_id', cleanIds);
        }

        let { data, error } = await query;

        // equipped 컬럼 없을 시 fallback
        if (error && (error.code === 'PGRST204' || error.code === '42703' || (error.message && (error.message.includes('equipped') || error.message.includes('column'))))) {
          this._supportsTalentColumns = false;
          let fallbackQuery = supabaseClient
            .from('user_reading_state')
            .select('user_id, charles_stage, streak_count, daily_counts');
          if (cleanIds.length > 0 && cleanIds.length <= 100) {
            fallbackQuery = fallbackQuery.in('user_id', cleanIds);
          }
          const res = await fallbackQuery;
          data = res.data;
          error = res.error;
        }

        if (!error && Array.isArray(data)) {
          data.forEach(row => {
            const uid = String(row.user_id || '').trim();
            if (!uid || uid === currentUid) return;

            let stage = row.charles_stage || 1;
            let streakCount = (row.streak_count !== undefined && row.streak_count !== null) ? row.streak_count : 0;
            let todayRead = 0;
            let talents = 0;
            let equipped = (row.equipped && typeof row.equipped === 'object') ? row.equipped : {};
            let dailyCounts = (row.daily_counts && typeof row.daily_counts === 'object') ? { ...row.daily_counts } : {};

            if (row.daily_counts && typeof row.daily_counts === 'object') {
              todayRead = row.daily_counts[todayStr] || 0;
              // 친구 찰스 상태 및 스트릭도 캘린더 데이터를 기준으로 무결점 보정
              const derivedStreak = this.calculateStreakFromDaily(row.daily_counts, todayStr);
              streakCount = derivedStreak.count;
              stage = this.calculateStageFromDaily(row.daily_counts, todayStr);

              if (row.daily_counts.__talent_data__ && row.daily_counts.__talent_data__.equipped) {
                if (!row.equipped || Object.keys(equipped).length === 0) {
                  equipped = row.daily_counts.__talent_data__.equipped;
                }
              }
              if (row.daily_counts.__talent_data__ && row.daily_counts.__talent_data__.talents !== undefined) {
                talents = row.daily_counts.__talent_data__.talents;
              }
            }

            if (row.talents !== undefined && row.talents !== null) {
              talents = row.talents;
            }

            // 로컬 스토리지 캐시 최신화
            try {
              localStorage.setItem(`charles_user_${uid}_stage`, String(stage));
              localStorage.setItem(`charles_user_${uid}_streak`, JSON.stringify({ count: streakCount, lastDate: null }));
              if (row.daily_counts) {
                localStorage.setItem(`charles_user_${uid}_daily_counts`, JSON.stringify(row.daily_counts));
              }
              if (equipped && Object.keys(equipped).length > 0) {
                localStorage.setItem(`charles_user_${uid}_equipped`, JSON.stringify(equipped));
              }
              localStorage.setItem(`charles_user_${uid}_talents`, String(talents));
            } catch (e) {}

            stateMap[uid] = { userId: uid, stage, streakCount, todayRead, talents, equipped, dailyCounts };
          });
        }
      } catch (err) {
        console.warn('Supabase getAllUsersStates batch fetch warning:', err);
      }
    }

    return stateMap;
  },

  // ==================== 7. 백업 및 초기화 ====================
  exportBackup() {
    const uid = this.getCurrentUserId();
    const data = {
      app: "Charles' Bible",
      version: "2.1.0",
      userId: uid,
      exportedAt: new Date().toISOString(),
      stage: this.getCharlesStage(),
      progress: this.getProgress(),
      dailyCounts: this.getDailyCounts(),
      history: this.getHistory(),
      streak: this.getStreakInfo(),
      talents: typeof TalentService !== 'undefined' ? TalentService.getTalents() : 0,
      equipped: typeof TalentService !== 'undefined' ? TalentService.getEquipped() : {},
      inventory: typeof TalentService !== 'undefined' ? TalentService.getInventory() : [],
      questClaims: typeof TalentService !== 'undefined' ? TalentService.getClaimedRecord() : {}
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = this.getTodayDateStr();
    a.href = url;
    a.download = `charles_bible_backup_${uid}_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importBackup(jsonData) {
    try {
      if (!jsonData || typeof jsonData !== 'object') {
        throw new Error('유효하지 않은 데이터 포맷입니다.');
      }
      const uid = this.getCurrentUserId();
      if (jsonData.progress) {
        localStorage.setItem(`charles_user_${uid}_progress`, JSON.stringify(jsonData.progress));
      }
      if (jsonData.dailyCounts) {
        localStorage.setItem(`charles_user_${uid}_daily_counts`, JSON.stringify(jsonData.dailyCounts));
      }
      if (jsonData.history) {
        localStorage.setItem(`charles_user_${uid}_history`, JSON.stringify(jsonData.history));
      }
      if (jsonData.streak) {
        localStorage.setItem(`charles_user_${uid}_streak`, JSON.stringify(jsonData.streak));
      }
      if (jsonData.stage) {
        localStorage.setItem(`charles_user_${uid}_stage`, String(jsonData.stage));
      }
      if (jsonData.talents !== undefined && typeof TalentService !== 'undefined') {
        TalentService.setTalents(jsonData.talents);
      }
      if (jsonData.equipped && typeof TalentService !== 'undefined') {
        TalentService.saveEquipped(jsonData.equipped);
      }
      if (jsonData.inventory && typeof TalentService !== 'undefined') {
        TalentService.saveInventory(jsonData.inventory);
      }
      if (jsonData.questClaims && typeof TalentService !== 'undefined') {
        TalentService.saveClaimedRecord(jsonData.questClaims);
      }
      this.evaluateCharlesMidnight();
      this.scheduleCloudSync();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  resetAll() {
    const uid = this.getCurrentUserId();
    localStorage.removeItem(`charles_user_${uid}_progress`);
    localStorage.removeItem(`charles_user_${uid}_daily_counts`);
    localStorage.removeItem(`charles_user_${uid}_history`);
    localStorage.removeItem(`charles_user_${uid}_streak`);
    localStorage.removeItem(`charles_user_${uid}_stage`);
    localStorage.removeItem(`charles_user_${uid}_last_evaluated_date`);
    localStorage.removeItem(`charles_user_${uid}_talents`);
    localStorage.removeItem(`charles_user_${uid}_equipped`);
    localStorage.removeItem(`charles_user_${uid}_inventory`);
    localStorage.removeItem(`charles_user_${uid}_quest_claims`);
    this.scheduleCloudSync();
  },

  // 예약된 동기화 즉시 강제 전송
  flushCloudSync() {
    if (this._syncTimeout) {
      clearTimeout(this._syncTimeout);
      this._syncTimeout = null;
      return this.saveToCloud();
    }
    return Promise.resolve(false);
  }
};

// 탭 닫기 또는 백그라운드 전환 시 미전송된 통독 데이터 즉시 플러시
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    StorageService.flushCloudSync();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      StorageService.flushCloudSync();
    } else if (document.visibilityState === 'visible') {
      StorageService.syncFromCloud();
    }
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StorageService, STORAGE_KEYS };
}
