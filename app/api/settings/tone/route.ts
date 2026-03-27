// ============================================
// GET /api/settings/tone — 현재 기본 톤 조회
// ============================================

import { NextRequest } from 'next/server';
import { db } from '../../../../lib/db';
import { getTenantId } from '../../../../lib/tenant';
import { jsonResponse, handleOptions } from '../../../../lib/cors';
import { ResponseTemplate, ApiResponse } from '../../../../types';

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

    const defaultTemplate = await db.templates.getDefault(tenantId);

    if (!defaultTemplate) {
      return jsonResponse<ApiResponse<null>>(
        {
          success: true,
          data: null,
          message: '기본 톤이 설정되어 있지 않습니다.',
        }
      );
    }

    const response: ApiResponse<ResponseTemplate> = {
      success: true,
      data: defaultTemplate,
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('[Settings Tone GET] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '기본 톤 조회 중 오류가 발생했습니다.' },
      500
    );
  }
}
