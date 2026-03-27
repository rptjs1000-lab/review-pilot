// ============================================
// GET /api/reviews/[id] — 리뷰 상세 (리뷰 + 연관 응답들)
// ============================================

import { NextRequest } from 'next/server';
import { db } from '../../../../lib/db';
import { getTenantId } from '../../../../lib/tenant';
import { jsonResponse, handleOptions } from '../../../../lib/cors';
import { Review, ReviewResponse, ApiResponse } from '../../../../types';

export async function OPTIONS() {
  return handleOptions();
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '테넌트 정보가 필요합니다.' },
        401
      );
    }

    const { id } = await params;
    const review = await db.reviews.getById(id, tenantId);

    if (!review) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '리뷰를 찾을 수 없습니다.' },
        404
      );
    }

    // 해당 리뷰에 연결된 응답들 조회
    const responses = await db.reviews.getResponses(id, tenantId);

    const response: ApiResponse<{ review: Review; responses: ReviewResponse[] }> = {
      success: true,
      data: { review, responses },
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('[Review Detail] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '리뷰 상세 조회 중 오류가 발생했습니다.' },
      500
    );
  }
}
