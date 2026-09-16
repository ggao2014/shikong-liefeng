import { type Prerequisite, prerequisiteStatus, type ProgressionContext } from './prerequisites';

export type BookOrigin = 'reality' | 'reserve';
export type BookTone = 'sage' | 'clay' | 'blue' | 'gold';
export type BookCategory =
  | '自然科学'
  | '文学'
  | '哲学'
  | '历史'
  | '数学'
  | '社会科学'
  | '时空研究'
  | '艺术与设计'
  | '健康科学'
  | '工程';

export type BookDefinition = {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  origin: BookOrigin;
  era: string;
  nodes: string[];
  tone: BookTone;
  blurb: string;
  unlockAfter: number;
  prerequisites: Prerequisite[];
};

const toneOf: Record<BookCategory, BookTone> = {
  自然科学: 'sage',
  文学: 'clay',
  哲学: 'gold',
  历史: 'clay',
  数学: 'blue',
  社会科学: 'gold',
  时空研究: 'blue',
  艺术与设计: 'clay',
  健康科学: 'sage',
  工程: 'blue',
};

function book(
  id: string,
  title: string,
  author: string,
  category: BookCategory,
  difficulty: BookDefinition['difficulty'],
  origin: BookOrigin,
  era: string,
  nodes: string[],
  blurb: string,
): BookDefinition {
  const unlockAfter = difficulty >= 5 ? 10 : difficulty >= 4 ? 5 : difficulty >= 3 ? 2 : 0;
  return {
    id, title, author, category, difficulty, origin, era, nodes, tone: toneOf[category], blurb, unlockAfter,
    prerequisites: unlockAfter ? [{ kind: 'finishedBooks', value: unlockAfter, label: `需先读完 ${unlockAfter} 本书` }] : [],
  };
}

export function bookUnlockStatus(book: BookDefinition, context: ProgressionContext) {
  return prerequisiteStatus(book.prerequisites, context);
}

export const STARTER_BOOK_ID = 'star-flora';
export const BORROW_LIMIT = 3;
export const bookCategories: Array<'全部' | BookCategory> = [
  '全部', '自然科学', '文学', '哲学', '历史', '数学', '社会科学', '时空研究', '艺术与设计', '健康科学', '工程',
];

export const books: BookDefinition[] = [
  book('star-flora', '群星植物志', '伊莱娅·温', '自然科学', 2, 'reserve', '保护区当代', ['植物形态', '田野记录'], '用叶子、气味和季节把河谷写成可以慢慢核对的地图。'),
  book('origin-species', '物种起源', '查尔斯·达尔文', '自然科学', 3, 'reality', '19 世纪', ['演化', '证据推理'], '把变化看成积累，而不是一次宣布。'),
  book('insect-notes', '昆虫记', '让-亨利·法布尔', '自然科学', 2, 'reality', '19 世纪', ['田野记录', '观察耐心'], '近处的生命比远处的结论更先开口。'),
  book('silent-spring', '寂静的春天', '蕾切尔·卡森', '自然科学', 3, 'reality', '20 世纪', ['生态关联', '公共伦理'], '一种缺席的声音，也能成为证据。'),
  book('sand-county', '沙乡年鉴', '奥尔多·利奥波德', '自然科学', 2, 'reality', '20 世纪', ['土地伦理', '季节观察'], '把土地从背景里请回句子中间。'),
  book('lives-of-cell', '细胞生命的礼赞', '刘易斯·托马斯', '自然科学', 2, 'reality', '20 世纪', ['生命尺度', '科学随笔'], '最小的单位里也住着共同体。'),
  book('ben-cao', '本草纲目', '李时珍', '自然科学', 4, 'reality', '16 世纪', ['植物形态', '地方物产'], '名称、产地和用途被放进同一张长桌。'),
  book('river-flora', '银叶河谷植物手记', '馆员匿名补编', '自然科学', 1, 'reserve', '保护区当代', ['植物形态', '河谷散步'], '适合带着走，也适合被雨打湿。'),
  book('bird-calendar', '保护区观鸟历', '诺亚·艾伦斯', '自然科学', 2, 'reserve', '保护区当代', ['物候', '田野记录'], '迁飞在这里被拉成可以等待的学期。'),
  book('soil-memory', '土壤记得什么', '陈麦', '自然科学', 2, 'reserve', '保护区当代', ['地质时间', '田野记录'], '鞋底带走的泥，有时比笔记更诚实。'),
  book('fungi-dark', '菌丝的暗处', '森下圭', '自然科学', 3, 'reserve', '保护区当代', ['共生', '不可见网络'], '看见的森林下面，还有另一张森林。'),
  book('climate-slow', '缓慢气候读本', '伊萨·诺尔', '自然科学', 3, 'reserve', '保护区当代', ['气候', '长期观测'], '把“天气”从“气候”里小心地拆开。'),
  book('invisible-cities', '看不见的城市', '伊塔洛·卡尔维诺', '文学', 2, 'reality', '20 世纪', ['城市想象', '叙事结构'], '一座城可以被讲述无数次，仍不重复。'),
  book('far-return', '远方与归途', '玛拉·索恩', '文学', 1, 'reserve', '保护区当代', ['旅行观察', '地方文化'], '离开日常之后，怎样把看见的东西带回家。'),
  book('little-prince', '小王子', '安托万·德·圣埃克苏佩里', '文学', 1, 'reality', '20 世纪', ['关系', '观看'], '认真看一朵花，有时比赶路更难。'),
  book('border-town', '边城', '沈从文', '文学', 2, 'reality', '20 世纪', ['地方生活', '抒情叙事'], '水边的日子把感情放得很慢。'),
  book('to-lighthouse', '到灯塔去', '弗吉尼亚·伍尔夫', '文学', 3, 'reality', '20 世纪', ['意识流', '时间感知'], '一个下午可以装下很多层光线。'),
  book('odyssey', '奥德赛', '荷马', '文学', 3, 'reality', '古代', ['旅程', '归乡'], '回家也是一种需要练习的航行。'),
  book('don-quixote', '堂吉诃德', '塞万提斯', '文学', 3, 'reality', '17 世纪', ['叙事结构', '自我虚构'], '把世界读成故事时，故事也会改写世界。'),
  book('hundred-years', '百年孤独', '加西亚·马尔克斯', '文学', 3, 'reality', '20 世纪', ['家族时间', '循环叙事'], '重复的名字里藏着不肯结束的世纪。'),
  book('morning-blossoms', '朝花夕拾', '鲁迅', '文学', 2, 'reality', '20 世纪', ['记忆', '散文'], '回想并不等于返回，但可以重新看清楚。'),
  book('human-ci', '人间词话', '王国维', '文学', 2, 'reality', '20 世纪', ['境界', '古典汉语'], '用极少的字，测量一种生活的深度。'),
  book('walden', '瓦尔登湖', '亨利·戴维·梭罗', '文学', 2, 'reality', '19 世纪', ['独处', '简朴生活'], '减少之后，剩下的事物开始发声。'),
  book('hazel-stories', '榛木镇夜间故事集', '米拉口述 / 匿名整理', '文学', 1, 'reserve', '保护区当代', ['地方文化', '口述'], '杯子碰一下，故事就肯再讲一遍。'),
  book('mist-letters', '雾岬书简', '连舟', '文学', 2, 'reserve', '保护区当代', ['旅行观察', '书信'], '有些路适合写成给未来自己的信。'),
  book('slow-sentences', '慢句子练习', '林可', '文学', 1, 'reserve', '保护区当代', ['写作习惯', '观察'], '每天只写清楚一件被看见的小事。'),
  book('analects', '论语', '孔子及弟子', '哲学', 2, 'reality', '古代', ['伦理思考', '古典汉语'], '把相处的分寸练成可以反复温习的句子。'),
  book('zhuangzi', '庄子', '庄周', '哲学', 3, 'reality', '古代', ['齐物', '想象'], '让界限松动，并不等于放弃认真。'),
  book('republic', '理想国', '柏拉图', '哲学', 3, 'reality', '古代', ['正义', '城邦想象'], '一次漫长的对话，关于人该如何共同生活。'),
  book('nicomachean', '尼各马可伦理学', '亚里士多德', '哲学', 4, 'reality', '古代', ['德性', '习惯形成'], '好生活被理解成可以练习的品质。'),
  book('meditations', '沉思录', '马可·奥勒留', '哲学', 2, 'reality', '古代', ['自我修养', '时间'], '写给自己的句子，也可以借给一个安静的早晨。'),
  book('dao-de', '道德经', '老子', '哲学', 2, 'reality', '古代', ['无为', '自然'], '少做一点，有时是为了让事情自己到达。'),
  book('montaigne', '随笔集', '蒙田', '哲学', 3, 'reality', '16 世纪', ['自我观察', '怀疑'], '一个人可以一边犹豫，一边诚实地写。'),
  book('reserve-questions', '保护区里的问题', '阿黛尔·尹', '哲学', 3, 'reserve', '保护区当代', ['时间伦理', '提问'], '问题被允许陪伴一个季节，不必立刻闭合。'),
  book('town-chronicle', '小镇时间史', '塞缪尔·斐', '历史', 1, 'reserve', '保护区当代', ['保护区历史', '口述史'], '榛木镇如何学会把变化放得很慢。'),
  book('shiji', '史记', '司马迁', '历史', 4, 'reality', '古代', ['纪传', '证据与想象'], '人被写成时代的截面，时代也被写成性格。'),
  book('wanli', '万历十五年', '黄仁宇', '历史', 3, 'reality', '20 世纪', ['制度史', '大历史'], '一个平常年份，可以打开一整套结构。'),
  book('xu-xiake', '徐霞客游记', '徐霞客', '历史', 2, 'reality', '17 世纪', ['旅行观察', '地理'], '走路本身成为记录世界的方法。'),
  book('guns-germs', '枪炮、病菌与钢铁', '贾雷德·戴蒙德', '历史', 3, 'reality', '20 世纪', ['大尺度解释', '环境史'], '地理与生物如何参与人类的分岔。'),
  book('imagined-communities', '想象的共同体', '本尼迪克特·安德森', '历史', 4, 'reality', '20 世纪', ['民族', '印刷与想象'], '共同生活有时从共同阅读开始。'),
  book('local-archives', '榛木镇档案选编', '镇立档案馆', '历史', 1, 'reserve', '保护区当代', ['保护区历史', '档案'], '借书条、地图边注和未完成的会议记录。'),
  book('oral-river', '河谷口述十人', '匿名访谈', '历史', 2, 'reserve', '保护区当代', ['口述史', '地方文化'], '同一次春汛，有十种被记住的方式。'),
  book('station-memory', '旧车站记忆', '连舟', '历史', 2, 'reserve', '保护区当代', ['地方史', '旅行'], '停用的月台仍在教人如何等待。'),
  book('age-layers', '时代地层', '斐兰', '历史', 3, 'reserve', '保护区当代', ['时代章节', '长期社会'], '500 年不是空白，是一层层可以翻开的土。'),
  book('gentle-stats', '温柔的统计学', '林佑安', '数学', 2, 'reserve', '保护区当代', ['概率直觉', '数据叙事'], '用温和而清楚的方式对待不确定。'),
  book('daily-probability', '概率的日常语言', '安德烈·穆尔', '数学', 2, 'reserve', '保护区当代', ['概率直觉', '风险判断'], '把运气从迷信里轻轻抬出来。'),
  book('elements', '几何原本', '欧几里得', '数学', 4, 'reality', '古代', ['公理体系', '几何证明'], '从极少的约定出发，走到很远。'),
  book('how-to-solve', '怎样解题', '乔治·波利亚', '数学', 3, 'reality', '20 世纪', ['解题策略', '数学思维'], '卡住的时候，方法本身可以成为同伴。'),
  book('from-one', '从一到无穷大', '乔治·伽莫夫', '数学', 2, 'reality', '20 世纪', ['数量级', '科学直觉'], '大与小之间有一条可以走的路。'),
  book('tufte', '定量信息的视觉显示', '爱德华·塔夫特', '数学', 3, 'reality', '20 世纪', ['数据叙事', '视觉伦理'], '一张图应当尊重它所声称的事实。'),
  book('geb', '哥德尔、艾舍尔、巴赫', '侯世达', '数学', 5, 'reality', '20 世纪', ['自指', '形式系统'], '图案、赋格与证明在同一座迷宫里会面。'),
  book('model-garden', '模型小花园', '林佑安', '数学', 3, 'reserve', '保护区当代', ['建模', '简化的代价'], '一个好模型知道自己省略了什么。'),
  book('xiangtu', '乡土中国', '费孝通', '社会科学', 2, 'reality', '20 世纪', ['礼俗', '差序格局'], '近处的关系如何组织一个社会。'),
  book('gift', '礼物', '马塞尔·莫斯', '社会科学', 3, 'reality', '20 世纪', ['交换', '义务'], '赠与不是免费，它在建立往来。'),
  book('seeing-state', '国家的视角', '詹姆斯·斯科特', '社会科学', 4, 'reality', '20 世纪', ['简化治理', '地方知识'], '被看清楚的土地，有时也会被看丢。'),
  book('presentation-self', '日常生活中的自我呈现', '欧文·戈夫曼', '社会科学', 3, 'reality', '20 世纪', ['互动', '面子'], '一场茶馆谈话也有前后台。'),
  book('thinking-slow', '思考，快与慢', '丹尼尔·卡尼曼', '社会科学', 3, 'reality', '21 世纪', ['判断', '偏差'], '直觉很快，核实需要座位和时间。'),
  book('tea-house', '茶馆里的社会', '无名', '社会科学', 2, 'reserve', '保护区当代', ['小型公共', '倾听'], '榛木镇的公共生活经常从一壶茶开始。'),
  book('common-keys', '共用钥匙', '米拉·欧文', '社会科学', 2, 'reserve', '保护区当代', ['共同生活', '边界'], '分享空间不必取消各自的房间。'),
  book('small-institutions', '小制度如何活着', '裴宁', '社会科学', 3, 'reserve', '保护区当代', ['制度', '维护'], '规则若不被使用，就会变成展品。'),
  book('reserve-ethics', '时间保护区伦理', '阿黛尔·尹', '时空研究', 4, 'reserve', '保护区当代', ['时间伦理', '长期社会'], '极长寿命如何改变承诺、遗忘与责任。'),
  book('long-now', '长久现在', '斯图尔特·布兰德', '时空研究', 3, 'reality', '20 世纪', ['长期思维', '文明责任'], '把“现在”拉宽，让未来有座位。'),
  book('time-brief', '时间简史', '史蒂芬·霍金', '时空研究', 3, 'reality', '20 世纪', ['宇宙时间', '通俗物理'], '物理时间与生活时间在此短暂握手。'),
  book('structure-science', '科学革命的结构', '托马斯·库恩', '时空研究', 4, 'reality', '20 世纪', ['范式', '科学史'], '知识的转向很少像宣布那样干净。'),
  book('slow-citizenship', '缓慢公民', '阿黛尔·尹', '时空研究', 3, 'reserve', '保护区当代', ['长期社会', '参与'], '居住很久，并不自动成为更好的邻居。'),
  book('age-observe', '跨时代观测手册', '星穹学院编', '时空研究', 4, 'reserve', '保护区当代', ['长期观测', '记录标准'], '让百年后的人仍能读懂你今天看见的事。'),
  book('promise-centuries', '以世纪计算的承诺', '尹与斐', '时空研究', 4, 'reserve', '保护区当代', ['时间伦理', '契约'], '一份跨世代的约定该如何写，才不会变成枷锁。'),
  book('return-policy', '送返条例读本', '时空管理局', '时空研究', 2, 'reserve', '保护区当代', ['管理局制度', '等待'], '回去是条款，留下是生活。'),
  book('layered-hours', '叠置的钟点', '伊萨·诺尔', '时空研究', 3, 'reserve', '保护区当代', ['时间流速', '旅行'], '保护区外的一天，未必等于镇里的一天。'),
  book('memory-half-life', '记忆半衰期', '陈麦', '时空研究', 2, 'reserve', '保护区当代', ['遗忘', '档案'], '记得太久与忘得太快，都需要伦理。'),
  book('ethics-of-waiting', '等待的伦理', '阿黛尔·尹', '时空研究', 3, 'reserve', '保护区当代', ['耐心', '时间伦理'], '不行动也是一种对他人时间的态度。'),
  book('field-time', '田野中的时间', '诺亚·艾伦斯', '时空研究', 2, 'reserve', '保护区当代', ['观察节奏', '研究伦理'], '一棵树的变化，不接受学期截止日期。'),
  book('hazel-architecture', '榛木镇建筑图谱', '镇立档案馆', '艺术与设计', 1, 'reserve', '保护区当代', ['建筑观察', '地方史'], '窗子、台阶和储藏室如何塑造一天。'),
  book('pattern-language', '建筑模式语言', '克里斯托弗·亚历山大', '艺术与设计', 3, 'reality', '20 世纪', ['模式', '居住'], '好的空间可以像语言一样被学习。'),
  book('design-of-design', '设计中的设计', '原研哉', '艺术与设计', 2, 'reality', '21 世纪', ['空白', '日常器物'], '空不是没有，是给使用留位置。'),
  book('ways-of-seeing', '观看之道', '约翰·伯格', '艺术与设计', 2, 'reality', '20 世纪', ['观看', '图像'], '看见从来不是中性的。'),
  book('yuan-ye', '园冶', '计成', '艺术与设计', 3, 'reality', '17 世纪', ['园林', '借景'], '院子把远处的山借来，却不占有它。'),
  book('craftsman', '匠人', '理查德·桑内特', '艺术与设计', 3, 'reality', '21 世纪', ['手艺', '专注'], '把手做熟，是一种思考方式。'),
  book('cup-handles', '杯子的把手', '米拉·欧文', '艺术与设计', 1, 'reserve', '保护区当代', ['器物', '身体尺度'], '一只杯子会记住端它的方式。'),
  book('house-grows', '房子怎样长大', '白榛地工坊', '艺术与设计', 2, 'reserve', '保护区当代', ['扩建', '居住节奏'], '房间应当跟着生活长，而不是反过来。'),
  book('patient-body', '身体的耐心', '周遥', '健康科学', 1, 'reserve', '保护区当代', ['运动恢复', '习惯形成'], '训练是对话，不是对身体的通知。'),
  book('why-we-sleep', '我们为什么要睡觉', '马修·沃克', '健康科学', 2, 'reality', '21 世纪', ['睡眠', '恢复'], '睡眠不是空白，是白天的另一半工作。'),
  book('spark', '运动改造大脑', '约翰·瑞迪', '健康科学', 2, 'reality', '21 世纪', ['运动', '情绪'], '跑步不仅改变肌肉，也改变注意力的天气。'),
  book('huangdi', '黄帝内经', '托名黄帝', '健康科学', 4, 'reality', '古代', ['节律', '养生'], '身体被放回季节、作息和情绪之中。'),
  book('recover-weeks', '恢复的星期', '周遥', '健康科学', 2, 'reserve', '保护区当代', ['恢复', '计划弹性'], '留下空档，本身就是训练的一部分。'),
  book('local-table', '地方餐桌', '厨师公会', '健康科学', 1, 'reserve', '保护区当代', ['饮食', '地方物产'], '榛木镇一周的味道，可以写成营养以外的知识。'),
  book('breath-path', '呼吸与步道', '慢跑队匿名', '健康科学', 1, 'reserve', '保护区当代', ['有氧', '社区'], '桥边等人，也是一种心率。'),
  book('long-health', '漫长生命的医学笔记', '镇医院', '健康科学', 3, 'reserve', '保护区当代', ['长期健康', '慢性节律'], '衰老很慢时，照料也必须换一种耐心。'),
  book('tian-gong', '天工开物', '宋应星', '工程', 3, 'reality', '17 世纪', ['工艺', '物产'], '从稻谷到纸张，世界是被做出来的。'),
  book('mengxi', '梦溪笔谈', '沈括', '工程', 3, 'reality', '11 世纪', ['观察', '技术笔记'], '笔记可以同时装下磁针、陨石和笑话。'),
  book('tools-repair', '工具与修理', '庄园手册', '工程', 1, 'reserve', '保护区当代', ['修理', '材料'], '先学会让东西再工作一次。'),
  book('small-energy', '小屋能源', '工学院讲义', '工程', 2, 'reserve', '保护区当代', ['能源', '居住'], '白榛小屋如何在冬天保持一种温和。'),
  book('mapping-valley', '河谷测量', '连舟', '工程', 2, 'reserve', '保护区当代', ['测量', '地图'], '把脚步换成可以交给后来者的线条。'),
  book('water-wheel', '水轮笔记', '旧磨坊档案', '工程', 2, 'reserve', '保护区当代', ['机械', '水力'], '一条河也可以是一台安静的机器。'),
  book('clock-care', '钟表保养', '管理局后勤', '工程', 2, 'reserve', '保护区当代', ['计时', '维护'], '时间装置本身也需要被按时对待。'),
  book('paper-lab', '纸上实验室', '星穹学院', '工程', 3, 'reserve', '保护区当代', ['实验设计', '可重复'], '在动手之前，先把步骤写到别人能复核。'),
  book('tennis-basics', '网球技术基础', '体育学院教研室', '健康科学', 2, 'reserve', '保护区当代', ['握拍', '发球', '底线击球'], '从站位、挥拍到一场完整对打的基础教材。'),
  book('swim-technique', '四种泳姿', '镇立游泳馆', '健康科学', 2, 'reserve', '保护区当代', ['换气', '划水', '转身'], '用分解动作说明蛙泳、自由泳、仰泳与蝶泳。'),
  book('running-form', '跑步动作与训练量', '运动医学组', '健康科学', 2, 'reality', '21 世纪', ['步频', '配速', '训练负荷'], '解释跑姿、训练量和恢复之间的直接关系。'),
  book('strength-basics', '基础力量训练', '体育学院教研室', '健康科学', 2, 'reserve', '保护区当代', ['深蹲', '推举', '训练计划'], '主要动作、负荷安排和安全标准。'),
  book('piano-practice', '钢琴基础练习', '音乐教研室', '艺术与设计', 2, 'reserve', '保护区当代', ['读谱', '指法', '踏板'], '从识谱到完整演奏短曲的练习册。'),
  book('keyboard-harmony', '键盘和声入门', '音乐教研室', '艺术与设计', 3, 'reserve', '保护区当代', ['和弦', '和声进行'], '在键盘上学习和弦连接与基础伴奏。'),
  book('drawing-basics', '素描基础', '美术学院', '艺术与设计', 2, 'reserve', '保护区当代', ['比例', '明暗', '透视'], '静物和石膏写生使用的基础训练手册。'),
  book('pottery-basics', '陶艺成形与烧制', '镇立工坊', '艺术与设计', 2, 'reserve', '保护区当代', ['拉坯', '釉料', '烧制'], '从泥料准备到烧成记录的完整步骤。'),
  book('home-cooking', '家庭烹饪基础', '厨师公会', '健康科学', 1, 'reserve', '保护区当代', ['刀工', '火候', '备餐'], '按照一人到多人份量讲解日常备餐。'),
];

export const bookById = Object.fromEntries(books.map(item => [item.id, item])) as Record<string, BookDefinition>;

export function getBook(id: string) {
  return bookById[id];
}

export function bookMeta(book: BookDefinition) {
  return `${book.category} · 难度 ${book.difficulty}`;
}

export function readingSlotGain(difficulty: number, readingBonus = 0) {
  return (4 + readingBonus) * (2 / Math.max(1, difficulty));
}

export function maxMappedProgress(map: Record<string, number>) {
  const values = Object.values(map);
  return values.length ? Math.max(0, ...values) : 0;
}

export function finishedIds(map: Record<string, number>) {
  return Object.entries(map).filter(([, value]) => value >= 100).map(([id]) => id);
}

export function readableBorrowed(borrowed: string[], map: Record<string, number>) {
  return borrowed.filter(id => (map[id] ?? 0) < 100);
}

export function booksStarted(map: Record<string, number>) {
  return Object.entries(map).filter(([, value]) => value > 0).length;
}
