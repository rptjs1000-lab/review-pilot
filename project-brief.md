# ReviewPilot — 쇼핑몰 리뷰 자동응답 서비스 (v2)

> 셀러가 고객 리뷰에 AI로 맞춤 응답을 자동 생성하고, 리뷰가 알려주는 매출 기회를 찾아주는 SaaS 서비스

---

## 1. 대상 사용자

| 구분 | 설명 |
|------|------|
| **주요 사용자** | 네이버 스마트스토어, 쿠팡, 11번가 등 멀티 플랫폼에서 운영하는 온라인 셀러 |
| **타겟 세그먼트** | 월매출 300~3,000만원 중소 셀러 |
| **페인 포인트** | 수십~수백 건의 리뷰에 일일이 답변 작성하는 데 시간 소모가 크고, 톤 일관성 유지가 어려움 |
| **기대 가치** | AI가 리뷰 내용·별점·감성을 분석해 브랜드 톤에 맞는 응답을 즉시 생성 → 응답 시간 단축 + 고객 만족도 향상 |

---

## 2. 핵심 기능

### 2-1. AI 자동응답 생성
- 리뷰 본문 + 별점 + 감성(긍정/부정/중립)을 분석하여 맞춤 답변 생성
- Claude API (`@anthropic-ai/sdk`) 호출, API 키 미설정 시 mock 폴백으로 데모 응답 반환
- 응답 생성 후 클립보드 복사 버튼 제공 → 셀러가 각 플랫폼에서 수동 붙여넣기

### 2-2. 리뷰 대시보드
- **StatCard 4개:** 총 리뷰 수, 미응답 리뷰 수, 평균 별점, AI 응답 생성 수
- **별점 분포 바차트:** 1~5점별 리뷰 건수 가로 막대 차트
- **감성 분석 파이차트:** 긍정/부정/중립 비율
- **키워드 트렌드 TOP10:** 리뷰에서 자주 등장하는 키워드 순위 (태그 클라우드 또는 리스트)

### 2-3. 리뷰 관리 목록
- **필터:** 플랫폼(네이버/쿠팡/11번가), 별점(1~5), 응답 상태(미응답/응답완료/보류)
- **테이블:** 리뷰 작성자, 별점, 요약, 플랫폼, 응답 상태, 작성일
- **일괄 응답 생성:** 체크박스로 여러 리뷰 선택 → 한 번에 AI 응답 생성
- **상세 보기:** 리뷰 전문 + 생성된 응답 + 수정/재생성/복사 액션

### 2-4. 응답 톤 커스터마이징
- **프리셋 톤:** 친절, 격식, 캐주얼, 전문가 — 4가지 기본 톤
- **커스텀 톤:** 셀러가 직접 톤 설명 텍스트를 입력하여 저장
- **브랜드 서명:** 응답 끝에 자동 삽입되는 브랜드 서명 문구 설정
- **템플릿 관리:** 톤별 응답 템플릿을 저장하고 재사용

### 2-5. 스토어 관리
- 여러 쇼핑몰 스토어를 등록·관리 (스토어명, 플랫폼, URL)
- 스토어별 리뷰 데이터를 CSV/JSON으로 업로드
- 스토어별 대시보드 통계 분리 조회

---

## 3. Chrome Extension

네이버 스마트스토어 관리자 페이지(`sell.smartstore.naver.com`)에서 직접 동작하는 Chrome Extension.

### 3-1. Content Script
- 리뷰 목록 페이지 감지 → 미응답 리뷰에 **"AI 응답 생성"** 버튼 주입
- 생성된 응답을 답변란에 자동 입력
- `MutationObserver`로 SPA 페이지 전환 대응
- DOM 셀렉터를 설정으로 관리하여 스마트스토어 UI 변경 시 유연하게 대응

### 3-2. Service Worker
- Content Script ↔ Next.js API 통신 중개
- 토큰 기반 인증 처리

### 3-3. Popup UI
- 연결 상태 표시 (웹앱 로그인 여부)
- 톤 선택 드롭다운
- 미응답 리뷰 수 표시
- 일괄 응답 생성 버튼
- 대시보드 바로가기 링크

---

## 4. 페이지 구성

| 경로 | 페이지명 | 설명 |
|------|----------|------|
| `/` | 랜딩 페이지 | 서비스 소개, 핵심 기능 하이라이트, CTA(대시보드 이동) |
| `/dashboard` | 대시보드 | StatCard 4개 + 별점 분포 바차트 + 감성 파이차트 + 키워드 트렌드 TOP10 |
| `/reviews` | 리뷰 관리 | 필터(플랫폼/별점/응답상태) + 리뷰 테이블 + 일괄 응답 생성 + 페이지네이션 |
| `/reviews/[id]` | 리뷰 상세 | 리뷰 전문 + AI 응답 생성/수정/재생성 + 클립보드 복사 + 톤 선택 |
| `/templates` | 응답 템플릿 | 톤 프리셋 목록 + 커스텀 톤 추가/편집 + 브랜드 서명 설정 |
| `/stores` | 스토어 관리 | 등록된 스토어 카드 목록 + 스토어 추가/편집 + CSV/JSON 업로드 |
| `/settings` | 설정 | AI API 키 설정 + 기본 톤 선택 + 기본 브랜드 서명 + 데이터 초기화 |

---

## 5. 가격 정책

| 플랜 | 가격 | 포함 기능 |
|------|------|-----------|
| **체험** | 7일 무료 | 모든 기능 풀 체험, 제한 없음 |
| **스타터** | 월 29,000원 | 월 200건 응답 + 기본 인사이트 대시보드 |
| **프로** | 월 59,000원 | 무제한 응답 + 풀 인사이트 + 멀티플랫폼 + 톤 무제한 커스텀 |

> **원칙:** 가격 후려치기 X → 경쟁사에 없는 부가가치(리뷰 인텔리전스)로 가격 정당화

---

## 6. 차별화 전략

### 포지셔닝
> "다른 서비스는 리뷰에 답만 달아줍니다. ReviewPilot은 리뷰가 말하는 매출 기회를 찾아줍니다."

### 3가지 차별화 축

| 축 | 설명 |
|----|------|
| **리뷰 인텔리전스** | 리뷰 데이터에서 매출 기회·개선 포인트를 자동 발굴하는 인사이트 대시보드 |
| **Claude 기반 응답 품질** | 단순 템플릿이 아닌 맥락을 이해하는 고품질 AI 응답 |
| **제로 러닝커브** | Chrome Extension으로 기존 워크플로우에 바로 통합, 별도 학습 불필요 |

### 경쟁사 비교

| 기능 | 크리마 | 브이리뷰 | 리뷰메이트 | **ReviewPilot** |
|------|--------|----------|------------|-----------------|
| AI 응답 생성 | X | X | O | **O** |
| 리뷰 인텔리전스 (매출 기회 발굴) | X | X | X | **O** |
| Claude 기반 고품질 응답 | X | X | X | **O** |
| Chrome Extension (스마트스토어 직접 동작) | X | X | X | **O** |
| 톤 커스터마이징 | X | X | 제한적 | **무제한** |
| 대시보드 인사이트 | 기본 | 기본 | 기본 | **풀 인사이트** |

### 타겟
- 월매출 300~3,000만원 중소 셀러

---

## 7. 기술 스택

| 영역 | 기술 |
|------|------|
| **프론트엔드** | React 19 + TypeScript + Tailwind CSS |
| **백엔드** | Next.js App Router API Routes (Route Handlers) |
| **데이터 저장** | 인메모리 저장소 (Map/Array) + 시드 데이터 (JSON) |
| **AI 엔진** | Claude API (`@anthropic-ai/sdk`) + mock 폴백 |
| **차트** | Recharts (바차트, 파이차트) |
| **상태 관리** | React useState/useReducer (클라이언트 상태) |
| **아이콘** | Lucide React |
| **Chrome Extension** | Manifest V3 (Content Script + Service Worker + Popup) |
| **인증** | 토큰 기반 (UUID) |
| **빌드/배포** | Vercel |

---

## 8. API 엔드포인트

| Method | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/token` | Extension 연결 토큰 발급 |
| GET | `/api/auth/verify` | 토큰 유효성 검증 |
| GET | `/api/settings/tone` | 현재 기본 톤 조회 |

---

## 9. 데이터 모델

```typescript
// 스토어 (등록된 쇼핑몰)
interface Store {
  id: string;
  name: string;                          // 스토어명
  platform: 'naver' | 'coupang' | '11st' | 'other'; // 플랫폼
  url?: string;                          // 스토어 URL
  createdAt: string;                     // ISO 8601
}

// 리뷰
interface Review {
  id: string;
  storeId: string;                       // 연결된 스토어 ID
  platform: 'naver' | 'coupang' | '11st' | 'other';
  author: string;                        // 리뷰 작성자
  rating: 1 | 2 | 3 | 4 | 5;           // 별점
  content: string;                       // 리뷰 본문
  productName: string;                   // 상품명
  sentiment: 'positive' | 'negative' | 'neutral'; // 감성 분석 결과
  status: 'pending' | 'responded' | 'hold';        // 응답 상태
  source: 'manual' | 'csv' | 'extension';          // 리뷰 수집 경로
  externalId?: string;                   // 스마트스토어 원본 리뷰 ID
  createdAt: string;                     // 리뷰 작성일
}

// AI 생성 응답
interface ReviewResponse {
  id: string;
  reviewId: string;                      // 연결된 리뷰 ID
  content: string;                       // 응답 본문
  tone: string;                          // 사용된 톤 (friendly/formal/casual/professional/custom)
  templateId?: string;                   // 사용된 템플릿 ID
  isEdited: boolean;                     // 수동 편집 여부
  createdAt: string;
  updatedAt: string;
}

// 응답 템플릿
interface ResponseTemplate {
  id: string;
  name: string;                          // 템플릿명
  tone: 'friendly' | 'formal' | 'casual' | 'professional' | 'custom';
  description: string;                   // 톤 설명 (AI 프롬프트에 사용)
  signature?: string;                    // 브랜드 서명
  isDefault: boolean;                    // 기본 톤 여부
  createdAt: string;
}

// Extension 연결 토큰
interface ExtensionToken {
  id: string;
  token: string;                         // UUID v4
  createdAt: string;
  lastUsedAt?: string;
  isActive: boolean;
}

// 대시보드 통계
interface DashboardStats {
  totalReviews: number;                  // 총 리뷰 수
  pendingReviews: number;                // 미응답 리뷰 수
  averageRating: number;                 // 평균 별점
  totalResponses: number;                // AI 응답 생성 수
  ratingDistribution: Record<1|2|3|4|5, number>;  // 별점별 건수
  sentimentDistribution: {               // 감성 분포
    positive: number;
    negative: number;
    neutral: number;
  };
  topKeywords: { keyword: string; count: number }[]; // 키워드 TOP10
}
```

---

## 10. MVP 범위

### 포함 (In Scope)
- CSV/JSON 파일 업로드를 통한 리뷰 데이터 수집 + 시드 데이터 50건 내장
- Claude API 기반 AI 응답 생성 (API 키 미설정 시 mock 폴백)
- 대시보드 통계 시각화 (StatCard, 바차트, 파이차트, 키워드 TOP10)
- 리뷰 목록 필터링 (플랫폼/별점/응답상태) + 페이지네이션
- 리뷰 상세에서 AI 응답 생성/수정/재생성/클립보드 복사
- 일괄 응답 생성 (최대 10건 동시)
- 응답 톤 프리셋 4종 + 커스텀 톤 + 브랜드 서명
- 스토어 등록/관리
- 인메모리 저장소 (새로고침 시 시드 데이터로 리셋)
- 반응형 레이아웃 (데스크톱/태블릿/모바일)
- Chrome Extension (네이버 스마트스토어만)
- 7일 무료 체험 (결제 없이 풀 기능)
- Extension ↔ 웹앱 토큰 인증

### 미포함 (Out of Scope)
- 쇼핑몰 API 실시간 연동 (네이버/쿠팡/11번가 API 비공개)
- 자동 응답 게시 (셀러 페이지에서 수동 붙여넣기 방식)
- 자동 게시 (셀러가 "등록" 버튼 직접 클릭)
- 사용자 인증/로그인 (MVP에서는 단일 사용자)
- 영구 데이터 저장 (DB 연동)
- 다국어 지원
- 응답 A/B 테스트
- 리뷰 감성 분석 AI 모델 자체 학습
- 결제/구독 시스템
- 쿠팡/11번가 Extension
- 결제 연동 (MVP는 체험만)
- Chrome 웹스토어 배포
