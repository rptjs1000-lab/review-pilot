'use client';

import React, { Suspense } from 'react';
import Sidebar from '../../components/layout/Sidebar';

// 대시보드 레이아웃 — 사이드바 + 메인 콘텐츠 래퍼
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      {/* 사이드바 (240px, 다크) */}
      <Sidebar />
      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}
