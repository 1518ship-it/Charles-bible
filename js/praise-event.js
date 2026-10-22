/**
 * Charles' Bible - 찬양집회 콜라보 이벤트 컨트롤러 (Praise Event Controller)
 * [13곡 투표, 실시간 머리 위 배너 피팅룸, 옵션 B 1회 투표 정책, 실시간 득표율 랭킹, 관리자 테스트 도구]
 */

const PRAISE_SONGS = [
  { id: 'living_hope', num: 1, title: '주 예수 나의 산 소망', bannerId: 'banner_living_hope', bannerName: '산 소망 머리띠 배너', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)', keyword: '하늘빛 소망 ✝️', desc: '내 모든 삶의 소망 되신 주 예수 그리스도' },
  { id: 'king_god', num: 2, title: '왕이신 하나님', bannerId: 'banner_king_god', bannerName: '왕이신 하나님 왕관 배너', color: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', keyword: '영광의 보좌 👑', desc: '온 땅과 만물의 주재 되신 왕께 영광을' },
  { id: 'thank_god', num: 3, title: 'I Thank God', bannerId: 'banner_thank_god', bannerName: 'I Thank God 기쁨 배너', color: '#f97316', glow: 'rgba(249, 115, 22, 0.4)', keyword: '기쁨의 감사 🔥', desc: '놀라운 구원의 은혜를 온 맘 다해 기뻐 감사해' },
  { id: 'rock_ages', num: 4, title: '만세반석', bannerId: 'banner_rock_ages', bannerName: '만세반석 든든 배너', color: '#b45309', glow: 'rgba(180, 83, 9, 0.4)', keyword: '견고한 반석 🪨', desc: '영원히 흔들리지 않는 구원의 피난처' },
  { id: 'only_jesus', num: 5, title: '오직 예수', bannerId: 'banner_only_jesus', bannerName: '오직 예수 순결 배너', color: '#2563eb', glow: 'rgba(37, 99, 235, 0.4)', keyword: '오직 주만 ✝️', desc: '다른 이름은 없네, 오직 예수 그리스도' },
  { id: 'whisper_love', num: 6, title: '사랑한다 말하시네', bannerId: 'banner_whisper_love', bannerName: '사랑의 음성 배너', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)', keyword: '따스한 사랑 💖', desc: '지친 내 영혼을 포근히 안으시는 주님의 음성' },
  { id: 'all_my_possession', num: 7, title: '나의 모습 나의 소유', bannerId: 'banner_all_my_possession', bannerName: '온 맘 다해 배너', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', keyword: '전심의 헌신 🤲', desc: '나의 모든 것 주께 드리며 주만 따르리' },
  { id: 'love_more', num: 8, title: '우리가 주를 더욱 사랑하고', bannerId: 'banner_love_more', bannerName: '주 사랑 배너', color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)', keyword: '더욱 사랑 💕', desc: '주를 향한 첫사랑을 회복하며 더욱 사랑하리' },
  { id: 'rejoice_lord', num: 9, title: '주안에서 기뻐해', bannerId: 'banner_rejoice_lord', bannerName: '기쁨의 찬양 배너', color: '#facc15', glow: 'rgba(250, 204, 21, 0.4)', keyword: '항상 기뻐함 🎵', desc: '어떤 상황에서도 주님 안에서 참된 기쁨을' },
  { id: 'i_am_free', num: 10, title: '나는 자유해', bannerId: 'banner_i_am_free', bannerName: '자유의 날개 배너', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', keyword: '참된 자유 🕊️', desc: '십자가 대속으로 죄의 사슬 끊고 자유해' },
  { id: 'glory_halle', num: 11, title: '영광 할렐루야', bannerId: 'banner_glory_halle', bannerName: '영광 할렐루야 배너', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', keyword: '보좌의 찬양 ✨', desc: '구원하심이 보좌에 앉으신 우리 하나님께 있도다' },
  { id: 'the_truth', num: 12, title: '진리', bannerId: 'banner_the_truth', bannerName: '진리의 등불 배너', color: '#4f46e5', glow: 'rgba(79, 70, 229, 0.4)', keyword: '말씀의 빛 📖', desc: '변치 않는 영원한 생명의 말씀 위에 굳게 서리' },
  { id: 'reason_life', num: 13, title: '내 삶의 이유라', bannerId: 'banner_reason_life', bannerName: '내 삶의 이유 배너', color: '#84cc16', glow: 'rgba(132, 204, 22, 0.4)', keyword: '삶의 목적 🌿', desc: '예수가 내 삶의 유일한 이유와 목적 되시네' }
];

const PraiseEventApp = {
  currentUser: null,
  selectedSongId: 'living_hope',
  userVote: null, // 기존 투표 내역 (옵션 B)
  allVotes: [],   // 전체 성도 투표 집계

  async init() {
    console.log("🎶 [PraiseEventApp] Initializing Praise Worship Event Page...");

    // 1. 현재 사용자 로드 (AuthService 세션 또는 로컬)
    await this.loadCurrentUser();

    // 2. 관리자 테스트용 회원 셀렉터 세팅
    await this.setupAdminTestToolbar();

    // 3. 사용자의 기존 투표 참여 여부 확인 (옵션 B)
    await this.checkUserVoteStatus();

    // 4. 전체 투표 집계 데이터 로드 (실시간 랭킹용)
    await this.fetchPollStatistics();

    // 5. 뷰 렌더링
    this.renderMainView();
  },

  // 1. 현재 세션 사용자 로드
  async loadCurrentUser() {
    if (typeof AuthService !== 'undefined' && AuthService.getCurrentUser) {
      this.currentUser = AuthService.getCurrentUser();
    }
    if (!this.currentUser) {
      // 비로그인 시 로컬 캐시 사용자 목록 중 첫 번째 또는 게스트
      const users = (typeof AuthService !== 'undefined') ? AuthService.getAllUsersLocal() : [];
      if (users && users.length > 0) {
        this.currentUser = users[0];
      } else {
        this.currentUser = { id: 'admin_test', name: '서원경 청년', nickname: '관리자 테스트' };
      }
    }

    const sessionChip = document.getElementById('event-session-chip');
    if (sessionChip) {
      const name = this.currentUser.nickname || this.currentUser.name || '성도';
      sessionChip.innerHTML = `<span>🐑</span> <span>참여자: <strong>${name} 성도님</strong></span>`;
    }
  },

  // 2. 관리자 테스트 도구 바 설정 (?admin=true 일 때만 노출, 일반 배포 시 완전 비노출)
  async setupAdminTestToolbar() {
    const adminBar = document.querySelector('.admin-test-bar');
    const urlParams = new URLSearchParams(window.location.search);
    const showAdmin = urlParams.get('admin') === 'true' || urlParams.get('admin') === '1';

    if (adminBar) {
      adminBar.style.display = showAdmin ? 'flex' : 'none';
    }

    if (!showAdmin) return;

    const userSelect = document.getElementById('admin-user-select');
    if (!userSelect) return;

    let users = [];
    if (typeof AuthService !== 'undefined' && AuthService.getAllUsers) {
      try {
        users = await AuthService.getAllUsers();
      } catch (e) {
        users = AuthService.getAllUsersLocal();
      }
    }
    if (!users || users.length === 0) {
      users = [this.currentUser];
    }

    userSelect.innerHTML = users.map(u => {
      const isSelected = u.id === this.currentUser.id ? 'selected' : '';
      return `<option value="${u.id}" ${isSelected}>${u.name || u.nickname} (${u.id})</option>`;
    }).join('');

    userSelect.addEventListener('change', async (e) => {
      const targetId = e.target.value;
      const targetUser = users.find(u => u.id === targetId) || { id: targetId, name: targetId, nickname: targetId };
      this.currentUser = targetUser;
      
      // 임시 세션 업데이트
      if (typeof AuthService !== 'undefined') {
        localStorage.setItem(AUTH_CONFIG.STORAGE_KEY_USER, JSON.stringify(targetUser));
      }

      await this.checkUserVoteStatus();
      this.renderMainView();
      this.loadCurrentUser();
      this.showToast(`👤 [테스트 계정 전환] ${targetUser.name || targetUser.nickname}님으로 전환되었습니다.`);
    });
  },

  // 3. 투표 참여 여부 확인 (옵션 B)
  async checkUserVoteStatus() {
    if (!this.currentUser) return;
    const uid = this.currentUser.id;
    this.userVote = null;

    // A. 로컬 스토리지 확인
    try {
      const localVoteStr = localStorage.getItem(`charles_praise_voted_${uid}`);
      if (localVoteStr) {
        this.userVote = JSON.parse(localVoteStr);
      }
    } catch (e) {}

    // B. Supabase 원격 테이블 확인 (테이블 존재 시)
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('praise_event_votes')
          .select('*')
          .eq('user_id', uid)
          .maybeSingle();

        if (!error && data) {
          this.userVote = {
            songId: data.song_id,
            songTitle: data.song_title,
            bannerId: data.banner_id,
            votedAt: data.created_at
          };
          localStorage.setItem(`charles_praise_voted_${uid}`, JSON.stringify(this.userVote));
        }
      } catch (err) {
        // 테이블 미생성 또는 오프라인 시 로컬/스토리지 상태 유지
      }
    }

    // C. user_reading_state 및 인벤토리/착용 상태로부터 투표 내역 자동 복원 (기기 변경/캐시 삭제 대응)
    if (!this.userVote) {
      let foundBannerId = null;
      // 1) 로컬 스토리지 내 장비/인벤토리
      try {
        const localEq = JSON.parse(localStorage.getItem(`charles_user_${uid}_equipped`) || '{}');
        if (localEq && localEq.banner && String(localEq.banner).startsWith('banner_')) {
          foundBannerId = localEq.banner;
        }
        if (!foundBannerId) {
          const localInv = JSON.parse(localStorage.getItem(`charles_user_${uid}_inventory`) || '[]');
          foundBannerId = localInv.find(id => String(id).startsWith('banner_'));
        }
      } catch (e) {}

      // 2) Supabase user_reading_state
      if (!foundBannerId && typeof supabaseClient !== 'undefined' && supabaseClient) {
        try {
          const { data } = await supabaseClient
            .from('user_reading_state')
            .select('equipped, inventory, daily_counts')
            .eq('user_id', uid)
            .maybeSingle();

          if (data) {
            if (data.equipped && data.equipped.banner && String(data.equipped.banner).startsWith('banner_')) {
              foundBannerId = data.equipped.banner;
            } else if (data.inventory && Array.isArray(data.inventory)) {
              foundBannerId = data.inventory.find(id => String(id).startsWith('banner_'));
            } else if (data.daily_counts && data.daily_counts.__talent_data__) {
              const td = data.daily_counts.__talent_data__;
              if (td.equipped && td.equipped.banner) foundBannerId = td.equipped.banner;
              else if (td.inventory && Array.isArray(td.inventory)) foundBannerId = td.inventory.find(id => String(id).startsWith('banner_'));
            }
          }
        } catch (e) {}
      }

      if (foundBannerId) {
        const matchedSong = PRAISE_SONGS.find(s => s.bannerId === foundBannerId);
        if (matchedSong) {
          this.userVote = {
            songId: matchedSong.id,
            songTitle: matchedSong.title,
            bannerId: matchedSong.bannerId,
            votedAt: new Date().toISOString()
          };
          try {
            localStorage.setItem(`charles_praise_voted_${uid}`, JSON.stringify(this.userVote));
          } catch (e) {}
          console.log(`✨ [PraiseEvent] 유저 [${uid}] 상태로부터 투표 내역(${matchedSong.title}) 복원 완료`);
        }
      }
    }
  },

  // 4. 전체 투표 집계 로드
  async fetchPollStatistics() {
    let votes = [];
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('praise_event_votes')
          .select('song_id');

        if (!error && Array.isArray(data) && data.length > 0) {
          votes = data;
        }
      } catch (e) {}

      // praise_event_votes 테이블이 비어있거나 미생성된 경우, user_reading_state에서 실제 지급된 배너 전체 집계
      if (votes.length === 0) {
        try {
          const { data, error } = await supabaseClient
            .from('user_reading_state')
            .select('equipped, inventory, daily_counts');

          if (!error && Array.isArray(data)) {
            data.forEach(row => {
              let bId = null;
              if (row.equipped && row.equipped.banner && String(row.equipped.banner).startsWith('banner_')) {
                bId = row.equipped.banner;
              } else if (row.inventory && Array.isArray(row.inventory)) {
                bId = row.inventory.find(id => String(id).startsWith('banner_'));
              } else if (row.daily_counts && row.daily_counts.__talent_data__) {
                const td = row.daily_counts.__talent_data__;
                if (td.equipped && td.equipped.banner) bId = td.equipped.banner;
                else if (td.inventory && Array.isArray(td.inventory)) bId = td.inventory.find(id => String(id).startsWith('banner_'));
              }

              if (bId) {
                const song = PRAISE_SONGS.find(s => s.bannerId === bId);
                if (song) {
                  votes.push({ song_id: song.id });
                }
              }
            });
          }
        } catch (e) {}
      }
    }

    // 원격 데이터가 없을 때, 현재 유저의 투표 포함 시뮬레이션
    if (votes.length === 0 && this.userVote) {
      votes = [{ song_id: this.userVote.songId }];
    }

    this.allVotes = votes;
  },

  // 5. 메인 뷰 렌더링 (옵션 B 분기: 투표 폼 vs 투표 완료 랭킹 뷰)
  renderMainView() {
    const votingSection = document.getElementById('section-voting-form');
    const votedSection = document.getElementById('section-voted-result');

    if (this.userVote) {
      // [옵션 B] 이미 투표 완료한 계정
      if (votingSection) votingSection.style.display = 'none';
      if (votedSection) {
        votedSection.style.display = 'block';
        this.renderVotedResultView();
      }
    } else {
      // [옵션 B] 최초 1회 투표 참여 폼
      if (votedSection) votedSection.style.display = 'none';
      if (votingSection) {
        votingSection.style.display = 'block';
        this.renderSongCards();
        this.updateLiveFitting(this.selectedSongId);
      }
    }
  },

  // 13곡 선택 카드 렌더링
  renderSongCards() {
    const listEl = document.getElementById('songs-list');
    if (!listEl) return;

    listEl.innerHTML = PRAISE_SONGS.map(song => {
      const isSelected = song.id === this.selectedSongId;
      const selectedClass = isSelected ? 'selected' : '';
      const bannerIcon = (typeof getAccessoryIconSvg === 'function') 
        ? getAccessoryIconSvg(song.bannerId) 
        : song.keyword;

      return `
        <div class="song-card ${selectedClass}" 
             data-song-id="${song.id}" 
             style="--card-selected-color: ${song.color}; --card-selected-glow: ${song.glow};"
             onclick="PraiseEventApp.onSelectSong('${song.id}')">
          <div class="song-num">${song.num}</div>
          <div class="song-info">
            <div class="song-title-row">
              <span class="song-title">${song.title}</span>
            </div>
            <div class="song-desc">${song.desc}</div>
          </div>
          <div class="song-banner-preview" title="${song.bannerName}">
            ${bannerIcon}
          </div>
          <div class="song-check-icon">✓</div>
        </div>
      `;
    }).join('');

    this.updateSubmitButton();
  },

  // 곡 선택 시 피팅룸 즉각 갱신
  onSelectSong(songId) {
    this.selectedSongId = songId;

    // 카드 선택 스타일 갱신
    const cards = document.querySelectorAll('.song-card');
    cards.forEach(card => {
      const isCur = card.getAttribute('data-song-id') === songId;
      card.classList.toggle('selected', isCur);
    });

    // 찰스 라이브 피팅룸 갱신
    this.updateLiveFitting(songId);
    this.updateSubmitButton();
  },

  // 실시간 찰스 피팅룸 업데이트
  updateLiveFitting(songId) {
    const song = PRAISE_SONGS.find(s => s.id === songId) || PRAISE_SONGS[0];
    const avatarSlot = document.getElementById('stage-avatar-slot');
    const titleSlot = document.getElementById('stage-selected-title');
    const tagSlot = document.getElementById('stage-selected-banner-tag');

    if (titleSlot) titleSlot.textContent = song.title;
    if (tagSlot) {
      tagSlot.style.borderColor = song.color;
      tagSlot.style.color = song.color;
      tagSlot.innerHTML = `<span>${song.keyword}</span> <span>${song.bannerName}</span>`;
    }

    if (avatarSlot && typeof renderSimplePixelGrid === 'function') {
      let stage = 1;
      if (typeof StorageService !== 'undefined' && StorageService.getCharlesStage) {
        stage = StorageService.getCharlesStage();
      }

      // 현재 착용 장비 가져오기 + 머리 위 배너 슬롯 실시간 장착
      let baseEquipped = {};
      if (typeof TalentService !== 'undefined' && TalentService.getEquipped) {
        baseEquipped = { ...(TalentService.getEquipped() || {}) };
      }
      baseEquipped.banner = song.bannerId;

      // 24x24 찰스 그리드 렌더링 (배너가 머리 위 y:0~4에 자연스럽게 표시됨)
      avatarSlot.innerHTML = renderSimplePixelGrid(stage, 6, 'charles-static', baseEquipped);
    }
  },

  // 제출 버튼 활성화
  updateSubmitButton() {
    const btn = document.getElementById('btn-submit-vote');
    if (!btn) return;

    const song = PRAISE_SONGS.find(s => s.id === this.selectedSongId);
    if (song) {
      btn.disabled = false;
      btn.innerHTML = `<span>✨</span> <span>[${song.title}] 응원 배너 받고 착용하기!</span>`;
    } else {
      btn.disabled = true;
      btn.textContent = '찬양곡을 선택해 주세요';
    }
  },

  // 투표 제출 & 보상 지급
  async submitVote() {
    const song = PRAISE_SONGS.find(s => s.id === this.selectedSongId);
    if (!song || !this.currentUser) return;

    const btn = document.getElementById('btn-submit-vote');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '배너 제작 및 선물 중... 🎁';
    }

    const uid = this.currentUser.id;
    const voteRecord = {
      songId: song.id,
      songTitle: song.title,
      bannerId: song.bannerId,
      votedAt: new Date().toISOString()
    };

    // 1. 로컬에 1회 투표 내역 저장
    localStorage.setItem(`charles_praise_voted_${uid}`, JSON.stringify(voteRecord));
    this.userVote = voteRecord;

    // 2. Supabase 클라우드 투표 테이블에 저장
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        await supabaseClient
          .from('praise_event_votes')
          .upsert({
            user_id: uid,
            user_name: this.currentUser.name || this.currentUser.nickname,
            cell: this.currentUser.cell || '',
            song_id: song.id,
            song_title: song.title,
            banner_id: song.bannerId,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        console.log("☁️ [PraiseEvent] Vote successfully recorded in Supabase!");
      } catch (err) {
        console.warn("⚠️ [PraiseEvent] Supabase vote save failed, local vote preserved:", err);
      }
    }

    // 3. 찰스 인벤토리에 배너 아이템 영구 지급 & 자동 착용!
    if (typeof TalentService !== 'undefined') {
      const inv = TalentService.getInventory();
      if (!inv.includes(song.bannerId)) {
        inv.push(song.bannerId);
        TalentService.saveInventory(inv);
      }
      TalentService.equipItem(song.bannerId);

      // 클라우드 동기화 (홈 화면 및 친구 양떼목장에 즉각 반영)
      if (typeof StorageService !== 'undefined' && StorageService.saveToCloud) {
        StorageService.saveToCloud();
      }
    }

    // 4. 축하 파티클 발생 및 모달 팝업 오픈
    this.triggerConfetti();
    this.openSuccessModal(song);

    // 5. 집계 재로딩
    await this.fetchPollStatistics();
  },

  // 축하 모달 오픈
  openSuccessModal(song) {
    const modal = document.getElementById('event-success-modal');
    if (!modal) return;

    const nameSlot = document.getElementById('modal-banner-name');
    const songSlot = document.getElementById('modal-song-title');
    const avatarSlot = document.getElementById('modal-celebrate-avatar');

    if (nameSlot) nameSlot.textContent = song.bannerName;
    if (songSlot) songSlot.textContent = `"${song.title}"`;

    if (avatarSlot && typeof renderSimplePixelGrid === 'function') {
      const stage = (typeof StorageService !== 'undefined') ? StorageService.getCharlesStage() : 1;
      let baseEquipped = {};
      if (typeof TalentService !== 'undefined') {
        baseEquipped = { ...(TalentService.getEquipped() || {}) };
      }
      baseEquipped.banner = song.bannerId;
      avatarSlot.innerHTML = renderSimplePixelGrid(stage, 5, 'charles-static', baseEquipped);
    }

    modal.style.display = 'flex';
  },

  closeSuccessModal() {
    const modal = document.getElementById('event-success-modal');
    if (modal) modal.style.display = 'none';

    // 모달 닫힌 후 [옵션 B] 결과 뷰로 전환
    this.renderMainView();
  },

  toggleRanking() {
    const section = document.getElementById('poll-ranking-section');
    if (section) {
      const isHidden = (section.style.display === 'none' || getComputedStyle(section).display === 'none');
      section.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        this.renderPollRankingChart();
      }
    }
  },

  // [옵션 B] 이미 투표 완료한 계정 전용 결과 뷰
  renderVotedResultView() {
    if (!this.userVote) return;
    const song = PRAISE_SONGS.find(s => s.id === this.userVote.songId) || PRAISE_SONGS[0];

    const chosenSongName = document.getElementById('voted-chosen-song-name');
    const chosenBannerName = document.getElementById('voted-chosen-banner-name');
    const chosenAvatar = document.getElementById('voted-stage-avatar');

    if (chosenSongName) chosenSongName.textContent = song.title;
    if (chosenBannerName) chosenBannerName.innerHTML = `${song.keyword} <strong>${song.bannerName}</strong>`;

    if (chosenAvatar && typeof renderSimplePixelGrid === 'function') {
      const stage = (typeof StorageService !== 'undefined') ? StorageService.getCharlesStage() : 1;
      let equipped = {};
      if (typeof TalentService !== 'undefined') {
        equipped = { ...(TalentService.getEquipped() || {}) };
      }
      equipped.banner = song.bannerId;
      chosenAvatar.innerHTML = renderSimplePixelGrid(stage, 6, 'charles-static', equipped);
    }

    // 실시간 득표율 랭킹 차트 렌더링
    this.renderPollRankingChart();
  },

  // 실시간 득표율 랭킹 차트 (1~13위)
  renderPollRankingChart() {
    const container = document.getElementById('poll-ranking-list');
    const totalCountEl = document.getElementById('poll-total-count');
    if (!container) return;

    // 각 찬양별 득표수 계산
    const counts = {};
    PRAISE_SONGS.forEach(s => counts[s.id] = 0);

    let totalVotes = this.allVotes.length;
    this.allVotes.forEach(v => {
      if (counts[v.song_id] !== undefined) {
        counts[v.song_id]++;
      }
    });

    if (totalCountEl) {
      totalCountEl.textContent = `총 ${totalVotes.toLocaleString()}명 참여`;
    }

    // 득표순 정렬 (동점 시 곡 번호 순)
    const sorted = [...PRAISE_SONGS].sort((a, b) => {
      const diff = (counts[b.id] || 0) - (counts[a.id] || 0);
      return diff !== 0 ? diff : a.num - b.num;
    });

    container.innerHTML = sorted.map((s, idx) => {
      const voteCount = counts[s.id] || 0;
      const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
      const rank = idx + 1;
      const rankClass = rank <= 3 ? `rank-${rank}` : '';
      const isMyPick = this.userVote && this.userVote.songId === s.id;
      const myPickBadge = isMyPick ? `<span style="font-size: 10px; background: rgba(250, 204, 21, 0.2); color: #facc15; padding: 1px 6px; border-radius: 8px; border: 1px solid #facc15; margin-left: 6px;">내 선택 ✓</span>` : '';

      return `
        <div class="poll-item ${rankClass}">
          <div class="poll-item-header">
            <span class="poll-item-rank">${rank}위</span>
            <span class="poll-item-title">${s.title} ${myPickBadge}</span>
            <span class="poll-item-votes">${voteCount}표 (${pct}%)</span>
          </div>
          <div class="poll-bar-track">
            <div class="poll-bar-fill" style="width: ${pct}%; --bar-color: ${s.color};"></div>
          </div>
        </div>
      `;
    }).join('');
  },

  // 🧪 관리자 테스트 기능: 현재 유저 투표 초기화 (재테스트용)
  async adminResetVote() {
    if (!this.currentUser) return;
    const uid = this.currentUser.id;

    if (!confirm(`[관리자 테스트]\n'${this.currentUser.name || this.currentUser.nickname}' 성도님의 투표 내역을 초기화하고 다시 투표를 진행하시겠습니까?`)) {
      return;
    }

    // 로컬 투표 삭제
    localStorage.removeItem(`charles_praise_voted_${uid}`);
    this.userVote = null;

    // Supabase 투표 삭제
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        await supabaseClient
          .from('praise_event_votes')
          .delete()
          .eq('user_id', uid);
      } catch (e) {}
    }

    await this.fetchPollStatistics();
    this.renderMainView();
    this.showToast("🔄 투표가 초기화되어 다시 찬양곡을 선택할 수 있습니다!");
  },

  // 축하 파티클 이펙트
  triggerConfetti() {
    const emojis = ['🎶', '✨', '✝️', '💖', '👑', '🕊️', '🎵', '🌿'];
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div');
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.cssText = `
        position: fixed;
        left: ${15 + Math.random() * 70}vw;
        top: 60vh;
        font-size: ${18 + Math.random() * 16}px;
        pointer-events: none;
        z-index: 9999;
        transition: transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 1.2s ease;
      `;
      document.body.appendChild(p);

      const dx = (Math.random() - 0.5) * 200;
      const dy = -(120 + Math.random() * 220);

      requestAnimationFrame(() => {
        p.style.transform = `translate(${dx}px, ${dy}px) scale(1.3) rotate(${Math.random() * 60 - 30}deg)`;
        p.style.opacity = '0';
      });

      setTimeout(() => p.remove(), 1200);
    }
  },

  showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(24, 24, 27, 0.95);
      border: 1px solid #facc15;
      color: #f4f4f5;
      padding: 10px 18px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
      z-index: 10000;
      animation: modal-pop 0.25s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
};

// DOM 로드 완료 시 앱 실행
document.addEventListener('DOMContentLoaded', () => {
  PraiseEventApp.init();
});
