import { books, getBook } from './library-catalog';
import { type Prerequisite } from './prerequisites';

export type CourseLevel = 'intro' | 'core' | 'advanced';

export type CourseSlot = { day: number; period: number };

export type CourseDefinition = {
  id: string;
  code: string;
  collegeId: string;
  school: string;
  title: string;
  credits: number;
  cost: number;
  desc: string;
  node: string;
  bookId: string;
  prereq: string[];
  level: CourseLevel;
  meetings: CourseSlot[];
  sport?: string;
};

export const DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] as const;
export const PERIOD_NAMES = ['早晨', '午后', '夜晚'] as const;

const COURSE_MEETINGS: Record<string, [number, number][]> = {
  nature: [[0, 0], [3, 0]],
  ecology: [[1, 1], [4, 1]],
  botany: [[2, 0], [4, 0]],
  evolution: [[1, 0], [3, 1]],
  history: [[0, 1], [2, 1]],
  classics: [[1, 2], [3, 2]],
  archive: [[2, 2], [4, 2]],
  historiography: [[0, 2], [5, 0]],
  statistics: [[1, 0], [4, 0]],
  geometry: [[0, 2], [3, 1]],
  data: [[2, 2], [5, 0]],
  models: [[1, 2], [4, 2]],
  english: [[0, 0], [3, 2]],
  'english-2': [[1, 2], [5, 2]],
  'english-3': [[2, 1], [6, 1]],
  french: [[1, 0], [4, 2]],
  'french-2': [[0, 2], [3, 1]],
  'french-3': [[2, 2], [5, 0]],
  spanish: [[2, 0], [5, 1]],
  'spanish-2': [[1, 1], [4, 0]],
  'spanish-3': [[0, 1], [6, 2]],
  japanese: [[0, 1], [4, 1]],
  'japanese-2': [[2, 2], [5, 2]],
  'japanese-3': [[1, 0], [3, 2]],
  latin: [[2, 2], [6, 0]],
  'latin-2': [[0, 0], [4, 2]],
  'latin-3': [[1, 2], [5, 1]],
  writing: [[5, 0]],
  narrative: [[1, 2], [5, 1]],
  classical: [[0, 2], [4, 2]],
  translation: [[2, 2], [3, 2]],
  ethics: [[1, 0], [3, 1]],
  'reserve-intro': [[0, 1], [2, 1]],
  'long-society': [[2, 0], [4, 1]],
  'observation-methods': [[0, 2], [4, 2]],
  design: [[1, 1], [3, 2]],
  craft: [[5, 0]],
  visual: [[2, 2], [4, 0]],
  arthist: [[0, 0], [2, 1]],
  renaissance: [[1, 0], [4, 1]],
  'modern-art': [[3, 0], [5, 1]],
  'china-art': [[0, 2], [2, 0]],
  watercolor: [[4, 2], [6, 0]],
  oil: [[1, 0], [4, 0]],
  printmaking: [[6, 1]],
  calligraphy: [[2, 1], [6, 2]],
  community: [[1, 1], [2, 1]],
  ethnography: [[0, 2], [4, 1]],
  economy: [[2, 2], [5, 0]],
  institutions: [[1, 2], [3, 2]],
  body: [[0, 1], [5, 1]],
  recovery: [[3, 2]],
  movement: [[1, 0], [4, 1]],
  nutrition: [[2, 2]],
  tennis: [[0, 2], [3, 0]],
  swim: [[1, 1], [4, 0]],
  running: [[2, 0], [5, 0]],
  'strength-training': [[1, 2], [4, 2]],
  hoop: [[2, 1], [4, 2]],
  yoga: [[3, 1]],
  fencing: [[1, 2], [5, 0]],
  piano: [[2, 2], [5, 1]],
  'music-theory': [[0, 2], [3, 1]],
  ensemble: [[1, 1], [4, 1]],
  composition: [[2, 1], [5, 2]],
  pottery: [[1, 1], [4, 1]],
  cooking: [[3, 2]],
  tools: [[4, 2]],
  energy: [[0, 2], [3, 1]],
  mapping: [[1, 2], [2, 0]],
  'lab-methods': [[2, 1], [5, 0]],
  seminar: [[2, 2], [5, 1]],
  psych: [[0, 0], [3, 1]],
  development: [[1, 1], [4, 0]],
  'social-psych': [[2, 0], [5, 1]],
  cognition: [[3, 2], [6, 0]],
  'china-hist': [[1, 1], [3, 0]],
  'lit-intro': [[0, 1], [3, 0]],
  'classical-cn': [[1, 0], [4, 1]],
  'modern-cn': [[2, 1], [5, 2]],
  'lit-theory': [[3, 2], [6, 1]],
};

export type StudyProgram = {
  id: string;
  title: string;
  kind: 'general' | 'certificate' | 'degree' | 'master' | 'doctorate';
  school: string;
  credits: number;
  required: string[];
  desc: string;
  researchId?: string;
  priorProgramId?: string;
};

export type ResearchTrack = {
  id: string;
  title: string;
  school: string;
  desc: string;
  projectId: string;
  need: string;
};

export const STARTER_COURSE_ID = 'nature';
export const SEMESTER_CREDIT_CAP = 12;
export const TERM_TEACHING_WEEKS = 10;
export const TERM_BLOCK_WEEKS = 13;

export const colleges = [
  { id: 'all', name: '全部学院', code: '' },
  { id: 'ns', name: '理学院', code: 'NS' },
  { id: 'hi', name: '历史学院', code: 'HI' },
  { id: 'ma', name: '数学学院', code: 'MA' },
  { id: 'lt', name: '文学院', code: 'LT' },
  { id: 'ts', name: '哲学学院', code: 'PH' },
  { id: 'ar', name: '美术学院', code: 'AR' },
  { id: 'mu', name: '音乐学院', code: 'MU' },
  { id: 'ss', name: '社会科学学院', code: 'SS' },
  { id: 'hs', name: '体育学院', code: 'PE' },
  { id: 'en', name: '工学院', code: 'EN' },
] as const;

function course(
  id: string,
  code: string,
  collegeId: string,
  title: string,
  credits: number,
  cost: number,
  desc: string,
  node: string,
  bookId: string,
  level: CourseLevel = 'intro',
  prereq: string[] = [],
  sport?: string,
): CourseDefinition {
  const school = colleges.find(item => item.id === collegeId)?.name ?? '榛木镇大学';
  const meetings = (COURSE_MEETINGS[id] ?? []).map(([day, period]) => ({ day, period }));
  return { id, code, collegeId, school, title, credits, cost, desc, node, bookId, prereq, level, meetings, sport };
}

export const courseCatalog: CourseDefinition[] = [
  course('nature', 'NS101', 'ns', '普通生物学', 3, 120, '细胞、遗传与生物体的基本结构。', '植物形态', 'star-flora'),
  course('ecology', 'NS210', 'ns', '普通生态学', 3, 150, '种群、群落与生态系统。', '生态关联', 'silent-spring', 'core', ['nature']),
  course('botany', 'NS220', 'ns', '植物分类', 4, 170, '形态鉴定、命名法规与标本制作。', '植物形态', 'ben-cao', 'core', ['nature']),
  course('evolution', 'NS310', 'ns', '进化生物学', 4, 190, '自然选择、谱系与化石证据。', '演化', 'origin-species', 'advanced', ['ecology']),
  course('history', 'HI101', 'hi', '世界近现代史', 3, 120, '自十八世纪以来的政治与社会变迁。', '保护区历史', 'town-chronicle'),
  course('classics', 'PH140', 'ts', '西方哲学史', 3, 130, '从古典到近代的主要论题。', '伦理思考', 'analects'),
  course('archive', 'HI210', 'hi', '档案整理', 3, 150, '编目、著录、保管与利用。', '口述史', 'oral-river', 'core', ['history']),
  course('historiography', 'HI320', 'hi', '史学理论', 4, 180, '史学流派与解释框架。', '时代章节', 'age-layers', 'advanced', ['archive']),
  course('statistics', 'MA101', 'ma', '统计学导论', 4, 160, '描述统计、概率与假设检验。', '概率直觉', 'gentle-stats'),
  course('geometry', 'MA120', 'ma', '解析几何', 3, 140, '坐标、曲线与空间关系。', '几何证明', 'elements'),
  course('data', 'MA210', 'ma', '回归分析', 3, 150, '线性模型与数据诊断。', '数据叙事', 'tufte', 'core', ['statistics']),
  course('models', 'MA310', 'ma', '数学模型', 4, 190, '建立、求解并检验简单模型。', '建模', 'model-garden', 'advanced', ['data']),
  course('english', 'LT130', 'lt', '英语实践', 3, 120, '听说读写与长期阅读练习。', '语言表达', 'mist-letters', 'intro', [], '英语'),
  course('english-2', 'LT230', 'lt', '英语进阶', 3, 150, '议论文、报刊阅读与口头陈述。', '语言表达', 'invisible-cities', 'core', ['english'], '英语'),
  course('english-3', 'LT330', 'lt', '英语高级研讨', 4, 180, '文学细读、学术英语与跨文化交流。', '语言表达', 'to-lighthouse', 'advanced', ['english-2'], '英语'),
  course('french', 'LT132', 'lt', '法语实践', 3, 120, '语音、基础语法与日常表达。', '语言表达', 'far-return', 'intro', [], '法语'),
  course('french-2', 'LT232', 'lt', '法语进阶', 3, 150, '时态巩固、短文写作与听力精练。', '语言表达', 'mist-letters', 'core', ['french'], '法语'),
  course('french-3', 'LT332', 'lt', '法语高级研讨', 4, 180, '法语文学选读与专题口头报告。', '语言表达', 'to-lighthouse', 'advanced', ['french-2'], '法语'),
  course('spanish', 'LT134', 'lt', '西班牙语实践', 3, 120, '基础会话、阅读与文化观察。', '语言表达', 'invisible-cities', 'intro', [], '西班牙语'),
  course('spanish-2', 'LT234', 'lt', '西班牙语进阶', 3, 150, '复合句、阅读理解与情景对话。', '语言表达', 'far-return', 'core', ['spanish'], '西班牙语'),
  course('spanish-3', 'LT334', 'lt', '西班牙语高级研讨', 4, 180, '西语世界文学与文化专题。', '语言表达', 'morning-blossoms', 'advanced', ['spanish-2'], '西班牙语'),
  course('japanese', 'LT136', 'lt', '日语实践', 3, 120, '文字、基础语法与日常会话。', '语言表达', 'morning-blossoms', 'intro', [], '日语'),
  course('japanese-2', 'LT236', 'lt', '日语进阶', 3, 150, '敬语入门、读解与短文写作。', '语言表达', 'mist-letters', 'core', ['japanese'], '日语'),
  course('japanese-3', 'LT336', 'lt', '日语高级研讨', 4, 180, '近现代文本细读与口头发表。', '语言表达', 'human-ci', 'advanced', ['japanese-2'], '日语'),
  course('latin', 'LT138', 'lt', '拉丁语基础', 3, 130, '词形、句法与古典文本入门。', '古典语言', 'elements', 'intro', [], '拉丁语'),
  course('latin-2', 'LT238', 'lt', '拉丁语进阶', 3, 160, '复杂从句、散文选读与翻译练习。', '古典语言', 'analects', 'core', ['latin'], '拉丁语'),
  course('latin-3', 'LT338', 'lt', '拉丁语高级研讨', 4, 190, '古典作家精读与文本批评。', '古典语言', 'human-ci', 'advanced', ['latin-2'], '拉丁语'),
  course('writing', 'LT101', 'lt', '学术写作', 3, 90, '论文结构、引用格式与改写。', '旅行观察', 'far-return', 'intro', [], '写作'),
  course('narrative', 'LT180', 'lt', '小说导论', 3, 120, '情节、视角与叙事结构。', '叙事结构', 'invisible-cities'),
  course('classical', 'LT210', 'lt', '英国文学', 3, 140, '主要作家与文本细读。', '古典汉语', 'human-ci', 'core', ['writing']),
  course('translation', 'LT260', 'lt', '英汉翻译', 3, 150, '笔译练习与译文校对。', '地方文化', 'mist-letters', 'core', ['writing']),
  course('ethics', 'PH201', 'ts', '伦理学', 4, 180, '规范伦理与应用伦理。', '时间伦理', 'reserve-ethics', 'core'),
  course('reserve-intro', 'PH101', 'ts', '哲学导论', 3, 140, '知识、心灵与价值的基本问题。', '管理局制度', 'return-policy'),
  course('long-society', 'PH240', 'ts', '政治哲学', 4, 190, '自由、平等与正当性问题。', '长期社会', 'slow-citizenship', 'core', ['reserve-intro']),
  course('observation-methods', 'PH330', 'ts', '逻辑与论证', 4, 210, '形式推理、谬误与论文论证。', '长期观测', 'age-observe', 'advanced', ['ethics']),
  course('design', 'AR101', 'ar', '设计基础', 3, 130, '构图、比例与平面构成。', '建筑观察', 'hazel-architecture'),
  course('craft', 'AR160', 'ar', '工艺基础', 2, 100, '材料、工具与制作步骤。', '器物', 'cup-handles', 'intro', [], '工艺'),
  course('visual', 'AR220', 'ar', '素描', 3, 140, '石膏、静物与人体速写。', '观看', 'ways-of-seeing', 'core', ['design'], '素描'),
  course('arthist', 'AR110', 'ar', '艺术史导论', 3, 130, '图像、风格与博物馆收藏。', '观看', 'ways-of-seeing'),
  course('renaissance', 'AR210', 'ar', '文艺复兴', 3, 150, '意大利与北方的绘画、雕塑与赞助人。', '观看', 'yuan-ye', 'core', ['arthist']),
  course('modern-art', 'AR310', 'ar', '现代艺术', 4, 180, '印象派至战后的主要运动。', '观看', 'ways-of-seeing', 'advanced', ['arthist']),
  course('china-art', 'AR240', 'ar', '中国美术史', 3, 150, '卷轴、书法与宫廷收藏。', '观看', 'yuan-ye', 'core', ['arthist']),
  course('watercolor', 'AR170', 'ar', '水彩', 3, 120, '水分、层层罩染与写生。', '器物', 'design-of-design', 'intro', [], '水彩'),
  course('oil', 'AR180', 'ar', '油画', 3, 130, '底子、笔触与色彩关系。', '器物', 'craftsman', 'intro', [], '油画'),
  course('printmaking', 'AR190', 'ar', '版画', 2, 100, '木刻、腐蚀与印制。', '手艺', 'craftsman', 'intro', [], '版画'),
  course('calligraphy', 'AR165', 'ar', '书法', 2, 90, '笔法、结体与临帖。', '观看', 'yuan-ye', 'intro', [], '书法'),
  course('community', 'SS101', 'ss', '社会学导论', 3, 120, '群体、制度与社会分层。', '小型公共', 'tea-house'),
  course('ethnography', 'SS210', 'ss', '文化人类学', 3, 150, '田野方法与民族志。', '倾听', 'xiangtu', 'core', ['community']),
  course('economy', 'SS230', 'ss', '微观经济学', 3, 150, '供求、市场与资源配置。', '交换', 'gift', 'core', ['community']),
  course('institutions', 'SS310', 'ss', '宏观经济学', 4, 180, '产出、通胀与财政政策。', '制度', 'small-institutions', 'advanced', ['economy']),
  course('body', 'PE101', 'hs', '查尔斯顿舞', 3, 120, '步法、节奏与双人配合。', '节律', 'patient-body', 'intro', [], '查尔斯顿舞'),
  course('recovery', 'PE160', 'hs', '芭蕾基础', 2, 90, '把杆、中间动作与体态。', '睡眠', 'why-we-sleep', 'intro', [], '芭蕾'),
  course('movement', 'PE210', 'hs', '爵士舞', 3, 130, 'isolations、组合与舞台调度。', '运动恢复', 'spark', 'intro', [], '爵士舞'),
  course('nutrition', 'PE180', 'hs', '运动生理学', 2, 90, '肌肉、呼吸与训练负荷。', '饮食', 'local-table'),
  course('tennis', 'PE120', 'hs', '网球', 3, 120, '发球、底线与双打站位。', '节律', 'spark', 'intro', [], '网球'),
  course('swim', 'PE130', 'hs', '游泳', 3, 120, '蛙泳、自由泳与转身。', '运动恢复', 'patient-body', 'intro', [], '游泳'),
  course('running', 'PE125', 'hs', '跑步训练', 2, 100, '跑姿、配速与训练量。', '有氧', 'running-form', 'intro', [], '跑步'),
  course('strength-training', 'PE135', 'hs', '力量训练', 2, 110, '基础动作、负荷与安全。', '训练负荷', 'strength-basics', 'intro', [], '力量训练'),
  course('hoop', 'PE140', 'hs', '篮球', 3, 120, '运球、投篮与攻防。', '节律', 'spark', 'intro', [], '篮球'),
  course('yoga', 'PE150', 'hs', '瑜伽', 2, 90, '体式、呼吸与放松。', '睡眠', 'why-we-sleep', 'intro', [], '瑜伽'),
  course('fencing', 'PE170', 'hs', '击剑', 3, 130, '步法、刺击与裁判规则。', '运动恢复', 'patient-body', 'intro', [], '击剑'),
  course('piano', 'MU130', 'mu', '钢琴基础', 3, 130, '读谱、指法、踏板与短曲。', '读谱', 'piano-practice', 'intro', [], '钢琴'),
  course('music-theory', 'MU160', 'mu', '乐理与听觉', 3, 140, '音程、和声、节奏与听辨。', '乐理', 'piano-practice', 'intro'),
  course('ensemble', 'MU230', 'mu', '室内乐合奏', 3, 160, '排练、倾听、协作与舞台呈现。', '合奏', 'field-time', 'core', ['piano'], '钢琴'),
  course('composition', 'MU320', 'mu', '作曲与作品分析', 4, 190, '动机发展、曲式与完整作品写作。', '作曲', 'design-of-design', 'advanced', ['music-theory'], '作曲'),
  course('pottery', 'AR150', 'ar', '陶艺', 3, 130, '手捏、拉坯、施釉与烧制。', '器物', 'pottery-basics', 'intro', [], '陶艺'),
  course('cooking', 'PE185', 'hs', '基础烹饪', 2, 100, '刀工、火候、卫生与备餐。', '饮食', 'home-cooking', 'intro', [], '烹饪'),
  course('tools', 'EN101', 'en', '工程制图', 2, 90, '投影、尺寸与图纸规范。', '修理', 'tools-repair'),
  course('energy', 'EN210', 'en', '电路实验', 4, 150, '搭接、测量、记录与安全规程。', '能源', 'small-energy', 'core', ['tools']),
  course('mapping', 'EN180', 'en', '数字电路', 3, 140, '门电路、组合逻辑与时序电路。', '地图', 'mapping-valley', 'core', ['tools']),
  course('lab-methods', 'EN260', 'en', '电气工程导论', 3, 160, '电机、配电与安全规程。', '实验设计', 'paper-lab', 'core', ['tools']),
  course('seminar', 'PH280', 'ts', '哲学研讨课', 3, 170, '文本报告与课堂讨论。', '时间伦理', 'field-time', 'core', ['reserve-intro']),
  course('psych', 'SS110', 'ss', '心理学导论', 3, 120, '感觉、学习、情绪与个体差异。', '判断', 'thinking-slow'),
  course('development', 'SS220', 'ss', '发展心理学', 3, 150, '儿童、青少年与成年期的变化。', '习惯形成', 'nicomachean', 'core', ['psych']),
  course('social-psych', 'SS240', 'ss', '社会心理学', 3, 150, '态度、群体与人际影响。', '互动', 'presentation-self', 'core', ['psych']),
  course('cognition', 'SS330', 'ss', '认知心理学', 4, 180, '注意、记忆与推理。', '偏差', 'thinking-slow', 'advanced', ['psych']),
  course('china-hist', 'HI140', 'hi', '中国史', 3, 130, '制度、社会与主要朝代变迁。', '纪传', 'shiji'),
  course('lit-intro', 'LT120', 'lt', '文学导论', 3, 120, '体裁、主题与细读方法。', '叙事结构', 'invisible-cities'),
  course('classical-cn', 'LT220', 'lt', '中国古典文学', 3, 140, '诗、文、词与小说传统。', '古典汉语', 'human-ci', 'core', ['lit-intro']),
  course('modern-cn', 'LT250', 'lt', '中国现当代文学', 3, 140, '现代小说、散文与新诗。', '记忆', 'morning-blossoms', 'core', ['lit-intro']),
  course('lit-theory', 'LT320', 'lt', '文学理论', 4, 180, '形式、叙事与批评路径。', '意识流', 'to-lighthouse', 'advanced', ['lit-intro']),
];

export const studyPrograms: StudyProgram[] = [
  { id: 'general', title: '通识学位', kind: 'general', school: '榛木镇大学', credits: 12, required: [], desc: '跨学院选修。修满 12 学分即可获得通识学位。' },
  { id: 'cert-nature', title: '植物分类证书', kind: 'certificate', school: '理学院', credits: 7, required: ['nature', 'botany'], desc: '普通生物学与植物分类。' },
  { id: 'cert-history', title: '档案整理证书', kind: 'certificate', school: '历史学院', credits: 6, required: ['history', 'archive'], desc: '近现代史与档案整理。' },
  { id: 'cert-stats', title: '回归分析证书', kind: 'certificate', school: '数学学院', credits: 7, required: ['statistics', 'data'], desc: '统计学导论与回归分析。' },
  { id: 'cert-philosophy', title: '哲学论证证书', kind: 'certificate', school: '哲学学院', credits: 7, required: ['reserve-intro', 'observation-methods'], desc: '哲学基础与严谨论证。' },
  { id: 'cert-writing', title: '学术写作证书', kind: 'certificate', school: '文学院', credits: 3, required: ['writing'], desc: '学术写作考核。' },
  { id: 'cert-english', title: '英语实践证书', kind: 'certificate', school: '文学院', credits: 3, required: ['english'], desc: '英语综合运用考核。' },
  { id: 'cert-english-int', title: '英语进阶证书', kind: 'certificate', school: '文学院', credits: 6, required: ['english', 'english-2'], desc: '英语实践与进阶阅读写作。' },
  { id: 'cert-english-adv', title: '英语高级证书', kind: 'certificate', school: '文学院', credits: 10, required: ['english', 'english-2', 'english-3'], desc: '英语全阶训练与高级研讨。' },
  { id: 'cert-french', title: '法语实践证书', kind: 'certificate', school: '文学院', credits: 3, required: ['french'], desc: '法语综合运用考核。' },
  { id: 'cert-french-int', title: '法语进阶证书', kind: 'certificate', school: '文学院', credits: 6, required: ['french', 'french-2'], desc: '法语实践与进阶读写。' },
  { id: 'cert-french-adv', title: '法语高级证书', kind: 'certificate', school: '文学院', credits: 10, required: ['french', 'french-2', 'french-3'], desc: '法语全阶训练与高级研讨。' },
  { id: 'cert-spanish', title: '西班牙语实践证书', kind: 'certificate', school: '文学院', credits: 3, required: ['spanish'], desc: '西班牙语综合运用考核。' },
  { id: 'cert-spanish-int', title: '西班牙语进阶证书', kind: 'certificate', school: '文学院', credits: 6, required: ['spanish', 'spanish-2'], desc: '西语实践与进阶会话阅读。' },
  { id: 'cert-spanish-adv', title: '西班牙语高级证书', kind: 'certificate', school: '文学院', credits: 10, required: ['spanish', 'spanish-2', 'spanish-3'], desc: '西语全阶训练与高级研讨。' },
  { id: 'cert-japanese', title: '日语实践证书', kind: 'certificate', school: '文学院', credits: 3, required: ['japanese'], desc: '日语综合运用考核。' },
  { id: 'cert-japanese-int', title: '日语进阶证书', kind: 'certificate', school: '文学院', credits: 6, required: ['japanese', 'japanese-2'], desc: '日语实践与进阶读解。' },
  { id: 'cert-japanese-adv', title: '日语高级证书', kind: 'certificate', school: '文学院', credits: 10, required: ['japanese', 'japanese-2', 'japanese-3'], desc: '日语全阶训练与高级研讨。' },
  { id: 'cert-latin', title: '拉丁语基础证书', kind: 'certificate', school: '文学院', credits: 3, required: ['latin'], desc: '拉丁语阅读与语法考核。' },
  { id: 'cert-latin-int', title: '拉丁语进阶证书', kind: 'certificate', school: '文学院', credits: 6, required: ['latin', 'latin-2'], desc: '拉丁语基础与进阶选读。' },
  { id: 'cert-latin-adv', title: '拉丁语高级证书', kind: 'certificate', school: '文学院', credits: 10, required: ['latin', 'latin-2', 'latin-3'], desc: '拉丁语全阶训练与高级研讨。' },
  { id: 'cert-society', title: '社会调查证书', kind: 'certificate', school: '社会科学学院', credits: 6, required: ['community', 'ethnography'], desc: '社会学基础与田野调查。' },
  { id: 'cert-psych', title: '心理学基础证书', kind: 'certificate', school: '社会科学学院', credits: 6, required: ['psych', 'development'], desc: '心理学导论与发展心理学。' },
  { id: 'cert-design', title: '素描证书', kind: 'certificate', school: '美术学院', credits: 6, required: ['design', 'visual'], desc: '设计基础与素描。' },
  { id: 'cert-watercolor', title: '水彩证书', kind: 'certificate', school: '美术学院', credits: 3, required: ['watercolor'], desc: '水彩写生考核。' },
  { id: 'cert-oil', title: '油画证书', kind: 'certificate', school: '美术学院', credits: 3, required: ['oil'], desc: '油画习作考核。' },
  { id: 'cert-print', title: '版画证书', kind: 'certificate', school: '美术学院', credits: 2, required: ['printmaking'], desc: '版画印制考核。' },
  { id: 'cert-calligraphy', title: '书法证书', kind: 'certificate', school: '美术学院', credits: 2, required: ['calligraphy'], desc: '临帖与结体考核。' },
  { id: 'cert-health', title: '查尔斯顿舞证书', kind: 'certificate', school: '体育学院', credits: 3, required: ['body'], desc: '查尔斯顿舞考核。' },
  { id: 'cert-ballet', title: '芭蕾证书', kind: 'certificate', school: '体育学院', credits: 2, required: ['recovery'], desc: '芭蕾基础考核。' },
  { id: 'cert-jazz', title: '爵士舞证书', kind: 'certificate', school: '体育学院', credits: 3, required: ['movement'], desc: '爵士舞组合考核。' },
  { id: 'cert-tennis', title: '网球证书', kind: 'certificate', school: '体育学院', credits: 3, required: ['tennis'], desc: '网球技术考核。' },
  { id: 'cert-swim', title: '游泳证书', kind: 'certificate', school: '体育学院', credits: 3, required: ['swim'], desc: '游泳技术考核。' },
  { id: 'cert-running', title: '跑步训练证书', kind: 'certificate', school: '体育学院', credits: 2, required: ['running'], desc: '跑姿、配速与训练量考核。' },
  { id: 'cert-strength', title: '力量训练证书', kind: 'certificate', school: '体育学院', credits: 2, required: ['strength-training'], desc: '基础力量动作与负荷安排考核。' },
  { id: 'cert-hoop', title: '篮球证书', kind: 'certificate', school: '体育学院', credits: 3, required: ['hoop'], desc: '篮球技术考核。' },
  { id: 'cert-yoga', title: '瑜伽证书', kind: 'certificate', school: '体育学院', credits: 2, required: ['yoga'], desc: '瑜伽体式考核。' },
  { id: 'cert-fencing', title: '击剑证书', kind: 'certificate', school: '体育学院', credits: 3, required: ['fencing'], desc: '击剑技术考核。' },
  { id: 'cert-piano', title: '钢琴证书', kind: 'certificate', school: '音乐学院', credits: 3, required: ['piano'], desc: '读谱与短曲演奏考核。' },
  { id: 'cert-theory', title: '乐理证书', kind: 'certificate', school: '音乐学院', credits: 3, required: ['music-theory'], desc: '乐理与听觉训练考核。' },
  { id: 'cert-pottery', title: '陶艺证书', kind: 'certificate', school: '美术学院', credits: 3, required: ['pottery'], desc: '成形、施釉与烧制考核。' },
  { id: 'cert-cooking', title: '基础烹饪证书', kind: 'certificate', school: '体育学院', credits: 2, required: ['cooking'], desc: '日常备餐与卫生考核。' },
  { id: 'cert-ee', title: '电路实验证书', kind: 'certificate', school: '工学院', credits: 6, required: ['tools', 'energy'], desc: '工程制图与电路实验。' },
  { id: 'degree-ns', title: '生物学学士', kind: 'degree', school: '理学院', credits: 24, required: ['nature', 'ecology', 'botany', 'evolution'], desc: '从普通生物学到进化生物学。', researchId: 'track-specimens' },
  { id: 'degree-ma', title: '应用数学学士', kind: 'degree', school: '数学学院', credits: 24, required: ['statistics', 'geometry', 'data', 'models'], desc: '统计、几何、回归分析与数学建模。', researchId: 'track-math-model' },
  { id: 'degree-ts', title: '哲学学士', kind: 'degree', school: '哲学学院', credits: 24, required: ['reserve-intro', 'classics', 'ethics', 'long-society'], desc: '导论、哲学史、伦理学与政治哲学。', researchId: 'track-observe' },
  { id: 'degree-lt', title: '英文学士', kind: 'degree', school: '文学院', credits: 24, required: ['writing', 'narrative', 'classical', 'translation'], desc: '学术写作、小说、英国文学与翻译。', researchId: 'track-names' },
  { id: 'degree-english', title: '英语学士', kind: 'degree', school: '文学院', credits: 18, required: ['english', 'english-2', 'english-3', 'writing'], desc: '英语三阶训练与学术写作。', researchId: 'track-names' },
  { id: 'degree-french', title: '法语学士', kind: 'degree', school: '文学院', credits: 18, required: ['french', 'french-2', 'french-3', 'writing'], desc: '法语三阶训练与学术写作。', researchId: 'track-names' },
  { id: 'degree-spanish', title: '西班牙语学士', kind: 'degree', school: '文学院', credits: 18, required: ['spanish', 'spanish-2', 'spanish-3', 'writing'], desc: '西语三阶训练与学术写作。', researchId: 'track-names' },
  { id: 'degree-japanese', title: '日语学士', kind: 'degree', school: '文学院', credits: 18, required: ['japanese', 'japanese-2', 'japanese-3', 'writing'], desc: '日语三阶训练与学术写作。', researchId: 'track-names' },
  { id: 'degree-latin', title: '古典语言学士', kind: 'degree', school: '文学院', credits: 18, required: ['latin', 'latin-2', 'latin-3', 'classics'], desc: '拉丁语三阶与西方哲学史。', researchId: 'track-lit' },
  { id: 'degree-ss', title: '社会科学学士', kind: 'degree', school: '社会科学学院', credits: 24, required: ['community', 'ethnography', 'economy', 'institutions'], desc: '社会学、人类学与经济学。', researchId: 'track-oral' },
  { id: 'degree-en', title: '电气工程学士', kind: 'degree', school: '工学院', credits: 24, required: ['tools', 'energy', 'mapping', 'lab-methods'], desc: '制图、电路实验、数字电路与电气工程导论。', researchId: 'track-circuit' },
  { id: 'degree-ar', title: '美术学士', kind: 'degree', school: '美术学院', credits: 24, required: ['design', 'craft', 'visual'], desc: '设计、工艺与素描。', researchId: 'track-studio' },
  { id: 'degree-arthist', title: '艺术史学士', kind: 'degree', school: '美术学院', credits: 24, required: ['arthist', 'renaissance', 'modern-art', 'china-art'], desc: '导论、文艺复兴、现代艺术与中国美术史。', researchId: 'track-arthist' },
  { id: 'degree-psych', title: '心理学学士', kind: 'degree', school: '社会科学学院', credits: 24, required: ['psych', 'development', 'social-psych', 'cognition'], desc: '导论、发展、社会心理与认知心理学。', researchId: 'track-psych' },
  { id: 'degree-lit', title: '文学学士', kind: 'degree', school: '文学院', credits: 24, required: ['lit-intro', 'classical-cn', 'modern-cn', 'lit-theory'], desc: '导论、古典文学、现当代文学与文学理论。', researchId: 'track-lit' },
  { id: 'degree-hi', title: '历史学学士', kind: 'degree', school: '历史学院', credits: 24, required: ['history', 'china-hist', 'archive', 'historiography'], desc: '世界近现代史、中国史、档案整理与史学理论。', researchId: 'track-history' },
  { id: 'degree-mu', title: '音乐学学士', kind: 'degree', school: '音乐学院', credits: 24, required: ['piano', 'music-theory', 'ensemble', 'composition'], desc: '演奏、听觉、合奏与完整作品创作。', researchId: 'track-recital' },
  { id: 'degree-hs', title: '运动科学学士', kind: 'degree', school: '体育学院', credits: 24, required: ['nutrition', 'running', 'strength-training', 'recovery'], desc: '运动生理、耐力、力量与恢复。', researchId: 'track-movement' },
  { id: 'master-lit', title: '文学硕士', kind: 'master', school: '文学院', credits: 30, required: ['lit-intro', 'classical-cn', 'modern-cn', 'lit-theory', 'writing', 'narrative'], desc: '在文学学士基础上完成更广泛的文本研究与批评写作。', researchId: 'track-lit', priorProgramId: 'degree-lit' },
  { id: 'doctorate-lit', title: '文学博士', kind: 'doctorate', school: '文学院', credits: 40, required: ['lit-intro', 'classical-cn', 'modern-cn', 'lit-theory', 'writing', 'narrative', 'classical', 'translation'], desc: '跨越文学、写作、翻译与语言训练，完成长期原创研究。', researchId: 'track-lit', priorProgramId: 'master-lit' },
  { id: 'master-arthist', title: '艺术史硕士', kind: 'master', school: '美术学院', credits: 30, required: ['arthist', 'renaissance', 'modern-art', 'china-art', 'design', 'visual'], desc: '结合视觉实践，深化跨时期艺术史研究。', researchId: 'track-arthist', priorProgramId: 'degree-arthist' },
  { id: 'doctorate-arthist', title: '艺术史博士', kind: 'doctorate', school: '美术学院', credits: 36, required: ['arthist', 'renaissance', 'modern-art', 'china-art', 'design', 'visual', 'craft', 'calligraphy'], desc: '以作品、档案与物质文化为基础完成原创艺术史研究。', researchId: 'track-arthist', priorProgramId: 'master-arthist' },
  { id: 'master-ss', title: '社会研究硕士', kind: 'master', school: '社会科学学院', credits: 26, required: ['community', 'ethnography', 'economy', 'institutions', 'psych', 'social-psych'], desc: '综合社会调查、制度分析与心理学方法。', researchId: 'track-oral', priorProgramId: 'degree-ss' },
  { id: 'master-psych', title: '心理学硕士', kind: 'master', school: '社会科学学院', credits: 26, required: ['psych', 'development', 'social-psych', 'cognition', 'community'], desc: '在心理学主干课程上加入社会研究训练。', researchId: 'track-psych', priorProgramId: 'degree-psych' },
];

export const researchTracks: ResearchTrack[] = [
  { id: 'track-math-model', title: '河谷流动建模', school: '数学学院', desc: '用长期观测数据建立并检验一个数学模型。', projectId: 'valley-model', need: '统计与建模课程将加速进度' },
  { id: 'track-specimens', title: '植物分类学年报', school: '理学院', desc: '整理标本鉴定记录，提交毕业论文。', projectId: 'plant-taxonomy', need: '阅读积累较深后，在小屋以创作推进' },
  { id: 'track-observe', title: '哲学毕业论文', school: '哲学学院', desc: '选定论题，完成文献综述与论证。', projectId: 'observation-standard', need: '高阶课程将加速进度；在小屋以创作推进' },
  { id: 'track-names', title: '翻译实践报告', school: '文学院', desc: '完成一组译文并附译者说明。', projectId: 'place-names', need: '写作与翻译课程有帮助；在小屋以创作推进' },
  { id: 'track-oral', title: '社区调查报告', school: '社会科学学院', desc: '完成访谈与田野笔记，写成调查报告。', projectId: 'oral-history', need: '一段关系熟悉达到 40 后，在小屋以创作推进' },
  { id: 'track-circuit', title: '电气工程毕业设计', school: '工学院', desc: '完成小型电路设计、实验与说明书。', projectId: 'circuit-prototype', need: '电路与电气工程课程将加速进度' },
  { id: 'track-studio', title: '素描习作集', school: '美术学院', desc: '整理课堂作业与写生，提交毕业习作集。', projectId: 'craft-catalog', need: '素描与设计课程有帮助' },
  { id: 'track-arthist', title: '艺术史毕业论文', school: '美术学院', desc: '完成选题、文献综述与作品分析。', projectId: 'living-exhibit', need: '艺术史课程将加速进度' },
  { id: 'track-psych', title: '心理学毕业论文', school: '社会科学学院', desc: '完成选题、文献综述与一项小规模调查。', projectId: 'slow-paper', need: '心理学课程将加速进度' },
  { id: 'track-lit', title: '文学毕业论文', school: '文学院', desc: '完成选题、文本细读与批评论文。', projectId: 'field-guide', need: '文学课程将加速进度' },
  { id: 'track-history', title: '历史学毕业论文', school: '历史学院', desc: '完成选题、史料整理与史学论文。', projectId: 'oral-history', need: '历史课程将加速进度' },
  { id: 'track-recital', title: '毕业音乐会与作品集', school: '音乐学院', desc: '排演一场毕业音乐会，并提交一部完整原创作品。', projectId: 'recital-portfolio', need: '演奏、合奏与作曲课程将加速进度' },
  { id: 'track-movement', title: '个人训练周期研究', school: '体育学院', desc: '设计训练周期，记录负荷、表现与恢复并完成报告。', projectId: 'movement-study', need: '运动生理与训练课程将加速进度' },
];

export const courseById = Object.fromEntries(courseCatalog.map(item => [item.id, item])) as Record<string, CourseDefinition>;

export function getCourse(id: string) {
  return courseById[id];
}

export function creditSum(ids: string[]) {
  return ids.reduce((sum, id) => sum + (getCourse(id)?.credits ?? 0), 0);
}

export function prereqsMet(course: CourseDefinition, completed: string[]) {
  return course.prereq.every(id => completed.includes(id));
}

export function coursePrerequisites(course: CourseDefinition): Prerequisite[] {
  return course.prereq.map(id => {
    const other = getCourse(id);
    return { kind: 'course' as const, id, label: `先修 ${other?.code ?? id}` };
  });
}

export function relatedReadingBonus(courseId: string, bookId: string) {
  const course = getCourse(courseId);
  const book = getBook(bookId);
  if (!course || !book) return 0;
  if (course.bookId === book.id) return 5;
  if (book.nodes.includes(course.node)) return 3;
  const recommended = getBook(course.bookId);
  if (recommended && recommended.category === book.category) return 1;
  return 0;
}

export function programCreditCap(program: StudyProgram) {
  if (program.kind === 'general' || program.required.length === 0) return program.credits;
  const available = creditSum(programCourseList(program).map(course => course.id));
  if (available <= 0) return program.credits;
  return Math.min(program.credits, available);
}

export function programStatus(program: StudyProgram, completed: string[], diplomas: Record<string, DiplomaReport> = {}) {
  const ids = programRecordIds(program, completed);
  const requiredMet = program.required.every(id => completed.includes(id));
  const total = creditSum(ids);
  const cap = programCreditCap(program);
  const priorMet = !program.priorProgramId || !!diplomas[program.priorProgramId];
  const complete = priorMet && requiredMet && total >= cap;
  const requiredDone = program.required.filter(id => completed.includes(id)).length;
  return { priorMet, requiredMet, requiredDone, requiredTotal: program.required.length, total, cap, complete, ratio: Math.min(100, cap === 0 ? 0 : (total / cap) * 100) };
}

export function programKindLabel(kind: StudyProgram['kind']) {
  return kind === 'degree' ? '学士' : kind === 'master' ? '硕士' : kind === 'doctorate' ? '博士' : kind === 'certificate' ? '证书' : '通识';
}

export function programCompletionReward(program: Pick<StudyProgram, 'kind' | 'credits' | 'researchId'>) {
  if (program.kind === 'doctorate') return 9000;
  if (program.kind === 'master') return 5500;
  if (program.kind === 'degree') return 3000;
  if (program.kind === 'certificate') return 300 + program.credits * 60;
  return 1500;
}

export function programCompletionLedger(program: Pick<StudyProgram, 'kind' | 'title' | 'credits' | 'researchId'>) {
  return {
    label: `完成${programKindLabel(program.kind)}：${program.title}`,
    amount: programCompletionReward(program),
  };
}

export function programCompletionTotal(programs: Pick<StudyProgram, 'kind' | 'credits' | 'researchId'>[]) {
  return programs.reduce((sum, item) => sum + programCompletionReward(item), 0);
}

export function diplomaReward(report: Pick<DiplomaReport, 'programId' | 'kind' | 'credits'> & { reward?: number }) {
  if (typeof report.reward === 'number') return report.reward;
  const program = studyPrograms.find(item => item.id === report.programId);
  if (program) return programCompletionReward(program);
  if (report.kind === 'doctorate') return 9000;
  if (report.kind === 'master') return 5500;
  if (report.kind === 'degree') return 3000;
  if (report.kind === 'certificate') return 300 + report.credits * 60;
  return 1500;
}

export function diplomaRewardLabel(kind: StudyProgram['kind']) {
  return kind === 'degree' || kind === 'master' || kind === 'doctorate' ? '毕业奖励' : '结业奖励';
}

export function diplomaTitle(kind: StudyProgram['kind']) {
  return kind === 'degree' ? '学士学位证书' : kind === 'master' ? '硕士学位证书' : kind === 'doctorate' ? '博士学位证书' : kind === 'certificate' ? '结业证书' : '通识结业证书';
}

export function programRecordIds(program: StudyProgram, completed: string[]) {
  if (program.kind === 'general' || program.required.length === 0) return completed;
  const fromProgram = programCourseList(program).map(course => course.id).filter(id => completed.includes(id));
  return [...new Set([...program.required.filter(id => completed.includes(id)), ...fromProgram])];
}

export type TermGradeRow = {
  id: string;
  code: string;
  title: string;
  credits: number;
  letter: string;
  gpa: number;
  passed: boolean;
};

export type TermReport = {
  year: number;
  weekOfYear: number;
  termName: string;
  rows: TermGradeRow[];
  termGpa: number;
  passedCount: number;
  failedCount: number;
};

export type DiplomaCourse = {
  code: string;
  title: string;
  letter: string;
  gpa: number;
  credits: number;
};

export type DiplomaReport = {
  programId: string;
  title: string;
  kind: StudyProgram['kind'];
  school: string;
  credits: number;
  earnedCredits: number;
  gpa: number;
  courses: DiplomaCourse[];
  year: number;
  weekOfYear: number;
  termName: string;
  reward: number;
  /** 证书页眉校名；缺省时按 school 推断 */
  schoolShort?: string;
  /** 如「高等学位证书」；缺省走 diplomaTitle(kind) */
  documentTitle?: string;
  /** 如「高等学位」；缺省走 programKindLabel(kind) */
  kindLabel?: string;
  /** 证明正文；缺省走通用学位/结业措辞 */
  grantText?: string;
  /** 如「签发于星穹秘法学院」 */
  issuedAt?: string;
};

export function diplomaSchoolShort(report: Pick<DiplomaReport, 'school' | 'schoolShort'>) {
  if (report.schoolShort) return report.schoolShort;
  if (report.school.includes('星穹秘法学院')) return '星穹秘法学院';
  return '榛木镇大学';
}

export function diplomaIssuedAt(report: Pick<DiplomaReport, 'school' | 'issuedAt'>) {
  if (report.issuedAt) return report.issuedAt;
  if (report.school.includes('星穹秘法学院')) return '签发于星穹秘法学院';
  return '签发于榛木镇';
}

export function diplomaDocumentTitle(report: Pick<DiplomaReport, 'kind' | 'documentTitle'>) {
  return report.documentTitle ?? diplomaTitle(report.kind);
}

export function diplomaKindLabelOf(report: Pick<DiplomaReport, 'kind' | 'kindLabel'>) {
  return report.kindLabel ?? programKindLabel(report.kind);
}

export function buildTermReport(
  passed: string[],
  failed: string[],
  progress: Record<string, number>,
  grades: Record<string, number>,
  year: number,
  weekOfYear: number,
): TermReport | null {
  const ids = [...passed, ...failed];
  if (!ids.length) return null;
  const rows = ids.map(id => {
    const course = getCourse(id);
    const gpa = grades[id] ?? gradeFromProgress(progress[id] ?? 0).gpa;
    return {
      id,
      code: course?.code ?? id,
      title: course?.title ?? id,
      credits: course?.credits ?? 0,
      letter: gpaLetter(gpa),
      gpa,
      passed: passed.includes(id),
    };
  });
  return {
    year,
    weekOfYear,
    termName: academicTerm(weekOfYear).name,
    rows,
    termGpa: cumulativeGpa(ids, grades),
    passedCount: passed.length,
    failedCount: failed.length,
  };
}

export function newlyCompletedPrograms(after: string[], declaredId: string, diplomas: Record<string, DiplomaReport>) {
  const program = studyPrograms.find(item => item.id === declaredId);
  if (!program || diplomas[program.id]) return [];
  if (!programStatus(program, after, diplomas).complete) return [];
  return [program];
}

export function mergeDiplomas(current: Record<string, DiplomaReport>, incoming: DiplomaReport[]) {
  if (!incoming.length) return current;
  const next = { ...current };
  for (const report of incoming) next[report.programId] = report;
  return next;
}

export function buildDiploma(
  program: StudyProgram,
  completed: string[],
  grades: Record<string, number>,
  year: number,
  weekOfYear: number,
): DiplomaReport {
  const ids = programRecordIds(program, completed);
  return {
    programId: program.id,
    title: program.title,
    kind: program.kind,
    school: program.school,
    credits: programCreditCap(program),
    earnedCredits: creditSum(ids),
    gpa: cumulativeGpa(ids, grades),
    courses: ids.map(id => {
      const course = getCourse(id);
      const gpa = grades[id] ?? 0;
      return {
        code: course?.code ?? id,
        title: course?.title ?? id,
        letter: gpaLetter(gpa),
        gpa,
        credits: course?.credits ?? 0,
      };
    }),
    year,
    weekOfYear,
    termName: academicTerm(weekOfYear).name,
    reward: programCompletionReward(program),
  };
}

export function programResearch(program: StudyProgram) {
  return program.researchId ? researchTracks.find(item => item.id === program.researchId) : undefined;
}

export function researchOpenReady(program: StudyProgram, completed: string[]) {
  if (program.required.length === 0) {
    const need = Math.min(program.credits, 12);
    const have = creditSum(completed);
    return { ready: have >= need, have, need, label: `先修满 ${need} 学分（已有 ${have}）` };
  }
  const have = program.required.filter(id => completed.includes(id)).length;
  const need = Math.max(1, Math.ceil(program.required.length / 2));
  return { ready: have >= need, have, need, label: `先通过本方案必修 ${need} 门（已过 ${have}）` };
}

export function programCourseList(program: StudyProgram) {
  if (program.kind === 'general' || program.required.length === 0) return courseCatalog;
  if (program.kind === 'certificate') {
    const ids = new Set(program.required);
    for (const id of program.required) {
      for (const prereq of getCourse(id)?.prereq ?? []) ids.add(prereq);
    }
    return [...ids].map(id => getCourse(id)).filter((course): course is CourseDefinition => !!course);
  }
  const collegeIds = new Set(program.required.map(id => getCourse(id)?.collegeId).filter((id): id is string => !!id));
  const list = courseCatalog.filter(course => program.required.includes(course.id) || collegeIds.has(course.collegeId));
  return [...list].sort((a, b) => {
    const ra = program.required.indexOf(a.id);
    const rb = program.required.indexOf(b.id);
    if (ra !== rb) return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb);
    return 0;
  });
}

export function nextRequired(program: StudyProgram, completed: string[], enrolled: string[]) {
  return program.required.map(id => getCourse(id)).filter((course): course is CourseDefinition => !!course && !completed.includes(course.id) && !enrolled.includes(course.id));
}

export function completedCertificates(diplomas: Record<string, DiplomaReport>) {
  return Object.values(diplomas).filter(item => item.kind === 'certificate');
}

export function programAwarded(programId: string, diplomas: Record<string, DiplomaReport>) {
  return !!diplomas[programId];
}

export function learnedSports(completed: string[]) {
  return courseCatalog.filter(course => course.sport && completed.includes(course.id)).map(course => ({
    id: course.id,
    title: course.sport as string,
  }));
}

export function recommendedBookTitle(course: CourseDefinition) {
  return books.find(item => item.id === course.bookId)?.title ?? course.bookId;
}

export function academicTerm(weekOfYear: number) {
  const seasonIndex = Math.min(3, Math.floor((weekOfYear - 1) / TERM_BLOCK_WEEKS));
  const weekInBlock = ((weekOfYear - 1) % TERM_BLOCK_WEEKS) + 1;
  const names = ['春季学期', '夏季学期', '秋季学期', '冬季学期'] as const;
  const breaks = ['春假', '暑假', '秋假', '寒假'] as const;
  const inSession = weekInBlock <= TERM_TEACHING_WEEKS;
  return {
    seasonIndex,
    name: names[seasonIndex],
    breakName: breaks[seasonIndex],
    weekInBlock,
    termWeek: inSession ? weekInBlock : 0,
    teachingWeeks: TERM_TEACHING_WEEKS,
    inSession,
    addDrop: weekInBlock === 1,
    lastTeachingWeek: weekInBlock === TERM_TEACHING_WEEKS,
    holiday: !inSession,
    holidayWeeks: TERM_BLOCK_WEEKS - TERM_TEACHING_WEEKS,
  };
}

export function termPhaseProgress(weekOfYear: number) {
  const term = academicTerm(weekOfYear);
  if (term.holiday) {
    const current = term.weekInBlock - term.teachingWeeks;
    const total = term.holidayWeeks;
    return {
      current,
      total,
      remaining: total - current + 1,
      note: `${term.breakName}第${current}/${total}周`,
      advanceLabel: term.breakName,
    };
  }
  return {
    current: term.weekInBlock,
    total: term.teachingWeeks,
    remaining: term.teachingWeeks - term.weekInBlock + 1,
    note: `学期第${term.weekInBlock}/${term.teachingWeeks}周`,
    advanceLabel: '剩余学期',
  };
}

export function progressToGpa(progress: number) {
  if (progress >= 93) return 4;
  if (progress >= 90) return 3.7;
  if (progress >= 87) return 3.3;
  if (progress >= 83) return 3;
  if (progress >= 80) return 2.7;
  if (progress >= 77) return 2.3;
  if (progress >= 73) return 2;
  if (progress >= 70) return 1.7;
  if (progress >= 67) return 1.3;
  if (progress >= 60) return 1;
  return 0;
}

export function gpaLetter(gpa: number) {
  if (gpa >= 3.85) return 'A';
  if (gpa >= 3.5) return 'A-';
  if (gpa >= 3.15) return 'B+';
  if (gpa >= 2.85) return 'B';
  if (gpa >= 2.5) return 'B-';
  if (gpa >= 2.15) return 'C+';
  if (gpa >= 1.85) return 'C';
  if (gpa >= 1.5) return 'C-';
  if (gpa >= 1.15) return 'D+';
  if (gpa >= 0.85) return 'D';
  return 'F';
}

export function gradeFromProgress(progress: number) {
  const gpa = progressToGpa(progress);
  return { gpa, letter: gpaLetter(gpa), passed: gpa >= 1 };
}

export function cumulativeGpa(completed: string[], grades: Record<string, number>) {
  let points = 0;
  let credits = 0;
  for (const id of completed) {
    const credit = getCourse(id)?.credits ?? 0;
    if (!credit) continue;
    points += (grades[id] ?? 0) * credit;
    credits += credit;
  }
  return credits ? points / credits : 0;
}

export function hydrateCourseGrades(completed: string[], progress: Record<string, number>, saved?: Record<string, number>) {
  const next: Record<string, number> = { ...saved };
  for (const id of completed) {
    if (next[id] == null) next[id] = progressToGpa(progress[id] ?? 85);
  }
  return next;
}

export function closeTerm(enrolled: string[], progress: Record<string, number>, completed: string[], grades: Record<string, number>) {
  const nextCompleted = [...completed];
  const nextGrades = { ...grades };
  const passed: string[] = [];
  const failed: string[] = [];
  for (const id of enrolled) {
    if (nextCompleted.includes(id)) continue;
    const grade = gradeFromProgress(progress[id] ?? 0);
    nextGrades[id] = grade.gpa;
    if (grade.passed) {
      nextCompleted.push(id);
      passed.push(id);
    } else {
      failed.push(id);
    }
  }
  return { nextCompleted, nextGrades, passed, failed, nextEnrolled: [] as string[] };
}

export function academicHeading(weekOfYear: number) {
  const term = academicTerm(weekOfYear);
  const phase = termPhaseProgress(weekOfYear);
  if (term.holiday) return { heading: phase.note, state: '无课' };
  const heading = `${term.name} 第${term.termWeek}/${term.teachingWeeks}周`;
  const state = term.addDrop ? '选课周' : '课表锁定';
  return { heading, state };
}

export function termLabel(_season: '春' | '夏' | '秋' | '冬', weekOfYear: number) {
  const term = academicTerm(weekOfYear);
  const phase = termPhaseProgress(weekOfYear);
  return { ...term, name: term.holiday ? phase.note : term.name };
}

export function isAddDropWeek(weekOfYear: number) {
  return academicTerm(weekOfYear).addDrop;
}

export function meetingLabel(slots: CourseSlot[]) {
  return slots.map(slot => `${DAY_NAMES[slot.day]}${PERIOD_NAMES[slot.period]}`).join(' · ');
}

export function courseWeeklyBase(slots: number) {
  return Math.max(2, slots) * 5;
}

export function slotKey(day: number, period: number) {
  return `${day}-${period}`;
}

export function enrolledMeetings(enrolled: string[], inSession = true) {
  if (!inSession) return [];
  return enrolled.flatMap(id => (getCourse(id)?.meetings ?? []).map(slot => ({ ...slot, courseId: id })));
}

export function meetingConflict(enrolled: string[], courseId: string) {
  const taken = new Map<string, string>();
  for (const slot of enrolledMeetings(enrolled)) taken.set(slotKey(slot.day, slot.period), slot.courseId);
  const course = getCourse(courseId);
  if (!course) return undefined;
  for (const slot of course.meetings) {
    const otherId = taken.get(slotKey(slot.day, slot.period));
    if (otherId && otherId !== courseId) return getCourse(otherId);
  }
  return undefined;
}

export function overlayCoursePlan<T extends string>(plan: T[][], enrolled: string[], courseKey: T, freeKey: T, inSession = true) {
  const locked = new Set(enrolledMeetings(enrolled, inSession).map(slot => slotKey(slot.day, slot.period)));
  return plan.map((row, day) => row.map((value, period) => (
    locked.has(slotKey(day, period)) ? courseKey : value === courseKey ? freeKey : value
  )));
}
