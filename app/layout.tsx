import './globals.css';
import type { Metadata } from 'next';

// SEO 메타데이터 — 검색엔진 최적화 및 소셜 미리보기
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://review-pilot.vercel.app'
  ),
  title: {
    template: '%s | ReviewPilot',
    default: 'ReviewPilot — 쇼핑몰 리뷰 자동응답 AI 서비스',
  },
  description:
    'AI가 리뷰에 맞춤 응답을 자동 생성하고, 리뷰가 알려주는 매출 기회를 찾아줍니다. 네이버 스마트스토어 리뷰 관리를 자동화하세요.',
  keywords: [
    '리뷰 자동응답',
    '쇼핑몰 리뷰 관리',
    '네이버 스마트스토어',
    'AI 리뷰 응답',
    '리뷰 분석',
    '고객 리뷰 관리',
    '이커머스 자동화',
    'ReviewPilot',
  ],
  openGraph: {
    title: 'ReviewPilot — 쇼핑몰 리뷰 자동응답 AI 서비스',
    description:
      'AI가 리뷰에 맞춤 응답을 자동 생성하고, 리뷰가 알려주는 매출 기회를 찾아줍니다.',
    type: 'website',
    siteName: 'ReviewPilot',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReviewPilot — 쇼핑몰 리뷰 자동응답 AI 서비스',
    description:
      'AI가 리뷰에 맞춤 응답을 자동 생성하고, 리뷰가 알려주는 매출 기회를 찾아줍니다.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// 전역 레이아웃 — Pretendard + Space Grotesk 폰트 로드
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard 폰트 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        {/* Space Grotesk 폰트 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-txt">
        {children}
      </body>
    </html>
  );
}
