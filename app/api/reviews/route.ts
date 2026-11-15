import {createHmac} from 'node:crypto';
import {NextResponse} from 'next/server';
import {boundedJson,sameOrigin} from '@/lib/auth';
import {reviewSubmissionSchema} from '@/lib/reviews';
import {supabaseAdmin} from '@/lib/supabase-admin';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
const accepted=()=>NextResponse.json({ok:true,pending:true},{status:202,headers});

function visitorFingerprint(request:Request){
 // Vercel overwrites x-forwarded-for with the public client IP; never persist the raw value.
 const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||request.headers.get('x-real-ip')?.trim();
 const secret=process.env.SUPABASE_SECRET_KEY;
 return ip&&secret?createHmac('sha256',secret).update(ip).digest('hex'):null;
}

export async function GET(){
 try{
  const {data,error}=await supabaseAdmin().from('prime_reviews').select('id,visitor_name,review_text,rating,created_at').eq('status','approved').order('created_at',{ascending:false}).limit(60);
  if(error)return NextResponse.json({error:'REVIEWS_UNAVAILABLE'},{status:503,headers});
  const reviews=(data??[]).map(row=>({id:row.id,name:row.visitor_name,message:row.review_text,rating:row.rating,createdAt:row.created_at}));
  return NextResponse.json({reviews},{headers});
 }catch{return NextResponse.json({error:'REVIEWS_UNAVAILABLE'},{status:503,headers})}
}

export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:'ORIGIN'},{status:403,headers});
 let raw:unknown;
 try{raw=await boundedJson(request,8*1024)}catch{return NextResponse.json({error:'INVALID_REQUEST'},{status:400,headers})}
 // Silently accept the honeypot so simple bots do not learn the detection rule.
 if(raw&&typeof raw==='object'&&!Array.isArray(raw)&&typeof (raw as Record<string,unknown>).website==='string'&&(raw as Record<string,string>).website.trim())return accepted();
 const parsed=reviewSubmissionSchema.safeParse(raw);
 if(!parsed.success)return NextResponse.json({error:'VALIDATION'},{status:400,headers});
 const value=parsed.data;
 if(Date.now()-value.startedAt<2500)return NextResponse.json({error:'TOO_FAST'},{status:400,headers});
 try{
  const fingerprint=visitorFingerprint(request);
  const {data:reviewId,error}=await supabaseAdmin().rpc('prime_reviews_submit',{
   p_fingerprint:fingerprint,
   p_visitor_name:value.name,
   p_review_text:value.message,
   p_rating:value.rating,
  });
  if(error)return NextResponse.json({error:'REVIEW_SAVE_FAILED'},{status:503,headers});
  // A null result means the atomic per-IP submission window has not elapsed.
  if(typeof reviewId!=='string')return NextResponse.json({error:'RATE_LIMITED'},{status:429,headers});
  return accepted();
 }catch{return NextResponse.json({error:'REVIEW_SAVE_FAILED'},{status:503,headers})}
}
