// ============================================
// POST /api/reviews/[id]/generate — AI 응답 생성
// ============================================

import { NextRequest } from 'next/server';
import { db } from '../../../../../lib/db';
import { getTenantId } from '../../../../../lib/tenant';
import { generateResponse } from '../../../../../lib/ai';
import { canGenerate, incrementUsage } from '../../../../../lib/usage';
import { jsonResponse, handleOptions } from '../../../../../lib/cors';
import { ReviewResponse, ApiResponse, GenerateRequest } from '../../../../../types';

export async function OPTIONS() {
  return handleOptions();
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '테넌트 정보가 필요합니다.' },
        401
      );
    }

    const { id } = await params;

    // 사용량 체크
    const usageCheck = canGenerate();
    if (!usageCheck.allowed) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: usageCheck.reason },
        403
      );
    }

    // 리뷰 존재 여부 확인
    const review = await db.reviews.getById(id, tenantId);
    if (!review) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '리뷰를 찾을 수 없습니다.' },
        404
      );
    }

    // 요청 본문 파싱
    let body: GenerateRequest;
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const { tone, templateId } = body;

    // 템플릿 조회
    let template = templateId
      ? await db.templates.getById(templateId, tenantId)
      : undefined;

    // 톤이 지정되었지만 templateId가 없으면 해당 톤의 기본 템플릿 검색
    if (!template && tone) {
      const allTemplates = await db.templates.getAll(tenantId);
      template = allTemplates.find((t) => t.tone === tone);
    }

    // 기본 템플릿 폴백
    if (!template) {
      template = await db.templates.getDefault(tenantId);
    }

    // AI 응답 생성
    const content = await generateResponse(review, template || undefined);

    // 응답 저장
    const reviewResponse = await db.responses.create(tenantId, {
      reviewId: id,
      content,
      tone: template?.tone || tone || 'friendly',
      templateId: template?.id,
      isEdited: false,
    });

    // 리뷰 상태를 'responded'로 업데이트
    await db.reviews.update(id, tenantId, { status: 'responded' });

    // 사용량 카운터 증가
    incrementUsage();

    const response: ApiResponse<ReviewResponse> = {
      success: true,
      data: reviewResponse,
      message: 'AI 응답이 생성되었습니다.',
    };

    return jsonResponse(response, 201);
  } catch (error) {
    console.error('[Generate] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: 'AI 응답 생성 중 오류가 발생했습니다.' },
      500
    );
  }
}
