'use client';

import React from 'react';
import { PlatformComparisonItem } from '../../types';

// 플랫폼별 비교 바 차트 컴포넌트
interface PlatformComparisonProps {
  data: PlatformComparisonItem[];
}

// 플랫폼 아이콘/색상 매핑
const platformMeta: Record<string, { color: string; bgColor: string; icon: string }> = {
  naver: { color: 'bg-[#03C75A]', bgColor: 'bg-[#03C75A]/10', icon: 'N' },
  coupang: { color: 'bg-[#E4002B]', bgColor: 'bg-[#E4002B]/10', icon: 'C' },
  '11st': { color: 'bg-[#FF5A2E]', bgColor: 'bg-[#FF5A2E]/10', icon: '11' },
};

export default function PlatformComparison({ data }: PlatformComparisonProps) {
  // 최대 별점 (바 차트 스케일링용)
  const maxRating = 5;

  return (
    <div className="bg-white rounded-xl border border-bdr shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-txt leading-[1.4]">
          플랫폼별 비교
        </h3>
        <span className="text-xs text-txt-sub">평균 별점 기준</span>
      </div>

      <div className="space-y-4">
        {data.map((item) => {
          const meta = platformMeta[item.platform] || platformMeta.naver;
          const barWidth =
            item.isConnected && item.avgRating
              ? (item.avgRating / maxRating) * 100
              : 0;

          return (
            <div key={item.platform} className={`${!item.isConnected ? 'opacity-60' : ''}`}>
              {/* 플랫폼 라벨 행 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  {/* 플랫폼 아이콘 */}
                  <div
                    className={`w-8 h-8 rounded-lg ${item.isConnected ? meta.bgColor : 'bg-slate-100'} flex items-center justify-center`}
                  >
                    <span
                      className={`text-xs font-bold ${item.isConnected ? '' : 'text-txt-sub'}`}
                      style={item.isConnected ? { color: meta.color.replace('bg-[', '').replace(']', '').replace('/10', '') } : undefined}
                    >
                      {meta.icon}
                    </span>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${item.isConnected ? 'text-txt' : 'text-txt-sub'}`}>
                      {item.name}
                    </p>
                    {!item.isConnected && (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 text-txt-sub mt-0.5">
                        연동 대기 중
                      </span>
                    )}
                  </div>
                </div>

                {/* 별점 / 리뷰 수 */}
                {item.isConnected && item.avgRating ? (
                  <div className="text-right">
                    <span className="text-lg font-bold text-txt font-grotesk">
                      {item.avgRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-txt-sub ml-1">/ 5.0</span>
                    <p className="text-[11px] text-txt-sub font-grotesk">
                      {item.count}건
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-txt-sub">데이터 없음</span>
                )}
              </div>

              {/* 바 차트 */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                {item.isConnected && item.avgRating ? (
                  <div
                    className={`h-full ${meta.color} rounded-full transition-all duration-500`}
                    style={{ width: `${barWidth}%` }}
                  />
                ) : (
                  <div className="h-full bg-slate-200 rounded-full w-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming Soon 안내 */}
      <div className="mt-5 pt-3 border-t border-bdr">
        <p className="text-xs text-txt-sub text-center">
          쿠팡 · 11번가 연동은 <span className="font-medium text-primary">Coming Soon</span>으로 준비 중입니다.
        </p>
      </div>
    </div>
  );
}
