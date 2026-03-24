// ============================================
// 시드 데이터 — 데모용 샘플 데이터
// ============================================

import {
  Store,
  Review,
  ReviewResponse,
  ResponseTemplate,
  ExtensionToken,
} from '../types';

// ---- 스토어 3개 ----
export const seedStores: Store[] = [
  {
    id: 'store-1',
    name: '홈리빙 네이버스토어',
    platform: 'naver',
    url: 'https://smartstore.naver.com/homeliving',
    createdAt: '2025-12-01T09:00:00Z',
  },
  {
    id: 'store-2',
    name: '홈리빙 쿠팡샵',
    platform: 'coupang',
    url: 'https://www.coupang.com/vp/products/homeliving',
    createdAt: '2025-12-15T09:00:00Z',
  },
  {
    id: 'store-3',
    name: '홈리빙 11번가',
    platform: '11st',
    url: 'https://www.11st.co.kr/products/homeliving',
    createdAt: '2026-01-05T09:00:00Z',
  },
];

// ---- 응답 템플릿 4개 ----
export const seedTemplates: ResponseTemplate[] = [
  {
    id: 'tpl-friendly',
    name: '친절한 톤',
    tone: 'friendly',
    description:
      '따뜻하고 친근한 말투로 고객에게 감사를 전하고, 진심어린 공감을 표현합니다. 이모지를 적절히 사용하세요.',
    signature: '— 홈리빙 고객행복팀 드림 🏠',
    isDefault: true,
    createdAt: '2025-12-01T09:00:00Z',
  },
  {
    id: 'tpl-formal',
    name: '격식있는 톤',
    tone: 'formal',
    description:
      '정중하고 격식있는 존댓말을 사용합니다. 공식적이면서도 따뜻한 느낌을 유지하세요.',
    signature: '— 홈리빙 고객지원팀',
    isDefault: false,
    createdAt: '2025-12-01T09:00:00Z',
  },
  {
    id: 'tpl-casual',
    name: '캐주얼 톤',
    tone: 'casual',
    description:
      '편안하고 가벼운 말투를 사용합니다. 친구에게 말하듯 자연스럽게, 하지만 존댓말은 유지하세요.',
    signature: '— 홈리빙 팀 ✌️',
    isDefault: false,
    createdAt: '2025-12-01T09:00:00Z',
  },
  {
    id: 'tpl-professional',
    name: '전문가 톤',
    tone: 'professional',
    description:
      '전문적이고 신뢰감 있는 톤으로 작성합니다. 제품 지식을 바탕으로 구체적인 정보를 제공하세요.',
    signature: '— 홈리빙 제품관리팀',
    isDefault: false,
    createdAt: '2025-12-01T09:00:00Z',
  },
];

// ---- 한국어 상품명 ----
const products = [
  '프리미엄 극세사 이불 세트',
  '원목 행거 선반',
  '스테인리스 텀블러 500ml',
  '무선 핸디 청소기',
  'LED 무드등 조명',
  '접이식 노트북 거치대',
  '자연유래 주방세제 1L',
  '실리콘 주방 매트',
  '향초 캔들 3종 세트',
  '방수 욕실 수납함',
  '에어프라이어 5L',
  '대나무 수저 세트',
  '접이식 빨래 건조대',
  '쿠션 방석 세트',
  '스마트 체중계',
];

// ---- 한국어 리뷰 내용 (별점별) ----
const reviewContents: Record<number, string[]> = {
  5: [
    '배송도 빠르고 품질이 정말 좋습니다! 다음에도 꼭 재구매할게요.',
    '사진보다 실물이 더 예쁘네요. 가격 대비 최고입니다.',
    '아내가 너무 좋아합니다. 선물용으로도 추천!',
    '이 가격에 이 퀄리티? 대박입니다. 별 다섯 개!',
    '포장도 꼼꼼하고 제품도 완벽합니다. 감사합니다!',
    '다른 곳에서 비슷한 거 샀다가 후회했는데, 여기 제품은 확실히 다르네요.',
    '두 번째 구매입니다. 역시 변함없는 품질!',
    '우리 집 인테리어에 딱 맞아요. 너무 만족합니다.',
    '친구한테 추천받고 샀는데 진짜 잘 샀어요!',
    '가성비 끝판왕이네요. 주변에도 추천하고 있어요.',
  ],
  4: [
    '전반적으로 만족합니다. 배송이 조금 더 빨랐으면 좋겠어요.',
    '품질 좋고 디자인도 마음에 들어요. 작은 스크래치가 하나 있었지만 사용에 문제 없어요.',
    '가격 대비 괜찮습니다. 색상이 사진이랑 약간 다르긴 해요.',
    '잘 사용하고 있습니다. 설명서가 좀 더 상세했으면 해요.',
    '만족스럽습니다. 포장이 좀 더 튼튼했으면 좋겠네요.',
    '기대한 대로입니다. 마감이 조금 아쉽지만 이 가격이면 OK.',
    '대체로 좋아요. 사이즈가 생각보다 조금 작았어요.',
    '세 번째 구매! 항상 만족하지만 이번엔 배송이 좀 늦었어요.',
  ],
  3: [
    '보통입니다. 가격만큼의 품질은 하는 것 같아요.',
    '나쁘지는 않은데 기대했던 것과는 좀 달라요.',
    '그냥 평범해요. 특별히 좋지도 나쁘지도 않습니다.',
    '사진이랑 꽤 차이가 있어요. 그래도 쓸만은 합니다.',
    '배송은 빨랐는데 제품이 생각보다 가벼워요. 내구성이 걱정됩니다.',
    '먼저 산 친구는 좋다고 했는데, 제가 받은 건 마감이 별로네요.',
  ],
  2: [
    '솔직히 기대 이하입니다. 사진이랑 너무 다르고 마감도 허술해요.',
    '배송 중 파손된 것 같은데 교환 절차가 번거롭습니다.',
    '한 달도 안 돼서 고장났어요. 내구성이 너무 약합니다.',
    '크기가 설명과 달라요. 교환하려니 배송비를 또 내야 한다네요.',
    '포장이 너무 대충이에요. 박스도 찌그러져서 왔고, 제품에 스크래치가 있었어요.',
  ],
  1: [
    '완전 불량품입니다. 사용한 지 하루 만에 고장났어요. 환불 원합니다.',
    '이게 정품 맞나요? 사진이랑 완전 다릅니다. 사기 느낌이에요.',
    '최악입니다. 냄새도 심하고 품질도 엉망이에요.',
    '두 번 다시 안 삽니다. 포장 상태도 최악이고 제품 자체도 불량.',
    '환불 요청했는데 응답이 없어요. 고객 서비스가 너무 안 좋습니다.',
  ],
};

const authors = [
  '김**', '이**', '박**', '최**', '정**', '강**', '조**', '윤**', '장**', '임**',
  '한**', '오**', '서**', '신**', '권**', '황**', '안**', '송**', '류**', '전**',
  '홍**', '고**', '문**', '양**', '손**', '배**', '백**', '허**', '유**', '남**',
  '심**', '노**', '하**', '곽**', '성**', '차**', '주**', '우**', '민**', '진**',
  '구**', '채**', '원**', '천**', '방**', '공**', '현**', '함**', '변**', '염**',
];

// ---- 50건의 리뷰 생성 ----
function generateReviews(): Review[] {
  const reviews: Review[] = [];
  const platforms: Array<{ platform: Review['platform']; storeId: string }> = [
    { platform: 'naver', storeId: 'store-1' },
    { platform: 'coupang', storeId: 'store-2' },
    { platform: '11st', storeId: 'store-3' },
  ];

  // 별점 분포: 5점(18), 4점(12), 3점(8), 2점(7), 1점(5) = 50
  const ratingDist: Rating[] = [
    ...Array(18).fill(5),
    ...Array(12).fill(4),
    ...Array(8).fill(3),
    ...Array(7).fill(2),
    ...Array(5).fill(1),
  ] as Rating[];

  for (let i = 0; i < 50; i++) {
    const rating = ratingDist[i];
    const contents = reviewContents[rating];
    const content = contents[i % contents.length];
    const { platform, storeId } = platforms[i % 3];
    const product = products[i % products.length];
    const sentiment: Review['sentiment'] =
      rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';

    // 30건은 응답 완료, 5건은 보류, 나머지 15건은 미응답
    let status: Review['status'] = 'pending';
    if (i < 30) status = 'responded';
    else if (i < 35) status = 'hold';

    const day = String((i % 28) + 1).padStart(2, '0');
    const month = i < 25 ? '01' : '02';

    reviews.push({
      id: `review-${String(i + 1).padStart(3, '0')}`,
      storeId,
      platform,
      author: authors[i],
      rating,
      content,
      productName: product,
      sentiment,
      status,
      source: i % 5 === 0 ? 'extension' : i % 3 === 0 ? 'csv' : 'manual',
      externalId: i % 5 === 0 ? `ext-${1000 + i}` : undefined,
      createdAt: `2026-${month}-${day}T${String(9 + (i % 12)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00Z`,
    });
  }

  return reviews;
}

// ---- 이미 생성된 응답 (responded 상태인 리뷰 30건 중 일부에 대해) ----
function generateResponses(reviews: Review[]): ReviewResponse[] {
  const responses: ReviewResponse[] = [];
  const respondedReviews = reviews.filter((r) => r.status === 'responded');

  const tones = ['friendly', 'formal', 'casual', 'professional'];
  const templateIds = ['tpl-friendly', 'tpl-formal', 'tpl-casual', 'tpl-professional'];

  const mockResponses: Record<string, string[]> = {
    positive: [
      '고객님, 따뜻한 리뷰 남겨주셔서 정말 감사합니다! 저희 제품에 만족하셨다니 보람을 느낍니다. 앞으로도 더 좋은 제품으로 보답하겠습니다. 다음에도 꼭 찾아주세요! 😊',
      '소중한 리뷰 감사합니다! 고객님의 만족이 저희의 가장 큰 기쁨입니다. 항상 최고의 품질로 보답하겠습니다.',
      '리뷰 감사드립니다~ 만족하셨다니 저희도 기분이 좋네요! 다음에도 좋은 제품으로 찾아뵙겠습니다 ✌️',
    ],
    neutral: [
      '리뷰 남겨주셔서 감사합니다. 말씀해주신 부분 참고하여 더 나은 제품과 서비스를 제공하도록 노력하겠습니다.',
      '소중한 의견 감사합니다. 부족한 부분은 개선하여 다음에는 더욱 만족하실 수 있도록 하겠습니다.',
    ],
    negative: [
      '고객님, 불편을 드려서 정말 죄송합니다. 말씀하신 문제를 즉시 확인하여 조치하겠습니다. 고객센터(1588-0000)로 연락 주시면 빠르게 도와드리겠습니다.',
      '불편한 경험을 하셨다니 대단히 죄송합니다. 해당 건은 내부적으로 즉시 검토하겠습니다. 교환/환불 도움이 필요하시면 언제든 연락 주세요.',
    ],
  };

  respondedReviews.forEach((review, idx) => {
    const toneIdx = idx % 4;
    const resps = mockResponses[review.sentiment];
    const content = resps[idx % resps.length];

    responses.push({
      id: `resp-${String(idx + 1).padStart(3, '0')}`,
      reviewId: review.id,
      content,
      tone: tones[toneIdx],
      templateId: templateIds[toneIdx],
      isEdited: idx % 7 === 0, // 일부는 수정됨
      createdAt: review.createdAt,
      updatedAt: review.createdAt,
    });
  });

  return responses;
}

// 시드 데이터 내보내기
export const seedReviews = generateReviews();
export const seedResponses = generateResponses(seedReviews);
export const seedTokens: ExtensionToken[] = [];

/** 별점을 배열 형태가 아닌 타입으로 사용 */
type Rating = 1 | 2 | 3 | 4 | 5;
