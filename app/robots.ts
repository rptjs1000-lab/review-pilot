import type { MetadataRoute } from 'next';

// 검색엔진 크롤러 접근 규칙 — 인증 필요 페이지 및 API 차단
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/reviews',
          '/templates',
          '/stores',
          '/settings',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://review-pilot.vercel.app/sitemap.xml',
  };
}
