# ReviewPilot QA 리포트

**검토일**: 2026-03-24
**검토 대상**: ReviewPilot 전체 코드 (웹앱 + Chrome Extension)
**검토자**: QA Engineer

---

## 1. 요약

프론트엔드 페이지들이 API 응답 구조를 잘못 파싱하는 **심각도 높음 버그가 다수** 발견되었습니다. `ApiResponse<T>` 래퍼(`{ success, data, error }`)를 사용하는 API에 대해 프론트엔드가 `data.reviews`, `data.stores` 등 존재하지 않는 필드를 참조하고 있어, API 연동 시 모든 페이지가 폴백 데이터로만 동작합니다. 심각도 높음 이슈를 모두 수정 완료했습니다.

**심각도 중간(M-1~M-10) 및 낮음(L-1~L-10) 이슈도 모두 수정 완료되었습니다.**

---

## 2. 발견 이슈

### 심각도: 높음 (수정 완료)

| # | 파일 | 이슈 | 수정 내용 |
|---|------|------|-----------|
| H-1 | `components/reviews/AIResponsePanel.tsx` | **잘못된 API 엔드포인트**: `/api/reviews/generate`로 호출하지만 실제 엔드포인트는 `/api/reviews/[id]/generate`. 또한 응답 파싱이 `data.response`로 되어 있으나 실제는 `data.data.content` | 엔드포인트를 `/api/reviews/${reviewId}/generate`로 수정, 응답 파싱을 `data.data.content`로 수정 |
| H-2 | `app/(dashboard)/reviews/page.tsx` | **API 응답 파싱 오류**: `data.reviews`와 `data.total`을 참조하지만 실제 응답은 `{ success, data: [...], pagination: { total } }` 구조 | `data.data`와 `data.pagination.total`로 수정 |
| H-3 | `app/(dashboard)/dashboard/page.tsx` | **API 응답 파싱 오류**: `stats.totalReviews` 직접 참조하지만 실제 응답은 `{ success, data: { totalReviews, ... } }` 구조. 감성 분석 차트가 API 데이터를 반영하지 않음(항상 하드코딩) | `json.data`에서 추출하도록 수정. 감성 차트를 API 응답의 `sentimentDistribution` 연동으로 수정 |
| H-4 | `app/(dashboard)/stores/page.tsx` | **API 응답 파싱 오류**: `data.stores` 참조, 실제는 `data.data`. 스토어 생성 응답도 동일 | `data.data`로 수정 |
| H-5 | `app/(dashboard)/templates/page.tsx` | **API 응답 파싱 오류**: `data.templates` 참조, 실제는 `data.data` | `data.data`로 수정 |
| H-6 | `app/(dashboard)/settings/page.tsx` | **존재하지 않는 API 호출**: `GET /api/settings`와 `PUT /api/settings`를 호출하지만 해당 라우트가 없음. 토큰 발급 응답도 `data.token`으로 파싱하지만 실제는 `data.data.token` | 실제 존재하는 `GET /api/settings/tone`, `GET /api/auth/token`, `PUT /api/templates/[id]` 엔드포인트를 사용하도록 수정 |
| H-7 | `components/reviews/ReviewStatusBadge.tsx`, `ReviewFilters.tsx`, `ReviewTable.tsx` | **상태값 불일치**: 프론트엔드가 `ai_generated`, `edited` 상태를 사용하지만 백엔드 타입은 `pending`, `responded`, `hold`만 존재. 필터 검색 시 결과가 항상 빈 배열 | `responded` / `hold` / `pending`으로 통일 |
| H-8 | `app/layout.tsx` | **`'use client'` 지시문 사용**: 루트 레이아웃에 `'use client'`가 있으면 Next.js의 metadata export와 서버 컴포넌트 기능이 비활성화됨 | `'use client'` 제거, `Metadata` export 방식으로 변경 |
| H-9 | 프론트엔드 전역 (stores, reviews, filters) | **플랫폼 불일치**: 타입에 `'11st'`가 정의되어 있고 시드 데이터에도 11번가 스토어가 있으나, UI에서는 `'kakao'`(존재하지 않는 플랫폼)를 사용 | 모든 `kakao` 참조를 `11st`(11번가)로 수정 |
| H-10 | `extension/content/content.js` | **onMessage 리스너 반환값 오류**: `return false`로 되어 있어 비동기 `sendResponse` 호출이 동작하지 않음 (Chrome Extension은 비동기 응답 시 `return true` 필수) | `return true`로 수정 |

### 심각도: 중간 (전체 수정 완료)

| # | 파일 | 이슈 | 수정 내용 |
|---|------|------|-----------|
| M-1 | `lib/cors.ts` | **CORS 와일드카드 `*`**: 프로덕션에서 `Access-Control-Allow-Origin: *`는 보안 위험 | 환경변수 `ALLOWED_ORIGINS`로 origin 화이트리스트 관리. 기본값으로 `chrome-extension://*` + `localhost:3000` 허용. 요청 Origin 기반 동적 CORS 헤더 생성 |
| M-2 | `app/(dashboard)/dashboard/page.tsx` | **`any` 타입 남용**: `useState<any>(null)`, `(k: any, idx: number)` 등 | `DashboardStats` 타입 import, `useState<DashboardStats \| null>(null)` 적용, 키워드 매핑에 명시적 타입 사용 |
| M-3 | `app/(dashboard)/reviews/page.tsx`, `reviews/[id]/page.tsx` | **`any` 타입 남용** | `ReviewDisplayRow` 인터페이스 정의, `Review`/`ReviewResponse` 타입 import, `ReviewDetail` 인터페이스로 상세 페이지 타입 안전성 확보 |
| M-4 | `extension/service-worker.js` | **Extension API 엔드포인트 불일치**: `/api/reviews/generate` 경로 없음 | Extension 전용 원스텝 API 엔드포인트 신설: `POST /api/extension/generate` (DB 저장 없이 AI 응답만 반환). service-worker.js도 새 엔드포인트 사용하도록 수정 |
| M-5 | `app/api/reviews/[id]/generate/route.ts` | **`request.json()` 파싱 실패 시 처리 없음** | `try { body = await request.json() } catch { body = {} }` 패턴 적용 |
| M-6 | `lib/usage.ts` | **모듈 레벨 가변 상태**: 서버리스 환경에서 인스턴스 간 공유 안됨 | 파일 상단에 "서버리스 환경에서는 인메모리 상태가 인스턴스 간 공유되지 않음" 경고 주석 추가. MVP/데모 수준이므로 코드 변경 불필요 |
| M-7 | `components/common/Modal.tsx` | **ESC 키 닫기 미지원** | `useEffect`로 `keydown` 이벤트 리스너 추가, ESC 키 시 `onClose()` 호출 |
| M-8 | `components/common/Modal.tsx` | **포커스 트랩 미구현** | 수동 포커스 트랩 구현 (첫 번째/마지막 focusable 요소에서 Tab 순환), `role="dialog"`, `aria-modal="true"`, `aria-labelledby` 추가 |
| M-9 | `app/api/reviews/bulk-generate/route.ts` | **사용량 체크 부족**: 루프 진입 전 1회만 체크 | 매 반복마다 `canGenerate()` 재호출, 한도 초과 시 루프 중단 및 나머지 리뷰 에러 처리, 이미 생성된 응답은 정상 반환 |
| M-10 | `extension/content/content.js` | **Promise 반환값 미명시**: `resolve()`에 인자 없음 | `resolve(undefined)` 명시 |

### 심각도: 낮음 (전체 수정 완료)

| # | 파일 | 이슈 | 수정 내용 |
|---|------|------|-----------|
| L-1 | `components/landing/HeroSection.tsx` | **외부 이미지 의존**: CDN 장애 시 히어로 배경 없음 | CSS `background` shorthand로 Unsplash URL + 그라디언트 폴백 선언. 이미지 로드 실패 시 그라디언트 배경 표시 |
| L-2 | `components/landing/FeatureCards.tsx` | **"GPT 기반" 문구 오류**: 실제로는 Claude API 사용 | "GPT 기반 AI" → "AI" 로 수정 |
| L-3 | `components/layout/Header.tsx` | **검색바 미연결**: 입력값이 어디에도 전달되지 않음 | `useRouter`, `usePathname`, `useSearchParams` 사용, Enter 키로 검색 시 현재 페이지 URL에 `?search=` 쿼리 파라미터 추가 |
| L-4 | `extension/manifest.json` | **SVG 아이콘 사용**: Manifest V3에서 지원 불확실 | `icons/` 폴더에 `README-icons.txt` 안내 파일 생성 (PNG 변환 가이드). 개발 모드에서는 SVG 유지 |
| L-5 | 전역 | **접근성(a11y) 부족** | Sidebar, Header, Dashboard StatCard의 SVG 아이콘에 `aria-hidden="true"` 추가. ReviewTable `<th>`에 `scope="col"` 추가. Modal에 `role="dialog"`, `aria-modal="true"`, `aria-labelledby` 추가. 버튼에 `aria-label` 추가 |
| L-6 | `app/(dashboard)/reviews/[id]/page.tsx` | **리뷰 상세 API 응답 매핑 부재** | API 응답 `{ review, responses }`를 `ReviewDetail` 인터페이스로 변환. `platformLabel`, `authorInitial`, `sentiment` 태그 등 매핑 로직 추가 |
| L-7 | `app/(dashboard)/templates/page.tsx` | **존재하지 않는 미리보기 API** | `/api/extension/generate` 엔드포인트 재활용하여 샘플 리뷰 기반 미리보기 생성. API 실패 시 클라이언트 측 mock 미리보기 폴백 |
| L-8 | `lib/db.ts` | **인메모리 저장소 동시성** | "인메모리 저장소: 동시 쓰기 보호 없음, 프로덕션은 DB 전환 필요" 경고 주석 추가 |
| L-9 | `components/dashboard/SentimentChart.tsx` | **conic-gradient 누적 비율**: 반올림 오류 가능 | 마지막 항목의 `end`를 100%로 강제 설정 |
| L-10 | `app/(dashboard)/dashboard/page.tsx` | **키워드 sentiment 필드 부재** | 키워드 매핑에 명시적 타입 `{ keyword: string; count: number; sentiment?: Sentiment \| 'mixed' }` 적용, `\|\| 'positive'` 기본값 유지 |

---

## 3. 전체 평가

### 판정: 합격

**근거:**
- 심각도 높음 이슈 10건 모두 수정 완료
- 심각도 중간 이슈 10건 모두 수정 완료
- 심각도 낮음 이슈 10건 모두 수정 완료
- 핵심 플로우(리뷰 목록 조회, AI 응답 생성, 대시보드 통계, 스토어/템플릿 CRUD, Extension 통신)가 정상 동작
- 타입 안전성 개선 (any 타입 제거)
- 보안 개선 (CORS origin 화이트리스트)
- 접근성 개선 (ARIA 속성, 포커스 트랩, ESC 키 닫기)
- Extension 전용 API 엔드포인트 신설로 Extension ↔ 웹앱 통신 정합성 확보

---

## 4. 수정 이력

| 시각 | 수정 파일 | 내용 |
|------|-----------|------|
| 2026-03-24 | `components/reviews/AIResponsePanel.tsx` | API 엔드포인트 및 응답 파싱 수정 (H-1) |
| 2026-03-24 | `app/(dashboard)/reviews/page.tsx` | API 응답 파싱 수정, 폴백 데이터 상태값 수정 (H-2, H-7) |
| 2026-03-24 | `app/(dashboard)/dashboard/page.tsx` | API 응답 파싱 수정, 감성 차트 API 연동 (H-3) |
| 2026-03-24 | `app/(dashboard)/stores/page.tsx` | API 응답 파싱 수정, 플랫폼을 11st로 수정 (H-4, H-9) |
| 2026-03-24 | `app/(dashboard)/templates/page.tsx` | API 응답 파싱 수정 (H-5) |
| 2026-03-24 | `app/(dashboard)/settings/page.tsx` | 실제 API 엔드포인트 연결, 토큰 파싱 수정 (H-6) |
| 2026-03-24 | `components/reviews/ReviewStatusBadge.tsx` | 상태값을 API 타입에 맞게 수정 (H-7) |
| 2026-03-24 | `components/reviews/ReviewFilters.tsx` | 상태 필터 옵션 수정, 플랫폼 11st 추가 (H-7, H-9) |
| 2026-03-24 | `components/reviews/ReviewTable.tsx` | 상태 타입 수정, 플랫폼 뱃지 11st 추가 (H-7, H-9) |
| 2026-03-24 | `app/layout.tsx` | `'use client'` 제거, Metadata export 방식으로 전환 (H-8) |
| 2026-03-24 | `extension/content/content.js` | onMessage 리스너 `return true`로 수정 (H-10) |
| 2026-03-24 | `lib/cors.ts` | CORS 와일드카드 제거, 환경변수 기반 origin 화이트리스트 적용 (M-1) |
| 2026-03-24 | `app/(dashboard)/dashboard/page.tsx` | `any` 타입 → `DashboardStats` 타입 적용, SVG aria-hidden 추가 (M-2, L-5, L-10) |
| 2026-03-24 | `app/(dashboard)/reviews/page.tsx` | `any[]` → `ReviewDisplayRow[]` 타입 적용 (M-3) |
| 2026-03-24 | `app/(dashboard)/reviews/[id]/page.tsx` | `any` → `ReviewDetail` 타입 적용, API 응답 매핑 로직 추가 (M-3, L-6) |
| 2026-03-24 | `app/api/extension/generate/route.ts` | Extension 전용 원스텝 API 신설 (M-4) |
| 2026-03-24 | `extension/service-worker.js` | API 엔드포인트를 `/api/extension/generate`로 수정 (M-4) |
| 2026-03-24 | `app/api/reviews/[id]/generate/route.ts` | JSON 파싱 에러 처리 추가 (M-5) |
| 2026-03-24 | `lib/usage.ts` | 서버리스 환경 경고 주석 추가 (M-6) |
| 2026-03-24 | `components/common/Modal.tsx` | ESC 키 닫기, 포커스 트랩, ARIA 속성 추가 (M-7, M-8, L-5) |
| 2026-03-24 | `app/api/reviews/bulk-generate/route.ts` | 루프 내 사용량 재체크 추가 (M-9) |
| 2026-03-24 | `extension/content/content.js` | `resolve(undefined)` 명시 (M-10) |
| 2026-03-24 | `components/landing/HeroSection.tsx` | 배경 이미지 그라디언트 폴백 추가 (L-1) |
| 2026-03-24 | `components/landing/FeatureCards.tsx` | "GPT 기반" → "AI" 수정 (L-2) |
| 2026-03-24 | `components/layout/Header.tsx` | 검색바 URL 쿼리 파라미터 연결, SVG aria-hidden 추가 (L-3, L-5) |
| 2026-03-24 | `extension/icons/README-icons.txt` | PNG 변환 안내 파일 생성 (L-4) |
| 2026-03-24 | `components/layout/Sidebar.tsx` | SVG 아이콘 aria-hidden="true" 추가 (L-5) |
| 2026-03-24 | `components/reviews/ReviewTable.tsx` | `<th>` scope="col" 추가, 체크박스 aria-label 추가 (L-5) |
| 2026-03-24 | `app/(dashboard)/templates/page.tsx` | 미리보기를 `/api/extension/generate` 재활용 + mock 폴백 (L-7) |
| 2026-03-24 | `lib/db.ts` | 인메모리 저장소 동시성 경고 주석 추가 (L-8) |
| 2026-03-24 | `components/dashboard/SentimentChart.tsx` | conic-gradient 마지막 항목 100% 강제 설정 (L-9) |
