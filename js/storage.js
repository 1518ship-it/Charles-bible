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

  // 어제 날짜 문자열 YYYY-MM-DD
  getYesterdayDateStr() {
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
      return data ? JSON.parse(data) : {};
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
  evaluateCharlesMidnight() {
    const uid = this.getCurrentUserId();
    const stageKey = this.getUserKey('stage');
    const lastEvalKey = this.getUserKey('last_evaluated_date');

    let currentStage = parseInt(localStorage.getItem(stageKey), 10);
    if (isNaN(currentStage) || currentStage < 1 || currentStage > 5) {
      currentStage = 1; // 기본 1단계
    }

    let lastEvaluated = localStorage.getItem(lastEvalKey);
    const today = this.getTodayDateStr();
    const yesterday = this.getYesterdayDateStr();

    // 최초 실행 시: 어제 날짜를 마지막 평가일로 설정 (오늘은 아직 평가 전)
    if (!lastEvaluated) {
      localStorage.setItem(lastEvalKey, yesterday);
      localStorage.setItem(stageKey, String(currentStage));
      return currentStage;
    }

    // 이미 어제까지 평가가 완료된 경우
    if (lastEvaluated >= yesterday) {
      return currentStage;
    }

    // 지나간 날짜들(lastEvaluated + 1일 ~ yesterday)을 순서대로 일일 평가
    let cursorDate = this.addDays(lastEvaluated, 1);
    const dailyCounts = this.getDailyCounts();

    while (cursorDate <= yesterday) {
      const readCount = dailyCounts[cursorDate] || 0;

      if (readCount === 0) {
        // 0장 읽음: 단계 하락
        currentStage = Math.max(1, currentStage - 1);
      } else if (readCount >= 1 && readCount <= 2) {
        // 1~2장 읽음: 유지 (단, 5단계는 5장 필요하므로 4단계로 하락)
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

    localStorage.setItem(lastEvalKey, yesterday);
    localStorage.setItem(stageKey, String(currentStage));
    this.scheduleCloudSync();

    return currentStage;
  },

  // 찰스 현재 단계 조회
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

  updateStreak() {
    const key = this.getUserKey('streak');
    try {
      const streakStr = localStorage.getItem(key);
      const streak = streakStr ? JSON.parse(streakStr) : { count: 0, lastDate: null, maxStreak: 0 };
      const todayStr = this.getTodayDateStr();

      if (!streak.lastDate) {
        streak.count = 1;
        streak.maxStreak = 1;
        streak.lastDate = todayStr;
      } else if (streak.lastDate === todayStr) {
        // 오늘 이미 통독 기록 있음
      } else {
        const last = new Date(streak.lastDate);
        const today = new Date(todayStr);
        const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          streak.count += 1;
          if (streak.count > streak.maxStreak) streak.maxStreak = streak.count;
        } else if (diffDays > 1) {
          streak.count = 1; // 연속 중단 후 재시작
        }
        streak.lastDate = todayStr;
      }

      localStorage.setItem(key, JSON.stringify(streak));
      return streak;
    } catch (e) {
      return { count: 1, maxStreak: 1 };
    }
  },

  getStreakInfo() {
    const key = this.getUserKey('streak');
    try {
      const streakStr = localStorage.getItem(key);
      return streakStr ? JSON.parse(streakStr) : { count: 0, lastDate: null, maxStreak: 0 };
    } catch (e) {
      return { count: 0, lastDate: null, maxStreak: 0 };
    }
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
    const isNTComplete = stats.ntRead === stats.ntTotal;
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
  scheduleCloudSync() {
    if (this._syncTimeout) clearTimeout(this._syncTimeout);
    this._syncTimeout = setTimeout(() => {
      this.saveToCloud();
    }, 1200);
  },

  async saveToCloud() {
    const uid = this.getCurrentUserId();
    if (!uid || uid === 'guest') return;

    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;

    try {
      const payload = {
        user_id: uid,
        charles_stage: this.getCharlesStage(),
        read_progress: this.getProgress(),
        daily_counts: this.getDailyCounts(),
        read_history: this.getHistory(),
        streak_count: this.getStreakInfo().count || 0,
        max_streak: this.getStreakInfo().maxStreak || 0,
        last_evaluated_date: localStorage.getItem(this.getUserKey('last_evaluated_date')) || this.getYesterdayDateStr(),
        last_read_date: this.getTodayDateStr(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabaseClient
        .from('user_reading_state')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) {
        // 테이블이 아직 없으면 안내 로그만 기록
        if (error.code === '42P01') {
          console.warn('☁️ Supabase에 user_reading_state 테이블이 없습니다. 관리자 사이트의 쿼리를 확인하세요.');
        } else {
          console.warn('☁️ Cloud sync warning:', error.message);
        }
      } else {
        console.log('☁️ Supabase에 유저 통독 상태 동기화 완료:', uid);
      }
    } catch (err) {
      console.warn('☁️ Cloud sync error:', err);
    }
  },

  async syncFromCloud(userId) {
    const uid = userId || this.getCurrentUserId();
    if (!uid || uid === 'guest') return;

    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;

    try {
      const { data, error } = await supabaseClient
        .from('user_reading_state')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (!error && data) {
        console.log('☁️ Supabase에서 유저 통독 데이터 수신:', uid);
        if (data.read_progress) {
          localStorage.setItem(`charles_user_${uid}_progress`, JSON.stringify(data.read_progress));
        }
        if (data.daily_counts) {
          localStorage.setItem(`charles_user_${uid}_daily_counts`, JSON.stringify(data.daily_counts));
        }
        if (data.read_history) {
          localStorage.setItem(`charles_user_${uid}_history`, JSON.stringify(data.read_history));
        }
        if (data.charles_stage) {
          localStorage.setItem(`charles_user_${uid}_stage`, String(data.charles_stage));
        }
        if (data.last_evaluated_date) {
          localStorage.setItem(`charles_user_${uid}_last_evaluated_date`, String(data.last_evaluated_date));
        }
        if (data.streak_count !== undefined) {
          localStorage.setItem(`charles_user_${uid}_streak`, JSON.stringify({
            count: data.streak_count || 0,
            maxStreak: data.max_streak || 0,
            lastDate: data.last_read_date || null
          }));
        }
        // 자정 평가 재확인
        this.evaluateCharlesMidnight();
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
        todayRead: this.getTodayReadCount()
      };
    }

    // 2) 로컬 스토리지에 캐시된 데이터 (오프라인/로컬 테스트 대응)
    let stage = 1;
    let streakCount = 0;
    let todayRead = 0;

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
        if (parsed && parsed[todayStr]) todayRead = parsed[todayStr] || 0;
      }
    } catch (e) {}

    // 3) Supabase user_reading_state 테이블에서 최신 원격 조회
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('user_reading_state')
          .select('charles_stage, streak_count, daily_counts')
          .eq('user_id', uid)
          .maybeSingle();

        if (!error && data) {
          if (data.charles_stage) stage = data.charles_stage;
          if (data.streak_count !== undefined && data.streak_count !== null) streakCount = data.streak_count;
          if (data.daily_counts && typeof data.daily_counts === 'object') {
            todayRead = data.daily_counts[todayStr] || 0;
          }
        }
      } catch (err) {
        console.warn('Supabase getUserState warning:', err);
      }
    }

    return {
      userId: uid,
      stage,
      streakCount,
      todayRead
    };
  },

  // ==================== 7. 백업 및 초기화 ====================
  exportBackup() {
    const uid = this.getCurrentUserId();
    const data = {
      app: "Charles' Bible",
      version: "2.0.0",
      userId: uid,
      exportedAt: new Date().toISOString(),
      stage: this.getCharlesStage(),
      progress: this.getProgress(),
      dailyCounts: this.getDailyCounts(),
      history: this.getHistory(),
      streak: this.getStreakInfo()
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
    this.scheduleCloudSync();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StorageService, STORAGE_KEYS };
}
