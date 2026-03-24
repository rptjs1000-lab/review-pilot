'use client';

import React, { useEffect, useState } from 'react';
import Header from '../../../components/layout/Header';
import StatCard from '../../../components/dashboard/StatCard';
import RatingTrendChart from '../../../components/dashboard/RatingTrendChart';
import SentimentChart from '../../../components/dashboard/SentimentChart';
import KeywordTrend from '../../../components/dashboard/KeywordTrend';
import PlatformComparison from '../../../components/dashboard/PlatformComparison';
import AlertBanner from '../../../components/dashboard/AlertBanner';
import ActionSuggestions from '../../../components/dashboard/ActionSuggestions';
import PaywallBlur from '../../../components/common/PaywallBlur';
import { isTrialActive } from '../../../lib/usage';
import { DashboardStats, Sentiment } from '../../../types';

// 대시보드 페이지 — 리뷰 인텔리전스 중심 레이아웃
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  // 체험 기간 활성 여부 — true면 모든 기능 오픈, false면 프로 기능 블러
  const trialActive = isTrialActive();

  // API에서 대시보드 통계 가져오기
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
        }
      } catch {
        // API 실패 시 기본 데이터 사용
        setStats(null);
      }
    };
    fetchStats();
  }, []);

  // 기본 표시 데이터 (API 응답 전 또는 실패 시)
  const totalReviews = stats?.totalReviews ?? 1247;
  const pendingReviews = stats?.pendingReviews ?? 38;
  const averageRating = stats?.averageRating ?? 4.2;
  const totalResponses = stats?.totalResponses ?? 1209;

  // 감성 분석 데이터
  const sentimentData = stats?.sentimentDistribution
    ? [
        { label: '긍정', percentage: totalReviews > 0 ? Math.round((stats.sentimentDistribution.positive / totalReviews) * 100) : 0, color: '#10B981', dotClass: 'bg-success' },
        { label: '중립', percentage: totalReviews > 0 ? Math.round((stats.sentimentDistribution.neutral / totalReviews) * 100) : 0, color: '#2563EB', dotClass: 'bg-primary' },
        { label: '부정', percentage: totalReviews > 0 ? Math.round((stats.sentimentDistribution.negative / totalReviews) * 100) : 0, color: '#EF4444', dotClass: 'bg-danger' },
      ]
    : [
        { label: '긍정', percentage: 62, color: '#10B981', dotClass: 'bg-success' },
        { label: '중립', percentage: 20, color: '#2563EB', dotClass: 'bg-primary' },
        { label: '부정', percentage: 18, color: '#EF4444', dotClass: 'bg-danger' },
      ];

  // 주간 별점 추이 (기본값)
  const weeklyRatingTrend = stats?.weeklyRatingTrend ?? [
    { week: '2월 4주', avg: 4.5, count: 12 },
    { week: '3월 1주', avg: 4.3, count: 12 },
    { week: '3월 2주', avg: 3.8, count: 13 },
    { week: '3월 3주', avg: 3.1, count: 13 },
  ];

  // 키워드 변화 추이 (기본값)
  const keywordChanges = stats?.keywordChanges ?? [
    { keyword: '배송', thisWeek: 8, lastWeek: 5, change: 60, isNew: false },
    { keyword: '품질', thisWeek: 6, lastWeek: 7, change: -14.3, isNew: false },
    { keyword: '사이즈', thisWeek: 4, lastWeek: 1, change: 300, isNew: false },
    { keyword: '포장', thisWeek: 5, lastWeek: 3, change: 66.7, isNew: false },
    { keyword: '선물', thisWeek: 3, lastWeek: 0, change: 100, isNew: true },
  ];

  // 부정 리뷰 경고 (기본값)
  const negativeAlert = stats?.negativeAlert ?? {
    thisWeek: 8,
    lastWeek: 3,
    change: 167,
    topCause: '품질 불만',
    isIncreasing: true,
  };

  // AI 액션 제안 (기본값)
  const actionSuggestions = stats?.actionSuggestions ?? [
    {
      icon: 'rating',
      text: '평균 별점이 4.5 → 3.1로 하락 중입니다. 최근 부정 리뷰를 집중 확인해주세요.',
      keywords: ['별점 하락'],
      priority: 'high' as const,
    },
    {
      icon: 'package',
      text: "'포장' 관련 리뷰가 67% 증가했습니다. 출고 전 품질 검수를 강화해주세요.",
      keywords: ['포장'],
      priority: 'high' as const,
    },
    {
      icon: 'quality',
      text: '긍정 리뷰에 빠른 감사 응답을 보내면 재구매율이 평균 23% 증가합니다.',
      keywords: ['재구매', '응답'],
      priority: 'low' as const,
    },
  ];

  // 플랫폼별 비교 (기본값)
  const platformComparison = stats?.platformComparison ?? [
    { platform: 'naver' as const, name: '네이버 스마트스토어', avgRating: 4.2, count: 50, isConnected: true },
    { platform: 'coupang' as const, name: '쿠팡', avgRating: null, count: 0, isConnected: false },
    { platform: '11st' as const, name: '11번가', avgRating: null, count: 0, isConnected: false },
  ];

  return (
    <>
      <Header title="대시보드" />
      <main className="flex-1 p-6 overflow-y-auto">

        {/* 1행: 부정 리뷰 경고 배너 */}
        {negativeAlert && <AlertBanner alert={negativeAlert} />}

        {/* 2행: StatCards 4개 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="총 리뷰"
            value={totalReviews.toLocaleString()}
            iconBgClass="bg-primary-light"
            icon={
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            }
          />
          <StatCard
            label="미응답"
            value={pendingReviews.toLocaleString()}
            iconBgClass="bg-red-50"
            icon={
              <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="평균 별점"
            value={averageRating.toFixed(1)}
            iconBgClass="bg-amber-50"
            icon={
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            }
          />
          <StatCard
            label="AI 응답"
            value={totalResponses.toLocaleString()}
            iconBgClass="bg-emerald-50"
            icon={
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* 3행: 별점 추이 그래프 + 감성 차트 (가로 반반) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RatingTrendChart data={weeklyRatingTrend} />
          <SentimentChart data={sentimentData} total={totalReviews} />
        </div>

        {/* 4행: 키워드 변화 추이 + 플랫폼별 비교 (가로 반반) — 프로 기능 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PaywallBlur isLocked={!trialActive} feature="키워드 변화 추이">
            <KeywordTrend changes={keywordChanges} />
          </PaywallBlur>
          <PaywallBlur isLocked={!trialActive} feature="플랫폼별 비교">
            <PlatformComparison data={platformComparison} />
          </PaywallBlur>
        </div>

        {/* 5행: AI 액션 제안 (풀 폭) — 프로 기능 */}
        <PaywallBlur isLocked={!trialActive} feature="AI 액션 제안">
          <ActionSuggestions suggestions={actionSuggestions} />
        </PaywallBlur>
      </main>
    </>
  );
}
