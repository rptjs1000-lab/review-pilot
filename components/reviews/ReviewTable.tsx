'use client';

import React from 'react';
import ReviewStatusBadge from './ReviewStatusBadge';

// 리뷰 테이블 (체크박스, 플랫폼뱃지, 별점, 상태뱃지)
interface ReviewRow {
  id: string;
  platform: string;
  platformLabel: string;
  productName: string;
  rating: number;
  summary: string;
  status: 'pending' | 'responded' | 'hold';
  createdAt: string;
}

interface ReviewTableProps {
  reviews: ReviewRow[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onRowClick: (id: string) => void;
}

// 플랫폼 뱃지 색상 매핑
const platformBadge: Record<string, { bg: string; text: string }> = {
  naver: { bg: 'bg-green-100', text: 'text-green-700' },
  coupang: { bg: 'bg-orange-100', text: 'text-orange-700' },
  '11st': { bg: 'bg-red-100', text: 'text-red-700' },
  other: { bg: 'bg-slate-100', text: 'text-slate-700' },
};

// 별점 문자열 생성
const renderStars = (rating: number) => {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
};

export default function ReviewTable({ reviews, selectedIds, onSelectAll, onSelectRow, onRowClick }: ReviewTableProps) {
  const allSelected = reviews.length > 0 && selectedIds.length === reviews.length;

  return (
    <div className="bg-white rounded-xl border border-bdr shadow-sm overflow-hidden mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-bdr text-left text-xs font-medium text-txt-sub uppercase tracking-wide">
            <th scope="col" className="py-3 px-4 w-10">
              <input
                type="checkbox"
                className="rounded border-bdr"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                aria-label="전체 선택"
              />
            </th>
            <th scope="col" className="py-3 px-4">플랫폼</th>
            <th scope="col" className="py-3 px-4">상품명</th>
            <th scope="col" className="py-3 px-4">별점</th>
            <th scope="col" className="py-3 px-4">리뷰 요약</th>
            <th scope="col" className="py-3 px-4">응답 상태</th>
            <th scope="col" className="py-3 px-4">작성일</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review, idx) => {
            const badge = platformBadge[review.platform] || platformBadge.other;
            return (
              <tr
                key={review.id}
                className={`border-b border-bdr hover:bg-bg transition-colors cursor-pointer ${
                  idx % 2 === 1 ? 'bg-bg/50' : ''
                }`}
                onClick={() => onRowClick(review.id)}
              >
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="rounded border-bdr"
                    checked={selectedIds.includes(review.id)}
                    onChange={(e) => onSelectRow(review.id, e.target.checked)}
                  />
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${badge.bg} ${badge.text}`}>
                    {review.platformLabel}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-txt">{review.productName}</td>
                <td className="py-3 px-4 text-warning">{renderStars(review.rating)}</td>
                <td className="py-3 px-4 text-txt-sub">{review.summary}</td>
                <td className="py-3 px-4">
                  <ReviewStatusBadge status={review.status} />
                </td>
                <td className="py-3 px-4 text-txt-sub font-grotesk">{review.createdAt}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
