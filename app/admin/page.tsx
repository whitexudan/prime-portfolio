import type {Metadata} from 'next';
import {session} from '@/lib/auth';
import {configured} from '@/lib/crypto';
import AdminDashboard from '@/components/admin/AdminDashboard';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'ΠΡΙΜΕ',robots:{index:false,follow:false}};
export default async function Admin(){const s=await session();return <AdminDashboard authenticated={!!s} csrf={typeof s?.csrf==='string'?s.csrf:''} configured={configured()}/>}
