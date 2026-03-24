'use client';

import React from 'react';

// 핵심 기능 카드 4개 + 사용 흐름 3단계
export default function FeatureCards() {
  return (
    <>
      {/* 핵심 기능 카드 */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-txt leading-[1.4] mb-3">핵심 기능</h2>
          <p className="text-txt-sub text-base leading-[1.6]">ReviewPilot로 리뷰 관리의 모든 것을 해결하세요</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 카드 1 */}
          <div className="bg-white rounded-xl border border-bdr shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-txt leading-[1.4] mb-2">AI 자동응답</h3>
            <p className="text-sm text-txt-sub leading-[1.6]">AI가 리뷰 내용을 분석하고 브랜드에 맞는 최적의 응답을 자동 생성합니다.</p>
          </div>
          {/* 카드 2 */}
          <div className="bg-white rounded-xl border border-bdr shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-txt leading-[1.4] mb-2">실시간 대시보드</h3>
            <p className="text-sm text-txt-sub leading-[1.6]">리뷰 통계, 별점 분포, 감성 분석을 한눈에 파악할 수 있는 시각화 대시보드를 제공합니다.</p>
          </div>
          {/* 카드 3 */}
          <div className="bg-white rounded-xl border border-bdr shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-txt leading-[1.4] mb-2">통합 리뷰 관리</h3>
            <p className="text-sm text-txt-sub leading-[1.6]">네이버, 쿠팡, 카카오 등 여러 플랫폼의 리뷰를 한곳에서 통합 관리합니다.</p>
          </div>
          {/* 카드 4 */}
          <div className="bg-white rounded-xl border border-bdr shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-txt leading-[1.4] mb-2">톤 커스터마이징</h3>
            <p className="text-sm text-txt-sub leading-[1.6]">친절, 격식, 캐주얼, 전문 등 브랜드 톤에 맞게 응답 스타일을 자유롭게 조절합니다.</p>
          </div>
        </div>
      </section>

      {/* 사용 흐름 3단계 */}
      <section className="bg-white border-y border-bdr">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-txt leading-[1.4] mb-3">간단한 3단계</h2>
            <p className="text-txt-sub text-base leading-[1.6]">복잡한 설정 없이 바로 시작하세요</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl font-bold text-primary font-grotesk">1</span>
              </div>
              <h3 className="text-lg font-semibold text-txt mb-2">스토어 연동</h3>
              <p className="text-sm text-txt-sub leading-[1.6]">쇼핑몰 플랫폼을 연동하면 리뷰가 자동으로 수집됩니다.</p>
            </div>
            {/* Step 2 */}
            <div className="text-center relative">
              <div className="hidden md:block absolute top-8 -left-16 w-12 text-bdr">
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl font-bold text-primary font-grotesk">2</span>
              </div>
              <h3 className="text-lg font-semibold text-txt mb-2">AI 응답 생성</h3>
              <p className="text-sm text-txt-sub leading-[1.6]">AI가 리뷰를 분석하고 브랜드 톤에 맞는 응답을 자동 생성합니다.</p>
            </div>
            {/* Step 3 */}
            <div className="text-center relative">
              <div className="hidden md:block absolute top-8 -left-16 w-12 text-bdr">
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl font-bold text-primary font-grotesk">3</span>
              </div>
              <h3 className="text-lg font-semibold text-txt mb-2">복사해서 게시</h3>
              <p className="text-sm text-txt-sub leading-[1.6]">생성된 응답을 확인하고 원클릭으로 복사하여 바로 게시하세요.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
