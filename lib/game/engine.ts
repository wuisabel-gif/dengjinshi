import {CHARACTERS, LOCATIONS, PHASE_NAMES, INVESTIGATION_ROUNDS, type Phase} from './public';
import {CLUES, SCRIPTS, SOLUTION, clueRound, CLUE_ART} from './case';
export type Player={id:string;token:string;name:string;role:number;bot:boolean;ready:boolean;done:boolean;found:string[];lastChat:number};
export type Message={id:string;from:string;text:string;to?:string;at:number;system?:boolean};
export type Ballot={suspect:number;evidence:string;reason:string};
export type Room={code:string;host:string;phase:Phase;players:Player[];publicClues:string[];messages:Message[];votes:Record<string,Ballot>;created:number;started:number;revision:number;round:number;deductions:Record<string,Record<number,Ballot>>};
function fail(message:string):never{throw Error(message)}
export function nameOf(value:unknown){return typeof value==='string'&&value.trim()?value.trim().slice(0,18):fail('请先填写你的名字。')}
function msg(r:Room,from:string,text:string,at:number,to?:string,system=false){r.messages.push({id:crypto.randomUUID(),from,text,at,to,system});r.messages=r.messages.slice(-100)}
export function createRoom(code:string,name:string,token:string,now:number):Room{const id=crypto.randomUUID();return {code,host:id,phase:'lobby',players:[{id,token,name,role:0,bot:false,ready:false,done:false,found:[],lastChat:0}],publicClues:[],messages:[],votes:{},created:now,started:0,revision:0,round:1,deductions:{}}}
export function join(r:Room,name:string,token:string){if(r.phase!=='lobby')fail('故事已经开始。请等朋友重开，或创建新房间。');if(r.players.length===6)fail('六个角色已有人扮演。');if(r.players.some(p=>p.name===name))fail('这个名字已经被使用，请换一个。');const p:Player={id:crypto.randomUUID(),token,name,role:CHARACTERS.findIndex((_,i)=>!r.players.some(p=>p.role===i)),bot:false,ready:false,done:false,found:[],lastChat:0};r.players.push(p);return p}
function botVote(r:Room,p:Player):Ballot{
 // Inference uses only public evidence, not other scripts or private findings.
 const scores=CHARACTERS.map(()=>0);for(const id of r.publicClues){const clue=CLUES.find(c=>c.id===id)!;if(clue.supports!==undefined)scores[clue.supports]+=clue.weight??0;}
 if(SCRIPTS[p.role].culprit)scores[p.role]=-1;
 const suspect=scores.indexOf(Math.max(...scores));return {suspect,evidence:r.publicClues.find(id=>CLUES.find(c=>c.id===id)?.supports===suspect)??r.publicClues[0],reason:SCRIPTS[p.role].culprit?'门口痕迹只能证明来过，不能单凭这个定罪。':'我根据已公开的修靴记录、铜扣和更簿判断。'};
}
function roundOf(r:Room){return r.round??(r.phase==='lobby'?1:3)}
function searchesThisRound(r:Room,p:Player){return p.found.filter(id=>clueRound(id)===roundOf(r)).length}
function botStatement(r:Room,p:Player){return roundOf(r)===1?SCRIPTS[p.role].statement:roundOf(r)===2?['我承认早些时候进过书房。请把离开的时刻与核账见证核对。','包扎有旁人见证。请先检验伤，不要凭药箱下结论。','交更的记录也需要核查。来过书房未必就行凶。','我只听见一句话，没有听见回答。请核对声音方向。','我去了庭院。窗外取物与进房是两回事。','我记得交灯的时辰。靴印还需要修靴记录来核对。'][p.role]:SCRIPTS[p.role].reply}
function enter(r:Room,phase:Phase,now:number){r.phase=phase;r.started=now;r.players.forEach(p=>p.done=p.bot);msg(r,'主持',phase==='investigate'||phase==='discuss'?`第${roundOf(r)}轮 · ${phase==='investigate'?'搜证':'推理对证'} · ${INVESTIGATION_ROUNDS[roundOf(r)-1].name}`:PHASE_NAMES[phase],now,undefined,true);
 if(phase==='reading')for(const p of r.players.filter(p=>p.bot))msg(r,p.id,SCRIPTS[p.role].statement,now);
 if(phase==='investigate')for(const p of r.players.filter(p=>p.bot)){for(let n=0;n<2;n++){const available=CLUES.filter(c=>clueRound(c.id)===roundOf(r)&&!r.players.some(x=>x.found.includes(c.id)));const c=available[(p.role+n)%available.length];if(!c)break;p.found.push(c.id);if(!(SCRIPTS[p.role].culprit&&c.supports===p.role))r.publicClues.push(c.id);}msg(r,p.id,botStatement(r,p),now);}
 if(phase==='discuss'){r.publicClues=[...new Set([...r.publicClues,...CLUES.filter(c=>clueRound(c.id)===roundOf(r)).map(c=>c.id)])];msg(r,'主持',`本轮勘验卷宗已补齐。${INVESTIGATION_ROUNDS[roundOf(r)-1].question} 每人记下暂定判断，下一轮可修正。`,now,undefined,true);for(const p of r.players.filter(p=>p.bot))msg(r,p.id,botStatement(r,p),now);}
 if(phase==='verdict')for(const p of r.players.filter(p=>p.bot))r.votes[p.id]=botVote(r,p);
}
export function act(r:Room,id:string,action:string,data:Record<string,unknown>,now:number){r.round??=r.phase==='lobby'?1:3;r.deductions??={};const p=r.players.find(p=>p.id===id)??fail('座位失效，请重新加入。');if(p.bot)fail('AI由服务器控制。');
 const host=()=>{if(r.host!==id)fail('只有房主可以操作。')};const lobby=()=>{if(r.phase!=='lobby')fail('请在候场时操作。')};
 if(action==='role'){lobby();const role=Number(data.role);if(!Number.isInteger(role)||!CHARACTERS[role])fail('请选择有效角色。');if(r.players.some(x=>x.id!==id&&x.role===role))fail('这个角色已被选走。');p.role=role;p.ready=false;}
 else if(action==='bots'){host();lobby();while(r.players.length<6){const role=CHARACTERS.findIndex((_,i)=>!r.players.some(x=>x.role===i));r.players.push({id:crypto.randomUUID(),token:crypto.randomUUID(),name:CHARACTERS[role].name,role,bot:true,ready:true,done:true,found:[],lastChat:0})}}
 else if(action==='remove'){host();lobby();const target=r.players.find(x=>x.id===data.id);if(!target?.bot)fail('只能移除AI。');r.players=r.players.filter(x=>x!==target);}
 else if(action==='ready'){lobby();p.ready=!p.ready;}
 else if(action==='start'){host();lobby();if(r.players.length!==6||r.players.some(x=>!x.ready))fail('需要六个席位，且所有真人准备完成。');enter(r,'reading',now)}
 else if(action==='done'){if(!['reading','investigate','discuss'].includes(r.phase))fail('当前不能结束本幕。');if(r.phase==='investigate'&&searchesThisRound(r,p)<2)fail('请先完成两次搜证，再结束本幕。');if(r.phase==='discuss'&&!r.deductions[p.id]?.[roundOf(r)])fail('请先记录本轮暂定推理。');p.done=!p.done;}
 else if(action==='advance'){host();if(r.players.some(x=>!x.done))fail('还有玩家未完成本幕。');let next:Phase|undefined=r.phase==='reading'?'investigate':r.phase==='investigate'?'discuss':r.phase==='discuss'?'verdict':undefined;if(r.phase==='discuss'&&roundOf(r)<3){r.round=roundOf(r)+1;next='investigate';}if(!next)fail('当前不能推进。');enter(r,next as Phase,now);}
 else if(action==='search'){if(r.phase!=='investigate')fail('只能在搜证幕搜索。');if(searchesThisRound(r,p)>=2)fail('你的两次搜证机会已用完。');if(!LOCATIONS.some(x=>x.id===data.place))fail('请选择地点。');const clue=CLUES.find(c=>clueRound(c.id)===roundOf(r)&&c.place===data.place&&!r.players.some(x=>x.found.includes(c.id)));if(!clue)fail('这个地点已搜尽，请换一处。');p.found.push(clue.id);}
 else if(action==='share'){if(!['investigate','discuss'].includes(r.phase))fail('现在不能公开线索。');const clue=CLUES.find(c=>c.id===data.clue);if(!clue||!p.found.includes(clue.id))fail('这不是你持有的线索。');if(!r.publicClues.includes(clue.id)){r.publicClues.push(clue.id);msg(r,id,`公开线索：${clue.title}`,now)}}
 else if(action==='chat'){if(r.phase==='lobby'||r.phase==='ended')fail('请在故事进行时发言。');const text=typeof data.text==='string'?data.text.trim().slice(0,400):'';if(!text)fail('请填写消息。');if(now-p.lastChat<800)fail('请稍等片刻再发送。');let to:string|undefined;if(data.to){const target=r.players.find(x=>x.id===data.to);if(!target||target.id===id)fail('请选择其他玩家。');to=target.id;}msg(r,id,text,now,to);p.lastChat=now;if(to){const target=r.players.find(x=>x.id===to)!;if(target.bot)msg(r,target.id,botStatement(r,target),now+1,id)}}
 else if(action==='ask'){if(!['investigate','discuss'].includes(r.phase))fail('请在搜证或对证时询问。');const target=r.players.find(x=>x.id===data.id);if(!target?.bot)fail('真人玩家请直接在聊天中询问。');if(now-p.lastChat<800)fail('请稍等片刻。');msg(r,id,`请${CHARACTERS[target.role].name}解释一下今夜的行程。`,now);msg(r,target.id,botStatement(r,target),now+1);p.lastChat=now;}
 else if(action==='deduce'){if(r.phase!=='discuss')fail('请在推理对证时记录判断。');const suspect=Number(data.suspect);const evidence=String(data.evidence??'');const reason=typeof data.reason==='string'?data.reason.trim().slice(0,300):'';if(!Number.isInteger(suspect)||!CHARACTERS[suspect]||!r.publicClues.includes(evidence)||!reason)fail('请选择怀疑角色、公开证据并写下理由。');(r.deductions[id]??={})[roundOf(r)]={suspect,evidence,reason};}
 else if(action==='vote'){if(r.phase!=='verdict')fail('尚未到指认阶段。');if(r.votes[id])fail('指认已封存，无法修改。');const suspect=Number(data.suspect);if(!Number.isInteger(suspect)||!CHARACTERS[suspect])fail('请选择嫌疑人。');const evidence=String(data.evidence??'');if(!r.publicClues.includes(evidence))fail('请选择一条已公开证据。');const reason=typeof data.reason==='string'?data.reason.trim().slice(0,300):'';if(!reason)fail('请写下你的判断理由。');r.votes[id]={suspect,evidence,reason};if(r.players.every(x=>r.votes[x.id]))enter(r,'ended',now);}
 else if(action==='rematch'){host();if(r.phase!=='ended')fail('结束后才能重开。');r.phase='lobby';r.round=1;r.deductions={};r.players.forEach(x=>{x.ready=x.bot;x.done=false;x.found=[]});r.messages=[];r.votes={};r.publicClues=[];}
 else if(action==='leave'){lobby();r.players=r.players.filter(x=>x.id!==id);if(r.host===id)r.host=r.players.find(x=>!x.bot)?.id??'';}
 else fail('不支持的操作。');r.revision++;
}
export function view(r:Room,id:string,now:number){const me=r.players.find(p=>p.id===id)??fail('请重新加入。');const ended=r.phase==='ended';return {code:r.code,host:r.host,phase:r.phase,you:id,revision:r.revision,serverNow:now,started:r.started,round:roundOf(r),roundInfo:INVESTIGATION_ROUNDS[roundOf(r)-1],myDeductions:r.deductions?.[id]??{},
 players:r.players.map(({id,name,role,bot,ready,done,found})=>({id,name,role,bot,ready,done,searches:found.filter(id=>clueRound(id)===roundOf(r)).length,voted:!!r.votes[id]})),
 script:r.phase==='lobby'?null:SCRIPTS[me.role],
 clues:r.phase==='lobby'?[]:CLUES.filter(c=>clueRound(c.id)<=roundOf(r)&&(r.publicClues.includes(c.id)||me.found.includes(c.id))).map(({supports,weight,...c})=>({...c,art:CLUE_ART[c.id]??c.id,public:r.publicClues.includes(c.id),mine:me.found.includes(c.id)})),
 locations:LOCATIONS.map(l=>({...l,remaining:CLUES.filter(c=>clueRound(c.id)===roundOf(r)&&c.place===l.id&&!r.players.some(p=>p.found.includes(c.id))).length})),
 messages:r.messages.filter(m=>!m.to||m.from===id||m.to===id),myVote:r.votes[id]??null,
 solution:ended?SOLUTION:null,votes:ended?r.votes:null,
 };
}
export type PublicRoom=ReturnType<typeof view>;
