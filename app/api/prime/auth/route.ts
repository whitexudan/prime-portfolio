import {NextResponse} from 'next/server';
import {createSession,session,sameOrigin,authorized,cookieOptions,SESSION_COOKIE,boundedJson} from '@/lib/auth';
import {configured,verifyPassword} from '@/lib/crypto';
import {transaction} from '@/lib/database';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(){const s=await session();return NextResponse.json({authenticated:!!s,configured:configured(),csrf:s?.csrf||null},{headers})}
export async function POST(req:Request){
 if(!sameOrigin(req))return NextResponse.json({error:'ORIGIN'},{status:403,headers});
 if(!configured())return NextResponse.json({error:'NOT_CONFIGURED'},{status:503,headers});
 try{
  const body=await boundedJson(req,2048) as {password?:unknown};
  if(typeof body.password!=='string'||body.password.length>1024)return NextResponse.json({error:'INVALID'},{status:400,headers});
  // Global persistent throttle: no IPs or personal data stored. Reserve attempt before costly scrypt.
  const blocked=await transaction(s=>{const now=Date.now();s.loginFailures=s.loginFailures.filter(t=>now-t<900000);if(s.loginBlockedUntil>now)return true;if(s.loginFailures.length>=5){s.loginBlockedUntil=now+900000;return true}s.loginFailures.push(now);return false});
  if(blocked)return NextResponse.json({error:'RATE_LIMIT'},{status:429,headers:{...headers,'Retry-After':'900'}});
  if(!await verifyPassword(body.password))return NextResponse.json({error:'INVALID'},{status:401,headers});
  await transaction(s=>{s.loginFailures=[];s.loginBlockedUntil=0});
  const res=NextResponse.json({ok:true},{headers});res.cookies.set(SESSION_COOKIE,createSession(),cookieOptions);return res;
 }catch{return NextResponse.json({error:'LOGIN_FAILED'},{status:400,headers})}
}
export async function DELETE(req:Request){if(!await authorized(req))return NextResponse.json({error:'UNAUTHORIZED'},{status:403,headers});const res=NextResponse.json({ok:true},{headers});res.cookies.set(SESSION_COOKIE,'',{...cookieOptions,maxAge:0});return res}
