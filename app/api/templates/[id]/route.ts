// ============================================
// PUT /api/templates/[id] — 템플릿 수정
// DELETE /api/templates/[id] — 템플릿 삭제
// ============================================

import { NextRequest } from 'next/server';
import { db } from '../../../../lib/db';
import { jsonResponse, handleOptions } from '../../../../lib/cors';
import { ResponseTemplate, ResponseTone, ApiResponse } from '../../../../types';

export async function OPTIONS() {
  return handleOptions();
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = db.templates.getById(id);
    if (!existing) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '템플릿을 찾을 수 없습니다.' },
        404
      );
    }

    const body = await request.json();
    const updates: Partial<ResponseTemplate> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return jsonResponse<ApiResponse<null>>(
          { success: false, error: '템플릿명이 비어있습니다.' },
          400
        );
      }
      updates.name = body.name.trim();
    }

    if (body.tone !== undefined) {
      const validTones: ResponseTone[] = [
        'friendly', 'formal', 'casual', 'professional', 'custom',
      ];
      if (!validTones.includes(body.tone)) {
        return jsonResponse<ApiResponse<null>>(
          { success: false, error: `tone은 ${validTones.join(', ')} 중 하나여야 합니다.` },
          400
        );
      }
      updates.tone = body.tone;
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string' || body.description.trim().length === 0) {
        return jsonResponse<ApiResponse<null>>(
          { success: false, error: '톤 설명이 비어있습니다.' },
          400
        );
      }
      updates.description = body.description.trim();
    }

    if (body.signature !== undefined) {
      updates.signature = body.signature || undefined;
    }

    if (body.isDefault !== undefined) {
      // 기본 톤 설정 시 기존 기본 톤 해제
      if (body.isDefault) {
        const currentDefault = db.templates.getDefault();
        if (currentDefault && currentDefault.id !== id) {
          db.templates.update(currentDefault.id, { isDefault: false });
        }
      }
      updates.isDefault = !!body.isDefault;
    }

    const updated = db.templates.update(id, updates);

    const response: ApiResponse<ResponseTemplate> = {
      success: true,
      data: updated as ResponseTemplate,
      message: '템플릿이 수정되었습니다.',
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('[Template PUT] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '템플릿 수정 중 오류가 발생했습니다.' },
      500
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = db.templates.getById(id);
    if (!existing) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '템플릿을 찾을 수 없습니다.' },
        404
      );
    }

    // 기본 템플릿은 삭제 불가
    if (existing.isDefault) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '기본 톤 템플릿은 삭제할 수 없습니다. 먼저 다른 템플릿을 기본으로 설정하세요.' },
        400
      );
    }

    db.templates.delete(id);

    const response: ApiResponse<null> = {
      success: true,
      message: '템플릿이 삭제되었습니다.',
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('[Template DELETE] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '템플릿 삭제 중 오류가 발생했습니다.' },
      500
    );
  }
}
