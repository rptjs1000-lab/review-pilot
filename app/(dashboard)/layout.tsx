'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import ComingSoon from '../../components/common/ComingSoon';

// 플랫폼 체크 래퍼 — coupang/11st면 ComingSoon 표시
function DashboardContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const platform = searchParams.get('platform') || 'all';

  // 쿠팡 또는 11번가 선택 시 Coming Soon 표시
  if (platform === 'coupang' || platform === '11st') {
    return <ComingSoon platform={platform} />;
  }

  // 전체/네이버는 기존 children 렌더링
  return <>{children}</>;
}

// 대시보드 레이아웃 — 사이드바 + 메인 콘텐츠 래퍼
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      {/* 사이드바 (240px, 다크) */}
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>
      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
          <DashboardContent>{children}</DashboardContent>
        </Suspense>
      </div>
    </div>
  );
}
