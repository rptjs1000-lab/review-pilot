// ============================================
// GET /api/auth/verify — 토큰 유효성 검증
// ============================================
// TODO: Supabase Auth 전환 시 이 라우트를 교체

import { NextRequest } from 'next/server';
import { jsonResponse, handleOptions } from '../../../../lib/cors';
import { ApiResponse } from '../../../../types';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(_request: NextRequest) {
  return jsonResponse<ApiResponse<null>>(
    { success: false, error: '인증 시스템 전환 중입니다.' },
    503
  );
}
