/**
 * ReviewPilot Content Script
 * 네이버 스마트스토어 리뷰 관리 페이지에서 동작
 * - 미응답 리뷰에 "AI 응답 생성" 버튼 주입
 * - 응답 자동 입력
 * - MutationObserver로 SPA 라우팅 대응
 */

(function () {
  'use strict';

  // ─── 기본 셀렉터 (추정값, 커스터마이징 가능) ─────────────────

  const DEFAULT_SELECTORS = {
    // 리뷰 목록 페이지 판별
    reviewPageIndicator: '[class*="review"], [data-testid*="review"], .review-list, #reviewList',
    // 개별 리뷰 아이템 컨테이너
    reviewItem: '[class*="review-item"], [class*="ReviewItem"], tr[class*="review"], .review-row',
    // 리뷰 본문 텍스트
    reviewContent: '[class*="review-content"], [class*="ReviewContent"], .review-text, td.content',
    // 리뷰 별점
    reviewRating: '[class*="rating"], [class*="star"], .star-rating',
    // 상품명
    productName: '[class*="product-name"], [class*="ProductName"], .product-title',
    // 응답 입력 영역 (textarea 또는 contenteditable)
    replyInput: 'textarea[class*="reply"], textarea[class*="answer"], [contenteditable="true"][class*="reply"]',
    // 응답 상태 (이미 응답 완료된 리뷰 판별)
    respondedIndicator: '[class*="replied"], [class*="answered"], .reply-complete, .responded',
    // 답변 등록 버튼
    submitButton: 'button[class*="reply-submit"], button[class*="answer-submit"]',
  };

  let selectors = { ...DEFAULT_SELECTORS };
  let currentTone = 'friendly';
  let isProcessing = false;
  let observer = null;

  // ─── 초기화 ──────────────────────────────────────────────────

  async function init() {
    // 커스텀 셀렉터 로드
    await loadCustomSelectors();
    // 현재 톤 로드
    await loadCurrentTone();

    // 리뷰 페이지인지 확인 후 UI 주입
    if (isReviewPage()) {
      injectUI();
    }

    // SPA 라우팅 변경 감지
    observeRouteChanges();
  }

  /** chrome.storage에서 커스텀 셀렉터 로드 */
  async function loadCustomSelectors() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['customSelectors'], (result) => {
        if (result.customSelectors) {
          selectors = { ...DEFAULT_SELECTORS, ...result.customSelectors };
        }
        resolve(undefined);
      });
    });
  }

  /** chrome.storage에서 현재 톤 로드 */
  async function loadCurrentTone() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['tone'], (result) => {
        currentTone = result.tone || 'friendly';
        resolve(undefined);
      });
    });
  }

  // ─── 페이지 감지 ─────────────────────────────────────────────

  /** 현재 페이지가 리뷰 관리 페이지인지 판별 */
  function isReviewPage() {
    const url = window.location.href;
    // URL 패턴 체크
    const urlPatterns = ['/reviews', '/review', '/customer-review', '/buyer-review'];
    const urlMatch = urlPatterns.some((pattern) => url.includes(pattern));

    // DOM 요소 체크
    const domMatch = !!document.querySelector(selectors.reviewPageIndicator);

    return urlMatch || domMatch;
  }

  // ─── UI 주입 ─────────────────────────────────────────────────

  /** 메인 UI 주입 */
  function injectUI() {
    // 중복 주입 방지
    if (document.querySelector('.reviewpilot-floating-bar')) return;

    // 플로팅 바 주입
    injectFloatingBar();

    // 개별 리뷰에 버튼 주입
    injectReviewButtons();

    // 새 리뷰 요소 로드 감지
    observeNewReviews();
  }

  /** 상단 플로팅 바 주입 (일괄 응답 생성) */
  function injectFloatingBar() {
    const bar = document.createElement('div');
    bar.className = 'reviewpilot-floating-bar';
    bar.innerHTML = `
      <div class="reviewpilot-floating-bar-inner">
        <div class="reviewpilot-floating-bar-left">
          <svg class="reviewpilot-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span class="reviewpilot-floating-bar-title">ReviewPilot</span>
          <span class="reviewpilot-floating-bar-count" id="reviewpilot-pending-count">미응답: 확인 중...</span>
        </div>
        <div class="reviewpilot-floating-bar-right">
          <select id="reviewpilot-tone-select" class="reviewpilot-select">
            <option value="friendly">친절</option>
            <option value="formal">격식</option>
            <option value="casual">캐주얼</option>
            <option value="professional">전문</option>
          </select>
          <button id="reviewpilot-bulk-btn" class="reviewpilot-btn reviewpilot-btn-primary">
            일괄 응답 생성
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(bar);

    // 톤 선택 동기화
    const toneSelect = document.getElementById('reviewpilot-tone-select');
    toneSelect.value = currentTone;
    toneSelect.addEventListener('change', (e) => {
      currentTone = e.target.value;
      chrome.storage.sync.set({ tone: currentTone });
    });

    // 일괄 응답 생성 버튼 이벤트
    document.getElementById('reviewpilot-bulk-btn').addEventListener('click', handleBulkGenerate);

    // 미응답 리뷰 수 업데이트
    updatePendingCount();
  }

  /** 개별 리뷰에 "AI 응답 생성" 버튼 주입 */
  function injectReviewButtons() {
    const reviewItems = document.querySelectorAll(selectors.reviewItem);

    if (reviewItems.length === 0) {
      // 셀렉터로 리뷰를 찾지 못한 경우 안내 메시지
      showToast('리뷰 요소를 찾을 수 없습니다. 셀렉터 설정을 확인해주세요.', 'warning');
      return;
    }

    reviewItems.forEach((item) => {
      // 이미 버튼이 있으면 스킵
      if (item.querySelector('.reviewpilot-generate-btn')) return;

      // 이미 응답 완료된 리뷰는 스킵
      if (item.querySelector(selectors.respondedIndicator)) return;

      const btn = document.createElement('button');
      btn.className = 'reviewpilot-btn reviewpilot-btn-primary reviewpilot-generate-btn';
      btn.innerHTML = `
        <svg class="reviewpilot-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
        AI 응답 생성
      `;
      btn.addEventListener('click', () => handleSingleGenerate(item, btn));

      // 리뷰 아이템 끝에 버튼 추가
      item.style.position = 'relative';
      item.appendChild(btn);
    });
  }

  // ─── 응답 생성 핸들러 ────────────────────────────────────────

  /** 단일 리뷰 응답 생성 */
  async function handleSingleGenerate(reviewItem, btn) {
    if (isProcessing) {
      showToast('이미 응답을 생성 중입니다. 잠시 기다려주세요.', 'warning');
      return;
    }

    isProcessing = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="reviewpilot-loading"></span> 생성 중...';
    btn.disabled = true;

    try {
      // 리뷰 데이터 추출
      const reviewData = extractReviewData(reviewItem);

      if (!reviewData.content) {
        showToast('리뷰 내용을 읽을 수 없습니다.', 'error');
        return;
      }

      // Service Worker에 응답 생성 요청
      const response = await sendMessage({
        type: 'GENERATE_RESPONSE',
        payload: {
          reviewContent: reviewData.content,
          rating: reviewData.rating,
          tone: currentTone,
          productName: reviewData.productName,
        },
      });

      if (response.success && response.data) {
        const generatedText = response.data.content || response.data.response || '';

        // 응답 미리보기 표시
        showResponsePreview(reviewItem, generatedText);

        // 답변란에 자동 입력 시도
        autoFillReply(reviewItem, generatedText);

        showToast('응답이 생성되었습니다!', 'success');
      } else {
        showToast(response.error || '응답 생성에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('[ReviewPilot] 응답 생성 오류:', error);
      showToast('네트워크 오류가 발생했습니다.', 'error');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
      isProcessing = false;
    }
  }

  /** 일괄 응답 생성 */
  async function handleBulkGenerate() {
    if (isProcessing) {
      showToast('이미 처리 중입니다.', 'warning');
      return;
    }

    const reviewItems = document.querySelectorAll(selectors.reviewItem);
    const pendingReviews = [];

    reviewItems.forEach((item) => {
      if (item.querySelector(selectors.respondedIndicator)) return;
      if (item.querySelector('.reviewpilot-generate-btn[disabled]')) return;

      const data = extractReviewData(item);
      if (data.content) {
        pendingReviews.push({ element: item, data });
      }
    });

    if (pendingReviews.length === 0) {
      showToast('미응답 리뷰가 없습니다.', 'warning');
      return;
    }

    // 최대 10건 제한
    const targetReviews = pendingReviews.slice(0, 10);
    isProcessing = true;

    const bulkBtn = document.getElementById('reviewpilot-bulk-btn');
    const originalText = bulkBtn.innerHTML;
    bulkBtn.innerHTML = `<span class="reviewpilot-loading"></span> ${targetReviews.length}건 생성 중...`;
    bulkBtn.disabled = true;

    try {
      const response = await sendMessage({
        type: 'BULK_GENERATE',
        payload: {
          reviews: targetReviews.map((r) => ({
            content: r.data.content,
            rating: r.data.rating,
            productName: r.data.productName,
          })),
          tone: currentTone,
        },
      });

      if (response.success && response.data) {
        const results = response.data.results || response.data;

        if (Array.isArray(results)) {
          results.forEach((result, index) => {
            if (index < targetReviews.length && result.content) {
              const item = targetReviews[index].element;
              showResponsePreview(item, result.content);
              autoFillReply(item, result.content);
            }
          });
        }

        showToast(`${targetReviews.length}건의 응답이 생성되었습니다!`, 'success');
      } else {
        showToast(response.error || '일괄 응답 생성에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('[ReviewPilot] 일괄 생성 오류:', error);
      showToast('네트워크 오류가 발생했습니다.', 'error');
    } finally {
      bulkBtn.innerHTML = originalText;
      bulkBtn.disabled = false;
      isProcessing = false;
    }
  }

  // ─── 데이터 추출 ─────────────────────────────────────────────

  /** 리뷰 아이템에서 데이터 추출 */
  function extractReviewData(reviewItem) {
    // 리뷰 본문
    const contentEl = reviewItem.querySelector(selectors.reviewContent);
    const content = contentEl ? contentEl.textContent.trim() : '';

    // 별점 추출 (다양한 방식 시도)
    let rating = 5;
    const ratingEl = reviewItem.querySelector(selectors.reviewRating);
    if (ratingEl) {
      // aria-label에서 추출 (예: "별점 4점")
      const ariaLabel = ratingEl.getAttribute('aria-label') || '';
      const ariaMatch = ariaLabel.match(/(\d)/);
      if (ariaMatch) {
        rating = parseInt(ariaMatch[1], 10);
      } else {
        // data-rating 속성
        const dataRating = ratingEl.getAttribute('data-rating');
        if (dataRating) {
          rating = parseInt(dataRating, 10);
        } else {
          // 텍스트에서 추출
          const textMatch = ratingEl.textContent.match(/(\d)/);
          if (textMatch) {
            rating = parseInt(textMatch[1], 10);
          }
        }
      }
    }

    // 상품명
    const productEl = reviewItem.querySelector(selectors.productName);
    const productName = productEl ? productEl.textContent.trim() : '';

    return { content, rating, productName };
  }

  // ─── 응답 자동 입력 ──────────────────────────────────────────

  /** 생성된 응답을 답변란에 자동 입력 */
  function autoFillReply(reviewItem, text) {
    // textarea 찾기
    let replyInput = reviewItem.querySelector(selectors.replyInput);

    // 리뷰 아이템 내에서 못 찾으면 근처 요소에서 검색
    if (!replyInput) {
      const nextSibling = reviewItem.nextElementSibling;
      if (nextSibling) {
        replyInput = nextSibling.querySelector('textarea, [contenteditable="true"]');
      }
    }

    if (!replyInput) return;

    if (replyInput.tagName === 'TEXTAREA' || replyInput.tagName === 'INPUT') {
      // textarea / input 요소
      replyInput.value = text;
      replyInput.focus();

      // React/Vue 등 프레임워크 감지용 이벤트 디스패치
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set || Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set;

      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(replyInput, text);
      }

      replyInput.dispatchEvent(new Event('input', { bubbles: true }));
      replyInput.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (replyInput.getAttribute('contenteditable') === 'true') {
      // contenteditable 요소
      replyInput.textContent = text;
      replyInput.focus();
      replyInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  // ─── 응답 미리보기 ───────────────────────────────────────────

  /** 생성된 응답 미리보기 박스 표시 */
  function showResponsePreview(reviewItem, text) {
    // 기존 미리보기 제거
    const existing = reviewItem.querySelector('.reviewpilot-response');
    if (existing) existing.remove();

    const preview = document.createElement('div');
    preview.className = 'reviewpilot-response';
    preview.innerHTML = `
      <div class="reviewpilot-response-header">
        <span class="reviewpilot-response-label">AI 생성 응답</span>
        <button class="reviewpilot-copy-btn" title="클립보드에 복사">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          복사
        </button>
      </div>
      <div class="reviewpilot-response-text">${escapeHtml(text)}</div>
    `;

    // 복사 버튼 이벤트
    preview.querySelector('.reviewpilot-copy-btn').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        showToast('클립보드에 복사되었습니다!', 'success');
      } catch {
        // 폴백: execCommand
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('클립보드에 복사되었습니다!', 'success');
      }
    });

    reviewItem.appendChild(preview);
  }

  // ─── 토스트 메시지 ───────────────────────────────────────────

  /** 토스트 메시지 표시 */
  function showToast(message, type = 'info') {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.reviewpilot-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `reviewpilot-toast reviewpilot-toast-${type}`;

    const icons = {
      success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };

    toast.innerHTML = `${icons[type] || icons.info} <span>${escapeHtml(message)}</span>`;
    document.body.appendChild(toast);

    // 등장 애니메이션
    requestAnimationFrame(() => {
      toast.classList.add('reviewpilot-toast-show');
    });

    // 3초 후 자동 제거
    setTimeout(() => {
      toast.classList.remove('reviewpilot-toast-show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ─── MutationObserver ────────────────────────────────────────

  /** SPA 라우팅 변경 감지 */
  function observeRouteChanges() {
    let lastUrl = window.location.href;

    const routeObserver = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        // 페이지 전환 시 기존 UI 정리 후 재주입
        cleanupUI();
        setTimeout(() => {
          if (isReviewPage()) {
            injectUI();
          }
        }, 1000); // SPA 렌더링 대기
      }
    });

    routeObserver.observe(document.body, { childList: true, subtree: true });
  }

  /** 새 리뷰 요소 로드 감지 */
  function observeNewReviews() {
    if (observer) observer.disconnect();

    observer = new MutationObserver((mutations) => {
      let hasNewReviews = false;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.matches && node.matches(selectors.reviewItem)) {
            hasNewReviews = true;
          }
          // 자식 노드에서도 검색
          if (node.nodeType === 1 && node.querySelector) {
            const newItems = node.querySelectorAll(selectors.reviewItem);
            if (newItems.length > 0) hasNewReviews = true;
          }
        });
      });

      if (hasNewReviews) {
        injectReviewButtons();
        updatePendingCount();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /** UI 정리 */
  function cleanupUI() {
    if (observer) observer.disconnect();
    document.querySelectorAll(
      '.reviewpilot-floating-bar, .reviewpilot-generate-btn, .reviewpilot-response, .reviewpilot-toast'
    ).forEach((el) => el.remove());
  }

  /** 미응답 리뷰 수 업데이트 */
  function updatePendingCount() {
    const countEl = document.getElementById('reviewpilot-pending-count');
    if (!countEl) return;

    const reviewItems = document.querySelectorAll(selectors.reviewItem);
    let pending = 0;
    let responded = 0;

    reviewItems.forEach((item) => {
      if (item.querySelector(selectors.respondedIndicator)) {
        responded++;
      } else {
        pending++;
      }
    });

    countEl.textContent = `미응답: ${pending}건 / 응답완료: ${responded}건`;
  }

  // ─── 유틸리티 ────────────────────────────────────────────────

  /** HTML 이스케이프 */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /** Service Worker에 메시지 전송 */
  function sendMessage(message) {
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

  // ─── Popup에서 오는 메시지 수신 ──────────────────────────────

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_REVIEW_COUNTS') {
      const reviewItems = document.querySelectorAll(selectors.reviewItem);
      let pending = 0;
      let responded = 0;

      reviewItems.forEach((item) => {
        if (item.querySelector(selectors.respondedIndicator)) {
          responded++;
        } else {
          pending++;
        }
      });

      sendResponse({
        pending,
        responded,
        isReviewPage: isReviewPage(),
      });
    }

    if (message.type === 'TRIGGER_BULK_GENERATE') {
      handleBulkGenerate();
      sendResponse({ ok: true });
    }

    if (message.type === 'UPDATE_TONE') {
      currentTone = message.tone;
      const toneSelect = document.getElementById('reviewpilot-tone-select');
      if (toneSelect) toneSelect.value = currentTone;
      sendResponse({ ok: true });
    }

    return true; // 비동기 sendResponse를 위해 true 반환
  });

  // ─── 실행 ────────────────────────────────────────────────────

  init();
})();
