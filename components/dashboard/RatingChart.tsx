'use client';

import React from 'react';

// 별점 분포 CSS 바차트
interface RatingData {
  rating: number;
  count: number;
  percentage: number;
  color: string; // Tailwind bg 클래스
}

interface RatingChartProps {
  data: RatingData[];
}

export default function RatingChart({ data }: RatingChartProps) {
  return (
    <div className="bg-white rounded-xl border border-bdr shadow-sm p-6">
      <h3 className="text-lg font-semibold text-txt leading-[1.4] mb-5">별점 분포</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.rating} className="flex items-center gap-3">
            <span className="text-sm font-medium text-txt w-8 font-grotesk">{item.rating}★</span>
            <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full flex items-center justify-end pr-2`}
                style={{ width: `${item.percentage}%` }}
              >
                {/* 퍼센트가 충분히 클 때만 텍스트 표시 */}
                {item.percentage >= 10 && (
                  <span className="text-xs text-white font-medium font-grotesk">{item.percentage}%</span>
                )}
              </div>
            </div>
            <span className="text-xs text-txt-sub w-10 text-right font-grotesk">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
