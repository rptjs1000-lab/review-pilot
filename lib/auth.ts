// ============================================
// Extension 토큰 인증 관리
// ============================================

import { db } from './db';

/** UUID v4 생성 */
export function generateToken(): string {
  // crypto.randomUUID() 사용 (Node.js 19+, Edge runtime 지원)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // 폴백: 수동 UUID v4 생성
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** 토큰 유효성 검증 */
export function verifyToken(token: string): boolean {
  const entry = db.tokens.getByToken(token);
  if (!entry) return false;

  // 마지막 사용 시간 갱신
  db.tokens.update(entry.id, {
    lastUsedAt: new Date().toISOString(),
  });

  return true;
}

/** Authorization 헤더에서 Bearer 토큰 추출 */
export function extractBearerToken(
  authHeader: string | null
): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}
