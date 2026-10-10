import type {CSSProperties} from 'react';
import {CHARACTERS} from '../../lib/game/public';
import type {PublicRoom} from '../../lib/game/client';
export type GameProps={room:PublicRoom;busy:boolean;act:(action:string,data?:Record<string,unknown>)=>Promise<boolean>};
export function Portrait({role,className=''}:{role:number;className?:string}){return <div role="img" aria-label={`${CHARACTERS[role].name}立绘`} className={`portrait ${className}`} style={{'--position':`${role*20}%`,'--role-color':CHARACTERS[role].color} as CSSProperties}/>}
export function SectionTitle({number,title,subtitle}:{number:string;title:string;subtitle?:string}){return <div className="section-title"><span>{number}</span><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div></div>}
