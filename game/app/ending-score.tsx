'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type EndingScoreInput = {
  duration: number;
  funds: number;
  finishedBooks: number;
  completedCourses: number;
  diplomas: number;
  completedProjects: number;
  works: number;
  averageSkill: number;
  sociability: number;
  memories: number;
  festivalMemories: number;
  travels: number;
  expeditions: number;
  houseLevel: number;
  energy: number;
  stress: number;
  health: number;
  cleanliness: number;
  grounds: number;
};

type EndingDimension = { key: string; label: string; score: number; note: string };
export type EndingScore = {
  total: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  title: string;
  summary: string;
  dimensions: EndingDimension[];
};

const cap = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function calculateEndingScore(input: EndingScoreInput): EndingScore {
  const dimensions: EndingDimension[] = [
    {
      key: 'knowledge', label: '求知',
      score: cap(input.finishedBooks * 9 + input.completedCourses * 7 + input.diplomas * 22 + input.completedProjects * 8),
      note: `${input.finishedBooks} 本书 · ${input.completedCourses} 门课 · ${input.diplomas} 项学业结项`,
    },
    {
      key: 'creation', label: '创造',
      score: cap(input.works * 15 + input.completedProjects * 13 + input.averageSkill * .45),
      note: `${input.works} 件作品 · ${input.completedProjects} 项课题 · 技能均值 ${Math.round(input.averageSkill)}`,
    },
    {
      key: 'community', label: '联结',
      score: cap(input.sociability * .58 + input.memories * 3 + input.festivalMemories * 4),
      note: `社交度 ${Math.round(input.sociability)} · ${input.memories} 段记忆 · ${input.festivalMemories} 次节庆`,
    },
    {
      key: 'horizon', label: '远行',
      score: cap(input.travels * 10 + input.expeditions * 18 + input.festivalMemories * 2),
      note: `${input.travels} 次出行 · ${input.expeditions} 次考察`,
    },
    {
      key: 'stewardship', label: '安居',
      score: cap(input.houseLevel * 6 + (input.energy + input.health + (100 - input.stress) + input.cleanliness + input.grounds) / 10 + Math.log10(Math.max(1, input.funds)) * 4),
      note: `Lv.${input.houseLevel} 地产 · 余额 ${input.funds.toLocaleString()} · 身心与居所`,
    },
  ];
  const total = cap(dimensions.reduce((sum, item) => sum + item.score, 0) / dimensions.length);
  const grade = total >= 90 ? 'S' : total >= 78 ? 'A' : total >= 64 ? 'B' : total >= 48 ? 'C' : 'D';
  const strongest = [...dimensions].sort((a, b) => b.score - a.score).slice(0, 2);
  const titleByKey: Record<string, string> = {
    knowledge: '群书之间的漫游者', creation: '留下作品的人', community: '榛木镇的老朋友',
    horizon: '地平线的追随者', stewardship: '岁月的守屋人',
  };
  const title = strongest[0].score === strongest[1].score
    ? '生活的多面记录者'
    : titleByKey[strongest[0].key];
  const summary = `在 ${input.duration} 年的驻留里，你把最多的时间留给了${strongest[0].label}，也让${strongest[1].label}成为生活清晰的侧影。这里没有唯一的完美人生；这份评分只记录你走过的形状。`;
  return { total, grade, title, summary, dimensions };
}

export function EndingScoreModal({ input, onClose }: { input: EndingScoreInput; onClose: () => void }) {
  const result = calculateEndingScore(input);
  return (
    <div className="modal-backdrop ending-score-backdrop">
      <dialog className="ending-score-modal" open aria-labelledby="ending-score-title">
        <button className="close" onClick={onClose} aria-label="关闭"><X /></button>
        <p className="eyebrow">HZ-LF · 最终归档评估</p>
        <div className="ending-score-hero">
          <div className="ending-grade"><b>{result.grade}</b><span>{result.total}</span></div>
          <div><small>{input.duration} 年驻留称号</small><h2 id="ending-score-title">{result.title}</h2><p>{result.summary}</p></div>
        </div>
        <div className="ending-dimensions">
          {result.dimensions.map(item => (
            <article key={item.key}>
              <header><b>{item.label}</b><span>{item.score}</span></header>
              <div><i style={{ width: `${item.score}%` }} /></div>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
        <p className="ending-score-note">总评分为五项生活维度的等权记录，不因选择更长驻留期而加分。</p>
        <footer><Button onClick={onClose}>收入档案</Button></footer>
      </dialog>
    </div>
  );
}
