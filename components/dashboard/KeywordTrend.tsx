'use client';

import React from 'react';
import { KeywordChange } from '../../types';

// 키워드 변화 추이 컴포넌트
interface KeywordTrendProps {
  changes: KeywordChange[];
}

export default function KeywordTrend({ changes }: KeywordTrendProps) {
  // 상위 8개만 표시
  const displayChanges = changes.slice(0, 8);

  return (
    <div className="bg-white rounded-xl border border-bdr shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-txt leading-[1.4]">
          키워드 변화 추이
        </h3>
        <span className="text-xs text-txt-sub">이번 주 vs 지난 주</span>
      </div>

      <div className="space-y-2.5">
        {displayChanges.map((item) => {
          const isIncrease = item.change > 0;
          const isDecrease = item.change < 0;
          const isSurge = item.change >= 50; // 급증
          const isPlunge = item.change <= -30; // 급감

          return (
            <div
              key={item.keyword}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-bg transition-colors"
            >
              {/* 키워드 이름 */}
              <span className="text-sm font-medium text-txt flex-1 flex items-center gap-2">
                {item.keyword}
                {/* 새로 등장한 키워드 뱃지 */}
                {item.isNew && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-primary-light text-primary">
                    NEW
                  </span>
                )}
              </span>

              {/* 이번 주 / 지난 주 빈도 */}
              <span className="text-xs text-txt-sub font-grotesk w-16 text-right">
                {item.thisWeek}건
                <span className="text-[10px] text-txt-sub/60 ml-0.5">
                  ({item.lastWeek})
                </span>
              </span>

              {/* 변화율 */}
              <div className="w-20 text-right">
                {isSurge && (
                  <span className="text-sm font-semibold text-danger font-grotesk inline-flex items-center gap-0.5">
                    <span aria-label="급증">&#x1F53A;</span>
                    +{item.change.toFixed(0)}%
                  </span>
                )}
                {isIncrease && !isSurge && (
                  <span className="text-sm font-medium text-danger font-grotesk">
                    +{item.change.toFixed(0)}%
                  </span>
                )}
                {isPlunge && (
                  <span className="text-sm font-semibold text-success font-grotesk inline-flex items-center gap-0.5">
                    <span aria-label="급감">&#x1F53B;</span>
                    {item.change.toFixed(0)}%
                  </span>
                )}
                {isDecrease && !isPlunge && (
                  <span className="text-sm font-medium text-success font-grotesk">
                    {item.change.toFixed(0)}%
                  </span>
                )}
                {!isIncrease && !isDecrease && (
                  <span className="text-sm font-medium text-txt-sub font-grotesk">-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-bdr text-[11px] text-txt-sub">
        <span className="flex items-center gap-1">
          <span className="text-danger">&#x1F53A;</span> 급증 (+50% 이상)
        </span>
        <span className="flex items-center gap-1">
          <span className="text-success">&#x1F53B;</span> 급감 (-30% 이상)
        </span>
        <span className="flex items-center gap-1">
          <span className="px-1 py-0.5 rounded bg-primary-light text-primary text-[9px] font-semibold">NEW</span> 새로 등장
        </span>
      </div>
    </div>
  );
}
