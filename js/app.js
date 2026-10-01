/**
 * Charles' Bible - 메인 애플리케이션 제어 로직 (App Controller with In-App Bible Reader)
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  activeTab: 'home',
  currentTestament: 'NT', // 이번 테스트 버전 기본 신약
  searchKeyword: '',
  
  // 성경 본문 읽기 상태
  currentReadingBookId: 'MAT', // 기본 신약(마태복음)
  currentReadingChapter: 1,
  readerFontSize: 16,
  hasAutoMarkedThisSession: false,

  // 내 정보 달력 상태
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth() + 1,
  selectedDateStr: null,

  async init() {
    this.selectedDateStr = StorageService.getTodayDateStr();
    this.initAuth();
    this.loadSavedFontSize();
    this.bindEvents();
    this.applySavedTheme();
    this.renderAll();
    this.updateUnreadNotificationDot();

    // ☁️ 이미 로그인된 사용자의 경우 Supabase에서 최신 통독 진행도 및 오늘 읽은 장수 실시간 동기화
    if (AuthService.isAuthenticated()) {
      try {
        const synced = await StorageService.syncFromCloud();
        if (synced) {
          this.renderAll();
          console.log('☁️ [초기화] Supabase로부터 최신 통독 진행도 및 오늘 읽은 장수가 동기화되었습니다.');
        }
      } catch (err) {
        console.warn('초기 클라우드 동기화 건너뜀 (로컬 스토리지 사용):', err);
      }
    }
  },

  loadSavedFontSize() {
    const saved = localStorage.getItem('charles_reader_font_size');
    if (saved) {
      this.readerFontSize = parseInt(saved, 10) || 16;
      document.documentElement.style.setProperty('--reader-font-size', `${this.readerFontSize}px`);
    }
  },

  // ==================== 인증 및 게이트웨이 (로그인 / 회원가입) ====================
  initAuth() {
    const gateOverlay = document.getElementById('gate-overlay');
    if (!AuthService.isAuthenticated()) {
      gateOverlay.style.display = 'flex';
    } else {
      gateOverlay.style.display = 'none';
    }

    const viewLogin = document.getElementById('gate-view-login');
    const viewSignup = document.getElementById('gate-view-signup');
    const btnSwitchToSignup = document.getElementById('btn-switch-to-signup');
    const btnSwitchToLogin = document.getElementById('btn-switch-to-login');

    const loginForm = document.getElementById('gate-login-form');
    const signupForm = document.getElementById('gate-signup-form');
    const loginErrText = document.getElementById('login-error-text');
    const signupErrText = document.getElementById('signup-error-text');
    const gateModal = document.querySelector('.gate-modal');

    // 로그인 <-> 회원가입 화면 전환
    if (btnSwitchToSignup) {
      btnSwitchToSignup.addEventListener('click', () => {
        if (loginErrText) loginErrText.classList.remove('active');
        if (viewLogin) viewLogin.classList.remove('active');
        if (viewSignup) viewSignup.classList.add('active');
      });
    }

    if (btnSwitchToLogin) {
      btnSwitchToLogin.addEventListener('click', () => {
        if (signupErrText) signupErrText.classList.remove('active');
        if (viewSignup) viewSignup.classList.remove('active');
        if (viewLogin) viewLogin.classList.add('active');
      });
    }

    // 아이디 중복확인 버튼 및 상태 관리
    let isIdChecked = false;
    let checkedIdValue = '';
    const signupIdInput = document.getElementById('signup-id-input');
    const btnCheckDupId = document.getElementById('btn-check-duplicate-id');
    const signupIdMsg = document.getElementById('signup-id-msg');

    if (signupIdInput) {
      signupIdInput.addEventListener('input', () => {
        isIdChecked = false;
        if (signupIdMsg) {
          signupIdMsg.className = 'field-feedback';
          signupIdMsg.textContent = '';
        }
      });
    }

    if (btnCheckDupId) {
      btnCheckDupId.addEventListener('click', async () => {
        const idVal = signupIdInput ? signupIdInput.value.trim() : '';
        btnCheckDupId.disabled = true;
        btnCheckDupId.textContent = '확인중...';
        try {
          const check = await AuthService.checkIdAvailability(idVal);
          if (signupIdMsg) {
            if (check.available) {
              signupIdMsg.className = 'field-feedback success active';
              signupIdMsg.textContent = check.message;
              isIdChecked = true;
              checkedIdValue = idVal;
            } else {
              signupIdMsg.className = 'field-feedback error active';
              signupIdMsg.textContent = check.error;
              isIdChecked = false;
            }
          }
        } finally {
          btnCheckDupId.disabled = false;
          btnCheckDupId.textContent = '중복확인';
        }
      });
    }

    // 닉네임 중복확인 버튼 및 상태 관리
    let isNickChecked = false;
    let checkedNickValue = '';
    const signupNickInput = document.getElementById('signup-nickname-input');
    const btnCheckDupNick = document.getElementById('btn-check-duplicate-nick');
    const signupNickMsg = document.getElementById('signup-nick-msg');

    if (signupNickInput) {
      signupNickInput.addEventListener('input', () => {
        isNickChecked = false;
        if (signupNickMsg) {
          signupNickMsg.className = 'field-feedback';
          signupNickMsg.textContent = '';
        }
      });
    }

    if (btnCheckDupNick) {
      btnCheckDupNick.addEventListener('click', async () => {
        const nickVal = signupNickInput ? signupNickInput.value.trim() : '';
        btnCheckDupNick.disabled = true;
        btnCheckDupNick.textContent = '확인중...';
        try {
          const check = await AuthService.checkNicknameAvailability(nickVal);
          if (signupNickMsg) {
            if (check.available) {
              signupNickMsg.className = 'field-feedback success active';
              signupNickMsg.textContent = check.message;
              isNickChecked = true;
              checkedNickValue = nickVal;
            } else {
              signupNickMsg.className = 'field-feedback error active';
              signupNickMsg.textContent = check.error;
              isNickChecked = false;
            }
          }
        } finally {
          btnCheckDupNick.disabled = false;
          btnCheckDupNick.textContent = '중복확인';
        }
      });
    }

    // 패스워드 8자 이상 실시간 체크
    const signupPwInput = document.getElementById('signup-pw-input');
    const signupPwMsg = document.getElementById('signup-pw-msg');
    if (signupPwInput && signupPwMsg) {
      signupPwInput.addEventListener('input', () => {
        const pwVal = signupPwInput.value;
        if (!pwVal) {
          signupPwMsg.className = 'field-feedback';
          signupPwMsg.textContent = '';
        } else if (pwVal.length < 8) {
          signupPwMsg.className = 'field-feedback error active';
          signupPwMsg.textContent = `패스워드는 8자 이상이어야 합니다. (현재 ${pwVal.length}자)`;
        } else {
          signupPwMsg.className = 'field-feedback success active';
          signupPwMsg.textContent = '✓ 8자 이상 충족되었습니다.';
        }
      });
    }

    // 로그인 폼 제출
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idInput = document.getElementById('login-id-input');
        const pwInput = document.getElementById('login-pw-input');
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = '로그인 중...';
        }

        try {
          const result = await AuthService.login(idInput.value, pwInput.value);
          if (result.success) {
            if (loginErrText) loginErrText.classList.remove('active');
            gateOverlay.style.display = 'none';

            // 로그인 직후 최신 클라우드 통독 데이터 동기화 완료 대기 후 렌더링
            try {
              await StorageService.syncFromCloud(result.user.id);
            } catch (syncErr) {
              console.warn('로그인 클라우드 동기화 경고:', syncErr);
            }

            this.renderAll();
            const callName = AuthService.getUserCallName(result.user);
            this.showToast(`환영합니다, ${callName}!`);
          } else {
            if (loginErrText) {
              loginErrText.textContent = result.error;
              loginErrText.classList.add('active');
            }
            if (gateModal) {
              gateModal.classList.remove('shake');
              void gateModal.offsetWidth;
              gateModal.classList.add('shake');
            }
          }
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '로그인';
          }
        }
      });
    }

    // 회원가입 폼 제출
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idVal = signupIdInput ? signupIdInput.value.trim() : '';
        const pwVal = signupPwInput ? signupPwInput.value : '';
        const cellInput = document.getElementById('signup-cell-input');
        const nameInput = document.getElementById('signup-name-input');
        const nicknameInput = document.getElementById('signup-nickname-input');
        const codeInput = document.getElementById('signup-code-input');
        const submitBtn = signupForm.querySelector('button[type="submit"]');

        // 아이디 중복확인 미수행 체크
        if (!isIdChecked || checkedIdValue !== idVal) {
          const check = await AuthService.checkIdAvailability(idVal);
          if (!check.available) {
            if (signupErrText) {
              signupErrText.textContent = check.error;
              signupErrText.classList.add('active');
            }
            if (gateModal) {
              gateModal.classList.remove('shake');
              void gateModal.offsetWidth;
              gateModal.classList.add('shake');
            }
            return;
          }
        }

        // 닉네임 중복확인 미수행 체크
        const nickVal = nicknameInput ? nicknameInput.value.trim() : '';
        if (!isNickChecked || checkedNickValue !== nickVal) {
          const check = await AuthService.checkNicknameAvailability(nickVal);
          if (!check.available) {
            if (signupErrText) {
              signupErrText.textContent = check.error;
              signupErrText.classList.add('active');
            }
            if (gateModal) {
              gateModal.classList.remove('shake');
              void gateModal.offsetWidth;
              gateModal.classList.add('shake');
            }
            return;
          }
        }

        // 비밀번호 8자 이상 검증
        if (!pwVal || pwVal.length < 8) {
          if (signupErrText) {
            signupErrText.textContent = '패스워드는 8자 이상이어야 합니다.';
            signupErrText.classList.add('active');
          }
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = '회원가입 처리 중...';
        }

        try {
          const result = await AuthService.register({
            id: idVal,
            password: pwVal,
            cell: cellInput ? cellInput.value.trim() : '',
            name: nameInput ? nameInput.value.trim() : '',
            nickname: nicknameInput ? nicknameInput.value.trim() : '',
            signupCode: codeInput ? codeInput.value.trim() : ''
          });

          if (result.success) {
            if (signupErrText) signupErrText.classList.remove('active');
            gateOverlay.style.display = 'none';

            // 신규 가입 시 초기 통독 상태 즉시 Supabase 클라우드에 생성/동기화
            try {
              await StorageService.saveToCloud();
            } catch (saveErr) {
              console.warn('신규 가입 초기 상태 저장 경고:', saveErr);
            }

            this.renderAll();
            const callName = AuthService.getUserCallName(result.user);
            this.showToast(`환영합니다, ${callName}! 가입이 완료되었습니다.`);
          } else {
            if (signupErrText) {
              signupErrText.textContent = result.error;
              signupErrText.classList.add('active');
            }
            if (gateModal) {
              gateModal.classList.remove('shake');
              void gateModal.offsetWidth;
              gateModal.classList.add('shake');
            }
          }
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '회원가입 완료';
          }
        }
      });
    }
  },

  // ==================== 이벤트 바인딩 ====================
  bindEvents() {
    // Supabase 데이터 동기화 완료 이벤트 수신 시 화면 실시간 리렌더링
    window.addEventListener('charles-cloud-synced', () => {
      this.renderHome();
      this.renderBibleList();
      this.renderStats();
      this.renderSocial();
      this.renderProfile();
      this.renderHomeTalents();

      // 모달/창이 열려있는 경우 실시간 상태 반영
      const questModal = document.getElementById('quest-modal-overlay');
      if (questModal && questModal.style.display !== 'none') {
        this.renderQuestsModal();
      }
      const shopView = document.getElementById('talent-shop-view');
      if (shopView && shopView.classList.contains('active')) {
        this.renderTalentShop(this.currentShopTab || 'store');
      }
    });

    // 하단 탭 버튼 클릭
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.closeReader();
        this.closeTalentShop();
        this.switchTab(tab);
      });
    });

    // 상단 오른쪽 메시지 (친구추가 및 알림) 모달 열기/닫기
    const msgBtn = document.getElementById('btn-open-messages');
    const msgOverlay = document.getElementById('message-modal-overlay');
    const msgCloseBtn = document.getElementById('btn-close-messages');

    if (msgBtn && msgOverlay) {
      msgBtn.addEventListener('click', () => {
        msgOverlay.style.display = 'flex';
        this.renderNotifications();
      });
    }

    if (msgCloseBtn && msgOverlay) {
      msgCloseBtn.addEventListener('click', () => {
        msgOverlay.style.display = 'none';
      });
    }

    if (msgOverlay) {
      msgOverlay.addEventListener('click', (e) => {
        if (e.target === msgOverlay) {
          msgOverlay.style.display = 'none';
        }
      });
    }

    // 소식 및 알림 닫기는 msgCloseBtn 및 바깥 클릭으로 처리됨

    // 찰스 육성 가이드 모달 열기/닫기
    const charlesHelpBtn = document.getElementById('btn-charles-help');
    const charlesHelpModal = document.getElementById('charles-help-modal');
    const closeCharlesHelpBtn = document.getElementById('btn-close-charles-help');

    if (charlesHelpBtn && charlesHelpModal) {
      charlesHelpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.renderCharlesEvolutionPreview();
        charlesHelpModal.style.display = 'flex';
      });
    }
    if (closeCharlesHelpBtn && charlesHelpModal) {
      closeCharlesHelpBtn.addEventListener('click', () => {
        charlesHelpModal.style.display = 'none';
      });
    }
    if (charlesHelpModal) {
      charlesHelpModal.addEventListener('click', (e) => {
        if (e.target === charlesHelpModal) {
          charlesHelpModal.style.display = 'none';
        }
      });
    }

    // 환경설정 모달 (내 정보 좌측 상단 톱니바퀴 버튼) 열기/닫기
    const openSettingsBtn = document.getElementById('btn-open-settings');
    const settingsModal = document.getElementById('settings-modal-overlay');
    const closeSettingsBtn = document.getElementById('btn-close-settings');

    if (openSettingsBtn && settingsModal) {
      openSettingsBtn.addEventListener('click', () => {
        this.renderSettings();
        settingsModal.style.display = 'flex';
      });
    }
    if (closeSettingsBtn && settingsModal) {
      closeSettingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
      });
    }
    if (settingsModal) {
      settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
          settingsModal.style.display = 'none';
        }
      });
    }

    // 친구 상세 정보 모달 닫기
    const friendModal = document.getElementById('friend-detail-modal');
    const closeFriendModalBtn = document.getElementById('btn-close-friend-modal');
    if (closeFriendModalBtn && friendModal) {
      closeFriendModalBtn.addEventListener('click', () => {
        friendModal.style.display = 'none';
      });
    }
    if (friendModal) {
      friendModal.addEventListener('click', (e) => {
        if (e.target === friendModal) {
          friendModal.style.display = 'none';
        }
      });
    }

    // 말씀 발자국 안내 팝업 모달 닫기
    const footprintModal = document.getElementById('footprint-modal-overlay');
    const closeFootprintBtn = document.getElementById('btn-close-footprint-modal');
    const confirmFootprintBtn = document.getElementById('btn-confirm-footprint-modal');
    if (closeFootprintBtn) {
      closeFootprintBtn.addEventListener('click', () => {
        this.closeWordFootprint();
      });
    }
    if (confirmFootprintBtn) {
      confirmFootprintBtn.addEventListener('click', () => {
        this.closeWordFootprint();
      });
    }
    if (footprintModal) {
      footprintModal.addEventListener('click', (e) => {
        if (e.target === footprintModal) {
          this.closeWordFootprint();
        }
      });
    }

    // ==================== 말씀 퀘스트 & 업적 모달 열기/닫기 ====================
    const btnHomeQuests = document.getElementById('btn-home-quests');
    const questModal = document.getElementById('quest-modal-overlay');
    const closeQuestBtn = document.getElementById('btn-close-quest-modal');

    if (btnHomeQuests) {
      btnHomeQuests.addEventListener('click', () => {
        this.openQuestsModal();
      });
    }
    if (closeQuestBtn && questModal) {
      closeQuestBtn.addEventListener('click', () => {
        this.closeQuestsModal();
      });
    }
    if (questModal) {
      questModal.addEventListener('click', (e) => {
        if (e.target === questModal) {
          this.closeQuestsModal();
        }
      });
    }

    // ==================== 달란트 상점 & 옷장 전용 화면 열기/닫기 ====================
    const btnHomeTalents = document.getElementById('btn-home-talents');
    const btnBackFromShop = document.getElementById('btn-back-from-shop');

    if (btnHomeTalents) {
      btnHomeTalents.addEventListener('click', () => {
        this.openTalentShop('store');
      });
    }
    if (btnBackFromShop) {
      btnBackFromShop.addEventListener('click', () => {
        this.closeTalentShop();
      });
    }

    const tabStore = document.getElementById('shop-tab-store');
    const tabCloset = document.getElementById('shop-tab-closet');
    if (tabStore) {
      tabStore.addEventListener('click', () => {
        this.renderTalentShop('store');
      });
    }
    if (tabCloset) {
      tabCloset.addEventListener('click', () => {
        this.renderTalentShop('closet');
      });
    }

    // ==================== 신약 완독 대형 축하 모달 닫기 ====================
    const ntModal = document.getElementById('nt-grand-celebration-modal');
    const closeNtBtn = document.getElementById('btn-close-nt-celebration');
    if (closeNtBtn && ntModal) {
      closeNtBtn.addEventListener('click', () => {
        ntModal.style.display = 'none';
      });
    }
    if (ntModal) {
      ntModal.addEventListener('click', (e) => {
        if (e.target === ntModal) {
          ntModal.style.display = 'none';
        }
      });
    }

    // 달력 이전달/다음달/오늘 버튼
    const calPrevBtn = document.getElementById('calendar-btn-prev');
    const calNextBtn = document.getElementById('calendar-btn-next');
    const calTodayBtn = document.getElementById('calendar-btn-today');

    if (calPrevBtn) {
      calPrevBtn.addEventListener('click', () => {
        this.changeCalendarMonth(-1);
      });
    }
    if (calNextBtn) {
      calNextBtn.addEventListener('click', () => {
        this.changeCalendarMonth(1);
      });
    }
    if (calTodayBtn) {
      calTodayBtn.addEventListener('click', () => {
        this.resetCalendarToToday();
      });
    }

    // 공동체 가입코드 복사
    const copyKeyBtn = document.getElementById('btn-copy-key');
    const myShareKeyEl = document.getElementById('my-share-key');
    AuthService.getMasterKey().then(key => {
      if (myShareKeyEl) myShareKeyEl.textContent = key;
    });
    if (copyKeyBtn) {
      copyKeyBtn.addEventListener('click', async () => {
        const key = await AuthService.getMasterKey();
        if (myShareKeyEl) myShareKeyEl.textContent = key;
        navigator.clipboard.writeText(key).then(() => {
          this.showToast(`가입코드(${key})가 복사되었습니다 📋`);
        }).catch(() => {
          this.showToast(`가입코드: ${key}`);
        });
      });
    }

    // 성경 탭: 신약/구약 필터 ('전체' 제거됨)
    document.querySelectorAll('.testament-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const test = btn.dataset.testament;
        if (test === 'OT') {
          this.showToast('아직 개발중이에요! 이번 테스트 버전에서는 신약만 읽을 수 있어요 🔒🐑');
        }
        document.querySelectorAll('.testament-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTestament = test;
        this.renderBibleList();
      });
    });

    // 성경 검색창 입력
    const searchInput = document.getElementById('bible-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchKeyword = e.target.value.trim().toLowerCase();
        this.renderBibleList();
      });
    }

    // 테마 셀렉트 변경
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        this.setTheme(e.target.value);
        RetroAudio.click();
      });
    }

    // 데이터 백업 버튼
    const backupBtn = document.getElementById('btn-export-backup');
    if (backupBtn) {
      backupBtn.addEventListener('click', () => {
        StorageService.exportBackup();
        this.showToast('통독 데이터 백업 파일이 다운로드되었습니다 💾');
      });
    }

    // 데이터 복원 파일 선택
    const restoreInput = document.getElementById('file-import-backup');
    if (restoreInput) {
      restoreInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target.result);
            const res = StorageService.importBackup(json);
            if (res.success) {
              this.showToast('데이터 복원이 완료되었습니다! ✨');
              setTimeout(() => window.location.reload(), 600);
            } else {
              alert('복원 실패: ' + res.error);
            }
          } catch (err) {
            alert('유효하지 않은 백업 JSON 파일입니다.');
          }
        };
        reader.readAsText(file);
      });
    }

    // 데이터 초기화 버튼
    const resetBtn = document.getElementById('btn-reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const confirm1 = confirm('⚠️ 주의: 모든 통독 기록과 찰스의 성장이 초기화됩니다. 계속하시겠습니까?');
        if (confirm1) {
          const pass = prompt('보안을 위해 보안키 6자리를 입력하세요:');
          if (AuthService.isValidKey(pass)) {
            StorageService.resetAll();
            alert('데이터가 성공적으로 초기화되었습니다.');
            window.location.reload();
          } else {
            alert('보안키가 일치하지 않아 초기화가 취소되었습니다.');
          }
        }
      });
    }

    // 로그아웃 버튼
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('로그아웃하고 로그인 화면으로 돌아가시겠습니까?')) {
          AuthService.logout();
        }
      });
    }

    // 찰스 클릭 시 인터랙션 (귀여운 소리와 점프)
    const charlesDisplay = document.getElementById('charles-display');
    if (charlesDisplay) {
      charlesDisplay.addEventListener('click', () => {
        this.triggerCharlesPoke();
      });
    }

    // ==================== 성경 리더 이벤트 바인딩 ====================
    const readerBackBtn = document.getElementById('reader-btn-back');
    if (readerBackBtn) {
      readerBackBtn.addEventListener('click', () => {
        this.closeReader();
      });
    }

    const readerPrevBtn = document.getElementById('reader-btn-prev');
    if (readerPrevBtn) {
      readerPrevBtn.addEventListener('click', () => {
        this.prevChapter();
      });
    }

    const readerNextBtn = document.getElementById('reader-btn-next');
    if (readerNextBtn) {
      readerNextBtn.addEventListener('click', () => {
        this.nextChapter(true); // 다음 장으로 넘어가면서 자동 완독
      });
    }

    const readerCompleteNextBtn = document.getElementById('reader-btn-complete-next');
    if (readerCompleteNextBtn) {
      readerCompleteNextBtn.addEventListener('click', () => {
        this.handleCompleteAndNext();
      });
    }

    const fontDownBtn = document.getElementById('reader-btn-font-down');
    if (fontDownBtn) {
      fontDownBtn.addEventListener('click', () => {
        this.adjustFontSize(-1);
      });
    }

    const fontUpBtn = document.getElementById('reader-btn-font-up');
    if (fontUpBtn) {
      fontUpBtn.addEventListener('click', () => {
        this.adjustFontSize(1);
      });
    }

    // 본문 스크롤 바닥 감지 (자동 완독 체크)
    const readerScrollBody = document.getElementById('reader-body');
    if (readerScrollBody) {
      readerScrollBody.addEventListener('scroll', () => {
        this.checkReaderScrollBottom();
      });
    }
  },

  triggerCharlesPoke() {
    const slot = document.getElementById('charles-graphic-slot');
    if (slot) {
      slot.style.transform = 'scale(1.1)';
      setTimeout(() => { slot.style.transform = 'scale(1)'; }, 150);
    }
  },

  // ==================== 탭 전환 ====================
  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    const target = document.getElementById(`tab-${tabId}`);
    if (target) {
      target.classList.add('active');
    }

    this.renderAll();
  },

  // ==================== 테마 관리 ====================
  applySavedTheme() {
    const saved = localStorage.getItem('charles_theme') || 'classic';
    this.setTheme(saved);
    const select = document.getElementById('theme-select');
    if (select) select.value = saved;
  },

  setTheme(themeName) {
    localStorage.setItem('charles_theme', themeName);
    if (themeName === 'classic') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeName);
    }
  },

  // ==================== 전체 렌더링 ====================
  renderAll() {
    this.renderHome();
    this.renderSocial();
    this.renderBibleList();
    this.renderStats();
    this.renderProfile();
    this.renderSettings();
  },

  // ==================== 홈 화면 렌더링 (화면 중앙 대형 찰스 & Charles is____ & 오늘 말씀 게이지) ====================
  renderHome() {
    const stageNum = StorageService.getCharlesStage();
    const equipped = (typeof TalentService !== 'undefined') ? TalentService.getEquipped() : {};
    const visual = getCharlesVisual(stageNum, 10, equipped);

    // 1) 찰스 위: 오늘 읽은 말씀 게이지 (최대 5장)
    const todayRead = StorageService.getTodayReadCount();
    const gaugeCountEl = document.getElementById('today-gauge-count');
    if (gaugeCountEl) {
      if (todayRead >= 5) {
        gaugeCountEl.textContent = `${todayRead} / 5장 (완독! 👑)`;
      } else {
        gaugeCountEl.textContent = `${todayRead} / 5장`;
      }
    }

    const slots = document.querySelectorAll('.gauge-slot');
    slots.forEach((slot, idx) => {
      const slotNum = idx + 1;
      if (todayRead >= slotNum) {
        slot.classList.add('filled');
      } else {
        slot.classList.remove('filled');
      }
      slot.classList.remove('gold');
    });

    // 2) 화면 중앙 대형 찰스 SVG 그래픽
    const visualBox = document.getElementById('charles-graphic-slot');
    if (visualBox) {
      visualBox.innerHTML = visual.svg;
    }

    // 3) 찰스 상태 제목 "Charles is ____"
    const statusTextEl = document.getElementById('charles-status-text');
    if (statusTextEl) {
      statusTextEl.textContent = visual.info.title;
    }

    // 4) 달란트 잔액 & 퀘스트 레드닷 알림 버튼 렌더링
    this.renderHomeTalents();

    // 5) 성장 가이드 프리뷰 미리 렌더링
    this.renderCharlesEvolutionPreview();
  },

  // ==================== 찰스 5단계 진화 프리뷰 렌더링 ====================
  renderCharlesEvolutionPreview() {
    for (let stage = 1; stage <= 5; stage++) {
      const slot = document.getElementById(`evolution-slot-${stage}`);
      if (slot && !slot.hasChildNodes()) {
        const visual = getCharlesVisual(stage);
        slot.innerHTML = visual.svg;
      }
    }
  },

  // ==================== 8. 달란트(Talent) & 퀘스트 & 커스터마이징 매니저 ====================
  currentShopTab: 'store',
  shopPreviewEquipped: null,

  // 달란트 픽셀 코인 HTML 생성 헬퍼
  getTalentCoinIcon(size = 'sm') {
    const sizeClass = size === 'lg' ? 'coin-lg' : (size === 'sm' ? 'coin-sm' : '');
    return `<span class="talent-coin-icon ${sizeClass}"><span class="pixel-wooden-fence"></span></span>`;
  },

  renderHomeTalents() {
    if (typeof TalentService === 'undefined') return;

    // 1) 달란트 잔액 표시
    const balance = TalentService.getTalents();
    const talentCountEl = document.getElementById('home-talent-count');
    if (talentCountEl) {
      talentCountEl.textContent = balance.toLocaleString();
    }

    // 2) 미수령 퀘스트 여부에 따른 레드닷 알림 뱃지
    const hasUnclaimed = TalentService.hasUnclaimedQuests();
    const dotEl = document.getElementById('quest-notify-dot');
    if (dotEl) {
      dotEl.style.display = hasUnclaimed ? 'block' : 'none';
    }
  },

  openQuestsModal() {
    const modal = document.getElementById('quest-modal-overlay');
    if (!modal) return;
    this.renderQuestsModal();
    modal.style.display = 'flex';
    RetroAudio.click();

    // 기기 간 퀘스트 수령 및 달란트 동기화를 위해 백그라운드 클라우드 갱신
    if (typeof StorageService !== 'undefined' && StorageService.syncFromCloud) {
      StorageService.syncFromCloud().then(() => {
        this.renderQuestsModal();
        this.renderHomeTalents();
      });
    }
  },

  closeQuestsModal() {
    const modal = document.getElementById('quest-modal-overlay');
    if (modal) modal.style.display = 'none';
    this.renderHomeTalents();
  },

  renderQuestsModal() {
    if (typeof TalentService === 'undefined') return;
    const container = document.getElementById('quest-list-container');
    if (!container) return;

    const quests = TalentService.getQuestsList();

    // 그룹화: daily, weekly, achievement
    const dailyQuests = quests.filter(q => q.type === 'daily');
    const weeklyQuests = quests.filter(q => q.type === 'weekly');
    const achieveQuests = quests.filter(q => q.type === 'achievement');

    const renderQuestCard = (q) => {
      const percent = Math.min(100, Math.max(0, Math.round((q.current / q.target) * 100)));
      const isGold = q.type === 'achievement';
      const fillClass = q.status === 'ready' ? (isGold ? 'gold' : 'ready') : '';

      let btnHtml = '';
      if (q.status === 'claimed') {
        btnHtml = `<button class="btn-quest-action claimed" disabled type="button">수령 완료 ✓</button>`;
      } else if (q.status === 'ready') {
        btnHtml = `<button class="btn-quest-action ready" type="button" onclick="App.claimQuestReward('${q.id}')">달란트 받기 ${this.getTalentCoinIcon('sm')}</button>`;
      } else {
        btnHtml = `<button class="btn-quest-action progress" disabled type="button">${q.current}/${q.target} ${q.unit}</button>`;
      }

      return `
        <div class="quest-card ${q.status}">
          <div class="quest-card-icon">${q.icon}</div>
          <div class="quest-card-content">
            <div class="quest-card-title">${q.title}</div>
            <div class="quest-card-desc">${q.desc}</div>
            <div class="quest-progress-bar-wrap">
              <div class="quest-progress-bar-fill ${fillClass}" style="width: ${percent}%;"></div>
            </div>
            <div class="quest-card-status-text">
              <span>진행도: ${q.current}/${q.target} ${q.unit} (${percent}%)</span>
              <span style="font-weight: 800; color: #D68910; display: inline-flex; align-items: center; gap: 4px;">+${q.reward} ${this.getTalentCoinIcon('sm')}</span>
            </div>
          </div>
          ${btnHtml}
        </div>
      `;
    };

    let html = '';

    if (dailyQuests.length > 0) {
      html += `
        <div class="quest-category-header">
          <span>☀️</span> 일일 퀘스트 (매일 자정 갱신)
        </div>
        <div class="quest-list">
          ${dailyQuests.map(renderQuestCard).join('')}
        </div>
      `;
    }

    if (weeklyQuests.length > 0) {
      html += `
        <div class="quest-category-header">
          <span>🔥</span> 주간 퀘스트 (연속 통독 도전)
        </div>
        <div class="quest-list">
          ${weeklyQuests.map(renderQuestCard).join('')}
        </div>
      `;
    }

    if (achieveQuests.length > 0) {
      html += `
        <div class="quest-category-header">
          <span>👑</span> 영광의 업적 (평생 완독 대업)
        </div>
        <div class="quest-list">
          ${achieveQuests.map(renderQuestCard).join('')}
        </div>
      `;
    }

    container.innerHTML = html;
  },

  claimQuestReward(questId) {
    if (typeof TalentService === 'undefined') return;
    const res = TalentService.claimQuest(questId);
    if (!res.success) {
      this.showToast(res.error || '퀘스트를 수령할 수 없습니다.');
      return;
    }

    // 신약 완독 대업적 수령 시 특수 대형 축하 모달 오픈
    if (res.isNtComplete) {
      const ntModal = document.getElementById('nt-grand-celebration-modal');
      if (ntModal) {
        ntModal.style.display = 'flex';
      }
      RetroAudio.success();
    } else {
      this.showToast(`🎉 [${res.quest.title}] 완료! +${res.reward} 달란트 수령!`);
      RetroAudio.click();
    }

    this.renderQuestsModal();
    this.renderHomeTalents();
    this.renderHome();
  },

  openTalentShop(tab = 'store') {
    const shopView = document.getElementById('talent-shop-view');
    if (!shopView) return;
    this.currentShopTab = tab;
    this.shopPreviewEquipped = { ...(typeof TalentService !== 'undefined' ? TalentService.getEquipped() : {}) };
    this.renderTalentShop(tab);
    shopView.classList.add('active');
    RetroAudio.click();

    // 기기 간 달란트 잔액 및 인벤토리 동기화를 위해 백그라운드 클라우드 갱신
    if (typeof StorageService !== 'undefined' && StorageService.syncFromCloud) {
      StorageService.syncFromCloud().then(() => {
        this.renderTalentShop(this.currentShopTab || 'store');
        this.renderHomeTalents();
      });
    }
  },

  closeTalentShop() {
    const shopView = document.getElementById('talent-shop-view');
    if (shopView) shopView.classList.remove('active');
    this.shopPreviewEquipped = null;
    this.renderHome();
  },

  renderTalentShop(tab = 'store') {
    if (typeof TalentService === 'undefined') return;
    this.currentShopTab = tab;

    // 1) 탭 버튼 상태 업데이트
    const tabStore = document.getElementById('shop-tab-store');
    const tabCloset = document.getElementById('shop-tab-closet');
    if (tabStore) {
      tabStore.classList.toggle('active', tab === 'store');
    }
    if (tabCloset) {
      tabCloset.classList.toggle('active', tab === 'closet');
    }

    // 2) 잔액 업데이트
    const balance = TalentService.getTalents();
    const balanceEl = document.getElementById('shop-balance-count');
    if (balanceEl) {
      balanceEl.innerHTML = `${this.getTalentCoinIcon('sm')} ${balance.toLocaleString()}`;
    }
    const headerBalanceEl = document.getElementById('shop-header-balance-count');
    if (headerBalanceEl) {
      headerBalanceEl.textContent = balance.toLocaleString();
    }

    // 3) 피팅룸 찰스 아바타 렌더링
    if (!this.shopPreviewEquipped) {
      this.shopPreviewEquipped = { ...(TalentService.getEquipped() || {}) };
    }
    const stage = StorageService.getCharlesStage();
    const previewVisual = getCharlesVisual(stage, 6, this.shopPreviewEquipped);
    const previewSlot = document.getElementById('shop-preview-avatar');
    if (previewSlot) {
      previewSlot.innerHTML = previewVisual.svg;
    }

    // 피팅룸 안내 뱃지 / 상태 표시 (착용 미리보기 중인지 안내)
    const previewTag = document.getElementById('shop-preview-tag');
    if (previewTag) {
      const realEquipped = TalentService.getEquipped() || {};
      const slots = ['head', 'glasses', 'hold', 'grass'];
      const isCustomPreview = slots.some(slot => (this.shopPreviewEquipped[slot] || null) !== (realEquipped[slot] || null));
      if (isCustomPreview) {
        previewTag.innerHTML = `<span>✨ 착용 미리보기 중</span> <button type="button" class="btn-preview-reset" onclick="App.resetShopPreview()">원래대로 ↺</button>`;
        previewTag.classList.add('active');
      } else {
        previewTag.innerHTML = `<span>피팅룸</span>`;
        previewTag.classList.remove('active');
      }
    }

    // 4) 아이템 그리드 렌더링
    const grid = document.getElementById('shop-items-grid');
    if (!grid) return;

    const allItems = Object.values(TALENT_ITEMS);

    if (tab === 'store') {
      // 상점: 4개 아이템 전체 노출
      grid.innerHTML = allItems.map(item => {
        const isOwned = TalentService.hasItem(item.id);
        const isTryingOn = this.shopPreviewEquipped && this.shopPreviewEquipped[item.slot] === item.id;

        const tryBtnText = isTryingOn ? '해제하기' : '착용해보기';
        const tryBtnClass = isTryingOn ? 'shop-item-btn try-on active' : 'shop-item-btn try-on';

        let buyOrOwnedBtn = '';
        if (isOwned) {
          buyOrOwnedBtn = `<button class="shop-item-btn equipped" type="button" disabled>보유중 ✓</button>`;
        } else {
          buyOrOwnedBtn = `<button class="shop-item-btn buy" type="button" onclick="App.buyTalentItem('${item.id}')">구매 (${item.price} ${this.getTalentCoinIcon('sm')})</button>`;
        }

        const iconContent = (typeof getAccessoryIconSvg === 'function' ? getAccessoryIconSvg(item.id) : null) || item.icon;
        const categoryLabel = item.category || '몸통';

        return `
          <div class="shop-item-card">
            <div class="shop-item-icon">${iconContent}</div>
            <div class="shop-item-category-tag" data-cat="${categoryLabel}">${categoryLabel}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-desc">${item.desc}</div>
            <div class="shop-item-actions">
              <button class="${tryBtnClass}" type="button" onclick="App.togglePreviewTalentItem('${item.id}')">${tryBtnText}</button>
              ${buyOrOwnedBtn}
            </div>
          </div>
        `;
      }).join('');
    } else {
      // 내 옷장: 보유한 아이템만 노출
      const ownedItems = allItems.filter(item => TalentService.hasItem(item.id));

      if (ownedItems.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: span 2; text-align: center; padding: 28px 10px; color: var(--text-muted); font-size: 12px; line-height: 1.6;">
            아직 보유한 아이템이 없습니다.<br>
            상점에서 귀여운 아이템을 입양해 보세요! 🛍️✨
          </div>
        `;
        return;
      }

      grid.innerHTML = ownedItems.map(item => {
        const isEquipped = TalentService.isEquipped(item.id);

        let btnHtml = '';
        if (isEquipped) {
          btnHtml = `<button class="shop-item-btn equipped" type="button" onclick="App.toggleEquipTalentItem('${item.id}')">착용중 (해제)</button>`;
        } else {
          btnHtml = `<button class="shop-item-btn equip" type="button" onclick="App.toggleEquipTalentItem('${item.id}')">착용하기 ✨</button>`;
        }

        const iconContent = (typeof getAccessoryIconSvg === 'function' ? getAccessoryIconSvg(item.id) : null) || item.icon;
        const categoryLabel = item.category || '몸통';

        return `
          <div class="shop-item-card">
            <div class="shop-item-icon">${iconContent}</div>
            <div class="shop-item-category-tag" data-cat="${categoryLabel}">${categoryLabel}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-desc">${item.desc}</div>
            <div class="shop-item-actions">
              ${btnHtml}
            </div>
          </div>
        `;
      }).join('');
    }
  },

  togglePreviewTalentItem(itemId) {
    if (typeof TalentService === 'undefined') return;
    const item = TALENT_ITEMS[itemId];
    if (!item) return;

    if (!this.shopPreviewEquipped) {
      this.shopPreviewEquipped = { ...(TalentService.getEquipped() || {}) };
    }

    const isTryingOn = this.shopPreviewEquipped[item.slot] === itemId;
    if (isTryingOn) {
      this.shopPreviewEquipped[item.slot] = null;
      if (item.slot === 'grass') this.shopPreviewEquipped.back = null;
      this.showToast(`${item.name} 착용을 해제했습니다.`);
    } else {
      this.shopPreviewEquipped[item.slot] = itemId;
      if (item.slot === 'grass') this.shopPreviewEquipped.back = itemId;
      this.showToast(`✨ ${item.name} 착용 미리보기!`);
    }

    RetroAudio.click();

    // 찰스 바운스 애니메이션 트리거
    const previewSlot = document.getElementById('shop-preview-avatar');
    if (previewSlot) {
      previewSlot.classList.remove('charles-preview-bounce');
      void previewSlot.offsetWidth;
      previewSlot.classList.add('charles-preview-bounce');
    }

    this.renderTalentShop(this.currentShopTab || 'store');
  },

  resetShopPreview() {
    if (typeof TalentService === 'undefined') return;
    this.shopPreviewEquipped = { ...(TalentService.getEquipped() || {}) };
    this.showToast('원래 착용 모습으로 되돌렸습니다.');
    RetroAudio.click();
    this.renderTalentShop(this.currentShopTab || 'store');
  },

  buyTalentItem(itemId) {
    if (typeof TalentService === 'undefined') return;
    const res = TalentService.buyItem(itemId);
    if (!res.success) {
      this.showToast(res.error || '구매할 수 없습니다.');
      RetroAudio.error();
      return;
    }

    RetroAudio.success();
    this.showToast(`🎉 '${res.item.name}' 구매 및 착용 완료!`);
    if (!this.shopPreviewEquipped) {
      this.shopPreviewEquipped = {};
    }
    this.shopPreviewEquipped[res.item.slot] = res.item.id;
    if (res.item.slot === 'grass') this.shopPreviewEquipped.back = res.item.id;
    this.renderTalentShop(this.currentShopTab || 'store');
    this.renderHome();
  },

  toggleEquipTalentItem(itemId) {
    if (typeof TalentService === 'undefined') return;
    const item = TALENT_ITEMS[itemId];
    if (!item) return;

    if (TalentService.isEquipped(itemId)) {
      TalentService.unequipSlot(item.slot);
      this.showToast(`${item.name} 착용을 해제했습니다.`);
    } else {
      TalentService.equipItem(itemId);
      this.showToast(`✨ ${item.name}을(를) 착용했습니다!`);
    }

    this.shopPreviewEquipped = { ...(TalentService.getEquipped() || {}) };
    RetroAudio.click();
    this.renderTalentShop(this.currentShopTab || 'closet');
    this.renderHome();
  },

  // ==================== 서원경 청년부 양떼목장 2D 플랫폼 화면 렌더링 ====================
  pastureFriends: [],
  pastureSearchQuery: '',

  // 양떼목장 친구 고유 악세사리 결정 (사용자 ID 기반 일관성 유지)
  getFriendAccessory(user, isMe, stage) {
    if (isMe) {
      return { type: 'crown', icon: '👑', name: '나의 찰스' };
    }
    if (stage === 5) {
      return { type: 'angel', icon: '😇', name: '영광의 천사' };
    }
    const ACCESSORY_LIST = [
      { type: 'sunglasses', icon: '🕶️', name: '선글라스' },
      { type: 'bunny', icon: '🐰', name: '토끼귀' },
      { type: 'ribbon', icon: '🎀', name: '리본' },
      { type: 'flower', icon: '🌸', name: '꽃 머리핀' },
      { type: 'sprout', icon: '🌿', name: '새싹' },
      { type: 'cap', icon: '🧢', name: '볼캡' },
      { type: 'scarf', icon: '🧣', name: '목도리' }
    ];
    const str = String((user && (user.id || user.nickname || user.name)) || '');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % ACCESSORY_LIST.length;
    return ACCESSORY_LIST[idx];
  },

  async renderSocial() {
    const listEl = document.getElementById('social-friends-list');
    if (!listEl) return;

    const currentUser = AuthService.getCurrentUser();
    const currentUserId = currentUser && currentUser.id ? String(currentUser.id).trim().toLowerCase() : '';

    const isUserMe = (u) => {
      if (!currentUserId || !u || !u.id) return false;
      return String(u.id).trim().toLowerCase() === currentUserId;
    };

    const buildList = (users) => {
      if (!Array.isArray(users)) users = [];

      let allMembers = [...users];
      if (currentUser && currentUser.id && !allMembers.some(u => isUserMe(u))) {
        allMembers.unshift(currentUser);
      }

      // 내 계정 최상단, 그 다음 닉네임/이름 순 정렬
      allMembers.sort((a, b) => {
        const aIsMe = isUserMe(a);
        const bIsMe = isUserMe(b);
        if (aIsMe) return -1;
        if (bIsMe) return 1;
        const nameA = a.nickname || a.name || '';
        const nameB = b.nickname || b.name || '';
        return nameA.localeCompare(nameB, 'ko');
      });

      return allMembers.map(u => {
        const isMe = isUserMe(u);
        const call = u.nickname || u.name || '청년부원';
        const cellTag = u.cell ? ` (${u.cell})` : '';
        const displayName = `${call}${cellTag}`;

        // 로컬 캐시에서 즉시 스테이지 및 통독 데이터 로드
        let stage = 1;
        let streakCount = 0;
        let todayRead = 0;

        let equipped = {};
        if (isMe) {
          stage = StorageService.getCharlesStage();
          streakCount = StorageService.getStreakInfo().count || 0;
          todayRead = StorageService.getTodayReadCount() || 0;
          equipped = (typeof TalentService !== 'undefined') ? TalentService.getEquipped() : {};
        } else {
          try {
            const s = localStorage.getItem(`charles_user_${u.id}_stage`);
            if (s) stage = parseInt(s, 10) || 1;
            const strk = localStorage.getItem(`charles_user_${u.id}_streak`);
            if (strk) streakCount = (JSON.parse(strk) || {}).count || 0;
            const dc = localStorage.getItem(`charles_user_${u.id}_daily_counts`);
            if (dc) {
              const parsed = JSON.parse(dc);
              const todayStr = StorageService.getTodayDateStr();
              if (parsed && parsed[todayStr]) todayRead = parsed[todayStr] || 0;
            }
            const eq = localStorage.getItem(`charles_user_${u.id}_equipped`);
            if (eq) {
              const parsed = JSON.parse(eq);
              if (parsed && typeof parsed === 'object') equipped = parsed;
            }
          } catch (e) {}
        }

        return {
          id: u.id || u.name,
          callName: call,
          displayName,
          cell: u.cell || '',
          isMe,
          stage,
          streakCount,
          todayRead,
          equipped
        };
      });
    };

    // 1단계: 로컬 캐시 즉시 렌더링
    const localUsers = AuthService.getAllUsersLocal();
    this.pastureFriends = buildList(localUsers);
    this.renderPastureShelves(this.pastureFriends);

    // 2단계: 최신 상태 비동기 동기화 (Supabase & 각 유저 스토리지 상태)
    AuthService.getAllUsers().then(async (remoteUsers) => {
      if (Array.isArray(remoteUsers) && remoteUsers.length > 0) {
        this.pastureFriends = buildList(remoteUsers);
      }
      
      // 비동기 통독 상태 일괄(Batch) 1회 조회로 최적화 (N+1 쿼리 방지)
      const friendIds = this.pastureFriends.filter(f => !f.isEmpty && f.id).map(f => f.id);
      const statesMap = await StorageService.getAllUsersStates(friendIds);

      this.pastureFriends.forEach(f => {
        if (f.id && statesMap[f.id]) {
          const state = statesMap[f.id];
          f.stage = state.stage || f.stage || 1;
          f.streakCount = state.streakCount !== undefined ? state.streakCount : f.streakCount;
          f.todayRead = state.todayRead !== undefined ? state.todayRead : f.todayRead;
          if (state.equipped) f.equipped = state.equipped;
        }
      });

      // 갱신된 최신 데이터로 화면 업데이트
      if (this.pastureSearchQuery) {
        this.filterPastureFriends(this.pastureSearchQuery);
      } else {
        this.renderPastureShelves(this.pastureFriends);
      }
    }).catch(err => {
      console.warn('양떼목장 원격 동기화 알림:', err);
    });
  },

  // 3인 1조 선반(Platform Shelf) 렌더러
  renderPastureShelves(friendsList) {
    const listEl = document.getElementById('social-friends-list');
    if (!listEl) return;

    const countEl = document.getElementById('pasture-member-count');
    if (countEl) {
      const realCount = (friendsList || []).filter(f => !f.isEmpty).length;
      countEl.textContent = `${realCount}마리 🌿`;
    }

    // 3명씩 선반 단위로 청크 분할
    const shelves = [];
    const sourceList = Array.isArray(friendsList) ? [...friendsList] : [];
    for (let i = 0; i < sourceList.length; i += 3) {
      shelves.push(sourceList.slice(i, i + 3));
    }

    if (shelves.length === 0) {
      shelves.push([{ isEmpty: true }, { isEmpty: true }, { isEmpty: true }]);
    } else {
      const lastShelf = shelves[shelves.length - 1];
      while (lastShelf.length < 3) {
        lastShelf.push({ isEmpty: true });
      }
    }

    const html = shelves.map(shelf => {
      // 1) 캐릭터 슬롯 3개
      const charSlotsHtml = shelf.map(f => {
        if (f.isEmpty) {
          return `
            <div class="pasture-char-slot empty-slot" onclick="App.shareOrInviteFriend()" title="새 친구 초대하기">
              <div class="pasture-empty-sprout">🌱</div>
            </div>
          `;
        }

        const visual = getCharlesVisual(f.stage || 1, 4, f.equipped || {});
        const isMe = f.isMe;

        return `
          <div class="pasture-char-slot" onclick="App.openFriendDetail('${f.id}')" title="${f.displayName} 정보 보기">
            <div class="pasture-sheep-box">
              ${isMe ? `
                <div class="pasture-me-tag-wrap">
                  <span class="pasture-me-badge">me</span>
                </div>
              ` : ''}
              <div class="pasture-sheep-svg-wrap">
                ${visual.svg}
              </div>
            </div>
          </div>
        `;
      }).join('');

      // 2) 흙 블록 셀 3개 (친구 닉네임 표기)
      const dirtCellsHtml = shelf.map(f => {
        if (f.isEmpty) {
          return `
            <div class="pasture-dirt-cell empty" onclick="App.shareOrInviteFriend()" title="새 친구 자리">
              <span class="pasture-char-name empty">새 친구 자리</span>
            </div>
          `;
        }
        return `
          <div class="pasture-dirt-cell ${f.isMe ? 'is-me' : ''}" onclick="App.openFriendDetail('${f.id}')" title="${f.displayName} 정보 보기">
            <span class="pasture-char-name ${f.isMe ? 'is-me' : ''}">${f.callName}</span>
          </div>
        `;
      }).join('');

      // 3) 하단 반투명 알약 캡슐 버튼 3개
      const pillsHtml = shelf.map(f => {
        if (f.isEmpty) {
          return `
            <div class="pasture-pill-cell">
              <button class="pasture-pill-btn empty-btn" onclick="event.stopPropagation(); App.shareOrInviteFriend()" title="친구 초대하기">
                + 초대
              </button>
            </div>
          `;
        }
        if (f.isMe) {
          const todayText = f.todayRead > 0 ? `오늘 ${f.todayRead}장 ⭐` : '내 찰스 🌿';
          return `
            <div class="pasture-pill-cell">
              <button class="pasture-pill-btn is-me" onclick="event.stopPropagation(); App.showToast('오늘도 말씀 안에서 승리하세요! 💪✨')">
                ${todayText}
              </button>
            </div>
          `;
        } else {
          const pillLabel = f.todayRead > 0 ? `오늘 ${f.todayRead}장 🌿` : '응원 🐑';
          return `
            <div class="pasture-pill-cell">
              <button class="pasture-pill-btn" onclick="event.stopPropagation(); App.sendCheer('${f.callName}', event)">
                ${pillLabel}
              </button>
            </div>
          `;
        }
      }).join('');

      return `
        <div class="pasture-shelf">
          <!-- 상단: 3명의 캐릭터 슬롯 -->
          <div class="pasture-shelf-characters">
            ${charSlotsHtml}
          </div>

          <!-- 중간: 잔디 & 흙 블록 선반 플랫폼 -->
          <div class="pasture-platform">
            <div class="pasture-platform-grass"></div>
            <div class="pasture-platform-dirt">
              ${dirtCellsHtml}
            </div>
          </div>

          <!-- 하단: 3개의 캡슐 버튼 -->
          <div class="pasture-shelf-pills">
            ${pillsHtml}
          </div>
        </div>
      `;
    }).join('');

    listEl.innerHTML = html;
  },

  // 검색 토글
  togglePastureSearch() {
    const wrap = document.getElementById('pasture-search-wrap');
    if (!wrap) return;
    const isHidden = wrap.style.display === 'none';
    wrap.style.display = isHidden ? 'block' : 'none';
    RetroAudio.click();
    if (isHidden) {
      const input = document.getElementById('pasture-search-input');
      if (input) input.focus();
    } else {
      this.pastureSearchQuery = '';
      this.renderPastureShelves(this.pastureFriends);
    }
  },

  // 친구 검색 필터
  onPastureSearch(query) {
    this.pastureSearchQuery = (query || '').trim().toLowerCase();
    this.filterPastureFriends(this.pastureSearchQuery);
  },

  filterPastureFriends(query) {
    if (!query) {
      this.renderPastureShelves(this.pastureFriends);
      return;
    }
    const filtered = this.pastureFriends.filter(f => {
      if (f.isEmpty) return false;
      const name = (f.callName || '').toLowerCase();
      const disp = (f.displayName || '').toLowerCase();
      const cell = (f.cell || '').toLowerCase();
      return name.includes(query) || disp.includes(query) || cell.includes(query);
    });
    this.renderPastureShelves(filtered);
  },

  // 말씀 발자국 안내 팝업 모달 오픈
  openWordFootprint() {
    RetroAudio.click();
    const modal = document.getElementById('footprint-modal-overlay');
    if (modal) {
      modal.style.display = 'flex';
    } else {
      this.showToast('말씀 발자국은 아직 준비중이에요!');
    }
  },

  closeWordFootprint() {
    RetroAudio.click();
    const modal = document.getElementById('footprint-modal-overlay');
    if (modal) {
      modal.style.display = 'none';
    }
  },

  // 하위 호환
  openEvolutionModal() {
    this.openWordFootprint();
  },

  // 친구 초대 링크 복사
  shareOrInviteFriend() {
    RetroAudio.click();
    const url = window.location.origin + window.location.pathname;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        this.showToast('양떼목장 초대 링크가 복사되었어요! 💌');
      }).catch(() => {
        this.showToast('친구들에게 찰스 바이블을 알려주세요! 🌿');
      });
    } else {
      this.showToast('친구들에게 찰스 바이블을 알려주세요! 🌿');
    }
  },

  // 따뜻한 응원 보내기 및 파티클 인터랙션
  sendCheer(name, event) {
    RetroAudio.click();
    this.showToast(`${name}님에게 양 풀과 따뜻한 응원을 보냈어요! 🌿✨`);
    if (event && event.clientX) {
      this.spawnCheerEffect(event.clientX, event.clientY);
    } else {
      this.spawnCheerEffect();
    }
  },

  spawnCheerEffect(x, y) {
    const emojis = ['🌿', '❤️', '🐑', '✨'];
    const posX = (x !== undefined && x > 0) ? x : window.innerWidth / 2;
    const posY = (y !== undefined && y > 0) ? y : window.innerHeight / 2;

    for (let i = 0; i < 4; i++) {
      const p = document.createElement('div');
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      const randX = (Math.random() - 0.5) * 60;
      const randY = 40 + Math.random() * 50;
      p.style.cssText = `
        position: fixed;
        left: ${posX + randX}px;
        top: ${posY}px;
        font-size: 22px;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.9s ease-out;
        transform: translateY(0) scale(0.6);
        opacity: 1;
      `;
      document.body.appendChild(p);
      requestAnimationFrame(() => {
        p.style.transform = `translateY(-${randY}px) scale(1.2)`;
        p.style.opacity = '0';
      });
      setTimeout(() => p.remove(), 1000);
    }
  },

  // ==================== 친구 정보 모달 오픈 ====================
  async openFriendDetail(userId) {
    const modal = document.getElementById('friend-detail-modal');
    if (!modal) return;

    // 1. 해당 유저 정보 찾기 (AuthService)
    const users = AuthService.getAllUsersLocal();
    let user = users.find(u => String(u.id).toLowerCase() === String(userId).toLowerCase());
    if (!user) {
      const cur = AuthService.getCurrentUser();
      if (cur && String(cur.id).toLowerCase() === String(userId).toLowerCase()) {
        user = cur;
      }
    }

    const callName = (user && (user.nickname || user.name)) || userId;
    const cellName = (user && user.cell) ? `${user.cell}` : '소속 셀 미지정';
    const realName = (user && user.name) ? ` · ${user.name}` : '';
    const isMe = user && String(user.id).toLowerCase() === String(StorageService.getCurrentUserId()).toLowerCase();

    // 기본 텍스트 주입
    const nickEl = document.getElementById('friend-modal-nickname');
    if (nickEl) nickEl.textContent = callName;

    const subEl = document.getElementById('friend-modal-sub');
    if (subEl) subEl.textContent = `${cellName}${realName}`;

    const streakEl = document.getElementById('friend-modal-stat-streak');
    const todayEl = document.getElementById('friend-modal-stat-today');
    if (streakEl) streakEl.textContent = '...';
    if (todayEl) todayEl.textContent = '...';

    modal.style.display = 'flex';
    RetroAudio.click();

    // 2. 통독 정보 및 양의 상태 비동기 조회
    const state = await StorageService.getUserState(userId);
    const visual = getCharlesVisual(state.stage, 6, state.equipped || {});

    // 그래픽 주입
    const graphicSlot = document.getElementById('friend-modal-graphic');
    if (graphicSlot) graphicSlot.innerHTML = visual.svg;

    const titleEl = document.getElementById('friend-modal-charles-title');
    if (titleEl) titleEl.textContent = visual.info.title;

    const stageEl = document.getElementById('friend-modal-charles-stage');
    if (stageEl) stageEl.textContent = `${state.stage}단계 찰스 🌿`;

    if (streakEl) streakEl.textContent = `${state.streakCount}일`;
    if (todayEl) todayEl.textContent = `${state.todayRead}장`;
  },

  renderQuickContinue() {
    const continueBtn = document.getElementById('btn-quick-continue');
    const continueText = document.getElementById('quick-continue-text');
    if (!continueBtn || !continueText) return;

    let nextBook = null;
    let nextChapter = 1;

    // 테스트 버전: 신약(NT)부터 이어 읽기 탐색
    const ntBooks = BIBLE_BOOKS.filter(b => b.testament === 'NT');
    for (const book of ntBooks) {
      for (let c = 1; c <= book.chapters; c++) {
        if (!StorageService.isChapterRead(book.id, c)) {
          nextBook = book;
          nextChapter = c;
          break;
        }
      }
      if (nextBook) break;
    }

    if (nextBook) {
      continueText.textContent = `${nextBook.name} ${nextChapter}장 이어 읽기 ➔`;
      continueBtn.onclick = () => {
        this.openReader(nextBook.id, nextChapter);
      };
    } else {
      continueText.textContent = `축하합니다! 신약 27권 전체 완독 완료 👑`;
      continueBtn.onclick = null;
    }
  },

  // ==================== 성경 목록 탭 렌더링 ====================
  renderBibleList() {
    const container = document.getElementById('bible-books-list');
    if (!container) return;

    let filtered = BIBLE_BOOKS;

    if (this.currentTestament === 'OT') {
      filtered = filtered.filter(b => b.testament === 'OT');
    } else if (this.currentTestament === 'NT') {
      filtered = filtered.filter(b => b.testament === 'NT');
    }

    if (this.searchKeyword) {
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(this.searchKeyword) || 
        b.eng.toLowerCase().includes(this.searchKeyword)
      );
    }

    const stats = StorageService.getStats();

    container.innerHTML = filtered.map(book => {
      const isOT = book.testament === 'OT';
      const readInBook = stats.bookProgress[book.id] || 0;
      const isComplete = readInBook === book.chapters;

      const cardClass = isOT ? 'book-card locked-book' : 'book-card';
      const badgeContent = isOT 
        ? '<span class="book-lock-tag">🔒 준비중</span>' 
        : `<span>${readInBook}/${book.chapters}</span>${isComplete ? '<span class="book-complete-stamp">★완독</span>' : ''}<span class="accordion-arrow">▼</span>`;

      return `
        <div class="${cardClass}" id="book-card-${book.id}" data-book-id="${book.id}">
          <div class="book-card-header" onclick="App.handleBookClick('${book.id}')">
            <div class="book-name-wrap">
              <span class="book-title">${book.name}</span>
              <span class="book-category-tag">${book.category}</span>
            </div>
            <div class="book-progress-badge">
              ${badgeContent}
            </div>
          </div>
          <div class="book-chapters-grid" id="grid-${book.id}">
            <!-- 챕터 버튼들 -->
          </div>
        </div>
      `;
    }).join('');
  },

  handleBookClick(bookId) {
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book) return;

    if (book.testament === 'OT') {
      this.showToast('아직 개발중이에요! 이번 테스트 버전에서는 신약만 읽을 수 있어요 🔒🐑');
      RetroAudio.click();
      return;
    }

    this.toggleBookAccordion(bookId);
  },

  toggleBookAccordion(bookId) {
    const card = document.getElementById(`book-card-${bookId}`);
    if (!card) return;

    const isExpanded = card.classList.contains('expanded');
    if (!isExpanded) {
      this.populateChaptersGrid(bookId);
      card.classList.add('expanded');
      RetroAudio.click();
    } else {
      card.classList.remove('expanded');
      RetroAudio.click();
    }
  },

  populateChaptersGrid(bookId) {
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    const grid = document.getElementById(`grid-${bookId}`);
    if (!book || !grid) return;

    let html = `
      <div style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px dashed var(--border-color);">
        <span style="font-size: 11px; font-weight: 600; color: var(--text-muted);">${book.eng} · 총 ${book.chapters}장</span>
      </div>
    `;

    for (let c = 1; c <= book.chapters; c++) {
      const isRead = StorageService.isChapterRead(book.id, c);
      html += `
        <button class="chapter-btn ${isRead ? 'read' : ''}" 
                onclick="App.openReader('${book.id}', ${c})"
                id="btn-${book.id}-${c}">
          ${c}
        </button>
      `;
    }

    grid.innerHTML = html;
  },

  updateBookCardProgress(bookId) {
    const card = document.getElementById(`book-card-${bookId}`);
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (!card || !book) return;

    const stats = StorageService.getStats();
    const readInBook = stats.bookProgress[book.id] || 0;
    const isComplete = readInBook === book.chapters;

    const badge = card.querySelector('.book-progress-badge');
    if (badge) {
      badge.innerHTML = `
        <span>${readInBook}/${book.chapters}</span>
        ${isComplete ? '<span class="book-complete-stamp">★완독</span>' : ''}
        <span class="accordion-arrow">▼</span>
      `;
    }
  },

  // ==================== 앱 내 성경 읽기 뷰어 (BIBLE READER) ====================
  async openReader(bookId, chapter) {
    const readerView = document.getElementById('bible-reader-view');
    const titleEl = document.getElementById('reader-current-title');
    const container = document.getElementById('reader-verses-container');
    const scrollBody = document.getElementById('reader-body');

    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book) return;

    // 구약 차단 (이번 테스트 버전은 신약만)
    if (book.testament === 'OT') {
      this.showToast('아직 개발중이에요! 이번 테스트 버전에서는 신약만 읽을 수 있어요 🔒🐑');
      return;
    }

    this.currentReadingBookId = bookId;
    this.currentReadingChapter = Number(chapter);
    this.hasAutoMarkedThisSession = false; // 새로운 장 열람 시 자동완독 플래그 초기화

    // 리더 뷰 열기
    readerView.classList.add('active');
    titleEl.textContent = `${book.name} ${chapter}장`;
    container.innerHTML = `<div class="reader-loading">말씀을 불러오는 중입니다... 📖</div>`;
    scrollBody.scrollTop = 0;

    this.updateReaderCompleteBtn();

    try {
      const data = await BibleTextService.getChapterVerses(bookId, chapter);
      
      let html = '';
      data.verses.forEach(v => {
        html += `
          <div class="verse-item">
            <span class="verse-num">${v.verse}</span>
            <span class="verse-text">${v.text}</span>
          </div>
        `;
      });
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `
        <div class="reader-loading" style="color: #E74C3C;">
          본문을 불러오지 못했습니다.<br>
          <span style="font-size: 11px; color: var(--text-muted);">${err.message}</span>
        </div>
      `;
    }
  },

  closeReader() {
    const readerView = document.getElementById('bible-reader-view');
    if (readerView) {
      readerView.classList.remove('active');
    }
    this.renderAll();
  },

  handleCompleteAndNext() {
    const bookId = this.currentReadingBookId;
    const chapter = this.currentReadingChapter;
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book || book.testament === 'OT') return;

    // 현재 장 완독 처리
    const alreadyRead = StorageService.isChapterRead(bookId, chapter);
    if (!alreadyRead) {
      this.hasAutoMarkedThisSession = true;
      const beforeStage = StorageService.getCharlesStage();
      StorageService.setChapterRead(bookId, chapter, true);

      this.showToast(`✓ ${book.name} ${chapter}장 완독! 찰스가 기뻐합니다 🐑🌿`);
      RetroAudio.success();

      const afterStage = StorageService.getCharlesStage();
      if (afterStage > beforeStage) {
        setTimeout(() => {
          this.showToast(`🎉 찰스 성장! [${CHARLES_STAGES[afterStage].title}]`);
        }, 800);
      }

      this.updateBookCardProgress(bookId);
      this.renderHome();
      this.renderStats();
    }

    // 신약의 마지막 장(요한계시록 22장)인지 확인
    if (bookId === 'REV' && chapter === 22) {
      this.showToast('🎉 축하합니다! 신약 27권 전체를 완독하셨습니다! 👑✨');
      this.updateReaderCompleteBtn();
      return;
    }

    // 다음 장으로 이동
    this.nextChapter(false);
  },

  nextChapter(autoMark = true) {
    if (autoMark) {
      const bookId = this.currentReadingBookId;
      const chapter = this.currentReadingChapter;
      const book = BIBLE_BOOKS.find(b => b.id === bookId);
      if (book && book.testament !== 'OT') {
        const alreadyRead = StorageService.isChapterRead(bookId, chapter);
        if (!alreadyRead) {
          this.hasAutoMarkedThisSession = true;
          const beforeStage = StorageService.getCharlesStage();
          StorageService.setChapterRead(bookId, chapter, true);

          this.showToast(`✓ ${book.name} ${chapter}장 완독! 찰스가 기뻐합니다 🐑🌿`);
          RetroAudio.success();

          const afterStage = StorageService.getCharlesStage();
          if (afterStage > beforeStage) {
            setTimeout(() => {
              this.showToast(`🎉 찰스 성장! [${CHARLES_STAGES[afterStage].title}]`);
            }, 800);
          }

          this.updateBookCardProgress(bookId);
          this.renderHome();
          this.renderStats();
        }
      }
    }

    const currentBook = BIBLE_BOOKS.find(b => b.id === this.currentReadingBookId);
    if (!currentBook) return;

    if (this.currentReadingChapter < currentBook.chapters) {
      this.openReader(currentBook.id, this.currentReadingChapter + 1);
    } else {
      // 다음 책으로 넘어가기
      const currentIdx = BIBLE_BOOKS.findIndex(b => b.id === this.currentReadingBookId);
      if (currentIdx < BIBLE_BOOKS.length - 1) {
        const nextBook = BIBLE_BOOKS[currentIdx + 1];
        if (nextBook.testament === 'OT') {
          this.showToast('신약의 마지막 장(요한계시록 22장)입니다! 👑');
          return;
        }
        this.openReader(nextBook.id, 1);
      } else {
        this.showToast('신약의 마지막 장(요한계시록 22장)입니다! 👑');
      }
    }
  },

  prevChapter() {
    const currentBook = BIBLE_BOOKS.find(b => b.id === this.currentReadingBookId);
    if (!currentBook) return;

    if (this.currentReadingChapter > 1) {
      this.openReader(currentBook.id, this.currentReadingChapter - 1);
    } else {
      // 이전 책으로 넘어가기
      const currentIdx = BIBLE_BOOKS.findIndex(b => b.id === this.currentReadingBookId);
      if (currentIdx > 0) {
        const prevBook = BIBLE_BOOKS[currentIdx - 1];
        if (prevBook.testament === 'OT') {
          this.showToast('신약의 첫 장(마태복음 1장)입니다! 구약은 개발 중이에요 🔒');
          return;
        }
        this.openReader(prevBook.id, prevBook.chapters);
      }
    }
  },

  // 스크롤이 가장 아래로 내려왔을 때 자동으로 장 완독 체크
  checkReaderScrollBottom() {
    const readerView = document.getElementById('bible-reader-view');
    const scrollBody = document.getElementById('reader-body');
    if (!readerView || !readerView.classList.contains('active') || !scrollBody) return;
    if (this.hasAutoMarkedThisSession) return;

    // 본문 컨텐츠가 충분히 로드되어 스크롤이 생긴 상태인지 확인
    if (scrollBody.scrollHeight <= scrollBody.clientHeight + 20) return;

    // 바닥 35px 이내 도달 확인
    const scrollBottom = scrollBody.scrollTop + scrollBody.clientHeight;
    if (scrollBottom >= scrollBody.scrollHeight - 35) {
      this.autoMarkCurrentChapterRead();
    }
  },

  autoMarkCurrentChapterRead() {
    if (this.hasAutoMarkedThisSession) return;
    const bookId = this.currentReadingBookId;
    const chapter = this.currentReadingChapter;
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book || book.testament === 'OT') return;

    const alreadyRead = StorageService.isChapterRead(bookId, chapter);
    if (!alreadyRead) {
      this.hasAutoMarkedThisSession = true;
      const beforeStage = StorageService.getCharlesStage();
      StorageService.setChapterRead(bookId, chapter, true);

      this.showToast(`✓ ${book.name} ${chapter}장 완독! 찰스가 기뻐합니다 🐑🌿`);
      RetroAudio.success();

      const afterStage = StorageService.getCharlesStage();
      if (afterStage > beforeStage) {
        setTimeout(() => {
          this.showToast(`🎉 찰스 성장! [${CHARLES_STAGES[afterStage].title}]`);
        }, 800);
      }

      this.updateReaderCompleteBtn();
      this.updateBookCardProgress(bookId);
      this.renderHome();
      this.renderStats();
    }
  },

  updateReaderCompleteBtn() {
    const completeBtn = document.getElementById('reader-btn-complete-next');
    if (!completeBtn) return;

    const isLast = this.currentReadingBookId === 'REV' && this.currentReadingChapter === 22;
    const isRead = StorageService.isChapterRead(this.currentReadingBookId, this.currentReadingChapter);

    if (isLast) {
      completeBtn.textContent = isRead ? '✓ 신약 전체 완독 완료 👑' : '✓ 다 읽고 신약 완독하기 👑';
    } else {
      completeBtn.textContent = isRead ? '다음 장으로 ➔' : '✓ 다 읽고 다음 장으로 ➔';
    }
  },

  adjustFontSize(delta) {
    this.readerFontSize = Math.max(13, Math.min(24, this.readerFontSize + delta));
    document.documentElement.style.setProperty('--reader-font-size', `${this.readerFontSize}px`);
    localStorage.setItem('charles_reader_font_size', this.readerFontSize);
  },

  // ==================== 통계 탭 렌더링 ====================
  renderStats() {
    const stats = StorageService.getStats();
    const streak = StorageService.getStreakInfo();
    const achievements = StorageService.getAchievements();

    const totalEl = document.getElementById('stats-total-read');
    if (totalEl) totalEl.textContent = `${stats.totalRead} / ${stats.totalChapters} 장 (${stats.percent}%)`;

    const fillEl = document.getElementById('stats-progress-fill');
    if (fillEl) fillEl.style.width = `${stats.percent}%`;

    const otFill = document.getElementById('stats-ot-fill');
    if (otFill) otFill.style.width = `${stats.otPercent}%`;
    const otLabel = document.getElementById('stats-ot-label');
    if (otLabel) otLabel.textContent = `${stats.otRead}/${stats.otTotal} (${stats.otPercent}%)`;

    const ntFill = document.getElementById('stats-nt-fill');
    if (ntFill) ntFill.style.width = `${stats.ntPercent}%`;
    const ntLabel = document.getElementById('stats-nt-label');
    if (ntLabel) ntLabel.textContent = `${stats.ntRead}/${stats.ntTotal} (${stats.ntPercent}%)`;

    const streakEl = document.getElementById('stats-streak-val');
    if (streakEl) streakEl.textContent = `${streak.count}일 연속 (최대 ${streak.maxStreak}일)`;

    const badgeContainer = document.getElementById('stats-badge-list');
    if (badgeContainer) {
      badgeContainer.innerHTML = achievements.map(ach => `
        <div class="badge-clean-item ${ach.unlocked ? '' : 'locked'}">
          <div class="badge-header">
            <span class="badge-icon">${ach.icon}</span>
            <span class="badge-name">${ach.name}</span>
          </div>
          <span class="badge-desc">${ach.desc}</span>
          <span style="font-size: 10px; font-weight: 700; color: ${ach.unlocked ? '#000' : '#888'};">
            ${ach.unlocked ? '✓ 획득 완료' : '🔒 잠김'}
          </span>
        </div>
      `).join('');
    }
  },

  // ==================== 5. 내 정보 (프로필 & 달력) 탭 렌더링 ====================
  renderProfile() {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    // 1) 유저 기본 정보
    const nickEl = document.getElementById('profile-user-nickname');
    if (nickEl) nickEl.textContent = user.nickname || user.name || '성도님';

    const subEl = document.getElementById('profile-user-sub');
    if (subEl) {
      const cellText = user.cell ? `${user.cell}` : '일반';
      const nameText = user.name ? ` (${user.name})` : '';
      subEl.textContent = `${cellText}${nameText}`;
    }

    // 2) 찰스 상태 뱃지
    const badgeEl = document.getElementById('profile-charles-badge');
    if (badgeEl) {
      const stage = StorageService.getCharlesStage();
      const info = CHARLES_STAGES[stage];
      badgeEl.textContent = `${stage}단계 · ${info.name} 🌿`;
    }

    // 3) 3대 통독 지표
    const todayStatEl = document.getElementById('profile-stat-today');
    if (todayStatEl) {
      todayStatEl.textContent = `${StorageService.getTodayReadCount()}장`;
    }

    const streakStatEl = document.getElementById('profile-stat-streak');
    if (streakStatEl) {
      const streak = StorageService.getStreakInfo();
      streakStatEl.textContent = `${streak.count}일`;
    }

    const totalStatEl = document.getElementById('profile-stat-total');
    if (totalStatEl) {
      const stats = StorageService.getStats();
      totalStatEl.textContent = `${stats.ntRead} / 260장`;
    }

    // 4) 달력 렌더링
    this.renderReadingCalendar(this.calendarYear, this.calendarMonth);
  },

  renderReadingCalendar(year, month) {
    const titleEl = document.getElementById('calendar-month-title');
    const gridEl = document.getElementById('calendar-days-grid');
    if (!titleEl || !gridEl) return;

    titleEl.textContent = `${year}년 ${month}월`;

    // 1일의 요일 (0: 일요일, 6: 토요일)
    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    // 해당 월의 총 일수
    const totalDays = new Date(year, month, 0).getDate();

    const todayStr = StorageService.getTodayDateStr();
    let html = '';

    // 1일 이전의 빈 칸
    for (let i = 0; i < firstDayIndex; i++) {
      html += `<div class="calendar-day empty"></div>`;
    }

    // 1일부터 말일까지 셀 생성
    for (let day = 1; day <= totalDays; day++) {
      const mStr = String(month).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;

      const count = StorageService.getDailyReadCount(dateStr);

      let levelClass = 'level-0';
      if (count >= 5) levelClass = 'level-3';
      else if (count >= 3) levelClass = 'level-2';
      else if (count >= 1) levelClass = 'level-1';

      const isToday = dateStr === todayStr;
      const isSelected = this.selectedDateStr === dateStr;

      html += `
        <div class="calendar-day ${levelClass} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
             onclick="App.selectCalendarDate('${dateStr}', ${count})"
             title="${dateStr}: ${count}장 통독">
          <span>${day}</span>
          ${count > 0 ? `<span class="calendar-day-count">${count}장</span>` : ''}
        </div>
      `;
    }

    gridEl.innerHTML = html;
  },

  selectCalendarDate(dateStr, count) {
    this.selectedDateStr = dateStr;
    const infoEl = document.getElementById('calendar-selected-info');
    if (infoEl) {
      if (count > 0) {
        infoEl.innerHTML = `<strong>${dateStr}</strong>: 총 <strong>${count}장</strong>의 말씀을 통독했어요! 🌿✨`;
      } else {
        infoEl.innerHTML = `<strong>${dateStr}</strong>: 통독 기록이 없습니다. (0장)`;
      }
    }

    // 선택된 셀 포커스 갱신
    document.querySelectorAll('.calendar-day').forEach(el => {
      if (el.getAttribute('title') && el.getAttribute('title').startsWith(dateStr)) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });
  },

  changeCalendarMonth(delta) {
    let m = this.calendarMonth + delta;
    let y = this.calendarYear;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    this.calendarYear = y;
    this.calendarMonth = m;
    this.renderReadingCalendar(y, m);
  },

  resetCalendarToToday() {
    const now = new Date();
    this.calendarYear = now.getFullYear();
    this.calendarMonth = now.getMonth() + 1;
    this.selectedDateStr = StorageService.getTodayDateStr();
    this.renderReadingCalendar(this.calendarYear, this.calendarMonth);
    const count = StorageService.getDailyReadCount(this.selectedDateStr);
    this.selectCalendarDate(this.selectedDateStr, count);
  },

  // ==================== 설정 탭 렌더링 ====================
  renderSettings() {
    const user = AuthService.getCurrentUser();
    const idEl = document.getElementById('settings-user-id');
    if (idEl && user) {
      idEl.textContent = user.id || '-';
    }
    const nameEl = document.getElementById('settings-user-name');
    if (nameEl && user) {
      nameEl.textContent = user.name || '찰스';
    }
    const nickEl = document.getElementById('settings-user-nickname');
    if (nickEl && user) {
      nickEl.textContent = user.nickname || user.name || '-';
    }
    const cellEl = document.getElementById('settings-user-cell');
    if (cellEl && user) {
      cellEl.textContent = user.cell || '일반';
    }
    const regDateEl = document.getElementById('settings-reg-date');
    if (regDateEl && user) {
      regDateEl.textContent = user.registeredAt ? user.registeredAt.slice(0, 10) : '-';
    }
  },

  // ==================== 소식 및 알림 관리 ====================
  getNotifications() {
    const defaultNotifs = [
      {
        id: 'n1',
        icon: '🐑',
        text: '서원경 청년부 양떼목장에 오신 것을 환영합니다!',
        time: '방금 전',
        read: false
      },
      {
        id: 'n2',
        icon: '📖',
        text: '말씀양 찰스가 오늘의 성경 통독을 기다리고 있어요.',
        time: '오늘',
        read: false
      },
      {
        id: 'n3',
        icon: '🌿',
        text: '오늘 하루도 말씀 안에서 승리하는 청년부가 되길 축복합니다 ✨',
        time: '오늘',
        read: true
      }
    ];

    const saved = localStorage.getItem('charles_notifications');
    if (!saved) {
      localStorage.setItem('charles_notifications', JSON.stringify(defaultNotifs));
      return defaultNotifs;
    }
    try {
      let parsed = JSON.parse(saved);
      // 예시 친구(다윗, 에스더 등) 언급 알림 완전 제거
      parsed = parsed.filter(n => n && n.text && !n.text.includes('다윗') && !n.text.includes('에스더') && !n.text.includes('친구로 추가'));
      if (parsed.length === 0) {
        parsed = defaultNotifs;
      }
      localStorage.setItem('charles_notifications', JSON.stringify(parsed));
      return parsed;
    } catch (e) {
      return defaultNotifs;
    }
  },

  addNotification(notif) {
    const notifs = this.getNotifications();
    notifs.unshift(notif);
    localStorage.setItem('charles_notifications', JSON.stringify(notifs));
    this.updateUnreadNotificationDot();
  },

  updateUnreadNotificationDot() {
    const dot = document.querySelector('.msg-unread-dot');
    if (!dot) return;
    const notifs = this.getNotifications();
    const hasUnread = notifs.some(n => !n.read);
    dot.style.display = hasUnread ? 'block' : 'none';
  },

  renderNotifications() {
    const listEl = document.getElementById('notifications-list');
    if (!listEl) return;

    const notifs = this.getNotifications();
    this.updateUnreadNotificationDot();

    if (notifs.length === 0) {
      listEl.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 32px 0; font-size: 13px;">새로운 알림이 없습니다.</div>';
      return;
    }

    listEl.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.read ? 'read' : 'unread'}" onclick="App.markNotifRead('${n.id}')" style="cursor: pointer; padding: 10px 8px; border-radius: 8px; margin-bottom: 6px; ${n.read ? '' : 'background: var(--color-badge-bg);'}">
        <div class="notif-icon">${n.icon}</div>
        <div class="notif-content">
          <div class="notif-text" style="${n.read ? 'color: var(--text-muted);' : 'font-weight: 600;'}">${n.text}</div>
          <div class="notif-time">${n.time}</div>
        </div>
        ${!n.read ? '<span style="width: 7px; height: 7px; border-radius: 50%; background: #E74C3C; display: inline-block; margin-top: 4px; flex-shrink: 0;"></span>' : ''}
      </div>
    `).join('');
  },

  markNotifRead(id) {
    const notifs = this.getNotifications();
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('charles_notifications', JSON.stringify(updated));
    this.renderNotifications();
    this.updateUnreadNotificationDot();
  },

  showToast(message) {
    const existing = document.querySelector('.celebrate-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'celebrate-toast';
    toast.textContent = message;
    document.getElementById('app-container').appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 1500);
  }
};
