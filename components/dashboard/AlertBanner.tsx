'use client';

import React from 'react';
import { NegativeAlert } from '../../types';

// 부정 리뷰 경고/긍정 배너
interface AlertBannerProps {
  alert: NegativeAlert;
}

export default function AlertBanner({ alert }: AlertBannerProps) {
  // 부정 리뷰 증가 시 — 빨간 경고 배너
  if (alert.isIncreasing) {
    return (
      <div className="w-full rounded-xl border border-danger bg-red-50 p-4 mb-6 flex items-start gap-3">
        {/* 경고 아이콘 */}
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-danger" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-danger leading-[1.6]">
            &#x26A0;&#xFE0F; 부정 리뷰 급증: 이번 주{' '}
            <span className="font-grotesk">{alert.thisWeek}</span>건
            {alert.lastWeek > 0 && (
              <>
                {' '}(지난 주 대비{' '}
                <span className="font-grotesk">+{alert.change}%</span>)
              </>
            )}
          </p>
          <p className="text-xs text-danger/80 mt-1">
            주요 원인: &apos;{alert.topCause}&apos; — 해당 리뷰를 확인하고 빠른 대응을 권장합니다.
          </p>
        </div>
        <div className="flex-shrink-0">
          <span className="inline-block px-3 py-1 text-xs font-medium text-danger border border-danger/30 rounded-full bg-white cursor-pointer hover:bg-danger hover:text-white transition-colors">
            리뷰 확인
          </span>
        </div>
      </div>
    );
  }

  // 부정 리뷰 감소 시 — 초록 긍정 배너
  return (
    <div className="w-full rounded-xl border border-success bg-emerald-50 p-4 mb-6 flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">
        <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-success leading-[1.6]">
          &#x2713; 부정 리뷰 감소 추세: 이번 주{' '}
          <span className="font-grotesk">{alert.thisWeek}</span>건
          {alert.lastWeek > 0 && (
            <>
              {' '}(지난 주 대비{' '}
              <span className="font-grotesk">{alert.change}%</span>)
            </>
          )}
        </p>
        <p className="text-xs text-success/80 mt-1">
          고객 만족도가 개선되고 있습니다. 좋은 흐름을 유지하세요!
        </p>
      </div>
    </div>
  );
}
