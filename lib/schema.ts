import {z} from 'zod';
const text=z.string().max(12000);
const short=z.string().max(300);
const id=z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/);
const loc=z.object({fr:text,en:text}).strict();
const url=z.string().max(2000).refine(v=>{try{return new URL(v).protocol==='https:'}catch{return false}},'HTTPS URL required');
const optionalUrl=z.union([z.literal(''),url]);
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{const d=new Date(v);return !isNaN(d.valueOf())&&d.toISOString().slice(0,10)===v}).nullable();
const strings=z.array(short).max(40);
const published={id,published:z.boolean()};
export const memberSchema=z.object({...published,handle:short,publicId:short,role:loc,specialty:loc,categories:strings,certifications:strings,avatar:short,avatarUrl:z.string().regex(/^\/api\/prime\/avatars\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(?:jpg|png|webp)$/).optional(),active:z.boolean(),order:z.number().int().min(0).max(999),links:z.array(z.object({label:short,url}).strict()).max(10)}).strict();
export const entrySchema=z.object({...published,kind:z.enum(['milestone','competition']),title:loc,location:short,date,platform:short,rank:z.number().int().min(1).max(100000).nullable(),totalTeams:z.number().int().min(1).max(100000).nullable().default(null),score:short,ratingPoints:short.default(''),context:loc,highlights:strings,skills:strings}).strict().refine(v=>v.kind!=='milestone'||(v.rank===null&&v.totalTeams===null&&v.score===''&&v.ratingPoints===''),'Milestones cannot have competition results');
export const writeupSchema=z.object({...published,title:loc,challenge:short,ctf:short,category:z.enum(['WEB','CRYPTO','FORENSICS','OSINT','REVERSE','PWN','MISC']),difficulty:z.enum(['EASY','MEDIUM','HARD','INSANE']),author:short,date,excerpt:loc,tags:strings,url:optionalUrl,demo:z.boolean(),content:loc}).strict().refine(v=>v.demo||!v.published||(v.url.startsWith('https://medium.com/')||/^https:\/\/[a-zA-Z0-9-]+\.medium\.com\//.test(v.url)),'Published real writeups need a Medium URL');
const color=z.string().regex(/^#[0-9a-fA-F]{6}$/);
function contrast(a:string,b:string){const L=(v:string)=>{const n=[1,3,5].map(i=>parseInt(v.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return n[0]*.2126+n[1]*.7152+n[2]*.0722};return (Math.max(L(a),L(b))+.05)/(Math.min(L(a),L(b))+.05)}
export const paletteSchema=z.object({id,name:short,dark:color,light:color,lightAccent:color,darkAccent:color,secondary:color}).strict().refine(p=>contrast(p.light,p.lightAccent)>=4.5&&contrast(p.dark,p.darkAccent)>=4.5&&contrast(p.light,'#17201a')>=7&&contrast(p.dark,'#f1f3e9')>=7,'Palette must preserve text contrast');
const unique=<T extends {id:string}>(v:T[])=>new Set(v.map(x=>x.id)).size===v.length;
export const dataSchema=z.object({
 version:z.literal(1),
 texts:z.object({intro:loc,signature:loc,identity:loc,hero:loc,manifesto:loc,principles:z.array(loc).max(20)}).strict(),
 members:z.array(memberSchema).max(30).refine(unique,'Duplicate IDs'),
 achievements:z.array(entrySchema).max(500).refine(unique,'Duplicate IDs'),
 writeups:z.array(writeupSchema).max(2000).refine(unique,'Duplicate IDs'),
 tools:z.array(z.object({...published,name:short,group:loc,description:loc,confirmed:z.boolean()}).strict()).max(100).refine(unique,'Duplicate IDs'),
 stats:z.array(z.object({id,value:z.number().min(0).max(1e12),suffix:z.string().max(8),label:loc}).strict()).min(1).max(12).refine(unique,'Duplicate IDs'),
 categories:z.array(z.object({name:short,value:z.number().min(0).max(100)}).strict()).max(20),domains:strings,
 socials:z.array(z.object({...published,label:short,url}).strict()).max(12).refine(unique,'Duplicate IDs'),
 palettes:z.array(paletteSchema).min(1).max(12).refine(unique,'Duplicate IDs'),
 settings:z.object({defaultTheme:z.enum(['light','dark']),defaultPalette:id,defaultLanguage:z.enum(['fr','en']),enable3d:z.boolean()}).strict()
}).strict().refine(d=>d.palettes.some(p=>p.id===d.settings.defaultPalette),'Default palette must exist');
