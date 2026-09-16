import { BookOpen, Building2, Castle, ChefHat, Dumbbell, Fence, FlaskConical, Flower2, Home, Landmark, Library, Music2, PenTool, Shirt, Sofa, Sparkles, Trees, UserRoundCheck, Warehouse, type LucideIcon } from 'lucide-react';
import { relatedReadingBonus } from './university-catalog';
import { type Prerequisite } from './prerequisites';
import { cookingCoverPerSlot } from './skill-effects';

export type RoomId = 'bedroom' | 'study' | 'library' | 'gym' | 'kitchen' | 'studio' | 'piano' | 'lab' | 'guest';
export type StaffId = 'housekeeper' | 'chef' | 'gardener' | 'steward' | 'librarian' | 'researcher';

export type RoomDefinition = {
  id: RoomId;
  name: string;
  cost: number;
  weekly: number;
  icon: LucideIcon;
  effect: string;
  prerequisites: Prerequisite[];
};

export type StaffDefinition = {
  id: StaffId;
  name: string;
  cost: number;
  weekly: number;
  icon: LucideIcon;
  effect: string;
  prerequisites: Prerequisite[];
};

export type HomeCondition = {
  cleanliness: number;
  grounds: number;
  cooking?: number;
  cookingSkill?: number;
  satiety?: number;
};

export type HouseholdEffects = {
  support: number;
  restEnergy: number;
  freeEnergy: number;
  courseEnergy: number;
  readingEnergy: number;
  fitnessEnergy: number;
  skillEnergy: number;
  socialEnergy: number;
  projectEnergy: number;
  fitnessHealth: number;
  chefHealth: number;
  gardenerHealth: number;
  cleanlinessStress: number;
  cleanlinessHealth: number;
  readingBonus: number;
  researcherCourse: number;
  librarian: number;
  labProject: number;
  researcherProject: number;
  guestIndoor: number;
  borrowLimit: number;
  comfort: number;
  shelterHealth: number;
  campEnergy: number;
  restHealth: number;
  upkeep: number;
};

export const roomCatalog: RoomDefinition[] = [
  { id: 'bedroom', name: '原初小破屋', cost: 0, weekly: 0, icon: Home, effect: '第一间屋顶。破产时整栋收回，只留土地。', prerequisites: [] },
  { id: 'study', name: '书房', cost: 0, weekly: 0, icon: BookOpen, effect: '阅读与上课的精力消耗降低。写作练习每次额外 +0.5%。', prerequisites: [] },
  { id: 'library', name: '藏书室', cost: 0, weekly: 0, icon: Library, effect: '阅读每次额外 +1% 进度，借阅上限 +1。', prerequisites: [] },
  { id: 'gym', name: '健身房', cost: 0, weekly: 0, icon: Dumbbell, effect: '健身不必再往返镇中心：消耗降低，体能恢复更好。', prerequisites: [] },
  { id: 'kitchen', name: '正经厨房', cost: 0, weekly: 0, icon: ChefHat, effect: '烹饪练习每次额外 +0.5%。', prerequisites: [] },
  { id: 'studio', name: '画室', cost: 0, weekly: 0, icon: PenTool, effect: '绘画与陶艺练习每次额外 +0.5%。', prerequisites: [] },
  { id: 'piano', name: '琴房', cost: 0, weekly: 0, icon: Music2, effect: '钢琴练习每次额外 +0.5%。', prerequisites: [] },
  { id: 'lab', name: '观象台', cost: 0, weekly: 0, icon: FlaskConical, effect: '创作每次额外进度，并解锁研究助理。', prerequisites: [] },
  { id: 'guest', name: '宾客小屋', cost: 0, weekly: 0, icon: Sofa, effect: '室内聚会更易到场。不办理入住。', prerequisites: [] },
];

export const staffCatalog: StaffDefinition[] = [
  { id: 'housekeeper', name: '家政', cost: 200, weekly: 20, icon: Shirt, effect: '每周打扫。房屋越大需要的人越多；也可自己排「整理家务」。清洁度影响休息与压力。', prerequisites: [{ kind: 'houseLevel', value: 1, label: '需小破屋' }] },
  { id: 'chef', name: '厨师', cost: 320, weekly: 28, icon: ChefHat, effect: '备餐。房屋越大越需要；自己练烹饪可部分替代。影响体能。', prerequisites: [{ kind: 'houseLevel', value: 2, label: '需小屋的正经厨房' }] },
  { id: 'gardener', name: '园丁', cost: 260, weekly: 24, icon: Flower2, effect: '照料花园与车道。乡居以上需要。园景影响空闲恢复。', prerequisites: [{ kind: 'houseLevel', value: 3, label: '需舒适乡居的花园' }] },
  { id: 'steward', name: '管家', cost: 260, weekly: 28, icon: UserRoundCheck, effect: '按余额与房屋规模提交雇人、辞退方案，结算时由你审核。不增雇管家自己。', prerequisites: [{ kind: 'room', id: 'study', label: '需乡间住宅的书房' }] },
  { id: 'librarian', name: '图书管理员', cost: 360, weekly: 28, icon: Library, effect: '整理藏书。相关阅读加成 +1，借阅上限 +1。', prerequisites: [{ kind: 'room', id: 'library', label: '需大宅的藏书室' }] },
  { id: 'researcher', name: '研究助理', cost: 520, weekly: 28, icon: FlaskConical, effect: '协助课程与课题。观象台建成后才有用武之地。', prerequisites: [{ kind: 'room', id: 'lab', label: '需私人领土的观象台' }] },
];

export const roomById = Object.fromEntries(roomCatalog.map(room => [room.id, room])) as Record<RoomId, RoomDefinition>;
export const staffById = Object.fromEntries(staffCatalog.map(person => [person.id, person])) as Record<StaffId, StaffDefinition>;

const live: RoomId[] = ['bedroom'];
const kitchen: RoomId[] = ['bedroom', 'kitchen'];
const office: RoomId[] = ['bedroom', 'kitchen', 'study'];
const library: RoomId[] = ['bedroom', 'kitchen', 'study', 'library'];
const estate: RoomId[] = ['bedroom', 'kitchen', 'study', 'library', 'gym', 'guest'];
const compound: RoomId[] = ['bedroom', 'kitchen', 'study', 'library', 'gym', 'guest', 'studio', 'piano', 'lab'];

export type HouseTier = {
  level: number;
  name: string;
  sqft: string;
  acres: string;
  cost: number;
  weekly: number;
  restEnergy: number;
  freeEnergy: number;
  comfort: number;
  shelterHealth: number;
  focus: number;
  borrowBase: number;
  summary: string;
  house: string[];
  grounds: string[];
  rooms: RoomId[];
  icon: LucideIcon;
};

export const houseTiers: HouseTier[] = [
  {
    level: 0, name: '荒地', sqft: '居住面积 0', acres: '不规则地块', cost: 0, weekly: 0, restEnergy: 3.5, freeEnergy: -0.5, comfort: -14, shelterHealth: -6, focus: 0, borrowBase: 1, icon: Trees,
    summary: '什么都没有。露宿风餐，睡眠几乎无效，体能和精力每周明显下滑。',
    house: [],
    grounds: ['不规则土地', '泥土车道', '杂草与原生树', '没有围栏'],
    rooms: [],
  },
  {
    level: 1, name: '小破屋', sqft: '250–350 平方英尺', acres: '未修整的地块', cost: 520, weekly: 3, restEnergy: 5.2, freeEnergy: 1.5, comfort: 2, shelterHealth: 0.6, focus: 0.08, borrowBase: 2, icon: Home,
    summary: '第一次有了自己的屋顶。',
    house: ['睡觉区', '小桌子', '简易灶台', '小卫生间'],
    grounds: ['门前木台阶', '铁皮顶', '木板外墙'],
    rooms: live,
  },
  {
    level: 2, name: '小屋', sqft: '500–700 平方英尺', acres: '同一块地', cost: 1100, weekly: 9, restEnergy: 6.0, freeEnergy: 2.2, comfort: 3, shelterHealth: 1, focus: 0.18, borrowBase: 3, icon: Home,
    summary: '第一次扩建。原破屋改成客厅/餐厅，这时才像个家。',
    house: ['独立卧室', '正经厨房', '小客厅', '完整浴室'],
    grounds: ['门廊'],
    rooms: kitchen,
  },
  {
    level: 3, name: '舒适乡居', sqft: '900–1,200 平方英尺', acres: '小花园', cost: 2100, weekly: 16, restEnergy: 6.6, freeEnergy: 2.5, comfort: 4, shelterHealth: 1.3, focus: 0.26, borrowBase: 3, icon: Landmark,
    summary: '开始出现不是为了生存、而是为了生活的空间。',
    house: ['两卧两卫', '独立餐厅', '壁炉', '洗衣房', '储藏室'],
    grounds: ['大门廊', '小花园', '碎石车道', '第一座棚屋'],
    rooms: kitchen,
  },
  {
    level: 4, name: '乡间住宅', sqft: '1,600–2,000 平方英尺', acres: '菜园与前院', cost: 3600, weekly: 24, restEnergy: 7.1, freeEnergy: 2.8, comfort: 5, shelterHealth: 1.6, focus: 0.34, borrowBase: 3, icon: Warehouse,
    summary: '菜园、前院和书房都齐了。出门就能看见自己种的东西。',
    house: ['三卧两卫半', '大厨房', '家庭厅', '书房', '步入式食品间', '换衣间'],
    grounds: ['双车车库', '菜园', '温室', '火塘', '小型工坊'],
    rooms: office,
  },
  {
    level: 5, name: '大宅', sqft: '2,800–3,500 平方英尺', acres: '正式景观', cost: 6000, weekly: 34, restEnergy: 7.6, freeEnergy: 3.2, comfort: 6, shelterHealth: 1.9, focus: 0.42, borrowBase: 3, icon: Building2,
    summary: '从普通住宅跨入豪宅。休息与专注明显好过小屋。',
    house: ['两层四卧四卫', '藏书室', '主厨厨房', '大型主卧套房'],
    grounds: ['三车车库', '石板步道', '大露台', '户外厨房', '小型泳池'],
    rooms: library,
  },
  {
    level: 6, name: '庄园', sqft: '5,000–6,500 平方英尺', acres: '分区地产', cost: 9500, weekly: 46, restEnergy: 8.0, freeEnergy: 3.5, comfort: 7, shelterHealth: 2.2, focus: 0.5, borrowBase: 4, icon: Castle,
    summary: '第一次真正成庄园。土地开始划分成不同区域。',
    house: ['健身房', '游戏室', '放映厅', '酒窖'],
    grounds: ['宾客小屋', '泳池房', '四车车库'],
    rooms: estate,
  },
  {
    level: 7, name: '大庄园', sqft: '8,000–10,000 平方英尺', acres: '前庭与果园', cost: 14500, weekly: 60, restEnergy: 8.3, freeEnergy: 3.8, comfort: 8, shelterHealth: 2.5, focus: 0.56, borrowBase: 4, icon: Fence,
    summary: '豪门住宅。安稳与庇护继续拉开。',
    house: ['宴会厅', '会客厅', '水疗', '玻璃花房', '宴席厨房'],
    grounds: ['正式前庭', '喷泉', '门禁入口', '环形车道', '网球场', '果园', '大型温室', '宾客宅'],
    rooms: estate,
  },
  {
    level: 8, name: '多栋庄园', sqft: '10,000–12,000 平方英尺', acres: '建筑组群', cost: 21500, weekly: 76, restEnergy: 8.6, freeEnergy: 4.1, comfort: 8.5, shelterHealth: 2.7, focus: 0.62, borrowBase: 4, icon: Landmark,
    summary: '主屋不再是升级重点。豪华领土是一组建筑。',
    house: ['主屋'],
    grounds: ['宾客宅', '泳池房', '车房公寓', '花园小屋', '工坊', '无边泳池', '正式花园', '水塘'],
    rooms: estate,
  },
  {
    level: 9, name: '豪华领土', sqft: '建筑群', acres: '20–40 英亩', cost: 31000, weekly: 94, restEnergy: 8.9, freeEnergy: 4.4, comfort: 9, shelterHealth: 2.9, focus: 0.68, borrowBase: 4, icon: Sparkles,
    summary: '开始形成小世界。住宅区与服务区彻底分开。',
    house: [],
    grounds: ['亲友别墅', '宴乐亭', '康体楼', '车库领土', '后勤楼'],
    rooms: estate,
  },
  {
    level: 10, name: '大领地', sqft: '私人领地', acres: '50–100 英亩', cost: 44000, weekly: 114, restEnergy: 9.1, freeEnergy: 4.6, comfort: 9.5, shelterHealth: 3.1, focus: 0.74, borrowBase: 5, icon: Castle,
    summary: '已经不是豪宅，而是私人领地。',
    house: [],
    grounds: ['门房', '林荫大道', '前庭大院', '宾客小屋', '马厩', '船屋', '地产管理办公室'],
    rooms: estate,
  },
  {
    level: 11, name: '私人领土', sqft: '10–15 栋建筑', acres: '完整生活生态', cost: 61000, weekly: 136, restEnergy: 9.3, freeEnergy: 4.9, comfort: 10, shelterHealth: 3.3, focus: 0.8, borrowBase: 5, icon: Sparkles,
    summary: '私人领土',
    house: [],
    grounds: ['私人图书馆楼', '画室', '琴房', '观象台', '茶室', '私人影院楼', '室内植物园'],
    rooms: compound,
  },
  {
    level: 12, name: '终极领土', sqft: '主宅 15,000–20,000 平方英尺', acres: '100–300 英亩', cost: 84000, weekly: 160, restEnergy: 9.5, freeEnergy: 5.2, comfort: 11, shelterHealth: 3.6, focus: 0.88, borrowBase: 5, icon: Castle,
    summary: '主宅收束。巨大感来自独立建筑。',
    house: ['主宅收束'],
    grounds: ['林地保留区', '门房', '湖与船屋', '正式园林', '宾客别墅', '康体楼', '宴乐亭', '车房公寓', '车库领土'],
    rooms: compound,
  },
];

const estateImages = [
  { level: 0, src: '/assets/estates/00-wasteland.png' },
  { level: 1, src: '/assets/estates/01-shack.png' },
  { level: 2, src: '/assets/estates/02-cottage.png' },
  { level: 3, src: '/assets/estates/03-country-home.png' },
  { level: 4, src: '/assets/estates/04-country-house.png' },
  { level: 5, src: '/assets/estates/05-manor.png' },
  { level: 7, src: '/assets/estates/07-grand-estate.png' },
  { level: 8, src: '/assets/estates/08-compound.png' },
  { level: 12, src: '/assets/estates/12-palace.png' },
] as const;

/** Missing late-game illustrations intentionally keep the nearest completed form. */
export function estateImageAt(level: number) {
  return [...estateImages].reverse().find(image => level >= image.level)?.src ?? estateImages[0].src;
}

export function estateImageLevelAt(level: number) {
  return [...estateImages].reverse().find(image => level >= image.level)?.level ?? 0;
}

export type EstateHotspotId = 'house' | 'guest' | 'library' | 'out';
export type EstateHotspot = {
  id: EstateHotspotId;
  label: string;
  left: string;
  top: string;
  width: string;
  height: string;
};

type HotspotRect = Pick<EstateHotspot, 'left' | 'top' | 'width' | 'height'>;
type EstateHotspotLayout = {
  house?: HotspotRect;
  guest?: HotspotRect;
  library?: HotspotRect;
  garage?: HotspotRect;
  schedule?: HotspotRect;
  details?: HotspotRect;
};

const estateHotspotLayouts: Record<number, EstateHotspotLayout> = {
  0: {},
  1: {
    house: { left: '46%', top: '32%', width: '12%', height: '16%' },
    details: { left: '48%', top: '72%', width: '18%', height: '14%' },
  },
  2: {
    house: { left: '42%', top: '26%', width: '18%', height: '18%' },
    details: { left: '48%', top: '72%', width: '20%', height: '14%' },
  },
  3: {
    house: { left: '34%', top: '24%', width: '26%', height: '20%' },
    details: { left: '50%', top: '74%', width: '16%', height: '12%' },
  },
  4: {
    house: { left: '30%', top: '22%', width: '22%', height: '22%' },
    garage: { left: '52%', top: '26%', width: '14%', height: '16%' },
    details: { left: '52%', top: '76%', width: '14%', height: '12%' },
  },
  5: {
    house: { left: '34%', top: '22%', width: '20%', height: '22%' },
    garage: { left: '54%', top: '26%', width: '16%', height: '16%' },
    library: { left: '25%', top: '24%', width: '11%', height: '16%' },
    guest: { left: '60%', top: '11%', width: '14%', height: '14%' },
    details: { left: '46%', top: '78%', width: '14%', height: '10%' },
  },
  7: {
    house: { left: '32%', top: '20%', width: '30%', height: '24%' },
    garage: { left: '68%', top: '52%', width: '18%', height: '18%' },
    library: { left: '22%', top: '28%', width: '12%', height: '16%' },
    guest: { left: '70%', top: '14%', width: '14%', height: '16%' },
  },
  8: {
    house: { left: '28%', top: '18%', width: '34%', height: '26%' },
    garage: { left: '2%', top: '54%', width: '30%', height: '22%' },
    library: { left: '18%', top: '26%', width: '14%', height: '18%' },
    guest: { left: '72%', top: '56%', width: '16%', height: '22%' },
  },
  12: {
    house: { left: '28%', top: '16%', width: '32%', height: '28%' },
    garage: { left: '2%', top: '56%', width: '26%', height: '20%' },
    library: { left: '10%', top: '20%', width: '16%', height: '20%' },
    guest: { left: '70%', top: '54%', width: '16%', height: '24%' },
  },
};

export function estateHotspotsAt(level: number): EstateHotspot[] {
  // 荒地无建筑可点：入口改走底部按钮，不在图上铺热点
  if (level <= 0) return [];
  const layout = estateHotspotLayouts[estateImageLevelAt(level)] ?? {};
  const spots: EstateHotspot[] = [];
  if (layout.house) spots.push({ id: 'house', label: '主屋', ...layout.house });
  if (level >= 6 && layout.guest) spots.push({ id: 'guest', label: '管家', ...layout.guest });
  else if (layout.details) spots.push({ id: 'guest', label: '地产详情', ...layout.details });
  if (level >= 5 && layout.library) spots.push({ id: 'library', label: level >= 11 ? '图书馆' : '藏书室', ...layout.library });
  if (level >= 4 && layout.garage) spots.push({ id: 'out', label: '外出', ...layout.garage });
  return spots;
}

export function estateEntryButtonsAt(level: number): Array<{ id: EstateHotspotId; label: string }> {
  const hotspots = new Set(estateHotspotsAt(level).map(spot => spot.id));
  const entries: Array<{ id: EstateHotspotId; label: string; show: boolean }> = [
    { id: 'house', label: level <= 0 ? '日程安排' : '主屋', show: true },
    { id: 'guest', label: level >= 6 ? '管家' : '地产详情', show: true },
    { id: 'library', label: level >= 11 ? '图书馆' : '藏书室', show: level >= 5 },
    { id: 'out', label: '外出', show: true },
  ];
  return entries.filter(entry => entry.show && !hotspots.has(entry.id)).map(({ id, label }) => ({ id, label }));
}

export type EstatePlotCell = { id: string; name: string; from: number };

export const estatePlot: EstatePlotCell[] = [
  { id: 'land', name: '不规则荒地', from: 0 },
  { id: 'shack', name: '原初小破屋', from: 1 },
  { id: 'main', name: '主屋', from: 2 },
  { id: 'porch', name: '门廊', from: 2 },
  { id: 'garden', name: '花园 / 棚屋', from: 3 },
  { id: 'garage', name: '车库 / 工坊', from: 4 },
  { id: 'pool', name: '泳池露台', from: 5 },
  { id: 'guest', name: '宾客小屋', from: 6 },
  { id: 'poolhouse', name: '泳池房', from: 6 },
  { id: 'gate', name: '门禁入口', from: 7 },
  { id: 'carriage', name: '车房公寓', from: 8 },
  { id: 'wellness', name: '康体楼', from: 9 },
  { id: 'pavilion', name: '宴乐亭', from: 9 },
  { id: 'gatehouse', name: '门房', from: 10 },
  { id: 'lake', name: '湖与船屋', from: 10 },
  { id: 'observatory', name: '观象台', from: 11 },
  { id: 'studio', name: '画室', from: 11 },
  { id: 'teahouse', name: '茶室', from: 11 },
];

export const STARTER_HOUSE_LEVEL = 0;
export const HOUSE_MAX_LEVEL = 12;
export const STARTER_CLEANLINESS = 58;
export const STARTER_GROUNDS = 42;
export const STARTER_SATIETY = 58;

const hireOrder: StaffId[] = ['housekeeper', 'chef', 'gardener', 'librarian', 'researcher'];
const fireOrder: StaffId[] = ['researcher', 'librarian', 'chef', 'gardener', 'housekeeper'];

export function clampHouseLevel(level: number) {
  const n = Math.floor(Number(level));
  if (!Number.isFinite(n)) return STARTER_HOUSE_LEVEL;
  return Math.max(STARTER_HOUSE_LEVEL, Math.min(HOUSE_MAX_LEVEL, n));
}

export function houseTierAt(level: number) {
  return houseTiers[clampHouseLevel(level)];
}

export function roomsAtLevel(level: number) {
  return houseTierAt(level).rooms;
}

export function nextHouseTier(level: number) {
  const n = clampHouseLevel(level);
  return houseTiers[n + 1] ?? null;
}

function sameRooms(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every(id => set.has(id));
}

export function inferHouseLevel(rooms: string[]) {
  if (!rooms.includes('bedroom')) return 0;
  if (!rooms.includes('kitchen')) return 1;
  if (!rooms.includes('study')) return 2;
  if (!rooms.includes('library')) return 4;
  if (!rooms.includes('gym')) return 5;
  if (!rooms.includes('lab') && !rooms.includes('studio')) return 6;
  return 11;
}

export function hydrateHouseLevel(rawLevel: unknown, rooms: unknown) {
  const savedRooms = Array.isArray(rooms) ? rooms.filter((id): id is string => typeof id === 'string') : null;
  if (savedRooms && savedRooms.length === 0) return STARTER_HOUSE_LEVEL;
  if (typeof rawLevel === 'number' && rawLevel >= STARTER_HOUSE_LEVEL && rawLevel <= HOUSE_MAX_LEVEL) {
    if (!savedRooms || sameRooms(savedRooms, roomsAtLevel(rawLevel))) return clampHouseLevel(rawLevel);
  }
  return savedRooms ? inferHouseLevel(savedRooms) : STARTER_HOUSE_LEVEL;
}

export function addedRoomNames(tier: HouseTier) {
  return [...tier.house, ...tier.grounds].join('、');
}

export function originalHousePlaque(year: number) {
  return `原屋 · 第 ${Math.max(1, Math.floor(year) || 1)} 年立`;
}

function clampStat(value: number) {
  return Math.max(0, Math.min(100, value));
}

function countOf(counts: Record<string, number>, key: string) {
  return counts[key] ?? 0;
}

export function hydrateHomeStat(raw: unknown, fallback: number) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return clampStat(n);
}

export function cleanlinessHint(value: number) {
  const n = Math.round(value);
  if (n >= 85) return '干净清爽';
  if (n >= 75) return '窗明几净';
  if (n >= 52) return '还算整洁';
  if (n >= 35) return '有点乱';
  if (n >= 15) return '屋子偏脏';
  return '脏乱不堪';
}

export function satietyHint(value: number) {
  const n = Math.round(value);
  if (n >= 100) return '完全满足';
  if (n >= 70) return '吃喝不愁';
  if (n >= 40) return '勉强果腹';
  return '饥肠辘辘';
}

export function satietyHealth(value: number) {
  if (value >= 75) return 1.2;
  if (value >= 55) return 0.4;
  if (value >= 40) return 0;
  if (value >= 20) return -1;
  return -1.6;
}

const WEEK_HUNGER = 20;
const DINE_GAIN = 14;
const GATHER_MEAL_GAIN = 12;
const GATHER_TEA_GAIN = 6;
const CHEF_GAIN = 22;
const COOK_GAIN = 20;

export function gatheringFoodSlots(grid: string[][], choices: string[][], paid: boolean) {
  if (!paid) return { mealsOut: 0, teasOut: 0 };
  return {
    mealsOut: countScheduleOption(grid, choices, 'social', 'meal'),
    teasOut: countScheduleOption(grid, choices, 'social', 'tea'),
  };
}

export function tickSatiety(input: {
  satiety: number;
  rooms: string[];
  staff: string[];
  cooking: number;
  cookingSkill?: number;
  dineOut: number;
  mealsOut: number;
  teasOut?: number;
  away?: boolean;
}) {
  const kitchen = input.rooms.includes('kitchen');
  const teasOut = input.teasOut ?? 0;
  if (input.away) return { satiety: input.satiety, notices: [] };
  let gain = input.dineOut * DINE_GAIN + input.mealsOut * GATHER_MEAL_GAIN + teasOut * GATHER_TEA_GAIN;
  if (kitchen) {
    gain += countStaff(input.staff, 'chef') * CHEF_GAIN + input.cooking * cookingCoverPerSlot(input.cookingSkill ?? 0) * COOK_GAIN;
  }
  const next = clampStat(input.satiety - WEEK_HUNGER + gain);
  const notices: string[] = [];
  if (input.dineOut) notices.push(input.dineOut > 1 ? `外出吃饭×${input.dineOut}` : '外出吃饭');
  if (input.mealsOut) notices.push(input.mealsOut > 1 ? `聚餐×${input.mealsOut}` : '聚餐');
  if (teasOut) notices.push(teasOut > 1 ? `茶叙×${teasOut}` : '茶叙');
  if (!kitchen && !input.away && input.dineOut + input.mealsOut + teasOut === 0) notices.push('没有厨房，需外出吃饭');
  if (next < 40) notices.push('膳食不足');
  return { satiety: next, notices };
}

export function countStaff(staff: string[] | undefined, id: StaffId) {
  return (staff ?? []).filter(item => item === id).length;
}

export function removeOneStaff(staff: string[], id: string) {
  const index = staff.lastIndexOf(id);
  if (index < 0) return staff;
  return [...staff.slice(0, index), ...staff.slice(index + 1)];
}

const quitOrder: StaffId[] = [...fireOrder, 'steward'];

export function quitUnpaidStaff(staff: string[], count = 1) {
  let next = [...staff];
  const names: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const id = quitOrder.find(role => countStaff(next, role) > 0);
    if (!id) break;
    next = removeOneStaff(next, id);
    names.push(staffById[id].name);
  }
  return { staff: next, names };
}

export function pruneStaffForHouse(staff: string[], houseLevel: number, rooms: string[]) {
  const kept: string[] = [];
  const names: string[] = [];
  for (const id of staff) {
    const role = id as StaffId;
    if (staffById[role] && roleUnlocked(role, houseLevel, rooms)) kept.push(id);
    else names.push(staffById[role]?.name ?? id);
  }
  return { staff: kept, names };
}

export function applyHouseReclaim(houseLevel: number, staff: string[], cleanliness: number, grounds: number) {
  if (houseLevel <= 0) {
    return { houseLevel, rooms: roomsAtLevel(houseLevel), staff, cleanliness, grounds, reclaimed: false, notices: [] as string[], staffLeft: [] as string[], fromName: '', toName: '' };
  }
  const from = houseTierAt(houseLevel);
  const to = houseTierAt(0);
  const rooms = roomsAtLevel(0);
  const pruned = pruneStaffForHouse(staff, 0, rooms);
  const notices = [`管理局收回整栋房屋：${from.name}。只留这块地。`];
  if (pruned.names.length) notices.push(`随房屋收回离任：${[...new Set(pruned.names)].join('、')}`);
  return {
    houseLevel: 0,
    rooms,
    staff: pruned.staff,
    cleanliness: clampStat(Math.min(cleanliness, 22) - 8),
    grounds: clampStat(Math.min(grounds, 16) - 6),
    reclaimed: true,
    notices,
    staffLeft: pruned.names,
    fromName: from.name,
    toName: to.name,
  };
}

export function staffNeed(houseLevel: number, rooms: string[]): Record<StaffId, number> {
  const level = clampHouseLevel(houseLevel);
  return {
    housekeeper: level <= 0 ? 0 : Math.max(1, Math.ceil(level / 2)),
    chef: rooms.includes('kitchen') ? (level >= 8 ? 2 : 1) : 0,
    gardener: level < 3 ? 0 : Math.max(1, Math.ceil((level - 1) / 4)),
    steward: 0,
    librarian: rooms.includes('library') ? 1 : 0,
    researcher: rooms.includes('lab') ? 1 : 0,
  };
}

export function staffingSummary(staff: string[], houseLevel: number, rooms: string[]) {
  const need = staffNeed(houseLevel, rooms);
  return staffCatalog.map(person => ({
    id: person.id,
    name: person.name,
    have: countStaff(staff, person.id),
    need: need[person.id],
  }));
}

export function countScheduleOption(grid: string[][], choices: string[][], activity: string, optionId: string) {
  let n = 0;
  grid.forEach((row, di) => row.forEach((key, pi) => {
    if (key === activity && choices[di]?.[pi] === optionId) n += 1;
  }));
  return n;
}

function roleUnlocked(id: StaffId, houseLevel: number, rooms: string[]) {
  return staffById[id].prerequisites.every(req => {
    if (req.kind === 'houseLevel') return houseLevel >= req.value;
    if (req.kind === 'room') return rooms.includes(req.id);
    return true;
  });
}

export function weeklyUpkeep(rooms: string[], staff: string[], level?: number) {
  const houseWeekly = houseTierAt(level ?? inferHouseLevel(rooms)).weekly;
  const staffCost = staff.reduce((sum, id) => sum + (staffById[id as StaffId]?.weekly ?? 28), 0);
  return houseWeekly + staffCost;
}

export function householdEffects(rooms: string[], staff: string[], level?: number, condition?: HomeCondition): HouseholdEffects {
  const resolved = clampHouseLevel(level ?? inferHouseLevel(rooms));
  const tier = houseTierAt(resolved);
  const cleanliness = clampStat(condition?.cleanliness ?? STARTER_CLEANLINESS);
  const grounds = clampStat(condition?.grounds ?? STARTER_GROUNDS);
  const study = rooms.includes('study');
  const gym = rooms.includes('gym');
  const libraryRoom = rooms.includes('library');
  const lab = rooms.includes('lab');
  const guest = rooms.includes('guest');
  const steward = countStaff(staff, 'steward');
  const gardener = countStaff(staff, 'gardener');
  const librarian = countStaff(staff, 'librarian');
  const researcher = countStaff(staff, 'researcher');
  const need = staffNeed(resolved, rooms);
  const gardenShort = Math.max(0, need.gardener - gardener);
  const cleanMul = 0.55 + cleanliness / 222;
  const groundMul = resolved >= 3 ? 0.62 + grounds / 263 : 1;
  const focus = tier.focus;
  return {
    support: steward * 0.8,
    restEnergy: tier.restEnergy * cleanMul + steward * 0.15,
    freeEnergy: tier.freeEnergy * groundMul,
    courseEnergy: Math.max(1.15, (study ? 2.1 : 2.5) - focus),
    readingEnergy: Math.max(0.45, (study ? 0.9 : 1.2) - focus * 0.55),
    fitnessEnergy: gym ? 0.55 : 1,
    skillEnergy: Math.max(0.55, 1.2 - focus * 0.4),
    socialEnergy: 0.5,
    projectEnergy: Math.max(0.9, 1.7 - focus * 0.45),
    fitnessHealth: gym ? 1.6 : 1.2,
    chefHealth: satietyHealth(condition?.satiety ?? STARTER_SATIETY),
    gardenerHealth: Math.min(gardener, need.gardener || gardener) * 0.8 - gardenShort * 0.9,
    cleanlinessStress: Math.max(0, 52 - cleanliness) * 0.12,
    cleanlinessHealth: cleanliness >= 75 ? 0.5 : cleanliness < 35 ? -(35 - cleanliness) * 0.12 : 0,
    readingBonus: (libraryRoom ? 1 : 0) + librarian,
    researcherCourse: researcher * 3,
    librarian,
    labProject: lab ? 2 : 0,
    researcherProject: researcher * 2,
    guestIndoor: (guest ? 1 : 0) + (cleanliness >= 80 ? 1 : cleanliness < 35 ? -1 : 0),
    borrowLimit: tier.borrowBase + (libraryRoom ? 1 : 0) + librarian,
    comfort: tier.comfort,
    shelterHealth: tier.shelterHealth,
    campEnergy: resolved <= 0 ? -5 : 0,
    restHealth: resolved <= 0 ? -0.6 : 0.5 + focus * 0.25,
    upkeep: weeklyUpkeep(rooms, staff, resolved),
  };
}

/** 小睡在宅家基础回复之外的额外精力；泡澡/家务不享受。 */
export const NAP_EXTRA_ENERGY = 5;
export const NAP_EXTRA_STRESS = -1.2;

export function projectWellbeing(
  energy: number,
  stress: number,
  health: number,
  counts: Record<string, number>,
  effects: HouseholdEffects,
  restMix: { nap?: number; bath?: number } = {},
) {
  const course = countOf(counts, 'course');
  const reading = countOf(counts, 'reading');
  const fitness = countOf(counts, 'fitness');
  const skill = countOf(counts, 'skill');
  const social = countOf(counts, 'social');
  const project = countOf(counts, 'project');
  const rest = countOf(counts, 'rest');
  const free = countOf(counts, 'free');
  const outing = countOf(counts, 'out');
  const nap = Math.max(0, Math.min(rest, Math.floor(restMix.nap ?? 0)));
  const bath = Math.max(0, Math.min(rest - nap, Math.floor(restMix.bath ?? 0)));
  const load = Math.max(0, course * 2 + reading + fitness * 1.2 + skill * 1.2 + social * 0.6 + project * 1.8 + outing * 0.4 - rest * 0.8 - free * 0.5);
  const projectedEnergy = clampStat(
    energy
    + rest * effects.restEnergy
    + nap * NAP_EXTRA_ENERGY
    + bath * 1.5
    + free * effects.freeEnergy
    + effects.campEnergy
    + effects.support * 1.5
    - course * effects.courseEnergy
    - reading * effects.readingEnergy
    - fitness * effects.fitnessEnergy
    - skill * effects.skillEnergy
    - social * effects.socialEnergy
    - project * effects.projectEnergy,
  );
  const projectedStress = clampStat(
    stress
    + course * 1.8
    + reading * 0.85
    + project * 1.3
    + Math.max(0, load - 6) * 0.75
    - rest * 0.8
    - nap * Math.abs(NAP_EXTRA_STRESS)
    - bath * 1.4
    - free * 0.25
    - social * 0.1
    - fitness * 0.15
    - skill * 0.05
    - effects.support * 0.5
    - effects.comfort * 0.15
    + effects.cleanlinessStress,
  );
  const projectedHealth = clampStat(
    health
    + fitness * effects.fitnessHealth
    + skill * 0.4
    + rest * effects.restHealth
    + effects.shelterHealth
    + effects.chefHealth
    + effects.gardenerHealth
    + effects.cleanlinessHealth
    - Math.max(0, projectedStress - 65) * 0.08
    - Math.max(0, 35 - projectedEnergy) * 0.08,
  );
  return { load, projectedEnergy, projectedStress, projectedHealth };
}

export function homeProjectPerSlot(effects: HouseholdEffects) {
  return 8 + effects.labProject + effects.researcherProject;
}

export function courseReadingSupport(courseId: string, readingIds: string[], librarian: number) {
  if (!readingIds.length) return 0;
  const best = Math.max(0, ...readingIds.map(id => relatedReadingBonus(courseId, id)));
  return best + librarian;
}

export function adjustGatheringGuests(count: number, indoor: boolean, guestBonus: number) {
  return Math.max(0, Math.min(8, count + (indoor ? guestBonus : 0)));
}

function signedStat(value: number) {
  const n = Math.round(value * 10) / 10;
  return n > 0 ? `+${n}` : `${n}`;
}

export function activeHouseEffects(rooms: string[], staff: string[], level?: number) {
  const resolved = clampHouseLevel(level ?? inferHouseLevel(rooms));
  const tier = houseTierAt(resolved);
  const lines: string[] = [];
  if (resolved === 0) {
    lines.push('露宿荒地：睡眠几乎无效，风雨直灌。每周固定损耗精力与体能，压力很高。');
    lines.push('借阅上限降至 1。上课与阅读更耗神。');
  } else {
    lines.push(`居住：每次休息回复 ${tier.restEnergy} 精力，每次空闲回复 ${tier.freeEnergy}。安稳 ${signedStat(tier.comfort)}，庇护体能 ${signedStat(tier.shelterHealth)}`);
    lines.push(`专注：上课 / 阅读 / 创作消耗降低 ${tier.focus.toFixed(2)}。借阅上限 ${tier.borrowBase}。`);
    lines.push(resolved >= 5 ? '屋顶可遮风雨。破产时整栋收回，只留土地。' : '有了屋顶。破产时整栋收回，只留土地。');
  }
  if (resolved >= 7) lines.push('主宅一角留有铭牌。');
  for (const room of roomCatalog) {
    if (room.id === 'bedroom') continue;
    if (rooms.includes(room.id)) lines.push(`${room.name}：${room.effect}`);
  }
  for (const person of staffCatalog) {
    const n = staff.filter(id => id === person.id).length;
    if (n) lines.push(n > 1 ? `${person.name} ×${n}：${person.effect}` : `${person.name}：${person.effect}`);
  }
  return lines;
}

export function houseWeekNotices(counts: Record<string, number>, rooms: string[], staff: string[]) {
  const parts: string[] = [];
  if (!rooms.includes('bedroom')) parts.push('露宿荒地，几乎没法恢复');
  if (rooms.includes('study') && (countOf(counts, 'reading') || countOf(counts, 'course'))) parts.push('书房减耗');
  if (rooms.includes('gym') && countOf(counts, 'fitness')) parts.push('主屋健身房免通勤');
  if (rooms.includes('library') && countOf(counts, 'reading')) parts.push('藏书室阅读加成');
  if (rooms.includes('lab') && countOf(counts, 'project')) parts.push('观象台创作加成');
  if (rooms.includes('guest') && countOf(counts, 'social')) parts.push('宾客小屋接待');
  const housekeepers = staff.filter(id => id === 'housekeeper').length;
  const stewards = staff.filter(id => id === 'steward').length;
  const chefs = staff.filter(id => id === 'chef').length;
  const gardeners = staff.filter(id => id === 'gardener').length;
  const librarians = staff.filter(id => id === 'librarian').length;
  const researchers = staff.filter(id => id === 'researcher').length;
  if (housekeepers) parts.push(housekeepers > 1 ? `家政打扫×${housekeepers}` : '家政打扫');
  if (stewards) parts.push(stewards > 1 ? `管家代管人事×${stewards}` : '管家代管人事');
  if (chefs) parts.push(chefs > 1 ? `厨师备餐×${chefs}` : '厨师备餐');
  if (gardeners) parts.push(gardeners > 1 ? `园丁照料×${gardeners}` : '园丁照料');
  if (librarians && countOf(counts, 'reading')) parts.push(librarians > 1 ? `管理员书目×${librarians}` : '管理员书目');
  if (researchers && (countOf(counts, 'course') || countOf(counts, 'project'))) parts.push(researchers > 1 ? `研究助理×${researchers}` : '研究助理');
  return parts.length ? [`地产生效：${parts.join('、')}`] : [];
}

export type HomeWeekTick = {
  cleanliness: number;
  grounds: number;
  notices: string[];
};

export function tickHomeWeek(input: {
  cleanliness: number;
  grounds: number;
  houseLevel: number;
  rooms: string[];
  staff: string[];
  chores: number;
  cooking: number;
  cookingSkill?: number;
  social: number;
  guests: number;
}): HomeWeekTick {
  const level = clampHouseLevel(input.houseLevel);
  const need = staffNeed(level, input.rooms);
  const housekeepers = countStaff(input.staff, 'housekeeper');
  const gardeners = countStaff(input.staff, 'gardener');
  const stewards = countStaff(input.staff, 'steward');
  const dirt = (level <= 0 ? 16 : 6 + level * 3) + input.social * 2 + Math.max(0, input.guests);
  const cleanWork = housekeepers * 12 + input.chores * 8 + stewards * 2;
  const cleanliness = clampStat(input.cleanliness + cleanWork - dirt);
  const wear = level < 3 ? 1 : 4 + Math.floor(level / 2);
  const groundWork = gardeners * 10 + stewards * 1;
  const grounds = level < 3 ? clampStat(input.grounds - 1 + gardeners * 4) : clampStat(input.grounds + groundWork - wear);
  const notices: string[] = [];
  if (level <= 0) notices.push('露宿荒地，营地脏、冷，几乎没法好好睡');
  if (input.chores) notices.push(input.chores > 1 ? `自己家务×${input.chores}` : '自己整理家务');
  if (input.cooking && input.rooms.includes('kitchen')) notices.push(input.cooking > 1 ? `自己下厨×${input.cooking}` : '自己下厨');
  if (housekeepers < need.housekeeper) notices.push(`家政人手 ${housekeepers}/${need.housekeeper}`);
  if (need.gardener && gardeners < need.gardener) notices.push(`园丁人手 ${gardeners}/${need.gardener}`);
  if (cleanliness < 35) notices.push('屋子偏脏，休息变差、压力上升');
  else if (cleanliness >= 85) notices.push('屋子很干净');
  if (level >= 3 && grounds < 35) notices.push('园景失修，空闲恢复变差');
  return { cleanliness, grounds, notices };
}

export type StewardWeekResult = {
  staff: string[];
  funds: number;
  ledger: { label: string; amount: number }[];
  notices: string[];
};

export type StewardAction = {
  key: string;
  kind: 'hire' | 'fire';
  role: StaffId;
  name: string;
  reason: string;
  cost: number;
  weekly: number;
  have: number;
  need: number;
};

export type StewardProposal = {
  actions: StewardAction[];
  tight: boolean;
};

export function proposeStewardWeek(input: {
  staff: string[];
  funds: number;
  houseLevel: number;
  rooms: string[];
  cleanliness: number;
}): StewardProposal {
  const stewards = countStaff(input.staff, 'steward');
  if (!stewards) return { actions: [], tight: false };
  const need = staffNeed(input.houseLevel, input.rooms);
  if (input.cleanliness < 35) need.housekeeper = Math.max(need.housekeeper, 1);
  let staff = [...input.staff];
  let funds = input.funds;
  const actions: StewardAction[] = [];
  const maxChanges = Math.min(4, stewards * 2);
  const payroll = () => weeklyUpkeep(input.rooms, staff, input.houseLevel);
  const extras = (id: StaffId) => Math.max(0, countStaff(staff, id) - need[id]);
  const comfortable = funds >= payroll() * 8 + 400;
  const tight = funds < payroll() * 3.2;

  const pushFire = (role: StaffId, reason: string) => {
    const person = staffById[role];
    const have = countStaff(staff, role);
    actions.push({
      key: `fire-${role}-${actions.length}`,
      kind: 'fire',
      role,
      name: person.name,
      reason,
      cost: 0,
      weekly: person.weekly,
      have,
      need: need[role],
    });
    staff = removeOneStaff(staff, role);
  };

  if (!comfortable) {
    while (actions.length < maxChanges) {
      const extraId = fireOrder.find(id => extras(id) > 0);
      if (!extraId) break;
      const have = countStaff(staff, extraId);
      pushFire(extraId, `人手多于所需（${have}/${need[extraId]}）`);
    }
  }

  if (tight) {
    while (actions.length < maxChanges) {
      const id = fireOrder.find(role => {
        const have = countStaff(staff, role);
        if (have <= 0) return false;
        if (role === 'housekeeper' && input.cleanliness < 40 && have <= Math.max(1, need.housekeeper)) return false;
        return have > (role === 'housekeeper' ? 1 : 0);
      });
      if (!id) break;
      const person = staffById[id];
      pushFire(id, `余额偏紧，建议减员（周薪 ${person.weekly}）`);
    }
  }

  const canHire = (id: StaffId) => {
    if (!roleUnlocked(id, input.houseLevel, input.rooms)) return false;
    const person = staffById[id];
    const next = [...staff, id];
    return funds - person.cost >= weeklyUpkeep(input.rooms, next, input.houseLevel) * (tight ? 8 : 5) + 80;
  };

  const hungry = input.cleanliness < 40;
  const hireIds = hungry ? (['housekeeper', ...hireOrder.filter(id => id !== 'housekeeper')] as StaffId[]) : hireOrder;
  while (actions.length < maxChanges) {
    const id = hireIds.find(role => countStaff(staff, role) < need[role] && canHire(role));
    if (!id) break;
    const person = staffById[id];
    const have = countStaff(staff, id);
    actions.push({
      key: `hire-${id}-${actions.length}`,
      kind: 'hire',
      role: id,
      name: person.name,
      reason: hungry && id === 'housekeeper'
        ? `清洁偏低，优先补家政（${have}/${need[id]}）`
        : `人手不足（${have}/${need[id]}）`,
      cost: person.cost,
      weekly: person.weekly,
      have,
      need: need[id],
    });
    funds -= person.cost;
    staff = [...staff, id];
  }

  return { actions, tight };
}

export function applyStewardDecisions(
  input: {
    staff: string[];
    funds: number;
    houseLevel: number;
    rooms: string[];
    cleanliness: number;
  },
  approved: StewardAction[],
  reviewed = false,
): StewardWeekResult {
  const hasSteward = countStaff(input.staff, 'steward') > 0;
  if (!hasSteward) {
    return { staff: input.staff, funds: input.funds, ledger: [], notices: [] };
  }
  let staff = [...input.staff];
  let funds = input.funds;
  const ledger: { label: string; amount: number }[] = [];
  const hired: string[] = [];
  const fired: string[] = [];
  for (const action of approved) {
    const person = staffById[action.role];
    if (!person) continue;
    if (action.kind === 'fire') {
      if (countStaff(staff, action.role) <= 0) continue;
      staff = removeOneStaff(staff, action.role);
      fired.push(person.name);
      continue;
    }
    if (funds < person.cost) continue;
    funds -= person.cost;
    staff = [...staff, action.role];
    hired.push(person.name);
    ledger.push({ label: `管家代雇：${person.name}`, amount: -person.cost });
  }
  const notices: string[] = [];
  if (hired.length) notices.push(`管家新雇：${hired.join('、')}`);
  if (fired.length) notices.push(`管家辞退：${fired.join('、')}`);
  if (!hired.length && !fired.length) {
    const payroll = weeklyUpkeep(input.rooms, input.staff, input.houseLevel);
    const tight = input.funds < payroll * 3.2;
    notices.push(reviewed ? '管家提议未获批准，人手维持' : (tight ? '管家：余额偏紧，暂缓调整人手' : '管家：人手维持'));
  }
  return { staff, funds, ledger, notices };
}

export function applyStewardWeek(input: {
  staff: string[];
  funds: number;
  houseLevel: number;
  rooms: string[];
  cleanliness: number;
}): StewardWeekResult {
  return applyStewardDecisions(input, proposeStewardWeek(input).actions);
}

export function houseUpgradeConditionShift(nextLevel: number, cleanliness: number, grounds: number) {
  const dip = Math.min(10, 2 + Math.floor(nextLevel / 3));
  return {
    cleanliness: clampStat(cleanliness - dip),
    grounds: nextLevel >= 3 ? clampStat(grounds - dip) : grounds,
  };
}
