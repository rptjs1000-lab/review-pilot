'use client';

import React, { useEffect, useState } from 'react';
import Header from '../../../components/layout/Header';
import StatCard from '../../../components/dashboard/StatCard';
import RatingChart from '../../../components/dashboard/RatingChart';
import SentimentChart from '../../../components/dashboard/SentimentChart';
import KeywordList from '../../../components/dashboard/KeywordList';
import { DashboardStats, Sentiment } from '../../../types';

// 대시보드 페이지 — StatCard 4개 + 별점 바차트 + 감성 파이차트 + 키워드 TOP5
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

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

  // 별점 분포 데이터
  const ratingData = stats?.ratingDistribution
    ? [
        { rating: 5, count: stats.ratingDistribution[5], percentage: Math.round((stats.ratingDistribution[5] / totalReviews) * 100), color: 'bg-primary' },
        { rating: 4, count: stats.ratingDistribution[4], percentage: Math.round((stats.ratingDistribution[4] / totalReviews) * 100), color: 'bg-blue-400' },
        { rating: 3, count: stats.ratingDistribution[3], percentage: Math.round((stats.ratingDistribution[3] / totalReviews) * 100), color: 'bg-blue-300' },
        { rating: 2, count: stats.ratingDistribution[2], percentage: Math.round((stats.ratingDistribution[2] / totalReviews) * 100), color: 'bg-warning' },
        { rating: 1, count: stats.ratingDistribution[1], percentage: Math.round((stats.ratingDistribution[1] / totalReviews) * 100), color: 'bg-danger' },
      ]
    : [
        { rating: 5, count: 649, percentage: 52, color: 'bg-primary' },
        { rating: 4, count: 349, percentage: 28, color: 'bg-blue-400' },
        { rating: 3, count: 150, percentage: 12, color: 'bg-blue-300' },
        { rating: 2, count: 62, percentage: 5, color: 'bg-warning' },
        { rating: 1, count: 37, percentage: 3, color: 'bg-danger' },
      ];

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

  // 키워드 TOP5 데이터
  // L-10: 키워드 sentiment 기본값 — API의 topKeywords에는 sentiment 필드가 없을 수 있으므로 명시적 타입 처리
  const keywords = stats?.topKeywords?.slice(0, 5).map((k: { keyword: string; count: number; sentiment?: Sentiment | 'mixed' }, idx: number) => ({
    rank: idx + 1,
    keyword: k.keyword,
    sentiment: (k.sentiment as 'positive' | 'mixed' | 'negative') || 'positive',
    count: k.count,
  })) || [
    { rank: 1, keyword: '배송 빠름', sentiment: 'positive' as const, count: 312 },
    { rank: 2, keyword: '품질 만족', sentiment: 'positive' as const, count: 287 },
    { rank: 3, keyword: '가성비 좋음', sentiment: 'positive' as const, count: 198 },
    { rank: 4, keyword: '사이즈 교환', sentiment: 'mixed' as const, count: 145 },
    { rank: 5, keyword: '포장 불량', sentiment: 'negative' as const, count: 89 },
  ];

  return (
    <>
      <Header title="대시보드" />
      <main className="flex-1 p-6 overflow-y-auto">
        {/* StatCards */}
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

        {/* 차트 행 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RatingChart data={ratingData} />
          <SentimentChart data={sentimentData} total={totalReviews} />
        </div>

        {/* 키워드 트렌드 TOP5 */}
        <KeywordList keywords={keywords} />
      </main>
    </>
  );
}
