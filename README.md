# ReviewPilot

쇼핑몰 리뷰 자동응답 서비스입니다. AI가 고객 리뷰를 분석하고 적절한 답변을 자동으로 생성합니다. 웹 대시보드와 Chrome Extension을 통해 리뷰 관리 및 응답 생성을 지원합니다.

## 기술 스택

- **프론트엔드**: Next.js 14 + React 19 + TypeScript + Tailwind CSS 4
- **AI 엔진**: @anthropic-ai/sdk (Claude)
- **브라우저 확장**: Chrome Extension (Manifest V3)

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # 대시보드 페이지 (리뷰, 스토어, 템플릿, 설정)
│   ├── api/                # API 라우트
│   │   ├── auth/           # 인증 (토큰 발급/검증)
│   │   ├── reviews/        # 리뷰 CRUD + AI 응답 생성
│   │   ├── extension/      # Extension 전용 API
│   │   ├── stores/         # 스토어 관리
│   │   ├── templates/      # 응답 템플릿
│   │   ├── settings/       # 톤 설정
│   │   └── dashboard/      # 대시보드 통계
│   ├── layout.tsx          # 루트 레이아웃
│   └── page.tsx            # 랜딩 페이지
├── components/             # UI 컴포넌트
│   ├── common/             # 공통 (Button, Badge, Modal, Pagination)
│   ├── dashboard/          # 대시보드 차트/통계
│   ├── landing/            # 랜딩 페이지 섹션
│   ├── layout/             # Header, Sidebar
│   └── reviews/            # 리뷰 관련 컴포넌트
├── extension/              # Chrome Extension
│   ├── manifest.json       # Manifest V3
│   ├── popup/              # Extension 팝업 UI
│   ├── content/            # Content Script
│   ├── service-worker.js   # Background Worker
│   └── icons/              # 확장 프로그램 아이콘
├── lib/                    # 유틸리티
│   ├── ai.ts               # AI 응답 생성 (Anthropic SDK)
│   ├── auth.ts             # 인증 헬퍼
│   ├── cors.ts             # CORS 설정
│   ├── db.ts               # 데이터 레이어
│   ├── seed-data.ts        # 시드 데이터
│   └── usage.ts            # 사용량 추적
└── types/                  # TypeScript 타입 정의
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 필요한 값을 설정합니다:

| 변수 | 설명 | 필수 |
|------|------|------|
| `ANTHROPIC_API_KEY` | Anthropic API 키 (미설정 시 mock 응답 사용) | 선택 |
| `ALLOWED_ORIGINS` | CORS 허용 origin (쉼표 구분) | 선택 |
| `NEXT_PUBLIC_APP_URL` | 서비스 URL (Extension에서 사용) | 선택 |

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

## Chrome Extension 설치 방법

1. Chrome 브라우저에서 `chrome://extensions` 주소로 이동합니다.
2. 우측 상단의 **"개발자 모드"** 토글을 활성화합니다.
3. **"압축해제된 확장 프로그램을 로드합니다"** 버튼을 클릭합니다.
4. 프로젝트 내 `extension/` 폴더를 선택합니다.
5. 설치된 Extension의 팝업을 열고, **서버 URL** (`http://localhost:3000`)과 **인증 토큰**을 입력합니다.

> Extension은 쇼핑몰 리뷰 페이지에서 직접 AI 응답을 생성할 수 있는 기능을 제공합니다.

## Docker로 실행

```bash
# 환경변수 파일 생성
cp .env.example .env

# Docker Compose로 실행
docker compose up -d
```

서비스가 `http://localhost:3000`에서 실행됩니다.

## 빌드

```bash
npm run build
npm start
```
