'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { prerequisiteStatus, type Prerequisite, type ProgressionContext } from './prerequisites';

export const townPeople = [
  { id: 'erin', name: '艾琳', initial: '艾', role: '馆员', place: '中央图书馆' },
  { id: 'noah', name: '诺亚', initial: '诺', role: '教授', place: '榛木镇大学' },
  { id: 'lian', name: '连舟', initial: '连', role: '向导', place: '车站' },
];

export type GatheringDefinition = {
  id: string;
  title: string;
  desc: string;
  cost: number;
  indoor: boolean;
  prerequisites: Prerequisite[];
};

export const gatherings: GatheringDefinition[] = [
  { id: 'meal', title: '聚餐', desc: '一顿不赶时间的晚饭。材料按周计，来不齐也已备好。', cost: 40, indoor: true, prerequisites: [{ kind: 'social', value: 25, label: '社交度达到 25' }] },
  { id: 'board', title: '桌游', desc: '一副牌或一盒棋，不必分出胜负。', cost: 16, indoor: true, prerequisites: [{ kind: 'social', value: 15, label: '社交度达到 15' }] },
  { id: 'tea', title: '茶叙', desc: '茶和一段可以中断的谈话。', cost: 12, indoor: true, prerequisites: [] },
  { id: 'walk', title: '散步', desc: '沿河或绕镇走一圈，话说到哪算哪。', cost: 0, indoor: false, prerequisites: [] },
  { id: 'read', title: '共读', desc: '同桌各看各的，或同读一小段。', cost: 0, indoor: true, prerequisites: [{ kind: 'finishedBooks', value: 1, label: '读完 1 本书' }] },
];

export function gatheringUnlockStatus(gathering: GatheringDefinition, context: ProgressionContext) {
  return prerequisiteStatus(gathering.prerequisites, context);
}

export const STARTER_SOCIABILITY = 18;

export function getGathering(id: string) {
  return gatherings.find(item => item.id === id) ?? gatherings[2];
}

export function clampSocial(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function hydrateSociability(saved: { sociability?: unknown; friendship?: unknown }) {
  if (typeof saved.sociability === 'number') return clampSocial(saved.sociability);
  if (typeof saved.friendship === 'number') return clampSocial(saved.friendship);
  return STARTER_SOCIABILITY;
}

export function gatheringGuests(sociability: number, week: number, kind: string, weather: string, indoor: boolean) {
  const expected = sociability / 16;
  let hash = (week + 7) * 374761393;
  for (let i = 0; i < kind.length; i += 1) hash = Math.imul(hash ^ kind.charCodeAt(i), 1103515245);
  const roll = ((hash >>> 0) % 21) / 10 - 1;
  let weatherMod = 0;
  if (!indoor && (weather.includes('雨') || weather.includes('雪'))) weatherMod = -1;
  if (indoor && weather.includes('雨')) weatherMod = 0.4;
  return Math.max(0, Math.min(8, Math.round(expected + roll + weatherMod)));
}

export function socialWeekGain(input: {
  socialSlots: number;
  guests: number;
  passedCourses: number;
  newCertificates: number;
  newDegrees: number;
  festivalSocial: boolean;
  leisureSocial?: number;
  skillSocial?: number;
}) {
  let gain = 0;
  if (input.socialSlots > 0) gain += Math.min(4, 1 + Math.min(3, input.socialSlots) + (input.guests > 0 ? 1 : 0));
  gain += input.passedCourses * 4;
  gain += input.newCertificates * 6;
  gain += input.newDegrees * 10;
  if (input.festivalSocial) gain += 3;
  if (input.leisureSocial) gain += Math.min(3, input.leisureSocial);
  if (input.skillSocial) gain += Math.min(3, input.skillSocial);
  return gain;
}

export function socialAfterWeek(current: number, idle: number, gain: number) {
  if (gain > 0) return { sociability: clampSocial(current + gain), idle: 0 };
  const nextIdle = idle + 1;
  const decay = nextIdle >= 2 ? Math.min(4, nextIdle) : 0;
  return { sociability: clampSocial(current - decay), idle: nextIdle };
}

export function CompanyBar({
  pendingInvite,
  onAccept,
  onDecline,
}: {
  pendingInvite: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  if (!pendingInvite) return null;
  return (
    <section className="company-bar">
      {/* TODO: 森林调查邀请已在 page.tsx 用 ENABLE_FOREST_INVITE 关掉，后续再实现转车站订票与驳回。 */}
      <div className="invite-card">
        <div className="letter-icon"><MessageCircle /></div>
        <div>
          <small>待办</small>
          <h2>森林调查 · 艾琳</h2>
          <p>可接受并转车站订票，或驳回。</p>
        </div>
        <div className="invite-actions">
          <Button variant="outline" onClick={onDecline}>驳回</Button>
          <Button onClick={onAccept}>转车站</Button>
        </div>
      </div>
    </section>
  );
}
