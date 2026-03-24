'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// 헤더 컴포넌트 — 페이지 타이틀 + 검색바 + 알림
interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function Header({ title, showBack, onBack }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // L-3: 검색 실행 시 현재 페이지 URL에 ?search= 쿼리 파라미터 추가
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  }, [searchQuery, pathname, searchParams, router]);

  // Enter 키로 검색 실행
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <header className="h-16 bg-white border-b border-bdr px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={onBack} className="text-txt-sub hover:text-txt transition-colors" aria-label="뒤로 가기">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-xl font-bold text-txt">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* 검색바 */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-64 h-9 pl-9 pr-4 text-sm bg-bg border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="리뷰 검색..."
            aria-label="리뷰 검색"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-sub"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {/* 알림 버튼 */}
        <button className="relative p-2 text-txt-sub hover:text-txt transition-colors" aria-label="알림">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full"></span>
        </button>
        {/* 프로필 아바타 */}
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
          K
        </div>
      </div>
    </header>
  );
}
