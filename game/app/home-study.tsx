'use client';

import { useMemo, useState } from 'react';
import { DiplomaCertificate } from './academic-modals';
import { CREATIVE_SKILL_IDS, type ActiveWork, type ArchivedWork } from './creative-works';
import { books } from './library-catalog';
import { magicTitleCatalog } from './magic-titles';
import { skillById } from './skill-catalog';
import { diplomaDocumentTitle, diplomaKindLabelOf, type DiplomaReport } from './university-catalog';

type StudyTab = 'books' | 'works' | 'diplomas' | 'titles';

export function HomeStudyView({
  progress,
  borrowed,
  works,
  activeWorks,
  diplomas,
  magicTitles,
  equippedMagicTitle,
  onEquipTitle,
  onBack,
}: {
  progress: Record<string, number>;
  borrowed: string[];
  works: ArchivedWork[];
  activeWorks: Partial<Record<string, ActiveWork>>;
  diplomas: Record<string, DiplomaReport>;
  magicTitles: string[];
  equippedMagicTitle: string;
  onEquipTitle: (id: string) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<StudyTab>('books');
  const [openDiploma, setOpenDiploma] = useState<string | null>(null);
  const held = useMemo(() => books.filter(book => borrowed.includes(book.id)), [borrowed]);
  const read = useMemo(() => books.filter(book => (progress[book.id] ?? 0) >= 100), [progress]);
  const diplomaList = useMemo(() => Object.values(diplomas).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    if (a.weekOfYear !== b.weekOfYear) return b.weekOfYear - a.weekOfYear;
    return a.title.localeCompare(b.title, 'zh-CN');
  }), [diplomas]);
  const ownedTitles = useMemo(
    () => magicTitleCatalog.filter(item => magicTitles.includes(item.id)),
    [magicTitles],
  );
  return (
    <section className="workspace home-study">
      <div className="page-heading">
        <button type="button" className="btn-ghost room-back" onClick={onBack}>返回</button>
        <h1>藏书室</h1>
        <p>已读 {read.length} · 在借 {held.length} · 作品 {works.length} · 证书 {diplomaList.length} · 封号 {ownedTitles.length}</p>
      </div>
      <div className="study-tabs" role="tablist" aria-label="藏书室">
        <button type="button" role="tab" aria-selected={tab === 'books'} className={tab === 'books' ? 'active' : ''} onClick={() => setTab('books')}>书籍</button>
        <button type="button" role="tab" aria-selected={tab === 'works'} className={tab === 'works' ? 'active' : ''} onClick={() => setTab('works')}>作品档</button>
        <button type="button" role="tab" aria-selected={tab === 'diplomas'} className={tab === 'diplomas' ? 'active' : ''} onClick={() => setTab('diplomas')}>学历证书</button>
        <button type="button" role="tab" aria-selected={tab === 'titles'} className={tab === 'titles' ? 'active' : ''} onClick={() => setTab('titles')}>议席封号</button>
      </div>
      {tab === 'books' && (
        <div className="study-pane">
          <section className="study-shelf">
            <div className="section-title"><div><h2>借阅中</h2></div><span>{held.length}</span></div>
            {held.length ? (
              <ul className="study-book-list">
                {held.map(book => {
                  const value = progress[book.id] ?? 0;
                  return (
                    <li key={book.id}>
                      <b>{book.title}</b>
                      <span>{book.author} · {book.category}</span>
                      <em>{value >= 100 ? '已读完，尚未归还' : `进度 ${Math.round(value)}%`}</em>
                    </li>
                  );
                })}
              </ul>
            ) : <p className="empty-catalog">镇图书馆没有在借的书。</p>}
          </section>
          <section className="study-shelf">
            <div className="section-title"><div><h2>已经读过</h2></div><span>{read.length}</span></div>
            {read.length ? (
              <ul className="study-book-list">
                {read.map(book => (
                  <li key={book.id}>
                    <b>{book.title}</b>
                    <span>{book.author} · {book.category}</span>
                    <em>{borrowed.includes(book.id) ? '在借' : '已结档'}</em>
                  </li>
                ))}
              </ul>
            ) : <p className="empty-catalog">还没有读完的书。</p>}
          </section>
        </div>
      )}
      {tab === 'works' && (
        <section className="study-pane works-section">
          {CREATIVE_SKILL_IDS.some(id => activeWorks[id]) && (
            <ul className="works-active">
              {CREATIVE_SKILL_IDS.map(id => {
                const work = activeWorks[id];
                if (!work) return null;
                return <li key={id}><b>{skillById[id].title}</b><span>《{work.title}》 {work.progress}/{work.slots} 时段</span></li>;
              })}
            </ul>
          )}
          {works.length > 0 ? (
            <div className="works-list">{works.map(work => (
              <article key={work.id}>
                <small>Y{Math.floor((work.week - 1) / 52) + 1} W{((work.week - 1) % 52) + 1} · {skillById[work.skillId].title}</small>
                <h3>《{work.title}》</h3>
                <p>{work.formTitle} · {work.lengthLabel} · {work.slots} 时段{work.reward ? ` · 完成奖励 ${work.reward}` : ''}</p>
              </article>
            ))}</div>
          ) : !CREATIVE_SKILL_IDS.some(id => activeWorks[id]) && <p className="empty-catalog">还没有收入作品档的创作。</p>}
        </section>
      )}
      {tab === 'diplomas' && (
        <section className="study-pane study-diplomas">
          {diplomaList.length ? (
            <ul className="study-diploma-list">
              {diplomaList.map(report => {
                const open = openDiploma === report.programId;
                return (
                  <li key={report.programId} className={open ? 'open' : ''}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenDiploma(open ? null : report.programId)}
                    >
                      <b>{report.title}</b>
                      <span>{report.school} · {diplomaKindLabelOf(report)} · 第{report.year}学年 {report.termName}</span>
                      <em>{diplomaDocumentTitle(report)}</em>
                    </button>
                    {open && <DiplomaCertificate report={report} />}
                  </li>
                );
              })}
            </ul>
          ) : <p className="empty-catalog">还没有结业或毕业证书。大学或星穹秘法学院结项后会收入这里。</p>}
        </section>
      )}
      {tab === 'titles' && (
        <section className="study-pane study-titles">
          <p className="study-title-hint">按秘法项目组合由星穹议席授号。可佩戴一枚，显示在档案顶栏。</p>
          {ownedTitles.length ? (
            <ul className="study-title-list">
              {ownedTitles.map(item => {
                const equipped = equippedMagicTitle === item.id;
                return (
                  <li key={item.id} className={equipped ? 'equipped' : ''}>
                    <div>
                      <b>{item.title}</b>
                      <span>{item.desc}</span>
                      <em>授号奖励 {item.reward.toLocaleString()}</em>
                    </div>
                    <button type="button" onClick={() => onEquipTitle(equipped ? '' : item.id)}>
                      {equipped ? '取消佩戴' : '佩戴'}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : <p className="empty-catalog">还没有议席封号。完成特定秘法培养组合后会授予。</p>}
          <details className="study-title-catalog">
            <summary>全部封号一览（{magicTitleCatalog.length}）</summary>
            <ul>
              {magicTitleCatalog.map(item => {
                const owned = magicTitles.includes(item.id);
                return (
                  <li key={item.id} className={owned ? 'owned' : ''}>
                    <b>{item.title}</b>
                    <span>{item.desc}</span>
                    <em>{owned ? '已获得' : `奖励 ${item.reward.toLocaleString()}`}</em>
                  </li>
                );
              })}
            </ul>
          </details>
        </section>
      )}
    </section>
  );
}
