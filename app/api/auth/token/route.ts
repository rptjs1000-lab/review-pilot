// ============================================
// POST /api/auth/token — Extension 연결 토큰 생성
// GET /api/auth/token — 현재 토큰 목록
// ============================================

import { NextRequest } from 'next/server';
import { db } from '../../../../lib/db';
import { generateToken } from '../../../../lib/auth';
import { jsonResponse, handleOptions } from '../../../../lib/cors';
import { ExtensionToken, ApiResponse } from '../../../../types';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(_request: NextRequest) {
  try {
    const tokens = db.tokens.getAll();

    // 보안: 토큰 값은 마스킹 (앞 8자리만 노출)
    const masked = tokens.map((t) => ({
      ...t,
      token: t.token.substring(0, 8) + '...',
    }));

    const response: ApiResponse<typeof masked> = {
      success: true,
      data: masked,
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('[Auth Token GET] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '토큰 목록 조회 중 오류가 발생했습니다.' },
      500
    );
  }
}

export async function POST(_request: NextRequest) {
  try {
    const token = generateToken();

    const entry = db.tokens.create({
      token,
      isActive: true,
      lastUsedAt: undefined,
    });

    const response: ApiResponse<ExtensionToken> = {
      success: true,
      data: entry,
      message: 'Extension 연결 토큰이 생성되었습니다. 이 토큰을 Chrome Extension 설정에 입력하세요.',
    };

    return jsonResponse(response, 201);
  } catch (error) {
    console.error('[Auth Token POST] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '토큰 생성 중 오류가 발생했습니다.' },
      500
    );
  }
}
