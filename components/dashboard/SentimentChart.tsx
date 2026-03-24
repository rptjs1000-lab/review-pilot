'use client';

import React from 'react';

// 감성 파이차트 (conic-gradient)
interface SentimentData {
  label: string;
  percentage: number;
  color: string; // hex 색상값
  dotClass: string; // Tailwind bg 클래스 (범례 dot)
}

interface SentimentChartProps {
  data: SentimentData[];
  total: number;
}

export default function SentimentChart({ data, total }: SentimentChartProps) {
  // L-9: conic-gradient 문자열 생성 — 마지막 항목의 end를 100%로 강제 설정 (반올림 오류 방지)
  let accumulated = 0;
  const gradientParts = data.map((item, index) => {
    const start = accumulated;
    accumulated += item.percentage;
    // 마지막 항목은 100%로 강제 설정하여 틈 방지
    const end = index === data.length - 1 ? 100 : accumulated;
    return `${item.color} ${start}% ${end}%`;
  });
  const gradient = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div className="bg-white rounded-xl border border-bdr shadow-sm p-6">
      <h3 className="text-lg font-semibold text-txt leading-[1.4] mb-5">감성 분석</h3>
      <div className="flex items-center gap-8">
        {/* 파이차트 (CSS conic-gradient) */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <div className="w-full h-full rounded-full" style={{ background: gradient }}></div>
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-txt font-grotesk">{total.toLocaleString()}</p>
              <p className="text-xs text-txt-sub">전체</p>
            </div>
          </div>
        </div>
        {/* 범례 */}
        <div className="space-y-3 flex-1">
          {data.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.dotClass}`}></div>
                <span className="text-sm text-txt">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-txt font-grotesk">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
