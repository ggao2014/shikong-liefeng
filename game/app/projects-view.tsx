'use client';

import { useMemo, useState } from 'react';
import { BookMarked, Compass, GalleryVerticalEnd, GraduationCap, Microscope, PenTool, ScrollText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { prerequisiteStatus, type Prerequisite, type ProgressionContext } from './prerequisites';

export type ProjectRelated = { reading?: number; course?: number; social?: number; free?: number };
export type ProjectDefinition = {
  id: string;
  title: string;
  kind: string;
  desc: string;
  cost: number;
  reward: number;
  difficulty: '常规' | '进阶' | '重大';
  weeks: string;
  icon: typeof PenTool;
  sources: string[];
  related: ProjectRelated;
  prerequisites: Prerequisite[];
  progressScale?: number;
};

export const projectCatalog: ProjectDefinition[] = [
  { id: 'field-guide', title: '河谷四季观察手册', kind: '写作与田野记录', difficulty: '常规', desc: '把阅读所得、散步记录和手绘叶形整理成一本可供小镇居民使用的手册。', cost: 160, reward: 650, weeks: '约 8–14 周', icon: BookMarked, prerequisites: [{ kind: 'bookProgress', value: 35, label: '任一书阅读进度达到 35' }], sources: ['创作时段', '阅读', '旅行观察'], related: { reading: 1.2, free: 0.5 } },
  { id: 'slow-paper', title: '缓慢时间中的学习研究', kind: '大学研究', difficulty: '进阶', desc: '研究长期生活如何改变学习节奏，最终向榛木镇大学提交一篇跨学科论文。', cost: 240, reward: 1100, weeks: '约 12–20 周', icon: Microscope, prerequisites: [{ kind: 'courseProgress', value: 45, label: '一门课准备度达到 45' }], sources: ['创作时段', '课程', '研究室'], related: { course: 1.5, reading: 0.5 } },
  { id: 'oral-history', title: '榛木镇口述史', kind: '社区档案', difficulty: '进阶', desc: '与镇民进行多次访谈，保存那些不会自动进入官方年鉴的生活故事。', cost: 180, reward: 1000, weeks: '约 10–18 周', icon: ScrollText, prerequisites: [{ kind: 'social', value: 40, label: '社交度达到 40' }], sources: ['创作时段', '聚会', '地方史阅读'], related: { social: 1.7, reading: 0.3 } },
  { id: 'living-exhibit', title: '远方与归途生活展', kind: '策展与收藏', difficulty: '重大', desc: '把旅途札记、标本和小镇物件组织成一场会随时间继续生长的展览。', cost: 300, reward: 1800, weeks: '约 14–24 周', icon: GalleryVerticalEnd, prerequisites: [{ kind: 'travel', value: 1, label: '至少完成一次旅行' }], sources: ['创作时段', '聚会', '旅行收藏'], related: { social: 1, free: 1 } },
  { id: 'plant-taxonomy', title: '银叶森林标本志', kind: '大学研究', difficulty: '重大', desc: '把分类学训练、河谷标本和馆藏对照编成一部可被居民查阅的标本志。', cost: 220, reward: 2000, weeks: '约 12–18 周', icon: BookMarked, prerequisites: [{ kind: 'course', id: 'nature', label: '完成普通生物学' }, { kind: 'book', id: 'star-flora', label: '读完《群星植物志》' }], sources: ['创作时段', '阅读', '自然课程'], related: { reading: 1.6, course: 0.8 } },
  { id: 'reserve-casebook', title: '漫长承诺的案例集', kind: '大学研究', difficulty: '重大', desc: '收集跨年约定、延期与和解的案例，讨论极长寿命中的伦理。', cost: 260, reward: 2100, weeks: '约 14–22 周', icon: ScrollText, prerequisites: [{ kind: 'course', id: 'ethics', label: '完成伦理学' }, { kind: 'social', value: 30, label: '社交度达到 30' }], sources: ['创作时段', '课程', '关系记忆'], related: { course: 1.4, social: 0.6 } },
  { id: 'observation-standard', title: '跨季节观测标准化', kind: '大学研究', difficulty: '重大', desc: '为未来的观测者写下今天仍能读懂的记录规范、符号和误差说明。', cost: 280, reward: 2600, weeks: '约 16–24 周', icon: Microscope, prerequisites: [{ kind: 'room', id: 'lab', label: '建成观象台' }, { kind: 'finishedBooks', value: 5, label: '读完 5 本书' }], sources: ['创作时段', '课程', '观象台'], related: { course: 1.8, reading: 0.4 } },
  { id: 'place-names', title: '河谷地名译注', kind: '写作与田野记录', difficulty: '常规', desc: '为口述、地图和档案中的地名建立对照，让后来者不会走错那条无名的小路。', cost: 170, reward: 700, weeks: '约 8–16 周', icon: Compass, prerequisites: [{ kind: 'bookProgress', value: 25, label: '任一书阅读进度达到 25' }], sources: ['创作时段', '阅读', '旅行'], related: { reading: 1.1, social: 0.4 } },
  { id: 'curriculum-proposal', title: '通识课程改进提案', kind: '大学研究', difficulty: '进阶', desc: '以自己的修读经验，向教务提出一条更温和、也更可坚持的通识路径。', cost: 200, reward: 950, weeks: '约 10–16 周', icon: GraduationCap, prerequisites: [{ kind: 'courseProgress', value: 30, label: '一门课准备度达到 30' }], sources: ['创作时段', '课程', '娱乐'], related: { course: 1.3, free: 0.7 } },
  { id: 'craft-catalog', title: '日常器物图谱', kind: '艺术研究', difficulty: '常规', desc: '记录杯子、把手、台阶与桌面如何记住身体的动作。', cost: 190, reward: 750, weeks: '约 10–16 周', icon: GalleryVerticalEnd, prerequisites: [{ kind: 'bookProgress', value: 20, label: '任一书阅读进度达到 20' }], sources: ['创作时段', '阅读', '家园'], related: { reading: 0.8, free: 0.8 } },
  { id: 'sleep-study', title: '恢复节律对照笔记', kind: '大学研究', difficulty: '常规', desc: '对照不同星期的睡眠、运动与课堂效率，写成一份可分享的恢复研究。', cost: 180, reward: 720, weeks: '约 8–14 周', icon: Microscope, prerequisites: [{ kind: 'courseProgress', value: 20, label: '一门课准备度达到 20' }], sources: ['创作时段', '宅家', '课程'], related: { course: 0.7, free: 1.2 } },
  { id: 'walking-map', title: '榛木镇行走地图', kind: '社区档案', difficulty: '进阶', desc: '把茶馆、工坊、河岸和车站连成一张会随关系生长的行走图。', cost: 210, reward: 1050, weeks: '约 10–18 周', icon: Compass, prerequisites: [{ kind: 'travel', value: 1, label: '至少完成一次旅行' }], sources: ['创作时段', '聚会', '旅行'], related: { social: 1.4, free: 0.5 } },
  { id: 'valley-model', title: '河谷流动数学模型', kind: '大学研究', difficulty: '重大', desc: '整理河流、季节与人流数据，建立可检验的模型并完成误差分析。', cost: 280, reward: 2200, weeks: '约 14–22 周', icon: Microscope, prerequisites: [{ kind: 'course', id: 'models', label: '完成数学模型' }], sources: ['创作时段', '课程', '长期观测'], related: { course: 1.8, reading: 0.4 } },
  { id: 'recital-portfolio', title: '毕业音乐会与原创作品集', kind: '完整作品', difficulty: '重大', desc: '完成曲目排练、公开演出，并提交一部结构完整的原创音乐作品。', cost: 320, reward: 2400, weeks: '约 16–24 周', icon: PenTool, prerequisites: [{ kind: 'course', id: 'composition', label: '完成作曲与作品分析' }], sources: ['创作时段', '课程', '演奏练习'], related: { course: 1.5, free: 0.8 } },
  { id: 'movement-study', title: '个人训练周期研究', kind: '大学研究', difficulty: '重大', desc: '设计完整训练周期，持续记录运动表现、疲劳和恢复，形成可复用方案。', cost: 250, reward: 2000, weeks: '约 14–20 周', icon: Microscope, prerequisites: [{ kind: 'course', id: 'nutrition', label: '完成运动生理学' }], sources: ['创作时段', '课程', '运动训练'], related: { course: 1.4, free: 1 } },
  { id: 'circuit-prototype', title: '低功耗观测电路原型', kind: '工程毕业设计', difficulty: '重大', desc: '设计、搭建并测试一套长期运行的低功耗观测电路，提交图纸、数据和说明书。', cost: 360, reward: 2600, weeks: '约 16–24 周', icon: Microscope, prerequisites: [{ kind: 'course', id: 'energy', label: '完成电路实验' }, { kind: 'course', id: 'mapping', label: '完成数字电路' }], sources: ['创作时段', '课程', '实验记录'], related: { course: 2, reading: 0.3 } },
];

export function projectRelatedGain(project: ProjectDefinition, counts: Record<string, number>) {
  const related = project.related;
  return (related.reading ?? 0) * (counts.reading ?? 0) + (related.course ?? 0) * (counts.course ?? 0) + (related.social ?? 0) * (counts.social ?? 0) + (related.free ?? 0) * ((counts.free ?? 0) + (counts.out ?? 0));
}

export function projectUnlockStatus(project: ProjectDefinition, context: ProgressionContext) {
  return prerequisiteStatus(project.prerequisites, context);
}

export function ProjectsView({ funds, active, completed, progress, context, onStart }: { funds: number; active: string | null; completed: string[]; progress: Record<string, number>; context: ProgressionContext; onStart: (project: ProjectDefinition) => void }) {
  const [kind, setKind] = useState('全部');
  const kinds = useMemo(() => ['全部', ...Array.from(new Set(projectCatalog.map(item => item.kind)))], []);
  const current = projectCatalog.find(project => project.id === active);
  const shown = kind === '全部' ? projectCatalog : projectCatalog.filter(item => item.kind === kind);
  return (
    <section className="workspace catalog-page projects-view">
      <div className="page-heading">
        <h1>课题</h1>
        <p>同时一项 · {projectCatalog.length} 条</p>
      </div>
      {current && (
        <div className="now-bar">
          <small>进行中</small>
          <b>{current.title}</b>
          <span>{Math.round(progress[current.id] ?? 0)}% · {current.weeks} · 结项 {current.reward}</span>
          <Progress value={progress[current.id] ?? 0} />
        </div>
      )}
      <div className="catalog-tools">
        <div>
          {kinds.map(item => <button key={item} className={kind === item ? 'active' : ''} onClick={() => setKind(item)}>{item}</button>)}
        </div>
        <span>{shown.length}</span>
      </div>
      <div className="table-scroll">
        <table className="record-table">
          <thead>
            <tr>
              <th>课题</th>
              <th>类 · 难度</th>
              <th>条件</th>
              <th>费用</th>
              <th>结项</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(project => {
              const done = completed.includes(project.id);
              const running = active === project.id;
              const gate = projectUnlockStatus(project, context);
              return (
                <tr key={project.id} className={`${running ? 'focused' : ''} ${done ? 'finished' : ''} ${!gate.unlocked && !done ? 'locked' : ''}`} title={project.desc}>
                  <td><b>{project.title}</b></td>
                  <td>{project.kind} · {project.difficulty}</td>
                  <td>{gate.unlocked ? '可启动' : gate.missing.join('；')}</td>
                  <td className="num">{project.cost}</td>
                  <td className="num">{project.reward}</td>
                  <td>
                    {done ? <span>结项</span> : running ? <span>进行中</span> : (
                      <button className="primary" disabled={!gate.unlocked || !!active || funds < project.cost} onClick={() => onStart(project)}>启动</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
