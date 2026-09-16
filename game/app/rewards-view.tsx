import { CheckCircle2, Trophy } from 'lucide-react';
import { achievementCatalog } from './achievements';

type LedgerEntry = { week:number; label:string; amount:number; type:'reward'|'expense'|'income' };

export function RewardsView({achievements,ledger,onBack}:{achievements:string[];ledger:LedgerEntry[];onBack?:()=>void}) {
  const rewardTotal=achievements.reduce((sum,id)=>sum+(achievementCatalog.find(a=>a.id===id)?.reward??0),0);
  return (
    <section className="workspace catalog-page rewards-view">
      <div className="page-heading">
        {onBack && <button type="button" className="btn-ghost room-back" onClick={onBack}>返回</button>}
        <h1>里程碑</h1>
        <p>达成 {achievements.length}/{achievementCatalog.length} · 合计 +{rewardTotal}</p>
      </div>
      <div className="split-page">
        <div className="table-scroll">
          <table className="record-table">
            <thead>
              <tr>
                <th>里程碑</th>
                <th>级</th>
                <th>条件</th>
                <th>奖</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {achievementCatalog.map(a=>{
                const unlocked=achievements.includes(a.id);
                return (
                  <tr key={a.id} className={unlocked?'finished':''}>
                    <td><b>{a.title}</b></td>
                    <td>{a.level}</td>
                    <td>{a.desc}</td>
                    <td className="num">{a.reward}</td>
                    <td>{unlocked?<CheckCircle2 size={14}/>:<Trophy size={14}/>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <details className="fold">
            <summary>回馈规则</summary>
            <ol className="reward-rules-list">
              <li><b>周常</b> 阅读/上课/健身/聚会产生小额收入。</li>
              <li><b>首次</b> 选课、出行、扩建另奖。</li>
              <li><b>结档</b> 过课 80。证书 180、通识 280、学士 480。读完一书、首次证书、创作等里程碑另发，同一项只一次。</li>
              <li><b>创作</b> 写作、钢琴、绘画、陶艺各难度各奖一次，不按件卖稿。</li>
            </ol>
          </details>
        </div>
        <aside className="ledger-panel">
          <div className="section-title"><div><h2>流水</h2></div><span>{ledger.length}</span></div>
          <div className="ledger-list">{ledger.map((entry,i)=><article key={`${entry.week}-${entry.label}-${i}`}><span className={entry.amount>=0?'credit':'debit'}>{entry.amount>=0?'+':''}{entry.amount.toLocaleString()}</span><div><b>{entry.label}</b><small>Y{Math.floor((entry.week-1)/52)+1} W{((entry.week-1)%52)+1}</small></div></article>)}</div>
        </aside>
      </div>
    </section>
  );
}
