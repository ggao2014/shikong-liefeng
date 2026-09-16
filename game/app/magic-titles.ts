import {
  magicAcademyProjects,
  magicProgramDetails,
  type MagicAward,
} from './magic-academy-view';

export type MagicTitleDefinition = {
  id: string;
  title: string;
  desc: string;
  reward: number;
  /** 必须全部完成的项目 id */
  projects?: string[];
  /** 自定义条件（在 projects 之外） */
  check?: (completed: Set<string>) => boolean;
};

const FACULTY_TRACK: Record<string, string[]> = {
  astral: ['astral-divination', 'astral-prophecy', 'star-gate-thesis'],
  elemental: ['elemental-attunement', 'elemental-combat', 'storm-crown'],
  alchemy: ['moon-alchemy', 'living-alchemy', 'philosophers-stone'],
  runes: ['rune-script', 'oath-archive', 'ancient-seal'],
  summoning: ['dream-architecture', 'summon-familiar', 'familiar-covenant'],
};

const CERT_IDS = Object.values(FACULTY_TRACK).map(ids => ids[0]);
const DEGREE_IDS = Object.values(FACULTY_TRACK).map(ids => ids[1]);
const HIGH_IDS = Object.values(FACULTY_TRACK).map(ids => ids[2]);

function hasAll(completed: Set<string>, ids: string[]) {
  return ids.every(id => completed.has(id));
}

function countAmong(completed: Set<string>, ids: string[]) {
  return ids.filter(id => completed.has(id)).length;
}

export const magicTitleCatalog: MagicTitleDefinition[] = [
  // 单院通关
  { id: 'title-astro-master', title: '观星司', desc: '完成占星与天象学院全部三阶培养。', reward: 45000, projects: FACULTY_TRACK.astral },
  { id: 'title-elem-master', title: '驭火者', desc: '完成元素术学院全部三阶培养。', reward: 45000, projects: FACULTY_TRACK.elemental },
  { id: 'title-alc-master', title: '金汞师', desc: '完成炼金学院全部三阶培养。', reward: 50000, projects: FACULTY_TRACK.alchemy },
  { id: 'title-rune-master', title: '结界守', desc: '完成符文与结界学院全部三阶培养。', reward: 45000, projects: FACULTY_TRACK.runes },
  { id: 'title-summon-master', title: '契主', desc: '完成召唤学院全部三阶培养。', reward: 50000, projects: FACULTY_TRACK.summoning },

  // 跨院搭配
  { id: 'title-prophecy-seal', title: '谶纬学士', desc: '兼修预言术与符文铭刻。', reward: 35000, projects: ['astral-prophecy', 'oath-archive'] },
  { id: 'title-spirit-knight', title: '役灵战士', desc: '兼修元素战斗与守护兽契约。', reward: 35000, projects: ['elemental-combat', 'summon-familiar'] },
  { id: 'title-curse-alchemist', title: '咒药师', desc: '兼修魔药精炼与诅咒解咒。', reward: 35000, projects: ['living-alchemy', 'oath-archive'] },
  { id: 'title-storm-seer', title: '风暴先知', desc: '兼修大预言仪轨与风暴驾驭。', reward: 80000, projects: ['star-gate-thesis', 'storm-crown'] },
  { id: 'title-seal-alchemist', title: '封印炼金师', desc: '兼修贤者之石与古代封印。', reward: 90000, projects: ['philosophers-stone', 'ancient-seal'] },
  { id: 'title-void-warden', title: '异界典狱', desc: '兼修异界门扉与古代封印。', reward: 90000, projects: ['familiar-covenant', 'ancient-seal'] },

  // 广度 / 终局
  {
    id: 'title-star-scholar',
    title: '星穹学士',
    desc: '取得任意三枚秘法「学位」（不含证书与高等学位）。',
    reward: 60000,
    check: completed => countAmong(completed, DEGREE_IDS) >= 3,
  },
  {
    id: 'title-dual-crown',
    title: '双冠法师',
    desc: '取得任意两枚高等学位。',
    reward: 120000,
    check: completed => countAmong(completed, HIGH_IDS) >= 2,
  },
  {
    id: 'title-five-apprentice',
    title: '五术学徒',
    desc: '五院证书各至少一枚。',
    reward: 40000,
    projects: CERT_IDS,
  },
  {
    id: 'title-five-scholar',
    title: '五术学士',
    desc: '五院学位各至少一枚。',
    reward: 150000,
    projects: DEGREE_IDS,
  },
  {
    id: 'title-archmage',
    title: '星穹大法师',
    desc: '五院高等学位全部完成。议席承认你为完整术士。',
    reward: 400000,
    projects: HIGH_IDS,
  },
  {
    id: 'title-wandering-mage',
    title: '游学施法者',
    desc: '五院证书齐全，且尚未取得任何学位或高等学位。',
    reward: 25000,
    check: completed => hasAll(completed, CERT_IDS) && countAmong(completed, [...DEGREE_IDS, ...HIGH_IDS]) === 0,
  },
];

export function magicTitleById(id: string) {
  return magicTitleCatalog.find(item => item.id === id);
}

export function magicTitleMet(def: MagicTitleDefinition, completed: string[] | Set<string>) {
  const set = completed instanceof Set ? completed : new Set(completed);
  if (def.projects?.length && !hasAll(set, def.projects)) return false;
  if (def.check && !def.check(set)) return false;
  if (!def.projects?.length && !def.check) return false;
  return true;
}

export function newlyUnlockedMagicTitles(completed: string[], owned: string[]) {
  const have = new Set(owned);
  return magicTitleCatalog.filter(item => !have.has(item.id) && magicTitleMet(item, completed));
}

export function magicTitleRewardTotal(ids: string[]) {
  return ids.reduce((sum, id) => sum + (magicTitleById(id)?.reward ?? 0), 0);
}

/** 新解锁时优先佩戴：按奖励从高到低 */
export function preferredMagicTitle(owned: string[], preferIds?: string[]) {
  const pool = preferIds?.length ? preferIds : owned;
  const ranked = [...pool]
    .map(id => magicTitleById(id))
    .filter((item): item is MagicTitleDefinition => !!item)
    .sort((a, b) => b.reward - a.reward);
  return ranked[0]?.id ?? '';
}

export function isMagicProjectId(id: string) {
  return !!magicProgramDetails(id) || magicAcademyProjects.some(item => item.id === id);
}

export function magicAwardOfProject(id: string): MagicAward | undefined {
  return magicProgramDetails(id)?.award;
}
