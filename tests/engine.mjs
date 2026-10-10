import ts from 'typescript';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';
const out=fs.mkdtempSync(path.join(os.tmpdir(),'lantern-test-'));
for(const name of ['public','case','engine']){const js=ts.transpileModule(fs.readFileSync(`lib/game/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '(\.[^']+)'/g,"from '$1.mjs'");fs.writeFileSync(path.join(out,`${name}.mjs`),js)}
const {createRoom,join,act,view}=await import(path.join(out,'engine.mjs'));
const {CLUES,SCRIPTS}=await import(path.join(out,'case.mjs'));
for(let humans=1;humans<=6;humans++){
 let now=1000;const r=createRoom('TEST','甲','token0',now);for(let i=1;i<humans;i++)join(r,'玩家'+i,'token'+i);const host=r.host;const human=r.players.slice();
 assert.equal(view(r,host,now).script,null);assert.equal(view(r,host,now).solution,null);
 if(humans>1){assert.throws(()=>act(r,human[1].id,'bots',{},now));assert.throws(()=>act(r,human[1].id,'role',{role:0},now));}
 act(r,host,'bots',{},now);assert.equal(r.players.length,6);assert.equal(new Set(r.players.map(p=>p.role)).size,6);assert.throws(()=>join(r,'七','token7'));
 assert.throws(()=>act(r,host,'start',{},now));for(const p of human)act(r,p.id,'ready',{},now);act(r,host,'start',{},now);
 assert.equal(r.phase,'reading');assert.throws(()=>act(r,host,'advance',{},now));assert.throws(()=>join(r,'迟到','late'));
 for(const p of human){const v=view(r,p.id,now);assert.equal(v.script,SCRIPTS[p.role]);assert.ok(!JSON.stringify(v).includes('token0'));assert.equal(v.votes,null);assert.equal(v.solution,null);assert.ok(!('choices' in v));act(r,p.id,'done',{},now);}
 act(r,host,'advance',{},now);assert.equal(r.phase,'investigate');
 for(const p of human){assert.throws(()=>act(r,p.id,'done',{},now));for(let i=0;i<2;i++){const place=view(r,p.id,now).locations.find(l=>l.remaining>0).id;act(r,p.id,'search',{place},now)}assert.throws(()=>act(r,p.id,'search',{place:'study'},now));const v=view(r,p.id,now);assert.ok(p.found.every(id=>v.clues.some(c=>c.id===id)));if(humans>1){const other=human.find(x=>x.id!==p.id);assert.ok(p.found.every(id=>!view(r,other.id,now).clues.some(c=>c.id===id)))}act(r,p.id,'share',{clue:p.found[0]},now);assert.ok(view(r,r.players.find(x=>x.id!==p.id).id,now).clues.some(c=>c.id===p.found[0]));act(r,p.id,'done',{},now);}
 assert.equal(new Set(r.players.flatMap(p=>p.found)).size,12);
 const recipient=r.players[1];now+=1000;act(r,host,'chat',{text:'私密标记',to:recipient.id},now);assert.ok(view(r,host,now).messages.some(m=>m.text==='私密标记'));assert.ok(view(r,recipient.id,now).messages.some(m=>m.text==='私密标记'));assert.ok(!view(r,r.players[2].id,now).messages.some(m=>m.text==='私密标记'));assert.throws(()=>act(r,host,'share',{clue:'invalid'},now));
 act(r,host,'advance',{},now);assert.equal(r.phase,'discuss');assert.equal(view(r,host,now).clues.length,12);for(const p of human)act(r,p.id,'done',{},now);act(r,host,'advance',{},now);assert.equal(r.phase,'verdict');assert.equal(view(r,host,now).votes,null);
 for(const p of human){assert.throws(()=>act(r,p.id,'vote',{suspect:2,evidence:'invalid',reason:'x'},now));act(r,p.id,'vote',{suspect:2,evidence:'watch',reason:'更簿与口供矛盾'},now);if(r.phase==='verdict'){assert.equal(view(r,p.id,now).votes,null);assert.throws(()=>act(r,p.id,'vote',{suspect:1,evidence:'watch',reason:'x'},now));}}
 assert.equal(r.phase,'ended');assert.equal(view(r,host,now).solution.culprit,2);assert.equal(Object.keys(view(r,host,now).votes).length,6);act(r,host,'rematch',{},now);assert.equal(r.phase,'lobby');assert.equal(r.publicClues.length,0);assert.equal(r.messages.length,0);assert.equal(view(r,host,now).script,null);
 console.log(`PASS ${humans} human(s): complete case, readiness, unique roles, searches, private messages/scripts/votes, evidence release and rematch`);
}
// A human may choose the culprit; own private identity is visible, never another's.
const r=createRoom('TEST','凶手玩家','secret',1);act(r,r.host,'role',{role:2},2);act(r,r.host,'bots',{},3);act(r,r.host,'ready',{},4);act(r,r.host,'start',{},5);assert.equal(view(r,r.host,5).script.culprit,true);assert.equal(view(r,r.players.find(p=>p.role===0).id,5).script.culprit,undefined);
console.log('PASS culprit role and server-only solution boundaries');fs.rmSync(out,{recursive:true,force:true});
