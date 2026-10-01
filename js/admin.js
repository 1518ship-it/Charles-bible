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

  init() {
    this.checkAdminAuth();
    this.bindEvents();
    this.bindModalEvents();
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
          this.showToast(`가입코드가 [${newKeyInput.value}] 로 변경되었습니다.`, 'success');
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
          this.showToast(`관리자 코드가 [${newKeyInput.value}] 로 변경되었습니다.`, 'success');
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

    // 4) 찰스 시뮬레이션 버튼들
    document.querySelectorAll('.btn-sim-stage').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetStage = parseInt(btn.dataset.stage, 10);
        this.simulateStage(targetStage);
      });
    });

    // 5) 전체 통독 리셋
    const clearProgBtn = document.getElementById('btn-admin-clear-progress');
    if (clearProgBtn) {
      clearProgBtn.addEventListener('click', () => {
        if (confirm('현재 기기의 모든 통독 진행 데이터를 로컬 초기화하시겠습니까?')) {
          StorageService.resetAll();
          RetroAudio.click();
          this.showToast('통독 데이터가 로컬 초기화되었습니다.', 'info');
          this.refreshDashboard();
        }
      });
    }

    // 6) SQL 쿼리 복사 버튼
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

    // 성도 목록 테이블 렌더링
    this.renderFilteredTable();

    // 4) 인스턴스 통독 요약
    const stats = StorageService.getStats();
    const stage = StorageService.getCharlesStage();
    const sumEl = document.getElementById('admin-stats-summary');
    if (sumEl) {
      sumEl.innerHTML = `
        현재 인스턴스 통독 진행: <strong>${stats.totalRead} / ${stats.totalChapters} 장 (${stats.percent}%)</strong><br>
        현재 찰스 상태: <strong>${CHARLES_STAGES[stage].title} (${CHARLES_STAGES[stage].badge})</strong>
      `;
    }
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

  // ==================== 8. 찰스 단계 시뮬레이션 ====================
  simulateStage(stage) {
    if (stage === 1) {
      StorageService.resetAll();
    } else if (stage === 2) {
      StorageService.resetAll();
      for (let i = 1; i <= 10; i++) StorageService.toggleChapter('GEN', i);
    } else if (stage === 3) {
      StorageService.resetAll();
      for (const b of BIBLE_BOOKS.slice(0, 10)) {
        StorageService.toggleBookAll(b.id, b.chapters, true);
      }
    } else if (stage === 4) {
      StorageService.resetAll();
      for (const b of BIBLE_BOOKS.filter(x => x.testament === 'OT')) {
        StorageService.toggleBookAll(b.id, b.chapters, true);
      }
    } else if (stage === 5) {
      for (const b of BIBLE_BOOKS) {
        StorageService.toggleBookAll(b.id, b.chapters, true);
      }
    }

    RetroAudio.success();
    this.showToast(`찰스를 [단계 ${stage}] 상태로 시뮬레이션 설정했습니다! 메인 앱에서 확인하세요.`, 'success');
    this.refreshDashboard();
  }
};
