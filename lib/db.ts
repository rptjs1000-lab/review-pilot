// ============================================
// 인메모리 데이터 저장소 + CRUD 헬퍼
// ============================================
//
// ⚠️ 인메모리 저장소: 동시 쓰기 보호 없음
// Map 기반 저장소는 단일 Node.js 프로세스 내에서만 유효하며,
// 서버리스 환경에서는 인스턴스 간 데이터가 공유되지 않습니다.
// 프로덕션 환경에서는 PostgreSQL, MongoDB 등 외부 DB로 전환이 필요합니다.
//

import {
  Store,
  Review,
  ReviewResponse,
  ResponseTemplate,
  ExtensionToken,
} from '../types';
import {
  seedStores,
  seedReviews,
  seedResponses,
  seedTemplates,
  seedTokens,
} from './seed-data';

// ---- 인메모리 Map 저장소 ----
const stores = new Map<string, Store>();
const reviews = new Map<string, Review>();
const responses = new Map<string, ReviewResponse>();
const templates = new Map<string, ResponseTemplate>();
const tokens = new Map<string, ExtensionToken>();

// ---- 시드 데이터 초기화 ----
function initializeData() {
  seedStores.forEach((s) => stores.set(s.id, { ...s }));
  seedReviews.forEach((r) => reviews.set(r.id, { ...r }));
  seedResponses.forEach((r) => responses.set(r.id, { ...r }));
  seedTemplates.forEach((t) => templates.set(t.id, { ...t }));
  seedTokens.forEach((t) => tokens.set(t.id, { ...t }));
}

// 서버 시작 시 초기화
initializeData();

// ============================================
// 제네릭 CRUD 헬퍼
// ============================================

/** ID 생성 유틸 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/** 모든 항목 조회 */
function getAll<T>(map: Map<string, T>): T[] {
  return Array.from(map.values());
}

/** ID로 단건 조회 */
function getById<T>(map: Map<string, T>, id: string): T | undefined {
  return map.get(id);
}

/** 새 항목 생성 */
function create<T extends { id: string }>(
  map: Map<string, T>,
  item: T
): T {
  map.set(item.id, item);
  return item;
}

/** 항목 업데이트 */
function update<T extends { id: string }>(
  map: Map<string, T>,
  id: string,
  updates: Partial<T>
): T | undefined {
  const existing = map.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...updates, id }; // id는 변경 불가
  map.set(id, updated);
  return updated;
}

/** 항목 삭제 */
function remove<T>(map: Map<string, T>, id: string): boolean {
  return map.delete(id);
}

// ============================================
// 엔티티별 DB 인터페이스
// ============================================

export const db = {
  // ---- 스토어 ----
  stores: {
    getAll: () => getAll(stores),
    getById: (id: string) => getById(stores, id),
    create: (data: Omit<Store, 'id' | 'createdAt'>) => {
      const store: Store = {
        ...data,
        id: generateId('store'),
        createdAt: new Date().toISOString(),
      };
      return create(stores, store);
    },
    update: (id: string, data: Partial<Store>) => update(stores, id, data),
    delete: (id: string) => remove(stores, id),
  },

  // ---- 리뷰 ----
  reviews: {
    getAll: () => getAll(reviews),
    getById: (id: string) => getById(reviews, id),
    create: (data: Omit<Review, 'id' | 'createdAt'>) => {
      const review: Review = {
        ...data,
        id: generateId('review'),
        createdAt: new Date().toISOString(),
      };
      return create(reviews, review);
    },
    /** 다건 임포트 */
    bulkCreate: (items: Omit<Review, 'id' | 'createdAt'>[]) => {
      return items.map((data) => {
        const review: Review = {
          ...data,
          id: generateId('review'),
          createdAt: new Date().toISOString(),
        };
        return create(reviews, review);
      });
    },
    update: (id: string, data: Partial<Review>) => update(reviews, id, data),
    delete: (id: string) => remove(reviews, id),
    /** 리뷰에 연결된 응답들 조회 */
    getResponses: (reviewId: string) =>
      getAll(responses).filter((r) => r.reviewId === reviewId),
  },

  // ---- 응답 ----
  responses: {
    getAll: () => getAll(responses),
    getById: (id: string) => getById(responses, id),
    create: (data: Omit<ReviewResponse, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const response: ReviewResponse = {
        ...data,
        id: generateId('resp'),
        createdAt: now,
        updatedAt: now,
      };
      return create(responses, response);
    },
    update: (id: string, data: Partial<ReviewResponse>) => {
      return update(responses, id, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    },
    delete: (id: string) => remove(responses, id),
  },

  // ---- 템플릿 ----
  templates: {
    getAll: () => getAll(templates),
    getById: (id: string) => getById(templates, id),
    create: (data: Omit<ResponseTemplate, 'id' | 'createdAt'>) => {
      const template: ResponseTemplate = {
        ...data,
        id: generateId('tpl'),
        createdAt: new Date().toISOString(),
      };
      return create(templates, template);
    },
    update: (id: string, data: Partial<ResponseTemplate>) =>
      update(templates, id, data),
    delete: (id: string) => remove(templates, id),
    /** 기본 톤 템플릿 조회 */
    getDefault: () => getAll(templates).find((t) => t.isDefault),
  },

  // ---- Extension 토큰 ----
  tokens: {
    getAll: () => getAll(tokens),
    getById: (id: string) => getById(tokens, id),
    getByToken: (token: string) =>
      getAll(tokens).find((t) => t.token === token && t.isActive),
    create: (data: Omit<ExtensionToken, 'id' | 'createdAt'>) => {
      const tokenEntry: ExtensionToken = {
        ...data,
        id: generateId('token'),
        createdAt: new Date().toISOString(),
      };
      return create(tokens, tokenEntry);
    },
    update: (id: string, data: Partial<ExtensionToken>) =>
      update(tokens, id, data),
    delete: (id: string) => remove(tokens, id),
  },

  /** 전체 데이터 초기화 (시드 데이터로 리셋) */
  reset: () => {
    stores.clear();
    reviews.clear();
    responses.clear();
    templates.clear();
    tokens.clear();
    initializeData();
  },
};
