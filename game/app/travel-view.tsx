'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  challengeKinds,
  expeditionCatalog,
  expeditionHasCompanion,
  expeditionPayout,
  expeditionStartIssues,
  getExpedition,
  type ChallengeKind,
  type SeasonName,
} from './expedition-catalog';
import { prerequisiteStatus, type ProgressionContext } from './prerequisites';
import { skillById, formatSkillGain } from './skill-catalog';
import { destinationBand, getTravelStay, spanBand, spanLabel, travelCatalog, travelKinds, travelRestFacts, type SpanBand, type TravelKind } from './travel-catalog';

export type OutingReport = {
  mode: 'travel' | 'expedition';
  id: string;
  weeks: number;
  cost: number;
  upkeep: number;
  stayLabel: string;
  reward?: number;
  outcome?: 'success' | 'fail';
  companion?: boolean;
  notes?: string[];
  energy?: number;
  stress?: number;
  health?: number;
  nextEnergy?: number;
  nextStress?: number;
  nextHealth?: number;
};

export function TravelView({
  funds,
  completed,
  expeditions,
  remainingWeeks,
  energy,
  health,
  season,
  context,
  onTravel,
  onExpedition,
  onBack,
}: {
  funds: number;
  completed: number;
  expeditions: number;
  remainingWeeks: number;
  energy: number;
  health: number;
  season: SeasonName;
  context: ProgressionContext;
  onTravel: (id: string, weeks: number) => void;
  onExpedition: (id: string) => void;
  onBack?: () => void;
}) {
  const [mode, setMode] = useState<'度假' | '挑战'>('度假');
  const [travelKind, setTravelKind] = useState<'全部' | TravelKind>('全部');
  const [challengeKind, setChallengeKind] = useState<'全部' | ChallengeKind>('全部');
  const [span, setSpan] = useState<'全部' | SpanBand>('全部');
  const [picked, setPicked] = useState<Record<string, number>>({});
  const trail = mode === '挑战';
  const shown = travelCatalog
    .filter(item => travelKind === '全部' || item.kind === travelKind)
    .filter(item => span === '全部' || destinationBand(item) === span);
  const shownExpeditions = expeditionCatalog
    .filter(route => challengeKind === '全部' || route.kind === challengeKind)
    .filter(route => span === '全部' || spanBand(route.weeks) === span)
    .sort((a, b) => a.weeks - b.weeks);
  return (
    <section className="workspace travel-view catalog-page">
      <div className="page-heading">
        {onBack && <button type="button" className="btn-ghost room-back" onClick={onBack}>返回</button>}
        <h1>车站</h1>
        <p>度假 {completed} · 挑战 {expeditions} · 剩余 {remainingWeeks} 周</p>
      </div>
      <div className="program-filters">
        <div className="catalog-tools">
          <small>出发</small>
          <div>
            {(['度假', '挑战'] as const).map(item => (
              <button key={item} className={mode === item ? 'active' : ''} onClick={() => setMode(item)}>{item}</button>
            ))}
          </div>
        </div>
        <div className="catalog-tools">
          <small>类别</small>
          <div>
            {trail
              ? (['全部', ...challengeKinds] as const).map(item => (
                <button key={item} className={challengeKind === item ? 'active' : ''} onClick={() => setChallengeKind(item)}>{item}</button>
              ))
              : (['全部', ...travelKinds] as const).map(item => (
                <button key={item} className={travelKind === item ? 'active' : ''} onClick={() => setTravelKind(item)}>{item}</button>
              ))}
          </div>
        </div>
        <div className="catalog-tools">
          <small>时长</small>
          <div>
            {(['全部', '短期', '中长期', '长期'] as const).map(item => (
              <button key={item} className={span === item ? 'active' : ''} onClick={() => setSpan(item)}>{item}</button>
            ))}
          </div>
          <span>{trail ? shownExpeditions.length : shown.length}</span>
        </div>
      </div>
      {!trail ? (
        <div className="trip-grid">
          {shown.map(dest => {
            const Icon = dest.icon;
            const gate = prerequisiteStatus(dest.prerequisites, context);
            const weeks = picked[dest.id] ?? dest.stays[0].weeks;
            const stay = getTravelStay(dest, weeks) ?? dest.stays[0];
            const timeOk = stay.weeks <= remainingWeeks;
            const affordable = funds >= stay.cost;
            const ready = gate.unlocked && affordable && timeOk;
            const practice = dest.skill?.map(item => `${skillById[item.id].title} ${formatSkillGain(item.amount)}`).join(' · ');
            const rest = travelRestFacts(dest, season, stay.weeks);
            return (
              <article className={`trip-card ${gate.unlocked ? '' : 'locked'}`} key={dest.id}>
                <header>
                  <div className="trip-icon"><Icon /></div>
                  <span>{dest.kind} · {destinationBand(dest)}{dest.seasonBonus ? ` · ${dest.seasonBonus.season}季更好` : ''}</span>
                </header>
                <h2>{dest.title}</h2>
                <p>{dest.desc}</p>
                {rest ? <p className="trip-facts">放松：{rest}</p> : null}
                {practice ? <p className="trip-facts">顺带：每周 {practice}</p> : null}
                <div className="travel-stays" role="group" aria-label="停留时长">
                  {dest.stays.map(option => (
                    <button
                      key={option.weeks}
                      type="button"
                      className={stay.weeks === option.weeks ? 'active' : ''}
                      onClick={() => setPicked(current => ({ ...current, [dest.id]: option.weeks }))}
                    >
                      {option.label}<b>{option.cost}</b>
                    </button>
                  ))}
                </div>
                {!gate.unlocked && <p className="trip-lock">解锁：{gate.missing.join('；')}</p>}
                <footer>
                  <div>
                    <b>{stay.cost}</b>
                    <small>{!gate.unlocked ? '路线未开放' : !timeOk ? '驻留期不够' : affordable ? `${stay.label} · 可支付` : '余额不足'}</small>
                  </div>
                  <Button disabled={!ready} onClick={() => onTravel(dest.id, stay.weeks)}>出发</Button>
                </footer>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="trip-grid">
          {shownExpeditions.map(route => {
            const Icon = route.icon;
            const issues = expeditionStartIssues(route, { funds, remainingWeeks, energy, health, sociability: context.sociability, season, context });
            const ready = issues.length === 0;
            const companion = expeditionHasCompanion(route, context.sociability);
            const pay = expeditionPayout(route, true, companion);
            return (
              <article className={`trip-card ${ready ? '' : 'locked'}`} key={route.id}>
                <header>
                  <div className="trip-icon"><Icon /></div>
                  <span>{route.kind === '创作' ? skillById[route.skillId].title : route.kind} · {spanLabel(route.weeks)}</span>
                </header>
                <h2>{route.title}</h2>
                <p>{route.desc}</p>
                <p className="trip-facts">沿途：{route.purpose} · 装备 {route.gearCost} · 完成奖励 {pay}{route.companionRequired || companion ? (companion ? ' · 有同伴' : ' · 需同伴') : ' · 可独行'}{route.season ? ` · ${route.season}季` : ''}</p>
                {issues.length > 0 && <p className="trip-lock">出发：{issues.join('；')}</p>}
                <footer>
                  <div>
                    <b>{route.gearCost}</b>
                    <small>{ready ? `${route.rewardLabel} +${pay}` : '尚未可出发'}</small>
                  </div>
                  <Button disabled={!ready} onClick={() => onExpedition(route.id)}>启程</Button>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function TravelReport({
  report,
  onClose,
}: {
  report: OutingReport;
  onClose: () => void;
}) {
  if (report.mode === 'expedition') {
    const route = getExpedition(report.id);
    return (
      <div className="modal-backdrop">
        <dialog className="report-modal travel-report" open aria-labelledby="travel-title">
          <button className="close" onClick={onClose} aria-label="关闭"><X /></button>
          <p className="eyebrow">{report.outcome === 'fail' ? `${route.kind}中止` : `${route.kind}回执`} · {report.stayLabel}</p>
          <h2 id="travel-title">{route.title}</h2>
          <p className="report-lead">
            {route.scene} {report.companion ? '有同伴陪同。' : route.kind === '徒步' ? '独行。' : '独自参加。'}
            {report.outcome === 'fail' ? ` 第 ${report.weeks} 周不得不中止，获得返程援助 ${report.reward ?? 0}。` : ` 完成 ${report.weeks} 周。${route.impact}。${route.rewardLabel} ${report.reward ?? 0}。`}
            装备 {report.cost}，期间宅维护 {report.upkeep}。
          </p>
          {report.notes?.length ? <ol>{report.notes.map(note => <li key={note}>{note}</li>)}</ol> : null}
          <div className="report-stats">
            <div><b>{report.weeks}</b><span>周</span></div>
            <div><b>{report.cost}</b><span>装备</span></div>
            <div><b>{report.reward ?? 0}</b><span>{report.outcome === 'fail' ? '返程援助' : route.rewardLabel}</span></div>
          </div>
          <footer><Button onClick={onClose} size="lg">关闭</Button></footer>
        </dialog>
      </div>
    );
  }
  const dest = travelCatalog.find(item => item.id === report.id) ?? travelCatalog[0];
  return (
    <div className="modal-backdrop">
      <dialog className="report-modal travel-report" open aria-labelledby="travel-title">
        <button className="close" onClick={onClose} aria-label="关闭"><X /></button>
        <p className="eyebrow">出行回执 · {report.stayLabel}</p>
        <h2 id="travel-title">{dest.title}</h2>
        <p className="report-lead">
          {dest.scene} 独行 {report.weeks} 周。票价 {report.cost}，期间宅维护 {report.upkeep}。
          {report.nextEnergy != null ? ` 回来时精力 ${Math.round(report.energy ?? 0)}→${Math.round(report.nextEnergy)}，压力 ${Math.round(report.stress ?? 0)}→${Math.round(report.nextStress ?? 0)}，体能 ${Math.round(report.health ?? 0)}→${Math.round(report.nextHealth ?? 0)}。` : ''}
        </p>
        <div className="report-stats">
          <div><b>{report.weeks}</b><span>周</span></div>
          <div><b>{report.cost}</b><span>票价</span></div>
          <div><b>{report.upkeep}</b><span>宅维护</span></div>
        </div>
        <footer><Button onClick={onClose} size="lg">关闭</Button></footer>
      </dialog>
    </div>
  );
}
