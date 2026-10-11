export const CHARACTERS = [
 {name:'沈砚',title:'账房先生',line:'纸上分毫，心中旧账。',intro:'听雨楼的账房，记性极好，却总避开谈起自己的来历。',color:'#90a99d'},
 {name:'苏棠',title:'游方医者',line:'医得了病，医不了人心。',intro:'应邀留宿的医者。药箱里藏着一份迟迟未交出的诊书。',color:'#aec2b0'},
 {name:'陆昭',title:'护院统领',line:'一扇门，隔着两种忠心。',intro:'陆家最信任的护院。今夜的巡更，似乎与往日不同。',color:'#ae8b79'},
 {name:'柳如烟',title:'戏班青衣',line:'台上唱别离，台下辨真假。',intro:'为夜宴而来的名伶。她熟悉每一道隔墙传来的声音。',color:'#c5b9b0'},
 {name:'裴行',title:'行商',line:'世间的账，总有人要还。',intro:'陆家的生意伙伴。急雨封路，也封住了他最后的退路。',color:'#b3a17f'},
 {name:'谢云舟',title:'掌灯侍女',line:'灯照得到的，她都记得。',intro:'负责添灯与报更的侍女。别人不曾留意的，她看得分明。',color:'#b29a82'},
] as const;
export const LOCATIONS = [
 {id:'study',name:'书房',desc:'墨未干，茶已凉。',mark:'案'},
 {id:'garden',name:'庭院',desc:'雨水洗不净所有痕迹。',mark:'雨'},
 {id:'stage',name:'戏台',desc:'隔墙的声音未必属于来人。',mark:'戏'},
 {id:'hall',name:'前厅',desc:'每一笔出入，皆有记录。',mark:'更'},
] as const;
export const PHASES = ['lobby','reading','investigate','discuss','verdict','ended'] as const;
export type Phase = typeof PHASES[number];
export const PHASE_NAMES:Record<Phase,string>={lobby:'候场',reading:'第一幕 · 各怀心事',investigate:'第二幕 · 雨夜搜证',discuss:'第三幕 · 对证',verdict:'终幕 · 指认',ended:'灯尽 · 真相'};
export const INTRO='雨困江南，六位来客留宿听雨楼。夜宴未散，楼主陆怀舟却死在书房。门没有上锁，窗外留下脚印，隔墙的一声低语，让所有人的时间线都出现了裂缝。天亮之前，找出那个说谎的人。';
export const RULES=[
 '一局固定六个角色，支持1–6位真人；空席可由规则式AI补齐。房主选择角色，其他人也可选择未被占用的角色。',
 '读本：每人只能看到自己的私人剧本。记住行程、秘密与任务。人物可以撒谎，证据原文不能修改。',
 '搜证：共三轮，每轮每人有两次机会，任选地点搜取尚未发现的线索。线索先归自己，可主动公开。与其他玩家公聊或密谈。',
 '对证：每轮只补齐当轮卷宗，不提前公开后续证据。每人提交可修改的暂定推理后，才进入下一轮搜证。第三轮结束才作最终指认。对照时间线，询问角色，解释矛盾。',
 '推进：真人点击“本幕已完成”，全员完成后由房主推进。没有自动倒计时，不会因为没操作就跳过你的回合。',
 '指认：秘密提交嫌疑人、关键证据及理由。所有真人提交后公开真相。答对凶手即破案，凶手的目标是让自己不成为唯一最高票。',
 'AI是预设角色台词与证据规则，不是大模型自由对话；“询问”按钮可获得该角色的陈述。AI只使用自己的台词与已公开线索。',
 '这是原创的一次性谜案。重开可以换角色体验，但真相不会随机改变；已知真相后请勿为未玩过的朋友剧透。',
];

export const INVESTIGATION_ROUNDS = [
 {name:'初勘 · 雨夜遗物',question:'哪些只是动机，哪些能够证明行动？',brief:'先查物件与现场，记录疑点。暂不要把到过现场等同于行凶。'},
 {name:'复勘 · 拼接时辰',question:'谁的时间线存在空白？声音能否证明楼主还活着？',brief:'补查口供与行程。对比第一轮判断，找出还缺少见证的时段。'},
 {name:'终勘 · 交叉印证',question:'哪条证据推翻了口供？能否给出完整作案过程？',brief:'最后核验身份、物证和更簿。解释矛盾后，再作秘密指认。'},
] as const;
