// ============================================
// PUT /api/stores/[id] — 스토어 수정
// DELETE /api/stores/[id] — 스토어 삭제
// ============================================

import { NextRequest } from 'next/server';
import { db } from '../../../../lib/db';
import { getTenantId } from '../../../../lib/tenant';
import { jsonResponse, handleOptions } from '../../../../lib/cors';
import { Store, Platform, ApiResponse } from '../../../../types';

export async function OPTIONS() {
  return handleOptions();
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '테넌트 정보가 필요합니다.' },
        401
      );
    }

    const { id } = await params;

    const existing = await db.stores.getById(id, tenantId);
    if (!existing) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '스토어를 찾을 수 없습니다.' },
        404
      );
    }

    const body = await request.json();
    const updates: Partial<Store> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return jsonResponse<ApiResponse<null>>(
          { success: false, error: '스토어명이 비어있습니다.' },
          400
        );
      }
      updates.name = body.name.trim();
    }

    if (body.platform !== undefined) {
      const validPlatforms: Platform[] = ['naver', 'coupang', '11st', 'other'];
      if (!validPlatforms.includes(body.platform)) {
        return jsonResponse<ApiResponse<null>>(
          { success: false, error: `platform은 ${validPlatforms.join(', ')} 중 하나여야 합니다.` },
          400
        );
      }
      updates.platform = body.platform;
    }

    if (body.url !== undefined) {
      updates.url = body.url || undefined;
    }

    const updated = await db.stores.update(id, tenantId, updates);

    const response: ApiResponse<Store> = {
      success: true,
      data: updated as Store,
      message: '스토어가 수정되었습니다.',
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('[Store PUT] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '스토어 수정 중 오류가 발생했습니다.' },
      500
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const tenantId = await getTenantId(_request);
    if (!tenantId) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '테넌트 정보가 필요합니다.' },
        401
      );
    }

    const { id } = await params;

    const existing = await db.stores.getById(id, tenantId);
    if (!existing) {
      return jsonResponse<ApiResponse<null>>(
        { success: false, error: '스토어를 찾을 수 없습니다.' },
        404
      );
    }

    await db.stores.delete(id, tenantId);

    const response: ApiResponse<null> = {
      success: true,
      message: '스토어가 삭제되었습니다.',
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('[Store DELETE] 에러:', error);
    return jsonResponse<ApiResponse<null>>(
      { success: false, error: '스토어 삭제 중 오류가 발생했습니다.' },
      500
    );
  }
}
