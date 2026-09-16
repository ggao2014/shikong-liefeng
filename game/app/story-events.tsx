import { BookOpen, ChevronRight, Dumbbell, GraduationCap, Heart, Sparkles, Sun } from 'lucide-react';

export type StoryEffect = { funds?:number; book?:number; course?:number; friendship?:number; trust?:number; energy?:number; stress?:number; health?:number };
export type StoryChoice = { id:string; label:string; detail:string; outcome:string; effects:StoryEffect };
export type StoryEvent = { id:string; activity:'reading'|'course'|'fitness'|'social'|'rest'; eyebrow:string; title:string; scene:string; choices:StoryChoice[] };

// TODO: 回合结束后的叙事事件弹窗已在 page.tsx 用 ENABLE_STORY_EVENT_MODAL 关掉，后续再实现触发、选项与入档。
export const storyEvents: StoryEvent[] = [
  {id:'margin-map',activity:'reading',eyebrow:'馆藏 · 未登记附件',title:'夹页手绘河谷图',scene:'《群星植物志》旧版检出未登记手绘图。馆员确认不在目录。',choices:[
    {id:'archive',label:'移交整理',detail:'编入地方索引。',outcome:'已编入地方档案索引。',effects:{book:6,funds:35,stress:2}},
    {id:'follow',label:'自行临摹',detail:'收入私人札记。',outcome:'临本收入札记，待核验。',effects:{book:3,energy:4,stress:-3}},
  ]},
  {id:'open-seminar',activity:'course',eyebrow:'大学 · 课后',title:'观察记录与教材不符',scene:'诺亚教授发现你的记录与教材结论不一致。可选当场说明或课后整理。',choices:[
    {id:'present',label:'当场说明',detail:'进入课堂讨论。',outcome:'已提出待验证问题。',effects:{course:8,funds:40,stress:5}},
    {id:'prepare',label:'约同学整理',detail:'改小组核验。',outcome:'已约标本室对照，同学入名册。',effects:{course:5,friendship:5,stress:-1}},
  ]},
  {id:'river-run',activity:'fitness',eyebrow:'河岸 · 慢跑队',title:'桥边集合',scene:'队伍不计名次，岔路口等齐。领队问：跟跑全程，或陪新人走跑。',choices:[
    {id:'join',label:'跟跑全程',detail:'完成既定距离。',outcome:'全程完成，未加速。',effects:{health:6,energy:-4,friendship:3}},
    {id:'guide',label:'陪新人',detail:'降强度。',outcome:'走跑交替完成，回程提前。',effects:{health:3,friendship:6,stress:-5}},
  ]},
  {id:'tea-letter',activity:'social',eyebrow:'小屋 · 聚会',title:'未寄出的信',scene:'到场的人带来两封未寄信，未要求评判，只问是否也写一封。',choices:[
    {id:'together',label:'同席写',detail:'交换一段记忆。',outcome:'未换信纸。记录共同沉默一次。',effects:{friendship:7,trust:6,stress:-3}},
    {id:'listen',label:'先听完',detail:'本场不回应。',outcome:'旧信重新入封。未代作决定。',effects:{trust:8,energy:3,stress:-4}},
  ]},
  {id:'quiet-window',activity:'rest',eyebrow:'白榛地 · 空档',title:'无必办事项',scene:'本日无截止项。可停工，或只整理札记。',choices:[
    {id:'sleep',label:'不排程',detail:'由身体决定作息。',outcome:'无新成果。精力回补。',effects:{energy:12,stress:-8,health:2}},
    {id:'notes',label:'整理札记',detail:'只做清头绪的部分。',outcome:'散页并成线索。天黑前停止。',effects:{book:4,course:3,energy:5,stress:-4}},
  ]},
];

const eventIcons = {reading:BookOpen,course:GraduationCap,fitness:Dumbbell,social:Heart,rest:Sun};

export function chooseStoryEvent(counts:Record<string,number>,week:number) {
  const available=storyEvents.filter(event=>counts[event.activity]>0);
  return available.length?available[(week-1)%available.length]:storyEvents[storyEvents.length-1];
}

export function StoryEventModal({event,onChoose}:{event:StoryEvent;onChoose:(choice:StoryChoice)=>void}) {
  const Icon=eventIcons[event.activity];
  return <div className="modal-backdrop"><dialog className="story-modal" open aria-labelledby="story-title"><div className="story-mark"><Icon/></div><p className="eyebrow">{event.eyebrow}</p><h2 id="story-title">{event.title}</h2><p className="story-scene">{event.scene}</p><div className="story-choices">{event.choices.map(choice=><button key={choice.id} onClick={()=>onChoose(choice)}><span><b>{choice.label}</b><small>{choice.detail}</small></span><ChevronRight/></button>)}</div><footer><span>两项均写入本周档案。</span></footer></dialog></div>;
}

const effectLabels: Record<keyof StoryEffect,string> = {funds:'余额',book:'阅读',course:'课程',friendship:'社交度',trust:'社交度',energy:'精力',stress:'压力',health:'体能'};

export function StoryOutcomeModal({title,choice,onClose}:{title:string;choice:StoryChoice;onClose:()=>void}) {
  const effects=Object.entries(choice.effects) as [keyof StoryEffect,number][];
  return <div className="modal-backdrop"><dialog className="story-modal story-outcome" open aria-labelledby="outcome-title"><div className="story-mark"><Sparkles/></div><p className="eyebrow">已入档</p><h2 id="outcome-title">{title}</h2><p className="story-scene">{choice.outcome}</p><div className="outcome-effects">{effects.map(([key,value])=><span key={key} className={key==='stress'&&value>0?'care':''}><small>{effectLabels[key]}</small><b>{value>0?'+':''}{value}</b></span>)}</div><button className="outcome-close" onClick={onClose}>关闭</button></dialog></div>;
}
