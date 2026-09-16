'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { achievementById } from './achievements';
import { magicTitleById } from './magic-titles';

export type CelebrateItem = {
  kind: 'achievement' | 'title';
  id: string;
  title: string;
  desc: string;
  reward?: number;
  eyebrow: string;
};

export function celebrateFromAchievements(ids: string[]): CelebrateItem[] {
  return ids.flatMap(id => {
    const def = achievementById(id);
    if (!def) return [];
    const skill = id.startsWith('skill-');
    return [{
      kind: 'achievement' as const,
      id,
      title: def.title,
      desc: skill ? '' : def.desc,
      reward: def.reward,
      eyebrow: skill ? '技能升级' : '里程碑',
    }];
  });
}

export function celebrateFromTitles(ids: string[]): CelebrateItem[] {
  return ids.flatMap(id => {
    const def = magicTitleById(id);
    if (!def) return [];
    return [{
      kind: 'title' as const,
      id,
      title: def.title,
      desc: def.desc,
      reward: def.reward,
      eyebrow: '议席授号',
    }];
  });
}

export function CelebrationModal({ item, onClose }: { item: CelebrateItem; onClose: () => void }) {
  const reward = item.reward ?? 0;
  return (
    <div className="modal-backdrop">
      <dialog className="report-modal celebrate-modal" open aria-labelledby="celebrate-title">
        <button className="close" onClick={onClose} aria-label="关闭"><X /></button>
        <p className="eyebrow">{item.eyebrow}</p>
        <h2 id="celebrate-title">{item.title}</h2>
        {item.desc ? <p className="report-lead">{item.desc}</p> : null}
        {reward > 0 && (
          <div className="report-stats celebrate-reward">
            <div><b>+{reward.toLocaleString()}</b><span>奖励</span></div>
          </div>
        )}
        <footer><Button onClick={onClose} size="lg">收入档案</Button></footer>
      </dialog>
    </div>
  );
}
