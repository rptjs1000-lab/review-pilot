// 요청에서 tenantId 자동 추출
// Supabase Auth 세션 → users 테이블에서 tenant_id 조회

import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function getTenantId(request: NextRequest): Promise<string | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // users 테이블에서 tenant_id 조회
  const { data } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('email', user.email)
    .single();

  return data?.tenant_id || null;
}
