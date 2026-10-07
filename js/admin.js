/**
 * Charles' Bible - 관리자 콘솔 스크립트 (Admin Controller)
 * - 가입코드 / 관리자 코드 관리
 * - 성도 명부 검색, 셀별 필터링, 정렬
 * - 🪙 성도 달란트 실시간 직접 지급 / 차감 / 수정
 * - ⚙️ 성도 정보 관리 (이름, 닉네임, 소속 셀 변경, 비밀번호 1234 초기화, 계정 삭제)
 * - 찰스 성장 시뮬레이터 및 Supabase SQL 가이드
 */

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});

const AdminApp = {
  isAdminUnlocked: false,
  allUsers: [],
  stateMap: {},
  searchKeyword: '',
  selectedCell: 'ALL',
  sortBy: 'todayRead',

  // 📊 사용자 주간 현황 상태
  weeksList: [],
  selectedWeekIndex: -1,
  weeklySelectedCell: 'ALL',
  weeklyOnlyTtibu: false,

  init() {
    this.checkAdminAuth();
    this.bindEvents();
    this.bindModalEvents();
    this.bindMessageEvents();
  },

  // ==================== 1. 관리자 인증 검증 ====================
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
          this.showToast('👑 관리자 콘솔에 성공적으로 로그인했습니다.', 'success');
          this.refreshDashboard();
        } else {
          err.style.display = 'block';
          RetroAudio.error();
        }
      });
    }
  },

  // ==================== 2. 기본 이벤트 바인딩 ====================
  bindEvents() {
    // 1) 일반 회원 가입코드(123456) 변경 폼
    const keyForm = document.getElementById('form-change-key');
    if (keyForm) {
      keyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newKeyInput = document.getElementById('input-new-key');
        const res = await AuthService.setMasterKey(newKeyInput.value);
        if (res.success) {
          RetroAudio.success();
          if (res.cloudError) {
            alert(`⚠️ 로컬에는 저장되었으나, Supabase RLS 정책 제한으로 클라우드 DB 저장이 실패했습니다.\n\nSupabase [SQL Editor]에서 app_config RLS 정책 SQL을 실행해 주세요!\n(원인: ${res.cloudError})`);
          } else {
            this.showToast(`가입코드가 [${newKeyInput.value}] 로 변경되었습니다. (클라우드 반영 완료)`, 'success');
          }
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
          this.showToast('기본 가입코드(123456)로 복구되었습니다.', 'success');
          this.refreshDashboard();
        }
      });
    }

    // 2) 관리자 보안코드(654321) 변경 폼
    const adminKeyForm = document.getElementById('form-change-admin-key');
    if (adminKeyForm) {
      adminKeyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newKeyInput = document.getElementById('input-new-admin-key');
        const res = await AuthService.setAdminKey(newKeyInput.value);
        if (res.success) {
          RetroAudio.success();
          if (res.cloudError) {
            alert(`⚠️ 로컬에는 저장되었으나, Supabase RLS 정책 제한으로 클라우드 DB 저장이 실패했습니다.\n\nSupabase [SQL Editor]에서 app_config RLS 정책 SQL을 실행해 주세요!\n(원인: ${res.cloudError})`);
          } else {
            this.showToast(`관리자 코드가 [${newKeyInput.value}] 로 변경되었습니다. (클라우드 반영 완료)`, 'success');
          }
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
          this.showToast('기본 관리자 코드(654321)로 복구되었습니다.', 'success');
          this.refreshDashboard();
        }
      });
    }

    // 3) 검색 & 필터 & 정렬 이벤트
    const searchInput = document.getElementById('admin-search-user');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchKeyword = (e.target.value || '').trim().toLowerCase();
        this.renderFilteredTable();
      });
    }

    const cellFilter = document.getElementById('admin-filter-cell');
    if (cellFilter) {
      cellFilter.addEventListener('change', (e) => {
        this.selectedCell = e.target.value;
        this.renderFilteredTable();
      });
    }

    const sortSelect = document.getElementById('admin-sort-by');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderFilteredTable();
      });
    }

    const refreshBtn = document.getElementById('btn-refresh-users');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        refreshBtn.disabled = true;
        refreshBtn.textContent = '⏳ 조회중...';
        await this.refreshDashboard();
        refreshBtn.disabled = false;
        refreshBtn.textContent = '🔄 새로고침';
        this.showToast('성도 명부 및 통독 현황을 새로고침했습니다.', 'info');
      });
    }

    // 4) SQL 쿼리 복사 버튼
    const copySqlBtn = document.getElementById('btn-copy-sql');
    if (copySqlBtn) {
      copySqlBtn.addEventListener('click', () => {
        const sqlBox = document.getElementById('admin-sql-box');
        if (sqlBox) {
          navigator.clipboard.writeText(sqlBox.innerText).then(() => {
            RetroAudio.success();
            this.showToast('📋 SQL 쿼리가 클립보드에 복사되었습니다!', 'success');
          }).catch(err => {
            console.error('클립보드 복사 실패:', err);
            alert('복사에 실패했습니다. 텍스트를 직접 드래그하여 복사해 주세요.');
          });
        }
      });
    }

    // 5) 📊 사용자 주간 현황 이벤트
    const weekSelect = document.getElementById('weekly-select-week');
    if (weekSelect) {
      weekSelect.addEventListener('change', (e) => {
        this.selectedWeekIndex = parseInt(e.target.value, 10) || 0;
        this.renderWeeklyDashboard();
      });
    }

    const prevWeekBtn = document.getElementById('btn-week-prev');
    if (prevWeekBtn) {
      prevWeekBtn.addEventListener('click', () => {
        if (this.selectedWeekIndex < this.weeksList.length - 1) {
          this.selectedWeekIndex++;
          if (weekSelect) weekSelect.value = String(this.selectedWeekIndex);
          RetroAudio.click();
          this.renderWeeklyDashboard();
        } else {
          this.showToast('더 이전 주차가 없습니다.', 'info');
        }
      });
    }

    const nextWeekBtn = document.getElementById('btn-week-next');
    if (nextWeekBtn) {
      nextWeekBtn.addEventListener('click', () => {
        if (this.selectedWeekIndex > 0) {
          this.selectedWeekIndex--;
          if (weekSelect) weekSelect.value = String(this.selectedWeekIndex);
          RetroAudio.click();
          this.renderWeeklyDashboard();
        } else {
          this.showToast('더 미래 주차가 없습니다.', 'info');
        }
      });
    }

    const weeklyCellFilter = document.getElementById('weekly-filter-cell');
    if (weeklyCellFilter) {
      weeklyCellFilter.addEventListener('change', (e) => {
        this.weeklySelectedCell = e.target.value;
        this.renderWeeklyDashboard();
      });
    }

    const onlyTtibuCheckbox = document.getElementById('weekly-only-ttibu');
    if (onlyTtibuCheckbox) {
      onlyTtibuCheckbox.addEventListener('change', (e) => {
        this.weeklyOnlyTtibu = e.target.checked;
        RetroAudio.click();
        this.renderWeeklyDashboard();
      });
    }

    const copyTtibuBtn = document.getElementById('btn-copy-ttibu-list');
    if (copyTtibuBtn) {
      copyTtibuBtn.addEventListener('click', () => {
        this.copyTtibuWinnersList();
      });
    }
  },

  // ==================== 3. 모달 공통 및 개별 이벤트 ====================
  bindModalEvents() {
    // 1) 모달 닫기 버튼들 (data-close-modal)
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-close-modal');
        this.closeModal(targetId);
      });
    });

    // 오버레이 클릭 시 닫기
    document.querySelectorAll('.admin-modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModal(overlay.id);
        }
      });
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.admin-modal-overlay.active').forEach(m => {
          this.closeModal(m.id);
        });
      }
    });

    // 2) 달란트 관리 모달: 빠른 증감 버튼들
    document.querySelectorAll('.quick-tag-btn[data-delta]').forEach(btn => {
      btn.addEventListener('click', () => {
        const delta = parseInt(btn.dataset.delta, 10) || 0;
        const inputAmount = document.getElementById('input-talent-amount');
        if (inputAmount) {
          const cur = Math.max(0, parseInt(inputAmount.value, 10) || 0);
          inputAmount.value = Math.max(0, cur + delta);
        }
      });
    });

    const resetZeroBtn = document.getElementById('btn-talent-reset-zero');
    if (resetZeroBtn) {
      resetZeroBtn.addEventListener('click', () => {
        const inputAmount = document.getElementById('input-talent-amount');
        if (inputAmount) inputAmount.value = 0;
      });
    }

    // 달란트 저장 버튼
    const saveTalentBtn = document.getElementById('btn-save-talent');
    if (saveTalentBtn) {
      saveTalentBtn.addEventListener('click', () => this.handleSaveTalent());
    }

    // 3) 성도 정보 관리 모달: 비밀번호 1234 초기화 단축 버튼
    const quickResetPwBtn = document.getElementById('btn-quick-reset-pw');
    if (quickResetPwBtn) {
      quickResetPwBtn.addEventListener('click', () => {
        const pwInput = document.getElementById('input-member-new-password');
        if (pwInput) {
          pwInput.value = '1234';
          pwInput.focus();
          this.showToast("새 비밀번호 입력창에 '1234'를 채웠습니다. [저장]을 눌러 완료하세요.", 'info');
        }
      });
    }

    // 성도 정보 저장 버튼
    const saveMemberBtn = document.getElementById('btn-save-member');
    if (saveMemberBtn) {
      saveMemberBtn.addEventListener('click', () => this.handleSaveMember());
    }

    // 성도 계정 영구 삭제 버튼
    const deleteMemberBtn = document.getElementById('btn-delete-member');
    if (deleteMemberBtn) {
      deleteMemberBtn.addEventListener('click', () => this.handleDeleteMember());
    }
  },

  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.add('active');
    }
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.remove('active');
    }
  },

  // ==================== 4. 토스트 알림 ====================
  showToast(message, type = 'success') {
    const container = document.getElementById('admin-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    
    let icon = '🔔';
    if (type === 'success') icon = '✅';
    else if (type === 'error') icon = '❌';
    else if (type === 'info') icon = 'ℹ️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    // Fade In
    setTimeout(() => toast.classList.add('active'), 20);

    // Auto Remove
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  // ==================== 5. 대시보드 및 성도 목록 리프레시 ====================
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

    // 3) 전체 성도 목록 및 상태 가져오기
    let users = [];
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('members')
          .select('*')
          .order('created_at', { ascending: true });
        if (!error && Array.isArray(data)) {
          users = data;
        }
      } catch (err) {
        console.warn('Supabase members fetch error, fallback to AuthService:', err);
      }
    }

    if (users.length === 0) {
      users = await AuthService.getAllUsers();
    }

    this.allUsers = users;

    // 성도 상태 맵(오늘 읽은 장수, 달란트, 스트릭 등) 조회
    const userIds = users.map(u => u.id);
    this.stateMap = await StorageService.getAllUsersStates(userIds);

    // 셀 필터 드롭다운 옵션 갱신
    this.populateCellFilterOptions();

    // 메시지 발송 대상 성도 드롭다운 옵션 갱신
    this.populateMessageTargetUserOptions();

    // 성도 목록 테이블 렌더링
    this.renderFilteredTable();

    // 📊 사용자 주간 현황 초기화 및 렌더링
    this.initWeeklyDashboard();
    this.renderWeeklyDashboard();

    // 최근 발송 메시지 내역 불러오기
    this.loadSentMessages();
  },

  // 셀 목록 드롭다운 채우기
  populateCellFilterOptions() {
    const cellFilter = document.getElementById('admin-filter-cell');
    if (!cellFilter) return;

    const currentVal = this.selectedCell;
    const cells = new Set();
    this.allUsers.forEach(u => {
      if (u.cell && u.cell !== '미지정') cells.add(u.cell);
    });

    const sortedCells = Array.from(cells).sort();
    
    let optionsHtml = `<option value="ALL">전체 셀 (${this.allUsers.length}명)</option>`;
    sortedCells.forEach(cell => {
      const count = this.allUsers.filter(u => u.cell === cell).length;
      optionsHtml += `<option value="${cell}">${cell} (${count}명)</option>`;
    });

    cellFilter.innerHTML = optionsHtml;
    cellFilter.value = cells.has(currentVal) ? currentVal : 'ALL';
    this.selectedCell = cellFilter.value;
  },

  // 필터 및 정렬 적용 후 테이블 렌더링
  renderFilteredTable() {
    const userTableBody = document.getElementById('admin-user-tbody');
    const badgeTotalUsers = document.getElementById('badge-total-users');
    if (!userTableBody) return;

    let filtered = [...this.allUsers];

    // 1) 셀 필터
    if (this.selectedCell && this.selectedCell !== 'ALL') {
      filtered = filtered.filter(u => u.cell === this.selectedCell);
    }

    // 2) 검색어 필터 (이름, 닉네임, 아이디)
    if (this.searchKeyword) {
      const kw = this.searchKeyword;
      filtered = filtered.filter(u => 
        (u.name && u.name.toLowerCase().includes(kw)) ||
        (u.nickname && u.nickname.toLowerCase().includes(kw)) ||
        (u.id && u.id.toLowerCase().includes(kw)) ||
        (u.cell && u.cell.toLowerCase().includes(kw))
      );
    }

    // 3) 정렬
    filtered.sort((a, b) => {
      const stA = this.stateMap[a.id] || {};
      const stB = this.stateMap[b.id] || {};

      if (this.sortBy === 'todayRead') {
        return (stB.todayRead || 0) - (stA.todayRead || 0) ||
               (stB.talents || 0) - (stA.talents || 0) ||
               (stB.streakCount || 0) - (stA.streakCount || 0);
      } else if (this.sortBy === 'talents') {
        return (stB.talents || 0) - (stA.talents || 0) ||
               (stB.todayRead || 0) - (stA.todayRead || 0);
      } else if (this.sortBy === 'streak') {
        return (stB.streakCount || 0) - (stA.streakCount || 0) ||
               (stB.todayRead || 0) - (stA.todayRead || 0);
      } else if (this.sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '', 'ko');
      } else if (this.sortBy === 'recent') {
        return new Date(b.created_at || b.registeredAt || 0) - new Date(a.created_at || a.registeredAt || 0);
      }
      return 0;
    });

    if (badgeTotalUsers) {
      badgeTotalUsers.textContent = `총 ${filtered.length}명 / 전체 ${this.allUsers.length}명`;
    }

    if (filtered.length === 0) {
      userTableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; color: #888; padding: 24px;">
            조건에 맞는 성도가 없습니다.
          </td>
        </tr>
      `;
      return;
    }

    userTableBody.innerHTML = filtered.map((u, i) => {
      const st = this.stateMap[u.id] || {};
      const todayCount = st.todayRead || 0;
      const talents = st.talents || 0;
      const streak = st.streakCount || 0;
      const stage = st.stage || 1;
      const lastLogin = u.last_login_at || u.lastLoginAt;
      const dateText = lastLogin ? String(lastLogin).slice(0, 10) : (u.created_at ? String(u.created_at).slice(0, 10) : '-');

      return `
        <tr data-user-row="${u.id}">
          <td><code style="font-size: 11px;">${u.id || '-'}</code></td>
          <td>
            <strong>${u.name}</strong> 
            <span style="font-size: 11px; color: #666;">(${u.nickname || u.name})</span>
          </td>
          <td><span class="cell-badge">${u.cell || '미지정'}</span></td>
          <td style="font-weight: 800; color: ${todayCount > 0 ? '#2E7D32' : '#999'};">
            ${todayCount > 0 ? `${todayCount}장 📖` : '0장'}
          </td>
          <td style="font-weight: 800; color: #D68910;">
            ${talents.toLocaleString()} 🪙
          </td>
          <td style="font-weight: 800; color: ${streak > 0 ? '#E65100' : '#999'};">
            ${streak > 0 ? `${streak}일 🔥` : '0일'}
          </td>
          <td><span style="font-weight: 600;">${stage}단계 🐑</span></td>
          <td style="font-size: 11px; color: #666;">${dateText}</td>
          <td style="text-align: center;">
            <div class="action-btn-group" style="justify-content: center;">
              <button type="button" class="admin-btn admin-btn-sm admin-btn-warning btn-action-talent" data-uid="${u.id}" title="달란트 지급 및 수정">
                🪙 달란트
              </button>
              <button type="button" class="admin-btn admin-btn-sm btn-action-msg" data-uid="${u.id}" title="어린양의 메세지 발송">
                💌 쪽지
              </button>
              <button type="button" class="admin-btn admin-btn-sm btn-action-member" data-uid="${u.id}" title="계정 및 비밀번호 관리">
                ⚙️ 관리
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // 이벤트 리스너 연결
    userTableBody.querySelectorAll('.btn-action-talent').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.dataset.uid;
        this.openTalentModal(uid);
      });
    });

    userTableBody.querySelectorAll('.btn-action-msg').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.dataset.uid;
        this.openDirectMessageModal(uid);
      });
    });

    userTableBody.querySelectorAll('.btn-action-member').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.dataset.uid;
        this.openMemberModal(uid);
      });
    });
  },

  // ==================== 6. 달란트 직접 관리 모달 ====================
  openTalentModal(uid) {
    const user = this.allUsers.find(u => u.id === uid);
    if (!user) return;

    const st = this.stateMap[uid] || {};
    const curTalents = st.talents || 0;

    document.getElementById('input-talent-user-id').value = uid;
    document.getElementById('modal-talent-user-name').textContent = `${user.name} 성도 (${user.nickname || user.name})`;
    document.getElementById('modal-talent-user-id').textContent = `아이디: ${uid} | 셀: ${user.cell || '미지정'}`;
    document.getElementById('modal-talent-current-amount').textContent = `${curTalents.toLocaleString()} 🪙`;
    
    const inputAmount = document.getElementById('input-talent-amount');
    inputAmount.value = curTalents;
    document.getElementById('input-talent-reason').value = '';

    this.openModal('modal-talent');
    setTimeout(() => inputAmount.focus(), 150);
  },

  async handleSaveTalent() {
    const uid = document.getElementById('input-talent-user-id').value;
    const inputAmount = document.getElementById('input-talent-amount');
    const reason = (document.getElementById('input-talent-reason').value || '').trim();
    const saveBtn = document.getElementById('btn-save-talent');

    const safeAmount = Math.max(0, parseInt(inputAmount.value, 10) || 0);
    const user = this.allUsers.find(u => u.id === uid);
    const userName = user ? user.name : uid;

    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ 저장 중...';

    try {
      const nowUtc = new Date().toISOString();

      if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        // 1) 기존 daily_counts 가져오기
        const { data: curState } = await supabaseClient
          .from('user_reading_state')
          .select('daily_counts')
          .eq('user_id', uid)
          .maybeSingle();

        const dailyCounts = (curState && curState.daily_counts && typeof curState.daily_counts === 'object')
          ? { ...curState.daily_counts }
          : {};

        const talentMeta = (dailyCounts.__talent_data__ && typeof dailyCounts.__talent_data__ === 'object')
          ? { ...dailyCounts.__talent_data__ }
          : {};

        talentMeta.talents = safeAmount;
        talentMeta.updated_at = nowUtc;
        if (reason) talentMeta.last_admin_reason = reason;

        dailyCounts.__talent_data__ = talentMeta;

        // 2) user_reading_state의 talents 컬럼과 daily_counts.__talent_data__ 동시 업데이트
        const { error } = await supabaseClient
          .from('user_reading_state')
          .update({
            talents: safeAmount,
            daily_counts: dailyCounts,
            updated_at: nowUtc
          })
          .eq('user_id', uid);

        if (error) {
          throw error;
        }
      }

      // 3) 로컬 캐시 동기화
      try {
        localStorage.setItem(`charles_user_${uid}_talents`, String(safeAmount));
        localStorage.setItem(`charles_user_${uid}_talents_updated_at`, nowUtc);
      } catch (e) {}

      // 4) 상태 맵 갱신 및 UI 반영
      if (this.stateMap[uid]) {
        this.stateMap[uid].talents = safeAmount;
      }

      this.closeModal('modal-talent');
      RetroAudio.success();
      this.showToast(`🪙 [${userName}] 성도님의 달란트가 ${safeAmount.toLocaleString()}🪙로 설정되었습니다!`, 'success');
      this.renderFilteredTable();
    } catch (err) {
      console.error('달란트 저장 실패:', err);
      RetroAudio.error();
      alert('달란트 저장 중 오류가 발생했습니다: ' + (err.message || err));
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = '🪙 달란트 즉시 저장';
    }
  },

  // ==================== 7. 성도 계정 및 정보 관리 모달 ====================
  openMemberModal(uid) {
    const user = this.allUsers.find(u => u.id === uid);
    if (!user) return;

    document.getElementById('input-member-user-id').value = uid;
    document.getElementById('input-member-disp-id').value = uid;
    document.getElementById('input-member-name').value = user.name || '';
    document.getElementById('input-member-nickname').value = user.nickname || user.name || '';
    document.getElementById('input-member-cell').value = user.cell || '';
    document.getElementById('input-member-new-password').value = '';

    // 현재 비밀번호 미리보기 표시
    const pwDisp = document.getElementById('disp-current-pw-preview');
    if (pwDisp) {
      if (user.password) {
        pwDisp.textContent = `(현재 암호: ${user.password})`;
      } else {
        pwDisp.textContent = '';
      }
    }

    // 추천 셀 태그 채우기
    const cellTagsContainer = document.getElementById('modal-cell-recommend-tags');
    if (cellTagsContainer) {
      const cells = new Set();
      this.allUsers.forEach(u => {
        if (u.cell && u.cell !== '미지정') cells.add(u.cell);
      });
      const sortedCells = Array.from(cells).sort();

      cellTagsContainer.innerHTML = sortedCells.map(c => `
        <button type="button" class="cell-choice-btn" data-cell="${c}">${c}</button>
      `).join('');

      cellTagsContainer.querySelectorAll('.cell-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.getElementById('input-member-cell').value = btn.dataset.cell;
        });
      });
    }

    this.openModal('modal-member');
  },

  async handleSaveMember() {
    const uid = document.getElementById('input-member-user-id').value;
    const cleanName = (document.getElementById('input-member-name').value || '').trim();
    const cleanNick = (document.getElementById('input-member-nickname').value || cleanName).trim() || cleanName;
    const cleanCell = (document.getElementById('input-member-cell').value || '').trim() || '미지정';
    const newPassword = (document.getElementById('input-member-new-password').value || '').trim();
    const saveBtn = document.getElementById('btn-save-member');

    if (!cleanName) {
      alert('성도 이름을 입력해 주세요.');
      document.getElementById('input-member-name').focus();
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ 저장 중...';

    try {
      const updatePayload = {
        name: cleanName,
        nickname: cleanNick,
        cell: cleanCell
      };

      if (newPassword && newPassword.length > 0) {
        updatePayload.password = newPassword;
      }

      if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        const { data, error } = await supabaseClient
          .from('members')
          .update(updatePayload)
          .eq('id', uid)
          .select();

        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('Supabase RLS 보안 정책으로 인해 데이터베이스 수정이 차단되었습니다 (0 rows updated).\n\n관리자 콘솔 하단의 SQL 쿼리(또는 안내받으신 members RLS SQL)를 Supabase [SQL Editor]에서 1회 실행해 주세요!');
        }
      }

      // 로컬 allUsers 상태 갱신
      const user = this.allUsers.find(u => u.id === uid);
      if (user) {
        user.name = cleanName;
        user.nickname = cleanNick;
        user.cell = cleanCell;
        if (newPassword) user.password = newPassword;
      }

      // 로컬 스토리지 캐시 동기화
      try {
        const localList = AuthService.getAllUsersLocal();
        const localIdx = localList.findIndex(u => u.id === uid);
        if (localIdx >= 0) {
          localList[localIdx].name = cleanName;
          localList[localIdx].nickname = cleanNick;
          localList[localIdx].cell = cleanCell;
          localStorage.setItem(AUTH_CONFIG.STORAGE_KEY_ALL_USERS, JSON.stringify(localList));
        }
      } catch (e) {}

      this.closeModal('modal-member');
      RetroAudio.success();
      this.showToast(`💾 [${cleanName}] 성도님의 정보가 성공적으로 수정되었습니다!`, 'success');
      this.populateCellFilterOptions();
      this.renderFilteredTable();
    } catch (err) {
      console.error('성도 정보 저장 실패:', err);
      RetroAudio.error();
      alert('성도 정보 저장 중 오류가 발생했습니다: ' + (err.message || err));
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 성도 정보 저장';
    }
  },

  async handleDeleteMember() {
    const uid = document.getElementById('input-member-user-id').value;
    const user = this.allUsers.find(u => u.id === uid);
    const userName = user ? user.name : uid;

    if (!confirm(`정말 [${userName} (${uid})] 성도 계정을 영구 삭제하시겠습니까?\n\n⚠️ 주의: 이 작업은 되돌릴 수 없으며, 성도의 통독 기록과 달란트 데이터가 데이터베이스에서 영구 삭제됩니다.`)) {
      return;
    }

    if (!confirm(`정말로 최종 삭제하시겠습니까?`)) {
      return;
    }

    const delBtn = document.getElementById('btn-delete-member');
    delBtn.disabled = true;
    delBtn.textContent = '⏳ 삭제 처리 중...';

    try {
      if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        // 1) user_reading_state 삭제
        await supabaseClient.from('user_reading_state').delete().eq('user_id', uid);
        // 2) members 삭제
        const { data, error } = await supabaseClient.from('members').delete().eq('id', uid).select();
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('Supabase RLS 보안 정책으로 인해 성도 삭제가 차단되었습니다 (0 rows deleted).\n\nSupabase [SQL Editor]에서 members RLS 정책 SQL을 실행해 주세요!');
        }
      }

      // 로컬 스토리지 정리
      try {
        const keysToRemove = [
          `charles_user_${uid}_progress`,
          `charles_user_${uid}_daily_counts`,
          `charles_user_${uid}_history`,
          `charles_user_${uid}_stage`,
          `charles_user_${uid}_streak`,
          `charles_user_${uid}_talents`,
          `charles_user_${uid}_talents_updated_at`,
          `charles_user_${uid}_equipped`,
          `charles_user_${uid}_inventory`,
          `charles_user_${uid}_quest_claims`
        ];
        keysToRemove.forEach(k => localStorage.removeItem(k));

        const localList = AuthService.getAllUsersLocal().filter(u => u.id !== uid);
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEY_ALL_USERS, JSON.stringify(localList));
      } catch (e) {}

      // 목록에서 제외
      this.allUsers = this.allUsers.filter(u => u.id !== uid);
      delete this.stateMap[uid];

      this.closeModal('modal-member');
      RetroAudio.success();
      this.showToast(`🗑️ [${userName}] 성도 계정이 삭제되었습니다.`, 'info');
      this.populateCellFilterOptions();
      this.renderFilteredTable();
    } catch (err) {
      console.error('성도 삭제 실패:', err);
      RetroAudio.error();
      alert('성도 삭제 중 오류가 발생했습니다: ' + (err.message || err));
    } finally {
      delBtn.disabled = false;
      delBtn.textContent = '🗑️ 이 성도 계정 영구 삭제';
    }
  },

  // ==================== 8. 📢 유저 공지사항 & 1:1 메시지 발송 센터 ====================
  bindMessageEvents() {
    // 1) 발송 대상 라디오 전환 (전체 공지 vs 1:1 쪽지)
    const radioTargets = document.querySelectorAll('input[name="msg-target-type"]');
    const groupTargetUser = document.getElementById('group-target-user-select');
    const labelAll = document.getElementById('label-msg-type-all');
    const labelUser = document.getElementById('label-msg-type-user');

    radioTargets.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'ALL') {
          if (groupTargetUser) groupTargetUser.style.display = 'none';
          if (labelAll) labelAll.classList.add('active');
          if (labelUser) labelUser.classList.remove('active');
        } else {
          if (groupTargetUser) groupTargetUser.style.display = 'block';
          if (labelUser) labelUser.classList.add('active');
          if (labelAll) labelAll.classList.remove('active');
        }
      });
    });

    // 2) 메인 메시지 발송 폼 제출
    const formMsg = document.getElementById('form-send-admin-message');
    if (formMsg) {
      formMsg.addEventListener('submit', (e) => this.handleSendAdminMessage(e));
    }

    // 3) 발송 내역 새로고침 버튼
    const refreshMsgBtn = document.getElementById('btn-refresh-messages');
    if (refreshMsgBtn) {
      refreshMsgBtn.addEventListener('click', () => {
        RetroAudio.click();
        this.loadSentMessages();
      });
    }

    // 4) 빠른 1:1 쪽지 모달 발송 버튼
    const sendDirectBtn = document.getElementById('btn-send-direct-message');
    if (sendDirectBtn) {
      sendDirectBtn.addEventListener('click', () => this.handleSendDirectMessage());
    }
  },

  // 발송 대상 성도 드롭다운 목록 채우기
  populateMessageTargetUserOptions() {
    const select = document.getElementById('select-msg-target-user');
    if (!select) return;

    const currentVal = select.value;
    const sorted = [...this.allUsers].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko'));

    let html = '<option value="">성도를 선택하세요...</option>';
    sorted.forEach(u => {
      html += `<option value="${u.id}">${u.name} (${u.id}) - ${u.cell || '미지정'}</option>`;
    });

    select.innerHTML = html;
    if (currentVal) select.value = currentVal;
  },

  // 특정 성도에게 보내는 1:1 쪽지 모달 열기 (성도 명부 행의 [💌 쪽지] 클릭 시)
  openDirectMessageModal(uid) {
    const user = this.allUsers.find(u => u.id === uid);
    const userName = user ? user.name : uid;
    const cellName = user && user.cell ? user.cell : '미지정';

    const inputUid = document.getElementById('input-direct-msg-user-id');
    const dispName = document.getElementById('modal-direct-msg-user-name');
    const dispId = document.getElementById('modal-direct-msg-user-id');
    const inputTitle = document.getElementById('input-direct-msg-title');
    const inputSender = document.getElementById('input-direct-msg-sender');
    const inputContent = document.getElementById('input-direct-msg-content');

    if (inputUid) inputUid.value = uid;
    if (dispName) dispName.textContent = `${userName} 성도님`;
    if (dispId) dispId.textContent = `@${uid} · 소속: ${cellName}`;
    if (inputTitle) inputTitle.value = `[어린양의 메세지] ${userName} 성도님, 오늘 통독도 응원합니다!`;
    if (inputSender) inputSender.value = '운영자';
    if (inputContent) {
      inputContent.value = '';
      setTimeout(() => inputContent.focus(), 100);
    }

    this.openModal('modal-direct-message');
  },

  // 메인 폼 메시지 발송 처리 (전체 공지 or 1:1 쪽지)
  async handleSendAdminMessage(e) {
    e.preventDefault();

    const targetTypeRadio = document.querySelector('input[name="msg-target-type"]:checked');
    const targetType = targetTypeRadio ? targetTypeRadio.value : 'ALL';
    const targetUserSelect = document.getElementById('select-msg-target-user');
    const targetUserId = targetType === 'USER' ? (targetUserSelect ? targetUserSelect.value : '') : null;

    if (targetType === 'USER' && !targetUserId) {
      alert('어린양의 메세지를 받을 성도를 선택해 주세요!');
      if (targetUserSelect) targetUserSelect.focus();
      return;
    }

    const titleInput = document.getElementById('input-msg-title');
    const senderInput = document.getElementById('input-msg-sender');
    const contentInput = document.getElementById('input-msg-content');
    const submitBtn = document.getElementById('btn-submit-message');

    const title = (titleInput ? titleInput.value : '').trim();
    const sender = (senderInput ? senderInput.value : '').trim() || '운영자';
    const content = (contentInput ? contentInput.value : '').trim();

    if (!title || !content) {
      alert('제목과 본문 내용을 모두 입력해 주세요.');
      return;
    }

    const userObj = targetType === 'USER' ? this.allUsers.find(u => u.id === targetUserId) : null;
    const targetName = userObj ? `${userObj.name}(${userObj.id})` : targetUserId;
    const targetDesc = targetType === 'ALL' ? '📢 전체 유저' : `💌 ${targetName} 성도님 (어린양의 메세지)`;

    if (!confirm(`[${targetDesc}] 에게 메시지를 발송하시겠습니까?\n\n제목: ${title}`)) {
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ 발송 중...';

    try {
      let isSentToCloud = false;

      if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        const { data, error } = await supabaseClient
          .from('admin_messages')
          .insert([{
            target_type: targetType,
            target_user_id: targetUserId,
            title: title,
            sender_name: sender,
            content: content
          }])
          .select();

        if (error) {
          if (error.code === '42P01' || (error.message && error.message.includes('relation "admin_messages" does not exist'))) {
            throw new Error('Supabase에 admin_messages 테이블이 아직 생성되지 않았습니다.\n\n하단의 4번 [SQL 쿼리 복사하기] 버튼을 누르고 Supabase [SQL Editor]에서 실행해 주세요!');
          }
          throw error;
        }

        if (data && data.length > 0) {
          isSentToCloud = true;
        }
      }

      // 로컬 스토리지에도 최근 발송 내역 백업
      this.saveLocalSentMessage({
        id: 'local_' + Date.now(),
        target_type: targetType,
        target_user_id: targetUserId,
        title: title,
        sender_name: sender,
        content: content,
        created_at: new Date().toISOString()
      });

      RetroAudio.success();
      this.showToast(`🚀 [${targetDesc}] 에게 메시지가 발송되었습니다!`, 'success');

      // 입력란 초기화
      if (titleInput) titleInput.value = '';
      if (contentInput) contentInput.value = '';

      // 발송 내역 갱신
      this.loadSentMessages();
    } catch (err) {
      console.error('메시지 발송 오류:', err);
      RetroAudio.error();
      alert('메시지 발송 실패:\n\n' + (err.message || err));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '🚀 메시지 발송하기';
    }
  },

  // 빠른 1:1 쪽지(어린양의 메세지) 모달 발송 처리
  async handleSendDirectMessage() {
    const uid = document.getElementById('input-direct-msg-user-id').value;
    const title = (document.getElementById('input-direct-msg-title').value || '').trim();
    const sender = (document.getElementById('input-direct-msg-sender').value || '').trim() || '운영자';
    const content = (document.getElementById('input-direct-msg-content').value || '').trim();

    if (!uid) {
      alert('대상 성도 정보가 올바르지 않습니다.');
      return;
    }
    if (!title || !content) {
      alert('메세지 제목과 본문을 모두 입력해 주세요.');
      return;
    }

    const user = this.allUsers.find(u => u.id === uid);
    const userName = user ? user.name : uid;

    const btn = document.getElementById('btn-send-direct-message');
    btn.disabled = true;
    btn.textContent = '⏳ 메세지 발송 중...';

    try {
      if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        const { data, error } = await supabaseClient
          .from('admin_messages')
          .insert([{
            target_type: 'USER',
            target_user_id: uid,
            title: title,
            sender_name: sender,
            content: content
          }])
          .select();

        if (error) {
          if (error.code === '42P01' || (error.message && error.message.includes('relation "admin_messages" does not exist'))) {
            throw new Error('Supabase에 admin_messages 테이블이 아직 생성되지 않았습니다.\n\n하단의 4번 [SQL 쿼리 복사하기] 버튼을 누르고 Supabase [SQL Editor]에서 실행해 주세요!');
          }
          throw error;
        }
      }

      this.saveLocalSentMessage({
        id: 'local_' + Date.now(),
        target_type: 'USER',
        target_user_id: uid,
        title: title,
        sender_name: sender,
        content: content,
        created_at: new Date().toISOString()
      });

      this.closeModal('modal-direct-message');
      RetroAudio.success();
      this.showToast(`💌 [${userName}] 성도님께 어린양의 메세지가 발송되었습니다!`, 'success');

      this.loadSentMessages();
    } catch (err) {
      console.error('어린양의 메세지 발송 실패:', err);
      RetroAudio.error();
      alert('어린양의 메세지 발송 실패:\n\n' + (err.message || err));
    } finally {
      btn.disabled = false;
      btn.textContent = '💌 어린양의 메세지 발송하기';
    }
  },

  // 로컬 백업 저장
  saveLocalSentMessage(msg) {
    try {
      const saved = JSON.parse(localStorage.getItem('charles_admin_sent_messages') || '[]');
      saved.unshift(msg);
      localStorage.setItem('charles_admin_sent_messages', JSON.stringify(saved.slice(0, 50)));
    } catch (e) {}
  },

  // 최근 발송된 메시지 목록 조회 및 렌더링
  async loadSentMessages() {
    const listEl = document.getElementById('admin-sent-messages-list');
    const countEl = document.getElementById('count-sent-messages');
    if (!listEl) return;

    listEl.innerHTML = '<div style="text-align: center; color: #888; padding: 20px; font-size: 13px;">발송 내역을 불러오는 중...</div>';

    let messages = [];
    let isCloudLoaded = false;

    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('admin_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && Array.isArray(data)) {
          messages = data;
          isCloudLoaded = true;
        } else if (error) {
          console.warn('Supabase admin_messages 조회 실패:', error);
        }
      } catch (err) {
        console.warn('Supabase admin_messages fetch error:', err);
      }
    }

    if (!isCloudLoaded || messages.length === 0) {
      try {
        const localSaved = JSON.parse(localStorage.getItem('charles_admin_sent_messages') || '[]');
        if (messages.length === 0) {
          messages = localSaved;
        }
      } catch (e) {}
    }

    if (countEl) countEl.textContent = messages.length;

    if (messages.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; color: #888; padding: 24px; font-size: 13px; background: #FFF; border: 1px dashed #DDD; border-radius: 6px;">
          아직 발송된 공지사항 또는 1:1 메시지가 없습니다.<br>
          <span style="font-size: 11px; color: #AAA;">(위 폼에서 메시지를 작성해 발송해 보세요!)</span>
        </div>
      `;
      return;
    }

    listEl.innerHTML = messages.map(msg => {
      const isAll = msg.target_type === 'ALL';
      let targetBadge = '';
      if (isAll) {
        targetBadge = '<span class="msg-badge-all">📢 전체 공지</span>';
      } else {
        const u = this.allUsers.find(user => user.id === msg.target_user_id);
        const name = u ? `${u.name}(${u.id})` : (msg.target_user_id || '성도');
        targetBadge = `<span class="msg-badge-user">💌 어린양의 메세지 · ${name}</span>`;
      }

      const dateStr = msg.created_at ? new Date(msg.created_at).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : '-';

      const safeContent = (msg.content || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');

      return `
        <div class="sent-msg-item" data-msg-id="${msg.id}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              ${targetBadge}
              <span style="font-size: 12px; font-weight: 700; color: #333;">보낸이: ${msg.sender_name || '운영자'}</span>
              <span style="font-size: 11px; color: #888;">${dateStr}</span>
            </div>
            <button type="button" class="admin-btn admin-btn-sm admin-btn-danger btn-delete-msg" data-msg-id="${msg.id}" style="padding: 3px 8px; font-size: 11px;">
              🗑️ 삭제
            </button>
          </div>
          <div style="font-weight: 700; font-size: 14px; color: #111; margin-bottom: 4px;">
            ${msg.title || '(제목 없음)'}
          </div>
          <div style="font-size: 13px; color: #444; line-height: 1.5; background: #FAFAFA; padding: 8px 10px; border-radius: 4px; border: 1px solid #EAEAEA;">
            ${safeContent}
          </div>
        </div>
      `;
    }).join('');

    // 삭제 버튼 이벤트 바인딩
    listEl.querySelectorAll('.btn-delete-msg').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.msgId;
        this.handleDeleteMessage(id);
      });
    });
  },

  // 발송된 메시지 삭제 처리
  async handleDeleteMessage(msgId) {
    if (!confirm('정말 이 메시지를 삭제하시겠습니까?\n\n삭제 시 성도 앱에서도 즉시 제거됩니다.')) {
      return;
    }

    try {
      if (typeof supabaseClient !== 'undefined' && supabaseClient && !msgId.startsWith('local_')) {
        const { error } = await supabaseClient
          .from('admin_messages')
          .delete()
          .eq('id', msgId);

        if (error) throw error;
      }

      // 로컬 스토리지에서도 제거
      try {
        const saved = JSON.parse(localStorage.getItem('charles_admin_sent_messages') || '[]');
        const updated = saved.filter(m => m.id !== msgId);
        localStorage.setItem('charles_admin_sent_messages', JSON.stringify(updated));
      } catch (e) {}

      RetroAudio.success();
      this.showToast('🗑️ 메시지가 삭제되었습니다.', 'info');
      this.loadSentMessages();
    } catch (err) {
      console.error('메시지 삭제 실패:', err);
      RetroAudio.error();
      alert('메시지 삭제 중 오류가 발생했습니다: ' + (err.message || err));
    }
  },

  // ==================== 10. 사용자 주간 현황 & 띠부띠부 관리 ====================

  /**
   * 주차 목록 생성 및 주간 대시보드 컨트롤 초기화
   */
  initWeeklyDashboard() {
    this.buildWeeksList();
    this.populateWeeklySelect();
    this.populateWeeklyCellFilter();
  },

  /**
   * 오늘 날짜 기준으로 과거 6주 ~ 미래 2주의 주차 목록 생성 (월요일 ~ 일요일 기준)
   */
  buildWeeksList() {
    const weeks = [];
    const todayStr = typeof StorageService !== 'undefined' ? StorageService.getTodayString() : new Date().toISOString().slice(0, 10);
    const today = new Date(todayStr + 'T00:00:00');

    // 오늘이 속한 주의 월요일 구하기 (0: 일, 1: 월, ..., 6: 토)
    const dayOfWeek = today.getDay();
    const diffToMon = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
    const currentMon = new Date(today);
    currentMon.setDate(today.getDate() + diffToMon);

    // 미래 2주부터 과거 6주까지 (최신/미래 주차부터 역순으로 정렬하여 드롭다운에 배치)
    for (let w = 2; w >= -6; w--) {
      const mon = new Date(currentMon);
      mon.setDate(currentMon.getDate() + (w * 7));

      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);

      // 목요일(월+3일)의 년월을 기준으로 주차 번호 결정 (ISO 8601 표준)
      const thu = new Date(mon);
      thu.setDate(mon.getDate() + 3);
      const thuYear = thu.getFullYear();
      const thuMonth = thu.getMonth() + 1;
      const thuDate = thu.getDate();
      const weekNum = Math.ceil(thuDate / 7);

      const monStr = mon.toISOString().slice(0, 10);
      const sunStr = sun.toISOString().slice(0, 10);

      const monShort = `${String(mon.getMonth() + 1).padStart(2, '0')}.${String(mon.getDate()).padStart(2, '0')}`;
      const sunShort = `${String(sun.getMonth() + 1).padStart(2, '0')}.${String(sun.getDate()).padStart(2, '0')}`;

      // 요일별 일자 배열 생성 (월~일)
      const days = [];
      const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
      for (let d = 0; d < 7; d++) {
        const dObj = new Date(mon);
        dObj.setDate(mon.getDate() + d);
        const dStr = dObj.toISOString().slice(0, 10);
        days.push({
          dayName: dayNames[d],
          dateStr: dStr,
          monthDay: `${dObj.getMonth() + 1}/${dObj.getDate()}`,
          isWeekday: d < 5
        });
      }

      const isCurrentWeek = (todayStr >= monStr && todayStr <= sunStr);
      const label = `${thuMonth}월 ${weekNum}주차 (${monShort} ~ ${sunShort})${isCurrentWeek ? ' 🌟[현재 주]' : ''}`;
      const shortLabel = `${thuMonth}월 ${weekNum}주차`;

      weeks.push({
        label,
        shortLabel,
        year: thuYear,
        month: thuMonth,
        weekNum,
        monStr,
        sunStr,
        days,
        isCurrentWeek
      });
    }

    this.weeksList = weeks;

    // 초기 선택: 현재 주차를 우선 선택
    if (this.selectedWeekIndex === -1 || this.selectedWeekIndex >= weeks.length) {
      const curIdx = weeks.findIndex(w => w.isCurrentWeek);
      this.selectedWeekIndex = curIdx !== -1 ? curIdx : 0;
    }
  },

  /**
   * 주차 선택 드롭다운 채우기
   */
  populateWeeklySelect() {
    const select = document.getElementById('weekly-select-week');
    if (!select || !this.weeksList || this.weeksList.length === 0) return;

    select.innerHTML = this.weeksList.map((w, idx) => `
      <option value="${idx}" ${idx === this.selectedWeekIndex ? 'selected' : ''}>
        ${w.label}
      </option>
    `).join('');

    select.value = String(this.selectedWeekIndex);
  },

  /**
   * 주간 현황용 셀 필터 드롭다운 채우기
   */
  populateWeeklyCellFilter() {
    const cellFilter = document.getElementById('weekly-filter-cell');
    if (!cellFilter) return;

    const currentVal = this.weeklySelectedCell;
    const cells = new Set();
    this.allUsers.forEach(u => {
      if (u.cell && u.cell !== '미지정') cells.add(u.cell);
    });

    const sortedCells = Array.from(cells).sort();
    let optionsHtml = `<option value="ALL">전체 셀 (${this.allUsers.length}명)</option>`;
    sortedCells.forEach(cell => {
      const count = this.allUsers.filter(u => u.cell === cell).length;
      optionsHtml += `<option value="${cell}">${cell} (${count}명)</option>`;
    });

    cellFilter.innerHTML = optionsHtml;
    cellFilter.value = cells.has(currentVal) ? currentVal : 'ALL';
    this.weeklySelectedCell = cellFilter.value;
  },

  /**
   * 사용자 주간 현황 테이블 및 띠부띠부 판정 렌더링
   */
  renderWeeklyDashboard() {
    if (!this.weeksList || this.weeksList.length === 0) {
      this.buildWeeksList();
    }

    const curWeek = this.weeksList[this.selectedWeekIndex];
    if (!curWeek) return;

    const todayStr = typeof StorageService !== 'undefined' ? StorageService.getTodayString() : new Date().toISOString().slice(0, 10);

    // 테이블 헤더 요일별 날짜 표기 최신화
    const dayIds = ['th-day-mon', 'th-day-tue', 'th-day-wed', 'th-day-thu', 'th-day-fri'];
    dayIds.forEach((id, idx) => {
      const th = document.getElementById(id);
      if (th && curWeek.days[idx]) {
        th.innerHTML = `${curWeek.days[idx].dayName}<br><span style="font-size: 10px; font-weight: 500; color: #666;">${curWeek.days[idx].monthDay}</span>`;
      }
    });

    const thWeekend = document.getElementById('th-day-sat-sun');
    if (thWeekend && curWeek.days[5] && curWeek.days[6]) {
      thWeekend.innerHTML = `토/일<br><span style="font-size: 10px; font-weight: 500; color: #666;">${curWeek.days[5].monthDay}~${curWeek.days[6].monthDay.split('/')[1]}</span>`;
    }

    // 각 성도별 주간 통독 데이터 분석 및 띠부띠부 판정
    const userStats = this.allUsers.map(u => {
      const st = this.stateMap[u.id] || {};
      const dc = st.dailyCounts || {};

      // 월~금 요일별 통독 장수
      const weekdayCounts = curWeek.days.slice(0, 5).map(d => {
        const count = dc[d.dateStr] || 0;
        const isPastOrToday = d.dateStr <= todayStr;
        const isToday = d.dateStr === todayStr;
        return {
          dayName: d.dayName,
          dateStr: d.dateStr,
          count,
          isPastOrToday,
          isToday
        };
      });

      // 주말(토/일) 통독 장수
      const satCount = dc[curWeek.days[5].dateStr] || 0;
      const sunCount = dc[curWeek.days[6].dateStr] || 0;
      const weekendCount = satCount + sunCount;

      const weekdayTotal = weekdayCounts.reduce((acc, cur) => acc + cur.count, 0);
      const weekTotal = weekdayTotal + weekendCount;

      // 월~금 중 3장 이상 달성한 일수
      const qualifyingDays = weekdayCounts.filter(w => w.count >= 3).length;

      // 🎁 띠부띠부 핵심 판정: 월~금 5일 모두 매일 3장 이상 읽었는가?
      const isTtibu = weekdayCounts.every(w => w.count >= 3);

      // 현재 진행 중인 주차의 경우, 오늘까지 지난 평일 모두 3장 이상 읽으며 도전 순항 중인가?
      let isTtibuInProgress = false;
      let isTtibuFailed = false;

      if (curWeek.isCurrentWeek) {
        const elapsedWeekdays = weekdayCounts.filter(w => w.isPastOrToday);
        const allElapsedAchieved = elapsedWeekdays.length > 0 && elapsedWeekdays.every(w => w.count >= 3);

        if (isTtibu) {
          isTtibuInProgress = false;
        } else if (allElapsedAchieved) {
          isTtibuInProgress = true;
        } else {
          isTtibuFailed = true;
        }
      } else {
        if (!isTtibu) isTtibuFailed = true;
      }

      // 정렬 스코어: "띠부띠부를 받을 수 있는 사람을 차트 상위로 올려줘"
      // 1순위: 띠부띠부 완전 달성자 (1,000,000점 + 총장수)
      // 2순위: 현재 주차 띠부 순항 진행자 (500,000점 + 달성일수*1000 + 총장수)
      // 3순위: 일반 성도 (달성일수*1000 + 총장수)
      let sortScore = 0;
      if (isTtibu) {
        sortScore = 1000000 + weekTotal;
      } else if (isTtibuInProgress) {
        sortScore = 500000 + (qualifyingDays * 1000) + weekTotal;
      } else {
        sortScore = (qualifyingDays * 1000) + weekTotal;
      }

      return {
        user: u,
        weekdayCounts,
        weekendCount,
        weekTotal,
        qualifyingDays,
        isTtibu,
        isTtibuInProgress,
        isTtibuFailed,
        sortScore
      };
    });

    // 1) 필터링
    let filtered = userStats;

    if (this.weeklySelectedCell && this.weeklySelectedCell !== 'ALL') {
      filtered = filtered.filter(item => item.user.cell === this.weeklySelectedCell);
    }

    if (this.weeklyOnlyTtibu) {
      filtered = filtered.filter(item => item.isTtibu || item.isTtibuInProgress);
    }

    // 2) 정렬: 띠부띠부 대상자 최상위 우선 정렬
    filtered.sort((a, b) => {
      if (b.sortScore !== a.sortScore) {
        return b.sortScore - a.sortScore;
      }
      if (b.weekTotal !== a.weekTotal) {
        return b.weekTotal - a.weekTotal;
      }
      return (a.user.name || '').localeCompare(b.user.name || '', 'ko');
    });

    // 3) KPI 통계 카드 계산 및 반영
    const eligibleCount = userStats.filter(s => s.isTtibu || (curWeek.isCurrentWeek && s.isTtibuInProgress)).length;
    const confirmedCount = userStats.filter(s => s.isTtibu).length;
    const totalChapters = userStats.reduce((acc, cur) => acc + cur.weekTotal, 0);
    const activeUsers = userStats.filter(s => s.weekTotal > 0).length;
    const avgChapters = activeUsers > 0 ? (totalChapters / activeUsers).toFixed(1) : '0.0';

    const kpiTtibuCount = document.getElementById('weekly-kpi-ttibu-count');
    const kpiTtibuSub = document.getElementById('weekly-kpi-ttibu-sub');
    const badgeTtibuHeader = document.getElementById('badge-weekly-ttibu-count');
    const kpiTotalChapters = document.getElementById('weekly-kpi-total-chapters');
    const kpiActiveUsers = document.getElementById('weekly-kpi-active-users');
    const kpiAvgChapters = document.getElementById('weekly-kpi-avg-chapters');

    if (kpiTtibuCount) {
      if (curWeek.isCurrentWeek) {
        kpiTtibuCount.textContent = `${eligibleCount}명`;
        if (kpiTtibuSub) kpiTtibuSub.textContent = `확정 ${confirmedCount}명 / 순항 ${eligibleCount - confirmedCount}명`;
      } else {
        kpiTtibuCount.textContent = `${confirmedCount}명`;
        if (kpiTtibuSub) kpiTtibuSub.textContent = `월~금 매일 3장+ 완주`;
      }
    }

    if (badgeTtibuHeader) {
      badgeTtibuHeader.textContent = curWeek.isCurrentWeek
        ? `🎁 띠부띠부 대상/후보: ${eligibleCount}명`
        : `🎁 띠부띠부 확정: ${confirmedCount}명`;
    }

    if (kpiTotalChapters) kpiTotalChapters.textContent = `${totalChapters.toLocaleString()}장`;
    if (kpiActiveUsers) kpiActiveUsers.textContent = `${activeUsers}명 / ${this.allUsers.length}명`;
    if (kpiAvgChapters) kpiAvgChapters.textContent = `${avgChapters}장`;

    // 4) 테이블 렌더링
    const tbody = document.getElementById('weekly-user-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" style="text-align: center; color: #888; padding: 30px;">
            ${this.weeklyOnlyTtibu ? '🎁 선택한 주차에 띠부띠부 대상자가 없습니다.' : '표시할 주간 데이터가 없습니다.'}
          </td>
        </tr>
      `;
      return;
    }

    // 주간 차트 게이지용 최대 통독 장수
    const maxChapters = Math.max(1, ...userStats.map(s => s.weekTotal));

    tbody.innerHTML = filtered.map((item, idx) => {
      const u = item.user;
      const isWinner = item.isTtibu;
      const isProgress = item.isTtibuInProgress;

      // 주간 통독 게이지 바 너비 (%)
      const barPercent = Math.min(100, Math.round((item.weekTotal / maxChapters) * 100));

      // 요일별 칩 HTML
      const daysHtml = item.weekdayCounts.map(day => {
        if (day.count >= 3) {
          return `<td><span class="day-chip day-chip-success" title="${day.dateStr} (${day.count}장 통독)">${day.count}장</span></td>`;
        } else if (day.count > 0) {
          return `<td><span class="day-chip day-chip-partial" title="${day.dateStr} (${day.count}장 통독)">${day.count}장</span></td>`;
        } else if (!day.isPastOrToday) {
          return `<td><span class="day-chip day-chip-future" title="${day.dateStr} (예정)">-</span></td>`;
        } else {
          return `<td><span class="day-chip day-chip-empty" title="${day.dateStr} (0장)">-</span></td>`;
        }
      }).join('');

      // 주말(토/일) 칩 HTML
      const weekendHtml = item.weekendCount > 0
        ? `<td><span class="day-chip day-chip-partial" style="font-weight: 800;">${item.weekendCount}장</span></td>`
        : `<td><span class="day-chip day-chip-empty">-</span></td>`;

      // 띠부 판정 배지
      let verdictBadge = '';
      if (isWinner) {
        verdictBadge = `<span class="badge-ttibu">🎁 띠부 달성!</span>`;
      } else if (isProgress) {
        verdictBadge = `<span class="badge-ttibu-progress">🔥 순항 (${item.qualifyingDays}/5일)</span>`;
      } else {
        verdictBadge = `<span class="badge-ttibu-missed">${item.qualifyingDays}/5일 달성</span>`;
      }

      // 성도 이름 옆 띠부띠부 태그
      let nameTtibuTag = '';
      if (isWinner) {
        nameTtibuTag = `<span class="badge-ttibu" style="margin-left: 6px; font-size: 10px; padding: 2px 6px;">🎁 띠부띠부!</span>`;
      } else if (isProgress) {
        nameTtibuTag = `<span class="badge-ttibu-progress" style="margin-left: 6px; font-size: 10px;">🔥 순항중</span>`;
      }

      return `
        <tr class="${isWinner ? 'row-ttibu-winner' : ''}">
          <td style="text-align: center; font-weight: 700; color: ${idx < 3 ? '#E65100' : '#888'};">
            ${idx + 1}
          </td>
          <td>
            <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 2px;">
              <strong>${u.name}</strong>
              ${nameTtibuTag}
              <span style="font-size: 11px; color: #888; margin-left: 2px;">(${u.nickname || u.name})</span>
            </div>
          </td>
          <td><span class="cell-badge">${u.cell || '미지정'}</span></td>
          <td>
            <div class="weekly-bar-container">
              <span style="font-weight: 800; font-size: 13px; color: ${item.weekTotal > 0 ? '#111' : '#999'}; min-width: 32px;">
                ${item.weekTotal}장
              </span>
              <div class="weekly-bar-track">
                <div class="weekly-bar-fill ${isWinner ? 'weekly-bar-fill-gold' : ''}" style="width: ${barPercent}%;"></div>
              </div>
            </div>
          </td>
          ${daysHtml}
          ${weekendHtml}
          <td style="text-align: center;">${verdictBadge}</td>
        </tr>
      `;
    }).join('');
  },

  /**
   * 띠부띠부 달성자 명단 카카오톡 공지용 클립보드 복사
   */
  copyTtibuWinnersList() {
    if (!this.weeksList || this.weeksList.length === 0) return;
    const curWeek = this.weeksList[this.selectedWeekIndex];
    if (!curWeek) return;

    const todayStr = typeof StorageService !== 'undefined' ? StorageService.getTodayString() : new Date().toISOString().slice(0, 10);

    const winners = [];
    const inProgress = [];

    this.allUsers.forEach(u => {
      const st = this.stateMap[u.id] || {};
      const dc = st.dailyCounts || {};

      const weekdayCounts = curWeek.days.slice(0, 5).map(d => ({
        dayName: d.dayName,
        dateStr: d.dateStr,
        count: dc[d.dateStr] || 0,
        isPastOrToday: d.dateStr <= todayStr
      }));

      const satCount = dc[curWeek.days[5].dateStr] || 0;
      const sunCount = dc[curWeek.days[6].dateStr] || 0;
      const weekTotal = weekdayCounts.reduce((acc, c) => acc + c.count, 0) + satCount + sunCount;
      const qualifyingDays = weekdayCounts.filter(w => w.count >= 3).length;

      const isTtibu = weekdayCounts.every(w => w.count >= 3);

      if (isTtibu) {
        winners.push({ user: u, weekTotal, qualifyingDays });
      } else if (curWeek.isCurrentWeek) {
        const elapsed = weekdayCounts.filter(w => w.isPastOrToday);
        if (elapsed.length > 0 && elapsed.every(w => w.count >= 3)) {
          inProgress.push({ user: u, weekTotal, qualifyingDays });
        }
      }
    });

    // 정렬 (총 통독 장수 많은 순)
    winners.sort((a, b) => b.weekTotal - a.weekTotal);
    inProgress.sort((a, b) => b.weekTotal - a.weekTotal);

    let text = `[🎁 서원경 청년부 주간 말씀통독 - ${curWeek.shortLabel} 띠부띠부 명단]\n`;
    text += `📅 기간: ${curWeek.days[0].monthDay}(월) ~ ${curWeek.days[4].monthDay}(금) (매일 3장 이상)\n\n`;

    if (winners.length > 0) {
      text += `✨ [ 🎁 띠부띠부 달성자 (${winners.length}명) ] ✨\n`;
      winners.forEach((w, i) => {
        text += `${i + 1}. ${w.user.name} 성도 (${w.user.cell || '청년부'}) - 주간 ${w.weekTotal}장 완주\n`;
      });
      text += '\n축하드립니다! 담당 임원에게 띠부띠부 스티커를 수령하세요! 🐑🎉\n';
    } else {
      text += `아직 띠부띠부 완주자가 집계되지 않았습니다.\n`;
    }

    if (curWeek.isCurrentWeek && inProgress.length > 0) {
      text += `\n🔥 [ 띠부띠부 도전 순항중 (${inProgress.length}명) ]\n`;
      inProgress.forEach((p, i) => {
        text += `- ${p.user.name} (${p.qualifyingDays}/5일 연속 3장 달성 중, 주간 ${p.weekTotal}장)\n`;
      });
      text += '끝까지 완주하여 띠부띠부의 주인공이 되어보세요! 🌿\n';
    }

    navigator.clipboard.writeText(text).then(() => {
      RetroAudio.success();
      this.showToast(`📋 ${curWeek.shortLabel} 띠부띠부 명단이 클립보드에 복사되었습니다!`, 'success');
    }).catch(err => {
      console.error('클립보드 복사 오류:', err);
      RetroAudio.error();
      alert('복사에 실패했습니다. 브라우저 권한을 확인해주세요.');
    });
  }
};

