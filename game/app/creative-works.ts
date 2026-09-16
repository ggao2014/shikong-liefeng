import { type SkillId } from './skill-catalog';

export const CREATIVE_SKILL_IDS = ['writing', 'piano', 'drawing', 'pottery'] as const;
export type CreativeSkillId = typeof CREATIVE_SKILL_IDS[number];

export type WorkForm = {
  id: string;
  skillId: CreativeSkillId;
  title: string;
  lengthLabel: string;
  minSkill: number;
  slots: number;
  titles: string[];
};

export type ActiveWork = {
  skillId: CreativeSkillId;
  formId: string;
  title: string;
  progress: number;
  slots: number;
};

export type ArchivedWork = {
  id: string;
  skillId: CreativeSkillId;
  formId: string;
  title: string;
  formTitle: string;
  lengthLabel: string;
  slots: number;
  week: number;
  reward?: number;
};

export type CreativeWeekResult = {
  active: Partial<Record<CreativeSkillId, ActiveWork>>;
  archived: ArchivedWork[];
  finished: ArchivedWork[];
  completionReward: number;
  notices: string[];
};

export const workForms: WorkForm[] = [
  { id: 'write-journal', skillId: 'writing', title: '河谷周记', lengthLabel: '短章', minSkill: 0, slots: 3, titles: ['河岸的一周', '泥路速记', '未寄出的天气', '窗台上的种子', '镇灯未亮时'] },
  { id: 'write-letters', skillId: 'writing', title: '镇讯与书信', lengthLabel: '短篇', minSkill: 20, slots: 6, titles: ['给车站的信', '雾里的回信', '一页镇讯', '寄往旧址', '未署名的附言'] },
  { id: 'write-essay', skillId: 'writing', title: '短篇与随笔', lengthLabel: '中短篇', minSkill: 40, slots: 10, titles: ['谁还记得那条无名小路', '茶馆打烊之后', '一次没有目的的散步', '被雨打断的句子', '河谷里的第三人称'] },
  { id: 'write-novella', skillId: 'writing', title: '中篇与地方志', lengthLabel: '中篇', minSkill: 60, slots: 16, titles: ['榛木镇未完成的一章', '旧月台的旁注', '春汛十种记法', '一份不打算发表的地方志', '漫长承诺的草稿'] },
  { id: 'write-novel', skillId: 'writing', title: '长篇', lengthLabel: '长篇', minSkill: 80, slots: 24, titles: ['驻留期内的虚构', '五百年来的一封信', '把时间写成可以走的路', '尚未命名的归途'] },
  { id: 'piano-scale', skillId: 'piano', title: '音阶与短句', lengthLabel: '小品', minSkill: 0, slots: 3, titles: ['晨间音阶', '未踏板的练习', '三个反复的小节'] },
  { id: 'piano-piece', skillId: 'piano', title: '短曲', lengthLabel: '短曲', minSkill: 20, slots: 6, titles: ['给雨天的短曲', '茶凉之前', '可以停在中段的小品'] },
  { id: 'piano-character', skillId: 'piano', title: '性格小品', lengthLabel: '中曲', minSkill: 40, slots: 10, titles: ['河谷夜曲', '慢板里的窗', '不急着结束的回旋'] },
  { id: 'piano-sonata', skillId: 'piano', title: '奏鸣乐章', lengthLabel: '长曲', minSkill: 60, slots: 16, titles: ['第一乐章草稿', '可以单独演奏的慢板', '未编号的奏鸣'] },
  { id: 'piano-suite', skillId: 'piano', title: '组曲', lengthLabel: '组曲', minSkill: 80, slots: 24, titles: ['四季未完成', '驻留组曲', '给榛木镇的一组舞曲'] },
  { id: 'draw-sketch', skillId: 'drawing', title: '速写页', lengthLabel: '单页', minSkill: 0, slots: 3, titles: ['河岸速写', '杯子与手', '未完成的树影'] },
  { id: 'draw-study', skillId: 'drawing', title: '单幅素描', lengthLabel: '单幅', minSkill: 20, slots: 6, titles: ['窗光静物', '旧台阶', '一次认真的轮廓'] },
  { id: 'draw-set', skillId: 'drawing', title: '写生组', lengthLabel: '组画', minSkill: 40, slots: 10, titles: ['同一条河的三天', '镇民的背影', '叶子的几种画法'] },
  { id: 'draw-theme', skillId: 'drawing', title: '主题组画', lengthLabel: '长卷', minSkill: 60, slots: 16, titles: ['远方与归途草稿', '器物记得的动作', '尚未装裱的一组'] },
  { id: 'draw-exhibit', skillId: 'drawing', title: '展览稿', lengthLabel: '展览', minSkill: 80, slots: 24, titles: ['可被居民走过的展览', '继续生长的画稿', '未开幕的目录'] },
  { id: 'pot-cup', skillId: 'pottery', title: '练习杯', lengthLabel: '单件', minSkill: 0, slots: 3, titles: ['第一只歪杯子', '拇指记得的厚度', '未施釉的练习'] },
  { id: 'pot-ware', skillId: 'pottery', title: '日用器', lengthLabel: '单件', minSkill: 20, slots: 6, titles: ['可以每天用的碗', '壶嘴终于正了', '一套还没有配套的杯'] },
  { id: 'pot-set', skillId: 'pottery', title: '成套器物', lengthLabel: '一套', minSkill: 40, slots: 10, titles: ['茶具未完成', '记得手温的一组', '可以送人的六只'] },
  { id: 'pot-glaze', skillId: 'pottery', title: '釉色试验', lengthLabel: '一组', minSkill: 60, slots: 16, titles: ['雨后的釉', '同一配方的七次', '烧成记录'] },
  { id: 'pot-exhibit', skillId: 'pottery', title: '展览件', lengthLabel: '展件', minSkill: 80, slots: 24, titles: ['不必使用的器物', '留给陈列的一件', '还在窑里的决定'] },
];

const formById = Object.fromEntries(workForms.map(form => [form.id, form]));

export function workFormById(id: string) {
  return formById[id];
}

export function isCreativeSkillId(id: string): id is CreativeSkillId {
  return (CREATIVE_SKILL_IDS as readonly string[]).includes(id);
}

export function formsForSkill(skillId: CreativeSkillId) {
  return workForms.filter(form => form.skillId === skillId);
}

export function bestWorkForm(skillId: CreativeSkillId, skillValue: number) {
  const ready = formsForSkill(skillId).filter(form => form.minSkill * 2 <= skillValue);
  return ready[ready.length - 1] ?? formsForSkill(skillId)[0];
}

export function workVerb(skillId: CreativeSkillId) {
  if (skillId === 'writing') return '在写';
  if (skillId === 'piano') return '在练';
  if (skillId === 'drawing') return '在画';
  return '在做';
}

export function workMenuDetail(skillId: CreativeSkillId, skillValue: number, active?: ActiveWork) {
  if (active) return `${workVerb(skillId)}《${active.title}》 ${active.progress}/${active.slots} 时段 · 完成奖励 ${workCompletionReward(active.slots)}`;
  const form = bestWorkForm(skillId, skillValue);
  return `可作：${form.title} · ${form.lengthLabel} ${form.slots} 时段 · 完成奖励 ${workCompletionReward(form.slots)}`;
}

export function workCompletionReward(slots: number) {
  if (slots >= 24) return 3600;
  if (slots >= 16) return 2200;
  if (slots >= 10) return 1200;
  if (slots >= 6) return 600;
  return 240;
}

function unusedTitle(form: WorkForm, week: number, archived: ArchivedWork[]) {
  const taken = new Set(archived.filter(item => item.formId === form.id).map(item => item.title));
  const names = form.titles;
  for (let i = 0; i < names.length; i += 1) {
    const title = names[(week + archived.length + i) % names.length];
    if (!taken.has(title)) return title;
  }
  return `${names[archived.length % names.length]} · ${archived.length + 1}`;
}

export function startWork(skillId: CreativeSkillId, skillValue: number, week: number, archived: ArchivedWork[]): ActiveWork {
  const form = bestWorkForm(skillId, skillValue);
  return {
    skillId,
    formId: form.id,
    title: unusedTitle(form, week, archived),
    progress: 0,
    slots: form.slots,
  };
}

export function applyCreativeWeek(
  practiced: Partial<Record<SkillId, number>>,
  skillProgress: Partial<Record<SkillId, number>>,
  active: Partial<Record<CreativeSkillId, ActiveWork>> | undefined,
  archived: ArchivedWork[] | undefined,
  week: number,
): CreativeWeekResult {
  const nextActive = { ...(active ?? {}) };
  let nextArchived = [...(archived ?? [])];
  const finished: ArchivedWork[] = [];
  const notices: string[] = [];
  let completionReward = 0;

  for (const skillId of CREATIVE_SKILL_IDS) {
    let remaining = practiced[skillId] ?? 0;
    if (remaining <= 0) continue;
    const skillValue = skillProgress[skillId] ?? 0;
    while (remaining > 0) {
      let work = nextActive[skillId] ?? startWork(skillId, skillValue, week, nextArchived);
      const used = Math.min(remaining, Math.max(0, work.slots - work.progress));
      if (used <= 0) {
        delete nextActive[skillId];
        continue;
      }
      work = { ...work, progress: work.progress + used };
      remaining -= used;
      if (work.progress >= work.slots) {
        const form = formById[work.formId] ?? bestWorkForm(skillId, skillValue);
        const done: ArchivedWork = {
          id: `${skillId}-${week}-${nextArchived.length}`,
          skillId,
          formId: work.formId,
          title: work.title,
          formTitle: form.title,
          lengthLabel: form.lengthLabel,
          slots: work.slots,
          week,
          reward: workCompletionReward(work.slots),
        };
        nextArchived = [done, ...nextArchived];
        finished.push(done);
        delete nextActive[skillId];
        completionReward += done.reward ?? 0;
        notices.push(`作品留档：《${done.title}》（${form.title} · ${form.lengthLabel}）· 完成奖励 ${done.reward}`);
      } else {
        nextActive[skillId] = work;
      }
    }
  }

  return { active: nextActive, archived: nextArchived, finished, completionReward, notices };
}

export function hydrateArchivedWorks(raw: unknown): ArchivedWork[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is ArchivedWork => {
    if (!item || typeof item !== 'object') return false;
    const work = item as ArchivedWork;
    return isCreativeSkillId(work.skillId) && typeof work.title === 'string' && typeof work.week === 'number';
  });
}

export function hydrateActiveWorks(raw: unknown): Partial<Record<CreativeSkillId, ActiveWork>> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const next: Partial<Record<CreativeSkillId, ActiveWork>> = {};
  for (const skillId of CREATIVE_SKILL_IDS) {
    const work = (raw as Record<string, ActiveWork>)[skillId];
    if (work && work.skillId === skillId && typeof work.title === 'string') next[skillId] = work;
  }
  return next;
}
