import {NextResponse} from 'next/server';
import {getData} from '@/lib/database';
import {session} from '@/lib/auth';
import {AVATAR_BUCKET,supabaseAdmin} from '@/lib/supabase-admin';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const filenamePattern=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(?:jpg|png|webp)$/;
const mimeByExtension:Record<string,string>={jpg:'image/jpeg',png:'image/png',webp:'image/webp'};
type RouteContext={params:Promise<{filename:string}>};
export async function GET(_request:Request,{params}:RouteContext){
 const {filename}=await params;
 if(!filenamePattern.test(filename))return new Response(null,{status:404});
 const url=`/api/prime/avatars/${filename}`;
 const data=await getData().catch(()=>null);
 const isPublic=!!data?.members.some(member=>member.published&&member.avatarUrl===url);
 const isAdmin=!!(await session().catch(()=>null));
 if(!isPublic&&!isAdmin)return new Response(null,{status:404});
 try{
  const {data:blob,error}=await supabaseAdmin().storage.from(AVATAR_BUCKET).download(filename);
  if(error||!blob)return new Response(null,{status:404});
  const ext=filename.slice(filename.lastIndexOf('.')+1);
  return new NextResponse(new Uint8Array(await blob.arrayBuffer()),{status:200,headers:{'Content-Type':mimeByExtension[ext],'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','Content-Disposition':'inline'}});
 }catch{return new Response(null,{status:404})}
}
