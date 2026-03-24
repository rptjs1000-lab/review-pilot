// ============================================
// GET /api/templates — 템플릿 목록
// POST /api/templates — 템플릿 추가
// ============================================

import { NextRequest } from 'next/server';
import { db } from '../../../lib/db';
import { jsonResponse, handleOptions } from '../../../lib/cors';
import { ResponseTemplate, ResponseTone, ApiResponse } from '../../../types';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(_request: NextRequest) {
  try {
    const templates = db.templates.getAll();

    const response: ApiResponse<ResponseTemplate[]> = {
      success: true,
      data: templates,
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('[Templates GET] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '템플릿 목록 조회 중 오류가 발생했습니다.' },
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, tone, description, signature, isDefault } = body;

    // 입력 검증
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '템플릿명(name)이 필요합니다.' },
        400
      );
    }

    const validTones: ResponseTone[] = [
      'friendly',
      'formal',
      'casual',
      'professional',
      'custom',
    ];
    if (!tone || !validTones.includes(tone)) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: `tone은 ${validTones.join(', ')} 중 하나여야 합니다.` },
        400
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '톤 설명(description)이 필요합니다.' },
        400
      );
    }

    // 기본 톤으로 설정 시 기존 기본 톤 해제
    if (isDefault) {
      const currentDefault = db.templates.getDefault();
      if (currentDefault) {
        db.templates.update(currentDefault.id, { isDefault: false });
      }
    }

    const template = db.templates.create({
      name: name.trim(),
      tone,
      description: description.trim(),
      signature: signature || undefined,
      isDefault: !!isDefault,
    });

    const response: ApiResponse<ResponseTemplate> = {
      success: true,
      data: template,
      message: '템플릿이 추가되었습니다.',
    };

    return jsonResponse(response, 201);
  } catch (error) {
    console.error('[Templates POST] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '템플릿 추가 중 오류가 발생했습니다.' },
      500
    );
  }
}
