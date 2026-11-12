import {useEffect,useMemo,useRef,useState} from 'react';
import type {Entry,Lang} from '@/types/prime';

type Props={achievements:Entry[];language:Lang};
const PAGE_SIZE=12;

function formatDate(date:string|null,language:Lang){
 if(!date)return language==='fr'?'Date non renseignée':'Date not provided';
 const parsed=new Date(date.includes('T')?date:`${date}T00:00:00Z`);
 if(Number.isNaN(parsed.getTime()))return date;
 return new Intl.DateTimeFormat(language==='fr'?'fr-FR':'en-US',{dateStyle:'medium',timeZone:'UTC'}).format(parsed);
}

function ResultMetrics({entry,language}:{entry:Entry;language:Lang}){
 const rank=entry.rank===null?'—':`${entry.rank} / ${entry.totalTeams??'—'}`;
 return <div className="result-metrics">
  <div className="result-rank-metric"><span>{language==='fr'?'RANG / ÉQUIPES':'RANK / TEAMS'}</span><strong>{rank}</strong></div>
  <div className="result-small-metric"><span>{language==='fr'?'POINTS CTF':'CTF POINTS'}</span><strong>{entry.score||'—'}</strong></div>
  <div className="result-small-metric"><span>RATING</span><strong>{entry.ratingPoints||'—'}</strong></div>
 </div>;
}

export function ResultsSection({achievements,language}:Props){
 const [open,setOpen]=useState(false);
 const [page,setPage]=useState(0);
 const [filter,setFilter]=useState<'ALL'|'1'|'2'|'3'>('ALL');
 const moreButtonRef=useRef<HTMLButtonElement>(null);
 const closeButtonRef=useRef<HTMLButtonElement>(null);
 const dialogRef=useRef<HTMLElement>(null);
 const results=useMemo(()=>achievements
  .filter(entry=>entry.published&&entry.kind==='competition')
  .slice()
  .sort((a,b)=>{
   if(a.rank===null)return b.rank===null?0:1;
   if(b.rank===null)return -1;
   return a.rank-b.rank||(b.totalTeams??0)-(a.totalTeams??0)||(b.date??'').localeCompare(a.date??'');
  }),[achievements]);
 const filteredResults=filter==='ALL'?results:results.filter(entry=>entry.rank===Number(filter));
 const featured=filteredResults.slice(0,3);
 const others=filteredResults.slice(3);
 const pageCount=Math.ceil(others.length/PAGE_SIZE);
 const visibleOthers=others.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);

 useEffect(()=>{
  if(!open)return;
  const oldOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  closeButtonRef.current?.focus();
  const onKeyDown=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){setOpen(false);return;}
   if(event.key!=='Tab'||!dialogRef.current)return;
   const focusables=Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],[tabindex]:not([tabindex="-1"])'));
   if(!focusables.length)return;
   const first=focusables[0],last=focusables[focusables.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  };
  document.addEventListener('keydown',onKeyDown);
  return()=>{document.body.style.overflow=oldOverflow;document.removeEventListener('keydown',onKeyDown);moreButtonRef.current?.focus();};
 },[open]);

 const dateLabel=(date:string|null)=>formatDate(date,language);
 const moreLabel=language==='fr'?'Voir tous les résultats':'View all results';
 const closeLabel=language==='fr'?'Fermer la fenêtre':'Close dialog';
 const title=language==='fr'?'Tous les résultats':'All results';
 const filters=[
  {id:'ALL' as const,label:language==='fr'?'TOUT':'ALL'},
  {id:'1' as const,label:language==='fr'?'1RE PLACE':'1ST PLACE'},
  {id:'2' as const,label:language==='fr'?'2E PLACE':'2ND PLACE'},
  {id:'3' as const,label:language==='fr'?'3E PLACE':'3RD PLACE'},
 ];
 const emptyLabel=filter==='ALL'?(language==='fr'?'Aucun résultat publié pour le moment.':'No published results yet.'):(language==='fr'?'Aucun résultat pour ce classement.':'No results for this placement.');

 return <section className="section" id="achievements">
  <p className="eyebrow">04 / {language==='fr'?'JOURNAL':'LOG'}</p>
  <h2 className="display reveal">{language==='fr'?'NOS RÉSULTATS':'OUR RESULTS'}</h2>
  <div className="filter-tabs results-filter-tabs" role="group" aria-label={language==='fr'?'Filtrer les résultats par rang':'Filter results by rank'}>
   {filters.map(({id,label})=><button key={id} type="button" aria-pressed={filter===id} onClick={()=>{setFilter(id);setPage(0);}}>{label}</button>)}
  </div>
  {featured.length>0?<div className="results-grid">
   {featured.map((entry,index)=><article className="result-card" key={entry.id}>
    <div className="result-card-head"><span className="result-label">TOP 3 · {index+1}/3</span><span className="result-date">{dateLabel(entry.date)}</span></div>
    <div className="result-event"><p className="result-platform">{entry.platform||'CTF'}</p><h3>{entry.title[language]}</h3></div>
    <ResultMetrics entry={entry} language={language}/>
   </article>)}
  </div>:<p className="empty-state">{emptyLabel}</p>}
  {others.length>0&&<button ref={moreButtonRef} className="results-more-button" type="button" aria-haspopup="dialog" aria-expanded={open} onClick={()=>{setPage(0);setOpen(true);}}>
   <span>{moreLabel}</span><span className="results-count">{others.length}</span><span aria-hidden="true">↗</span>
  </button>}
  {open&&<div className="results-modal-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setOpen(false);}}>
   <section className="results-modal" role="dialog" aria-modal="true" aria-labelledby="results-modal-title" ref={dialogRef} tabIndex={-1}>
    <header className="results-modal-header"><div><p className="eyebrow">{language==='fr'?'ARCHIVE CTF':'CTF ARCHIVE'}</p><h2 id="results-modal-title">{title}</h2><p className="results-modal-count">{others.length} {language==='fr'?'autres compétitions':'more competitions'}</p></div><button ref={closeButtonRef} type="button" className="results-modal-close" aria-label={closeLabel} onClick={()=>setOpen(false)}>×</button></header>
    <div className="results-modal-list" aria-live="polite">
     {visibleOthers.map((entry,index)=><article className="result-archive-card" key={entry.id}>
      <div className="archive-index">{String(page*PAGE_SIZE+index+4).padStart(2,'0')}</div>
      <div className="archive-main"><p className="result-date">{dateLabel(entry.date)} <span aria-hidden="true">/</span> {entry.platform||'CTF'}</p><h3>{entry.title[language]}</h3></div>
      <ResultMetrics entry={entry} language={language}/>
     </article>)}
    </div>
    {pageCount>1&&<div className="results-modal-pagination"><button type="button" onClick={()=>setPage(current=>Math.max(0,current-1))} disabled={page===0}>{language==='fr'?'Précédent':'Previous'}</button><span>Page {page+1} / {pageCount}</span><button type="button" onClick={()=>setPage(current=>Math.min(pageCount-1,current+1))} disabled={page+1>=pageCount}>{language==='fr'?'Suivant':'Next'}</button></div>}
   </section>
  </div>}
 </section>;
}
