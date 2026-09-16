import { Anchor, BedDouble, BookOpen, Building2, Church, Compass, Cylinder, Fish, Flower2, Globe, Grape, Hotel, Landmark, Library, Mountain, Music, Palette, Sailboat, Ship, Snowflake, Sparkles, Sun, Tent, TrainFront, Trees, UtensilsCrossed, Waves, Wind, type LucideIcon } from 'lucide-react';
import { type Prerequisite } from './prerequisites';
import { type SkillId } from './skill-catalog';

export type TravelKind = '度假村' | '邮轮列车' | '城市' | '自然';
export type TravelStay = { weeks: number; label: string; cost: number };

export type TravelDestination = {
  id: string;
  title: string;
  kind: TravelKind;
  desc: string;
  scene: string;
  icon: LucideIcon;
  stays: TravelStay[];
  energy: number;
  stress: number;
  health: number;
  social: number;
  reading: number;
  skill?: { id: SkillId; amount: number }[];
  seasonBonus?: { season: '春' | '夏' | '秋' | '冬'; energy?: number; stress?: number; health?: number; social?: number };
  prerequisites: Prerequisite[];
};

export type SpanBand = '短期' | '中长期' | '长期';

export function spanLabel(weeks: number) {
  if (weeks >= 52 && weeks % 52 === 0) return `${weeks / 52} 年`;
  if (weeks === 39) return '9 个月';
  if (weeks === 26) return '半年';
  if (weeks === 16) return '4 个月';
  if (weeks === 13) return '3 个月';
  if (weeks === 8) return '2 个月';
  return `${weeks} 周`;
}

export function spanBand(weeks: number): SpanBand {
  if (weeks >= 26) return '长期';
  if (weeks >= 8) return '中长期';
  return '短期';
}

export function destinationBand(dest: TravelDestination) {
  return spanBand(Math.max(...dest.stays.map(item => item.weeks)));
}

const stay = (weeks: number, cost: number): TravelStay => ({
  weeks,
  cost,
  label: spanLabel(weeks),
});

export const travelCatalog: TravelDestination[] = [
  {
    id: 'jade-spa', title: '翡翠湖温泉度假村', kind: '度假村', icon: Waves,
    desc: '湖畔森林中的高端温泉酒店，主打泡汤、按摩、阅读和彻底躺平。',
    scene: '湖汽和林影把日程挤出去。泡汤、按摩、把带去的书读完几章。',
    stays: [stay(1, 420), stay(2, 780), stay(4, 1480)],
    energy: 48, stress: -52, health: 22, social: 0.2, reading: 1.4,
    prerequisites: [{ kind: 'travel', value: 1, label: '先完成 1 次旅行' }],
  },
  {
    id: 'pine-ski', title: '白松山滑雪度假村', kind: '度假村', icon: Snowflake,
    desc: '雪山木屋、滑雪场、壁炉酒吧和山顶餐厅，冬季尤其热闹。',
    scene: '木屋壁炉还热着。坡道、酒吧、山顶那一餐把冬天过成一件事。',
    stays: [stay(1, 380), stay(2, 720), stay(4, 1360)],
    energy: 32, stress: -36, health: 26, social: 0.6, reading: 0.3,
    seasonBonus: { season: '冬', health: 2, energy: 1, stress: -1 },
    prerequisites: [{ kind: 'travel', value: 1, label: '先完成 1 次旅行' }],
  },
  {
    id: 'azure-coast', title: '蔚蓝海岸全包度假村', kind: '度假村', icon: Sun,
    desc: '私人海滩、泳池、SPA、水上项目和全天餐饮，适合什么都不操心地住上一阵。',
    scene: '全包之后不用想下一餐。海滩、泳池、SPA，把操心留在镇上。',
    stays: [stay(1, 560), stay(2, 1040), stay(4, 1960)],
    energy: 52, stress: -56, health: 22, social: 0.4, reading: 0.4,
    seasonBonus: { season: '夏', energy: 2, stress: -1 },
    prerequisites: [{ kind: 'travel', value: 1, label: '先完成 1 次旅行' }],
  },
  {
    id: 'cloud-manor', title: '云顶高山疗养庄园', kind: '度假村', icon: Mountain,
    desc: '位于高山草甸，以徒步、瑜伽、森林浴和安静疗养为主。',
    scene: '草甸风把话吹薄。徒步、瑜伽、森林浴，日程只剩下身体。',
    stays: [stay(1, 340), stay(2, 640), stay(4, 1180)],
    energy: 44, stress: -48, health: 26, social: 0.1, reading: 0.6,
    prerequisites: [{ kind: 'travel', value: 1, label: '先完成 1 次旅行' }],
  },
  {
    id: 'laurel-wine', title: '月桂谷葡萄酒庄度假村', kind: '度假村', icon: Grape,
    desc: '葡萄园、酒窖、庄园酒店、骑行路线和精致餐厅。',
    scene: '酒窖温度恒定。骑行穿过藤架，晚上才回到庄园餐厅。',
    stays: [stay(1, 400), stay(2, 760), stay(4, 1420)],
    energy: 36, stress: -40, health: 16, social: 0.8, reading: 0.3,
    seasonBonus: { season: '秋', social: 0.4, stress: -1 },
    prerequisites: [{ kind: 'travel', value: 1, label: '先完成 1 次旅行' }],
  },
  {
    id: 'silver-cruise', title: '银湾邮轮港', kind: '邮轮列车', icon: Ship,
    desc: '可登上大型海上邮轮，前往群岛、热带海域或沿海城市。',
    scene: '从银湾上船。群岛、热带海域或沿海城市在航程里轮换出现。',
    stays: [stay(2, 980), stay(4, 1860), stay(6, 2680)],
    energy: 36, stress: -40, health: 16, social: 1.1, reading: 0.8,
    prerequisites: [{ kind: 'travel', value: 2, label: '先完成 2 次旅行' }, { kind: 'week', value: 16, label: '驻留满 16 周' }],
  },
  {
    id: 'aurora-cruise', title: '极光号北境邮轮', kind: '邮轮列车', icon: Snowflake,
    desc: '从寒冷的北方港口启航，沿峡湾、冰川和雪山航行。',
    scene: '甲板很冷。峡湾、冰川和雪山从舷窗里缓慢经过。',
    stays: [stay(2, 1120), stay(4, 2140), stay(8, 3960)],
    energy: 32, stress: -42, health: 20, social: 0.9, reading: 1,
    seasonBonus: { season: '冬', energy: 1, health: 1, stress: -2 },
    prerequisites: [{ kind: 'travel', value: 3, label: '先完成 3 次旅行' }, { kind: 'week', value: 24, label: '驻留满 24 周' }],
  },
  {
    id: 'star-cruise', title: '星河号环球邮轮', kind: '邮轮列车', icon: Globe,
    desc: '超大型长期邮轮项目，本身就像一座移动城市，可分航段参加。',
    scene: '船大得像一座城。这一段航程只是环球线路上的一截。',
    stays: [stay(4, 2480), stay(8, 4680), stay(13, 7200)],
    energy: 36, stress: -40, health: 16, social: 1.4, reading: 1.2,
    prerequisites: [{ kind: 'travel', value: 5, label: '先完成 5 次旅行' }, { kind: 'week', value: 40, label: '驻留满 40 周' }],
  },
  {
    id: 'blue-river', title: '皇家蓝河轮', kind: '邮轮列车', icon: Sailboat,
    desc: '沿大河缓慢航行的小型豪华游轮，途中停靠古镇、城堡和葡萄园。',
    scene: '河比海慢。古镇、城堡和葡萄园在停靠时才登岸。',
    stays: [stay(1, 520), stay(2, 980), stay(4, 1860)],
    energy: 36, stress: -40, health: 14, social: 0.8, reading: 0.7,
    prerequisites: [{ kind: 'travel', value: 2, label: '先完成 2 次旅行' }],
  },
  {
    id: 'gold-train', title: '金穗田园列车假期', kind: '邮轮列车', icon: TrainFront,
    desc: '不是前往某个城市，而是一趟观光列车项目；豪华卧铺车厢一路穿越农田、山谷和小镇。',
    scene: '卧铺窗外是农田、山谷和小镇。目的地就是这趟车本身。',
    stays: [stay(1, 360), stay(2, 680), stay(3, 960)],
    energy: 34, stress: -36, health: 14, social: 0.5, reading: 1.6,
    prerequisites: [{ kind: 'travel', value: 1, label: '先完成 1 次旅行' }],
  },
  {
    id: 'rose-city', title: '玫瑰城', kind: '城市', icon: Landmark,
    desc: '古老而繁华的大城市，有剧院、美术馆、百货商店、大学和历史街区。',
    scene: '剧院散场后街上还亮着。美术馆、百货和历史街区可以走很久。',
    stays: [stay(1, 280), stay(2, 520), stay(4, 960)],
    energy: 28, stress: -34, health: 12, social: 1.3, reading: 0.8,
    prerequisites: [],
  },
  {
    id: 'gull-port', title: '海鸥港', kind: '城市', icon: Anchor,
    desc: '热闹的海港城市，可以逛鱼市、灯塔、海洋馆和滨海商业街。',
    scene: '鱼市收摊前最挤。灯塔、海洋馆和滨海商业街连成一条下午。',
    stays: [stay(1, 240), stay(2, 440), stay(4, 820)],
    energy: 30, stress: -36, health: 14, social: 1.1, reading: 0.3,
    prerequisites: [],
  },
  {
    id: 'maple-town', title: '枫桥镇', kind: '城市', icon: BookOpen,
    desc: '保存完好的历史小镇，以书店、古董店、咖啡馆和周末市集闻名。',
    scene: '书店和古董店隔着一座石桥。周末市集把整条街占满。',
    stays: [stay(1, 160), stay(2, 300), stay(4, 560)],
    energy: 30, stress: -36, health: 12, social: 0.7, reading: 1.2,
    prerequisites: [],
  },
  {
    id: 'gold-metro', title: '黄金城', kind: '城市', icon: Building2,
    desc: '摩天楼林立的大都会，拥有高级购物、音乐剧、夜生活和顶级餐厅。',
    scene: '音乐剧散场已过午夜。购物和餐厅把白天填满。',
    stays: [stay(1, 420), stay(2, 800), stay(4, 1520)],
    energy: 20, stress: -24, health: 8, social: 1.5, reading: 0.2,
    prerequisites: [{ kind: 'travel', value: 2, label: '先完成 2 次旅行' }, { kind: 'social', value: 28, label: '社交度达到 28' }],
  },
  {
    id: 'lily-old', title: '圣百合古城', kind: '城市', icon: Church,
    desc: '教堂、石板街、宫殿和博物馆密集，非常适合文化旅行。',
    scene: '石板街通向宫殿和博物馆。教堂钟声把参观切成整点。',
    stays: [stay(1, 300), stay(2, 560), stay(4, 1040)],
    energy: 28, stress: -34, health: 10, social: 0.6, reading: 1.4,
    prerequisites: [{ kind: 'travel', value: 1, label: '先完成 1 次旅行' }],
  },
  {
    id: 'mirror-arts', title: '镜湖艺术村', kind: '城市', icon: Palette,
    desc: '聚集画家、陶艺家、作家和手工艺人的湖边小镇，可以参加短期艺术课程。',
    scene: '湖边工作室不关门。短期课程把素描、陶坯或未写完的句子带回家。',
    stays: [stay(1, 220), stay(2, 400), stay(4, 740)],
    energy: 28, stress: -34, health: 10, social: 0.9, reading: 0.4,
    skill: [{ id: 'drawing', amount: 0.45 }, { id: 'pottery', amount: 0.3 }, { id: 'writing', amount: 0.45 }],
    prerequisites: [{ kind: 'travel', value: 1, label: '先完成 1 次旅行' }],
  },
  {
    id: 'red-rock', title: '红岩国家公园', kind: '自然', icon: Mountain,
    desc: '峡谷、荒漠和巨大岩壁组成的自然保护区，有游客中心和山间旅馆。',
    scene: '岩壁在午后变成深红。游客中心和山间旅馆之间是一天的路。',
    stays: [stay(1, 200), stay(2, 360), stay(4, 660)],
    energy: 32, stress: -38, health: 26, social: 0.2, reading: 0.4,
    prerequisites: [],
  },
  {
    id: 'antler-park', title: '鹿角森林国家公园', kind: '自然', icon: Trees,
    desc: '湖泊、瀑布、森林和野生动物丰富，可以露营、住木屋或进行多日徒步。',
    scene: '木屋外是湖和瀑布。多日徒步把镇上的日程忘掉。',
    stays: [stay(1, 180), stay(2, 340), stay(4, 620)],
    energy: 36, stress: -42, health: 30, social: 0.2, reading: 0.3,
    prerequisites: [],
  },
  {
    id: 'coral-isles', title: '珊瑚群岛', kind: '自然', icon: Fish,
    desc: '火车抵达海港后换乘渡轮，岛上可以潜水、浮潜、帆船和海滩度假。',
    scene: '渡轮之后才是岛。潜水、浮潜和帆船把白天交给水。',
    stays: [stay(1, 480), stay(2, 900), stay(4, 1680)],
    energy: 44, stress: -48, health: 30, social: 0.5, reading: 0.2,
    seasonBonus: { season: '夏', health: 1, energy: 1 },
    prerequisites: [{ kind: 'travel', value: 2, label: '先完成 2 次旅行' }],
  },
  {
    id: 'north-base', title: '北境探险基地', kind: '自然', icon: Tent,
    desc: '位于文明世界边缘的小型聚落，可参加冰川徒步、狗拉雪橇、极光观测和荒野探险。',
    scene: '聚落很小。冰川徒步、狗拉雪橇和极光观测排满短昼。',
    stays: [stay(1, 360), stay(2, 680), stay(4, 1260)],
    energy: 28, stress: -34, health: 30, social: 0.4, reading: 0.5,
    seasonBonus: { season: '冬', health: 2, stress: -1 },
    prerequisites: [{ kind: 'travel', value: 2, label: '先完成 2 次旅行' }, { kind: 'week', value: 20, label: '驻留满 20 周' }],
  },
  {
    id: 'mist-abbey', title: '白雾山静修院', kind: '自然', icon: Wind,
    desc: '山腰寺院只接待短住。日程被钟声切开，适合把带去的书读完，把镇上的压力留在山脚。',
    scene: '雾从谷底爬上来。钟声把一天分成几段，书页比镇上安静。',
    stays: [stay(1, 220), stay(2, 400), stay(4, 740)],
    energy: 44, stress: -56, health: 18, social: 0.1, reading: 1.8,
    prerequisites: [{ kind: 'travel', value: 1, label: '先完成 1 次旅行' }],
  },
  {
    id: 'harvest-kitchen', title: '丰收谷厨宿', kind: '度假村', icon: UtensilsCrossed,
    desc: '住进农庄厨房，跟当地厨子学时令菜。秋季最忙，灶火从清晨一直亮到晚饭后。',
    scene: '菜园比菜单更早醒来。你把时令菜学进手里，晚饭是当天的收成。',
    stays: [stay(1, 280), stay(2, 520), stay(4, 960)],
    energy: 32, stress: -36, health: 16, social: 0.8, reading: 0.2,
    skill: [{ id: 'cooking', amount: 0.45 }],
    seasonBonus: { season: '秋', social: 0.3, health: 1, stress: -1 },
    prerequisites: [],
  },
  {
    id: 'tide-conservatory', title: '潮声音乐城', kind: '城市', icon: Music,
    desc: '海港边上的音乐学院城，夜晚有学生音乐会。可旁听短课，把钢琴练习带到旅店。',
    scene: '排练室的窗子对着海。散场后还能听见潮声和没关严的钢琴。',
    stays: [stay(1, 320), stay(2, 600), stay(4, 1120)],
    energy: 24, stress: -32, health: 8, social: 0.8, reading: 0.5,
    skill: [{ id: 'piano', amount: 0.45 }],
    prerequisites: [{ kind: 'travel', value: 1, label: '先完成 1 次旅行' }],
  },
  {
    id: 'clay-brook', title: '陶溪古镇', kind: '城市', icon: Cylinder,
    desc: '沿溪的窑户还在烧日常器皿。可以住进作坊客房，跟一窑陶一起等火候。',
    scene: '匣钵叠在溪边。泥、水和烟把几天过成同一件事。',
    stays: [stay(1, 200), stay(2, 380), stay(4, 700)],
    energy: 24, stress: -32, health: 8, social: 0.6, reading: 0.3,
    skill: [{ id: 'pottery', amount: 0.45 }],
    prerequisites: [{ kind: 'travel', value: 1, label: '先完成 1 次旅行' }],
  },
  {
    id: 'lake-sketch', title: '湖湾写生旅舍', kind: '自然', icon: Palette,
    desc: '镜湖支湾的小旅舍专接待写生。清晨有公共码头，傍晚把未干的速写摊在廊上。',
    scene: '码头的影子一天变三次。速写本比日程更先被填满。',
    stays: [stay(1, 180), stay(2, 340), stay(4, 620)],
    energy: 28, stress: -34, health: 14, social: 0.4, reading: 0.3,
    skill: [{ id: 'drawing', amount: 0.45 }],
    prerequisites: [{ kind: 'travel', value: 1, label: '先完成 1 次旅行' }],
  },
  {
    id: 'star-desert', title: '星沙营地', kind: '自然', icon: Sparkles,
    desc: '荒漠边缘的观星营地，白天炎热，夜里极冷也极清楚。适合把身体交给天气。',
    scene: '帐篷外没有灯。星星比镇上能看见的多出一整层。',
    stays: [stay(1, 260), stay(2, 480), stay(4, 900)],
    energy: 32, stress: -42, health: 26, social: 0.3, reading: 0.6,
    seasonBonus: { season: '秋', health: 1, stress: -1 },
    prerequisites: [{ kind: 'travel', value: 1, label: '先完成 1 次旅行' }],
  },
  {
    id: 'night-sakura', title: '夜樱号温泉列车', kind: '邮轮列车', icon: Flower2,
    desc: '春季才加开的温泉观光列车，夜间穿过花谷，车厢里有小型浴池和卧铺。',
    scene: '窗外是夜色里的花。浴池的蒸汽在过隧道时贴上玻璃。',
    stays: [stay(1, 380), stay(2, 720), stay(3, 1040)],
    energy: 46, stress: -50, health: 18, social: 0.7, reading: 0.8,
    seasonBonus: { season: '春', energy: 1, stress: -1, social: 0.3 },
    prerequisites: [{ kind: 'travel', value: 1, label: '先完成 1 次旅行' }],
  },
  {
    id: 'jade-season', title: '翡翠湖疗养季', kind: '度假村', icon: Hotel,
    desc: '按整季签约的湖畔疗养。房间固定，日程只剩泡汤、散步和把带去的书读完。',
    scene: '同一扇窗对着湖汽。几个月后，镇上的日程已经不像自己的。',
    stays: [stay(8, 2680), stay(13, 3960)],
    energy: 28, stress: -32, health: 14, social: 0.2, reading: 1.2,
    prerequisites: [{ kind: 'travel', value: 2, label: '先完成 2 次旅行' }],
  },
  {
    id: 'harvest-term', title: '丰收谷厨季宿', kind: '度假村', icon: UtensilsCrossed,
    desc: '在农庄厨房住满一季，跟着时令换菜单。秋季最忙，其他季节学保存和发酵。',
    scene: '菜园按周改样子。你把一季的菜单写进本子，灶火比日历更准。',
    stays: [stay(8, 1880), stay(13, 2740)],
    energy: 18, stress: -22, health: 10, social: 0.6, reading: 0.2,
    skill: [{ id: 'cooking', amount: 0.18 }],
    seasonBonus: { season: '秋', social: 0.3, health: 1 },
    prerequisites: [{ kind: 'travel', value: 1, label: '先完成 1 次旅行' }],
  },
  {
    id: 'laurel-year', title: '月桂谷年居', kind: '度假村', icon: Grape,
    desc: '在葡萄酒庄租一年客房。春耕、夏剪、秋收、冬酿，四个季节都住在藤架里。',
    scene: '第一年的酒还在桶里。你已经看过藤叶从嫩到枯，再回到嫩。',
    stays: [stay(26, 6240), stay(52, 10800)],
    energy: 18, stress: -22, health: 10, social: 0.5, reading: 0.4,
    seasonBonus: { season: '秋', social: 0.3, stress: -1 },
    prerequisites: [{ kind: 'travel', value: 4, label: '先完成 4 次旅行' }, { kind: 'week', value: 26, label: '驻留满 26 周' }],
  },
  {
    id: 'blue-season', title: '蓝河整季航', kind: '邮轮列车', icon: Sailboat,
    desc: '小型河轮按整季包舱，沿河缓慢停靠古镇与葡萄园，中途很少下长住。',
    scene: '河岸的镇子反复出现。你开始认得哪一段码头的钟慢三分钟。',
    stays: [stay(8, 3120), stay(13, 4680)],
    energy: 22, stress: -26, health: 10, social: 0.7, reading: 0.8,
    prerequisites: [{ kind: 'travel', value: 3, label: '先完成 3 次旅行' }, { kind: 'week', value: 16, label: '驻留满 16 周' }],
  },
  {
    id: 'aurora-leg', title: '极光号长航段', kind: '邮轮列车', icon: Compass,
    desc: '北境邮轮的跨季航段，沿峡湾走完极夜前后的一整段。甲板冷，舱内有图书馆。',
    scene: '极夜把白天收得很短。峡湾在舷窗里来回，书比甲板更常打开。',
    stays: [stay(13, 5840), stay(16, 6920)],
    energy: 18, stress: -24, health: 14, social: 0.8, reading: 1.1,
    seasonBonus: { season: '冬', energy: 1, health: 1, stress: -1 },
    prerequisites: [{ kind: 'travel', value: 4, label: '先完成 4 次旅行' }, { kind: 'week', value: 24, label: '驻留满 24 周' }],
  },
  {
    id: 'star-year', title: '星河号全年旅居', kind: '邮轮列车', icon: Globe,
    desc: '以旅客身份在环球邮轮上住满半年或一年。船是移动的城市，航段在船上衔接。',
    scene: '港口换了又换。舱室成了住所，镇上的房子变成定期要付的维护。',
    stays: [stay(26, 11200), stay(52, 19600)],
    energy: 18, stress: -22, health: 10, social: 1.1, reading: 1,
    prerequisites: [{ kind: 'travel', value: 6, label: '先完成 6 次旅行' }, { kind: 'week', value: 40, label: '驻留满 40 周' }],
  },
  {
    id: 'rose-term', title: '玫瑰城客居', kind: '城市', icon: Landmark,
    desc: '在玫瑰城租一间带家具的房间，按整季住。剧院、美术馆和旧街区可以慢慢走完。',
    scene: '同一张季票被剪过很多次。街道在几个月后开始认得你的脚步。',
    stays: [stay(8, 1680), stay(13, 2460)],
    energy: 16, stress: -20, health: 6, social: 1, reading: 0.7,
    prerequisites: [{ kind: 'travel', value: 2, label: '先完成 2 次旅行' }],
  },
  {
    id: 'conservatory-term', title: '潮声旁听季', kind: '城市', icon: Music,
    desc: '在潮声音乐城旁听一季。琴房按周排，晚上可以去学生音乐会。',
    scene: '排练室对着海的窗子从不关严。一季结束时，潮声已经进到指法里。',
    stays: [stay(8, 2140), stay(13, 3180)],
    energy: 16, stress: -22, health: 6, social: 0.6, reading: 0.4,
    skill: [{ id: 'piano', amount: 0.18 }],
    prerequisites: [{ kind: 'travel', value: 2, label: '先完成 2 次旅行' }],
  },
  {
    id: 'maple-year', title: '枫桥镇年租', kind: '城市', icon: Library,
    desc: '在枫桥镇租一间书店楼上的房间，按半年或一年算。适合把大量阅读留在一座石桥边。',
    scene: '桥下的水按季变声。书店的常客开始把你算进早上的位置。',
    stays: [stay(26, 3120), stay(52, 5400)],
    energy: 16, stress: -20, health: 6, social: 0.5, reading: 1.3,
    prerequisites: [{ kind: 'travel', value: 3, label: '先完成 3 次旅行' }, { kind: 'week', value: 20, label: '驻留满 20 周' }],
  },
  {
    id: 'antler-season', title: '鹿角林季护', kind: '自然', icon: Trees,
    desc: '在鹿角森林国家公园住满一季，协助巡护与访客讲解，晚上回到木屋。',
    scene: '湖和瀑布不再是景点。你开始按周记住哪一段栈道会湿。',
    stays: [stay(8, 1280), stay(13, 1860)],
    energy: 22, stress: -26, health: 18, social: 0.3, reading: 0.3,
    prerequisites: [{ kind: 'travel', value: 2, label: '先完成 2 次旅行' }],
  },
  {
    id: 'mist-term', title: '白雾静修季', kind: '自然', icon: Wind,
    desc: '静修院的整季名额。钟声、素食和固定阅读时间，把几个月过成同一件事。',
    scene: '雾来的时辰都能预知。书比话多，镇上的压力留在山脚。',
    stays: [stay(8, 1540), stay(13, 2260)],
    energy: 28, stress: -36, health: 12, social: 0.1, reading: 1.6,
    prerequisites: [{ kind: 'travel', value: 2, label: '先完成 2 次旅行' }],
  },
  {
    id: 'red-year', title: '红岩驻站年', kind: '自然', icon: BedDouble,
    desc: '在红岩国家公园的驻站宿舍住半年或一年，做长期记录与步道维护，食宿从简。',
    scene: '岩壁的颜色按季节换。游客走了又来，你的床还对着同一道裂缝。',
    stays: [stay(26, 2860), stay(52, 4920)],
    energy: 18, stress: -22, health: 14, social: 0.3, reading: 0.5,
    prerequisites: [{ kind: 'travel', value: 3, label: '先完成 3 次旅行' }, { kind: 'week', value: 26, label: '驻留满 26 周' }],
  },
];

export const travelKinds: TravelKind[] = ['度假村', '邮轮列车', '城市', '自然'];

export function getTravel(id: string) {
  return travelCatalog.find(item => item.id === id) ?? travelCatalog.find(item => item.id === 'maple-town') ?? travelCatalog[0];
}

export function getTravelStay(dest: TravelDestination, weeks: number) {
  return dest.stays.find(item => item.weeks === weeks) ?? null;
}

export function travelWeekEffects(dest: TravelDestination, season: '春' | '夏' | '秋' | '冬') {
  const bonus = dest.seasonBonus?.season === season ? dest.seasonBonus : undefined;
  return {
    energy: dest.energy + (bonus?.energy ?? 0),
    stress: dest.stress + (bonus?.stress ?? 0),
    health: dest.health + (bonus?.health ?? 0),
    social: dest.social + (bonus?.social ?? 0),
    reading: dest.reading,
  };
}

function signedRest(value: number) {
  const n = Math.round(value * 10) / 10;
  return `${n > 0 ? '+' : ''}${n}`;
}

function restParts(energy: number, stress: number, health: number) {
  return [
    energy ? `精力 ${signedRest(energy)}` : '',
    stress ? `压力 ${signedRest(stress)}` : '',
    health ? `体能 ${signedRest(health)}` : '',
  ].filter(Boolean).join(' · ');
}

export function travelRestFacts(dest: TravelDestination, season: '春' | '夏' | '秋' | '冬', weeks = 1) {
  const fx = travelWeekEffects(dest, season);
  const weekly = restParts(fx.energy, fx.stress, fx.health);
  if (weeks <= 1) return weekly;
  return `每周 ${weekly} · ${spanLabel(weeks)}合计 ${restParts(fx.energy * weeks, fx.stress * weeks, fx.health * weeks)}`;
}
