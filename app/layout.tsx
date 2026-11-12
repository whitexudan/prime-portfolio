import './globals.css';
import {cookies} from 'next/headers';
import {getData} from '@/lib/database';
export default async function RootLayout({children}:{children:React.ReactNode}){
 const stored=(await cookies()).get('signal_lang')?.value;const data=await getData();const lang=stored==='en'||stored==='fr'?stored:data.settings.defaultLanguage;
 const p=data.palettes.find(x=>x.id===data.settings.defaultPalette)||data.palettes[0];
 const rawInit=`(()=>{try{let t=localStorage.getItem('signal-theme')||${JSON.stringify(data.settings.defaultTheme)},p=localStorage.getItem('signal-palette')||${JSON.stringify(p.id)},d=${JSON.stringify(data.palettes)};if(!['dark','light'].includes(t))t='light';document.documentElement.dataset.theme=t;let a=d.find(x=>x.id===p)||d[0];document.documentElement.dataset.palette=a.id;let s=document.documentElement.style;s.setProperty('--paper',a.light);s.setProperty('--night',a.dark);s.setProperty('--accent-light',a.lightAccent);s.setProperty('--accent-dark',a.darkAccent);s.setProperty('--secondary',a.secondary)}catch{}})()`;
 const init=rawInit.replace(/</g,'\\u003c');
 return <html lang={lang} data-theme={data.settings.defaultTheme} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:init}}/></head><body>{children}</body></html>
}
