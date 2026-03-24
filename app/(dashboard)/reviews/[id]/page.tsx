'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../../components/layout/Header';
import AIResponsePanel from '../../../../components/reviews/AIResponsePanel';
import { Review, ReviewResponse } from '../../../../types';

// 리뷰 상세 페이지 — 좌:리뷰원문, 우:AI응답 생성/편집 패널
export default function ReviewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reviewId = params.id as string;

  // L-6: 리뷰 상세 화면 표시용 인터페이스
  interface ReviewDetail {
    id: string;
    platform: string;
    platformLabel: string;
    author: string;
    authorInitial: string;
    rating: number;
    createdAt: string;
    productName: string;
    content: string;
    tags: { label: string; sentiment: string }[];
    existingResponse: string;
  }

  // 플랫폼 라벨 매핑
  const platformLabelMap: Record<string, string> = {
    naver: '네이버',
    coupang: '쿠팡',
    '11st': '11번가',
    other: '기타',
  };

  // 감성 → 태그 라벨 매핑 (간단 구현)
  const sentimentTagMap: Record<string, string> = {
    positive: '긍정',
    neutral: '중립',
    negative: '부정',
  };

  const [review, setReview] = useState<ReviewDetail | null>(null);

  // API에서 리뷰 상세 가져오기
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch(`/api/reviews/${reviewId}`);
        const data = await res.json();
        if (data && data.review) {
          // L-6: API 응답 { review, responses }를 화면 표시용 구조로 변환
          const r: Review = data.review;
          const responses: ReviewResponse[] = data.responses || [];
          const mapped: ReviewDetail = {
            id: r.id,
            platform: r.platform,
            platformLabel: platformLabelMap[r.platform] || r.platform,
            author: r.author,
            authorInitial: r.author?.charAt(0) || '',
            rating: r.rating,
            createdAt: r.createdAt,
            productName: r.productName,
            content: r.content,
            tags: [
              { label: sentimentTagMap[r.sentiment] || '긍정', sentiment: r.sentiment },
            ],
            existingResponse: responses.length > 0 ? responses[0].content : '',
          };
          setReview(mapped);
        }
      } catch {
        // API 실패 시 기본 데이터 사용
        setReview(defaultReview);
      }
    };
    fetchReview();
  }, [reviewId]);

  // 기본 데이터
  const defaultReview = {
    id: reviewId,
    platform: 'naver',
    platformLabel: '네이버',
    author: '김고객',
    authorInitial: '김',
    rating: 5,
    createdAt: '2026.03.23',
    productName: '프리미엄 무선 이어폰 Pro',
    content: `정말 만족스러운 제품입니다! 음질이 깔끔하고 노이즈캔슬링 기능이 정말 뛰어나요. 지하철에서 사용해도 주변 소음이 거의 안 들릴 정도입니다.\n\n배터리도 오래 가고 충전 케이스도 컴팩트해서 휴대하기 좋습니다. 통화 품질도 상대방이 잘 들린다고 하네요.\n\n가격 대비 성능이 정말 좋아서 친구들한테도 추천했습니다. 다만 이어팁 사이즈가 조금 더 다양했으면 좋겠어요. 전체적으로 대만족입니다!`,
    tags: [
      { label: '음질 좋음', sentiment: 'positive' },
      { label: '노이즈캔슬링', sentiment: 'positive' },
      { label: '가성비', sentiment: 'positive' },
      { label: '이어팁 개선', sentiment: 'mixed' },
    ],
    existingResponse: `안녕하세요, 고객님! 프리미엄 무선 이어폰 Pro를 구매해 주셔서 감사합니다.\n\n음질과 노이즈캔슬링 기능에 만족하셨다니 정말 기쁩니다. 지하철처럼 소음이 많은 환경에서도 편안하게 사용하실 수 있도록 최선을 다해 개발한 제품이라 더욱 뿌듯합니다.\n\n이어팁 사이즈에 대한 소중한 의견도 감사합니다. 고객님의 피드백을 반영하여 향후 더 다양한 사이즈를 제공할 수 있도록 검토하겠습니다.\n\n앞으로도 좋은 제품으로 보답하겠습니다. 감사합니다!`,
  };

  const displayReview = review || defaultReview;

  // 별점 문자열
  const renderStars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  // 태그 감성 스타일
  const tagStyles: Record<string, string> = {
    positive: 'bg-emerald-50 text-success',
    mixed: 'bg-amber-50 text-warning',
    negative: 'bg-red-50 text-danger',
  };

  return (
    <>
      <Header
        title="리뷰 상세"
        showBack
        onBack={() => router.push('/reviews')}
      />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 좌측: 리뷰 원문 카드 */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-xl border border-bdr shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-txt">리뷰 원문</h3>
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">
                  {displayReview.platformLabel}
                </span>
              </div>
              <div className="space-y-4">
                {/* 메타 정보 */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-txt-sub">
                      {displayReview.authorInitial || displayReview.author?.charAt(0)}
                    </div>
                    <span className="font-medium text-txt">{displayReview.author}</span>
                  </div>
                  <span className="text-warning">{renderStars(displayReview.rating)}</span>
                  <span className="text-txt-sub font-grotesk">{displayReview.createdAt}</span>
                </div>
                {/* 상품명 */}
                <div className="px-3 py-2 bg-bg rounded-lg">
                  <p className="text-xs text-txt-sub mb-0.5">상품</p>
                  <p className="text-sm font-medium text-txt">{displayReview.productName}</p>
                </div>
                {/* 리뷰 전문 */}
                <div className="border-t border-bdr pt-4">
                  <p className="text-sm text-txt leading-[1.8] whitespace-pre-line">
                    {displayReview.content}
                  </p>
                </div>
                {/* 감성 태그 */}
                {displayReview.tags && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {displayReview.tags.map((tag: { label: string; sentiment: string }, idx: number) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${tagStyles[tag.sentiment] || tagStyles.positive}`}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 우측: AI 응답 패널 */}
          <div className="lg:w-1/2">
            <AIResponsePanel
              reviewId={reviewId}
              initialResponse={displayReview.existingResponse}
            />
          </div>
        </div>
      </main>
    </>
  );
}
