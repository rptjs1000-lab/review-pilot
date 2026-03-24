'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// 플랫폼 Coming Soon 페이지 — 쿠팡/11번가 선택 시 표시
interface ComingSoonProps {
  platform: 'coupang' | '11st';
}

const platformNames: Record<string, string> = {
  coupang: '쿠팡',
  '11st': '11번가',
};

export default function ComingSoon({ platform }: ComingSoonProps) {
  const [email, setEmail] = useState('');
  const name = platformNames[platform] || platform;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // MVP: UI만 — 실제 전송 기능 없음
    if (email) {
      alert('출시 시 알림을 보내드리겠습니다!');
      setEmail('');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-bg">
      <div className="text-center max-w-md px-6">
        {/* 아이콘 */}
        <div className="w-20 h-20 mx-auto mb-6 bg-primary-light rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
        </div>

        {/* 제목 */}
        <h2 className="text-2xl font-bold text-txt mb-2">
          {name} 연동 준비 중
        </h2>
        <p className="text-txt-sub mb-8">
          출시되면 알려드릴게요
        </p>

        {/* 이메일 알림 신청 폼 */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력해주세요"
            className="flex-1 px-4 py-2.5 border border-bdr rounded-lg text-sm text-txt placeholder:text-txt-sub focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
          >
            알림 신청
          </button>
        </form>

        {/* 네이버 안내 링크 */}
        <p className="text-sm text-txt-sub">
          현재{' '}
          <Link
            href="/dashboard?platform=naver"
            className="text-primary hover:underline font-medium"
          >
            네이버 스마트스토어
          </Link>
          를 이용해보세요
        </p>
      </div>
    </div>
  );
}
