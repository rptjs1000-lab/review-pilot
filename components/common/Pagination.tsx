'use client';

import React from 'react';

// 페이지네이션 컴포넌트
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // 표시할 페이지 번호 계산
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-txt-sub">
        총 <span className="font-semibold text-txt font-grotesk">{totalItems.toLocaleString()}</span>건 중{' '}
        <span className="font-grotesk">{startItem}-{endItem}</span>건
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm text-txt-sub border border-bdr rounded-lg hover:bg-bg transition-colors disabled:opacity-50"
        >
          이전
        </button>
        {getPageNumbers().map((page, idx) =>
          typeof page === 'string' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-txt-sub">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1.5 text-sm rounded-lg font-grotesk ${
                page === currentPage
                  ? 'text-white bg-primary'
                  : 'text-txt-sub border border-bdr hover:bg-bg transition-colors'
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm text-txt-sub border border-bdr rounded-lg hover:bg-bg transition-colors disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  );
}
