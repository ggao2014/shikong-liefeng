'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  diplomaDocumentTitle,
  diplomaIssuedAt,
  diplomaKindLabelOf,
  diplomaReward,
  diplomaRewardLabel,
  diplomaSchoolShort,
  type DiplomaReport,
  type TermReport,
} from './university-catalog';

export function TermGradesModal({ report, onClose }: { report: TermReport; onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <dialog className="report-modal term-grades-modal" open aria-labelledby="term-grades-title">
        <button className="close" onClick={onClose} aria-label="关闭"><X /></button>
        <p className="eyebrow">学期成绩</p>
        <h2 id="term-grades-title">{report.termName}</h2>
        <p className="report-lead">第 {report.year} 学年 · 第 {report.weekOfYear} 周结课。通过 {report.passedCount} 门 · 未通过 {report.failedCount} 门。</p>
        <div className="term-grade-table">
          <table>
            <thead>
              <tr>
                <th>课号</th>
                <th>课程</th>
                <th>学分</th>
                <th>成绩</th>
                <th>绩点</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map(row => (
                <tr key={row.id} className={row.passed ? '' : 'failed'}>
                  <td>{row.code}</td>
                  <td>{row.title}</td>
                  <td>{row.credits}</td>
                  <td>{row.letter}</td>
                  <td>{row.gpa.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="report-stats">
          <div><b>{report.termGpa.toFixed(2)}</b><span>学期 GPA</span></div>
          <div><b>{report.passedCount}</b><span>通过</span></div>
          <div><b>{report.failedCount}</b><span>未通过</span></div>
        </div>
        {report.failedCount > 0 && <p className="report-lead">未通过课程下学期可选重修。</p>}
        <footer><Button onClick={onClose} size="lg">收入档案</Button></footer>
      </dialog>
    </div>
  );
}

function diplomaGrant(report: DiplomaReport) {
  if (report.grantText) return report.grantText;
  if (report.kind === 'degree') return '兹证明该生已完成学士学位规定课业，成绩合格，准予毕业，授予学士学位。';
  if (report.kind === 'master') return '兹证明该生已完成硕士学位规定课业与研究，成绩合格，授予硕士学位。';
  if (report.kind === 'doctorate') return '兹证明该生已完成博士学位规定课业与原创研究，成绩合格，授予博士学位。';
  if (report.kind === 'certificate') return '兹证明该生已完成证书规定课业，成绩合格，准予结业。';
  return '兹证明该生已完成通识规定课业，成绩合格，准予结业。';
}

function diplomaSealLabel(report: DiplomaReport) {
  if (report.kind === 'degree' || report.kind === 'master' || report.kind === 'doctorate') return '学位';
  return '结业';
}

export function DiplomaCertificate({ report }: { report: DiplomaReport }) {
  const kind = diplomaKindLabelOf(report);
  const reward = diplomaReward(report);
  return (
    <div className="diploma-sheet">
      <div className="diploma-frame">
        <p className="diploma-school">{diplomaSchoolShort(report)}</p>
        <p className="diploma-kind">{diplomaDocumentTitle(report)}</p>
        <h2>{report.title}</h2>
        <p className="diploma-grant">{diplomaGrant(report)}</p>
        <div className="diploma-meta">
          <span>{report.school}</span>
          <span>{kind}</span>
          <span>学分 {report.earnedCredits}/{report.credits}</span>
          <span>GPA {report.gpa.toFixed(2)}</span>
          <span className="diploma-reward">{diplomaRewardLabel(report.kind)} {reward}</span>
        </div>
        <ul className="diploma-courses">
          {report.courses.map(course => (
            <li key={course.code + course.title}>
              <small>{course.code}</small>
              <span>{course.title}</span>
              <em>{course.letter} {course.gpa.toFixed(1)}</em>
            </li>
          ))}
        </ul>
        <div className="diploma-footer">
          <p>{diplomaIssuedAt(report)} · 第{report.year}学年 · {report.termName}</p>
          <i className="diploma-seal">{diplomaSealLabel(report)}</i>
        </div>
      </div>
    </div>
  );
}

export function DiplomaModal({ report, onClose }: { report: DiplomaReport; onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <dialog className="diploma-modal" open aria-label={report.title}>
        <button className="close" onClick={onClose} aria-label="关闭"><X /></button>
        <DiplomaCertificate report={report} />
        <footer><Button onClick={onClose} size="lg">收入档案</Button></footer>
      </dialog>
    </div>
  );
}
