export type FitnessConditionId = 'adequate' | 'fair' | 'slack';

export type FitnessCondition = {
  id: FitnessConditionId;
  label: string;
  energyMax: number;
  stressFloor: number;
  recentSlots: number[];
  weeklyAverage: number;
  energyLimited: boolean;
  stressLimited: boolean;
};

const HISTORY_WEEKS = 2;

export function hydrateFitnessHistory(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [2, 2];
  return raw
    .map(value => Math.max(0, Math.floor(Number(value) || 0)))
    .filter(value => Number.isFinite(value))
    .slice(-HISTORY_WEEKS);
}

export function pushFitnessHistory(history: number[], weekSlots: number) {
  return [...history, Math.max(0, Math.floor(weekSlots))].slice(-HISTORY_WEEKS);
}

export function fitnessWindow(history: number[], currentWeekSlots: number) {
  return [...history.slice(-HISTORY_WEEKS), Math.max(0, Math.floor(currentWeekSlots))];
}

export function fitnessConditionAt(history: number[], currentWeekSlots: number): FitnessCondition {
  const recentSlots = fitnessWindow(history, currentWeekSlots);
  const total = recentSlots.reduce((sum, value) => sum + value, 0);
  const weeklyAverage = total / Math.max(1, recentSlots.length);
  let id: FitnessConditionId = 'slack';
  if (weeklyAverage >= 5 / 3) id = 'adequate';
  else if (weeklyAverage >= 2 / 3) id = 'fair';
  const table = {
    adequate: { label: '充足', energyMax: 100, stressFloor: 0 },
    fair: { label: '普通', energyMax: 92, stressFloor: 10 },
    slack: { label: '松懈', energyMax: 80, stressFloor: 20 },
  } as const;
  const tier = table[id];
  return {
    id,
    label: tier.label,
    energyMax: tier.energyMax,
    stressFloor: tier.stressFloor,
    recentSlots,
    weeklyAverage,
    energyLimited: tier.energyMax < 100,
    stressLimited: tier.stressFloor > 0,
  };
}

export function clampEnergyToCondition(value: number, condition: Pick<FitnessCondition, 'energyMax'>) {
  return Math.max(0, Math.min(condition.energyMax, value));
}

export function clampStressToCondition(value: number, condition: Pick<FitnessCondition, 'stressFloor'>) {
  return Math.max(condition.stressFloor, Math.min(100, value));
}

export function applyFitnessConditionCaps(
  energy: number,
  stress: number,
  condition: Pick<FitnessCondition, 'energyMax' | 'stressFloor'>,
) {
  return {
    energy: clampEnergyToCondition(energy, condition),
    stress: clampStressToCondition(stress, condition),
  };
}

export function fitnessConditionHint(condition: FitnessCondition, kind: 'energy' | 'stress') {
  if (kind === 'energy') {
    if (!condition.energyLimited) return '';
    return `体况${condition.label}：精力上限 ${condition.energyMax}`;
  }
  if (!condition.stressLimited) return '';
  return `体况${condition.label}：压力难降到 ${condition.stressFloor} 以下`;
}

export function fitnessConditionBanner(condition: FitnessCondition) {
  if (condition.id === 'adequate') return '';
  return `体况${condition.label}：近期少运动。精力上限 ${condition.energyMax}，压力难低于 ${condition.stressFloor}。`;
}
