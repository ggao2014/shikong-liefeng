export const BASE_LIVING = 70;

export type FundsTone = 'ok' | 'tight' | 'broke';

export type CashSettlement = {
  closing: number;
  paidLiving: number;
  paidLeisure: number;
  paidGathering: number;
  unpaidLiving: number;
  nextDebt: number;
  leisurePaid: boolean;
  gatheringPaid: boolean;
  nextLeanWeeks: number;
  recovered: boolean;
  notices: string[];
};

export type BehaviorCounts = {
  reading: number;
  course: number;
  fitness: number;
  skill: number;
  social: number;
  project: number;
};

export function rationMul(leanWeeks: number) {
  if (leanWeeks <= 0) return 1;
  if (leanWeeks === 1) return 0.45;
  if (leanWeeks === 2) return 0.25;
  return 0.12;
}

export function behaviorIncome(counts: BehaviorCounts, wellbeingFactor: number, leanWeeks: number) {
  const raw = 70 + counts.reading * 8 + counts.course * 12 + counts.fitness * 5 + counts.skill * 6 + counts.social * 6 + counts.project * 10;
  return Math.round(raw * wellbeingFactor * rationMul(leanWeeks));
}

function clampStat(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function fundsTone(funds: number, living: number, leanWeeks: number): FundsTone {
  if (leanWeeks > 0 || funds <= 0) return 'broke';
  if (funds < living * 3) return 'tight';
  return 'ok';
}

export function fundsToneLabel(tone: FundsTone) {
  if (tone === 'broke') return '催缴';
  if (tone === 'tight') return '偏低';
  return '余额';
}

export function hardshipQuitCount(leanWeeks: number) {
  return leanWeeks >= 2 ? 1 : 0;
}

export function hardshipWear(leanWeeks: number) {
  if (leanWeeks <= 0) return { energy: 0, stress: 0, health: 0, cleanliness: 0, grounds: 0, social: 0 };
  if (leanWeeks === 1) return { energy: -5, stress: 8, health: -2, cleanliness: 6, grounds: 0, social: 0 };
  if (leanWeeks === 2) return { energy: -7, stress: 10, health: -3, cleanliness: 10, grounds: 6, social: -0.4 };
  return { energy: -8, stress: 12, health: -4, cleanliness: 12, grounds: 8, social: -1.2 };
}

export function incomeLedgerLabel(leanWeeks: number) {
  return rationMul(leanWeeks) < 1 ? '本周收入（配给缩水）' : '本周收入';
}

export function hardshipNotices(leanWeeks: number, recovered: boolean, unpaid = true) {
  const notices: string[] = [];
  if (recovered) notices.push('生活费已结清。催缴解除，驻留配给恢复。');
  else if (leanWeeks > 0 && !unpaid) notices.push('本周生活费已结清。催缴缓一档，连续付清后才会解除。');
  if (leanWeeks === 1 && unpaid) notices.push('管理局催缴：生活费未结清。驻留资格仍有效，本周配给缩水。');
  if (leanWeeks === 2) notices.push('水电不稳。屋子更快变脏，付费出门取消。');
  if (leanWeeks >= 3) notices.push('连续欠费。可继续住，请把日程改成免费娱乐、自己家务。');
  return notices;
}

export function campWeatherWear(weather: string) {
  if (weather.includes('雪')) return { energy: -6, stress: 7, health: -5 };
  if (weather.includes('雨')) return { energy: -5, stress: 6, health: -4 };
  if (weather.includes('风') || weather.includes('寒') || weather.includes('冷')) return { energy: -4, stress: 4, health: -3 };
  return { energy: -2, stress: 3, health: -2 };
}

export function settleCash(input: {
  funds: number;
  living: number;
  leisure: number;
  gathering: number;
  leanWeeks: number;
  debt?: number;
}): CashSettlement {
  let pocket = Math.max(0, input.funds);
  const arrears = Math.max(0, Math.round(input.debt ?? 0));
  const due = Math.max(0, input.living) + arrears;
  const paidLiving = Math.min(pocket, due);
  pocket -= paidLiving;
  const unpaidLiving = due - paidLiving;
  const leisurePaid = unpaidLiving === 0 && pocket >= input.leisure;
  const paidLeisure = leisurePaid ? input.leisure : 0;
  if (leisurePaid) pocket -= paidLeisure;
  const gatheringPaid = unpaidLiving === 0 && pocket >= input.gathering;
  const paidGathering = gatheringPaid ? input.gathering : 0;
  if (gatheringPaid) pocket -= paidGathering;
  const nextDebt = unpaidLiving;
  const nextLeanWeeks = unpaidLiving > 0 ? input.leanWeeks + 1 : Math.max(0, input.leanWeeks - 1);
  const recovered = unpaidLiving === 0 && input.leanWeeks > 0 && nextLeanWeeks === 0;
  const notices = [...hardshipNotices(nextLeanWeeks, recovered, unpaidLiving > 0)];
  if (unpaidLiving > 0) notices.push(`生活维护未付清 ${unpaidLiving}（已付 ${paidLiving}/${due}）`);
  if (!leisurePaid && input.leisure > 0) notices.push('付费娱乐取消，改在家里待着。');
  if (!gatheringPaid && input.gathering > 0) notices.push('请客取消，改成清茶或独自度过。');
  if (unpaidLiving === 0 && input.leanWeeks === 0 && pocket < input.living) {
    notices.push('余额偏低，下周转不开生活维护。');
  }
  return {
    closing: pocket,
    paidLiving,
    paidLeisure,
    paidGathering,
    unpaidLiving,
    nextDebt,
    leisurePaid,
    gatheringPaid,
    nextLeanWeeks,
    recovered,
    notices,
  };
}

export function applyHardshipWellbeing<T extends { projectedEnergy: number; projectedStress: number; projectedHealth: number }>(base: T, leanWeeks: number) {
  const wear = hardshipWear(leanWeeks);
  return {
    ...base,
    projectedEnergy: clampStat(base.projectedEnergy + wear.energy),
    projectedStress: clampStat(base.projectedStress + wear.stress),
    projectedHealth: clampStat(base.projectedHealth + wear.health),
  };
}

export function applyHardshipHome(cleanliness: number, grounds: number, leanWeeks: number) {
  const wear = hardshipWear(leanWeeks);
  return {
    cleanliness: clampStat(cleanliness - wear.cleanliness),
    grounds: clampStat(grounds - wear.grounds),
  };
}

export const RECLAIM_WARN_AT = 3;
export const RECLAIM_START_AT = 4;
export const RECLAIM_LEAN_RESET = 1;

export function houseKeepFloor(_houseLevel?: number) {
  return 0;
}

export function nextReclaimedLevel(_houseLevel: number) {
  return 0;
}

export function canReclaimHouse(houseLevel: number) {
  return houseLevel > 0;
}

export function shouldWarnReclaim(leanWeeks: number, houseLevel: number) {
  return canReclaimHouse(houseLevel) && leanWeeks >= RECLAIM_WARN_AT && leanWeeks < RECLAIM_START_AT;
}

export function shouldReclaimHouse(leanWeeks: number, houseLevel: number) {
  return canReclaimHouse(houseLevel) && leanWeeks >= RECLAIM_START_AT;
}

export function reclaimWarning(leanWeeks: number, _houseName?: string) {
  if (leanWeeks < RECLAIM_WARN_AT) return '';
  if (leanWeeks < RECLAIM_START_AT) return '若再欠一周，管理局将收回整栋房屋，只留这块地。';
  return '连续欠费。房屋正被收回，驻留资格只保障这块地。';
}
