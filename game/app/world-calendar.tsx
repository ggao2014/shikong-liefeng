export type Festival = {id:string;week:number;title:string;desc:string;activity:'reading'|'course'|'social';activityLabel:string;reward:number};
export type WorldState = {season:'春'|'夏'|'秋'|'冬';seasonIndex:number;weekOfYear:number;weather:string;temperature:number;daylight:string;festival:Festival|null;upcoming:Festival;weeksUntil:number};

export const festivals:Festival[] = [
  {id:'seed-books',week:10,title:'种子与旧书交换日',desc:'温室长廊交换种子、旧书与札记。',activity:'social',activityLabel:'聚会',reward:85},
  {id:'river-lights',week:24,title:'河灯夜',desc:'河岸聚餐，灯罩内侧记一事。',activity:'social',activityLabel:'聚会',reward:95},
  {id:'open-campus',week:38,title:'大学开放周',desc:'教室与实验室向全镇开放。',activity:'course',activityLabel:'课程',reward:110},
  {id:'long-night',week:50,title:'长夜阅读会',desc:'图书馆通宵，轮流朗读。',activity:'reading',activityLabel:'阅读',reward:100},
];

const weatherBySeason = [
  [{name:'细雨',temp:14},{name:'新晴',temp:17},{name:'多云',temp:15}],
  [{name:'晴朗',temp:26},{name:'午后阵雨',temp:23},{name:'南风',temp:25}],
  [{name:'高云',temp:18},{name:'清凉',temp:15},{name:'秋雨',temp:12}],
  [{name:'微雪',temp:-2},{name:'晴冷',temp:1},{name:'北风',temp:-5}],
];

export function getWorldState(week:number):WorldState {
  const weekOfYear=((week-1)%52)+1;
  const seasonIndex=Math.min(3,Math.floor((weekOfYear-1)/13));
  const season=(['春','夏','秋','冬'] as const)[seasonIndex];
  const weather=weatherBySeason[seasonIndex][weekOfYear%3];
  const festival=festivals.find(item=>item.week===weekOfYear)??null;
  const upcoming=festivals.find(item=>item.week>=weekOfYear)??festivals[0];
  const weeksUntil=upcoming.week>=weekOfYear?upcoming.week-weekOfYear:52-weekOfYear+upcoming.week;
  return {season,seasonIndex,weekOfYear,weather:weather.name,temperature:weather.temp,daylight:['12小时34分','14小时48分','11小时41分','9小时17分'][seasonIndex],festival,upcoming,weeksUntil};
}

