'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { X } from 'lucide-react';
import {
  activeHouseEffects,
  cleanlinessHint,
  estateImageAt,
  estatePlot,
  houseTierAt,
  householdEffects,
  nextHouseTier,
  originalHousePlaque,
  staffCatalog,
  staffingSummary,
  type HouseTier,
  type StewardAction,
  type StewardProposal,
} from './home-catalog';
import { prerequisiteStatus, type ProgressionContext } from './prerequisites';

export function HomeView({
  funds,
  houseLevel,
  rooms,
  staff,
  originalHouseYear,
  cleanliness,
  grounds,
  context,
  compact,
  onUpgrade,
  onHire,
  onFire,
}: {
  funds: number;
  houseLevel: number;
  rooms: string[];
  staff: string[];
  originalHouseYear: number;
  cleanliness: number;
  grounds: number;
  context: ProgressionContext;
  compact?: boolean;
  onUpgrade: (cost: number) => void;
  onHire: (id: string, cost: number) => void;
  onFire: (id: string) => void;
}) {
  const house = householdEffects(rooms, staff, houseLevel, { cleanliness, grounds });
  const effects = activeHouseEffects(rooms, staff, houseLevel);
  const current = houseTierAt(houseLevel);
  const next = nextHouseTier(houseLevel);
  const CurrentIcon = current.icon;
  const NextIcon = next?.icon;
  const currentImage = estateImageAt(current.level);
  const nextImage = next ? estateImageAt(next.level) : currentImage;
  const plaque = houseLevel >= 7 ? originalHousePlaque(originalHouseYear || 1) : '';
  const roster = staffingSummary(staff, houseLevel, rooms);
  const stewardOn = (roster.find(item => item.id === 'steward')?.have ?? 0) > 0;
  const understaffed = roster.filter(item => item.need > item.have);
  const ownedPlots = estatePlot.filter(cell => houseLevel >= cell.from);
  return (
    <section className="home-view">
      {compact ? null : <header className="estate-command">
        <div className="estate-identity"><img src={currentImage} alt={`${current.name}地产俯瞰图`}/><span><small>当前地产 · Lv.{current.level}</small><h2>{current.name}</h2><p>{current.sqft} · {current.acres}</p></span></div>
        <div className="estate-stats"><span><small>周维护</small><b>{house.upkeep}</b></span><span className={cleanliness<35?'alert':''} data-tip={cleanlinessHint(cleanliness)}><small>清洁</small><b>{Math.round(cleanliness)}</b></span><span className={grounds<35?'alert':''}><small>园景</small><b>{Math.round(grounds)}</b></span><span><small>雇员</small><b>{staff.length}</b></span><span className={houseLevel<=0?'alert':''}><small>休息回复</small><b>{house.restEnergy.toFixed(1)}</b></span><span className={houseLevel<=0?'alert':''}><small>庇护</small><b>{house.shelterHealth>0?`+${house.shelterHealth}`:`${house.shelterHealth}`}</b></span></div>
      </header>}
      <div className="estate-actions">
        <section className="next-estate"><div className="section-title"><div><h2>{next?'下一次扩建':'地产已满级'}</h2></div><span>{next?`Lv.${next.level}`:'最终形态'}</span></div>{next?<article><div className="upgrade-preview"><img src={nextImage} alt={`${next.name}升级预览`}/><span>{NextIcon?<NextIcon/>:null}</span></div><div className="upgrade-copy"><h3>{next.name}</h3><p>{next.summary}</p><div className="upgrade-facts"><span>{next.sqft}</span><span>{next.acres}</span><span>维护 {current.weekly} → {next.weekly}</span><span>休息回复 {current.restEnergy} → {next.restEnergy}</span></div><p className="unlock-preview">解锁：{[...next.house,...next.grounds].slice(0,5).join(' · ')}</p></div><div className="upgrade-action"><b>{next.cost}</b><Button disabled={funds<next.cost} onClick={()=>onUpgrade(next.cost)}>{funds<next.cost?`还差 ${next.cost-funds}`:'升级'}</Button></div></article>:<article className="complete"><div className="upgrade-preview"><img src={currentImage} alt="终极领土俯瞰图"/><span><CurrentIcon/></span></div><div><h3>终极领土</h3><p>全部地产阶段已完成。</p></div><b>满级</b></article>}</section>
        <section className="estate-attention"><div className="section-title"><div><h2>当前待办</h2></div><span>{understaffed.length}</span></div>{understaffed.length?<ul>{understaffed.map(item=><li key={item.id}><b>{item.name}</b><span>{item.have}/{item.need}</span><em>缺 {item.need-item.have}</em></li>)}</ul>:<p className="all-covered">当前人手满足地产需要。</p>}<p>{stewardOn?'结算时管家会提交雇人、辞退方案，由你审核。':'雇用管家后，可在结算时审核人手调整。'}</p></section>
      </div>
      <div className="home-sections">
        <section>
          <details className="estate-details"><summary>地块与建筑 <span>{ownedPlots.length}</span></summary><div className="house-plot" aria-label="地产平面">{ownedPlots.map(cell=><div key={cell.id} className="plot-cell"><b>{cell.name}</b></div>)}</div></details>
          <details className="estate-details"><summary>已生效的住宅效果 <span>{effects.length}</span></summary><ul className="estate-effects">{effects.map(line=><li key={line}>{line}</li>)}</ul>{plaque?<p className="estate-plaque">{plaque}</p>:null}</details>
        </section>
        <section>
          <details className="estate-details"><summary>雇员管理 <span>{staff.length}</span></summary>
          <div className="staff-grid">{staffCatalog.map(person => {
            const Icon = person.icon;
            const row = roster.find(item => item.id === person.id);
            const count = row?.have ?? 0;
            const need = row?.need ?? 0;
            const gate = prerequisiteStatus(person.prerequisites, context);
            return (
              <article key={person.id} className={count ? 'hired' : ''}>
                <Icon />
                <div>
                  <h3>{person.name}<span className={count>=need&&count?'staff-ok':''}>{count?`${count} 人`:'未雇'}</span></h3>
                  <p>{person.effect}</p>
                  <small>{gate.unlocked?(need?`配置 ${count}/${need} · 周薪 ${person.weekly}/人`:`周薪 ${person.weekly}/人`):`解锁：${gate.missing.join('；')}`}</small>
                </div>
                <div className="staff-buttons">
                  {count>0?<Button variant="outline" onClick={()=>onFire(person.id)}>−</Button>:null}
                  <Button variant="outline" disabled={!gate.unlocked||funds<person.cost} onClick={()=>onHire(person.id,person.cost)}>＋ {person.cost}</Button>
                </div>
              </article>
            );
          })}</div>
          </details>
        </section>
      </div>
    </section>
  );
}

export function HouseUpgradeModal({ from, to, onClose }: { from: HouseTier; to: HouseTier; onClose: () => void }) {
  const unlocks = [...to.house, ...to.grounds];
  return (
    <div className="modal-backdrop">
      <dialog className="report-modal house-upgrade-modal" open aria-labelledby="house-upgrade-title">
        <button className="close" onClick={onClose} aria-label="关闭"><X /></button>
        <p className="eyebrow">{to.level === 1 ? '落成' : '扩建入档'} · Lv.{from.level} → Lv.{to.level}</p>
        <h2 id="house-upgrade-title">{to.name}</h2>
        <div className="house-upgrade-hero"><img src={estateImageAt(to.level)} alt={`${to.name}俯瞰`} /></div>
        <p className="report-lead">{to.summary}</p>
        {unlocks.length > 0 && <p className="report-lead">解锁：{unlocks.slice(0, 8).join(' · ')}</p>}
        <div className="report-stats">
          <div><b>{from.name}</b><span>此前</span></div>
          <div><b>{to.name}</b><span>现在</span></div>
          <div><b>{from.weekly}→{to.weekly}</b><span>周维护</span></div>
        </div>
        <footer><Button onClick={onClose} size="lg">收入档案</Button></footer>
      </dialog>
    </div>
  );
}

export function StewardReviewModal({
  proposal,
  funds,
  onCancel,
  onResolve,
}: {
  proposal: StewardProposal;
  funds: number;
  onCancel: () => void;
  onResolve: (approved: StewardAction[]) => void;
}) {
  const [picked, setPicked] = useState(() => new Set(proposal.actions.map(action => action.key)));
  const selected = proposal.actions.filter(action => picked.has(action.key));
  const hireCost = selected.reduce((sum, action) => sum + action.cost, 0);
  const hires = selected.filter(action => action.kind === 'hire').length;
  const fires = selected.filter(action => action.kind === 'fire').length;
  function toggle(key: string) {
    setPicked(current => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }
  return (
    <div className="modal-backdrop">
      <dialog className="report-modal steward-review-modal" open aria-labelledby="steward-review-title">
        <button className="close" onClick={onCancel} aria-label="取消结算"><X /></button>
        <p className="eyebrow">管家呈报</p>
        <h2 id="steward-review-title">审核人手调整</h2>
        <p className="report-lead">点选要执行的条目。关闭窗口则取消本周结算。</p>
        <div className="report-stats">
          <div><b>{funds.toLocaleString()}</b><span>当前余额</span></div>
          <div><b>{hireCost ? `−${hireCost}` : 0}</b><span>所选签约</span></div>
          <div><b>{hires}/{fires}</b><span>雇 / 辞</span></div>
        </div>
        <ul className="steward-review-list">
          {proposal.actions.map(action => {
            const on = picked.has(action.key);
            return (
              <li key={action.key}>
                <button type="button" className={on ? 'on' : ''} onClick={() => toggle(action.key)} aria-pressed={on}>
                  <b>{action.kind === 'hire' ? '雇佣' : '辞退'} {action.name}</b>
                  <span>{action.reason}</span>
                  <em>{action.kind === 'hire' ? `签约 ${action.cost} · 周薪 ${action.weekly}` : `周薪 ${action.weekly}`}</em>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="steward-review-actions">
          <Button variant="outline" onClick={() => onResolve([])}>暂不调整</Button>
          <Button onClick={() => onResolve(selected)}>同意所选</Button>
        </div>
      </dialog>
    </div>
  );
}
