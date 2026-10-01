/**
 * Charles' Bible - 관리자 콘솔 스크립트 (Admin Controller)
 */

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});

const AdminApp = {
  isAdminUnlocked: false,

  init() {
    this.checkAdminAuth();
    this.bindEvents();
    this.refreshDashboard();
  },

  checkAdminAuth() {
    const adminLock = document.getElementById('admin-auth-lock');
    const adminMain = document.getElementById('admin-main-content');

    const authForm = document.getElementById('admin-login-form');
    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pinInput = document.getElementById('admin-pin-input');
        const err = document.getElementById('admin-auth-error');

        // 관리자 전용 보안코드(654321) 검증
        const isValid = await AuthService.isValidAdminKey(pinInput.value);
        if (isValid) {
          this.isAdminUnlocked = true;
          adminLock.style.display = 'none';
          adminMain.style.display = 'block';
          RetroAudio.success();
          this.refreshDashboard();
        } else {
          err.style.display = 'block';
          RetroAudio.error();
        }
      });
    }
  },

  bindEvents() {
    // 1. 일반 회원 가입코드(123456) 변경 폼
    const keyForm = document.getElementById('form-change-key');
    if (keyForm) {
      keyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newKeyInput = document.getElementById('input-new-key');
        const res = await AuthService.setMasterKey(newKeyInput.value);
        if (res.success) {
          RetroAudio.success();
          alert(`가입코드가 성공적으로 [${newKeyInput.value}] 로 변경되었습니다.`);
          newKeyInput.value = '';
          this.refreshDashboard();
        } else {
          RetroAudio.error();
          alert('오류: ' + res.error);
        }
      });
    }

    // 기본 가입코드(123456)로 리셋
    const resetKeyBtn = document.getElementById('btn-reset-key-default');
    if (resetKeyBtn) {
      resetKeyBtn.addEventListener('click', async () => {
        if (confirm('가입코드를 초기 기본값인 [123456] 로 복구하시겠습니까?')) {
          localStorage.removeItem(AUTH_CONFIG.STORAGE_KEY_CUSTOM_MASTER_KEY);
          await AuthService.setMasterKey('123456');
          RetroAudio.click();
          alert('기본 가입코드(123456)로 복구되었습니다.');
          this.refreshDashboard();
        }
      });
    }

    // 2. 관리자 보안코드(654321) 변경 폼
    const adminKeyForm = document.getElementById('form-change-admin-key');
    if (adminKeyForm) {
      adminKeyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newKeyInput = document.getElementById('input-new-admin-key');
        const res = await AuthService.setAdminKey(newKeyInput.value);
        if (res.success) {
          RetroAudio.success();
          alert(`관리자 코드가 성공적으로 [${newKeyInput.value}] 로 변경되었습니다.`);
          newKeyInput.value = '';
          this.refreshDashboard();
        } else {
          RetroAudio.error();
          alert('오류: ' + res.error);
        }
      });
    }

    // 기본 관리자 코드(654321)로 리셋
    const resetAdminKeyBtn = document.getElementById('btn-reset-admin-key-default');
    if (resetAdminKeyBtn) {
      resetAdminKeyBtn.addEventListener('click', async () => {
        if (confirm('관리자 코드를 초기 기본값인 [654321] 로 복구하시겠습니까?')) {
          localStorage.removeItem(AUTH_CONFIG.STORAGE_KEY_CUSTOM_ADMIN_KEY);
          await AuthService.setAdminKey('654321');
          RetroAudio.click();
          alert('기본 관리자 코드(654321)로 복구되었습니다.');
          this.refreshDashboard();
        }
      });
    }

    // 찰스 시뮬레이션 버튼들
    document.querySelectorAll('.btn-sim-stage').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetStage = parseInt(btn.dataset.stage, 10);
        this.simulateStage(targetStage);
      });
    });

    // 전체 통독 리셋
    const clearProgBtn = document.getElementById('btn-admin-clear-progress');
    if (clearProgBtn) {
      clearProgBtn.addEventListener('click', () => {
        if (confirm('모든 통독 진행 데이터를 삭제하시겠습니까?')) {
          StorageService.resetAll();
          RetroAudio.click();
          alert('통독 데이터가 초기화되었습니다.');
          this.refreshDashboard();
        }
      });
    }

    // SQL 쿼리 복사 버튼
    const copySqlBtn = document.getElementById('btn-copy-sql');
    if (copySqlBtn) {
      copySqlBtn.addEventListener('click', () => {
        const sqlBox = document.getElementById('admin-sql-box');
        if (sqlBox) {
          navigator.clipboard.writeText(sqlBox.innerText).then(() => {
            RetroAudio.success();
            alert('Supabase SQL 쿼리가 클립보드에 복사되었습니다! Supabase SQL Editor에 붙여넣어 실행하세요.');
          }).catch(err => {
            console.error('클립보드 복사 실패:', err);
            alert('복사에 실패했습니다. 텍스트를 직접 드래그하여 복사해 주세요.');
          });
        }
      });
    }
  },

  // 찰스 단계 시뮬레이션
  simulateStage(stage) {
    if (stage === 1) {
      StorageService.resetAll();
    } else if (stage === 2) {
      // 10장 읽기
      StorageService.resetAll();
      for (let i = 1; i <= 10; i++) StorageService.toggleChapter('GEN', i);
    } else if (stage === 3) {
      // 25% (약 300장)
      StorageService.resetAll();
      for (const b of BIBLE_BOOKS.slice(0, 10)) {
        StorageService.toggleBookAll(b.id, b.chapters, true);
      }
    } else if (stage === 4) {
      // 60% (구약 대부분)
      StorageService.resetAll();
      for (const b of BIBLE_BOOKS.filter(x => x.testament === 'OT')) {
        StorageService.toggleBookAll(b.id, b.chapters, true);
      }
    } else if (stage === 5) {
      // 100% 전권 완독
      for (const b of BIBLE_BOOKS) {
        StorageService.toggleBookAll(b.id, b.chapters, true);
      }
    }

    RetroAudio.success();
    alert(`찰스를 [단계 ${stage}] 상태로 시뮬레이션 설정했습니다! 메인 앱(index.html)에서 확인해 보세요.`);
    this.refreshDashboard();
  },

  async refreshDashboard() {
    // 1) 회원 가입코드 표시
    const currentKeyEl = document.getElementById('disp-current-key');
    if (currentKeyEl) {
      const key = await AuthService.getMasterKey();
      currentKeyEl.textContent = key;
    }

    // 2) 관리자 코드 표시
    const currentAdminKeyEl = document.getElementById('disp-current-admin-key');
    if (currentAdminKeyEl) {
      const adminKey = await AuthService.getAdminKey();
      currentAdminKeyEl.textContent = adminKey;
    }

    // 3) 가입 사용자 목록 및 오늘 통독/달란트 현황 표시
    const userTableBody = document.getElementById('admin-user-tbody');
    if (userTableBody) {
      const renderTable = (users, stateMap = {}) => {
        if (!users || users.length === 0) {
          userTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#888;">등록된 성도가 없습니다.</td></tr>`;
        } else {
          // 정렬: 오늘 읽은 장수 내림차순 -> 연속통독일 내림차순 -> 달란트 내림차순
          const sorted = [...users].sort((a, b) => {
            const stA = stateMap[a.id] || {};
            const stB = stateMap[b.id] || {};
            return (stB.todayRead || 0) - (stA.todayRead || 0) ||
                   (stB.streakCount || 0) - (stA.streakCount || 0) ||
                   (stB.talents || 0) - (stA.talents || 0);
          });

          userTableBody.innerHTML = sorted.map((u, i) => {
            const st = stateMap[u.id] || {};
            const todayCount = st.todayRead || 0;
            const talents = st.talents || 0;
            const streak = st.streakCount || 0;
            const stage = st.stage || 1;

            return `
              <tr>
                <td><code>${u.id || '-'}</code></td>
                <td><strong>${u.name}</strong> <span style="font-size:11px; color:#666;">(${u.nickname || u.name})</span></td>
                <td><span style="display:inline-block; padding: 2px 6px; background: #E8F5E9; border-radius: 4px; font-size: 11px; font-weight: 600; color: #2E7D32;">${u.cell || '미지정'}</span></td>
                <td style="font-weight: 800; color: ${todayCount > 0 ? '#2E7D32' : '#999'};">${todayCount > 0 ? `${todayCount}장 📖` : '0장'}</td>
                <td style="font-weight: 800; color: #D68910;">${talents.toLocaleString()} 🪙</td>
                <td style="font-weight: 800; color: ${streak > 0 ? '#E65100' : '#999'};">${streak > 0 ? `${streak}일 🔥` : '0일'}</td>
                <td><span style="font-weight: 600;">${stage}단계 🐑</span></td>
                <td style="font-size: 11px; color: #666;">${u.lastLoginAt ? u.lastLoginAt.slice(0, 10) : (u.registeredAt ? u.registeredAt.slice(0, 10) : '-')}</td>
              </tr>
            `;
          }).join('');
        }
      };

      // 1차: 로컬 캐시 사용자 목록 및 상태로 빠른 렌더링
      const localUsers = AuthService.getAllUsersLocal();
      const localIds = localUsers.map(u => u.id);
      let states = await StorageService.getAllUsersStates(localIds);
      renderTable(localUsers, states);

      // 2차: Supabase 최신 사용자 목록 및 실시간 상태 동기화 후 리렌더링
      const remoteUsers = await AuthService.getAllUsers();
      if (Array.isArray(remoteUsers) && remoteUsers.length > 0) {
        const remoteIds = remoteUsers.map(u => u.id);
        states = await StorageService.getAllUsersStates(remoteIds);
        renderTable(remoteUsers, states);
      }
    }

    // 3) 통독 요약
    const stats = StorageService.getStats();
    const stage = StorageService.getCharlesStage();
    const sumEl = document.getElementById('admin-stats-summary');
    if (sumEl) {
      sumEl.innerHTML = `
        현재 인스턴스 통독 진행: <strong>${stats.totalRead} / ${stats.totalChapters} 장 (${stats.percent}%)</strong><br>
        현재 찰스 상태: <strong>${CHARLES_STAGES[stage].title} (${CHARLES_STAGES[stage].badge})</strong>
      `;
    }
  }
};
