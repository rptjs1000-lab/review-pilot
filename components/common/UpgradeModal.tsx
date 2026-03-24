'use client';

import React, { useEffect, useRef, useCallback } from 'react';

// 플랜 업그레이드 모달 — 3개 플랜 카드 가로 배치
interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 플랜 정의
const plans = [
  {
    name: '무료',
    price: '₩0',
    period: '',
    features: ['월 30건 자동응답', '기본 통계'],
    recommended: false,
    buttonLabel: '현재 플랜',
    disabled: true,
  },
  {
    name: '스타터',
    price: '₩29,000',
    period: '/월',
    features: ['무제한 자동응답', '기본 인사이트'],
    recommended: false,
    buttonLabel: '시작하기',
    disabled: false,
  },
  {
    name: '프로',
    price: '₩59,000',
    period: '/월',
    features: ['무제한 자동응답', '풀 인사이트', '멀티 플랫폼', '경쟁 분석'],
    recommended: true,
    buttonLabel: '시작하기',
    disabled: false,
  },
];

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 포커스 트랩
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;
    const focusable = modalRef.current.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, handleTabKey]);

  if (!isOpen) return null;

  const handleSelect = (planName: string) => {
    alert(`${planName} 플랜은 준비 중입니다.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 모달 */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 p-8"
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-txt-sub hover:text-txt transition-colors"
          aria-label="모달 닫기"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 제목 */}
        <h2 id="upgrade-modal-title" className="text-xl font-bold text-txt text-center mb-8">
          더 많은 인사이트를 원하시나요?
        </h2>

        {/* 플랜 카드 3개 가로 배치 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl p-6 flex flex-col ${
                plan.recommended
                  ? 'border-2 border-primary bg-primary-light'
                  : 'border border-bdr bg-white'
              }`}
            >
              {/* 추천 뱃지 */}
              {plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                  추천
                </span>
              )}

              {/* 플랜 이름 */}
              <h3 className="text-lg font-semibold text-txt mb-4">{plan.name}</h3>

              {/* 가격 */}
              <div className="mb-6">
                <span className="text-3xl font-bold font-grotesk text-txt">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-txt-sub">{plan.period}</span>
                )}
              </div>

              {/* 기능 목록 */}
              <ul className="flex-1 space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-txt">
                    <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* 버튼 */}
              <button
                onClick={() => !plan.disabled && handleSelect(plan.name)}
                disabled={plan.disabled}
                className={`w-full py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  plan.disabled
                    ? 'bg-bg text-txt-sub cursor-not-allowed'
                    : plan.recommended
                      ? 'bg-primary hover:bg-primary-dark text-white'
                      : 'bg-white border border-bdr hover:bg-bg text-txt'
                }`}
              >
                {plan.buttonLabel}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
