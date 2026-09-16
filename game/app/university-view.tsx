'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CourseDefinition,
  SEMESTER_CREDIT_CAP,
  academicTerm,
  academicHeading,
  buildDiploma,
  colleges,
  completedCertificates,
  creditSum,
  cumulativeGpa,
  getCourse,
  gpaLetter,
  gradeFromProgress,
  isAddDropWeek,
  meetingConflict,
  meetingLabel,
  nextRequired,
  prereqsMet,
  coursePrerequisites,
  programCourseList,
  programKindLabel,
  programCompletionReward,
  programResearch,
  programRecordIds,
  programStatus,
  programAwarded,
  programCreditCap,
  recommendedBookTitle,
  studyPrograms,
  type DiplomaReport,
  type StudyProgram,
} from './university-catalog';
import { DiplomaCertificate } from './academic-modals';

const programKindFilters: { id: 'all' | StudyProgram['kind']; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'certificate', label: '证书' },
  { id: 'degree', label: '学士' },
  { id: 'master', label: '硕士' },
  { id: 'doctorate', label: '博士' },
  { id: 'general', label: '通识' },
];

function programCollegeId(program: StudyProgram) {
  if (program.kind === 'general') return 'all';
  return colleges.find(item => item.name === program.school)?.id ?? 'all';
}

const programSettleFilters: { id: 'all' | 'open' | 'done'; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'open', label: '未结项' },
  { id: 'done', label: '已结项' },
];

function filterPrograms(pool: StudyProgram[], college: string, kind: 'all' | StudyProgram['kind'], settle: 'all' | 'open' | 'done', diplomas: Record<string, DiplomaReport>) {
  return pool.filter(item => {
    if (college !== 'all' && programCollegeId(item) !== college) return false;
    if (kind !== 'all' && item.kind !== kind) return false;
    if (settle !== 'all') {
      const done = programAwarded(item.id, diplomas);
      if (settle === 'done' ? !done : done) return false;
    }
    return true;
  });
}

function ProgramBrowseFilter({
  college,
  onCollege,
  kind,
  onKind,
  settle,
  onSettle,
  total,
  shown,
}: {
  college: string;
  onCollege: (id: string) => void;
  kind: 'all' | StudyProgram['kind'];
  onKind: (id: 'all' | StudyProgram['kind']) => void;
  settle: 'all' | 'open' | 'done';
  onSettle: (id: 'all' | 'open' | 'done') => void;
  total: number;
  shown: number;
}) {
  return (
    <div className="program-filters">
      <div className="catalog-tools">
        <small>学院</small>
        <div>
          {colleges.map(item => (
            <button key={item.id} type="button" className={college === item.id ? 'active' : ''} onClick={() => onCollege(item.id)}>{item.id === 'all' ? '全部' : item.name}</button>
          ))}
        </div>
      </div>
      <div className="catalog-tools">
        <small>类别</small>
        <div>
          {programKindFilters.map(item => (
            <button key={item.id} type="button" className={kind === item.id ? 'active' : ''} onClick={() => onKind(item.id)}>{item.label}</button>
          ))}
        </div>
      </div>
      <div className="catalog-tools">
        <small>进度</small>
        <div>
          {programSettleFilters.map(item => (
            <button key={item.id} type="button" className={settle === item.id ? 'active' : ''} onClick={() => onSettle(item.id)}>{item.label}</button>
          ))}
        </div>
        <span>{shown}/{total}</span>
      </div>
    </div>
  );
}

export type ProgramResearchWork = {
  title: string;
  desc: string;
  need: string;
  cost: number;
  progress: number;
  status: 'locked' | 'ready' | 'active' | 'done';
  lockLabel?: string;
  onStart: () => void;
};

export function UniversityView({
  progress,
  grades,
  funds,
  enrolled,
  completed,
  programId,
  year,
  weekOfYear,
  diplomas,
  research,
  onEnroll,
  onDrop,
  onDeclare,
  onBack,
}: {
  progress: Record<string, number>;
  grades: Record<string, number>;
  funds: number;
  enrolled: string[];
  completed: string[];
  programId: string;
  season: '春' | '夏' | '秋' | '冬';
  year: number;
  weekOfYear: number;
  diplomas: Record<string, DiplomaReport>;
  research?: ProgramResearchWork | null;
  onEnroll: (id: string, cost: number) => void;
  onDrop: (id: string) => void;
  onDeclare: (id: string) => void;
  onBack?: () => void;
}) {
  const program = studyPrograms.find(item => item.id === programId);
  if (!program || programAwarded(program.id, diplomas)) {
    return <ProgramPicker completed={completed} grades={grades} diplomas={diplomas} year={year} weekOfYear={weekOfYear} onDeclare={onDeclare} onBack={onBack} />;
  }
  return (
    <ProgramDossier
      program={program}
      progress={progress}
      grades={grades}
      funds={funds}
      enrolled={enrolled}
      completed={completed}
      diplomas={diplomas}
      weekOfYear={weekOfYear}
      research={research}
      onEnroll={onEnroll}
      onDrop={onDrop}
      onDeclare={onDeclare}
      onBack={onBack}
    />
  );
}

function ProgramPicker({ completed, grades, diplomas, year, weekOfYear, onDeclare, onBack }: { completed: string[]; grades: Record<string, number>; diplomas: Record<string, DiplomaReport>; year: number; weekOfYear: number; onDeclare: (id: string) => void; onBack?: () => void }) {
  const [college, setCollege] = useState('all');
  const [kind, setKind] = useState<'all' | StudyProgram['kind']>('all');
  const [settle, setSettle] = useState<'all' | 'open' | 'done'>('all');
  const [recordId, setRecordId] = useState('');
  const shown = filterPrograms(studyPrograms, college, kind, settle, diplomas);
  const record = studyPrograms.find(item => item.id === recordId);
  if (record && programAwarded(record.id, diplomas)) {
    return <ProgramRecord program={record} completed={completed} grades={grades} diplomas={diplomas} year={year} weekOfYear={weekOfYear} onBack={() => setRecordId('')} />;
  }
  return (
    <section className="workspace catalog-page university-view">
      <div className="page-heading">
        {onBack && <button type="button" className="btn-ghost room-back" onClick={onBack}>返回</button>}
        <h1>申报培养项目</h1>
      </div>
      <ProgramBrowseFilter college={college} onCollege={setCollege} kind={kind} onKind={setKind} settle={settle} onSettle={setSettle} total={studyPrograms.length} shown={shown.length} />
      <div className="program-picks">
        {shown.map(item => {
          const status = programStatus(item, completed, diplomas);
          const awarded = programAwarded(item.id, diplomas);
          const research = programResearch(item);
          return (
            <article key={item.id} className={`program-pick${awarded ? ' done' : ''}`}>
              <small>{programKindLabel(item.kind)} · {item.school}</small>
              <h2>{item.title}</h2>
              <p>{item.desc}</p>
              <p className="req-line">
                学分 {programCreditCap(item)}
                {item.required.length ? ` · 必修 ${item.required.map(id => getCourse(id)?.code ?? id).join(' / ')}` : ' · 任选'}
                {item.priorProgramId ? ` · 前置 ${studyPrograms.find(program => program.id === item.priorProgramId)?.title ?? item.priorProgramId}` : ''}
                {research ? ` · 研究《${research.title}》` : ' · 无毕业研究'}
                {` · 结项 ${programCompletionReward(item)}`}
                {awarded ? ' · 已结项' : status.complete ? ' · 课业已达' : ''}
              </p>
              {awarded
                ? <button className="primary" onClick={() => setRecordId(item.id)}>已结项</button>
                : <button className="primary" disabled={!status.priorMet} onClick={() => onDeclare(item.id)}>{status.priorMet ? '申报' : '前置学位未完成'}</button>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProgramRecord({ program, completed, grades, diplomas, year, weekOfYear, onBack }: { program: StudyProgram; completed: string[]; grades: Record<string, number>; diplomas: Record<string, DiplomaReport>; year: number; weekOfYear: number; onBack: () => void }) {
  const ids = programRecordIds(program, completed);
  const gpa = cumulativeGpa(ids, grades);
  const diploma = diplomas[program.id] ?? buildDiploma(program, completed, grades, year, weekOfYear);
  return (
    <section className="workspace catalog-page university-view">
      <div className="page-heading">
        <h1>{program.title}</h1>
        <p>已结项 · {programKindLabel(program.kind)} · {program.school} · 学分 {creditSum(ids)}/{programCreditCap(program)}{ids.length ? ` · GPA ${gpa.toFixed(2)}` : ''}</p>
        <Button variant="outline" size="sm" className="btn-ghost" onClick={onBack}><ChevronLeft/>返回大学</Button>
      </div>
      <DiplomaCertificate report={diploma} />
      <ul className="req-list">
        {ids.map(id => {
          const course = getCourse(id);
          const gpaValue = grades[id] ?? 0;
          return (
            <li key={id} className="done">
              <small>{course?.code ?? id}</small>
              <span>{course?.title ?? id}</span>
              <em>{gpaLetter(gpaValue)} {gpaValue.toFixed(1)}</em>
            </li>
          );
        })}
      </ul>
      {ids.length > 0 && <div className="transcript"><p>成绩单 GPA {gpa.toFixed(2)} · {ids.map(id => `${getCourse(id)?.code ?? id} ${gpaLetter(grades[id] ?? 0)}`).join(' · ')}</p></div>}
    </section>
  );
}

function ProgramDossier({
  program,
  progress,
  grades,
  funds,
  enrolled,
  completed,
  diplomas,
  weekOfYear,
  research,
  onEnroll,
  onDrop,
  onDeclare,
  onBack,
}: {
  program: (typeof studyPrograms)[number];
  progress: Record<string, number>;
  grades: Record<string, number>;
  funds: number;
  enrolled: string[];
  completed: string[];
  diplomas: Record<string, DiplomaReport>;
  weekOfYear: number;
  research?: ProgramResearchWork | null;
  onEnroll: (id: string, cost: number) => void;
  onDrop: (id: string) => void;
  onDeclare: (id: string) => void;
  onBack?: () => void;
}) {
  const [query, setQuery] = useState('');
  const [college, setCollege] = useState('all');
  const term = academicTerm(weekOfYear);
  const addDrop = isAddDropWeek(weekOfYear);
  const calendar = academicHeading(weekOfYear);
  const status = programStatus(program, completed, diplomas);
  const load = creditSum(enrolled);
  const recordIds = programRecordIds(program, completed);
  const earned = creditSum(recordIds);
  const gpa = cumulativeGpa(recordIds, grades);
  const certificates = completedCertificates(diplomas);
  const upcoming = nextRequired(program, completed, enrolled);
  const pool = useMemo(() => programCourseList(program), [program]);
  const shown = useMemo(() => pool.filter(course => {
    const haystack = `${course.title}${course.school}${course.node}${recommendedBookTitle(course)}${course.code}`;
    return (!query || haystack.includes(query)) && (college === 'all' || course.collegeId === college);
  }), [pool, query, college]);

  function enrollLabel(course: CourseDefinition) {
    if (completed.includes(course.id)) return '已结课';
    if (enrolled.includes(course.id)) return '本学期在读';
    if (term.holiday) return '假期未开放';
    if (!addDrop) return '选课周已过';
    if (!prereqsMet(course, completed)) return coursePrerequisites(course).map(item => item.label).join(' / ') || '先修未满足';
    if (load + course.credits > SEMESTER_CREDIT_CAP) return `负荷满 ${SEMESTER_CREDIT_CAP}`;
    const clash = meetingConflict(enrolled, course.id);
    if (clash) return `与 ${clash.code} 冲突`;
    if (funds < course.cost) return '余额不足';
    return '';
  }

  function courseMark(id: string) {
    if (completed.includes(id)) {
      const gpaValue = grades[id] ?? gradeFromProgress(progress[id] ?? 100).gpa;
      return `${gpaLetter(gpaValue)} ${gpaValue.toFixed(1)}`;
    }
    if (enrolled.includes(id)) {
      return `准备度 ${Math.round(progress[id] ?? 0)}%`;
    }
    if (grades[id] != null) return `上次 ${gpaLetter(grades[id])}`;
    return '未修';
  }

  return (
    <section className="workspace catalog-page university-view">
      <div className="page-heading">
        {onBack && <button type="button" className="btn-ghost room-back" onClick={onBack}>返回</button>}
        <h1>{program.title}</h1>
        <p>{calendar.heading} · {calendar.state} · {program.school} · 方案学分 {earned}/{status.cap}{recordIds.length ? ` · GPA ${gpa.toFixed(2)}` : ''} · 结项 {programCompletionReward(program)}{certificates.length ? ` · 已获证书 ${certificates.length}` : ''}{status.complete ? ' · 已结项' : ''}</p>
      </div>
      {addDrop && <p className="term-note alert">选课周：本周可改课表。上课 10 周后统一结课计入 GPA，随后放假 3 周。</p>}
      {term.lastTeachingWeek && <p className="term-note alert">本学期最后一周上课。结算后全部在读课程同时出成绩。</p>}
      {term.holiday && <p className="term-note holiday">{term.breakName}：无课。下学期第 1 周再开放选课。</p>}
      <div className="program-meter">
        <span>方案进度</span>
        <Progress value={status.ratio} />
        <b>{Math.round(status.ratio)}%</b>
      </div>
      {program.required.length > 0 && (
        <ul className="req-list">
          {program.required.map(id => {
            const course = getCourse(id);
            return (
              <li key={id} className={completed.includes(id) ? 'done' : enrolled.includes(id) ? 'now' : ''}>
                <small>{course?.code}</small>
                <span>{course?.title ?? id}</span>
                <em>{courseMark(id)}</em>
              </li>
            );
          })}
        </ul>
      )}
      {upcoming.length > 0 && !term.holiday && <p className="term-note">下一门必修：{upcoming.slice(0, 2).map(course => `${course.code} ${course.title}`).join(' · ')}</p>}
      {!addDrop && !term.holiday && <p className="term-note">学期进行中，不能改选。第 10 周统一结课；假期后第 1 周为下一学期选课周。</p>}
      {enrolled.length > 0 && !term.holiday && (
        <div className="term-roster">
          <small>本学期课表</small>
          <ul className="req-list">
            {enrolled.map(id => {
              const course = getCourse(id);
              return (
                <li key={id} className="now">
                  <small>{course?.code}</small>
                  <span>{course?.title ?? id} · {meetingLabel(course?.meetings ?? [])}</span>
                  <em>准备度 {Math.round(progress[id] ?? 0)}%</em>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {!term.holiday && (
        <>
          <div className={`term-load${load >= SEMESTER_CREDIT_CAP ? ' full' : ''}`}>
            <span>本学期学分</span>
            <Progress value={(load / SEMESTER_CREDIT_CAP) * 100} />
            <b>{load}/{SEMESTER_CREDIT_CAP}</b>
            <em>{load >= SEMESTER_CREDIT_CAP ? '已满' : `还可选 ${SEMESTER_CREDIT_CAP - load}`}</em>
          </div>
          <div className="catalog-tools">
            <label><Search /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="本方案课号 / 课名" /></label>
            {program.kind === 'general' && (
              <div>
                {colleges.map(item => <button key={item.id} className={college === item.id ? 'active' : ''} onClick={() => setCollege(item.id)}>{item.code || '全部'}</button>)}
              </div>
            )}
            <span>{shown.length}/{pool.length}</span>
          </div>
          <div className="table-scroll">
            <table className="record-table">
              <thead>
                <tr>
                  <th>课号</th>
                  <th>课程</th>
                  <th>学分</th>
                  <th>上课</th>
                  <th>费用</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {shown.map(course => {
                  const active = enrolled.includes(course.id);
                  const done = completed.includes(course.id);
                  const reason = enrollLabel(course);
                  const value = progress[course.id] ?? (done ? 100 : 0);
                  const required = program.required.includes(course.id);
                  const estimate = gradeFromProgress(value);
                  const stored = grades[course.id];
                  return (
                    <tr key={course.id} className={`${active ? 'reading' : ''} ${done ? 'finished' : ''}`}>
                      <td className="num">{course.code}</td>
                      <td>
                        <b>{course.title}</b>
                        <div className="row-sub">{required ? '必修 · ' : ''}{course.school} · {course.level === 'advanced' ? '高阶' : course.level === 'core' ? '核心' : '入门'}{course.prereq.length ? ` · 先修 ${course.prereq.map(id => getCourse(id)?.code).join('/')}` : ''} · 《{recommendedBookTitle(course)}》</div>
                      </td>
                      <td className="num">{course.credits}</td>
                      <td className="meet-cell">{meetingLabel(course.meetings)}</td>
                      <td className="num">{course.cost}</td>
                      <td>{done ? `${gpaLetter(stored ?? estimate.gpa)} ${(stored ?? estimate.gpa).toFixed(1)}` : active ? `准备度 ${Math.round(value)}%` : reason || '可选'}</td>
                      <td>
                        {done ? null : active ? (
                          addDrop ? <button onClick={() => onDrop(course.id)}>退课</button> : <span className="route-locked">在读</span>
                        ) : (
                          <button className="primary" disabled={!!reason} onClick={() => onEnroll(course.id, course.cost)}>选课</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      {research && (
        <div className={`research-block ${research.status}`}>
          <div className="research-copy">
            <small>毕业研究</small>
            <h2>{research.title}</h2>
            <p>
              {research.status === 'locked' && (research.lockLabel ?? '未达开题条件')}
              {research.status === 'ready' && research.need}
              {research.status === 'active' && '小屋日程排「创作」计入此项。'}
              {research.status === 'done' && '已提交'}
            </p>
          </div>
          {research.status === 'active' && <div className="program-meter"><span>进度</span><Progress value={research.progress} /><b>{Math.round(research.progress)}%</b></div>}
          {research.status === 'ready' && <button className="primary" onClick={research.onStart} disabled={funds < research.cost}>开题 · 余额 {research.cost}</button>}
        </div>
      )}
      {recordIds.length > 0 && <div className="transcript"><p>成绩单 GPA {gpa.toFixed(2)} · {recordIds.map(id => `${getCourse(id)?.code ?? id} ${gpaLetter(grades[id] ?? 0)}`).join(' · ')}</p></div>}
      <details className="fold">
        <summary>更换培养项目</summary>
        <ProgramSwitcher currentId={program.id} completed={completed} diplomas={diplomas} onDeclare={onDeclare} />
      </details>
    </section>
  );
}

function ProgramSwitcher({ currentId, completed, diplomas, onDeclare }: { currentId: string; completed: string[]; diplomas: Record<string, DiplomaReport>; onDeclare: (id: string) => void }) {
  const [college, setCollege] = useState('all');
  const [kind, setKind] = useState<'all' | StudyProgram['kind']>('all');
  const [settle, setSettle] = useState<'all' | 'open' | 'done'>('all');
  const pool = studyPrograms.filter(item => item.id !== currentId);
  const shown = filterPrograms(pool, college, kind, settle, diplomas);
  return (
    <>
      <ProgramBrowseFilter college={college} onCollege={setCollege} kind={kind} onKind={setKind} settle={settle} onSettle={setSettle} total={pool.length} shown={shown.length} />
      <div className="program-picks compact">
        {shown.map(item => {
          const awarded = programAwarded(item.id, diplomas);
          const ready = programStatus(item, completed, diplomas).complete;
          return (
            <article key={item.id} className={`program-pick${awarded ? ' done' : ''}`}>
              <small>{programKindLabel(item.kind)} · {item.school}</small>
              <h2>{item.title}</h2>
              <p>{programCreditCap(item)} 学分 · 结项 {programCompletionReward(item)}{programResearch(item) ? ` · 研究《${programResearch(item)?.title}》` : ''}{awarded ? ' · 已结项' : ready ? ' · 课业已达' : ''}</p>
              <button disabled={awarded} onClick={() => onDeclare(item.id)}>{awarded ? '已结项' : '改报'}</button>
            </article>
          );
        })}
      </div>
    </>
  );
}
