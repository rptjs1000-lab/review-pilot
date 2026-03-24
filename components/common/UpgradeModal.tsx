'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

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

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // 모달 열릴 때 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(null);
      setConfirmed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (planName: string) => {
    setSelectedPlan(planName);
    setConfirmed(false);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    // MVP: 결제 연동 미구현 — 선택 확인만 표시
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
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.name;
            return (
              <div
                key={plan.name}
                onClick={() => !plan.disabled && handleSelect(plan.name)}
                className={`relative rounded-xl p-6 flex flex-col transition-all cursor-pointer ${
                  isSelected
                    ? 'border-2 border-primary bg-primary-light ring-2 ring-primary/30 scale-[1.02]'
                    : plan.recommended
                      ? 'border-2 border-primary bg-primary-light hover:ring-2 hover:ring-primary/20'
                      : plan.disabled
                        ? 'border border-bdr bg-white cursor-default'
                        : 'border border-bdr bg-white hover:border-primary/40 hover:shadow-md'
                }`}
              >
                {/* 추천 뱃지 */}
                {plan.recommended && !isSelected && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                    추천
                  </span>
                )}

                {/* 선택됨 뱃지 */}
                {isSelected && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    선택됨
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

                {/* 선택 표시 */}
                <div
                  className={`w-full py-2.5 text-sm font-medium rounded-lg text-center transition-colors ${
                    plan.disabled
                      ? 'bg-bg text-txt-sub'
                      : isSelected
                        ? 'bg-success text-white'
                        : plan.recommended
                          ? 'bg-primary hover:bg-primary-dark text-white'
                          : 'bg-white border border-bdr hover:bg-bg text-txt'
                  }`}
                >
                  {plan.disabled ? '현재 플랜' : isSelected ? '✓ 선택됨' : plan.buttonLabel}
                </div>
              </div>
            );
          })}
        </div>

        {/* 하단 확인 영역 */}
        {selectedPlan && (
          <div className="mt-6 text-center">
            {confirmed ? (
              <div className="flex items-center justify-center gap-2 text-success">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{selectedPlan} 플랜이 신청되었습니다. 결제 시스템 준비 중입니다.</span>
              </div>
            ) : (
              <button
                onClick={handleConfirm}
                className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
              >
                {selectedPlan} 플랜으로 업그레이드
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
