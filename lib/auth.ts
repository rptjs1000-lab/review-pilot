// ============================================
// 인증 유틸리티
// ============================================
// TODO: Supabase Auth 전환 시 이 파일을 교체

/** UUID v4 생성 */
export function generateToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** 토큰 유효성 검증 — Supabase Auth 전환 전 임시 비활성화 */
export function verifyToken(_token: string): boolean {
  return false;
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
