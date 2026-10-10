import type {PublicRoom} from './engine';
export type {PublicRoom};
export type Session={code:string;token:string};
export async function request(action:string,session:Session|null,data:Record<string,unknown>={}){
 const response=await fetch(action==='poll'?`/api/game?code=${session?.code}`:'/api/game',{method:action==='poll'?'GET':'POST',headers:{'Content-Type':'application/json',...(session?{Authorization:`Bearer ${session.token}`}:{})},...(action==='poll'?{}:{body:JSON.stringify({action,code:session?.code,...data})})});
 const body=await response.json() as {error?:string};if(!response.ok)throw Error(body.error??'连接中断，请重试。');return body as {room:PublicRoom;token?:string}&PublicRoom;
}
