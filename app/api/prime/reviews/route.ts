import {NextResponse} from 'next/server';
import {authorized,boundedJson,session} from '@/lib/auth';
import {reviewModerationSchema,type ReviewStatus} from '@/lib/reviews';
import {supabaseAdmin} from '@/lib/supabase-admin';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
const statuses:ReviewStatus[]=['pending','approved','rejected'];

export async function GET(request:Request){
 if(!await session())return NextResponse.json({error:'UNAUTHORIZED'},{status:401,headers});
 const status=new URL(request.url).searchParams.get('status') as ReviewStatus|null;
 if(!status||!statuses.includes(status))return NextResponse.json({error:'INVALID_STATUS'},{status:400,headers});
 try{
  const {data,error}=await supabaseAdmin().from('prime_reviews').select('id,visitor_name,review_text,rating,status,created_at').eq('status',status).order('created_at',{ascending:false}).limit(100);
  if(error)return NextResponse.json({error:'REVIEWS_UNAVAILABLE'},{status:503,headers});
  const reviews=(data??[]).map(row=>({id:row.id,name:row.visitor_name,message:row.review_text,rating:row.rating,status:row.status,createdAt:row.created_at}));
  return NextResponse.json({reviews},{headers});
 }catch{return NextResponse.json({error:'REVIEWS_UNAVAILABLE'},{status:503,headers})}
}

export async function PATCH(request:Request){
 if(!await authorized(request))return NextResponse.json({error:'UNAUTHORIZED'},{status:403,headers});
 try{
  const raw=await boundedJson(request,2048);
  const parsed=reviewModerationSchema.safeParse(raw);
  if(!parsed.success)return NextResponse.json({error:'VALIDATION'},{status:400,headers});
  const {id,status}=parsed.data;
  const {data,error}=await supabaseAdmin().from('prime_reviews').update({status}).eq('id',id).select('id,visitor_name,review_text,rating,status,created_at').maybeSingle();
  if(error)return NextResponse.json({error:'REVIEW_UPDATE_FAILED'},{status:503,headers});
  if(!data)return NextResponse.json({error:'NOT_FOUND'},{status:404,headers});
  return NextResponse.json({review:{id:data.id,name:data.visitor_name,message:data.review_text,rating:data.rating,status:data.status,createdAt:data.created_at}},{headers});
 }catch{return NextResponse.json({error:'INVALID_REQUEST'},{status:400,headers})}
}
