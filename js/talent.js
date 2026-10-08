/**
 * Charles' Bible - 달란트(Talent) & 퀘스트(Quest) & 커스터마이징 매니저
 * [일일/주간/업적 퀘스트, 달란트 경제, 4종 테스트 아이템, 착용 인벤토리]
 */

const TALENT_ITEMS = {
  'head_straw_hat': {
    id: 'head_straw_hat',
    slot: 'head',
    category: '머리',
    name: '귀여운 밀짚모자',
    price: 5,
    icon: '👒',
    desc: '따스한 햇살을 가려주는 시골 목장 밀짚모자'
  },
  'head_glasses': {
    id: 'head_glasses',
    slot: 'glasses',
    category: '몸통',
    name: '둥근 범생이 안경',
    price: 3,
    icon: '👓',
    desc: '성경을 열심히 연구하는 학구파 찰스 안경'
  },
  'hold_bible': {
    id: 'hold_bible',
    slot: 'hold',
    category: '몸통',
    name: '작은 성경책',
    price: 5,
    icon: '📖',
    desc: '찰스 품에 쏙 안긴 말씀 성경책'
  },
  'back_daisy_field': {
    id: 'back_daisy_field',
    slot: 'grass',
    category: '잔디',
    name: '피크닉 데이지 풀밭',
    price: 7,
    icon: '🌼',
    desc: '찰스 발밑에 화사하게 피어난 꽃 잔디'
  },

  // 🍂 가을 한정 컬렉션 6종 아이템
  'head_maple_beret': {
    id: 'head_maple_beret',
    slot: 'head',
    category: '머리',
    name: '단풍잎 베레모',
    price: 6,
    icon: '🍁',
    desc: '붉게 물든 단풍잎 포인트가 달린 가을 베레모'
  },
  'neck_acorn_scarf': {
    id: 'neck_acorn_scarf',
    slot: 'neck',
    category: '몸통',
    name: '도토리 니트 목도리',
    price: 8,
    icon: '🧣',
    desc: '포근하고 따뜻한 도토리 패턴 핸드메이드 니트 목도리'
  },
  'hold_autumn_lantern': {
    id: 'hold_autumn_lantern',
    slot: 'hold',
    category: '소품',
    name: '가을밤 랜턴',
    price: 7,
    icon: '🏮',
    desc: '어두운 가을밤을 은은하게 비추는 따뜻한 랜턴'
  },
  'hold_apple_basket': {
    id: 'hold_apple_basket',
    slot: 'hold',
    category: '소품',
    name: '꿀사과 바구니',
    price: 8,
    icon: '🍎',
    desc: '가을 수확의 기쁨을 담은 달콤한 꿀사과 바구니'
  },
  'side_autumn_pumpkin': {
    id: 'side_autumn_pumpkin',
    slot: 'side',
    category: '소품',
    name: '탐스러운 가을 단호박',
    price: 6,
    icon: '🎃',
    desc: '찰스 곁에 놓인 탐스럽고 둥글둥글한 가을 단호박'
  },
  'back_maple_carpet': {
    id: 'back_maple_carpet',
    slot: 'grass',
    category: '잔디',
    name: '황금빛 낙엽 카펫',
    price: 9,
    icon: '🍂',
    desc: '찰스 발밑에 곱게 깔린 황금빛 가을 낙엽 카펫'
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

  // 최소 보장 달란트 계산 (수령한 퀘스트 총 보상 - 구매한 아이템 총 가격)
  getExpectedMinTalents() {
    try {
      const claimsStr = localStorage.getItem(this.getUserKey('quest_claims'));
      const claims = claimsStr ? JSON.parse(claimsStr) : {};
      let minEarned = 0;
      if (claims.daily_login) minEarned += 1;
      if (claims.daily_read_3) minEarned += 1;
      if (claims.weekly_streak_cycle) minEarned += Math.max(0, parseInt(claims.weekly_streak_cycle, 10) || 0);
      if (claims.achieve_nt_complete) minEarned += 100;

      const invStr = localStorage.getItem(this.getUserKey('inventory'));
      const inv = invStr ? JSON.parse(invStr) : [];
      let spent = 0;
      if (Array.isArray(inv)) {
        for (const itemId of inv) {
          if (TALENT_ITEMS[itemId] && TALENT_ITEMS[itemId].price) {
            spent += TALENT_ITEMS[itemId].price;
          }
        }
      }

      return Math.max(0, minEarned - spent);
    } catch (e) {
      return 0;
    }
  },

  // ==================== 1. 달란트 잔액 ====================
  getTalents() {
    try {
      const val = localStorage.getItem(this.getUserKey('talents'));
      let talents = val !== null ? Math.max(0, parseInt(val, 10) || 0) : 0;

      // 퀘스트 수령 보상 유실 방지 자동 보정 (Self-Healing)
      const minExpected = this.getExpectedMinTalents();
      if (talents < minExpected) {
        console.warn(`🪙 [Talent Self-Healing] 달란트 유실 감지 (${talents} < 최소보장 ${minExpected}). 정상 복구합니다.`);
        talents = minExpected;
        localStorage.setItem(this.getUserKey('talents'), String(talents));
        localStorage.setItem(this.getUserKey('talents_updated_at'), new Date().toISOString());
        if (typeof StorageService !== 'undefined' && StorageService.scheduleCloudSync) {
          StorageService.scheduleCloudSync();
        }
      }

      return talents;
    } catch (e) {
      return 0;
    }
  },

  setTalents(amount) {
    const safeAmount = Math.max(0, parseInt(amount, 10) || 0);
    localStorage.setItem(this.getUserKey('talents'), String(safeAmount));
    localStorage.setItem(this.getUserKey('talents_updated_at'), new Date().toISOString());
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
    localStorage.setItem(this.getUserKey('talents_updated_at'), new Date().toISOString());
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

    // 구매 즉시 클라우드에 인벤토리 및 잔액 확정 전송
    if (typeof StorageService !== 'undefined' && StorageService.saveToCloud) {
      StorageService.saveToCloud();
    }

    return { success: true, item };
  },

  getEquipped() {
    try {
      const data = localStorage.getItem(this.getUserKey('equipped'));
      const equipped = data ? JSON.parse(data) : {};
      
      // 하위 호환성 마이그레이션 (이전 데이터 정규화)
      if (equipped.head === 'head_glasses' && !equipped.glasses) {
        equipped.glasses = 'head_glasses';
        equipped.head = null;
      }
      if (equipped.back && !equipped.grass) {
        equipped.grass = equipped.back;
      }

      return {
        head: equipped.head || null,
        glasses: equipped.glasses || null,
        neck: equipped.neck || null,
        hold: equipped.hold || null,
        side: equipped.side || null,
        grass: equipped.grass || equipped.back || null,
        back: equipped.back || equipped.grass || null
      };
    } catch (e) {
      return { head: null, glasses: null, neck: null, hold: null, side: null, grass: null, back: null };
    }
  },

  saveEquipped(equipped) {
    localStorage.setItem(this.getUserKey('equipped'), JSON.stringify(equipped || {}));
    localStorage.setItem(this.getUserKey('talents_updated_at'), new Date().toISOString());
    if (typeof StorageService !== 'undefined' && StorageService.scheduleCloudSync) {
      StorageService.scheduleCloudSync();
    }
  },

  equipItem(itemId) {
    const item = TALENT_ITEMS[itemId];
    if (!item || !this.hasItem(itemId)) return false;
    const equipped = this.getEquipped();
    equipped[item.slot] = itemId;
    if (item.slot === 'grass') equipped.back = itemId;
    this.saveEquipped(equipped);
    return true;
  },

  unequipSlot(slot) {
    const equipped = this.getEquipped();
    if (equipped[slot]) {
      equipped[slot] = null;
      if (slot === 'grass') equipped.back = null;
      this.saveEquipped(equipped);
      return true;
    }
    return false;
  },

  isEquipped(itemId) {
    const item = TALENT_ITEMS[itemId];
    if (!item) return false;
    const equipped = this.getEquipped();
    return equipped[item.slot] === itemId ||
      (itemId === 'head_glasses' && (equipped.glasses === itemId || equipped.head === itemId)) ||
      (itemId === 'back_daisy_field' && (equipped.grass === itemId || equipped.back === itemId));
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
    localStorage.setItem(this.getUserKey('talents_updated_at'), new Date().toISOString());
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

    // 즉시 클라우드에 퀘스트 수령 및 달란트 잔액을 확정 전송하여 다른 기기 중복 수령 방지
    if (typeof StorageService !== 'undefined' && StorageService.saveToCloud) {
      StorageService.saveToCloud();
    }

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
