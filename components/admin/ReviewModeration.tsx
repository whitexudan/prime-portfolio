'use client';
import {useCallback,useEffect,useState} from 'react';
import {usePrimeStore} from '@/store/usePrimeStore';

type Status='pending'|'approved'|'rejected';
type Review={id:string;name:string;message:string;rating:number;status:Status;createdAt:string};
const filters:Status[]=['pending','approved','rejected'];

export default function ReviewModeration({csrf}:{csrf:string}){
 const {lang}=usePrimeStore();const isFr=lang==='fr';
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
 useEffect(()=>{void load('pending')},[load]);
 async function changeStatus(review:Review,status:Exclude<Status,'pending'>){
  setBusyId(review.id);setError('');
  try{const response=await fetch('/api/prime/reviews',{method:'PATCH',headers:{'Content-Type':'application/json','x-csrf-token':csrf},body:JSON.stringify({id:review.id,status})});if(!response.ok)throw new Error('UPDATE');await load(filter)}
  catch{setError(isFr?'Modification refusée. Vérifie ta session puis réessaie.':'Update failed. Check your session and try again.')}finally{setBusyId('')}
 }
 async function deleteRejected(review:Review){
  if(review.status!=='rejected')return;
  const confirmed=window.confirm(isFr?`Supprimer définitivement l’avis de « ${review.name} » ? Cette action est irréversible.`:`Permanently delete ${review.name}’s review? This cannot be undone.`);
  if(!confirmed)return;
  setBusyId(review.id);setError('');
  try{
   const response=await fetch('/api/prime/reviews',{method:'DELETE',headers:{'Content-Type':'application/json','x-csrf-token':csrf},body:JSON.stringify({id:review.id})});
   if(!response.ok)throw new Error('DELETE');
   setReviews(current=>current.filter(item=>item.id!==review.id));
  }catch{setError(isFr?'Suppression impossible. Vérifie ta session puis réessaie.':'Could not delete the review. Check your session and try again.')}finally{setBusyId('')}
 }
 const statusLabel=(status:Status)=>status==='pending'?(isFr?'À vérifier':'Pending'):status==='approved'?(isFr?'Publié':'Published'):(isFr?'Refusé':'Rejected');
 return <section className="admin-review-embedded" aria-labelledby="admin-review-title">
  <header className="admin-review-embedded-heading"><div><p className="admin-kicker">CONTROL ROOM / {isFr?'AVIS VISITEURS':'VISITOR REVIEWS'}</p><h2 id="admin-review-title">{isFr?'Modération des avis':'Review moderation'}</h2><p>{isFr?'Les avis restent conservés dans Supabase. Seuls les avis approuvés apparaissent sur le site.':'Reviews remain stored in Supabase. Only approved reviews appear on the site.'}</p></div><button type="button" className="admin-review-refresh" onClick={()=>void load(filter)} disabled={loading}>{loading?(isFr?'Actualisation…':'Refreshing…'):(isFr?'Actualiser':'Refresh')}</button></header>
  <div className="admin-review-toolbar"><nav className="admin-review-filters" aria-label={isFr?'Filtrer les avis':'Filter reviews'}>{filters.map(status=><button type="button" key={status} className={filter===status?'is-active':''} aria-pressed={filter===status} onClick={()=>{setFilter(status);void load(status)}}>{statusLabel(status)}</button>)}</nav><p className="admin-review-count">{reviews.length} {isFr?'avis dans cette vue':'reviews in this view'}</p></div>
  {error&&<p className="admin-review-error" role="alert">{error}</p>}
  {loading?<p className="admin-review-empty" role="status">{isFr?'Chargement…':'Loading…'}</p>:reviews.length===0?<p className="admin-review-empty">{isFr?'Aucun avis dans cette liste.':'No reviews in this list.'}</p>:<div className="admin-review-list">{reviews.map(review=><article className="admin-review-item" key={review.id}>
   <div className="admin-review-item-head"><div><h3>{review.name}</h3><p className="micro">{new Date(review.createdAt).toLocaleString(isFr?'fr-FR':'en-US')} · {statusLabel(review.status)}</p></div><strong aria-label={`${review.rating} / 5`}>{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</strong></div>
   <blockquote>{review.message}</blockquote>
   <div className="admin-review-actions">{review.status!=='approved'&&<button type="button" className="button primary" disabled={busyId===review.id} onClick={()=>void changeStatus(review,'approved')}>{isFr?'Approuver et publier':'Approve and publish'}</button>}{review.status!=='rejected'&&<button type="button" className="button" disabled={busyId===review.id} onClick={()=>void changeStatus(review,'rejected')}>{isFr?'Refuser':'Reject'}</button>}{review.status==='rejected'&&<button type="button" className="button" disabled={busyId===review.id} onClick={()=>void deleteRejected(review)}>{busyId===review.id?(isFr?'Suppression…':'Deleting…'):(isFr?'Supprimer définitivement':'Delete permanently')}</button>}</div>
  </article>)}</div>}
 </section>;
}
