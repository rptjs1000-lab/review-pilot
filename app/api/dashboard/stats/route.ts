// ============================================
// GET /api/dashboard/stats — 대시보드 통계 + 리뷰 인텔리전스
// ============================================

import { NextRequest } from 'next/server';
import { db } from '../../../../lib/db';
import { getTenantId } from '../../../../lib/tenant';
import { jsonResponse, handleOptions } from '../../../../lib/cors';
import {
  DashboardStats,
  ApiResponse,
  WeeklyRatingTrend,
  KeywordChange,
  NegativeAlert,
  ActionSuggestion,
  PlatformComparisonItem,
  Review,
} from '../../../../types';

export async function OPTIONS() {
  return handleOptions();
}

// 의미있는 키워드 목록
const meaningfulKeywords = [
  '배송', '품질', '가격', '디자인', '색상', '사이즈', '크기',
  '마감', '내구성', '포장', '재구매', '추천', '만족', '불만',
  '교환', '환불', '고장', '불량', '스크래치', '냄새',
  '가성비', '실물', '사진', '선물', '인테리어', '설명서',
  '고객센터', '서비스', '응답', '빠르', '느리', '좋',
];

/** 주어진 리뷰 목록에서 키워드 빈도 추출 */
function extractKeywords(reviews: Review[]): Map<string, number> {
  const keywordMap = new Map<string, number>();
  reviews.forEach((r) => {
    meaningfulKeywords.forEach((keyword) => {
      if (r.content.includes(keyword)) {
        keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + 1);
      }
    });
  });
  return keywordMap;
}

/** 주간 경계 날짜 계산 */
function getWeekBoundaries(): { label: string; start: Date; end: Date }[] {
  const now = new Date();
  const weeks: { label: string; start: Date; end: Date }[] = [];

  for (let i = 3; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(end.getDate() - i * 7);
    end.setHours(23, 59, 59, 999);

    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const month = start.getMonth() + 1;
    const weekNum = Math.ceil(start.getDate() / 7);
    weeks.push({ label: `${month}월 ${weekNum}주`, start, end });
  }

  return weeks;
}

/** 주간 별점 추이 계산 */
function calculateWeeklyRatingTrend(reviews: Review[]): WeeklyRatingTrend[] {
  const weeks = getWeekBoundaries();

  return weeks.map(({ label, start, end }) => {
    const weekReviews = reviews.filter((r) => {
      const date = new Date(r.createdAt);
      return date >= start && date <= end;
    });

    const avg =
      weekReviews.length > 0
        ? Math.round(
            (weekReviews.reduce((sum, r) => sum + r.rating, 0) /
              weekReviews.length) *
              100
          ) / 100
        : 0;

    return { week: label, avg, count: weekReviews.length };
  });
}

/** 키워드 변화 추이 계산 (이번 주 vs 지난 주) */
function calculateKeywordChanges(reviews: Review[]): KeywordChange[] {
  const weeks = getWeekBoundaries();
  const thisWeekRange = weeks[3];
  const lastWeekRange = weeks[2];

  const thisWeekReviews = reviews.filter((r) => {
    const d = new Date(r.createdAt);
    return d >= thisWeekRange.start && d <= thisWeekRange.end;
  });

  const lastWeekReviews = reviews.filter((r) => {
    const d = new Date(r.createdAt);
    return d >= lastWeekRange.start && d <= lastWeekRange.end;
  });

  const thisWeekKw = extractKeywords(thisWeekReviews);
  const lastWeekKw = extractKeywords(lastWeekReviews);

  const allKeywords = new Set([...Array.from(thisWeekKw.keys()), ...Array.from(lastWeekKw.keys())]);
  const changes: KeywordChange[] = [];

  allKeywords.forEach((keyword) => {
    const thisCount = thisWeekKw.get(keyword) || 0;
    const lastCount = lastWeekKw.get(keyword) || 0;

    if (thisCount > 0) {
      const change =
        lastCount > 0
          ? Math.round(((thisCount - lastCount) / lastCount) * 1000) / 10
          : 100;

      changes.push({
        keyword,
        thisWeek: thisCount,
        lastWeek: lastCount,
        change,
        isNew: lastCount === 0,
      });
    }
  });

  return changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
}

/** 부정 리뷰 경고 계산 */
function calculateNegativeAlert(reviews: Review[]): NegativeAlert | null {
  const weeks = getWeekBoundaries();
  const thisWeekRange = weeks[3];
  const lastWeekRange = weeks[2];

  const thisWeekNeg = reviews.filter((r) => {
    const d = new Date(r.createdAt);
    return d >= thisWeekRange.start && d <= thisWeekRange.end && r.rating <= 2;
  });

  const lastWeekNeg = reviews.filter((r) => {
    const d = new Date(r.createdAt);
    return d >= lastWeekRange.start && d <= lastWeekRange.end && r.rating <= 2;
  });

  const thisCount = thisWeekNeg.length;
  const lastCount = lastWeekNeg.length;
  const change =
    lastCount > 0
      ? Math.round(((thisCount - lastCount) / lastCount) * 100)
      : thisCount > 0
      ? 100
      : 0;

  const negKeywords = extractKeywords(thisWeekNeg);
  let topCause = '품질 불만';
  let maxCount = 0;
  negKeywords.forEach((count, keyword) => {
    if (count > maxCount) {
      maxCount = count;
      topCause = keyword;
    }
  });

  return {
    thisWeek: thisCount,
    lastWeek: lastCount,
    change,
    topCause,
    isIncreasing: thisCount > lastCount,
  };
}

/** AI 액션 제안 생성 */
function generateActionSuggestions(
  reviews: Review[],
  keywordChanges: KeywordChange[],
  weeklyTrend: WeeklyRatingTrend[]
): ActionSuggestion[] {
  const suggestions: ActionSuggestion[] = [];

  const increasingKeywords = keywordChanges.filter((k) => k.change > 30);

  for (const kw of increasingKeywords.slice(0, 3)) {
    if (['사이즈', '크기', '교환'].includes(kw.keyword)) {
      suggestions.push({
        icon: 'size',
        text: `'${kw.keyword}' 관련 불만이 ${Math.abs(kw.change)}% 증가했습니다. 상품 상세 페이지에 사이즈 가이드 추가를 추천합니다.`,
        keywords: [kw.keyword],
        priority: 'high',
      });
    } else if (['선물', '인테리어'].includes(kw.keyword)) {
      suggestions.push({
        icon: 'gift',
        text: `'${kw.keyword}' 키워드가 급증하고 있습니다. 선물 패키지 구성이나 프로모션을 고려해보세요.`,
        keywords: [kw.keyword],
        priority: 'medium',
      });
    } else if (['포장', '불량', '스크래치'].includes(kw.keyword)) {
      suggestions.push({
        icon: 'package',
        text: `'${kw.keyword}' 관련 리뷰가 ${Math.abs(kw.change)}% 증가했습니다. 출고 전 품질 검수를 강화해주세요.`,
        keywords: [kw.keyword],
        priority: 'high',
      });
    } else if (['배송', '느리'].includes(kw.keyword)) {
      suggestions.push({
        icon: 'delivery',
        text: `'${kw.keyword}' 관련 언급이 증가 중입니다. 배송 파트너사 점검이 필요합니다.`,
        keywords: [kw.keyword],
        priority: 'high',
      });
    }
  }

  if (weeklyTrend.length >= 2) {
    const latest = weeklyTrend[weeklyTrend.length - 1];
    const prev = weeklyTrend[weeklyTrend.length - 2];
    if (latest.avg < prev.avg && latest.avg < 4.0) {
      suggestions.push({
        icon: 'rating',
        text: `평균 별점이 ${prev.avg} → ${latest.avg}으로 하락 중입니다. 최근 부정 리뷰를 집중 확인해주세요.`,
        keywords: ['별점 하락'],
        priority: 'high',
      });
    }
  }

  const newKeywords = keywordChanges.filter((k) => k.isNew && k.thisWeek >= 2);
  if (newKeywords.length > 0) {
    suggestions.push({
      icon: 'quality',
      text: `새로운 키워드가 등장했습니다: ${newKeywords.map((k) => `'${k.keyword}'`).join(', ')}. 해당 리뷰를 확인해보세요.`,
      keywords: newKeywords.map((k) => k.keyword),
      priority: 'medium',
    });
  }

  if (suggestions.length < 2) {
    suggestions.push({
      icon: 'quality',
      text: '긍정 리뷰에 빠른 감사 응답을 보내면 재구매율이 평균 23% 증가합니다. 미응답 리뷰를 확인해보세요.',
      keywords: ['재구매', '응답'],
      priority: 'low',
    });
  }

  return suggestions.slice(0, 4);
}

/** 플랫폼별 비교 데이터 */
function calculatePlatformComparison(reviews: Review[]): PlatformComparisonItem[] {
  const naverReviews = reviews.filter((r) => r.platform === 'naver');
  const naverAvg =
    naverReviews.length > 0
      ? Math.round(
          (naverReviews.reduce((sum, r) => sum + r.rating, 0) /
            naverReviews.length) *
            100
        ) / 100
      : null;

  return [
    {
      platform: 'naver',
      name: '네이버 스마트스토어',
      avgRating: naverAvg,
      count: naverReviews.length,
      isConnected: true,
    },
    {
      platform: 'coupang',
      name: '쿠팡',
      avgRating: null,
      count: 0,
      isConnected: false,
    },
    {
      platform: '11st',
      name: '11번가',
      avgRating: null,
      count: 0,
      isConnected: false,
    },
  ];
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '테넌트 정보가 필요합니다.' },
        401
      );
    }

    const reviews: Review[] = await db.reviews.getAll(tenantId);
    const responses = await db.responses.getAll(tenantId);

    const totalReviews = reviews.length;
    const pendingReviews = reviews.filter((r) => r.status === 'pending').length;

    const averageRating =
      totalReviews > 0
        ? Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) *
              100
          ) / 100
        : 0;

    const totalResponses = responses.length;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<
      1 | 2 | 3 | 4 | 5,
      number
    >;
    reviews.forEach((r) => {
      ratingDistribution[r.rating]++;
    });

    const sentimentDistribution = { positive: 0, negative: 0, neutral: 0 };
    reviews.forEach((r) => {
      sentimentDistribution[r.sentiment]++;
    });

    const keywordMap = extractKeywords(reviews);
    const topKeywords = Array.from(keywordMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    const weeklyRatingTrend = calculateWeeklyRatingTrend(reviews);
    const keywordChanges = calculateKeywordChanges(reviews);
    const negativeAlert = calculateNegativeAlert(reviews);
    const actionSuggestions = generateActionSuggestions(
      reviews,
      keywordChanges,
      weeklyRatingTrend
    );
    const platformComparison = calculatePlatformComparison(reviews);

    const stats: DashboardStats = {
      totalReviews,
      pendingReviews,
      averageRating,
      totalResponses,
      ratingDistribution,
      sentimentDistribution,
      topKeywords,
      weeklyRatingTrend,
      keywordChanges,
      negativeAlert,
      actionSuggestions,
      platformComparison,
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
