import {createClient} from '@supabase/supabase-js';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';

const url=process.env.SUPABASE_URL;
const secret=process.env.SUPABASE_SECRET_KEY;
if(!url||!secret){console.error('Configure SUPABASE_URL et SUPABASE_SECRET_KEY dans .env.local (ne les affiche pas).');process.exit(1)}
const storePath=path.resolve(process.env.DATA_DIR||'./var','store.json');
let store;
try{store=JSON.parse(await readFile(storePath,'utf8'))}catch(error){console.error(`Impossible de lire ${storePath}:`,error.message);process.exit(1)}
if(!store||typeof store!=='object'||!store.data||typeof store.data!=='object'||!Array.isArray(store.data.achievements)){
 console.error('store.json ne correspond pas au format attendu; aucune donnée importée.');process.exit(1)
}
delete store.visitSessions;
store.data.achievements=store.data.achievements.map(entry=>({...entry,totalTeams:entry.totalTeams??null,ratingPoints:entry.ratingPoints??''}));
store.visits=Number.isFinite(store.visits)?Math.max(0,Math.floor(store.visits)):0;
store.loginFailures=Array.isArray(store.loginFailures)?store.loginFailures.filter(Number.isFinite):[];
store.loginBlockedUntil=Number.isFinite(store.loginBlockedUntil)?Math.max(0,store.loginBlockedUntil):0;
store={data:store.data,visits:store.visits,loginFailures:store.loginFailures,loginBlockedUntil:store.loginBlockedUntil};

const supabase=createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false,detectSessionInUrl:false}});
const {data:existing,error:checkError}=await supabase.from('prime_store').select('id').eq('id','main').maybeSingle();
if(checkError){console.error('Vérification de prime_store échouée. Exécutez d’abord le SQL fourni.');console.error(checkError.message);process.exit(1)}
if(existing){console.error('prime_store contient déjà main : import refusé pour éviter tout écrasement. Faites une sauvegarde et vérifiez la base avant toute autre action.');process.exit(1)}

const avatarDir=path.join(path.dirname(storePath),'avatars');
const mimeByExt={jpg:'image/jpeg',png:'image/png',webp:'image/webp'};
let uploaded=0;
try{
 const names=await readdir(avatarDir,{withFileTypes:true}).catch(error=>error.code==='ENOENT'?[]:Promise.reject(error));
 for(const entry of names){
  if(!entry.isFile())continue;
  const match=/^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\.(jpg|png|webp)$/i.exec(entry.name);
  if(!match)continue;
  const bytes=await readFile(path.join(avatarDir,entry.name));
  if(bytes.byteLength>3*1024*1024)throw new Error(`Avatar trop volumineux: ${entry.name}`);
  const {error}=await supabase.storage.from('prime-avatars').upload(entry.name,bytes,{contentType:mimeByExt[match[2].toLowerCase()],upsert:true});
  if(error)throw new Error(`Upload avatar ${entry.name}: ${error.message}`);
  uploaded++;
 }
}catch(error){console.error('Import des avatars interrompu; le store n’a pas été inséré.',error.message);process.exit(1)}

const {error:insertError}=await supabase.from('prime_store').insert({id:'main',store,version:0});
if(insertError){console.error('Insertion du store échouée. Les fichiers locaux sont conservés; des avatars peuvent déjà avoir été copiés. Relancez seulement après avoir vérifié l’état de la base.',insertError.message);process.exit(1)}
console.log(`Import terminé: données du portfolio et compteur importés; ${uploaded} avatar(s) copié(s). Les fichiers locaux n’ont pas été supprimés.`);
