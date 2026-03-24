'use client';

import React from 'react';

// 상태별 컬러 뱃지
interface ReviewStatusBadgeProps {
  status: 'pending' | 'responded' | 'hold';
}

const statusMap: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-slate-100', text: 'text-txt-sub', label: '미응답' },
  responded: { bg: 'bg-primary-light', text: 'text-primary', label: '응답완료' },
  hold: { bg: 'bg-amber-50', text: 'text-warning', label: '보류' },
};

export default function ReviewStatusBadge({ status }: ReviewStatusBadgeProps) {
  const style = statusMap[status] || statusMap.pending;
  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
