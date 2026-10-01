/**
 * Charles' Bible - 달란트(Talent) & 퀘스트(Quest) & 커스터마이징 매니저
 * [일일/주간/업적 퀘스트, 달란트 경제, 4종 테스트 아이템, 착용 인벤토리]
 */

const TALENT_ITEMS = {
  'head_straw_hat': {
    id: 'head_straw_hat',
    slot: 'head',
    name: '귀여운 밀짚모자',
    price: 5,
    icon: '👒',
    desc: '따스한 햇살을 가려주는 시골 목장 밀짚모자'
  },
  'head_glasses': {
    id: 'head_glasses',
    slot: 'head',
    name: '둥근 범생이 안경',
    price: 3,
    icon: '👓',
    desc: '성경을 열심히 연구하는 학구파 찰스 안경'
  },
  'hold_bible': {
    id: 'hold_bible',
    slot: 'hold',
    name: '작은 성경책',
    price: 5,
    icon: '📖',
    desc: '찰스 품에 쏙 안긴 말씀 성경책'
  },
  'back_daisy_field': {
    id: 'back_daisy_field',
    slot: 'back',
    name: '피크닉 데이지 풀밭',
    price: 7,
    icon: '🌼',
    desc: '찰스 발밑에 화사하게 피어난 꽃 잔디'
  }
};

const TalentService = {
  // 현재 유저 키 헬퍼
  getUserKey(key) {
    if (typeof StorageService !== 'undefined' && StorageService.getUserKey) {
      return StorageService.getUserKey(key);
    }
    const uid = (typeof StorageService !== 'undefined' && StorageService.getCurrentUserId) ? StorageService.getCurrentUserId() : 'guest';
    return `charles_user_${uid}_${key}`;
  },

  // ==================== 1. 달란트 잔액 ====================
  getTalents() {
    try {
      const val = localStorage.getItem(this.getUserKey('talents'));
      return val !== null ? Math.max(0, parseInt(val, 10) || 0) : 0;
    } catch (e) {
      return 0;
    }
  },

  setTalents(amount) {
    const safeAmount = Math.max(0, parseInt(amount, 10) || 0);
    localStorage.setItem(this.getUserKey('talents'), String(safeAmount));
    if (typeof StorageService !== 'undefined' && StorageService.scheduleCloudSync) {
      StorageService.scheduleCloudSync();
    }
    return safeAmount;
  },

  addTalents(amount) {
    const cur = this.getTalents();
    const next = cur + Math.max(0, parseInt(amount, 10) || 0);
    this.setTalents(next);
    return next;
  },

  spendTalents(amount) {
    const cur = this.getTalents();
    const cost = Math.max(0, parseInt(amount, 10) || 0);
    if (cur < cost) return false;
    this.setTalents(cur - cost);
    return true;
  },

  // ==================== 2. 인벤토리 및 착용 ====================
  getInventory() {
    try {
      const data = localStorage.getItem(this.getUserKey('inventory'));
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveInventory(list) {
    localStorage.setItem(this.getUserKey('inventory'), JSON.stringify(list || []));
    if (typeof StorageService !== 'undefined' && StorageService.scheduleCloudSync) {
      StorageService.scheduleCloudSync();
    }
  },

  hasItem(itemId) {
    return this.getInventory().includes(itemId);
  },

  buyItem(itemId) {
    const item = TALENT_ITEMS[itemId];
    if (!item) return { success: false, error: '존재하지 않는 아이템입니다.' };
    if (this.hasItem(itemId)) return { success: false, error: '이미 보유한 아이템입니다.' };
    
    if (!this.spendTalents(item.price)) {
      return { success: false, error: `달란트가 부족합니다. (필요: ${item.price} 달란트)` };
    }

    const inv = this.getInventory();
    inv.push(itemId);
    this.saveInventory(inv);

    // 구매 후 자동 착용
    this.equipItem(itemId);

    return { success: true, item };
  },

  getEquipped() {
    try {
      const data = localStorage.getItem(this.getUserKey('equipped'));
      return data ? JSON.parse(data) : { head: null, hold: null, back: null };
    } catch (e) {
      return { head: null, hold: null, back: null };
    }
  },

  saveEquipped(equipped) {
    localStorage.setItem(this.getUserKey('equipped'), JSON.stringify(equipped || {}));
    if (typeof StorageService !== 'undefined' && StorageService.scheduleCloudSync) {
      StorageService.scheduleCloudSync();
    }
  },

  equipItem(itemId) {
    const item = TALENT_ITEMS[itemId];
    if (!item || !this.hasItem(itemId)) return false;
    const equipped = this.getEquipped();
    equipped[item.slot] = itemId;
    this.saveEquipped(equipped);
    return true;
  },

  unequipSlot(slot) {
    const equipped = this.getEquipped();
    if (equipped[slot]) {
      equipped[slot] = null;
      this.saveEquipped(equipped);
      return true;
    }
    return false;
  },

  isEquipped(itemId) {
    const item = TALENT_ITEMS[itemId];
    if (!item) return false;
    const equipped = this.getEquipped();
    return equipped[item.slot] === itemId;
  },

  // ==================== 3. 퀘스트 수령 내역 관리 ====================
  getClaimedRecord() {
    try {
      const data = localStorage.getItem(this.getUserKey('quest_claims'));
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  saveClaimedRecord(rec) {
    localStorage.setItem(this.getUserKey('quest_claims'), JSON.stringify(rec || {}));
    if (typeof StorageService !== 'undefined' && StorageService.scheduleCloudSync) {
      StorageService.scheduleCloudSync();
    }
  },

  // ==================== 4. 퀘스트 목록 및 달성도 계산 ====================
  getQuestsList() {
    const todayStr = (typeof StorageService !== 'undefined' && StorageService.getTodayDateStr) 
      ? StorageService.getTodayDateStr() 
      : new Date().toISOString().slice(0, 10);
    
    const todayRead = (typeof StorageService !== 'undefined' && StorageService.getTodayReadCount) 
      ? StorageService.getTodayReadCount() 
      : 0;

    const streak = (typeof StorageService !== 'undefined' && StorageService.getStreakInfo) 
      ? StorageService.getStreakInfo() 
      : { count: 0 };
    const streakCount = streak.count || 0;

    const stats = (typeof StorageService !== 'undefined' && StorageService.getStats) 
      ? StorageService.getStats() 
      : { ntRead: 0, totalRead: 0 };
    const ntRead = stats.ntRead || stats.totalRead || 0;

    const claims = this.getClaimedRecord();

    // 1) 일일 첫 접속 퀘스트
    const loginClaimed = claims.daily_login === todayStr;
    const loginStatus = loginClaimed ? 'claimed' : 'ready'; // 오늘 접속했으므로 항상 완료 가능

    // 2) 매일 3장 이상 읽기 퀘스트
    const read3Claimed = claims.daily_read_3 === todayStr;
    const read3Status = read3Claimed 
      ? 'claimed' 
      : (todayRead >= 3 ? 'ready' : 'progress');

    // 3) 주간 퀘스트: 7일 연속 통독하기
    // 최근 일주일(7일 단위 주기) 수령 여부 확인
    // 기존 유저가 7일 이상 스트릭이 있으면 즉시 ready
    const streakCycle = Math.floor(streakCount / 7);
    const lastClaimedStreakCycle = claims.weekly_streak_cycle || 0;
    const streakEligible = streakCount >= 7 && streakCycle > lastClaimedStreakCycle;
    const streakClaimed = streakCount >= 7 && streakCycle <= lastClaimedStreakCycle;
    const streakStatus = streakClaimed 
      ? 'claimed' 
      : (streakEligible ? 'ready' : 'progress');

    // 4) 업적: 신약 전체 완독 달성하기 (260장)
    const ntClaimed = !!claims.achieve_nt_complete;
    const ntStatus = ntClaimed 
      ? 'claimed' 
      : (ntRead >= 260 ? 'ready' : 'progress');

    return [
      {
        id: 'daily_login',
        type: 'daily',
        category: '일일 퀘스트',
        title: '매일 첫 출석하기',
        desc: '찰스 바이블에 하루 1번 접속하기',
        icon: '☀️',
        reward: 1,
        current: 1,
        target: 1,
        unit: '회',
        status: loginStatus
      },
      {
        id: 'daily_read_3',
        type: 'daily',
        category: '일일 퀘스트',
        title: '오늘 말씀 3장 이상 읽기',
        desc: '하루 3장 이상 성경 말씀을 통독하기',
        icon: '📖',
        reward: 1,
        current: Math.min(3, todayRead),
        target: 3,
        unit: '장',
        status: read3Status
      },
      {
        id: 'weekly_streak_7',
        type: 'weekly',
        category: '주간 퀘스트',
        title: '7일 연속 통독하기',
        desc: '쉬지 않고 7일 동안 매일 말씀 읽기',
        icon: '🔥',
        reward: 1,
        current: Math.min(7, streakCount),
        target: 7,
        unit: '일',
        status: streakStatus
      },
      {
        id: 'achieve_nt_complete',
        type: 'achievement',
        category: '영광의 업적',
        title: '신약 전체 완독 달성하기',
        desc: '마태복음부터 요한계시록까지 신약 260장 완독',
        icon: '👑',
        reward: 100,
        current: Math.min(260, ntRead),
        target: 260,
        unit: '장',
        status: ntStatus
      }
    ];
  },

  // 미수령 퀘스트가 있는지 확인 (두루마리 레드 닷 표시용)
  hasUnclaimedQuests() {
    const quests = this.getQuestsList();
    return quests.some(q => q.status === 'ready');
  },

  // 퀘스트 보상 수령 실행
  claimQuest(questId) {
    const quests = this.getQuestsList();
    const quest = quests.find(q => q.id === questId);
    if (!quest) return { success: false, error: '존재하지 않는 퀘스트입니다.' };
    if (quest.status === 'claimed') return { success: false, error: '이미 수령한 퀘스트입니다.' };
    if (quest.status !== 'ready') return { success: false, error: '아직 퀘스트 목표를 달성하지 못했습니다.' };

    const todayStr = (typeof StorageService !== 'undefined' && StorageService.getTodayDateStr) 
      ? StorageService.getTodayDateStr() 
      : new Date().toISOString().slice(0, 10);
    
    const claims = this.getClaimedRecord();

    if (questId === 'daily_login') {
      claims.daily_login = todayStr;
    } else if (questId === 'daily_read_3') {
      claims.daily_read_3 = todayStr;
    } else if (questId === 'weekly_streak_7') {
      const streak = (typeof StorageService !== 'undefined' && StorageService.getStreakInfo) 
        ? StorageService.getStreakInfo() 
        : { count: 0 };
      const streakCycle = Math.max(1, Math.floor((streak.count || 7) / 7));
      claims.weekly_streak_cycle = streakCycle;
      claims.weekly_streak_claimed_at = todayStr;
    } else if (questId === 'achieve_nt_complete') {
      claims.achieve_nt_complete = true;
      claims.achieve_nt_claimed_at = todayStr;
    }

    this.saveClaimedRecord(claims);
    this.addTalents(quest.reward);

    return {
      success: true,
      reward: quest.reward,
      isNtComplete: questId === 'achieve_nt_complete',
      quest
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TalentService, TALENT_ITEMS };
}
