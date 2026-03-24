// ============================================
// GET /api/reviews/[id] — 리뷰 상세 (리뷰 + 연관 응답들)
// ============================================

import { NextRequest } from 'next/server';
import { db } from '../../../../lib/db';
import { jsonResponse, handleOptions } from '../../../../lib/cors';
import { Review, ReviewResponse, ApiResponse } from '../../../../types';

export async function OPTIONS() {
  return handleOptions();
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const review = db.reviews.getById(id);

    if (!review) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '리뷰를 찾을 수 없습니다.' },
        404
      );
    }

    // 해당 리뷰에 연결된 응답들 조회
    const responses = db.reviews.getResponses(id);

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
