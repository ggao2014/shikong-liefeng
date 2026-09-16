import { workForms, workFormById, type ArchivedWork, type CreativeSkillId } from './creative-works';
import { skillCatalog, type SkillId } from './skill-catalog';

export type AchievementDefinition = {
  id: string;
  title: string;
  desc: string;
  reward: number;
  level: string;
};

const CREATIVE_SKILL_TITLE: Record<CreativeSkillId, string> = {
  writing: '写作',
  piano: '钢琴',
  drawing: '绘画',
  pottery: '陶艺',
};

function workTierPay(minSkill: number) {
  if (minSkill >= 80) return { reward: 720, level: '长期' };
  if (minSkill >= 60) return { reward: 420, level: '长期' };
  if (minSkill >= 40) return { reward: 220, level: '长期' };
  if (minSkill >= 20) return { reward: 90, level: '起步' };
  return { reward: 40, level: '起步' };
}

function workAchievementId(formId: string) {
  return `work-${formId}`;
}

const workAchievements: AchievementDefinition[] = workForms.map(form => {
  const pay = workTierPay(form.minSkill);
  return {
    id: workAchievementId(form.id),
    title: `${CREATIVE_SKILL_TITLE[form.skillId]} · ${form.title}`,
    desc: `完成并留档一件「${form.title}」（${form.lengthLabel}）`,
    reward: pay.reward,
    level: pay.level,
  };
});

const skillMilestones = [
  { value: 20, label: '入门', reward: 60 },
  { value: 40, label: '基础', reward: 150 },
  { value: 60, label: '进阶', reward: 240 },
  { value: 80, label: '中级', reward: 350 },
  { value: 100, label: '熟练', reward: 500 },
  { value: 120, label: '高级', reward: 700 },
  { value: 140, label: '资深', reward: 900 },
  { value: 160, label: '专家', reward: 1200 },
  { value: 180, label: '准大师', reward: 1500 },
  { value: 200, label: '大师', reward: 2000 },
] as const;

const skillAchievements: AchievementDefinition[] = skillCatalog.flatMap(skill => skillMilestones.map(milestone => ({
  id: `skill-${skill.id}-${milestone.value}`,
  title: `${skill.title} · ${milestone.label}`,
  desc: `${skill.title}达到 ${milestone.value}，获评${milestone.label}`,
  reward: milestone.reward,
  level: milestone.value >= 80 ? '长期' : milestone.value >= 40 ? '里程碑' : '起步',
})));

export const achievementCatalog: AchievementDefinition[] = [
  { id: 'first-week', title: '首周结算', desc: '完成第一次周结算', reward: 50, level: '起步' },
  { id: 'first-course', title: '第二门课', desc: '在读课程增至两门', reward: 70, level: '起步' },
  { id: 'first-trip', title: '首次出行', desc: '完成一次旅行', reward: 90, level: '里程碑' },
  { id: 'first-room', title: '第一间屋', desc: '在荒地上建起小破屋。', reward: 100, level: '里程碑' },
  { id: 'book-finished', title: '读完一书', desc: '任一书目进度达到 100', reward: 140, level: '长期' },
  { id: 'trusted-friend', title: '社交 50', desc: '社交度达到 50', reward: 180, level: '长期' },
  { id: 'five-books', title: '五书结档', desc: '读完五本书', reward: 220, level: '长期' },
  { id: 'first-certificate', title: '证书入档', desc: '完成一个证书培养项目', reward: 200, level: '长期' },
  ...skillAchievements,
  ...workAchievements,
];

export function achievementById(id: string) {
  return achievementCatalog.find(item => item.id === id);
}

export function workAchievementIds(archived: ArchivedWork[]) {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const work of archived) {
    if (work.id.startsWith('expedition-')) continue;
    const form = workFormById(work.formId);
    if (!form) continue;
    const id = workAchievementId(form.id);
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

export function skillAchievementIds(progress: Partial<Record<SkillId, number>>) {
  return skillCatalog.flatMap(skill => skillMilestones
    .filter(milestone => (progress[skill.id] ?? 0) >= milestone.value)
    .map(milestone => `skill-${skill.id}-${milestone.value}`));
}
