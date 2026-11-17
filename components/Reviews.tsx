'use client';
import {useCallback,useEffect,useId,useRef,useState,type FormEvent} from 'react';
import {createPortal} from 'react-dom';

type Lang='fr'|'en';
type PublicReview={id:string;name:string;message:string;rating:number;createdAt:string};
type Notice='success'|'invalid'|'limited'|'error'|null;

export function ReviewLauncher({language}:{language:Lang}){
 const isFr=language==='fr';
 const [ready,setReady]=useState(false);
 const [expanded,setExpanded]=useState(false);
 const [name,setName]=useState('');
 const [message,setMessage]=useState('');
 const [rating,setRating]=useState(4);
 const [hoverRating,setHoverRating]=useState<number|null>(null);
 const displayedRating=hoverRating??rating;
 const [startedAt,setStartedAt]=useState(0);
 const [sending,setSending]=useState(false);
 const [notice,setNotice]=useState<Notice>(null);
 const launcherRef=useRef<HTMLButtonElement>(null);
 const nameRef=useRef<HTMLInputElement>(null);
 function restoreLauncherFocus(){
  if(window.matchMedia('(max-width: 1150px)').matches){
   const mobileLauncher=document.querySelector<HTMLButtonElement>('.mobile-tools-launcher');
   if(mobileLauncher){mobileLauncher.focus();return}
  }
  launcherRef.current?.focus();
 }
 useEffect(()=>setReady(true),[]);
 useEffect(()=>{
  const openFromMobile=()=>{setStartedAt(Date.now());setNotice(null);setExpanded(true)};
  window.addEventListener('prime:open-reviews',openFromMobile);
  return()=>window.removeEventListener('prime:open-reviews',openFromMobile);
 },[]);
 useEffect(()=>{
  if(!expanded)return;
  const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape'){setExpanded(false);restoreLauncherFocus()}};
  window.addEventListener('keydown',onKey);
  const focus=window.setTimeout(()=>nameRef.current?.focus(),60);
  return()=>{window.removeEventListener('keydown',onKey);window.clearTimeout(focus)};
 },[expanded]);
 function toggle(){
  const next=!expanded;
  if(next){setStartedAt(Date.now());setNotice(null)}
  setExpanded(next);
 }
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setSending(true);setNotice(null);
  try{
   const response=await fetch('/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,message,rating,website:(new FormData(event.currentTarget).get('website')??'').toString(),startedAt})});
   if(!response.ok){setNotice(response.status===429?'limited':response.status===400?'invalid':'error');return}
   setName('');setMessage('');setRating(4);setHoverRating(null);setStartedAt(Date.now());setNotice('success');
  }catch{setNotice('error')}finally{setSending(false)}
 }
 const widget=(
  <div className="visitor-review-layer">
   <button ref={launcherRef} className="visitor-review-launcher" type="button" onClick={toggle} aria-label={isFr?'Laisser un avis':'Leave a review'} aria-expanded={expanded} aria-controls="visitor-review-panel" title={isFr?'Laisser un avis':'Leave a review'}>
    <span className="visitor-review-launcher-star" aria-hidden="true">★</span><span className="visitor-review-launcher-text">{isFr?'Laisser un avis':'Leave a review'}</span>
   </button>
   {expanded&&<section className="visitor-review-panel" id="visitor-review-panel" role="dialog" aria-modal="false" aria-labelledby="visitor-review-title">
    <header className="visitor-review-panel-head"><div><p className="eyebrow">{isFr?'ESPACE VISITEUR':'VISITOR SPACE'}</p><h2 id="visitor-review-title">{isFr?'Votre avis compte':'Your feedback matters'}</h2></div><button type="button" className="visitor-review-close" onClick={()=>{setExpanded(false);restoreLauncherFocus()}} aria-label={isFr?'Fermer':'Close'}><svg className="visitor-review-close-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg></button></header>
    <p className="visitor-review-note">{isFr?'Les avis sont vérifiés avant leur publication.':'Reviews are checked before publication.'}</p>
    <form className="visitor-review-form" onSubmit={submit}>
     <div className="visitor-review-field">
      <label htmlFor="visitor-review-name"><span>{isFr?'Votre nom':'Your name'}</span><span className="visitor-review-field-meta">01</span></label>
      <input ref={nameRef} id="visitor-review-name" name="name" value={name} onChange={e=>setName(e.currentTarget.value)} minLength={2} maxLength={60} autoComplete="name" placeholder={isFr?'Ex. Afi K.':'e.g. Alex K.'} required />
     </div>
     <fieldset className="visitor-review-rating"><legend><span className="visitor-review-field-meta">02</span>{isFr?'Votre note':'Your rating'}</legend><div className="visitor-review-stars" role="radiogroup" aria-label={isFr?'Note de 1 à 5 étoiles':'Rating from 1 to 5 stars'}>{[1,2,3,4,5].map(value=><label className={`visitor-review-star-option${displayedRating>=value?' is-active':''}${rating===value?' is-selected':''}`} key={value} onMouseEnter={()=>setHoverRating(value)} onMouseLeave={()=>setHoverRating(null)}><input type="radio" name="visitor-rating" value={value} checked={rating===value} onChange={()=>{setRating(value);setHoverRating(null)}} onFocus={()=>setHoverRating(value)} onBlur={()=>setHoverRating(null)} aria-label={isFr?`${value} étoile${value>1?'s':''}`:`${value} star${value>1?'s':''}`} /><svg className="visitor-review-star-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.4l2.96 6 6.62.96-4.79 4.67 1.13 6.6L12 17.51l-5.92 3.12 1.13-6.6-4.79-4.67L9.04 8.4 12 2.4z"/></svg></label>)}</div></fieldset>
     <div className="visitor-review-field visitor-review-message-field">
      <label htmlFor="visitor-review-message"><span>{isFr?'Votre avis':'Your review'}</span><span className="visitor-review-field-meta">{message.length}/700</span></label>
      <textarea id="visitor-review-message" name="review" value={message} onChange={e=>setMessage(e.currentTarget.value)} minLength={15} maxLength={700} rows={4} placeholder={isFr?'Merci de laisser un avis pour ΠΡΙΜΕ!':'Please leave a review for ΠΡΙΜΕ!"'} required />
     </div>
     <div className="visitor-review-honeypot" aria-hidden="true"><label htmlFor="visitor-review-website">{isFr?'Ne pas remplir':'Leave this empty'}</label><input id="visitor-review-website" name="website" tabIndex={-1} autoComplete="off" /></div>
     {notice&&<p className={`visitor-review-notice ${notice==='success'?'is-success':'is-error'}`} role="status">{notice==='success'?(isFr?'Merci ! Votre avis est enregistré et sera publié après vérification.':'Thank you! Your review is saved and will be published after moderation.'):notice==='limited'?(isFr?'Merci de patienter avant d’envoyer un nouvel avis.':'Please wait before submitting another review.'):notice==='invalid'?(isFr?'Vérifiez le nom, la note et la longueur du texte.':'Check the name, rating, and review length.'):isFr?'Envoi impossible pour le moment. Réessayez plus tard.':'Could not submit right now. Please try again later.'}</p>}
     <button className="visitor-review-submit" type="submit" disabled={sending}>{sending?(isFr?'Envoi…':'Submitting…'):(isFr?'Envoyer mon avis':'Submit review')} <span aria-hidden="true">↗</span></button>
    </form>
   </section>}
   <MobileToolsLauncher language={language}/>
  </div>
 );
 return ready?createPortal(widget,document.body):null;
}

function MobileToolsLauncher({language}:{language:Lang}){
 const isFr=language==='fr';
 const [ready,setReady]=useState(false);
 const [open,setOpen]=useState(false);
 const launcherRef=useRef<HTMLButtonElement>(null);
 const menuId=`mobile-tools-${useId().replace(/:/g,'')}`;
 useEffect(()=>setReady(true),[]);
 useEffect(()=>{
  if(!open)return;
  const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);launcherRef.current?.focus()}};
  window.addEventListener('keydown',onKey);
  return()=>window.removeEventListener('keydown',onKey);
 },[open]);
 function openTool(tool:'terminal'|'reviews'){
  setOpen(false);
  window.dispatchEvent(new Event(tool==='terminal'?'prime:open-terminal':'prime:open-reviews'));
 }
 const widget=(
  <div className="mobile-tools-layer">
   <div className="mobile-tools-menu" id={menuId} role="group" aria-label={isFr?'Outils du site':'Site tools'} hidden={!open}>
    <button type="button" className="mobile-tools-option" onClick={()=>openTool('terminal')}>
     <span className="mobile-tools-option-icon" aria-hidden="true">&gt;_</span>
     <span className="mobile-tools-option-copy"><strong>Terminal</strong><small>{isFr?'Explorer le terminal':'Explore the terminal'}</small></span>
     <span className="mobile-tools-option-arrow" aria-hidden="true">↗</span>
    </button>
    <button type="button" className="mobile-tools-option" onClick={()=>openTool('reviews')}>
     <span className="mobile-tools-option-icon is-review" aria-hidden="true">★</span>
     <span className="mobile-tools-option-copy"><strong>{isFr?'Laisser un avis':'Leave a review'}</strong><small>{isFr?'Partager votre expérience':'Share your experience'}</small></span>
     <span className="mobile-tools-option-arrow" aria-hidden="true">↗</span>
    </button>
   </div>
   <button ref={launcherRef} type="button" className="mobile-tools-launcher" onClick={()=>setOpen(value=>!value)} aria-label={open?(isFr?'Fermer les outils':'Close tools'):(isFr?'Ouvrir les outils':'Open tools')} aria-expanded={open} aria-controls={menuId}>
    <span aria-hidden="true">{open?'×':'+'}</span>
   </button>
  </div>
 );
 return ready?createPortal(widget,document.body):null;
}

function ReviewCard({review,language}:{review:PublicReview;language:Lang}){
 const date=new Date(review.createdAt);
 const formatted=Number.isNaN(date.getTime())?'':new Intl.DateTimeFormat(language==='fr'?'fr-FR':'en-US',{year:'numeric',month:'short',day:'numeric'}).format(date);
 return <article className="visitor-review-card">
  <div className="visitor-review-card-top"><span className="visitor-review-quote" aria-hidden="true">“</span><span className="visitor-review-card-stars" aria-label={`${review.rating} / 5`}><span aria-hidden="true">{'★'.repeat(review.rating)}</span><span className="visitor-review-card-stars-empty" aria-hidden="true">{'☆'.repeat(5-review.rating)}</span></span></div>
  <blockquote>{review.message}</blockquote>
  <footer><strong>{review.name}</strong>{formatted&&<time dateTime={review.createdAt}>{formatted}</time>}</footer>
 </article>
}

export function ReviewsSection({language}:{language:Lang}){
 const isFr=language==='fr';
 const [reviews,setReviews]=useState<PublicReview[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState(false);
 const [paused,setPaused]=useState(false);
 const [reducedMotion,setReducedMotion]=useState(false);
 const load=useCallback(async()=>{
  setLoading(true);setError(false);
  try{const response=await fetch('/api/reviews',{cache:'no-store'});if(!response.ok)throw new Error('REVIEWS');const payload=await response.json() as {reviews:PublicReview[]};setReviews(Array.isArray(payload.reviews)?payload.reviews:[])}
  catch{setError(true)}finally{setLoading(false)}
 },[]);
 useEffect(()=>{void load()},[load]);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>setReducedMotion(media.matches);sync();media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync)},[]);
 const canMove=reviews.length>=3&&!reducedMotion;
 const average=reviews.length?reviews.reduce((sum,review)=>sum+review.rating,0)/reviews.length:0;
 return <section className="section visitor-reviews-section" id="visitor-reviews" aria-labelledby="visitor-reviews-title">
  <div className="visitor-reviews-heading"><div><p className="eyebrow review-eyebrow">{isFr?'VOIX DE LA COMMUNAUTÉ':'COMMUNITY VOICES'}</p><h2 className="display" id="visitor-reviews-title">{isFr?'Avis visiteurs':'Visitor reviews'}</h2><p className="visitor-reviews-intro">{isFr?'Les impressions de celles et ceux qui ont découvert notre travail.':'Thoughts from people who have explored our work.'}</p></div>{reviews.length>0&&<div className="visitor-review-summary"><strong>{average.toFixed(1)}<span>/5</span></strong><span aria-hidden="true">★</span><small>{reviews.length} {isFr?'avis publiés':'published reviews'}</small></div>}</div>
  {loading?<p className="visitor-reviews-state" role="status">{isFr?'Chargement des avis…':'Loading reviews…'}</p>:error?<p className="visitor-reviews-state" role="status">{isFr?'Les avis sont momentanément indisponibles.':'Reviews are temporarily unavailable.'} <button type="button" onClick={()=>void load()}>{isFr?'Réessayer':'Retry'}</button></p>:reviews.length===0?<p className="visitor-reviews-state">{isFr?'Aucun avis publié pour le moment. Soyez le premier à partager votre expérience.':'No reviews published yet. Be the first to share your experience.'}</p>:<>
   {canMove&&<button className="visitor-reviews-motion" type="button" onClick={()=>setPaused(value=>!value)} aria-pressed={paused}>{paused?(isFr?'Reprendre le défilement':'Resume carousel'):(isFr?'Mettre en pause':'Pause carousel')}</button>}
   <div className={`visitor-review-window ${canMove?'is-moving':''} ${paused?'is-paused':''}`} role="region" aria-roledescription={isFr?'carrousel':'carousel'} aria-label={isFr?'Avis publiés':'Published visitor reviews'}>
    <div className="visitor-review-track">
     <div className={`visitor-review-group ${canMove?'':'is-static'}`}>{reviews.map(review=><ReviewCard key={`a-${review.id}`} review={review} language={language}/>)}</div>
     {canMove&&<div className="visitor-review-group" aria-hidden="true">{reviews.map(review=><ReviewCard key={`b-${review.id}`} review={review} language={language}/>)}</div>}
    </div>
   </div>
  </>}
 </section>;
}
