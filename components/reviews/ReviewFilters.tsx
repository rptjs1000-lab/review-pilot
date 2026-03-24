'use client';

import React from 'react';

// 필터 셀렉트 3개 + 검색 + 일괄 응답 생성 버튼
interface ReviewFiltersProps {
  platform: string;
  rating: string;
  status: string;
  search: string;
  onPlatformChange: (v: string) => void;
  onRatingChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onBulkGenerate: () => void;
}

export default function ReviewFilters({
  platform,
  rating,
  status,
  search,
  onPlatformChange,
  onRatingChange,
  onStatusChange,
  onSearchChange,
  onBulkGenerate,
}: ReviewFiltersProps) {
  return (
    <div className="bg-white rounded-xl border border-bdr shadow-sm p-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* 플랫폼 필터 */}
        <select
          value={platform}
          onChange={(e) => onPlatformChange(e.target.value)}
          className="h-10 px-3 text-sm bg-white border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">전체 플랫폼</option>
          <option value="naver">네이버</option>
          <option value="coupang">쿠팡</option>
          <option value="11st">11번가</option>
        </select>

        {/* 별점 필터 */}
        <select
          value={rating}
          onChange={(e) => onRatingChange(e.target.value)}
          className="h-10 px-3 text-sm bg-white border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">전체 별점</option>
          <option value="5">5점</option>
          <option value="4">4점</option>
          <option value="3">3점</option>
          <option value="2">2점</option>
          <option value="1">1점</option>
        </select>

        {/* 상태 필터 */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-10 px-3 text-sm bg-white border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">전체 상태</option>
          <option value="pending">미응답</option>
          <option value="responded">응답완료</option>
          <option value="hold">보류</option>
        </select>

        {/* 검색 입력 */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="상품명 또는 리뷰 내용 검색..."
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sub"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* 일괄 응답 생성 버튼 */}
        <button
          onClick={onBulkGenerate}
          className="ml-auto px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          일괄 응답 생성
        </button>
      </div>
    </div>
  );
}
