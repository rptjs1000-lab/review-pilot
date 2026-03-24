// ============================================
// 사용량 관리 — 체험/플랜 제한 체크
// ============================================
//
// ⚠️ 경고: 서버리스 환경(Vercel 등)에서는 인메모리 상태가 인스턴스 간 공유되지 않습니다.
// 각 서버리스 함수 인스턴스마다 독립적인 메모리를 사용하므로, 사용량 카운터가
// 정확하지 않을 수 있습니다. 프로덕션에서는 DB 기반 사용량 추적으로 전환이 필요합니다.
// MVP/데모 수준에서는 허용 가능합니다.
//

/** 플랜 타입 */
type Plan = 'trial' | 'starter' | 'pro';

/** 플랜 설정 */
interface PlanConfig {
  name: string;
  monthlyLimit: number; // -1 = 무제한
  trialDays: number;
}

const PLAN_CONFIGS: Record<Plan, PlanConfig> = {
  trial: { name: '체험', monthlyLimit: -1, trialDays: 7 },
  starter: { name: '스타터', monthlyLimit: 200, trialDays: 0 },
  pro: { name: '프로', monthlyLimit: -1, trialDays: 0 },
};

// ---- 인메모리 사용량 카운터 ----
let currentPlan: Plan = 'trial';
let trialStartDate: Date = new Date();
let monthlyUsageCount = 0;
let lastResetMonth: number = new Date().getMonth();

/** 현재 플랜 조회 */
export function getCurrentPlan(): Plan {
  return currentPlan;
}

/** 플랜 설정 */
export function setPlan(plan: Plan): void {
  currentPlan = plan;
  if (plan === 'trial') {
    trialStartDate = new Date();
  }
}

/** 체험 기간 남은 일수 */
export function getTrialDaysRemaining(): number {
  if (currentPlan !== 'trial') return 0;
  const now = new Date();
  const diffMs = now.getTime() - trialStartDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, PLAN_CONFIGS.trial.trialDays - diffDays);
}

/** 체험 기간 만료 여부 */
export function isTrialExpired(): boolean {
  if (currentPlan !== 'trial') return false;
  return getTrialDaysRemaining() <= 0;
}

/** 월간 사용량 리셋 (월이 바뀌면) */
function checkMonthlyReset(): void {
  const currentMonth = new Date().getMonth();
  if (currentMonth !== lastResetMonth) {
    monthlyUsageCount = 0;
    lastResetMonth = currentMonth;
  }
}

/** 응답 생성 가능 여부 체크 */
export function canGenerate(): { allowed: boolean; reason?: string } {
  // 체험 기간 체크
  if (currentPlan === 'trial' && isTrialExpired()) {
    return {
      allowed: false,
      reason: '7일 무료 체험 기간이 만료되었습니다. 플랜을 업그레이드해주세요.',
    };
  }

  // 월간 사용량 체크
  checkMonthlyReset();
  const config = PLAN_CONFIGS[currentPlan];

  if (config.monthlyLimit !== -1 && monthlyUsageCount >= config.monthlyLimit) {
    return {
      allowed: false,
      reason: `월간 사용량(${config.monthlyLimit}건)을 초과했습니다. 프로 플랜으로 업그레이드해주세요.`,
    };
  }

  return { allowed: true };
}

/** 사용량 증가 (응답 생성 시 호출) */
export function incrementUsage(): void {
  checkMonthlyReset();
  monthlyUsageCount++;
}

/** 현재 사용량 정보 */
export function getUsageInfo() {
  checkMonthlyReset();
  const config = PLAN_CONFIGS[currentPlan];
  return {
    plan: currentPlan,
    planName: config.name,
    monthlyUsed: monthlyUsageCount,
    monthlyLimit: config.monthlyLimit,
    trialDaysRemaining:
      currentPlan === 'trial' ? getTrialDaysRemaining() : undefined,
  };
}
