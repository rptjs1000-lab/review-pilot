// ============================================
// ReviewPilot 타입 정의
// ============================================

/** 플랫폼 */
export type Platform = 'naver' | 'coupang' | '11st' | 'other';

/** 감성 분석 결과 */
export type Sentiment = 'positive' | 'neutral' | 'negative';

/** 응답 상태 */
export type ResponseStatus = 'pending' | 'responded' | 'hold';

/** 응답 톤 */
export type ResponseTone = 'friendly' | 'formal' | 'casual' | 'professional' | 'custom';

/** 리뷰 수집 경로 */
export type ReviewSource = 'manual' | 'csv' | 'extension';

/** 별점 */
export type Rating = 1 | 2 | 3 | 4 | 5;

// ============================================
// 엔티티 인터페이스
// ============================================

/** 스토어 (등록된 쇼핑몰) */
export interface Store {
  id: string;
  name: string;
  platform: Platform;
  url?: string;
  createdAt: string; // ISO 8601
}

/** 리뷰 */
export interface Review {
  id: string;
  storeId: string;
  platform: Platform;
  author: string;
  rating: Rating;
  content: string;
  productName: string;
  sentiment: Sentiment;
  status: ResponseStatus;
  source: ReviewSource;
  externalId?: string;
  createdAt: string;
}

/** AI 생성 응답 */
export interface ReviewResponse {
  id: string;
  reviewId: string;
  content: string;
  tone: string;
  templateId?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 응답 템플릿 */
export interface ResponseTemplate {
  id: string;
  name: string;
  tone: ResponseTone;
  description: string;
  signature?: string;
  isDefault: boolean;
  createdAt: string;
}

/** Extension 연결 토큰 */
export interface ExtensionToken {
  id: string;
  token: string;
  createdAt: string;
  lastUsedAt?: string;
  isActive: boolean;
}

/** 대시보드 통계 */
export interface DashboardStats {
  totalReviews: number;
  pendingReviews: number;
  averageRating: number;
  totalResponses: number;
  ratingDistribution: Record<Rating, number>;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  topKeywords: { keyword: string; count: number }[];
}

// ============================================
// API 요청/응답 타입
// ============================================

/** AI 응답 생성 요청 */
export interface GenerateRequest {
  tone?: ResponseTone;
  templateId?: string;
}

/** 일괄 응답 생성 요청 */
export interface BulkGenerateRequest {
  reviewIds: string[];
  tone?: ResponseTone;
}

/** 통일 API 응답 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** 페이지네이션 응답 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** 리뷰 목록 쿼리 파라미터 */
export interface ReviewListQuery {
  platform?: Platform;
  rating?: Rating;
  status?: ResponseStatus;
  search?: string;
  page?: number;
  limit?: number;
}
