// ============================================
// CORS 헤더 유틸 — Chrome Extension 허용
// ============================================

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

/**
 * 허용된 Origin 목록
 * - 환경변수 ALLOWED_ORIGINS로 관리 (콤마 구분)
 * - 기본값: chrome-extension://* + localhost:3000
 * - 프로덕션에서는 특정 Extension ID와 Vercel URL만 허용할 것
 */
function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(',').map((o) => o.trim());
  }
  // 기본값: 개발 환경용
  return ['http://localhost:3000'];
}

/** 요청 Origin이 허용 목록에 포함되는지 확인 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  const allowed = getAllowedOrigins();

  // chrome-extension:// 프로토콜은 기본 허용
  if (origin.startsWith('chrome-extension://')) return true;

  return allowed.some((allowedOrigin) => {
    if (allowedOrigin === origin) return true;
    // 와일드카드 패턴 지원 (예: *.vercel.app)
    if (allowedOrigin.includes('*')) {
      const pattern = allowedOrigin.replace(/\*/g, '.*');
      return new RegExp(`^${pattern}$`).test(origin);
    }
    return false;
  });
}

/** CORS 헤더 추가 (요청 Origin 기반) */
export function corsHeaders(origin?: string | null): Record<string, string> {
  const resolvedOrigin = origin && isOriginAllowed(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': resolvedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

/** CORS preflight OPTIONS 응답 */
export function handleOptions(request?: NextRequest): NextResponse {
  const origin = request?.headers.get('origin') ?? null;
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

/** JSON 응답 + CORS 헤더 */
export function jsonResponse<T>(data: T, status = 200, request?: NextRequest): NextResponse {
  const origin = request?.headers.get('origin') ?? null;
  return NextResponse.json(data, {
    status,
    headers: corsHeaders(origin),
  });
}
