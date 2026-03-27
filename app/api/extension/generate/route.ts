// ============================================
// POST /api/extension/generate — Extension 전용 원스텝 AI 응답 생성
// 리뷰 내용을 받아 바로 AI 응답만 반환 (DB 저장 없이)
// ============================================

import { NextRequest } from 'next/server';
import { generateResponse } from '../../../../lib/ai';
import { canGenerate, incrementUsage } from '../../../../lib/usage';
import { jsonResponse, handleOptions } from '../../../../lib/cors';
import { db } from '../../../../lib/db';
import { getTenantId } from '../../../../lib/tenant';
import { Review, ResponseTemplate, ApiResponse, ResponseTone, Rating } from '../../../../types';

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request);
}

/** Extension 요청 본문 타입 */
interface ExtensionGenerateRequest {
  content: string;
  rating?: number;
  tone?: ResponseTone;
  productName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '테넌트 정보가 필요합니다.' },
        401,
        request
      );
    }

    // 사용량 체크
    const usageCheck = canGenerate();
    if (!usageCheck.allowed) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: usageCheck.reason },
        403,
        request
      );
    }

    // 요청 본문 파싱
    let body: ExtensionGenerateRequest;
    try {
      body = await request.json();
    } catch {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '잘못된 요청 형식입니다.' },
        400,
        request
      );
    }

    const { content, rating, tone, productName } = body;

    if (!content || content.trim().length === 0) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '리뷰 내용(content)이 필요합니다.' },
        400,
        request
      );
    }

    // 가상 리뷰 객체 생성 (DB 저장하지 않고 AI 생성에만 사용)
    const virtualReview: Review = {
      id: 'ext-temp',
      storeId: 'ext-temp',
      platform: 'naver',
      author: '고객',
      rating: (rating && rating >= 1 && rating <= 5 ? rating : 5) as Rating,
      content: content.trim(),
      productName: productName || '상품',
      sentiment: (rating && rating <= 2) ? 'negative' : (rating === 3 ? 'neutral' : 'positive'),
      status: 'pending',
      source: 'extension',
      createdAt: new Date().toISOString(),
    };

    // 톤에 해당하는 템플릿 조회
    let template: ResponseTemplate | undefined;
    if (tone) {
      const allTemplates = await db.templates.getAll(tenantId);
      template = allTemplates.find((t) => t.tone === tone);
    } else {
      template = await db.templates.getDefault(tenantId);
    }

    // AI 응답 생성
    const responseContent = await generateResponse(virtualReview, template || undefined);

    // 사용량 카운터 증가
    incrementUsage();

    return jsonResponse<ApiResponse<{ content: string; tone: string }>>(
      {
        success: true,
        data: {
          content: responseContent,
          tone: template?.tone || tone || 'friendly',
        },
        message: 'AI 응답이 생성되었습니다.',
      },
      200,
      request
    );
  } catch (error) {
    console.error('[Extension Generate] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: 'AI 응답 생성 중 오류가 발생했습니다.' },
      500,
      request
    );
  }
}
