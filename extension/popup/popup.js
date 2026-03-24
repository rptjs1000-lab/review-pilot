/**
 * ReviewPilot Popup 스크립트
 * - 연결 상태 확인
 * - 톤 선택 / 저장
 * - 일괄 응답 생성
 * - 토큰 설정
 */

(function () {
  'use strict';

  // ─── DOM 요소 참조 ───────────────────────────────────────────

  const $ = (sel) => document.getElementById(sel);

  const els = {
    // 상태
    connectionStatus: $('connectionStatus'),
    statusDot: null, // 초기화 시 설정
    statusText: $('statusText'),
    // 섹션
    setupForm: $('setupForm'),
    notSmartstore: $('notSmartstore'),
    fullFeatures: $('fullFeatures'),
    // 설정 폼
    apiUrlInput: $('apiUrlInput'),
    tokenInput: $('tokenInput'),
    connectBtn: $('connectBtn'),
    // 기능
    pendingCount: $('pendingCount'),
    respondedCount: $('respondedCount'),
    toneSelect: $('toneSelect'),
    bulkGenerateBtn: $('bulkGenerateBtn'),
    // 링크
    dashboardLink: $('dashboardLink'),
    tokenSettingsBtn: $('tokenSettingsBtn'),
    helpLink: $('helpLink'),
  };

  // ─── 초기화 ──────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', async () => {
    els.statusDot = els.connectionStatus.querySelector('.reviewpilot-status-dot');

    // 저장된 설정 로드
    const settings = await loadSettings();

    // 설정 폼에 기존 값 채우기
    if (settings.apiUrl) els.apiUrlInput.value = settings.apiUrl;
    if (settings.token) els.tokenInput.value = settings.token;
    if (settings.tone) els.toneSelect.value = settings.tone;

    // 이벤트 바인딩
    bindEvents();

    // 연결 상태 확인
    if (settings.apiUrl && settings.token) {
      await checkConnection();
    } else {
      showDisconnected();
    }
  });

  // ─── 이벤트 바인딩 ───────────────────────────────────────────

  function bindEvents() {
    // 연결 버튼
    els.connectBtn.addEventListener('click', handleConnect);

    // 톤 변경
    els.toneSelect.addEventListener('change', handleToneChange);

    // 일괄 응답 생성
    els.bulkGenerateBtn.addEventListener('click', handleBulkGenerate);

    // 대시보드 열기
    els.dashboardLink.addEventListener('click', handleOpenDashboard);

    // 토큰 설정 토글
    els.tokenSettingsBtn.addEventListener('click', handleToggleSettings);

    // 도움말
    els.helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      // 도움말 페이지가 있으면 열기, 없으면 대시보드로
      loadSettings().then((settings) => {
        const url = settings.apiUrl ? `${settings.apiUrl}/help` : 'https://reviewpilot.kr';
        chrome.tabs.create({ url });
      });
    });

    // Enter 키로 연결
    els.tokenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleConnect();
    });
  }

  // ─── 설정 로드/저장 ──────────────────────────────────────────

  function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['apiUrl', 'token', 'tone'], (result) => {
        resolve({
          apiUrl: result.apiUrl || '',
          token: result.token || '',
          tone: result.tone || 'friendly',
        });
      });
    });
  }

  function saveSettings(data) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(data, resolve);
    });
  }

  // ─── 연결 처리 ───────────────────────────────────────────────

  async function handleConnect() {
    const apiUrl = els.apiUrlInput.value.trim();
    const token = els.tokenInput.value.trim();

    if (!apiUrl) {
      els.apiUrlInput.focus();
      els.apiUrlInput.style.borderColor = '#EF4444';
      setTimeout(() => { els.apiUrlInput.style.borderColor = ''; }, 2000);
      return;
    }

    if (!token) {
      els.tokenInput.focus();
      els.tokenInput.style.borderColor = '#EF4444';
      setTimeout(() => { els.tokenInput.style.borderColor = ''; }, 2000);
      return;
    }

    // 저장
    await saveSettings({ apiUrl: apiUrl.replace(/\/$/, ''), token });

    // 연결 확인
    els.connectBtn.disabled = true;
    els.connectBtn.textContent = '연결 중...';

    await checkConnection();

    els.connectBtn.disabled = false;
    els.connectBtn.textContent = '연결';
  }

  async function checkConnection() {
    setStatusLoading();

    try {
      const response = await sendToServiceWorker({ type: 'VERIFY_CONNECTION' });

      if (response.success) {
        showConnected();
        await checkCurrentTab();
      } else {
        showDisconnected(response.error);
      }
    } catch (error) {
      showDisconnected(error.message);
    }
  }

  // ─── 현재 탭 확인 ───────────────────────────────────────────

  async function checkCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.url) {
        showNotSmartstore();
        return;
      }

      const isSmartstore = tab.url.includes('sell.smartstore.naver.com');

      if (!isSmartstore) {
        showNotSmartstore();
        return;
      }

      // 스마트스토어 페이지 — 리뷰 카운트 요청
      showFullFeatures();

      try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_REVIEW_COUNTS' });
        if (response) {
          els.pendingCount.textContent = response.pending ?? '-';
          els.respondedCount.textContent = response.responded ?? '-';
        }
      } catch {
        // Content script가 아직 로드되지 않았을 수 있음
        els.pendingCount.textContent = '-';
        els.respondedCount.textContent = '-';
      }
    } catch {
      showNotSmartstore();
    }
  }

  // ─── UI 상태 전환 ────────────────────────────────────────────

  function setStatusLoading() {
    els.statusDot.className = 'reviewpilot-status-dot reviewpilot-status-loading';
    els.statusText.textContent = '연결 확인 중...';
  }

  function showConnected() {
    els.statusDot.className = 'reviewpilot-status-dot reviewpilot-status-connected';
    els.statusText.textContent = '연결됨';
    els.setupForm.style.display = 'none';
  }

  function showDisconnected(errorMsg) {
    els.statusDot.className = 'reviewpilot-status-dot reviewpilot-status-disconnected';
    els.statusText.textContent = errorMsg || '연결 안 됨';
    els.setupForm.style.display = 'block';
    els.notSmartstore.style.display = 'none';
    els.fullFeatures.style.display = 'none';
  }

  function showNotSmartstore() {
    els.notSmartstore.style.display = 'block';
    els.fullFeatures.style.display = 'none';
  }

  function showFullFeatures() {
    els.notSmartstore.style.display = 'none';
    els.fullFeatures.style.display = 'block';
  }

  // ─── 톤 변경 ─────────────────────────────────────────────────

  async function handleToneChange() {
    const tone = els.toneSelect.value;
    await saveSettings({ tone });

    // Content script에도 알림
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_TONE', tone }).catch(() => {});
      }
    } catch {
      // 무시
    }
  }

  // ─── 일괄 응답 생성 ──────────────────────────────────────────

  async function handleBulkGenerate() {
    els.bulkGenerateBtn.disabled = true;
    els.bulkGenerateBtn.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite"></span> 생성 중...';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        await chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_BULK_GENERATE' });
      }
    } catch (error) {
      console.error('[ReviewPilot Popup] 일괄 생성 오류:', error);
    }

    // 잠시 후 버튼 복원
    setTimeout(() => {
      els.bulkGenerateBtn.disabled = false;
      els.bulkGenerateBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
        일괄 응답 생성
      `;
    }, 2000);
  }

  // ─── 대시보드 열기 ───────────────────────────────────────────

  async function handleOpenDashboard(e) {
    e.preventDefault();
    const settings = await loadSettings();
    const url = settings.apiUrl || 'https://reviewpilot.kr';
    chrome.tabs.create({ url: `${url}/dashboard` });
  }

  // ─── 토큰 설정 토글 ─────────────────────────────────────────

  function handleToggleSettings() {
    const isVisible = els.setupForm.style.display !== 'none';
    els.setupForm.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
      els.apiUrlInput.focus();
    }
  }

  // ─── Service Worker 통신 ─────────────────────────────────────

  function sendToServiceWorker(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            error: chrome.runtime.lastError.message || 'Extension 통신 오류',
          });
        } else {
          resolve(response || { success: false, error: '응답 없음' });
        }
      });
    });
  }
})();
