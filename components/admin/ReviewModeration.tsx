'use client';
import {useCallback,useEffect,useState} from 'react';
import {usePrimeStore} from '@/store/usePrimeStore';

type Status='pending'|'approved'|'rejected';
type Review={id:string;name:string;message:string;rating:number;status:Status;createdAt:string};
const filters:Status[]=['pending','approved','rejected'];

export default function ReviewModeration(){
 const {lang}=usePrimeStore();const isFr=lang==='fr';
 const [authenticated,setAuthenticated]=useState(false);
 const [checking,setChecking]=useState(true);
 const [csrf,setCsrf]=useState('');
 const [filter,setFilter]=useState<Status>('pending');
 const [reviews,setReviews]=useState<Review[]>([]);
 const [loading,setLoading]=useState(false);
 const [busyId,setBusyId]=useState('');
 const [error,setError]=useState('');
 const load=useCallback(async(status:Status)=>{
  setLoading(true);setError('');
  try{const response=await fetch(`/api/prime/reviews?status=${status}`,{cache:'no-store'});if(!response.ok)throw new Error('LOAD');const payload=await response.json() as {reviews:Review[]};setReviews(Array.isArray(payload.reviews)?payload.reviews:[])}
  catch{setError(isFr?'Impossible de charger les avis.':'Could not load reviews.')}finally{setLoading(false)}
 },[isFr]);
 useEffect(()=>{
  let active=true;
  (async()=>{try{const response=await fetch('/api/prime/auth',{cache:'no-store'});const auth=await response.json();if(!active)return;if(!response.ok||!auth.authenticated){setAuthenticated(false);return}setAuthenticated(true);setCsrf(typeof auth.csrf==='string'?auth.csrf:'');await load('pending')}catch{if(active)setError(isFr?'Vérification de session impossible.':'Could not verify the session.')}finally{if(active)setChecking(false)}})();
  return()=>{active=false};
 },[isFr,load]);
 async function changeStatus(review:Review,status:Exclude<Status,'pending'>){
  setBusyId(review.id);setError('');
  try{const response=await fetch('/api/prime/reviews',{method:'PATCH',headers:{'Content-Type':'application/json','x-csrf-token':csrf},body:JSON.stringify({id:review.id,status})});if(!response.ok)throw new Error('UPDATE');await load(filter)}
  catch{setError(isFr?'Modification refusée. Vérifie ta session puis réessaie.':'Update failed. Check your session and try again.')}finally{setBusyId('')}
 }
 const statusLabel=(status:Status)=>status==='pending'?(isFr?'À vérifier':'Pending'):status==='approved'?(isFr?'Publié':'Published'):(isFr?'Refusé':'Rejected');
 if(checking)return <main className="admin-shell admin-review-shell"><p role="status">{isFr?'Vérification de la session…':'Checking session…'}</p></main>;
 if(!authenticated)return <main className="admin-shell admin-review-shell"><a href="/admin">← {isFr?'Retour à l’administration':'Back to admin'}</a><h1>{isFr?'Modération des avis':'Review moderation'}</h1><p>{isFr?'Connecte-toi dans l’administration pour consulter les avis.':'Sign in through the admin page to view reviews.'}</p><a className="admin-review-action" href="/admin">{isFr?'Ouvrir l’administration':'Open admin'} ↗</a></main>;
 return <main className="admin-shell admin-review-shell">
  <header className="admin-review-page-header"><a href="/admin">← {isFr?'Administration':'Admin'}</a><a href="/">ΠΡΙΜΕ ↗</a></header>
  <p className="eyebrow">CONTROL ROOM / {isFr?'AVIS VISITEURS':'VISITOR REVIEWS'}</p><h1>{isFr?'Modération des avis':'Review moderation'}</h1><p className="admin-warning">{isFr?'Les avis restent conservés dans Supabase. Seuls les avis approuvés apparaissent publiquement.':'Reviews remain stored in Supabase. Only approved reviews appear publicly.'}</p>
  <nav className="admin-review-filters" aria-label={isFr?'Filtrer les avis':'Filter reviews'}>{filters.map(status=><button type="button" key={status} className={filter===status?'is-active':''} aria-pressed={filter===status} onClick={()=>{setFilter(status);void load(status)}}>{statusLabel(status)}</button>)}</nav>
  {error&&<p className="admin-review-error" role="alert">{error}</p>}
  {loading?<p role="status">{isFr?'Chargement…':'Loading…'}</p>:reviews.length===0?<p className="admin-review-empty">{isFr?'Aucun avis dans cette liste.':'No reviews in this list.'}</p>:<div className="admin-review-list">{reviews.map(review=><article className="admin-review-item" key={review.id}>
   <div className="admin-review-item-head"><div><h2>{review.name}</h2><p className="micro">{new Date(review.createdAt).toLocaleString(isFr?'fr-FR':'en-US')} · {statusLabel(review.status)}</p></div><strong aria-label={`${review.rating} / 5`}>{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</strong></div>
   <blockquote>{review.message}</blockquote>
   <div className="admin-review-actions">{review.status!=='approved'&&<button type="button" className="button primary" disabled={busyId===review.id} onClick={()=>void changeStatus(review,'approved')}>{isFr?'Approuver et publier':'Approve and publish'}</button>}{review.status!=='rejected'&&<button type="button" className="button" disabled={busyId===review.id} onClick={()=>void changeStatus(review,'rejected')}>{isFr?'Refuser':'Reject'}</button>}</div>
  </article>)}</div>}
 </main>;
}
