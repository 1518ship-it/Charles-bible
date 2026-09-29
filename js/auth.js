/**
 * Charles' Bible - 사용자 인증, 회원가입 및 세션 관리 모듈
 * Supabase 클라우드 데이터베이스 연동 + 로컬 스토리지 자동 동기화/폴백 지원
 */

const AUTH_CONFIG = {
  DEFAULT_SECURITY_KEY: '123456', // 기본 일반 가입코드
  DEFAULT_ADMIN_KEY: '654321',    // 기본 관리자 코드
  STORAGE_KEY_USER: 'charles_current_user',
  STORAGE_KEY_ALL_USERS: 'charles_registered_users',
  STORAGE_KEY_CUSTOM_MASTER_KEY: 'charles_master_key',
  STORAGE_KEY_CUSTOM_ADMIN_KEY: 'charles_admin_key'
};

// 사운드 이펙트 모듈 (무음화 유지)
const RetroAudio = {
  ctx: null,
  enabled: false,

  init() {},
  playBeep() {},
  click() {},
  check() {},
  success() {},
  error() {}
};

const AuthService = {
  // Supabase 클라이언트 참조
  getDb() {
    return (typeof supabaseClient !== 'undefined' && supabaseClient) ? supabaseClient : null;
  },

  // 1. 일반 가입코드 조회 (기본: 123456)
  async getMasterKey() {
    const db = this.getDb();
    if (db) {
      try {
        const { data, error } = await db
          .from('app_config')
          .select('value')
          .eq('key', 'signup_code')
          .maybeSingle();

        if (!error && data && data.value) {
          return String(data.value).trim();
        }
      } catch (err) {
        // Supabase 조회 실패 시 로컬 설정값 사용
      }
    }
    return localStorage.getItem(AUTH_CONFIG.STORAGE_KEY_CUSTOM_MASTER_KEY) || AUTH_CONFIG.DEFAULT_SECURITY_KEY;
  },

  // 일반 가입코드 검증 (기본: 123456)
  async isValidKey(inputKey) {
    if (!inputKey) return false;
    const cleanKey = String(inputKey).trim();
    const masterKey = await this.getMasterKey();
    return cleanKey === masterKey;
  },

  // 2. 관리자 코드 조회 (기본: 654321)
  async getAdminKey() {
    const db = this.getDb();
    if (db) {
      try {
        const { data, error } = await db
          .from('app_config')
          .select('value')
          .eq('key', 'admin_code')
          .maybeSingle();

        if (!error && data && data.value) {
          return String(data.value).trim();
        }
      } catch (err) {
        // Fallback
      }
    }
    return localStorage.getItem(AUTH_CONFIG.STORAGE_KEY_CUSTOM_ADMIN_KEY) || AUTH_CONFIG.DEFAULT_ADMIN_KEY;
  },

  // 관리자 코드 검증 (기본: 654321)
  async isValidAdminKey(inputKey) {
    if (!inputKey) return false;
    const cleanKey = String(inputKey).trim();
    const adminKey = await this.getAdminKey();
    return cleanKey === adminKey;
  },

  // 현재 로그인된 로컬 세션 사용자 확인 (동기식)
  getCurrentUser() {
    const data = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY_USER);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  },

  // 로그인 상태 확인
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  },

  // 전체 등록된 사용자 목록 조회 (Supabase 클라우드 우선, 로컬 폴백)
  async getAllUsers() {
    const db = this.getDb();
    if (db) {
      try {
        const { data, error } = await db
          .from('members')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && Array.isArray(data)) {
          // 로컬에도 최신 캐시 업데이트
          const mappedUsers = data.map(u => ({
            id: u.id,
            name: u.name,
            nickname: u.nickname || u.name,
            cell: u.cell,
            registeredAt: u.created_at,
            lastLoginAt: u.last_login_at
          }));
          localStorage.setItem(AUTH_CONFIG.STORAGE_KEY_ALL_USERS, JSON.stringify(mappedUsers));
          return mappedUsers;
        }
      } catch (err) {
        console.warn('Supabase getAllUsers error, fallback to local storage:', err);
      }
    }

    // 로컬 폴백
    try {
      const data = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY_ALL_USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // 사용자 호칭 반환 (예: '닉네임님' 또는 '이름님')
  getUserCallName(user) {
    if (!user) return '성도님';
    const name = String(user.nickname || user.name || '').trim();
    return name ? `${name}님` : '성도님';
  },

  // 동기식 로컬 사용자 목록 조회 (렌더링 보조용)
  getAllUsersLocal() {
    try {
      const data = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY_ALL_USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // 아이디 중복 확인 (Supabase 클라우드 조회 + 로컬 캐시)
  async checkIdAvailability(id) {
    const cleanId = String(id || '').trim();
    if (!cleanId) {
      return { available: false, error: '아이디를 입력해 주세요.' };
    }
    if (cleanId.length < 3) {
      return { available: false, error: '아이디는 최소 3자 이상이어야 합니다.' };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanId)) {
      return { available: false, error: '아이디는 영문, 숫자, _, - 만 사용 가능합니다.' };
    }

    const db = this.getDb();
    if (db) {
      try {
        const { data, error } = await db
          .from('members')
          .select('id')
          .eq('id', cleanId);

        if (!error && Array.isArray(data)) {
          if (data.length > 0) {
            return { available: false, error: '이미 사용 중인 아이디입니다.' };
          }
          return { available: true, message: '사용 가능한 아이디입니다.' };
        }
      } catch (err) {
        console.warn('Supabase checkIdAvailability failed, checking local cache:', err);
      }
    }

    // 로컬 캐시 확인
    const localUsers = this.getAllUsersLocal();
    const isTaken = localUsers.some(u => (u.id || '').toLowerCase() === cleanId.toLowerCase());
    if (isTaken) {
      return { available: false, error: '이미 사용 중인 아이디입니다.' };
    }

    return { available: true, message: '사용 가능한 아이디입니다.' };
  },

  // 닉네임 중복 확인 (Supabase 클라우드 조회 + 로컬 캐시)
  async checkNicknameAvailability(nickname) {
    const cleanNick = String(nickname || '').trim();
    if (!cleanNick) {
      return { available: false, error: '닉네임을 입력해 주세요.' };
    }
    if (cleanNick.length < 2) {
      return { available: false, error: '닉네임은 최소 2자 이상이어야 합니다.' };
    }

    const db = this.getDb();
    if (db) {
      try {
        const { data, error } = await db
          .from('members')
          .select('nickname')
          .ilike('nickname', cleanNick);

        if (!error && Array.isArray(data)) {
          if (data.length > 0) {
            return { available: false, error: '이미 사용 중인 닉네임입니다.' };
          }
          return { available: true, message: '사용 가능한 닉네임입니다.' };
        }
      } catch (err) {
        console.warn('Supabase checkNicknameAvailability failed, checking local cache:', err);
      }
    }

    // 로컬 캐시 확인
    const localUsers = this.getAllUsersLocal();
    const isTaken = localUsers.some(u => (u.nickname || u.name || '').toLowerCase() === cleanNick.toLowerCase());
    if (isTaken) {
      return { available: false, error: '이미 사용 중인 닉네임입니다.' };
    }

    return { available: true, message: '사용 가능한 닉네임입니다.' };
  },

  // 회원가입 (Supabase members 테이블 저장)
  async register({ id, password, cell, name, nickname, signupCode }) {
    const cleanId = String(id || '').trim();
    const cleanPw = String(password || '');
    const cleanCell = String(cell || '').trim();
    const cleanName = String(name || '').trim();
    const cleanNick = String(nickname || cleanName).trim() || cleanName;
    const cleanCode = String(signupCode || '').trim();

    // 1. 아이디 검증
    const idCheck = await this.checkIdAvailability(cleanId);
    if (!idCheck.available) {
      RetroAudio.error();
      return { success: false, error: idCheck.error };
    }

    // 2. 닉네임 검증 (중복 차단)
    const nickCheck = await this.checkNicknameAvailability(cleanNick);
    if (!nickCheck.available) {
      RetroAudio.error();
      return { success: false, error: nickCheck.error };
    }

    // 2. 패스워드 검증 (8자 이상)
    if (!cleanPw || cleanPw.length < 8) {
      RetroAudio.error();
      return { success: false, error: '패스워드는 8자 이상으로 설정해야 합니다.' };
    }

    // 3. 소속 셀 검증
    if (!cleanCell) {
      RetroAudio.error();
      return { success: false, error: '소속 셀을 입력해 주세요.' };
    }

    // 4. 이름 검증
    if (!cleanName) {
      RetroAudio.error();
      return { success: false, error: '이름(성도명)을 입력해 주세요.' };
    }

    // 5. 가입코드 검증
    const isValid = await this.isValidKey(cleanCode);
    if (!isValid) {
      RetroAudio.error();
      return { success: false, error: '가입코드가 올바르지 않습니다.' };
    }

    const newUser = {
      id: cleanId,
      name: cleanName,
      nickname: cleanNick,
      cell: cleanCell,
      registeredAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    // Supabase members 테이블에 영구 저장
    const db = this.getDb();
    if (db) {
      try {
        const payload = {
          id: cleanId,
          password: cleanPw,
          name: cleanName,
          nickname: cleanNick,
          cell: cleanCell,
          created_at: newUser.registeredAt,
          last_login_at: newUser.lastLoginAt
        };

        const { error } = await db.from('members').insert([payload]);
        if (error) {
          // 혹시 Supabase members 테이블에 nickname 컬럼이 아직 없을 경우 fallback
          if (error.message && error.message.includes('nickname')) {
            delete payload.nickname;
            await db.from('members').insert([payload]);
          } else {
            console.warn('Supabase member insert warning:', error);
          }
        } else {
          console.log('✅ Supabase에 회원 정보가 성공적으로 등록되었습니다:', cleanId);
        }
      } catch (err) {
        console.warn('Supabase member insert error:', err);
      }
    }

    // 로컬 세션 및 백업 저장
    const localUsers = this.getAllUsersLocal();
    localUsers.push({ ...newUser, password: cleanPw });
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEY_ALL_USERS, JSON.stringify(localUsers));
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEY_USER, JSON.stringify(newUser));

    if (typeof StorageService !== 'undefined' && StorageService.syncFromCloud) {
      StorageService.syncFromCloud(newUser.id);
    }

    RetroAudio.success();
    return { success: true, user: newUser };
  },

  // 로그인 (아이디 + 패스워드 검증)
  async login(id, password) {
    const cleanId = String(id || '').trim();
    const cleanPw = String(password || '');

    if (!cleanId || !cleanPw) {
      RetroAudio.error();
      return { success: false, error: '아이디와 패스워드를 모두 입력해 주세요.' };
    }

    const db = this.getDb();
    if (db) {
      try {
        const { data, error } = await db
          .from('members')
          .select('*')
          .eq('id', cleanId)
          .eq('password', cleanPw)
          .maybeSingle();

        if (!error && data) {
          const userSession = {
            id: data.id,
            name: data.name,
            nickname: data.nickname || data.name,
            cell: data.cell,
            registeredAt: data.created_at,
            lastLoginAt: new Date().toISOString()
          };

          // Supabase 최근 접속일 갱신 (비동기 백그라운드)
          db.from('members')
            .update({ last_login_at: userSession.lastLoginAt })
            .eq('id', cleanId)
            .then();

          // 로컬 세션 저장
          localStorage.setItem(AUTH_CONFIG.STORAGE_KEY_USER, JSON.stringify(userSession));

          if (typeof StorageService !== 'undefined' && StorageService.syncFromCloud) {
            StorageService.syncFromCloud(userSession.id);
          }

          RetroAudio.success();
          return { success: true, user: userSession };
        }
      } catch (err) {
        console.warn('Supabase login check error, falling back to local storage:', err);
      }
    }

    // Supabase 실패 시 로컬 스토리지 검증 (오프라인 지원)
    const localUsers = this.getAllUsersLocal();
    const matchedIdx = localUsers.findIndex(
      u => (u.id || u.name || '').toLowerCase() === cleanId.toLowerCase() && u.password === cleanPw
    );

    if (matchedIdx === -1) {
      RetroAudio.error();
      return { success: false, error: '아이디 또는 패스워드가 올바르지 않습니다.' };
    }

    const matchedUser = localUsers[matchedIdx];
    matchedUser.lastLoginAt = new Date().toISOString();
    localUsers[matchedIdx] = matchedUser;

    localStorage.setItem(AUTH_CONFIG.STORAGE_KEY_ALL_USERS, JSON.stringify(localUsers));
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEY_USER, JSON.stringify(matchedUser));

    if (typeof StorageService !== 'undefined' && StorageService.syncFromCloud) {
      StorageService.syncFromCloud(matchedUser.id);
    }

    RetroAudio.success();
    return { success: true, user: matchedUser };
  },

  // 레거시 호환용
  async registerAndLogin(name, securityKey) {
    return this.register({
      id: name,
      password: 'password123',
      cell: '일반',
      name: name,
      signupCode: securityKey
    });
  },

  // 로그아웃
  logout() {
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEY_USER);
    RetroAudio.click();
    window.location.reload();
  },

  // 관리자용: 마스터 가입코드 변경 (Supabase + 로컬 동시 반영)
  async setMasterKey(newKey) {
    const cleanKey = String(newKey || '').trim();
    if (!cleanKey || cleanKey.length < 4) {
      return { success: false, error: '가입코드는 최소 4자리 이상이어야 합니다.' };
    }

    const db = this.getDb();
    if (db) {
      try {
        await db.from('app_config').upsert({
          key: 'signup_code',
          value: cleanKey
        });
      } catch (err) {
        console.warn('Supabase setMasterKey error:', err);
      }
    }

    localStorage.setItem(AUTH_CONFIG.STORAGE_KEY_CUSTOM_MASTER_KEY, cleanKey);
    return { success: true };
  },

  // 관리자용: 관리자 코드 변경 (Supabase + 로컬 동시 반영)
  async setAdminKey(newKey) {
    const cleanKey = String(newKey || '').trim();
    if (!cleanKey || cleanKey.length < 4) {
      return { success: false, error: '관리자 코드는 최소 4자리 이상이어야 합니다.' };
    }

    const db = this.getDb();
    if (db) {
      try {
        await db.from('app_config').upsert({
          key: 'admin_code',
          value: cleanKey
        });
      } catch (err) {
        console.warn('Supabase setAdminKey error:', err);
      }
    }

    localStorage.setItem(AUTH_CONFIG.STORAGE_KEY_CUSTOM_ADMIN_KEY, cleanKey);
    return { success: true };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthService, RetroAudio, AUTH_CONFIG };
}
