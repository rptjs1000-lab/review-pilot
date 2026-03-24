'use client';

import React from 'react';

// 키워드 TOP5 리스트
interface KeywordItem {
  rank: number;
  keyword: string;
  sentiment: 'positive' | 'mixed' | 'negative';
  count: number;
}

interface KeywordListProps {
  keywords: KeywordItem[];
}

// 감성 뱃지 스타일 매핑
const sentimentStyles: Record<string, { bg: string; text: string; label: string }> = {
  positive: { bg: 'bg-emerald-50', text: 'text-success', label: '긍정' },
  mixed: { bg: 'bg-amber-50', text: 'text-warning', label: '혼합' },
  negative: { bg: 'bg-red-50', text: 'text-danger', label: '부정' },
};

export default function KeywordList({ keywords }: KeywordListProps) {
  return (
    <div className="bg-white rounded-xl border border-bdr shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-txt leading-[1.4]">키워드 트렌드 TOP 5</h3>
        <span className="text-xs text-txt-sub">최근 30일</span>
      </div>
      <div className="space-y-3">
        {keywords.map((item) => {
          const style = sentimentStyles[item.sentiment];
          return (
            <div key={item.rank} className="flex items-center gap-4 p-3 rounded-lg hover:bg-bg transition-colors">
              <span className="text-lg font-bold text-primary font-grotesk w-8">{item.rank}</span>
              <span className="text-sm font-medium text-txt flex-1">{item.keyword}</span>
              <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
                {style.label}
              </span>
              <span className="text-sm text-txt-sub font-grotesk">{item.count}건</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
