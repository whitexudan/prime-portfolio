import {NextResponse} from 'next/server';
import {getData,transaction,revision,publicData} from '@/lib/database';
import {session,authorized,boundedJson} from '@/lib/auth';
import {dataSchema} from '@/lib/schema';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(req:Request){try{const data=await getData();if(new URL(req.url).searchParams.get('admin')==='1'){if(!await session())return NextResponse.json({error:'UNAUTHORIZED'},{status:401,headers});return NextResponse.json({data,revision:revision(data)},{headers})}return NextResponse.json({data:publicData(data)},{headers})}catch{return NextResponse.json({error:'STORAGE'},{status:503,headers})}}
export async function PUT(req:Request){
 if(!await authorized(req))return NextResponse.json({error:'UNAUTHORIZED'},{status:403,headers});
 try{
  const body=await boundedJson(req) as {data:unknown;revision:string};const parsed=dataSchema.safeParse(body.data);
  if(!parsed.success)return NextResponse.json({error:'VALIDATION',issues:parsed.error.issues.map(i=>({path:i.path.join('.'),code:i.code}))},{status:400,headers});
  const result=await transaction(s=>{if(body.revision!==revision(s.data))return null;s.data=parsed.data;return {data:s.data,revision:revision(s.data)}});
  if(!result)return NextResponse.json({error:'CONFLICT'},{status:409,headers});return NextResponse.json(result,{headers});
 }catch{return NextResponse.json({error:'SAVE_FAILED'},{status:400,headers})}
}
