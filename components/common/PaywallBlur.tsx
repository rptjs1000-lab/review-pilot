'use client';

import React, { useState } from 'react';
import UpgradeModal from './UpgradeModal';

// 페이월 블러 오버레이 — children을 감싸서 블러 처리 + 잠금 UI
interface PaywallBlurProps {
  isLocked: boolean;
  feature: string; // 표시할 기능명
  children: React.ReactNode;
}

export default function PaywallBlur({ isLocked, feature, children }: PaywallBlurProps) {
  const [showModal, setShowModal] = useState(false);

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="relative">
        {/* 블러 처리된 콘텐츠 */}
        <div className="pointer-events-none select-none" style={{ filter: 'blur(4px)' }}>
          {children}
        </div>

        {/* 잠금 오버레이 */}
        <div className="absolute inset-0 backdrop-blur-sm bg-white/60 rounded-xl flex flex-col items-center justify-center gap-3">
          {/* 자물쇠 아이콘 */}
          <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <p className="text-sm font-medium text-txt">{feature}</p>
          <p className="text-xs text-txt-sub">프로 플랜에서 사용 가능</p>

          {/* 업그레이드 버튼 */}
          <button
            onClick={() => setShowModal(true)}
            className="mt-1 px-5 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
          >
            업그레이드
          </button>
        </div>
      </div>

      {/* 업그레이드 모달 */}
      <UpgradeModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
