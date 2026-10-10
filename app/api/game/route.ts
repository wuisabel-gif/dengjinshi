import {env} from 'cloudflare:workers';
import {act,createRoom,join,nameOf,view,type Room} from '../../../lib/game/engine';
const headers={'Cache-Control':'no-store'};
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers});
const db=()=>{if(!env.DB)throw Error('房间服务暂不可用，请稍后重试。');return env.DB};
const codeOf=(value:unknown)=>typeof value==='string'?value.trim().toUpperCase():'';
async function update(code:string,token:string,operation:(r:Room,id:string,now:number)=>void,joining?:string){
 for(let i=0;i<8;i++){
  const row=await db().prepare('SELECT state,version FROM rooms WHERE code=?').bind(code).first<{state:string;version:number}>();
  if(!row)throw Error('房间不存在，请检查邀请码。');
  const r=JSON.parse(row.state) as Room,now=Date.now();if(now-r.created>86400000)throw Error('房间已过期，请新建房间。');
  const p=r.players.find(p=>p.token===token)??(joining?join(r,joining,token):null);if(!p)throw Error('身份验证失败，请重新加入。');
  operation(r,p.id,now);const state=JSON.stringify(r);if(state===row.state)return view(r,p.id,now);
  const result=await db().prepare('UPDATE rooms SET state=?,version=version+1,updated_at=? WHERE code=? AND version=?').bind(state,now,code,row.version).run();
  if(result.meta.changes)return view(r,p.id,now);
 }
 throw Error('房间正忙，请再试一次。');
}
export async function GET(req:Request){try{return reply(await update(codeOf(new URL(req.url).searchParams.get('code')),req.headers.get('Authorization')?.replace(/^Bearer /,'')??'',()=>{}))}catch(e){return reply({error:e instanceof Error?e.message:'暂时无法连接。'},400)}}
export async function POST(req:Request){try{
 const data=await req.json() as Record<string,unknown>,action=String(data.action??'');
 if(action==='create'){
  const name=nameOf(data.name),token=crypto.randomUUID(),now=Date.now();await db().prepare('DELETE FROM rooms WHERE updated_at < ?').bind(now-86400000).run();
  for(let i=0;i<5;i++){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',code=Array.from(crypto.getRandomValues(new Uint8Array(5)),n=>alphabet[n%alphabet.length]).join(''),r=createRoom(code,name,token,now);const inserted=await db().prepare('INSERT OR IGNORE INTO rooms(code,state,version,updated_at) VALUES(?,?,0,?)').bind(code,JSON.stringify(r),now).run();if(inserted.meta.changes)return reply({room:view(r,r.host,now),token});}
  throw Error('创建失败，请重试。');
 }
 const code=codeOf(data.code);
 if(action==='join'){const token=crypto.randomUUID();return reply({room:await update(code,token,()=>{},nameOf(data.name)),token})}
 const token=req.headers.get('Authorization')?.replace(/^Bearer /,'')??'';
 return reply({room:await update(code,token,(r,id,now)=>act(r,id,action,data,now))});
 }catch(e){return reply({error:e instanceof Error?e.message:'操作失败，请重试。'},400)}}
