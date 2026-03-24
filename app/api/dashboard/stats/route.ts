// ============================================
// GET /api/dashboard/stats — 대시보드 통계
// ============================================

import { NextRequest } from 'next/server';
import { db } from '../../../../lib/db';
import { jsonResponse, handleOptions } from '../../../../lib/cors';
import { DashboardStats, ApiResponse } from '../../../../types';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(_request: NextRequest) {
  try {
    const reviews = db.reviews.getAll();
    const responses = db.responses.getAll();

    // 총 리뷰 수
    const totalReviews = reviews.length;

    // 미응답 리뷰 수
    const pendingReviews = reviews.filter((r) => r.status === 'pending').length;

    // 평균 별점
    const averageRating =
      totalReviews > 0
        ? Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) *
              100
          ) / 100
        : 0;

    // AI 응답 생성 수
    const totalResponses = responses.length;

    // 별점 분포
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<
      1 | 2 | 3 | 4 | 5,
      number
    >;
    reviews.forEach((r) => {
      ratingDistribution[r.rating]++;
    });

    // 감성 분포
    const sentimentDistribution = { positive: 0, negative: 0, neutral: 0 };
    reviews.forEach((r) => {
      sentimentDistribution[r.sentiment]++;
    });

    // 키워드 TOP10 — 리뷰 본문에서 자주 등장하는 한국어 키워드 추출
    const keywordMap = new Map<string, number>();
    const stopWords = new Set([
      '이', '그', '저', '것', '수', '를', '의', '에', '가', '은', '는',
      '도', '로', '과', '와', '한', '있', '없', '에서', '으로', '하고',
      '이고', '하는', '되는', '합니다', '입니다', '해요', '네요', '어요',
      '아요', '습니다', '했', '된', '인', '및', '등', '더', '좀', '다',
      '너무', '정말', '진짜', '아주', '매우', '조금', '약간', '별로',
    ]);

    // 의미있는 키워드 목록
    const meaningfulKeywords = [
      '배송', '품질', '가격', '디자인', '색상', '사이즈', '크기',
      '마감', '내구성', '포장', '재구매', '추천', '만족', '불만',
      '교환', '환불', '고장', '불량', '스크래치', '냄새',
      '가성비', '실물', '사진', '선물', '인테리어', '설명서',
      '고객센터', '서비스', '응답', '빠르', '느리', '좋',
    ];

    reviews.forEach((r) => {
      meaningfulKeywords.forEach((keyword) => {
        if (r.content.includes(keyword)) {
          keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + 1);
        }
      });
    });

    const topKeywords = Array.from(keywordMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    const stats: DashboardStats = {
      totalReviews,
      pendingReviews,
      averageRating,
      totalResponses,
      ratingDistribution,
      sentimentDistribution,
      topKeywords,
    };

    const response: ApiResponse<DashboardStats> = {
      success: true,
      data: stats,
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('[Dashboard Stats] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '통계 조회 중 오류가 발생했습니다.' },
      500
    );
  }
}
