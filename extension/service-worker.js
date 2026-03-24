/**
 * ReviewPilot Service Worker
 * Content Script ↔ Next.js API 통신 중개
 * 토큰 기반 인증 처리
 */

// ─── 설정 헬퍼 ───────────────────────────────────────────────

/** chrome.storage.sync에서 API URL과 토큰을 읽어오는 헬퍼 */
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['apiUrl', 'token'], (result) => {
      resolve({
        apiUrl: result.apiUrl || '',
        token: result.token || '',
      });
    });
  });
}

/** API 호출 공통 래퍼 */
async function apiFetch(path, options = {}) {
  const { apiUrl, token } = await getSettings();

  if (!apiUrl || !token) {
    throw new Error('API URL 또는 토큰이 설정되지 않았습니다.');
  }

  const url = `${apiUrl.replace(/\/$/, '')}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    throw new Error('인증 실패: 토큰이 유효하지 않습니다.');
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`API 오류 (${response.status}): ${errorBody || response.statusText}`);
  }

  return response.json();
}

// ─── 메시지 핸들러 ───────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 비동기 응답을 위해 true 반환
  handleMessage(message)
    .then((result) => sendResponse({ success: true, data: result }))
    .catch((error) => sendResponse({ success: false, error: error.message }));
  return true;
});

/** 메시지 타입별 분기 처리 */
async function handleMessage(message) {
  switch (message.type) {
    case 'GENERATE_RESPONSE':
      return handleGenerateResponse(message.payload);

    case 'BULK_GENERATE':
      return handleBulkGenerate(message.payload);

    case 'GET_TEMPLATES':
      return handleGetTemplates();

    case 'GET_STATUS':
      return handleGetStatus();

    case 'VERIFY_CONNECTION':
      return handleVerifyConnection();

    default:
      throw new Error(`알 수 없는 메시지 타입: ${message.type}`);
  }
}

// ─── 핸들러 구현 ─────────────────────────────────────────────

/** 단일 리뷰 응답 생성 — Extension 전용 원스텝 API 사용 */
async function handleGenerateResponse(payload) {
  const { reviewContent, rating, tone, productName } = payload;

  const result = await apiFetch('/api/extension/generate', {
    method: 'POST',
    body: JSON.stringify({
      content: reviewContent,
      rating,
      tone: tone || 'friendly',
      productName: productName || '',
    }),
  });

  return result;
}

/** 일괄 응답 생성 */
async function handleBulkGenerate(payload) {
  const { reviews, tone } = payload;

  const result = await apiFetch('/api/reviews/bulk-generate', {
    method: 'POST',
    body: JSON.stringify({
      reviews,
      tone: tone || 'friendly',
      source: 'extension',
    }),
  });

  return result;
}

/** 템플릿 목록 조회 */
async function handleGetTemplates() {
  return apiFetch('/api/templates', { method: 'GET' });
}

/** 연결 상태 + 현재 톤 조회 */
async function handleGetStatus() {
  const [verifyResult, toneResult] = await Promise.all([
    apiFetch('/api/auth/verify', { method: 'GET' }),
    apiFetch('/api/settings/tone', { method: 'GET' }).catch(() => ({ tone: 'friendly' })),
  ]);

  return {
    connected: true,
    tone: toneResult.tone || 'friendly',
    ...verifyResult,
  };
}

/** 토큰 검증 */
async function handleVerifyConnection() {
  const result = await apiFetch('/api/auth/verify', { method: 'GET' });
  return { connected: true, ...result };
}
