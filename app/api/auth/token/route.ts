// ============================================
// POST /api/auth/token — Extension 연결 토큰 생성
// GET /api/auth/token — 현재 토큰 목록
// ============================================
// TODO: Supabase Auth 전환 시 이 라우트를 교체
// 현재는 멀티테넌트 전환 중 빌드 깨짐 방지용으로 유지

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

export async function POST(_request: NextRequest) {
  return jsonResponse<ApiResponse<null>>(
    { success: false, error: '인증 시스템 전환 중입니다.' },
    503
  );
}
