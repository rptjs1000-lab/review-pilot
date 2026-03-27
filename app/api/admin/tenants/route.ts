// ============================================
// GET /api/admin/tenants — 전체 업체 목록
// POST /api/admin/tenants — 업체 + 사장님 계정 생성
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const ADMIN_EMAIL = 'rptjs1000@gmail.com';

// 관리자 권한 확인
async function verifyAdmin(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

// Service Role 클라이언트 (사용자 생성용)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('tenants')
    .select('*, users(email, name, role)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const body = await request.json();
  const { tenantName, slug, ownerEmail, ownerName, ownerPassword } = body;

  if (!tenantName || !slug || !ownerEmail || !ownerName || !ownerPassword) {
    return NextResponse.json(
      { success: false, error: '모든 필드를 입력해주세요.' },
      { status: 400 }
    );
  }

  if (ownerPassword.length < 6) {
    return NextResponse.json(
      { success: false, error: '비밀번호는 6자 이상이어야 합니다.' },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  // 1. 테넌트 생성
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({ name: tenantName, slug, plan: 'basic' })
    .select()
    .single();

  if (tenantError) {
    return NextResponse.json(
      { success: false, error: `업체 생성 실패: ${tenantError.message}` },
      { status: 500 }
    );
  }

  // 2. Supabase Auth 사용자 생성
  const { error: authError } = await supabase.auth.admin.createUser({
    email: ownerEmail,
    password: ownerPassword,
    email_confirm: true,
  });

  if (authError) {
    // 롤백: 테넌트 삭제
    await supabase.from('tenants').delete().eq('id', tenant.id);
    return NextResponse.json(
      { success: false, error: `계정 생성 실패: ${authError.message}` },
      { status: 500 }
    );
  }

  // 3. users 테이블에 레코드 생성 (테넌트 연결)
  const { error: userError } = await supabase
    .from('users')
    .insert({
      tenant_id: tenant.id,
      email: ownerEmail,
      name: ownerName,
      role: 'owner',
    });

  if (userError) {
    return NextResponse.json(
      { success: false, error: `사용자 레코드 생성 실패: ${userError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { tenant, ownerEmail },
    message: `${tenantName} 업체와 사장님 계정이 생성되었습니다.`,
  }, { status: 201 });
}
