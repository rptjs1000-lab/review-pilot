'use client';

import React from 'react';
import Link from 'next/link';

// 히어로 섹션 — 이미지 배경 + 다크 오버레이 + CTA
export default function HeroSection() {
  return (
    <section
      className="relative min-h-[600px] flex items-center justify-center overflow-hidden"
      style={{
        // L-1: 이미지 로드 실패 시 그라디언트 폴백 — 그라디언트를 먼저 선언하여 이미지 로드 실패 시에도 배경 표시
        background:
          "url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=90') center/cover no-repeat, linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      }}
    >
      {/* 다크 오버레이 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0.8) 100%)',
        }}
      ></div>
      <div className="relative text-center px-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 rounded-full text-white/90 text-sm font-medium mb-6 backdrop-blur-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI 기반 리뷰 자동응답
        </div>
        <h1 className="text-5xl font-bold text-white leading-[1.4] mb-6">
          쇼핑몰 리뷰,<br />AI가 자동으로 응답합니다
        </h1>
        <p className="text-xl text-white/80 leading-[1.6] mb-10">
          수백 개의 리뷰에 일일이 답변하느라 지치셨나요?<br />
          ReviewPilot가 브랜드 톤에 맞는 응답을 자동 생성해 드립니다.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl transition-colors shadow-lg"
          >
            무료로 시작하기
          </Link>
          <a
            href="#features"
            className="px-8 py-4 border-2 border-white/40 text-white font-medium text-lg rounded-xl hover:bg-white/10 transition-colors"
          >
            데모 보기
          </a>
        </div>
      </div>
    </section>
  );
}
