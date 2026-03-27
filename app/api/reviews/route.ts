// ============================================
// GET /api/reviews — 리뷰 목록 (필터+페이지네이션)
// POST /api/reviews — 리뷰 임포트 (JSON 배열)
// ============================================

import { NextRequest } from 'next/server';
import { db } from '../../../lib/db';
import { getTenantId } from '../../../lib/tenant';
import { jsonResponse, handleOptions } from '../../../lib/cors';
import {
  Review,
  Platform,
  ResponseStatus,
  Rating,
  ApiResponse,
  PaginatedResponse,
} from '../../../types';

export async function OPTIONS() {
  return handleOptions();
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

    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터 파싱
    const platform = searchParams.get('platform') as Platform | null;
    const ratingStr = searchParams.get('rating');
    const rating = ratingStr ? (parseInt(ratingStr) as Rating) : null;
    const status = searchParams.get('status') as ResponseStatus | null;
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));

    // 전체 리뷰 조회 후 필터 적용
    let reviews = await db.reviews.getAll(tenantId);

    if (platform) {
      reviews = reviews.filter((r) => r.platform === platform);
    }
    if (rating) {
      reviews = reviews.filter((r) => r.rating === rating);
    }
    if (status) {
      reviews = reviews.filter((r) => r.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      reviews = reviews.filter(
        (r) =>
          r.content.toLowerCase().includes(q) ||
          r.author.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q)
      );
    }

    // 페이지네이션
    const total = reviews.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paged = reviews.slice(offset, offset + limit);

    const response: PaginatedResponse<Review> = {
      success: true,
      data: paged,
      pagination: { page, limit, total, totalPages },
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('[Reviews GET] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '리뷰 목록 조회 중 오류가 발생했습니다.' },
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '테넌트 정보가 필요합니다.' },
        401
      );
    }

    const body = await request.json();

    // 입력 검증: 배열이어야 함
    if (!Array.isArray(body)) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '리뷰 데이터는 JSON 배열이어야 합니다.' },
        400
      );
    }

    if (body.length === 0) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '빈 배열입니다. 최소 1건의 리뷰가 필요합니다.' },
        400
      );
    }

    // 각 리뷰 항목 검증 및 정규화
    const validReviews: Omit<Review, 'id' | 'createdAt'>[] = [];
    const errors: string[] = [];

    body.forEach((item: Record<string, unknown>, idx: number) => {
      if (!item.content || typeof item.content !== 'string') {
        errors.push(`[${idx}] content 필드가 필요합니다.`);
        return;
      }
      if (!item.rating || typeof item.rating !== 'number' || item.rating < 1 || item.rating > 5) {
        errors.push(`[${idx}] rating은 1~5 사이 숫자여야 합니다.`);
        return;
      }

      validReviews.push({
        storeId: (item.storeId as string) || 'store-1',
        platform: (['naver', 'coupang', '11st', 'other'].includes(item.platform as string)
          ? item.platform
          : 'other') as Platform,
        author: (item.author as string) || '익명',
        rating: item.rating as Rating,
        content: item.content as string,
        productName: (item.productName as string) || '상품명 없음',
        sentiment: determineSentiment(item.rating as number),
        status: 'pending',
        source: (item.source as Review['source']) || 'manual',
        externalId: item.externalId as string | undefined,
      });
    });

    if (errors.length > 0 && validReviews.length === 0) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '유효한 리뷰가 없습니다.', message: errors.join('; ') },
        400
      );
    }

    const created = await db.reviews.bulkCreate(tenantId, validReviews);

    return jsonResponse<ApiResponse<{ imported: number; errors: string[] }>>(
      {
        success: true,
        data: { imported: created.length, errors },
        message: `${created.length}건의 리뷰를 임포트했습니다.`,
      },
      201
    );
  } catch (error) {
    console.error('[Reviews POST] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '리뷰 임포트 중 오류가 발생했습니다.' },
      500
    );
  }
}

/** 별점 기반 감성 추정 */
function determineSentiment(rating: number): Review['sentiment'] {
  if (rating >= 4) return 'positive';
  if (rating === 3) return 'neutral';
  return 'negative';
}
