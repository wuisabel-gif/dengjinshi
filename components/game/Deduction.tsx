import {useState} from 'react';
import {CHARACTERS} from '../../lib/game/public';
import type {GameProps} from './common';
export function Deduction({room,busy,act}:GameProps){
 const previous=room.myDeductions[room.round];
 const [suspect,setSuspect]=useState(previous?.suspect.toString()??''),[evidence,setEvidence]=useState(previous?.evidence??''),[reason,setReason]=useState(previous?.reason??'');
 return <form className="paper deduction" onSubmit={e=>{e.preventDefault();act('deduce',{suspect:Number(suspect),evidence,reason})}}>
  <span className="paper-kicker">第 {room.round} / 3 轮 · 推理札记 · 仅自己可见</span>
  <h2>{room.roundInfo.question}</h2><p>这是暂定判断。本轮可以修改，下一轮重新审视；最终指认在三轮结束后提交。</p>
  <label htmlFor="deduction-suspect">目前最怀疑谁？</label><select id="deduction-suspect" required value={suspect} onChange={e=>setSuspect(e.target.value)}><option value="">选择角色</option>{CHARACTERS.map((c,i)=><option key={c.name} value={i}>{c.name}</option>)}</select>
  <label htmlFor="deduction-evidence">支撑判断的公开线索</label><select id="deduction-evidence" required value={evidence} onChange={e=>setEvidence(e.target.value)}><option value="">选择线索</option>{room.clues.filter(c=>c.public).map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select>
  <label htmlFor="deduction-reason">理由，以及仍需核实的疑点</label><textarea id="deduction-reason" required maxLength={300} value={reason} onChange={e=>setReason(e.target.value)} placeholder="哪些证据支持？哪些事实可能推翻你的判断？"/>
  <button className="ink" disabled={busy||!suspect||!evidence||!reason.trim()}>{previous?'更新本轮推理':'记录本轮推理'}</button>{previous&&<span className="shared-note"> 已记录，可结束本幕</span>}
  {Object.entries(room.myDeductions).filter(([round])=>Number(round)<room.round).map(([round,d])=><blockquote key={round}><strong>第{round}轮：{CHARACTERS[d.suspect].name}</strong><p>{d.reason}</p></blockquote>)}
 </form>
}
