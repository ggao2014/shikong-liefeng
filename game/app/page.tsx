'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { BatteryMedium, BookOpen, Brain, ChevronRight, Clock3, Dumbbell, Footprints, GraduationCap, Lock, PenTool, Play, RotateCcw, ShieldCheck, Sparkles, Sun, Users, Utensils, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RewardsView } from './rewards-view';
import { chooseStoryEvent, StoryChoice, StoryEvent, StoryEventModal, StoryOutcomeModal, storyEvents } from './story-events';
import { projectCatalog, ProjectDefinition, projectRelatedGain, projectUnlockStatus } from './projects-view';
import { getWorldState } from './world-calendar';
import { CompanyBar, STARTER_SOCIABILITY, clampSocial, gatherings, gatheringGuests, gatheringUnlockStatus, getGathering, hydrateSociability, socialAfterWeek, socialWeekGain } from './town-relationships';
import { TownMapView, TownPlaceId } from './town-map';
import { STARTER_BOOK_ID, bookUnlockStatus, finishedIds, getBook, maxMappedProgress, readableBorrowed, readingSlotGain } from './library-catalog';
import { HomeView, HouseUpgradeModal, StewardReviewModal } from './home-view';
import { TravelReport, TravelView, type OutingReport } from './travel-view';
import { expeditionFailed, expeditionFieldNote, expeditionHasCompanion, expeditionPayout, expeditionStartIssues, expeditionWeekWear, getExpedition, hydrateCompletedExpeditions } from './expedition-catalog';
import { getTravel, getTravelStay, spanLabel, travelWeekEffects } from './travel-catalog';
import { isHomeLeisureId, isOutingLeisureId, leisureCatalog, leisureDineCount, leisureUnlockStatus, resolveLeisureWeek, withLeisureWellbeing } from './leisure-catalog';
import { addedRoomNames, adjustGatheringGuests, applyHouseReclaim, applyStewardDecisions, applyStewardWeek, cleanlinessHint, countScheduleOption, courseReadingSupport, gatheringFoodSlots, homeProjectPerSlot, householdEffects, houseTierAt, houseUpgradeConditionShift, houseWeekNotices, hydrateHomeStat, hydrateHouseLevel, nextHouseTier, projectWellbeing, proposeStewardWeek, quitUnpaidStaff, removeOneStaff, roomsAtLevel, satietyHealth, satietyHint, staffCatalog, staffById, STARTER_CLEANLINESS, STARTER_GROUNDS, STARTER_HOUSE_LEVEL, STARTER_SATIETY, tickHomeWeek, tickSatiety, type StaffId, type StewardProposal, type StewardWeekResult } from './home-catalog';
import { applyHardshipHome, applyHardshipWellbeing, BASE_LIVING, behaviorIncome, campWeatherWear, fundsTone, hardshipQuitCount, hardshipWear, incomeLedgerLabel, RECLAIM_LEAN_RESET, reclaimWarning, shouldReclaimHouse, shouldWarnReclaim, settleCash } from './hardship';
import { EstateGrounds } from './estate-grounds';
import { HomeStudyView } from './home-study';
import { LibraryView } from './library-view';
import { SEMESTER_CREDIT_CAP, academicTerm, buildDiploma, buildTermReport, closeTerm, completedCertificates, courseWeeklyBase, creditSum, enrolledMeetings, getCourse, gradeFromProgress, hydrateCourseGrades, isAddDropWeek, meetingConflict, meetingLabel, mergeDiplomas, newlyCompletedPrograms, overlayCoursePlan, prereqsMet, programCompletionLedger, programCompletionReward, programCompletionTotal, programCreditCap, programKindLabel, programResearch, programStatus, researchOpenReady, slotKey, studyPrograms, termPhaseProgress, type DiplomaReport, type TermReport } from './university-catalog';
import { UniversityView } from './university-view';
import { DiplomaModal, TermGradesModal } from './academic-modals';
import { CelebrationModal, celebrateFromAchievements, celebrateFromTitles, type CelebrateItem } from './celebration-modals';
import { activityForSkill, courseSkill, formatSkillAdvance, formatSkillRemaining, isSkillId, migrateFitnessOption, scaledSkillGain, skillById, skillCatalog, skillCapBreakthroughs, skillCourseGain, skillLevel, skillPracticeCap, skillPracticeGain, skillsOnSchedule, skillUnlocked, skillUpgradeRemaining, type SkillId } from './skill-catalog';
import { resolveSkillWeek, skillEffectShort, wellbeingActivityCounts, withSkillWellbeing, type SkillWeekResult } from './skill-effects';
import { achievementById, skillAchievementIds, workAchievementIds } from './achievements';
import { applyCreativeWeek, CREATIVE_SKILL_IDS, hydrateActiveWorks, hydrateArchivedWorks, isCreativeSkillId, workMenuDetail, type ActiveWork, type ArchivedWork, type CreativeSkillId } from './creative-works';
import { prerequisiteStatus, type ProgressionContext } from './prerequisites';
import { EndingScoreModal, type EndingScoreInput } from './ending-score';
import { MagicAcademyView, MagicInvitation, MAGIC_SCHEDULE_CANDIDATES, buildMagicDiploma, magicAcademyProjects, magicCompletionLedger, magicMeetingCount, magicProgramDetails } from './magic-academy-view';
import { magicTitleById, newlyUnlockedMagicTitles, preferredMagicTitle, magicTitleRewardTotal } from './magic-titles';
import {
  applyFitnessConditionCaps,
  clampEnergyToCondition,
  clampStressToCondition,
  fitnessConditionAt,
  fitnessConditionBanner,
  fitnessConditionHint,
  hydrateFitnessHistory,
  pushFitnessHistory,
  type FitnessCondition,
} from './fitness-condition';

type ActivityKey = 'reading' | 'course' | 'fitness' | 'skill' | 'social' | 'project' | 'rest' | 'out' | 'free';
type ActivityOption = { id: string; title: string; detail?: string; disabled?: boolean; capped?: boolean; capHint?: string };
// TODO: 回合结束后的叙事事件弹窗（如「馆藏 · 未登记附件」）暂缓，有空再接回 chooseStoryEvent / StoryEventModal / StoryOutcomeModal
const ENABLE_STORY_EVENT_MODAL = false;
// TODO: 小屋待办「森林调查 · 艾琳」（接受转车站订票 / 驳回）暂缓，有空再接回 pendingInvite
const ENABLE_FOREST_INVITE = false;
type SlotChoice = Partial<Record<ActivityKey, string>>;
type View = 'cottage' | 'map' | 'library' | 'university' | 'magicAcademy' | 'station' | 'archive' | 'rewards';
type CottageRoom = 'grounds' | 'schedule' | 'estate' | 'study';
type LifeEntry = { week:number; title:string; text:string; kind:string };
type LedgerEntry = { week:number; label:string; amount:number; type:'reward'|'expense'|'income' };
type WeekChange = { label:string; before:number; after:number; unit?:string; invert?:boolean; remaining?:boolean };
type WeekSettlement = {
  week:number;
  weeks?:number;
  counts:Record<ActivityKey,number>;
  money:{ opening:number; earned:number; expenses:number; rewards:number; closing:number };
  changes:WeekChange[];
  notices:string[];
  gathering:{title:string;guests:number}|null;
  leanWeeks?:number;
};
type StayYears = 5 | 60 | 500;
type ScheduleTemplate = { id:string; name:string; plan:ActivityKey[][]; choices?:string[][] };
const stayOptions: { years: StayYears; title: string }[] = [
  { years: 5, title: '五年' },
  { years: 60, title: '六十年' },
  { years: 500, title: '五百年' },
];
type WebTool = { name:string; title:string; description:string; inputSchema:object; annotations:object; execute:(input:unknown)=>unknown };
type ModelDocument = Document & { modelContext?: { registerTool:(tool:WebTool, options?:{signal:AbortSignal})=>void|Promise<void> } };
const activities: Record<ActivityKey, { label: string; icon: typeof BookOpen; color: string; detail: string }> = {
  reading: { label: '阅读', icon: BookOpen, color: 'activity-reading', detail: '阅读' },
  course: { label: '课程', icon: GraduationCap, color: 'activity-course', detail: '上课' },
  fitness: { label: '健身', icon: Dumbbell, color: 'activity-fitness', detail: '运动' },
  skill: { label: '技能', icon: PenTool, color: 'activity-skill', detail: '练习' },
  social: { label: '聚会', icon: Users, color: 'activity-social', detail: '聚会' },
  project: { label: '创作', icon: PenTool, color: 'activity-project', detail: '项目' },
  rest: { label: '宅家', icon: Sun, color: 'activity-rest', detail: '宅家' },
  out: { label: '外出', icon: Footprints, color: 'activity-out', detail: '外出' },
  free: { label: '娱乐', icon: Clock3, color: 'activity-free', detail: '娱乐' },
};
const planKeys: ActivityKey[] = ['reading', 'fitness', 'social', 'project', 'rest', 'out', 'free'];
const restOptions: ActivityOption[] = [
  { id: 'nap', title: '小睡', detail: '额外恢复精力、减压' },
  { id: 'bath', title: '泡澡', detail: '恢复精力、减压' },
  { id: 'chores', title: '整理家务', detail: '恢复清洁度' },
];
const defaultSlotChoice: SlotChoice = { fitness: 'strength', rest: 'nap', out: 'errand', free: 'game', project: 'writing' };
const UNSTARTED_PROJECT = 'unstarted';
function findProject(id?:string|null){return id?(magicAcademyProjects.find(item=>item.id===id)??projectCatalog.find(item=>item.id===id)):undefined}
type MagicMeeting={day:number;period:number;courseId:string;code:string;title:string};
/** 秘法课不随大学假期停课；inSession 只用于避开大学已占时段。 */
function magicMeetings(active:string|null,enrolled:string[],inSession=true):MagicMeeting[]{
  const program=magicProgramDetails(active);
  if(!program)return [];
  const occupied=new Set(enrolledMeetings(enrolled,inSession).map(slot=>slotKey(slot.day,slot.period)));
  const count=magicMeetingCount(program.award);
  return MAGIC_SCHEDULE_CANDIDATES.filter(([day,period])=>!occupied.has(slotKey(day,period))).slice(0,count).map(([day,period],index)=>{
    const source=program.project.sources[index]??(index===0?'导师课':'实践课');
    return {day,period,courseId:`magic:${program.project.id}:${index}`,code:program.code,title:`${source}`};
  });
}
/** 秘法项目：上课 + 小屋研习；学位级创作收益更低，避免速成。 */
const MAGIC_CLASS_PER_SLOT = 1.2;
const MAGIC_PROJECT_PER_SLOT = 2.6;
function magicEffortRates(projectId: string) {
  const award = magicProgramDetails(projectId)?.award;
  if (award === '高等学位') return { projectPer: 1.45, classPer: 0.95 };
  if (award === '学位') return { projectPer: 1.7, classPer: 1.0 };
  return { projectPer: MAGIC_PROJECT_PER_SLOT, classPer: MAGIC_CLASS_PER_SLOT };
}
function magicProjectWeekBase(project:ProjectDefinition,projectSlots:number,magicClassSlots:number,counts:Record<string,number>){
  if(projectSlots<=0)return 0;
  const { projectPer, classPer } = magicEffortRates(project.id);
  const related=projectRelatedGain(project,counts);
  return (projectSlots*projectPer+magicClassSlots*classPer+related)*(project.progressScale??1);
}
function cottageProjectWeekBase(project:ProjectDefinition,projectSlots:number,house:Parameters<typeof homeProjectPerSlot>[0],counts:Record<string,number>){
  if(projectSlots<=0)return 0;
  return (projectSlots*homeProjectPerSlot(house)+projectRelatedGain(project,counts))*(project.progressScale??1);
}
function overlayMagicMeetings<T extends string>(grid:T[][],meetings:MagicMeeting[],courseKey:T){
  const next=grid.map(row=>[...row]);
  meetings.forEach(slot=>{next[slot.day][slot.period]=courseKey});
  return next;
}
function isProjectSkillId(id: string) {
  return isSkillId(id) && skillById[id].schedule === 'project';
}
function defaultProjectChoice(active?: string | null, completed: string[] = [], preferred?: string) {
  if (active) return active;
  if (preferred && isProjectSkillId(preferred)) return preferred;
  const skills = skillsOnSchedule('project');
  return (skills.find(skill => skillUnlocked(skill, completed)) ?? skills[0])?.id ?? 'writing';
}
function isUsableProjectChoice(id: string, active?: string | null) {
  return !!id && (id === active || isProjectSkillId(id));
}
const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const periods = ['早晨', '午后', '夜晚'];
const starter: ActivityKey[][] = [['free','fitness','reading'],['reading','free','rest'],['fitness','reading','social'],['free','free','reading'],['reading','fitness','social'],['rest','reading','free'],['rest','social','reading']];
const scheduleTemplates:ScheduleTemplate[] = [
  {id:'balanced',name:'平衡',plan:starter},
  {id:'study',name:'学习',plan:[['reading','reading','rest'],['reading','project','fitness'],['reading','reading','social'],['project','reading','rest'],['reading','fitness','free'],['rest','reading','social'],['rest','free','reading']]},
  {id:'recovery',name:'恢复',plan:[['rest','fitness','rest'],['free','rest','reading'],['fitness','free','rest'],['rest','social','reading'],['fitness','rest','free'],['rest','social','free'],['rest','reading','rest']]},
];
function fallbackOption(key: ActivityKey, pick?: SlotChoice & { reading?: string; social?: string; project?: string }): string {
  if (key === 'reading') return pick?.reading || '';
  if (key === 'fitness') return migrateFitnessOption(pick?.fitness || 'strength');
  if (key === 'social') return pick?.social || 'tea';
  if (key === 'project') return defaultProjectChoice(undefined, [], pick?.project);
  if (key === 'rest') return pick?.rest || 'nap';
  if (key === 'out') { const id = pick?.out || 'errand'; return isOutingLeisureId(id) ? id : 'errand'; }
  if (key === 'free') { const id = pick?.free || 'game'; return isHomeLeisureId(id) ? id : 'game'; }
  return '';
}
function choicesForPlan(grid: ActivityKey[][], pick?: SlotChoice & { reading?: string; social?: string; project?: string }): string[][] {
  return grid.map(row => row.map(key => fallbackOption(key, pick)));
}
function parsePlanChoice(plan: ActivityKey[][], raw: unknown, pick?: SlotChoice & { reading?: string; social?: string; project?: string }): string[][] {
  if (Array.isArray(raw) && raw.length === 7 && raw.every(row => Array.isArray(row) && row.length === 3)) {
    return (raw as unknown[][]).map((row, di) => row.map((value, pi) => {
      const key = plan[di][pi];
      const cell = typeof value === 'string' ? value : fallbackOption(key, pick);
      if (key === 'project' && !isUsableProjectChoice(cell, pick?.project)) return fallbackOption('project', pick);
      return cell;
    }));
  }
  return choicesForPlan(plan, pick);
}
function normalizeSchedule(grid: ActivityKey[][], choices: string[][]) {
  const nextChoices = (choices.length === 7 ? choices : choicesForPlan(grid)).map((row, di) => row.map((value, pi) => {
    const key = grid[di]?.[pi];
    if (key === 'fitness' || value === 'cardio' || value === 'pool' || value === 'court') return migrateFitnessOption(value);
    return value;
  }));
  const nextPlan = grid.map((row, di) => row.map((key, pi) => {
    const choice = nextChoices[di]?.[pi] ?? '';
    if ((key === 'free' || key === 'out' || key === 'skill') && (choice === 'swimming' || choice === 'tennis' || choice === 'running' || choice === 'strength' || choice === 'stretch')) {
      return 'fitness';
    }
    if (key === 'skill') return activityForSkill(choice);
    if (key === 'free' || key === 'out') {
      if (isOutingLeisureId(choice)) return 'out';
      if (isHomeLeisureId(choice)) return 'free';
    }
    return key;
  }));
  const fixedChoices = nextChoices.map((row, di) => row.map((value, pi) => {
    const key = nextPlan[di]?.[pi];
    if (key === 'out') return isOutingLeisureId(value) ? value : 'errand';
    if (key === 'free') return isHomeLeisureId(value) ? value : 'game';
    if (key === 'fitness') return migrateFitnessOption(value);
    return value;
  }));
  return { plan: nextPlan, choices: fixedChoices };
}
function weekMaxGuests(
  grid: ActivityKey[][],
  choices: string[][],
  sociability: number,
  week: number,
  weather: string,
  guestIndoor: number,
  context: ProgressionContext,
) {
  const counts: number[] = [];
  grid.forEach((row, di) => row.forEach((key, pi) => {
    if (key !== 'social') return;
    const chosen = getGathering(choices[di]?.[pi] || 'tea');
    const gathering = gatheringUnlockStatus(chosen, context).unlocked ? chosen : getGathering('tea');
    counts.push(adjustGatheringGuests(
      gatheringGuests(sociability, week, `${gathering.id}:${di}-${pi}`, weather, gathering.indoor),
      gathering.indoor,
      guestIndoor,
    ));
  }));
  return counts.length ? Math.max(...counts) : 0;
}
function weekGatheringCost(
  grid: ActivityKey[][],
  choices: string[][],
  context: ProgressionContext,
) {
  const costs = new Map<string, number>();
  grid.forEach((row, di) => row.forEach((key, pi) => {
    if (key !== 'social') return;
    const chosen = getGathering(choices[di]?.[pi] || 'tea');
    const gathering = gatheringUnlockStatus(chosen, context).unlocked ? chosen : getGathering('tea');
    costs.set(gathering.id, gathering.cost);
  }));
  return [...costs.values()].reduce((sum, n) => sum + n, 0);
}
function wellbeingFactorFrom(energy: number, stress: number) {
  return energy < 25 || stress > 75 ? 0.72 : energy < 45 || stress > 60 ? 0.88 : 1;
}
function weekWeatherWear(houseLevel: number, weather: string, counts: Record<string, number>) {
  if (houseLevel <= 0) return campWeatherWear(weather);
  return {
    energy: weather.includes('雪') && (counts.rest ?? 0) > 0 ? 3 : 0,
    stress: 0,
    health: ((weather.includes('晴') || weather === '晴朗') && (counts.fitness ?? 0) > 0) ? 2 : 0,
  };
}
function clampPreviewStat(value: number) {
  return Math.max(0, Math.min(100, value));
}
function projectWorkSlots(grid: ActivityKey[][], choices: string[][]) {
  let count = 0;
  grid.forEach((row, di) => row.forEach((key, pi) => {
    if (key !== 'project') return;
    if (isSkillId(choices[di]?.[pi] ?? '')) return;
    count += 1;
  }));
  return count;
}
function composeWellbeing(
  energy: number,
  stress: number,
  health: number,
  counts: Record<string, number>,
  house: ReturnType<typeof householdEffects>,
  skillWeek: SkillWeekResult,
  leisure: ReturnType<typeof resolveLeisureWeek>,
  restMix: { nap?: number; bath?: number } = {},
) {
  return withLeisureWellbeing(
    withSkillWellbeing(projectWellbeing(energy, stress, health, wellbeingActivityCounts(counts, skillWeek.practiced), house, restMix), skillWeek),
    leisure,
  );
}
function withSatiety(house: ReturnType<typeof householdEffects>, value: number) {
  return { ...house, chefHealth: satietyHealth(value) };
}
function practicePlanSkills(
  grid: ActivityKey[][],
  choices: string[][],
  completed: string[],
  progress: Partial<Record<SkillId, number>>,
  finishedBooks: string[],
  rooms: string[],
  factor: number,
  enrolled: string[] = [],
) {
  const next = { ...progress };
  grid.forEach((row, di) => row.forEach((key, pi) => {
    const id = choices[di]?.[pi] ?? '';
    if (!isSkillId(id)) return;
    const skill = skillById[id];
    if (key !== 'skill' && key !== skill.schedule) return;
    if (!skillUnlocked(skill, completed, enrolled)) return;
    const cap = skillPracticeCap(skill, completed, finishedBooks, enrolled);
    const current = next[id] ?? 0;
    next[id] = Math.min(cap, current + skillPracticeGain(skill, finishedBooks, rooms, current) * factor);
  }));
  return next;
}
function applyEnrolledSkillCourses(
  enrolled: string[],
  inSession: boolean,
  completed: string[],
  progress: Partial<Record<SkillId, number>>,
  finishedBooks: string[],
  factor: number,
) {
  if (!inSession || !enrolled.length) return progress;
  const next = { ...progress };
  for (const id of enrolled) {
    const skill = courseSkill(id);
    if (!skill) continue;
    const meetings = getCourse(id)?.meetings.length ?? 0;
    if (!meetings) continue;
    const cap = skillPracticeCap(skill, completed, finishedBooks, enrolled);
    if (cap <= 0) continue;
    const current = next[skill.id] ?? 0;
    next[skill.id] = Math.min(cap, current + skillCourseGain(meetings, current) * factor);
  }
  return next;
}
function skillGateLabels(skill: ReturnType<typeof skillsOnSchedule>[number]) {
  const course = skill.courseId ? getCourse(skill.courseId) : undefined;
  return {
    courseTitle: course ? `${course.code} ${course.title}` : undefined,
    bookTitles: skill.bookIds.map(id => getBook(id)?.title).filter((title): title is string => !!title),
    advanceTitles: (skill.advanceCourseIds ?? []).map(id => {
      const next = getCourse(id);
      return next ? `${next.code} ${next.title}` : id;
    }),
  };
}
function skillMenuOptions(schedule: 'fitness' | 'project' | 'rest', completed: string[], progress: Partial<Record<SkillId, number>>, finishedBooks: string[], rooms: string[], enrolled: string[] = [], activeWorks?: Partial<Record<CreativeSkillId, ActiveWork>>): ActivityOption[] {
  return skillsOnSchedule(schedule).filter(skill => skillUnlocked(skill, completed, enrolled)).map(skill => {
    const value = progress[skill.id] ?? 0;
    const gain = skillPracticeGain(skill, finishedBooks, rooms, value);
    const cap = skillPracticeCap(skill, completed, finishedBooks, enrolled);
    const atCap = value >= cap - 0.05;
    const labels = skillGateLabels(skill);
    const steps = skillCapBreakthroughs(skill, completed, finishedBooks, labels);
    const path = steps.join('；');
    const growth = atCap
      ? path
      : `每次推进 ${formatSkillAdvance(gain)}${path ? ` · ${path}` : ''}`;
    const effect = isCreativeSkillId(skill.id) ? workMenuDetail(skill.id, value, activeWorks?.[skill.id]) : skillEffectShort(skill.id, value);
    const parts = [`还剩 ${formatSkillRemaining(value)} · ${skillLevel(value)}`, growth, effect].filter(Boolean);
    return {
      id: skill.id,
      title: skill.title,
      detail: parts.join(' · '),
      capped: atCap && cap < 100,
      capHint: path || undefined,
    };
  });
}
export default function HomePage() {
  const [view, setView] = useState<View>('cottage');
  const [cottageRoom, setCottageRoom] = useState<CottageRoom>('grounds');
  const [plan, setPlan] = useState<ActivityKey[][]>(starter);
  const [planChoice, setPlanChoice] = useState<string[][]>(() => choicesForPlan(starter, { ...defaultSlotChoice, reading: '', social: 'tea' }));
  const [savedTemplate, setSavedTemplate] = useState<ScheduleTemplate|null>(null);
  const [activeTemplate, setActiveTemplate] = useState('平衡');
  const [report, setReport] = useState(false);
  const [weekSettlement, setWeekSettlement] = useState<WeekSettlement|null>(null);
  const [academicQueue, setAcademicQueue] = useState<Array<{type:'term';report:TermReport}|{type:'diploma';report:DiplomaReport}>>([]);
  const [celebrateQueue, setCelebrateQueue] = useState<CelebrateItem[]>([]);
  const [week, setWeek] = useState(1);
  const [funds, setFunds] = useState(1280);
  const [bookProgressMap, setBookProgressMap] = useState<Record<string, number>>({});
  const [courseProgressMap, setCourseProgressMap] = useState<Record<string, number>>({});
  const [skillProgress, setSkillProgress] = useState<Partial<Record<SkillId,number>>>({});
  const [readingFocus, setReadingFocus] = useState('');
  const [borrowedBooks, setBorrowedBooks] = useState<string[]>([]);
  const [studyFocus, setStudyFocus] = useState('');
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [courseGrades, setCourseGrades] = useState<Record<string, number>>({});
  const [programDiplomas, setProgramDiplomas] = useState<Record<string, DiplomaReport>>({});
  const [declaredProgram, setDeclaredProgram] = useState('');
  const [magicUnlocked, setMagicUnlocked] = useState(false);
  const [magicInviteOpen, setMagicInviteOpen] = useState(false);
  const [magicStateLoaded, setMagicStateLoaded] = useState(false);
  const [sociability, setSociability] = useState(STARTER_SOCIABILITY);
  const [socialIdle, setSocialIdle] = useState(0);
  const [memories, setMemories] = useState(2);
  const [pendingInvite, setPendingInvite] = useState(false);
  const [travelCount, setTravelCount] = useState(0);
  const [completedExpeditions, setCompletedExpeditions] = useState<string[]>([]);
  const [travelReport, setTravelReport] = useState<OutingReport | null>(null);
  const [houseUpgrade, setHouseUpgrade] = useState<{ from: ReturnType<typeof houseTierAt>; to: ReturnType<typeof houseTierAt> } | null>(null);
  const [stewardReview, setStewardReview] = useState<StewardProposal | null>(null);
  const [houseLevel, setHouseLevel] = useState(STARTER_HOUSE_LEVEL);
  const rooms = useMemo(() => roomsAtLevel(houseLevel), [houseLevel]);
  const [originalHouseYear, setOriginalHouseYear] = useState(0);
  const [staff, setStaff] = useState<string[]>([]);
  const [duration, setDuration] = useState<StayYears>(5);
  const [stayChosen, setStayChosen] = useState(false);
  const [stayComplete, setStayComplete] = useState(false);
  const [endingScoreOpen, setEndingScoreOpen] = useState(false);
  const [timeline, setTimeline] = useState<LifeEntry[]>([{week:1,title:'抵达榛木镇',text:'管理局划给一块不规则荒地与初始资金。泥土车道、杂草、没有围栏。地上没有房子。',kind:'arrival'}]);
  const [enrolled, setEnrolled] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([{week:1,label:'管理局初始安置资金',amount:1280,type:'income'}]);
  const [energy, setEnergy] = useState(78);
  const [stress, setStress] = useState(22);
  const [health, setHealth] = useState(82);
  const [fitnessHistory, setFitnessHistory] = useState<number[]>([2, 2]);
  const [cleanliness, setCleanliness] = useState(STARTER_CLEANLINESS);
  const [grounds, setGrounds] = useState(STARTER_GROUNDS);
  const [satiety, setSatiety] = useState(STARTER_SATIETY);
  const [leanWeeks, setLeanWeeks] = useState(0);
  const [livingDebt, setLivingDebt] = useState(0);
  const [pendingEvent, setPendingEvent] = useState<StoryEvent|null>(null);
  const [storyOutcome, setStoryOutcome] = useState<{title:string;choice:StoryChoice}|null>(null);
  const [activeProject, setActiveProject] = useState<string|null>(null);
  const [projectProgress, setProjectProgress] = useState<Record<string,number>>({});
  const [completedProjects, setCompletedProjects] = useState<string[]>([]);
  const [magicTitles, setMagicTitles] = useState<string[]>([]);
  const [equippedMagicTitle, setEquippedMagicTitle] = useState('');
  const [archivedWorks, setArchivedWorks] = useState<ArchivedWork[]>([]);
  const [activeWorks, setActiveWorks] = useState<Partial<Record<CreativeSkillId, ActiveWork>>>({});
  const [festivalMemories, setFestivalMemories] = useState<string[]>([]);
  const [gatheringKind, setGatheringKind] = useState('tea');
  const [slotChoice, setSlotChoice] = useState<SlotChoice>(defaultSlotChoice);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem('rift-save-v1');
    if (raw) try { const s = JSON.parse(raw); const loadedPlan = normalizeSchedule(s.plan ?? starter, parsePlanChoice(s.plan ?? starter, s.planChoice, { ...defaultSlotChoice, ...s.slotChoice, reading: s.readingFocus, social: s.gatheringKind, project: defaultProjectChoice(s.activeProject, s.completedCourses ?? [], s.slotChoice?.project) })); setPlan(loadedPlan.plan); setPlanChoice(loadedPlan.choices); setSavedTemplate(s.savedTemplate?.plan?(() => { const saved = normalizeSchedule(s.savedTemplate.plan, parsePlanChoice(s.savedTemplate.plan, s.savedTemplate.choices)); return {id:'mine',name:'我的日程',plan:saved.plan,choices:saved.choices}; })():null); setActiveTemplate(s.activeTemplate??'手动日程'); setWeek(s.week ?? 1); setFunds(s.funds ?? 1280); setBookProgressMap(s.bookProgressMap ?? (typeof s.bookProgress === 'number' && typeof s.readingFocus === 'string' && s.readingFocus ? { [s.readingFocus]: s.bookProgress } : {})); setCourseProgressMap(s.courseProgressMap ?? {}); setReadingFocus(typeof s.readingFocus === 'string' ? s.readingFocus : ''); setBorrowedBooks((() => {
          const savedStaff = Array.isArray(s.staff) ? s.staff.filter((id: unknown): id is string => typeof id === 'string') : [];
          const nextHouse = hydrateHouseLevel(s.houseLevel, s.rooms);
          const cap = householdEffects(roomsAtLevel(nextHouse), savedStaff, nextHouse).borrowLimit;
          if (Array.isArray(s.borrowedBooks)) return [...new Set<string>(s.borrowedBooks.filter((id: unknown): id is string => typeof id === 'string'))].slice(0, cap);
          const fallback = typeof s.readingFocus === 'string' && s.readingFocus ? s.readingFocus : STARTER_BOOK_ID;
          return [fallback];
})()); setSkillProgress(s.skillProgress??{}); setStudyFocus(s.studyFocus ?? ''); setCompletedCourses(s.completedCourses ?? []); setCourseGrades(hydrateCourseGrades(s.completedCourses ?? [], s.courseProgressMap ?? {}, s.courseGrades)); setProgramDiplomas(s.programDiplomas ?? {}); setDeclaredProgram(s.declaredProgram ?? ''); setSociability(hydrateSociability(s)); setSocialIdle(typeof s.socialIdle === 'number' ? s.socialIdle : 0); setMemories(s.memories ?? 2); setPendingInvite(s.pendingInvite ?? false); setTravelCount(s.travelCount ?? 0); setCompletedExpeditions(hydrateCompletedExpeditions(s.completedExpeditions)); setHouseLevel(hydrateHouseLevel(s.houseLevel, s.rooms)); setOriginalHouseYear(typeof s.originalHouseYear === 'number' ? s.originalHouseYear : (hydrateHouseLevel(s.houseLevel, s.rooms) >= 1 ? 1 : 0)); setStaff(s.staff ?? []); setDuration(s.duration===60||s.duration===500?s.duration:5); setTimeline(s.timeline ?? [{week:1,title:'抵达榛木镇',text:'管理局划给一块不规则荒地与初始资金。泥土车道、杂草、没有围栏。地上没有房子。',kind:'arrival'}]); setEnrolled(Array.isArray(s.enrolled) ? s.enrolled : []); setAchievements(s.achievements ?? []); setLedger(s.ledger ?? [{week:1,label:'管理局初始安置资金',amount:1280,type:'income'}]); setEnergy(s.energy ?? 78); setStress(s.stress ?? 22); setHealth(s.health ?? 82); setFitnessHistory(hydrateFitnessHistory(s.fitnessHistory)); setCleanliness(hydrateHomeStat(s.cleanliness, STARTER_CLEANLINESS)); setGrounds(hydrateHomeStat(s.grounds, STARTER_GROUNDS)); setSatiety(hydrateHomeStat(s.satiety, STARTER_SATIETY)); setLeanWeeks(typeof s.leanWeeks === 'number' && s.leanWeeks > 0 ? Math.floor(s.leanWeeks) : 0); setLivingDebt(typeof s.livingDebt === 'number' && s.livingDebt > 0 ? Math.round(s.livingDebt) : 0); setPendingEvent(storyEvents.find(event=>event.id===s.pendingEventId)??null); setActiveProject(s.activeProject??null); setProjectProgress(s.projectProgress??{}); setCompletedProjects(s.completedProjects??[]); setMagicTitles(Array.isArray(s.magicTitles)?s.magicTitles.filter((id: unknown): id is string => typeof id==='string'):[]); setEquippedMagicTitle(typeof s.equippedMagicTitle==='string'&&(Array.isArray(s.magicTitles)?s.magicTitles:[]).includes(s.equippedMagicTitle)?s.equippedMagicTitle:''); setArchivedWorks(hydrateArchivedWorks(s.archivedWorks)); setActiveWorks(hydrateActiveWorks(s.activeWorks)); setFestivalMemories(s.festivalMemories??[]); setGatheringKind(s.gatheringKind??'tea'); setSlotChoice((() => {
          const next = {...defaultSlotChoice,...s.slotChoice};
          if (next.free === 'pool' || next.free === 'court') {
            next.fitness = migrateFitnessOption(next.free);
            next.free = 'game';
          }
          next.fitness = migrateFitnessOption(next.fitness || 'strength');
          const restIds = new Set([...restOptions.map(item => item.id), ...skillsOnSchedule('rest').map(skill => skill.id)]);
          const fitnessIds = new Set(['stretch', ...skillsOnSchedule('fitness').map(skill => skill.id)]);
          if (!restIds.has(next.rest ?? '')) next.rest = 'nap';
          if (!fitnessIds.has(next.fitness ?? '')) next.fitness = 'strength';
          if (isOutingLeisureId(next.free ?? '')) {
            if (!isOutingLeisureId(next.out ?? '')) next.out = next.free;
            next.free = 'game';
          }
          if (!isHomeLeisureId(next.free ?? '')) next.free = 'game';
          if (!isOutingLeisureId(next.out ?? '')) next.out = 'errand';
          return next;
        })()); setStayComplete(!!s.stayComplete); setStayChosen(true); } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    setMagicUnlocked(localStorage.getItem('rift-magic-academy') === 'unlocked');
    setMagicStateLoaded(true);
  }, [loaded]);
  useEffect(() => {
    if (!magicStateLoaded || magicUnlocked || magicInviteOpen) return;
    const invitationDegrees = ['degree-ma', 'degree-ns', 'degree-en'];
    if (invitationDegrees.every(id => !!programDiplomas[id])) setMagicInviteOpen(true);
  }, [magicStateLoaded, magicUnlocked, magicInviteOpen, programDiplomas]);
  useEffect(() => { if (loaded && stayChosen) localStorage.setItem('rift-save-v1', JSON.stringify({ plan, planChoice, savedTemplate, activeTemplate, week, funds, bookProgress: bookProgressMap[readingFocus]??0, courseProgress: courseProgressMap[studyFocus]??0, bookProgressMap, courseProgressMap, skillProgress, readingFocus, borrowedBooks, studyFocus, completedCourses, courseGrades, programDiplomas, declaredProgram, sociability, socialIdle, memories, pendingInvite, travelCount, completedExpeditions, houseLevel, originalHouseYear, rooms, staff, duration, stayChosen: true, stayComplete, timeline, enrolled, achievements, ledger, energy, stress, health, fitnessHistory, cleanliness, grounds, satiety, leanWeeks, livingDebt, pendingEventId:pendingEvent?.id, activeProject, projectProgress, completedProjects, magicTitles, equippedMagicTitle, archivedWorks, activeWorks, festivalMemories, gatheringKind, slotChoice })); }, [loaded, stayChosen, stayComplete, plan, planChoice, savedTemplate, activeTemplate, week, funds, bookProgressMap, courseProgressMap, skillProgress, readingFocus, borrowedBooks, studyFocus, completedCourses, courseGrades, programDiplomas, declaredProgram, sociability, socialIdle, memories, pendingInvite, travelCount, completedExpeditions, houseLevel, originalHouseYear, rooms, staff, duration, timeline, enrolled, achievements, ledger, energy, stress, health, fitnessHistory, cleanliness, grounds, satiety, leanWeeks, livingDebt, pendingEvent, activeProject, projectProgress, completedProjects, magicTitles, equippedMagicTitle, archivedWorks, activeWorks, festivalMemories, gatheringKind, slotChoice]);
  function lockCourseGrid(ids: string[]) {
    const inSession = academicTerm(((week - 1) % 52) + 1).inSession;
    const magic=magicMeetings(activeProject,ids,inSession);
    const locked = new Set([...enrolledMeetings(ids, inSession),...magic].map(slot => slotKey(slot.day, slot.period)));
    const overlayed = overlayMagicMeetings(overlayCoursePlan(plan, ids, 'course', 'free', inSession),magic,'course');
    const nextChoices = planChoice.map((row, day) => row.map((value, period) => {
      if (locked.has(slotKey(day, period))) return '';
      if (plan[day]?.[period] === 'course') return isHomeLeisureId(value) ? value : 'game';
      return value;
    }));
    const migrated = normalizeSchedule(overlayed, nextChoices);
    setPlan(migrated.plan);
    setPlanChoice(migrated.choices);
  }
  useEffect(() => {
    if (!loaded) return;
    lockCourseGrid(enrolled);
  }, [enrolled, loaded, week, activeProject]);
  useEffect(() => {
    if (!loaded) return;
    const readable = readableBorrowed(borrowedBooks, bookProgressMap);
    setReadingFocus(current => readable.includes(current) ? current : (readable[0] ?? ''));
    setPlanChoice(current => {
      let changed = false;
      const next = current.map((row, di) => row.map((value, pi) => {
        if (plan[di][pi] !== 'reading') return value;
        if (readable.includes(value)) return value;
        changed = true;
        return readable[0] ?? '';
      }));
      return changed ? next : current;
    });
  }, [loaded, borrowedBooks, bookProgressMap, plan]);
  const prevActiveProject = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!loaded) return;
    const prev = prevActiveProject.current;
    const bootstrapping = prev === undefined;
    prevActiveProject.current = activeProject;
    const startedFresh = !bootstrapping && !!activeProject && activeProject !== prev;
    const idleFallback = defaultProjectChoice(null, completedCourses, slotChoice.project);
    setPlanChoice(current => {
      let changed = false;
      const next = current.map((row, di) => row.map((value, pi) => {
        if (plan[di][pi] !== 'project') return value;
        // 新开题：原先写课题的格（结项后常落回「写作」）自动选中新论文/课题
        if (startedFresh && activeProject) {
          if (value === activeProject) return value;
          if (isProjectSkillId(value) && value !== 'writing') return value;
          changed = true;
          return activeProject;
        }
        if (isUsableProjectChoice(value, activeProject)) return value;
        changed = true;
        return activeProject ?? idleFallback;
      }));
      return changed ? next : current;
    });
    if (startedFresh && activeProject) {
      setSlotChoice(current => (current.project === activeProject ? current : { ...current, project: activeProject }));
    }
  }, [loaded, activeProject, completedCourses, plan, slotChoice.project]);
  const counts = useMemo(() => Object.keys(activities).reduce((a, key) => { a[key as ActivityKey] = plan.flat().filter(x => x === key).length; return a; }, {} as Record<ActivityKey, number>), [plan]);
  const choreSlots = countScheduleOption(plan, planChoice, 'rest', 'chores');
  const cookingSlots = countScheduleOption(plan, planChoice, 'rest', 'cooking');
  const napSlots = countScheduleOption(plan, planChoice, 'rest', 'nap');
  const bathSlots = countScheduleOption(plan, planChoice, 'rest', 'bath');
  const restMix = { nap: napSlots, bath: bathSlots };
  const cookingSkill = skillProgress.cooking ?? 0;
  const previewProject = findProject(activeProject);
  const previewSkill = resolveSkillWeek({ grid: plan, choices: planChoice, progress: skillProgress, houseLevel, rooms, socialSlots: counts.social, projectKind: previewProject?.kind });
  const house = householdEffects(rooms, staff, houseLevel, { cleanliness, grounds, cooking: cookingSlots, cookingSkill });
  const year = Math.floor((week-1)/52)+1;
  const weekOfYear = ((week-1)%52)+1;
  const stayLimit = duration * 52;
  const lastStayWeek = !stayComplete && week >= stayLimit;
  const academic = academicTerm(weekOfYear);
  const world = getWorldState(week);
  const progressionContext:ProgressionContext={week,completedCourses,finishedBooks:finishedIds(bookProgressMap),skillProgress:{...skillProgress},rooms,houseLevel,sociability,travelCount,expeditionCount:completedExpeditions.length,completedExpeditions,bookProgressMax:maxMappedProgress(bookProgressMap),courseProgressMax:maxMappedProgress(courseProgressMap)};
  const livingCost = BASE_LIVING + house.upkeep;
  const wantedLeisure = resolveLeisureWeek(plan, planChoice, world.weather);
  const fitnessCondition = fitnessConditionAt(fitnessHistory, counts.fitness);
  const weekLoad = composeWellbeing(energy, stress, health, counts, house, previewSkill, wantedLeisure, restMix);
  const weekLoadCapped = applyFitnessConditionCaps(weekLoad.projectedEnergy, weekLoad.projectedStress, fitnessCondition);
  const wellbeingFactor = wellbeingFactorFrom(weekLoadCapped.energy, weekLoadCapped.stress);
  const gatherCost = weekGatheringCost(plan, planChoice, progressionContext);
  const readingIds: string[] = [];
  plan.forEach((row, di) => row.forEach((key, pi) => {
    if (key !== 'reading') return;
    const id = planChoice[di]?.[pi];
    if (!id || !borrowedBooks.includes(id) || (bookProgressMap[id] ?? 0) >= 100) return;
    if (!getBook(id)) return;
    readingIds.push(id);
  }));
  const uniqueReading = [...new Set(readingIds)];
  const festival = world.festival;
  const festivalKey = festival ? `${year}-${festival.id}` : '';
  const festivalHappens = !!festival && counts[festival.activity] > 0 && !festivalMemories.includes(festivalKey);
  const festivalReward = festivalHappens && festival ? festival.reward : 0;
  const nextCourseMap = { ...courseProgressMap };
  if (academic.inSession && enrolled.length) {
    for (const id of enrolled) {
      const slots = getCourse(id)?.meetings.length ?? 0;
      if (!slots) continue;
      const gain = (courseWeeklyBase(slots) + courseReadingSupport(id, uniqueReading, house.librarian) + house.researcherCourse) * wellbeingFactor;
      nextCourseMap[id] = Math.min(100, (nextCourseMap[id] ?? 0) + gain);
      if (festivalHappens && festival?.activity === 'course') nextCourseMap[id] = Math.min(100, (nextCourseMap[id] ?? 0) + 6);
    }
  }
  let finishedIdsThisWeek: string[] = [];
  let nextCompleted = completedCourses;
  let courseReward = 0;
  if (academic.lastTeachingWeek || (academic.holiday && enrolled.length)) {
    const closed = closeTerm(enrolled, nextCourseMap, completedCourses, courseGrades);
    finishedIdsThisWeek = closed.passed;
    nextCompleted = closed.nextCompleted;
    courseReward = 80 * finishedIdsThisWeek.length;
  }
  const settledPrograms = newlyCompletedPrograms(nextCompleted, declaredProgram, programDiplomas);
  const diplomaReward = programCompletionTotal(settledPrograms);
  const projectSlots = projectWorkSlots(plan, planChoice);
  const magicClassSlots=magicMeetings(activeProject,enrolled,academic.inSession).length;
  const magicActive = !!magicProgramDetails(activeProject);
  const projectBase = previewProject
    ? (magicActive
      ? magicProjectWeekBase(previewProject, projectSlots, magicClassSlots, counts)
      : cottageProjectWeekBase(previewProject, projectSlots, house, counts))
    : 0;
  const projectGain = previewProject ? (projectBase + previewSkill.project) * wellbeingFactor : 0;
  const projectBefore = previewProject ? (projectProgress[previewProject.id] ?? 0) : 0;
  const projectReward = previewProject && projectBefore < 100 && projectBefore + projectGain >= 100 ? previewProject.reward : 0;
  const seededSkills = { ...skillProgress };
  for (const courseId of finishedIdsThisWeek) {
    const skill = courseSkill(courseId);
    if (skill) seededSkills[skill.id] = Math.max(20, seededSkills[skill.id] ?? 0);
  }
  const previewSkillProgress = applyEnrolledSkillCourses(
    enrolled,
    academic.inSession,
    nextCompleted,
    practicePlanSkills(plan, planChoice, nextCompleted, seededSkills, finishedIds(bookProgressMap), rooms, wellbeingFactor, enrolled),
    finishedIds(bookProgressMap),
    wellbeingFactor,
  );
  const previewWork = applyCreativeWeek(previewSkill.practiced, previewSkillProgress, activeWorks, archivedWorks, week);
  const earned = behaviorIncome(counts, wellbeingFactor, leanWeeks);
  const previewCash = settleCash({
    funds: funds + earned + courseReward + diplomaReward + projectReward + previewSkill.funds + previewWork.completionReward,
    living: livingCost,
    leisure: wantedLeisure.cost,
    gathering: gatherCost,
    leanWeeks,
    debt: livingDebt,
  });
  const leisureWeek = previewCash.leisurePaid ? wantedLeisure : resolveLeisureWeek(plan, planChoice, world.weather, { allowPaid: false });
  const previewGuests = previewCash.gatheringPaid ? weekMaxGuests(plan, planChoice, sociability, week, world.weather, house.guestIndoor, progressionContext) : 0;
  const satietyTick = tickSatiety({ satiety, rooms, staff, cooking: cookingSlots, cookingSkill, dineOut: leisureDineCount(leisureWeek), ...gatheringFoodSlots(plan, planChoice, previewCash.gatheringPaid) });
  const settledPreview = applyHardshipWellbeing(composeWellbeing(energy, stress, health, counts, withSatiety(house, satietyTick.satiety), previewSkill, leisureWeek, restMix), previewCash.nextLeanWeeks);
  const reclaimThisWeek = shouldReclaimHouse(previewCash.nextLeanWeeks, houseLevel);
  const weatherWear = weekWeatherWear(reclaimThisWeek ? 0 : houseLevel, world.weather, counts);
  const projectedHome = tickHomeWeek({ cleanliness, grounds, houseLevel, rooms, staff, chores: choreSlots, cooking: cookingSlots, cookingSkill, social: counts.social, guests: previewGuests });
  const wornPreview = applyHardshipHome(projectedHome.cleanliness, projectedHome.grounds, previewCash.nextLeanWeeks);
  const reclaimedHome = reclaimThisWeek ? applyHouseReclaim(houseLevel, staff, wornPreview.cleanliness, wornPreview.grounds) : null;
  const load = weekLoad.load;
  const projectedRaw = applyFitnessConditionCaps(
    settledPreview.projectedEnergy + weatherWear.energy,
    settledPreview.projectedStress + weatherWear.stress + (reclaimedHome?.reclaimed ? 10 : 0),
    fitnessCondition,
  );
  const projectedEnergy = clampPreviewStat(projectedRaw.energy);
  const projectedStress = clampPreviewStat(projectedRaw.stress);
  const projectedHealth = clampPreviewStat(settledPreview.projectedHealth + weatherWear.health);
  const projectedCleanliness = reclaimedHome?.reclaimed ? reclaimedHome.cleanliness : wornPreview.cleanliness;
  const projectedSatiety = satietyTick.satiety;
  const previewSocialGain = socialWeekGain({
    socialSlots: counts.social,
    guests: previewGuests,
    passedCourses: finishedIdsThisWeek.length,
    newCertificates: settledPrograms.filter(item => item.kind === 'certificate').length,
    newDegrees: settledPrograms.filter(item => item.kind === 'degree' || item.kind === 'master' || item.kind === 'doctorate' || item.kind === 'general').length,
    festivalSocial: !!(festivalHappens && festival?.activity === 'social'),
    leisureSocial: leisureWeek.social,
    skillSocial: previewSkill.social,
  });
  const previewSocial = socialAfterWeek(sociability, socialIdle, previewSocialGain);
  const projectedSociability = clampSocial(previewSocial.sociability + hardshipWear(previewCash.nextLeanWeeks).social);
  const projectedNet = previewCash.closing + festivalReward - funds;
  const strainedWeek = weekLoadCapped.energy < 25 || weekLoadCapped.stress > 75;
  const shownEnergy = clampEnergyToCondition(energy, fitnessCondition);
  const shownStress = clampStressToCondition(stress, fitnessCondition);
  const fitnessBanner = fitnessConditionBanner(fitnessCondition);
  const moneyTone = fundsTone(funds, livingCost, leanWeeks);
  const reclaimHint = shouldReclaimHouse(previewCash.nextLeanWeeks, houseLevel)
    ? `催缴第 ${Math.max(leanWeeks, previewCash.nextLeanWeeks)} 周。结算后管理局将收回整栋房屋，只留荒地。`
    : shouldWarnReclaim(previewCash.nextLeanWeeks, houseLevel) || shouldWarnReclaim(leanWeeks, houseLevel)
      ? reclaimWarning(Math.max(leanWeeks, previewCash.nextLeanWeeks))
      : '';
  const moneyHint = reclaimHint
    || (leanWeeks > 0
      ? `催缴第 ${leanWeeks} 周。${livingDebt > 0 ? `尚欠 ${livingDebt}。` : ''}驻留资格仍有效；付费娱乐和请客暂缓。`
      : previewCash.unpaidLiving > 0
        ? '本周生活费可能结不清：付费娱乐和请客不会生效。'
        : '');
  const moneyChip = reclaimHint
    ? (shouldReclaimHouse(previewCash.nextLeanWeeks, houseLevel)
      ? '将收回房屋'
      : `催缴第${Math.max(leanWeeks, previewCash.nextLeanWeeks)}周`)
    : leanWeeks > 0
      ? `催缴第${leanWeeks}周`
      : previewCash.unpaidLiving > 0
        ? '本周结不清'
        : '';
  const season = world.season;
  useEffect(() => {
    if (!loaded || !stayChosen) return;
    const fromDiplomas = Object.values(programDiplomas).flatMap(report => {
      const program = studyPrograms.find(item => item.id === report.programId);
      return program?.required ?? [];
    });
    const missing = fromDiplomas.filter(id => !!getCourse(id) && !completedCourses.includes(id));
    if (!missing.length) return;
    setCompletedCourses(current => [...current, ...missing.filter(id => !current.includes(id))]);
  }, [loaded, stayChosen, programDiplomas, completedCourses]);
  useEffect(() => {
    if (!loaded || !stayChosen) return;
    const program = studyPrograms.find(item => item.id === declaredProgram);
    if (!program || programDiplomas[program.id]) return;
    if (!programStatus(program, completedCourses, programDiplomas).complete) return;
    const report = buildDiploma(program, completedCourses, courseGrades, year, weekOfYear);
    setProgramDiplomas(current => current[program.id] ? current : mergeDiplomas(current, [report]));
    setAcademicQueue(queue => queue.some(item => item.type === 'diploma' && item.report.programId === program.id) ? queue : [...queue, { type: 'diploma', report }]);
  }, [loaded, stayChosen, declaredProgram, completedCourses, courseGrades, programDiplomas, year, weekOfYear]);
  useEffect(() => {
    if (!loaded || !stayChosen) return;
    const missing = completedProjects
      .map(id => buildMagicDiploma(id, year, weekOfYear))
      .filter((report): report is DiplomaReport => !!report && !programDiplomas[report.programId]);
    const refreshed = Object.values(programDiplomas)
      .filter(report => {
        if (!magicProgramDetails(report.programId)) return false;
        return !report.schoolShort
          || !!report.documentTitle
          || !!report.kindLabel
          || !!report.grantText
          || report.school.includes('星穹秘法学院');
      })
      .map(report => buildMagicDiploma(report.programId, report.year, report.weekOfYear))
      .filter((report): report is DiplomaReport => !!report);
    const updates = [...missing, ...refreshed];
    if (!updates.length) return;
    setProgramDiplomas(current => {
      const changed = updates.some(report => {
        const existing = current[report.programId];
        return !existing
          || existing.school !== report.school
          || existing.schoolShort !== report.schoolShort
          || existing.documentTitle !== report.documentTitle
          || existing.kindLabel !== report.kindLabel
          || existing.grantText !== report.grantText
          || existing.issuedAt !== report.issuedAt
          || existing.kind !== report.kind;
      });
      return changed ? mergeDiplomas(current, updates) : current;
    });
    if (!missing.length) return;
    setAcademicQueue(queue => {
      const seen = new Set(queue.filter(item => item.type === 'diploma').map(item => item.report.programId));
      const add = missing.filter(report => !seen.has(report.programId)).map(report => ({ type: 'diploma' as const, report }));
      return add.length ? [...queue, ...add] : queue;
    });
  }, [loaded, stayChosen, completedProjects, programDiplomas, year, weekOfYear]);
  useEffect(() => {
    if (!loaded || !stayChosen) return;
    const fresh = newlyUnlockedMagicTitles(completedProjects, magicTitles);
    if (!fresh.length) return;
    const ids = fresh.map(item => item.id);
    const pay = magicTitleRewardTotal(ids);
    setMagicTitles(current => [...current, ...ids]);
    setEquippedMagicTitle(current => preferredMagicTitle([...magicTitles, ...ids], ids) || current);
    setFunds(current => current + pay);
    setLedger(current => [{ week, label: `议席授号：${fresh.map(item => item.title).join('、')}`, amount: pay, type: 'reward' }, ...current]);
    setTimeline(current => [{ week, title: `议席授号：${fresh.map(item => item.title).join('、')}`, text: `星穹议席依既有修习组合补授封号，并发放 ${pay.toLocaleString()}。`, kind: 'magic' }, ...current].slice(0, 80));
    setCelebrateQueue(queue => [...queue, ...celebrateFromTitles(ids)]);
  }, [loaded, stayChosen, completedProjects, magicTitles, week]);
  function setSlot(day: number, period: number, key: ActivityKey, optionId?: string) {
    if (key === 'course') return;
    if ([...enrolledMeetings(enrolled, academic.inSession),...magicMeetings(activeProject,enrolled,academic.inSession)].some(slot => slot.day === day && slot.period === period)) return;
    setPlan(current => current.map((row, di) => row.map((value, pi) => di === day && pi === period ? key : value)));
    const resolved = optionId && optionId !== UNSTARTED_PROJECT
      ? optionId
      : key === 'project'
        ? defaultProjectChoice(activeProject, completedCourses, slotChoice.project)
        : fallbackOption(key, slotChoice);
    setPlanChoice(current => current.map((row, di) => row.map((value, pi) => di === day && pi === period ? resolved : value)));
    setActiveTemplate('手动日程');
    if (!resolved) return;
    if (key === 'reading') setReadingFocus(resolved);
    else if (key === 'social') setGatheringKind(resolved);
    else setSlotChoice(current => ({ ...current, [key]: resolved }));
  }
  function applyScheduleTemplate(template:ScheduleTemplate){
    const projectPick=defaultProjectChoice(activeProject,completedCourses,slotChoice.project);
    const migrated=normalizeSchedule(template.plan, template.choices?parsePlanChoice(template.plan,template.choices,{...slotChoice,reading:readingFocus,social:gatheringKind,project:projectPick}):choicesForPlan(template.plan,{...slotChoice,reading:readingFocus,social:gatheringKind,project:projectPick}));
    const magic=magicMeetings(activeProject,enrolled,academic.inSession);
    const overlayed=overlayMagicMeetings(overlayCoursePlan(migrated.plan,enrolled,'course','free',academic.inSession),magic,'course');
    const locked=new Set([...enrolledMeetings(enrolled,academic.inSession),...magic].map(slot=>slotKey(slot.day,slot.period)));
    const split=normalizeSchedule(overlayed, migrated.choices.map((row,day)=>row.map((value,period)=>locked.has(slotKey(day,period))?'':value)));
    setPlan(split.plan.map(row=>[...row]));
    setPlanChoice(split.choices.map(row=>[...row]));
    setActiveTemplate(template.name);
  }
  function saveCurrentTemplate(){
    const saved:ScheduleTemplate={id:'mine',name:'我的日程',plan:plan.map(row=>[...row]),choices:planChoice.map(row=>[...row])};
    setSavedTemplate(saved);
    setActiveTemplate(saved.name);
  }
  function borrowBook(id: string) {
    const book=getBook(id);
    if(!book||!bookUnlockStatus(book,progressionContext).unlocked)return;
    setBorrowedBooks(current => {
      if (current.includes(id) || current.length >= house.borrowLimit) return current;
      if (!current.includes(readingFocus)) setReadingFocus(id);
      return [...current, id];
    });
    setBookProgressMap(current => current[id] == null ? { ...current, [id]: 0 } : current);
  }
  function returnBook(id: string) {
    setBorrowedBooks(current => {
      const next = current.filter(item => item !== id);
      if (readingFocus === id) setReadingFocus(next[0] ?? '');
      setPlanChoice(grid => grid.map((row, di) => row.map((value, pi) => plan[di][pi] === 'reading' && value === id ? (next[0] ?? '') : value)));
      return next;
    });
  }
  function trimBorrowedToCap(books: string[], cap: number, keepId: string) {
    if (books.length <= cap) return { books, returned: [] as string[] };
    const kept: string[] = [];
    const returned: string[] = [];
    if (keepId && books.includes(keepId) && cap > 0) kept.push(keepId);
    for (const id of books) {
      if (kept.includes(id)) continue;
      if (kept.length < cap) kept.push(id);
      else returned.push(id);
    }
    return { books: kept, returned };
  }
  function grant(ids:string[]) {
    const fresh=ids.filter(id=>!achievements.includes(id));
    if(!fresh.length)return;
    const total=fresh.reduce((sum,id)=>sum+(achievementById(id)?.reward??0),0);
    setAchievements(v=>[...v,...fresh]);
    setFunds(v=>v+total);
    setLedger(v=>[{week,label:`里程碑：${fresh.map(id=>achievementById(id)?.title).join('、')}`,amount:total,type:'reward'},...v]);
    setCelebrateQueue(queue=>[...queue,...celebrateFromAchievements(fresh)]);
  }
  function startProject(project:ProjectDefinition) {
    if(activeProject||funds<project.cost||completedProjects.includes(project.id))return;
    const declared = studyPrograms.find(item => item.id === declaredProgram);
    const track = declared ? programResearch(declared) : undefined;
    const programLinked = !!declared && track?.projectId === project.id;
    if (programLinked) {
      if (!researchOpenReady(declared, completedCourses).ready) return;
    } else if (!projectUnlockStatus(project, progressionContext).unlocked) {
      return;
    }
    const title = programLinked && track ? track.title : project.title;
    const magic = magicProgramDetails(project.id);
    const magicSlots = magic ? magicMeetings(project.id, enrolled, academic.inSession) : [];
    const openNote = magicSlots.length
      ? `开题费已从余额扣除。导师课已锁定进日程：${magicSlots.map(slot => `${days[slot.day]}${periods[slot.period]}「${slot.title}」`).join('、')}。小屋创作时段也计入进度。`
      : '开题费已从余额扣除。小屋创作时段计入进度。';
    setFunds(v=>v-project.cost); setLedger(v=>[{week,label:`开题：${title}`,amount:-project.cost,type:'expense'},...v]); setActiveProject(project.id); setProjectProgress(v=>({...v,[project.id]:v[project.id]??0})); setTimeline(v=>[{week,title:`开题《${title}》`,text:openNote,kind:'project'},...v].slice(0,80)); openCottage('schedule');
  }
  const researchWork = (() => {
    const declared = studyPrograms.find(item => item.id === declaredProgram);
    const track = declared ? programResearch(declared) : undefined;
    const project = track ? projectCatalog.find(item => item.id === track.projectId) : undefined;
    if (!declared || !track || !project) return null;
    const gate = researchOpenReady(declared, completedCourses);
    const done = completedProjects.includes(project.id);
    const active = activeProject === project.id;
    const busy = !!activeProject && !active;
    const status: 'locked' | 'ready' | 'active' | 'done' = done ? 'done' : active ? 'active' : gate.ready && !busy ? 'ready' : 'locked';
    return {
      title: track.title,
      desc: track.desc,
      need: track.need,
      cost: project.cost,
      progress: projectProgress[project.id] ?? 0,
      status,
      lockLabel: done ? undefined : busy ? '小屋已有进行中的课题' : gate.ready ? undefined : gate.label,
      onStart: () => startProject(project),
    };
  })();
  function enterPlace(id: TownPlaceId) {
    if (id === 'cottage') setCottageRoom('grounds');
    setView(id);
  }
  function acceptMagicInvite() {
    setMagicInviteOpen(false);
    setMagicUnlocked(true);
    localStorage.setItem('rift-magic-academy', 'unlocked');
    setTimeline(v => [{ week, title: '收到星穹秘法学院邀请', text: '远山显出道路。学院承认你在应用数学、生物学与电气工程上的联合造诣。', kind: 'study' }, ...v].slice(0, 80));
    setView('map');
  }
  function openCottage(room: CottageRoom) {
    setCottageRoom(room);
    setView('cottage');
  }
  function processWeather(level = houseLevel, condition = fitnessCondition) {
    const wear = weekWeatherWear(level, world.weather, counts);
    setEnergy(v => clampEnergyToCondition(v + wear.energy, condition));
    setStress(v => clampStressToCondition(v + wear.stress, condition));
    setHealth(v => Math.max(0, Math.min(100, v + wear.health)));
  }
  function processFestival() { const festival=world.festival; if(!festival||counts[festival.activity]===0)return; const key=`${year}-${festival.id}`; if(festivalMemories.includes(key))return; setFestivalMemories(v=>[...v,key]); setFunds(v=>v+festival.reward); setLedger(v=>[{week,label:`镇历参与：${festival.title}`,amount:festival.reward,type:'reward'},...v]); setMemories(v=>v+1); setTimeline(v=>[{week,title:`参加${festival.title}`,text:`本周「${festival.activityLabel}」计入。+${festival.reward}。`,kind:'festival'},...v].slice(0,80)); }
  function runWeek(stewardOverride?: StewardWeekResult) {
    if (stayComplete || week > stayLimit) return;
    const finishingStay = week >= stayLimit;
    const reviewed = stewardOverride && Array.isArray(stewardOverride.staff) ? stewardOverride : undefined;
    if (!reviewed) {
      const proposal = proposeStewardWeek({ staff, funds, houseLevel, rooms, cleanliness });
      if (proposal.actions.length) {
        setStewardReview(proposal);
        return;
      }
    }
    const steward = reviewed ?? applyStewardDecisions({ staff, funds, houseLevel, rooms, cleanliness }, []);
    const weekStaff = steward.staff;
    const weekHouse = householdEffects(rooms, weekStaff, houseLevel, { cleanliness, grounds, cooking: cookingSlots, cookingSkill });
    const weekLeisure = resolveLeisureWeek(plan, planChoice, world.weather);
    const settledProject=findProject(activeProject);
    const weekSkill = resolveSkillWeek({ grid: plan, choices: planChoice, progress: skillProgress, houseLevel, rooms, socialSlots: counts.social, projectKind: settledProject?.kind });
    const weekCondition = fitnessConditionAt(fitnessHistory, counts.fitness);
    const weekLoad = composeWellbeing(energy, stress, health, counts, weekHouse, weekSkill, weekLeisure, restMix);
    const weekLoadCapped = applyFitnessConditionCaps(weekLoad.projectedEnergy, weekLoad.projectedStress, weekCondition);
    const wellbeingFactor=wellbeingFactorFrom(weekLoadCapped.energy, weekLoadCapped.stress);
    const earned = behaviorIncome(counts, wellbeingFactor, leanWeeks);
    const nextBookMap={...bookProgressMap};
    const readingIds:string[]=[];
    plan.forEach((row,di)=>row.forEach((key,pi)=>{
      if(key!=='reading') return;
      const id=planChoice[di][pi];
      if(!id||!borrowedBooks.includes(id)||(nextBookMap[id]??0)>=100) return;
      const book=getBook(id);
      if(!book) return;
      readingIds.push(id);
      nextBookMap[id]=Math.min(100,(nextBookMap[id]??0)+readingSlotGain(book.difficulty,weekHouse.readingBonus)*wellbeingFactor);
    }));
    const uniqueReading=[...new Set(readingIds)];
    const firstReading=uniqueReading[0];
    if(world.weather.includes('雨')&&firstReading) nextBookMap[firstReading]=Math.min(100,(nextBookMap[firstReading]??0)+2);
    const nextCourseMap={...courseProgressMap};
    let nextEnrolled=enrolled;
    let nextCompleted=[...completedCourses];
    let nextGrades={...courseGrades};
    let courseReward=0;
    const festival=world.festival;
    const festivalKey=festival?`${year}-${festival.id}`:'';
    const festivalHappens=!!festival&&counts[festival.activity]>0&&!festivalMemories.includes(festivalKey);
    if(festivalHappens&&festival?.activity==='reading'&&firstReading) nextBookMap[firstReading]=Math.min(100,(nextBookMap[firstReading]??0)+6);
    if(academic.inSession&&enrolled.length){
      for(const id of enrolled){
        const slots=getCourse(id)?.meetings.length??0;
        if(!slots) continue;
        const gain=(courseWeeklyBase(slots)+courseReadingSupport(id,uniqueReading,weekHouse.librarian)+weekHouse.researcherCourse)*wellbeingFactor;
        nextCourseMap[id]=Math.min(100,(nextCourseMap[id]??0)+gain);
        if(festivalHappens&&festival?.activity==='course') nextCourseMap[id]=Math.min(100,(nextCourseMap[id]??0)+6);
      }
    }
    let finishedIdsThisWeek:string[]=[];
    let failedIdsThisWeek:string[]=[];
    if(academic.lastTeachingWeek||(academic.holiday&&enrolled.length)){
      const closed=closeTerm(enrolled,nextCourseMap,nextCompleted,nextGrades);
      nextCompleted=closed.nextCompleted;
      nextGrades=closed.nextGrades;
      nextEnrolled=closed.nextEnrolled;
      finishedIdsThisWeek=closed.passed;
      failedIdsThisWeek=closed.failed;
      courseReward=80*finishedIdsThisWeek.length;
      for(const id of failedIdsThisWeek) nextCourseMap[id]=0;
      for(const id of finishedIdsThisWeek){
        const finishedCourse=getCourse(id);
        const grade=gradeFromProgress(nextCourseMap[id]??0);
        setTimeline(v=>[{week,title:`完成${finishedCourse?.title}`,text:`学期结课 · ${grade.letter}（${grade.gpa.toFixed(1)}）。`,kind:'study'},...v].slice(0,80));
      }
      for(const id of failedIdsThisWeek){
        const failedCourse=getCourse(id);
        setTimeline(v=>[{week,title:`未通过${failedCourse?.title}`,text:'学期结束。未达及格线，下学期可选重修。',kind:'study'},...v].slice(0,80));
      }
    }
    const finishedBooks=uniqueReading.filter(id=>(bookProgressMap[id]??0)<100&&(nextBookMap[id]??0)>=100);
    for(const id of finishedBooks){
      const book=getBook(id);
      if(book) setTimeline(v=>[{week,title:`读完《${book.title}》`,text:'进度 100。节点保留。',kind:'study'},...v].slice(0,80));
    }
    const completedBookIds=finishedIds(nextBookMap);
    const nextSkillProgress = applyEnrolledSkillCourses(enrolled, academic.inSession, nextCompleted, practicePlanSkills(plan, planChoice, nextCompleted, (() => {
      const seeded = { ...skillProgress };
      for (const courseId of finishedIdsThisWeek) {
        const skill = courseSkill(courseId);
        if (skill) seeded[skill.id] = Math.max(20, seeded[skill.id] ?? 0);
      }
      return seeded;
    })(), completedBookIds, rooms, wellbeingFactor, enrolled), completedBookIds, wellbeingFactor);
    const workTick=applyCreativeWeek(weekSkill.practiced,nextSkillProgress,activeWorks,archivedWorks,week);
    const gatheringTitles:string[]=[];
    if(counts.social>0){
      plan.forEach((row,di)=>row.forEach((key,pi)=>{
        if(key!=='social') return;
        const chosen=getGathering(planChoice[di][pi]||'tea');
        const gathering=gatheringUnlockStatus(chosen,progressionContext).unlocked?chosen:getGathering('tea');
        gatheringTitles.push(gathering.title);
      }));
    }
    const gatheringTitle=[...new Set(gatheringTitles)].join('、')||getGathering(gatheringKind).title;
    const gatherCost=weekGatheringCost(plan, planChoice, progressionContext);
    const gatheringGuestsCount=weekMaxGuests(plan, planChoice, sociability, week, world.weather, weekHouse.guestIndoor, progressionContext);
    const projectSlots=projectWorkSlots(plan,planChoice);
    const magicClassSlots=magicMeetings(activeProject,enrolled,academic.inSession).length;
    const magicActive=!!magicProgramDetails(activeProject);
    const projectBase=settledProject
      ?(magicActive
        ?magicProjectWeekBase(settledProject,projectSlots,magicClassSlots,counts)
        :cottageProjectWeekBase(settledProject,projectSlots,weekHouse,counts))
      :0;
    const projectGain=settledProject?(projectBase+weekSkill.project)*wellbeingFactor:0;
    const projectBefore=settledProject?(projectProgress[settledProject.id]??0):0;
    const projectAfter=settledProject?Math.min(100,projectBefore+projectGain):0;
    const projectFinished=!!settledProject&&projectBefore<100&&projectAfter>=100;
    const projectReward=projectFinished&&settledProject?settledProject.reward:0;
    const nextCompletedProjects=projectFinished&&settledProject&&!completedProjects.includes(settledProject.id)
      ?[...completedProjects,settledProject.id]
      :completedProjects;
    const freshMagicTitles=newlyUnlockedMagicTitles(nextCompletedProjects,magicTitles);
    const magicTitleReward=magicTitleRewardTotal(freshMagicTitles.map(item=>item.id));
    if(settledProject&&projectGain>0){
      setProjectProgress(v=>({...v,[settledProject.id]:projectAfter}));
      if(projectFinished){
        setCompletedProjects(v=>v.includes(settledProject.id)?v:[...v,settledProject.id]);
        setActiveProject(null);
        const magicProgram=magicProgramDetails(settledProject.id);
        setTimeline(v=>[{week,title:magicProgram?`获得《${settledProject.title}》${magicProgram.award}`:`完成《${settledProject.title}》`,text:`结项。发放 ${settledProject.reward}。${magicProgram?'证书已收入藏书室。':''}`,kind:'project'},...v].slice(0,80));
      }
    }
    if(freshMagicTitles.length){
      const ids=freshMagicTitles.map(item=>item.id);
      setMagicTitles(v=>[...v,...ids]);
      setEquippedMagicTitle(current=>preferredMagicTitle([...magicTitles,...ids],ids)||current);
      setTimeline(v=>[{week,title:`议席授号：${freshMagicTitles.map(item=>item.title).join('、')}`,text:`星穹议席依你的修习组合授予封号，并发放 ${magicTitleReward.toLocaleString()}。`,kind:'magic'},...v].slice(0,80));
      setCelebrateQueue(queue=>[...queue,...celebrateFromTitles(ids)]);
    }
    const festivalReward=festivalHappens&&festival?festival.reward:0;
    const doneBooks=finishedIds(nextBookMap);
    const settledPrograms=newlyCompletedPrograms(nextCompleted,declaredProgram,programDiplomas);
    const magicDiploma=projectFinished&&settledProject?buildMagicDiploma(settledProject.id,year,weekOfYear):undefined;
    const weekDiplomas=[...settledPrograms.map(program=>buildDiploma(program,nextCompleted,nextGrades,year,weekOfYear)),...(magicDiploma?[magicDiploma]:[])];
    const nextDiplomas=mergeDiplomas(programDiplomas,weekDiplomas);
    const newCertificates=weekDiplomas.filter(item=>item.kind==='certificate').length;
    const newDegrees=weekDiplomas.filter(item=>item.kind==='degree'||item.kind==='master'||item.kind==='doctorate'||item.kind==='general').length;
    const diplomaReward=programCompletionTotal(settledPrograms);
    const cash=settleCash({funds:steward.funds+earned+courseReward+diplomaReward+projectReward+magicTitleReward+weekSkill.funds+workTick.completionReward,living:BASE_LIVING+weekHouse.upkeep,leisure:weekLeisure.cost,gathering:gatherCost,leanWeeks,debt:livingDebt});
    const actualLeisure=cash.leisurePaid?weekLeisure:resolveLeisureWeek(plan,planChoice,world.weather,{allowPaid:false});
    const actualGuests=cash.gatheringPaid?gatheringGuestsCount:0;
    const mealTick=tickSatiety({satiety,rooms,staff:weekStaff,cooking:cookingSlots,cookingSkill,dineOut:leisureDineCount(actualLeisure),...gatheringFoodSlots(plan,planChoice,cash.gatheringPaid)});
    const settledLoad=applyHardshipWellbeing(composeWellbeing(energy,stress,health,counts,withSatiety(weekHouse,mealTick.satiety),weekSkill,actualLeisure,restMix),cash.nextLeanWeeks);
    const socialGain=socialWeekGain({socialSlots:counts.social,guests:actualGuests,passedCourses:finishedIdsThisWeek.length,newCertificates,newDegrees,festivalSocial:!!(festivalHappens&&festival?.activity==='social'),leisureSocial:actualLeisure.social,skillSocial:weekSkill.social});
    const nextSocial=socialAfterWeek(sociability,socialIdle,socialGain);
    const socialAfterHardship=clampSocial(nextSocial.sociability+hardshipWear(cash.nextLeanWeeks).social);
    const achievementCandidates=['first-week',...(doneBooks.length?['book-finished']:[]),...(doneBooks.length>=5?['five-books']:[]),...(completedCertificates(nextDiplomas).length?['first-certificate']:[]),...(socialAfterHardship>=50?['trusted-friend']:[]),...skillAchievementIds(nextSkillProgress),...workAchievementIds(workTick.archived)];
    const freshAchievements=achievementCandidates.filter(id=>!achievements.includes(id));
    const achievementReward=freshAchievements.reduce((sum,id)=>sum+(achievementById(id)?.reward??0),0);
    const rewards=courseReward+diplomaReward+projectReward+magicTitleReward+workTick.completionReward+festivalReward+achievementReward;
    const homeTick=tickHomeWeek({cleanliness,grounds,houseLevel,rooms,staff:weekStaff,chores:choreSlots,cooking:cookingSlots,cookingSkill,social:counts.social,guests:actualGuests});
    const wornHome=applyHardshipHome(homeTick.cleanliness,homeTick.grounds,cash.nextLeanWeeks);
    const quit=cash.unpaidLiving>0?quitUnpaidStaff(weekStaff,hardshipQuitCount(cash.nextLeanWeeks)):{staff:weekStaff,names:[] as string[]};
    let nextHouseLevel=houseLevel;
    let nextStaff=quit.staff;
    let nextClean=wornHome.cleanliness;
    let nextGrounds=wornHome.grounds;
    const reclaimNotes:string[]=[];
    let nextLeanWeeks=cash.nextLeanWeeks;
    let nextDebt=cash.nextDebt;
    if(shouldWarnReclaim(nextLeanWeeks,nextHouseLevel)){
      reclaimNotes.push(reclaimWarning(nextLeanWeeks));
    }
    if(shouldReclaimHouse(nextLeanWeeks,nextHouseLevel)){
      const taken=applyHouseReclaim(nextHouseLevel,nextStaff,nextClean,nextGrounds);
      if(taken.reclaimed){
        nextHouseLevel=taken.houseLevel;
        nextStaff=taken.staff;
        nextClean=taken.cleanliness;
        nextGrounds=taken.grounds;
        nextLeanWeeks=RECLAIM_LEAN_RESET;
        reclaimNotes.push(...taken.notices);
        const cap=householdEffects(taken.rooms,nextStaff,nextHouseLevel).borrowLimit;
        const trimmed=trimBorrowedToCap(borrowedBooks,cap,readingFocus);
        if(trimmed.returned.length){
          setBorrowedBooks(trimmed.books);
          if(!trimmed.books.includes(readingFocus)){
            setReadingFocus(trimmed.books[0]??'');
            setPlanChoice(grid=>grid.map((row,di)=>row.map((value,pi)=>plan[di][pi]==='reading'&&!trimmed.books.includes(value)?(trimmed.books[0]??''):value)));
          }
          reclaimNotes.push(`借阅超额，已退回 ${trimmed.returned.length} 本`);
        }
        setHouseLevel(nextHouseLevel);
        setTimeline(v=>[{week,title:`收回${taken.fromName}`,text:`管理局收回整栋房屋。只留这块地。现为荒地。`,kind:'home'},...v].slice(0,80));
      }
    }
    const closingBeforeAutomaticRewards=cash.closing;
    const closingFunds=closingBeforeAutomaticRewards+festivalReward+achievementReward;
    const moneyEntries:LedgerEntry[]=[
      ...steward.ledger.map(entry=>({week,label:entry.label,amount:entry.amount,type:'expense' as const})),
      ...actualLeisure.ledger.map(entry=>({week,label:entry.label,amount:entry.amount,type:'expense' as const})),
      {week,label:incomeLedgerLabel(leanWeeks),amount:earned,type:'income'},
      ...(weekSkill.funds?[{week,label:'技能：陶艺',amount:weekSkill.funds,type:'income' as const}]:[]),
      ...(workTick.completionReward?[{week,label:`完成作品：${workTick.finished.map(work=>`《${work.title}》`).join('、')}`,amount:workTick.completionReward,type:'reward' as const}]:[]),
      {week,label:cash.unpaidLiving?'生活维护（部分）':'生活维护',amount:-cash.paidLiving,type:'expense'},
      ...(cash.paidGathering?[{week,label:`聚会：${gatheringTitle}`,amount:-cash.paidGathering,type:'expense' as const}]:[]),
      ...finishedIdsThisWeek.map(id=>({week,label:`完成课程：${getCourse(id)?.title??id}`,amount:80,type:'reward' as const})),
      ...settledPrograms.map(program=>{const pay=programCompletionLedger(program);return {week,label:pay.label,amount:pay.amount,type:'reward' as const};}),
      ...(projectReward&&settledProject?[{week,label:(magicCompletionLedger(settledProject.id)?.label)??`完成项目：${settledProject.title}`,amount:projectReward,type:'reward' as const}]:[]),
      ...freshMagicTitles.map(item=>({week,label:`议席授号：${item.title}`,amount:item.reward,type:'reward' as const})),
    ];
    setFunds(closingBeforeAutomaticRewards);
    setLedger(v=>[...moneyEntries,...v]);
    setEnergy(clampEnergyToCondition(settledLoad.projectedEnergy, weekCondition));
    setStress(clampStressToCondition(settledLoad.projectedStress+(nextHouseLevel!==houseLevel?10:0), weekCondition));
    setHealth(settledLoad.projectedHealth);
    setFitnessHistory(pushFitnessHistory(fitnessHistory, counts.fitness));
    setCleanliness(nextClean); setGrounds(nextGrounds); setSatiety(mealTick.satiety);
    setStaff(nextStaff);
    setLeanWeeks(nextLeanWeeks);
    setLivingDebt(nextDebt);
    setBookProgressMap(nextBookMap);
    setCourseProgressMap(nextCourseMap);
    setSkillProgress(nextSkillProgress);
    setActiveWorks(workTick.active);
    setArchivedWorks(workTick.archived);
    setCourseGrades(nextGrades);
    setEnrolled(nextEnrolled);
    setCompletedCourses(nextCompleted);
    if(nextEnrolled.length&&!nextEnrolled.includes(studyFocus)) setStudyFocus(nextEnrolled[0]);
    setSociability(socialAfterHardship);
    setSocialIdle(nextSocial.idle);
    processWeather(nextHouseLevel, weekCondition); processFestival();
    if(actualGuests>0) setMemories(v=>v+1);
    const care=weekLoadCapped.energy<25||weekLoadCapped.stress>75?' 舒缓模式：效率下降，进度保留。':'';
    const fitnessNote=weekCondition.id==='adequate'?'':` ${fitnessConditionBanner(weekCondition)}`;
    const brokeNote=nextHouseLevel!==houseLevel?` 管理局收回整栋房屋，只留荒地。`:nextLeanWeeks?' 管理局催缴，配给缩水。':'';
    const gatherNote=counts.social===0?'':actualGuests>0?` / ${gatheringTitle} 到了 ${actualGuests} 人`:` / ${gatheringTitle} 无人到场`;
    for(const work of workTick.finished){
      setTimeline(v=>[{week,title:`完成《${work.title}》`,text:`${work.formTitle} · ${work.lengthLabel} · ${work.slots} 时段。已留档，完成奖励 ${work.reward ?? 0}。`,kind:'work'},...v].slice(0,80));
    }
    setTimeline(v=>[{week,title:`Y${year} ${season} W${weekOfYear} 结算`,text:`${world.weather} ${world.temperature}°C。阅读 ${counts.reading} / 课程 ${counts.course} / 健身 ${counts.fitness} / 创作 ${counts.project}${gatherNote}。${care}${fitnessNote}${brokeNote}`,kind:'week'},...v].slice(0,80));
    grant(achievementCandidates);
    const changes:WeekChange[]=[];
    for(const id of uniqueReading){
      const before=bookProgressMap[id]??0;
      const after=nextBookMap[id]??0;
      if(after!==before) changes.push({label:`《${getBook(id)?.title??id}》`,before,after,unit:'%'});
    }
    for(const id of enrolled){
      const before=courseProgressMap[id]??0;
      const after=nextCourseMap[id]??0;
      if(after!==before) changes.push({label:getCourse(id)?.title??id,before,after,unit:'%'});
    }
    for(const skill of skillCatalog){
      const before=skillProgress[skill.id]??0;
      const after=nextSkillProgress[skill.id]??0;
      if(after!==before)changes.push({
        label: skillLevel(before)===skillLevel(after) ? `技能 · ${skill.title}` : `技能 · ${skill.title} · ${skillLevel(before)}→${skillLevel(after)}`,
        before: skillUpgradeRemaining(before),
        after: skillUpgradeRemaining(after),
        unit:'%',
        invert: skillLevel(before)===skillLevel(after),
        remaining: true,
      });
    }
    if(settledProject&&projectAfter!==projectBefore) changes.push({label:settledProject.title,before:projectBefore,after:projectAfter,unit:'%'});
    for(const skillId of CREATIVE_SKILL_IDS){
      const beforeWork=activeWorks[skillId];
      const afterWork=workTick.active[skillId];
      const done=workTick.finished.filter(work=>work.skillId===skillId);
      if(done.length){
        const last=done[done.length-1];
        changes.push({label:`作品 · ${last.title}`,before:beforeWork?.progress??0,after:last.slots,unit:'时段'});
      }else if(afterWork&&afterWork.progress!==(beforeWork?.progress??0)){
        changes.push({label:`作品 · ${afterWork.title}`,before:beforeWork?.progress??0,after:afterWork.progress,unit:'时段'});
      }
    }
    if(socialAfterHardship!==sociability) changes.push({label:'社交度',before:sociability,after:socialAfterHardship});
    if(nextClean!==cleanliness) changes.push({label:'清洁度',before:cleanliness,after:nextClean});
    if(mealTick.satiety!==satiety) changes.push({label:'饱食',before:satiety,after:mealTick.satiety});
    if(nextGrounds!==grounds) changes.push({label:'园景',before:grounds,after:nextGrounds});
    if(nextHouseLevel!==houseLevel) changes.push({label:'地产',before:houseLevel,after:nextHouseLevel});
    const notices=[
      ...(finishingStay?[`${duration}年驻留期满，档案封存`]:[]),
      ...(finishedIdsThisWeek.length||failedIdsThisWeek.length?[`${academic.name}已结课，成绩另报`]:[]),
      ...settledPrograms.map(program=>`${programKindLabel(program.kind)}已结项：${program.title}，发放 ${programCompletionReward(program)}`),
      ...finishedBooks.map(id=>`读完：《${getBook(id)?.title??id}》`),
      ...finishedIdsThisWeek.flatMap(id=>{const skill=courseSkill(id);return skill?[`解锁技能练习：${skill.title}`]:[];}),
      ...(projectFinished&&settledProject?[`课题结项：《${settledProject.title}》`]:[]),
      ...freshMagicTitles.map(item=>`议席授号：${item.title}，发放 ${item.reward.toLocaleString()}`),
      ...(festivalHappens&&festival?[`参加镇历活动：${festival.title}`]:[]),
      ...freshAchievements.map(id=>`里程碑：${achievementById(id)?.title??id}`),
      ...(uniqueReading.length===0&&counts.reading>0?['阅读时段未生效：当前没有可读的借阅书籍。']:[]),
      ...cash.notices,
      ...reclaimNotes,
      ...(quit.names.length?[ `欠薪离任：${quit.names.join('、')}` ]:[]),
      ...steward.notices,
      ...actualLeisure.notices,
      ...weekSkill.notices,
      ...workTick.notices,
      ...homeTick.notices,
      ...mealTick.notices,
      ...houseWeekNotices(counts,roomsAtLevel(nextHouseLevel),nextStaff),
    ];
    const termReport=buildTermReport(finishedIdsThisWeek,failedIdsThisWeek,nextCourseMap,nextGrades,year,weekOfYear);
    setProgramDiplomas(nextDiplomas);
    setAcademicQueue([
      ...(termReport?[{type:'term' as const,report:termReport}]:[]),
      ...weekDiplomas.map(report=>({type:'diploma' as const,report})),
    ]);
    setWeekSettlement({week,counts:{...counts},money:{opening:funds,earned:earned+weekSkill.funds,expenses:cash.paidLiving+cash.paidLeisure+cash.paidGathering,rewards,closing:closingFunds},changes,notices,gathering:counts.social>0?{title:gatheringTitle,guests:actualGuests}:null,leanWeeks:nextLeanWeeks});
    if (finishingStay) {
      setStayComplete(true);
      setTimeline(v=>[{week,title:'驻留期满',text:`${duration}年驻留结束。档案已封存。可在档案页重新开局。`,kind:'arrival'},...v].slice(0,80));
    } else {
      setWeek(v => v + 1);
    }
    setReport(true);
  }
  useEffect(() => { if(!ENABLE_STORY_EVENT_MODAL) return; if(report&&!pendingEvent) setPendingEvent(chooseStoryEvent(counts,Math.max(1,week-1))); }, [report, pendingEvent, counts, week]);
  function resolveStory(choice:StoryChoice) { const e=choice.effects; const title=pendingEvent?.title??'事件记录'; const clamp=(value:number)=>Math.max(0,Math.min(100,value)); if(e.funds){setFunds(v=>Math.max(0,v+e.funds!));setLedger(v=>[{week,label:`事件：${title}`,amount:e.funds!,type:e.funds!>=0?'reward':'expense'},...v]);} if(e.book&&borrowedBooks.includes(readingFocus))setBookProgressMap(v=>({...v,[readingFocus]:clamp((v[readingFocus]??0)+e.book!)})); if(e.course){const id=[...enrolled].sort((a,b)=>(courseProgressMap[a]??0)-(courseProgressMap[b]??0))[0]; if(id) setCourseProgressMap(v=>({...v,[id]:clamp((v[id]??0)+e.course!)}));} if(e.friendship||e.trust){setSociability(v=>clamp(v+(e.friendship??0)+(e.trust??0)));setSocialIdle(0);setMemories(v=>v+1);} if(e.energy)setEnergy(v=>clampEnergyToCondition(v+e.energy!, fitnessCondition)); if(e.stress)setStress(v=>clampStressToCondition(v+e.stress!, fitnessCondition)); if(e.health)setHealth(v=>clamp(v+e.health!)); setTimeline(v=>[{week,title,text:choice.outcome,kind:'story'},...v].slice(0,80)); setStoryOutcome({title,choice}); setPendingEvent(null); }
  function acceptInvite() { setPendingInvite(false); setView('station'); }
  function takeTrip(id: string, weeks: number) {
    const dest = getTravel(id);
    const stay = getTravelStay(dest, weeks);
    if (!stay || funds < stay.cost) return;
    if (!prerequisiteStatus(dest.prerequisites, progressionContext).unlocked) return;
    if (stayComplete || week + weeks > stayLimit) return;
    const clamp = (value: number) => Math.max(0, Math.min(100, value));
    let simWeek = week;
    let simFunds = funds - stay.cost;
    let simEnergy = energy;
    let simStress = stress;
    let simHealth = health;
    let simFitnessHistory = [...fitnessHistory];
    let simClean = cleanliness;
    let simGrounds = grounds;
    let simSatiety = satiety;
    let simLeanWeeks = leanWeeks;
    let simDebt = livingDebt;
    let simHouseLevel = houseLevel;
    let simStaff = [...staff];
    let simSocial = sociability;
    let simIdle = socialIdle;
    let simEnrolled = [...enrolled];
    let simCompleted = [...completedCourses];
    let simGrades = { ...courseGrades };
    const simCourses = { ...courseProgressMap };
    let simDiplomas = { ...programDiplomas };
    const simSkills = { ...skillProgress };
    let simBooks = { ...bookProgressMap };
    let simBorrowed = [...borrowedBooks];
    let simReading = readingFocus;
    let homeUpkeep = 0;
    const hostedAcademic: Array<{ type: 'term'; report: TermReport } | { type: 'diploma'; report: DiplomaReport }> = [];
    const ledgerEntries: LedgerEntry[] = [{ week, label: `旅行：${dest.title} · ${stay.label}`, amount: -stay.cost, type: 'expense' }];
    for (let step = 0; step < weeks; step += 1) {
      const simTerm = academicTerm(((simWeek - 1) % 52) + 1);
      const worldAtWeek = getWorldState(simWeek);
      const fx = travelWeekEffects(dest, worldAtWeek.season);
      const simRooms = roomsAtLevel(simHouseLevel);
      const steward = applyStewardWeek({ staff: simStaff, funds: simFunds, houseLevel: simHouseLevel, rooms: simRooms, cleanliness: simClean });
      simStaff = steward.staff;
      simFunds = steward.funds;
      if (steward.ledger.length) ledgerEntries.unshift(...steward.ledger.map(entry => ({ week: simWeek, label: entry.label, amount: entry.amount, type: 'expense' as const })));
      const weekHouse = householdEffects(simRooms, simStaff, simHouseLevel, { cleanliness: simClean, grounds: simGrounds });
      const cash = settleCash({ funds: simFunds, living: BASE_LIVING + weekHouse.upkeep, leisure: 0, gathering: 0, leanWeeks: simLeanWeeks, debt: simDebt });
      simFunds = cash.closing;
      simLeanWeeks = cash.nextLeanWeeks;
      simDebt = cash.nextDebt;
      homeUpkeep += cash.paidLiving;
      if (cash.paidLiving) ledgerEntries.unshift({ week: simWeek, label: cash.unpaidLiving ? '旅行宅维护（部分）' : '旅行宅维护', amount: -cash.paidLiving, type: 'expense' });
      const homeTick = tickHomeWeek({ cleanliness: simClean, grounds: simGrounds, houseLevel: simHouseLevel, rooms: simRooms, staff: simStaff, chores: 0, cooking: 0, social: 0, guests: 0 });
      const wornHome = applyHardshipHome(homeTick.cleanliness, homeTick.grounds, cash.nextLeanWeeks);
      simClean = wornHome.cleanliness;
      simGrounds = wornHome.grounds;
      simSatiety = tickSatiety({ satiety: simSatiety, rooms: simRooms, staff: simStaff, cooking: 0, dineOut: 0, mealsOut: 0, away: true }).satiety;
      if (cash.unpaidLiving > 0) simStaff = quitUnpaidStaff(simStaff, hardshipQuitCount(cash.nextLeanWeeks)).staff;
      if (shouldReclaimHouse(cash.nextLeanWeeks, simHouseLevel)) {
        const taken = applyHouseReclaim(simHouseLevel, simStaff, simClean, simGrounds);
        if (taken.reclaimed) {
          simHouseLevel = taken.houseLevel;
          simStaff = taken.staff;
          simClean = taken.cleanliness;
          simGrounds = taken.grounds;
          simLeanWeeks = RECLAIM_LEAN_RESET;
          const cap = householdEffects(taken.rooms, simStaff, simHouseLevel).borrowLimit;
          const trimmed = trimBorrowedToCap(simBorrowed, cap, simReading);
          simBorrowed = trimmed.books;
          if (!simBorrowed.includes(simReading)) simReading = simBorrowed[0] ?? '';
        }
      }
      simEnergy = clamp(simEnergy + fx.energy);
      simStress = clamp(simStress + fx.stress);
      simHealth = clamp(simHealth + fx.health);
      const travelCondition = fitnessConditionAt(simFitnessHistory, 0);
      const cappedTravel = applyFitnessConditionCaps(simEnergy, simStress, travelCondition);
      simEnergy = cappedTravel.energy;
      simStress = cappedTravel.stress;
      simFitnessHistory = pushFitnessHistory(simFitnessHistory, 0);
      simSocial = clampSocial(simSocial + fx.social);
      if (fx.social > 0) simIdle = 0;
      const readable = readableBorrowed(simBorrowed, simBooks);
      const readingId = readable.includes(simReading) ? simReading : readable[0];
      if (fx.reading && readingId) simBooks[readingId] = Math.min(100, (simBooks[readingId] ?? 0) + fx.reading);
      for (const practice of dest.skill ?? []) {
        if (!skillUnlocked(skillById[practice.id], simCompleted)) continue;
        const cap = skillPracticeCap(skillById[practice.id], simCompleted, finishedIds(simBooks));
        simSkills[practice.id] = Math.min(cap, (simSkills[practice.id] ?? 0) + scaledSkillGain(practice.amount, simSkills[practice.id] ?? 0));
      }
      if (simTerm.lastTeachingWeek || (simTerm.holiday && simEnrolled.length)) {
        const closed = closeTerm(simEnrolled, simCourses, simCompleted, simGrades);
        simCompleted = closed.nextCompleted;
        simGrades = closed.nextGrades;
        simEnrolled = closed.nextEnrolled;
        for (const courseId of closed.failed) simCourses[courseId] = 0;
        const simYear = Math.floor((simWeek - 1) / 52) + 1;
        const simWeekOfYear = ((simWeek - 1) % 52) + 1;
        const hostedTerm = buildTermReport(closed.passed, closed.failed, simCourses, simGrades, simYear, simWeekOfYear);
        if (hostedTerm) hostedAcademic.push({ type: 'term', report: hostedTerm });
        const weekPrograms = newlyCompletedPrograms(simCompleted, declaredProgram, simDiplomas);
        for (const program of weekPrograms) {
          const report = buildDiploma(program, simCompleted, simGrades, simYear, simWeekOfYear);
          simDiplomas = mergeDiplomas(simDiplomas, [report]);
          hostedAcademic.push({ type: 'diploma', report });
          const pay = programCompletionLedger(program);
          simFunds += pay.amount;
          ledgerEntries.unshift({ week: simWeek, label: pay.label, amount: pay.amount, type: 'reward' });
        }
      }
      simWeek += 1;
    }
    setFunds(simFunds);
    setLeanWeeks(simLeanWeeks);
    setLivingDebt(simDebt);
    setEnergy(simEnergy);
    setStress(simStress);
    setHealth(simHealth);
    setFitnessHistory(simFitnessHistory);
    setCleanliness(simClean);
    setGrounds(simGrounds);
    setSatiety(simSatiety);
    setHouseLevel(simHouseLevel);
    setStaff(simStaff);
    setBorrowedBooks(simBorrowed);
    setReadingFocus(simReading);
    setSociability(simSocial);
    setSocialIdle(simIdle);
    setEnrolled(simEnrolled);
    setCompletedCourses(simCompleted);
    setCourseGrades(simGrades);
    setCourseProgressMap(simCourses);
    setProgramDiplomas(simDiplomas);
    setSkillProgress(simSkills);
    setBookProgressMap(simBooks);
    setStudyFocus(current => simEnrolled.includes(current) ? current : (simEnrolled[0] ?? current));
    setAcademicQueue(hostedAcademic);
    setLedger(v => [...ledgerEntries, ...v]);
    setTravelCount(v => v + 1);
    setMemories(v => v + 1);
    setWeek(simWeek);
    setTimeline(v => [{ week, title: dest.title, text: `${dest.scene} ${stay.label}。票价 ${stay.cost}。宅维护 ${homeUpkeep}。${simHouseLevel!==houseLevel?` 旅途中房屋被收回，只留荒地。`:''}`, kind: 'travel' }, ...v].slice(0, 80));
    grant(['first-trip']);
    setView('cottage');
    setTravelReport({ mode: 'travel', id: dest.id, weeks: stay.weeks, cost: stay.cost, upkeep: homeUpkeep, stayLabel: stay.label, energy, stress, health, nextEnergy: simEnergy, nextStress: simStress, nextHealth: simHealth });
  }
  function takeExpedition(id: string) {
    if (stayComplete) return;
    const route = getExpedition(id);
    const remainingWeeks = duration * 52 - week;
    const issues = expeditionStartIssues(route, { funds, remainingWeeks, energy, health, sociability, season: world.season, context: progressionContext });
    if (issues.length) return;
    const clamp = (value: number) => Math.max(0, Math.min(100, value));
    const withCompanion = expeditionHasCompanion(route, sociability);
    let simWeek = week;
    let simFunds = funds - route.gearCost;
    let simEnergy = energy;
    let simStress = stress;
    let simHealth = health;
    let simFitnessHistory = [...fitnessHistory];
    let simClean = cleanliness;
    let simGrounds = grounds;
    let simSatiety = satiety;
    let simLeanWeeks = leanWeeks;
    let simDebt = livingDebt;
    let simHouseLevel = houseLevel;
    let simStaff = [...staff];
    let simSocial = sociability;
    let simIdle = socialIdle;
    let simEnrolled = [...enrolled];
    let simCompleted = [...completedCourses];
    let simGrades = { ...courseGrades };
    const simCourses = { ...courseProgressMap };
    let simDiplomas = { ...programDiplomas };
    const simSkills = { ...skillProgress };
    let simBooks = { ...bookProgressMap };
    let simBorrowed = [...borrowedBooks];
    let simReading = readingFocus;
    let homeUpkeep = 0;
    let walked = 0;
    let success = true;
    const notes: string[] = [];
    const hostedAcademic: Array<{ type: 'term'; report: TermReport } | { type: 'diploma'; report: DiplomaReport }> = [];
    const ledgerEntries: LedgerEntry[] = [{ week, label: `远征装备：${route.title}`, amount: -route.gearCost, type: 'expense' }];
    for (let step = 0; step < route.weeks; step += 1) {
      const simTerm = academicTerm(((simWeek - 1) % 52) + 1);
      const simRooms = roomsAtLevel(simHouseLevel);
      const steward = applyStewardWeek({ staff: simStaff, funds: simFunds, houseLevel: simHouseLevel, rooms: simRooms, cleanliness: simClean });
      simStaff = steward.staff;
      simFunds = steward.funds;
      if (steward.ledger.length) ledgerEntries.unshift(...steward.ledger.map(entry => ({ week: simWeek, label: entry.label, amount: entry.amount, type: 'expense' as const })));
      const weekHouse = householdEffects(simRooms, simStaff, simHouseLevel, { cleanliness: simClean, grounds: simGrounds });
      const cash = settleCash({ funds: simFunds, living: BASE_LIVING + weekHouse.upkeep, leisure: 0, gathering: 0, leanWeeks: simLeanWeeks, debt: simDebt });
      simFunds = cash.closing;
      simLeanWeeks = cash.nextLeanWeeks;
      simDebt = cash.nextDebt;
      homeUpkeep += cash.paidLiving;
      if (cash.paidLiving) ledgerEntries.unshift({ week: simWeek, label: cash.unpaidLiving ? '远征宅维护（部分）' : '远征宅维护', amount: -cash.paidLiving, type: 'expense' });
      const homeTick = tickHomeWeek({ cleanliness: simClean, grounds: simGrounds, houseLevel: simHouseLevel, rooms: simRooms, staff: simStaff, chores: 0, cooking: 0, social: 0, guests: 0 });
      const wornHome = applyHardshipHome(homeTick.cleanliness, homeTick.grounds, cash.nextLeanWeeks);
      simClean = wornHome.cleanliness;
      simGrounds = wornHome.grounds;
      simSatiety = tickSatiety({ satiety: simSatiety, rooms: simRooms, staff: simStaff, cooking: 0, dineOut: 0, mealsOut: 0, away: true }).satiety;
      if (cash.unpaidLiving > 0) simStaff = quitUnpaidStaff(simStaff, hardshipQuitCount(cash.nextLeanWeeks)).staff;
      if (shouldReclaimHouse(cash.nextLeanWeeks, simHouseLevel)) {
        const taken = applyHouseReclaim(simHouseLevel, simStaff, simClean, simGrounds);
        if (taken.reclaimed) {
          simHouseLevel = taken.houseLevel;
          simStaff = taken.staff;
          simClean = taken.cleanliness;
          simGrounds = taken.grounds;
          simLeanWeeks = RECLAIM_LEAN_RESET;
          const cap = householdEffects(taken.rooms, simStaff, simHouseLevel).borrowLimit;
          const trimmed = trimBorrowedToCap(simBorrowed, cap, simReading);
          simBorrowed = trimmed.books;
          if (!simBorrowed.includes(simReading)) simReading = simBorrowed[0] ?? '';
          notes.push('房屋被收回，只留荒地');
        }
      }
      const wear = expeditionWeekWear(route, simSkills[route.skillId] ?? 0, withCompanion);
      simEnergy = clamp(simEnergy + wear.energy);
      simStress = clamp(simStress + wear.stress);
      simHealth = clamp(simHealth + wear.health);
      const expeditionCondition = fitnessConditionAt(simFitnessHistory, 0);
      const cappedExpedition = applyFitnessConditionCaps(simEnergy, simStress, expeditionCondition);
      simEnergy = cappedExpedition.energy;
      simStress = cappedExpedition.stress;
      simFitnessHistory = pushFitnessHistory(simFitnessHistory, 0);
      if (wear.social) {
        simSocial = clampSocial(simSocial + wear.social);
        simIdle = 0;
      }
      if (skillUnlocked(skillById[wear.skillId], simCompleted)) {
        const cap = skillPracticeCap(skillById[wear.skillId], simCompleted, finishedIds(simBooks));
        simSkills[wear.skillId] = Math.min(cap, (simSkills[wear.skillId] ?? 0) + scaledSkillGain(wear.skill, simSkills[wear.skillId] ?? 0));
      }
      if (simTerm.lastTeachingWeek || (simTerm.holiday && simEnrolled.length)) {
        const closed = closeTerm(simEnrolled, simCourses, simCompleted, simGrades);
        simCompleted = closed.nextCompleted;
        simGrades = closed.nextGrades;
        simEnrolled = closed.nextEnrolled;
        for (const courseId of closed.failed) simCourses[courseId] = 0;
        const simYear = Math.floor((simWeek - 1) / 52) + 1;
        const simWeekOfYear = ((simWeek - 1) % 52) + 1;
        const hostedTerm = buildTermReport(closed.passed, closed.failed, simCourses, simGrades, simYear, simWeekOfYear);
        if (hostedTerm) hostedAcademic.push({ type: 'term', report: hostedTerm });
        const weekPrograms = newlyCompletedPrograms(simCompleted, declaredProgram, simDiplomas);
        for (const program of weekPrograms) {
          const report = buildDiploma(program, simCompleted, simGrades, simYear, simWeekOfYear);
          simDiplomas = mergeDiplomas(simDiplomas, [report]);
          hostedAcademic.push({ type: 'diploma', report });
          const pay = programCompletionLedger(program);
          simFunds += pay.amount;
          ledgerEntries.unshift({ week: simWeek, label: pay.label, amount: pay.amount, type: 'reward' });
        }
      }
      walked += 1;
      simWeek += 1;
      if (expeditionFailed(route, simEnergy, simHealth)) {
        success = false;
        notes.push(`第 ${walked} 周体力不支，提前折返`);
        break;
      }
    }
    const payout = expeditionPayout(route, success, withCompanion);
    simFunds += payout;
    ledgerEntries.unshift({ week, label: success ? `${route.rewardLabel}：${route.title}` : `返程援助：${route.title}`, amount: payout, type: 'reward' });
    if (success) {
      const note = expeditionFieldNote(route, week, simSkills.writing ?? 0);
      if (note) {
        setArchivedWorks(v => [note, ...v]);
        notes.push(`行记留档：《${note.title}》`);
      }
      setCompletedExpeditions(v => v.includes(route.id) ? v : [...v, route.id]);
    }
    setFunds(simFunds);
    setLeanWeeks(simLeanWeeks);
    setLivingDebt(simDebt);
    setEnergy(simEnergy);
    setStress(simStress);
    setHealth(simHealth);
    setFitnessHistory(simFitnessHistory);
    setCleanliness(simClean);
    setGrounds(simGrounds);
    setSatiety(simSatiety);
    setHouseLevel(simHouseLevel);
    setStaff(simStaff);
    setBorrowedBooks(simBorrowed);
    setReadingFocus(simReading);
    setSociability(simSocial);
    setSocialIdle(simIdle);
    setEnrolled(simEnrolled);
    setCompletedCourses(simCompleted);
    setCourseGrades(simGrades);
    setCourseProgressMap(simCourses);
    setProgramDiplomas(simDiplomas);
    setSkillProgress(simSkills);
    setBookProgressMap(simBooks);
    setStudyFocus(current => simEnrolled.includes(current) ? current : (simEnrolled[0] ?? current));
    setAcademicQueue(hostedAcademic);
    setLedger(v => [...ledgerEntries, ...v]);
    if (withCompanion) setMemories(v => v + 1);
    setWeek(simWeek);
    setTimeline(v => [{ week, title: success ? `完成${route.title}` : `中止${route.title}`, text: `${route.scene} ${walked} 周。装备 ${route.gearCost}。${success ? route.rewardLabel : '返程援助'} ${payout}。宅维护 ${homeUpkeep}。${withCompanion ? '有同伴。' : '独行。'}${notes.length ? notes.join(' ') : ''}`, kind: 'travel' }, ...v].slice(0, 80));
    setView('cottage');
    setTravelReport({ mode: 'expedition', id: route.id, weeks: walked, cost: route.gearCost, upkeep: homeUpkeep, stayLabel: spanLabel(walked), reward: payout, outcome: success ? 'success' : 'fail', companion: withCompanion, notes });
  }
  function upgradeHouse(cost:number) {
    const next=nextHouseTier(houseLevel);
    if(!next||funds<cost||cost!==next.cost)return;
    setFunds(v=>v-cost);
    setLedger(v=>[{week,label:`地产升级：Lv.${next.level} ${next.name}`,amount:-cost,type:'expense'},...v]);
    setHouseLevel(next.level);
    if (next.level === 1) setOriginalHouseYear(current => current || year);
    const shifted = houseUpgradeConditionShift(next.level, cleanliness, grounds);
    setCleanliness(shifted.cleanliness);
    setGrounds(shifted.grounds);
    setTimeline(v=>[{week,title:`升级为 ${next.name}`,text:`${next.sqft}。${addedRoomNames(next)}。${next.level===1?'有了屋顶。':'房屋等级提升。'}`,kind:'home'},...v]);
    if (next.level === 1) grant(['first-room']);
    setHouseUpgrade({ from: houseTierAt(houseLevel), to: next });
  }
  function hire(id:string,cost:number) {
    if(funds<cost)return;
    const person=staffCatalog.find(p=>p.id===id);
    if(!person||!prerequisiteStatus(person.prerequisites,progressionContext).unlocked)return;
    setFunds(v=>v-cost); setLedger(v=>[{week,label:`签约：${person.name}`,amount:-cost,type:'expense'},...v]); setStaff(v=>[...v,id]); setTimeline(v=>[{week,title:`聘请${person.name}`,text:'人事入档。可雇多人，周薪计入维护。',kind:'home'},...v]);
  }
  function fire(id:string) {
    if(!staff.includes(id))return;
    const person=staffById[id as StaffId];
    setStaff(v=>removeOneStaff(v,id));
    setTimeline(v=>[{week,title:`辞退${person?.name??id}`,text:'人事出档。不退签约费。',kind:'home'},...v]);
  }
  function advanceTime(amount:number,label:string) {
    if(stayComplete||week+amount>stayLimit)return;
    let simWeek=week;
    let simFunds=funds;
    let simEnergy=energy;
    let simStress=stress;
    let simHealth=health;
    let simFitnessHistory=[...fitnessHistory];
    let simClean=cleanliness;
    let simGrounds=grounds;
    let simSatiety=satiety;
    let simLeanWeeks=leanWeeks;
    let simDebt=livingDebt;
    let simHouseLevel=houseLevel;
    let simStaff=[...staff];
    let simSocial=sociability;
    let simIdle=socialIdle;
    let simMemories=memories;
    let simBooks={...bookProgressMap};
    let simBorrowed=[...borrowedBooks];
    let simReading=readingFocus;
    const simCourses={...courseProgressMap};
    const simSkills={...skillProgress};
    let simEnrolled=[...enrolled];
    let simCompleted=[...completedCourses];
    let simGrades={...courseGrades};
    const simFestivals=[...festivalMemories];
    let simActive=activeProject;
    const simProjectProgress={...projectProgress};
    let simCompletedProjects=[...completedProjects];
    let simMagicTitles=[...magicTitles];
    let simEquippedTitle=equippedMagicTitle;
    let simArchived=[...archivedWorks];
    let simActiveWorks={...activeWorks};
    let simDiplomas={...programDiplomas};
    let totalEarned=0;
    let totalExpenses=0;
    let totalRewards=0;
    const totalCounts=Object.fromEntries(Object.keys(activities).map(key=>[key,0])) as Record<ActivityKey,number>;
    const notices:string[]=[`沿用日程：${activeTemplate}`];
    const ledgerEntries:LedgerEntry[]=[];
    let simAchievements=[...achievements];
    const hostedAcademic:Array<{type:'term';report:TermReport}|{type:'diploma';report:DiplomaReport}>=[];
    const hostedCelebrations:CelebrateItem[]=[];

    for(let step=0;step<amount;step+=1){
      let postReward=0;
      const weekEnrolled=[...simEnrolled];
      const simTerm=academicTerm(((simWeek-1)%52)+1);
      const simMagic=magicMeetings(simActive,simEnrolled,simTerm.inSession);
      const simPlan=overlayMagicMeetings(overlayCoursePlan(plan,simEnrolled,'course','free',simTerm.inSession),simMagic,'course');
      const simCounts=Object.fromEntries(Object.keys(activities).map(key=>[key,simPlan.flat().filter(item=>item===key).length])) as Record<ActivityKey,number>;
      for(const key of Object.keys(totalCounts) as ActivityKey[]) totalCounts[key]+=simCounts[key];
      const simRooms=roomsAtLevel(simHouseLevel);
      const steward=applyStewardWeek({staff:simStaff,funds:simFunds,houseLevel:simHouseLevel,rooms:simRooms,cleanliness:simClean});
      simStaff=steward.staff;
      simFunds=steward.funds;
      if(steward.ledger.length){
        ledgerEntries.unshift(...steward.ledger.map(entry=>({week:simWeek,label:entry.label,amount:entry.amount,type:'expense' as const})));
        totalExpenses+=steward.ledger.reduce((sum,entry)=>sum-entry.amount,0);
      }
      if(steward.notices.length) notices.push(...steward.notices.map(text=>`Y${Math.floor((simWeek-1)/52)+1} W${((simWeek-1)%52)+1} · ${text}`));
      const weekHouse=householdEffects(simRooms,simStaff,simHouseLevel,{cleanliness:simClean,grounds:simGrounds,cooking:countScheduleOption(simPlan,planChoice,'rest','cooking'),cookingSkill:simSkills.cooking??0});
      const worldAtWeek=getWorldState(simWeek);
      const weekLeisure=resolveLeisureWeek(simPlan,planChoice,worldAtWeek.weather);
      const simProject=simActive?projectCatalog.find(item=>item.id===simActive):undefined;
      const weekSkill=resolveSkillWeek({grid:simPlan,choices:planChoice,progress:simSkills,houseLevel:simHouseLevel,rooms:simRooms,socialSlots:simCounts.social,projectKind:simProject?.kind});
      const simRestMix={nap:countScheduleOption(simPlan,planChoice,'rest','nap'),bath:countScheduleOption(simPlan,planChoice,'rest','bath')};
      const weekCondition=fitnessConditionAt(simFitnessHistory, simCounts.fitness);
      const simLoadNext=composeWellbeing(simEnergy,simStress,simHealth,simCounts,weekHouse,weekSkill,weekLeisure,simRestMix);
      const cappedLoad=applyFitnessConditionCaps(simLoadNext.projectedEnergy, simLoadNext.projectedStress, weekCondition);
      const nextEnergy=cappedLoad.energy;
      const nextStress=cappedLoad.stress;
      const nextHealth=simLoadNext.projectedHealth;
      const factor=wellbeingFactorFrom(nextEnergy, nextStress);
      const earned=behaviorIncome(simCounts,factor,simLeanWeeks);
      const readingIds:string[]=[];
      simPlan.forEach((row,di)=>row.forEach((item,pi)=>{
        if(item!=='reading') return;
        const id=planChoice[di]?.[pi];
        if(!id||!simBorrowed.includes(id)||(simBooks[id]??0)>=100) return;
        const book=getBook(id);
        if(!book) return;
        readingIds.push(id);
        simBooks[id]=Math.min(100,(simBooks[id]??0)+readingSlotGain(book.difficulty,weekHouse.readingBonus)*factor);
      }));
      const uniqueReading=[...new Set(readingIds)];
      if(worldAtWeek.weather.includes('雨')&&uniqueReading[0]) simBooks[uniqueReading[0]]=Math.min(100,(simBooks[uniqueReading[0]]??0)+2);
      const festival=worldAtWeek.festival;
      const festivalKey=festival?`${Math.floor((simWeek-1)/52)+1}-${festival.id}`:'';
      const festivalHappens=!!festival&&simCounts[festival.activity]>0&&!simFestivals.includes(festivalKey);
      if(festivalHappens&&festival?.activity==='reading'&&uniqueReading[0]) simBooks[uniqueReading[0]]=Math.min(100,(simBooks[uniqueReading[0]]??0)+6);
      const finishedCourses:string[]=[];
      const failedCourses:string[]=[];
      if(simTerm.inSession){
        for(const id of simEnrolled){
          const slots=getCourse(id)?.meetings.length??0;
          if(!slots)continue;
          simCourses[id]=Math.min(100,(simCourses[id]??0)+(courseWeeklyBase(slots)+courseReadingSupport(id,uniqueReading,weekHouse.librarian)+weekHouse.researcherCourse)*factor+(festivalHappens&&festival?.activity==='course'?6:0));
        }
      }
      if(simTerm.lastTeachingWeek||(simTerm.holiday&&simEnrolled.length)){
        const closed=closeTerm(simEnrolled,simCourses,simCompleted,simGrades);
        simCompleted=closed.nextCompleted;
        simGrades=closed.nextGrades;
        simEnrolled=closed.nextEnrolled;
        finishedCourses.push(...closed.passed);
        failedCourses.push(...closed.failed);
        for(const id of failedCourses) simCourses[id]=0;
      }
      if(finishedCourses.length){
        const reward=finishedCourses.length*80;
        totalRewards+=reward;
        ledgerEntries.unshift(...finishedCourses.map(id=>({week:simWeek,label:`完成课程：${getCourse(id)?.title??id}`,amount:80,type:'reward' as const})));
        simFunds+=reward;
        for(const courseId of finishedCourses){
          const skill=courseSkill(courseId);
          if(skill)simSkills[skill.id]=Math.max(simSkills[skill.id]??0,20);
        }
      }
      const simYear=Math.floor((simWeek-1)/52)+1;
      const simWeekOfYear=((simWeek-1)%52)+1;
      const hostedTerm=buildTermReport(finishedCourses,failedCourses,simCourses,simGrades,simYear,simWeekOfYear);
      if(hostedTerm){
        hostedAcademic.push({type:'term',report:hostedTerm});
        notices.push(`Y${simYear} W${simWeekOfYear} · ${hostedTerm.termName}已结课，成绩另报`);
      }
      const weekPrograms=newlyCompletedPrograms(simCompleted,declaredProgram,simDiplomas);
      for(const program of weekPrograms){
        const report=buildDiploma(program,simCompleted,simGrades,simYear,simWeekOfYear);
        simDiplomas=mergeDiplomas(simDiplomas,[report]);
        hostedAcademic.push({type:'diploma',report});
        const pay=programCompletionLedger(program);
        simFunds+=pay.amount;
        totalRewards+=pay.amount;
        ledgerEntries.unshift({week:simWeek,label:pay.label,amount:pay.amount,type:'reward'});
        notices.push(`${programKindLabel(program.kind)}已结项：${program.title}，发放 ${pay.amount}`);
      }
      const gatheringCosts=new Map<string,number>();
      const guestCounts:number[]=[];
      if(simCounts.social>0){
        simPlan.forEach((row,di)=>row.forEach((item,pi)=>{
          if(item!=='social') return;
        const chosen=getGathering(planChoice[di]?.[pi]||'tea');
        const gathering=gatheringUnlockStatus(chosen,{...progressionContext,week:simWeek,completedCourses:simCompleted,finishedBooks:finishedIds(simBooks),skillProgress:simSkills,sociability:simSocial,bookProgressMax:maxMappedProgress(simBooks),courseProgressMax:maxMappedProgress(simCourses)}).unlocked?chosen:getGathering('tea');
          gatheringCosts.set(gathering.id,gathering.cost);
          guestCounts.push(adjustGatheringGuests(gatheringGuests(simSocial,simWeek,`${gathering.id}:${di}-${pi}`,worldAtWeek.weather,gathering.indoor),gathering.indoor,weekHouse.guestIndoor));
        }));
      }
      const guests=guestCounts.length?Math.max(...guestCounts):0;
      const gatheringCost=[...gatheringCosts.values()].reduce((sum,value)=>sum+value,0);
      if(simActive){
        const project=findProject(simActive);
        const projectSlots=projectWorkSlots(simPlan,planChoice);
        const magicClassSlots=simMagic.length;
        const magicActive=!!magicProgramDetails(simActive);
        const projectBase=project
          ?(magicActive
            ?magicProjectWeekBase(project,projectSlots,magicClassSlots,simCounts)
            :cottageProjectWeekBase(project,projectSlots,weekHouse,simCounts))
          :0;
        if(project&&(projectSlots>0||(!magicActive&&magicClassSlots>0)||weekSkill.project>0)){
          simProjectProgress[project.id]=Math.min(100,(simProjectProgress[project.id]??0)+(projectBase+weekSkill.project)*factor);
          if(simProjectProgress[project.id]>=100){
            simCompletedProjects=simCompletedProjects.includes(project.id)?simCompletedProjects:[...simCompletedProjects,project.id];
            simActive=null;
            simFunds+=project.reward;
            totalRewards+=project.reward;
            const magicPay=magicCompletionLedger(project.id);
            const magicReport=magicPay?buildMagicDiploma(project.id,simYear,simWeekOfYear):undefined;
            if(magicReport){
              simDiplomas=mergeDiplomas(simDiplomas,[magicReport]);
              hostedAcademic.push({type:'diploma',report:magicReport});
            }
            ledgerEntries.unshift({week:simWeek,label:magicPay?.label??`完成项目：${project.title}`,amount:project.reward,type:'reward'});
            notices.push(`Y${simYear} W${simWeekOfYear} · ${magicPay?`${magicProgramDetails(project.id)?.award}已授予：${project.title}`:`课题结项：《${project.title}》`}${magicReport?'，证书已收入藏书室':''}`);
            const freshTitles=newlyUnlockedMagicTitles(simCompletedProjects,simMagicTitles);
            if(freshTitles.length){
              const ids=freshTitles.map(item=>item.id);
              const titlePay=magicTitleRewardTotal(ids);
              simMagicTitles=[...simMagicTitles,...ids];
              simEquippedTitle=preferredMagicTitle(simMagicTitles,ids)||simEquippedTitle;
              simFunds+=titlePay;
              totalRewards+=titlePay;
              ledgerEntries.unshift({week:simWeek,label:`议席授号：${freshTitles.map(item=>item.title).join('、')}`,amount:titlePay,type:'reward'});
              notices.push(`Y${simYear} W${simWeekOfYear} · 议席授号：${freshTitles.map(item=>item.title).join('、')}，发放 ${titlePay.toLocaleString()}`);
              hostedCelebrations.push(...celebrateFromTitles(ids));
            }
          }
        }
      }
      if(festivalHappens&&festival){
        simFestivals.push(festivalKey);
        postReward+=festival.reward;
        totalRewards+=festival.reward;
        simMemories+=1;
        ledgerEntries.unshift({week:simWeek,label:`镇历参与：${festival.title}`,amount:festival.reward,type:'reward'});
        notices.push(`Y${Math.floor((simWeek-1)/52)+1} W${((simWeek-1)%52)+1} · ${festival.title}`);
      }
      const cash=settleCash({funds:simFunds+earned+weekSkill.funds,living:BASE_LIVING+weekHouse.upkeep,leisure:weekLeisure.cost,gathering:gatheringCost,leanWeeks:simLeanWeeks,debt:simDebt});
      const actualLeisure=cash.leisurePaid?weekLeisure:resolveLeisureWeek(simPlan,planChoice,worldAtWeek.weather,{allowPaid:false});
      const actualGuests=cash.gatheringPaid?guests:0;
      const mealTick=tickSatiety({satiety:simSatiety,rooms:simRooms,staff:simStaff,cooking:countScheduleOption(simPlan,planChoice,'rest','cooking'),cookingSkill:simSkills.cooking??0,dineOut:leisureDineCount(actualLeisure),...gatheringFoodSlots(simPlan,planChoice,cash.gatheringPaid)});
      simSatiety=mealTick.satiety;
      if(actualGuests>0)simMemories+=1;
      const newCertificates=weekPrograms.filter(item=>item.kind==='certificate').length;
      const newDegrees=weekPrograms.filter(item=>item.kind==='degree'||item.kind==='master'||item.kind==='doctorate'||item.kind==='general').length;
      const socialGain=socialWeekGain({socialSlots:simCounts.social,guests:actualGuests,passedCourses:finishedCourses.length,newCertificates,newDegrees,festivalSocial:!!(festivalHappens&&festival?.activity==='social'),leisureSocial:actualLeisure.social,skillSocial:weekSkill.social});
      const nextSocial=socialAfterWeek(simSocial,simIdle,socialGain);
      simSocial=clampSocial(nextSocial.sociability+hardshipWear(cash.nextLeanWeeks).social);
      simIdle=nextSocial.idle;
      const doneBooks=finishedIds(simBooks);
      Object.assign(simSkills, applyEnrolledSkillCourses(weekEnrolled, simTerm.inSession, simCompleted, practicePlanSkills(simPlan, planChoice, simCompleted, simSkills, doneBooks, simRooms, factor, weekEnrolled), doneBooks, factor));
      const workTick=applyCreativeWeek(weekSkill.practiced,simSkills,simActiveWorks,simArchived,simWeek);
      simActiveWorks=workTick.active;
      simArchived=workTick.archived;
      if(workTick.completionReward){
        totalRewards+=workTick.completionReward;
        ledgerEntries.unshift({week:simWeek,label:`完成作品：${workTick.finished.map(work=>`《${work.title}》`).join('、')}`,amount:workTick.completionReward,type:'reward'});
      }
      if(workTick.notices.length) notices.push(...workTick.notices.map(text=>`Y${Math.floor((simWeek-1)/52)+1} W${((simWeek-1)%52)+1} · ${text}`));
      const candidates=['first-week',...(doneBooks.length?['book-finished']:[]),...(doneBooks.length>=5?['five-books']:[]),...(completedCertificates(simDiplomas).length?['first-certificate']:[]),...(simSocial>=50?['trusted-friend']:[]),...skillAchievementIds(simSkills),...workAchievementIds(simArchived)];
      const fresh=candidates.filter(id=>!simAchievements.includes(id));
      if(fresh.length){
        const reward=fresh.reduce((sum,id)=>sum+(achievementById(id)?.reward??0),0);
        simAchievements=[...simAchievements,...fresh];
        postReward+=reward;
        totalRewards+=reward;
        ledgerEntries.unshift({week:simWeek,label:`里程碑：${fresh.map(id=>achievementById(id)?.title).join('、')}`,amount:reward,type:'reward'});
        notices.push(...fresh.map(id=>`里程碑：${achievementById(id)?.title??id}`));
        hostedCelebrations.push(...celebrateFromAchievements(fresh));
      }
      simFunds=cash.closing+postReward+workTick.completionReward;
      simLeanWeeks=cash.nextLeanWeeks;
      simDebt=cash.nextDebt;
      totalEarned+=earned+weekSkill.funds;
      totalExpenses+=cash.paidLiving+cash.paidLeisure+cash.paidGathering;
      if(weekSkill.funds) ledgerEntries.unshift({week:simWeek,label:'技能：陶艺',amount:weekSkill.funds,type:'income'});
      if(cash.paidLiving) ledgerEntries.unshift({week:simWeek,label:cash.unpaidLiving?'生活维护（部分）':'生活维护',amount:-cash.paidLiving,type:'expense'});
      if(actualLeisure.ledger.length) ledgerEntries.unshift(...actualLeisure.ledger.map(entry=>({week:simWeek,label:entry.label,amount:entry.amount,type:'expense' as const})));
      if(cash.paidGathering) ledgerEntries.unshift({week:simWeek,label:'聚会',amount:-cash.paidGathering,type:'expense'});
      if(cash.notices.length) notices.push(...cash.notices.map(text=>`Y${Math.floor((simWeek-1)/52)+1} W${((simWeek-1)%52)+1} · ${text}`));
      if(actualLeisure.notices.length) notices.push(...actualLeisure.notices.map(text=>`Y${Math.floor((simWeek-1)/52)+1} W${((simWeek-1)%52)+1} · ${text}`));
      if(weekSkill.notices.length) notices.push(...weekSkill.notices.map(text=>`Y${Math.floor((simWeek-1)/52)+1} W${((simWeek-1)%52)+1} · ${text}`));
      const homeTick=tickHomeWeek({cleanliness:simClean,grounds:simGrounds,houseLevel:simHouseLevel,rooms:simRooms,staff:simStaff,chores:countScheduleOption(simPlan,planChoice,'rest','chores'),cooking:countScheduleOption(simPlan,planChoice,'rest','cooking'),cookingSkill:simSkills.cooking??0,social:simCounts.social,guests:actualGuests});
      const wornHome=applyHardshipHome(homeTick.cleanliness,homeTick.grounds,cash.nextLeanWeeks);
      simClean=wornHome.cleanliness;
      simGrounds=wornHome.grounds;
      if(homeTick.notices.length) notices.push(...homeTick.notices.map(text=>`Y${Math.floor((simWeek-1)/52)+1} W${((simWeek-1)%52)+1} · ${text}`));
      if(mealTick.notices.length) notices.push(...mealTick.notices.map(text=>`Y${Math.floor((simWeek-1)/52)+1} W${((simWeek-1)%52)+1} · ${text}`));
      if(cash.unpaidLiving>0){
        const quit=quitUnpaidStaff(simStaff,hardshipQuitCount(cash.nextLeanWeeks));
        if(quit.names.length) notices.push(`Y${Math.floor((simWeek-1)/52)+1} W${((simWeek-1)%52)+1} · 欠薪离任：${quit.names.join('、')}`);
        simStaff=quit.staff;
      }
      if(shouldWarnReclaim(cash.nextLeanWeeks,simHouseLevel)){
        notices.push(`Y${Math.floor((simWeek-1)/52)+1} W${((simWeek-1)%52)+1} · ${reclaimWarning(cash.nextLeanWeeks)}`);
      }
      if(shouldReclaimHouse(cash.nextLeanWeeks,simHouseLevel)){
        const taken=applyHouseReclaim(simHouseLevel,simStaff,simClean,simGrounds);
        if(taken.reclaimed){
          simHouseLevel=taken.houseLevel;
          simStaff=taken.staff;
          simClean=taken.cleanliness;
          simGrounds=taken.grounds;
          simLeanWeeks=RECLAIM_LEAN_RESET;
          notices.push(...taken.notices.map(text=>`Y${Math.floor((simWeek-1)/52)+1} W${((simWeek-1)%52)+1} · ${text}`));
          const cap=householdEffects(taken.rooms,simStaff,simHouseLevel).borrowLimit;
          const trimmed=trimBorrowedToCap(simBorrowed,cap,simReading);
          if(trimmed.returned.length){
            simBorrowed=trimmed.books;
            if(!simBorrowed.includes(simReading)) simReading=simBorrowed[0]??'';
            notices.push(`Y${Math.floor((simWeek-1)/52)+1} W${((simWeek-1)%52)+1} · 借阅超额，已退回 ${trimmed.returned.length} 本`);
          }
        }
      }
      const settledLoad=applyHardshipWellbeing(composeWellbeing(simEnergy,simStress,simHealth,simCounts,withSatiety(weekHouse,simSatiety),weekSkill,actualLeisure,simRestMix),cash.nextLeanWeeks);
      const weatherWear=weekWeatherWear(simHouseLevel,worldAtWeek.weather,simCounts);
      const settledCaps=applyFitnessConditionCaps(
        settledLoad.projectedEnergy+weatherWear.energy,
        settledLoad.projectedStress+weatherWear.stress,
        weekCondition,
      );
      simEnergy=clampPreviewStat(settledCaps.energy);
      simStress=clampPreviewStat(settledCaps.stress);
      simHealth=clampPreviewStat(settledLoad.projectedHealth+weatherWear.health);
      simFitnessHistory=pushFitnessHistory(simFitnessHistory, simCounts.fitness);
      simWeek+=1;
    }
    const changes:WeekChange[]=[];
    for(const [id,after] of Object.entries(simBooks)){
      const before=bookProgressMap[id]??0;
      if(after!==before)changes.push({label:`《${getBook(id)?.title??id}》`,before,after,unit:'%'});
    }
    for(const [id,after] of Object.entries(simCourses)){
      const before=courseProgressMap[id]??0;
      if(after!==before)changes.push({label:getCourse(id)?.title??id,before,after,unit:'%'});
    }
    for(const skill of skillCatalog){
      const before=skillProgress[skill.id]??0;
      const after=simSkills[skill.id]??0;
      if(after!==before)changes.push({
        label: skillLevel(before)===skillLevel(after) ? skill.title : `${skill.title} · ${skillLevel(before)}→${skillLevel(after)}`,
        before: skillUpgradeRemaining(before),
        after: skillUpgradeRemaining(after),
        unit:'%',
        invert: skillLevel(before)===skillLevel(after),
        remaining: true,
      });
    }
    if(activeProject){
      const before=projectProgress[activeProject]??0;
      const after=simProjectProgress[activeProject]??before;
      if(after!==before)changes.push({label:projectCatalog.find(item=>item.id===activeProject)?.title??activeProject,before,after,unit:'%'});
    }
    if(simSocial!==sociability)changes.push({label:'社交度',before:sociability,after:simSocial});
    if(simClean!==cleanliness)changes.push({label:'清洁度',before:cleanliness,after:simClean});
    if(simGrounds!==grounds)changes.push({label:'园景',before:grounds,after:simGrounds});
    if(simHouseLevel!==houseLevel)changes.push({label:'地产',before:houseLevel,after:simHouseLevel});
    notices.push(...houseWeekNotices(totalCounts,roomsAtLevel(simHouseLevel),simStaff));
    setFunds(simFunds);
    setBookProgressMap(simBooks);
    setCourseProgressMap(simCourses);
    setSkillProgress(simSkills);
    setActiveWorks(simActiveWorks);
    setArchivedWorks(simArchived);
    setCourseGrades(simGrades);
    setEnrolled(simEnrolled);
    setCompletedCourses(simCompleted);
    setStudyFocus(current=>simEnrolled.includes(current)?current:(simEnrolled[0]??current));
    setSociability(simSocial);
    setSocialIdle(simIdle);
    setMemories(simMemories);
    setFestivalMemories(simFestivals);
    setActiveProject(simActive);
    setProjectProgress(simProjectProgress);
    setCompletedProjects(simCompletedProjects);
    setMagicTitles(simMagicTitles);
    setEquippedMagicTitle(simEquippedTitle);
    setAchievements(simAchievements);
    setEnergy(simEnergy);
    setStress(simStress);
    setHealth(simHealth);
    setFitnessHistory(simFitnessHistory);
    setCleanliness(simClean);
    setGrounds(simGrounds);
    setSatiety(simSatiety);
    setLeanWeeks(simLeanWeeks);
    setLivingDebt(simDebt);
    setHouseLevel(simHouseLevel);
    setStaff(simStaff);
    setBorrowedBooks(simBorrowed);
    setReadingFocus(simReading);
    const net=simFunds-funds;
    setLedger(v=>[{week,label:`阶段托管：${label} · 收入`,amount:totalEarned,type:'income'},{week,label:`阶段托管：${label} · 生活支出`,amount:-totalExpenses,type:'expense'},...ledgerEntries,...v]);
    setTimeline(v=>[{week,title:`托管${label}`,text:`逐周模拟 ${amount} 周。净变化 ${net>=0?'+':''}${net}；${notices.length} 项重要记录。`,kind:'time'},...notices.slice(-8).reverse().map((text,index)=>({week:simWeek-1-index,title:'托管期记录',text,kind:'time'})),...v].slice(0,80));
    setProgramDiplomas(simDiplomas);
    setAcademicQueue(hostedAcademic);
    setCelebrateQueue(queue=>[...queue,...hostedCelebrations]);
    setWeekSettlement({week,weeks:amount,counts:totalCounts,money:{opening:funds,earned:totalEarned,expenses:totalExpenses,rewards:totalRewards,closing:simFunds},changes,notices,gathering:null,leanWeeks:simLeanWeeks});
    setWeek(simWeek);
    setReport(true);
  }
  function enrollCourse(id:string,cost:number) {
    if(!isAddDropWeek(weekOfYear))return;
    const course=getCourse(id);
    if(!course||funds<cost||enrolled.includes(id)||completedCourses.includes(id))return;
    if(!prereqsMet(course,completedCourses))return;
    if(creditSum(enrolled)+course.credits>SEMESTER_CREDIT_CAP)return;
    if(meetingConflict(enrolled,id))return;
    const next=[...enrolled,id];
    setFunds(v=>v-cost);
    setLedger(v=>[{week,label:`课程材料：${course.title}`,amount:-cost,type:'expense'},...v]);
    setEnrolled(next);
    lockCourseGrid(next);
    setStudyFocus(id);
    setCourseProgressMap(v=>({...v,[id]:v[id]??0}));
    setTimeline(v=>[{week,title:`选修${course.title}`,text:`${course.school} · ${meetingLabel(course.meetings)}。书目《${getBook(course.bookId)?.title??''}》。`,kind:'study'},...v]);
    if(next.length>=2)grant(['first-course']);
  }
  function dropCourse(id:string) {
    if(!isAddDropWeek(weekOfYear)||!enrolled.includes(id))return;
    const course=getCourse(id);
    const value=courseProgressMap[id]??0;
    const next=enrolled.filter(item=>item!==id);
    setEnrolled(next);
    lockCourseGrid(next);
    if(course&&value<10){ setFunds(v=>v+course.cost); setLedger(v=>[{week,label:`退课退费：${course.title}`,amount:course.cost,type:'reward'},...v]); }
    setTimeline(v=>[{week,title:`退选${course?.title??id}`,text:value<10?'材料费退回。课表时段释放。':'材料费不退。课表时段释放。',kind:'study'},...v].slice(0,80));
  }
  function declareProgram(id:string) {
    const program=studyPrograms.find(item=>item.id===id);
    if(!program||id===declaredProgram||programDiplomas[id])return;
    if(program.priorProgramId&&!programDiplomas[program.priorProgramId])return;
    setDeclaredProgram(id);
    setTimeline(v=>[{week,title:`确认培养路径：${program.title}`,text:`${programKindLabel(program.kind)} · 目标 ${programCreditCap(program)} 学分。`,kind:'study'},...v].slice(0,80));
    if(programStatus(program, completedCourses, programDiplomas).complete){
      const report=buildDiploma(program,completedCourses,courseGrades,year,weekOfYear);
      const pay=programCompletionLedger(program);
      setProgramDiplomas(current=>current[program.id]?current:mergeDiplomas(current,[report]));
      setAcademicQueue(queue=>queue.some(item=>item.type==='diploma'&&item.report.programId===program.id)?queue:[...queue,{type:'diploma' as const,report}]);
      setFunds(current=>current+pay.amount);
      setLedger(current=>[{week,label:pay.label,amount:pay.amount,type:'reward'},...current]);
      setSociability(current=>clampSocial(current+(program.kind==='certificate'?6:10)));
      setSocialIdle(0);
      if(program.kind==='certificate') grant(['first-certificate']);
    }
  }
  function restartGame() {
    localStorage.removeItem('rift-save-v1');
    localStorage.removeItem('rift-magic-academy');
    setMagicUnlocked(false);
    setMagicInviteOpen(false);
    setCottageRoom('grounds');
    setView('cottage');
    setPlan(starter.map(row => [...row]));
    setPlanChoice(choicesForPlan(starter, { ...defaultSlotChoice, reading: '', social: 'tea' }));
    setSavedTemplate(null);
    setActiveTemplate('平衡');
    setReport(false);
    setWeekSettlement(null);
    setAcademicQueue([]);
    setCelebrateQueue([]);
    setWeek(1);
    setFunds(1280);
    setBookProgressMap({});
    setCourseProgressMap({});
    setSkillProgress({});
    setReadingFocus('');
    setBorrowedBooks([]);
    setStudyFocus('');
    setCompletedCourses([]);
    setCourseGrades({});
    setProgramDiplomas({});
    setDeclaredProgram('');
    setSociability(STARTER_SOCIABILITY);
    setSocialIdle(0);
    setMemories(2);
    setPendingInvite(false);
    setTravelCount(0);
    setCompletedExpeditions([]);
    setTravelReport(null);
    setHouseUpgrade(null);
    setStewardReview(null);
    setHouseLevel(STARTER_HOUSE_LEVEL);
    setOriginalHouseYear(0);
    setStaff([]);
    setDuration(5);
    setTimeline([{ week: 1, title: '抵达榛木镇', text: '管理局划给一块不规则荒地与初始资金。泥土车道、杂草、没有围栏。地上没有房子。', kind: 'arrival' }]);
    setEnrolled([]);
    setAchievements([]);
    setLedger([{ week: 1, label: '管理局初始安置资金', amount: 1280, type: 'income' }]);
    setEnergy(78);
    setStress(22);
    setHealth(82);
    setFitnessHistory([2, 2]);
    setCleanliness(STARTER_CLEANLINESS);
    setGrounds(STARTER_GROUNDS);
    setSatiety(STARTER_SATIETY);
    setLeanWeeks(0);
    setLivingDebt(0);
    setPendingEvent(null);
    setStoryOutcome(null);
    setActiveProject(null);
    setProjectProgress({});
    setCompletedProjects([]);
    setMagicTitles([]);
    setEquippedMagicTitle('');
    setArchivedWorks([]);
    setActiveWorks({});
    setFestivalMemories([]);
    setGatheringKind('tea');
    setSlotChoice({ ...defaultSlotChoice });
    setStayComplete(false);
    setEndingScoreOpen(false);
    setStayChosen(false);
  }
  useEffect(() => {
    const context = (document as ModelDocument).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({ name:'set_week_plan', title:'设置本周日程', description:'一次设置完整的 7 天、每天早午晚三项活动。上课时段由学期课表锁定，不能改写。', inputSchema:{type:'object',properties:{days:{type:'array',minItems:7,maxItems:7,items:{type:'array',minItems:3,maxItems:3,items:{type:'string',enum:planKeys}}}},required:['days'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){ const next=(input as {days?:unknown}).days; const allowed=new Set<string>([...planKeys,'course','skill']); if(!Array.isArray(next)||next.length!==7||!next.every(row=>Array.isArray(row)&&row.length===3&&row.every(cell=>typeof cell==='string'&&allowed.has(cell)))) throw new Error('日程必须包含 7 天，每天正好 3 个有效活动。'); const migrated=normalizeSchedule(next as ActivityKey[][], choicesForPlan(next as ActivityKey[][], { ...slotChoice, reading: readingFocus, social: gatheringKind, project: defaultProjectChoice(activeProject, completedCourses, slotChoice.project) })); const grid=overlayCoursePlan(migrated.plan, enrolled, 'course', 'free', academic.inSession); const locked=new Set(enrolledMeetings(enrolled, academic.inSession).map(slot=>slotKey(slot.day, slot.period))); const split=normalizeSchedule(grid, migrated.choices.map((row,day)=>row.map((value,period)=>locked.has(slotKey(day,period))?'':value))); setPlan(split.plan); setPlanChoice(split.choices); setView('cottage'); return {status:'planned',slots:21}; } },{signal:lifecycle.signal}));
    void Promise.resolve(context.registerTool({ name:'complete_planned_week', title:'完成本周', description:'按照当前可见日程自动演化一周，并打开周报。', inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(){ runWeek(); return {status:'completed',week:week+1}; } },{signal:lifecycle.signal}));
    return () => lifecycle.abort();
  }, [week, plan, counts, enrolled, runWeek]);
  const activityOptions = useMemo<Record<ActivityKey, ActivityOption[]>>(() => {
    const currentProject = findProject(activeProject);
    const declaredForMenu = studyPrograms.find(item => item.id === declaredProgram);
    const research = declaredForMenu ? programResearch(declaredForMenu) : undefined;
    const magicProgram=magicProgramDetails(currentProject?.id);
    const projectTitle = magicProgram ? `${currentProject?.title} · 自主实践` : currentProject && research?.projectId === currentProject.id ? research.title : currentProject?.title;
    return {
      reading: (() => {
        const readable = readableBorrowed(borrowedBooks, bookProgressMap);
        if (!readable.length) return [{ id: '', title: borrowedBooks.length ? '没有未读完的书' : '尚未借书', detail: borrowedBooks.length ? '读完的书可归还后再借' : '先去图书馆借阅', disabled: true }];
        return readable.map(id => {
          const book = getBook(id);
          return { id, title: book?.title ?? id, detail: `${Math.round(bookProgressMap[id] ?? 0)}%` };
        });
      })(),
      course: [],
      fitness: [...skillMenuOptions('fitness', completedCourses, skillProgress, finishedIds(bookProgressMap), rooms, enrolled), { id: 'stretch', title: '拉伸', detail: '恢复精力、降低压力' }],
      skill: [],
      social: gatherings.map(item => {const gate=gatheringUnlockStatus(item,progressionContext);return {id:item.id,title:item.title,detail:gate.unlocked?undefined:`需 ${gate.missing.join('、')}`,disabled:!gate.unlocked};}),
      project: [
        ...(currentProject
          ? [{ id: currentProject.id, title: projectTitle ?? currentProject.title, detail: `${Math.round(projectProgress[currentProject.id] ?? 0)}% · 课题` }]
          : [{ id: UNSTARTED_PROJECT, title: '尚未开题', detail: '先去大学开题', disabled: true }]),
        ...skillMenuOptions('project', completedCourses, skillProgress, finishedIds(bookProgressMap), rooms, enrolled, activeWorks),
      ],
      rest: [...restOptions, ...skillMenuOptions('rest', completedCourses, skillProgress, finishedIds(bookProgressMap), rooms, enrolled)],
      out: leisureCatalog.filter(item => item.place === 'out').map(item => {
        const gate = leisureUnlockStatus(item, progressionContext);
        return {
          id: item.id,
          title: item.title,
          detail: gate.unlocked ? `${item.detail}${item.cost ? ` · ${item.cost}` : ' · 免费'}${item.outdoor ? ' · 室外' : ''}` : gate.missing.join('、'),
          disabled: !gate.unlocked,
        };
      }),
      free: leisureCatalog.filter(item => item.place === 'home').map(item => {
        const gate = leisureUnlockStatus(item, progressionContext);
        return {
          id: item.id,
          title: item.title,
          detail: gate.unlocked ? `${item.detail}${item.cost ? ` · ${item.cost}` : ' · 免费'}${item.outdoor ? ' · 室外' : ''}` : gate.missing.join('、'),
          disabled: !gate.unlocked,
        };
      }),
    };
  }, [borrowedBooks, bookProgressMap, activeProject, projectProgress, completedCourses, skillProgress, activeWorks, sociability, week, rooms, houseLevel, travelCount, declaredProgram, enrolled]);
  function chooseStay(years: StayYears) {
    setDuration(years);
    setStayComplete(false);
    setTimeline([{ week: 1, title: '抵达榛木镇', text: `管理局划给一块不规则荒地，并登记 ${years} 年驻留。泥土车道、杂草、没有围栏。地上没有房子。期满前不可改期。`, kind: 'arrival' }]);
    setStayChosen(true);
  }
  const declared = studyPrograms.find(item => item.id === declaredProgram);
  const programActive = !!declared && !programDiplomas[declared.id];
  const activeMagicProgram=magicProgramDetails(activeProject);
  const termChip = academic.addDrop ? '选课周' : academic.holiday ? academic.breakName : `第${Math.floor((week - 1) / 13) + 1}学期`;
  const universityChip = activeMagicProgram ? `秘法 · ${activeMagicProgram.project.title} ${Math.round(projectProgress[activeMagicProgram.project.id]??0)}%` : programActive ? `${declared.title} · ${termChip}` : '未申报';
  const termPhase = termPhaseProgress(weekOfYear);
  const termWeekNote = programActive ? termPhase.note : '';
  const endingScoreInput: EndingScoreInput = {
    duration,
    funds,
    finishedBooks: finishedIds(bookProgressMap).length,
    completedCourses: completedCourses.length,
    diplomas: Object.keys(programDiplomas).length,
    completedProjects: completedProjects.length,
    works: archivedWorks.length,
    averageSkill: skillCatalog.length ? skillCatalog.reduce((sum, skill) => sum + (skillProgress[skill.id] ?? 0), 0) / skillCatalog.length : 0,
    sociability,
    memories,
    festivalMemories: festivalMemories.length,
    travels: travelCount,
    expeditions: completedExpeditions.length,
    houseLevel,
    energy,
    stress,
    health,
    cleanliness,
    grounds,
  };
  if (!loaded) return <main className="stay-picker"><p className="stay-wait">读取档案</p></main>;
  if (!stayChosen) return <StayPicker onChoose={chooseStay} />;
  return <main className="min-h-screen bg-background text-foreground">
    <header className="topbar">
      <div className="brand"><span className="rift-mark">档</span><div><strong>HZ-LF</strong><small>{equippedMagicTitle&&magicTitleById(equippedMagicTitle)?`封号 · ${magicTitleById(equippedMagicTitle)!.title}`:'生活档案'}</small></div></div>
      <button className={`time-chip season-pill-${world.seasonIndex}`} onClick={()=>setView('archive')}>
        <b>{stayComplete ? `${duration}年驻留期满` : `Y${year} ${season} W${weekOfYear}${termWeekNote ? ` · ${termWeekNote}` : ''}`}</b>
        <span>{stayComplete ? '档案已封存' : `${world.weather} ${world.temperature}°${world.festival?` · ${world.festival.title}`:` · ${world.weeksUntil}周后 ${world.upcoming.title}`}`}</span>
      </button>
      <div className="header-actions">
        <button className="chip" onClick={()=>enterPlace('library')} title="图书馆">借 {borrowedBooks.length}/{house.borrowLimit}</button>
        <button className="chip" onClick={()=>activeMagicProgram?setView('magicAcademy'):enterPlace('university')} title={activeMagicProgram?'星穹秘法学院':'大学'}>{universityChip}</button>
        <button className={`funds ${moneyTone}`} onClick={()=>setView('rewards')}><span>余额</span><b>{funds.toLocaleString()}</b></button>
        {moneyChip&&<span className={`chip money-chip ${moneyTone}`} title={moneyHint}>{moneyChip}</span>}
        {stayComplete
          ? <button className="dock-run" onClick={()=>setView('archive')}>查看档案</button>
          : <button className="dock-run" onClick={()=>runWeek()}><Play size={14}/>{lastStayWeek ? '结算并期满' : '结算本周'}</button>}
      </div>
    </header>
    <div className="app-shell">
      <div className={`pane ${view==='map'?'map-pane':''} ${view==='cottage'?'cottage-pane':''}`}>
        {view==='cottage'&&cottageRoom==='grounds'&&<div className="cottage-stack">
          {ENABLE_FOREST_INVITE&&<CompanyBar pendingInvite={pendingInvite} onAccept={acceptInvite} onDecline={()=>setPendingInvite(false)}/>}
          <EstateGrounds houseLevel={houseLevel} upkeep={house.upkeep} grounds={grounds} restEnergy={house.restEnergy} cleanliness={cleanliness} staffCount={staff.length} shelterHealth={house.shelterHealth} onEnter={id=>{ if(id==='out') setView('map'); else openCottage(id==='house'?'schedule':id==='guest'?'estate':'study'); }}/>
        </div>}
        {view==='cottage'&&cottageRoom==='schedule'&&<ScheduleView onBack={()=>setCottageRoom('grounds')} houseName={`Lv.${houseLevel} ${houseTierAt(houseLevel).name}`} plan={plan} planChoice={planChoice} onPaint={setSlot} load={load} energy={shownEnergy} stress={shownStress} health={health} cleanliness={cleanliness} sociability={sociability} satiety={satiety} skillProgress={skillProgress} previewSkillProgress={previewSkillProgress} projectedEnergy={projectedEnergy} projectedStress={projectedStress} projectedHealth={projectedHealth} projectedCleanliness={projectedCleanliness} projectedSatiety={projectedSatiety} projectedSociability={projectedSociability} projectedNet={projectedNet} strained={strainedWeek} fitnessCondition={fitnessCondition} fitnessBanner={fitnessBanner} templates={savedTemplate?[...scheduleTemplates,savedTemplate]:scheduleTemplates} activeTemplate={activeTemplate} onApplyTemplate={applyScheduleTemplate} onSaveTemplate={saveCurrentTemplate} onReset={()=>applyScheduleTemplate(scheduleTemplates[0])} classSlots={[...enrolledMeetings(enrolled,academic.inSession).map(slot=>({day:slot.day,period:slot.period,code:getCourse(slot.courseId)?.code??slot.courseId,title:getCourse(slot.courseId)?.title??''})),...magicMeetings(activeProject,enrolled,academic.inSession)]} termNotice={stayComplete?'驻留期满，档案已封存。':lastStayWeek?'驻留最后一周。结算后档案封存。':academic.addDrop?'选课周：本周可改大学课表。':academic.lastTeachingWeek?'本学期最后一周上课。结算后全部课程同时出成绩，随后进入假期。':academic.holiday?(magicMeetings(activeProject,enrolled,academic.inSession).length?`${academic.breakName}：大学停课；秘法学院课程照常。`:`${academic.breakName}：无课。下学期第 1 周再开放选课。`):undefined} week={week} duration={duration} onAdvance={advanceTime} options={activityOptions}/>}
        {view==='cottage'&&cottageRoom==='estate'&&<div className="cottage-room">
          <div className="page-heading"><button type="button" className="btn-ghost room-back" onClick={()=>setCottageRoom('grounds')}>返回</button><h1>地产详情</h1><p>Lv.{houseLevel} {houseTierAt(houseLevel).name}</p></div>
          <HomeView compact funds={funds} houseLevel={houseLevel} rooms={rooms} staff={staff} originalHouseYear={originalHouseYear} cleanliness={cleanliness} grounds={grounds} context={progressionContext} onUpgrade={upgradeHouse} onHire={hire} onFire={fire}/>
        </div>}
        {view==='cottage'&&cottageRoom==='study'&&<HomeStudyView progress={bookProgressMap} borrowed={borrowedBooks} works={archivedWorks} activeWorks={activeWorks} diplomas={programDiplomas} magicTitles={magicTitles} equippedMagicTitle={equippedMagicTitle} onEquipTitle={id=>setEquippedMagicTitle(id)} onBack={()=>setCottageRoom('grounds')}/>}
        {view==='map'&&<TownMapView onBack={()=>openCottage('grounds')} onEnter={enterPlace} magicUnlocked={magicUnlocked}/>}
        {view==='library'&&<LibraryView onBack={()=>openCottage('grounds')} progress={bookProgressMap} borrowed={borrowedBooks} week={week} context={progressionContext} borrowLimit={house.borrowLimit} onBorrow={borrowBook} onReturn={returnBook}/>}
        {view==='university'&&<UniversityView onBack={()=>openCottage('grounds')} progress={courseProgressMap} grades={courseGrades} funds={funds} enrolled={enrolled} completed={completedCourses} programId={declaredProgram} season={season} year={year} weekOfYear={weekOfYear} diplomas={programDiplomas} research={researchWork} onEnroll={enrollCourse} onDrop={dropCourse} onDeclare={declareProgram}/>}
        {view==='magicAcademy'&&magicUnlocked&&<MagicAcademyView onBack={()=>openCottage('grounds')} funds={funds} active={activeProject} completed={completedProjects} progress={projectProgress} diplomas={programDiplomas} year={year} weekOfYear={weekOfYear} onStart={startProject}/>}
        {view==='station'&&<TravelView onBack={()=>openCottage('grounds')} funds={funds} completed={travelCount} expeditions={completedExpeditions.length} remainingWeeks={duration*52-week} energy={energy} health={health} season={world.season} context={progressionContext} onTravel={takeTrip} onExpedition={takeExpedition}/>}
        {view==='rewards'&&<RewardsView onBack={()=>openCottage('grounds')} achievements={achievements} ledger={ledger}/>}
        {view==='archive'&&<ArchiveView onBack={()=>openCottage('grounds')} duration={duration} week={week} year={year} ended={stayComplete} timeline={timeline} bookProgress={maxMappedProgress(bookProgressMap)} courseProgress={maxMappedProgress(courseProgressMap)} friendship={sociability} houseLevel={houseLevel} travels={travelCount} memories={memories} works={archivedWorks} onShowEnding={()=>setEndingScoreOpen(true)} onRestart={restartGame}/>}
      </div>
    </div>
    {report&&weekSettlement&&<WeekReport settlement={weekSettlement} onClose={()=>{ setReport(false); if(stayComplete) { setView('archive'); setEndingScoreOpen(true); } }} energy={energy} stress={stress} health={health} cleanliness={cleanliness} grounds={grounds} sociability={sociability} memories={memories}/>}
    {!report&&academicQueue[0]?.type==='term'&&<TermGradesModal report={academicQueue[0].report} onClose={()=>setAcademicQueue(queue=>queue.slice(1))}/>}
    {!report&&academicQueue[0]?.type==='diploma'&&<DiplomaModal report={academicQueue[0].report} onClose={()=>setAcademicQueue(queue=>queue.slice(1))}/>}
    {!report&&academicQueue.length===0&&celebrateQueue[0]&&<CelebrationModal item={celebrateQueue[0]} onClose={()=>setCelebrateQueue(queue=>queue.slice(1))}/>}
    {endingScoreOpen&&!report&&academicQueue.length===0&&celebrateQueue.length===0&&<EndingScoreModal input={endingScoreInput} onClose={()=>setEndingScoreOpen(false)}/>}
    {magicInviteOpen&&!report&&academicQueue.length===0&&celebrateQueue.length===0&&<MagicInvitation onAccept={acceptMagicInvite}/>}
    {ENABLE_STORY_EVENT_MODAL&&!report&&pendingEvent&&<StoryEventModal event={pendingEvent} onChoose={resolveStory}/>} {ENABLE_STORY_EVENT_MODAL&&storyOutcome&&<StoryOutcomeModal title={storyOutcome.title} choice={storyOutcome.choice} onClose={()=>setStoryOutcome(null)}/>} {travelReport&&<TravelReport report={travelReport} onClose={()=>setTravelReport(null)}/>} {houseUpgrade&&!report&&academicQueue.length===0&&celebrateQueue.length===0&&<HouseUpgradeModal from={houseUpgrade.from} to={houseUpgrade.to} onClose={()=>setHouseUpgrade(null)}/>} {stewardReview&&<StewardReviewModal proposal={stewardReview} funds={funds} onCancel={()=>setStewardReview(null)} onResolve={approved=>{ const result=applyStewardDecisions({staff,funds,houseLevel,rooms,cleanliness},approved,true); setStewardReview(null); runWeek(result); }}/>}</main>;
}

function ScheduleView({onBack,houseName,plan,planChoice,onPaint,load,energy,stress,health,cleanliness,sociability,satiety,skillProgress,previewSkillProgress,projectedEnergy,projectedStress,projectedHealth,projectedCleanliness,projectedSatiety,projectedSociability,projectedNet,strained,fitnessCondition,fitnessBanner,templates,activeTemplate,onApplyTemplate,onSaveTemplate,onReset,classSlots,termNotice,week,duration,onAdvance,options}:{onBack?:()=>void;houseName:string;plan:ActivityKey[][];planChoice:string[][];onPaint:(d:number,p:number,key:ActivityKey,optionId?:string)=>void;load:number;energy:number;stress:number;health:number;cleanliness:number;sociability:number;satiety:number;skillProgress:Partial<Record<SkillId,number>>;previewSkillProgress:Partial<Record<SkillId,number>>;projectedEnergy:number;projectedStress:number;projectedHealth:number;projectedCleanliness:number;projectedSatiety:number;projectedSociability:number;projectedNet:number;strained:boolean;fitnessCondition:FitnessCondition;fitnessBanner:string;templates:ScheduleTemplate[];activeTemplate:string;onApplyTemplate:(template:ScheduleTemplate)=>void;onSaveTemplate:()=>void;onReset:()=>void;classSlots?:{day:number;period:number;code:string;title:string}[];termNotice?:string;week:number;duration:StayYears;onAdvance:(weeks:number,label:string)=>void;options:Record<ActivityKey,ActivityOption[]>;}) {
  const [open, setOpen] = useState<{day:number;period:number}|null>(null);
  const [branch, setBranch] = useState<ActivityKey>('reading');
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const phase = termPhaseProgress(((week - 1) % 52) + 1);
  const locked: Record<string,{day:number;period:number;code:string;title:string}> = {};
  for (const slot of classSlots??[]) locked[`${slot.day}-${slot.period}`] = slot;
  function choiceLabel(key: ActivityKey, selected?: string) {
    return options[key]?.find(item => item.id === selected)?.title ?? activities[key].label;
  }
  function placeMenu() {
    const anchor = anchorRef.current;
    if (!anchor || !open) return;
    const rect = anchor.getBoundingClientRect();
    const pad = 8;
    const width = Math.min(292, window.innerWidth - pad * 2);
    const maxH = Math.min(360, window.innerHeight - pad * 2);
    const spaceBelow = window.innerHeight - rect.bottom - pad;
    const spaceAbove = rect.top - pad;
    const openUp = open.period === 2 || (spaceBelow < 180 && spaceAbove > spaceBelow);
    const openRight = open.day >= 5 || rect.left + width > window.innerWidth - pad;
    const height = Math.min(maxH, Math.max(160, openUp ? spaceAbove - 3 : spaceBelow - 3));
    let left = openRight ? rect.right - width : rect.left;
    left = Math.max(pad, Math.min(left, window.innerWidth - width - pad));
    const top = openUp
      ? Math.max(pad, rect.top - height - 3)
      : Math.min(rect.bottom + 3, window.innerHeight - height - pad);
    setMenuStyle({ position: 'fixed', top, left, width, height, zIndex: 80 });
  }
  useLayoutEffect(() => {
    if (!open) return;
    placeMenu();
    const onReposition = () => placeMenu();
    window.addEventListener('resize', onReposition);
    document.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      document.removeEventListener('scroll', onReposition, true);
    };
  }, [open, branch]);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      setOpen(null);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  return <section className="workspace schedule-view">
    <div className="page-heading">{onBack&&<button type="button" className="btn-ghost room-back" onClick={onBack}>返回</button>}<h1>日程安排</h1><p>{houseName}</p><Button variant="outline" size="sm" className="btn-ghost" onClick={onReset}><RotateCcw/>重置排程</Button></div>
    {termNotice&&<p className={`term-banner ${termNotice.includes('假期')||termNotice.includes('假：')?'holiday':''}`}>{termNotice}</p>}
    <div className="schedule-tools"><div className="template-bar" aria-label="日程模板">
      <small>沿用</small>
      {templates.map(template=><button key={template.id} type="button" className={activeTemplate===template.name?'active':''} onClick={()=>onApplyTemplate(template)}>{template.name}</button>)}
      <button type="button" className="template-save" onClick={onSaveTemplate}>{templates.some(template=>template.id==='mine')?'覆盖保存':'保存当前'}</button>
      <span>{activeTemplate}</span>
    </div>
    <div className="template-bar skip-bar" aria-label="托管结算">
      <small>托管</small>
      <button type="button" disabled={week + 4 > duration * 52} onClick={() => onAdvance(4, '4周')}>4 周</button>
      <button type="button" disabled={week + phase.remaining > duration * 52} onClick={() => onAdvance(phase.remaining, phase.advanceLabel)}>{phase.advanceLabel}</button>
      <button type="button" disabled={week + 52 > duration * 52} onClick={() => onAdvance(52, '52周')}>一年</button>
      <span>沿用当前日程</span>
    </div></div>
    <div className={`wellbeing-strip ${strained?'strained':''}`}>
      <WellbeingStat icon={BatteryMedium} label="精力" value={energy} projected={projectedEnergy} inverse={false} tip={joinTips(energyHint(energy), fitnessConditionHint(fitnessCondition, 'energy'))} limited={fitnessCondition.energyLimited} maxHint={fitnessCondition.energyLimited ? fitnessCondition.energyMax : undefined}/>
      <WellbeingStat icon={Brain} label="压力" value={stress} projected={projectedStress} inverse tip={joinTips(stressHint(stress), fitnessConditionHint(fitnessCondition, 'stress'))} limited={fitnessCondition.stressLimited} floorHint={fitnessCondition.stressLimited ? fitnessCondition.stressFloor : undefined}/>
      <WellbeingStat icon={ShieldCheck} label="体能" value={health} projected={projectedHealth} inverse={false} tip={healthHint(health)}/>
      <WellbeingStat icon={Utensils} label="饱食" value={satiety} projected={projectedSatiety} inverse={false} tip={satietyHint(satiety)}/>
      <WellbeingStat icon={Sparkles} label="清洁" value={cleanliness} projected={projectedCleanliness} inverse={false} tip={cleanlinessHint(cleanliness)}/>
      <WellbeingStat icon={Users} label="社交" value={sociability} projected={projectedSociability} inverse={false} tip={socialHint(sociability)}/>
      <div className={`wellbeing-stat plain tone-${loadTone(load)}`} data-tip={loadHint(load)}><span><small>负荷</small><b>{Math.round(load)}</b></span></div>
      <div className={`wellbeing-stat plain tone-${netTone(projectedNet)}`} data-tip={netHint(projectedNet)}><span><small>预估净收入</small><b>{projectedNet>0?`+${Math.round(projectedNet)}`:`${Math.round(projectedNet)}`}</b></span></div>
      {fitnessBanner&&<p className="fitness-cap-note">{fitnessBanner}</p>}
      {strained&&<p>负荷偏高：效率 ×0.72，进度保留。</p>}
    </div>
    <div className="schedule-layout"><div className="calendar-card">
      <div className="calendar-head"><span>周一–周日</span></div>
      <div className="week-grid">
        <div className="period-labels"><b></b>{periods.map(p=><span key={p}>{p}</span>)}</div>
        {days.map((day,di)=><div className="day-column" key={day}>
          <div className="day-label"><span>{day}</span></div>
          {periods.map((_,pi)=>{
            const key=plan[di][pi];
            const A=activities[key];
            const Icon=A.icon;
            const clas=locked[`${di}-${pi}`];
            const picking=open?.day===di && open.period===pi;
            const branchOptions=options[branch]??[];
            const slotOption=planChoice[di]?.[pi]??'';
            const label=clas?clas.title:choiceLabel(key,slotOption);
            const skillOption=!clas&&isSkillId(slotOption)?options[key]?.find(item=>item.id===slotOption):undefined;
            const capHint=skillOption?.capHint;
            const skillNow=!clas&&isSkillId(slotOption)?(skillProgress[slotOption]??0):null;
            const skillAfter=skillNow==null||!isSkillId(slotOption)?null:(previewSkillProgress[slotOption]??skillNow);
            const skillGated=skillNow!=null&&skillAfter!=null&&skillAfter-skillNow<=0.05&&Math.round(skillNow)<100;
            const skillNote=skillNow==null?'':(()=>{
              const level=skillLevel(skillNow);
              if(skillGated) return `${level} · 上限`;
              const progress=Math.max(0, Math.min(100, Math.round(100-skillUpgradeRemaining(skillNow))));
              return `${level} ${progress}%`;
            })();
            const detail=clas?`${clas.code} ${clas.title}`:label;
            return <div key={pi} className="slot-cell" ref={picking?anchorRef:undefined}>
              <button type="button" disabled={!!clas} aria-expanded={picking} aria-haspopup={clas?undefined:'menu'} title={skillGated?capHint:undefined} onClick={()=>{ if(clas) return; if(picking){ setOpen(null); return; } setBranch(planKeys.includes(key)?key:'reading'); setOpen({day:di,period:pi}); }} className={`activity-card ${A.color}${clas?' locked':''}${skillGated?' skill-capped':''}${picking?' picking':''}`} aria-label={`${day}${periods[pi]}：${detail}${skillNote?` ${skillNote}`:''}${skillGated?` ${capHint||'练习已达门槛上限'}`:''}`}>
                {skillGated?<Lock className="slot-lock" size={11} aria-hidden/>:null}
                <Icon/><b>{label}</b>{skillNote?<span className="slot-skill">{skillNote}</span>:null}
              </button>
              {picking && createPortal(
                <div ref={menuRef} className="menu-list split schedule-slot-menu" role="menu" style={menuStyle}>
                  <div className="menu-col">
                    {planKeys.map(item => (
                      <button key={item} type="button" role="menuitem" className={branch===item?'current':''} onClick={event => {
                        event.stopPropagation();
                        const listed=options[item]??[];
                        const usable=listed.filter(option => option.id && option.id !== UNSTARTED_PROJECT && !option.disabled);
                        const content=listed.find(option => option.id && option.id !== UNSTARTED_PROJECT);
                        const keep = key === item ? slotOption : '';
                        const preferred = item === 'free' ? 'game' : item === 'out' ? 'errand' : '';
                        const selected = (keep && usable.some(option => option.id === keep)) ? keep : (usable.find(option => option.id === preferred)?.id ?? usable[0]?.id ?? (item==='project' ? content?.id ?? '' : ''));
                        if (!selected) {
                          setBranch(item);
                          return;
                        }
                        setBranch(item);
                        onPaint(di,pi,item,selected);
                      }}>
                        {activities[item].label}
                        <ChevronRight size={12}/>
                      </button>
                    ))}
                  </div>
                  <div className="menu-col sub">
                    {branchOptions.map(option => (
                      <button key={option.id || option.title} type="button" role="menuitem" disabled={option.disabled} className={`${key===branch && slotOption===option.id?'current':''}${option.capped?' skill-capped':''}`} onClick={event => {
                        event.stopPropagation();
                        if (option.disabled) return;
                        onPaint(di,pi,branch,option.id);
                        setOpen(null);
                      }}>
                        <b>{option.capped ? <Lock size={11} aria-hidden/> : null}{option.title}</b>
                        {option.detail && <small>{option.detail}</small>}
                      </button>
                    ))}
                  </div>
                </div>,
                document.body,
              )}
            </div>;
          })}
        </div>)}
      </div>
    </div></div>
  </section>;
}

type StatTone = 'ok' | 'warn' | 'care';

function statLevelTone(value: number, inverse = false): StatTone {
  if (inverse) {
    if (value >= 75) return 'care';
    if (value >= 60) return 'warn';
    return 'ok';
  }
  if (value < 35) return 'care';
  if (value < 55) return 'warn';
  return 'ok';
}

function escalateTone(tone: StatTone, worse: boolean): StatTone {
  if (!worse) return tone;
  return tone === 'ok' ? 'warn' : 'care';
}

function wellbeingValueTone(value: number, projected: number, inverse = false): StatTone {
  const worseValue = inverse ? Math.max(value, projected) : Math.min(value, projected);
  const delta = Math.round(projected - value);
  const deltaBad = inverse ? delta > 0 : delta < 0;
  return escalateTone(statLevelTone(worseValue, inverse), deltaBad);
}

function socialHint(value: number) {
  if (value >= 70) return '小镇人气王';
  if (value >= 50) return '高朋满座';
  if (value >= 30) return '颇有些朋友';
  if (value >= 15) return '比较孤僻';
  return '隐居';
}

function energyHint(value: number) {
  if (value >= 75) return '很精神';
  if (value >= 55) return '还行';
  if (value >= 35) return '有些疲惫';
  return '提不起劲';
}

function stressHint(value: number) {
  if (value >= 75) return '快撑不住了';
  if (value >= 60) return '感到压力';
  if (value >= 40) return '还好';
  return '很放松';
}

function healthHint(value: number) {
  if (value >= 75) return '很结实';
  if (value >= 55) return '还好';
  if (value >= 35) return '有点虚';
  return '很虚弱';
}

function netHint(net: number) {
  if (net > 0) return '盈余';
  if (net === 0) return '持平';
  return '亏损';
}

function loadHint(load: number) {
  if (load >= 16) return '排太满';
  if (load >= 12) return '有点满';
  if (load >= 8) return '还好';
  return '很轻松';
}

function loadTone(load: number): StatTone {
  if (load >= 16) return 'care';
  if (load >= 12) return 'warn';
  return 'ok';
}

function netTone(net: number): StatTone {
  if (net < 0) return 'care';
  if (net === 0) return 'warn';
  return 'ok';
}

function joinTips(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join('。');
}

function WellbeingStat({icon:Icon,label,value,projected,inverse,tip,limited,maxHint,floorHint}:{icon:typeof BatteryMedium;label:string;value:number;projected:number;inverse:boolean;tip?:string;limited?:boolean;maxHint?:number;floorHint?:number}) {
  const delta = Math.round(projected - value);
  const baseTone = wellbeingValueTone(value, projected, inverse);
  const tone = limited && baseTone === 'ok' ? 'warn' : baseTone;
  const good = inverse ? delta <= 0 : delta >= 0;
  const chip = delta === 0 ? 'flat' : good ? 'good' : 'care';
  const bound = maxHint != null ? `上限 ${maxHint}` : floorHint != null ? `下限 ${floorHint}` : '';
  const aria = [label, Math.round(value), tip, bound].filter(Boolean).join('。');
  return <div className={`wellbeing-stat tone-${tone}${limited ? ' limited' : ''}`} data-tip={tip || undefined} aria-label={aria || undefined}><Icon size={14}/><span><small>{label}{bound ? ` · ${bound}` : ''}</small><b>{Math.round(value)}</b></span><i className={chip}>{delta===0?'不变':`${delta>0?'+':''}${delta}`}</i></div>;
}
function Meter({label,value,note}:{label:string;value:number;note:string}) { return <div className="meter"><div><b>{label}</b><span>{Math.round(value)}%</span></div><Progress value={value}/><small>{note}</small></div>; }

function StayPicker({ onChoose }: { onChoose: (years: StayYears) => void }) {
  return (
    <main className="stay-picker">
      <header>
        <span className="rift-mark">档</span>
        <p>榛木镇驻留申请</p>
        <h1>选择驻留期</h1>
        <p>选定后写入档案，中途不能改期。</p>
      </header>
      <div className="stay-picks">
        {stayOptions.map(item => (
          <article key={item.years}>
            <small>{item.years} 年 · {item.years * 52} 周</small>
            <h2>{item.title}</h2>
            <button type="button" onClick={() => onChoose(item.years)}>确认</button>
          </article>
        ))}
      </div>
    </main>
  );
}

function ArchiveView({ duration, week, year, ended, timeline, bookProgress, courseProgress, friendship, houseLevel, travels, memories, works, onShowEnding, onRestart, onBack }: {
  duration: StayYears;
  week: number;
  year: number;
  ended?: boolean;
  timeline: LifeEntry[];
  bookProgress: number;
  courseProgress: number;
  friendship: number;
  houseLevel: number;
  travels: number;
  memories: number;
  works: ArchivedWork[];
  onShowEnding: () => void;
  onRestart: () => void;
  onBack?: () => void;
}) {
  const elapsed = Math.min(100, week / (duration * 52) * 100);
  const [confirming, setConfirming] = useState(false);
  return (
    <section className="workspace archive-view">
      <div className="page-heading">
        {onBack && <button type="button" className="btn-ghost room-back" onClick={onBack}>返回</button>}
        <h1>{ended ? '驻留期满' : '驻留档案'}</h1>
        <p>Y{year} · {duration}年驻留 · {Math.min(week, duration * 52)}/{duration * 52} 周 · {elapsed.toFixed(0)}%{ended ? ' · 已封存' : ''}</p>
        {confirming ? (
          <div className="restart-confirm">
            <span>当前档案将被清除，并重新选择驻留期。</span>
            <button type="button" onClick={onRestart}>确认开局</button>
            <button type="button" onClick={() => setConfirming(false)}>取消</button>
          </div>
        ) : <div className="archive-heading-actions">
          {ended && <button type="button" className="ending-score-trigger" onClick={onShowEnding}>结局评分</button>}
          <button type="button" className="restart-stay" onClick={() => setConfirming(true)}>重新开局</button>
        </div>}
      </div>
      <div className="archive-grid">
        <div>
          <section className="timeline-section">
            <div className="section-title"><div><h2>日志</h2></div><span>{timeline.length}</span></div>
            <div className="timeline-list">{timeline.map((entry, i) => (
              <article key={`${entry.week}-${i}`}>
                <i className={entry.kind}></i>
                <div>
                  <small>Y{Math.floor((entry.week - 1) / 52) + 1} W{((entry.week - 1) % 52) + 1}</small>
                  <h3>{entry.title}</h3>
                  <p>{entry.text}</p>
                </div>
              </article>
            ))}</div>
          </section>
        </div>
        <aside className="life-summary">
          <h2>摘要</h2>
          <Meter label="阅读" value={bookProgress} note="最高在读" />
          <Meter label="课程" value={courseProgress} note="最高准备" />
          <Meter label="社交度" value={friendship} note="镇里的往来" />
          <div className="archive-numbers">
            <div><b>Lv.{houseLevel}</b><span>地产</span></div>
            <div><b>{travels}</b><span>出行</span></div>
            <div><b>{memories}</b><span>记忆</span></div>
            <div><b>{works.length}</b><span>作品</span></div>
          </div>
        </aside>
      </div>
    </section>
  );
}
function WeekReport({settlement,onClose,energy,stress,health,cleanliness,grounds,sociability,memories}:{settlement:WeekSettlement;onClose:()=>void;energy:number;stress:number;health:number;cleanliness:number;grounds:number;sociability:number;memories:number}) {
  const {counts,gathering,money,changes,notices}=settlement;
  return <div className="modal-backdrop"><dialog className="report-modal" open aria-labelledby="report-title">
    <button className="close" onClick={onClose} aria-label="关闭"><X/></button><p className="eyebrow">周报</p>
    <h2 id="report-title">{settlement.weeks&&settlement.weeks>1?`第 ${settlement.week}–${settlement.week+settlement.weeks-1} 周已托管`:`第 ${settlement.week} 周已结算`}</h2>
    <p className="report-lead">阅读 {counts.reading} · 课程 {counts.course} · 健身 {counts.fitness} · 聚会 {counts.social} · 创作 {counts.project} · 外出 {counts.out} · 娱乐 {counts.free}</p>
    {gathering&&<p className="report-lead">{gathering.guests>0?`${gathering.title}：到了 ${gathering.guests} 人`:`${gathering.title}：无人到场，独自进行`}</p>}
    <div className="report-stats"><div><b>+{money.earned}</b><span>收入</span></div><div><b>-{money.expenses}</b><span>{settlement.weeks&&settlement.weeks>1?'期间支出':'本周支出'}</span></div><div><b>{money.closing.toLocaleString()}</b><span>余额</span></div></div>
    <div className="report-breakdown">
      <p><span>期初 {money.opening.toLocaleString()}</span><span>奖励 +{money.rewards}</span><b>净变化 {money.closing-money.opening>=0?'+':''}{money.closing-money.opening}</b></p>
      {changes.length>0&&<ul>{changes.map(change=>{
        const raw=change.after-change.before;
        const delta=Math.round(((change.invert?-raw:raw)*10))/10;
        const prefix=change.remaining?'还剩 ':'';
        return <li key={change.label}><span>{change.label}</span><b>{prefix}{Math.round(change.before)}{change.unit} → {prefix}{Math.round(change.after)}{change.unit}</b><em>{delta>0?`+${delta}`:`${delta}`}{change.unit??''}</em></li>;
      })}</ul>}
      {notices.length>0&&<ol>{notices.map(notice=><li key={notice}>{notice}</li>)}</ol>}
    </div>
    <div className="report-wellbeing"><span><b>{Math.round(energy)}</b><small>精力</small></span><span><b>{Math.round(stress)}</b><small>压力</small></span><span><b>{Math.round(health)}</b><small>体能</small></span><span><b>{Math.round(cleanliness)}</b><small>清洁</small></span><span><b>{Math.round(grounds)}</b><small>园景</small></span><span><b>{Math.round(sociability)}</b><small>社交</small></span><span><b>{memories}</b><small>记忆</small></span><p>{settlement.leanWeeks?`催缴第 ${settlement.leanWeeks} 周。驻留资格仍有效，配给缩水。`:energy<25||stress>75?'舒缓模式已开。进度保留。':cleanliness<35?'屋子偏脏，休息变差。':'状态正常。'}</p></div>
    <footer><Button onClick={onClose} size="lg">关闭</Button></footer>
  </dialog></div>;
}
