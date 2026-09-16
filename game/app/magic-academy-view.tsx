'use client';

import { useState } from 'react';
import { Beaker, BookMarked, BookOpen, Compass, Flame, GraduationCap, Mail, MoonStar, ScrollText, Shield, Sparkles, Sword, WandSparkles, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { DiplomaCertificate } from './academic-modals';
import type { ProjectDefinition } from './projects-view';
import { academicTerm, type DiplomaReport } from './university-catalog';

const faculties = [
  { id: 'all', name: '全部院系', code: 'ALL', icon: Sparkles },
  { id: 'astral', name: '占星与天象学院', code: 'AST', icon: MoonStar },
  { id: 'elemental', name: '元素术学院', code: 'ELM', icon: Flame },
  { id: 'alchemy', name: '炼金学院', code: 'ALC', icon: Beaker },
  { id: 'runes', name: '符文与结界学院', code: 'RUN', icon: BookOpen },
  { id: 'summoning', name: '召唤学院', code: 'SUM', icon: WandSparkles },
] as const;

export type MagicAward = '证书' | '学位' | '高等学位';
type MagicProgram = { faculty: string; award: MagicAward; code: string; priorId?: string; project: ProjectDefinition };

export function magicMeetingCount(award: MagicAward) {
  if (award === '证书') return 3;
  if (award === '学位') return 5;
  return 6;
}

/** 每院：证书 → 学位 → 高等学位。旧证书 / 高等 id 尽量沿用，中间档为新增。 */
const programs: MagicProgram[] = [
  // —— 占星与天象 ——
  { faculty: 'astral', award: '证书', code: 'AST-170', project: { id: 'astral-divination', title: '基础占星证书', kind: '占星与天象', difficulty: '重大', desc: '辨认星座与行星轨迹，推算月相节气，绘制可用的基础命盘。', cost: 800, reward: 22000, weeks: '约 26–38 周', icon: Compass, prerequisites: [], sources: ['天象导论', '星图识读', '命盘实习'], related: { reading: .2, free: .15 }, progressScale: .32 } },
  { faculty: 'astral', award: '学位', code: 'AST-320', priorId: 'astral-divination', project: { id: 'astral-prophecy', title: '预言术学位', kind: '占星与天象', difficulty: '重大', desc: '以星象推演短期与中期征兆，校验收束预言，撰写可复核的天象报告。', cost: 1800, reward: 62000, weeks: '约 90–120 周', icon: BookMarked, prerequisites: [], sources: ['预言术原理', '征兆校核', '星象档案', '观测值班', '报告写作'], related: { reading: .16, free: .1 }, progressScale: .065 } },
  { faculty: 'astral', award: '高等学位', code: 'AST-490', priorId: 'astral-prophecy', project: { id: 'star-gate-thesis', title: '大预言与天象仪轨', kind: '占星与天象', difficulty: '重大', desc: '主持一次跨季天象仪轨，封印或疏导异常星象，完成可存档的大预言答卷。', cost: 3200, reward: 120000, weeks: '约 120–160 周', icon: GraduationCap, prerequisites: [], sources: ['高等天象学', '仪轨设计', '异象处置', '大预言研讨', '仪轨实习', '答辩演练'], related: { reading: .12, free: .08 }, progressScale: .045 } },

  // —— 元素术 ——
  { faculty: 'elemental', award: '证书', code: 'ELM-160', project: { id: 'elemental-attunement', title: '四元素基础证书', kind: '元素术', difficulty: '重大', desc: '掌握点火、凝水、驭风、塑土的稳定施法，通过安全规程与基础考核。', cost: 900, reward: 24000, weeks: '约 30–42 周', icon: Flame, prerequisites: [], sources: ['元素理论', '基础塑形', '安全实训'], related: { free: .18 }, progressScale: .3 } },
  { faculty: 'elemental', award: '学位', code: 'ELM-310', priorId: 'elemental-attunement', project: { id: 'elemental-combat', title: '元素防护与战斗学位', kind: '元素术', difficulty: '重大', desc: '学习火墙、冰封、雷击与土盾的组合施法，完成防护与对抗演练。', cost: 2000, reward: 65000, weeks: '约 92–122 周', icon: Sword, prerequisites: [], sources: ['防护结界', '元素对抗', '组合咏唱', '战场机动', '演练考核'], related: { free: .14 }, progressScale: .06 } },
  { faculty: 'elemental', award: '高等学位', code: 'ELM-480', priorId: 'elemental-combat', project: { id: 'storm-crown', title: '风暴驾驭高等学位', kind: '元素术', difficulty: '重大', desc: '在可控场域内召唤、约束并遣散风暴级元素现象，证明对大规模能量的掌控。', cost: 3000, reward: 110000, weeks: '约 115–150 周', icon: GraduationCap, prerequisites: [], sources: ['高等元素学', '能量约束', '风暴模拟', '大规模塑形', '应急处置', '大师答辩'], related: { free: .1 }, progressScale: .048 } },

  // —— 炼金 ——
  { faculty: 'alchemy', award: '证书', code: 'ALC-170', project: { id: 'moon-alchemy', title: '药剂学证书', kind: '炼金', difficulty: '重大', desc: '配制治疗、解毒与基础增益药剂，掌握称量、提纯与药性记录。', cost: 1000, reward: 26000, weeks: '约 32–46 周', icon: Beaker, prerequisites: [], sources: ['药剂学导论', '草药辨识', '配药实验'], related: { reading: .2 }, progressScale: .28 } },
  { faculty: 'alchemy', award: '学位', code: 'ALC-340', priorId: 'moon-alchemy', project: { id: 'living-alchemy', title: '魔药精炼学位', kind: '炼金', difficulty: '重大', desc: '完成高级魔药的多步精炼，稳定产出隐身、强效治疗与抗咒类制剂。', cost: 2200, reward: 68000, weeks: '约 95–125 周', icon: BookMarked, prerequisites: [], sources: ['高等药剂', '提纯工艺', '药性稳定', '毒理与拮抗', '精炼工坊'], related: { reading: .16 }, progressScale: .06 } },
  { faculty: 'alchemy', award: '高等学位', code: 'ALC-500', priorId: 'living-alchemy', project: { id: 'philosophers-stone', title: '贤者之石高等学位', kind: '炼金', difficulty: '重大', desc: '在严格监护下完成贤者之石相关仪轨与长效炼金，提交可复核的炼成记录。', cost: 3400, reward: 125000, weeks: '约 125–165 周', icon: GraduationCap, prerequisites: [], sources: ['古典炼金', '物质嬗变', '长效固化', '仪轨监护', '炼成档案', '高等答辩'], related: { reading: .12, free: .08 }, progressScale: .042 } },

  // —— 符文与结界 ——
  { faculty: 'runes', award: '证书', code: 'RUN-150', project: { id: 'rune-script', title: '基础符文证书', kind: '符文与结界', difficulty: '重大', desc: '临摹常用防护与照明符文，完成石板与卷轴上的稳定铭刻。', cost: 850, reward: 23000, weeks: '约 28–40 周', icon: ScrollText, prerequisites: [], sources: ['符文字母', '临摹工坊', '基础结界'], related: { reading: .25 }, progressScale: .3 } },
  { faculty: 'runes', award: '学位', code: 'RUN-330', priorId: 'rune-script', project: { id: 'oath-archive', title: '诅咒、解咒与铭刻学位', kind: '符文与结界', difficulty: '重大', desc: '识别常见诅咒结构，实施解咒与反向铭刻，维护中型防护结界。', cost: 2100, reward: 66000, weeks: '约 92–120 周', icon: Shield, prerequisites: [], sources: ['诅咒学', '解咒实训', '铭刻工艺', '结界维护', '案例研讨'], related: { reading: .18, social: .08 }, progressScale: .06 } },
  { faculty: 'runes', award: '高等学位', code: 'RUN-490', priorId: 'oath-archive', project: { id: 'ancient-seal', title: '古代封印高等学位', kind: '符文与结界', difficulty: '重大', desc: '解读古代封印阵列，修复或重置大型结界，完成一次可归档的封印工程。', cost: 3100, reward: 115000, weeks: '约 120–155 周', icon: GraduationCap, prerequisites: [], sources: ['古代文字', '封印结构', '大结界学', '阵列勘测', '工程实习', '封印答辩'], related: { reading: .14, social: .08 }, progressScale: .045 } },

  // —— 召唤 ——
  { faculty: 'summoning', award: '证书', code: 'SUM-160', project: { id: 'dream-architecture', title: '初级召唤证书', kind: '召唤', difficulty: '重大', desc: '学习召唤阵布置与契约条款，安全召唤并遣返初级侍从生物。', cost: 1100, reward: 28000, weeks: '约 36–50 周', icon: WandSparkles, prerequisites: [], sources: ['召唤导论', '阵法布置', '遣返规程'], related: { social: .15, free: .12 }, progressScale: .26 } },
  { faculty: 'summoning', award: '学位', code: 'SUM-350', priorId: 'dream-architecture', project: { id: 'summon-familiar', title: '守护兽契约学位', kind: '召唤', difficulty: '重大', desc: '完成与守护兽或元素精灵的对等契约，掌握长期供养、指令与解约。', cost: 2300, reward: 70000, weeks: '约 95–125 周', icon: Sparkles, prerequisites: [], sources: ['契约律', '异界生态', '供养学', '指令训练', '解约演练'], related: { social: .18, free: .1 }, progressScale: .058 } },
  { faculty: 'summoning', award: '高等学位', code: 'SUM-500', priorId: 'summon-familiar', project: { id: 'familiar-covenant', title: '高等召唤与异界门扉', kind: '召唤', difficulty: '重大', desc: '在监护下开启受控异界门扉，完成高等召唤与稳妥关闭，提交完整仪轨报告。', cost: 3300, reward: 120000, weeks: '约 125–165 周', icon: GraduationCap, prerequisites: [], sources: ['异界门扉', '高等召唤', '能量锚定', '应急关闭', '监护实习', '仪轨答辩'], related: { social: .12, free: .08 }, progressScale: .042 } },
];

export const magicAcademyProjects: ProjectDefinition[] = programs.map(item => item.project);

export function magicProgramDetails(id?: string | null) {
  return programs.find(item => item.project.id === id);
}

const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const periodNames = ['早晨', '午后', '夜晚'];
export const MAGIC_SCHEDULE_CANDIDATES = [[1, 0], [3, 1], [5, 0], [2, 2], [4, 1], [0, 1], [6, 2]] as const;

/** 培养项目写入日程表的固定课次预览（实际锁定时会避开大学已占格）。 */
export function magicProgramSchedule(program: MagicProgram) {
  const count = magicMeetingCount(program.award);
  return MAGIC_SCHEDULE_CANDIDATES.slice(0, count).map(([day, period], index) => ({
    day,
    period,
    when: `${dayNames[day]}${periodNames[period]}`,
    title: program.project.sources[index] ?? (index === 0 ? '导师课' : '实践课'),
  }));
}

export function magicAwardKind(award: MagicAward): DiplomaReport['kind'] {
  if (award === '证书') return 'certificate';
  if (award === '学位') return 'degree';
  return 'doctorate';
}

export function magicAwardDocumentTitle(award: MagicAward) {
  if (award === '证书') return '结业证书';
  if (award === '学位') return '学位证书';
  return '高等学位证书';
}

export function magicAwardGrantText(award: MagicAward) {
  if (award === '证书') return '兹证明该生已完成证书规定课业与实践，成绩合格，准予结业。';
  if (award === '学位') return '兹证明该生已完成学位规定课业与研习，成绩合格，授予学位。';
  return '兹证明该生已完成高等学位规定课业、研习与原创仪轨，成绩合格，授予高等学位。';
}

export function magicCompletionLedger(id: string) {
  const program = magicProgramDetails(id);
  if (!program) return null;
  return {
    label: `完成${program.award}：${program.project.title}`,
    amount: program.project.reward,
  };
}

export function buildMagicDiploma(id: string, year: number, weekOfYear: number): DiplomaReport | undefined {
  const program = magicProgramDetails(id);
  if (!program) return undefined;
  const faculty = faculties.find(item => item.id === program.faculty)?.name ?? '秘法学院';
  const kind = magicAwardKind(program.award);
  const credits = program.award === '证书' ? 9 : program.award === '学位' ? 24 : 36;
  const sourceCourses = program.project.sources.map((title, index) => ({
    code: `${program.code}-${index + 1}`,
    title,
    letter: 'A',
    gpa: 4,
    credits: 0,
  }));
  const practiceExtra = program.award === '证书'
    ? []
    : [{
        code: `${program.code}-R`,
        title: program.award === '高等学位' ? '原创仪轨答辩' : '高阶实践课',
        letter: 'A',
        gpa: 4,
        credits: 0,
      }];
  const courses = [...sourceCourses, ...practiceExtra];
  const each = Math.max(1, Math.floor(credits / Math.max(1, courses.length)));
  const normalized = courses.map((course, index) => ({
    ...course,
    credits: index === courses.length - 1 ? credits - each * (courses.length - 1) : each,
  }));
  return {
    programId: program.project.id,
    title: program.project.title,
    kind,
    kindLabel: program.award,
    documentTitle: magicAwardDocumentTitle(program.award),
    grantText: magicAwardGrantText(program.award),
    school: faculty,
    schoolShort: '星穹秘法学院',
    issuedAt: '签发于远山',
    credits,
    earnedCredits: credits,
    gpa: 4,
    courses: normalized,
    year,
    weekOfYear,
    termName: academicTerm(weekOfYear).name,
    reward: program.project.reward,
  };
}

function MagicProgramRecord({
  program,
  diploma,
  onBack,
}: {
  program: MagicProgram;
  diploma: DiplomaReport;
  onBack: () => void;
}) {
  const faculty = faculties.find(item => item.id === program.faculty)?.name ?? '秘法学院';
  return (
    <section className="workspace catalog-page magic-academy-view">
      <div className="page-heading">
        <button type="button" className="btn-ghost room-back" onClick={onBack}>返回</button>
        <h1>{program.project.title}</h1>
        <p>已结项 · {program.award} · {faculty} · 学分 {diploma.earnedCredits}/{diploma.credits} · GPA {diploma.gpa.toFixed(2)}</p>
      </div>
      <DiplomaCertificate report={diploma} />
    </section>
  );
}

export function MagicAcademyView({
  onBack,
  funds,
  active,
  completed,
  progress,
  diplomas,
  year,
  weekOfYear,
  onStart,
}: {
  onBack: () => void;
  funds: number;
  active: string | null;
  completed: string[];
  progress: Record<string, number>;
  diplomas: Record<string, DiplomaReport>;
  year: number;
  weekOfYear: number;
  onStart: (project: ProjectDefinition) => void;
}) {
  const [faculty, setFaculty] = useState('all');
  const [notice, setNotice] = useState('');
  const [recordId, setRecordId] = useState('');
  const shown = programs.filter(program => faculty === 'all' || program.faculty === faculty);
  const record = programs.find(item => item.project.id === recordId);
  if (record && (completed.includes(record.project.id) || diplomas[record.project.id])) {
    const diploma = diplomas[record.project.id] ?? buildMagicDiploma(record.project.id, year, weekOfYear);
    if (diploma) {
      return <MagicProgramRecord program={record} diploma={diploma} onBack={() => setRecordId('')} />;
    }
  }
  return (
    <section className="workspace magic-academy-view">
      <div className="page-heading">
        <button type="button" className="btn-ghost room-back" onClick={onBack}>返回</button>
        <h1>星穹秘法学院</h1>
        <p>远山之上 · 非公开学府</p>
      </div>
      <header className="magic-academy-hero">
        <div className="magic-sigil"><Sparkles /></div>
        <span>每院证书 → 学位 → 高等学位；课表为传统术科，结项后可申报下一阶。</span>
      </header>
      <nav className="magic-faculties" aria-label="魔法学院院系">
        {faculties.map(item => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={faculty === item.id ? 'active' : ''} onClick={() => setFaculty(item.id)}>
              <Icon />
              <span><b>{item.name}</b><small>{item.code}</small></span>
            </button>
          );
        })}
      </nav>
      <div className="magic-program-head">
        <div><small>培养项目</small><h2>{faculties.find(item => item.id === faculty)?.name}</h2></div>
        <span>{shown.length} 项</span>
      </div>
      {notice && <p className="magic-notice" role="status">{notice}</p>}
      <div className="magic-programs">
        {shown.map(program => {
          const { project } = program;
          const prior = program.priorId ? programs.find(item => item.project.id === program.priorId)?.project : undefined;
          const done = completed.includes(project.id) || !!diplomas[project.id];
          const running = active === project.id;
          const busy = !!active && !running;
          const priorMet = !program.priorId || completed.includes(program.priorId) || !!diplomas[program.priorId];
          const apply = () => {
            if (busy) {
              setNotice('你已有一项正在进行的课题；结项后才能申报新的培养项目。');
              return;
            }
            if (funds < project.cost) {
              setNotice(`申报《${project.title}》还缺少 ${(project.cost - funds).toLocaleString()} 份仪式材料。`);
              return;
            }
            setNotice('');
            onStart(project);
          };
          return (
            <article key={project.id} className={running ? 'active' : done ? 'done' : ''}>
              <header><span>{program.code}</span><em>{program.award}</em></header>
              <h3>{project.title}</h3>
              <p>{project.desc}</p>
              <dl>
                <div><dt>修习周期</dt><dd>{project.weeks}</dd></div>
                <div><dt>仪式材料</dt><dd>{project.cost.toLocaleString()}</dd></div>
                <div><dt>结业奖励</dt><dd>{project.reward.toLocaleString()}</dd></div>
                <div><dt>课程表</dt><dd>{magicProgramSchedule(program).map(slot => `${slot.when}「${slot.title}」`).join(' · ')}</dd></div>
              </dl>
              {prior && !priorMet && <p className="magic-prereq">先完成《{prior.title}》</p>}
              {running && <Progress value={progress[project.id] ?? 0} />}
              <footer>
                {done ? (
                  <button type="button" onClick={() => setRecordId(project.id)}>查看{program.award}</button>
                ) : running ? (
                  <b>修习中 · {Math.round(progress[project.id] ?? 0)}%</b>
                ) : (
                  <button disabled={!priorMet} onClick={apply}>
                    {!priorMet ? '前置项目未完成' : busy ? '查看申报条件' : funds < project.cost ? '材料不足' : '申报项目'}
                  </button>
                )}
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function MagicInvitation({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="modal-backdrop magic-letter-backdrop">
      <dialog className="magic-letter" open aria-labelledby="magic-letter-title">
        <button className="close" onClick={onAccept} aria-label="收下邀请"><X /></button>
        <div className="magic-letter-seal"><Mail /></div>
        <p className="eyebrow">一封没有邮戳的来信</p>
        <h2 id="magic-letter-title">致声名已越过远山的学者</h2>
        <p>您在数学、自然科学与工程领域的学术造诣已传至星穹议席。诸位教授一致同意，邀请您越过镇北远山，进入星穹秘法学院继续深造。</p>
        <p>请不必寻找道路。读完此信以后，山会记得您的名字。</p>
        <footer>
          <button onClick={onAccept}><GraduationCap />接受邀请</button>
        </footer>
      </dialog>
    </div>
  );
}
