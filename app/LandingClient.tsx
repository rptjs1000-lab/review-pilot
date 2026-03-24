'use client';

import React from 'react';
import Link from 'next/link';
import HeroSection from '../components/landing/HeroSection';
import FeatureCards from '../components/landing/FeatureCards';
import Footer from '../components/landing/Footer';

// 랜딩 페이지 — 네비게이션 + 히어로 + 기능카드4 + 사용흐름3단계 + Footer
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* 랜딩 네비게이션 */}
      <nav className="bg-white border-b border-bdr">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-tight">RP</span>
            </div>
            <span className="text-lg font-bold text-txt">ReviewPilot</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-txt-sub hover:text-txt">기능</a>
            <a href="#" className="text-sm text-txt-sub hover:text-txt">요금제</a>
            <a href="#" className="text-sm text-txt-sub hover:text-txt">고객사례</a>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* 히어로 */}
      <HeroSection />

      {/* 핵심 기능 카드 + 사용 흐름 3단계 */}
      <FeatureCards />

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
