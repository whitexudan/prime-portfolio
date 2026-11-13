'use client';
import {useEffect,useState,type ChangeEvent,type FormEvent} from 'react';
import {usePrimeStore} from '@/store/usePrimeStore';
import {translations} from '@/lib/i18n';
import {defaultData} from '@/data/defaultData';
import type {Data,Member} from '@/types/prime';

type MemberField='categories'|'certifications';
type LocaleField='role'|'specialty';
type EditorMode='form'|'json';

function isLocalized(value:unknown):value is {fr:string;en:string}{
 if(!value||typeof value!=='object')return false;
 const record=value as Record<string,unknown>;
 return typeof record.fr==='string'&&typeof record.en==='string';
}
function isMemberList(value:unknown):value is Member[]{
 if(!Array.isArray(value))return false;
 return value.every((entry)=>{
  if(!entry||typeof entry!=='object')return false;
  const member=entry as Record<string,unknown>;
  const links=member.links;
  return typeof member.id==='string'&&typeof member.handle==='string'&&typeof member.publicId==='string'&&
   isLocalized(member.role)&&isLocalized(member.specialty)&&Array.isArray(member.categories)&&member.categories.every(x=>typeof x==='string')&&
   Array.isArray(member.certifications)&&member.certifications.every(x=>typeof x==='string')&&typeof member.avatar==='string'&&
   (member.avatarUrl===undefined||typeof member.avatarUrl==='string')&&typeof member.active==='boolean'&&Number.isInteger(member.order)&&
   typeof member.published==='boolean'&&Array.isArray(links)&&links.every((link)=>!!link&&typeof link==='object'&&typeof (link as Record<string,unknown>).label==='string'&&typeof (link as Record<string,unknown>).url==='string');
 });
}
function newMember(index:number):Member{
 const n=String(index+1).padStart(2,'0');
 return {id:crypto.randomUUID(),handle:`new-operator-${n}`,publicId:`ID_${n}`,role:{fr:'Nouveau membre',en:'New member'},specialty:{fr:'À préciser',en:'To be completed'},categories:[],certifications:[],avatar:'AVATAR',active:true,order:index,published:false,links:[]};
}

export default function AdminDashboard({authenticated,csrf:initialCsrf,configured}:{authenticated:boolean;csrf:string;configured:boolean}){
 const {lang,setLang}=usePrimeStore();const t=translations[lang];const isFr=lang==='fr';
 const [auth,setAuth]=useState(authenticated);const [csrf,setCsrf]=useState(initialCsrf);const [password,setPassword]=useState('');
 const [data,setData]=useState<Data|null>(null);const [revision,setRevision]=useState('');const [collection,setCollection]=useState<keyof Data>('members');
 const [editor,setEditor]=useState('');const [memberDraft,setMemberDraft]=useState<Member[]>([]);
 const [certificationDrafts,setCertificationDrafts]=useState<Record<string,string>>({});const [editorMode,setEditorMode]=useState<EditorMode>('form');
 const [message,setMessage]=useState('');const [issues,setIssues]=useState('');const [busy,setBusy]=useState(false);const [uploadingIndex,setUploadingIndex]=useState<number|null>(null);const [itemIndex,setItemIndex]=useState(0);const [dirty,setDirty]=useState(false);

 useEffect(()=>{try{const stored=localStorage.getItem('signal-lang');if(stored==='fr'||stored==='en')usePrimeStore.setState({lang:stored})}catch{}},[]);
 useEffect(()=>{if(auth)void load()},[auth]);
 useEffect(()=>{const stop=(event:BeforeUnloadEvent)=>{if(dirty){event.preventDefault();event.returnValue=''}};window.addEventListener('beforeunload',stop);return()=>window.removeEventListener('beforeunload',stop)},[dirty]);

 async function load(){
  setBusy(true);
  try{
   const response=await fetch('/api/prime?admin=1',{cache:'no-store'});
   if(!response.ok){if(response.status===401)setAuth(false);throw new Error('LOAD_FAILED')}
   const value=await response.json();
   setData(value.data);setRevision(value.revision);setEditor(JSON.stringify(value.data[collection],null,2));setMemberDraft(value.data.members);setCertificationDrafts({});setEditorMode('form');setDirty(false);setIssues('');setMessage('');
  }catch{setMessage(t.failed)}finally{setBusy(false)}
 }
 function switchCollection(key:keyof Data){
  if(dirty&&!window.confirm(isFr?'Abandonner les changements non enregistrés ?':'Discard unsaved changes?'))return;
  setCollection(key);setEditor(JSON.stringify(data?.[key],null,2));setMemberDraft(data?.members??[]);setCertificationDrafts({});setEditorMode('form');setItemIndex(0);setDirty(false);setIssues('');setMessage('');
 }
 async function login(event:FormEvent){
  event.preventDefault();setBusy(true);setMessage('');
  try{
   const response=await fetch('/api/prime/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
   setPassword('');if(!response.ok)throw new Error('LOGIN_FAILED');
   const session=await fetch('/api/prime/auth',{cache:'no-store'}).then(result=>result.json());setCsrf(session.csrf);setAuth(true);
  }catch{setMessage(t.invalid)}finally{setBusy(false)}
 }
 async function save(){
  if(!data)return;
  setBusy(true);setIssues('');setMessage('');
  try{
   const edited=collection==='members'&&editorMode==='form'?memberDraft:JSON.parse(editor);
   const response=await fetch('/api/prime',{method:'PUT',headers:{'Content-Type':'application/json','x-csrf-token':csrf},body:JSON.stringify({data:{...data,[collection]:edited},revision})});
   const value=await response.json();
   if(response.status===409){setMessage(t.conflict);return}
   if(response.status===403){setAuth(false);setMessage(t.sessionExpired);return}
   if(!response.ok){setIssues(value.issues?.map((issue:{path:string;code:string})=>`${issue.path}: ${issue.code}`).join('\n')||value.error);setMessage(isFr?'Vérifie les champs signalés avant d’enregistrer.':'Check the listed fields before saving.');return}
   setData(value.data);setRevision(value.revision);setEditor(JSON.stringify(value.data[collection],null,2));setMemberDraft(value.data.members);setCertificationDrafts({});setDirty(false);setMessage(t.saved);
  }catch{setMessage(t.failed)}finally{setBusy(false)}
 }
 function mutate(action:'add'|'delete'|'publish'|'hide'){
  try{
   const items=JSON.parse(editor);if(!Array.isArray(items))return;
   if(action==='delete'){if(!window.confirm(t.confirm))return;items.splice(itemIndex,1);setItemIndex(0)}
   else if(action==='add'){
    const templates:Partial<Record<keyof Data,unknown>>={members:defaultData.members[0],achievements:defaultData.achievements[0],writeups:defaultData.writeups[0],tools:defaultData.tools[0],socials:defaultData.socials[0],palettes:defaultData.palettes[0],stats:defaultData.stats[0],categories:defaultData.categories[0],domains:'PLACEHOLDER'};
    const item=structuredClone(templates[collection]) as Record<string,unknown>|string|undefined;
    if(item&&typeof item==='object'){if(typeof item.id==='string')item.id=crypto.randomUUID();if('published' in item)item.published=false}
    items.push(item);setItemIndex(items.length-1);
   }else if(items[itemIndex]&&typeof items[itemIndex]==='object'&&'published' in items[itemIndex])items[itemIndex].published=action==='publish';
   setEditor(JSON.stringify(items,null,2));setDirty(true);setIssues('');
  }catch{setMessage(t.failed)}
 }
 function mutateMemberForm(action:'add'|'delete'|'publish'|'hide'){
  const items=[...memberDraft];
  if(action==='add'){items.push(newMember(items.length));setMemberDraft(items);setItemIndex(items.length-1)}
  else if(action==='delete'){
   if(!items.length||!window.confirm(t.confirm))return;
   items.splice(itemIndex,1);setMemberDraft(items);setItemIndex(Math.max(0,Math.min(itemIndex,items.length-1)));
  }else if(items[itemIndex]){items[itemIndex]={...items[itemIndex],published:action==='publish'};setMemberDraft(items)}
  setDirty(true);setIssues('');setMessage('');
 }
 function updateMember(index:number,patch:Partial<Member>){
  setMemberDraft(current=>current.map((member,i)=>i===index?{...member,...patch}:member));setDirty(true);setIssues('');setMessage('');
 }
 function updateLocalized(index:number,field:LocaleField,language:'fr'|'en',value:string){
  setMemberDraft(current=>current.map((member,i)=>i===index?{...member,[field]:{...member[field],[language]:value}}:member));setDirty(true);setIssues('');setMessage('');
 }
 function updateMemberList(index:number,field:MemberField,value:string){
  const values=value.split(/[\n,]/).map(item=>item.trim()).filter(Boolean);
  updateMember(index,{[field]:values} as Pick<Member,MemberField>);
 }
 function updateLink(index:number,linkIndex:number,patch:Partial<Member['links'][number]>){
  const member=memberDraft[index];if(!member)return;
  updateMember(index,{links:member.links.map((link,i)=>i===linkIndex?{...link,...patch}:link)});
 }
 function addLink(index:number){
  const member=memberDraft[index];if(!member)return;
  if(member.links.length>=10){setMessage(isFr?'Maximum de 10 liens atteint.':'Maximum of 10 links reached.');return}
  updateMember(index,{links:[...member.links,{label:'',url:''}]});
 }
 function removeLink(index:number,linkIndex:number){
  const member=memberDraft[index];if(!member)return;
  updateMember(index,{links:member.links.filter((_,i)=>i!==linkIndex)});
 }
 function toJson(){if(editorMode==='json')return;setEditor(JSON.stringify(memberDraft,null,2));setEditorMode('json');setIssues('');setMessage(isFr?'Formulaire converti en JSON.':'Form converted to JSON.')}
 function toForm(){
  if(editorMode==='form')return;
  try{
   const value=JSON.parse(editor);
   if(!isMemberList(value))throw new Error(isFr?'Le JSON doit être une liste complète de membres.':'JSON must be a complete members list.');
   setMemberDraft(value);setEditorMode('form');setItemIndex(index=>Math.min(index,Math.max(value.length-1,0)));setIssues('');setMessage(isFr?'JSON converti en formulaire.':'JSON converted to form.');
  }catch(error){setIssues(error instanceof Error?error.message:(isFr?'JSON invalide.':'Invalid JSON.'));setMessage(isFr?'Corrige le JSON pour le convertir en formulaire.':'Fix the JSON before converting it to the form.')}
 }
 async function uploadAvatar(event:ChangeEvent<HTMLInputElement>,index:number){
  const input=event.currentTarget;const file=input.files?.[0];input.value='';if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setMessage(isFr?'Format accepté : JPEG, PNG ou WebP.':'Accepted formats: JPEG, PNG, or WebP.');return}
  if(file.size>3*1024*1024){setMessage(isFr?'Image trop lourde : maximum 3 Mo.':'Image too large: 3 MB maximum.');return}
  const form=new FormData();form.append('file',file);setUploadingIndex(index);setMessage('');
  try{
   const response=await fetch('/api/prime/avatars',{method:'POST',headers:{'x-csrf-token':csrf},body:form});
   const value=await response.json();
   if(response.status===403){setAuth(false);throw new Error('SESSION_EXPIRED')}
   if(!response.ok||typeof value.url!=='string')throw new Error(value.error||'UPLOAD_FAILED');
   updateMember(index,{avatarUrl:value.url});setMessage(isFr?'Avatar téléversé. Pense à enregistrer les modifications.':'Avatar uploaded. Remember to save your changes.');
  }catch(error){setMessage(error instanceof Error&&error.message==='SESSION_EXPIRED'?t.sessionExpired:(isFr?'Échec du téléversement de l’avatar.':'Avatar upload failed.'))}
  finally{setUploadingIndex(null)}
 }
 let jsonEntries:unknown[]=[];
 try{const parsed=JSON.parse(editor);if(Array.isArray(parsed))jsonEntries=parsed}catch{}
 const currentEntries:unknown[]=collection==='members'&&editorMode==='form'?memberDraft:jsonEntries;
 const selectedMember=memberDraft[itemIndex];
  const memberCategoryOptions=[...new Set([...(data?.categories??defaultData.categories).map(category=>category.name),...(selectedMember?.categories??[])])];
 const names:Partial<Record<keyof Data,string>>={texts:t.texts,members:t.members,achievements:t.achievements,stats:t.stats,categories:'Scores',writeups:t.writeups,tools:t.toolsAdmin,socials:t.socials,palettes:t.palettes,settings:t.settings,domains:t.domains};

 return <main className="admin-shell">
  <header className="admin-header"><a href="/">ΠΡΙΜΕ ↗</a><button type="button" onClick={()=>setLang(lang==='fr'?'en':'fr')}>FR / EN</button>{auth&&<button type="button" disabled={busy} onClick={async()=>{try{const response=await fetch('/api/prime/auth',{method:'DELETE',headers:{'x-csrf-token':csrf}});if(!response.ok)throw new Error();setAuth(false);setData(null);setCsrf('')}catch{setMessage(t.failed)}}}>{t.logout}</button>}</header>
  <p className="eyebrow">CONTROL ROOM / {t.admin}</p><h1>{auth?t.admin:t.login}</h1><p className="admin-warning">{auth?t.adminWarning:t.loginText}</p>
  {!configured&&<p role="alert">{t.notConfigured}</p>}
  {!auth?<form className="login-form" onSubmit={login}><label htmlFor="password">{t.password}</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={event=>setPassword(event.target.value)} maxLength={1024}/><button className="button primary" disabled={busy||!configured}>{busy?t.loading:t.login}</button></form>:!data?<button type="button" onClick={()=>void load()}>{busy?t.loading:t.reload}</button>:<div className="admin-layout">
   <nav aria-label={t.admin}>{Object.entries(names).map(([key,name])=><button type="button" className={collection===key?'selected':''} key={key} onClick={()=>switchCollection(key as keyof Data)}>{name}</button>)}</nav>
   <section className="admin-editor">
    <div className="admin-section-heading"><div><p className="admin-kicker">DATA COLLECTION / {String(collection).toUpperCase()}</p><h2>{names[collection]}</h2></div><p>{t.editorHelp}</p></div>
    {collection==='members'&&<div className="admin-mode-switch"><div className="admin-mode-buttons" role="group" aria-label={isFr?'Mode d’édition':'Editing mode'}><button type="button" aria-pressed={editorMode==='form'} className={editorMode==='form'?'is-active':''} disabled={editorMode==='form'} onClick={toForm}>{isFr?'Formulaire':'Form'}</button><button type="button" aria-pressed={editorMode==='json'} className={editorMode==='json'?'is-active':''} disabled={editorMode==='json'} onClick={toJson}>{isFr?'JSON ← Formulaire':'JSON ← Form'}</button></div><p>{isFr?'La conversion porte sur toute la liste des membres, avatar compris.':'Conversion applies to the full member list, including avatars.'}</p></div>}
    {Array.isArray(data[collection])&&<div className="admin-actions admin-entry-actions"><label>{t.selectItem}<select value={itemIndex} onChange={event=>setItemIndex(Number(event.target.value))}>{currentEntries.map((entry,index)=><option key={index} value={index}>{index+1} / {entry&&typeof entry==='object'&&'id' in entry?String((entry as {id:unknown}).id):String(index+1)}</option>)}</select></label><button type="button" onClick={()=>collection==='members'&&editorMode==='form'?mutateMemberForm('add'):mutate('add')}>{t.add}</button><button type="button" disabled={!currentEntries.length} onClick={()=>collection==='members'&&editorMode==='form'?mutateMemberForm('publish'):mutate('publish')}>{t.publish}</button><button type="button" disabled={!currentEntries.length} onClick={()=>collection==='members'&&editorMode==='form'?mutateMemberForm('hide'):mutate('hide')}>{t.hide}</button><button type="button" disabled={!currentEntries.length} onClick={()=>collection==='members'&&editorMode==='form'?mutateMemberForm('delete'):mutate('delete')}>{t.delete}</button></div>}
    {collection==='members'&&editorMode==='form'?(selectedMember?<div className="member-form">
     <div className="member-form-top"><div><p className="admin-kicker">OPERATOR / {String(itemIndex+1).padStart(2,'0')}</p><h3>{selectedMember.handle|| (isFr?'Nouveau membre':'New member')}</h3><p className="member-id">{selectedMember.id}</p></div><div className="member-avatar-card"><div className="member-avatar-preview">{selectedMember.avatarUrl?<img src={selectedMember.avatarUrl} alt=""/>:<span>{selectedMember.handle.slice(0,2).toUpperCase()||'Π'}</span>}</div><div className="member-avatar-copy"><strong>{isFr?'Photo de profil':'Profile avatar'}</strong><p>{isFr?'JPEG, PNG ou WebP · 3 Mo maximum':'JPEG, PNG, or WebP · 3 MB maximum'}</p><label className="admin-upload-button"><span>{uploadingIndex===itemIndex?(isFr?'Téléversement…':'Uploading…'):(isFr?'Choisir une image':'Choose image')}</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingIndex!==null} onChange={event=>void uploadAvatar(event,itemIndex)}/></label>{selectedMember.avatarUrl&&<button type="button" className="admin-link-button" onClick={()=>updateMember(itemIndex,{avatarUrl:undefined})}>{isFr?'Retirer l’image':'Remove image'}</button>}</div></div></div>
     <div className="member-form-grid">
      <label className="member-field">{isFr?'Identifiant interne':'Internal ID'}<input value={selectedMember.id} onChange={event=>updateMember(itemIndex,{id:event.target.value})}/></label>
      <label className="member-field">Handle<input value={selectedMember.handle} onChange={event=>updateMember(itemIndex,{handle:event.target.value})}/></label>
      <label className="member-field">{isFr?'Identifiant public':'Public ID'}<input value={selectedMember.publicId} onChange={event=>updateMember(itemIndex,{publicId:event.target.value})}/></label>
      <label className="member-field">{isFr?'Libellé de l’avatar':'Avatar label'}<input value={selectedMember.avatar} onChange={event=>updateMember(itemIndex,{avatar:event.target.value})}/></label>
      <label className="member-field">{isFr?'Rôle — français':'Role — French'}<input value={selectedMember.role.fr} onChange={event=>updateLocalized(itemIndex,'role','fr',event.target.value)}/></label>
      <label className="member-field">{isFr?'Rôle — anglais':'Role — English'}<input value={selectedMember.role.en} onChange={event=>updateLocalized(itemIndex,'role','en',event.target.value)}/></label>
      <label className="member-field">{isFr?'Affinité — français':'Affinity — French'}<input value={selectedMember.specialty.fr} onChange={event=>updateLocalized(itemIndex,'specialty','fr',event.target.value)}/></label>
      <label className="member-field">{isFr?'Affinité — anglais':'Affinity — English'}<input value={selectedMember.specialty.en} onChange={event=>updateLocalized(itemIndex,'specialty','en',event.target.value)}/></label>
      <fieldset className="member-field-wide member-category-picker">
       <legend>{isFr?'Catégories du site — plusieurs choix possibles':'Site categories — select all that apply'}</legend>
       <div className="member-category-options">
        {memberCategoryOptions.map(category=><label className="member-category-option" key={category}><input type="checkbox" checked={selectedMember.categories.includes(category)} onChange={event=>{const next=new Set(selectedMember.categories);if(event.target.checked)next.add(category);else next.delete(category);updateMember(itemIndex,{categories:memberCategoryOptions.filter(name=>next.has(name))})}}/><span>{category}</span></label>)}
       </div>
       <p className="member-category-help">{isFr?'Choisis une ou plusieurs catégories dans la liste du site.':'Choose one or more categories from the site list.'}</p>
      </fieldset>
      <label className="member-field member-field-wide">{isFr?'Certifications (une par ligne ou séparées par des virgules)':'Certifications (one per line or comma-separated)'}<textarea rows={3} value={certificationDrafts[selectedMember.id]??selectedMember.certifications.join('\n')} onChange={event=>{const value=event.target.value;setCertificationDrafts(current=>({...current,[selectedMember.id]:value}));updateMemberList(itemIndex,'certifications',value)}} placeholder={isFr?'Ex. OSCP, CompTIA Security+':'e.g. OSCP, CompTIA Security+'}/></label>
      <label className="member-field">{isFr?'Ordre d’affichage':'Display order'}<input type="number" min="0" max="999" value={selectedMember.order} onChange={event=>updateMember(itemIndex,{order:Math.max(0,Math.min(999,Number(event.target.value)||0))})}/></label>
      <label className="member-check"><input type="checkbox" checked={selectedMember.active} onChange={event=>updateMember(itemIndex,{active:event.target.checked})}/><span>{isFr?'Membre actif':'Active member'}</span></label>
      <label className="member-check"><input type="checkbox" checked={selectedMember.published} onChange={event=>updateMember(itemIndex,{published:event.target.checked})}/><span>{isFr?'Visible publiquement':'Published on site'}</span></label>
     </div>
     <div className="member-links"><div className="member-links-heading"><div><p className="admin-kicker">PROFILE / LINKS</p><h4>{isFr?'Liens du membre':'Member links'}</h4></div><button type="button" onClick={()=>addLink(itemIndex)} disabled={selectedMember.links.length>=10}>{isFr?'Ajouter un lien':'Add link'}</button></div>{selectedMember.links.length===0&&<p className="member-empty-links">{isFr?'Aucun lien pour le moment.':'No links added yet.'}</p>}{selectedMember.links.map((link,linkIndex)=><div className="member-link-row" key={`${itemIndex}-${linkIndex}`}><label className="member-field">{isFr?'Libellé':'Label'}<input value={link.label} onChange={event=>updateLink(itemIndex,linkIndex,{label:event.target.value})}/></label><label className="member-field">URL<input type="url" placeholder="https://…" value={link.url} onChange={event=>updateLink(itemIndex,linkIndex,{url:event.target.value})}/></label><button type="button" className="admin-link-button" onClick={()=>removeLink(itemIndex,linkIndex)}>{isFr?'Retirer':'Remove'}</button></div>)}</div>
    </div>:<div className="member-empty"><p>{isFr?'Aucun membre pour l’instant.':'No members yet.'}</p><button type="button" onClick={()=>mutateMemberForm('add')}>{isFr?'Créer le premier membre':'Create the first member'}</button></div>):<div className="admin-json-panel"><label htmlFor="json-editor">{t.editor}</label><textarea id="json-editor" spellCheck={false} value={editor} onChange={event=>{setEditor(event.target.value);setDirty(true);setIssues('')}}/></div>}
    <div className="admin-actions admin-save-actions"><button type="button" className="button primary" onClick={()=>void save()} disabled={busy}>{busy?t.loading:t.save}</button><button type="button" onClick={()=>{if(!dirty||window.confirm(isFr?'Abandonner les changements ?':'Discard changes?'))void load()}} disabled={busy}>{t.reload}</button></div>
   </section>
  </div>}
  <p role="status" aria-live="polite">{message}</p>{issues&&<pre role="alert">{issues}</pre>}
 </main>
}
