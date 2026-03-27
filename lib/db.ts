// ============================================
// Supabase 데이터 저장소 + CRUD 헬퍼 (멀티테넌트)
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
import {
  Store,
  Review,
  ReviewResponse,
  ResponseTemplate,
  ExtensionToken,
} from '../types';

// ============================================
// DB ↔ App 필드명 변환 (snake_case ↔ camelCase)
// ============================================

function toStore(row: Record<string, unknown>): Store {
  return {
    id: row.id as string,
    name: row.name as string,
    platform: row.platform as Store['platform'],
    url: row.url as string | undefined,
    createdAt: row.created_at as string,
  };
}

function toReview(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    storeId: row.store_id as string,
    platform: row.platform as Review['platform'],
    author: row.author as string,
    rating: row.rating as Review['rating'],
    content: row.content as string,
    productName: row.product_name as string,
    sentiment: row.sentiment as Review['sentiment'],
    status: row.status as Review['status'],
    source: row.source as Review['source'],
    externalId: row.external_id as string | undefined,
    createdAt: row.created_at as string,
  };
}

function toResponse(row: Record<string, unknown>): ReviewResponse {
  return {
    id: row.id as string,
    reviewId: row.review_id as string,
    content: row.content as string,
    tone: row.tone as string,
    templateId: row.template_id as string | undefined,
    isEdited: row.is_edited as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toTemplate(row: Record<string, unknown>): ResponseTemplate {
  return {
    id: row.id as string,
    name: row.name as string,
    tone: row.tone as ResponseTemplate['tone'],
    description: row.description as string,
    signature: row.signature as string | undefined,
    isDefault: row.is_default as boolean,
    createdAt: row.created_at as string,
  };
}

function toToken(row: Record<string, unknown>): ExtensionToken {
  return {
    id: row.id as string,
    token: row.token as string,
    createdAt: row.created_at as string,
    lastUsedAt: row.last_used_at as string | undefined,
    isActive: row.is_active as boolean,
  };
}

// ============================================
// 엔티티별 DB 인터페이스 (멀티테넌트)
// ============================================

export const db = {
  // ---- 스토어 ----
  stores: {
    getAll: async (tenantId: string) => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(toStore);
    },
    getById: async (id: string, tenantId: string) => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();
      if (error) return undefined;
      return toStore(data);
    },
    create: async (tenantId: string, input: Omit<Store, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('stores')
        .insert({ tenant_id: tenantId, name: input.name, platform: input.platform, url: input.url })
        .select()
        .single();
      if (error) throw error;
      return toStore(data);
    },
    update: async (id: string, tenantId: string, updates: Partial<Store>) => {
      const row: Record<string, unknown> = {};
      if (updates.name !== undefined) row.name = updates.name;
      if (updates.platform !== undefined) row.platform = updates.platform;
      if (updates.url !== undefined) row.url = updates.url;
      const { data, error } = await supabase
        .from('stores')
        .update(row)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();
      if (error) return undefined;
      return toStore(data);
    },
    delete: async (id: string, tenantId: string) => {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId);
      return !error;
    },
  },

  // ---- 리뷰 ----
  reviews: {
    getAll: async (tenantId: string) => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(toReview);
    },
    getById: async (id: string, tenantId: string) => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();
      if (error) return undefined;
      return toReview(data);
    },
    create: async (tenantId: string, input: Omit<Review, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          tenant_id: tenantId,
          store_id: input.storeId,
          platform: input.platform,
          author: input.author,
          rating: input.rating,
          content: input.content,
          product_name: input.productName,
          sentiment: input.sentiment,
          status: input.status,
          source: input.source,
          external_id: input.externalId,
        })
        .select()
        .single();
      if (error) throw error;
      return toReview(data);
    },
    bulkCreate: async (tenantId: string, items: Omit<Review, 'id' | 'createdAt'>[]) => {
      const rows = items.map((input) => ({
        tenant_id: tenantId,
        store_id: input.storeId,
        platform: input.platform,
        author: input.author,
        rating: input.rating,
        content: input.content,
        product_name: input.productName,
        sentiment: input.sentiment,
        status: input.status,
        source: input.source,
        external_id: input.externalId,
      }));
      const { data, error } = await supabase
        .from('reviews')
        .insert(rows)
        .select();
      if (error) throw error;
      return (data || []).map(toReview);
    },
    update: async (id: string, tenantId: string, updates: Partial<Review>) => {
      const row: Record<string, unknown> = {};
      if (updates.status !== undefined) row.status = updates.status;
      if (updates.sentiment !== undefined) row.sentiment = updates.sentiment;
      if (updates.content !== undefined) row.content = updates.content;
      if (updates.rating !== undefined) row.rating = updates.rating;
      if (updates.author !== undefined) row.author = updates.author;
      if (updates.productName !== undefined) row.product_name = updates.productName;
      const { data, error } = await supabase
        .from('reviews')
        .update(row)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();
      if (error) return undefined;
      return toReview(data);
    },
    delete: async (id: string, tenantId: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId);
      return !error;
    },
    getResponses: async (reviewId: string, tenantId: string) => {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('review_id', reviewId)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(toResponse);
    },
  },

  // ---- 응답 ----
  responses: {
    getAll: async (tenantId: string) => {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(toResponse);
    },
    getById: async (id: string, tenantId: string) => {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();
      if (error) return undefined;
      return toResponse(data);
    },
    create: async (tenantId: string, input: Omit<ReviewResponse, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('responses')
        .insert({
          tenant_id: tenantId,
          review_id: input.reviewId,
          content: input.content,
          tone: input.tone,
          template_id: input.templateId,
          is_edited: input.isEdited,
        })
        .select()
        .single();
      if (error) throw error;
      return toResponse(data);
    },
    update: async (id: string, tenantId: string, updates: Partial<ReviewResponse>) => {
      const row: Record<string, unknown> = {};
      if (updates.content !== undefined) row.content = updates.content;
      if (updates.tone !== undefined) row.tone = updates.tone;
      if (updates.isEdited !== undefined) row.is_edited = updates.isEdited;
      row.updated_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('responses')
        .update(row)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();
      if (error) return undefined;
      return toResponse(data);
    },
    delete: async (id: string, tenantId: string) => {
      const { error } = await supabase
        .from('responses')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId);
      return !error;
    },
  },

  // ---- 템플릿 ----
  templates: {
    getAll: async (tenantId: string) => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(toTemplate);
    },
    getById: async (id: string, tenantId: string) => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();
      if (error) return undefined;
      return toTemplate(data);
    },
    create: async (tenantId: string, input: Omit<ResponseTemplate, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('templates')
        .insert({
          tenant_id: tenantId,
          name: input.name,
          tone: input.tone,
          description: input.description,
          signature: input.signature,
          is_default: input.isDefault,
        })
        .select()
        .single();
      if (error) throw error;
      return toTemplate(data);
    },
    update: async (id: string, tenantId: string, updates: Partial<ResponseTemplate>) => {
      const row: Record<string, unknown> = {};
      if (updates.name !== undefined) row.name = updates.name;
      if (updates.tone !== undefined) row.tone = updates.tone;
      if (updates.description !== undefined) row.description = updates.description;
      if (updates.signature !== undefined) row.signature = updates.signature;
      if (updates.isDefault !== undefined) row.is_default = updates.isDefault;
      const { data, error } = await supabase
        .from('templates')
        .update(row)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();
      if (error) return undefined;
      return toTemplate(data);
    },
    delete: async (id: string, tenantId: string) => {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId);
      return !error;
    },
    getDefault: async (tenantId: string) => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_default', true)
        .single();
      if (error) return undefined;
      return toTemplate(data);
    },
  },

  // ---- 테넌트 ----
  tenants: {
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return undefined;
      return data;
    },
    getBySlug: async (slug: string) => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) return undefined;
      return data;
    },
    create: async (input: { name: string; slug: string; plan?: string }) => {
      const { data, error } = await supabase
        .from('tenants')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  // ---- 사용자 ----
  users: {
    getByEmail: async (email: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      if (error) return undefined;
      return data;
    },
    create: async (input: { tenant_id: string; email: string; name: string; role?: string }) => {
      const { data, error } = await supabase
        .from('users')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },
};
