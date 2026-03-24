# ReviewPilot — 디자인 스펙

## 1. 디자인 컨셉

**SaaS 대시보드 — 클린 비즈니스**

쇼핑몰 리뷰 자동응답 서비스의 관리 도구로서, 데이터 가독성과 작업 효율에 초점을 맞춘 깔끔한 비즈니스 대시보드 스타일. 불필요한 장식을 최소화하고, 정보 계층 구조를 명확히 하여 운영자가 리뷰 현황을 빠르게 파악하고 대응할 수 있도록 설계한다.

- 좌측 다크 사이드바 + 밝은 콘텐츠 영역의 클래식 대시보드 레이아웃
- 카드 기반 UI로 정보 단위 구분
- 블루 계열 Primary로 신뢰감 전달
- 랜딩 페이지는 별도 풀폭 레이아웃 (사이드바 없음)

---

## 2. 컬러 팔레트

| 토큰 | Hex | Tailwind 참조 | 용도 |
|---|---|---|---|
| Primary | `#2563EB` | blue-600 | CTA 버튼, 활성 메뉴, 링크, 강조 |
| Primary Light | `#DBEAFE` | blue-100 | 뱃지 배경, 아이콘 배경, 호버 틴트 |
| Primary Dark | `#1D4ED8` | blue-700 | 버튼 호버, 그라디언트 끝점 |
| Background | `#F8FAFC` | slate-50 | 페이지 배경 |
| Surface | `#FFFFFF` | white | 카드, 모달, 인풋 배경 |
| Sidebar | `#0F172A` | slate-900 | 사이드바 배경 |
| Sidebar Hover | `#1E293B` | slate-800 | 사이드바 메뉴 호버/활성 |
| Text | `#1E293B` | slate-800 | 본문 텍스트 |
| Sub Text | `#64748B` | slate-500 | 보조 텍스트, 라벨, 캡션 |
| Success | `#10B981` | emerald-500 | 응답 완료, 긍정 상태 |
| Warning | `#F59E0B` | amber-500 | 보류, 주의 상태 |
| Danger | `#EF4444` | red-500 | 삭제, 에러, 부정 감성 |
| Border | `#E2E8F0` | slate-200 | 카드 보더, 구분선, 인풋 보더 |

---

## 3. 타이포그래피

### 폰트 패밀리

| 용도 | 폰트명 | CDN |
|---|---|---|
| 전체 UI (한글+영문) | **Pretendard** | `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css` |
| 숫자/데이터 강조 | **Space Grotesk** | Google Fonts |

### 사이즈 체계

| 요소 | 사이즈 | 굵기 | 행간 | Tailwind 클래스 |
|---|---|---|---|---|
| 페이지 타이틀 (H1) | 30px | 700 (bold) | 1.4 | `text-3xl font-bold leading-[1.4]` |
| 섹션 타이틀 (H2) | 24px | 700 | 1.4 | `text-2xl font-bold leading-[1.4]` |
| 카드 타이틀 (H3) | 18px | 600 (semibold) | 1.4 | `text-lg font-semibold leading-[1.4]` |
| 본문 | 14px | 400 (normal) | 1.6 | `text-sm leading-[1.6]` |
| 캡션/라벨 | 12px | 500 (medium) | 1.6 | `text-xs font-medium leading-[1.6]` |
| StatCard 숫자 | 28px | 700 | 1.2 | `text-[28px] font-bold leading-[1.2] font-grotesk` |
| 사이드바 라벨 | 14px | 500 | 1 | `text-sm font-medium` |

---

## 4. 컴포넌트 스타일

### 4.1 사이드바

```
폭: w-60 (240px)
배경: bg-sidebar (#0F172A)
높이: h-screen, fixed, left-0
```

```html
<!-- 컨테이너 -->
<aside class="fixed left-0 top-0 w-60 h-screen bg-[#0F172A] text-white flex flex-col">

<!-- 로고 영역 -->
<div class="h-16 px-6 flex items-center border-b border-white/10">
  <span class="text-lg font-bold">ReviewPilot</span>
</div>

<!-- 네비게이션 아이템 (기본) -->
<a class="flex items-center gap-3 px-6 py-3 text-sm font-medium text-slate-400 hover:bg-[#1E293B] hover:text-white transition-colors">
  <svg class="w-5 h-5">...</svg>
  <span>메뉴명</span>
</a>

<!-- 네비게이션 아이템 (활성) -->
<a class="flex items-center gap-3 px-6 py-3 text-sm font-medium text-white bg-[#1E293B] border-r-2 border-[#2563EB]">
  <svg class="w-5 h-5 text-[#2563EB]">...</svg>
  <span>대시보드</span>
</a>
```

### 4.2 헤더

```html
<header class="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between">
  <!-- 좌측: 페이지 타이틀 -->
  <h1 class="text-xl font-bold text-[#1E293B]">대시보드</h1>

  <!-- 우측: 검색바 + 알림 + 프로필 -->
  <div class="flex items-center gap-4">
    <div class="relative">
      <input class="w-64 h-9 pl-9 pr-4 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg" placeholder="리뷰 검색...">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]">...</svg>
    </div>
    <button class="relative p-2 text-[#64748B] hover:text-[#1E293B]">
      <svg class="w-5 h-5"><!-- bell icon --></svg>
      <span class="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full"></span>
    </button>
    <div class="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-sm font-medium">K</div>
  </div>
</header>
```

### 4.3 StatCard

```html
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 flex items-center gap-4">
  <!-- 아이콘 원형 배경 -->
  <div class="w-12 h-12 rounded-full bg-[#DBEAFE] flex items-center justify-center">
    <svg class="w-6 h-6 text-[#2563EB]">...</svg>
  </div>
  <!-- 텍스트 -->
  <div>
    <p class="text-xs font-medium text-[#64748B]">총 리뷰</p>
    <p class="text-[28px] font-bold text-[#1E293B] font-grotesk leading-[1.2]">1,247</p>
  </div>
</div>
```

아이콘 배경 컬러 변형:
- 블루: `bg-[#DBEAFE]` + `text-[#2563EB]` (총 리뷰, AI 응답)
- 레드: `bg-red-50` + `text-[#EF4444]` (미응답)
- 앰버: `bg-amber-50` + `text-[#F59E0B]` (평균 별점)
- 에메랄드: `bg-emerald-50` + `text-[#10B981]` (응답 완료)

### 4.4 테이블

```html
<table class="w-full text-sm">
  <thead>
    <tr class="border-b border-[#E2E8F0] text-left text-xs font-medium text-[#64748B] uppercase tracking-wide">
      <th class="py-3 px-4">...</th>
    </tr>
  </thead>
  <tbody>
    <!-- 짝수행 줄무늬 -->
    <tr class="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors even:bg-[#F8FAFC]/50">
      <td class="py-3 px-4">...</td>
    </tr>
  </tbody>
</table>
```

### 4.5 버튼

| 타입 | Tailwind 클래스 |
|---|---|
| Primary | `px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-lg transition-colors` |
| Primary Large | `px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-base font-medium rounded-lg transition-colors` |
| Secondary | `px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#1E293B] text-sm font-medium rounded-lg transition-colors` |
| Ghost | `px-4 py-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] text-sm font-medium rounded-lg transition-colors` |
| Danger | `px-4 py-2 bg-[#EF4444] hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors` |

### 4.6 뱃지 (응답 상태)

| 상태 | Tailwind 클래스 |
|---|---|
| 미응답 | `px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-[#64748B]` |
| AI 생성 | `px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#DBEAFE] text-[#2563EB]` |
| 수정완료 | `px-2.5 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-[#10B981]` |
| 보류 | `px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-[#F59E0B]` |

### 4.7 카드

```html
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
  <!-- 카드 헤더 -->
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold text-[#1E293B]">카드 타이틀</h3>
    <button class="text-sm text-[#64748B] hover:text-[#2563EB]">더보기</button>
  </div>
  <!-- 카드 콘텐츠 -->
  <div>...</div>
</div>
```

### 4.8 모달

```html
<!-- 오버레이 -->
<div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
  <!-- 모달 박스 -->
  <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-[#1E293B]">모달 타이틀</h3>
      <button class="text-[#64748B] hover:text-[#1E293B]">
        <svg class="w-5 h-5"><!-- X icon --></svg>
      </button>
    </div>
    <!-- 콘텐츠 -->
    <div class="mb-6">...</div>
    <!-- 푸터 -->
    <div class="flex justify-end gap-3">
      <button class="px-4 py-2 ...secondary...">취소</button>
      <button class="px-4 py-2 ...primary...">확인</button>
    </div>
  </div>
</div>
```

### 4.9 폼 인풋

```html
<!-- 텍스트 인풋 -->
<div>
  <label class="block text-sm font-medium text-[#1E293B] mb-1.5">라벨</label>
  <input class="w-full h-10 px-3 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors" placeholder="플레이스홀더">
</div>

<!-- 셀렉트 -->
<select class="h-10 px-3 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]">
  <option>옵션</option>
</select>

<!-- 텍스트영역 -->
<textarea class="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none" rows="5"></textarea>
```

---

## 5. 페이지별 레이아웃

### 5.1 랜딩 페이지 (`/`)

풀폭 레이아웃 (사이드바 없음)

| 섹션 | 설명 |
|---|---|
| 히어로 | Unsplash 이미지 배경 (쇼핑/이커머스) + 다크 오버레이 (linear-gradient rgba(15,23,42,0.6~0.8)), 흰색 텍스트 중앙 정렬, 서비스명 + 한줄 소개 + CTA 버튼 (bg-blue-600 hover:bg-blue-700), 높이 min-h-[600px] |
| 기능 소개 | 4컬럼 카드 (AI 자동응답, 대시보드, 리뷰 관리, 톤 커스터마이징), 아이콘 SVG |
| 사용 흐름 | 3단계 (리뷰 등록 → AI 응답 생성 → 복사해서 게시), 번호 + 아이콘 + 설명 |
| Footer | 서비스명 + 카피라이트 |

### 5.2 대시보드 (`/dashboard`)

사이드바(240px) + 헤더(64px) + 메인 콘텐츠

| 영역 | 설명 |
|---|---|
| StatCard 행 | 4컬럼 그리드 (총 리뷰 / 미응답 / 평균별점 / AI 응답) |
| 차트 행 | 2컬럼 — 좌: 별점 분포 바차트, 우: 감성 분석 파이차트 |
| 하단 행 | 키워드 트렌드 TOP5 리스트 카드 |

### 5.3 리뷰 관리 (`/reviews`)

사이드바 + 헤더 + 메인

| 영역 | 설명 |
|---|---|
| 필터 바 | 플랫폼/별점/응답상태 셀렉트 + 검색 인풋, 일괄 응답 생성 버튼 |
| 테이블 | 체크박스 / 플랫폼 뱃지 / 상품명 / 별점 / 리뷰 요약 / 응답상태 / 작성일 |
| 페이지네이션 | 이전/다음 + 번호 |

### 5.4 리뷰 상세 (`/reviews/[id]`)

2컬럼 레이아웃

| 영역 | 설명 |
|---|---|
| 좌측 카드 | 리뷰 원문 (작성자, 별점, 플랫폼, 전문) |
| 우측 패널 | 톤 선택 드롭다운 + AI 응답 생성 버튼 + 생성 결과 텍스트 영역 + 복사/재생성 버튼 |

### 5.5 응답 템플릿 (`/templates`)

카드 그리드 (3컬럼). 각 템플릿 카드: 톤 이름 + 미리보기 + 편집 버튼.

### 5.6 스토어 관리 (`/stores`)

스토어 카드 리스트. 각 카드: 스토어명 + 플랫폼 + 연동 상태 + API 키 관리.

### 5.7 설정 (`/settings`)

탭 구조 (일반 / 알림 / 요금제 / API). 폼 기반 설정 인터페이스.

---

## 6. 반응형 전략

### 브레이크포인트

| 기기 | 너비 | Tailwind |
|---|---|---|
| 모바일 | < 768px | 기본 |
| 태블릿 | 768px ~ 1023px | `md:` |
| 데스크톱 | 1024px+ | `lg:` |

### 모바일 대응

- **사이드바**: `lg:block hidden` — 모바일에서 숨기고 햄버거 메뉴 버튼으로 토글 (overlay 방식)
- **헤더**: 검색바 숨기고 검색 아이콘으로 대체
- **StatCard 4컬럼**: `grid-cols-2` (모바일) → `lg:grid-cols-4`
- **테이블**: 모바일에서 카드 리스트로 전환 (`lg:table hidden` / `lg:hidden block`)
- **2컬럼 레이아웃** (차트, 리뷰 상세): `flex-col` (모바일) → `lg:flex-row`
- **필터 바**: 가로 스크롤 또는 접기/펼치기
- **메인 콘텐츠 여백**: `ml-0` (모바일) → `lg:ml-60`

---

## Extension Popup 레이아웃

### 기본 사양
- 폭: 360px, 최대 높이: 500px
- 배경: #FFFFFF
- 디자인 시스템: 웹앱과 동일 (블루 테마, Pretendard 폰트)

### 구성 요소 (위→아래)
1. **헤더**: ReviewPilot 로고 + "v1.0" 뱃지 (bg-primary text-white py-3 px-4)
2. **연결 상태**: ● 초록 점 + "연결됨" / ● 빨간 점 + "연결 안 됨" (text-sm)
3. **구분선**: border-b border-bdr
4. **현재 페이지 리뷰 요약**: 미응답 N건 / 응답완료 N건 (StatCard 스타일, 작게)
5. **톤 선택**: 드롭다운 (친절/격식/캐주얼/전문) — select 태그 스타일
6. **일괄 응답 생성 버튼**: bg-primary text-white w-full rounded-lg py-2.5
7. **구분선**
8. **링크 영역**: "대시보드 열기" (text-primary underline, 외부 링크)
9. **푸터**: "토큰 설정" | "도움말" (text-xs text-txt-sub)

### 상태별 UI
- 미연결: 토큰 입력 필드 + "연결" 버튼 표시, 다른 기능 비활성화
- 연결됨 + 스마트스토어 외 페이지: "스마트스토어 관리자 페이지에서 사용해주세요" 메시지
- 연결됨 + 스마트스토어: 풀 기능 표시
