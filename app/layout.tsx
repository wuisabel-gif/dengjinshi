import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'灯尽时 · 听雨楼命案',description:'雨夜古宅，六人各怀秘密。原创中文多人剧本杀：私人剧本、搜证、密谈与真相。',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
