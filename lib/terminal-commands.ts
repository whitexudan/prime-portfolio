import type { Data, Lang } from "../types/prime.ts";
export type TerminalData = Pick<Data,"members"|"achievements"|"writeups"|"domains"|"stats"|"socials"> & { texts: Pick<Data["texts"],"intro"|"identity"> };
type Help={usage:string;fr:string;en:string};
const HELP:Record<string,Help>={
 help:{usage:"help [commande]",fr:"Liste les commandes ou affiche l'aide d'une commande.",en:"Lists commands or shows help for one command."},
 team:{usage:"team",fr:"Présente ΠΡΙΜΕ avec les textes publics du site.",en:"Shows ΠΡΙΜΕ's public introduction."},
 members:{usage:"members [--limit N]",fr:"Liste les membres publiés; N va de 1 à 25.",en:"Lists published members; N ranges from 1 to 25."},
 member:{usage:"member <handle|id>",fr:"Affiche le profil public, les catégories, l'affinité, les certifications et les liens.",en:"Shows a member's public profile, categories, affinity, certifications, and links."},
 domains:{usage:"domains",fr:"Liste les domaines de l'équipe.",en:"Lists the team's domains."},
 stats:{usage:"stats",fr:"Affiche les statistiques configurées sur le site.",en:"Shows the site's statistics."},
 results:{usage:"results [--limit N]",fr:"Liste les résultats CTF publiés, classés par rang.",en:"Lists published CTF results, ordered by rank."},
 achievements:{usage:"achievements [--limit N]",fr:"Liste les réalisations et jalons publiés.",en:"Lists published achievements and milestones."},
 writeups:{usage:"writeups [--limit N]",fr:"Liste les write-ups publiés; les exemples sont marqués DÉMO.",en:"Lists published write-ups; samples are marked DEMO."},
 read:{usage:"read <id|titre>",fr:"Affiche le résumé et un extrait d'un write-up.",en:"Shows a write-up summary and excerpt."},
 socials:{usage:"socials",fr:"Liste les réseaux sociaux publiés.",en:"Lists published social links."},
 status:{usage:"status",fr:"Résumé des données publiques disponibles.",en:"Summary of available public data."},
 whoami:{usage:"whoami",fr:"Indique le rôle du visiteur dans ce terminal fictif.",en:"Shows the visitor's role in this simulated terminal."},
 ls:{usage:"ls",fr:"Liste les rubriques explorables.",en:"Lists the sections you can explore."},
 pwd:{usage:"pwd",fr:"Emplacement symbolique du terminal fictif.",en:"Symbolic location of this simulated terminal."},
 date:{usage:"date",fr:"Affiche la date et l'heure locales.",en:"Shows the local date and time."},
 ping:{usage:"ping",fr:"Signal simulé; aucune requête réseau n'est envoyée.",en:"Simulated signal; no network request is sent."},
 matrix:{usage:"matrix",fr:"Affiche une séquence décorative.",en:"Displays a decorative sequence."},
 neofetch:{usage:"neofetch",fr:"Fiche ΠΡΙΜΕ construite à partir des données publiques.",en:"ΠΡΙΜΕ card built from public data."},
 fortune:{usage:"fortune",fr:"Une pensée CTF amusante.",en:"A fun CTF-themed thought."},
 history:{usage:"history",fr:"Commandes de la session actuelle.",en:"Commands from this session."},
 echo:{usage:"echo <texte>",fr:"Répète le texte fourni.",en:"Repeats the supplied text."},
 clear:{usage:"clear",fr:"Efface l'affichage du terminal.",en:"Clears the terminal display."},
};
const ALIASES:Record<string,string>={about:"team",skills:"domains",result:"results",notes:"writeups",open:"read"};
const clean=(v:string|null|undefined)=>(v??"").replace(/\s+/g," ").trim();
const norm=(v:string)=>v.trim().toLocaleLowerCase();
const resolve=(v:string)=>ALIASES[norm(v)]??norm(v);
function allHelp(lang:Lang):string[]{return [lang==="fr"?"Commandes disponibles :":"Available commands:",...Object.values(HELP).map(h=>`${h.usage} — ${h[lang]}`),lang==="fr"?"Astuce : ajoute --help après une commande pour son aide détaillée.":"Tip: append --help to any command for details."];}
function helpFor(name:string,lang:Lang):string[]{const cmd=resolve(name),h=HELP[cmd];if(!h)return [lang==="fr"?`Aucune aide pour « ${name} ». Tape help.`:`No help for "${name}". Type help.`];const aliases=Object.entries(ALIASES).filter(([,v])=>v===cmd).map(([k])=>k);return [`${h.usage} — ${h[lang]}`,...(aliases.length?[`${lang==="fr"?"Alias":"Aliases"} : ${aliases.join(", ")}`]:[])];}
function getLimit(args:string[],fallback:number,lang:Lang):{value:number;error?:string}{const i=args.indexOf("--limit");if(i<0)return {value:fallback};const n=Number(args[i+1]);if(!Number.isInteger(n)||n<1)return {value:fallback,error:lang==="fr"?"Usage : --limit N (1 à 25).":"Usage: --limit N (1 to 25)."};return {value:Math.min(n,25)};}
function more(lines:string[],total:number,shown:number,cmd:string,lang:Lang):string[]{if(total>shown)lines.push(lang==="fr"?`… ${total-shown} autre(s); essaie ${cmd} --limit 25.`:`… ${total-shown} more; try ${cmd} --limit 25.`);return lines;}
function short(s:string,max=700):string{const t=clean(s);return t.length>max?`${t.slice(0,max-1).trimEnd()}…`:t;}
export function runTerminalCommand(raw:string,data:TerminalData,language:Lang,history:readonly string[]=[]):string[]{
 const input=raw.trim();if(!input)return [];const [first,...args]=input.split(/\s+/),name=norm(first),cmd=resolve(name);
 if(name==="help"){const target=args.find(x=>x!=="--help");return target?helpFor(target,language):allHelp(language);}if(args.includes("--help"))return helpFor(cmd,language);
 const members=data.members.filter(x=>x.published).slice().sort((a,b)=>a.order-b.order||a.handle.localeCompare(b.handle));
 const achievements=data.achievements.filter(x=>x.published);
 const results=achievements.filter(x=>x.kind==="competition").slice().sort((a,b)=>a.rank===null?(b.rank===null?0:1):b.rank===null?-1:a.rank-b.rank||(b.totalTeams??0)-(a.totalTeams??0)||(b.date??"").localeCompare(a.date??""));
 const writeups=data.writeups.filter(x=>x.published).slice().sort((a,b)=>(b.date??"").localeCompare(a.date??""));
 switch(cmd){
 case "team":return [clean(data.texts.intro[language]),clean(data.texts.identity[language]),language==="fr"?`${members.length} membre(s) publié(s) · ${data.domains.length} domaine(s)`:`${members.length} published member(s) · ${data.domains.length} domain(s)`].filter(Boolean);
 case "members":{const l=getLimit(args,10,language);if(l.error)return [l.error];if(!members.length)return [language==="fr"?"Aucun membre publié.":"No published members."];return more(members.slice(0,l.value).map((m,i)=>`${i+1}. @${m.handle} · ${m.role[language]} · ${language==="fr"?"Affinité":"Affinity"} : ${m.specialty[language]}`),members.length,l.value,"members",language);}
 case "member":{const q=clean(args.join(" ")).replace(/^@/,"");if(!q)return [language==="fr"?"Usage : member <handle|id> (member --help).":'Usage: member <handle|id> (type "member --help").'];const n=norm(q),m=members.find(x=>[x.handle,x.id,x.publicId].some(v=>norm(v)===n))??members.find(x=>[x.handle,x.id,x.publicId].some(v=>norm(v).includes(n)));if(!m)return [language==="fr"?`Membre « ${q} » introuvable; utilise members.`:`Member "${q}" not found; use members.`];const links=m.links.filter(x=>clean(x.label)&&clean(x.url)).map(x=>`${x.label} ${x.url}`);return [`@${m.handle} · ${m.publicId}`,`${language==="fr"?"Rôle":"Role"} : ${m.role[language]}`,`${language==="fr"?"Affinité":"Affinity"} : ${m.specialty[language]}`,...(m.categories.length?[`${language==="fr"?"Catégories":"Categories"} : ${m.categories.join(", ")}`]:[]),...(m.certifications.length?[`Certifications : ${m.certifications.join(", ")}`]:[]),...(links.length?[`${language==="fr"?"Liens":"Links"} : ${links.join(" · ")}`]:[]),`${language==="fr"?"Statut":"Status"} : ${m.active?(language==="fr"?"actif":"active"):(language==="fr"?"inactif":"inactive")}`];}
 case "domains":return data.domains.length?[`${language==="fr"?"Domaines":"Domains"} : ${[...new Set(data.domains)].join(" · ")}`]:[language==="fr"?"Aucun domaine configuré.":"No domains configured."];
 case "stats":return data.stats.length?data.stats.map(x=>`${x.label[language]} : ${x.value}${x.suffix}`):[language==="fr"?"Aucune statistique configurée.":"No stats configured."];
 case "results":{const l=getLimit(args,8,language);if(l.error)return [l.error];if(!results.length)return [language==="fr"?"Aucun résultat CTF publié.":"No published CTF results."];const lines=results.slice(0,l.value).map(x=>`${x.title[language]} — ${x.rank===null?"—":`#${x.rank}/${x.totalTeams??"—"}`}${clean(x.score)?` · ${x.score} points`:""}`);return more(lines,results.length,l.value,"results",language);}
 case "achievements":{const l=getLimit(args,10,language);if(l.error)return [l.error];const sorted=achievements.slice().sort((a,b)=>(b.date??"").localeCompare(a.date??""));if(!sorted.length)return [language==="fr"?"Aucune réalisation publiée.":"No published achievements."];const lines=sorted.slice(0,l.value).map(x=>`[${x.kind==="competition"?"CTF":language==="fr"?"JALON":"MILESTONE"}] ${x.title[language]}${x.kind==="competition"&&x.rank!==null?` · #${x.rank}/${x.totalTeams??"—"}`:""}${x.date?` · ${x.date}`:""}`);return more(lines,sorted.length,l.value,"achievements",language);}
 case "writeups":{const l=getLimit(args,8,language);if(l.error)return [l.error];if(!writeups.length)return [language==="fr"?"Aucun write-up publié.":"No published write-ups."];const lines=writeups.slice(0,l.value).map((x,i)=>`${i+1}. ${x.title[language]} — ${[x.challenge,x.ctf,x.category,x.difficulty].map(clean).filter(Boolean).join(" · ")}${x.demo?(language==="fr"?" · DÉMO":" · DEMO"):""}`);return more(lines,writeups.length,l.value,"writeups",language);}
 case "read":{const q=clean(args.join(" "));if(!q)return [language==="fr"?"Usage : read <id|titre> (read --help).":'Usage: read <id|title> (type "read --help").'];const n=norm(q),w=writeups.find(x=>[x.id,x.title[language],x.challenge].some(v=>norm(v)===n))??writeups.find(x=>[x.id,x.title[language],x.challenge].some(v=>norm(v).includes(n)));if(!w)return [language==="fr"?`Write-up « ${q} » introuvable; utilise writeups.`:`Write-up "${q}" not found; use writeups.`];return [`${w.demo?(language==="fr"?"[DÉMO] ":"[DEMO] "):""}${w.title[language]} · ${w.challenge}`,...(clean(w.excerpt[language])?[`${language==="fr"?"Résumé":"Summary"} : ${short(w.excerpt[language],300)}`]:[]),...(clean(w.content[language])?[`${language==="fr"?"Extrait":"Excerpt"} : ${short(w.content[language])}`]:[]),...(w.url?[`${language==="fr"?"Lien":"Link"} : ${w.url}`]:[])];}
 case "socials":{const s=data.socials.filter(x=>x.published);return s.length?s.map(x=>`${x.label} : ${x.url}`):[language==="fr"?"Aucun lien social publié.":"No published social links."];}
 case "status":return [language==="fr"?`Signal stable · ${members.length} membre(s) · ${results.length} résultat(s) CTF · ${writeups.length} write-up(s)`:`Signal stable · ${members.length} member(s) · ${results.length} CTF result(s) · ${writeups.length} write-up(s)`];
 case "whoami":return [language==="fr"?"Visiteur · accès en lecture seule":"Visitor · read-only access"];
 case "ls":return ["team/  members/  domains/  stats/  results/  achievements/  writeups/  socials/"];
 case "pwd":return ["/prime/ctf"];
 case "date":return [new Intl.DateTimeFormat(language==="fr"?"fr-FR":"en-US",{dateStyle:"medium",timeStyle:"medium"}).format(new Date())];
 case "ping":return [language==="fr"?"Signal simulé · aucune requête réseau envoyée.":"Simulated signal · no network request sent."];
 case "matrix":return ["01010000 01010010 01001001 01001101 01000101","wake up, CTF player..."];
 case "neofetch":return ["ΠΡΙΜΕ · CTF team · Lomé, Togo",`${members.length} ${language==="fr"?"membres publiés":"published members"} · ${data.domains.length} ${language==="fr"?"domaines":"domains"}`];
 case "fortune":{const f=language==="fr"?["Un bon write-up est une victoire partagée.","Lis les logs; les indices aiment s'y cacher.","La curiosité est un outil de pentest.","Un flag à la fois."]:["A good write-up is a shared victory.","Read the logs; clues like to hide there.","Curiosity is a pentester's tool.","One flag at a time."];return [f[history.length%f.length]];}
 case "history":return history.length?history.slice(-10).map((x,i)=>`${Math.max(1,history.length-Math.min(history.length,10)+i+1)}  ${x}`):[language==="fr"?"Aucune commande dans l'historique.":"No commands in history."];
 case "echo":{const t=input.slice(first.length).trim();return t?[t]:[];}
 case "clear":return [];
 default:return [language==="fr"?`Commande inconnue : ${name}. Tape help.`:`Unknown command: ${name}. Type help.`];
 }
}
