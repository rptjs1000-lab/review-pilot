// ============================================
// PUT /api/responses/[id] — 응답 수정
// ============================================

import { NextRequest } from 'next/server';
import { db } from '../../../../lib/db';
import { jsonResponse, handleOptions } from '../../../../lib/cors';
import { ReviewResponse, ApiResponse } from '../../../../types';

export async function OPTIONS() {
  return handleOptions();
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // 기존 응답 확인
    const existing = db.responses.getById(id);
    if (!existing) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '응답을 찾을 수 없습니다.' },
        404
      );
    }

    const body = await request.json();
    const { content } = body;

    // 입력 검증
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '응답 내용(content)이 필요합니다.' },
        400
      );
    }

    // 응답 업데이트
    const updated = db.responses.update(id, {
      content: content.trim(),
      isEdited: true,
    });

    const response: ApiResponse<ReviewResponse> = {
      success: true,
      data: updated as ReviewResponse,
      message: '응답이 수정되었습니다.',
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('[Response PUT] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '응답 수정 중 오류가 발생했습니다.' },
      500
    );
  }
}
