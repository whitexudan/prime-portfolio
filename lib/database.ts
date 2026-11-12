import {mkdir, readFile, writeFile, rename, open, unlink, stat} from 'node:fs/promises';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {defaultData} from '../data/defaultData';
import type {Data} from '../types/prime';
export const directory=path.resolve(process.env.DATA_DIR||'./var');
export type Store={data:Data; visits:number; loginFailures:number[]; loginBlockedUntil:number};
const filename=path.join(directory,'store.json');
const previousCategories=[{name:'WEB',value:92},{name:'CRYPTO',value:85},{name:'FORENSICS',value:95},{name:'OSINT',value:88},{name:'REVERSE ENGINEERING',value:72},{name:'MISC',value:90}];
const previousDomains=['WEB','CRYPTO','FORENSICS','BOOT2ROOT','OSINT','REVERSE ENGINEERING','PWN','MISC'];
async function read():Promise<Store>{
 try{
  const store=JSON.parse(await readFile(filename,'utf8')) as Store & {visitSessions?:unknown};
  delete store.visitSessions;
  store.data.achievements=store.data.achievements.map(entry=>({...entry,totalTeams:entry.totalTeams??null,ratingPoints:entry.ratingPoints??''}));
  if(JSON.stringify(store.data.categories)===JSON.stringify(previousCategories))store.data.categories=structuredClone(defaultData.categories);
  if(JSON.stringify(store.data.domains)===JSON.stringify(previousDomains))store.data.domains=structuredClone(defaultData.domains);
  return store;
 }catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;return {data:structuredClone(defaultData),visits:0,loginFailures:[],loginBlockedUntil:0}}
}
export async function transaction<T>(fn:(store:Store)=>T|Promise<T>):Promise<T>{
 await mkdir(directory,{recursive:true,mode:0o700});
 const lock=path.join(directory,'.lock');
 let acquired=false;
 for(let i=0;i<120;i++){
  try{const handle=await open(lock,'wx',0o600);await handle.close();acquired=true;break}catch(e){
   if((e as NodeJS.ErrnoException).code!=='EEXIST')throw e;
   try{if(Date.now()-(await stat(lock)).mtimeMs>30000)await unlink(lock)}catch{}
   await new Promise(r=>setTimeout(r,25));
  }
 }
 if(!acquired)throw new Error('STORE_BUSY');
 try{
  const store=await read(); const result=await fn(store);
  const temp=filename+'.'+randomUUID();
  await writeFile(temp,JSON.stringify(store),{mode:0o600}); await rename(temp,filename); return result;
 }finally{await unlink(lock).catch(()=>{})}
}
export async function getData(){return (await read()).data}
export const revision=(data:Data)=>createHash('sha256').update(JSON.stringify(data)).digest('hex');
export function publicData(data:Data):Data{
 return {...data,members:data.members.filter(x=>x.published),achievements:data.achievements.filter(x=>x.published),writeups:data.writeups.filter(x=>x.published),tools:data.tools.filter(x=>x.published),socials:data.socials.filter(x=>x.published)};
}
