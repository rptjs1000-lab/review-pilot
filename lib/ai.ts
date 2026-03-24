// ============================================
// AI 응답 생성 어댑터 (Claude API + Mock 폴백)
// ============================================

import { Review, ResponseTemplate } from '../types';

/** Claude API 호출 또는 mock 응답 생성 */
export async function generateResponse(
  review: Review,
  template?: ResponseTemplate
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    return generateWithClaude(review, template, apiKey);
  }

  return generateMockResponse(review, template);
}

// ---- Claude API 실제 호출 ----
async function generateWithClaude(
  review: Review,
  template: ResponseTemplate | undefined,
  apiKey: string
): Promise<string> {
  try {
    // @anthropic-ai/sdk 동적 임포트 (미설치 환경 대응)
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });

    const systemPrompt = buildSystemPrompt(review, template);
    const userPrompt = buildUserPrompt(review);

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // 텍스트 블록 추출
    const textBlock = message.content.find((b) => b.type === 'text');
    let responseText = textBlock?.text ?? '';

    // 브랜드 서명 추가
    if (template?.signature) {
      responseText = responseText.trimEnd() + '\n\n' + template.signature;
    }

    return responseText;
  } catch (error) {
    console.error('[AI] Claude API 호출 실패, mock으로 폴백:', error);
    return generateMockResponse(review, template);
  }
}

// ---- 시스템 프롬프트 구성 ----
function buildSystemPrompt(
  review: Review,
  template?: ResponseTemplate
): string {
  const toneInstruction = template
    ? `톤 스타일: ${template.description}`
    : '따뜻하고 친근한 톤으로 응답하세요.';

  // 별점 기반 맥락 분기
  let ratingContext: string;
  if (review.rating <= 2) {
    ratingContext = `이 리뷰는 ${review.rating}점으로 불만족 리뷰입니다.
- 고객의 불편에 진심으로 공감하세요
- 구체적인 해결책이나 보상 방안을 제시하세요
- 재발 방지 약속을 포함하세요
- 고객센터 연락처(1588-0000)를 안내하세요`;
  } else if (review.rating === 3) {
    ratingContext = `이 리뷰는 3점으로 중립적 리뷰입니다.
- 리뷰에 감사를 표하세요
- 아쉬운 점이 있다면 개선 의지를 보여주세요
- 다음 구매 시 더 나은 경험을 약속하세요`;
  } else {
    ratingContext = `이 리뷰는 ${review.rating}점으로 만족 리뷰입니다.
- 따뜻하게 감사를 표현하세요
- 재구매를 유도하는 멘트를 포함하세요
- 다른 추천 제품이나 혜택을 살짝 언급하세요`;
  }

  return `당신은 온라인 쇼핑몰 셀러의 고객 리뷰 응답 전문가입니다.

${toneInstruction}

상품명: ${review.productName}
별점: ${review.rating}점 / 5점
감성: ${review.sentiment === 'positive' ? '긍정' : review.sentiment === 'negative' ? '부정' : '중립'}

${ratingContext}

응답 규칙:
- 한국어로 작성
- 200자 이내로 간결하게
- 존댓말 사용
- 리뷰 내용에 구체적으로 반응 (일반적인 템플릿 응답 금지)
- 브랜드 서명은 포함하지 마세요 (별도 추가됨)`;
}

// ---- 사용자 프롬프트 구성 ----
function buildUserPrompt(review: Review): string {
  return `다음 고객 리뷰에 대한 응답을 작성해주세요.

작성자: ${review.author}
상품: ${review.productName}
별점: ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)} (${review.rating}점)
리뷰 내용: ${review.content}`;
}

// ---- Mock 응답 생성 (API 키 없을 때) ----
function generateMockResponse(
  review: Review,
  template?: ResponseTemplate
): string {
  const signature = template?.signature ?? '— 홈리빙 고객행복팀 드림';

  // 별점/감성 기반 템플릿 응답
  if (review.rating <= 2) {
    // 부정 리뷰 대응
    const negativeResponses = [
      `${review.author}님, 먼저 불편을 드려 진심으로 사과드립니다. "${review.productName}" 관련 말씀해주신 내용 확인하였습니다. 해당 건은 품질관리팀에서 즉시 검토하겠습니다. 교환 또는 환불 도움이 필요하시면 고객센터(1588-0000)로 연락 부탁드립니다.\n\n${signature}`,
      `${review.author}님, 소중한 의견 감사합니다. 기대에 미치지 못해 대단히 죄송합니다. "${review.productName}"의 품질 문제를 내부적으로 긴급 확인하고 있으며, 빠른 시일 내 개선하겠습니다. 불편 사항 해결을 위해 1588-0000으로 연락 주시면 도움 드리겠습니다.\n\n${signature}`,
    ];
    return negativeResponses[Math.floor(Math.random() * negativeResponses.length)];
  }

  if (review.rating === 3) {
    // 중립 리뷰 감사
    const neutralResponses = [
      `${review.author}님, 리뷰 남겨주셔서 감사합니다. "${review.productName}"에 대해 말씀해주신 의견 꼼꼼히 참고하겠습니다. 부족한 부분은 개선하여 다음에는 더욱 만족하실 수 있도록 노력하겠습니다!\n\n${signature}`,
      `${review.author}님, 솔직한 리뷰 감사드립니다. 말씀하신 부분 내부적으로 공유하여 "${review.productName}"의 품질 향상에 반영하겠습니다. 앞으로 더 좋은 모습 보여드리겠습니다.\n\n${signature}`,
    ];
    return neutralResponses[Math.floor(Math.random() * neutralResponses.length)];
  }

  // 긍정 리뷰 감사 + 재구매 유도
  const positiveResponses = [
    `${review.author}님, 따뜻한 리뷰 남겨주셔서 정말 감사합니다! 😊 "${review.productName}"에 만족하셨다니 저희도 큰 보람을 느낍니다. 앞으로도 최고의 품질로 보답하겠습니다. 다음에도 꼭 찾아주세요!\n\n${signature}`,
    `${review.author}님, 소중한 리뷰 감사합니다! "${review.productName}"을(를) 좋게 봐주셔서 너무 기쁩니다. 저희 스토어에는 이 외에도 다양한 제품이 준비되어 있으니 구경해 주세요. 항상 감사드립니다! 🏠\n\n${signature}`,
    `${review.author}님의 후기가 저희에게 큰 힘이 됩니다! "${review.productName}" 만족스러우셨다니 감사합니다. 재구매 시 특별 쿠폰도 준비하고 있으니 기대해 주세요! ✨\n\n${signature}`,
  ];
  return positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
}
