import type { MetadataRoute } from 'next';

// 사이트맵 — 검색엔진 크롤링용 (인증 필요 페이지는 제외)
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://review-pilot.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
