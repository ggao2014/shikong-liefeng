import { type Prerequisite } from './prerequisites';

export type SkillId = 'tennis' | 'swimming' | 'running' | 'strength' | 'charleston' | 'ballet' | 'jazz' | 'basketball' | 'yoga' | 'fencing' | 'writing' | 'piano' | 'drawing' | 'pottery' | 'watercolor' | 'oil' | 'printmaking' | 'calligraphy' | 'craft' | 'composition' | 'cooking' | 'english' | 'french' | 'spanish' | 'japanese' | 'latin';
export type SkillSchedule = 'fitness' | 'project' | 'rest';
export const SKILL_MAX = 200;
export const SKILL_LEVEL_STEP = 20;

export type SkillDefinition = {
  id: SkillId;
  title: string;
  group: '运动' | '艺术' | '生活' | '语言';
  schedule: SkillSchedule;
  courseId?: string;
  /** 有序进阶课：完成越后面的课，技能上限越高 */
  advanceCourseIds?: string[];
  bookIds: string[];
  facility?: string;
  facilityLabel?: string;
  initiallyAvailable?: boolean;
  prerequisites: Prerequisite[];
};

export const skillCatalog: SkillDefinition[] = [
  { id: 'running', title: '跑步', group: '运动', schedule: 'fitness', courseId: 'running', bookIds: ['running-form', 'spark'], initiallyAvailable: true, prerequisites: [] },
  { id: 'strength', title: '力量训练', group: '运动', schedule: 'fitness', courseId: 'strength-training', bookIds: ['strength-basics', 'patient-body'], facility: 'gym', facilityLabel: '主屋健身房', initiallyAvailable: true, prerequisites: [] },
  { id: 'tennis', title: '网球', group: '运动', schedule: 'fitness', courseId: 'tennis', bookIds: ['tennis-basics', 'spark'], initiallyAvailable: true, prerequisites: [{ kind: 'course', id: 'tennis', label: '完成网球课' }] },
  { id: 'swimming', title: '游泳', group: '运动', schedule: 'fitness', courseId: 'swim', bookIds: ['swim-technique', 'patient-body'], initiallyAvailable: true, prerequisites: [{ kind: 'course', id: 'swim', label: '完成游泳课' }] },
  { id: 'charleston', title: '查尔斯顿舞', group: '运动', schedule: 'fitness', courseId: 'body', bookIds: ['patient-body'], prerequisites: [{ kind: 'course', id: 'body', label: '完成查尔斯顿舞' }] },
  { id: 'ballet', title: '芭蕾', group: '运动', schedule: 'fitness', courseId: 'recovery', bookIds: ['why-we-sleep'], prerequisites: [{ kind: 'course', id: 'recovery', label: '完成芭蕾基础' }] },
  { id: 'jazz', title: '爵士舞', group: '运动', schedule: 'fitness', courseId: 'movement', bookIds: ['spark'], prerequisites: [{ kind: 'course', id: 'movement', label: '完成爵士舞' }] },
  { id: 'basketball', title: '篮球', group: '运动', schedule: 'fitness', courseId: 'hoop', bookIds: ['spark'], prerequisites: [{ kind: 'course', id: 'hoop', label: '完成篮球课' }] },
  { id: 'yoga', title: '瑜伽', group: '运动', schedule: 'fitness', courseId: 'yoga', bookIds: ['why-we-sleep'], prerequisites: [{ kind: 'course', id: 'yoga', label: '完成瑜伽课' }] },
  { id: 'fencing', title: '击剑', group: '运动', schedule: 'fitness', courseId: 'fencing', bookIds: ['patient-body'], prerequisites: [{ kind: 'course', id: 'fencing', label: '完成击剑课' }] },
  { id: 'writing', title: '写作', group: '艺术', schedule: 'project', courseId: 'writing', bookIds: ['slow-sentences', 'mist-letters'], facility: 'study', facilityLabel: '书房', initiallyAvailable: true, prerequisites: [] },
  { id: 'piano', title: '钢琴', group: '艺术', schedule: 'project', courseId: 'piano', bookIds: ['piano-practice', 'keyboard-harmony'], facility: 'piano', facilityLabel: '琴房', prerequisites: [{ kind: 'course', id: 'piano', label: '完成钢琴基础' }] },
  { id: 'drawing', title: '绘画', group: '艺术', schedule: 'project', courseId: 'visual', bookIds: ['drawing-basics', 'ways-of-seeing'], facility: 'studio', facilityLabel: '画室', prerequisites: [{ kind: 'course', id: 'visual', label: '完成素描课' }] },
  { id: 'pottery', title: '陶艺', group: '艺术', schedule: 'project', courseId: 'pottery', bookIds: ['pottery-basics', 'craftsman'], facility: 'studio', facilityLabel: '画室', prerequisites: [{ kind: 'course', id: 'pottery', label: '完成陶艺课' }] },
  { id: 'watercolor', title: '水彩', group: '艺术', schedule: 'project', courseId: 'watercolor', bookIds: ['design-of-design', 'ways-of-seeing'], facility: 'studio', facilityLabel: '画室', prerequisites: [{ kind: 'course', id: 'watercolor', label: '完成水彩课' }] },
  { id: 'oil', title: '油画', group: '艺术', schedule: 'project', courseId: 'oil', bookIds: ['craftsman', 'ways-of-seeing'], facility: 'studio', facilityLabel: '画室', prerequisites: [{ kind: 'course', id: 'oil', label: '完成油画课' }] },
  { id: 'printmaking', title: '版画', group: '艺术', schedule: 'project', courseId: 'printmaking', bookIds: ['craftsman'], facility: 'studio', facilityLabel: '画室', prerequisites: [{ kind: 'course', id: 'printmaking', label: '完成版画课' }] },
  { id: 'calligraphy', title: '书法', group: '艺术', schedule: 'project', courseId: 'calligraphy', bookIds: ['yuan-ye'], facility: 'study', facilityLabel: '书房', prerequisites: [{ kind: 'course', id: 'calligraphy', label: '完成书法课' }] },
  { id: 'craft', title: '工艺', group: '艺术', schedule: 'project', courseId: 'craft', bookIds: ['cup-handles', 'craftsman'], facility: 'studio', facilityLabel: '画室', prerequisites: [{ kind: 'course', id: 'craft', label: '完成工艺基础' }] },
  { id: 'composition', title: '作曲', group: '艺术', schedule: 'project', courseId: 'composition', bookIds: ['design-of-design', 'piano-practice'], facility: 'piano', facilityLabel: '琴房', prerequisites: [{ kind: 'course', id: 'composition', label: '完成作曲与作品分析' }] },
  { id: 'cooking', title: '烹饪', group: '生活', schedule: 'rest', courseId: 'cooking', bookIds: ['home-cooking', 'local-table'], facility: 'kitchen', facilityLabel: '正经厨房', initiallyAvailable: true, prerequisites: [] },
  { id: 'english', title: '英语', group: '语言', schedule: 'rest', courseId: 'english', advanceCourseIds: ['english-2', 'english-3'], bookIds: ['mist-letters', 'to-lighthouse'], initiallyAvailable: true, prerequisites: [] },
  { id: 'french', title: '法语', group: '语言', schedule: 'rest', courseId: 'french', advanceCourseIds: ['french-2', 'french-3'], bookIds: ['far-return', 'to-lighthouse'], initiallyAvailable: true, prerequisites: [] },
  { id: 'spanish', title: '西班牙语', group: '语言', schedule: 'rest', courseId: 'spanish', advanceCourseIds: ['spanish-2', 'spanish-3'], bookIds: ['invisible-cities', 'morning-blossoms'], initiallyAvailable: true, prerequisites: [] },
  { id: 'japanese', title: '日语', group: '语言', schedule: 'rest', courseId: 'japanese', advanceCourseIds: ['japanese-2', 'japanese-3'], bookIds: ['morning-blossoms', 'human-ci'], initiallyAvailable: true, prerequisites: [] },
  { id: 'latin', title: '拉丁语', group: '语言', schedule: 'rest', courseId: 'latin', advanceCourseIds: ['latin-2', 'latin-3'], bookIds: ['elements', 'analects'], initiallyAvailable: true, prerequisites: [] },
];

/** 进阶课并入已有技能的练习收益（不单独占日程选项） */
export const COURSE_SKILL_ALIAS: Record<string, SkillId> = {
  ensemble: 'piano',
  'music-theory': 'piano',
  narrative: 'writing',
  translation: 'writing',
  'english-2': 'english',
  'english-3': 'english',
  'french-2': 'french',
  'french-3': 'french',
  'spanish-2': 'spanish',
  'spanish-3': 'spanish',
  'japanese-2': 'japanese',
  'japanese-3': 'japanese',
  'latin-2': 'latin',
  'latin-3': 'latin',
};

export const skillGroups: SkillDefinition['group'][] = ['运动', '艺术', '生活', '语言'];

export const skillById = Object.fromEntries(skillCatalog.map(skill => [skill.id, skill])) as Record<SkillId, SkillDefinition>;

export function isSkillId(value: string): value is SkillId {
  return value in skillById;
}

export function skillUnlocked(skill: SkillDefinition, completedCourses: string[], enrolledCourses: string[] = []) {
  return !!skill.initiallyAvailable || !skill.courseId || completedCourses.includes(skill.courseId) || (!!skill.courseId && enrolledCourses.includes(skill.courseId));
}

export function skillPracticeCap(skill:SkillDefinition,completedCourses:string[],finishedBooks:string[],enrolledCourses:string[]=[]){
  const known = [...completedCourses, ...enrolledCourses];
  const courseReady=!skill.courseId||known.includes(skill.courseId);
  const courseActive=!!skill.courseId&&enrolledCourses.includes(skill.courseId);
  const bookReady=skill.bookIds.length===0||skill.bookIds.some(id=>finishedBooks.includes(id));
  const advance = skill.advanceCourseIds ?? [];
  const midReady = !advance[0] || known.includes(advance[0]);
  const advReady = !advance[1] || known.includes(advance[1]);
  // 自学/在读基础课：止于「基础」
  if(!courseReady)return skill.initiallyAvailable||courseActive?40:0;
  // 语言等有进阶链：基础课→中级→高级，再配合专书开到大师
  if(advance.length){
    if(!midReady)return bookReady?80:60;
    if(!advReady)return bookReady?140:120;
    return bookReady?SKILL_MAX:170;
  }
  // 普通技能：结课后未读专书止于「熟练」；课+书开放大师
  if(!bookReady)return 100;
  return SKILL_MAX;
}

export function skillCapBreakthroughs(
  skill: SkillDefinition,
  completedCourses: string[],
  finishedBooks: string[],
  labels?: { courseTitle?: string; bookTitles?: string[]; advanceTitles?: string[] },
) {
  const courseReady = !skill.courseId || completedCourses.includes(skill.courseId);
  const bookReady = skill.bookIds.length === 0 || skill.bookIds.some(id => finishedBooks.includes(id));
  const courseName = labels?.courseTitle || '对应课程';
  const titles = (labels?.bookTitles ?? []).filter(Boolean);
  const books = titles.length ? titles.map(title => `《${title}》`).join('或') : '相关藏书';
  const steps: string[] = [];
  const advance = skill.advanceCourseIds ?? [];
  if (!courseReady) {
    steps.push(`升级需要完成 ${courseName}`);
    return steps;
  }
  if (advance.length) {
    const missing = advance.findIndex(id => !completedCourses.includes(id));
    if (missing >= 0) {
      const title = labels?.advanceTitles?.[missing] || `后续语言课`;
      steps.push(`升级需要完成 ${title}`);
      return steps;
    }
  }
  if (!bookReady) {
    steps.push(`升级需要读完${books}`);
  }
  return steps;
}

export function skillNextRequirement(
  skill: SkillDefinition,
  completedCourses: string[],
  finishedBooks: string[],
  labels?: { courseTitle?: string; bookTitles?: string[] },
) {
  return skillCapBreakthroughs(skill, completedCourses, finishedBooks, labels).join('；') || '全部进阶条件已满足';
}

export function unlockedSkills(completedCourses: string[]) {
  return skillCatalog.filter(skill => skillUnlocked(skill, completedCourses));
}

export function courseSkill(courseId: string) {
  const direct = skillCatalog.find(skill => skill.courseId === courseId);
  if (direct) return direct;
  const alias = COURSE_SKILL_ALIAS[courseId];
  return alias ? skillById[alias] : undefined;
}

export function skillScheduleLabel(schedule: SkillSchedule) {
  return schedule === 'fitness' ? '健身' : schedule === 'project' ? '创作' : '宅家';
}

export function skillsOnSchedule(schedule: SkillSchedule) {
  return skillCatalog.filter(skill => skill.schedule === schedule);
}

export function activityForSkill(id: string): SkillSchedule {
  if (!isSkillId(id)) return 'fitness';
  return skillById[id].schedule;
}

export function migrateFitnessOption(id: string) {
  if (id === 'cardio') return 'running';
  if (id === 'pool') return 'swimming';
  if (id === 'court') return 'tennis';
  return id;
}

export function skillLevel(value: number) {
  if (value >= 200) return '大师';
  if (value >= 180) return '准大师';
  if (value >= 160) return '专家';
  if (value >= 140) return '资深';
  if (value >= 120) return '高级';
  if (value >= 100) return '熟练';
  if (value >= 80) return '中级';
  if (value >= 60) return '进阶';
  if (value >= 40) return '基础';
  if (value >= 20) return '入门';
  return '初学';
}

export function skillUpgradeRemaining(value: number) {
  const n = Math.max(0, value);
  if (n >= SKILL_MAX) return 0;
  const start = Math.floor(n / SKILL_LEVEL_STEP) * SKILL_LEVEL_STEP;
  const next = Math.min(SKILL_MAX, start + SKILL_LEVEL_STEP);
  const span = next - start;
  if (span <= 0) return 0;
  return Math.max(0, Math.min(100, ((next - n) / span) * 100));
}

export function formatSkillRemaining(value: number) {
  return `${Math.round(skillUpgradeRemaining(value))}%`;
}

export function skillGainPercent(amount: number) {
  return (amount / SKILL_LEVEL_STEP) * 100;
}

export function formatSkillGain(amount: number) {
  const n = Math.round(skillGainPercent(amount) * 10) / 10;
  return `${n > 0 ? '+' : ''}${n}%`;
}

export function formatSkillAdvance(amount: number) {
  const n = Math.round(skillGainPercent(amount) * 10) / 10;
  return `${n}%`;
}

/** 每升一档，练习效率约为上一档的 62%。满加成每周 5 时段时，全程到大师约三十年，末档 alone 十余年。 */
export function skillPracticeFactor(value: number) {
  const tier = Math.max(0, Math.floor(Math.max(0, value) / SKILL_LEVEL_STEP));
  return Math.pow(0.62, Math.min(tier, 12));
}

export function skillPracticeGain(skill: SkillDefinition, finishedBooks: string[], rooms: string[], value = 0) {
  const bookBonus = skill.bookIds.some(id => finishedBooks.includes(id)) ? 0.08 : 0;
  const facilityBonus = skill.facility && rooms.includes(skill.facility) ? 0.07 : 0;
  return (0.35 + bookBonus + facilityBonus) * skillPracticeFactor(value);
}

export function skillCourseGain(meetings: number, value = 0) {
  return Math.max(0, meetings) * 0.35 * skillPracticeFactor(value);
}

/** 旅行 / 远征等按周技能收益，同样吃后期衰减 */
export function scaledSkillGain(amount: number, value = 0) {
  return Math.max(0, amount) * skillPracticeFactor(value);
}
