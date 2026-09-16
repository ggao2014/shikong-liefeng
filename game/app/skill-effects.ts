import { isSkillId, skillById, skillLevel, type SkillId } from './skill-catalog';
import { CREATIVE_SKILL_IDS } from './creative-works';

export type SkillWeekInput = {
  grid: string[][];
  choices: string[][];
  progress: Partial<Record<SkillId, number>>;
  houseLevel: number;
  rooms: string[];
  socialSlots: number;
  projectKind?: string;
};

export type SkillWeekResult = {
  energy: number;
  stress: number;
  health: number;
  social: number;
  project: number;
  funds: number;
  practiced: Partial<Record<SkillId, number>>;
  stretch: number;
  notices: string[];
};

const ART_KINDS = new Set(['艺术研究', '策展与收藏']);
const DRAWING_KINDS = new Set(['艺术研究', '策展与收藏', '写作与田野记录']);
const WRITING_KINDS = new Set(['写作与田野记录', '社区档案']);

function clampStat(value: number) {
  return Math.max(0, Math.min(100, value));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function skillFactor(value: number) {
  return clamp((value ?? 0) / 200, 0, 1);
}

export function cookingCoverPerSlot(skill = 0) {
  return 0.35 + skillFactor(skill) * 0.65;
}

export function countPracticedSkills(grid: string[][], choices: string[][]) {
  const practiced: Partial<Record<SkillId, number>> = {};
  let stretch = 0;
  grid.forEach((row, di) => row.forEach((_, pi) => {
    const id = choices[di]?.[pi] ?? '';
    if (id === 'stretch') {
      stretch += 1;
      return;
    }
    if (!isSkillId(id)) return;
    practiced[id] = (practiced[id] ?? 0) + 1;
  }));
  return { practiced, stretch };
}

export function wellbeingActivityCounts(counts: Record<string, number>, practiced: Partial<Record<SkillId, number>>) {
  const art = CREATIVE_SKILL_IDS.reduce((sum, id) => sum + (practiced[id] ?? 0), 0);
  return {
    ...counts,
    project: Math.max(0, (counts.project ?? 0) - art),
    skill: (counts.skill ?? 0) + art,
  };
}

function fmt1(value: number) {
  return (Math.round(value * 10) / 10).toFixed(1);
}

function perSlotLabel(id: SkillId, value: number) {
  const f = skillFactor(value);
  switch (id) {
    case 'running': return `每次约 +${fmt1(0.35 + 0.55 * f)} 体能`;
    case 'strength': return `每次约 +${fmt1(0.5 + 0.8 * f)} 体能`;
    case 'tennis': return `每次约 +${fmt1(0.35 + 0.45 * f)} 社交`;
    case 'swimming': return `每次约 +${fmt1(0.4 + 0.6 * f)} 体能`;
    case 'charleston': return `每次约 +${fmt1(0.3 + 0.4 * f)} 社交`;
    case 'ballet': return `每次约 −${fmt1(0.4 + 0.5 * f)} 压力`;
    case 'jazz': return `每次约 +${fmt1(0.25 + 0.35 * f)} 体能`;
    case 'basketball': return `每次约 +${fmt1(0.35 + 0.45 * f)} 体能`;
    case 'yoga': return `每次约 −${fmt1(0.5 + 0.6 * f)} 压力`;
    case 'fencing': return `每次约 +${fmt1(0.35 + 0.5 * f)} 体能`;
    case 'writing': return '可写更难题材、更长篇幅';
    case 'piano': return '练了减压；聚会时气氛更好';
    case 'drawing':
    case 'watercolor':
    case 'oil':
    case 'printmaking':
    case 'calligraphy': return '练了减压；相关课题有进度';
    case 'pottery': return `每次约 +${Math.round(3 + 8 * f)} 器物收入`;
    case 'craft': return `每次约 +${Math.round(2 + 5 * f)} 器物收入`;
    case 'composition': return '练了减压；艺术类课题有进度';
    case 'cooking': return `每次替代厨师 ${cookingCoverPerSlot(value).toFixed(2)}`;
    case 'english':
    case 'french':
    case 'spanish':
    case 'japanese':
    case 'latin': return '持续练习可提升语言等级';
  }
}

export function skillEffectShort(id: SkillId, value: number) {
  return perSlotLabel(id, value);
}

export function skillEffectLabel(id: SkillId, value: number, unlocked: boolean) {
  const skill = skillById[id];
  const where = skill.schedule === 'fitness' ? '健身' : skill.schedule === 'project' ? '创作' : '宅家';
  if (!unlocked) return `完成课程后，可排进${where}生效。`;
  const level = skillLevel(value);
  switch (id) {
    case 'running': return `排进健身后按等级恢复体能、减轻压力。当前（${level}）${perSlotLabel(id, value)}。`;
    case 'strength': return `排进健身后按等级增加体能。当前（${level}）${perSlotLabel(id, value)}。`;
    case 'tennis': return `排进健身后恢复体能，并带一点社交。当前（${level}）${perSlotLabel(id, value)}。有球场时更好。`;
    case 'swimming': return `排进健身后恢复体能、减轻压力。当前（${level}）${perSlotLabel(id, value)}。有泳池时更好。`;
    case 'charleston': return `排进健身后练习舞步，减压并带一点社交。当前（${level}）${perSlotLabel(id, value)}。`;
    case 'ballet': return `排进健身后练习体态与把杆，显著减压。当前（${level}）${perSlotLabel(id, value)}。`;
    case 'jazz': return `排进健身后练组合与节奏，恢复体能、减轻压力。当前（${level}）${perSlotLabel(id, value)}。`;
    case 'basketball': return `排进健身后对抗与投篮，提升体能并带一点社交。当前（${level}）${perSlotLabel(id, value)}。`;
    case 'yoga': return `排进健身后做体式与呼吸，减压并略补精力。当前（${level}）${perSlotLabel(id, value)}。`;
    case 'fencing': return `排进健身后练步法与刺击，提升体能。当前（${level}）${perSlotLabel(id, value)}。`;
    case 'writing': return `排进创作后按等级写更难的题材、更长的篇幅。当前（${level}）。完成后留档。写作与田野类课题有进度。`;
    case 'piano': return `排进创作后减压、补一点精力。当前（${level}）。聚会时若已达基础，气氛更好。完成后留档。`;
    case 'drawing': return `排进创作后减压。当前（${level}）。艺术、策展、田野类课题可从练习推进。完成后留档。`;
    case 'watercolor': return `排进创作后练习水彩写生，减压。当前（${level}）。艺术类课题可从练习推进。`;
    case 'oil': return `排进创作后练习油画，减压。当前（${level}）。艺术类课题可从练习推进。`;
    case 'printmaking': return `排进创作后练习版画印制，减压。当前（${level}）。艺术类课题可从练习推进。`;
    case 'calligraphy': return `排进创作后临帖与结体，减压。当前（${level}）。`;
    case 'craft': return `排进创作后做材料与器物练习，可有一点收入。当前（${level}）${perSlotLabel(id, value)}。`;
    case 'composition': return `排进创作后写动机与曲式草稿，减压。当前（${level}）。艺术类课题可从练习推进。`;
    case 'pottery': return `排进创作后减压，器物可有一点收入。当前（${level}）${perSlotLabel(id, value)}。完成后留档。`;
    case 'cooking': return `排进宅家后自己做饭，按等级替代厨师。当前（${level}）${perSlotLabel(id, value)}。`;
    case 'english':
    case 'french':
    case 'spanish':
    case 'japanese':
    case 'latin': return `排进宅家后持续学习。当前（${level}）。每 20 点提升一个等级，并获得里程碑奖励。`;
  }
}

export function resolveSkillWeek(input: SkillWeekInput): SkillWeekResult {
  const { practiced, stretch } = countPracticedSkills(input.grid, input.choices);
  const result: SkillWeekResult = {
    energy: 0,
    stress: 0,
    health: 0,
    social: 0,
    project: 0,
    funds: 0,
    practiced,
    stretch,
    notices: [],
  };

  const add = (energy: number, stress: number, health: number, social = 0, project = 0, funds = 0) => {
    result.energy += energy;
    result.stress += stress;
    result.health += health;
    result.social += social;
    result.project += project;
    result.funds += funds;
  };

  const running = practiced.running ?? 0;
  if (running) {
    const f = skillFactor(input.progress.running ?? 0);
    add(running * 0.15 * f, running * (-0.3 - 0.4 * f), running * (0.35 + 0.55 * f));
  }
  const strength = practiced.strength ?? 0;
  if (strength) {
    const f = skillFactor(input.progress.strength ?? 0);
    add(strength * (-0.15 * (1 - f)), strength * -0.15, strength * (0.5 + 0.8 * f));
  }
  const tennis = practiced.tennis ?? 0;
  if (tennis) {
    const f = skillFactor(input.progress.tennis ?? 0);
    const court = input.houseLevel >= 7 ? 1 : 0;
    add(
      0,
      tennis * (-0.35 - 0.25 * f),
      tennis * (0.25 + 0.35 * f + court * 0.2),
      tennis * (0.35 + 0.45 * f + court * 0.2),
    );
  }
  const swimming = practiced.swimming ?? 0;
  if (swimming) {
    const f = skillFactor(input.progress.swimming ?? 0);
    const hasPool = input.houseLevel >= 5;
    add(
      swimming * (0.1 + 0.25 * f),
      swimming * (-0.45 - 0.45 * f - (hasPool ? 0.2 : 0)),
      swimming * (0.4 + 0.6 * f + (hasPool ? 0.25 : 0)),
    );
  }
  const charleston = practiced.charleston ?? 0;
  if (charleston) {
    const f = skillFactor(input.progress.charleston ?? 0);
    add(charleston * 0.1 * f, charleston * (-0.4 - 0.45 * f), charleston * (0.2 + 0.3 * f), charleston * (0.3 + 0.4 * f));
  }
  const ballet = practiced.ballet ?? 0;
  if (ballet) {
    const f = skillFactor(input.progress.ballet ?? 0);
    add(ballet * (0.15 + 0.2 * f), ballet * (-0.5 - 0.55 * f), ballet * (0.2 + 0.25 * f));
  }
  const jazz = practiced.jazz ?? 0;
  if (jazz) {
    const f = skillFactor(input.progress.jazz ?? 0);
    add(jazz * 0.05, jazz * (-0.35 - 0.4 * f), jazz * (0.25 + 0.35 * f), jazz * (0.15 + 0.2 * f));
  }
  const basketball = practiced.basketball ?? 0;
  if (basketball) {
    const f = skillFactor(input.progress.basketball ?? 0);
    add(
      basketball * (-0.1 * (1 - f)),
      basketball * (-0.25 - 0.2 * f),
      basketball * (0.35 + 0.45 * f),
      basketball * (0.25 + 0.35 * f),
    );
  }
  const yoga = practiced.yoga ?? 0;
  if (yoga) {
    const f = skillFactor(input.progress.yoga ?? 0);
    add(yoga * (0.35 + 0.4 * f), yoga * (-0.55 - 0.65 * f), yoga * (0.15 + 0.2 * f));
  }
  const fencing = practiced.fencing ?? 0;
  if (fencing) {
    const f = skillFactor(input.progress.fencing ?? 0);
    add(fencing * (-0.1 * (1 - f)), fencing * (-0.2 - 0.15 * f), fencing * (0.35 + 0.5 * f));
  }
  const writing = practiced.writing ?? 0;
  if (writing) {
    const f = skillFactor(input.progress.writing ?? 0);
    const related = input.projectKind && WRITING_KINDS.has(input.projectKind) ? writing * (1 + 1.4 * f) : 0;
    add(writing * (0.1 + 0.15 * f), writing * (-0.4 - 0.5 * f), 0, 0, related);
  }
  const piano = practiced.piano ?? 0;
  if (piano) {
    const f = skillFactor(input.progress.piano ?? 0);
    const art = input.projectKind && ART_KINDS.has(input.projectKind) ? piano * (0.4 + 0.6 * f) : 0;
    add(piano * (0.25 + 0.35 * f), piano * (-0.7 - 0.9 * f), 0, 0, art);
  }
  const drawing = practiced.drawing ?? 0;
  if (drawing) {
    const f = skillFactor(input.progress.drawing ?? 0);
    const related = input.projectKind && DRAWING_KINDS.has(input.projectKind) ? drawing * (1 + 1.6 * f) : 0;
    add(0, drawing * (-0.35 - 0.45 * f), 0, 0, related);
  }
  for (const id of ['watercolor', 'oil', 'printmaking', 'calligraphy'] as const) {
    const count = practiced[id] ?? 0;
    if (!count) continue;
    const f = skillFactor(input.progress[id] ?? 0);
    const related = input.projectKind && DRAWING_KINDS.has(input.projectKind) ? count * (0.8 + 1.2 * f) : 0;
    add(0, count * (-0.35 - 0.45 * f), 0, 0, related);
  }
  const craft = practiced.craft ?? 0;
  if (craft) {
    const f = skillFactor(input.progress.craft ?? 0);
    const related = input.projectKind && ART_KINDS.has(input.projectKind) ? craft * (0.8 + 1.2 * f) : 0;
    const funds = Math.round(craft * (2 + 5 * f));
    add(0, craft * (-0.25 - 0.35 * f), 0, 0, related, funds);
  }
  const composition = practiced.composition ?? 0;
  if (composition) {
    const f = skillFactor(input.progress.composition ?? 0);
    const art = input.projectKind && ART_KINDS.has(input.projectKind) ? composition * (0.5 + 0.8 * f) : 0;
    add(composition * (0.15 + 0.2 * f), composition * (-0.5 - 0.6 * f), 0, 0, art);
  }
  const pottery = practiced.pottery ?? 0;
  if (pottery) {
    const f = skillFactor(input.progress.pottery ?? 0);
    const related = input.projectKind && ART_KINDS.has(input.projectKind) ? pottery * (1 + 1.6 * f) : 0;
    const funds = Math.round(pottery * (3 + 8 * f));
    add(0, pottery * (-0.25 - 0.35 * f), 0, 0, related, funds);
  }
  const cooking = practiced.cooking ?? 0;
  if (cooking) {
    const f = skillFactor(input.progress.cooking ?? 0);
    add(cooking * 0.1, cooking * -0.2, cooking * (0.15 + 0.25 * f));
  }
  if (stretch) add(stretch * 1, stretch * -1.1, stretch * 0.15);

  const pianoSkill = input.progress.piano ?? 0;
  if (input.socialSlots > 0 && pianoSkill >= 20) {
    result.social += 0.4 + 0.6 * skillFactor(pianoSkill);
    result.notices.push('会弹琴，聚会气氛更好');
  }

  result.energy = clamp(result.energy, -4, 8);
  result.stress = clamp(result.stress, -12, 2);
  result.health = clamp(result.health, -1, 10);
  result.social = clamp(result.social, 0, 4);
  result.project = clamp(result.project, 0, 12);
  result.funds = Math.max(0, Math.round(result.funds));

  const practicedBits = Object.entries(practiced)
    .filter(([, count]) => (count ?? 0) > 0)
    .map(([id, count]) => {
      const skill = skillById[id as SkillId];
      return count! > 1 ? `${skill.title}×${count}` : skill.title;
    });
  if (stretch) practicedBits.push(stretch > 1 ? `拉伸×${stretch}` : '拉伸');
  if (practicedBits.length) {
    const extras: string[] = [];
    if (cooking) extras.push(`备餐 ${fmt1((practiced.cooking ?? 0) * cookingCoverPerSlot(input.progress.cooking ?? 0))}`);
    if (result.funds) extras.push(`器物收入 +${result.funds}`);
    if (result.project) extras.push(`课题 +${fmt1(result.project)}`);
    result.notices.unshift(`技能生效：${practicedBits.join('、')}${extras.length ? `（${extras.join('，')}）` : ''}`);
  }
  return result;
}

export function withSkillWellbeing<T extends { projectedEnergy: number; projectedStress: number; projectedHealth: number }>(base: T, skill: SkillWeekResult) {
  return {
    ...base,
    projectedEnergy: clampStat(base.projectedEnergy + skill.energy),
    projectedStress: clampStat(base.projectedStress + skill.stress),
    projectedHealth: clampStat(base.projectedHealth + skill.health),
  };
}
