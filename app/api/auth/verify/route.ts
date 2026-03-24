// ============================================
// GET /api/auth/verify — 토큰 유효성 검증
// ============================================

import { NextRequest } from 'next/server';
import { verifyToken, extractBearerToken } from '../../../../lib/auth';
import { jsonResponse, handleOptions } from '../../../../lib/cors';
import { ApiResponse } from '../../../../types';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = extractBearerToken(authHeader);

    if (!token) {
      return jsonResponse<ApiResponse<{ valid: false }>>(
        {
          success: false,
          data: { valid: false },
          error: 'Authorization 헤더에 Bearer 토큰이 필요합니다.',
        },
        401
      );
    }

    const isValid = verifyToken(token);

    if (!isValid) {
      return jsonResponse<ApiResponse<{ valid: false }>>(
        {
          success: false,
          data: { valid: false },
          error: '유효하지 않거나 비활성화된 토큰입니다.',
        },
        401
      );
    }

    const response: ApiResponse<{ valid: true }> = {
      success: true,
      data: { valid: true },
      message: '토큰이 유효합니다.',
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('[Auth Verify] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '토큰 검증 중 오류가 발생했습니다.' },
      500
    );
  }
}
