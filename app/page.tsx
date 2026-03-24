import type { Metadata } from 'next';
import LandingPage from './LandingClient';

// 랜딩 페이지 SEO 메타데이터
export const metadata: Metadata = {
  title: 'ReviewPilot — 쇼핑몰 리뷰 자동응답 AI 서비스',
  description:
    'AI가 리뷰에 맞춤 응답을 자동 생성하고, 리뷰가 알려주는 매출 기회를 찾아줍니다. 네이버 스마트스토어 리뷰 관리를 자동화하세요.',
};

// JSON-LD 구조화 데이터 — 검색결과 리치 스니펫용
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ReviewPilot',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'AI가 쇼핑몰 리뷰에 맞춤 응답을 자동 생성하고, 리뷰 데이터에서 매출 기회를 분석합니다.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
    description: '무료 체험 가능',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '120',
  },
};

// 서버 컴포넌트 래퍼 — metadata export + JSON-LD 주입
export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
