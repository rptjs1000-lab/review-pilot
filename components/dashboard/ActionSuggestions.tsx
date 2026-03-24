'use client';

import React from 'react';
import { ActionSuggestion } from '../../types';

// AI 액션 제안 카드 컴포넌트
interface ActionSuggestionsProps {
  suggestions: ActionSuggestion[];
}

// 아이콘 매핑 — 제안 유형별 SVG 아이콘
function SuggestionIcon({ type }: { type: string }) {
  const iconClass = 'w-6 h-6 text-primary';

  switch (type) {
    case 'size':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      );
    case 'gift':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 8v13m0-13V6a4 4 0 00-4-4 2 2 0 00-2 2v2h6zm0 0V6a4 4 0 014-4 2 2 0 012 2v2h-6zm-8 4h16M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      );
    case 'rating':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    case 'package':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case 'delivery':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
  }
}

// 우선순위 뱃지 스타일
const priorityStyles: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-red-50', text: 'text-danger', label: '긴급' },
  medium: { bg: 'bg-amber-50', text: 'text-warning', label: '권장' },
  low: { bg: 'bg-blue-50', text: 'text-primary', label: '참고' },
};

export default function ActionSuggestions({ suggestions }: ActionSuggestionsProps) {
  return (
    <div className="bg-white rounded-xl border border-bdr shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="text-lg font-semibold text-txt leading-[1.4]">
          AI 액션 제안
        </h3>
        <span className="text-xs text-txt-sub ml-auto">리뷰 데이터 기반 자동 분석</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((item, idx) => {
          const priority = priorityStyles[item.priority] || priorityStyles.low;

          return (
            <div
              key={idx}
              className="bg-primary-light/30 border-l-4 border-primary rounded-lg p-4 flex items-start gap-3 hover:bg-primary-light/50 transition-colors"
            >
              {/* 아이콘 */}
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <SuggestionIcon type={item.icon} />
              </div>

              <div className="flex-1 min-w-0">
                {/* 우선순위 뱃지 */}
                <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${priority.bg} ${priority.text} mb-1.5`}>
                  {priority.label}
                </span>

                {/* 제안 텍스트 */}
                <p className="text-sm text-txt leading-[1.6]">{item.text}</p>

                {/* 관련 키워드 뱃지 */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-white text-primary border border-primary/20"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
