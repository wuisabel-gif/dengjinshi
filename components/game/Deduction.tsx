import {useState} from 'react';
import {CHARACTERS} from '../../lib/game/public';
import type {GameProps} from './common';
const PROMPTS = [
 [
  ['到过现场 ≠ 行凶','我暂时怀疑{suspect}，因为「{clue}」值得追查。但到过现场不等于行凶，还要确认遗留痕迹的时间。'],
  ['先分清动机与行动','我暂时怀疑{suspect}。「{clue}」可能解释动机，但我还需要能证明行动的证据。'],
  ['追查被拿走的物件','我想用「{clue}」追问{suspect}：物件为什么出现或消失？是否有另一种解释？'],
  ['保留判断，寻找反证','目前倾向{suspect}，依据是「{clue}」。下一轮我要寻找能够推翻这个判断的见证。'],
 ],
 [
  ['核对时间空白','我暂时怀疑{suspect}。「{clue}」让我注意到时间线的空白，还要用独立见证核对。'],
  ['检验声音的来源','我会结合「{clue}」追问{suspect}：声音是谁发出的？听到一句话是否足以证明有人仍活着？'],
  ['比较两份口供','目前倾向{suspect}。我要把「{clue}」与另一份口供比较，查清矛盾出在时辰、地点还是动作。'],
  ['修正上一轮判断','我现在更怀疑{suspect}。「{clue}」使我重新审视第一轮猜测，但仍需最后一轮物证确认。'],
 ],
 [
  ['让两条证据互相印证','我暂时指向{suspect}。「{clue}」需要与另一条独立证据相互印证，才能排除巧合。'],
  ['检验不在场证明','我会用「{clue}」核对{suspect}的不在场证明：是否覆盖整个关键时段？'],
  ['还原完整行动顺序','目前判断是{suspect}。我要从「{clue}」出发，串起进入、行动、离开与掩饰的先后顺序。'],
  ['排除其他可能','目前倾向{suspect}。除「{clue}」外，我还需要解释为什么其他人的可疑行为不等于行凶。'],
 ],
] as const;
export function Deduction({room,busy,act}:GameProps){
 const previous=room.myDeductions[room.round];
 const [suspect,setSuspect]=useState(previous?.suspect.toString()??''),[evidence,setEvidence]=useState(previous?.evidence??''),[reason,setReason]=useState(previous?.reason??'');
 return <form className="paper deduction" onSubmit={e=>{e.preventDefault();act('deduce',{suspect:Number(suspect),evidence,reason})}}>
  <span className="paper-kicker">第 {room.round} / 3 轮 · 推理札记 · 仅自己可见</span>
  <h2>{room.roundInfo.question}</h2><p>这是暂定判断。本轮可以修改，下一轮重新审视；最终指认在三轮结束后提交。</p>
  <label htmlFor="deduction-suspect">目前最怀疑谁？</label><select id="deduction-suspect" required value={suspect} onChange={e=>setSuspect(e.target.value)}><option value="">选择角色</option>{CHARACTERS.map((c,i)=><option key={c.name} value={i}>{c.name}</option>)}</select>
  <label htmlFor="deduction-evidence">支撑判断的公开线索</label><select id="deduction-evidence" required value={evidence} onChange={e=>setEvidence(e.target.value)}><option value="">选择线索</option>{room.clues.filter(c=>c.public).map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select>
  <fieldset className="deduction-prompts"><legend>不知道从哪里写？选择一个思路</legend><p>会替换下方草稿；可以继续修改，点击后不会自动提交。</p><div>{PROMPTS[room.round-1].map(([title,text])=><button type="button" key={title} disabled={busy} onClick={()=>setReason(text.replace('{suspect}',suspect!==''?CHARACTERS[Number(suspect)].name:'这位角色').replace('{clue}',room.clues.find(c=>c.id===evidence)?.title??'这条线索'))}>{title}</button>)}</div></fieldset>
  <label htmlFor="deduction-reason">理由，以及仍需核实的疑点</label><textarea id="deduction-reason" required maxLength={300} value={reason} onChange={e=>setReason(e.target.value)} placeholder="哪些证据支持？哪些事实可能推翻你的判断？"/>
  <button className="ink" disabled={busy||!suspect||!evidence||!reason.trim()}>{previous?'更新本轮推理':'记录本轮推理'}</button>{previous&&<span className="shared-note"> 已记录，可结束本幕</span>}
  {Object.entries(room.myDeductions).filter(([round])=>Number(round)<room.round).map(([round,d])=><blockquote key={round}><strong>第{round}轮：{CHARACTERS[d.suspect].name}</strong><p>{d.reason}</p></blockquote>)}
 </form>
}
