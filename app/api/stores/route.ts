// ============================================
// GET /api/stores — 스토어 목록
// POST /api/stores — 스토어 추가
// ============================================

import { NextRequest } from 'next/server';
import { db } from '../../../lib/db';
import { getTenantId } from '../../../lib/tenant';
import { jsonResponse, handleOptions } from '../../../lib/cors';
import { Store, Platform, ApiResponse } from '../../../types';

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

    const stores = await db.stores.getAll(tenantId);

    const response: ApiResponse<Store[]> = {
      success: true,
      data: stores,
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('[Stores GET] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '스토어 목록 조회 중 오류가 발생했습니다.' },
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '테넌트 정보가 필요합니다.' },
        401
      );
    }

    const body = await request.json();
    const { name, platform, url } = body;

    // 입력 검증
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '스토어명(name)이 필요합니다.' },
        400
      );
    }

    const validPlatforms: Platform[] = ['naver', 'coupang', '11st', 'other'];
    if (!platform || !validPlatforms.includes(platform)) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: `platform은 ${validPlatforms.join(', ')} 중 하나여야 합니다.` },
        400
      );
    }

    const store = await db.stores.create(tenantId, {
      name: name.trim(),
      platform,
      url: url || undefined,
    });

    const response: ApiResponse<Store> = {
      success: true,
      data: store,
      message: '스토어가 등록되었습니다.',
    };

    return jsonResponse(response, 201);
  } catch (error) {
    console.error('[Stores POST] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '스토어 등록 중 오류가 발생했습니다.' },
      500
    );
  }
}
