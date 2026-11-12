import type {Data, Localized} from '@/types/prime';
const l = (fr:string,en:string):Localized => ({fr,en});
export const defaultData:Data = {
 version:1,
 texts:{
  hero:l('WE TEST OUR SKILLS, BREAK CODES AND OWN SYSTEMS','WE TEST OUR SKILLS, BREAK CODES AND OWN SYSTEMS'),
  intro:l('ΠΡΙΜΕ est une équipe CTF basée à Lomé, au Togo. Nous résolvons des challenges, recherchons les failles et partageons ce que nous apprenons.','ΠΡΙΜΕ is a CTF team based in Lomé, Togo. We solve challenges, investigate weaknesses, and share what we learn.'),
  signature:l('« Depuis Lomé, nous cherchons le signal dans le silence. »','“From Lomé, we look for the signal in the silence.”'),
  identity:l('Cinq opérateurs. Une curiosité commune. Nous explorons les systèmes pour comprendre leurs limites, ensemble.','Five operators. One shared curiosity. We explore systems to understand their limits, together.'),
  manifesto:l('WE DON’T MEMORIZE SOLUTIONS.\nWE LEARN HOW SYSTEMS FAIL.','WE DON’T MEMORIZE SOLUTIONS.\nWE LEARN HOW SYSTEMS FAIL.'),
  principles:[l('Observer avant d’agir.','Observe before acting.'),l('Comprendre avant d’exploiter.','Understand before exploiting.'),l('Documenter nos méthodes.','Document our methods.'),l('Partager nos connaissances.','Share our knowledge.'),l('Automatiser le répétitif.','Automate repetitive tasks.'),l('Progresser collectivement.','Progress together.'),l('Respecter les règles des compétitions.','Respect competition rules.'),l('Travailler uniquement en environnement autorisé.','Work only in authorized environments.')]
 },
 members:Array.from({length:5},(_,i)=>{const n=String(i+1).padStart(2,'0');return {id:`operator-${n}`,handle:`HANDLE_${n}`,publicId:`ID_${n} — PLACEHOLDER`,role:l(`ROLE_${n}`,`ROLE_${n}`),specialty:l(`SPECIALTY_${n}`,`SPECIALTY_${n}`),avatar:`AVATAR_${n}`,categories:[],certifications:[],active:true,order:i,published:true,links:[]};}),
 stats:[{id:'challenges',value:500,suffix:'+',label:l('Challenges résolus','Challenges solved')},{id:'ctfs',value:5,suffix:'+',label:l('CTF joués','CTFs played')},{id:'podiums',value:2,suffix:'',label:l('Podiums','Podiums')},{id:'points',value:15000,suffix:'+',label:l('Points totaux','Total points')}],
 categories:[{name:'WEB SECURITY',value:80},{name:'CRYPTOGRAPHY',value:60},{name:'REVERSE ENGINEERING',value:60},{name:'PWN',value:50},{name:'FORENSICS',value:80},{name:'OSINT',value:60},{name:'ARTIFICIAL INTELLIGENCE',value:50},{name:'MACHINE LEARNING',value:50},{name:'NETWORKING',value:70},{name:'HARDWARE',value:40},{name:'BLOCKCHAIN',value:40},{name:'CLOUD SECURITY',value:40},{name:'MISC',value:80},{name:'BOOT2ROOT',value:70}],
 domains:['WEB SECURITY','CRYPTOGRAPHY','REVERSE ENGINEERING','PWN','FORENSICS','OSINT','ARTIFICIAL INTELLIGENCE','MACHINE LEARNING','NETWORKING','HARDWARE','BLOCKCHAIN','CLOUD SECURITY','MISC','BOOT2ROOT'],
 achievements:[
  {id:'competition-deadface-ctf-2026',kind:'competition',title:{fr:"DEADFACE CTF 2026",en:"DEADFACE CTF 2026"},location:'',date:null,platform:'CTF',rank:773,totalTeams:990,score:"41,0000",ratingPoints:"0,167",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-securinets-ctf-quals-2026',kind:'competition',title:{fr:"Securinets CTF Quals 2026",en:"Securinets CTF Quals 2026"},location:'',date:null,platform:'CTF',rank:253,totalTeams:321,score:"391,0000",ratingPoints:"3,873",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-k17-ctf-2026',kind:'competition',title:{fr:"K17 CTF 2026",en:"K17 CTF 2026"},location:'',date:null,platform:'CTF',rank:207,totalTeams:930,score:"2100,0000",ratingPoints:"14,129",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-tfc-ctf-2026',kind:'competition',title:{fr:"TFC CTF 2026",en:"TFC CTF 2026"},location:'',date:null,platform:'CTF',rank:210,totalTeams:508,score:"548,0000",ratingPoints:"4,993",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-talldwarf-hosting-takeover',kind:'competition',title:{fr:"TallDwarf Hosting: Hosting Takeover",en:"TallDwarf Hosting: Hosting Takeover"},location:'',date:null,platform:'CTF',rank:3,totalTeams:168,score:"6993,0000",ratingPoints:"33,333",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-brunnerctf-2026',kind:'competition',title:{fr:"BrunnerCTF 2026",en:"BrunnerCTF 2026"},location:'',date:null,platform:'CTF',rank:809,totalTeams:1103,score:"210,0000",ratingPoints:"0,809",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-kali-team-ctf-26',kind:'competition',title:{fr:"Kali Team - CTF 26",en:"Kali Team - CTF 26"},location:'',date:null,platform:'CTF',rank:337,totalTeams:647,score:"350,0000",ratingPoints:"1,301",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-vuwctf-2026',kind:'competition',title:{fr:"VuwCTF 2026",en:"VuwCTF 2026"},location:'',date:null,platform:'CTF',rank:72,totalTeams:125,score:"300,0000",ratingPoints:"1,011",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-bushbash-ctf',kind:'competition',title:{fr:"BushBash CTF",en:"BushBash CTF"},location:'',date:null,platform:'CTF',rank:248,totalTeams:540,score:"900,0000",ratingPoints:"0,000",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-diver-osint-ctf-2026',kind:'competition',title:{fr:"DIVER OSINT CTF 2026",en:"DIVER OSINT CTF 2026"},location:'',date:null,platform:'CTF',rank:749,totalTeams:865,score:"70,0000",ratingPoints:"0,000",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-bdsec-ctf-2026',kind:'competition',title:{fr:"BDSec CTF 2026",en:"BDSec CTF 2026"},location:'',date:null,platform:'CTF',rank:202,totalTeams:545,score:"630,0000",ratingPoints:"2,187",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-athena-ctf',kind:'competition',title:{fr:"ATHENA CTF",en:"ATHENA CTF"},location:'',date:null,platform:'CTF',rank:149,totalTeams:450,score:"1660,0000",ratingPoints:"5,273",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-broncoctf-2026',kind:'competition',title:{fr:"BroncoCTF 2026",en:"BroncoCTF 2026"},location:'',date:null,platform:'CTF',rank:165,totalTeams:753,score:"1285,0000",ratingPoints:"6,029",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-byuctf-2026',kind:'competition',title:{fr:"BYUCTF 2026",en:"BYUCTF 2026"},location:'',date:null,platform:'CTF',rank:297,totalTeams:509,score:"744,0000",ratingPoints:"3,656",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-secleaf-q2-ctf-2026',kind:'competition',title:{fr:"SecLeaf Q2 CTF 2026",en:"SecLeaf Q2 CTF 2026"},location:'',date:null,platform:'CTF',rank:403,totalTeams:769,score:"2005,0000",ratingPoints:"0,000",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-0xv01d-ctf-2026',kind:'competition',title:{fr:"0xV01D CTF 2026",en:"0xV01D CTF 2026"},location:'',date:null,platform:'CTF',rank:142,totalTeams:689,score:"2228,0000",ratingPoints:"4,783",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-break-the-syntax-ctf-2026',kind:'competition',title:{fr:"Break The Syntax CTF 2026",en:"Break The Syntax CTF 2026"},location:'',date:null,platform:'CTF',rank:254,totalTeams:342,score:"50,0000",ratingPoints:"0,639",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-axiomctf-2026-quals',kind:'competition',title:{fr:"AxiomCTF 2026 Quals",en:"AxiomCTF 2026 Quals"},location:'',date:null,platform:'CTF',rank:93,totalTeams:821,score:"800,0000",ratingPoints:"2,725",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-ehax-ctf-2026',kind:'competition',title:{fr:"EHAX CTF 2026",en:"EHAX CTF 2026"},location:'',date:null,platform:'CTF',rank:470,totalTeams:887,score:"150,0000",ratingPoints:"0,420",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-univsthreats-26-quals-ctf',kind:'competition',title:{fr:"UniVsThreats 26 Quals CTF",en:"UniVsThreats 26 Quals CTF"},location:'',date:null,platform:'CTF',rank:202,totalTeams:314,score:"100,0000",ratingPoints:"0,620",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-bitsctf-2026',kind:'competition',title:{fr:"BITSCTF 2026",en:"BITSCTF 2026"},location:'',date:null,platform:'CTF',rank:712,totalTeams:859,score:"50,0000",ratingPoints:"0,387",context:{fr:'',en:''},highlights:[],skills:[],published:true},
  {id:'competition-0xfun-ctf-2026',kind:'competition',title:{fr:"0xFUN CTF 2026",en:"0xFUN CTF 2026"},location:'',date:null,platform:'CTF',rank:374,totalTeams:1352,score:"1156,0000",ratingPoints:"1,113",context:{fr:'',en:''},highlights:[],skills:[],published:true}
 ],
 writeups:[
  {id:'demo-web',title:l('Lire entre les requêtes','Reading between requests'),challenge:'PLACEHOLDER',ctf:'PLACEHOLDER',category:'WEB',difficulty:'MEDIUM',author:'HANDLE_01',date:null,excerpt:l('Aperçu de présentation : contexte, analyse et méthode de résolution. Aucune publication réelle.','Layout preview: context, analysis and resolution method. Not a real publication.'),tags:['HTTP','Analysis'],url:'',demo:true,published:true,content:l('DEMO — Cette entrée illustre la bibliothèque. Ajoutez un writeup réel et son lien Medium depuis l’administration.','DEMO — This entry illustrates the library. Add a real writeup and its Medium link in administration.')},
  {id:'demo-forensics',title:l('Ce que laisse le silence','What silence leaves behind'),challenge:'PLACEHOLDER',ctf:'PLACEHOLDER',category:'FORENSICS',difficulty:'EASY',author:'HANDLE_02',date:null,excerpt:l('Aperçu de présentation : observer les traces et documenter une démarche. Aucune publication réelle.','Layout preview: observing traces and documenting a method. Not a real publication.'),tags:['Evidence','Analysis'],url:'',demo:true,published:true,content:l('DEMO — Aucun challenge ni résultat de compétition n’est revendiqué.','DEMO — No challenge or competition result is claimed.')},
  {id:'demo-crypto',title:l('Questionner les évidences','Questioning assumptions'),challenge:'PLACEHOLDER',ctf:'PLACEHOLDER',category:'CRYPTO',difficulty:'HARD',author:'HANDLE_03',date:null,excerpt:l('Aperçu de présentation : comprendre un mécanisme avant de le tester. Aucune publication réelle.','Layout preview: understanding a mechanism before testing it. Not a real publication.'),tags:['Research','Method'],url:'',demo:true,published:true,content:l('DEMO — Remplacez cette entrée par votre recherche documentée.','DEMO — Replace this entry with your documented research.')}
 ],
 tools:[
  ['nmap','Nmap','Reconnaissance','Reconnaissance','Cartographier les services d’un périmètre autorisé.','Map services within an authorized scope.'],
  ['burp','Burp Suite','Tests web','Web testing','Inspecter et rejouer les échanges HTTP d’un challenge.','Inspect and replay challenge HTTP traffic.'],
  ['ghidra','Ghidra','Rétro-ingénierie','Reverse engineering','Analyser le comportement de binaires.','Analyze binary behavior.'],
  ['frida','Frida','Rétro-ingénierie','Reverse engineering','Instrumenter des processus de laboratoire.','Instrument laboratory processes.'],
  ['pwn','pwntools','Exploitation binaire','Binary exploitation','Prototyper des interactions et exploits en CTF.','Prototype CTF interactions and exploits.'],
  ['wireshark','Wireshark','Investigation numérique','Digital forensics','Examiner des captures réseau.','Examine network captures.'],
  ['python-crypto','Python','Cryptographie','Cryptography','Tester des hypothèses et manipuler des nombres.','Test hypotheses and manipulate numbers.'],
  ['osint','Recherche publique','OSINT','OSINT','Croiser des sources publiques dans le cadre d’un challenge.','Cross-reference public sources within a challenge.'],
  ['docker','Docker','Automatisation','Automation','Reproduire des environnements de challenge isolés.','Reproduce isolated challenge environments.'],
  ['python','Python','Automatisation','Automation','Automatiser les tâches répétitives.','Automate repetitive tasks.'],
  ['git','Git','Documentation','Reporting','Versionner les scripts et les notes techniques.','Version scripts and technical notes.']
 ].map(([id,name,fr,en,description,english])=>({id,name,group:l(fr,en),description:l(description,english),confirmed:false,published:true})),
 socials:[{id:'github',label:'GitHub',url:'https://github.com/prime-ctf-team',published:true},{id:'medium',label:'Medium',url:'https://medium.com/@prime-ctf-team',published:true},{id:'ctftime',label:'CTFtime',url:'https://ctftime.org/team/prime-ctf-team',published:true},{id:'discord',label:'Discord',url:'https://discord.com/',published:true}],
 palettes:[
  {id:'matrix',name:'Matrix Green',dark:'#0b3417',light:'#c9edc6',lightAccent:'#006b18',darkAccent:'#b7ff00',secondary:'#00a62e'},
  {id:'cyan',name:'Cyber Cyan',dark:'#073342',light:'#c5edf4',lightAccent:'#006a80',darkAccent:'#00e5ff',secondary:'#00b8d9'},
  {id:'ultraviolet',name:'Ultraviolet Protocol',dark:'#29153f',light:'#dccbf4',lightAccent:'#6522b8',darkAccent:'#c86bff',secondary:'#a245ff'},
  {id:'amber',name:'Amber Terminal',dark:'#3a2307',light:'#f6e2b5',lightAccent:'#9a4b00',darkAccent:'#ffba00',secondary:'#f07c00'},
  {id:'red',name:'Red Alert',dark:'#3a101a',light:'#f3cbd2',lightAccent:'#b00020',darkAccent:'#ff426b',secondary:'#f01446'}
 ],
 settings:{defaultTheme:'light',defaultPalette:'matrix',defaultLanguage:'fr',enable3d:true}
};
