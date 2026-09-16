import { prerequisiteStatus, type Prerequisite, type ProgressionContext } from './prerequisites';

export type LeisurePlace = 'out' | 'home';

export type LeisureDefinition = {
  id: string;
  title: string;
  detail: string;
  place: LeisurePlace;
  cost: number;
  outdoor: boolean;
  energy: number;
  stress: number;
  health: number;
  social: number;
  prerequisites: Prerequisite[];
};

export const leisureCatalog: LeisureDefinition[] = [
  { id: 'errand', title: '去镇上', detail: '办事、路过广场。', place: 'out', cost: 8, outdoor: true, energy: -0.3, stress: -0.15, health: 0, social: 0.5, prerequisites: [] },
  { id: 'dine', title: '外出吃饭', detail: '去镇上唯一的饭店。', place: 'out', cost: 16, outdoor: false, energy: 0.2, stress: -0.5, health: 0, social: 0.2, prerequisites: [] },
  { id: 'cafe', title: '广场茶座', detail: '坐一坐，看人来人往。', place: 'out', cost: 14, outdoor: false, energy: 0.4, stress: -1.4, health: 0, social: 0.8, prerequisites: [] },
  { id: 'river', title: '河岸闲走', detail: '沿河一圈。雨雪天较差。', place: 'out', cost: 0, outdoor: true, energy: 0.6, stress: -1.2, health: 0.4, social: 0.2, prerequisites: [] },
  { id: 'game', title: '玩游戏', detail: '管理局配发的设备。减压。', place: 'home', cost: 0, outdoor: false, energy: 0.2, stress: -1.8, health: 0, social: 0, prerequisites: [] },
  { id: 'movie', title: '镇上影院', detail: '小厅一轮。', place: 'out', cost: 18, outdoor: false, energy: 0.3, stress: -1.6, health: 0, social: 0.3, prerequisites: [] },
  { id: 'greenhouse', title: '温室长廊', detail: '镇温室散步。', place: 'out', cost: 6, outdoor: false, energy: 0.5, stress: -1.0, health: 0.3, social: 0.3, prerequisites: [] },
  { id: 'dock', title: '码头看船', detail: '看帆与水位。雨雪天较差。', place: 'out', cost: 0, outdoor: true, energy: 0.4, stress: -1.1, health: 0.2, social: 0.2, prerequisites: [] },
  { id: 'garden', title: '院子坐坐', detail: '自家花园。', place: 'home', cost: 0, outdoor: true, energy: 0.7, stress: -1.3, health: 0.2, social: 0, prerequisites: [{ kind: 'houseLevel', value: 3, label: '需舒适乡居的花园' }] },
  { id: 'theater', title: '自宅放映', detail: '不必去镇上影院。', place: 'home', cost: 4, outdoor: false, energy: 0.5, stress: -2.0, health: 0, social: 0, prerequisites: [{ kind: 'houseLevel', value: 6, label: '需庄园的放映厅' }] },
  { id: 'teahouse', title: '茶室静坐', detail: '自宅茶室。', place: 'home', cost: 0, outdoor: false, energy: 0.9, stress: -2.2, health: 0, social: 0, prerequisites: [{ kind: 'houseLevel', value: 11, label: '需私人领土的茶室' }] },
];

export const leisureById = Object.fromEntries(leisureCatalog.map(item => [item.id, item])) as Record<string, LeisureDefinition>;

export function getLeisure(id: string) {
  return leisureById[id] ?? leisureById.game;
}

export function leisureDineCount(leisure: { used: { id: string; count: number }[] }) {
  return leisure.used.find(item => item.id === 'dine')?.count ?? 0;
}

export function isLeisureId(id: string) {
  return id in leisureById;
}

export function isOutingLeisureId(id: string) {
  return leisureById[id]?.place === 'out';
}

export function isHomeLeisureId(id: string) {
  return leisureById[id]?.place === 'home';
}

export function leisureUnlockStatus(item: LeisureDefinition, context: ProgressionContext) {
  return prerequisiteStatus(item.prerequisites, context);
}

function clampStat(value: number) {
  return Math.max(0, Math.min(100, value));
}

function outdoorPenalty(weather: string) {
  if (weather.includes('雨')) return { energy: -0.9, stress: 1.3, health: -0.2, label: '雨' };
  if (weather.includes('雪')) return { energy: -0.7, stress: 1.1, health: -0.4, label: '雪' };
  return null;
}

export type LeisureWeekResult = {
  energy: number;
  stress: number;
  health: number;
  social: number;
  cost: number;
  used: { id: string; title: string; count: number }[];
  notices: string[];
  ledger: { label: string; amount: number }[];
};

function leisureIdForSlot(key: string, raw: string) {
  if (isLeisureId(raw)) return raw;
  return key === 'out' ? 'errand' : 'game';
}

function usedLabel(items: { title: string; count: number }[]) {
  return items.map(item => item.count > 1 ? `${item.title}×${item.count}` : item.title).join('、');
}

export function resolveLeisureWeek(grid: string[][], choices: string[][], weather: string, options?: { allowPaid?: boolean }): LeisureWeekResult {
  const allowPaid = options?.allowPaid !== false;
  const counts = new Map<string, number>();
  grid.forEach((row, di) => row.forEach((key, pi) => {
    if (key !== 'free' && key !== 'out') return;
    const id = leisureIdForSlot(key, choices[di]?.[pi] ?? '');
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }));
  let energy = 0;
  let stress = 0;
  let health = 0;
  let social = 0;
  let cost = 0;
  const notices: string[] = [];
  const used: { id: string; title: string; count: number }[] = [];
  const ledger: { label: string; amount: number }[] = [];
  const penalty = outdoorPenalty(weather);
  let skipped = 0;
  for (const item of leisureCatalog) {
    const count = counts.get(item.id) ?? 0;
    if (!count) continue;
    if (!allowPaid && item.cost > 0) {
      skipped += count;
      stress += 1.1 * count;
      continue;
    }
    used.push({ id: item.id, title: item.title, count });
    energy += item.energy * count;
    stress += item.stress * count;
    health += item.health * count;
    social += item.social * count;
    const spent = item.cost * count;
    cost += spent;
    if (spent) ledger.push({ label: `${item.place === 'out' ? '外出' : '娱乐'}：${item.title}${count > 1 ? `×${count}` : ''}`, amount: -spent });
    if (item.outdoor && penalty) {
      energy += penalty.energy * count;
      stress += penalty.stress * count;
      health += penalty.health * count;
      notices.push(`${item.title}遇${penalty.label}，效果变差`);
    }
  }
  const outUsed = used.filter(item => leisureById[item.id]?.place === 'out');
  const homeUsed = used.filter(item => leisureById[item.id]?.place === 'home');
  if (homeUsed.length) notices.unshift(`娱乐：${usedLabel(homeUsed)}`);
  if (outUsed.length) notices.unshift(`外出：${usedLabel(outUsed)}`);
  if (skipped) notices.unshift(`没钱出门，付费项×${skipped}改在家里待着`);
  return { energy, stress, health, social, cost, used, notices, ledger };
}

export function withLeisureWellbeing<T extends { projectedEnergy: number; projectedStress: number; projectedHealth: number }>(base: T, leisure: LeisureWeekResult) {
  return {
    ...base,
    projectedEnergy: clampStat(base.projectedEnergy + leisure.energy),
    projectedStress: clampStat(base.projectedStress + leisure.stress),
    projectedHealth: clampStat(base.projectedHealth + leisure.health),
  };
}
