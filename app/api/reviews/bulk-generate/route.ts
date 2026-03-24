// ============================================
// POST /api/reviews/bulk-generate — 일괄 AI 응답 생성
// ============================================

import { NextRequest } from 'next/server';
import { db } from '../../../../lib/db';
import { generateResponse } from '../../../../lib/ai';
import { canGenerate, incrementUsage } from '../../../../lib/usage';
import { jsonResponse, handleOptions } from '../../../../lib/cors';
import { ReviewResponse, ApiResponse, BulkGenerateRequest } from '../../../../types';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: NextRequest) {
  try {
    const body: BulkGenerateRequest = await request.json();
    const { reviewIds, tone } = body;

    // 입력 검증
    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: 'reviewIds 배열이 필요합니다.' },
        400
      );
    }

    // 최대 10건 제한
    if (reviewIds.length > 10) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '일괄 생성은 최대 10건까지 가능합니다.' },
        400
      );
    }

    // 사용량 체크
    const usageCheck = canGenerate();
    if (!usageCheck.allowed) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: usageCheck.reason },
        403
      );
    }

    // 톤에 해당하는 템플릿 조회
    const template = tone
      ? db.templates.getAll().find((t) => t.tone === tone)
      : db.templates.getDefault();

    const results: ReviewResponse[] = [];
    const errors: { reviewId: string; error: string }[] = [];

    // 순차적으로 응답 생성 (API rate limit 고려)
    for (const reviewId of reviewIds) {
      try {
        // M-9: 매 반복마다 사용량 재체크 — 한도 초과 시 루프 중단
        const loopUsageCheck = canGenerate();
        if (!loopUsageCheck.allowed) {
          errors.push({ reviewId, error: loopUsageCheck.reason || '사용량 한도 초과' });
          // 나머지 리뷰도 동일 사유로 스킵 — 루프 중단
          const remainingIdx = reviewIds.indexOf(reviewId);
          for (let i = remainingIdx + 1; i < reviewIds.length; i++) {
            errors.push({ reviewId: reviewIds[i], error: loopUsageCheck.reason || '사용량 한도 초과' });
          }
          break;
        }

        const review = db.reviews.getById(reviewId);
        if (!review) {
          errors.push({ reviewId, error: '리뷰를 찾을 수 없습니다.' });
          continue;
        }

        // 이미 응답된 리뷰는 건너뜀
        if (review.status === 'responded') {
          errors.push({ reviewId, error: '이미 응답이 생성된 리뷰입니다.' });
          continue;
        }

        // AI 응답 생성
        const content = await generateResponse(review, template || undefined);

        // 응답 저장
        const reviewResponse = db.responses.create({
          reviewId,
          content,
          tone: template?.tone || tone || 'friendly',
          templateId: template?.id,
          isEdited: false,
        });

        // 리뷰 상태 업데이트
        db.reviews.update(reviewId, { status: 'responded' });

        // 사용량 카운터 증가
        incrementUsage();

        results.push(reviewResponse);
      } catch (err) {
        errors.push({
          reviewId,
          error: err instanceof Error ? err.message : '응답 생성 실패',
        });
      }
    }

    const response: ApiResponse<{
      generated: ReviewResponse[];
      errors: { reviewId: string; error: string }[];
      summary: { total: number; success: number; failed: number };
    }> = {
      success: true,
      data: {
        generated: results,
        errors,
        summary: {
          total: reviewIds.length,
          success: results.length,
          failed: errors.length,
        },
      },
      message: `${results.length}건의 응답이 생성되었습니다.`,
    };

    return jsonResponse(response, 201);
  } catch (error) {
    console.error('[Bulk Generate] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '일괄 응답 생성 중 오류가 발생했습니다.' },
      500
    );
  }
}
