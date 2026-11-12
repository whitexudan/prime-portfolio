import 'server-only';
import {createHash} from 'node:crypto';
import {defaultData} from '../data/defaultData';
import type {Data} from '../types/prime';
import {supabaseAdmin} from './supabase-admin';

export type Store={data:Data; visits:number; loginFailures:number[]; loginBlockedUntil:number};
type StoreRow={store:unknown;version:number|string};
const TABLE='prime_store';
const STORE_ID='main';
const previousCategories=[{name:'WEB',value:92},{name:'CRYPTO',value:85},{name:'FORENSICS',value:95},{name:'OSINT',value:88},{name:'REVERSE ENGINEERING',value:72},{name:'MISC',value:90}];
const previousDomains=['WEB','CRYPTO','FORENSICS','BOOT2ROOT','OSINT','REVERSE ENGINEERING','PWN','MISC'];

function defaultStore():Store{return {data:structuredClone(defaultData),visits:0,loginFailures:[],loginBlockedUntil:0}}
function normalizeStore(value:unknown):Store{
 if(!value||typeof value!=='object'||!('data' in value)||!value.data||typeof value.data!=='object')throw new Error('INVALID_STORE');
 const store=structuredClone(value) as Store & {visitSessions?:unknown};
 delete store.visitSessions;
 if(!Array.isArray(store.data.achievements)||!Array.isArray(store.data.categories)||!Array.isArray(store.data.domains))throw new Error('INVALID_STORE');
 store.data.achievements=store.data.achievements.map(entry=>({...entry,totalTeams:entry.totalTeams??null,ratingPoints:entry.ratingPoints??''}));
 if(JSON.stringify(store.data.categories)===JSON.stringify(previousCategories))store.data.categories=structuredClone(defaultData.categories);
 if(JSON.stringify(store.data.domains)===JSON.stringify(previousDomains))store.data.domains=structuredClone(defaultData.domains);
 store.visits=Number.isFinite(store.visits)?Math.max(0,Math.floor(store.visits)):0;
 store.loginFailures=Array.isArray(store.loginFailures)?store.loginFailures.filter(t=>Number.isFinite(t)):[];
 store.loginBlockedUntil=Number.isFinite(store.loginBlockedUntil)?Math.max(0,store.loginBlockedUntil):0;
 return store;
}

async function readRow():Promise<{store:Store;version:number}|null>{
 const {data,error}=await supabaseAdmin().from(TABLE).select('store,version').eq('id',STORE_ID).maybeSingle();
 if(error)throw error;
 if(!data)return null;
 const row=data as StoreRow;
 const version=Number(row.version);
 if(!Number.isSafeInteger(version)||version<0)throw new Error('INVALID_STORE_VERSION');
 return {store:normalizeStore(row.store),version};
}
async function ensureRow():Promise<{store:Store;version:number}>{
 const client=supabaseAdmin();
 for(let attempt=0;attempt<8;attempt++){
  const row=await readRow();
  if(row)return row;
  const initial=defaultStore();
  const {error}=await client.from(TABLE).insert({id:STORE_ID,store:initial,version:0});
  if(!error)return {store:initial,version:0};
  if(error.code!=='23505')throw error;
 }
 throw new Error('STORE_BUSY');
}

export async function transaction<T>(fn:(store:Store)=>T|Promise<T>):Promise<T>{
 const client=supabaseAdmin();
 for(let attempt=0;attempt<16;attempt++){
  const current=await ensureRow();
  const working=structuredClone(current.store);
  const before=JSON.stringify(working);
  const result=await fn(working);
  if(JSON.stringify(working)===before)return result;
  const {data,error}=await client.rpc('prime_store_compare_and_swap',{p_expected_version:current.version,p_next_store:working});
  if(error)throw error;
  if(data===true)return result;
 }
 throw new Error('STORE_BUSY');
}
export async function getData():Promise<Data>{return (await ensureRow()).store.data}
export const revision=(data:Data)=>createHash('sha256').update(JSON.stringify(data)).digest('hex');
export function publicData(data:Data):Data{
 return {...data,members:data.members.filter(x=>x.published),achievements:data.achievements.filter(x=>x.published),writeups:data.writeups.filter(x=>x.published),tools:data.tools.filter(x=>x.published),socials:data.socials.filter(x=>x.published)};
}
