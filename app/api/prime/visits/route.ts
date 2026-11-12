import {NextResponse} from 'next/server';
import {transaction} from '@/lib/database';
import {sameOrigin,secure} from '@/lib/auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
function clearLegacyCookie(response:NextResponse){response.cookies.set('signal_visit','',{httpOnly:true,secure,sameSite:'strict',path:'/',maxAge:0});return response;}
export async function GET(){try{return clearLegacyCookie(NextResponse.json(await transaction(s=>({count:s.visits})),{headers}))}catch{return clearLegacyCookie(NextResponse.json({error:'STORAGE'},{status:503,headers}))}}
export async function POST(req:Request){
 if(!sameOrigin(req))return clearLegacyCookie(NextResponse.json({error:'ORIGIN'},{status:403,headers}));
 try{
  const count=await transaction(s=>{s.visits+=1;return s.visits});
  return clearLegacyCookie(NextResponse.json({count},{headers}));
 }catch{return clearLegacyCookie(NextResponse.json({error:'STORAGE'},{status:503,headers}))}
}
