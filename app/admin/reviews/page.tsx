import type {Metadata} from 'next';
import ReviewModeration from '@/components/admin/ReviewModeration';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Avis visiteurs — ΠΡΙΜΕ',robots:{index:false,follow:false}};

export default function AdminReviews(){return <ReviewModeration/>}
