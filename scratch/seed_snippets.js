const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// We use the database that is active as logged
const dbPath = '/Users/bittersweet/Downloads/小蓝牙/dental.db';

console.log('Connecting to database:', dbPath);
if (!fs.existsSync(dbPath)) {
  console.error('Database file does not exist at ' + dbPath);
  process.exit(1);
}

const db = new Database(dbPath);

const templates = [
  // ==================== 牙龈炎 (Gingivitis) - 4 groups ====================
  // Group 1: 慢性边缘性龈炎
  { disease: '牙龈炎', category: '主诉', trigger: '/yuy_zs1', content: '刷牙时牙龈出血3个月。' },
  { disease: '牙龈炎', category: '现病史', trigger: '/yuy_xbs1', content: '患者近3个月来刷牙时经常有牙龈出血，伴口臭，无自发痛，无咬合痛，自述未曾接受过系统性牙周洁治。' },
  { disease: '牙龈炎', category: '专科检查', trigger: '/yuy_jc1', content: '全口牙龈边缘充血水肿，呈暗红色，乳头圆钝，质地松软，探诊出血明显（BI=3），龈石及菌斑堆积严重，龈沟深度<3mm，无附着丧失，牙齿无松动。' },
  { disease: '牙龈炎', category: '诊断', trigger: '/yuy_zd1', content: '全口慢性边缘性龈炎' },
  { disease: '牙龈炎', category: '处置', trigger: '/yuy_cz1', content: '1. 全口超声波洁治术（洗牙）及抛光；\n2. 局部使用3%双氧水及生理盐水交替冲洗，涂碘甘油；\n3. 进行口腔卫生宣教，指导巴氏刷牙法及牙线的使用。' },

  // Group 2: 青春期牙龈炎
  { disease: '牙龈炎', category: '主诉', trigger: '/yuy_zs2', content: '前牙牙龈红肿、出血6个月。' },
  { disease: '牙龈炎', category: '现病史', trigger: '/yuy_xbs2', content: '患者半年来发现前牙区牙龈逐渐红肿，刷牙或咬硬物时极易出血，无自发痛。患者目前处于青春发育期。' },
  { disease: '牙龈炎', category: '专科检查', trigger: '/yuy_jc2', content: '前牙区龈上牙石(+)，大量菌斑堆积。牙龈乳头呈球状增生明显，覆盖部分牙面，色鲜红且质地松软，探诊极易出血（BI=4），未见真性牙周袋，X线片示未见牙槽骨吸收。' },
  { disease: '牙龈炎', category: '诊断', trigger: '/yuy_zd2', content: '青春期牙龈炎' },
  { disease: '牙龈炎', category: '处置', trigger: '/yuy_cz2', content: '1. 全口超声洁治治疗，彻底清除前牙菌斑与结石；\n2. 龈沟局部冲洗上药（碘甘油）；\n3. 强调自我菌斑控制，指导其加强口腔卫生维护，定期复查。' },

  // Group 3: 妊娠期牙龈炎
  { disease: '牙龈炎', category: '主诉', trigger: '/yuy_zs3', content: '孕5月，右上前牙牙龈肿物伴出血2周。' },
  { disease: '牙龈炎', category: '现病史', trigger: '/yuy_xbs3', content: '患者目前妊娠5个月。2周前无明显诱因出现右上前牙龈乳头肿大，刷牙时极易出血，不伴明显自发痛。' },
  { disease: '牙龈炎', category: '专科检查', trigger: '/yuy_jc3', content: '12、13间牙龈乳头呈瘤样增生，大小约1.0cm*0.8cm，色暗红，表面光滑，质地松软，有蒂，探诊极易出血，未累及牙槽骨，全口轻度结石(+)。' },
  { disease: '牙龈炎', category: '诊断', trigger: '/yuy_zd3', content: '妊娠期牙龈炎（妊娠期龈瘤）' },
  { disease: '牙龈炎', category: '处置', trigger: '/yuy_cz3', content: '1. 口腔卫生指导，超声洁治治疗（操作需轻柔）；\n2. 局部使用生理盐水冲洗，上药；\n3. 嘱患者控制饮食与口腔卫生，定期复查，待分娩后再评估是否行手术切除。' },

  // Group 4: 药物性牙龈增生
  { disease: '牙龈炎', category: '主诉', trigger: '/yuy_zs4', content: '全口牙龈渐进性肿大1年。' },
  { disease: '牙龈炎', category: '现病史', trigger: '/yuy_xbs4', content: '患者高血压病史3年，长期服用硝苯地平。1年前出现全口牙龈慢慢肿大，严重影响美观及咀嚼，刷牙出血。' },
  { disease: '牙龈炎', category: '专科检查', trigger: '/yuy_jc4', content: '全口牙龈乳头及边缘龈呈结节状、桑葚状增生，质地坚韧，呈淡粉红色，覆盖牙冠1/3至1/2，探诊出血(+)，前牙区伴有散在牙齿移位。' },
  { disease: '牙龈炎', category: '诊断', trigger: '/yuy_zd4', content: '药物性牙龈增生' },
  { disease: '牙龈炎', category: '处置', trigger: '/yuy_cz4', content: '1. 建议内科医师协助更换降压药物；\n2. 行全口牙周系统基础治疗（超声洁治、龈下刮治）；\n3. 局部冲洗上药，若基础治疗后增生未全退，考虑行牙龈切除及成形术。' },

  // ==================== 牙周炎 (Periodontitis) - 4 groups ====================
  // Group 1: 轻度慢性牙周炎
  { disease: '牙周炎', category: '主诉', trigger: '/yzy_zs1', content: '刷牙牙龈出血伴口臭半年。' },
  { disease: '牙周炎', category: '现病史', trigger: '/yzy_xbs1', content: '患者近半年来刷牙频繁牙龈出血，伴口臭，无明显牙齿松动及咬合无力史。' },
  { disease: '牙周炎', category: '专科检查', trigger: '/yzy_jc1', content: '口腔卫生差，龈上牙石(++)，龈下结石(+)。牙龈红肿退缩，探诊出血明显。全口探诊深度（PD）3-4mm，伴轻度附着丧失。X线片示牙槽骨水平吸收达根长1/3以内。牙齿无松动。' },
  { disease: '牙周炎', category: '诊断', trigger: '/yzy_zd1', content: '慢性牙周炎（轻度）' },
  { disease: '牙周炎', category: '处置', trigger: '/yzy_cz1', content: '1. 牙周基础治疗：行全口超声波洁治术，局部上药；\n2. 安排龈下刮治与根面平整术（SRP）；\n3. 口腔卫生宣教，指导巴氏刷牙与间隙刷的使用。' },

  // Group 2: 中度慢性牙周炎
  { disease: '牙周炎', category: '主诉', trigger: '/yzy_zs2', content: '全口牙齿酸软、咀嚼无力伴牙龈出血2年。' },
  { disease: '牙周炎', category: '现病史', trigger: '/yzy_xbs2', content: '患者近2年来全口牙齿常感酸软、咬物无力，牙龈反复出血，时有肿胀痛，伴口臭，出现下前牙缝隙变大。' },
  { disease: '牙周炎', category: '专科检查', trigger: '/yzy_jc2', content: '牙石(+++)，牙龈红肿退缩，牙根外露。探诊出血(BI=3)，探诊深度（PD）4-6mm，附着丧失明显。部分牙齿呈I-II度松动。X线示全口牙槽骨水平型及角形吸收达根长1/3至1/2。' },
  { disease: '牙周炎', category: '诊断', trigger: '/yzy_zd2', content: '慢性牙周炎（中度）' },
  { disease: '牙周炎', category: '处置', trigger: '/yzy_cz2', content: '1. 全口超声洁治与分区龈下刮治、根面平整术；\n2. 局部牙周袋冲洗，局部上派丽奥或碘甘油；\n3. 调𬌗消除创伤，必要时行松动牙结扎固定；\n4. 宣教口腔卫生，3个月后复查。' },

  // Group 3: 重度慢性牙周炎
  { disease: '牙周炎', category: '主诉', trigger: '/yzy_zs3', content: '多个牙齿松动、反复肿痛溢脓1年。' },
  { disease: '牙周炎', category: '现病史', trigger: '/yzy_xbs3', content: '患者1年来多颗牙齿松动明显，咬物疼痛无力，牙龈反复肿痛，有自发溢脓及口臭，严重影响进食。' },
  { disease: '牙周炎', category: '专科检查', trigger: '/yzy_jc3', content: '口腔卫生极差，大量结石软垢。牙龈高度退缩，红肿明显，轻压有脓液自牙周袋溢出。探诊深度PD>6mm。31、32、41、42呈II-III度松动。X线示牙槽骨吸收已达根长1/2以上，部分患牙已达根尖区。' },
  { disease: '牙周炎', category: '诊断', trigger: '/yzy_zd3', content: '慢性牙周炎（重度）' },
  { disease: '牙周炎', category: '处置', trigger: '/yzy_cz3', content: '1. 牙周基础治疗，拔除无法保留的极度松动患牙；\n2. 分区进行彻底的龈下刮治与根面平整治疗，派丽奥局部上药；\n3. 局部抗生素辅助治疗；\n4. 评估牙周手术及后续拔牙后义齿修复计划。' },

  // Group 4: 侵袭性牙周炎
  { disease: '牙周炎', category: '主诉', trigger: '/yzy_zs4', content: '年轻患者，前牙松动、移位1年。' },
  { disease: '牙周炎', category: '现病史', trigger: '/yzy_xbs4', content: '患者25岁，1年前无明显诱因出现上前牙松动并向外扇形移位，伴咬物无力，进展迅速。' },
  { disease: '牙周炎', category: '专科检查', trigger: '/yzy_jc4', content: '口腔局部菌斑、牙石较少，与严重的牙周破坏不相称。11、21、36、46探诊深度深达6-8mm，伴大量附着丧失。11、21呈II度松动且唇侧移位。X线示第一磨牙呈典型弧形骨吸收，切牙区对称性骨吸收达根长1/2以上。' },
  { disease: '牙周炎', category: '诊断', trigger: '/yzy_zd4', content: '侵袭性牙周炎' },
  { disease: '牙周炎', category: '处置', trigger: '/yzy_cz4', content: '1. 彻底进行洁治、龈下刮治及根面平整治疗；\n2. 联合使用全身抗生素（阿莫西林+甲硝唑胶囊，服用1周）；\n3. 局部牙周袋上药（派丽奥）；\n4. 严格复查与牙周手术治理，防止病变进一步恶化。' },

  // ==================== 慢性牙髓炎 (Chronic Pulpitis) - 4 groups ====================
  // Group 1: 慢性闭锁性牙髓炎
  { disease: '慢性牙髓炎', category: '主诉', trigger: '/mxysy_zs1', content: '左下后牙遇冷热刺激痛1个月。' },
  { disease: '慢性牙髓炎', category: '现病史', trigger: '/mxysy_xbs1', content: '患者近一个月来左下后牙吃冷热食物时出现酸痛不适，去除刺激后疼痛仍持续数十秒，无明显剧烈自发痛史。' },
  { disease: '慢性牙髓炎', category: '专科检查', trigger: '/mxysy_jc1', content: '36牙合面深龋洞，探软，探诊敏感，未见穿髓孔，冷测引发疼痛且有持续，叩诊(±)，牙龈无异常。' },
  { disease: '慢性牙髓炎', category: '诊断', trigger: '/mxysy_zd1', content: '36慢性闭锁性牙髓炎' },
  { disease: '慢性牙髓炎', category: '处置', trigger: '/mxysy_cz1', content: '36拟行根管治疗术（RCT）：\n1. 局麻下开髓，去腐，拔髓，测量根管长度，机扩备管，次氯酸钠冲洗；\n2. 根管内封氢氧化钙糊剂，暂封；\n3. 嘱患者如有不适及时就诊，1周后复诊。' },

  // Group 2: 慢性溃疡性牙髓炎
  { disease: '慢性牙髓炎', category: '主诉', trigger: '/mxysy_zs2', content: '右下后牙吃东西塞牙剧痛3周。' },
  { disease: '慢性牙髓炎', category: '现病史', trigger: '/mxysy_xbs2', content: '患者3周来右下后牙吃硬物塞入洞内时常引起剧烈刺痛，需剔除食物后疼痛才逐渐缓解，无剧烈夜间痛史。' },
  { disease: '慢性牙髓炎', category: '专科检查', trigger: '/mxysy_jc2', content: '46远中邻面深龋，洞内积存食物残渣，去腐后见有穿髓孔，探痛(++)，有暗红色血液渗出。冷测敏感，叩诊(+)，牙龈未见异常。' },
  { disease: '慢性牙髓炎', category: '诊断', trigger: '/mxysy_zd2', content: '46慢性溃疡性牙髓炎' },
  { disease: '慢性牙髓炎', category: '处置', trigger: '/mxysy_cz2', content: '46拟行根管治疗（RCT）：\n1. 局麻下开髓，拔除牙髓，根管预备，冲洗，吸干；\n2. 根管内封氢氧化钙，暂封；\n3. 交代医嘱，预约复诊。' },

  // Group 3: 慢性增生性牙髓炎
  { disease: '慢性牙髓炎', category: '主诉', trigger: '/mxysy_zs3', content: '左下后牙发现红色肿物2个月。' },
  { disease: '慢性牙髓炎', category: '现病史', trigger: '/mxysy_xbs3', content: '青少年患者。2个月前左下后牙因龋坏折断，后洞内长出红色肉芽样肿物，吃东西时易出血并有钝痛。' },
  { disease: '慢性牙髓炎', category: '专科检查', trigger: '/mxysy_jc3', content: '36牙合面大面积缺损，髓腔暴露，内见一粉红色肉芽组织（牙髓息肉）填满，探诊质地较软，易出血，无剧烈探痛。叩诊(+)，牙周袋不深，X线示根尖周无明显异常。' },
  { disease: '慢性牙髓炎', category: '诊断', trigger: '/mxysy_zd3', content: '36慢性增生性牙髓炎' },
  { disease: '慢性牙髓炎', category: '处置', trigger: '/mxysy_cz3', content: '36拟行根管治疗：\n1. 局麻下切除髓腔内牙髓息肉，充分止血；\n2. 拔除根髓，机扩预备根管，消毒冲洗；\n3. 根管内封氢氧化钙，暂封；\n4. 交代后续复诊RCT及行冠修复。' },

  // Group 4: 慢性逆行性牙髓炎
  { disease: '慢性牙髓炎', category: '主诉', trigger: '/mxysy_zs4', content: '右下后牙隐痛、咬合无力2周，冷热刺激痛明显。' },
  { disease: '慢性牙髓炎', category: '现病史', trigger: '/mxysy_xbs4', content: '患者有长期严重牙周炎病史。2周前出现右下后牙隐隐酸痛，吃冷热物痛，咬物无力，无明显龋坏史。' },
  { disease: '慢性牙髓炎', category: '专科检查', trigger: '/mxysy_jc4', content: '46未见明显牙体龋坏及裂纹。颊侧牙龈高度退缩，牙周袋极深（PD=8mm）达根尖，牙齿I度松动。冷热测引起持续酸痛，叩痛(+)。X线示牙槽骨吸收达根尖区，根分叉病变。' },
  { disease: '慢性牙髓炎', category: '诊断', trigger: '/mxysy_zd4', content: '46逆行性牙髓炎' },
  { disease: '慢性牙髓炎', category: '处置', trigger: '/mxysy_cz4', content: '46行牙周-牙髓联合治疗：\n1. 局麻下行46根管治疗（开髓，拔髓，根管备管封药暂封）；\n2. 进行彻底的牙周冲洗、龈下刮治与根面平整治疗；\n3. 视预后评估患牙保留价值。' },

  // ==================== 急性牙髓炎 (Acute Pulpitis) - 4 groups ====================
  // Group 1: 典型急性牙髓炎
  { disease: '急性牙髓炎', category: '主诉', trigger: '/jxysy_zs1', content: '右下后牙剧烈自发痛2天，夜间加重。' },
  { disease: '急性牙髓炎', category: '现病史', trigger: '/jxysy_xbs1', content: '患者2天前无诱因出现右下后牙剧烈疼痛，为自发性、阵发性痛，呈放射状，不能定位，昨晚夜间痛明显，无法入睡。冷水可暂时缓解疼痛。' },
  { disease: '急性牙髓炎', category: '专科检查', trigger: '/jxysy_jc1', content: '46牙合面深龋洞，探痛(++)，探达穿髓点。热测引起剧烈持续疼痛，冷测可暂时缓解。叩痛(±)，牙龈无异常。' },
  { disease: '急性牙髓炎', category: '诊断', trigger: '/jxysy_zd1', content: '46急性牙髓炎' },
  { disease: '急性牙髓炎', category: '处置', trigger: '/jxysy_cz1', content: '46急行开髓引流术以缓解剧痛：\n1. 局麻下行46开髓，见暗红色血液溢出，剧痛立减。拔除髓腔牙髓，温盐水冲洗；\n2. 髓腔内放置樟脑酚棉球，暂封封口；\n3. 嘱患者如封药后剧痛及时复诊，常规1周后复诊行根管治疗。' },

  // Group 2: 慢性牙髓炎急性发作
  { disease: '急性牙髓炎', category: '主诉', trigger: '/jxysy_zs2', content: '左下后牙反复隐痛，昨起突发自发性剧痛。' },
  { disease: '急性牙髓炎', category: '现病史', trigger: '/jxysy_xbs2', content: '患者自述左下后牙有数月冷热敏感及隐痛史。昨日起无诱因突发阵发性剧痛，夜间痛醒，放射至同侧颞部。' },
  { disease: '急性牙髓炎', category: '专科检查', trigger: '/jxysy_jc2', content: '36邻面深龋，去腐后探针穿髓，探痛(+++)，冷测引发剧烈痛且持续，叩痛(+)，牙周检查无异常。' },
  { disease: '急性牙髓炎', category: '诊断', trigger: '/jxysy_zd2', content: '36慢性牙髓炎急性发作' },
  { disease: '急性牙髓炎', category: '处置', trigger: '/jxysy_cz2', content: '36急诊处理：\n1. 局麻下行36开髓减压，去除坏死牙髓，拔髓，疏通根管；\n2. 根管内置无菌棉球，暂封引流；\n3. 开具口服止痛药，预约1周后行RCT治疗。' },

  // Group 3: 牙外伤引起的急性牙髓炎
  { disease: '急性牙髓炎', category: '主诉', trigger: '/jxysy_zs3', content: '上前牙摔断伴冷热剧烈痛1天。' },
  { disease: '急性牙髓炎', category: '现病史', trigger: '/jxysy_xbs3', content: '患者1天前摔倒致上前牙折断，现折断牙冷热刺激时疼痛极度剧烈，有阵发性自发痛。' },
  { disease: '急性牙髓炎', category: '专科检查', trigger: '/jxysy_jc3', content: '11切1/3斜折，断端可见鲜红色针尖大小露髓孔，探痛(+++)，叩痛(+)，无明显松动。X线示未见牙根折断，根尖周无异常。' },
  { disease: '急性牙髓炎', category: '诊断', trigger: '/jxysy_zd3', content: '11牙冠折断伴急性牙髓炎' },
  { disease: '急性牙髓炎', category: '处置', trigger: '/jxysy_cz3', content: '11急诊处理：\n1. 局麻下行11开髓拔髓术，生理盐水冲洗，备管封药；\n2. 髓腔封氢氧化钙暂封；\n3. 交代医嘱，后期行RCT及纤维桩+全冠美学修复。' },

  // Group 4: 隐裂引起的急性牙髓炎
  { disease: '急性牙髓炎', category: '主诉', trigger: '/jxysy_zs4', content: '左上后牙咬物剧痛伴自发跳痛2天。' },
  { disease: '急性牙髓炎', category: '现病史', trigger: '/jxysy_xbs4', content: '患者2天前咬硬物时左上后牙剧烈刺痛，随后出现自发痛、夜间跳痛，无法咬合。' },
  { disease: '急性牙髓炎', category: '专科检查', trigger: '/jxysy_jc4', content: '26牙合面可见细深隐裂纹横贯近远中发育沟，碘酊染色可见深染裂纹。探针沿裂纹处有深感觉。冷测敏感引发持续痛，叩痛(++)。' },
  { disease: '急性牙髓炎', category: '诊断', trigger: '/jxysy_zd4', content: '26牙隐裂伴急性牙髓炎' },
  { disease: '急性牙髓炎', category: '处置', trigger: '/jxysy_cz4', content: '26治疗计划：\n1. 局麻下磨除咬合，行带环固定（防止劈裂）并开髓减压拔髓；\n2. 根管封药氢氧化钙暂封；\n3. 交代医嘱，复诊行完整RCT及全冠修复以保护患牙。' },

  // ==================== 慢性根尖炎 (Chronic Apical Periodontitis) - 4 groups ====================
  // Group 1: 慢性根尖肉芽肿
  { disease: '慢性根尖炎', category: '主诉', trigger: '/mxgjy_zs1', content: '左下后牙无咬合力、常隐痛半年。' },
  { disease: '慢性根尖炎', category: '现病史', trigger: '/mxgjy_xbs1', content: '患者左下后牙半年前曾有剧烈疼痛史，后未作治疗隐痛渐止。近半年来患牙咬物无力，时有胀闷感。' },
  { disease: '慢性根尖炎', category: '专科检查', trigger: '/mxgjy_jc1', content: '36大面积龋坏，去腐后露髓，牙髓无活力，叩痛(±)，无松动。X线片示36根尖周可见一圆形低密度透射影，边界清晰，直径约0.3cm。' },
  { disease: '慢性根尖炎', category: '诊断', trigger: '/mxgjy_zd1', content: '36慢性根尖周炎（根尖肉芽肿）' },
  { disease: '慢性根尖炎', category: '处置', trigger: '/mxgjy_cz1', content: '36行根管治疗：\n1. 开髓去腐，疏通根管，测长，机械预备根管，3%双氧水及生理盐水冲洗；\n2. 根管内封氢氧化钙暂封消毒；\n3. 1周后无症状行根管充填术。' },

  // Group 2: 慢性根尖脓肿/窦道型
  { disease: '慢性根尖炎', category: '主诉', trigger: '/mxgjy_zs2', content: '右下后牙牙龈反复起脓包3个月。' },
  { disease: '慢性根尖炎', category: '现病史', trigger: '/mxgjy_xbs2', content: '患者3个月来右下后牙牙龈反复长出小包，穿破排脓后可缓解。患牙长期无牙髓活力，有咬合不适。' },
  { disease: '慢性根尖炎', category: '专科检查', trigger: '/mxgjy_jc2', content: '46牙合面大面积银汞充填物部分脱落，继发深龋。牙髓活力测试无反应。46颊侧根尖区粘膜可见窦道开口，轻压有少量脓液溢出。叩痛(+)。X线示根尖周可见边界模糊的低密度透影区。' },
  { disease: '慢性根尖炎', category: '诊断', trigger: '/mxgjy_zd2', content: '46慢性根尖周脓肿（窦道型）' },
  { disease: '慢性根尖炎', category: '处置', trigger: '/mxgjy_cz2', content: '46行根管治疗：\n1. 去除充填物及腐质，开髓通根，清除坏死物质，大量次氯酸钠冲洗；\n2. 根管内封氢氧化钙，对窦道行冲洗并上碘甘油；\n3. 交代医嘱，定期复诊，待窦道闭合后行热牙胶根充。' },

  // Group 3: 慢性根尖囊肿
  { disease: '慢性根尖炎', category: '主诉', trigger: '/mxgjy_zs3', content: '上前牙牙冠变色伴咬合酸胀1年。' },
  { disease: '慢性根尖炎', category: '现病史', trigger: '/mxgjy_xbs3', content: '患者1年前上前牙曾受外伤，后发现牙齿逐渐变黑，咬物时偶有酸胀不适，自述未予治疗。' },
  { disease: '慢性根尖炎', category: '专科检查', trigger: '/mxgjy_jc3', content: '11牙冠呈灰黑色变色，无明显龋坏，牙髓活力电测无反应，叩痛(±)，无明显松动。X线片示11根尖区可见一圆形巨大低密度区，边界极其清晰且可见一圈白色阻射阻边界环线。' },
  { disease: '慢性根尖炎', category: '诊断', trigger: '/mxgjy_zd3', content: '11慢性根尖周炎（根尖囊肿）' },
  { disease: '慢性根尖炎', category: '处置', trigger: '/mxgjy_cz3', content: '11治疗方案：\n1. 行11根管治疗术，彻底根管预备并封药（氢氧化钙）；\n2. 密切观察，封药后行根充；\n3. 若后期囊肿不退缩，可行根尖刮治及根尖切除术；\n4. 择期行牙齿美白及贴面或冠修复。' },

  // Group 4: 慢性致密性骨炎
  { disease: '慢性根尖炎', category: '主诉', trigger: '/mxgjy_zs4', content: '右下后牙常年钝痛，咬物偶有不适。' },
  { disease: '慢性根尖炎', category: '现病史', trigger: '/mxgjy_xbs4', content: '患者右下后牙长期大面积坏死，经常隐隐钝痛，曾有肿胀史，但无剧烈疼痛，咬物偶有不适。' },
  { disease: '慢性根尖炎', category: '专科检查', trigger: '/mxgjy_jc4', content: '46牙冠残冠状态，探无明显活髓，叩痛(±)。X线片示根尖周骨质呈局限性致密阻射影，骨小梁结构消失，与周围骨质界限不清。' },
  { disease: '慢性根尖炎', category: '诊断', trigger: '/mxgjy_zd4', content: '46慢性根尖周炎（致密性骨炎）' },
  { disease: '慢性根尖炎', category: '处置', trigger: '/mxgjy_cz4', content: '46行根管治疗：\n1. 去除腐质，打通髓腔，拔髓备管；\n2. 根管内封入强力氢氧化钙糊剂；\n3. 定期随访，必要时根充后行嵌体或残冠桩冠保护性修复。' },

  // ==================== 阻生齿拔除 (Impacted Tooth Extraction) - 3 groups ====================
  // Group 1: 近中阻生智齿
  { disease: '阻生齿拔除', category: '主诉', trigger: '/zs拔_zs1', content: '左下后牙反复红肿疼痛3个月。' },
  { disease: '阻生齿拔除', category: '现病史', trigger: '/zs拔_xbs1', content: '患者近3个月来左下后牙区牙龈反复红肿发炎，伴张口受限，吃硬物痛。自述消炎后现要求拔除该牙。' },
  { disease: '阻生齿拔除', category: '专科检查', trigger: '/zs拔_jc1', content: '38部分萌出，近中倾斜阻生，冠周牙龈轻度红肿，探诊敏感，未见明显溢脓。37远中颈部探及食物残渣。X线示38近中倾斜阻生，根尖无弯曲。' },
  { disease: '阻生齿拔除', category: '诊断', trigger: '/zs拔_zd1', content: '38近中阻生智齿伴冠周炎' },
  { disease: '阻生齿拔除', category: '处置', trigger: '/zs拔_cz1', content: '38拔除术：\n1. 签署拔牙知情同意书；\n2. 局麻下行38牙龈切开，超声骨刀或高速手机分牙，顺利拔除38；\n3. 刮治牙槽窝，压迫止血；\n4. 交代术后医嘱（24小时勿刷牙漱口，温凉饮食，不适随诊）。' },

  // Group 2: 水平阻生智齿
  { disease: '阻生齿拔除', category: '主诉', trigger: '/zs拔_zs2', content: '要求拔除右下埋伏智齿。' },
  { disease: '阻生齿拔除', category: '现病史', trigger: '/zs拔_xbs2', content: '患者常规口腔检查发现右下埋伏智齿顶坏前方大牙，无明显疼痛，现要求预防性拔除。' },
  { disease: '阻生齿拔除', category: '专科检查', trigger: '/zs拔_jc2', content: '48未萌出，局部牙龈平整。X线示48完全水平阻生，位置低，近中冠顶触及47远中根颈部，47远中骨质有吸收。48牙根与下颌管贴近。' },
  { disease: '阻生齿拔除', category: '诊断', trigger: '/zs拔_zd2', content: '48水平中位阻生智齿' },
  { disease: '阻生齿拔除', category: '处置', trigger: '/zs拔_cz2', content: '48微创拔除术：\n1. 详述拔牙风险（包括神经损伤可能），签署知情同意书；\n2. 局麻下切开，翻瓣，高速仰角手机去骨、分冠、分根，顺利拔除48；\n3. 清理创口，缝合，压迫止血；\n4. 开具消炎药，交代注意事项。' },

  // Group 3: 垂直/高位阻生智齿
  { disease: '阻生齿拔除', category: '主诉', trigger: '/zs拔_zs3', content: '右上后牙咬颊肉、疼痛1周。' },
  { disease: '阻生齿拔除', category: '现病史', trigger: '/zs拔_xbs3', content: '患者1周来经常咬伤右上后方颊粘膜，伴进食疼痛，现强烈要求拔除引起咬颊的坏牙。' },
  { disease: '阻生齿拔除', category: '专科检查', trigger: '/zs拔_jc3', content: '18完全萌出，高位垂直阻生，无下颌对颌牙，咬合时直接压迫下颌颊粘膜，颊侧粘膜见咬合印痕。X线示18无异常。' },
  { disease: '阻生齿拔除', category: '诊断', trigger: '/zs拔_zd3', content: '18高位垂直阻生智齿（无对颌）' },
  { disease: '阻生齿拔除', category: '处置', trigger: '/zs拔_cz3', content: '18拔除术：\n1. 告知风险，签署同意书；\n2. 局麻下行18一次性挺出，拔除顺利；\n3. 刮匙清理，压迫止血；\n4. 交代术后医嘱。' },

  // ==================== 松动牙拔除 (Loose Tooth Extraction) - 3 groups ====================
  // Group 1: 重度牙周炎松动牙
  { disease: '松动牙拔除', category: '主诉', trigger: '/sd拔_zs1', content: '下前牙松动明显、无法咬硬物3个月。' },
  { disease: '松动牙拔除', category: '现病史', trigger: '/sd拔_xbs1', content: '患者有长期严重牙周炎史。3个月来下前牙松动加剧，咬物酸软，多次发炎肿胀，现要求拔除。' },
  { disease: '松动牙拔除', category: '专科检查', trigger: '/sd拔_jc1', content: '31、41呈III度松动，牙龈高度退缩至根尖1/3，探针探及大量龈下结石，有少许脓液。X线示31、41牙槽骨水平吸收达根尖。' },
  { disease: '松动牙拔除', category: '诊断', trigger: '/sd拔_zd1', content: '31、41重度牙周炎（无法保留患牙）' },
  { disease: '松动牙拔除', category: '处置', trigger: '/sd拔_cz1', content: '31、41拔除术：\n1. 告知术后缺牙修复方案，签署同意书；\n2. 局麻下使用牙钳无痛拔除31、41；\n3. 彻底刮除创口内牙周肉芽组织，压迫止血；\n4. 交代术后医嘱，预约后期活动桥或种植修复。' },

  // Group 2: 外伤松动牙
  { disease: '松动牙拔除', category: '主诉', trigger: '/sd拔_zs2', content: '上前牙摔伤松动2天。' },
  { disease: '松动牙拔除', category: '现病史', trigger: '/sd拔_xbs2', content: '患者2天前因意外撞击致上前牙剧烈疼痛，松动无法咬合。' },
  { disease: '松动牙拔除', category: '专科检查', trigger: '/sd拔_jc2', content: '11唇侧倾斜，III度松动，探痛(++)，叩痛(+++)。X线片显示11根中1/3见清晰骨折横裂线，根尖段牙槽骨未见异常。' },
  { disease: '松动牙拔除', category: '诊断', trigger: '/sd拔_zd2', content: '11根折（松动无法保留）' },
  { disease: '松动牙拔除', category: '处置', trigger: '/sd拔_cz2', content: '11拔除术：\n1. 签署知情同意书；\n2. 局麻下顺利拔除11牙冠段及根部；\n3. 牙槽窝清创，缝合，压迫止血；\n4. 交代注意事项，预约复查并提供即刻临时修复或后期种植设计。' },

  // Group 3: 残根残冠松动
  { disease: '松动牙拔除', category: '主诉', trigger: '/sd拔_zs3', content: '左下后牙坏烂残根，松动疼痛1周。' },
  { disease: '松动牙拔除', category: '现病史', trigger: '/sd拔_xbs3', content: '患者左下后牙因龋坏长期折裂只剩残根，1周前残根发生松动，伴随牙龈红肿隐痛。' },
  { disease: '松动牙拔除', category: '专科检查', trigger: '/sd拔_jc3', content: '36牙冠缺失，呈残根暴露，边缘锐利，残根II-III度松动，探痛(+)，叩痛(+)。X线示36根分叉骨质完全丧失。' },
  { disease: '松动牙拔除', category: '诊断', trigger: '/sd拔_zd3', content: '36松动残根' },
  { disease: '松动牙拔除', category: '处置', trigger: '/sd拔_cz3', content: '36拔除术：\n1. 签署同意书；\n2. 局麻下利用微创拔牙挺挺出并拔除36残根；\n3. 刮除炎性肉芽，压迫止血；\n4. 交代术后宣教。' },

  // ==================== 困难牙拔除 (Difficult Tooth Extraction) - 3 groups ====================
  // Group 1: 死髓牙/脆性大根尖弯曲牙
  { disease: '困难牙拔除', category: '主诉', trigger: '/kn拔_zs1', content: '左下后牙治疗后反复发炎要求拔除。' },
  { disease: '困难牙拔除', category: '现病史', trigger: '/kn拔_xbs1', content: '患者多年前曾做过牙齿根管治疗。近半年来患牙反复肿痛，咬合痛。经外院建议拔除后就诊。' },
  { disease: '困难牙拔除', category: '专科检查', trigger: '/kn拔_jc1', content: '36全冠已脱落，牙体脆性大，叩痛(++)。X线片显示36已行充填，双根，根尖1/3极度弯曲呈钩状，与牙槽骨似有粘连，根尖可见阴影。' },
  { disease: '困难牙拔除', category: '诊断', trigger: '/kn拔_zd1', content: '36死髓牙，根尖重度弯曲' },
  { disease: '困难牙拔除', category: '处置', trigger: '/kn拔_cz1', content: '36困难牙拔除术：\n1. 详述脆性死髓牙及弯曲根易断可能，签署知情同意；\n2. 局麻下行气动手机切冠分根，逐步掏取弯曲断根，避免根尖残留；\n3. 清理创口，缝合，压迫止血；\n4. 交代术后医嘱。' },

  // Group 2: 埋伏多生牙
  { disease: '困难牙拔除', category: '主诉', trigger: '/kn拔_zs2', content: '检查发现上前牙区埋伏牙，要求拔除。' },
  { disease: '困难牙拔除', category: '现病史', trigger: '/kn拔_xbs2', content: '患者常规正畸拍摄CBCT发现上前牙根尖区埋伏有一颗多生牙，无任何自觉症状，现转诊要求拔除。' },
  { disease: '困难牙拔除', category: '专科检查', trigger: '/kn拔_jc2', content: '11、21排列略拥挤。CBCT显示在11、21根尖腭侧有一颗呈倒置状的呈圆锥形埋伏牙，压迫恒牙根。' },
  { disease: '困难牙拔除', category: '诊断', trigger: '/kn拔_zd2', content: '上前牙区埋伏多生牙' },
  { disease: '困难牙拔除', category: '处置', trigger: '/kn拔_cz2', content: '埋伏多生牙微创切除术：\n1. 签署同意书；\n2. 局麻下行腭侧切口，翻起粘膜瓣，利用超声骨刀精准去骨暴露多生牙牙冠，将其分段分冠挺出；\n3. 生理盐水冲洗创口，复位，紧密缝合，腭侧佩戴牙压板；\n4. 交代医嘱，预约拆线。' },

  // Group 3: 磨牙根残留/骨粘连牙
  { disease: '困难牙拔除', category: '主诉', trigger: '/kn拔_zs3', content: '要求拔除右下深重断根。' },
  { disease: '困难牙拔除', category: '现病史', trigger: '/kn拔_xbs3', content: '患者在外院拔牙时发生右下磨牙断根，由于根深未能拔出，现转入我科治疗。' },
  { disease: '困难牙拔除', category: '专科检查', trigger: '/kn拔_jc3', content: '46牙槽窝表面见血凝块，探之髓腔深部有硬组织残根。X线显示46近中根折断在根尖1/3处，与牙槽骨发生粘连（骨粘连）。' },
  { disease: '困难牙拔除', category: '诊断', trigger: '/kn拔_zd3', content: '46残留断根伴骨粘连' },
  { disease: '困难牙拔除', category: '处置', trigger: '/kn拔_cz3', content: '46微创断根取出术：\n1. 详述风险签署同意书；\n2. 局麻下行翻瓣去骨，用断根挺结合根尖钳轻轻掏出，动作轻柔避免推入下颌管；\n3. 清理，缝合，放置胶原蛋白海绵，压迫止血；\n4. 交代术后注意事项。' },

  // ==================== 乳牙拔除 (Deciduous Tooth Extraction) - 3 groups ====================
  // Group 1: 乳牙滞留
  { disease: '乳牙拔除', category: '主诉', trigger: '/ry拔_zs1', content: '儿童牙齿双重排列，要求拔牙。' },
  { disease: '乳牙拔除', category: '现病史', trigger: '/ry拔_xbs1', content: '患儿7岁，家长发现下前牙长出双排牙齿，乳牙未脱落，恒牙在舌侧萌出，现要求拔除乳牙。' },
  { disease: '乳牙拔除', category: '专科检查', trigger: '/ry拔_jc1', content: '71未脱落，I度松动，在其舌侧可见31部分萌出呈双排牙外观，牙龈无红肿。X线示71牙根大部分已吸收。' },
  { disease: '乳牙拔除', category: '诊断', trigger: '/ry拔_zd1', content: '71滞留乳牙' },
  { disease: '乳牙拔除', category: '处置', trigger: '/ry拔_cz1', content: '71滞留乳牙拔除术：\n1. 取得患儿及家属配合，签署同意书；\n2. 表面麻醉（必兰麻局部涂抹）或局部浸润麻醉；\n3. 顺利拔除71滞留乳牙，棉球压迫止血；\n4. 交代家属30分钟吐出棉球，勿舌舔，多吃偏硬富含纤维食物促进牙齿自行排列。' },

  // Group 2: 重度龋坏乳残冠
  { disease: '乳牙拔除', category: '主诉', trigger: '/ry拔_zs2', content: '儿童坏牙反复红肿流脓，要求拔除。' },
  { disease: '乳牙拔除', category: '现病史', trigger: '/ry拔_xbs2', content: '患儿6岁，右上后牙龋坏只剩残冠，近半年来牙龈反复起小脓包，伴隐痛，现要求拔除。' },
  { disease: '乳牙拔除', category: '专科检查', trigger: '/ry拔_jc2', content: '54呈残冠状，牙体松动II度，叩痛(+)，颊侧根尖区粘膜见瘘管口有脓液。X线示54牙根吸收已过半，恒牙胚14位于根下方。' },
  { disease: '乳牙拔除', category: '诊断', trigger: '/ry拔_zd2', content: '54乳残冠伴慢性根尖周炎（无法保留）' },
  { disease: '乳牙拔除', category: '处置', trigger: '/ry拔_cz2', content: '54拔除术：\n1. 签署家属知情同意；\n2. 局麻下顺利拔除54残冠；\n3. 牙槽窝刮除炎性组织，防损伤恒牙胚，压迫止血；\n4. 考虑行间隙保持器修复防止两侧牙移位。' },

  // Group 3: 根尖吸收不全滞留乳牙
  { disease: '乳牙拔除', category: '主诉', trigger: '/ry拔_zs3', content: '儿童新牙露头、旧牙不掉要求拔除。' },
  { disease: '乳牙拔除', category: '现病史', trigger: '/ry拔_xbs3', content: '患儿11岁。右上乳磨牙松动多月但迟迟不掉，下方有新牙顶出，疼痛不适。' },
  { disease: '乳牙拔除', category: '专科检查', trigger: '/ry拔_jc3', content: '64轻度松动，在其分叉下可见新恒磨牙萌出部分。X线示64近中根吸收，远中根及根尖吸收不全，阻碍恒牙正常萌出。' },
  { disease: '乳牙拔除', category: '诊断', trigger: '/ry拔_zd3', content: '64根吸收不全滞留乳牙' },
  { disease: '乳牙拔除', category: '处置', trigger: '/ry拔_cz3', content: '64拔除术：\n1. 签署同意书；\n2. 局麻下一次性挺出并拔除64，避免折断吸收不全之残根；\n3. 压迫止血，交代术后。' },

  // ==================== 深龋 (Deep Caries) - 3 groups ====================
  // Group 1: 冷热敏感深龋
  { disease: '深龋', category: '主诉', trigger: '/sq_zs1', content: '右下后牙吃冷热食物酸痛明显2周。' },
  { disease: '深龋', category: '现病史', trigger: '/sq_xbs1', content: '患者2周来进冷热酸甜刺激物时右下后牙发生剧烈酸痛，刺激去除后痛即消失。无自发跳痛及夜间痛历史。' },
  { disease: '深龋', category: '专科检查', trigger: '/sq_jc1', content: '46牙合面深龋洞，内堆积大量软腐，探诊敏感，未见明显穿髓孔。冷测敏感，刺激去除痛止。叩痛(-)，无松动。' },
  { disease: '深龋', category: '诊断', trigger: '/sq_zd1', content: '46深龋' },
  { disease: '深龋', category: '处置', trigger: '/sq_cz1', content: '46充填术：\n1. 慢速气动手机彻底去净腐质，生理盐水冲洗；\n2. 氢氧化钙加玻璃离子垫底（Lining）；\n3. 采用3M纳米复合树脂分层充填治疗，修整外形，调𬌗，抛光；\n4. 嘱如后期有自发痛随诊（可能需RCT）。' },

  // Group 2: 食物嵌塞痛深龋
  { disease: '深龋', category: '主诉', trigger: '/sq_zs2', content: '左下后牙吃肉时塞牙嵌塞痛1个月。' },
  { disease: '深龋', category: '现病史', trigger: '/sq_xbs2', content: '患者1个月来左下后牙进食塞牙痛，疼痛为塞入食物后的酸胀痛，剔除食物后痛渐消，无明显夜间自发跳痛史。' },
  { disease: '深龋', category: '专科检查', trigger: '/sq_jc2', content: '36邻面有深大龋洞，去腐后大量软化牙本质，探酸软，接近髓腔，无穿髓孔。冷测敏感。叩痛(-)。' },
  { disease: '深龋', category: '诊断', trigger: '/sq_zd2', content: '36远中深龋' },
  { disease: '深龋', category: '处置', trigger: '/sq_cz2', content: '36间接盖髓充填术：\n1. 局麻下去腐干净，生理盐水轻轻清洗；\n2. 髓壁行Dycal（氢氧化钙）间接盖髓，流动玻璃离子垫底保护；\n3. 美学成形树脂充填重建邻接，抛光，调𬌗。' },

  // Group 3: 隐匿性深龋
  { disease: '深龋', category: '主诉', trigger: '/sq_zs3', content: '后牙牙合面黑线，吃冰水酸痛1周。' },
  { disease: '深龋', category: '现病史', trigger: '/sq_xbs3', content: '患者自述后牙表面有一条细黑线多时，近期吃冷饮或冰水时常有短暂酸痛，现前来要求补牙。' },
  { disease: '深龋', category: '专科检查', trigger: '/sq_jc3', content: '36牙合面中近中窝沟色深黑，探有卡针感。X线示牙合面珐琅质下方可见大面积低密度近髓透射区，诊断为隐匿性龋齿。' },
  { disease: '深龋', category: '诊断', trigger: '/sq_zd3', content: '36隐匿性深龋' },
  { disease: '深龋', category: '处置', trigger: '/sq_cz3', content: '36充填术：\n1. 局麻下开扩龋洞，去腐发现底深呈暗褐色，彻底清除软腐；\n2. 氢氧化钙加流动树脂垫底护髓；\n3. 纳米复合树脂充填修整，咬合调整，抛光。' },

  // ==================== 中龋 (Moderate Caries) - 3 groups ====================
  // Group 1: 牙合面中龋
  { disease: '中龋', category: '主诉', trigger: '/zq_zs1', content: '左下后牙吃甜食时轻度发酸疼痛1个月。' },
  { disease: '中龋', category: '现病史', trigger: '/zq_xbs1', content: '患者近1个月来左下后牙吃巧克力或甜食时偶有发酸刺痛感，漱口后症状立刻消失，无自发痛，无冷热痛。' },
  { disease: '中龋', category: '专科检查', trigger: '/zq_jc1', content: '36牙合面见黄褐色龋洞，洞深已达牙本质浅层，探诊(±)有轻微酸软感，冷热刺激无明显痛。叩痛(-)。' },
  { disease: '中龋', category: '诊断', trigger: '/zq_zd1', content: '36中龋' },
  { disease: 'zq_cz1', category: '处置', trigger: '/zq_cz1', content: '36充填治疗：\n1. 去除腐质及色素，制备洞形；\n2. 玻璃离子垫底保护；\n3. 树脂充填，调整咬合，精细抛光。' },

  // Group 2: 邻面中龋
  { disease: '中龋', category: '主诉', trigger: '/zq_zs2', content: '发现上前牙缝变黑、影响美观2周。' },
  { disease: '中龋', category: '现病史', trigger: '/zq_xbs2', content: '患者2周前照镜子发现上前牙缝隙变黑，没有明显的酸痛症状，要求修复改善美观。' },
  { disease: '中龋', category: '专科检查', trigger: '/zq_jc2', content: '11、21邻面呈黄褐色缺损，洞达牙本质浅层，探之稍敏感，冷热测无异常。叩痛(-)，无松动。' },
  { disease: '中龋', category: '诊断', trigger: '/zq_zd2', content: '11、21邻面中龋' },
  { disease: '中龋', category: '处置', trigger: '/zq_cz2', content: '11、21美学树脂充填：\n1. 微创打磨去腐，修整边缘斜面；\n2. 酸蚀，涂布粘接剂；\n3. 用前牙美学树脂精细堆塑充填重建邻面，修整外形，调𬌗抛光。' },

  // Group 3: 颈部中龋
  { disease: '中龋', category: '主诉', trigger: '/zq_zs3', content: '左下后牙牙颈部发黑变烂，有轻微刺激痛。' },
  { disease: '中龋', category: '现病史', trigger: '/zq_xbs3', content: '患者发现左下牙根部靠近牙龈处变黑多时，刷牙或喝温水时偶有轻微敏感。' },
  { disease: '中龋', category: '专科检查', trigger: '/zq_jc3', content: '34、35颊侧颈部可见黄褐色浅缺损，边缘粗糙，探诊稍软，探有轻度酸痛感，未露髓。' },
  { disease: '中龋', category: '诊断', trigger: '/zq_zd3', content: '34、35颈部中龋' },
  { disease: '中龋', category: '处置', trigger: '/zq_cz3', content: '34、35充填术：\n1. 去除颈部腐质及变色软牙本质，酸蚀粘接；\n2. 采用充填树脂修复颈部弧度，精细打磨抛光以免刺激牙龈。' },

  // ==================== 楔状缺损 (Wedge-shaped Defect) - 3 groups ====================
  // Group 1: 敏感型楔状缺损
  { disease: '楔状缺损', category: '主诉', trigger: '/xz_zs1', content: '多个牙齿颈部刷牙时冷水刺痛1个月。' },
  { disease: '楔状缺损', category: '现病史', trigger: '/xz_xbs1', content: '患者近1个月来刷牙或吸冷风时发生明显针刺样酸痛，避开冷水可缓解。长期使用硬毛牙刷及横刷习惯。' },
  { disease: '楔状缺损', category: '专科检查', trigger: '/xz_jc1', content: '14、15、24、25颊侧颈部可见典型V形缺损，表面坚硬光滑，探针触及缺损尖部疼痛明显(++)，未露髓，冷测引发一过性敏痛。' },
  { disease: '楔状缺损', category: '诊断', trigger: '/xz_zd1', content: '14、15、24、25牙体楔状缺损' },
  { disease: '楔状缺损', category: '处置', trigger: '/xz_cz1', content: '多牙楔缺树脂充填：\n1. 轻轻修整缺损边缘，彻底脱敏；\n2. 采用高粘接树脂分层充填恢复牙颈部外形，细致抛光；\n3. 嘱患者更换软毛牙刷，改变刷牙习惯为竖刷法。' },

  // Group 2: 深大楔状缺损
  { disease: '楔状缺损', category: '主诉', trigger: '/xz_zs2', content: '右下后牙根颈部见深深的横槽，偶有酸软。' },
  { disease: '楔状缺损', category: '现病史', trigger: '/xz_xbs2', content: '患者发现右下牙颈部横槽多年，最近咬物时微有酸胀不适，自述极少有剧烈冷热敏感。' },
  { disease: '楔状缺损', category: '专科检查', trigger: '/xz_jc2', content: '44、45颊侧颈部可见极深大的V形缺损，深达牙本质深层，距髓腔极近，探诊稍钝敏，无自发痛叩痛。' },
  { disease: '楔状缺损', category: '诊断', trigger: '/xz_zd2', content: '44、45深大楔状缺损' },
  { disease: '楔状缺损', category: '处置', trigger: '/xz_cz2', content: '44、45护髓充填术：\n1. 彻底清洁缺损表面，无痛下打磨；\n2. Dycal垫底护髓，再用流体玻璃离子保护；\n3. 采用超弹性树脂充填修复，精细打磨抛光，宣教刷牙方法。' },

  // Group 3: 伴发牙髓炎楔状缺损
  { disease: '楔状缺损', category: '主诉', trigger: '/xz_zs3', content: '左下牙颈部洞内自发痛、夜间剧烈跳痛2天。' },
  { disease: '楔状缺损', category: '现病史', trigger: '/xz_xbs3', content: '患者左下后牙有多年颈部横槽。2天前突然出现剧烈自发性跳痛，夜晚加重，冷热水刺激时疼痛剧烈。' },
  { disease: '楔状缺损', category: '专科检查', trigger: '/xz_jc3', content: '34颊侧颈部极深V形缺损，缺损底部已暴露呈深红色针尖大小穿髓孔，探痛(+++)，叩痛(+)。冷热测试引起持续爆痛。' },
  { disease: '楔状缺损', category: '诊断', trigger: '/xz_zd3', content: '34楔状缺损伴急性牙髓炎' },
  { disease: '楔状缺损', category: '处置', trigger: '/xz_cz3', content: '34根管治疗术：\n1. 局麻下急行34开髓，去髓，释放髓腔压力，拔除发炎牙髓，暂封引流；\n2. 常规进行RCT根管备管、封药及热牙胶充填；\n3. 根充完成后行高强度树脂修复颈部并嘱后期行全冠保护。' },

  // ==================== 牙体缺损修复 (Tooth Defect Restoration) - 3 groups ====================
  // Group 1: 根管治疗后全冠修复
  { disease: '牙体缺损修复', category: '主诉', trigger: '/ytxf_zs1', content: '左下后牙做过神经治疗，要求全冠保护修复。' },
  { disease: '牙体缺损修复', category: '现病史', trigger: '/ytxf_xbs1', content: '患者1个月前在本科室完成了左下后牙的彻底根管治疗（RCT）。现无不适症状，为防牙齿劈裂，要求行全冠修复。' },
  { disease: '牙体缺损修复', category: '专科检查', trigger: '/ytxf_jc1', content: '36牙体大部分龋损折裂，呈大面积树脂暂封状态。牙龈健康，叩痛(-)，无松动。X线示根管充填严密，根尖无明显病变。' },
  { disease: '牙体缺损修复', category: '诊断', trigger: '/ytxf_zd1', content: '36根管治疗后牙体大面积缺损' },
  { disease: '牙体缺损修复', category: '处置', trigger: '/ytxf_cz1', content: '36全瓷冠修复术：\n1. 局麻下去除原暂封，制作纤维桩及树脂核固位；\n2. 36进行标准化全瓷冠排龈及牙体预备（磨牙备除量适度）；\n3. 精细硅橡胶取模，制作临时冠保护；\n4. 1周后试戴氧化锆全瓷冠，粘固，调整咬合。' },

  // Group 2: 前牙折断瓷贴面修复
  { disease: '牙体缺损修复', category: '主诉', trigger: '/ytxf_zs2', content: '前牙碰断一部分，要求美观修复。' },
  { disease: '牙体缺损修复', category: '现病史', trigger: '/ytxf_xbs2', content: '患者数月前外伤致上前牙切角碰断缺损，目前无自发痛，冷热无敏感，要求行逼真美学修复。' },
  { disease: '牙体缺损修复', category: '专科检查', trigger: '/ytxf_jc2', content: '11切角折断缺损，未暴露髓腔，探诊(-)，冷热敏感测试正常，叩痛(-)，无松动。X线显示无根折。' },
  { disease: '牙体缺损修复', category: '诊断', trigger: '/ytxf_zd2', content: '11切角牙体缺损（未累及牙髓）' },
  { disease: '牙体缺损修复', category: '处置', trigger: '/ytxf_cz2', content: '11超薄瓷贴面修复：\n1. 制作美学腊型及诊断Mockup设计；\n2. 11颊侧切面行极微创超薄瓷贴面备牙；\n3. 硅橡胶印模，比色，制作临时贴面；\n4. 试戴超薄瓷贴面，使用树脂粘接剂高强度粘结固位，调整咬合，精抛。' },

  // Group 3: 后牙大面积嵌体修复
  { disease: '牙体缺损修复', category: '主诉', trigger: '/ytxf_zs3', content: '右下后牙大面积崩裂，要求修补。' },
  { disease: '牙体缺损修复', category: '现病史', trigger: '/ytxf_xbs3', content: '患者右下大牙多年前曾补牙，近期咬骨头时牙面崩裂一大块，不伴自发剧烈痛，求治。' },
  { disease: '牙体缺损修复', category: '专科检查', trigger: '/ytxf_jc3', content: '46牙合面远中见大面积折裂，部分釉质剥脱，牙髓活力测试正常，无叩痛，无明显松动。' },
  { disease: '牙体缺损修复', category: '诊断', trigger: '/ytxf_zd3', content: '46牙体大面积折裂缺损' },
  { disease: '牙体缺损修复', category: '处置', trigger: '/ytxf_cz3', content: '46全瓷高嵌体修复：\n1. 46去腐干净，行嵌体固位洞型预备，制备阻挡斜面，去倒凹；\n2. 精细取模比色，行高嵌体蜡型，上临时封；\n3. 试戴全瓷高嵌体，进行严格的喷砂粘接处理，多重粘固后精细调整咬合、精抛。' },

  // ==================== 牙列缺损修复 (Dentition Defect Restoration) - 3 groups ====================
  // Group 1: 单颗牙缺失种植修复
  { disease: '牙列缺损修复', category: '主诉', trigger: '/ylxf_zs1', content: '右下后牙拔除3个月，要求种植牙修复。' },
  { disease: '牙列缺损修复', category: '现病史', trigger: '/ylxf_xbs1', content: '患者3个月前在本科室拔除右下磨牙，现伤口已基本长平，咀嚼不便，要求行人工种植牙修复。' },
  { disease: '牙列缺损修复', category: '专科检查', trigger: '/ylxf_jc1', content: '46缺失，间隙无明显缩窄，对颌牙无伸长，邻牙无倾斜，牙槽嵴丰满度良好。X线及CBCT示46区骨密度高，骨量高度及宽度极其充裕，根尖区无残留。' },
  { disease: '牙列缺损修复', category: '诊断', trigger: '/ylxf_zd1', content: '46牙列缺损' },
  { disease: '牙列缺损修复', category: '处置', trigger: '/ylxf_cz1', content: '46一期种植手术计划：\n1. 完善全口常规化验，签署种植手术知情同意书；\n2. 局麻下行46区牙龈切开，级差钻备洞，植入进口种植体一颗，扭矩35N·cm，覆盖螺丝暂封，严密缝合；\n3. 交代术后抗炎止血及饮食护理，嘱1周后拆线，3个月后行二期修复。' },

  // Group 2: 多颗牙缺失固定义齿修复
  { disease: '牙列缺损修复', category: '主诉', trigger: '/ylxf_zs2', content: '缺失一颗门牙，要求镶固定假牙。' },
  { disease: '牙列缺损修复', category: '现病史', trigger: '/ylxf_xbs2', content: '患者半年前外伤缺失上前牙，影响美观及发音，因不能接受种植手术，现要求行固定桥义齿修复。' },
  { disease: '牙列缺损修复', category: '专科检查', trigger: '/ylxf_jc2', content: '11牙缺失，创口长好。邻牙12、21稳固，牙髓活力正常，牙周情况良好，咬合关系正常。' },
  { disease: '牙列缺损修复', category: '诊断', trigger: '/ylxf_zd2', content: '11牙列缺损（固定义齿修复设计）' },
  { disease: '牙列缺损修复', category: '处置', trigger: '/ylxf_cz2', content: '12-21全瓷固定桥修复：\n1. 详述需要磨除邻牙代价，签署知情同意；\n2. 局麻下行12及21基牙标准备冠；\n3. 排龈，高精度硅橡胶取印模，制作临时固定桥保护；\n4. 试戴全瓷三单位固定桥，高度吻合，固位粘接，调整咬合，抛光。' },

  // Group 3: 牙列缺损可摘局部义齿修复
  { disease: '牙列缺损修复', category: '主诉', trigger: '/ylxf_zs3', content: '后牙缺失多颗，要求镶牙以利吃饭。' },
  { disease: '牙列缺损修复', category: '现病史', trigger: '/ylxf_xbs3', content: '患者多颗大牙缺失多年，因经费限制及不愿磨牙，现强烈要求镶全口活动性假牙。' },
  { disease: '牙列缺损修复', category: '专科检查', trigger: '/ylxf_jc3', content: '36、37、46、47缺失多时。余留基牙牙周轻度萎缩，无明显松动，咬合高度正常。牙槽嵴中度吸收。' },
  { disease: '牙列缺损修复', category: '诊断', trigger: '/ylxf_zd3', content: '下颌牙列缺损（游离端缺失）' },
  { disease: '牙列缺损修复', category: '处置', trigger: '/ylxf_cz3', content: '下颌可摘局部义齿（钢托）修复：\n1. 拟定设计方案，基牙制备合支托窝；\n2. 高精度藻酸盐取模，取咬合关系记录；\n3. 送技工制作维他灵（Vitallium）钢托铸造可摘局部义齿；\n4. 义齿试戴，调试支托、卡环，基托边缘修整，确保咬合舒适无压痛。嘱其使用方法。' },

  // ==================== 牙列缺失修复 (Dentition Loss Restoration) - 3 groups ====================
  // Group 1: 全口吸附性义齿
  { disease: '牙列缺失修复', category: '主诉', trigger: '/yqs_zs1', content: '全口没有牙齿，要求镶假牙。' },
  { disease: '牙列缺失修复', category: '现病史', trigger: '/yqs_xbs1', content: '患者全口牙齿由于重度牙周炎于数年前陆续掉光或拔除，现佩戴的普通全口义齿极易脱落，吃饭说笑极其不便，现要求重新镶高吸附性假牙。' },
  { disease: '牙列缺失修复', category: '专科检查', trigger: '/yqs_jc1', content: '全口无牙颌，上颌牙槽嵴中度萎缩，下颌牙槽嵴极度萎缩平整。粘膜较薄，唾液较黏稠。旧义齿边缘封闭极差。' },
  { disease: '牙列缺失修复', category: '诊断', trigger: '/yqs_zd1', content: '上下颌牙列缺失' },
  { disease: '牙列缺失修复', category: '处置', trigger: '/yqs_cz1', content: 'BPS吸附性全口义齿修复治疗：\n1. 全口功能性初印模制取，使用专有系统转移颌位关系记录；\n2. 采用个体托盘制取高精度闭口印模（精确边缘整塑，动态记录粘膜受力）；\n3. 咬合记录，面弓转移，技工排牙；\n4. 蜡型试戴，检查饱满度、前牙线；\n5. 完成BPS吸附义齿戴入，反复磨改高点，确保优异吸附力与稳定度。嘱清洁保养方法。' },

  // Group 2: 全口种植覆盖义齿
  { disease: '牙列缺失修复', category: '主诉', trigger: '/yqs_zs2', content: '全口牙齿拔完多月，要求做种植覆盖假牙。' },
  { disease: '牙列缺失修复', category: '现病史', trigger: '/yqs_xbs2', content: '患者全口牙齿完全缺失。由于牙槽骨萎缩平整无法戴稳传统假牙，要求通过种植体固定。' },
  { disease: '牙列缺失修复', category: '专科检查', trigger: '/yqs_jc2', content: '全口无牙，牙槽嵴明显退缩。CBCT显示下颌前牙区骨高度及宽度均达到种植基础要求。' },
  { disease: '牙列缺失修复', category: '诊断', trigger: '/yqs_zd2', content: '全口牙列缺失（种植覆盖义齿设计）' },
  { disease: '牙列缺失修复', category: '处置', trigger: '/yqs_cz2', content: '下颌植入2-4颗种植体联合覆盖义齿修复：\n1. 局麻下在下颌前牙区行微创种植术，植入2颗或4颗纯钛种植体，愈合基台缝合；\n2. 待3-4个月愈合期过后，一期试戴Locator球帽或杆卡式扣件；\n3. 重制或改制全口基托扣入，使全口义齿紧密卡住种植体，彻底杜绝摇晃与脱落；\n4. 细心调𬌗及随访。' },

  // Group 3: 传统全口义齿
  { disease: '牙列缺失修复', category: '主诉', trigger: '/yqs_zs3', content: '全口无牙牙齿缺失半年，要求镶牙。' },
  { disease: '牙列缺失修复', category: '现病史', trigger: '/yqs_xbs3', content: '患者半年前因龋齿及牙周炎拔光全口残留牙齿，目前咀嚼极度困难，面部塌陷，现前来求治。' },
  { disease: '牙列缺失修复', category: '专科检查', trigger: '/yqs_jc3', content: '全口无牙，牙槽嵴丰满度一般，粘膜厚度适中，未见红肿溃疡，咬合关系基本呈中性。' },
  { disease: '牙列缺失修复', category: '诊断', trigger: '/yqs_zd3', content: '全口牙列缺失（传统全口义齿设计）' },
  { disease: '牙列缺失修复', category: '处置', trigger: '/yqs_cz3', content: '传统全口义齿（胶托/钢托）修复：\n1. 初步藻酸盐制取上下颌无牙印模；\n2. 制作个别托盘精密二次印模，确定颌堤关系与咬合垂直高度；\n3. 排牙试戴，评估美观与发音；\n4. 义齿成品戴入，修整基托缓冲边缘，平衡磨改咬合高点，确保固位稳定。嘱自我护理。' }
];

console.log(`Prepared ${templates.length} templates. Starting DB transaction...`);

try {
  const insertStmt = db.prepare('INSERT INTO snippets (category, trigger, content, disease) VALUES (?, ?, ?, ?)');
  
  const insertMany = db.transaction((data) => {
    let count = 0;
    for (const item of data) {
      // Avoid inserting duplicates if the exact trigger/content already exists
      const exist = db.prepare('SELECT id FROM snippets WHERE trigger = ?').get(item.trigger);
      if (!exist) {
        insertStmt.run(item.category, item.trigger, item.content, item.disease);
        count++;
      } else {
        // Update if already exists to ensure latest content
        db.prepare('UPDATE snippets SET category = ?, content = ?, disease = ? WHERE trigger = ?')
          .run(item.category, item.content, item.disease, item.trigger);
      }
    }
    return count;
  });

  const inserted = insertMany(templates);
  console.log(`DB Transaction complete! Successfully inserted/updated ${templates.length} snippets (Added ${inserted} new snippets).`);
} catch (e) {
  console.error('Error inserting snippets:', e);
} finally {
  db.close();
  console.log('Database connection closed.');
}
