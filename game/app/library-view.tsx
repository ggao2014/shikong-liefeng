'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { BookCategory, BookDefinition, bookCategories, books, bookUnlockStatus } from './library-catalog';
import { type ProgressionContext } from './prerequisites';

export function LibraryView({
  progress,
  borrowed,
  week,
  context,
  borrowLimit,
  onBorrow,
  onReturn,
  onBack,
}: {
  progress: Record<string, number>;
  borrowed: string[];
  week: number;
  context: ProgressionContext;
  borrowLimit: number;
  onBorrow: (id: string) => void;
  onReturn: (id: string) => void;
  onBack?: () => void;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'全部' | BookCategory>('全部');
  const [origin, setOrigin] = useState<'全部' | 'reality' | 'reserve'>('全部');
  const [shelf, setShelf] = useState<'全部' | 'read' | 'held' | 'unread'>('全部');
  const recommendation = books[(Math.max(1, week) - 1) % books.length];
  const finished = books.filter(book => (progress[book.id] ?? 0) >= 100).length;
  const full = borrowed.length >= borrowLimit;
  const shown = useMemo(() => books.filter(book => {
    const value = progress[book.id] ?? 0;
    const held = borrowed.includes(book.id);
    const haystack = `${book.title}${book.author}${book.nodes.join('')}${book.blurb}`;
    const shelfOk = shelf === '全部'
      || (shelf === 'read' && value >= 100)
      || (shelf === 'held' && held)
      || (shelf === 'unread' && value < 100 && !held);
    return (!query || haystack.includes(query))
      && (category === '全部' || book.category === category)
      && (origin === '全部' || book.origin === origin)
      && shelfOk;
  }), [query, category, origin, shelf, progress, borrowed]);

  function action(book: BookDefinition) {
    const held = borrowed.includes(book.id);
    if (held) onReturn(book.id);
    else if (!full && bookUnlockStatus(book, context).unlocked) onBorrow(book.id);
  }

  return (
    <section className="workspace catalog-page library-view">
      <div className="page-heading">
        {onBack && <button type="button" className="btn-ghost room-back" onClick={onBack}>返回</button>}
        <h1>中央图书馆</h1>
        <p>馆藏 {books.length} · 结档 {finished} · 在借 {borrowed.length}/{borrowLimit} · 荐 {recommendation.title}</p>
      </div>
      <div className="catalog-tools">
        <label><Search /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="题名 / 作者 / 节点" /></label>
        <div>
          {bookCategories.map(item => <button key={`cat-${item}`} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <div>
          <small>来源</small>
          {([['全部', '全部'], ['reserve', '保护区'], ['reality', '现实']] as const).map(([id, label]) => (
            <button key={`origin-${id}`} className={origin === id ? 'active' : ''} onClick={() => setOrigin(id)}>{label}</button>
          ))}
        </div>
        <div>
          <small>进度</small>
          {([['全部', '全部'], ['read', '已读'], ['held', '在借中'], ['unread', '未读']] as const).map(([id, label]) => (
            <button key={`shelf-${id}`} className={shelf === id ? 'active' : ''} onClick={() => setShelf(id)}>{label}</button>
          ))}
        </div>
        <span>{shown.length}/{books.length}</span>
      </div>
      <div className="table-scroll">
        <table className="record-table">
          <thead>
            <tr>
              <th>题名</th>
              <th>作者</th>
              <th>类</th>
              <th>来源</th>
              <th>难</th>
              <th>进度</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(book => {
              const value = progress[book.id] ?? 0;
              const held = borrowed.includes(book.id);
              const gate = bookUnlockStatus(book, context);
              const label = held ? '归还' : !gate.unlocked ? '未解锁' : full ? '已满' : value >= 100 ? '再借' : '借阅';
              return (
                <tr key={book.id} className={`${held ? 'reading' : ''} ${value >= 100 ? 'finished' : ''} ${!gate.unlocked && !held ? 'locked' : ''}`}>
                  <td>
                    <b>{book.title}</b>
                    <div className="row-sub">{book.nodes.join(' · ')}</div>
                  </td>
                  <td>{book.author}</td>
                  <td>{book.category}{!gate.unlocked && <div className="row-sub">{gate.missing.join('；')}</div>}</td>
                  <td>{book.origin === 'reserve' ? '保护区' : '现实'}</td>
                  <td className="num">{book.difficulty}</td>
                  <td>
                    <span className="progress-cell">
                      <span className="progress-mini" aria-label={`${Math.round(value)}%`}><i style={{ width: `${value}%` }} /></span>
                      <span className="num">{Math.round(value)}</span>
                    </span>
                  </td>
                  <td>
                    <button className={held ? 'primary' : ''} disabled={!held && (full||!gate.unlocked)} onClick={() => action(book)}>{label}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {shown.length === 0 && <div className="empty-catalog"><p>无匹配条目。</p></div>}
      </div>
    </section>
  );
}
